# Perchance Engineering Laws & Governance

This document defines the sovereign governance standards, architecture invariants, browser security boundaries, and execution rules for the unified **Perchance Plugin** ecosystem (`perchance-plugin`).

---

## 1. Core Operating Directives

- **Browser-Free Access First**: Always prefer browser-free operations (`perch_pull`, local `.perch-mirror/` caching, and `perch_weld_*` static analysis) before launching full browser sessions (`perch_start`).
- **Engine Protocol**: The default browser engine for live editor automation is **Playwright Firefox** (`engine: 'firefox'`). It reliably clears Cloudflare Turnstile on `*.perchance.org` subdomains where Chromium is flagged.
- **Collab Semantics & Truth**: Writes made with `#edit:collab=KEY` update the shared room live (`saveState: "unsaved"`), but the public generator only updates when the owner saves. Report collab changes as "live in the room, pending owner save", never as "deployed".
- **Zero-Telepathy & Dual Prompt Boundaries**: Never mix internal simulation brackets, inventory state, or secret directives into public image/text diffusion prompts. Strip them deterministically before dispatching to `generateText` or `generateImage`.

---

## 2. Plugin & Subsystem Architecture

- **`skills/perchance-plugin-text`**: Authoritative specification for `root.generateText()`, iframe postMessage lifecycles, streaming completion IDs, stop sequences, and anchor prefix caching.
- **`skills/perchance-plugin-image`**: Authoritative specification for `root.generateImage()`, resolution constraints (`512x512`, `512x768`, etc.), CFG scales, background removal, and reference image guidance.
- **`skills/perchance-deployment`**: Production gatekeeper, single-file bundle verification (`deploy:prepare`), and direct MCP bundle deployment (`perch_write`).
- **`skills/perchance-editor`**: Runbook and tool map for the 28 live-editor tools, snapshot inspection, and recovery navigation.

---

## 3. Weld Companion Integration

- **Static Analysis Tools**: Deep DSL/HTML analysis (`perch_weld_analyze`), cross-panel identifier tracking (`perch_weld_usages`), outline/output size estimation (`perch_weld_outline`), and syntax primer retrieval (`perch_weld_primer`) run in-memory without browser overhead.
- **Target Resolution**: Tools auto-resolve to the live editor session or the local generator mirror in `.perch-mirror/` when arguments are omitted.
