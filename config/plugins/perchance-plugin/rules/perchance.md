# Perchance Engineering Laws & Governance

This document defines the sovereign governance standards, architecture invariants, browser security boundaries, and execution rules for the unified **Perchance Plugin** ecosystem (`perchance-plugin`).

---

## 1. Core Operating Directives

- **Browser-Free Access First**: Always prefer browser-free operations (`perchance_pull`, local `.perchance-mirror/` caching, and `perchance_analyze` static analysis) before launching full browser sessions (`perchance_start`).
- **Engine Protocol**: The default browser engine for live editor automation is **Playwright Firefox** (`engine: 'firefox'`). It reliably clears Cloudflare Turnstile on `*.perchance.org` subdomains where Chromium is flagged.
- **Collab Semantics & Truth**: Writes made with `#edit:collab=KEY` update the shared room live (`saveState: "unsaved"`), but the public generator only updates when the owner saves. Report collab changes as "live in the room, pending owner save", never as "deployed".
- **Zero-Telepathy & Dual Prompt Boundaries**: Never mix internal simulation brackets, inventory state, or secret directives into public image/text diffusion prompts. Strip them deterministically before dispatching to `generateText` or `generateImage`.
- **Server Sandbox Invariant**: Server scripts inside `<script type="text/x-server-plugin">` are **strictly synchronous**. Never write `async`, `Promise`, `setTimeout`, or browser DOM/storage calls on the server. Background AI and upload jobs must run via browser-minted single-use tickets (`jobs.*`).
- **Durable Memory Bounds**: The 50 MiB server `state: Uint8Array` must only be read and written via `DataView` at bounded byte offsets. Never decode the entire buffer or run `JSON.stringify(state)`.
- **Production Bundle Ceiling**: Single-file bundles deployed to the generator's output pane must never exceed **4.00 MB** (`MAX_BUNDLE_BYTES`).

---

## 2. The 7-Skill Architecture Matrix

The plugin ecosystem is organized into 7 specialized domain skills:

1. **`skills/perchance-platform`**: Core engine execution lifecycle (HTML parsed ➔ scripts run ➔ square blocks evaluate last), DSL compilation semantics (`.selectOne` vs `.evaluateItem`), dynamic odds, `$meta.dynamic` sandbox rules, engine gotchas, and the auxiliary plugin catalog (`comments-plugin`, `secret-plugin`, `super-fetch-plugin`, `music-generation`).
2. **`skills/perchance-editor`**: Operating manual and consolidated tool map for the 14-tool live-editor suite, AST analysis, DOM snapshot inspection, and Companion Sidecar loopback bridge (`127.0.0.1:8765`).
3. **`skills/perchance-deployment`**: Production gatekeeper, single-file bundle verification (`npm run deploy:prepare`), companion-first session negotiation, and direct automated deployment (`perchance_deploy` / `deploy.js`).
4. **`skills/perchance-plugin-text`**: Authoritative specification for `root.generateText()`, iframe postMessage lifecycles, streaming completion IDs, stop sequences, and KV-prefix prompt caching.
5. **`skills/perchance-plugin-image`**: Authoritative specification for `root.generateImage()`, resolution constraints (`512x512`, `512x768`, etc.), CFG scales, background removal, and reference image guidance.
6. **`skills/perchance-server-plugin`**: Authoritative technical specification for realtime multiplayer, `root.createServerSocket()`, synchronous V8 sandboxing, 50 MiB persistent binary memory (`state: Uint8Array`), and background server jobs with tickets.
7. **`skills/perchance-storage`**: Client-side storage paradigms covering `upload-plugin` CDN hosting, temporary high-limit uploads (`expires` 400x boost), editable files with 256-bit `editKey`, and IndexedDB persistent store (`kv-plugin`).

---

## 3. Weld Companion & Analysis Integration

- **Static Analysis Tools**: Deep DSL/HTML analysis (`perchance_analyze`), cross-panel identifier tracking and AST renames, server script synchronous validation, and syntax primer retrieval (`perchance_get_primer`) run in-memory without browser overhead.
- **Companion-First Routing**: Deployment and agent directives automatically route to the active browser tab via the Companion Bridge Sidecar when connected, eliminating startup latency and Cloudflare friction.
- **Target Resolution**: Tools auto-resolve to the live editor session or the local generator mirror in `.perchance-mirror/` when arguments are omitted.
