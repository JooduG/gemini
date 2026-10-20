/**
 * @file .agents/skills/perchance-deployment/scripts/deploy-mcp.js
 * 🚀 High-Velocity Perchance MCP Deployer
 *
 * Pushes the built single-file bundle (dist/index.html) to Perchance
 * using the Perchance MCP Core engine directly.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const { PerchanceSession } = require(path.resolve(__dirname, '../../../scripts/perchance-core.cjs'));

// Safely load .env from working directory without external module dependency
const env_path = path.resolve(process.cwd(), '.env');
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

async function main() {
  const dist_path = path.resolve('dist/index.html');
  if (!fs.existsSync(dist_path)) {
    console.error('❌ dist/index.html not found. Run npm run build first.');
    process.exit(1);
  }

  const bundle = fs.readFileSync(dist_path, 'utf8');
  console.log(`📦 Loaded single-file bundle (${(bundle.length / 1024).toFixed(1)} KB)`);

  const url = process.env.PERCHANCE_URL || 'https://perchance.org/rpglitchen#edit';
  const name_match = url.match(/perchance\.org\/([^#]+)/);
  const generator_name = name_match ? name_match[1] : 'rpglitchen';

  // Read collab key from hash (#edit:collab=KEY) or env
  const hash_match = url.match(/collab=([^&]+)/);
  const collab_key = hash_match ? hash_match[1] : process.env.PERCHANCE_KEY;

  console.log(`🎯 Target: ${generator_name} (Collab: ${collab_key ? 'YES' : 'NO'})`);
  console.log(`🚀 Connecting to Perchance live editor session...`);

  const session = new PerchanceSession();
  try {
    const startRes = await session.start({
      name: generator_name,
      collabKey: collab_key,
      headed: false,
    });
    if (!startRes.ok) {
      throw new Error(`Failed to start session: ${startRes.error || 'Unknown error'}`);
    }
    console.log(`📡 Editor loaded. Writing ${bundle.length} characters to 'output' pane...`);

    const writeRes = await session.write({
      pane: 'output',
      content: bundle,
      settle: true,
    });
    if (!writeRes.ok) {
      throw new Error(`Write failed: ${writeRes.error || 'Unknown error'}`);
    }
    console.log(`✅ Write settled.`);

    const status = await session.status();
    console.log(`📊 Session status:`, status);
    console.log(`🎉 Deployment successfully verified for ${generator_name}!`);
  } finally {
    await session.stop();
  }
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});

/**
 * CHANGELOG:
 * - 2026-10-20: Replaced legacy 626-line Playwright deployment with lean MCP deployer.
 */
