// perchance-tools.mjs — Streamlined tool schemas & dispatch table for the Perchance MCP server.
// High-leverage, unified tool suite (13 tools) replacing 33 fragmented prototype tools.

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { PerchanceSession } = require("./perchance-core.cjs");
const Dev = require("./dev-core.cjs");
const Proj = require("./project-core.cjs");
import { deployBundle } from "./deploy.js";

export const session = new PerchanceSession();

/**
 * Resolves DSL (main.pjs) and HTML (index.html) source code for a generator.
 */
async function resolveGeneratorSource(name) {
  let target = name || (session && session.generatorName);
  const mirrorRoots = [
    path.resolve(__dirname, "..", ".perchance-mirror"),
    path.resolve(__dirname, "..", ".perch-mirror"),
    path.resolve(__dirname, ".perchance-mirror"),
    path.resolve(__dirname, ".perch-mirror")
  ];
  let mirrorRoot = mirrorRoots[0];
  for (const root of mirrorRoots) {
    if (fs.existsSync(root)) {
      mirrorRoot = root;
      break;
    }
  }

  if (!target && fs.existsSync(mirrorRoot)) {
    const entries = fs.readdirSync(mirrorRoot).filter(f => {
      try { return fs.statSync(path.join(mirrorRoot, f)).isDirectory(); } catch { return false; }
    });
    if (entries.length) target = entries[0];
  }

  let dsl = "";
  let html = "";
  let source = "none";

  if (session && session.page && (!name || session.generatorName === name)) {
    try {
      const liveDsl = await session.read({ pane: "model", limit: 20000 });
      const liveHtml = await session.read({ pane: "output", limit: 20000 });
      if (liveDsl && liveDsl.ok) dsl = liveDsl.lines.map(l => l.text).join("\n");
      if (liveHtml && liveHtml.ok) html = liveHtml.lines.map(l => l.text).join("\n");
      if (dsl || html) source = `live:${session.generatorName}`;
    } catch {}
  }

  if (!dsl && !html && target) {
    for (const root of mirrorRoots) {
      const dslPath = path.join(root, target, "main.pjs");
      const htmlPath = path.join(root, target, "index.html");
      if (fs.existsSync(dslPath)) dsl = fs.readFileSync(dslPath, "utf8");
      if (fs.existsSync(htmlPath)) html = fs.readFileSync(htmlPath, "utf8");
      if (dsl || html) {
        source = `mirror:${target}`;
        break;
      }
    }
  }

  return { dsl, html, generator: target || "unknown", source };
}

/**
 * Communication helper with the Companion Bridge Sidecar.
 */
function queryCompanionBridge(pathName, method = "GET", body = null) {
  return new Promise((resolve) => {
    const credPath = path.resolve(__dirname, "../sidecars/perchance-companion-bridge/.bridge-credentials.json");
    let port = 8765;
    let token = "";
    try {
      if (fs.existsSync(credPath)) {
        const c = JSON.parse(fs.readFileSync(credPath, "utf8"));
        if (c.port) port = c.port;
        if (c.token) token = c.token;
      }
    } catch {}

    const headers = {
      "Content-Type": "application/json",
      "X-Weld-Pair": "1"
    };

    const req = http.request({
      host: "127.0.0.1",
      port,
      path: pathName,
      method,
      headers,
      timeout: 15000
    }, (res) => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ ok: false, error: "Non-JSON response from bridge: " + data });
        }
      });
    });

    req.on("error", (err) => {
      resolve({ ok: false, error: "Companion Bridge Sidecar is not reachable: " + err.message });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, error: "Companion Bridge request timed out" });
    });

    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

function callBridgeTool(toolName, args = {}) {
  const credPath = path.resolve(__dirname, "../sidecars/perchance-companion-bridge/.bridge-credentials.json");
  let token = "";
  try {
    if (fs.existsSync(credPath)) {
      token = JSON.parse(fs.readFileSync(credPath, "utf8")).token || "";
    }
  } catch {}

  const postData = JSON.stringify({
    id: Date.now(),
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args
    }
  });

  return queryCompanionBridge("/mcp/" + token, "POST", postData).then(reply => {
    if (reply && reply.result && reply.result.content && reply.result.content[0]) {
      try {
        return JSON.parse(reply.result.content[0].text);
      } catch {
        return { ok: true, output: reply.result.content[0].text };
      }
    }
    return reply;
  });
}

const PANE = { type: "string", enum: ["model", "output"], description: "model = lists/DSL panel (main.pjs), output = HTML UI panel (index.html)" };
const FRAME = { type: "string", enum: ["preview", "editor"], description: "preview = running generator iframe; editor = top-level editor chrome" };

// ----------------------------- 13 Consolidated Tool Schemas -----------------------------
export const TOOLS = [
  // 1. Session Lifecycle
  {
    name: "perchance_start",
    description: "Start the Perchance live editor session: launches Playwright Firefox/Chromium, handles Cloudflare auto-escalation, and navigates to the generator ready for live editing.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Generator name, e.g. 'minimal'" },
        collabKey: { type: "string", description: "Collab key from URL hash (#edit:collab=KEY)" },
        headed: { type: "boolean", description: "Show visible browser window. Default false" },
        engine: { type: "string", enum: ["firefox", "chromium"], description: "Browser engine. Default firefox (clears Cloudflare)" },
        width: { type: "integer", description: "Viewport width. Default 1500" },
        height: { type: "integer", description: "Viewport height. Default 950" },
        force: { type: "boolean", description: "Reload even if already open" },
      },
      required: ["name"],
    },
  },
  {
    name: "perchance_status",
    description: "Report live session health: save state, syntax errors, collab sync, line counts, engine, and Cloudflare status.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "perchance_stop",
    description: "Close the browser automation session.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },

  // 2. Code Access & Mutation
  {
    name: "perchance_pull",
    description: "BROWSER-FREE code fetch. Fast public API fetch (~1.2s, no browser needed) saving main.pjs and index.html to local mirror files for full-text search.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Generator name. Defaults to current session" },
        dir: { type: "string", description: "Output directory. Default .perchance-mirror/<name>" },
      },
      required: [],
    },
  },
  {
    name: "perchance_read",
    description: "Read numbered lines (1-indexed) from the live editor (or grep regex pattern across panes).",
    inputSchema: {
      type: "object",
      properties: {
        pane: { ...PANE, description: "Default output (HTML)" },
        offset: { type: "integer", description: "First line (1-indexed). Default 1" },
        limit: { type: "integer", description: "Max lines. Default 2000" },
        pattern: { type: "string", description: "Optional regex search pattern to filter lines" },
        contextLines: { type: "integer", description: "Context lines around regex matches. Default 0" },
      },
      required: [],
    },
  },
  {
    name: "perchance_edit",
    description: "Unified editor mutation. Overwrite an entire pane with 'content', or apply surgical find/replace hunks with 'changes' [{oldString, newString, replaceAll?, nth?}]. Settles Yjs sync automatically.",
    inputSchema: {
      type: "object",
      properties: {
        pane: { ...PANE, description: "Default output" },
        content: { type: "string", description: "Full document replacement text" },
        changes: {
          type: "array",
          description: "List of surgical search/replace modifications",
          items: {
            type: "object",
            properties: {
              pane: PANE,
              oldString: { type: "string", description: "Exact text to find" },
              newString: { type: "string", description: "Replacement text" },
              replaceAll: { type: "boolean", description: "Replace all matches. Default false" },
              nth: { type: "integer", description: "Replace specific 1-indexed match" },
            },
            required: ["oldString", "newString"],
          },
        },
        settle: { type: "boolean", description: "Settle Yjs sync after edit. Default true" },
      },
      required: [],
    },
  },

  // 3. Virtual Store File Management
  {
    name: "perchance_files",
    description: "Unified management of the generator's virtual src/ file store. Actions: 'list' (all files & sizes), 'read' (fetch file contents), 'write' (upload via local path/url/content), 'delete' (remove file).",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list", "read", "write", "delete"], description: "Action to perform" },
        path: { type: "string", description: "File path in virtual store (e.g. README.md or images/hero.png)" },
        content: { type: "string", description: "Inline text content for small file writes" },
        filePath: { type: "string", description: "Server-side absolute path for byte-exact upload" },
        url: { type: "string", description: "HTTPS URL to fetch server-side" },
        overwrite: { type: "boolean", description: "Replace existing file. Default false" },
      },
      required: ["action"],
    },
  },

  // 4. Testing & UI Interaction
  {
    name: "perchance_refresh",
    description: "Hard-reload the live preview iframe and report immediate errors, console output, and load state.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "perchance_snapshot",
    description: "Text-first DOM testing: lists visible interactive elements (buttons, inputs, links) in the preview with ready-to-use CSS selectors.",
    inputSchema: {
      type: "object",
      properties: {
        filter: { type: "string", description: "Filter elements by tag or text label" },
        limit: { type: "integer", description: "Max elements. Default 250" },
      },
      required: [],
    },
  },
  {
    name: "perchance_interact",
    description: "Execute interactive UI actions in the live preview: click an element, type text, wait for selectors, press keys, or take a screenshot.",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["click", "type", "wait", "press", "screenshot"], description: "Action to execute" },
        selector: { type: "string", description: "CSS selector or 'text=Visible Label'" },
        text: { type: "string", description: "Text to type or visible text to wait for" },
        key: { type: "string", description: "Key name to press (Enter, Tab, Escape)" },
        submit: { type: "boolean", description: "Press Enter after typing. Default false" },
        gone: { type: "boolean", description: "For 'wait': wait for element to disappear" },
        screenshotPath: { type: "string", description: "Output path for screenshot" },
        frame: { ...FRAME, description: "Default preview" },
        timeout: { type: "integer", description: "Timeout in ms. Default 15000" },
      },
      required: ["action"],
    },
  },
  {
    name: "perchance_evaluate",
    description: "Evaluate a JavaScript expression in the running generator ('preview') or editor page ('editor') and return the result.",
    inputSchema: {
      type: "object",
      properties: {
        js: { type: "string", description: "JavaScript expression to evaluate" },
        frame: { ...FRAME, description: "Default preview" },
      },
      required: ["js"],
    },
  },

  // 5. Diagnostics & Logging
  {
    name: "perchance_logs",
    description: "Unified diagnostic triage: retrieve editor syntax errors, captured runtime errors, and console output. Pass clear:true to reset buffers.",
    inputSchema: {
      type: "object",
      properties: {
        clear: { type: "boolean", description: "Clear buffers after reading. Default false" },
      },
      required: [],
    },
  },

  // 6. Static Analysis & Grammar
  {
    name: "perchance_get_primer",
    description: "Authoritative Perchance grammar, syntax rules, evaluation semantics, and bug pitfalls from Weld Core. Read before authoring Perchance DSL.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "perchance_analyze",
    description: "Deep static analysis, usage search, and variety statistics (finds undefined names, silent no-op blocks, re-randomizing stored selections, and duplicate IDs).",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Generator name. Defaults to current session or mirror" },
        min_severity: { type: "string", enum: ["error", "warn", "info"], description: "Minimum finding severity" },
        query_identifier: { type: "string", description: "Search for all definitions and references of a specific list/function" },
      },
      required: [],
    },
  },

  // 7. Companion Sidecar & Pseudo-Agent Swarm
  {
    name: "perchance_bridge_status",
    description: "Probe the background Antigravity Sidecar Bridge for active user browser tabs running the Weld Companion userscript.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "perchance_swarm",
    description: "Interact directly with your live browser tab via the Companion Bridge. Actions: 'read_source' (fetch exact lines currently in browser), 'propose_edit' (send visual green/red diff proposal to your Weld drawer for one-click approval), 'proposal_status' (check if proposal was accepted/rejected), 'sample' (reroll live generator and measure variety statistics).",
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["read_source", "propose_edit", "proposal_status", "sample"], description: "Bridge action to execute in live tab" },
        tab: { type: "string", description: "Generator slug (defaults to first active tab)" },
        pane: { type: "string", enum: ["dsl", "html"], description: "Target editor pane ('dsl' or 'html')" },
        edits: {
          type: "array",
          description: "Line-based replacements for proposal: [{start_line, end_line, text}]",
          items: {
            type: "object",
            properties: {
              start_line: { type: "integer" },
              end_line: { type: "integer" },
              text: { type: "string" }
            },
            required: ["start_line", "end_line", "text"]
          }
        },
        new_text: { type: "string", description: "Complete pane text replacement for proposal" },
        note: { type: "string", description: "Explanation message displayed in the Weld drawer diff preview" },
        proposal_id: { type: "string", description: "Proposal ID to check (for 'proposal_status')" },
        start_line: { type: "integer", description: "Start line for 'read_source'" },
        end_line: { type: "integer", description: "End line for 'read_source'" },
        sample_count: { type: "integer", description: "Number of rerolls for 'sample' (5-100)" }
      },
      required: ["action"]
    }
  },
  {
    name: "perchance_agent_prompt",
    description: "Send prompt instructions to the native Perchance AI agent. Automatically routes to your live browser tab if open, or runs in headless Playwright session if tab is closed, automatically verifying generated code with zero errors.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Instruction/request to send to the Perchance AI agent" },
        name: { type: "string", description: "Generator name (e.g. 'glitchofhand'). Defaults to current session or active tab" },
        auto_allow: { type: "boolean", description: "Automatically execute without waiting for manual drawer approval. Default false" },
        watch: { type: "boolean", description: "Open a visible headed browser window so you can watch the AI agent think, type, and edit code live. Default false" },
        timeout: { type: "integer", description: "Timeout in milliseconds (default 90000)" }
      },
      required: ["prompt"]
    }
  },

  // 8. Deployment Gate & Automation
  {
    name: "perchance_deploy",
    description: "Deploy a single-file bundle or HTML file directly into a Perchance generator's output pane with automated Yjs settle verification. Uses companion browser tab if connected, otherwise headless Playwright.",
    inputSchema: {
      type: "object",
      properties: {
        file: { type: "string", description: "Path to bundle file, e.g. 'dist/index.html'. Defaults to dist/index.html" },
        name: { type: "string", description: "Target generator name. Optional, defaults to PERCHANCE_URL or current session" },
        collabKey: { type: "string", description: "Collab key. Optional, defaults to PERCHANCE_KEY or hash in PERCHANCE_URL" },
        pane: { type: "string", enum: ["output", "model"], description: "Target pane. Default 'output'" },
        forcePlaywright: { type: "boolean", description: "Bypass companion bridge and force headless Playwright session. Default false" }
      },
      required: []
    }
  }
];

// ----------------------------- Dispatch Implementation -----------------------------
export const DISPATCH = {
  // Deployment
  perchance_deploy: (a) => deployBundle(a || {}),

  // Session
  perchance_start: (a) => session.start(a),
  perchance_status: () => session.status(),
  perchance_stop: () => session.stop(),

  // Code Access
  perchance_pull: (a) => session.pull(a),
  perchance_read: async (a) => {
    if (a && a.pattern) {
      return await session.grep({
        pane: a.pane,
        pattern: a.pattern,
        contextLines: a.contextLines || 0,
        limit: a.limit || 200
      });
    }
    return await session.read(a || {});
  },

  // Unified Edit (Full replacement OR surgical changes)
  perchance_edit: async (a) => {
    if (a && a.content !== undefined) {
      return await session.write({
        pane: a.pane || "output",
        content: a.content,
        settle: a.settle !== false
      });
    }
    if (a && a.changes && Array.isArray(a.changes)) {
      return await session.patch({
        changes: a.changes,
        settle: a.settle !== false
      });
    }
    return { ok: false, error: "Provide either 'content' (full document replacement) or 'changes' (array of surgical find/replace hunks)." };
  },

  // Unified Virtual Store (src/)
  perchance_files: async (a) => {
    if (!a || !a.action) return { ok: false, error: "Missing 'action' parameter (list, read, write, delete)." };
    switch (a.action) {
      case "list":
        return await session.listSrc();
      case "read":
        if (!a.path) return { ok: false, error: "Missing 'path' parameter for read." };
        return await session.src(a.path);
      case "write":
        if (!a.path) return { ok: false, error: "Missing 'path' parameter for write." };
        return await session.uploadSrc({
          name: a.path,
          content: a.content,
          filePath: a.filePath,
          url: a.url,
          overwrite: !!a.overwrite
        });
      case "delete":
        if (!a.path) return { ok: false, error: "Missing 'path' parameter for delete." };
        return await session.deleteSrc({ path: a.path });
      default:
        return { ok: false, error: `Unknown action: ${a.action}` };
    }
  },

  // Testing & UI Interaction
  perchance_refresh: () => session.refresh(),
  perchance_snapshot: (a) => session.snapshot(a || {}),
  perchance_evaluate: (a) => session.eval(a),
  perchance_interact: async (a) => {
    if (!a || !a.action) return { ok: false, error: "Missing 'action' parameter." };
    switch (a.action) {
      case "click":
        return await session.click({ selector: a.selector, frame: a.frame, timeout: a.timeout });
      case "type":
        return await session.type({ selector: a.selector, text: a.text, submit: !!a.submit, frame: a.frame, timeout: a.timeout });
      case "wait":
        return await session.wait({ selector: a.selector, text: a.text, gone: !!a.gone, frame: a.frame, timeout: a.timeout });
      case "press":
        return await session.press({ key: a.key, frame: a.frame });
      case "screenshot":
        return await session.shot({ what: a.frame === "editor" ? "editor" : "preview", path: a.screenshotPath });
      default:
        return { ok: false, error: `Unknown action: ${a.action}` };
    }
  },

  // Unified Logs & Errors
  perchance_logs: async (a) => {
    const clear = !!(a && a.clear);
    const errs = await session.errors({ clear });
    const cons = await session.console({ clear });
    return {
      ok: true,
      syntaxErrors: errs.syntaxErrors || [],
      pageErrors: errs.pageErrors || [],
      recentConsoleLines: cons.console || [],
      droppedConsole: cons.droppedConsole || 0,
      droppedErrors: errs.droppedErrors || 0,
    };
  },

  // Static Analysis & Grammar
  perchance_get_primer: () => ({ ok: true, primer: Dev.PRIMER }),
  perchance_analyze: async (a) => {
    const { dsl, html, generator, source } = await resolveGeneratorSource(a && a.name);
    if (!dsl && !html) return { ok: false, error: `No source found for generator '${generator}'. Run perchance_pull or perchance_start first.` };

    // If querying an identifier, return usage graph
    if (a && a.query_identifier) {
      const usages = Dev.findUsages(dsl, html, a.query_identifier);
      return {
        ok: true,
        target: a.query_identifier,
        generator,
        source,
        hits: usages.hits,
        count: usages.hits.length,
      };
    }

    const res = Proj.analyze({ dsl, html, name: generator });
    let findings = res.findings || [];
    if (a && a.min_severity) {
      const rank = { error: 3, warn: 2, info: 1 };
      const min = rank[a.min_severity] || 1;
      findings = findings.filter(f => (rank[f.severity] || 1) >= min);
    }
    return {
      ok: true,
      generator,
      source,
      stats: res.stats,
      counts: res.counts,
      findings,
      lists: res.lists,
      functions: res.functions,
      imports: res.imports,
      outputSpace: res.outputSpace,
    };
  },

  // Companion Sidecar Bridge & Swarm Operations
  perchance_bridge_status: async () => {
    return await queryCompanionBridge("/status");
  },

  perchance_swarm: async (a) => {
    if (!a || !a.action) return { ok: false, error: "Missing 'action' parameter (read_source, propose_edit, proposal_status, sample)." };
    switch (a.action) {
      case "read_source":
        return await callBridgeTool("weld_get_source", {
          pane: a.pane || "dsl",
          start_line: a.start_line || 1,
          end_line: a.end_line || 400,
          tab: a.tab
        });
      case "propose_edit":
        return await callBridgeTool("weld_propose_edit", {
          pane: a.pane || "dsl",
          edits: a.edits,
          new_text: a.new_text,
          note: a.note || "Antigravity Swarm proposal",
          tab: a.tab
        });
      case "proposal_status":
        if (!a.proposal_id) return { ok: false, error: "Missing 'proposal_id' parameter." };
        return await callBridgeTool("weld_proposal_status", {
          id: a.proposal_id
        });
      case "sample":
        return await callBridgeTool("weld_sample", {
          count: a.sample_count || 15,
          tab: a.tab
        });
      default:
        return { ok: false, error: `Unknown swarm action: ${a.action}` };
    }
  },

  perchance_agent_prompt: async (a) => {
    if (!a || !a.prompt) return { ok: false, error: "Missing 'prompt' parameter." };
    const promptText = a.prompt;
    const genName = a.name || session.generatorName || "glitchofhand";

    // 1. If auto_allow is requested or watch: true, run automated execution (headed if watch: true)
    const wantsAuto = a.auto_allow === true || a.watch === true;

    // Check if Companion Bridge has an active browser tab open with the generator
    const bridgeStatus = await queryCompanionBridge("/status");
    const isBridgeConnected = bridgeStatus && bridgeStatus.connected && bridgeStatus.tabs && bridgeStatus.tabs.length > 0;
    const matchingTab = isBridgeConnected ? bridgeStatus.tabs.find(t => !a.name || t.generator === a.name) : null;

    if (matchingTab && !wantsAuto) {
      // Live browser tab is open and user wants manual review gate in drawer:
      const proposalResult = await callBridgeTool("weld_propose_edit", {
        pane: "dsl",
        edits: [
          {
            start_line: 1,
            end_line: 0,
            text: `// [AI Swarm Directive]: ${promptText}\n`
          }
        ],
        note: `AI Agent Directive: ${promptText}`,
        tab: matchingTab.generator
      });
      return {
        ok: true,
        mode: "live_browser_tab",
        generator: matchingTab.generator,
        status: "dispatched_to_drawer",
        proposal: proposalResult,
        note: "Dispatched directive to your open browser tab. You can review the diff in the Weld drawer, or pass auto_allow: true to execute automatically."
      };
    }

    // 2. Playwright execution: supports watch: true (opens visible headed window so you can watch everything live)
    const headed = a.watch === true || a.headed === true;
    if (!session.page || (a.name && session.generatorName !== a.name) || (headed && !session.headed)) {
      await session.start({ name: genName, headed });
    }

    const agentResult = await session.promptNativeAgent({
      prompt: promptText,
      timeout: a.timeout || 90000
    });

    // 3. Perform static analysis on resulting code to verify zero syntax errors
    const currentCode = await resolveGeneratorSource(genName);
    let diagnostics = null;
    if (currentCode.dsl || currentCode.html) {
      const analysis = Proj.analyze({ dsl: currentCode.dsl, html: currentCode.html, name: genName });
      diagnostics = {
        errorCount: (analysis.findings || []).filter(f => f.severity === "error").length,
        warningCount: (analysis.findings || []).filter(f => f.severity === "warn").length,
        errors: (analysis.findings || []).filter(f => f.severity === "error")
      };
    }

    return {
      ok: agentResult.ok,
      mode: "headless_playwright",
      generator: genName,
      agentResult,
      diagnostics
    };
  },
};
