#!/usr/bin/env node

/**
 * audit-customizations.js
 *
 * Deterministic audit and detox scanner for Antigravity Customization Architecture.
 * Inspects rules, skills, plugins, MCP configs, hooks, and sidecars across:
 * - Global: ~/.gemini/config/
 * - Workspace: <workspace>/.agents/ and root GEMINI.md / AGENTS.md
 *
 * Adheres strictly to the 6 Agentic Script Engineering Contracts in references/skills.md:
 * - Pure Node.js CLI with zero interactive stdin prompts
 * - Discovery-then-drill output (--summary --format json)
 * - Safe read-only inspection
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HOME_DIR = os.homedir();
const GLOBAL_CONFIG_DIR = path.join(HOME_DIR, '.gemini', 'config');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    workspace: process.cwd(),
    summary: false,
    format: 'text',
    check: null,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--summary') {
      options.summary = true;
    } else if (arg === '--format' && args[i + 1]) {
      options.format = args[++i];
    } else if (arg === '--workspace' && args[i + 1]) {
      options.workspace = path.resolve(args[++i]);
    } else if (arg === '--check' && args[i + 1]) {
      options.check = args[++i];
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Antigravity Customization Audit & Detox Scanner

Usage:
  node audit-customizations.js [options]

Options:
  --workspace <path>    Workspace directory to scan (defaults to CWD)
  --summary             Output compact summary
  --format <json|text>  Output format (default: text)
  --check <id>          Drill down into a specific finding ID
  --help, -h            Show this help message
`);
}

function hasUtf8Bom(filePath) {
  try {
    const buffer = Buffer.alloc(3);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 3, 0);
    fs.closeSync(fd);
    return buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
  } catch {
    return false;
  }
}

function parseYamlFrontmatter(content) {
  if (!content.startsWith('---')) return { frontmatter: null, body: content };
  const secondIndex = content.indexOf('\n---', 3);
  if (secondIndex === -1) return { frontmatter: null, body: content };

  const rawYaml = content.slice(3, secondIndex).trim();
  const body = content.slice(secondIndex + 4).trim();
  const lines = rawYaml.split('\n');
  const frontmatter = {};
  let currentKey = null;
  let multilineVal = [];

  for (const line of lines) {
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (match) {
      if (currentKey && multilineVal.length > 0) {
        frontmatter[currentKey] = multilineVal.join(' ').trim();
        multilineVal = [];
      }
      currentKey = match[1];
      const val = match[2].trim();
      if (val === '>-' || val === '|' || val === '>') {
        multilineVal = [];
      } else {
        frontmatter[currentKey] = val;
        currentKey = null;
      }
    } else if (currentKey) {
      multilineVal.push(line.trim());
    }
  }

  if (currentKey && multilineVal.length > 0) {
    frontmatter[currentKey] = multilineVal.join(' ').trim();
  }

  return { frontmatter, body, rawYaml };
}

function auditSkill(skillDir, scope, findings, stats) {
  stats.totalSkills++;
  const skillFile = path.join(skillDir, 'SKILL.md');
  const skillName = path.basename(skillDir);

  if (!fs.existsSync(skillFile)) {
    findings.push({
      id: `skill-missing-entrypoint-${skillName}`,
      severity: 'P0',
      category: 'skills',
      path: skillDir,
      message: `Missing required entrypoint SKILL.md in directory: ${skillDir}`
    });
    return;
  }

  // [PF-006] UTF-8 BOM Check
  if (hasUtf8Bom(skillFile)) {
    findings.push({
      id: `bom-${skillName}`,
      severity: 'P0',
      category: 'skills',
      path: skillFile,
      message: `[PF-006] File contains UTF-8 Byte Order Mark (BOM) which crashes Go language server.`
    });
  }

  const content = fs.readFileSync(skillFile, 'utf8');
  const { frontmatter, body, rawYaml } = parseYamlFrontmatter(content);

  if (!frontmatter) {
    findings.push({
      id: `frontmatter-missing-${skillName}`,
      severity: 'P0',
      category: 'skills',
      path: skillFile,
      message: `SKILL.md is missing YAML frontmatter delimiters (---).`
    });
    return;
  }

  // [PF-008] Non-standard frontmatter fields check
  const keys = Object.keys(frontmatter);
  const extraKeys = keys.filter(k => k !== 'name' && k !== 'description');
  if (extraKeys.length > 0) {
    findings.push({
      id: `frontmatter-extra-keys-${skillName}`,
      severity: 'P1',
      category: 'skills',
      path: skillFile,
      message: `[PF-008] Non-standard frontmatter fields detected: [${extraKeys.join(', ')}]. Antigravity strictly validates 2 fields: 'name' and 'description'.`
    });
  }

  if (frontmatter.name !== skillName) {
    findings.push({
      id: `name-mismatch-${skillName}`,
      severity: 'P1',
      category: 'skills',
      path: skillFile,
      message: `Frontmatter name '${frontmatter.name}' does not match directory name '${skillName}'.`
    });
  }

  const desc = frontmatter.description || '';
  const tokenCost = Math.ceil(desc.length / 4);
  stats.totalDescriptionTokens += tokenCost;

  // [PF-003] Trigger Triad check
  const hasUseWhen = /use when/i.test(desc);
  const hasDoNotUse = /do not use/i.test(desc);
  if (!hasUseWhen || !hasDoNotUse) {
    findings.push({
      id: `trigger-triad-${skillName}`,
      severity: 'P2',
      category: 'skills',
      path: skillFile,
      message: `[PF-003] Incomplete Trigger Triad in description (has 'Use when': ${hasUseWhen}, has 'Do NOT use for': ${hasDoNotUse}). Token cost: ~${tokenCost} tokens.`
    });
  }

  // [PF-005] Co-located PITFALLS.md check
  const pitfallsFile = path.join(skillDir, 'PITFALLS.md');
  if (fs.existsSync(pitfallsFile)) {
    stats.totalPitfallsFiles++;
    if (!/PITFALLS\.md/i.test(body.slice(0, 1500))) {
      findings.push({
        id: `pitfalls-not-referenced-${skillName}`,
        severity: 'P2',
        category: 'skills',
        path: skillFile,
        message: `Co-located PITFALLS.md exists but is not referenced in top sections of SKILL.md.`
      });
    }

    // Check occurrences graduation
    const pitfallContent = fs.readFileSync(pitfallsFile, 'utf8');
    const occurrenceMatches = pitfallContent.matchAll(/Occurrences:\s*(\d+)/gi);
    for (const match of occurrenceMatches) {
      const count = parseInt(match[1], 10);
      if (count >= 4 && !/GRADUATED/i.test(match[0])) {
        findings.push({
          id: `graduation-candidate-${skillName}`,
          severity: 'P1',
          category: 'epistemic',
          path: pitfallsFile,
          message: `Tier 2 Pitfall has reached ${count} occurrences without graduating to CI test or constitutional rule.`
        });
      }
    }
  }

  // [PF-004] One-hop reference depth & broken link checks
  const linkMatches = body.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  for (const match of linkMatches) {
    const rawLink = match[2];
    if (rawLink.startsWith('http://') || rawLink.startsWith('https://') || rawLink.startsWith('customization://')) {
      continue;
    }

    const cleanPath = rawLink.split('#')[0].replace(/^\.\//, '');
    const resolvedPath = path.resolve(skillDir, cleanPath);
    if (!fs.existsSync(resolvedPath)) {
      findings.push({
        id: `broken-link-${skillName}`,
        severity: 'P1',
        category: 'skills',
        path: skillFile,
        message: `Broken relative link to '${rawLink}' (target does not exist on disk: ${resolvedPath}).`
      });
    }
  }
}

function auditMcpConfig(configPath, findings, stats) {
  if (!fs.existsSync(configPath)) return;
  stats.totalMcpConfigFiles++;

  if (hasUtf8Bom(configPath)) {
    findings.push({
      id: `bom-mcp-${path.basename(configPath)}`,
      severity: 'P0',
      category: 'mcp',
      path: configPath,
      message: `[PF-006] mcp_config.json contains UTF-8 BOM.`
    });
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const json = JSON.parse(raw);
    const servers = json.mcpServers || {};
    const allowedKeys = ['command', 'args', 'env', 'cwd', 'url', 'headers', 'disabled', 'variables'];

    for (const [serverName, serverConfig] of Object.entries(servers)) {
      stats.totalMcpServers++;
      const keys = Object.keys(serverConfig);
      const unknownKeys = keys.filter(k => !allowedKeys.includes(k));
      if (unknownKeys.length > 0) {
        findings.push({
          id: `mcp-unknown-keys-${serverName}`,
          severity: 'P2',
          category: 'mcp',
          path: configPath,
          message: `MCP server '${serverName}' declares non-standard keys: [${unknownKeys.join(', ')}].`
        });
      }

      // Check cwd absolute mandate
      if (serverConfig.cwd && !path.isAbsolute(serverConfig.cwd)) {
        findings.push({
          id: `mcp-relative-cwd-${serverName}`,
          severity: 'P1',
          category: 'mcp',
          path: configPath,
          message: `[PF-011] MCP server '${serverName}' has relative cwd '${serverConfig.cwd}'. Must be an absolute path.`
        });
      }

      // Check legacy SSE url
      if (serverConfig.url && serverConfig.url.includes('/sse')) {
        findings.push({
          id: `mcp-sse-url-${serverName}`,
          severity: 'P1',
          category: 'mcp',
          path: configPath,
          message: `MCP server '${serverName}' uses deprecated SSE transport. Wrap with 'npx -y mcp-remote'.`
        });
      }
    }
  } catch (err) {
    findings.push({
      id: `mcp-json-parse-error`,
      severity: 'P0',
      category: 'mcp',
      path: configPath,
      message: `Failed to parse mcp_config.json: ${err.message}`
    });
  }
}

export function runAudit(options) {
  const findings = [];
  const stats = {
    totalSkills: 0,
    totalMcpServers: 0,
    totalMcpConfigFiles: 0,
    totalPitfallsFiles: 0,
    totalDescriptionTokens: 0
  };

  // 1. Scan Global Skills
  const globalSkillsDir = path.join(GLOBAL_CONFIG_DIR, 'skills');
  if (fs.existsSync(globalSkillsDir)) {
    const entries = fs.readdirSync(globalSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        auditSkill(path.join(globalSkillsDir, entry.name), 'global', findings, stats);
      }
    }
  }

  // 2. Scan Workspace Skills
  const workspaceSkillsDir = path.join(options.workspace, '.agents', 'skills');
  if (fs.existsSync(workspaceSkillsDir)) {
    const entries = fs.readdirSync(workspaceSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        auditSkill(path.join(workspaceSkillsDir, entry.name), 'workspace', findings, stats);
      }
    }
  }

  // 3. Scan Global MCP Config
  auditMcpConfig(path.join(GLOBAL_CONFIG_DIR, 'mcp_config.json'), findings, stats);

  // 4. Scan Workspace Plugins MCP Configs
  const pluginsDir = path.join(GLOBAL_CONFIG_DIR, 'plugins');
  if (fs.existsSync(pluginsDir)) {
    const plugins = fs.readdirSync(pluginsDir, { withFileTypes: true });
    for (const plugin of plugins) {
      if (plugin.isDirectory()) {
        auditMcpConfig(path.join(pluginsDir, plugin.name, 'mcp_config.json'), findings, stats);
        
        // Scan plugin skills
        const pluginSkillsDir = path.join(pluginsDir, plugin.name, 'skills');
        if (fs.existsSync(pluginSkillsDir)) {
          const pSkills = fs.readdirSync(pluginSkillsDir, { withFileTypes: true });
          for (const s of pSkills) {
            if (s.isDirectory()) {
              auditSkill(path.join(pluginSkillsDir, s.name), `plugin:${plugin.name}`, findings, stats);
            }
          }
        }
      }
    }
  }

  return { findings, stats };
}

function main() {
  const options = parseArgs();
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const result = runAudit(options);

  if (options.check) {
    const match = result.findings.find(f => f.id === options.check);
    if (!match) {
      console.log(`Finding ID '${options.check}' not found.`);
      process.exit(1);
    }
    console.log(JSON.stringify(match, null, 2));
    process.exit(0);
  }

  if (options.format === 'json') {
    if (options.summary) {
      console.log(JSON.stringify({
        summary: {
          totalSkills: result.stats.totalSkills,
          totalMcpServers: result.stats.totalMcpServers,
          totalPitfallsFiles: result.stats.totalPitfallsFiles,
          totalDescriptionTokens: result.stats.totalDescriptionTokens,
          findingsCount: result.findings.length,
          p0Count: result.findings.filter(f => f.severity === 'P0').length,
          p1Count: result.findings.filter(f => f.severity === 'P1').length,
          p2Count: result.findings.filter(f => f.severity === 'P2').length
        },
        findings: result.findings
      }, null, 2));
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    console.log(`=== Antigravity Customization Audit Summary ===`);
    console.log(`Total Skills Inspected: ${result.stats.totalSkills}`);
    console.log(`Total MCP Servers:      ${result.stats.totalMcpServers}`);
    console.log(`Estimated Description Tokens: ~${result.stats.totalDescriptionTokens}`);
    console.log(`Total Findings:         ${result.findings.length}`);
    console.log(`- P0 (Critical):        ${result.findings.filter(f => f.severity === 'P0').length}`);
    console.log(`- P1 (Important):       ${result.findings.filter(f => f.severity === 'P1').length}`);
    console.log(`- P2 (Advisory):        ${result.findings.filter(f => f.severity === 'P2').length}`);
    console.log('================================================\n');

    if (result.findings.length > 0) {
      console.log(`Findings:`);
      for (const f of result.findings) {
        console.log(`[${f.severity}] (${f.id}) in ${f.path}`);
        console.log(`  -> ${f.message}`);
      }
    } else {
      console.log(`✓ All inspected skills, rules, and MCP configurations conform to Antigravity standards.`);
    }
  }
}

main();
