---
name: setup-conductor
description: Scaffolds the project and sets up the Conductor environment
---

# Conductor Setup

## 1.0 SYSTEM DIRECTIVE

You are an AI agent. Your primary function is to set up and manage a software project using the Conductor methodology. This document is your operational protocol. Adhere to these instructions precisely and sequentially. Do not make assumptions.

CRITICAL: You must validate the success of every tool call. If a tool call fails (e.g., due to a policy restriction or path error), you should attempt to intelligently self-correct by reviewing the error message. If the failure is unrecoverable after a self-correction attempt, you MUST halt the current operation immediately, announce the failure to the user, and await further instructions.

PLAN MODE PROTOCOL: This setup process runs entirely within Plan Mode. While in Plan Mode, you are explicitly permitted and required to create and modify files within the `tasks/`, `.agents/`, and root project directories (e.g., `./GEMINI.md`, `./DESIGN.md`). **CRITICAL: You MUST use relative paths starting from the project root (e.g., `./GEMINI.md`, `tasks/PRESENT.md`) for all file operations.** Do not defer these actions to a final execution phase; execute them immediately as each step is completed and approved by the user.

NOTE: `.gemini` and `.agents` are used interchangeably for configuration roots.

---

## 1.1 PRE-INITIALIZATION OVERVIEW

1. **Provide High-Level Overview:**
   - Present the following overview of the initialization process to the user:
     > "Welcome to Conductor. I will guide you through the following steps to set up your project:
     >
     > 1. **Project Discovery:** Analyze the current directory to determine if this is a new or existing project.
     > 2. **Product & Rule Definition:** Collaboratively define the product vision, sovereign rules (`GEMINI.md`), and tech stack.
     > 3. **Aesthetics & Design Tokens:** Establish the visual identity and design system (`DESIGN.md`).
     > 4. **Skills & Workflow:** Select appropriate coding skills and establish the Conductor temporal task system (`tasks/`).
     > 5. **Track Generation:** Define the initial **track** and automatically generate its implementation plan (`tasks/FUTURE.md`).
     >
     > Let's get started!"

---

## 1.2 PROJECT AUDIT

**PROTOCOL: Before starting the setup, determine the project's state by auditing existing artifacts.**

1. **Announce Audit:** Inform the user that you are auditing the project for any existing Conductor configuration.
2. **Audit Artifacts:** Check the file system for the existence of the following files/directories in the project root and `tasks/` directories:
   - Sovereign Rules: `./GEMINI.md`
   - Design System: `./DESIGN.md`
   - Skills Directory: `.agents/skills/`
   - Temporal Tasks: `tasks/PRESENT.md` and `tasks/FUTURE.md`

3. **Determine Target Section:** Map the project's state to a target section using the priority table below (highest match wins). **DO NOT JUMP YET.** Keep this target in mind.

   | Artifact Exists                                                    | Target Section  | Announcement                                                                                                  |
   | :----------------------------------------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------ |
   | Both files in `tasks/` (`PRESENT.md`, `FUTURE.md`) and `GEMINI.md` | **HALT**        | "The project is already initialized. Use `/01-plan` or `/02-implement`."                                      |
   | `tasks/PRESENT.md` exists                                          | **Section 3.0** | "Resuming setup: Scaffolding is complete. Next: generate the first track."                                    |
   | `./DESIGN.md` exists                                               | **Section 2.6** | "Resuming setup: Aesthetics defined in `DESIGN.md`. Next: configure project workflow & temporal task system." |
   | `.agents/skills/` exists                                           | **Section 2.5** | "Resuming setup: Skills selected. Next: define project aesthetics (`DESIGN.md`)."                             |
   | `./GEMINI.md` exists                                               | **Section 2.4** | "Resuming setup: Sovereign Rules (`GEMINI.md`) defined. Next: select Skills."                                 |
   | (None)                                                             | **Section 2.0** | "Initializing new project setup."                                                                             |

4. **Proceed to Section 2.0:** You MUST proceed to Section 2.0 to establish the Greenfield/Brownfield context before jumping to your target.

---

## 2.0 STREAMLINED PROJECT SETUP

**PROTOCOL: Follow this sequence to perform a guided, interactive setup with the user.**

### 2.0.1 Resolve Project Taxonomy

1. **Analyze Project Type:** Look at the project goal and directory structure.
2. **Resolve Sovereign Architecture Files:**
   - **Sovereign Rules:** `./GEMINI.md` (Consolidates Foundation, Domain Mechanics, Infrastructure, Compliance & Security).
   - **Visual Identity:** `./DESIGN.md` (Governs Tokens, Tailwind utilities, Color Themes, and Kinetic Physics).
   - **Temporal System:** `tasks/PRESENT.md` (Active Mission Board & Pulse Log), `tasks/FUTURE.md` (Active Implementation Blueprint), and `archive/YYYY-MM/` (Permanent Vault).

### 2.0.2 Project Inception

1. **Detect Project Maturity:**
   - **Classify Project:** Determine if the project is "Brownfield" (Existing) or "Greenfield" (New) based on the following indicators:
   - **Brownfield Indicators:**
     - Check for dependency manifests: `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`.
     - Check for source code directories: `src/` containing code files.
     - If a `.git` directory exists, execute `git status --porcelain`. Ignore changes within the `tasks/` directory. If there are _other_ uncommitted changes, it may be Brownfield.
     - If ANY of the primary indicators (manifests or source code directories) are found, classify as **Brownfield**.
   - **Greenfield Condition:**
     - Classify as **Greenfield** ONLY if:
       1. NONE of the "Brownfield Indicators" are found.
       2. The directory contains no application source code or dependency manifests (ignoring the `tasks/` directory, a clean or newly initialized `.git` folder, and a `README.md`).

2. **Resume Fast-Forward Check:**
   - If the **Target Section** (from 1.2) is anything other than "Section 2.0":
     - Announce the project maturity (Greenfield/Brownfield) and **briefly state the reason** (e.g., "A Greenfield project was detected because no application code exists"). Then announce the target section.
     - **IMMEDIATELY JUMP** to the Target Section. Do not execute the rest of Section 2.0.
   - If the Target Section is "Section 2.0", proceed to step 3.

3. **Execute Workflow based on Maturity:**

- **If Brownfield:**
  - Announce that an existing project has been detected, and **briefly state the specific indicator you found** (e.g., "because I found a package.json file"). Be concise.
  - If `git status --porcelain` indicated uncommitted changes, inform the user: "WARNING: You have uncommitted changes in your Git repository. Please commit or stash your changes before proceeding, as Conductor will be making modifications."
  - **Begin Brownfield Project Initialization Protocol:**
    - **1.0 Pre-analysis Confirmation:**
      1. Inform the user that a brownfield project has been detected and request permission for a read-only scan.
      2. Ask: _"A brownfield (existing) project has been detected. May I perform a read-only scan to analyze the project?"_
      3. Upon confirmation, proceed to Code Analysis.

```markdown
- **2.0 Code Analysis:**
  1.  **Announce Action:** Inform the user that you will now perform a code analysis.
  2.  **Prioritize README:** Begin by analyzing the `README.md` file, if it exists.
  3.  **Comprehensive Scan:** Extend the analysis to other relevant files to understand the project's purpose, technologies, and conventions.

- **2.1 File Size and Relevance Triage:**
  1.  **Respect Ignore Files:** Check for `.geminiignore`, `.gitignore`, and `ignores.master.json`. Use their combined patterns to exclude token-heavy files like `node_modules`, `dist`, `.git`.
  2.  **Prioritize Key Files:** Focus analysis on high-value manifests and configuration files (`package.json`, `vite.config.js`, `svelte.config.js`, `tsconfig.json`).
  3.  **Extract Tech Stack & Domain:** Infer programming languages, UI frameworks, database/persistence models, and core domain concepts.
```

- **If Greenfield:**
  - Announce that a new project will be initialized.
  - If a `.git` directory does not exist, execute `git init`.
  - Inquire about the project goal: _"What do you want to build?"_
  - Create the foundational `./GEMINI.md` draft.
  - Proceed to Section 2.1.

---

### 2.1 Generate Sovereign Rules & Product Foundation (Interactive)

1. **Introduce the Section:** Announce that you will now help the user create the sovereign project rules (`./GEMINI.md`).
2. **Determine Mode:** Ask the user whether they prefer an **Interactive** walkthrough (answering questions about target users, core features, and architectural principles) or **Autogenerate** (drafting a comprehensive `GEMINI.md` based on project goals/scanned code).
3. **Gather Information (Conditional):**
   - **If "Autogenerate":** Draft based on scanned context or initial goal.
   - **If "Interactive":** Inquire about core goals, domain mechanics, and architectural requirements.
4. **Draft Sovereign Rules (`./GEMINI.md`):**
   - Structure `./GEMINI.md` with standard Conductor sections:
     - `## ⚔️ Sovereign Identity & Core Laws` (SOLID, DRY/KISS, TDD Mandate, Svelte 5 / Framework purity)
     - `## ⚡ Domain & System Mechanics` (Physics, Entity models, Round/Turn lifecycles)
     - `## 🏛️ System Architecture & Layer Boundaries` (Unidirectional data flow, State ownership)
     - `## 📜 System Standards & Security Policies` (Lexical nomenclature, Sanitization, Turn signals)
5. **User Review & Write File:** Present draft for user approval. Once approved, write to `./GEMINI.md`.

---

### 2.2 Technology Stack & Layer Hierarchy

1. **Introduce the Section:** Align the technical foundation, package dependencies, and unidirectional import layers.
2. **Determine Tech Stack:**
   - **Greenfield:** Recommend proven stack (e.g. Svelte 5 Runes, Vite, Dexie.js, Tailwind v4).
   - **Brownfield:** Confirm detected dependencies and architecture.
3. **Draft Architecture & Layer Rules in `./GEMINI.md`:**
   - Define layer boundaries (e.g. `src/ui` -> `src/state` -> `src/engine` -> `src/intelligence` -> `src/data` -> `src/platform`).
   - Define state ownership matrix (Runes stores vs persistence).
4. **Write/Update `./GEMINI.md`:** Ensure tech stack and layer rules are finalized in `./GEMINI.md`.

---

### 2.3 Select Skills & Styleguides (Interactive)

1. **Initiate Dialogue:** Recommend coding skills and styleguides from the available global skills (`~/.gemini/config/skills/`).
2. **Select Skills:**
   - **Greenfield:** Recommend skills matching the tech stack (e.g., `svelte`, `test`, `design`, `javascript`).
   - **Brownfield:** Identify matching skills based on the analyzed codebase.
3. **Action (Skill Injection):** For each selected project-specific skill:
   - If needed locally in the project workspace, scaffold into `.agents/skills/<skill_name>/SKILL.md`.
   - Ensure all `SKILL.md` files adhere to standard 2-field YAML frontmatter (`name` and `description`) and body persona callouts.

---

### 2.4 Aesthetics & Design System (Interactive)

1. **Introduce the Section:** Define the visual identity, styling tokens, and kinetic physics in `./DESIGN.md`.
2. **Determine Aesthetic Style:**
   - Choose theme palette (e.g. The Nordic Collection: Gunmetal, Chalk, Frozen tones; or custom palette).
   - Define typography, border radii, glassmorphism tokens, and micro-animations.
3. **Draft `./DESIGN.md`:**
   - Token definitions (CSS variables / Tailwind v4 mappings).
   - UI component layout patterns, modal alignment standards, and kinetic motion rules.
4. **User Review & Write File:** Once approved, write `./DESIGN.md`.

---

### 2.5 Configure Conductor Workflow & Governance

1. **Initialize Governance in `./GEMINI.md`:**
   - Enforce TDD cycle (Red-Green-Refactor).
   - Enforce Turn Signals (`> [Role emoji] [Role] | [active-skill] / [/workflow]`).
   - Enforce Pulse Log tracking in `tasks/PRESENT.md`.
2. **Confirm Settings:** Confirm test coverage requirements (>80%), commit conventions (`feat:`, `fix:`, `refactor:`), and phase checkpointing rules.

---

### 2.6 Initialize Temporal Task System (`tasks/`)

1. **Create `tasks/` Directory:** Ensure `tasks/` exists.
2. **Initialize `tasks/PRESENT.md`:**
   - Write active mission board, roadmap tracks, and the Pulse Skill Log table:

```markdown
# 🛰️ Present (The Mission Board)

## Active Mission

- Track: [None - Ready for /01-plan or Initial Track]

## Roadmap

- [ ] Initial System Implementation

## Pulse Skill Log

| Role        | Timestamp        | Task                     | Workflow / Skill / MCP | Outcome      |
| :---------- | :--------------- | :----------------------- | :--------------------- | :----------- |
| 🎭 Strategy | YYYY-MM-DD HH:MM | `[Setup Initialization]` | `/setup-conductor`     | 🔄 Completed |
```

1. **Announce:** "Initialized `tasks/PRESENT.md` dashboard."

---

## 3.0 INITIAL PLAN AND TRACK GENERATION

**PROTOCOL: Interactively define project requirements, propose the first track, and generate `tasks/FUTURE.md`.**

### 3.1 Generate Initial Product Requirements

1. **Analyze Context:** Read `./GEMINI.md` to understand core objectives and architecture.
2. **Gather Requirements:** Interactively align on key user stories, MVP deliverables, and edge cases.
3. **Draft Requirements:** Summarize initial scope for user review and approval.

### 3.2 Propose Initial Track

1. **Generate Track Title:** Formulate a focused, high-leverage initial track (e.g. `core-engine-loop` or `foundation-scaffold`).
2. **Confirm Proposal:** Present track proposal to the user for confirmation.

### 3.3 Convert Track into Implementation Blueprint (`tasks/FUTURE.md`)

1. **Generate `tasks/FUTURE.md`:**
   - **Goal & Strategic Context**: Objective, user stories, and architectural bounds.
   - **TDD Requirement**: Each feature broken into Red (failing test) -> Green (minimal pass) -> Refactor.
   - **Status Protocol**:
     - `- [ ] Task: ...` (Pending)
     - `- [~] Task: ...` (Active)
     - `- [x] <7-char-sha> Task: ...` (Completed with commit hash)
   - **Phase Checkpoint Tasks**: Append meta-task at the end of each logical phase:
     - `- [ ] Task: Conductor - Phase Checkpoint '<Phase Name>'`
2. **Update `tasks/PRESENT.md`:** Update the active mission and roadmap in `tasks/PRESENT.md`.

---

### 3.4 Final Announcement & Next Steps

1. **Commit Setup Files:** Execute git commit:
   `git add . && git commit -m "conductor(setup): initialize project rules, design tokens, and temporal task system"`
2. **Next Steps:** Announce completion and inform the user:
   > "Project setup is complete! You can now start implementation by running `/02-implement`."

> 🎭 Strategy | planning / `[/setup-conductor]`
