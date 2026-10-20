# ⚡ Perchance Plugin Guide

This plugin provides complete, end-to-end pair programming and automation for [Perchance.org](https://perchance.org) generators.

It supports **two execution modes**:

1. **Autonomous Robot Mode (Playwright)**: Antigravity launches its own background browser, solves Cloudflare challenges, reads/edits code, and drives testing automatically without touching your personal browser.
2. **Human Co-Pilot Mode (Sidecar Bridge)**: Antigravity connects directly to the generator tab open in your personal browser via the **Weld Companion** userscript.

---

## 🚀 Quick Start: Autonomous Mode (No Browser Setup Needed)

If you just want Antigravity to do everything for you in the background:

- **You do NOT need to install anything in your browser.**
- Simply prompt Antigravity:
  - _"Pull generator 'my-rpg' and analyze it for syntax errors."_
  - _"Start a live session for 'my-rpg', replace the dice roller list, and test it."_
  - _"Take a screenshot of the running preview."_

---

## 🛠️ Optional: Human Co-Pilot Mode (The Sidecar Bridge)

If you want to view generators in **your own web browser** (Chrome, Firefox, Edge, Brave) and let Antigravity see your active tab and stage live proposals directly onto your screen, follow these 3 steps:

### Step 1: Install a Userscript Manager

Install one of these free browser extensions:

- **Violentmonkey** (Recommended, open source): [Chrome/Edge](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag) · [Firefox](https://addons.mozilla.org/en-US/firefox/addon/violentmonkey/)
- **Tampermonkey**: [Chrome/Edge](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) · [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

---

### Step 2: Install the Weld Companion Userscript

In your userscript manager, create a new script, replace everything, and paste the userscript header below (or install the full [Weld Companion Userscript](https://raw.githubusercontent.com/therealwestninja/weld-companion/main/weld-companion.user.js)):

```javascript
// ==UserScript==
// @name         ⚡ Weld Companion for Perchance
// @namespace    https://perchance.org/weld
// @version      1.0.0
// @description  Connects live Perchance generator editor tabs to Antigravity IDE
// @author       west-ninja & Antigravity
// @match        https://perchance.org/*
// @match        https://*.perchance.org/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      127.0.0.1
// @connect      localhost
// @run-at       document-end
// ==/UserScript==

// To install the full official Weld Companion distribution directly:
// https://raw.githubusercontent.com/therealwestninja/weld-companion/main/weld-companion.user.js
```

---

### Step 3: Connect to the Antigravity Sidecar

1. Open any generator page on `perchance.org` in edit mode (e.g. `https://perchance.org/minimal#edit`).
2. A **⚡ Weld** button will appear in the Perchance menu bar (next to **edit**). Click it or press `/` to open the drawer.
3. Switch to the **Dev** tab.
4. Under **Agent Bridge**, verify the port and click **Connect**:
   - **Bridge URL**: `http://127.0.0.1:8765`
   - **Pairing**: The userscript automatically pairs with Antigravity's background Sidecar (`perchance-companion-bridge`).
5. Once connected, the status badge turns **green**. Antigravity can now inspect your live tab and stage change proposals!

---

## 🧰 Available MCP Tools (Streamlined 15-Tool Suite)

| Tool                      | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `perchance_start`         | Launch live Playwright session (auto-escalates Cloudflare bypass ladder)           |
| `perchance_status`        | Check live editor health, save state, and collab sync                              |
| `perchance_stop`          | Terminate the headless/headed browser session                                      |
| `perchance_pull`          | Fast browser-free public API fetch into `.perchance-mirror/`                       |
| `perchance_read`          | Read numbered lines or regex search across DSL and HTML panels                     |
| `perchance_edit`          | Unified mutation: surgical find/replace hunks or full document replacement         |
| `perchance_files`         | Virtual file store management: `action: "list" \| "read" \| "write" \| "delete"`   |
| `perchance_refresh`       | Hard-reload the preview iframe                                                     |
| `perchance_snapshot`      | Inspect interactive elements (buttons, inputs) with ready CSS selectors            |
| `perchance_interact`      | UI action driver: `action: "click" \| "type" \| "wait" \| "press" \| "screenshot"` |
| `perchance_evaluate`      | Run arbitrary JavaScript in either preview or editor frame                         |
| `perchance_logs`          | Unified diagnostics: syntax errors, runtime page errors, and console output        |
| `perchance_get_primer`    | The authoritative Perchance grammar and syntax rules from Weld Core                |
| `perchance_analyze`       | Deep AST static linting, identifier usage graph, and variety stats                 |
| `perchance_bridge_status` | Probe the Sidecar bridge for connected browser tabs                                |
