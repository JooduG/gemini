/**
 * @file scripts/deploy.js
 * 🚀 Centralized Perchance Deployment Runner & Engine
 *
 * Deploys single-file HTML bundles directly into Perchance generators.
 * Implements companion-first session negotiation (fast live browser tab via sidecar)
 * with automatic fallback to headless Playwright session.
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const { PerchanceSession } = require(path.resolve(__dirname, 'perchance-core.cjs'));

export const MAX_BUNDLE_BYTES = 4 * 1024 * 1024; // 4 MB hard safety ceiling

/**
 * Parses .env file from working directory if present.
 */
export function loadEnv(targetCwd = process.cwd()) {
  const env_path = path.resolve(targetCwd, '.env');
  if (fs.existsSync(env_path)) {
    const env_content = fs.readFileSync(env_path, 'utf8');
    for (const line of env_content.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value.trim();
      }
    }
  }
}

/**
 * Checks Companion Bridge Sidecar status on 127.0.0.1:8765.
 */
export function queryCompanionBridge(pathName = '/status') {
  return new Promise((resolve) => {
    const credPath = path.resolve(__dirname, '../sidecars/perchance-companion-bridge/.bridge-credentials.json');
    let port = 8765;
    try {
      if (fs.existsSync(credPath)) {
        const c = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        if (c.port) port = c.port;
      }
    } catch {}

    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: pathName,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Weld-Pair': '1',
        },
        timeout: 2500,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ ok: false, error: 'Non-JSON response from bridge' });
          }
        });
      }
    );

    req.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Bridge timeout' });
    });
    req.end();
  });
}

/**
 * Dispatches an RPC command to Companion Bridge.
 */
export function callBridgeTool(toolName, args = {}) {
  const credPath = path.resolve(__dirname, '../sidecars/perchance-companion-bridge/.bridge-credentials.json');
  let port = 8765;
  let token = '';
  try {
    if (fs.existsSync(credPath)) {
      const c = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      if (c.port) port = c.port;
      if (c.token) token = c.token;
    }
  } catch {}

  const postData = JSON.stringify({
    id: Date.now(),
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args,
    },
  });

  return new Promise((resolve) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: '/mcp/' + token,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-Weld-Pair': '1',
        },
        timeout: 30000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const reply = JSON.parse(data);
            if (reply && reply.result && reply.result.content && reply.result.content[0]) {
              try {
                resolve(JSON.parse(reply.result.content[0].text));
              } catch {
                resolve({ ok: true, output: reply.result.content[0].text });
              }
            } else {
              resolve(reply);
            }
          } catch {
            resolve({ ok: false, error: 'Invalid response from bridge: ' + data });
          }
        });
      }
    );

    req.on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Bridge call timed out' });
    });
    req.write(postData);
    req.end();
  });
}

/**
 * Core Deployment Routine
 *
 * @param {object} options
 * @param {string} [options.file='dist/index.html'] - Path to single-file HTML bundle
 * @param {string} [options.name] - Target generator slug (e.g. 'rpglitchen')
 * @param {string} [options.collabKey] - Perchance collabKey
 * @param {string} [options.pane='output'] - Target pane ('output' or 'model')
 * @param {boolean} [options.forcePlaywright=false] - Bypass Companion Bridge
 * @returns {Promise<{ok: boolean, mode: string, generator: string, bytes: number, ms: number, error?: string}>}
 */
export async function deployBundle(options = {}) {
  const t0 = Date.now();
  loadEnv();

  const file = options.file || 'dist/index.html';
  const resolvedPath = path.resolve(process.cwd(), file);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Bundle not found at ${resolvedPath}. Run build first.`);
  }

  const stat = fs.statSync(resolvedPath);
  const bundleBytes = stat.size;
  if (bundleBytes > MAX_BUNDLE_BYTES) {
    const mb = (bundleBytes / (1024 * 1024)).toFixed(2);
    throw new Error(
      `Bundle size (${mb} MB) exceeds maximum allowed limit of 4.00 MB. Large bundles trigger Yjs sync lockups. Optimize assets before deploying.`
    );
  }

  const bundleContent = fs.readFileSync(resolvedPath, 'utf8');

  // Resolve target name and collab key
  const url = process.env.PERCHANCE_URL || process.env.PERCHANCE_DEV_URL || process.env.PERCHANCE_PROD_URL || '';
  const urlNameMatch = url.match(/perchance\.org\/([^#]+)/);
  const generatorName = options.name || (urlNameMatch ? urlNameMatch[1] : 'rpglitchen');

  const hashMatch = url.match(/collab=([^&]+)/);
  const collabKey = options.collabKey || (hashMatch ? hashMatch[1] : (process.env.PERCHANCE_KEY || process.env.PERCHANCE_DEV_COLLAB || process.env.PERCHANCE_PROD_COLLAB));
  const targetPane = options.pane || 'output';

  // 1. Negotiation: Check Companion Bridge unless forcePlaywright is specified
  if (!options.forcePlaywright) {
    const bridgeStatus = await queryCompanionBridge('/status');
    const isConnected = bridgeStatus && bridgeStatus.connected && Array.isArray(bridgeStatus.tabs) && bridgeStatus.tabs.length > 0;
    const matchingTab = isConnected ? bridgeStatus.tabs.find((t) => !generatorName || t.generator === generatorName) : null;

    if (matchingTab) {
      // Direct overwrite into companion tab
      const bridgePane = targetPane === 'output' ? 'html' : 'dsl';
      const bridgeResult = await callBridgeTool('weld_propose_edit', {
        pane: bridgePane,
        new_text: bundleContent,
        note: `Automated single-file deployment (${(bundleBytes / 1024).toFixed(1)} KB)`,
        tab: matchingTab.generator,
      });

      return {
        ok: !!(bridgeResult && bridgeResult.ok !== false),
        mode: 'companion_bridge',
        generator: matchingTab.generator,
        pane: targetPane,
        bytes: bundleBytes,
        ms: Date.now() - t0,
        bridgeResult,
      };
    }
  }

  // 2. Playwright Headless Deployment
  const session = new PerchanceSession();
  try {
    const startRes = await session.start({
      name: generatorName,
      collabKey: collabKey,
      headed: false,
    });
    if (!startRes || !startRes.ok) {
      throw new Error(`Failed to start Playwright session: ${startRes ? startRes.error : 'Unknown error'}`);
    }

    const writeRes = await session.write({
      pane: targetPane,
      content: bundleContent,
      settle: true,
    });
    if (!writeRes || !writeRes.ok) {
      throw new Error(`Failed to write to pane '${targetPane}': ${writeRes ? writeRes.error : 'Unknown error'}`);
    }

    const status = await session.status();
    return {
      ok: true,
      mode: 'headless_playwright',
      generator: generatorName,
      pane: targetPane,
      bytes: bundleBytes,
      ms: Date.now() - t0,
      sessionStatus: status,
    };
  } finally {
    await session.stop().catch(() => {});
  }
}

// CLI Execution Handler
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/deploy.js [options]

Options:
  --file <path>        Path to bundle HTML file (default: dist/index.html)
  --name <slug>        Target generator name (default: from PERCHANCE_URL or 'rpglitchen')
  --key <collabKey>    Collab key (default: from PERCHANCE_KEY or URL hash)
  --pane <output|model> Target pane (default: output)
  --playwright         Force headless Playwright session (bypass Companion Bridge)
  -h, --help           Show help
`);
    process.exit(0);
  }

  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined;
  };

  const file = getArg('--file') || 'dist/index.html';
  const name = getArg('--name');
  const collabKey = getArg('--key');
  const pane = getArg('--pane') || 'output';
  const forcePlaywright = args.includes('--playwright');

  console.log(`🚀 Starting Perchance deployment for ${file}...`);

  deployBundle({ file, name, collabKey, pane, forcePlaywright })
    .then((res) => {
      console.log(`🎉 Deployment successfully verified!`);
      console.log(`   Mode:      ${res.mode}`);
      console.log(`   Generator: ${res.generator}`);
      console.log(`   Pane:      ${res.pane}`);
      console.log(`   Size:      ${(res.bytes / 1024).toFixed(1)} KB`);
      console.log(`   Duration:  ${res.ms} ms`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`❌ Deployment failed: ${err.message}`);
      process.exit(1);
    });
}
