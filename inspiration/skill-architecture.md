# Production Patterns for Agent Skill Architecture and Knowledge Topologies (Unified Master Report)

The operational scaling of autonomous coding and workflow agents across harnesses such as Claude Code, Cursor, OpenAI Codex, Gemini CLI, and OpenCode has exposed a core architectural bottleneck: ad-hoc prompt engineering fails at organizational scale. When engineering teams transition from single-file system prompts to modular libraries containing dozens or hundreds of specialized workflows, naive file organization triggers systemic failures. Agents silently ignore local workflows in favor of outdated pre-training assumptions, pull irrelevant domain rules into active memory, exhaust token budgets on monolithic documentation files, and contaminate canonical project standards with ephemeral session logs.

To resolve these failure modes, production practitioners have converged on the open Agent Skills specification (`agentskills.io`, standardized following Anthropic's initial release in late 2025 and now supported across 40+ agentic clients) alongside deterministic control-plane topologies. Rather than treating agent guidance as passive prose, advanced architectures treat `SKILL.md` packages, root bootstrap files (`AGENTS.md`, `CLAUDE.md`), and auxiliary directories as a versioned control plane governing how a probabilistic model discovers, loads, executes, and updates organizational knowledge.

---

## 1. Frontmatter Trigger Engineering and Catalog Precision

### 1.1 Mechanics of Level 1 Discovery and Cross-Harness Divergences

Within the Agent Skills architecture, every skill lives in a dedicated directory containing a mandatory `SKILL.md` file prefixed with YAML frontmatter enclosed by `---` delimiters starting at line 1, byte 0. At session startup, the agent harness performs Level 1 (Discovery) loading by scanning installed skill directories and injecting only the frontmatter metadata into the system prompt. Empirical measurements across official skill catalogs show that Level 1 discovery consumes a median of 80 tokens per skill (ranging from 55 to 235 tokens, or ~100 tokens on average). Everything below the YAML frontmatter remains invisible on disk until the model selects the skill. Consequently, the frontmatter `description` is not passive documentation; it operates as the primary semantic routing classifier determining whether a skill activates or stays dormant.

While the base `agentskills.io` specification restricts frontmatter to six portable keys (`name`, `description`, `license`, `compatibility`, `metadata`, and the experimental `allowed-tools`), production harnesses diverge in how they extend and enforce these fields. A common cross-platform anti-pattern occurs when developers rely on non-standard fields like `triggers:`—a YAML list of activation phrases parsed only by external web catalogs to build searchable indexes. Agent runtimes completely ignore the `triggers` key during turn evaluation and match user intent exclusively against `description` and supported vendor extensions.

| Frontmatter Field / Sidecar          | Spec Status               | Constraints & Format                                                                                                                                            | Runtime Enforcement & Behavioral Mechanics                                                                                                                                                                                                                               |
| :----------------------------------- | :------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                               | Required (Open Spec)      | 1–64 chars; lowercase alphanumeric (`a-z`, `0-9`) and single hyphens (`-`); must match parent folder after NFKC normalization; no `--` or leading/trailing `-`. | Sets skill ID and `/skill-name` slash command. Case mismatches (e.g., folder `Code-Reviewer` vs `name: code-reviewer`) cause silent load failures on Linux/macOS.                                                                                                        |
| `description`                        | Required (Open Spec)      | 1–1,024 chars (hard-truncated at 1,536 chars combined with `when_to_use` in Claude Code); plain string without unescaped YAML colons (`:`).                     | Primary semantic routing mechanism across all 40+ compatible harnesses. Evaluated at startup against user requests and workspace context.                                                                                                                                |
| `when_to_use`                        | Vendor Extension          | Multi-line string or bulleted trigger scenarios (underscored key, unlike hyphenated fields).                                                                    | Appended directly to `description` in the skill listing by Claude Code, OpenClaw, and Codex CLI; silently ignored by other harnesses.                                                                                                                                    |
| `paths`                              | Vendor Extension          | Glob file patterns (e.g., `src/components/**/*.tsx`).                                                                                                           | Supported by Claude Code and Cursor. Gates automatic skill activation so the skill loads only when the agent touches matching files.                                                                                                                                     |
| `disable-model-invocation`           | Vendor Extension          | Boolean (`true`/`false`, `yes`/`no`, `1`/`0`).                                                                                                                  | Supported by Claude Code, VS Code Copilot, and Cursor. Drops description from startup context so the model never auto-triggers it; restricts execution to manual `/skill-name` calls for destructive workflows.                                                          |
| `user-invocable`                     | Vendor Extension          | Boolean (default `true`).                                                                                                                                       | Claude Code extension. Setting `false` hides the skill from the user's `/` autocomplete menu while keeping it available for automatic model invocation.                                                                                                                  |
| `context` & `agent`                  | Vendor Extension          | `context: fork`; `agent: Explore` / `Plan` / `general-purpose`.                                                                                                 | Claude Code extension. Spawns the skill inside an isolated subagent context window so heavy intermediate tool output does not pollute the primary thread.                                                                                                                |
| `allowed-tools` / `disallowed-tools` | Open Spec (Exp.) / Vendor | Space-delimited string or YAML list of tool names.                                                                                                              | Pre-approves tools without confirmation prompts (`allowed-tools`) or strips tools during active turn (`disallowed-tools`) in Claude Code and OpenClaw. Not a portable security boundary; Cursor, Copilot CLI, and OpenCode enforce permissions in separate config files. |
| `model` & `effort`                   | Vendor Extension          | Model ID string; `effort: low`, `medium`, `high`, `xhigh`, `max`.                                                                                               | Overrides active LLM (e.g., routing routine tasks to Haiku/Sonnet) and adjusts computation depth during skill execution in Claude Code.                                                                                                                                  |
| `agents/openai.yaml`                 | Vendor Sidecar File       | Separate YAML file inside skill directory (`policy`, `interface`).                                                                                              | OpenAI Codex isolates vendor config outside `SKILL.md`. Uses `policy.allow_implicit_invocation: false` to block auto-triggering while preserving explicit `$skill` calls.                                                                                                |

#### The Codex "Fail-Open" Sidecar Trap

A critical architectural divergence separates OpenAI Codex from Claude Code and Cursor. While Claude Code embeds `disable-model-invocation: true` directly inside `SKILL.md`, Codex keeps `SKILL.md` spec-clean and isolates vendor configuration inside an optional `agents/openai.yaml` sidecar file. Because the Codex runtime loader is engineered to "fail open"—silently dropping a malformed YAML sidecar with a warning while still loading `SKILL.md`—errors in invocation policy go undetected unless validated against the `plugin-creator` validator (which permits only three top-level keys, six interface keys, `allow_implicit_invocation` under `policy`, and six-character hex colors matching `^#[0-9A-F]{6}$`). Portable repositories must configure `disable-model-invocation: true` in `SKILL.md` **and** `allow_implicit_invocation: false` in `agents/openai.yaml` to ensure destructive operations cannot self-activate across harnesses.

### 1.2 Semantic Bait, the Trigger Triad, and Workflow Leakage Prevention

Under default operating conditions, frontier coding models exhibit strong **under-triggering inertia**. When given an engineering task, models frequently ignore installed skills and build parallel, ad-hoc implementations from pre-training weights. In controlled evaluations of Next.js 16 workflows conducted by Vercel, coding agents failed to invoke relevant installed skills in **56% of evaluation cases** when relying on standard descriptions. Worse, the mere presence of an uninvoked skill introduced selection distraction that reduced test pass rates from 63% (baseline with no documentation) down to 58%.

To overcome pre-training inertia within the 1,024-character portable limit, practitioners structure frontmatter descriptions using the **Trigger Triad**:

1. **Action-Oriented Capability Statement:** An opening sentence in the third-person impersonal voice (avoiding filler like _"users can"_ or _"this page explains"_) naming the exact artifacts produced, domain scope, and core mechanisms.
2. **Imperative Lexical Bait & Import-Path Anchors:** A middle section opening with `"Use when..."` or `"Apply when..."`, packed with concrete user intent phrases, developer shorthand, CLI flags, file extensions, and **literal code identifiers such as package import paths** (e.g., `` `github.com/library/foo` ``). Because the agent evaluates both the user's prompt and active workspace signals against `description`, embedding exact import paths bridges the lexical gap when a user prompt omits the overarching domain name.
3. **Negative Boundaries & Sibling Pointers:** A closing clause starting with `"Do NOT use for..."` or `"Not for..."` that establishes a hard perimeter against adjacent tasks and redirects the agent to competing sibling skills using fully qualified identifiers (e.g., `use samber/cc-skills-golang@golang-benchmark instead`).

#### Guarding Against Workflow Leakage

As documented in `samber/cc-skills-golang`, attempting to make descriptions more specific by pasting ordered procedural steps into the frontmatter triggers **workflow leakage**. When a `description` narrates an execution sequence (e.g., _"Write the benchmark, run it with -benchmem, save the baseline, apply the change, re-run, then compare with benchstat"_), the LLM executes those summarized steps directly from the Level 1 system prompt and skips reading `SKILL.md` off disk altogether. Frontmatter must state _what_ the skill covers and _when_ to trigger, never _how_ to execute the steps.

### 1.3 Catalog-Wide Calibration Protocol ($M \times N$ Classification)

Evaluating a skill in isolation fails to expose production routing breakdowns. Skill activation is a **coupled, catalog-wide classification problem** governed by Precision and Recall across an $M \times N$ evaluation matrix of $M$ user prompts and $N$ installed skills:

- **Under-triggering (Recall Failure):** The skill fails to load on prompts it legitimately owns, causing the agent to silently reinvent fragile logic.
- **Over-triggering (Precision Failure):** The skill activates on prompts outside its domain. Over-triggering is particularly insidious in production because the agent still generates a plausible-looking response while burning thousands of tokens on irrelevant reference files and applying wrong architectural constraints.

Academic benchmarking on `SkillsBench` and `Claude Skill Registry Core` across 79,141 candidate skills (including 780 adversarial LLM-generated hard distractors) identifies the root cause of routing fragility as **hidden-body asymmetry**. Because the router inspects only the ~100-token metadata while discriminative details remain hidden in the `SKILL.md` body, metadata-only routing breaks down under three distractor conditions: _same domain but different problem_, _same technology but different use_, and _over-generalized capability_.

Engineering teams resolve catalog coupling via a five-step calibration protocol:

1. **Zero-Cost Static Lexical Diff:** Diff all $N(N-1)/2$ pairs of skill descriptions to flag shared nouns and overlapping trigger verbs before running any LLM calls.
2. **Pairwise Confusion Matrix:** Test any two competing skills against ~25 positive prompts per skill and ~10 near-miss negative prompts, normalizing engagement across harnesses into a single boolean (native skill-invocation tool call or reading the skill's files off disk).
3. **Negative-Region Sampling:** Include general coding requests that no specialized skill should claim, tagged with `"expected_skills": []`.
4. **Boundary Clarification Over Keyword Stuffing:** Instead of pasting failed prompt words into `description`, sharpen the conceptual boundary between sibling skills. Adding a single boundary-clarifying sentence to disambiguate competing descriptions increased catalog micro-recall from **46.3% to 67.3%** in production case studies.
5. **CI Threshold Gating:** Once metrics stabilize (targeting an 80–90% auto-trigger rate on positive queries), enforce CI gates requiring **Precision $\ge 0.90$** and **Recall $\ge 0.70$** so a single description edit cannot quietly degrade routing across the repository.

### 1.4 Production Frontmatter Refinements: Before and After

| Failure Mode                                | Defective Frontmatter (`Before`)                                                                                                                          | Optimized Frontmatter (`After`)                                                                                                                                                                                             | Architectural Mechanism of Fix                                                                                                                                            |
| :------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Under-Triggering (Vague Scope)**          | `description: Implements X in Golang using library/foo`                                                                                                   | `description: Implements X in Golang using library/foo — feature A, feature B, and feature C. Apply when using or adopting library/foo, or when the codebase imports github.com/library/foo.`                               | Replaces passive label with concrete sub-features, imperative `"Apply when..."` bait, and literal codebase import path matching (`samber/cc-skills-golang`).              |
| **Under-Triggering (Missing User Lexicon)** | `description: A helpful tool for developers to format git commits.`                                                                                       | `description: Writes conventional commit messages from staged git changes. Use when the user asks to commit, write a commit message, or says "commit this."`                                                                | Aligns description with exact natural-language imperatives (`"commit this"`) typed by developers during git workflows (`agensi.io`).                                      |
| **Over-Triggering (Broad Domain Grab)**     | `description: Use when writing code, reviewing style, or writing comments in Golang.`                                                                     | `description: Golang code style conventions. Use when the user explicitly asks about formatting, style review, or project coding standards.`                                                                                | Eliminates catch-all verbs (`"writing code"`) that match 100% of Go sessions; restricts activation to explicit style/formatting inquiries (`samber/cc-skills-golang`).    |
| **Over-Triggering (Exploratory Bleed)**     | `description: Statistical analysis and data processing for CSV files.`                                                                                    | `description: Advanced statistical analysis for CSV data. Use for regression, clustering, and modeling. Do NOT use for simple data exploration.`                                                                            | Appends an explicit negative filter (`"Do NOT use for..."`) to block the skill from hijacking basic CSV inspection tasks.                                                 |
| **Sibling Collision (Overlapping Nouns)**   | `description: Optimizes Go code performance and benchmarks.`                                                                                              | `description: Go runtime performance optimization patterns. Do NOT use for measurement methodology — use samber/cc-skills-golang@golang-benchmark instead.`                                                                 | Resolves keyword collision between optimization and benchmarking skills by naming the exact sibling package ID in a negative boundary clause.                             |
| **Workflow Leakage (Procedural Spoiling)**  | `description: Golang benchmarking. Write the benchmark, run it with -benchmem, save the baseline, apply the change, re-run, then compare with benchstat.` | `description: Golang benchmark measurement methodology — benchstat comparison, profiling interpretation, CI regression detection. Use when measuring Go performance, writing benchmarks, or interpreting benchmark output.` | Strips ordered execution steps from metadata so the agent cannot execute a shallow summary from the system prompt without loading `SKILL.md` (`samber/cc-skills-golang`). |

---

## 2. Router Skills, Passive Indexes, and Progressive Disclosure

### 2.1 Three-Tier Progressive Disclosure and Token Economics

The Agent Skills architecture decouples total installed capability breadth from active context window consumption through a three-tier loading pipeline:

- **Tier 1 (Discovery):** Only `name` and `description` load into the system prompt at startup (~80–100 tokens per skill), allowing an agent to index 50 skills for ~4,000–5,000 tokens.
- **Tier 2 (Activation):** When a task matches a skill's description, the agent reads the `SKILL.md` body into working memory, bounded by a recommended ceiling of **500 lines and 5,000 tokens**. Because an activated inline skill remains in conversation history for the rest of the session unless isolated via `context: fork`, practitioners write `SKILL.md` bodies as standing operational directives rather than single-turn instructions.
- **Tier 3 (Execution):** Auxiliary files in `references/`, `scripts/`, and `assets/` consume **zero tokens** until `SKILL.md` explicitly directs the agent to read a targeted reference leaf or run a bundled script.

### 2.2 Root Bootstrap Files vs. Active Skills: The Vercel Benchmark & Sequencing Sensitivity

Determining what belongs in always-on root files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`) versus on-demand `SKILL.md` packages is a critical architectural choice. Empirical evaluations by Vercel on Next.js 16 APIs absent from model pre-training (`'use cache'`, `cacheLife()`, `cacheTag()`, `forbidden()`, `unauthorized()`, and `proxy.ts`) demonstrate that passive root indexes and active skills serve distinct operational roles:

| Configuration                             | Overall Pass Rate | vs. Baseline | Build    | Lint     | Test     |
| :---------------------------------------- | :---------------- | :----------- | :------- | :------- | :------- |
| **Baseline (No Docs)**                    | 53%               | --           | 84%      | 95%      | 63%      |
| **Skill (Default Behavior)**              | 53%               | +0 pp        | 84%      | 89%      | 58%      |
| **Skill (With Explicit Instructions)**    | 79%               | +26 pp       | 95%      | 100%     | 84%      |
| **AGENTS.md Compressed Docs Index (8KB)** | **100%**          | **+47 pp**   | **100%** | **100%** | **100%** |

When engineers added explicit directives in `AGENTS.md` commanding the agent to use the skill, trigger rates exceeded 95% and overall pass rates rose to 79%, but exposed **Discovery Premature Anchoring (Sequencing Sensitivity)**:

- Commanding `"You MUST invoke the skill"` caused the agent to read generic documentation templates _before_ inspecting the repository, leading it to write `page.tsx` properly while omitting required modifications to `next.config.ts`.
- Rewording the mandate to **`"Explore project first, then invoke skill"`** forced the agent to build a local mental model of the repository before loading skill references, fixing the configuration omission.
- Compressing the 40KB documentation corpus by 80% into an **8KB pipe-delimited index** embedded directly inside `AGENTS.md`—mapping directory paths to local `.mdx` files in `.next-docs/` (e.g., `|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx}`) alongside a directive prioritizing retrieval-led lookup over pre-training synthesis—achieved a **100% pass rate** across Build, Lint, and Test.

#### Production Division of Labor

1. **Root Bootstrap Files (`AGENTS.md` / `CLAUDE.md`):** Keep compact (target <60 lines, hard cap <150 lines in `rohitg00/pro-workflow`, while disabling unused MCP servers to keep active tools under 80 across <10 MCP servers). House horizontal invariants: build/test commands, the exploration-first sequencing rule, compressed pipe-delimited framework doc indexes, and master routing tables.
2. **Modular Skills (`.agents/skills/<name>/SKILL.md`):** Reserve for vertical, action-specific workflows (schema migrations, PR audits, multi-file refactors) requiring executable scripts, templates, or isolated subagents.
3. **Cross-Harness Symlink Deduplication:** Store canonical skills in `.agents/skills/<skill-name>/SKILL.md` and commit relative symlinks inside `.claude/skills/<skill-name>` (and `.cursor/skills/<skill-name>`) pointing to `../../.agents/skills/<skill-name>`, leveraging native symlink deduplication so each skill loads only once.

### 2.3 Two-Tier Skill Discovery and Meta-Skill Router Archetypes

When repositories scale to 40, 50, or 500+ skills, flat Tier 1 discovery suffers from context bloat and keyword collisions. Practitioners restore precision using four **Two-Tier Meta-Skill Router** architectures:

1. **Categorized Index with `[human]` vs `[auto]` Tags (`rohitg00/pro-workflow`):** Coordinates 41 skills, 23 commands, 8 agents, and 24 hook events via `skill-router/SKILL.md` grouped by job domain (_Self-correction and memory_, _Multi-agent and parallel work_, _Context and tokens_, _Design and writing_). Each entry declares `[human]` (deliberate, side-effectful, or ritual workflows with `user-invocable: true`) or `[auto]` (background skills firing automatically from narrow descriptions), accompanied by explicit _"when to reach"_ tiebreaker clauses for adjacent skills.
2. **Interactive Suggest vs. Conservative Auto Mode (`pcx-wave/skill-router`):** Scans `~/.claude/skills/` into a lightweight index. In _Suggest mode_, it intercepts requests, presents 1–2 candidate skills with one-line descriptions, and waits for a binary `1/no` confirmation before loading `SKILL.md`. In _Auto mode_ (`/skill-router on --auto`), it dispatches high-confidence matches, appends `*(via skill-name)*` to the output, and enforces a strict **"one skill per request"** rule to prevent recursive meta-routing loops.
3. **Multi-Skill Orchestration Topologies (`Liber1917/skill-router` & Contentstack):** Routes across 8+ harnesses using 50+ rules that chain sub-intents via _pipeline_ (sequential), _parallel_, or _compose_ topologies. Enforces human-in-the-loop governance via a `LOAD GUARD` (pre-load confirmation), a `VERIFY HOOK` (post-execution check), a network fallback (`npx skills find`), and an optional Python CLI (`cli/`) for batch TF-IDF maintenance.
4. **Hook-Driven Body-Aware Routers for 500+ Skills (`UserPromptSubmit` + `SkillRouter`):** For massive catalogs (e.g., 581-skill personal libraries or 79,141-skill pools), teams bind an external router script or compact body-aware encoder to the `UserPromptSubmit` hook. By indexing `name`, `description`, and capped implementation `body` text to overcome hidden-body asymmetry, hook-driven routers dynamically inject only the top matching skills per turn, achieving **90.6% (29/32) top-1 accuracy** across a 581-skill production library.

### 2.4 Deterministic 5-Layer Control Plane (`madsoftwaredev/opencode-config`)

To prevent a probabilistic model from simultaneously inferring intent, choosing policy, selecting tools, and generating code in a single unconstrained pass, `madsoftwaredev/opencode-config` enforces _"Route Before You Execute"_ across five layers:

- **Layer 1 (Governance / Constitution):** Uses `opencode.json` and `AGENTS.md` to enforce precedence (project-local `.opencode/skills/` supersede global skills; retrieval-led lookup beats pre-training) and tool-level secret/command gates.
- **Layer 2 (Routing / Leaf Decision Surfaces):** Repurposes `SKILL.md` into a lightweight domain router pointing to narrow leaf files (`<leaf-topic-a>.md`, `<leaf-topic-b>.md`) inside the skill directory so loading a Next.js server-action leaf never pulls unrelated framework rules into working memory.
- **Layer 3 (Execution / Role Temperatures):** Defines agents in `opencode.json` by strict tool permissions and sampling temperatures—precision contract roles (`plan`, `mega-plan`, `code-reviewer`, `security-auditor`) run at `temperature: 0.1` with read-only/gated bash access, while exploratory synthesis roles (`web-designer`) run at `temperature: 0.3`.
- **Layer 4 (Enforcement):** Uses `SkillGuard` and permission gates to block file edits until the agent has explored the repo, loaded the domain `SKILL.md` router, and read the required leaf document.
- **Layer 5 (Lintable Quality):** Validates routing tables and leaf links in CI so structural drift fails the build.

### 2.5 Preserving Navigation Paths Across Context Compaction

In long sessions, auto-compaction fires at ~95% context capacity by default in Claude Code, summarizing conversation history and truncating invoked skills to their **first 5,000 tokens** (within a shared 25,000-token ceiling across active skills). Left unmanaged, compaction causes the agent to lose its role identity, drop bottom-of-file verification checklists, or invent phantom constraints.

Production setups combine structural front-loading with lifecycle hooks:

1. **Early Compaction Override & Front-Loading:** Set `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50` (or run manual `/compact` at 50–70% capacity at clean task boundaries), and place all non-negotiable invariants and reference loading maps in the **top 100 lines** of `SKILL.md` so they survive 5,000-token truncation.
2. **Pre-Compaction Serialization (`PreCompact` Hook):** Trigger `compact-guard` and `session-handoff` (`rohitg00/pro-workflow`) to serialize active file paths, task progress, open blockers, and uncommitted state to `.agents/scratchpad/compact-state.json` prior to summarization.
3. **Post-Compaction Re-Anchoring (`SessionStart` Hook with `source: compact`):** Using the `swingerman-reorient` pattern, automatically invoke `/engineer.reorient` immediately after compaction to run a strict, read-only 4-step recovery:
   - **Step 1 (Resolve Scope):** Execute `${CLAUDE_PLUGIN_ROOT}/scripts/dae_resolve.py` to resolve the methodology root and active feature folder from the git branch or slug.
   - **Step 2 (Reload Discipline Contract & Task Pointer):** Read `CHARTER.md` to restore autonomy boundaries; run `dae_progress.py <feature-dir>` against `progress.md` to extract the pipeline **breadcrumb line** and Checkpoint Exit Contract; read `feature.md` to prevent goal drift; and run `dae_handoff.py <feature-dir>` to detect unverified prior checkpoints.
   - **Step 3 (Emit Consolidated Orientation Block):** Output a 5-line orientation block stating role/autonomy, feature checkpoint/exit criteria, current task/next action, non-negotiables, and charter constraints.
   - **Step 4 (Halt Without Side Effects):** Stop immediately without editing files or creating handoff exhaust, returning control to the operator with full navigation context restored.

---

## 3. Granular Markdown Addressability and Auxiliary File Structure

### 3.1 The One-Hop Rule and Empirical H2 Macro-Component Taxonomy

Every production skill enforces the **One-Level-Deep Reference Constraint**: `SKILL.md` must link directly to supporting files using relative paths from the skill root (`references/REFERENCE.md` or `scripts/extract.py`) rather than chaining multi-hop links (`file-a.md` $\rightarrow$ `file-b.md` $\rightarrow$ `file-c.md`), where agents routinely halt after the first hop.

Empirical analysis of production `SKILL.md` files segmented at the **H2 (`##`) heading level** shows convergence on ten standardized semantic macro-components:

| H2 Macro-Component (% of Skills)                         | Constituent Lower-Level Sub-Components (% Occurrence)                                                                                                                                        | Operational Role in Progressive Disclosure                                                                                     |
| :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **Task** (`74.4%`)                                       | `Steps Instruction` (`49.2%`), `Subtask Instruction` (`24.0%`), `Error Handling` (`18.5%`), `Environmental Variation` (`10.1%`).                                                             | Decomposes the primary workflow into ordered execution phases, self-contained sub-procedures, OS branches, and recovery steps. |
| **Introduction** (`63.5%`)                               | `Prerequisites` (`31.1%`), `Skill Trigger` (`23.1%`), `Skill Summary` (`21.0%`), `Quick Start` (`8.8%`), `Skill Directory Format` (`8.0%`), `Authentication` (`4.6%`).                       | Establishes pre-flight checks, in-body positive/negative trigger confirmations, directory maps, and auth gates.                |
| **References** (`57.1%`)                                 | `Reference Files` (`31.1%`), `Commands` (`15.1%`), `Domain Knowledge` (`13.9%`), `Tips` (`13.5%`), `Related Skills` (`8.0%`), `Utility Scripts` (`5.9%`), `Standards` (`1.3%`).              | Acts as the Tier 2-to-Tier 3 dispatch table, instructing the agent exactly when to read `references/` or run `scripts/`.       |
| **Principles** (`42.0%`)                                 | `Rules` (`39.1%`), `Generation Quality` (`5.5%`), `Instruction Hierarchy` (`1.3%`).                                                                                                          | Enforces standing invariants, conflict precedence, and artifact quality bars throughout the session.                           |
| **Usecase** (`32.8%`)                                    | `Common Patterns` (`20.2%`), `Examples` (`17.7%`).                                                                                                                                           | Provides concrete input/output pairs and reusable idioms that anchor model pattern-matching.                                   |
| **Context** (`28.2%`)                                    | `Ambiguity Handling` (`10.5%`), `Decision Tree` (`8.8%`), `Target System Orientation` (`5.0%`), `Guardrail Condition` (`4.2%`), `Additional Context` (`2.9%`), `Persona Injection` (`1.3%`). | Guides conditional branching, stop triggers, and role framing when tasks admit multiple valid paths.                           |
| **Output Format** (`23.5%`)                              | `Return Artifact` (`21.9%`), `Lessons Learned` (`1.3%`), `Procedural Documentation` (`1.3%`).                                                                                                | Defines the exact schema, Markdown table layout, or file artifact the skill must emit upon completion.                         |
| **Practice** (`23.1%`)                                   | `Best Practices` (`11.8%`), `Anti-Patterns` (`11.3%`).                                                                                                                                       | Pairs recommended conventions with explicit `// Bad` vs `// Good` pitfalls to block known model failure modes.                 |
| **Evaluation** (`21.4%`)                                 | `Review Checklist` (`12.6%`), `Running Tests` (`9.2%`), `Debugging` (`1.3%`).                                                                                                                | Establishes mandatory self-verification gates and test execution commands required before completion.                          |
| **Tools, MCP & Architecture** (`4.6%` / `3.8%` / `2.1%`) | `Tools` (`4.6%`), `MCP Integration` (`3.8%`), `Agent Composition` (`1.7%`), `Model Choice` (`0.8%`), `Skill in a Skill` (`1.7%`), `Metadata` (`1.7%`), `Explaining to Human` (`1.3%`).       | Coordinates pre-authorized tool usage, MCP server pipelines, subagent delegation, and nested skill composition.                |

### 3.2 Section-Level Addressing, Graph Indexers, and Content Negotiation

When reference suites span hundreds of files, reading full files wastes context, raw `grep` strips governing headings and tables, and fixed-window vector RAG chunks sever paragraphs from policy headers. Production coding agents retrieve exact Markdown subtrees through five structural mechanisms:

1. **Local SQLite Structural Graph Indexers (`vexp-cli`):** Installed via `npm install -g vexp-cli && vexp setup`, `vexp` parses every `.md`, `.mdx`, and `.markdown` file into a local SQLite graph where each file is a `Document` node, each heading (`#`–`######`) is a nested `Section` node carrying its body text and tables, and each URL is a `Link` node. Connected to 17 agents over MCP, `vexp` resolves queries in a single `run_pipeline` call—combining TF-IDF and full-text search with graph-structure ranking to return only relevant sections within a strict token budget (`vexp capsule --explain`).
2. **Immutable Section IDs and SHA-256 Delta Syncing (`OpenTrain` Playbook Protocol):** Playbooks are bounded to $\le 64$ sections per version and $\le 12,000$ characters per section, indexed by a **stable `section_id`** (persisting across reorders), a **SHA-256 content hash**, and the heading level/body. When a playbook updates, the response carries a `recommendation.agent_guide_changed` flag with `fromVersion` and `toVersion` so the agent fetches only modified sections.
3. **Cryptographic Section Traceability & CLI Outline Slicing (`SpecRegistry` / Line-Range TOCs):** `SpecRegistry` verifies local Markdown specs against signed cryptographic manifests in CI to block unapproved "shadow specs," tagging sections with requirement IDs (`REQ-102`) for code-comment traceability and tracking **Token ROI** per section. For local files >100 lines without an MCP indexer, skills embed explicit **Line-Range Table of Contents (TOCs)** or use CLI outline tools (`markdown-toc`, `convert-plaintext-to-md --header [1-4] -s <line|eof>`, or `mdq`) so agents read targeted line offsets rather than whole files.
4. **Hierarchical `llms.txt` and HTTP Content Negotiation (`Accept: text/markdown`):** Standard HTML fetches force harnesses (such as Claude Code using `Turndown`) through a lossy HTML-to-Markdown conversion followed by a secondary LLM summarization pass. Platforms like Snowflake (`docs.snowflake.com/llms.txt`) expose hierarchical section indexes and `.md` URL suffixes (`create-table.md`), while servers run by Sanity, Remotion, Bun, and nuqs honor Claude Code's native `Accept: text/markdown` header by returning `Content-Type: text/markdown`—causing Claude Code to **skip its internal summarization pass entirely** and inject the exact Markdown section verbatim.

### 3.3 Agentic Script Engineering (`scripts/`) and Dynamic Context Injection

Offloading deterministic work to `scripts/` eliminates duplicated agent logic and keeps source code out of the context window—the model pays tokens only for the CLI call and its `stdout`/`stderr` output. Production scripts enforce six engineering contracts:

1. **Self-Contained Zero-Install Executables (PEP 723 & Deno):** Python scripts embed **PEP 723 inline metadata** declaring `requires-python` and PEP 508 version-pinned dependencies (e.g., `"beautifulsoup4>=4.12,<5"`), running cleanly via `uv run ${CLAUDE_SKILL_DIR}/scripts/introspect.py` with reproducible lockfiles (`uv lock --script`), while JS/TS scripts use Deno `npm:` or `jsr:` semver pins.
2. **Two-Stage Discovery-Then-Drill CLI Output:** Because agent harnesses silently truncate tool `stdout` exceeding **10,000 to 30,000 characters**, scripts default to a compact summary (`introspect.py --summary` emitting structured `agent_actions[]` in `netresearch/php-modernization-skill`) and provide flags to drill into specific violations (`--check PM-XX`), paginate (`--offset`), or write to disk (`--output FILE`).
3. **Zero Interactive Prompts:** Scripts never block on interactive `stdin` prompts; they fail fast with distinct exit codes, `--help` usage examples, and closed-set enum error messages (`Error: --env is required. Options: development, staging, production`).
4. **Machine-Delimited JSON & Mandatory Dry-Run Modes:** Outputs default to `--format json` rather than whitespace-aligned ASCII tables, and stateful operations require `--mode dry-run` previews.
5. **Schema Validation State Gates (`Ar9av/PaperOrchestra`):** Deterministic validation scripts block downstream multi-agent steps until artifacts conform to schema—for example, barring `outline-agent` from appending `## §1 · Core Claim and Narrative` to `workspace/research_brief.md` until `validate_outline.py` validates `workspace/outline.json` against `references/outline_schema.json`.
6. **Dynamic Context Injection (DCI):** Placing a bang-prefixed backtick command (`!`uv run ${CLAUDE_SKILL_DIR}/scripts/introspect.py --summary``) inside `SKILL.md`executes the command at skill activation time and injects its`stdout` inline before the agent takes its first turn, saving 2–3 discovery tool-call rounds.

---

## 4. Epistemic Separation and Markdown Exhaust Management

### 4.1 The Three-Tier Epistemic Promotion Pipeline

Allowing worker agent sessions to write directly to canonical files (`CLAUDE.md`, `AGENTS.md`, or `PITFALLS.md`) turns rulebooks into noisy diaries filled with speculative diagnoses and stale notes. Production teams enforce a **Three-Tier Epistemic Promotion Pipeline**:

| Epistemic Tier                                       | Primary Workspace Artifacts                                                                                                                                           | Agent Write & Mutation Authority                                                                                                                            | Indexer & Retrieval Treatment                                                                                                                                          | Promotion Gate & Graduation Mechanics                                                                                                 |
| :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Tier 1: Ephemeral Exhaust & Mutable Scratchpad**   | `.agents/scratchpad/worklog.md`, `compact-state.json`, dated files in `notes/` or `journal/`, and `OpenTrain` proposals (`SECTION_UPSERT`, `SECTION_REMOVE`, `NOTE`). | Worker sessions append one-line `Pitfall candidate:` tags to `worklog.md` or submit non-enforced `RECOMMENDED` proposals with `dedupeKey` and a 1h–90d TTL. | Never loaded at startup; graph indexers (`vexp`) automatically classify dated `notes/` and `journal/` files as historical records and rank them below canonical specs. | Reviewed at `/wrap-up` by a human or curator skill; unaccepted `OpenTrain` proposals expire automatically when their TTL elapses.     |
| **Tier 2: Empirical Scar Tissue & Failure Parables** | Repository-root `MISTAKES.md` and skill-local `PITFALLS.md` (or `references/pitfalls.md`).                                                                            | Restricted write access; updated only upon human correction, `/wrap-up` verification, or dedicated lessons-learned curator skills.                          | Referenced at line 1 of `SKILL.md` or `CLAUDE.md` so the agent consults domain pitfalls immediately before editing code.                                               | Acts as an empirical frequency counter; when a failure pattern reaches **4 to 5 occurrences**, it graduates to Tier 3.                |
| **Tier 3: Verified Canon & Executable CI Gates**     | Root `CLAUDE.md`, `AGENTS.md`, `LAWS.MD`, signed `SpecRegistry` bundles, and automated CI hygiene test scripts.                                                       | Immutable to worker agents; requires human publication (`OpenTrain` SHA-256 exact-hash check) or signed manifest verification in CI.                        | Persisted in every turn's system prompt (`AGENTS.md` / `CLAUDE.md`), survived across compactions, or enforced deterministically by CI runners.                         | Redundant historical entries are pruned from `MISTAKES.md` once codified in `CLAUDE.md` and backed by an automated red/green CI test. |

> **The CI Graduation Rule:** Mature teams graduate 4–5x recurring mistakes not merely into prose rules in `CLAUDE.md`, but into **executable CI hygiene tests** (`scripts/ci_hygiene.sh`). After an agent repeatedly introduced a Cyrillic homoglyph (`'е'`) into source comments, the engineering team had the agent write a CI grep check failing the build on lookalike characters (which immediately caught a Cyrillic `'И'` inside the test file itself on its first run)—operating on the principle that _"a rule can be ignored; a red test cannot."_

### 4.2 Structuring Failure Parables and Solving Central Board Rule Blindness

Across production repositories—including `Blockstream/green_qt` (`doc/agents/pitfalls.md`), `wshobson/agents` (`vision-sft`), `netresearch/php-modernization-skill`, `mittwald/agent-skills`, `ajianaz/agentboard`, and `restatedev/skills`—high-signal failure parables follow four structural rules:

1. **The Triadic Entry Format (`Trigger` / `Wrong Behavior` / `Correct Behavior`):**
   - **Trigger (Silent Killer Symptom):** Names the exact context or deceptive signal—e.g., `wshobson/agents` warning that an image-tag placeholder mismatch in VLM fine-tuning throws no error in most collators, but silently misaligns media and text so the model _"trains but learns nothing,"_ evidenced by a flat eval score alongside a normal loss curve.
   - **Wrong Behavior (Root Cause):** Provides a concrete `// Bad` code snippet and explains why naive heuristics fail (e.g., regex heading counters fooled by `#` comments inside code blocks, or C++ setters omitting early `if (m_name == name) return;` guards in `Blockstream/green_qt`).
   - **Correct Behavior (Hard Pairing Rule):** Provides a copy-pasteable `// Good` snippet and non-negotiable parameter pairings (e.g., `finetune_vision_layers=False` is mandatory when `fast_inference=True` because vLLM cannot serve LoRA adapters on vision layers).
2. **The Locality Fix (Co-Locating `PITFALLS.md`):** Placing rules on a central project board fails when an agent opens a target source file directly and has no reason to check the central board. Co-locating `PITFALLS.md` inside the skill folder and referencing it at the very top of `SKILL.md` (or inside the directory's local `AGENTS.md`) guarantees the guardrail loads at the exact point of work.
3. **Logging Human Operator Mistakes:** Recording human prompting traps in `MISTAKES.md` or `PITFALLS.md` (e.g., an operator asking to mock cryptographic signature checks in integration tests) equips the agent to recognize and push back against repeated bad instructions from humans.
4. **Automated Codebase Lore Extraction (`LORE` MCP Server):** For legacy repositories where architectural intent is buried in git history, running `lore init` extracts architectural decision records and exposes them to Cursor and Claude Code on demand via MCP without bloating static rule files.

### 4.3 Multi-Agent Write Governance and Exhaust Cleanup Routines

In multi-agent setups—where teams choose between **Manager/Worker (fan-out)** for 90% of parallel subtasks, **Pipeline (sequential)** for staged transformations, and **Hierarchical (tree)** for recursive monorepo audits—shared mutable state is strictly isolated:

- **Immutable Written Briefs & Independent Verification:** Every worker assignment starts from a committed brief (`features/<id>/brief.md`) with explicit positive and negative scope (`"do X only, do not begin Y"`), dated amendments instead of in-place edits, and independent verification so no agent approves its own output.
- **Worktree Isolation & Cache Invalidation:** Workers run in isolated git worktrees (`parallel-worktrees` in `rohitg00/pro-workflow`) or `context: fork` subagents, barred from running `git checkout --` outside their scope in shared trees or trusting warm static-analysis caches (`rm -rf /tmp/phpstan-* var/cache/phpstan` after vendor updates in `netresearch/php-modernization-skill`).
- **Typed Multi-Tenant Memory Schemas (`ScopedRecord`):** Database-backed memory systems (such as the Oracle AI Memory SDK) partition state across eight typed tables with row-level `tenant_id` security, provenance tracking, supersession versioning, and hard-delete TTLs.
- **Branch-Close Hygiene (`deslop` & `skill-optimizer`):** Before merging a branch, operators run `deslop` to strip AI-generated defensive boilerplate and lint `SKILL.md` budgets, while `skill-optimizer` compiles session corrections into compact skill updates.

---

## 5. Deliverable 1: Curated Production Repositories & Reference Architectures

| Repository / Project                              | Primary Architectural Pattern                                       | Key Mechanisms & Artifacts                                                                                                                                                                    | Supported Harnesses                                         |
| :------------------------------------------------ | :------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| **`madsoftwaredev/opencode-config`**              | Deterministic 5-Layer Control Plane & Skills Router                 | Separates routing (`SKILL.md` pointing to `<leaf>.md` decision surfaces) from probabilistic generation; enforces exploration-first via `SkillGuard`; sets role temperatures (`0.1` vs `0.3`). | OpenCode, Claude Code, `AGENTS.md` clients                  |
| **`rohitg00/pro-workflow`**                       | Meta-Skill Index Router, Self-Correcting Memory & Compaction Guards | 41 skills, 23 commands, 24 hook events; `skill-router` tagging `[human]` vs `[auto]` modes; `compact-guard`, `deslop`, `skill-optimizer`, and `parallel-worktrees`.                           | Claude Code, Cursor, Codex, Gemini CLI (32+ agents)         |
| **`samber/cc-skills-golang`**                     | Frontmatter Trigger Engineering & Sibling Disambiguation            | Codifies "pushy" Trigger Triad descriptions, literal import-path bait, sibling cross-references (`@golang-benchmark`), and workflow-leakage prevention.                                       | Claude Code, Cursor, Copilot CLI, OpenCode                  |
| **`Liber1917/skill-router`**                      | Cross-Platform NL Meta-Router & Multi-Skill Pipelines               | 50+ routing rules chaining skills via _pipeline_, _parallel_, and _compose_ modes; `LOAD GUARD` and `VERIFY HOOK` HITL gates; optional TF-IDF CLI.                                            | Claude Code, Cursor, OpenCode, Codex, Gemini CLI, WorkBuddy |
| **`pcx-wave/skill-router`**                       | Local Graveyard Scanner with Suggest / Auto Modes                   | Scans `~/.claude/skills/`; interactive `1/no` Suggest prompt vs high-confidence `--auto` routing with one-skill-per-request spiral protection.                                                | Claude Code                                                 |
| **`netresearch/php-modernization-skill`**         | Two-Stage CLI Introspection & Multi-Agent Hazard Guardrails         | Pairs cheap discovery (`introspect.py --summary`) with `--check PM-XX` drill-downs, mandatory `--mode dry-run`, and `references/multi-agent-pitfalls.md`.                                     | Claude Code, `agentskills.io` clients                       |
| **`wshobson/agents` (`vision-sft`)**              | Domain-Specific Silent Killer Checklists & Hard Pairing Rules       | Offloads per-architecture tables and validation checklists to `references/collators-and-pitfalls.md`; codifies non-tunable parameter pairings.                                                | Claude Code, multi-agent plugin harnesses                   |
| **`mittwald/agent-skills` & `restatedev/skills`** | Modular Playbook Routing & Dedicated Pitfall Ledgers                | Separates core workflows in `SKILL.md` from `references/pitfalls.md` (25+ migration gotchas) and `references/api-and-pitfalls.md`.                                                            | Claude Code, Cursor, VS Code Copilot                        |
| **`Ar9av/PaperOrchestra` (`outline-agent`)**      | Schema-Validated Section Appends to Shared Briefs                   | Enforces `scripts/validate_outline.py` JSON schema gate before appending `## §1` Markdown block to shared `workspace/research_brief.md`.                                                      | TypingMind, Claude Code, generic LLM harnesses              |
| **`swingerman-reorient`**                         | Post-Compaction Context Re-Anchoring & Breadcrumb Recovery          | Triggered via `SessionStart` (`source: compact`) hook; runs `dae_resolve.py`, `dae_progress.py`, and `dae_handoff.py` to emit a 5-line orientation block.                                     | Claude Code                                                 |
| **`vexp-cli` (`vexp.dev`)**                       | Heading-Level SQLite Graph Indexer over MCP                         | Indexes Markdown files, headings, and tables into local SQLite nodes; returns budget-capped section answers and down-ranks `notes/` and `journal/`.                                           | Claude Code, Cursor, Codex, Copilot (17 MCP agents)         |
| **`Blockstream/green_qt`**                        | Repository-Scoped Cross-Layer Pitfalls Ledger                       | Links root `AGENTS.md` to `doc/agents/pitfalls.md` containing paired `// Bad` vs `// Good` C++/QML anti-patterns and build-list synchronization rules.                                        | `AGENTS.md` compatible coding agents                        |
| **Vercel `@next/codemod agents-md`**              | Compressed Pipe-Delimited Passive Docs Index                        | Detects exact framework version, downloads docs to `.next-docs/`, and injects an 8KB compressed index + exploration-first rule into `AGENTS.md`.                                              | Cursor, Claude Code, Codex, `AGENTS.md` clients             |
| **`obra/superpowers` & `steveyegge/beads`**       | Pre-Code Spec Gating & Git-Backed Atomic Issue Graphs (`bd`)        | Uses deontic pre-code brainstorming gates and replaces shared Markdown task scratchpads with atomic CLI issue tracking across isolated git worktrees.                                         | Claude Code, OpenCode, Codex                                |

---

## 6. Deliverable 2: Battle-Tested Directory Layouts

### 6.1 Unified Cross-Harness Symlinked Workspace Topology

```text
project-root/
├── AGENTS.md                                  # Root governance (<60-150 lines), exploration-first rule, 8KB pipe-delimited doc index
├── CLAUDE.md -> AGENTS.md                     # Symlink or pointer to AGENTS.md + Claude-specific hook/compaction overrides
├── CHARTER.md                                 # Defines agent autonomy levels and verification independence contracts
├── MISTAKES.md                                # Tier 2 repo-wide empirical failure log (newest-first, agent + human mistakes)
├── .mcp.json                                  # Shared MCP server declarations (vexp-cli, lore) across Cursor and Claude Code
├── .next-docs/                                # Local version-pinned framework reference docs indexed by AGENTS.md
│
├── .agents/                                   # Canonical cross-agent skill & scratchpad store
│   ├── scratchpad/                            # Tier 1 mutable agent exhaust (gitignored; auto-pruned on session wrap-up)
│   │   ├── worklog.md                         # Worker sessions deposit one-line "Pitfall candidate:" tags here
│   │   └── compact-state.json                 # Serialized PreCompact working state written by compact-guard
│   └── skills/
│       ├── skill-router/                      # Two-tier meta-skill router indexing all workspace and domain skills
│       │   └── SKILL.md
│       └── postgres-zero-downtime-migration/  # Canonical domain skill package (folder name matches `name` in SKILL.md)
│           ├── SKILL.md                       # Tier 2 router + core procedure (<500 lines / <5,000 tokens; top-100-line invariants)
│           ├── PITFALLS.md                    # Co-located Tier 2 scar tissue (Trigger / Wrong / Correct triads)
│           ├── agents/
│           │   └── openai.yaml                # Codex sidecar (policy.allow_implicit_invocation: false for stateful operations)
│           ├── references/                    # Tier 3 on-demand leaf docs (strictly 1 hop deep from SKILL.md)
│           │   ├── lock-matrix.md
│           │   ├── batched-backfill-patterns.md
│           │   └── multi-agent-pitfalls.md
│           ├── scripts/                       # Tier 3 zero-context-cost executables (PEP 723 inline dependencies via `uv run`)
│           │   ├── introspect_schema.py
│           │   └── validate_migration.py
│           └── assets/                        # Tier 3 static templates copied/populated during execution
│               └── migration-rollout-template.md
│
├── .claude/
│   ├── settings.json                          # Registers UserPromptSubmit, PreCompact, and SessionStart (source: compact) hooks
│   └── skills/                                # Relative symlinks deduplicated at load time
│       ├── skill-router -> ../../.agents/skills/skill-router
│       └── postgres-zero-downtime-migration -> ../../.agents/skills/postgres-zero-downtime-migration
│
├── .cursor/
│   └── skills/
│       └── postgres-zero-downtime-migration -> ../../.agents/skills/postgres-zero-downtime-migration
│
└── features/
    └── 042-payment-webhook/                   # Feature-scoped durable state survived across compactions
        ├── brief.md                           # Immutable job brief ("do X only, do not begin Y") + dated amendments
        ├── feature.md                         # Target outcome and scope contract read by reorient skill
        ├── progress.md                        # Active CURRENT task header, pipeline breadcrumb, and Checkpoint Exit Contract
        └── research_brief.md                  # Shared multi-agent synthesis doc (appended only after JSON schema validation)
```

---

## 7. Deliverable 3: Production Template Examples

### 7.1 High-Trigger Domain Skill (`SKILL.md`) + Codex Sidecar (`agents/openai.yaml`)

#### File 1: `.agents/skills/postgres-zero-downtime-migration/SKILL.md`

````markdown
---
name: postgres-zero-downtime-migration
description: Plans, validates, and executes zero-downtime PostgreSQL schema migrations using expand-and-contract patterns, concurrent index creation, and lock-timeout gates. Use when adding or dropping columns, creating indexes, altering constraints, writing SQL migration files, troubleshooting table lock contention, or when the codebase imports [github.com/golang-migrate/migrate](https://github.com/golang-migrate/migrate), sqlalchemy/alembic, or prisma/migrations. Do NOT use for read-query performance tuning or EXPLAIN ANALYZE profiling — use acme/db-skills@postgres-query-tuning instead.
when_to_use: |
  - Operator asks to "write a migration", "add a column safely", "backfill a table", or "alter schema without downtime"
  - Modifying files matching db/migrations/*.sql or alembic/versions/*.py
  - Do NOT use for seed data generation or local test fixture resets
disable-model-invocation: false
user-invocable: true
paths:
  - "db/migrations/**"
  - "alembic/versions/**"
  - "prisma/migrations/**"
compatibility: Requires Python 3.11+ with uv installed and network access to target database metadata if running live introspection.
metadata:
  author: platform-architecture-team
  version: "2.4.0"
  domain: database-reliability
---

# PostgreSQL Zero-Downtime Migration Skill

Execute PostgreSQL schema changes without blocking production reads or writes by enforcing lock timeouts, batched backfills, and expand-and-contract phasing.

## 1. Mandatory Pre-Flight & Pitfalls Check (Compaction-Protected Top Invariants)

1. **Read Local Scar Tissue First:** Before drafting any SQL or modifying migration files, read `PITFALLS.md` in this skill directory to review silent lock-escalation traps observed in this repository.
2. **Hard DDL Guardrails:**
   - **Never** add a column with a volatile `DEFAULT` or `NOT NULL` constraint in a single transaction on tables exceeding 100,000 rows without checking PostgreSQL version semantics in `references/lock-matrix.md`.
   - **Never** execute `CREATE INDEX` without `CONCURRENTLY` and disabling transaction wrapping (`-- migrate:no-transaction`).
   - **Never** run migration scripts against staging or production without passing `--mode dry-run` first.
   - **Never** drop a column in the same deployment that removes application code references; enforce a two-release expand-and-contract sequence.

## 2. Live Migration State (Dynamic Context Injection)

!`uv run ${CLAUDE_SKILL_DIR}/scripts/introspect_schema.py --target-dir db/migrations --summary --format json`

## 3. Reference Loading Map (1-Hop Progressive Disclosure)

Load ONLY the specific reference leaf required for the current sub-task (or query via `vexp-cli` MCP):

- **Column additions, type changes, or `NOT NULL` constraints:** Read `references/lock-matrix.md` (Lines `1-35`: Lock Compatibility Matrix; Lines `36-95`: Safe `NOT VALID` Constraint Pattern).
- **Data backfills across >1M rows:** Read `references/batched-backfill-patterns.md`.
- **Multi-agent branch coordination on migration sequence numbers:** Read `references/multi-agent-pitfalls.md`.

## 4. Step-by-Step Execution Workflow

1. **Inspect Summary & Drill Into High-Risk Findings:**
   If the `introspect_schema.py` summary above flags any `LOCK_HAZARD` or `FOREIGN_KEY_CASCADE` codes, drill into the specific violation details:

   ```bash
   uv run ${CLAUDE_SKILL_DIR}/scripts/introspect_schema.py --check LOCK_HAZARD --offset 0 --format json
   ```

1. **Draft Migration Using Verified Asset Template:**
   Copy the skeleton from `${CLAUDE_SKILL_DIR}/assets/migration-rollout-template.md` and generate both forward (`up.sql`) and rollback (`down.sql`) artifacts.
1. **Validate Migration Syntax and Lock Timeout Gates:**
   Execute the static validator in dry-run mode before presenting the output:

   ```bash
   uv run ${CLAUDE_SKILL_DIR}/scripts/validate_migration.py --file db/migrations/new_migration.sql --mode dry-run --format json
   ```

   Do not mark the task complete until `validate_migration.py` exits with code `0`.
````

#### File 2: `.agents/skills/postgres-zero-downtime-migration/agents/openai.yaml` (Codex Sidecar)

```yaml
# Validated against Codex plugin-creator schema to prevent fail-open drift
policy:
  allow_implicit_invocation: true
interface:
  display_name: "Postgres Zero-Downtime Migration"
  short_description: "Plans and validates lock-safe PostgreSQL schema migrations."
  brand_color: "#336791"
```

---

### 7.2 Two-Tier Meta-Skill Router Specification (`skill-router/SKILL.md`)

```markdown
---
name: skill-router
description: Master routing index and control-plane dispatcher for all workspace agent skills and slash commands. Use when orienting a new task, when unsure which specialized workflow applies, when a task spans multiple domains, or when the operator asks "what skills exist", "which workflow for X", or "list available commands".
user-invocable: true
---

# Workspace Meta-Skill Router

This file is the deterministic routing table for the repository's skill library. Prefer retrieval-led workflow execution over pre-training synthesis.

## Routing Protocol & Execution Rules

1. **Explore Before Routing (Anti-Premature-Anchoring):** Inspect the target directory structure and active file context _before_ loading a domain skill so repository configurations (`next.config.ts`, `opencode.json`, schema files) are never overlooked.
2. **Single-Primary-Skill Rule:** Select the single highest-confidence primary skill for the immediate turn. If a request spans multiple phases, chain them sequentially (`pipeline` mode) rather than loading multiple heavy `SKILL.md` bodies simultaneously.
3. **Invocation Mode Enforcement:**
   - `[auto]` skills must be loaded automatically via filesystem read when task intent matches the _When to Reach_ clause.
   - `[human]` skills modify external state, trigger deployments, or execute session rituals. Do **not** auto-execute `[human]` skills; surface the recommendation and request operator confirmation (`1/no`) before loading.
4. **Tiebreaker Resolution:** When two skills share domain nouns, evaluate the _Boundary Tiebreaker_ column to select the exact match.

## Domain Routing Table

| Skill Identifier                   | Mode      | Primary Capability                     | When to Reach & Boundary Tiebreaker                                                                                                                                                                                        |
| :--------------------------------- | :-------- | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reorient`                         | `[auto]`  | Post-compaction context recovery       | Reach immediately after any context compaction or when task state is lost. Reads `CHARTER.md` and `progress.md`; performs zero edits.                                                                                      |
| `domain-modeling`                  | `[auto]`  | Bounded contexts & ubiquitous naming   | Reach _before_ writing new modules so identifiers match project vocabulary. Tiebreaker vs `improve-architecture`: use `domain-modeling` for greenfield naming, `improve-architecture` for refactoring existing code seams. |
| `postgres-zero-downtime-migration` | `[auto]`  | Safe DDL schema changes & backfills    | Reach when editing `db/migrations/**` or altering tables. Tiebreaker vs `postgres-query-tuning`: use migration skill for DDL/locks, query-tuning skill for `SELECT` latency and indexing analysis.                         |
| `improve-architecture`             | `[human]` | Seam auditing & cycle breaking         | Reach when asked to untangle module boundaries. Emits a prioritized decision record and plan; never performs an unapproved rewrite.                                                                                        |
| `batch-orchestration`              | `[human]` | Parallel multi-agent worktree dispatch | Reach for codemods, migrations, or refactors touching 10+ independent files with an identical pattern.                                                                                                                     |
| `deslop`                           | `[human]` | Diff hygiene & `SKILL.md` linter       | Reach before committing a branch or promoting a modified skill to strip defensive boilerplate and validate `SKILL.md` token budgets.                                                                                       |
| `compact-guard`                    | `[human]` | Pre-compaction state serialization     | Reach when session context exceeds 50–70% capacity or prior to switching task domains.                                                                                                                                     |
```

---

### 7.3 Epistemic Tiered Documentation Layout (Tier 1 Exhaust vs. Tier 2 Scar Tissue vs. Tier 3 Canon)

#### Artifact 1: `.agents/scratchpad/worklog.md` (Tier 1 — Ephemeral Agent Exhaust)

```markdown
# Active Session Scratchpad (Tier 1 — Ephemeral Exhaust)

> Authority: NONE (Git-ignored; down-ranked by `vexp` graph indexer; worker agents append candidates only)

## Active Job Brief: 042-payment-webhook

- **Scope Contract:** Implement Stripe webhook signature verification in `src/webhooks/stripe.ts` only. Do not modify billing ledger tables.
- **Amendment (2026-10-18):** Supersedes initial payload parser requirement; must use raw request buffer rather than parsed JSON body.

## Session Telemetry & Pitfall Candidates (Newest First)

- [2026-10-18T19:42Z] [worker-agent-2] Pitfall candidate: Express `app.use(express.json())` middleware mutated `req.body` before `stripe.webhooks.constructEvent`, causing signature verification failure (`No signatures found matching the expected signature`).
- [2026-10-18T18:15Z] [human-operator] Pitfall candidate: Operator instructed agent to mock `stripe.webhooks.constructEvent` in integration tests, which masked the raw buffer middleware bug in staging.
```

#### Artifact 2: `.agents/skills/webhook-handler/PITFALLS.md` (Tier 2 — Co-Located Empirical Scar Tissue)

````markdown
# Webhook Handler Known Pitfalls & Failure Parables

Read this ledger before modifying any file under `src/webhooks/`. When an entry reaches 4 occurrences, promote it to a hard law in root `AGENTS.md` / `CLAUDE.md` and add an executable check in `scripts/ci_hygiene.sh`.

### [PF-014] Body Parser Middleware Corrupts Webhook Cryptographic Signatures (Occurrences: 4 — GRADUATED TO CI)

- **Trigger:** Implementing or debugging HMAC signature verification (`constructEvent`) on incoming webhook routes.
- **Wrong Behavior (Root Cause):** Mounting webhook routes after global `express.json()` or passing a re-serialized `JSON.stringify(req.body)` string into signature verification. Key ordering and whitespace shifts alter the SHA-256 digest.

  ```typescript
  // Bad: Global JSON parser already consumed the stream
  app.use(express.json());
  app.post("/webhooks/stripe", (req, res) => {
    stripe.webhooks.constructEvent(JSON.stringify(req.body), sig, secret);
  });
  ```

- **Correct Behavior (Prevention Rule):** Mount webhook routes with `express.raw({ type: 'application/json' })` _before_ global JSON middleware, and pass the untouched `Buffer` instance.

  ```typescript
  // Good: Raw buffer preserved exclusively for signature route
  app.post(
    "/webhooks/stripe",
    express.raw({ type: "application/json" }),
    (req, res) => {
      stripe.webhooks.constructEvent(req.body, sig, secret);
    },
  );
  ```

### `[PF-015]` Human Instruction Trap: Mocking Signature Verification in Integration Suites (Occurrences: 2)

- **Trigger:** Operator asks to "skip or mock webhook signature checks so tests run faster."
- **Wrong Behavior:** Stubbing `constructEvent` to return a static fixture object, which bypasses middleware stream-consumption tests.
- **Correct Behavior:** Reject the shortcut; use the SDK's deterministic test-header generator (`stripe.webhooks.generateTestHeaderString`) against a real raw payload buffer.
````

#### Artifact 3: `AGENTS.md` / `CLAUDE.md` (Tier 3 — Verified Canon, Passive Index & CI Graduation)

```markdown
# Repository Operational Constitution

IMPORTANT: Prefer retrieval-led workflow execution over pre-training synthesis. Explore the project directory first, then load the matching skill from `.agents/skills/` before editing files.

## 1. Graduated Laws & Executable CI Gates

1. **Webhook Raw Buffer Invariant (Graduated from PF-014):** Never pass `JSON.stringify(req.body)` to cryptographic webhook verifiers. Enforced deterministically in CI by `scripts/ci_hygiene.sh` (fails build on `constructEvent(JSON.stringify` regex match).
2. **Epistemic Write Boundary:** Worker sessions must never edit `AGENTS.md`, `CLAUDE.md`, or `PITFALLS.md` directly during a task run. Deposit one-line `Pitfall candidate:` entries into `.agents/scratchpad/worklog.md` for `/wrap-up` review.

## 2. Compressed Local Documentation Index (`.next-docs/`)

|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx}|01-app/02-building-your-application/01-routing:{01-defining-routes.mdx,02-pages-and-layouts.mdx,14-middleware-and-proxy.mdx}|01-app/03-api-reference/04-functions:{cacheLife.mdx,cacheTag.mdx,forbidden.mdx,unauthorized.mdx}
```

---

## 8. Deliverable 4: Production Failure Modes & Engineering Workarounds Checklist

| Failure Mode                                           | Observable Production Symptom                                                                                                         | Root Architectural Cause                                                                                                                                         | Concrete Engineering Workaround                                                                                                                                                                                       |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Default Pre-Training Inertia (Under-Triggering)** | Agent ignores an installed skill in >50% of relevant prompts and writes ad-hoc, outdated code from pre-training weights.              | Description is passive/vague (`"Helps with X"`) or lacks the specific lexical keywords and import paths present in the workspace.                                | Rewrite `description` using the **Trigger Triad**: 3rd-person capability + `"Use when..."` lexical bait + literal package import paths (`` `github.com/org/pkg` ``) + `paths:` file globs.                            |
| **2. Silent Playbook Hijacking (Over-Triggering)**     | Agent produces plausible-looking but subtly wrong code while burning thousands of tokens on unrelated reference files.                | Description uses broad catch-all phrasing (`"Use whenever writing Go code"`) or a router claims a superset of specialist keywords.                               | Narrow the domain concern, append an explicit `"Do NOT use for..."` sibling pointer, strip specialist keywords from router descriptions, and gate Precision ($\ge 0.90$) in CI against negative traffic samples.      |
| **3. Frontmatter Workflow Leakage**                    | Agent executes a shallow, incomplete version of a procedure and never reads `SKILL.md` or `references/` off disk.                     | The frontmatter `description` narrates ordered procedural steps (`"Write X, run with -flag, then compare..."`), allowing the LLM to shortcut activation.         | Strip all procedural step ordering from `description`; restrict frontmatter strictly to scope, capabilities, and trigger conditions.                                                                                  |
| **4. Discovery Premature Anchoring**                   | Agent invokes the skill immediately, follows generic doc patterns, and misses critical repo-specific config files (`next.config.ts`). | Root `AGENTS.md` instructs `"You MUST invoke the skill"` without specifying exploration ordering, causing docs to override local repo context.                   | Replace unconditional invocation rules in `AGENTS.md` with explicit sequencing: `"Explore project first, then invoke skill"`, or enforce ordering via `SkillGuard`.                                                   |
| **5. Cross-Platform Invocation Drift**                 | A destructive deployment skill blocked from auto-running in Claude Code fires autonomously when opened in OpenAI Codex.               | `disable-model-invocation: true` in `SKILL.md` is a Claude/Cursor/Copilot extension ignored by Codex; or Linux case-sensitivity breaks `name` matching.          | Enforce exact lowercase kebab-case matching between folder and `name`; pair `disable-model-invocation: true` in `SKILL.md` with `allow_implicit_invocation: false` inside `agents/openai.yaml`.                       |
| **6. YAML Frontmatter Silent Drop**                    | Slash command `/skill-name` works manually, but the agent never auto-triggers the skill on natural-language requests.                 | Opening `---` is not on line 1 byte 0, or an unquoted colon (`:`) inside `description` broke YAML parsing (Claude Code loads broken skills with empty metadata). | Remove colons from `description` or use YAML block scalars; verify `---` starts at byte 0; run `claude --debug` and `skills-ref validate ./my-skill` in CI.                                                           |
| **7. Post-Compaction Amnesia & Constraint Invention**  | After a long session or auto-compaction, the agent forgets its role, skips mandatory test gates, or invents phantom rules.            | Auto-compaction at ~95% capacity summarizes away previously loaded `SKILL.md` bodies (truncating at 5,000 tokens) and loses the task pipeline breadcrumb.        | Front-load critical invariants in the top 100 lines of `SKILL.md`; set `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50`; bind `compact-guard` to `PreCompact` hooks; bind `reorient` to `SessionStart` (`source: compact`) hooks. |
| **8. Tool Output Truncation Blindness**                | Agent misses critical errors at the end of a validation script output and assumes the check passed.                                   | Harness silently truncates `stdout` beyond 10K–30K characters when a bundled script dumps a verbose human-formatted log.                                         | Re-engineer PEP 723 `scripts/` to default to a compact JSON summary (`--summary --format json`) with pagination (`--offset`) and targeted drill-down flags (`--check ID`).                                            |
| **9. Lossy HTML Documentation Summarization**          | Agent hallucinates API parameters after fetching web docs because code tables and section hierarchy were mangled.                     | Harness converted raw HTML to Markdown via `Turndown` and ran a lossy secondary summarization pass.                                                              | Serve documentation endpoints with HTTP content negotiation (`Accept: text/markdown` returning `Content-Type: text/markdown`) or `.md` URL suffixes so Claude Code injects raw Markdown verbatim.                     |
| **10. Central Board Rule Blindness**                   | Agent repeatedly breaks a documented project rule while editing a specific module file.                                               | The rule lives in a global project board or log that the agent has no reason to open during a localized file edit.                                               | Apply the **Locality Fix**: move domain-specific failure rules into a co-located `PITFALLS.md` referenced at line 1 of the relevant skill, or copy the invariant into the target directory's local `AGENTS.md`.       |
| **11. Multi-Agent Canon Contamination**                | Canonical `CLAUDE.md` or `PITFALLS.md` files bloat with contradictory heuristics and verbose session diaries.                         | Every worker agent session has direct write access to canonical documentation files.                                                                             | Restrict worker sessions to depositing one-line `Pitfall candidate:` tags in `.agents/scratchpad/worklog.md`; require human/curator review and graduate 4–5x repeat failures into CI hygiene tests.                   |
