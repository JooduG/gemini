# Skill Architecture & Authoring Glossary

This domain reference defines the core levers, structural mechanics, and failure modes of agent skill authoring.

---

## Invocation & Load Mechanics

### Model-Invoked

A skill configured with a frontmatter `description` that the agent reads automatically. Pays continuous **Context Load** across every turn in exchange for autonomous execution and inter-skill accessibility.

### User-Invoked

A skill configured with `disable-model-invocation: true`. Strips agent context visibility, placing zero burden on context tokens. Imposes **Cognitive Load** on the user, who acts as the execution index.

### Description

The machine-readable invocation trigger sitting in frontmatter. Must state *when* to pull the skill into context based on symptoms, never *how* the workflow executes.

### Context Pointer

A link in text referencing external files or disclosed data (e.g., `data/GLOSSARY.md`). Controls when and how reliably an agent loads secondary reference material.

### Router Skill

A single user-invoked skill that indexes and directs execution to other user-invoked skills, mitigating user cognitive load.

---

## Information Hierarchy

### Primary Tier: Steps

Ordered execution actions written directly inside `SKILL.md`. Every step must end on a clear, checkable **Completion Criterion**.

### Secondary Tier: In-Skill Reference

Flat rules, tables, or facts stored directly in `SKILL.md` that govern step execution.

### Tertiary Tier: Disclosed Reference

External files residing in `data/` or `assets/` loaded on demand via context pointers to preserve `SKILL.md` legibility.

---

## Steering & Execution Controls

### Bright-Line Constraint

Absolute, non-negotiable directive that eliminates behavioral negotiation and exit ramps for the model.

### Leading Word (*Leitwort*)

A compact pretrained term (e.g., *tight*, *red*, *tracer bullets*) that anchors complex agent behaviors while minimizing token footprint.

### Legwork

The exploratory and verification actions executed by the agent within a single step. Driven higher by explicit completion demands.

### Completion Criterion

The boundary condition defining step completion. Must be checkable to prevent model drift.

---

## Failure Modes & Diagnostic Remedies

| Failure Mode | Symptom / Cause | Primary Remedy |
| :--- | :--- | :--- |
| **Premature Completion** | Agent rushes through steps without finishing work due to visible future steps. | **Sharpen completion criteria; hide post-completion steps via sequence splits.** |
| **Politeness Loophole** | Permissive, academic language allows the agent to skip tedious rules under stress. | **Convert soft guidance into Bright-Line Constraints.** |
| **Sprawl** | Document is excessively long, degrading attention across instructions. | **Apply Progressive Disclosure; move reference data to `data/`.** |
| **Sediment** | Stale instructions accumulate over time from risk-averse editing. | **Run pruning passes; enforce Single Source of Truth.** |
| **No-Op Instructions** | Directives that state default model behavior, wasting context load. | **Delete lines that do not actively alter default outputs.** |
| **Duplication** | The same concept defined in multiple places, creating maintenance hazards. | **Collapse into a single canonical source of truth.** |
