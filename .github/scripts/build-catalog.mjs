#!/usr/bin/env node
// Build CATALOG.md, catalog.csv and plugins.json: the machine-built index for this list.
//
// README.md is the curated page and is written by hand. These files are not: they are rebuilt from
// scratch on every run, from live sources rather than a committed snapshot.
//
// This ecosystem does not distribute plugins as one repo per plugin, so a plain repository search
// would find almost nothing. A Praxist plugin is a DIRECTORY carrying a `plugin.yaml` manifest, so
// the generator reads manifests, from two live sources:
//
//   1. The upstream repo tree (sapientinc/PRAXIST): every `praxist/plugins/<kind_dir>/<name>/
//      plugin.yaml`, fetched and parsed. These are the bundled plugins.
//   2. Repository search for third-party candidates. Each candidate's tree is read and every
//      `plugin.yaml` in it is parsed. A row is only kept when the manifest actually declares a
//      Praxist plugin: a `kind` from the loader's kind set AND a `compatibility.praxist_core`
//      constraint. That pair is the check. A repo that merely mentions Praxist does not qualify.
//
// Every derived column comes out of the manifest, never out of a description: kind, stability,
// whether it declares an entrypoint, its tool names, and which environment variable it reads for
// auth. The auth column is derived by scanning the plugin's own declared `code` files for an
// environment read, so it reflects the code and not the prose.
//
// THE THIRD STATE. A tree or manifest that cannot be read is NOT recorded as "no plugin". It is
// counted as unresolved and reported separately, and the run aborts above MAX_FAIL_RATE rather
// than publishing absence of evidence as evidence of absence.
//
// Usage: GH_TOKEN=... node .github/scripts/build-catalog.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

// ------------------------------------------------------------------ TUNE THIS BLOCK PER REPO

const ORG = 'ZeroPointRepo';
const REPO = 'awesome-praxist-plugins';
const NOUN = 'Praxist plugin';
const NOUN_PLURAL = 'Praxist plugins';
const TITLE = 'Praxist plugins catalog';

// The upstream project whose bundled plugins this list catalogs.
const UPSTREAM = 'sapientinc/PRAXIST';
const UPSTREAM_PLUGIN_ROOT = 'praxist/plugins/';

// How third-party candidates are found. Repository search, not code search: code search does not
// work with the Actions GITHUB_TOKEN.
const QUERIES = [
  'praxist plugin in:name,description,readme',
  'praxist tool_server in:readme',
  'topic:praxist',
  'topic:praxist-plugin',
];

// The upstream project itself is not a third-party entry.
const DENY_OWNERS = new Set(['sapientinc']);

// The loader's kind set, from praxist/core/registry.py (V1_STABLE_KINDS + EXPERIMENTAL_KINDS), and
// the directory each kind lives in (KIND_DIRS). A manifest whose kind is not here is not a Praxist
// plugin as far as this catalog is concerned.
const KIND_DIRS = {
  role: 'roles',
  audit_rule: 'audit_rules',
  evaluation: 'evaluations',
  panel_topology: 'panel_topologies',
  agent_runtime: 'agent_runtimes',
  budget_policy: 'budget_policies',
  workflow_stage: 'workflow_stages',
  tool_server: 'tools',
  ontology: 'ontologies',
  budget_unit: 'budget_units',
  model_provider: 'model_providers',
  graph_maintainer: 'graph_maintainers',
};
const KINDS = new Set(Object.keys(KIND_DIRS));

// Abort rather than publish if more than this share of candidate trees could not be read.
const MAX_FAIL_RATE = 0.05;

// ------------------------------------------------------------------ end of tunable block

const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const MAX_CANDIDATES = Number(process.env.MAX_CANDIDATES || 300);
const CONCURRENCY = Number(process.env.CONCURRENCY || 6);

const H = {
  'User-Agent': `${REPO}-catalog`,
  Accept: 'application/vnd.github+json',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, { raw = false } = {}) {
  const url = path.startsWith('http') ? path : `https://api.github.com${path}`;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(url, {
      headers: raw ? { ...H, Accept: 'application/vnd.github.raw' } : H,
    });
    if (res.status === 403 || res.status === 429) {
      const reset = Number(res.headers.get('x-ratelimit-reset') || 0) * 1000;
      const waitMs = Math.min(Math.max(reset - Date.now(), 2000), 60000);
      await sleep(waitMs);
      continue;
    }
    if (res.status === 404) return null;
    if (!res.ok) {
      if (attempt === 3) throw new Error(`${res.status} ${url}`);
      await sleep(1500 * (attempt + 1));
      continue;
    }
    return raw ? res.text() : res.json();
  }
  throw new Error(`giving up: ${url}`);
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) || 1 }, async () => {
    while (i < items.length) {
      const idx = i;
      i += 1;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

// ---------------------------------------------------------------- minimal manifest reader
//
// Deliberately not a full YAML implementation. Praxist manifests are a flat map of scalars, one
// level of nested map, and simple `- item` sequences, which is all this reads. Anything it cannot
// parse yields undefined, and an undefined `kind` or `compatibility.praxist_core` drops the row
// rather than guessing at it.

function unquote(v) {
  const s = String(v).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

// Scalars: top level and one level of nesting, keyed as "parent.child".
function parseScalars(text) {
  const out = {};
  const stack = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, '');
    if (!line.trim() || line.trim().startsWith('#') || line.trim().startsWith('- ')) continue;
    const indent = line.match(/^\s*/)[0].length;
    const m = line.trim().match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    const path = stack.map((s) => s.key).concat(m[1]).join('.');
    if (m[2] !== '' && m[2] !== '[]' && m[2] !== '{}') out[path] = unquote(m[2]);
    stack.push({ key: m[1], indent });
  }
  return out;
}

// Sequences: any "key:" with nothing after it, followed by more-indented "- item" lines.
function parseSequences(text) {
  const out = {};
  const lines = text.split(/\r?\n/);
  const stack = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].replace(/\s+#.*$/, '');
    if (!line.trim() || line.trim().startsWith('#') || line.trim().startsWith('- ')) continue;
    const indent = line.match(/^\s*/)[0].length;
    const m = line.trim().match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    stack.push({ key: m[1], indent });
    if (m[2] !== '') continue;
    const items = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      const nx = lines[j].replace(/\s+#.*$/, '');
      if (!nx.trim()) continue;
      const nxIndent = nx.match(/^\s*/)[0].length;
      if (nxIndent <= indent) break;
      if (!nx.trim().startsWith('- ')) break;
      items.push(unquote(nx.trim().slice(2)));
    }
    if (items.length) out[stack.map((s) => s.key).join('.')] = items;
  }
  return out;
}

function manifestToRow(text, { repo, path }) {
  const flat = parseScalars(text);
  const seqs = parseSequences(text);
  const kind = flat.kind;
  const praxistCore = flat['compatibility.praxist_core'];
  // The check: a real Praxist plugin declares a known kind AND a core compatibility constraint.
  if (!kind || !KINDS.has(kind) || !praxistCore) return null;
  // A manifest at the repo root is `plugin.yaml` with no leading slash, which must reduce to an
  // empty dir rather than to the literal string "plugin.yaml".
  const dir = path.replace(/(^|\/)plugin\.yaml$/, '');
  return {
    name: flat.name || dir.split('/').pop() || repo.split('/')[1],
    kind,
    version: flat.version || '',
    stability: flat.stability || '',
    protocol_version: flat.protocol_version || '',
    praxist_core: praxistCore,
    description: flat.description || '',
    entrypoint: flat.entrypoint || '',
    tool_names: seqs['tool_server.tool_names'] || [],
    code: seqs.code || [],
    repo,
    owner: repo.split('/')[0],
    dir,
    url: dir ? `https://github.com/${repo}/tree/HEAD/${dir}` : `https://github.com/${repo}`,
  };
}

// Derive the auth column from the plugin's OWN declared code files, not from its description.
const ENV_RE =
  /os\.environ\.get\(\s*["']([A-Z][A-Z0-9_]{2,})["']|os\.getenv\(\s*["']([A-Z][A-Z0-9_]{2,})["']|os\.environ\[\s*["']([A-Z][A-Z0-9_]{2,})["']/g;
const AUTHY = /(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)/;

async function deriveAuth(row) {
  if (!row.code.length) return { auth: 'no key', established: true };
  const found = new Set();
  let failed = 0;
  for (const rel of row.code) {
    if (rel.includes('*')) continue;
    // A manifest at the repo root gives dir === '', and a naive join would produce a double
    // slash that 404s and then reports as "Not established". Join deliberately.
    const filePath = row.dir ? `${row.dir}/${rel}` : rel;
    const text = await api(`/repos/${row.repo}/contents/${filePath}`, { raw: true }).catch(
      () => null,
    );
    if (text == null) {
      failed += 1;
      continue;
    }
    for (const m of text.matchAll(ENV_RE)) {
      const name = m[1] || m[2] || m[3];
      if (name && AUTHY.test(name)) found.add(name);
    }
  }
  if (failed && !found.size) return { auth: 'Not established', established: false };
  return { auth: found.size ? [...found].sort().join(', ') : 'no key', established: true };
}

async function treeManifests(repo) {
  const meta = await api(`/repos/${repo}`);
  if (!meta) return { ok: false, rows: [] };
  const tree = await api(`/repos/${repo}/git/trees/${meta.default_branch}?recursive=1`);
  if (!tree || !Array.isArray(tree.tree)) return { ok: false, rows: [] };
  const paths = tree.tree
    .filter((n) => n.type === 'blob' && n.path.endsWith('plugin.yaml'))
    // Test fixtures are not shipped plugins.
    .filter((n) => !/(^|\/)tests?\//.test(n.path))
    .map((n) => n.path);
  const rows = [];
  for (const p of paths) {
    const text = await api(`/repos/${repo}/contents/${p}`, { raw: true }).catch(() => null);
    if (text == null) continue;
    const row = manifestToRow(text, { repo, path: p });
    if (row) {
      rows.push({ ...row, stars: meta.stargazers_count, archived: meta.archived, fork: meta.fork });
    }
  }
  const allPaths = tree.tree.filter((n) => n.type === 'blob').map((n) => n.path);
  return { ok: true, rows, meta, allPaths, truncated: Boolean(tree.truncated) };
}

// A verbatim re-upload of upstream is not an entry. It is not caught by the fork
// filter, because re-uploading (rather than forking) leaves `fork: false`, and it is
// not caught by DENY_OWNERS, because the owner is new every time. So test it
// structurally: a candidate whose file tree is almost entirely upstream's file tree,
// with nothing of its own, is a mirror.
//
// Real case, 2026-08-31: mcebomathibela8-eng/R-D, created 2026-08-30 by an account
// created 2026-08-29, 5853 of 5853 paths identical to sapientinc/PRAXIST, zero unique
// files. It would have published 27 mirror rows and reported the ecosystem as having
// formed third-party plugins when it has not. Same class as Kharisma1980/ApodexAI on
// awesome-frontieragent, which is denied there by name; this is the general form.
const MIRROR_MIN_PATHS = 50;
const MIRROR_OVERLAP = 0.95;
function isMirrorOf(candidatePaths, upstreamPathSet) {
  if (!candidatePaths || candidatePaths.length < MIRROR_MIN_PATHS) return false;
  let shared = 0;
  for (const p of candidatePaths) if (upstreamPathSet.has(p)) shared += 1;
  return shared / candidatePaths.length >= MIRROR_OVERLAP;
}

async function main() {
  if (!TOKEN) console.warn('! no GH_TOKEN set, running unauthenticated and will rate limit fast');

  // ---- source 1: upstream bundled plugins
  console.log(`reading upstream manifests from ${UPSTREAM}`);
  const upstream = await treeManifests(UPSTREAM);
  if (!upstream.ok) throw new Error(`could not read upstream tree ${UPSTREAM}, refusing to publish`);
  if (upstream.truncated) console.warn('! upstream tree came back truncated');
  const bundled = upstream.rows.filter((r) => r.dir.startsWith(UPSTREAM_PLUGIN_ROOT));
  if (!bundled.length) throw new Error('upstream returned zero manifests, refusing to publish');
  console.log(`  ${bundled.length} bundled manifests`);

  // ---- source 2: third-party candidates
  const seen = new Map();
  for (const q of QUERIES) {
    const res = await api(
      `/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=100`,
    ).catch(() => null);
    for (const item of (res && res.items) || []) {
      if (DENY_OWNERS.has(item.owner.login)) continue;
      if (item.archived || item.fork) continue;
      if (!seen.has(item.full_name)) seen.set(item.full_name, item);
    }
  }
  const candidates = [...seen.keys()].slice(0, MAX_CANDIDATES);
  console.log(`third-party candidates to check: ${candidates.length}`);

  const upstreamPathSet = new Set(upstream.allPaths || []);
  const mirrors = [];
  let unresolved = 0;
  const thirdPartyNested = await mapLimit(candidates, CONCURRENCY, async (repo) => {
    const r = await treeManifests(repo).catch(() => ({ ok: false, rows: [] }));
    if (r.ok && isMirrorOf(r.allPaths, upstreamPathSet)) {
      mirrors.push(repo);
      return [];
    }
    if (!r.ok) {
      unresolved += 1;
      return [];
    }
    return r.rows;
  });
  const thirdParty = thirdPartyNested.flat();

  const failRate = candidates.length ? unresolved / candidates.length : 0;
  console.log(`third-party manifests found: ${thirdParty.length}`);
  console.log(`unresolved candidate trees: ${unresolved} (${(failRate * 100).toFixed(1)}%)`);
  if (mirrors.length) {
    console.log(`dropped ${mirrors.length} verbatim re-upload(s) of ${UPSTREAM}: ${mirrors.join(', ')}`);
  }
  if (failRate > MAX_FAIL_RATE) {
    throw new Error(
      `unresolved rate ${(failRate * 100).toFixed(1)}% exceeds ${(MAX_FAIL_RATE * 100).toFixed(0)}%, ` +
        'refusing to publish a catalog that would read as "no third-party plugins exist"',
    );
  }

  const all = [...bundled, ...thirdParty];
  const withAuth = await mapLimit(all, CONCURRENCY, async (row) => ({
    ...row,
    ...(await deriveAuth(row)),
  }));
  const notEstablished = withAuth.filter((r) => !r.established).length;
  console.log(
    `auth column: ${withAuth.length - notEstablished} derived, ${notEstablished} not established`,
  );

  withAuth.sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));

  // ---- first-seen ledger. Cumulative, never back-dated.
  const ledgerPath = '.github/data/first-seen.json';
  const today = new Date().toISOString().slice(0, 10);
  let ledger = { _note: '', entries: {} };
  if (existsSync(ledgerPath)) {
    try {
      ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
    } catch {
      /* keep default */
    }
  }
  ledger._note =
    'When this list first carried each entry, not when the entry was created. Cumulative and never back-dated: an entry that drops out keeps its date. Generator owned, do not hand edit.';
  ledger.entries = ledger.entries || {};
  for (const r of withAuth) {
    const key = `${r.repo}#${r.kind}:${r.name}`;
    if (!ledger.entries[key]) ledger.entries[key] = today;
    r.added = ledger.entries[key];
  }
  mkdirSync('.github/data', { recursive: true });
  writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

  // ---- CATALOG.md
  const esc = (s) => String(s).replace(/\|/g, '\\|');
  const byKind = new Map();
  for (const r of withAuth) {
    if (!byKind.has(r.kind)) byKind.set(r.kind, []);
    byKind.get(r.kind).push(r);
  }
  let md = `# ${TITLE}\n\n`;
  md += `${withAuth.length} ${NOUN_PLURAL}: ${bundled.length} shipped in ${UPSTREAM} and ${thirdParty.length} from the wider ecosystem. `;
  md += `Every column is read out of the plugin's own \`plugin.yaml\` manifest and its declared code files.\n\n`;
  md += `Rebuilt by \`.github/scripts/build-catalog.mjs\`. Do not edit by hand.\n\n`;
  md += `\`Auth\` is derived from environment reads in the plugin's declared \`code\` files. \`Not established\` means a file could not be read on the last run, which is not a claim that the plugin needs no key.\n\n`;
  for (const [kind, rows] of [...byKind.entries()].sort()) {
    md += `## ${kind} (${rows.length})\n\n`;
    md += `| ${NOUN} | Repo | Version | Stability | Entrypoint | Tools | Auth | First listed |\n`;
    md += `|---|---|---|---|---|---|---|---|\n`;
    for (const r of rows) {
      md += `| [${esc(r.name)}](${r.url}) | ${esc(r.repo)} | ${esc(r.version)} | ${esc(r.stability)} | ${r.entrypoint ? '✅' : '—'} | ${r.tool_names.length ? esc(r.tool_names.join(', ')) : '—'} | ${esc(r.auth)} | ${r.added} |\n`;
    }
    md += '\n';
  }
  writeFileSync('CATALOG.md', md);

  // ---- catalog.csv
  const csvCell = (s) => `"${String(s).replace(/"/g, '""')}"`;
  const header =
    'name,kind,repo,version,stability,protocol_version,praxist_core,entrypoint,tool_names,auth,auth_established,stars,url,added,description';
  const csv = [header]
    .concat(
      withAuth.map((r) =>
        [
          r.name, r.kind, r.repo, r.version, r.stability, r.protocol_version, r.praxist_core,
          r.entrypoint ? 'true' : 'false', r.tool_names.join(';'), r.auth,
          r.established ? 'true' : 'false', r.stars ?? '', r.url, r.added, r.description,
        ]
          .map(csvCell)
          .join(','),
      ),
    )
    .join('\n');
  writeFileSync('catalog.csv', `${csv}\n`);

  // ---- plugins.json
  const json = {
    name: `Awesome ${NOUN_PLURAL}`,
    url: `https://github.com/${ORG}/${REPO}`,
    source: `https://raw.githubusercontent.com/${ORG}/${REPO}/main/plugins.json`,
    updated: today,
    count: withAuth.length,
    categories: [...byKind.keys()].sort(),
    plugins: withAuth.map((r) => ({
      name: r.name,
      owner: r.owner,
      url: r.url,
      category: r.kind,
      description: { en: r.description },
      stars: r.stars ?? 0,
      added: r.added,
      praxist: {
        kind: r.kind,
        version: r.version,
        stability: r.stability,
        protocol_version: r.protocol_version,
        praxist_core: r.praxist_core,
        entrypoint: Boolean(r.entrypoint),
        tool_names: r.tool_names,
        auth: r.auth,
        auth_established: r.established,
      },
    })),
  };
  writeFileSync('plugins.json', `${JSON.stringify(json, null, 2)}\n`);

  // ---- rewrite the README count between markers. Numbers are generator owned.
  const readmePath = 'README.md';
  if (existsSync(readmePath)) {
    const readme = readFileSync(readmePath, 'utf8');
    const next = readme
      .replace(
        /(<!-- catalog-count:start -->)[\s\S]*?(<!-- catalog-count:end -->)/,
        `$1\n- **Full catalog:** every verified ${NOUN} (${withAuth.length}) in [CATALOG.md](CATALOG.md)\n$2`,
      )
      // The count badge is a number, so it is generator owned too and never hand edited.
      .replace(
        /(img\.shields\.io\/badge\/praxist%20plugins-)\d+(-blueviolet)/,
        `$1${withAuth.length}$2`,
      );
    if (next !== readme) writeFileSync(readmePath, next);
  }

  console.log(`\nwrote CATALOG.md, catalog.csv, plugins.json, ${ledgerPath}`);
  console.log(
    `total ${withAuth.length} (${bundled.length} bundled, ${thirdParty.length} third-party)`,
  );
  if (notEstablished) console.log(`${notEstablished} rows carry auth "Not established"`);
}

main().catch((err) => {
  console.error(`FAILED: ${err.message}`);
  process.exit(1);
});
