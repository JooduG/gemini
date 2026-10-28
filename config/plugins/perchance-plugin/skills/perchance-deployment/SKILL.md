---
name: perchance-deployment
description: Production release gatekeeper and deployment automation for Perchance. Use when preparing releases, verifying single-file HTML bundles, running pre-flight gates (npm run deploy:prepare, npm run verify), executing automated deployments via perchance_deploy, or running CLI deploy scripts (npm run deploy:auto).
---

# Perchance Deployment — Operating Manual

Automated deployment pipeline for pushing single-file HTML bundles (e.g. `dist/index.html` built via `vite-plugin-singlefile`) into Perchance generators.

Deployment operates **Companion-first with Playwright fallback**:

1. **Live Browser Tab (Companion Bridge)**: If the user has an active generator tab open with the Weld userscript connected via the Companion Bridge on `127.0.0.1:8765`, deployment writes directly into the open tab with zero startup latency and zero Cloudflare overhead.
2. **Headless Browser Session (Playwright)**: If no companion tab is connected, it launches an automated headless Playwright session (Firefox default), authenticates via `collabKey`, writes the bundle to the target pane, and verifies Yjs settlement.

---

## 1.0 Empirical Pitfalls & Scar Tissue

| Trigger                  | Wrong Behavior                                                          | Correct Behavior                                                                                         |
| :----------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Bundle Size > 4 MB**   | Attempting to write uncompressed/large bundles directly into Perchance. | Enforce hard 4 MB ceiling (`MAX_BUNDLE_BYTES`). Fail fast with optimization tips to avoid Yjs freeze.    |
| **Cloudflare Challenge** | Using raw Puppeteer/Chromium without session escalation.                | Use Companion Bridge or Playwright Firefox engine (`engine: "firefox"`) to pass Cloudflare verification. |
| **Yjs Collab Race**      | Closing browser session immediately after writing text.                 | Always wait for Yjs settlement (`settle: true` or `session.status()`) before closing session.            |
| **Collab Key Leak**      | Hardcoding `#edit:collab=KEY` in public scripts or git commits.         | Read `PERCHANCE_URL` and `PERCHANCE_KEY` exclusively from local `.env` (gitignored).                     |

---

## 2.0 Deployment Execution Modes

### Mode 1: Native MCP Tool (`perchance_deploy`)

Agents deploy directly in one atomic call without shelling out:

```javascript
// Deploy default dist/index.html to target from .env
await perchance_deploy({
  file: "dist/index.html",
  pane: "output",
});

// Deploy to a specific generator shard with custom key
await perchance_deploy({
  file: "dist/index.html",
  name: "rpglitchen",
  collabKey: "my-collab-key",
  forcePlaywright: false,
});
```

### Mode 2: Central CLI Runner (`scripts/deploy.js`)

Triggered via npm or terminal directly:

```bash
# 1. Run local verification and build pipeline
npm run deploy:prepare

# 2. Execute automated deployment runner
npm run deploy:auto
```

Or invoke the central runner with explicit arguments:

```bash
node C:/Users/johng/.gemini/config/plugins/perchance-plugin/scripts/deploy.js --file dist/index.html --name rpglitchen
```

---

## 3.0 Configuration & Environment Variables

Define the deployment target in the project's root `.env` (never commit credentials to git):

```env
# Target generator URL (can include #edit:collab=KEY)
PERCHANCE_URL=https://perchance.org/rpglitchen#edit:collab=YOUR_COLLAB_KEY

# Optional fallback collab key if not present in the URL hash
PERCHANCE_KEY=YOUR_COLLAB_KEY
```

---

## 4.0 Pre-Flight & Verification (Definition of Done)

- [ ] Quality gates pass (`npm run deploy:prepare`: lint, tests, build).
- [ ] Single-file HTML bundle exists and is under 4 MB.
- [ ] Automated deploy runner or `perchance_deploy` reports successful settlement.
- [ ] Generator live reload verified in browser or via `perchance_refresh`.
