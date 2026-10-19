# 🎼 RPGlitch Orchestration Handbook

_Unified Multi-Tier AI Agent Architecture, Workflows, and Distributed Systems Framework (Antigravity 2.0 Edition)_

---

## 📑 Table of Contents

1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [Theoretical Foundations: The Conductor and the Dance](#2-theoretical-foundations-the-conductor-and-the-dance)
   - 2.1 Orchestration vs. Choreography
   - 2.2 The Bounded Context Hybrid Model
   - 2.3 Sagas and Compensating Logic in AI Execution
3. [The Unified 3-Tier Agent Architecture](#3-the-unified-3-tier-agent-architecture)
   - 3.1 🎭 Strategic Tier (System Architect)
   - 3.2 🎨 Tactical Tier (Project Planner)
   - 3.3 ⚒️ Operational Tier (Code Implementer)
   - 3.4 Cognitive Thinking Approaches Matrix
4. [Routing & Complexity-Based Dispatch](#4-routing--complexity-based-dispatch)
   - 4.1 The Ambiguity Gate (A1–A5 Scoring & Interactive Modals)
   - 4.2 Complexity Classification (Levels 1–3)
   - 4.3 Deterministic Role State Machine
   - 4.4 The 75% Budget Trim & Context Ordering
5. [The Tooling & Memory Ecosystem (Antigravity & MCP)](#5-the-tooling--memory-ecosystem-antigravity--mcp)
   - 5.1 Dual-Layer Developer Database (Pinecone & Supabase)
   - 5.2 Context7 (Live Ecosystem Documentation via SSE)
   - 5.3 Sequential Thinking MCP (Local Dynamic Branching)
   - 5.4 Sovereign Tool Stack (Native IDE Primitives)
6. [Implementation & Configuration Reference](#6-implementation--configuration-reference)
   - 6.1 Antigravity Customization Architecture (`GEMINI.md` & Skills)
   - 6.2 The Four-Layer Documentation Architecture
   - 6.3 Standardized Temporal Mirror Layout (`ROADMAP.md` & `CHANGELOG.md`)
   - 6.4 Active MCP Server Configuration (`mcp_config.json`)
7. [Daily Runbooks & Command Lexicon](#7-daily-runbooks--command-lexicon)
   - 7.1 Natural Language Dispatch vs. Explicit Directives
   - 7.2 Core Workflow Walkthroughs
   - 7.3 Mandatory Turn Signal Protocol
8. [Troubleshooting, Diagnostics, and Recovery](#8-troubleshooting-diagnostics-and-recovery)
   - 8.1 Cognitive & Routing Failure Modes
   - 8.2 Diagnostic Protocols
   - 8.3 Circuit Breakers and Rollback Procedures

---

## 1. Executive Summary & Core Philosophy

The **RPGlitch Orchestration System** resolves a foundational challenge in modern AI-assisted engineering: _balancing strategic architectural vision, structured procedural planning, and atomic, zero-debt code execution without context drift or cognitive fragmentation._

Rather than requiring engineers to manually switch between fragmented modes or maintain uncoordinated prompts, RPGlitch provides a single **Unified Orchestrator**. This orchestrator functions as a cognitive governor that dynamically selects its operating role, modulates its reasoning depth, queries persistent dual-layer memory, and dispatches external Model Context Protocol (MCP) tooling based on the precise demands of the task.

```text
+-----------------------------------------------------------------------------------------+
|                                  UNIFIED ORCHESTRATOR                                   |
|                                                                                         |
|   [ Inbound Task ] ---> [ Ambiguity Gate (A1-A5) ] ---> [ Complexity Router ]           |
|                                                                |                        |
|             +--------------------------------------------------+                        |
|             |                                  |               |                        |
|      Level 3: Strategic                 Level 2: Tactical      Level 1: Operational     |
|             |                                  |               |                        |
|      🤔 Contemplative                   🧠 Sequential          ⚡ Professional          |
|         Thinking                           Thinking               Coding                |
|             |                                  |               |                        |
|             v                                  v               v                        |
|     System Architecture                Native Plan Artifact    Atomic File Mod /        |
|     & Workflow Governance              & ROADMAP Sync          TDD Red-Green-Refactor   |
+-----------------------------------------------------------------------------------------+
       |                                         |               |
       v                                         v               v
[ Context7 (SSE) ]                 [ Developer Database Dual Memory ]  [ Sequential Thinking MCP ]
```

---

## 2. Theoretical Foundations: The Conductor and the Dance

To design an AI orchestrator that does not degenerate into a tangled, state-leaking monolith, we ground the system in classical distributed systems theory: **The tension between Orchestration and Choreography**.

### 2.1 Orchestration vs. Choreography

| Dimension              | Orchestration (The Conductor)                              | Choreography (The Dance)                                      |
| :--------------------- | :--------------------------------------------------------- | :------------------------------------------------------------ |
| **Control Model**      | Centralized, explicit command-and-control.                 | Decentralized, implicit event-driven collaboration.           |
| **Workflow State**     | Formally preserved in an authoritative state machine.      | Emergent across decoupled nodes/events.                       |
| **Visibility**         | Complete end-to-end auditability and single-point tracing. | Opaque; requires distributed correlation IDs across logs.     |
| **Failure Handling**   | Direct retries, saga rollbacks, and explicit compensation. | Cascading error events; difficult to coordinate undo actions. |
| **Coupling**           | Worker components couple to orchestrator contracts.        | Components loosely couple only to message schemas.            |
| **Core Vulnerability** | Orchestrator can become a bottleneck or god-object.        | Emergent deadlocks, infinite event loops, state drift.        |

### 2.2 The Bounded Context Hybrid Model

A pure orchestrator often devolves into an anti-pattern: an overloaded "god-prompt" that attempts to hold application logic, syntax checks, domain contracts, and business policies simultaneously. Conversely, pure choreography produces uncontrolled multi-agent chatter where context tokens burn exponentially without deterministic output.

**The RPGlitch Resolution**: The Bounded Context Hybrid Model

1. **Orchestration _Within_ Bounded Contexts**:
   - An individual task, feature branch, or refactoring pass operates as an orchestrated unit.
   - A single conductor (the Unified Orchestrator Mode) holds the sequence, enforces invariants, manages local memory state, and executes an explicit linear loop:
     $$\text{ANALYSE} \longrightarrow \text{PLAN} \longrightarrow \text{CODE} \longrightarrow \text{VALIDATE}$$
2. **Choreography _Between_ Bounded Contexts**:
   - High-level modular systems (e.g., UI engine, game state core, generative asset pipeline, remote build server) communicate via asynchronous contracts and discrete state snapshots.
   - Once the orchestrator finishes an atomic execution within its local context, it emits structured plan artifacts and updates the temporal mirror (`ROADMAP.md` / `CHANGELOG.md`), enabling clean handoffs without cross-domain pollution.

### 2.3 Sagas and Compensating Logic in AI Execution

In generative software development, prompt hallucination or broken builds represent transaction failures. Because we cannot execute traditional two-phase commits ($2\text{PC}$) on an evolving codebase, RPGlitch adapts the **Distributed Saga Pattern**:

- **Forward Transactions**: Code generation, dependency additions, test creations.
- **Compensating Transactions**: Automatic git working-tree rollbacks, cache cleans, and memory revisions triggered whenever an operational step fails validation.
- **Saga Coordinator**: The Tactical tier acts as the Saga coordinator. If an Operational code edit introduces regressions, the orchestrator does not patch forward blindly—it triggers the compensating action to restore the last verified state before reformulating the plan.

---

## 3. The Unified 3-Tier Agent Architecture

The system operates across three distinct cognitive tiers, each bound to a specific thinking profile and output contract.

```text
       [ 🎭 STRATEGIC: System Architect ]
                     |
                     | Architecture, Meta-Reflection, System Invariants
                     v
       [ 🎨 TACTICAL: Project Planner ]
                     |
                     | Sequential Decomposition, Dependency Graph, Hand-offs
                     v
       [ ⚒️ OPERATIONAL: Code Implementer ]
                     |
                     | Direct Edits, Zero Technical Debt, Test Execution
                     v
             [ Production Code ]
```

### 3.1 🎭 Strategic Tier (System Architect)

- **Role Identity**: High-level systems designer, tech lead, and meta-optimizer.
- **Mindset**: _"What is our overarching architectural approach, what are the blast radii, and how does this evolve our platform invariants?"_
- **Responsibilities**:
  - Validates overall architecture, data flow patterns, and tool-chain integrations.
  - Monitors system health, token efficiency, and cognitive alignment.
  - Resolves domain-boundary conflicts and decides technology adoptions.
- **Thinking Mode**: 🤔 **Contemplative Thinking** (deep, conceptual exploration, questioning initial assumptions, weighing structural trade-offs).

### 3.2 🎨 Tactical Tier (Project Planner)

- **Role Identity**: Engineering manager, sprint planner, and systems coordinator.
- **Mindset**: _"How do we decompose this strategic intent into verifiable, isolated, sequential steps?"_
- **Responsibilities**:
  - Translates strategic architectural designs into step-by-step implementation graphs.
  - Inspects local file structures, schema requirements, and documentation.
  - Authors Native Plan Artifacts (`<brain>/<plan_name>.md` with `request_feedback: true`).
  - Maintains `ROADMAP.md` (active sprint backlog and future delta).
- **Thinking Mode**: 🧠 **Sequential Thinking** (tool-guided decomposition, linear dependency resolution, step-by-step hypothesis validation via `mcp-sequentialthinking-tools`).

### 3.3 ⚒️ Operational Tier (Code Implementer)

- **Role Identity**: Staff implementation engineer, systems programmer.
- **Mindset**: _"Let's build this cleanly, test it rigorously, and leave zero technical debt."_
- **Responsibilities**:
  - Executes explicit code modifications using standard patterns (KISS, DRY).
  - Owns all syntax, typing, unit testing, and linting.
  - Enforces the TDD Red-Green-Refactor cycle.
  - Executes immediate validation runs (terminal checks, builds, tests).
- **Thinking Mode**: ⚡ **Professional Coding** (concise, focused, production-grade output without unnecessary boilerplate).

### 3.4 Cognitive Thinking Approaches Matrix

| Tier               | Thinking Mode    | Activation Trigger                                    | Primary Tooling                                                          | Standard Artifact Output                            |
| :----------------- | :--------------- | :---------------------------------------------------- | :----------------------------------------------------------------------- | :-------------------------------------------------- |
| **🎭 Strategic**   | 🤔 Contemplative | Architecture review, major refactors, workflow audits | `developer-database:read_knowledge_base`, `strategy` grounding hierarchy | Architectural blueprints, `ARCHITECTURE.md` updates |
| **🎨 Tactical**    | 🧠 Sequential    | Multi-file features, schema changes, migrations       | `mcp-sequentialthinking-tools`, `Context7`                               | `<brain>/<plan_name>.md`, `ROADMAP.md` sprint delta |
| **⚒️ Operational** | ⚡ Professional  | Bug fixes, isolated tasks, unit tests, code cleanup   | `view_file`, `replace_file_content`, `run_command`                       | Atomic code diffs, passing test reports             |

---

## 4. Routing & Complexity-Based Dispatch

The orchestrator eliminates the need for manual prompt switching by parsing user intent through an explicit two-stage gate.

### 4.1 The Ambiguity Gate (A1–A5 Scoring & Interactive Modals)

Before classifying task complexity, the orchestrator evaluates ambiguity ($A1-A5$):

| Level  | Classification | Meaning                                               | Protocol                                                              |
| :----- | :------------- | :---------------------------------------------------- | :-------------------------------------------------------------------- |
| **A1** | **Clear**      | Explicit, deterministic requirements.                 | Direct dispatch to Complexity Router.                                 |
| **A2** | **Inferred**   | Context reliably implies the solution.                | Direct dispatch with explicit declared assumption.                    |
| **A3** | **Ambiguous**  | Multiple viable architectural interpretations.        | **HALT.** Propose single solution with hypothesis via `ask_question`. |
| **A4** | **Critical**   | Fundamental fork in design or stack.                  | **HALT.** Present multi-option selection modal via `ask_question`.    |
| **A5** | **Hazard**     | Contradicts system laws, security, or data integrity. | **REFUSE.** State constraints directly and wait for clarification.    |

> [!IMPORTANT]
> When $A \ge 3$, the orchestrator **MUST** trigger the native `ask_question` GUI dialog modal rather than writing speculative code or guessing.

### 4.2 Complexity Classification (Levels 1–3)

```text
                       [ Inbound Task (A <= 2) ]
                                   |
                    Is it an explicit quick fix / bug?
                                 /    \
                              YES      NO
                              /          \
                [ Level 1: Operational ]  Contains architectural / multi-file scope?
                                                 /                  \
                                               YES                   NO
                                               /                       \
                                    [ Level 3: Strategic ]      [ Level 2: Tactical ]
```

#### Level 1: Quick Fix & Maintenance

- **Trigger Lexicon**: `fix`, `broken`, `typo`, `bug`, `crash`, `syntax error`, `patch`, `hotfix`.
- **Path**: $\longrightarrow$ **⚒️ Operational Role**.
- **Scope**: $\le 1-2$ files. Bypasses formal implementation plans; directly runs test reproduction and applies atomic fix.

#### Level 2: Component Enhancement & Targeted Features

- **Trigger Lexicon**: `add`, `improve`, `update`, `refactor component`, `enhance`, `integrate API`.
- **Path**: $\longrightarrow$ **🎨 Tactical Role** $\longrightarrow$ **⚒️ Operational Role**.
- **Scope**: $3-5$ files. Requires Tactical decomposition in a Native Plan Artifact before code execution.

#### Level 3: Complex Features & Architectural Systems

- **Trigger Lexicon**: `implement system`, `architect`, `build subsystem`, `migrate`, `restructure`, `design flow`.
- **Path**: $\longrightarrow$ **🎭 Strategic Role** $\longrightarrow$ **🎨 Tactical Role** $\longrightarrow$ **⚒️ Operational Role**.
- **Scope**: High-risk, cross-layer or roadmap shifts. Requires Strategic specification, Tactical plan approval gate, and phased Operational TDD execution.

### 4.3 Deterministic Role State Machine

```text
+---------------+      Strategic Sign-off       +--------------+
|   STRATEGIC   | ----------------------------> |   TACTICAL   |
+---------------+                               +--------------+
        ^                                              |
        | Rollback / Architecture Breach               | Plan Approved
        |                                              v
+--------------------------------------------------------------+
|                         OPERATIONAL                          |
|         (Executes Step N -> Verifies -> Reports back)        |
+--------------------------------------------------------------+
```

1. **State: STRATEGIC_EVAL**:
   - Assesses global state via `developer-database:read_knowledge_base` and `ARCHITECTURE.md`.
   - Produces high-level requirements and boundary constraints.
2. **State: TACTICAL_PLAN**:
   - Queries `Context7` for library specifications.
   - Decomposes work into numbered steps in `<brain>/<plan_name>.md` with `request_feedback: true`.
3. **State: OPERATIONAL_EXEC**:
   - Reads Step $N$.
   - Executes file operations using `replace_file_content` or `multi_replace_file_content`.
   - Runs local validation via `run_command` (`npm run test`, `npm run build`).
   - If tests fail, attempts isolated repair. If structural flaw appears, bubbles back to **TACTICAL_PLAN**.
4. **State: COMPLETE**:
   - Updates `CHANGELOG.md` under `[Unreleased]`, updates `ROADMAP.md`, and persists patterns via `developer-database:write_knowledge_base`.

### 4.4 The 75% Budget Trim & Context Ordering

To mitigate "Lost-in-the-Middle" degradation:

- **Persistent Rules & Grounding** sit at the top of context.
- **Active Task Materials** (current error, immediate file lines, active plan) sit at the generation point.
- **75% Budget Trigger**: When context reaches ~75% capacity, summarize working conclusions before pruning history.

---

## 5. The Tooling & Memory Ecosystem (Antigravity & MCP)

The orchestrator leverages specialized internal memory layers and external Model Context Protocol (MCP) servers.

```text
       +-------------------------------------------------------------+
       |                     MCP TOOL ECOSYSTEM                      |
       +-------------------------------------------------------------+
              |                       |                       |
              v                       v                       v
     [ Developer Database ]      [ Context7 (SSE) ]  [ Sequential Thinking ]
     - Dual-layer memory         - Live library      - Dynamic branching
     - Pinecone vector space       documentation     - Multi-step hypothesis
     - Supabase cold storage     - Zero hallucination- Revision tracking
```

### 5.1 Dual-Layer Developer Database (Pinecone & Supabase)

Replaces legacy file-based memory with persistent dual-layer agent memory:

- **Working Memory (`knowledge-base.meta` & `knowledge-base.external`)**:
  - Hosted in Pinecone vector space.
  - Queried via `developer-database:read_knowledge_base`.
  - Persisted via `developer-database:write_knowledge_base`.
- **Cold Storage (Supabase)**:
  - Preserves completed plans, retrospective logs, and historical post-mortems via `archive_log_entry` and `query_cold_storage`.

### 5.2 Context7 (Live Ecosystem Documentation via SSE)

Context7 provides exact, version-matched library documentation directly to the orchestrator, eliminating library deprecation errors and API hallucinations:

- **Transport**: Remote SSE stream at `https://mcp.context7.com/mcp`.
- **Key Duties**:
  - Resolves library IDs (e.g., Svelte 5, Bits UI, Tailwind CSS v4).
  - Fetches targeted documentation tokens before writing integrations.

### 5.3 Sequential Thinking MCP (Local Dynamic Branching)

A tool-guided dynamic reasoning engine that allows the model to record structured reasoning traces without cluttering the final output:

- **Runner**: Clean, portable distribution runner (`npx -y mcp-sequentialthinking-tools`).
- **Key Duties**:
  - Enables tree-of-thought exploration, iterative hypothesis revision, and confidence estimation.
  - Validates edge cases before code touches the filesystem.

### 5.4 Sovereign Tool Stack (Native IDE Primitives)

| Operation            | Sovereign Antigravity Primitive                             | Legacy Cursor Equivalent       |
| :------------------- | :---------------------------------------------------------- | :----------------------------- |
| **Inspect Files**    | `view_file(AbsolutePath, StartLine, EndLine)`               | `read_file`                    |
| **Single Edit**      | `replace_file_content(TargetFile, TargetContent, ...)`      | `edit_file` / `search_replace` |
| **Multi-Block Edit** | `multi_replace_file_content(TargetFile, ReplacementChunks)` | Manual successive edits        |
| **Create File**      | `write_to_file(TargetFile, CodeContent, Overwrite)`         | `new_file`                     |
| **Terminal Check**   | `run_command(CommandLine, Cwd, WaitMsBeforeAsync)`          | `run_terminal_cmd`             |
| **User Modal**       | `ask_question(questions: [...])`                            | Raw text chat prompts          |

---

## 6. Implementation & Configuration Reference

### 6.1 Antigravity Customization Architecture (`GEMINI.md` & Skills)

In Antigravity, governance is enforced through a unified constitutional architecture:

- **Global Rules**: `~/.gemini/GEMINI.md` (Constitutional laws, turn signals, lexicons).
- **Workspace Rules**: `.agents/rules/*.md` and project `GEMINI.md`.
- **Progressive Skills**: `~/.gemini/config/skills/<name>/SKILL.md` (Loaded on-demand when activated).

### 6.2 The Four-Layer Documentation Architecture

All sovereign workspaces operate under four distinct documentation layers:

1. **Strategic Layer (`README.md`)**: High-level product vision, domain concepts, architectural philosophy.
2. **Tactical Layer (`ARCHITECTURE.md`, `DESIGN.md`, `SECURITY.md`, `ROADMAP.md`)**:
   - `ARCHITECTURE.md`: Authoritative system topology, layer boundaries, domain models.
   - `DESIGN.md`: Single source of truth for visual tokens, colors, animations.
   - `SECURITY.md`: Threat model, zero-trust validation, secret management rules.
   - `ROADMAP.md`: The **FUTURE mirror** documenting active engineering sprints and technical backlog.
3. **Operational Layer (Plan Artifacts & `CHANGELOG.md`)**:
   - Native Plan Artifacts: Authored in `<brain>/<plan_name>.md` with `request_feedback: true`.
   - `CHANGELOG.md`: The **PAST mirror** documenting historical release pulses (Keep a Changelog format).
4. **Governance Layer (`GEMINI.md` & Skills)**: Universal engineering laws, turn signals, and execution playbooks.

### 6.3 Standardized Temporal Mirror Layout (`ROADMAP.md` & `CHANGELOG.md`)

```text
my-project/
├── GEMINI.md                  # Constitutional laws
├── ARCHITECTURE.md            # Topology, layer imports, domain model
├── DESIGN.md                  # Design tokens, color spaces, layout engine
├── ROADMAP.md                 # FUTURE MIRROR: Active sprint & feature backlog
├── CHANGELOG.md               # PAST MIRROR: Shipped milestones & historical pulses
└── src/                       # Production code
```

### 6.4 Active MCP Server Configuration (`mcp_config.json`)

Stored in `~/.gemini/config/mcp_config.json`:

```json
{
  "mcpServers": {
    "context7": {
      "headers": {
        "CONTEXT7_API_KEY": "YOUR_CONTEXT7_API_KEY"
      },
      "serverUrl": "https://mcp.context7.com/mcp"
    },
    "mcp-sequentialthinking-tools": {
      "command": "npx",
      "args": ["-y", "mcp-sequentialthinking-tools"]
    },
    "developer-database": {
      "command": "node",
      "args": ["C:/Users/johng/.gemini/config/plugins/developer-database-plugin/scripts/developer-database.js"],
      "env": {
        "PINECONE_API_KEY": "YOUR_PINECONE_KEY",
        "SUPABASE_URL": "YOUR_SUPABASE_URL",
        "SUPABASE_ANON_KEY": "YOUR_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY": "YOUR_SERVICE_ROLE_KEY"
      }
    },
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    },
    "firecrawl-mcp": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "YOUR_FIRECRAWL_KEY"
      }
    }
  }
}
```

---

## 7. Daily Runbooks & Command Lexicon

### 7.1 Natural Language Dispatch vs. Explicit Directives

```text
+-----------------------------------------------------------------------+
| NATURAL PROMPTS (Automatic Routing via Clarity & Complexity Gates)    |
|                                                                       |
| "Fix the button styling on the modal"         --> Level 1 Operational |
| "Add a dark mode toggle to the dashboard"     --> Level 2 Tactical    |
| "Architect and implement an inventory system" --> Level 3 Strategic   |
+-----------------------------------------------------------------------+
| EXPLICIT DIRECTIVE OVERRIDES                                          |
|                                                                       |
| 🎭 "strategic [task]"   --> Forces Strategic Role (Architecture)      |
| 🎨 "tactical [task]"    --> Forces Tactical Role (Plan Artifact)      |
| ⚒️ "operational [task]" --> Forces Operational Role (Direct TDD)      |
| 🧠 "analyze [problem]"  --> Invokes Sequential Thinking Engine         |
| ⚡ "implement [spec]"   --> Forces Immediate Zero-Debt Coding          |
| 📚 "docs [library]"     --> Triggers Context7 Documentation Query      |
| 📚 "memory [topic]"     --> Triggers Developer Database Vector Query   |
+-----------------------------------------------------------------------+
```

### 7.2 Core Workflow Walkthroughs

#### Walkthrough A: Complex Feature Development (Level 3)

```bash
User: "We need an inventory persistence system for the character editor supporting IndexedDB and cloud sync."
```

```text
Step 1: 🚦 Ambiguity Gate Check
  - Clarifies offline sync conflict strategy using ask_question modal (A3 check).

Step 2: 🎭 Strategic Analysis
  - Reads ARCHITECTURE.md and queries developer-database:read_knowledge_base.
  - Determines domain boundary: Dexie storage repository decoupled from Svelte 5 state stores.

Step 3: 🎨 Tactical Planning
  - Queries Context7: Dexie schema patterns and Svelte 5 Runes integration.
  - Invokes mcp-sequentialthinking-tools for dependency chain resolution.
  - Authors Native Plan Artifact at <brain>/inventory_persistence_plan.md with request_feedback: true.
  - User reviews and clicks "Proceed".

Step 4: ⚒️ Operational Implementation (TDD Cycle)
  - RED: Writes failing unit tests in tests/inventory.test.ts using view_file / write_to_file.
  - GREEN: Implements minimal passing logic in src/storage/inventory-repository.ts.
  - REFACTOR: Optimizes clean code without backwards-compatibility fallbacks.
  - Runs local validation via run_command: npm run verify (0 errors).

Step 5: 🔄 Pulse Synchronization
  - Updates ROADMAP.md (removes sprint delta) and appends entry to CHANGELOG.md under [Unreleased].
  - Stores verified architecture pattern in developer-database via write_knowledge_base.
```

#### Walkthrough B: Immediate Defect Remediation (Level 1)

```bash
User: "Fix the TypeError: Cannot read properties of undefined (reading 'inventory') on login."
```

```text
Step 1: ⚒️ Operational Direct Routing
  - grep_search for inventory accessors in auth/session handlers.
  - view_file to inspect line range around error.
  - Applies atomic defensive assignment using replace_file_content.
  - Runs run_command: npm test.
  - Concludes with Turn Signal.
```

### 7.3 Mandatory Turn Signal Protocol

Every operational response concluding a turn **MUST** emit the standardized Turn Signal on its own line:

```text
> [Role emoji] [Role] | [Active Skill(s)] | [Active MCP Server(s) or Tool(s)] | [Status / Summary]
```

_Example_:

```text
> ⚒️ Operations | quality, git | view_file, replace_file_content, run_command | Resolved inventory auth guard
```

---

## 8. Troubleshooting, Diagnostics, and Recovery

### 8.1 Cognitive & Routing Failure Modes

| Failure Mode             | Symptom                                                       | Root Cause                                                 | Remediation                                                                                      |
| :----------------------- | :------------------------------------------------------------ | :--------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **Cognitive Drift**      | Agent writes unverified code on complex tasks without a plan. | Level 2/3 task treated as Level 1; missing Tactical phase. | Intervene: `🎨 tactical: Stop coding. Author plan artifact first.`                               |
| **Context Flooding**     | Slow generation, repetitive output, token truncation.         | Large directory dumps into context (>2000 lines).          | Enforce line ranges (`view_file`), apply 75% budget trim, summarize conclusions.                 |
| **API Hallucination**    | Deprecated runes, invalid props, non-existent packages.       | Relied on parametric training weights.                     | Query live docs via `Context7` or Svelte MCP.                                                    |
| **Cascading Regression** | 3 successive failing test fixes in a row.                     | Flawed core assumption.                                    | Trip Circuit Breaker: `git checkout -- .`, invoke `mcp-sequentialthinking-tools` for Self-Audit. |

### 8.2 Diagnostic Protocols

Whenever system alignment requires inspection:

```bash
# Check role alignment and active rules
🎯 "system status: Which role are you operating in, and what rules are loaded?"

# Verify external MCP connections
🎯 "test mcp: Verify connection to Context7, Sequential Thinking, and Developer Database"

# Audit temporal mirror alignment
🎯 "audit state: Check ROADMAP.md active sprint against latest git commits"
```

### 8.3 Circuit Breakers and Rollback Procedures

When encountering **3 consecutive test failures**, **3 Definition-of-Done failures**, or **3 tool calls without measurable progress**:

1. **Trip the Circuit Breaker**:
   Command the agent:

   ```bash
   "HALT. Discard working adjustments. Do not write further code."
   ```

2. **Execute the Compensating Transaction**:
   Revert the workspace to the last verified commit via `run_command`:

   ```bash
   git reset --hard HEAD
   ```

3. **Escalate to Self-Audit & Reframing**:
   Trigger an immediate self-audit via `mcp-sequentialthinking-tools`:
   - Strip all assumptions.
   - Invert the problem (_"What if the opposite is true?"_).
   - Re-evaluate from first principles before opening a new plan artifact.

---

## 9. Conclusion: The Well-Tempered Orchestrator

The RPGlitch Orchestration System transforms an AI coding assistant from an unpredictable code generator into an orderly, self-regulating development partner:

- **Inside the context**, it behaves as the **Conductor**: rigorous, sequenced, and auditable.
- **Across the project architecture**, it respects the **Dance**: loosely coupled, event-aware, and modular.

By adhering to the three-tier division of labor (**Strategic $\rightarrow$ Tactical $\rightarrow$ Operational**), grounding every decision in persistent dual-layer memory, and executing test-driven verification, the development workflow achieves maximum velocity with zero technical debt.
