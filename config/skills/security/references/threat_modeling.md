# Threat Modeling & Risk Evaluation

<!--
=============================================================================================
  FILE: C:/Users/johng/.gemini/config/skills/security/references/threat_modeling.md
  PURPOSE: Authoritative methodology for component threat modeling, entry point mapping,
           trust boundaries, and security scanner triage.
  PARENT SKILL: config/skills/security/SKILL.md
=============================================================================================
-->

This guide establishes the clinical protocol for identifying architectural threat surfaces, evaluating entry points, and triaging security scanner findings.

---

## 1.0 Five-Step Threat Modeling Sequence

```text
[1. Purpose & Consumers] ➔ [2. Entry Points] ➔ [3. Trust Boundaries] ➔ [4. Sensitive Data] ➔ [5. Priority Areas]
```

### Step 1: Identify Component Purpose & Consumers

Before auditing any code, answer these three foundational questions:

- **Core Functionality**: What does this component or module do?
- **Callers & Consumers**: Who consumes it? (End users, internal worker services, external APIs, background jobs?)
- **Deployment Context**: Where does it execute? (Public browser runtime, Node server behind reverse proxy, CLI tool, sandboxed worker?)

### Step 2: Map Entry Points and Untrusted Inputs

Identify all physical and logical vectors where external or unverified data enters the application:

| Entry Point Vector | Examples | Validation Standard |
| :--- | :--- | :--- |
| **HTTP / REST Endpoints** | Express routes, SvelteKit server actions, fetch handlers | Strict typed schema validation (Zod/Valibot) |
| **Iframe / Window Messaging** | `window.addEventListener('message')`, postMessage bridges | Explicit `event.origin` check before parsing payload |
| **Local Storage / Persistence** | IndexedDB, Dexie, `localStorage`, SQLite | Type guards and schema parsing on read |
| **File System Inputs** | Uploaded user files, local config files, temp paths | Path traversal stripping (`path.basename`), magic bytes check |
| **CLI & Environment Variables** | Command-line arguments, process flags, `.env` | Parameter sanitization and strict type coercion |

### Step 3: Identify Trust Boundaries & Auth Assumptions

Document the barriers separating privilege tiers:

- **Authentication**: How are callers verified? (OAuth, session cookies, API tokens, none)
- **Authorization**: Are permissions validated per resource, or does the endpoint assume prior checks?
- **Boundary Crossings**: Where does data cross between trust levels? (e.g. Untrusted Browser Client ➔ Backend Service ➔ Database)
- **Implicit Trust Traps**: Flag any unverified assumptions such as *"only our frontend will call this API"* or *"data already in the database is safe"*.

### Step 4: Map Sensitive Data Paths & Privileged Actions

Trace the lifecycle of sensitive assets:

- **Secrets & Credentials**: API tokens, private keys, database connection strings (must never touch client bundles or git).
- **PII**: Emails, names, payment tokens, IP addresses (must be masked in UI and omitted from logs).
- **Privileged Operations**: File system writes, shell execution, permission changes, database deletions.

### Step 5: Establish Priority Review Areas

Rank the areas requiring immediate defensive review:

1. Untrusted inputs routed directly to execution sinks (`exec`, `eval`, SQL queries, raw HTML rendering).
2. Code executing privileged actions without explicit session checks.
3. State crossing trust boundaries without strict schema validation.

---

## 2.0 Scanner Finding Triage & Proof of Concept (POC)

When automated scanners (`npm audit`, Semgrep, CodeQL) produce findings, evaluate each item against the active threat model before applying fixes.

### 2.1 Finding Classification Rubric

| Classification | Meaning | Required Action |
| :--- | :--- | :--- |
| **True Positive** | Real, exploitable vulnerability given the component's entry points and trust boundaries. | Formulate patch plan, write failing test / POC, and remediate. |
| **False Positive** | Flagged construct is provably unexploitable due to external trust constraints, sandboxing, or type guarantees. | Document explicit rationale in code with `// TODO(security): [Rationale]` and mark resolved. |
| **Needs Manual Review** | Insufficient context or non-deterministic flow. | Halt and perform step-by-step trace or request human review. |

### 2.2 Proof of Concept (POC) Validation Rules

1. **Verify Reachability**: Can an external attacker actually supply input to the flagged line? If the input is hardcoded or internally generated, the vulnerability is unreachable.
2. **Minimal Reproduction**: Construct the smallest viable test case demonstrating the failure (e.g. passing `../` or `<script>` to the input handler).
3. **Defense-in-Depth**: Even if an upstream layer filters bad input, ensure the downstream sink is also safe (e.g. sanitize *and* use parameterized queries).

---

<!--
=============================================================================================
  CHANGELOG
=============================================================================================
  - 2026-09-04: Created threat_modeling.md reference guide integrating Google SecureCoder
    determine_threat_model and run_poc protocols into config/skills/security.
=============================================================================================
-->
