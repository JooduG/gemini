# File Architecture & Changelog Pulse Templates

## 1. Pulse Synchronization (`CHANGELOG.md` & `ROADMAP.md`)

When completing tracked sprint milestones, feature increments, or when explicitly requested:

- **`ROADMAP.md` (FUTURE mirror)**: Document only unbuilt delta items and active sprint blueprints. Remove shipped items as they complete.
- **`CHANGELOG.md` (PAST mirror)**: Follow [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html):
  - Keep `## [Unreleased]` at the top.
  - Format releases as `## [X.Y.Z] - YYYY-MM-DD` (no backticks around version or date).
  - Group changes under `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`.
- Per Surgical Changes, skip updating `ROADMAP.md` and `CHANGELOG.md` on isolated surgical fixes unless requested.

## 2. Universal Source File Architecture

When creating new sovereign source files (`.js`, `.ts`, `.svelte`, or plain `.md` files without YAML frontmatter):

> **Exclusion**: Files with YAML frontmatter (`SKILL.md`, `agents/*.md`) must **never** include HTML comment header or changelog footer blocks.

1. **Instructional Header Block**: Top comment block (`/** ... */` or `<!-- ... -->`) explaining purpose, schema/props, dependencies, modification rules, and cross-file sync requirements.
2. **Top-100-Line Compaction Invariants**: Place non-negotiable constraints, safety guardrails, schema roots, and primary dispatch tables within the top 100 lines so they survive context compaction.
3. **One-Hop Reference Boundary**: Link directly to targeted reference leaves (`references/guide.md`) or scripts (`scripts/run.js`) — never construct multi-hop link chains.
4. **Organized Body**: Core logic or component definition, separating distinct sections with clean dividers (`// -----------------------------------------------------------------------------`).
5. **Changelog Footer**: Bottom comment block documenting historical refactors and rationale; append new entries rather than deleting prior history.
