#!/usr/bin/env node
// perchance.js — Unified MCP server entry point for the Perchance plugin.
//
// Stdio transport; exposes full-name Perchance tools for autonomous Playwright
// automation, browser-free AST static analysis, and companion sidecar bridge connectivity.

import { McpServer, fromJsonSchema } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { TOOLS, DISPATCH } from "./perchance-tools.mjs";

function createServer() {
  const server = new McpServer({ name: "perchance", version: "3.0.0" }, { capabilities: { tools: {} } });
  for (const tool of TOOLS) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: fromJsonSchema(tool.inputSchema) },
      async (args) => {
        const fn = DISPATCH[tool.name];
        const t0 = Date.now();
        try {
          const result = await fn(args || {});
          result.ms = Date.now() - t0;
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        } catch (e) {
          return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: String((e && e.message) || e), ms: Date.now() - t0 }) }] };
        }
      }
    );
  }
  return server;
}

serveStdio(createServer, {
  legacy: "reject",
  onerror: (e) => { console.error("[perchance] serveStdio error:", (e && e.message) || e); },
});

process.on("unhandledRejection", (e) => {
  console.error("[perchance] unhandled rejection:", (e && e.message) || e);
});
process.on("uncaughtException", (e) => {
  console.error("[perchance] uncaught:", (e && e.message) || e);
});
