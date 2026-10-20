# Perchance Engineering Laws & Governance

This document defines the sovereign governance standards, architecture invariants, browser security boundaries, and execution rules for the unified **Perchance Plugin** ecosystem (`perchance-plugin`).

---

## 1. Core Operating Directives

- **Browser-Free Access First**: Always prefer browser-free operations (`perchance_pull`, local `.perchance-mirror/` caching, and `perchance_analyze` static analysis) before launching full browser sessions (`perchance_start`).
- **Engine Protocol**: The default browser engine for live editor automation is **Playwright Firefox** (`engine: 'firefox'`). It reliably clears Cloudflare Turnstile on `*.perchance.org` subdomains where Chromium is flagged.
- **Collab Semantics & Truth**: Writes made with `#edit:collab=KEY` update the shared room live (`saveState: "unsaved"`), but the public generator only updates when the owner saves. Report collab changes as "live in the room, pending owner save", never as "deployed".
- **Zero-Telepathy & Dual Prompt Boundaries**: Never mix internal simulation brackets, inventory state, or secret directives into public image/text diffusion prompts. Strip them deterministically before dispatching to `generateText` or `generateImage`.

---

## 2. Plugin & Subsystem Architecture

- **`skills/perchance-plugin-text`**: Authoritative specification for `root.generateText()`, iframe postMessage lifecycles, streaming completion IDs, stop sequences, and anchor prefix caching.
- **`skills/perchance-plugin-image`**: Authoritative specification for `root.generateImage()`, resolution constraints (`512x512`, `512x768`, etc.), CFG scales, background removal, and reference image guidance.
- **`skills/perchance-deployment`**: Production gatekeeper, single-file bundle verification (`deploy:prepare`), and direct MCP bundle deployment (`perchance_edit`).
- **`skills/perchance-editor`**: Runbook and tool map for the unified 17-tool live-editor suite, snapshot inspection, Companion Sidecar bridge, and recovery navigation.

---

## 3. Weld Companion & Analysis Integration

- **Static Analysis Tools**: Deep DSL/HTML analysis (`perchance_analyze`), cross-panel identifier tracking and AST renames (`perchance_analyze` with `query_identifier` / `rename_to`), and syntax primer retrieval (`perchance_get_primer`) run in-memory without browser overhead.
- **Target Resolution**: Tools auto-resolve to the live editor session or the local generator mirror in `.perchance-mirror/` when arguments are omitted.
