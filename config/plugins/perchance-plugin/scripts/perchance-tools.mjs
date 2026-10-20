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

    const req = http.request({
      host: "127.0.0.1",
      port,
      path: pathName,
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Weld-Pair": "1"
      },
      timeout: 10000
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

    if (body) req.write(JSON.stringify(body));
    req.end();
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

  // 7. Companion Sidecar
  {
    name: "perchance_bridge_status",
    description: "Probe the background Antigravity Sidecar Bridge for active user browser tabs running the Weld Companion userscript.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
];

// ----------------------------- Dispatch Implementation -----------------------------
export const DISPATCH = {
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

  // Companion Sidecar Bridge
  perchance_bridge_status: async () => {
    return await queryCompanionBridge("/status");
  },
};
