# Perchance Platform & Automation Suite (`perchance-plugin`)

Unified Antigravity plugin providing end-to-end development, AST static analysis, live Playwright/Companion editor automation, and specialized runtime specifications for **Perchance.org**.

## Included Components

- **MCP Server (`perchance`)**: 18-tool suite for browser-free generator mirroring (`perchance_pull`), AST linting (`perchance_analyze`), Playwright Firefox live sessions (`perchance_start`), surgical Yjs edits (`perchance_edit`), single-file bundle deployment (`perchance_deploy`), and Companion Bridge routing.
- **Sidecar (`perchance-companion-bridge`)**: Background loopback daemon (`127.0.0.1:8765`) connecting Antigravity to the browser Weld Companion userscript.
- **Rules (`rules/AGENTS.md`)**: Compact routing and safety invariants active when the plugin is enabled.
- **7 Domain Skills (`skills/`)**:
  1. `perchance-editor`: 18-tool MCP server operating manual & Companion Bridge workflow.
  2. `perchance-deployment`: Single-file bundle validation (`<= 4.00 MB`) and Companion-first automated deployment.
  3. `perchance-platform`: Perchance engine execution phases, DSL syntax, `.evaluateItem` vs `.selectOne`, `$meta.dynamic`, and auxiliary plugins.
  4. `perchance-plugin-text`: `root.generateText()` (`ai-text-plugin`) streaming, `startWith`, `stopSequences`, and KV prefix caching.
  5. `perchance-plugin-image`: `root.generateImage()` (`text-to-image-plugin`) resolution constraints, CFG, negative prompts, and reference images.
  6. `perchance-server-plugin`: `root.createServerSocket()` (`server-plugin`) synchronous V8 sandbox, 50 MiB `DataView` binary state, and ticketed jobs.
  7. `perchance-storage`: `upload-plugin` CDN hosting, editable text files (`editKey`), and `kv-plugin` IndexedDB storage.
