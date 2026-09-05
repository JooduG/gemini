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

### 2.2 Canonical Body Architecture

A production-grade `SKILL.md` follows a disciplined structure designed to steer LLM attention deterministically:

1. **Title & Persona Blockquote**:
   * States the specialized persona and operational mindset.
2. **`## 1. Identity & Philosophy`**:
   * Outlines the persona's role, core tenets, and architectural invariants.
3. **`## 2. Activation Triggers`**:
   * Explicit `### Model-Invoked (When to Trigger)` and `### When to Skip` sections to prevent over/undertriggering.
4. **`## 3. Bright-Line Constraints`**:
   * Non-negotiable boundaries expressed in imperative phrasing (❌ DO NOT vs ✅ DO).
5. **`## 4. Execution Workflow`**:
   * Numbered, ordered stages with concrete success criteria for each step.
6. **`## 5. Counter-Rationalization Table`**:
   * Preempts common model excuses (e.g., *"This is just a quick fix"*) with strict operational reality checks.
7. **`## 6. Verification Checklist`**:
   * Actionable verification gates that must be satisfied before completing the task.

---

## 3. Canonical `SKILL.md` Blueprint Template

When authoring a new skill from scratch, follow this standardized blueprint:

```markdown
---
name: <skill-name>
description: >-
  <Third-person description of what the skill does and when to use it.>
---

# <Skill Title>

> **Persona: <Specialized Persona Role>**  
> *"Execute with precision, architectural purity, and strict compliance."*

---

## 1. Identity & Philosophy

You are **<Persona Name>**—an authoritative agent specialized in <Domain/Process>.

### Core Tenets

* **Foundational Rigor**: Enforce clean architecture, maintainability, and domain best practices.
* **Deterministic Execution**: Apply strict constraints over ambiguous or loose conventions.
* **Continuous Verification**: Verify each step with verifiable proof before considering work complete.

---

## 2. Activation Triggers

### Model-Invoked (When to Trigger)

* Use this skill when the user asks to <Domain action> or work with related tasks.
* When working with core patterns and procedures governed by this domain.

### When to Skip

* Orthogonal concerns handled by dedicated sibling skills or plugins.
* Trivial tasks not requiring specialized domain procedures.

---

## 3. Bright-Line Constraints

* ❌ **DO NOT** violate established naming, architectural patterns, or core system laws in `GEMINI.md`.
* ❌ **DO NOT** duplicate general programming knowledge already in model weights.
* ✅ **DO** ensure all implementations are grounded in clean, self-documenting code.
* ✅ **DO** link to helper scripts in `scripts/` and detailed documentation in `references/`.

---

## 4. Execution Workflow

1. **Assess & Ground**: Understand domain requirements and verify context.
2. **Draft & Implement**: Follow standard architectural patterns with zero unnecessary bloat.
3. **Verify**: Test and validate against the domain criteria.

---

## 5. Counter-Rationalization Table

| Observed Excuse | Operational Reality Check |
| :--- | :--- |
| *"This is too minor to follow standards."* | Small inconsistencies compound into technical debt. Follow domain standards. |
| *"I'll clean up formatting later."* | Unclean intermediate code causes bugs. Enforce standards from line one. |

---

## 6. Verification & Final Delivery Checklist

* [ ] All code conforms to domain standards.
* [ ] No regression or unhandled edge cases introduced.
* [ ] Clean, self-documenting structure verified.
```

---

## 4. Progressive Disclosure Pattern

Skills adhere to a **three-stage progressive context model**:

1. **Discovery**: At conversation start, the agent indexes only metadata (`name` and `description`) for all available skills into prompt memory.
2. **Activation**: When a user task matches a skill's domain, the agent retrieves and reads `SKILL.md` via `view_file`.
3. **Deep Retrieval**: If a specific task branch requires deep knowledge, schemas, or manuals, the agent navigates into `references/` via relative links on demand.

> [!TIP]
> Keep `SKILL.md` under 500 lines. Offload large configuration tables, historical background, and detailed schemas into `references/` files to conserve context window tokens.

---

## 5. Authoring Best Practices

### Treat Scripts as Black Boxes

If your skill bundles helper scripts in `scripts/`, instruct the agent to run them with `--help` or execute them directly rather than reading their entire source code into context:

````markdown
Run the verification helper:
```bash
node scripts/validate.js --help
```
````

### Include Decision Trees

For complex skills with multiple operational paths, provide a decision table or mermaid diagram to guide the agent in selecting the correct strategy.

### Use Imperative Phrasing (Bright-Line Constraints)

Models routinely rationalize soft or permissive guidelines under operational pressure. Replace polite suggestions with non-negotiable boundaries:

* ❌ **Soft:** *"Try to run tests before finishing your work if you have time."*
* ✅ **Imperative:** *"Never mark a task complete without running tests. Failing test? Fix it before proceeding."*
