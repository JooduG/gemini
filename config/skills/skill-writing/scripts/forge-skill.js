/**
 * 🛠️ forge-skill.js
 * The Sovereign Artisan: Creates standard Agent Skill directory bundles compliant with
 * the Antigravity Customization System (agy-customizations).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..", "..", "..", "..");
const isGlobalConfig = fs.existsSync(path.join(PROJECT_ROOT, "config", "skills"));
const SKILLS_DIR = isGlobalConfig
  ? path.join(PROJECT_ROOT, "config", "skills")
  : path.join(PROJECT_ROOT, ".agents", "skills");
const TEMPLATES_DIR = path.join(__dirname, "..", "resources", "templates");

// Helper: Ensure directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Helper: Slugify name (lowercase-hyphen-separated)
const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[\/\s_]+/g, "-")
    .replace(/^[^\w]+|[^\w]+$/g, "")
    .replace(/[^\w-]/g, "");

// Helper: Title Case
const titleCase = (text) =>
  text
    .split("-")
    .map((w) => w[0].toUpperCase() + w.substring(1))
    .join(" ");

/**
 * Creates a NEW Sovereign Agent Skill bundle using templates
 */
const createSkill = async (name, description = "") => {
  const slug = slugify(name);
  const title = titleCase(slug);
  const skillDir = path.join(SKILLS_DIR, slug);
  const templatePath = path.join(TEMPLATES_DIR, "SKILL.template.md");

  if (!fs.existsSync(templatePath)) {
    console.error(`❌ Template not found: ${templatePath}`);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf-8");

  const defaultDescription = `Use this skill when the user asks to work with ${title} procedures or related domain workflows.`;

  // Robust Placeholder Replacement
  const finalContent = template
    .replace(/\{\{skill-name\}\}/gi, slug)
    .replace(/\{\{(Skill-Title|Title)\}\}/gi, title)
    .replace(
      /\{\{(description|Description)\}\}/g,
      description || defaultDescription,
    )
    .replace(/\{\{Persona\}\}/g, `The ${title} Orchestrator`)
    .replace(/\{\{script\}\}/g, slug)
    .replace(/\{\{Reference\}\}/g, title);

  // 1. Scaffold Skill Directory Bundle
  ensureDir(skillDir);
  ensureDir(path.join(skillDir, "scripts"));
  ensureDir(path.join(skillDir, "references"));

  // 2. Write Primary SKILL.md
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), finalContent);

  console.log(`\n✅ FORGE SUCCESS: Agent Skill '${slug}' instantiated.`);
  console.log(`📍 Directory: ${skillDir}`);
  console.log(`📄 File: ${path.join(skillDir, "SKILL.md")}`);
  console.log(`📁 Bundled subdirs: scripts/, references/`);
};

/**
 * 🚀 Main Dispatcher
 */
if (process.argv[1] && process.argv[1].endsWith("forge-skill.js")) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "create") {
    if (!args[1]) {
      console.log("Usage: node forge-skill.js create <skill-name> [description]");
      process.exit(1);
    }
    // Handle both: forge-skill.js create <name> [desc] and forge-skill.js create <name> "skill" [desc]
    const description = args[2] === "skill" ? args[3] : args[2];
    createSkill(args[1], description);
  } else {
    console.log("Usage: node forge-skill.js create <skill-name> [description]");
  }
}

export { createSkill };
