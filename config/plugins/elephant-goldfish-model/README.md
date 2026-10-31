# Elephant-Goldfish Model (EGM)

![Elephant-Goldfish Model](docs/assets/readme-header.svg)

**Design with an elephant. Review with a goldfish.**

[Install](#install) · [Quickstart](#try-your-first-design) · [Documentation](docs/getting_started.md)

---

Thousands of engineers use EGM to draft specs with deep-context agents and stress-test them with zero-context subagents before writing code.

**Elephant** holds your project context and drafts the specification. **Goldfish** reviewers examine the draft and referenced source material without the earlier conversation, helping expose unstated assumptions and blind spots. **You** make the architectural trade-offs and approve the specification before implementing.

Use it when a feature needs design decisions before implementation. For a small, clear bug fix, use your normal coding workflow.

## Install

This plugin is installed locally in your Antigravity configuration directory under `~/.gemini/config/plugins/elephant-goldfish-model/`.

Start a new session after installation to ensure all skills and reviewer subagents are registered.

## Try your first design

You can use each skill individually when needed.

| Skill                                            | Description                                                     |
| :----------------------------------------------- | :-------------------------------------------------------------- |
| [Brainstorm](skills/egm-brainstorm/SKILL.md)     | Test an idea and write a concept brief.                         |
| [Draft](skills/egm-draft/SKILL.md)               | Turn a brief or existing notes into a design document.          |
| [Resolve](skills/egm-resolve/SKILL.md)           | Work through review findings and agree on changes.              |
| [Bootstrap](skills/egm-bootstrap/SKILL.md)       | Create or update documentation for an existing codebase.        |
| [Review](skills/egm-review/SKILL.md)             | Review a design with fresh agents across five stages.           |
| [Review loop](skills/egm-review-loop/SKILL.md)   | Run a configured group of reviewers for a specific review task. |
| [Drift report](skills/egm-drift-report/SKILL.md) | Compare checked-in documents with the current source code.      |

## Learn more

- [Getting started](docs/getting_started.md): the workflow and project layout.
- [Setup & Harnesses](docs/harnesses.md): installation, agent capabilities, and known limits.
- [Architecture](docs/designs/architecture.md): how skills and reviewers fit together.
- [Dave Rensin's original essay](https://medium.com/@drensin/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874): the ideas behind EGM.
