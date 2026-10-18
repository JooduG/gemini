#!/usr/bin/env node
/**
 * 🛠️ SVELTE 5 COMPLIANCE & AUTOFIX HARNESS
 * -----------------------------------------------------------------------------
 * Provides dual-mode Svelte 5 validation:
 *   1. Single File: node svelte-autofix.js <path-to-file.svelte>
 *   2. Batch Sweep: node svelte-autofix.js [directory] (defaults to ./src)
 *
 * Scans `.svelte` files for legacy Svelte 4 regressions and passes them through
 * the official `@sveltejs/mcp` AST autofixer engine.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT_DIR = process.cwd();
const targetArg = process.argv[2];

// Dynamically resolve 'ignore' from project node_modules or provide fallback
let ignoreFactory = null;
try {
  const localIgnorePath = path.join(
    ROOT_DIR,
    "node_modules",
    "ignore",
    "index.js",
  );
  if (fs.existsSync(localIgnorePath)) {
    const imported = await import(pathToFileURL(localIgnorePath).href);
    ignoreFactory = imported.default || imported;
  }
} catch {
  // Ignore fallback
}

const ig = ignoreFactory
  ? ignoreFactory()
  : { ignores: () => false, add: () => {} };
const gitignorePath = path.join(ROOT_DIR, ".gitignore");
if (fs.existsSync(gitignorePath)) {
  ig.add(fs.readFileSync(gitignorePath, "utf-8"));
}

/**
 * Collects all .svelte files from a target file or directory recursively.
 * @param {string} target
 * @returns {string[]}
 */
function collectSvelteFiles(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    return target.endsWith(".svelte") ? [target] : [];
  }

  const results = [];
  const items = fs.readdirSync(target);
  for (const item of items) {
    const fullPath = path.join(target, item);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, "/");
    if (
      ig.ignores(relPath) ||
      relPath.includes("node_modules") ||
      relPath.includes(".git")
    )
      continue;

    try {
      const childStat = fs.statSync(fullPath);
      if (childStat.isDirectory()) {
        results.push(...collectSvelteFiles(fullPath));
      } else if (fullPath.endsWith(".svelte")) {
        results.push(fullPath);
      }
    } catch {
      continue;
    }
  }
  return results;
}

// Resolve target files
let filesToProcess = [];
if (targetArg && fs.existsSync(targetArg)) {
  filesToProcess = collectSvelteFiles(targetArg);
} else if (targetArg && targetArg.endsWith(".svelte")) {
  filesToProcess = [targetArg];
} else {
  const defaultDir = path.join(ROOT_DIR, "src");
  filesToProcess = collectSvelteFiles(defaultDir);
}

if (filesToProcess.length === 0) {
  console.log("No .svelte files found to verify.");
  process.exit(0);
}

console.log(
  `\n================================================================================`,
);
console.log(`🔧 SVELTE 5 AUTOFIXER: ${filesToProcess.length} file(s) targeted`);
console.log(
  `================================================================================\n`,
);

let totalSuggestions = 0;
let errors = 0;

for (const file of filesToProcess) {
  const normalizedPath = file.replace(/\\/g, "/");
  try {
    const output = execSync(
      `npx @sveltejs/mcp svelte-autofixer "${normalizedPath}" --svelte-version 5`,
      { encoding: "utf-8", timeout: 30000, stdio: ["pipe", "pipe", "pipe"] },
    );

    // Look for suggestions or issues in JSON output
    if (
      output.includes('"suggestions": [') &&
      !output.includes('"suggestions": []')
    ) {
      console.log(`⚠️  ${normalizedPath}`);
      console.log(output.trim() + "\n");
      totalSuggestions++;
    }
  } catch (error) {
    console.error(`❌ Failed on ${normalizedPath}:`, error.message);
    errors++;
  }
}

console.log(
  `--------------------------------------------------------------------------------`,
);
console.log(
  `📊 BATCH AUDIT COMPLETE: ${filesToProcess.length} files scanned, ${totalSuggestions} with suggestions, ${errors} errors.`,
);
console.log(
  `--------------------------------------------------------------------------------\n`,
);

if (errors > 0) {
  process.exit(1);
}
