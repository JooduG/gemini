#!/usr/bin/env node

/**
 * @file C:\Users\johng\.gemini\config\skills\swarm\scripts\swarm-mcp.js
 * 🐝 SWARM MCP SERVER — Sovereign Fleet Coordination Module
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { jules } from "@google/jules-sdk";
import { Octokit } from "octokit";
import { findUpSync } from "find-up";
import "dotenv/config";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const execFileAsync = promisify(execFile);

// --- Git Utilities ---

async function getGitRepoInfo(projectPath) {
  const { stdout } = await execFileAsync("git", ["remote", "get-url", "origin"], { cwd: projectPath });
  const remoteUrl = stdout.trim();
  return parseGitRemoteUrl(remoteUrl);
}

function parseGitRemoteUrl(remoteUrl) {
  const sshMatch = remoteUrl.match(/git@github\.com:([^/]+)\/(.+?)(\.git)?$/);
  if (sshMatch) {
    const [, owner, repo] = sshMatch;
    return {
      owner,
      repo: repo.replace(/\.git$/, ""),
      fullName: `${owner}/${repo.replace(/\.git$/, "")}`,
    };
  }
  const httpsMatch = remoteUrl.match(/https?:\/\/github\.com\/([^/]+)\/(.+?)(\.git)?$/);
  if (httpsMatch) {
    const [, owner, repo] = httpsMatch;
    return {
      owner,
      repo: repo.replace(/\.git$/, ""),
      fullName: `${owner}/${repo.replace(/\.git$/, "")}`,
    };
  }
  throw new Error(`Unable to parse git remote URL: ${remoteUrl}`);
}

async function getCurrentBranch(projectPath) {
  const { stdout } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: projectPath });
  return stdout.trim();
}

async function getGitContext(projectPath) {
  const { stdout: log } = await execFileAsync("git", ["log", "--oneline", "-n", "20", "--stat"], { cwd: projectPath });
  const { stdout: show } = await execFileAsync("git", ["show", "HEAD"], { cwd: projectPath });
  return `--- GIT LOG ---\n${log}\n\n--- GIT SHOW HEAD ---\n${show}`;
}

function getGitRoot(projectPath) {
  const git_marker = findUpSync(".git", { cwd: projectPath });
  if (!git_marker) {
    throw new Error(`Could not find .git directory starting from: ${projectPath}`);
  }
  return path.dirname(git_marker);
}

// --- Date Formatter ---

function getFormattedDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" })
    .format(date)
    .replaceAll("-", "_");
}

async function getSwarmDir(projectPath) {
  const root = getGitRoot(projectPath);
  const today = getFormattedDate();

  if (process.env.SWARM_DIR) {
    return path.isAbsolute(process.env.SWARM_DIR)
      ? process.env.SWARM_DIR
      : path.join(root, process.env.SWARM_DIR);
  }

  const swarm_base = path.join(root, ".agents", "archive", "swarm");
  const today_dir = path.join(swarm_base, today);

  try {
    const entries = await fs.readdir(swarm_base, { withFileTypes: true });
    const date_dirs = entries
      .filter((d) => d.isDirectory() && /^\d{4}_\d{2}_\d{2}$/.test(d.name))
      .map((d) => d.name)
      .sort((a, b) => b.localeCompare(a));

    if (date_dirs.length > 0) {
      const latest = date_dirs[0];
      return path.join(swarm_base, latest);
    }
  } catch (err) {
    // ignore
  }

  return today_dir;
}

// --- GitHub Issues ---

async function getIssues(projectPath) {
  const repoInfo = await getGitRepoInfo(projectPath);
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
  const { data } = await octokit.rest.issues.listForRepo({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    state: "open",
    per_page: 30,
  });
  return data.filter((issue) => !issue.pull_request);
}

function toIssueMarkdown(issue) {
  const labels = issue.labels.map((l) => (typeof l === "string" ? l : l.name)).filter(Boolean);
  const assignees = (issue.assignees ?? []).map((a) => a.login);
  const reactions = issue.reactions;

  const lines = [
    `## #${issue.number}: ${issue.title}`,
    ``,
    `🔗 ${issue.html_url}`,
    ``,
    `| Field | Value |`,
    `|-----|-----|`,
    `| **Author** | ${issue.user?.login ?? "unknown"} |`,
    `| **Association** | ${issue.author_association} |`,
    `| **State** | ${issue.state}${issue.state_reason ? ` (${issue.state_reason})` : ""} |`,
    `| **Locked** | ${issue.locked}${issue.active_lock_reason ? ` — ${issue.active_lock_reason}` : ""} |`,
    `| **Comments** | ${issue.comments} |`,
    `| **Created** | ${issue.created_at} |`,
    `| **Updated** | ${issue.updated_at} |`,
  ];

  if (issue.closed_at) lines.push(`| **Closed** | ${issue.closed_at} |`);
  if (issue.closed_by) lines.push(`| **Closed by** | ${issue.closed_by.login} |`);
  if (labels.length) lines.push(`| **Labels** | ${labels.map((l) => `\`${l}\``).join(", ")} |`);
  if (assignees.length) lines.push(`| **Assignees** | ${assignees.join(", ")} |`);
  if (issue.milestone) lines.push(`| **Milestone** | ${issue.milestone.title} |`);
  if (issue.draft) lines.push(`| **Draft** | true |`);
  if (issue.pull_request) lines.push(`| **Type** | Pull Request |`);
  if (reactions) {
    const rxn = [
      reactions["+1"] && `👍 ${reactions["+1"]}`,
      reactions["-1"] && `👎 ${reactions["-1"]}`,
      reactions.laugh && `😄 ${reactions.laugh}`,
      reactions.hooray && `🎉 ${reactions.hooray}`,
      reactions.confused && `😕 ${reactions.confused}`,
      reactions.heart && `❤️ ${reactions.heart}`,
      reactions.rocket && `🚀 ${reactions.rocket}`,
      reactions.eyes && `👀 ${reactions.eyes}`,
    ].filter(Boolean);
    if (rxn.length) lines.push(`| **Reactions** | ${rxn.join("  ")} |`);
  }

  lines.push(``);
  if (issue.body) lines.push(`### Description`, ``, issue.body.trim(), ``);
  lines.push(`---`, ``);
  return lines.join("\n");
}

async function getIssuesAsMarkdown(projectPath) {
  const issues = await getIssues(projectPath);
  const repoInfo = await getGitRepoInfo(projectPath);
  const lines = [
    `# Open Issues — ${repoInfo.fullName}`,
    ``,
    `> ${issues.length} issues fetched on ${new Date().toISOString()}`,
    ``,
    `---`,
    ``,
    ...issues.map(toIssueMarkdown),
  ];
  return lines.join("\n");
}

// --- Prompts ---

function analyzeIssuesPrompt({ issuesMarkdown, repoFullName }) {
  return `Analyze ${repoFullName} open issues and produce implementation tasks.

You are a senior software engineer performing deep technical triage on GitHub issues from a single repository. You have access to the full codebase. Your job is not just to classify issues — it is to diagnose root causes at the code level, propose concrete implementations, and produce task prompts detailed enough that another engineer could start coding immediately.

## Your Input

Below is a markdown document containing all open issues for **${repoFullName}**. Each issue includes its number, title, author, labels, timestamps, and full description.

## Issues to analyze
${issuesMarkdown}

## Your Task

Perform a four-phase analysis: **Investigate**, **Architect**, **Plan**, and **Dispatch**

---

### Phase 1: Investigate

For each issue, trace the reported behavior to its source in the codebase. Produce a **code-level diagnosis**, not a summary.

For each issue you must:

1. **Identify the exact code path** that causes the reported behavior. Reference specific files, functions, and line ranges.
2. **Explain the mechanism** — why does this code produce this symptom? Show the relevant code snippet and annotate what goes wrong.
3. **Determine the root cause category**: Is this a bug, a missing feature, an architectural gap, error handling omission, race condition, or documentation gap?

---

### Phase 2: Architect

For each root cause group, design a **concrete solution** with implementation details.

For each solution you must provide:

1. **Proposed implementation** — actual code showing the solution.
2. **Integration points** — exactly where in the existing code this gets wired in.
3. **Edge cases and risks** — what could go wrong, what assumptions you're making.
4. **Test scenarios** — specific test cases that validate the fix.

---

### Phase 3: Plan

Produce two files in the target repository:

- \`.agents/archive/swarm/${getFormattedDate()}/issue_tasks.md\`
- \`.agents/archive/swarm/${getFormattedDate()}/issue_tasks.json\`

#### Merge conflict avoidance rule

These tasks will be executed as **parallel agents**, each creating a separate PR against the same branch. If two tasks modify the same file, they **will** create merge conflicts. Therefore:

- **No two tasks may modify the same file, including test files.** If two root causes require changes to the same source file or test file, merge them into one task.
- For each source file in a task, identify its corresponding test file(s) and include them in the ownership matrix.
- Produce a **File Ownership Matrix** showing exactly which task owns which source and test files. Verify no file appears twice.

#### Coupling analysis

Before finalizing tasks, check for **implicitly coupled files** — files not directly in a task's file list but tightly coupled to it:

- **Test files** that exercise code from multiple tasks
- **Barrel exports** (\`index.ts\`) that re-export from files owned by different tasks
- **Shared utilities** imported by files in different tasks

If any coupled file appears in more than one task's dependency cone, **merge those tasks into one.**

#### issue_tasks.md structure

\`\`\`markdown
# Issue Analysis: ${repoFullName}

> Analyzed N issues on ${new Date().toISOString()}

## Executive Summary
...
\`\`\`

#### issue_tasks.json schema

\`\`\`json
{
  "repo": "${repoFullName}",
  "analyzed_at": "ISO-8601 timestamp",
  "root_causes": [],
  "tasks": [
    {
      "id": "task-kebab-id",
      "title": "Human readable task title",
      "root_cause": "rc-kebab-id",
      "issues": [19, 23],
      "files": ["src/polling.ts"],
      "new_files": [],
      "test_files": ["tests/polling.test.ts"],
      "risk": "low",
      "prompt": "Highly detailed instructions. MUST include commit tag bot-auto in commits, and PR desc must start with <!-- jules-bot -->"
    }
  ],
  "unaddressable": [],
  "file_ownership": {}
}
\`\`\`

---

### Phase 4: Dispatch

After writing the files, run swarm:dispatch to execute parallel sessions.`;
}

// --- Ownership Validation Helper ---

function validateOwnership(analysis) {
  const claimed = new Map();
  for (const task of analysis.tasks) {
    const allFiles = [...(task.files || []), ...(task.new_files || []), ...(task.test_files || [])];
    for (const file of allFiles) {
      const existing = claimed.get(file);
      if (existing) {
        throw new Error(
          `Ownership conflict: "${file}" claimed by both "${existing}" and "${task.id}". These tasks must be merged.`
        );
      }
      claimed.set(file, task.id);
    }
  }
}

// --- CI Verification Helpers ---

async function waitForCI(projectPath, repoInfo, prNumber, maxWaitMs = 10 * 60 * 1000) {
  const start = Date.now();
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const API_URL = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`;

  // Get head SHA for the PR
  const { data: prData } = await octokit.rest.pulls.get({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    pull_number: prNumber,
  });
  const head_sha = prData.head.sha;

  let checks_found = false;
  let attempts_without_checks = 0;
  const MAX_ATTEMPTS_WITHOUT_CHECKS = 3;

  while (Date.now() - start < maxWaitMs) {
    const { data: checks } = await octokit.rest.checks.listForRef({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      ref: head_sha,
    });

    if (checks.check_runs.length === 0) {
      if (!checks_found && attempts_without_checks < MAX_ATTEMPTS_WITHOUT_CHECKS) {
        attempts_without_checks++;
        console.error(`[swarm_merge] No check runs found yet for PR #${prNumber} (${attempts_without_checks}/${MAX_ATTEMPTS_WITHOUT_CHECKS}).`);
        await new Promise((r) => setTimeout(r, 10_000));
        continue;
      }
      console.error(`[swarm_merge] No check runs found. Proceeding.`);
      return true;
    }

    checks_found = true;
    const allComplete = checks.check_runs.every((run) => run.status === "completed");
    const allPassed = checks.check_runs.every(
      (run) => run.conclusion === "success" || run.conclusion === "skipped"
    );

    if (allComplete && allPassed) return true;
    if (allComplete && !allPassed) return false;

    console.error(`[swarm_merge] CI still running for PR #${prNumber}... waiting 30s`);
    await new Promise((r) => setTimeout(r, 30_000));
  }
  return false;
}

// Re-dispatch conflicting tasks against latest base
async function redispatchTask(projectPath, repoInfo, task, oldPr, baseBranch, swarmDir, sessions) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  console.error(`[swarm_merge] Closing conflicting PR #${oldPr.number}...`);
  await octokit.rest.pulls.update({
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    pull_number: oldPr.number,
    state: "closed",
    body: `${oldPr.body || ""}\n\n---\n⚠️ Closed by swarm-merge due to conflict. Task re-dispatched.`,
  });

  const jules_client = jules.with({ apiKey: process.env.JULES_API_KEY });
  console.error(`[swarm_merge] Re-dispatching task "${task.id}" against branch ${baseBranch}...`);
  const session = await jules_client.session({
    prompt: task.prompt,
    source: {
      github: repoInfo.fullName,
      baseBranch: baseBranch,
    },
  });
  console.error(`[swarm_merge] New session created: ${session.id}`);

  // Update sessions list
  const entry = sessions.find((s) => s.taskId === task.id);
  if (entry) {
    entry.sessionId = session.id;
    await fs.writeFile(path.join(swarmDir, "sessions.json"), JSON.stringify(sessions, null, 2));
  }

  // Poll for the new PR
  console.error(`[swarm_merge] Waiting for new PR from session ${session.id}...`);
  const start = Date.now();
  const TIMEOUT = 15 * 60 * 1000;
  while (Date.now() - start < TIMEOUT) {
    await new Promise((r) => setTimeout(r, 30_000));
    const { data: pulls } = await octokit.rest.pulls.list({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      state: "open",
    });

    const newPr = pulls.find(
      (pr) => pr.head.ref.includes(session.id) || pr.body?.includes(session.id)
    );
    if (newPr) {
      console.error(`[swarm_merge] Found new PR #${newPr.number} (${newPr.head.ref})`);
      return { number: newPr.number, head: { ref: newPr.head.ref }, body: newPr.body };
    }
  }
  throw new Error(`Timed out waiting for new PR from session ${session.id}`);
}

// --- MCP Server Setup ---

const server = new Server(
  { name: "swarm", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "swarm_plan",
      description: "Analyze open GitHub issues and initiate a Jules planning session to generate a swarm task manifest.",
      inputSchema: {
        type: "object",
        properties: {
          projectPath: { type: "string", description: "Absolute path to the repository directory. Defaults to current directory." },
          baseBranch: { type: "string", description: "Git base branch (e.g. main, master)." }
        }
      }
    },
    {
      name: "swarm_dispatch",
      description: "Read the generated task manifest and execute specialized sub-agents in parallel using Jules.",
      inputSchema: {
        type: "object",
        properties: {
          projectPath: { type: "string", description: "Absolute path to the repository directory. Defaults to current directory." },
          baseBranch: { type: "string", description: "Git base branch." },
          maxConcurrency: { type: "number", description: "Maximum number of parallel sessions (default 3)." }
        }
      }
    },
    {
      name: "swarm_merge",
      description: "Sequentially update, verify (CI), and merge PRs created by parallel swarm sessions.",
      inputSchema: {
        type: "object",
        properties: {
          projectPath: { type: "string", description: "Absolute path to the repository directory. Defaults to current directory." },
          baseBranch: { type: "string", description: "Git base branch." },
          maxRetries: { type: "number", description: "Maximum conflict retries (default 2)." }
        }
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const projectPath = args?.projectPath ? path.resolve(args.projectPath) : process.cwd();

  if (!process.env.GITHUB_TOKEN) {
    return { content: [{ type: "text", text: "Error: GITHUB_TOKEN environment variable is not defined." }], isError: true };
  }
  if (!process.env.JULES_API_KEY) {
    return { content: [{ type: "text", text: "Error: JULES_API_KEY environment variable is not defined." }], isError: true };
  }

  try {
    switch (name) {
      case "swarm_plan": {
        const repo_info = await getGitRepoInfo(projectPath);
        const base_branch = args?.baseBranch ?? (await getCurrentBranch(projectPath));
        const issues_markdown = await getIssuesAsMarkdown(projectPath);
        const git_context = await getGitContext(projectPath);

        const prompt = `${git_context}\n\n--- TASK BORDER ---\n\n${analyzeIssuesPrompt({
          issuesMarkdown: issues_markdown,
          repoFullName: repo_info.fullName,
        })}`;

        console.error(`[swarm_plan] Starting planner session for ${repo_info.fullName} (${base_branch})...`);
        const jules_client = jules.with({ apiKey: process.env.JULES_API_KEY });
        const session = await jules_client.session({
          prompt,
          source: {
            github: repo_info.fullName,
            baseBranch: base_branch,
          },
          autoPr: true,
        });

        return {
          content: [
            {
              type: "text",
              text: `🚀 Swarm planner session started successfully!\nSession ID: ${session.id}\nJules will analyze issues and generate issue_tasks.json / issue_tasks.md in a PR.`,
            },
          ],
        };
      }

      case "swarm_dispatch": {
        const repo_info = await getGitRepoInfo(projectPath);
        const base_branch = args?.baseBranch ?? (await getCurrentBranch(projectPath));
        const max_concurrency = args?.maxConcurrency ?? 3;

        const swarm_dir = await getSwarmDir(projectPath);
        const tasks_path = path.join(swarm_dir, "issue_tasks.json");

        let analysis;
        try {
          const content = await fs.readFile(tasks_path, "utf-8");
          analysis = JSON.parse(content);
        } catch (err) {
          throw new Error(`Failed to read task list from path: ${tasks_path}. Ensure you have run swarm_plan and checked out/pulled the resulting branch.`);
        }

        validateOwnership(analysis);
        console.error(`[swarm_dispatch] Ownership validated. Dispatching ${analysis.tasks.length} tasks in parallel...`);

        const git_context = await getGitContext(projectPath);
        const jules_client = jules.with({ apiKey: process.env.JULES_API_KEY });
        const queue = [...analysis.tasks];
        const sessionResults = [];

        const sessions = await jules_client.all(
          queue,
          (task) => {
            return {
              prompt: `${git_context}\n\n[TASK_INSTRUCTIONS]\n${task.prompt}`,
              files: task.target_files || task.files,
              source: {
                github: repo_info.fullName,
                baseBranch: base_branch,
              },
            };
          },
          {
            concurrency: max_concurrency,
            delayMs: 1000,
          }
        );

        let idx = 0;
        for await (const session of sessions) {
          const task = queue[idx++];
          sessionResults.push({
            taskId: task.id,
            sessionId: session.id,
          });
          console.error(`[swarm_dispatch] Task "${task.id}" dispatched to Session ID: ${session.id}`);
        }

        const sessions_path = path.join(swarm_dir, "sessions.json");
        await fs.writeFile(sessions_path, JSON.stringify(sessionResults, null, 2));

        return {
          content: [
            {
              type: "text",
              text: `✨ Swarm dispatched!\nSession mappings written to: ${sessions_path}\n\nDetails:\n${sessionResults.map((r) => `- Task ${r.taskId} -> Session ${r.sessionId}`).join("\n")}`,
            },
          ],
        };
      }

      case "swarm_merge": {
        const repo_info = await getGitRepoInfo(projectPath);
        const base_branch = args?.baseBranch ?? (await getCurrentBranch(projectPath));
        const max_retries = args?.maxRetries ?? 2;

        const swarm_dir = await getSwarmDir(projectPath);
        const tasks_path = path.join(swarm_dir, "issue_tasks.json");
        const sessions_path = path.join(swarm_dir, "sessions.json");

        const analysis = JSON.parse(await fs.readFile(tasks_path, "utf-8"));
        const sessions = JSON.parse(await fs.readFile(sessions_path, "utf-8"));

        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        console.error(`[swarm_merge] Loading open pull requests for ${repo_info.fullName}...`);

        const { data: pulls } = await octokit.rest.pulls.list({
          owner: repo_info.owner,
          repo: repo_info.repo,
          state: "open",
          per_page: 100,
        });

        const prMap = new Map();
        for (const session of sessions) {
          const pr = pulls.find(
            (p) => p.head.ref.includes(session.sessionId) || p.body?.includes(session.sessionId)
          );
          if (pr) {
            prMap.set(session.taskId, { number: pr.number, head: { ref: pr.head.ref }, body: pr.body });
          }
        }

        if (prMap.size !== analysis.tasks.length) {
          throw new Error(`Expected ${analysis.tasks.length} PRs but found ${prMap.size}. All PRs must be open before running merge.`);
        }

        for (const task of analysis.tasks) {
          let pr = prMap.get(task.id);
          let retry_count = 0;
          let merged = false;

          while (!merged) {
            console.error(`[swarm_merge] Processing Task "${task.id}" -> PR #${pr.number}`);

            // Update branch from base
            if (analysis.tasks.indexOf(task) > 0 || retry_count > 0) {
              console.error(`[swarm_merge] Updating PR #${pr.number} branch from ${base_branch}...`);
              try {
                await octokit.rest.pulls.updateBranch({
                  owner: repo_info.owner,
                  repo: repo_info.repo,
                  pull_number: pr.number,
                });
                await new Promise((r) => setTimeout(r, 10_000));
              } catch (updateErr) {
                if (retry_count >= max_retries) {
                  throw new Error(`Merge conflict persists for task "${task.id}" after ${max_retries} retries.`);
                }
                console.error(`[swarm_merge] Merge conflict encountered. Re-dispatching task.`);
                pr = await redispatchTask(projectPath, repo_info, task, pr, base_branch, swarm_dir, sessions);
                retry_count++;
                continue;
              }
            }

            // Wait for CI
            console.error(`[swarm_merge] Waiting for CI on PR #${pr.number}...`);
            const ciPassed = await waitForCI(projectPath, repo_info, pr.number);
            if (!ciPassed) {
              throw new Error(`CI failed or timed out for PR #${pr.number}.`);
            }

            // Squash Merge
            console.error(`[swarm_merge] CI passed. Merging PR #${pr.number} (squash)...`);
            await octokit.rest.pulls.merge({
              owner: repo_info.owner,
              repo: repo_info.repo,
              pull_number: pr.number,
              merge_method: "squash",
            });

            console.error(`[swarm_merge] PR #${pr.number} merged successfully!`);
            merged = true;
          }
        }

        return {
          content: [
            {
              type: "text",
              text: `🎉 All ${analysis.tasks.length} swarm pull requests merged successfully. Swarm task completed!`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("🟢 Swarm MCP Server running on stdio");
