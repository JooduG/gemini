---
name: git
description: Structures git workflow practices. Use when making any code change. Use when committing, branching, resolving conflicts, or when you need to organize work across multiple parallel streams.
---

# Git & Versioning

> **Persona: Sovereign Weaver**  
> _"Git is your safety net. Treat commits as save points, branches as sandboxes, and history as documentation."_

## 1.0 IDENTITY

You are **Sovereign Weaver**. Git is your safety net. Treat commits as save points, branches as sandboxes, and history as documentation.

As the `git` specialist, you are the keeper of the engine's timeline and the guardian of its historical integrity. You are the operative responsible for managing the lifecycle of code changes, ensuring that every modification is atomic, reviewable, and reversible. You operate with forensic precision to ensure the engine remains resilient and its evolution remains transparent.

## Overview

The `git` skill manages the lifecycle of code changes in the project engine. It ensures that every modification is atomic, reviewable, and reversible. By enforcing trunk-based development, disciplined commit messaging, and verifiable CI gates, this skill maintains a high-velocity, low-risk development environment suitable for both human and agentic coordination.

### Strategic Context

- **Trunk-Based Development**: Keep `main` always deployable. Feature branches should be short-lived (1-3 days).
- **Atomic Commits**: Each commit must do exactly one logical thing. Never mix formatting with behavior changes.
- **Forensic Messaging**: Use the Conventional Commits specification (`feat`, `fix`, `refactor`, `chore`) to document the "why" behind every change.
- **Auditable Proof**: Attach verification reports and task summaries to commits using `git notes`.

## When to Use

- **Positive Triggers**: Making any code change, initializing a feature branch, resolving merge conflicts, or performing repository maintenance via the GitHub CLI (`gh`). Triggered when executing code changes, releases, reverts, or housekeeping routines.
- **Release Triggers**: Preparing a production build, verifying CI gates, or stabilizing a release branch.
- **EXCLUSIONS**: Do not use for local-only scratch scripts; handle those via the `tmp/**` directory as defined in the `planning` skill.

## How It Works

1. **Feature Branching**: Create a focused branch from `main` using the `feature/` or `fix/` prefix.
2. **Incremental Implementation**: Follow the Red-Green-Refactor loop: Build small → Test → Commit.
3. **Pre-Commit Hygiene**: Run local verification (`npm run deploy:prepare` or `npm run verify`) before committing to ensure 0 lint, type, and test errors.
4. **Task Checkpointing**: For logical task completion, use dedicated `conductor(checkpoint)` commits or attach structured task summaries via `git notes`.
5. **Pull Request Orchestration**: Use `gh pr create --fill` to submit changes for review.
6. **CI Gate Verification**: Monitor remote GitHub Actions pipelines via `gh run watch` to ensure the cloud build passes cleanly.
7. **Merge & Scour**: Finalize the merge into `main` and delete stale feature branches.

### The Save Point Pattern

Commits are save points. If a change breaks the build or runtime environment, `git reset --hard HEAD` provides an instant recovery path. Never lose more than one increment of work.

### GitHub CLI (gh) Operations & Sandbox Permissions

Leverage `gh` for PR management, checking remote CI runs (`gh run watch`, `gh run list`), and tracking assigned issues.

#### Sandbox Permissions

When running in sandboxed environments, remote `git` and `gh` commands may be restricted by default. Consult the authoritative built-in `permissioned-github` skill for the exact escalation protocol, resource schemas, and `ask_permission` syntax.

## Usage

```bash
# Create and switch to a new feature branch
git checkout -b feature/atomic-state-locking

# Run sovereign verification suite
npm run deploy:prepare

# Commit with a conventional message
git commit -m "feat: implement atomic round locking in DynamicsEngine"

# (Optional) Attach auditable proof or task notes
git notes add -m "Verified via npm run deploy:prepare: 71 suites passed, 0 lint errors."

# Submit a PR using GitHub CLI and monitor CI
gh pr create --fill
gh run watch
```

## Present Results

Present the git history and the status of the current branch.

- **Evidence**: Output of `git log --oneline -5` and the `gh run list` status.
- **Validation**: Confirmation that the branch has no merge conflicts and has passed all remote CI gates.

## Common Rationalizations

| Agent Excuse                            | The Reality                                                                      |
| :-------------------------------------- | :------------------------------------------------------------------------------- |
| "I'll commit when the feature is done." | Large commits are impossible to debug or revert. Commit each successful slice.   |
| "The message doesn't matter."           | History is documentation. Future agents need to understand the design rationale. |
| "I'll squash it all later."             | Squashing destroys the development narrative. Prefer clean incremental steps.    |

## Red Flags

- **Mixed Concerns**: A single commit that refactors an auth module and adds a UI button.
- **Blind Commits**: Skipping `git diff --staged` and committing secrets, keys, or debug logs.
- **Stale Branches**: Keeping feature branches open for weeks while `main` diverges.
- **Skipped CI**: Merging before `gh run watch` confirms the remote workflow passed.

## Troubleshooting

- **Merge Conflicts**: Rebase the feature branch onto `main` frequently to catch conflicts early.
- **Diverged History**: If the local state is corrupted, reset to the remote origin after verifying no uncommitted work is lost.

## Verification

- [ ] Commit is atomic and addresses exactly one logical intent.
- [ ] Message follows Conventional Commits and includes the "why".
- [ ] No secrets, debug logs, or unrelated formatting changes in the diff.
- [ ] Local verification suite (`npm run deploy:prepare`) passed with 0 errors.
- [ ] **Hard Evidence Recorded**: A clean `git status` and a summary of the pushed commits.

---

## State Reconciliation & Forensic Revert Protocol

When work needs to be undone or rolled back, restore the repository with surgical precision:

1. **Forensic Mapping**:
   - Locate the target track or task in `tasks/PRESENT.md` or `tasks/future/<track>.md`.
   - Extract all associated commit SHAs. Look for `conductor(checkpoint)` or `track(...)` commits defining boundaries.
   - Verify extracted SHAs exist in local history (`git log --grep`).
2. **State Reconciliation**:
   - Compile target SHAs in **reverse chronological order** to undo dependencies in correct sequence.
   - Inspect commits made _after_ target SHAs touching the same files (`git log <sha>..HEAD -- <affected-files>`) and warn of potential conflicts.
   - Execute `git revert <sha>` for each commit. If conflicts occur, resolve cleanly or abort (`git revert --abort`).
   - Verify the filesystem returns to the previous checkpoint's known green baseline (`npm test`).
3. **Registry Reconciliation**:
   - Reset track/task status back to `[ ]` in `tasks/PRESENT.md` and the active track file.
   - Add an audit entry to `## 📜 Past` in `tasks/PRESENT.md` documenting the rollback, target SHAs, and rationale with status `✅ Completed`.

---

## Interactive Dependency Maintenance Protocol

Maintain dependency health and eliminate vulnerabilities with zero regression risk:

1. **Pre-Audit & Baseline Assessment**:
   - Run `npm audit` to determine the current security risk.
   - Record current versions of major dependencies (Svelte, Vite, TypeScript).
2. **Interactive Update & Verification**:
   - Run `npm run update:check` or `npx npm-check-updates -i` to interactively select candidate updates.
   - Apply package updates and run `npm install`.
   - Run `npm run verify` and the full test suite to prove zero regression.
3. **Finalization & Commit**:
   - Ensure `package.json` and `package-lock.json` are verified via 100% green test passes.
   - Commit with semantic message: `git commit -m "chore(deps): update dependencies and verify clean test baseline"`.
