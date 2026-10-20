#!/usr/bin/env node
/**
 * bridge-worker.js — Antigravity Sidecar Worker for Perchance Companion Bridge.
 *
 * Automatically managed by Antigravity IDE (via sidecar.json).
 * Keeps an HTTP bridge alive on 127.0.0.1:8765 so that the Weld Companion
 * userscript running in your web browser (Tampermonkey/Violentmonkey) can connect
 * to Antigravity without requiring manual script startup.
 */

'use strict';
const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const Dev = require('../../scripts/dev-core.cjs');

const VERSION = '1.0.0';
const SUPPORTED = ['2025-06-18', '2025-03-26', '2024-11-05'];
const MAX_BODY = 6 * 1048576;
const CLIENT_TTL = 45000;
const POLL_MAX = 25000;
const TOOL_MS = { default: 30000, weld_sample: 70000 };
const MAX_RESULT = 200000;
const DEFAULT_PORT = parseInt(process.env.PERCHANCE_BRIDGE_PORT, 10) || 8765;

function randomToken() { return crypto.randomBytes(24).toString('hex'); }
function isLoopbackHost(hostHeader) {
  const h = String(hostHeader || '').toLowerCase().replace(/:\d+$/, '').replace(/^\[|\]$/g, '');
  return h === '127.0.0.1' || h === 'localhost' || h === '::1';
}
function isLoopbackOrigin(origin) {
  try { return isLoopbackHost(new URL(origin).host); } catch (e) { return false; }
}

function createBridge(options) {
  options = options || {};
  const token = options.token || randomToken();
  const toolMs = Object.assign({}, TOOL_MS, options.toolMs || {});
  const clientTtl = options.clientTtl || CLIENT_TTL;
  const clients = new Map();       // cid -> { cid, slug, mode, version, lastSeen, queue: [], waiter }
  const pending = new Map();       // command id -> { resolve, timer, cid }
  const sessions = new Map();      // MCP session id -> { clientInfo, protocolVersion }
  let counter = 0;
  const log = options.log || (() => {});

  function liveClients() {
    const now = Date.now();
    return Array.from(clients.values()).filter(c => now - c.lastSeen < clientTtl).sort((a, b) => b.lastSeen - a.lastSeen);
  }
  function pickClient(tab) {
    const live = liveClients();
    if (tab) return live.find(c => c.slug === tab) || null;
    return live[0] || null;
  }
  function touch(info) {
    let c = clients.get(info.cid);
    if (!c) { c = { cid: info.cid, queue: [], waiter: null }; clients.set(info.cid, c); }
    c.slug = info.slug || '';
    c.mode = info.mode === 'edit' ? 'edit' : 'view';
    c.version = info.version || '';
    c.lastSeen = Date.now();
    return c;
  }
  function dispatch(client, tool, args, ms) {
    return new Promise(resolve => {
      const id = 'c' + (++counter) + '-' + crypto.randomBytes(4).toString('hex');
      const timer = setTimeout(() => {
        pending.delete(id);
        resolve({ ok: false, error: 'Weld did not answer in time. Is the generator tab still open and visible?' });
      }, ms);
      pending.set(id, { resolve, timer, cid: client.cid });
      if (client.queue.length >= 50) {
        clearTimeout(timer);
        pending.delete(id);
        return resolve({ ok: false, error: 'Too many requests are waiting for Weld.' });
      }
      const cmd = { id, tool, args };
      if (client.waiter) {
        const w = client.waiter;
        client.waiter = null;
        w(cmd);
      } else {
        client.queue.push(cmd);
      }
    });
  }

  const toolByName = new Map(Dev.BRIDGE_TOOLS.map(t => [t.name, t]));
  function mcpTool(t) {
    return {
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      annotations: {
        title: t.name.replace(/^weld_/, '').replace(/_/g, ' '),
        readOnlyHint: !!t.readOnly,
        destructiveHint: false,
        idempotentHint: !!t.readOnly,
        openWorldHint: false
      }
    };
  }
  function textResult(value, isError) {
    let text = typeof value === 'string' ? value : JSON.stringify(value, null, 1);
    if (text.length > MAX_RESULT) text = text.slice(0, MAX_RESULT) + '\n… [truncated]';
    return { content: [{ type: 'text', text }], isError: !!isError };
  }
  function statusReport() {
    const live = liveClients();
    return {
      bridge: VERSION,
      connected: live.length > 0,
      port: options.port || DEFAULT_PORT,
      token,
      tabs: live.map(c => ({
        generator: c.slug,
        editor: c.mode === 'edit' ? 'open (proposals can be made)' : 'closed (read-only)',
        weld: c.version,
        last_seen_seconds_ago: Math.round((Date.now() - c.lastSeen) / 1000)
      })),
      hint: live.length ? undefined : 'Open the generator in your browser, open the Weld drawer, go to the Dev tab and press Connect.'
    };
  }
  async function callTool(name, args, session) {
    const def = toolByName.get(name);
    if (!def) {
      const e = new Error('Unknown tool: ' + name);
      e.code = -32602;
      throw e;
    }
    args = (args && typeof args === 'object' && !Array.isArray(args)) ? args : {};
    if (name === 'weld_get_primer') return textResult(Dev.PRIMER);
    if (name === 'weld_status') return textResult(statusReport());
    const tab = typeof args.tab === 'string' ? args.tab : '';
    const client = pickClient(tab);
    if (!client) {
      return textResult(tab ? 'No connected Weld tab has "' + tab + '" open. ' + JSON.stringify(statusReport()) : 'Weld is not connected. ' + JSON.stringify(statusReport()), true);
    }
    const send = Object.assign({}, args);
    delete send.tab;
    delete send._agent;
    if (name === 'weld_propose_edit') {
      send._agent = (session && session.clientInfo && String(session.clientInfo.name || '').slice(0, 60)) || 'antigravity';
    }
    const reply = await dispatch(client, name, send, toolMs[name] || toolMs.default);
    return reply.ok ? textResult(reply.result === undefined ? 'ok' : reply.result) : textResult(reply.error || 'Failed', true);
  }

  const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id: id == null ? null : id, error: { code, message } });
  async function handleRpc(msg, session, sessionHeader, res) {
    if (!msg || typeof msg !== 'object' || msg.jsonrpc !== '2.0') return rpcError(msg && msg.id, -32600, 'Invalid Request');
    const isRequest = msg.id !== undefined && typeof msg.method === 'string';
    if (!isRequest) return null;
    try {
      switch (msg.method) {
        case 'initialize': {
          const asked = msg.params && msg.params.protocolVersion;
          const version = SUPPORTED.includes(asked) ? asked : SUPPORTED[0];
          const sid = crypto.randomUUID();
          sessions.set(sid, { clientInfo: (msg.params && msg.params.clientInfo) || {}, protocolVersion: version });
          if (sessions.size > 200) sessions.delete(sessions.keys().next().value);
          res.sessionId = sid;
          return {
            jsonrpc: '2.0', id: msg.id,
            result: {
              protocolVersion: version,
              capabilities: { tools: { listChanged: false } },
              serverInfo: { name: 'perchance-companion-bridge', title: 'Perchance Companion Bridge', version: VERSION }
            }
          };
        }
        case 'ping': return { jsonrpc: '2.0', id: msg.id, result: {} };
        case 'tools/list': return { jsonrpc: '2.0', id: msg.id, result: { tools: Dev.BRIDGE_TOOLS.map(mcpTool) } };
        case 'tools/call': {
          const p = msg.params || {};
          if (typeof p.name !== 'string') return rpcError(msg.id, -32602, 'params.name is required');
          const result = await callTool(p.name, p.arguments, session);
          return { jsonrpc: '2.0', id: msg.id, result };
        }
        case 'resources/list': return { jsonrpc: '2.0', id: msg.id, result: { resources: [] } };
        default: return rpcError(msg.id, -32601, 'Method not found: ' + msg.method);
      }
    } catch (e) {
      return rpcError(msg.id, e.code || -32603, e.message || 'Internal error');
    }
  }

  function send(res, status, body, headers) {
    const data = body == null ? '' : (typeof body === 'string' ? body : JSON.stringify(body));
    res.writeHead(status, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }, headers || {}));
    res.end(data);
  }
  function readBody(req) {
    return new Promise((resolve, reject) => {
      const chunks = []; let size = 0;
      req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(Object.assign(new Error('Request body too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }
  const tokenOk = given => {
    const a = Buffer.from(String(given)), b = Buffer.from(token);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  };

  async function onRequest(req, res) {
    try {
      if (!isLoopbackHost(req.headers.host)) return send(res, 403, { error: 'Forbidden host' });
      const url = new URL(req.url, 'http://127.0.0.1');
      const parts = url.pathname.split('/').filter(Boolean);

      // Local status endpoint (for local MCP or health checking)
      if (parts[0] === 'status' && parts.length === 1) {
        return send(res, 200, statusReport());
      }

      // /pair hands the token to the userscript securely
      if (parts[0] === 'pair' && parts.length === 1) {
        if (req.method !== 'GET' || req.headers['x-weld-pair'] !== '1' || req.headers.origin) {
          return send(res, 404, { error: 'Not found' });
        }
        return send(res, 200, { ok: true, bridge: VERSION, token, port: options.port || DEFAULT_PORT });
      }

      // /mcp/<token>
      if (parts[0] === 'mcp') {
        if (!parts[1] || !tokenOk(parts[1]) || parts.length !== 2) return send(res, 404, { error: 'Not found' });
        const origin = req.headers.origin;
        if (origin && !isLoopbackOrigin(origin)) return send(res, 403, { error: 'Forbidden origin' });
        if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' }, { Allow: 'POST' });
        const sid = req.headers['mcp-session-id'];
        let session = sid ? sessions.get(sid) : null;
        let msg;
        try { msg = JSON.parse(await readBody(req)); } catch (e) { return send(res, 400, rpcError(null, -32700, 'Parse error')); }
        const out = { sessionId: null };
        const reply = await handleRpc(msg, session, sid, out);
        if (!reply) return send(res, 202, null);
        return send(res, 200, reply, out.sessionId ? { 'Mcp-Session-Id': out.sessionId } : null);
      }

      // /weld/<token>/{poll,reply,bye}
      if (parts[0] === 'weld') {
        if (!parts[1] || !tokenOk(parts[1])) return send(res, 404, { error: 'Not found' });
        const action = parts[2];
        if (action === 'poll' && req.method === 'GET') {
          const q = url.searchParams, cid = (q.get('cid') || '').slice(0, 64);
          if (!/^[\w-]{4,64}$/.test(cid)) return send(res, 400, { error: 'cid required' });
          const isNew = !clients.has(cid);
          const c = touch({ cid, slug: (q.get('slug') || '').slice(0, 100), mode: q.get('mode'), version: (q.get('v') || '').slice(0, 20) });
          if (c.queue.length) return send(res, 200, { commands: c.queue.splice(0, 10) });
          if (isNew) return send(res, 200, { commands: [], hello: true });
          const wait = Math.min(POLL_MAX, Math.max(0, Number(q.get('wait')) * 1000 || POLL_MAX));
          if (c.waiter) { const old = c.waiter; c.waiter = null; old(null); }
          await new Promise(resolve => {
            const timer = setTimeout(() => { if (c.waiter === done) c.waiter = null; resolve(); }, wait);
            function done(cmd) { clearTimeout(timer); if (cmd) { send(res, 200, { commands: [cmd] }); } else send(res, 200, { commands: [] }); resolve(); }
            c.waiter = done;
            req.on('close', () => { if (c.waiter === done) { c.waiter = null; clearTimeout(timer); resolve(); } });
          });
          if (!res.writableEnded && !res.destroyed) send(res, 200, { commands: [] });
          return;
        }
        if (action === 'reply' && req.method === 'POST') {
          let body; try { body = JSON.parse(await readBody(req)); } catch (e) { return send(res, 400, { error: 'Bad JSON' }); }
          const p = body && pending.get(body.id);
          if (!p) return send(res, 200, { ok: false, note: 'unknown or expired command' });
          clearTimeout(p.timer); pending.delete(body.id);
          p.resolve(body.ok ? { ok: true, result: body.result } : { ok: false, error: String(body.error || 'Failed').slice(0, 2000) });
          return send(res, 200, { ok: true });
        }
        if (action === 'bye' && req.method === 'POST') {
          let body = {}; try { body = JSON.parse(await readBody(req)); } catch (e) {}
          if (body && clients.has(body.cid)) clients.delete(body.cid);
          return send(res, 200, { ok: true });
        }
        return send(res, 404, { error: 'Not found' });
      }
      return send(res, 404, { error: 'Not found' });
    } catch (e) {
      log('request error: ' + (e && e.message));
      if (!res.headersSent) send(res, 500, { error: 'Server error' }); else res.end();
    }
  }

  const server = http.createServer((req, res) => { onRequest(req, res); });
  return {
    server, token, clients, sessions, pending,
    listen(port, host) { return new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host || '127.0.0.1', () => resolve(server.address())); }); },
    close() { return new Promise(resolve => { pending.forEach(p => { clearTimeout(p.timer); p.resolve({ ok: false, error: 'Bridge stopped' }); }); pending.clear(); clients.forEach(c => { if (c.waiter) c.waiter(null); }); if (server.closeAllConnections) server.closeAllConnections(); server.close(() => resolve()); }); }
  };
}

function loadConfig(file) {
  let cfg = {};
  try { cfg = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {}
  let changed = false;
  if (!cfg.token) { cfg.token = randomToken(); changed = true; }
  if (!cfg.port) { cfg.port = DEFAULT_PORT; changed = true; }
  if (changed) {
    try { fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n', { mode: 0o600 }); } catch (e) {}
  }
  return cfg;
}

const configFile = path.join(__dirname, '.bridge-credentials.json');
const config = loadConfig(configFile);
const bridge = createBridge({
  token: config.token,
  port: config.port,
  log: msg => process.stderr.write('[perchance-bridge] ' + msg + '\n')
});

bridge.listen(config.port, '127.0.0.1').then(addr => {
  console.log(`[perchance-bridge] Listening on http://127.0.0.1:${addr.port} (token: ${config.token})`);
}).catch(err => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[perchance-bridge] Port ${config.port} already open. Re-using active bridge instance.`);
    process.exit(0);
  }
  console.error('[perchance-bridge] Error starting server:', err.message);
  process.exit(1);
});

process.on('SIGINT', () => bridge.close().then(() => process.exit(0)));
process.on('SIGTERM', () => bridge.close().then(() => process.exit(0)));
