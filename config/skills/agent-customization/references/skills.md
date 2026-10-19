# Agent Skills Reference Guide (`SKILL.md`)

Agent Skills are modular, on-demand packages of domain knowledge, conventions, and executable procedures adhering to the [Open Agent Skills Standard](https://agentskills.io/home). They serve as targeted cheatsheets and runbooks that extend an agent's capabilities without polluting prompt context upfront.

---

## 1. Directory Structure & Taxonomy

A skill is structured as a directory bundle located within a `skills/` customization folder. While `SKILL.md` is the only mandatory file, standard subdirectories should be used to co-locate code, assets, and deep documentation:

```text
skills/<skill_name>/
├── SKILL.md            # Required: Main entrypoint with frontmatter and workflow
├── scripts/            # Optional: Deterministic Node.js/Bash/PowerShell helpers
│   ├── helper.sh       # Executable tool or automation script
│   └── validate.js     # Verification or lint utility
├── references/         # Optional: Deep documentation and manual guides
│   └── guide.md        # Reference document loaded via progressive disclosure
├── examples/           # Optional: Golden reference implementations & fixtures
└── resources/          # Optional: Scaffolding templates, schemas, and static data
```

### Standard Subdirectories

| Directory | Purpose | Usage Recommendation |
| :--- | :--- | :--- |
| **`scripts/`** | Executable utilities & deterministic code | Use for tasks requiring precise execution or automated verification. |
| **`references/`** | Specialized manuals & detailed specifications | Keep `SKILL.md` lightweight; move heavy tables, schemas, and docs here. |
| **`examples/`** | Sample implementations and input/output fixtures | Provide concrete code patterns for the model to emulate. |
| **`resources/`** | Templates, data schemas, and static assets | Store data schemas and boilerplate files. |

---

## 2. Main Instruction File (`SKILL.md`)

### 2.1 YAML Frontmatter Specification

Every `SKILL.md` file **must** begin with a YAML frontmatter block containing strictly two fields:

```yaml
---
name: <kebab-case-skill-name>
description: >-
  Describe what the skill does and when the agent should use it. Use third-person.
  Example: "Generates unit tests for Python code using pytest conventions. Use when writing or debugging test suites."
---
```

* **`name`** (`string`, required): Unique identifier in lowercase, hyphen-separated `kebab-case` matching the directory name.
* **`description`** (`string`, required): High-density third-person summary specifying **what** the skill does and **when** it triggers. The primary agent reads this description during session initialization to decide whether to activate the skill.

### 2.2 The Trigger Triad Specification

Under default conditions, models suffer from a **56% under-triggering inertia**. To guarantee reliable activation without polluting frontmatter, structure `description` using the **Trigger Triad**:

1. **Action-Oriented Capability Statement**: An opening sentence in third-person impersonal voice naming exact mechanisms and outputs.
2. **Imperative Lexical Bait & Import-Path Anchors**: A middle clause opening with `"Use when..."` packed with concrete user intents, CLI commands, and **literal package import paths or filenames**.
3. **Negative Boundaries & Sibling Pointers**: A closing clause starting with `"Do NOT use for..."` establishing a hard perimeter and pointing to competing sibling skills.

#### Guarding Against Workflow Leakage

Never narrate ordered procedural steps in `description` (e.g. *"First run lint, then edit, then test"*). Summarizing execution steps in metadata causes the model to shortcut activation and execute a shallow summary from the system prompt without reading `SKILL.md` or its `references/` off disk.

### 2.3 Canonical Body Architecture

A production-grade `SKILL.md` follows a disciplined structure designed to steer LLM attention deterministically:

1. **Title & Mandatory Line-1 Scar Tissue Check**:
   * States the specialized persona and directs the agent to review co-located `PITFALLS.md`.
2. **Top-100-Line Compaction Invariants**:
   * Places non-negotiable constraints, safety guardrails, and reference maps in the first 100 lines so they survive session auto-compaction.
3. **`## 1. Identity & Philosophy`**:
   * Outlines the persona's role, core tenets, and architectural invariants.
4. **`## 2. Activation Triggers`**:
   * Explicit `### Model-Invoked (When to Trigger)` and `### When to Skip` sections to prevent over/undertriggering.
5. **`## 3. Bright-Line Constraints`**:
   * Non-negotiable boundaries expressed in imperative phrasing (❌ DO NOT vs ✅ DO).
6. **`## 4. Execution Workflow`**:
   * Numbered, ordered stages with concrete success criteria for each step.
7. **`## 5. Counter-Rationalization Table`**:
   * Preempts common model excuses with strict operational reality checks.
8. **`## 6. Verification Checklist`**:
   * Actionable verification gates that must be satisfied before completing the task.

---

## 3. Canonical `SKILL.md` Blueprint Template

When authoring a new skill from scratch, follow this standardized blueprint:

```markdown
---
name: <skill-name>
description: >-
  <Third-person capability statement>. Use when <developer intents, commands,
  or codebase imports `import-path`>. Do NOT use for <adjacent domain> — use
  <sibling-skill> instead.
---

# <Skill Title>

> **Persona: <Specialized Persona Role>**  
> *"Execute with precision, architectural purity, and strict compliance."*

## 1. Mandatory Pre-Flight & Pitfalls Check (Top Invariants)

1. **Read Co-Located Scar Tissue**: Before drafting code or planning steps, read `PITFALLS.md` in this skill directory to review known failure traps.
2. **Exploration-First Sequencing**: Inspect the local repository files and configurations before loading reference docs.
3. **Hard Guardrails**:
   - ❌ **DO NOT** modify orthogonal files outside the immediate domain scope.
   - ✅ **DO** verify each increment with automated test commands.

## 2. Reference Loading Map (Strictly One-Hop Deep)

- For specialized sub-topic A: Read [topic-a.md](./references/topic-a.md).
- For specialized sub-topic B: Read [topic-b.md](./references/topic-b.md).

---

## 3. Identity & Philosophy

You are **<Persona Name>**—an authoritative agent specialized in <Domain/Process>.

### Core Tenets

* **Foundational Rigor**: Enforce clean architecture, maintainability, and domain best practices.
* **Deterministic Execution**: Apply strict constraints over ambiguous or loose conventions.
* **Continuous Verification**: Verify each step with verifiable proof before considering work complete.

---

## 4. Activation Triggers

### Model-Invoked (When to Trigger)

* Use this skill when the user asks to <Domain action> or work with related tasks.
* When working with core patterns and procedures governed by this domain.

### When to Skip

* Orthogonal concerns handled by dedicated sibling skills or plugins.
* Trivial tasks not requiring specialized domain procedures.

---

## 5. Execution Workflow

1. **Assess & Ground**: Understand domain requirements and verify local repo context.
2. **Draft & Implement**: Follow standard architectural patterns with zero unnecessary bloat.
3. **Verify**: Test and validate against the domain criteria.

---

## 6. Counter-Rationalization Table

| Observed Excuse | Operational Reality Check |
| :--- | :--- |
| *"This is too minor to follow standards."* | Small inconsistencies compound into technical debt. Follow domain standards. |
| *"I'll clean up formatting later."* | Unclean intermediate code causes bugs. Enforce standards from line one. |

---

## 7. Verification & Final Delivery Checklist

* [ ] All code conforms to domain standards.
* [ ] Co-located `PITFALLS.md` reviewed for known traps.
* [ ] No regression or unhandled edge cases introduced.
* [ ] Clean, self-documenting structure verified.
```

---

## 4. Progressive Disclosure & One-Hop Reference Constraint

Skills adhere to a **three-stage progressive context model**:

1. **Discovery (Level 1)**: At session start, the agent indexes only metadata (`name` and `description`) into prompt memory (~80–100 tokens per skill).
2. **Activation (Level 2)**: When a user prompt matches a skill's description, the agent retrieves and reads `SKILL.md` via `view_file` (<500 lines).
3. **Deep Retrieval (Level 3)**: If a specific subtask requires deep manuals or schemas, the agent reads a leaf in `references/` on demand.

> [!IMPORTANT]
> **The One-Hop Rule**: `SKILL.md` must link directly to supporting leaves (`references/guide.md` or `scripts/check.js`). Never create multi-hop chains (`file-a.md` $\rightarrow$ `file-b.md` $\rightarrow$ `file-c.md`), as agents routinely halt after the first hop.

---

## 5. Agentic Script Engineering Contracts (`scripts/`)

Offloading deterministic work to executable scripts in `scripts/` keeps source code out of active prompt tokens. Production scripts in Antigravity must follow four engineering contracts:

1. **Pure Node.js / TypeScript Executables**: Author scripts using standard Node.js/TypeScript runtimes with zero interactive `stdin` prompts.
2. **Discovery-Then-Drill CLI Output**: Default to compact JSON output (`--summary --format json`) to prevent tool output truncation (>10K characters), and provide targeted drill-down flags (`--check ID` or `--offset`).
3. **Mandatory Dry-Run Preview**: Stateful or mutating operations must require a `--mode dry-run` flag before applying changes.
4. **Treat Scripts as Black Boxes**: In `SKILL.md`, instruct agents to execute scripts with `--help` or inspect their stdout rather than reading raw script source files into context.
5. **Schema Validation State Gates**: In multi-step or multi-agent workflows, use deterministic validation scripts (e.g. `node scripts/validate.js`) to assert that intermediate artifacts conform to required JSON schemas before allowing subsequent phases to proceed.
6. **Dynamic Context Injection (DCI)**: When operating in harnesses supporting backtick execution (e.g. `!node scripts/status.js --summary`), note that execution output can be injected inline at skill activation time to prime state before the agent's first turn.
