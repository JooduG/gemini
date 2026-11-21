#!/usr/bin/env node

/**
 * audit-customizations.js
 *
 * Deterministic 5-Tier audit, telemetry, and detox scanner for Antigravity Customization Architecture.
 * Inspects Rules, Skills, Plugins, Subagents, References, Scripts, Hooks, and MCP configs across:
 * - Tier 1: Rules (~/.gemini/GEMINI.md, <workspace>/GEMINI.md, plugins/<name>/rules/AGENTS.md)
 * - Tier 2: Global Skills (~/.gemini/config/skills/)
 * - Tier 3: Workspace Skills (<workspace>/.agents/skills/)
 * - Tier 4: Installed Plugins (~/.gemini/config/plugins/)
 * - Tier 5: Built-in Baseline Skills (~/.gemini/antigravity/builtin/skills/, read-only)
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HOME_DIR = os.homedir();
const GEMINI_ROOT = path.join(HOME_DIR, '.gemini');
const GLOBAL_CONFIG_DIR = path.join(GEMINI_ROOT, 'config');
const BUILTIN_SKILLS_DIR = path.join(GEMINI_ROOT, 'antigravity', 'builtin', 'skills');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    workspace: process.cwd(),
    summary: false,
    format: 'text',
    check: null,
    out: null,
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
    } else if (arg === '--out' && args[i + 1]) {
      options.out = path.resolve(args[++i]);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Antigravity 5-Tier Customization Audit & Telemetry Scanner

Usage:
  node audit-customizations.js [options]

Options:
  --workspace <path>    Workspace directory to scan (defaults to CWD)
  --summary             Output compact summary to stdout
  --format <json|text>  Output format (default: text)
  --out <filepath>      Write full inventory, stats, and findings JSON to file
  --check <id>          Drill down into a specific finding ID
  --help, -h            Show this help message
`);
}

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

function hasUtf8Bom(filePath) {
  try {
    const buffer = Buffer.alloc(3);
    const fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buffer, 0, 3, 0);
    fs.closeSync(fd);
    return bytesRead >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
  } catch {
    return false;
  }
}

function parseYamlFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---')) return { frontmatter: null, body: normalized };
  const secondIndex = normalized.indexOf('\n---', 3);
  if (secondIndex === -1) return { frontmatter: null, body: normalized };

  const rawYaml = normalized.slice(3, secondIndex).trim();
  const body = normalized.slice(secondIndex + 4).trim();
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
      let val = match[2].trim();
      if (val === '>-' || val === '|' || val === '>' || val === '|-') {
        multilineVal = [];
      } else {
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
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

function extractHeadings(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const headings = [];
  let inCodeFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i + 1
      });
    }
  }
  return headings;
}

function stripFencedCodeBlocks(markdown) {
  return markdown.replace(/\r\n/g, '\n').replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '');
}

function collectMarkdownLinkIssues(baseDir, sourceFile, markdownBody, category, idPrefix, findings, emitFindings = true) {
  const stripped = stripFencedCodeBlocks(markdownBody);
  const linkMatches = stripped.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  const broken = [];

  for (const match of linkMatches) {
    const rawLink = match[2].trim();
    if (
      !rawLink ||
      rawLink.startsWith('http://') ||
      rawLink.startsWith('https://') ||
      rawLink.startsWith('customization://') ||
      rawLink.startsWith('file://') ||
      rawLink.startsWith('#') ||
      rawLink.startsWith('mailto:') ||
      /[\[\]<>]|\$\{|\/absolute\//.test(rawLink)
    ) {
      continue;
    }

    const cleanPath = rawLink.split('#')[0].split('?')[0].replace(/^\.\//, '');
    if (!cleanPath) continue;
    const resolvedPath = path.resolve(baseDir, cleanPath);
    if (!fs.existsSync(resolvedPath)) {
      broken.push({ link: rawLink, resolvedPath });
      if (emitFindings) {
        findings.push({
          id: `broken-link-${idPrefix}`,
          severity: 'P1',
          category,
          path: sourceFile,
          message: `Broken relative link to '${rawLink}' (target does not exist on disk: ${resolvedPath}).`
        });
      }
    }
  }

  return broken;
}

function listFilesRecursive(dirPath, allowedExts = null) {
  if (!fs.existsSync(dirPath)) return [];
  const results = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRecursive(full, allowedExts));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!allowedExts || allowedExts.includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}

function parseJsonc(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const stripped = raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(stripped);
  }
}

function auditRuleFile(ruleInfo, findings, stats, inventory) {
  if (!fs.existsSync(ruleInfo.path)) return;
  stats.totalRules++;

  if (hasUtf8Bom(ruleInfo.path)) {
    findings.push({
      id: `bom-rule-${ruleInfo.id}`,
      severity: 'P0',
      category: 'rules',
      path: ruleInfo.path,
      message: `[PF-006] Rule file contains UTF-8 Byte Order Mark (BOM).`
    });
  }

  const raw = fs.readFileSync(ruleInfo.path, 'utf8').replace(/\r\n/g, '\n');
  const bytes = Buffer.byteLength(raw, 'utf8');
  const lines = raw.split('\n').length;
  const tokensEst = estimateTokens(raw);
  stats.totalRuleTokens += tokensEst;

  const headings = extractHeadings(raw);
  const brokenLinks = collectMarkdownLinkIssues(
    path.dirname(ruleInfo.path),
    ruleInfo.path,
    raw,
    'rules',
    `rule-${ruleInfo.id}`,
    findings,
    true
  );

  inventory.rules.push({
    id: ruleInfo.id,
    name: ruleInfo.name,
    scope: ruleInfo.scope,
    path: ruleInfo.path,
    bytes,
    lines,
    tokensEst,
    headings,
    brokenLinksCount: brokenLinks.length
  });
}

function auditSkill(skillDir, scope, findings, stats, inventory, isReadOnly = false) {
  stats.totalSkills++;
  const skillFile = path.join(skillDir, 'SKILL.md');
  const skillName = path.basename(skillDir);
  const findingsBefore = findings.length;

  if (!fs.existsSync(skillFile)) {
    if (!isReadOnly) {
      findings.push({
        id: `skill-missing-entrypoint-${skillName}`,
        severity: 'P0',
        category: 'skills',
        path: skillDir,
        message: `Missing required entrypoint SKILL.md in directory: ${skillDir}`
      });
    }
    return;
  }

  if (!isReadOnly && hasUtf8Bom(skillFile)) {
    findings.push({
      id: `bom-${skillName}`,
      severity: 'P0',
      category: 'skills',
      path: skillFile,
      message: `[PF-006] File contains UTF-8 Byte Order Mark (BOM) which crashes Go language server.`
    });
  }

  const content = fs.readFileSync(skillFile, 'utf8').replace(/\r\n/g, '\n');
  const { frontmatter, body } = parseYamlFrontmatter(content);

  if (!frontmatter) {
    if (!isReadOnly) {
      findings.push({
        id: `frontmatter-missing-${skillName}`,
        severity: 'P0',
        category: 'skills',
        path: skillFile,
        message: `SKILL.md is missing YAML frontmatter delimiters (---).`
      });
    }
    return;
  }

  const keys = Object.keys(frontmatter);
  const extraKeys = keys.filter(k => k !== 'name' && k !== 'description');
  if (!isReadOnly && extraKeys.length > 0) {
    findings.push({
      id: `frontmatter-extra-keys-${skillName}`,
      severity: 'P1',
      category: 'skills',
      path: skillFile,
      message: `[PF-008] Non-standard frontmatter fields detected: [${extraKeys.join(', ')}]. Antigravity strictly validates 2 fields: 'name' and 'description'.`
    });
  }

  if (!isReadOnly && frontmatter.name !== skillName) {
    findings.push({
      id: `name-mismatch-${skillName}`,
      severity: 'P1',
      category: 'skills',
      path: skillFile,
      message: `Frontmatter name '${frontmatter.name}' does not match directory name '${skillName}'.`
    });
  }

  const desc = frontmatter.description || '';
  const descriptionTokens = estimateTokens(desc);
  const bodyTokens = estimateTokens(body);
  const totalSkillTokens = estimateTokens(content);
  const lines = content.split('\n').length;

  stats.totalDescriptionTokens += descriptionTokens;
  stats.totalSkillBodyTokens += bodyTokens;

  const hasUseWhen = /use when/i.test(desc);
  const hasDoNotUse = /do not use|don't use/i.test(desc);
  if (!isReadOnly && (!hasUseWhen || !hasDoNotUse)) {
    findings.push({
      id: `trigger-triad-${skillName}`,
      severity: 'P2',
      category: 'skills',
      path: skillFile,
      message: `[PF-003] Incomplete Trigger Triad in description (has 'Use when': ${hasUseWhen}, has 'Do NOT use for': ${hasDoNotUse}). Token cost: ~${descriptionTokens} tokens.`
    });
  }

  const pitfallsFile = path.join(skillDir, 'PITFALLS.md');
  const hasPitfalls = fs.existsSync(pitfallsFile);
  let pitfallsTokens = 0;
  if (hasPitfalls) {
    stats.totalPitfallsFiles++;
    const pitfallContent = fs.readFileSync(pitfallsFile, 'utf8').replace(/\r\n/g, '\n');
    pitfallsTokens = estimateTokens(pitfallContent);
    stats.totalReferenceTokens += pitfallsTokens;

    if (!isReadOnly && !/PITFALLS\.md/i.test(body.slice(0, 1500))) {
      findings.push({
        id: `pitfalls-not-referenced-${skillName}`,
        severity: 'P2',
        category: 'skills',
        path: skillFile,
        message: `Co-located PITFALLS.md exists but is not referenced in top sections of SKILL.md.`
      });
    }

    if (!isReadOnly) {
      const occurrenceMatches = pitfallContent.matchAll(/Occurrences:\s*(\d+)([^\n]*)/gi);
      for (const match of occurrenceMatches) {
        const count = parseInt(match[1], 10);
        const restOfLine = match[2] || '';
        if (count >= 4 && !/GRADUATED/i.test(restOfLine)) {
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
  }

  collectMarkdownLinkIssues(skillDir, skillFile, body, 'skills', skillName, findings, !isReadOnly);

  // Inventory references, docs, resources, examples, and scripts
  const refSubdirs = ['references', 'docs', 'resources', 'examples'];
  const references = [];
  for (const sub of refSubdirs) {
    const subPath = path.join(skillDir, sub);
    const files = listFilesRecursive(subPath, ['.md', '.json', '.yaml', '.yml', '.txt']);
    for (const f of files) {
      const text = fs.readFileSync(f, 'utf8');
      const tokensEst = estimateTokens(text);
      stats.totalReferenceTokens += tokensEst;
      references.push({
        relativePath: path.relative(skillDir, f).replace(/\\/g, '/'),
        bytes: Buffer.byteLength(text, 'utf8'),
        tokensEst
      });
    }
  }

  const scriptsDir = path.join(skillDir, 'scripts');
  const scriptFiles = listFilesRecursive(scriptsDir, null);
  const scripts = [];
  for (const sf of scriptFiles) {
    const buf = fs.readFileSync(sf);
    const tokensEst = Math.ceil(buf.length / 4);
    scripts.push({
      relativePath: path.relative(skillDir, sf).replace(/\\/g, '/'),
      bytes: buf.length,
      tokensEst
    });
  }

  const headings = extractHeadings(body);
  const findingsCount = findings.length - findingsBefore;

  inventory.skills.push({
    name: skillName,
    frontmatterName: frontmatter.name || null,
    scope,
    readOnly: isReadOnly,
    path: skillFile,
    description: desc,
    descriptionTokens,
    bodyTokens,
    totalSkillTokens,
    pitfallsTokens,
    referenceTokens: references.reduce((acc, r) => acc + r.tokensEst, 0),
    lines,
    frontmatterKeys: keys,
    hasUseWhen,
    hasDoNotUse,
    hasPitfalls,
    headings,
    references,
    scripts,
    findingsCount
  });
}

function auditPluginAgent(agentFile, pluginName, findings, stats, inventory) {
  stats.totalAgents++;
  const fileName = path.basename(agentFile, '.md');
  if (hasUtf8Bom(agentFile)) {
    findings.push({
      id: `bom-agent-${pluginName}-${fileName}`,
      severity: 'P0',
      category: 'agents',
      path: agentFile,
      message: `[PF-006] Agent persona file contains UTF-8 BOM.`
    });
  }

  const content = fs.readFileSync(agentFile, 'utf8').replace(/\r\n/g, '\n');
  const { frontmatter } = parseYamlFrontmatter(content);
  const tokensEst = estimateTokens(content);
  stats.totalAgentTokens += tokensEst;

  let frontmatterKeys = [];
  let name = fileName;
  let description = '';

  if (frontmatter) {
    frontmatterKeys = Object.keys(frontmatter);
    name = frontmatter.name || fileName;
    description = frontmatter.description || '';
    const extraKeys = frontmatterKeys.filter(k => k !== 'name' && k !== 'description');
    if (extraKeys.length > 0) {
      findings.push({
        id: `agent-frontmatter-extra-${pluginName}-${fileName}`,
        severity: 'P1',
        category: 'agents',
        path: agentFile,
        message: `[PF-008] Non-standard frontmatter fields detected in agent '${fileName}': [${extraKeys.join(', ')}]. Expected strictly 'name' and 'description'.`
      });
    }
  } else {
    findings.push({
      id: `agent-frontmatter-missing-${pluginName}-${fileName}`,
      severity: 'P1',
      category: 'agents',
      path: agentFile,
      message: `Agent persona '${fileName}' is missing YAML frontmatter.`
    });
  }

  inventory.agents.push({
    name,
    fileName,
    plugin: pluginName,
    path: agentFile,
    description,
    frontmatterKeys,
    tokensEst,
    lines: content.split('\n').length
  });
}

function auditMcpConfig(configPath, findings, stats) {
  if (!fs.existsSync(configPath)) return [];
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

  const serverNames = [];
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const json = parseJsonc(raw);
    const servers = json.mcpServers || {};
    const allowedKeys = ['command', 'args', 'env', 'cwd', 'url', 'headers', 'disabled', 'variables', 'serverUrl'];

    for (const [serverName, serverConfig] of Object.entries(servers)) {
      stats.totalMcpServers++;
      serverNames.push(serverName);
      const keys = Object.keys(serverConfig);
      const strictlyAllowed = ['command', 'args', 'env', 'cwd', 'url', 'headers', 'disabled', 'variables'];
      const unknownKeys = keys.filter(k => !strictlyAllowed.includes(k));
      if (unknownKeys.length > 0) {
        findings.push({
          id: `mcp-unknown-keys-${serverName}`,
          severity: 'P2',
          category: 'mcp',
          path: configPath,
          message: `MCP server '${serverName}' declares non-standard keys: [${unknownKeys.join(', ')}].`
        });
      }

      if (serverConfig.cwd && !path.isAbsolute(serverConfig.cwd)) {
        findings.push({
          id: `mcp-relative-cwd-${serverName}`,
          severity: 'P1',
          category: 'mcp',
          path: configPath,
          message: `[PF-011] MCP server '${serverName}' has relative cwd '${serverConfig.cwd}'. Must be an absolute path.`
        });
      }

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

  return serverNames;
}

export function runAudit(options) {
  const findings = [];
  const stats = {
    totalRules: 0,
    totalSkills: 0,
    totalAgents: 0,
    totalPlugins: 0,
    totalMcpServers: 0,
    totalMcpConfigFiles: 0,
    totalPitfallsFiles: 0,
    totalRuleTokens: 0,
    totalDescriptionTokens: 0,
    totalSkillBodyTokens: 0,
    totalReferenceTokens: 0,
    totalAgentTokens: 0
  };

  const inventory = {
    rules: [],
    skills: [],
    agents: [],
    plugins: []
  };

  // Tier 1: Global & Workspace Rules
  auditRuleFile(
    { id: 'global-gemini', name: 'Global GEMINI.md', scope: 'global', path: path.join(GEMINI_ROOT, 'GEMINI.md') },
    findings,
    stats,
    inventory
  );
  auditRuleFile(
    { id: 'workspace-gemini', name: 'Workspace GEMINI.md', scope: 'workspace', path: path.join(options.workspace, 'GEMINI.md') },
    findings,
    stats,
    inventory
  );

  // Check for fragmented rules [PF-005]
  const workspaceRulesDir = path.join(options.workspace, '.agents', 'rules');
  if (fs.existsSync(workspaceRulesDir)) {
    const strayRules = fs.readdirSync(workspaceRulesDir).filter(f => f.endsWith('.md'));
    if (strayRules.length > 0) {
      findings.push({
        id: 'rule-fragmentation-workspace',
        severity: 'P1',
        category: 'rules',
        path: workspaceRulesDir,
        message: `[PF-005] Fragmented workspace rule files detected: [${strayRules.join(', ')}]. Consolidate into root GEMINI.md.`
      });
    }
  }

  // Tier 2: Global Skills
  const globalSkillsDir = path.join(GLOBAL_CONFIG_DIR, 'skills');
  if (fs.existsSync(globalSkillsDir)) {
    const entries = fs.readdirSync(globalSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        auditSkill(path.join(globalSkillsDir, entry.name), 'global', findings, stats, inventory, false);
      }
    }
  }

  // Tier 3: Workspace Skills
  const workspaceSkillsDir = path.join(options.workspace, '.agents', 'skills');
  if (fs.existsSync(workspaceSkillsDir)) {
    const entries = fs.readdirSync(workspaceSkillsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        auditSkill(path.join(workspaceSkillsDir, entry.name), 'workspace', findings, stats, inventory, false);
      }
    }
  }

  // Global MCP Config
  auditMcpConfig(path.join(GLOBAL_CONFIG_DIR, 'mcp_config.json'), findings, stats);

  // Tier 4: Installed Plugins (skills, agents, rules, mcp, hooks)
  const pluginsDir = path.join(GLOBAL_CONFIG_DIR, 'plugins');
  if (fs.existsSync(pluginsDir)) {
    const plugins = fs.readdirSync(pluginsDir, { withFileTypes: true });
    for (const plugin of plugins) {
      if (!plugin.isDirectory()) continue;
      stats.totalPlugins++;
      const pDir = path.join(pluginsDir, plugin.name);
      const manifestPath = path.join(pDir, 'plugin.json');
      let manifest = {};
      if (fs.existsSync(manifestPath)) {
        try {
          manifest = parseJsonc(fs.readFileSync(manifestPath, 'utf8'));
        } catch (err) {
          findings.push({
            id: `plugin-json-error-${plugin.name}`,
            severity: 'P0',
            category: 'plugins',
            path: manifestPath,
            message: `Failed to parse plugin.json: ${err.message}`
          });
        }
      }

      const mcpServers = auditMcpConfig(path.join(pDir, 'mcp_config.json'), findings, stats);

      // Plugin Rules [PF-007]
      const pluginRulesDir = path.join(pDir, 'rules');
      let hasRules = false;
      if (fs.existsSync(pluginRulesDir)) {
        const ruleFiles = fs.readdirSync(pluginRulesDir, { withFileTypes: true }).filter(f => f.isFile());
        for (const rf of ruleFiles) {
          const rPath = path.join(pluginRulesDir, rf.name);
          if (rf.name === 'AGENTS.md' || rf.name === 'GEMINI.md') {
            hasRules = true;
            auditRuleFile(
              {
                id: `plugin-${plugin.name}-${rf.name}`,
                name: `${plugin.name}/rules/${rf.name}`,
                scope: `plugin:${plugin.name}`,
                path: rPath
              },
              findings,
              stats,
              inventory
            );
          } else {
            findings.push({
              id: `plugin-rule-filename-${plugin.name}-${rf.name}`,
              severity: 'P1',
              category: 'rules',
              path: rPath,
              message: `[PF-007] Arbitrary plugin rule filename '${rf.name}'. Scanner requires rules/AGENTS.md.`
            });
          }
        }
      }

      // Plugin Skills
      let skillsCount = 0;
      const pluginSkillsDir = path.join(pDir, 'skills');
      if (fs.existsSync(pluginSkillsDir)) {
        const pSkills = fs.readdirSync(pluginSkillsDir, { withFileTypes: true });
        for (const s of pSkills) {
          if (s.isDirectory()) {
            skillsCount++;
            auditSkill(path.join(pluginSkillsDir, s.name), `plugin:${plugin.name}`, findings, stats, inventory, false);
          }
        }
      }

      // Plugin Subagents
      let agentsCount = 0;
      const pluginAgentsDir = path.join(pDir, 'agents');
      if (fs.existsSync(pluginAgentsDir)) {
        const pAgents = fs.readdirSync(pluginAgentsDir, { withFileTypes: true });
        for (const a of pAgents) {
          if (a.isFile() && a.name.endsWith('.md')) {
            agentsCount++;
            auditPluginAgent(path.join(pluginAgentsDir, a.name), plugin.name, findings, stats, inventory);
          }
        }
      }

      const hasHooks = fs.existsSync(path.join(pDir, 'hooks.json'));

      inventory.plugins.push({
        dir: plugin.name,
        name: manifest.name || plugin.name,
        displayName: manifest.displayName || manifest.name || plugin.name,
        version: manifest.version || null,
        description: manifest.description || '',
        skillsCount,
        agentsCount,
        hasRules,
        hasHooks,
        mcpServers
      });
    }
  }

  // Tier 5: Built-in Baseline Skills (Read-Only)
  if (fs.existsSync(BUILTIN_SKILLS_DIR)) {
    const builtins = fs.readdirSync(BUILTIN_SKILLS_DIR, { withFileTypes: true });
    for (const b of builtins) {
      if (b.isDirectory()) {
        auditSkill(path.join(BUILTIN_SKILLS_DIR, b.name), 'builtin', findings, stats, inventory, true);
      }
    }
  }

  return { findings, stats, inventory };
}

function buildSummary(result) {
  return {
    totalRules: result.stats.totalRules,
    totalSkills: result.stats.totalSkills,
    totalAgents: result.stats.totalAgents,
    totalPlugins: result.stats.totalPlugins,
    totalMcpServers: result.stats.totalMcpServers,
    totalPitfallsFiles: result.stats.totalPitfallsFiles,
    totalRuleTokens: result.stats.totalRuleTokens,
    totalDescriptionTokens: result.stats.totalDescriptionTokens,
    totalSkillBodyTokens: result.stats.totalSkillBodyTokens,
    totalReferenceTokens: result.stats.totalReferenceTokens,
    totalAgentTokens: result.stats.totalAgentTokens,
    findingsCount: result.findings.length,
    p0Count: result.findings.filter(f => f.severity === 'P0').length,
    p1Count: result.findings.filter(f => f.severity === 'P1').length,
    p2Count: result.findings.filter(f => f.severity === 'P2').length
  };
}

function main() {
  const options = parseArgs();
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const result = runAudit(options);
  const summary = buildSummary(result);

  if (options.out) {
    fs.mkdirSync(path.dirname(options.out), { recursive: true });
    fs.writeFileSync(
      options.out,
      JSON.stringify({ generatedAt: new Date().toISOString(), workspace: options.workspace, summary, stats: result.stats, inventory: result.inventory, findings: result.findings }, null, 2),
      'utf8'
    );
  }

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
      console.log(JSON.stringify({ summary, findings: result.findings }, null, 2));
    } else {
      console.log(JSON.stringify({ summary, stats: result.stats, inventory: result.inventory, findings: result.findings }, null, 2));
    }
  } else {
    console.log(`=== Antigravity 5-Tier Customization Audit Summary ===`);
    console.log(`Rules Inspected:        ${summary.totalRules} (~${summary.totalRuleTokens} tokens always-on)`);
    console.log(`Skills Inspected:       ${summary.totalSkills} (~${summary.totalDescriptionTokens} L1 desc tokens, ~${summary.totalSkillBodyTokens} L2 body tokens)`);
    console.log(`Reference/Pitfall Toks: ~${summary.totalReferenceTokens} tokens`);
    console.log(`Plugins / Subagents:    ${summary.totalPlugins} plugins, ${summary.totalAgents} subagents (~${summary.totalAgentTokens} tokens)`);
    console.log(`Total MCP Servers:      ${summary.totalMcpServers}`);
    console.log(`Total Findings:         ${summary.findingsCount} (P0: ${summary.p0Count}, P1: ${summary.p1Count}, P2: ${summary.p2Count})`);
    console.log('======================================================\n');

    if (result.findings.length > 0) {
      console.log(`Findings:`);
      for (const f of result.findings) {
        console.log(`[${f.severity}] (${f.id}) in ${f.path}`);
        console.log(`  -> ${f.message}`);
      }
    } else {
      console.log(`✓ All inspected rules, skills, plugins, and MCP configurations conform to Antigravity standards.`);
    }
  }
}

main();
