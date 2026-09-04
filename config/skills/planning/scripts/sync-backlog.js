/**
 * -------------------------------------------------------------------------------------------------
 * Antigravity Planning Script: Automated Backlog & TODO Debt Synchronizer
 * -------------------------------------------------------------------------------------------------
 * Sweeps the codebase for `#TODO-AI` comment markers, ignoring system, build, and git-ignored paths.
 * Synchronizes detected debt items cleanly into `tasks/PRESENT.md` under `### 🔍 Detected TODOs`.
 * -------------------------------------------------------------------------------------------------
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";

// =================================================================================================
// 1. Configuration & Ignore Initialization
// =================================================================================================

const ROOT_DIRECTORY = process.cwd();
const node_require = createRequire(path.join(ROOT_DIRECTORY, "package.json"));
const create_ignore_filter = node_require("ignore");

const ignore_filter = create_ignore_filter();
const gitignore_path = path.join(ROOT_DIRECTORY, ".gitignore");
if (fs.existsSync(gitignore_path)) {
  ignore_filter.add(fs.readFileSync(gitignore_path, "utf-8"));
}

// =================================================================================================
// 2. Directory Scanner
// =================================================================================================

/**
 * Recursively scans a directory for `#TODO-AI` tags in code and documentation files.
 *
 * @param {string} target_directory - Directory path to scan.
 * @param {string[]} items_found - Accumulator array for detected tasks.
 * @returns {string[]} Array of formatted markdown checklist items.
 */
export function scan_for_todos(target_directory, items_found = []) {
  if (!fs.existsSync(target_directory)) return items_found;
  const directory_entries = fs.readdirSync(target_directory);

  for (const entry_name of directory_entries) {
    const full_path = path.join(target_directory, entry_name);
    const relative_path = path.relative(ROOT_DIRECTORY, full_path).replace(/\\/g, "/");

    // Skip environment/system folders immediately
    if (
      entry_name === ".agents" ||
      entry_name === ".gemini" ||
      entry_name === "tmp" ||
      entry_name === "dist" ||
      entry_name === "node_modules" ||
      entry_name === ".git"
    ) {
      continue;
    }

    if (ignore_filter.ignores(relative_path)) continue;

    const file_stats = fs.statSync(full_path);

    if (file_stats.isDirectory()) {
      scan_for_todos(full_path, items_found);
    } else if (file_stats.isFile() && /\.(js|ts|svelte|md|txt)$/.test(entry_name)) {
      if (entry_name.startsWith("audit-") || entry_name === "SKILL.md" || entry_name === "rules.js") continue;

      const file_content = fs.readFileSync(full_path, "utf8");
      const lines_list = file_content.split("\n");
      const is_markup_or_text = /\.(md|txt)$/.test(entry_name);

      lines_list.forEach((line_content, line_index) => {
        const has_todo_marker = line_content.includes("#TODO-AI");
        if (has_todo_marker) {
          // JS/TS/Svelte files must match a comment structure, markdown/text can match directly
          const is_comment = is_markup_or_text || /(?:\/\/|\/\*|<!--|^\s*\*)\s*#TODO-AI/i.test(line_content);
          const is_self_match =
            line_content.includes('line_content.includes("#TODO-AI")') ||
            line_content.includes("has_todo_marker = line_content.includes");

          if (is_comment && !is_self_match) {
            const task_match = line_content.match(/#TODO-AI:?\s*(.*)$/i);
            if (task_match) {
              const raw_task_description = task_match[1].trim();
              const clean_task_description = raw_task_description.replace(/\*\/|-->/, "").trim();
              items_found.push(`- [ ] **${relative_path}:${line_index + 1}**: ${clean_task_description}`);
            }
          }
        }
      });
    }
  }
  return items_found;
}

// =================================================================================================
// 3. Backlog Synchronizer
// =================================================================================================

/**
 * Scans the project directory and synchronizes detected TODOs into tasks/PRESENT.md.
 */
export function synchronize_backlog() {
  const mission_board_file = path.join(ROOT_DIRECTORY, "tasks", "PRESENT.md");
  console.log("🧹 Scanning for #TODO-AI tags...");
  const detected_items = scan_for_todos(ROOT_DIRECTORY);

  if (!fs.existsSync(mission_board_file)) {
    console.warn("⚠️ tasks/PRESENT.md not found. Creating it...");
    fs.mkdirSync(path.dirname(mission_board_file), { recursive: true });
    fs.writeFileSync(mission_board_file, "# Project Tasks\n\n");
  }

  let file_content = fs.readFileSync(mission_board_file, "utf-8");
  const section_header = "### 🔍 Detected TODOs";
  const marker_start = "<!-- TODO_SCAN_START -->";
  const marker_end = "<!-- TODO_SCAN_END -->";
  const last_scanned_timestamp = `Last Scanned: ${new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" }).substring(0, 16)}`;

  const backlog_body = detected_items.length > 0 ? detected_items.join("\n") : "No active AI debt found.";
  const new_section_content = `${marker_start}\n${last_scanned_timestamp}\n\n${backlog_body}\n${marker_end}`;

  const section_regex = new RegExp(
    `${section_header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${marker_end}`,
    "g",
  );

  if (file_content.includes(section_header)) {
    if (file_content.match(section_regex)) {
      file_content = file_content.replace(section_regex, () => `${section_header}\n${new_section_content}`);
    } else {
      file_content = file_content.replace(section_header, () => `${section_header}\n${new_section_content}`);
    }
  } else {
    file_content = file_content.trim() + `\n\n${section_header}\n${new_section_content}\n`;
  }

  fs.writeFileSync(mission_board_file, file_content);
  console.log(`✅ Synchronized ${detected_items.length} items to tasks/PRESENT.md`);
}

// =================================================================================================
// 4. CLI Execution
// =================================================================================================

console.log("\n================================================================================");
console.log("🧹 SYNC: PROJECT BACKLOG");
console.log("================================================================================\n");

synchronize_backlog();

/**
 * -------------------------------------------------------------------------------------------------
 * CHANGELOG:
 * - 2026-09-05: Ground-up refactor under /deconstruct protocol: added Universal File Architecture
 *   header, structured domain sections, full nomenclature compliance (purged ig, relPath, stat,
 *   cleanDesc, hasTodo, TODO_FILE abbreviations), and bound section header to ### 🔍 Detected TODOs.
 * -------------------------------------------------------------------------------------------------
 */
