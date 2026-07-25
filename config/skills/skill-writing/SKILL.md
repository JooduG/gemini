---
name: agent-skill-architect
description: Use when creating a new agent skill from scratch, refactoring an underperforming skill directory, optimizing frontmatter descriptions for precise triggering, or debugging compliance failures.
---

# Agent Skill Architect

Wrangle determinism out of a stochastic model by applying Test-Driven Development (TDD) to process documentation and agent instructions.

---

## Triggers & Invocation

### Model-Invoked (When to Trigger)

* An agent bypasses documented workflows, invents pragmatic workarounds, or ignores structural instructions.
* Frontmatter descriptions cause undertriggering or overtriggering under operational pressure.
* Wrapping complex multi-stage developer tasks into modular, reusable packages.

### User-Invoked (When NOT to Trigger)

* Ephemeral, one-off conversational corrections or project-specific context (use workspace rules like `GEMINI.md` instead).
* Basic tasks or generic language guidelines that models handle natively without instruction.

---

## 3-Layer Directory Taxonomy

Keep `SKILL.md` lightweight (<500 lines). Tier heavy reference material and tools into child directories:

```text
config/skills/your-skill-name/
├── SKILL.md            # Tier 1 & 2: Metadata, triggers, and primary workflow steps
├── scripts/            # Tier 3: Deterministic Node.js/TypeScript utilities
│   ├── validate.js     # Runtime verification script
│   └── forge-skill.js  # Automation and scaffolding tool
├── templates/          # Tier 3: Boilerplate files
├── assets/             # Tier 3: Media, diagrams, and visual assets
└── data/               # Tier 3: Disclosed references, static datasets, GLOSSARY.md
```

---

## Core Engineering Principles

### 1. The Bright-Line Constraint

Replace permissive prose with non-negotiable execution boundaries.

* **❌ Permissive:** *"Please try to write unit tests before production code when possible."*
* **✅ Imperative:** *"Write implementation code before the test? Delete it. Start over. **No exceptions.**"*

### 2. Leading Words (*Leitwörter*)

Recruit model pretraining priors using concise, high-density terms (e.g., *tight*, *red*, *tracer bullets*) rather than multi-sentence restatements.

### 3. Progressive Disclosure & Context Pointers

Inline only what every execution branch requires. Push specialized or detailed reference down into `data/` files (e.g., [`data/GLOSSARY.md`](https://www.google.com/search?q=data/GLOSSARY.md)) using explicit context pointers.

---

## Skill Creation Lifecycle (TDD Workflow)

* **RED Phase: Capture Baseline Failure:** Observe unassisted model behavior.
  1. **Construct a stress scenario** packing at least three compounding constraints (e.g., time pressure, high sunk costs, authoritative pressure to skip steps).
  2. **Execute the baseline scenario** in a isolated context without access to the skill.
  3. **Record exact rationalizations** and failure modes word-for-word.

* **GREEN Phase: Draft Minimal Instructions:** Build targeted counter-measures.
  1. **Scaffold the skill structure**: `node config/skills/skill-writing/scripts/forge-skill.js create "your-skill-name" skill "Trigger conditions"`
  2. **Configure YAML frontmatter** using precise user symptoms or error triggers.
  3. **Inject the core compliance rule**: *"Violating the letter of these instructions is a violation of the spirit of these instructions."*
  4. **Build a Counter-Rationalization Table** matching observed excuses with operational realities:

      | Observed Excuse | Operational Reality Check |
      | --- | --- |
      | *"Task is too simple for validation."* | Simple tasks break silently. **Run validation pass.** |
      | *"I'll write tests after deploy."* | Testing after deploy tests what code *does*, not what it *should do*. |

  5. **Deploy MCP tool strings** using fully qualified identifiers (`ServerName:tool_name`).

* **REFACTOR Phase: Optimize & Automate:** Prune text and offload logic.
  1. **Extract verification logic** from text prompts into Node.js scripts under `scripts/`.
  2. **Require machine-verifiable intermediary files** (e.g., `changes.json`) before destructive operations.
  3. **Execute lint and test checks**:
     * Audit: `npm run audit`
     * Verify: `npm run verify`
  4. **Sync technical debt** to backlog: `node config/skills/planning/scripts/sync-backlog.js`

---

## Script & Tool Standards

* **Self-Remediating Errors:** Scripts must output actionable remediation options upon failure (e.g., `"Field X missing. Valid options: Y, Z"`).
* **Path Normalization:** **Enforce Unix-style forward slashes (`/`) globally across all documentation.**
* **No Voodoo Constants:** **Document the structural rationale for every timeout, loop ceiling, or numerical threshold in inline comments.**
