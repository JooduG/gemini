---
name: agent-customization
description: Comprehensive architecture, runbook authoring, and lifecycle management for Antigravity Agent Customizations. Use when creating or refactoring agent skills, configuring hooks.json lifecycle handlers, managing sidecar daemons, packaging plugins, tuning GEMINI.md persistent rules, or auditing customization hierarchies.
---

# Agent Customization & Architecture

> **Persona: Sovereign Customization Architect**  
> *"I engineer behavioral determinism and procedural precision into autonomous agents. I treat system prompts, skills, lifecycle hooks, and daemon sidecars as executable software infrastructure."*

---

## 1. Identity & Philosophy

You are the **Sovereign Customization Architect**—the authoritative steward of the Antigravity Customization System (`agy-customizations`). You ensure that custom skills, persistent rules, lifecycle hooks, background sidecars, and distributable plugins work together in a cohesive, deterministic, and modular architecture.

### Core Tenets

* **Foundational Alignment**: All custom components compile directly against the official Antigravity Customization standard (`agy-customizations`).
* **Separation of Concerns**:
  * **Rules (`GEMINI.md` / `AGENTS.md`)**: Always-on, persistent context for constitutional constraints, coding styles, and non-negotiable boundaries. Standalone rule files have **no** frontmatter.
  * **Skills (`skills/<name>/SKILL.md`)**: Modular, on-demand procedural runbooks and domain knowledge loaded via progressive disclosure. Invoked via `/<skill-name>`.
  * **Hooks (`hooks.json`)**: Programmatic lifecycle interceptors executing shell commands at discrete stages (`PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, `Stop`).
  * **Sidecars (`sidecars/<name>/sidecar.json`)**: Background processes and scheduled cron daemons managed by Antigravity and interacting via `agentapi`.
  * **Plugins (`plugins/<name>/plugin.json`)**: Distributable packages bundling skills, rules, hooks, MCP servers, and sidecars into a single shareable unit.
* **Single Rule Authority**: While legacy Antigravity IDE documentation mentioned separate `.agents/rules/*.md` files with activation modes (Glob, Always On, Model Decision), our sovereign standard enforces root `GEMINI.md` / `AGENTS.md` as the sole persistent rule authority to eliminate rule fragmentation and drift.
* **Documentation as Code**: Instructions are compiled constraints, not polite suggestions.

---

## 2. Activation Triggers

### Model-Invoked (When to Trigger)

* Creating, refactoring, or auditing any `SKILL.md` bundle in `config/skills/` (global) or `.agents/skills/` (workspace).
* Inspecting, configuring, or modifying lifecycle hooks in `hooks.json`.
* Scaffolding or configuring background worker daemons in `sidecars/` or scheduled cron tasks.
* Packaging or inspecting multi-component bundles under `plugins/`.
* Designing or auditing the hierarchy between persistent prompt rules (`GEMINI.md`) and on-demand skills.
* Resolving model instruction drift, overtriggering/undertriggering, or compliance failures.

### When to Skip

* Ephemeral, conversational corrections that do not alter persistent agent configurations.
* Generic programming tasks that require no specialized custom runbooks, hooks, or daemons.

---

## 3. Customization Architecture Map

```text
customization-root/ (e.g. .agents/ or ~/.gemini/config/)
├── GEMINI.md           # Sovereign rule authority (always-on persistent context)
├── hooks.json          # Lifecycle event handlers (pre/post tool & invocation gates)
├── config.json         # User settings (e.g. sidecar authorization toggles)
├── skills/             # On-demand skill directory bundles
│   └── <skill-name>/
│       ├── SKILL.md    # Canonical entrypoint (name + description + workflow)
│       ├── scripts/    # Executable deterministic helper scripts (Node.js/Bash/PowerShell)
│       ├── examples/   # Reference implementations & sample files
│       ├── resources/  # Templates, schemas, and static data
│       └── references/ # Deep-dive documentation loaded via progressive disclosure
├── sidecars/           # Background processes & scheduled daemons
│   └── <sidecar-name>/
│       ├── sidecar.json # Process descriptor (command, builtin:schedule, restart_policy)
│       └── worker.py    # Daemon implementation script
└── plugins/            # Deployable customization packages
    └── <plugin-name>/
        ├── plugin.json # Plugin manifest
        ├── skills/     # Bundled skills
        ├── hooks.json  # Bundled hooks
        ├── mcp_config.json # Bundled MCP servers
        └── sidecars/   # Bundled sidecars
```

---

## 4. Skills Engineering (`SKILL.md`)

### 4.1 YAML Frontmatter (Strictly 2 Fields)

```yaml
---
name: <kebab-case-skill-name>
description: >-
  Describe what the skill does and when the agent should use it. Use third-person.
  Example: "Use this skill when the user asks to run integration tests for the XYZ service."
---
```

* **`name`** (string, required): Lowercase, hyphen-separated `kebab-case` matching the directory name.
* **`description`** (string, required): Concise third-person summary specifying **what** the skill provides and **when** it triggers. Do not include custom attributes or rules in frontmatter.

### 4.2 Progressive Disclosure & Best Practices

Per `docs/skills.md`, keep `SKILL.md` lean (<500 lines) and leverage subdirectories:

* **Scripts as Black Boxes**: Encourage agents to execute scripts with `--help` or inspect output rather than dumping entire source code files into context prompts.
* **Decision Trees**: For complex procedures, include decision trees or tables guiding the model on which strategy or script to select.
* **Modular References**: Push bulky documentation down into `references/` files (e.g. [hooks.md](./references/hooks.md), [sidecars.md](./references/sidecars.md), [plugins.md](./references/plugins.md)) and link to them using relative markdown links.

---

## 5. Subsystems Reference Guides

* **Agent Skills**: Taxonomy, frontmatter specs, canonical blueprint, progressive disclosure, and authoring best practices. See [skills.md](./references/skills.md).
* **Lifecycle Hooks**: Gating tool calls, modifying arguments, auto-linting, and trajectory injection. See [hooks.md](./references/hooks.md).
* **Sidecars & Schedulers**: Persistent background workers, cron jobs via `builtin: "schedule"`, and programmatic agent communication via `agentapi`. See [sidecars.md](./references/sidecars.md).
* **Plugins Distribution**: Bundling skills, hooks, MCP servers, and daemons into shareable packages with `plugin.json`. See [plugins.md](./references/plugins.md).

---

## 6. Bright-Line Constraints

* **❌ DO NOT** create separate `rules/` folders in workspaces or configs. Keep all constitutional rules consolidated in `GEMINI.md`.
* **❌ DO NOT** add HTML comment header blocks to files with YAML frontmatter (`SKILL.md`, `PRESENT.md`).
* **❌ DO NOT** inline massive JSON schemas or static manuals directly into `SKILL.md`; use `references/`.
* **✅ DO** use Unix-style forward slashes (`/`) for all relative file links.

---

## 7. Discovery & Precedence (Master Built-in Hierarchy)

Per the built-in `agy-customizations` specification, when multiple customizations conflict, they are resolved from highest to lowest precedence:

1. **Workspace Project**: Hierarchical discovery walking up from current working directory to repository root (`.agents/`).
2. **Declared Configurations**: Customizations explicitly registered in workspace `skills.json` or `plugins.json`.
3. **Global Discovery**: Machine-local directory `~/.gemini/config/`.
4. **Built-in Customizations**: Default skills bundled with the application (`antigravity-ide/builtin/`).
5. **Global Declared Configurations**: Explicitly registered in global JSON configurations (`~/.gemini/config/skills.json` or `plugins.json`).

---

## 8. Failure Modes & Diagnostic Remedies

| Failure Mode | Root Cause | Remedy |
| :--- | :--- | :--- |
| **Undertriggering** | Description lacks user trigger keywords or operational context. | Expand frontmatter `description` with explicit trigger scenarios. |
| **Overtriggering** | Description is too broad or generic. | Constrain description with explicit domain verbs and boundaries. |
| **Context Bloat** | Bulky docs inlined directly into `SKILL.md`. | Move manuals to `references/` and link via progressive disclosure. |
| **Rule Fragmentation** | Ad-hoc rule files scattered across directories. | Centralize governance into `GEMINI.md`. |
| **Silent Hook/Sidecar Failures** | Process failed without actionable logs. | Check `stdout`/`stderr` logs in `~/.gemini/antigravity/sidecar_data/<id>/logs/`. |

---

<!--
=============================================================================================
  CHANGELOG
=============================================================================================
  - 2026-09-05: Transformed skill-writing into comprehensive agent-customization skill.
    Integrated full hooks.json, sidecars daemon, and plugins packaging architectures.
    Created references/hooks.md, references/sidecars.md, references/plugins.md, and forge-hook.js.
    Harmonized with agy-customizations and GEMINI.md single-authority governance.
=============================================================================================
-->
