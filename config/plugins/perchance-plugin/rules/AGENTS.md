# Perchance Plugin Routing & Invariants

When working with Perchance.org generators, `.pjs` lists, or the `perchance` MCP server, enforce these non-negotiable invariants and load the matching on-demand skill for detailed specifications:

- **Browser-Free First**: Always run `perchance_pull` (local `.perchance-mirror/` cache) and `perchance_analyze` before launching a live browser session (`perchance_start`, Firefox default).
- **Collab Truth**: `#edit:collab=KEY` writes update the shared room (`saveState: "unsaved"`), not the public generator until the owner saves.
- **Synchronous Server Sandbox**: `<script type="text/x-server-plugin">` handlers are strictly synchronous (no `async`/`Promise`/`fetch`/`setTimeout`) and must read/write the 50 MiB `state: Uint8Array` exclusively via bounded `DataView` offsets.
- **Bundle Ceiling**: Single-file HTML bundles deployed to Perchance must not exceed **4.00 MB** (`MAX_BUNDLE_BYTES`).
- **On-Demand Skill Routing**: Load `perchance-editor` (MCP tools & Companion Bridge), `perchance-deployment` (bundle release), `perchance-platform` (DSL & execution phases), `perchance-plugin-text` (`generateText`), `perchance-plugin-image` (`generateImage`), `perchance-server-plugin` (`createServerSocket`), or `perchance-storage` (`upload-plugin` & `kv-plugin`) before writing domain code.
