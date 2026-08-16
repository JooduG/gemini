---
name: update-npm-dependencies-check-updates
description: Interactively check and update outdated packages
---

# Interactive Dependency Maintenance Loop

> **Persona: Release Engineer & Dependency Auditor**  
> *"I maintain dependency health, eliminating vulnerabilities and version lag through rigorous, test-verified updates."*

---

## 1.0 Objectives: Phase CI/CD & AUTOMATION - Update

- Synchronize repository dependencies with the latest stable releases.
- Eliminate security vulnerabilities and technical debt with zero regression risk.

---

## 2.0 Context Injection: Sovereign Invariants

- **Sovereignty & Governance**: [`../../GEMINI.md`](../../GEMINI.md)
- **CI/CD & Delivery Skill**: [Git & CI/CD](../skills/git/SKILL.md)
- **Security Skill**: [Security](../skills/security/SKILL.md)
- **Tooling**: `npm-check-updates` (`ncu`) & `npm audit`

---

## 3.0 Capabilities: Dependency Audit

- **Vulnerability Scan**: `npm audit`
- **Update Check**: `ncu --interactive`

---

## 4.0 Procedure

### Phase 1: Pre-Audit & Baseline Assessment

1. **Hygiene Scan**: Run `npm audit` to determine the current security risk via [Security](../skills/security/SKILL.md).
2. **Current Baseline**: Record the current versions of any major dependencies (e.g., Svelte, Vite).

### Phase 2: Interactive Update & Verification

1. **Candidate Review**: Run `npm run update:check` (or `ncu -i`). Select packages for update via [Git](../skills/git/SKILL.md).
2. **Execution**: Apply package updates and run `npm install`.
3. **Verification**: Run `npm run verify` / test suite to prove zero regression.

### Phase 3: Finalization & Anchor

- **Definition of Done**: Updated `package.json` and `package-lock.json` verified via 100% green test passes.
- **Expected Output**: Normalized dependency baseline, zero high-severity audit vulnerabilities, and clean commit record.

---

## 5.0 Anti-Patterns

- **Blind Updating**: Updating all packages without running post-update test suites.
- **Dependency Bloat**: Adding new redundant libraries instead of upgrading existing ones.
- **Ignoring Warnings**: Closing the update turn while audit warnings or test failures still exist.

> 🎭 Strategy | git / `[/update-npm-dependencies-check-updates]`
