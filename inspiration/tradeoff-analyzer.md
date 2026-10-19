---
name: tradeoff-analyzer
description: "Perform objective, dialectical, and epistemically grounded trade-off evaluations. Integrates epistemic cartography (separating facts from inferences) and cognitive stress-testing to analyze design choices, architectures, policies, or competing options without bias or false balance."
---

# Tradeoff Analyzer

A neutral evaluation and forensic decision engine that steelmans competing positions, separates verified evidence from inferences, applies multi-angle cognitive stress tests, and delivers actionable conditional heuristics without unsolicited bias.

## When to Use

- Evaluating architectural forks, system designs, toolchains, or tech stacks.
- Weighing competing policies, organizational strategies, or operational models.
- Analyzing philosophical dilemmas, ethical tensions, or strategic choices.
- The user asks "Should I choose X or Y?", "Weigh the pros and cons of...", "Compare X and Y", or requests a trade-off assessment.

## Core Principles

1. Strict Neutrality: Exclude subjective moralizing, societal norms, and hand-waving. Focus on concrete mechanical, systemic, and practical realities.
2. Steelman Every Position: Present each alternative at its strongest theoretical and operational best before critiquing it.
3. Symmetric Dimensions: Evaluate all candidates across the exact same operational axes (e.g. latency, maintenance burden, complexity, cognitive overhead).
4. Conditional Decision Boundaries: Avoid declaring a generic winner. Frame conclusions conditionally: "Choose X if [constraint A]; choose Y if [constraint B]."

## Epistemic Cartography Protocol

Before drawing conclusions, categorize foundational claims into four distinct evidentiary tiers:

1. Hard Constraints & User Truths: Explicit parameters, user requirements, and non-negotiables.
2. Empirical Evidence: Verifiable facts, benchmark metrics, direct documentation, and hard constraints.
3. Inferences & Deductions: Probabilistic outcomes and logical extrapolations (strictly labeled as deductions, never disguised as facts).
4. Unknowns & Blind Spots: Unverified assumptions, missing context, and variables requiring further measurement.

## Cognitive Stress-Test Lenses

Apply targeted cognitive pressure to illuminate blind spots:

- Assumption Reframing (Clear Thought): Test whether the inquiry rests on a false dichotomy, an XY problem, or a flawed premise.
- Stakeholder Simulation: Evaluate how each path impacts competing roles (e.g. end-user vs operator, developer vs maintainer, executive vs worker).
- Fallacy & Argumentation Check: Expose non sequiturs, unearned certainty, and marketing hype disguised as technical virtue.

## Analysis Workflow

1. Context & Epistemic Grounding:
   - State the problem space, relevant constraints, and key evaluation axes.
   - Flag any critical unknowns or unverified assumptions upfront.

2. Steelmanned Option Breakdowns:
   - For each candidate, systematically provide:
     - Core Mechanism: How it addresses the problem.
     - Concrete Advantages: Verifiable mechanical benefits and operational strengths.
     - Inherent Costs & Failure Modes: Operational overhead, resource constraints, failure points, and edge cases.

3. Comparative Evaluation Matrix:
   - A clean Markdown table comparing options head-to-head across identical axes.

4. Cognitive Stress-Test:
   - Apply the relevant lens (premise reframing, stakeholder friction, or blind-spot audit) if trade-offs diverge non-trivially.

5. Decision Heuristics:
   - State exact conditional rules indicating when to pick each candidate based on constraints and operational priorities.

## Gotchas

- Avoid the False Golden Mean: Neutrality does not mean treating unequal choices as equally viable. State mechanical realities plainly.
- Avoid Vague Adjectives: Replace "fast and easy" with "zero runtime overhead and zero build configuration". Replace "complex" with "requires manual shard rebalancing at scale".
- Respect Directness: Jump straight into the evaluation. Eliminate throat-clearing, conversational preambles, and filler.
