---
name: perchance-editor
description: >-
  Use when reading, editing, or live-testing a Perchance.org generator through
  the perchance MCP server. Covers browser-free mirrors, Playwright live sessions,
  Cloudflare clearing, Weld static analysis, and the Companion Sidecar Bridge.
  Operating manual for the 18-tool `perchance` MCP server and Companion Sidecar Bridge.
  Use when reading, editing, AST-linting (`perchance_analyze`), pulling (`perchance_pull`),
  or live-testing a Perchance.org generator via Playwright or the Weld Companion Bridge.
  Do NOT use for Perchance DSL grammar rules (use `perchance-platform`) or production
  release gates (use `perchance-deployment`).
---

# perchance — Operating Manual (Streamlined 18-Tool Suite)

Reads are browser-free: `perchance_pull` mirrors `main.pjs` + `index.html` locally
in ~1s — grep those files, never regex a 40k-line doc in-browser. The
browser (`perchance_start`) exists for live edits, interactive UI testing, and visual evaluation.

## Empirical Pitfalls & Scar Tissue (Top Invariants)

| Trigger                         | Wrong Behavior                                                                    | Correct Behavior                                                                                           |
| :------------------------------ | :-------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| **Launching Browser for Reads** | Calling `perchance_start` just to read or grep generator source code.             | Always call `perchance_pull` and `perchance_analyze` (browser-free, ~1s) before starting Playwright.       |
| **Chromium Cloudflare Block**   | Passing `engine: "chromium"` when `*.perchance.org` challenges headless browsers. | Keep default `engine: "firefox"` or route through the active Weld Companion Bridge (`127.0.0.1:8765`).     |
| **Collab Room vs Public Save**  | Reporting a `#edit:collab=KEY` mutation as "deployed to public users".            | Collab edits update the shared room (`saveState: "unsaved"`); only owner save publishes to the public URL. |
| **Unbounded Regex in Browser**  | Running full-document regex replacements across a 40k-line editor pane.           | Use surgical `changes: [{oldString, newString}]` hunks in `perchance_edit` with automatic Yjs settlement.  |

## Consolidated Tool Map

| Category                     | Tools                                                                                       | Capabilities                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Session**                  | `perchance_start`<br>`perchance_status`<br>`perchance_stop`                                 | Cloudflare auto-escalation ladder (Firefox default); live session health and collab sync state.                                                                                              |
| **Code Access & Mutation**   | `perchance_pull`<br>`perchance_read`<br>`perchance_edit`                                    | Fast public API fetch; numbered line reads with regex filter; unified surgical find/replace hunks or full document replacement (auto Yjs settle).                                            |
| **Virtual File Store**       | `perchance_files`                                                                           | Unified `src/` management: `action: "list" \| "read" \| "write" \| "delete"`.                                                                                                                |
| **Testing & UI**             | `perchance_refresh`<br>`perchance_snapshot`<br>`perchance_interact`<br>`perchance_evaluate` | Hard-reload preview; text-first interactive elements inspector; click, type, wait, press, top-level navigate for CF unblocking, screenshot; evaluate JavaScript.                             |
| **Deployment**               | `perchance_deploy`                                                                          | Deploy single-file HTML bundles directly with companion-first session negotiation and automated Yjs settlement.                                                                              |
| **Diagnostics**              | `perchance_logs`                                                                            | Unified syntax error, runtime error, and console tail triage (supports `clear: true`).                                                                                                       |
| **Analysis & Grammar**       | `perchance_get_primer`<br>`perchance_analyze`                                               | Perchance DSL syntax laws & pitfalls; deep AST static linting (including server-plugin script validation), identifier usage graph, variety stats, and AST cross-panel renames (`rename_to`). |
| **Companion Bridge & Swarm** | `perchance_bridge_status`<br>`perchance_swarm`<br>`perchance_agent_prompt`                  | Query active user browser tabs; propose visual diffs to Weld drawer; route directives to live tab or automated Playwright agent session.                                                     |

## Dual Execution Modes

### Mode 1: Autonomous Automation Mode (Playwright)

```text
1. perchance_pull {name}                               # local mirror, browser-free
2. perchance_analyze {name}                            # deep AST syntax & code health scan
3. perchance_start {name, collabKey}                   # Playwright Firefox session
4. perchance_status                                    # verify collab sync & docsReady
5. perchance_edit {changes: [{oldString, newString}]}  # surgical edits with automatic Yjs settle
6. perchance_logs {clear: true}                        # check for syntax/runtime errors
7. perchance_snapshot → perchance_interact             # drive UI clicks/inputs
8. perchance_stop                                      # close session
```

### Mode 2: Supervised Companion Mode (Weld Userscript + Sidecar)

When you have Perchance open in your own browser tab with the Weld Companion userscript:

- The Antigravity Sidecar (`perchance-companion-bridge`) runs on `127.0.0.1:8765`.
- Call `perchance_bridge_status` to see connected tabs.
- Propose edits directly to your open browser tab without Cloudflare hurdles.
