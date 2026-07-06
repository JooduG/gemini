# Understand Anything - Antigravity Plugin

## Project Overview

An open-source tool combining LLM intelligence + static analysis to produce interactive dashboards for understanding codebases. This version has been natively migrated into a self-contained Antigravity IDE Plugin.

## Prerequisites

- Node.js >= 22 (developed on v24)
- pnpm >= 10 (pinned via `packageManager` field in root `package.json`)

## Architecture

- **Monorepo** with pnpm workspaces
- **understand-anything** — Antigravity Plugin containing all source code:
  - **packages/core** — Shared analysis engine (types, persistence, tree-sitter, search, schema, tours, plugins) and the Antigravity MCP Server Wrapper (`mcp-server.ts`).
  - **packages/dashboard** — React + TypeScript web dashboard (React Flow, Zustand, TailwindCSS v4)
  - **src/** — Skill TypeScript source for `/understand-chat`, `/understand-diff`, `/understand-explain`, `/understand-onboard`
  - **skills/** — Skill definitions (`/understand`, `/understand-dashboard`, etc.)
  - **agents/** — Agent definitions (project-scanner, file-analyzer, architecture-analyzer, tour-builder, graph-reviewer)

## Dashboard

- Dark luxury theme: deep blacks (#0a0a0a), gold/amber accents (#d4a574), DM Serif Display typography
- Graph-first layout: 75% graph + 360px right sidebar
- No ChatPanel or Monaco Editor
- Sidebar tabs: `Info` (ProjectOverview default → NodeInfo when node selected → LearnPanel in Learn persona, composing) and `Files` (FileExplorer tree built from the structural graph)
- Code viewer: prism-react-renderer source viewer that slides up from the bottom on file node click; an expand button promotes it into a full-screen modal. Source content is fetched from the dev server's `/file-content.json` endpoint, gated by access token + a graph-derived path allowlist
- Schema validation on graph load with error banner

## Agent Pipeline

- Agents write intermediate results to `.understand-anything/intermediate/` on disk (not returned to context)
- `/understand` auto-triggers `/understand-dashboard` after completion
- Intermediate files cleaned up after graph assembly

## Key Commands

- `pnpm install` — Install all dependencies
- `pnpm --filter @understand-anything/core build` — Build the core package (including `mcp-server.ts`)
- `pnpm --filter @understand-anything/core test` — Run core tests
- `pnpm --filter @understand-anything/skill build` — Build the plugin package
- `pnpm test` — Run all tests (skill tests live at repo-root `tests/skill/`, picked up by root `vitest.config.ts`)
- `pnpm --filter @understand-anything/dashboard build` — Build the dashboard
- `pnpm dev:dashboard` — Start dashboard dev server
- `pnpm lint` — Run ESLint across the project

## Conventions

- TypeScript strict mode everywhere
- Vitest for testing
- ESM modules (`"type": "module"`)
- Knowledge graph JSON lives in `.understand-anything/` directory of analyzed projects
- Core uses subpath exports (`./search`, `./types`, `./schema`) to avoid pulling Node.js modules into browser

## Testing Local Plugin Changes

Antigravity natively discovers plugins from `.gemini/config/plugins`. When modifying source code or compiling MCP wrappers, ensure you run the build commands from within `.gemini/config/plugins/understand-anything` and re-run your skills.

```bash
pnpm --filter @understand-anything/core build
pnpm --filter @understand-anything/skill build
```
