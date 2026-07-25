#!/usr/bin/env node
/**
 * Automated Svelte 5 Compliance & Lint Verification Script
 * Executes Svelte MCP autofixer CLI pass with Unix path normalization and timeout protection.
 */
import { execSync } from "node:child_process";

const targetFile = process.argv[2];

if (!targetFile) {
  console.error(" Error: Target file path required.");
  console.log("Usage: node scripts/svelte-autofix.js <path-to-file.svelte>");
  process.exit(1);
}

const normalizedPath = targetFile.replace(/\\/g, "/");

console.log(
  ` Executing Svelte 5 Compliance Verification on: ${normalizedPath}`,
);

try {
  const output = execSync(
    `npx @sveltejs/mcp svelte-autofixer "${normalizedPath}" --svelte-version 5`,
    { encoding: "utf-8", timeout: 30000 },
  );
  console.log(output);
  console.log(" Component certified for Svelte 5 Rune compliance.");
} catch (error) {
  console.error(" Svelte 5 compliance audit failed with errors:");
  console.error(error.stdout || error.message);
  process.exit(1);
}
