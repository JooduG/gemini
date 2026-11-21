---
name: git
description: >-
  Git workflow practices, trunk-based branching, Conventional Commits, git notes,
  and GitHub CLI (`gh`) operations. Use when creating branches, committing atomic
  slices, resolving merge conflicts, inspecting git history/diffs, attaching git
  notes, or reverting commits. Do NOT use for prose/changelog rewriting (use `deslop`),
  structural code refactoring (use `refactor`), or GitHub permission escalations
  (delegate to built-in `permissioned-github`).
---

# Git & Versioning

## 1.0 Core Workflow Standards

- **Trunk-Based Branching**: Keep `main` deployable. Use short-lived `feature/` or `fix/` branches.
- **Atomic Commits**: One logical change per commit—never mix behavior changes with unrelated formatting churn.
- **Conventional Commits**: Use `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:` describing the intent and *why*.
- **Auditable Proof**: Attach verification summaries to milestone commits via `git notes add -m "..."` when requested.

## 2.0 Execution Loop & `gh` CLI

1. **Branch**: `git checkout -b feature/<topic>` (or `fix/<topic>`).
2. **Verify Before Commit**: Run the repository's local lint/test verification suite and inspect `git diff --staged` to guarantee zero leaked secrets, debug logs, or unrelated edits.
3. **Commit**: `git commit -m "<type>: <concise message>"`.
4. **Remote Operations & PRs**: Use `gh pr create --fill` and `gh run watch`. When sandbox restrictions block remote `git`/`gh` commands, consult the built-in `permissioned-github` skill for the escalation protocol.

## 3.0 State Reconciliation & Forensic Revert Protocol

When rolling back broken work safely:

1. **Locate SHAs**: Extract target commit SHAs from `git log --oneline` or `CHANGELOG.md`.
2. **Check Downstream Collisions**: Inspect commits after the target SHA touching the same files (`git log <sha>..HEAD -- <files>`).
3. **Reverse Chronological Revert**: Execute `git revert <sha>` in reverse chronological order (never `git reset --hard` on shared branches). Abort cleanly with `git revert --abort` on conflicts.
4. **Verify Baseline**: Run the test suite to confirm a green baseline after reverting, and update `ROADMAP.md` / `CHANGELOG.md` if tracked.

## 4.0 Verification Checklist

- [ ] Commit addresses one logical unit; `git diff --staged` inspected for secrets or debug logs.
- [ ] Local lint and test checks pass prior to committing.
- [ ] Clean `git status` and recent `git log --oneline -5` confirmed.
