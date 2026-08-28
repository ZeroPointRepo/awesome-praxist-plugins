# Praxist plugins catalog

27 Praxist plugins: 26 shipped in sapientinc/PRAXIST and 1 from the wider ecosystem. Every column is read out of the plugin's own `plugin.yaml` manifest and its declared code files.

Rebuilt by `.github/scripts/build-catalog.mjs`. Do not edit by hand.

`Auth` is derived from environment reads in the plugin's declared `code` files. `Not established` means a file could not be read on the last run, which is not a claim that the plugin needs no key.

## agent_runtime (2)

| Praxist plugin | Repo | Version | Stability | Entrypoint | Tools | Auth | First listed |
|---|---|---|---|---|---|---|---|
| [claude_sdk](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/agent_runtimes/claude_sdk) | sapientinc/PRAXIST | 0.1.0 | v1_stable | ✅ | — | no key | 2026-08-28 |
| [codex_sdk](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/agent_runtimes/codex_sdk) | sapientinc/PRAXIST | 0.1.0 | v1_stable | ✅ | — | no key | 2026-08-28 |

## budget_policy (1)

| Praxist plugin | Repo | Version | Stability | Entrypoint | Tools | Auth | First listed |
|---|---|---|---|---|---|---|---|
| [default_basic](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/budget_policies/default_basic) | sapientinc/PRAXIST | 0.1.0 | v1_stable | ✅ | — | no key | 2026-08-28 |

## graph_maintainer (1)

| Praxist plugin | Repo | Version | Stability | Entrypoint | Tools | Auth | First listed |
|---|---|---|---|---|---|---|---|
| [finding_graph_mvp](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/graph_maintainers/finding_graph_mvp) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | — | no key | 2026-08-28 |

## model_provider (4)

| Praxist plugin | Repo | Version | Stability | Entrypoint | Tools | Auth | First listed |
|---|---|---|---|---|---|---|---|
| [anthropic_messages](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/model_providers/anthropic_messages) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | — | no key | 2026-08-28 |
| [deepseek_alias](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/model_providers/deepseek_alias) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | — | no key | 2026-08-28 |
| [openai_compatible](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/model_providers/openai_compatible) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | — | no key | 2026-08-28 |
| [openrouter](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/model_providers/openrouter) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | — | no key | 2026-08-28 |

## panel_topology (1)

| Praxist plugin | Repo | Version | Stability | Entrypoint | Tools | Auth | First listed |
|---|---|---|---|---|---|---|---|
| [legacy_multi_pi_two_round](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/panel_topologies/legacy_multi_pi_two_round) | sapientinc/PRAXIST | 0.1.0 | v1_stable | — | — | no key | 2026-08-28 |

## tool_server (14)

| Praxist plugin | Repo | Version | Stability | Entrypoint | Tools | Auth | First listed |
|---|---|---|---|---|---|---|---|
| [arxiv](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/arxiv) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | arxiv_search, arxiv_get, arxiv_recent | no key | 2026-08-28 |
| [brave_search](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/brave_search) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | web_search | BRAVE_API_KEY | 2026-08-28 |
| [browser](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/browser) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | web_read | no key | 2026-08-28 |
| [evaluation_tools](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/evaluation_tools) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | log_experiment_metrics, share_finding, get_leaderboard, wait_for_file, read_tool_result | no key | 2026-08-28 |
| [existing_mcp_tools_shim](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/existing_mcp_tools_shim) | sapientinc/PRAXIST | 0.1.0 | experimental | — | — | no key | 2026-08-28 |
| [finding_graph_query](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/finding_graph_query) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | get_finding_neighbors, get_finding_subgraph, get_unlinked_recent_findings | no key | 2026-08-28 |
| [frontier_tools](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/frontier_tools) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | get_frontier | no key | 2026-08-28 |
| [literature_lookup](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/literature_lookup) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | literature_search, literature_resolve, literature_source_guide, literature_open_access_text, scientific_database_search | no key | 2026-08-28 |
| [memory_tools](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/memory_tools) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | get_evidence_card, query_evidence_cards, query_coverage_matrix, list_active_claims, list_open_objections, get_ledger_entry, resolve_source_ref | no key | 2026-08-28 |
| [pdf_reader](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/pdf_reader) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | pdf_read, pdf_metadata | no key | 2026-08-28 |
| [prior_work_tools](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/prior_work_tools) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | download_snapshot | no key | 2026-08-28 |
| [run_report](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/run_report) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | generate_run_report | no key | 2026-08-28 |
| [system](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/tools/system) | sapientinc/PRAXIST | 0.1.0 | experimental | ✅ | system_active_runs, system_run_summary, system_recent_findings, system_frontier_snapshot, system_recent_errors | no key | 2026-08-28 |
| [transcriptapi](https://github.com/ZeroPointRepo/transcriptapi-praxist-plugin) | ZeroPointRepo/transcriptapi-praxist-plugin | 0.1.0 | v0_experimental | ✅ | youtube_transcript, youtube_search, youtube_video_info, youtube_channel_videos | TRANSCRIPTAPI_KEY | 2026-08-28 |

## workflow_stage (4)

| Praxist plugin | Repo | Version | Stability | Entrypoint | Tools | Auth | First listed |
|---|---|---|---|---|---|---|---|
| [ideation_stub](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/workflow_stages/ideation_stub) | sapientinc/PRAXIST | 0.1.0 | v1_stable | — | — | no key | 2026-08-28 |
| [paper_writing_stub](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/workflow_stages/paper_writing_stub) | sapientinc/PRAXIST | 0.1.0 | v1_stable | — | — | no key | 2026-08-28 |
| [research_loop](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/workflow_stages/research_loop) | sapientinc/PRAXIST | 0.1.0 | v1_stable | ✅ | — | ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, DEEPSEEK_API_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY | 2026-08-28 |
| [reviewer_stub](https://github.com/sapientinc/PRAXIST/tree/HEAD/praxist/plugins/workflow_stages/reviewer_stub) | sapientinc/PRAXIST | 0.1.0 | v1_stable | — | — | no key | 2026-08-28 |

