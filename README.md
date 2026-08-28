<p align="center">
  <img src=".github/assets/banner.png" width="800" alt="Praxist plugins" />
</p>

<p align="center">
  <a href="https://awesome.re"><img src="https://awesome.re/badge.svg" alt="Awesome" /></a>
  <img src="https://img.shields.io/badge/praxist%20plugins-27-blueviolet" alt="Entry count" />
  <img src="https://img.shields.io/github/last-commit/ZeroPointRepo/awesome-praxist-plugins" alt="Last commit" />
  <img src="https://img.shields.io/badge/praxist-v0.5.0-informational" alt="Upstream version" />
  <img src="https://img.shields.io/badge/status-unofficial-lightgrey" alt="Unofficial" />
  <img src="https://img.shields.io/badge/license-CC%20BY%204.0-lightgrey" alt="License" />
</p>

<!-- D8: this H1 is a searchable surface. The exact phrase people type goes FIRST, qualifiers after. -->
# Praxist plugins

**Every Praxist plugin, with the manifest facts that matter: kind, stability, tools, and which API key it wants.**

---

## Contents

- [What is a Praxist plugin?](#what-is-a-praxist-plugin)
- [Praxist plugin quickstart](#praxist-plugin-quickstart)
- [The catalog](#the-catalog)
- [Writing a Praxist plugin](#writing-a-praxist-plugin)
- [Good to know](#good-to-know)

<!-- catalog-count:start -->
- **Full catalog:** every verified Praxist plugin (27) in [CATALOG.md](CATALOG.md)
<!-- catalog-count:end -->
- **Machine-readable:** the same rows as data in [catalog.csv](catalog.csv) and [plugins.json](plugins.json)

---

## What is a Praxist plugin?

[Praxist](https://github.com/sapientinc/PRAXIST) is Sapient Intelligence's autonomous research
system: it runs panels of AI "principal investigators" that propose experiments, run them, and
review each other's results. Almost every moving part is a plugin. Their own architecture guide
puts it plainly: before adding code to core, ask whether the behavior could be selected, replaced,
or disabled through a plugin instead.

A plugin is a directory with a `plugin.yaml` manifest and, usually, an `adapter.py`. The manifest
declares a `kind`, a semantic `version`, a `protocol_version`, a `stability` tier, the capabilities
it offers, the core and Python versions it works with, and an `entrypoint` factory. There are
**twelve kinds**. Seven of them have a plugin shipping today:

| Kind | Directory | What it swaps out |
|---|---|---|
| `tool_server` | `tools/` | An in-process MCP server the agents can call |
| `model_provider` | `model_providers/` | Where model calls go |
| `workflow_stage` | `workflow_stages/` | A stage of the research loop |
| `agent_runtime` | `agent_runtimes/` | The SDK that drives each peer |
| `panel_topology` | `panel_topologies/` | Who is on the panel and in what rounds |
| `budget_policy` | `budget_policies/` | How spend is rationed |
| `graph_maintainer` | `graph_maintainers/` | How the finding graph is built |

The other five kinds (`role`, `audit_rule`, `evaluation`, `ontology`, `budget_unit`) are declared
in the loader and exercised by the test fixtures, but ship no bundled plugin yet.

Two facts worth knowing before you invest a weekend in this:

- **Praxist is not open source.** It ships under a Fair Source License, not MIT or Apache. The
  licence is free to use below **USD $1M** annual revenue, with an academic exemption; above that
  threshold you have thirty days to start negotiating a commercial licence. You also may not
  redistribute Praxist itself as a standalone product. Your own plugin is your own code, so this
  does not reach it, but it does govern the thing your plugin plugs into.
- **`tool_server` and `model_provider` are `experimental` tier**, not `v1_stable`. Manifests can
  still change shape under you.

## Praxist plugin quickstart

Install Praxist:

```bash
python3 -m pip install "praxist[agents,codex]"
```

Check your machine is ready:

```bash
praxist doctor
```

Install an example task project you can drop a plugin into:

```bash
praxist examples install rocket_booster_recovery
```

## ⭐ Featured plugin

**[transcriptapi](https://github.com/ZeroPointRepo/transcriptapi-praxist-plugin)** by
[ZeroPointRepo](https://github.com/ZeroPointRepo) pulls evidence out of video: transcripts, search,
video metadata, and channel uploads, as four tools on a `tool_server`. Useful when the finding you
need is in a conference talk or a lecture rather than a paper. `tool_server`, needs
`TRANSCRIPTAPI_KEY`, free tier.

<details>
<summary>Install</summary>

```bash
git clone https://github.com/ZeroPointRepo/transcriptapi-praxist-plugin.git <your-task>/.praxist/plugins/tools/transcriptapi
```

</details>

## The catalog

### Tool Servers

- **Search arXiv and pull paper metadata mid-run** with [arxiv](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/arxiv) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 3 tools: `arxiv_search`, `arxiv_get`, `arxiv_recent` · no key.
- **Give a research agent live web search** with [brave_search](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/brave_search) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 1 tool: `web_search` · needs `BRAVE_API_KEY`.
- **Read the main text out of any URL** with [browser](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/browser) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 1 tool: `web_read` · no key.
- **Log metrics, share findings, and read the leaderboard** with [evaluation_tools](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/evaluation_tools) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 5 tools: `log_experiment_metrics`, `share_finding`, `get_leaderboard`, `wait_for_file`, `read_tool_result` · no key.
- **Bridge the older built-in tool servers under one manifest** with [existing_mcp_tools_shim](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/existing_mcp_tools_shim) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · manifest only · no key.
- **Query the finding graph without mutating it** with [finding_graph_query](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/finding_graph_query) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 3 tools: `get_finding_neighbors`, `get_finding_subgraph`, `get_unlinked_recent_findings` · no key.
- **Read the committed frontier and leaderboard** with [frontier_tools](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/frontier_tools) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 1 tool: `get_frontier` · no key.
- **Search arXiv, OpenAlex, PubMed and Crossref with no API key** with [literature_lookup](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/literature_lookup) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 5 tools: `literature_search`, `literature_resolve`, `literature_source_guide`, `literature_open_access_text`, `scientific_database_search` · no key.
- **Look up evidence cards, claims, and ledger entries** with [memory_tools](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/memory_tools) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 7 tools: `get_evidence_card`, `query_evidence_cards`, `query_coverage_matrix`, `list_active_claims`, `list_open_objections`, `get_ledger_entry`, `resolve_source_ref` · no key.
- **Rasterize and OCR a research PDF** with [pdf_reader](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/pdf_reader) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 2 tools: `pdf_read`, `pdf_metadata` · no key.
- **Download a workspace snapshot from an earlier finding** with [prior_work_tools](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/prior_work_tools) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 1 tool: `download_snapshot` · no key.
- **Turn raw run artifacts into a readable report** with [run_report](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/run_report) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 1 tool: `generate_run_report` · no key.
- **Show a role what other runs are doing right now** with [system](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/tools/system) by [Sapient Intelligence](https://github.com/sapientinc). `tool_server` · experimental · entrypoint · 5 tools: `system_active_runs`, `system_run_summary`, `system_recent_findings`, `system_frontier_snapshot`, `system_recent_errors` · no key.

### Model Providers

- **Route model calls to the Anthropic Messages API** with [anthropic_messages](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/model_providers/anthropic_messages) by [Sapient Intelligence](https://github.com/sapientinc). `model_provider` · experimental · entrypoint · needs `ANTHROPIC_API_KEY`.
- **Route model calls to DeepSeek over the OpenAI-compatible path** with [deepseek_alias](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/model_providers/deepseek_alias) by [Sapient Intelligence](https://github.com/sapientinc). `model_provider` · experimental · entrypoint · needs `DEEPSEEK_API_KEY`.
- **Route model calls to any OpenAI-compatible endpoint** with [openai_compatible](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/model_providers/openai_compatible) by [Sapient Intelligence](https://github.com/sapientinc). `model_provider` · experimental · entrypoint · needs `OPENAI_API_KEY`.
- **Route model calls through OpenRouter** with [openrouter](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/model_providers/openrouter) by [Sapient Intelligence](https://github.com/sapientinc). `model_provider` · experimental · entrypoint · needs `OPENROUTER_API_KEY`.

### Workflow Stages

- **Hold the ideation slot open, disabled by default** with [ideation_stub](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/workflow_stages/ideation_stub) by [Sapient Intelligence](https://github.com/sapientinc). `workflow_stage` · v1_stable · manifest only · no key.
- **Hold the paper-writing slot open, disabled by default** with [paper_writing_stub](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/workflow_stages/paper_writing_stub) by [Sapient Intelligence](https://github.com/sapientinc). `workflow_stage` · v1_stable · manifest only · no key.
- **Run the research loop itself, the one required stage** with [research_loop](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/workflow_stages/research_loop) by [Sapient Intelligence](https://github.com/sapientinc). `workflow_stage` · v1_stable · entrypoint · no key.
- **Check artifact and provenance consistency locally** with [reviewer_stub](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/workflow_stages/reviewer_stub) by [Sapient Intelligence](https://github.com/sapientinc). `workflow_stage` · v1_stable · manifest only · no key.

### Agent Runtimes

- **Drive peers with the Claude Agent SDK** with [claude_sdk](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/agent_runtimes/claude_sdk) by [Sapient Intelligence](https://github.com/sapientinc). `agent_runtime` · v1_stable · entrypoint · no key.
- **Drive peers with the official Codex Python SDK** with [codex_sdk](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/agent_runtimes/codex_sdk) by [Sapient Intelligence](https://github.com/sapientinc). `agent_runtime` · v1_stable · entrypoint · no key.

### Panel Topologies

- **Run the two-round Multi-PI panel: memos, then anonymized cross-review** with [legacy_multi_pi_two_round](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/panel_topologies/legacy_multi_pi_two_round) by [Sapient Intelligence](https://github.com/sapientinc). `panel_topology` · v1_stable · manifest only · no key.

### Budget Policies

- **Apply the deterministic default budget policy** with [default_basic](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/budget_policies/default_basic) by [Sapient Intelligence](https://github.com/sapientinc). `budget_policy` · v1_stable · entrypoint · no key.

### Graph Maintainers

- **Build and maintain the finding graph behind the query surface** with [finding_graph_mvp](https://github.com/sapientinc/PRAXIST/tree/437292c7e1f414d87a4b742a23ae4ae3f66ef744/praxist/plugins/graph_maintainers/finding_graph_mvp) by [Sapient Intelligence](https://github.com/sapientinc). `graph_maintainer` · experimental · entrypoint · no key.

### Community Plugins

- **Pull evidence out of video, not just papers** with [transcriptapi](https://github.com/ZeroPointRepo/transcriptapi-praxist-plugin) by [ZeroPointRepo](https://github.com/ZeroPointRepo). `tool_server` · v0_experimental · entrypoint · 4 tools: `youtube_transcript`, `youtube_search`, `youtube_video_info`, `youtube_channel_videos` · needs `TRANSCRIPTAPI_KEY`.

Praxist shipped on 2026-08-27, so this section is nearly new. If you have built a plugin,
[open an issue](https://github.com/ZeroPointRepo/awesome-praxist-plugins/issues/new?template=add-entry.yml)
and it goes in.

## Writing a Praxist plugin

Praxist loads plugins from four roots, and this is the part the docs leave you to work out: **only
two of them can actually execute.** Runs resolve plugins with bundled-execution enforcement on, and
that filter keeps `bundled` and `task_project` only.

| Root | Source | Executes in a run? |
|---|---|---|
| `<task>/.praxist/plugins/` | `task_project` | Yes |
| `praxist/plugins/` in the install | `bundled` | Yes |
| `./.praxist/plugins/` (cwd) | `project` | No |
| `~/.praxist/plugins/` | `user` | No |

So a third-party plugin goes in the **task project**, not your home directory. Put it here:

```bash
mkdir -p <your-task>/.praxist/plugins/tools/my_plugin
```

A minimal `tool_server` manifest:

```yaml
schema_version: 1
name: my_plugin
kind: tool_server
version: 0.1.0
protocol_version: 1
stability: v0_experimental
description: One line about what this tool does.
compatibility:
  praxist_core: ">=0.1.0,<1.0"
  python: ">=3.11"
dependencies: []
capabilities:
  - tool_server.my_plugin
tool_server:
  server_name: my-plugin
  tool_names:
    - my_tool
  visibility:
    - peer
    - panel
  required_capability: tool_server.my_plugin
entrypoint: adapter:create_tool_plugin
code:
  - adapter.py
assets: []
```

Four rules that will bite you, all enforced in the loader:

1. **The directory name must equal the manifest `name`,** and the parent directory must match the
   kind (`tools/` for `tool_server`). Discovery raises if either drifts.
2. **`stability` is checked against the source.** A task-local plugin may declare anything, so
   `v0_experimental` is fine. The same manifest under any other root must declare the kind's exact
   expected tier, which for `tool_server` is the literal string `experimental`.
3. **Only files listed under `code` and `assets` are hashed** into the plugin's content hash, and
   that hash goes into the run's replay manifest. An imported module you forgot to declare is
   outside the reproducibility guarantee.
4. **API keys are your plugin's own business.** Praxist does not infer custom key variable names.
   Read your own environment variable and, when it is missing, return an error object rather than
   raising, so a task that does not use your tool still runs. The bundled `brave_search` plugin is
   the reference shape: no `BRAVE_API_KEY`, and every call returns
   `{"error": "BRAVE_API_KEY is not set"}`.

## Good to know

<details>
<summary><strong>🛡️ Security notice</strong></summary>

This is a **curated list, not a security audit**. A listing means the project is real and working as
of its last check, not that its code has been reviewed for safety. Read a project before you install
it or hand it credentials, the same as you would any package or browser extension.

A Praxist plugin runs in-process with your research task and can read the environment it is given.
Treat a third-party plugin like any other dependency you are about to execute.

</details>

<details>
<summary><strong>🤝 Contributing</strong></summary>

PRs are very welcome, see [CONTRIBUTING.md](CONTRIBUTING.md) for the format and the acceptance
rules.

</details>

---

<p align="center">
Maintained by <a href="https://github.com/ZeroPointRepo">ZeroPointRepo</a> · list content licensed
<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · Built with <a href="https://crhq.ai">crhq.ai</a>
<br />
<sub>Unofficial, community-maintained. Not affiliated with or endorsed by the Praxist project or
its maintainers.</sub>
</p>
