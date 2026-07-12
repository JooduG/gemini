---
name: agent-skill-architect
description: Use when creating a new agent skill from scratch, refactoring an underperforming skill directory, optimizing frontmatter descriptions for precise Gemini triggering, or debugging agent compliance failures within the Antigravity IDE workspace.
---

# Agent Skill Architect

## Overview

This skill implements strict Test-Driven Development (TDD) for process documentation and agent behavior tuning. It treats prompt engineering as deterministic system configuration, using bright-line constraints, automated execution gates, and behavioral psychology to enforce 100% agent compliance under operational pressure.

---

## When to Use (Triggers)

* When an agent bypasses documented workflows, invents "pragmatic" workarounds, or ignores structural instructions.
* When Gemini 3.5 undertriggers or overtriggers a skill due to ambiguous frontmatter descriptions.
* When wrapping complex, multi-stage developer workflows (e.g., database migrations, API transformations) into modular, reusable packages.

## When NOT to Use

* Do not use for ephemeral, one-off conversational corrections or project-specific context (use [GEMINI.md](../../../GEMINI.md) or local workspace configs instead).
* Do not use for generic language guidelines or basic tasks that Gemini 3.5 models intuitively compute natively without assistance.

---

## Architecture Blueprint (Progressive Disclosure)

Gemini 3.5 thrives on cleanly tiered file structures. Do not force-feed the agent thousands of tokens at startup. Organize your skill directory as a 3-layer information hierarchy adhering to the project's folder taxonomy rules:

```text
config/skills/your-skill-name/
├── SKILL.md            # Tier 1 & 2: Metadata + high-level conditional workflows (<500 lines)
├── scripts/            # Tier 3: Node.js helper scripts and utilities
│   ├── validate.js     # Deterministic JS sanity-checker
│   └── forge-skill.js  # Automation/instantiation utility
├── templates/          # Tier 3: Boilerplate or starting templates
├── assets/             # Tier 3: Media, icons, and visual assets
└── data/               # Tier 3: Additional documentation, references, and static data
```

> [!IMPORTANT]
> **Hygiene Rules:**
>
> * The names `references` or `resources` are strictly forbidden as folder names under our legislative rules. Use `data` and `assets` instead.
> * Ensure all scripts are JavaScript/TypeScript based (`.js`/`.ts`) executed via `node`. Do not use Python scripts.

---

## Core Behavioral Antidote Pattern

### Anti-Pattern: The Politeness Loophole

Loose, academic instructions let smart models rationalize away tedious work when deadlines close in.

```markdown
# ❌ BAD (Permissive & Wordy)
Please try to write your unit tests before implementing the production code whenever possible. If you are in a hurry, make sure to add them later during the refactoring phase.
```

### Best Practice: The Bright-Line Constraint

Forcible authority mechanics cut off the model's psychological exit ramps before it can start negotiating.

```markdown
# ✅ GOOD (Imperative & Absolute)
Write implementation code before the test? Delete it. Start over. 

**No exceptions:**
* Do not keep non-compliant code as a "temporary reference."
* Do not "adapt" unauthorized code blocks during the test phase.
* Delete means delete.
```

---

## Step-by-Step Skill Generation Workflow

Follow this cycle to build or refine any agent skill.

### Phase 1: The RED Step (Capture the Baseline Failure)

Before writing a single line of documentation, you must watch the agent fail under stress. If you haven't observed it fail without the skill, you cannot know if your skill fixes the right vulnerability.

1. **Construct a high-pressure scenario prompt** that packs at least three compounding operational constraints (e.g., severe time limits, high sunk costs, and authoritative demands to skip steps).
2. **Execute the baseline test scenario** via a parallel subagent workspace with zero skill access.
3. **Capture the agent's exact verbal rationalizations** and bypass patterns word-for-word.

### Phase 2: The GREEN Step (Draft the Minimal Instruction)

Build a razor-sharp prompt payload tailored explicitly to dismantle the baseline failure modes you just documented.

1. **Initialize the skill structure using `forge-skill.js`**. Run the script in your terminal to scaffold the new skill:

   ```bash
   node config/skills/skill-writing/scripts/forge-skill.js create "your-skill-name" skill "Brief description of trigger conditions"
   ```

2. **Configure the standard YAML frontmatter** in the newly created `SKILL.md` exactly as shown below, ensuring the description states *only* when to pull the skill into context, never what the workflow does.

```yaml
---
name: semantic-hyphenated-identifier
description: Use when [insert precise user symptoms, environment errors, or explicit triggering conditions].
---
```

1. **Inject a foundational rule early** stating: *"Violating the letter of these instructions is a violation of the spirit of these instructions."*
2. **Build an explicit Counter-Rationalization Table** matching every recorded agent excuse with an unyielding systemic reality check.
3. **Deploy fully qualified MCP tool strings** using the explicit format `ServerName:tool_name` to prevent execution resolution failures inside the Antigravity workspace.

| Agent Excuse | Operational Reality Check |
| --- | --- |
| "The task is too simple to warrant an automated validation run." | Simple tasks break silently. Run the validation pass anyway. |
| "I will write the test payload immediately after this deploy." | Testing after deployment tests what the code *does*, not what it *should do*. |

### Phase 3: The REFACTOR Step (Automate and Optimize)

Gemini 3.5 token efficiency is maximized by offloading semantic analysis to localized execution code.

1. **Extract all deterministic verification logic** out of text prompts and compile them into standalone Node.js verification scripts inside `scripts/` (utilizing JS/TS).
2. **Instruct the skill to generate intermediate, machine-verifiable files** (e.g., `changes.json`) before making destructive changes.
3. **Validate codebase and logic health** by executing verification tools:
   * For auditing style/linting/heresy rules:

     ```bash
     npm run audit
     ```

   * For verifying unit tests and project integration:

     ```bash
     npm run verify
     ```

4. **Sync any newly identified technical debt** to the project backlog using the automated sync script:

   ```bash
   node config/skills/legislative/scripts/sync-backlog.js
   ```

---

## Script & Tool Standards

* **Error Handling:** Write utility scripts that actively catch errors and emit explicit remediation pathways (e.g., `"Field X not found. Available options: Y, Z"`) instead of crashing and punting the recovery to the LLM.
* **Paths:** Enforce Unix-style forward slashes (`/`) globally across all internal skill documentation. Never write a Windows backslash (`\`) into a paths document.
* **Voodoo Constants:** Ban arbitrary parameters. All timeout thresholds, loop ceilings, and hyper-parameters must be paired with an inline comment justifying their exact structural count.
