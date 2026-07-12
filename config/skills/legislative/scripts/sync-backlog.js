import fs from "fs";
import path from "path";
import { createRequire } from "module";

const ROOT_DIR = process.cwd();
const require = createRequire(path.join(ROOT_DIR, "package.json"));
const ignore = require("ignore");

const ig = ignore();
const gitignorePath = path.join(ROOT_DIR, ".gitignore");
if (fs.existsSync(gitignorePath)) {
  ig.add(fs.readFileSync(gitignorePath, "utf-8"));
}

/**
 *
 */
export function scanForTodo(dir, items_found = []) {
  if (!fs.existsSync(dir)) return items_found;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, "/");

    // Skip environment/system folders immediately
    if (
      item === ".agents" ||
      item === ".gemini" ||
      item === "tmp" ||
      item === "dist" ||
      item === "node_modules" ||
      item === ".git"
    ) {
      continue;
    }

    if (ig.ignores(relPath)) continue;

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanForTodo(fullPath, items_found);
    } else if (stat.isFile() && /\.(js|ts|svelte|md|txt)$/.test(item)) {
      if (item.startsWith("audit-") || item === "SKILL.md" || item === "rules.js") continue;

      const content = fs.readFileSync(fullPath, "utf8");
      const lines = content.split("\n");
      const isMarkupOrText = /\.(md|txt)$/.test(item);

      lines.forEach((line, index) => {
        const hasTodo = line.includes("#TODO-AI");
        if (hasTodo) {
          // JS/TS/Svelte files must match a comment structure, markdown/text can match directly
          const isComment = isMarkupOrText || /(?:\/\/|\/\*|<!--|^\s*\*)\s*#TODO-AI/i.test(line);
          const isSelfMatch = line.includes('line.includes("#TODO-AI")') || line.includes('hasTodo = line.includes');

          if (isComment && !isSelfMatch) {
            const taskMatch = line.match(/#TODO-AI:?\s*(.*)$/i);
            if (taskMatch) {
              const taskDesc = taskMatch[1].trim();
              // Clean up trailing comment markers like */ or -->
              const cleanDesc = taskDesc.replace(/\*\/|-->/, "").trim();
              items_found.push(`- [ ] **${relPath}:${index + 1}**: ${cleanDesc}`);
            }
          }
        }
      });
    }
  }
  return items_found;
}

/**
 *
 */
export function syncBacklog() {
  const TODO_FILE = path.join(ROOT_DIR, "tasks", "PRESENT.md");
  console.log("🧹 Scanning for #TODO-AI tags...");
  const found = scanForTodo(ROOT_DIR);

  if (!fs.existsSync(TODO_FILE)) {
    console.warn("⚠️ tasks/PRESENT.md not found. Creating it...");
    fs.mkdirSync(path.dirname(TODO_FILE), { recursive: true });
    fs.writeFileSync(TODO_FILE, "# Project Tasks\n\n");
  }

  let content = fs.readFileSync(TODO_FILE, "utf-8");
  const backlogHeader = "## 🧹 Backlog (Automated)";
  const markerStart = "<!-- BACKLOG_START -->";
  const markerEnd = "<!-- BACKLOG_END -->";
  const lastSwept = `Last Swept: ${new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" }).substring(0, 16)}`;

  const backlogItems = found.length > 0 ? found.join("\n") : "No active AI debt found.";
  const newBacklogContent = `${markerStart}\n${lastSwept}\n\n${backlogItems}\n${markerEnd}`;

  const sectionRegex = new RegExp(
    `${backlogHeader.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${markerEnd}`,
    "g",
  );

  if (content.includes(backlogHeader)) {
    if (content.match(sectionRegex)) {
      content = content.replace(sectionRegex, () => `${backlogHeader}\n${newBacklogContent}`);
    } else {
      content = content.replace(backlogHeader, () => `${backlogHeader}\n${newBacklogContent}`);
    }
  } else {
    content = content.trim() + `\n\n${backlogHeader}\n${newBacklogContent}\n`;
  }

  fs.writeFileSync(TODO_FILE, content);
  console.log(`✅ Synchronized ${found.length} items to tasks/PRESENT.md`);
}

console.log("\n================================================================================");
console.log("🧹 SYNC: PROJECT BACKLOG");
console.log("================================================================================\n");

syncBacklog();
