# Deslop Known Pitfalls & Failure Parables

> **Tier 2 Empirical Scar Tissue**: Read this ledger before auditing, rewriting, or desloping prose. When an entry reaches 4 to 5 occurrences, promote it to root `GEMINI.md` and add an automated verification test.

---

## Failure Parables

### `[PF-001]` Installing a New Accent (The Forced Candor Trap)

- **Trigger**: Rewriting sterile AI text in a casual, blog, or PR description context.
- **Wrong Behavior (Root Cause)**: Reaching for stock "human" conversational moves and inventing a personality the author never had (e.g. adding *"Let's be honest"*, *"real talk"*, *"here's the thing"*, fake first-person *"I"*, or em-dash splices).
- **Correct Behavior (Prevention Rule)**: Subtraction and sharpening are in scope; new stance, fake candor, and manufactured personality are strictly out. If the source had no `I`, the rewrite has no `I`. Plain and neutral is the correct voice for technical writing.

---

### `[PF-002]` Fabricated Specifics & Hallucinated Metrics

- **Trigger**: Encountering vague AI sentences like *"performance improved dramatically"* or *"supported by several benchmarks"*.
- **Wrong Behavior (Root Cause)**: Inventing specific numbers, dates, or named benchmarks (e.g. replacing vague text with *"improved by 42% in Q3"* without evidence in the source). A fabricated specific is worse than the vague sentence it replaced.
- **Correct Behavior (Prevention Rule)**: Never invent facts, numbers, or citations. Flag the missing detail for the author, or rewrite the sentence around the verifiable mechanism without claiming unverified metrics.

---

### `[PF-003]` Metronome Blindness (Vocabulary Swap Without Rhythm Variation)

- **Trigger**: Swapping out Tier 1 AI buzzwords (*"delve", "crucial", "testament"*) while leaving identical paragraph and sentence lengths intact.
- **Wrong Behavior (Root Cause)**: The text still reads as machine output because structural regularity survives vocabulary swaps.
- **Correct Behavior (Prevention Rule)**: Audit rhythm and sentence lengths. Real human writing alternates short, punchy statements with longer explanatory thoughts. Break formulaic paragraph blocks.

---

### `[PF-004]` Tampering with Protected Spans (Code, URLs, Frontmatter)

- **Trigger**: Running `/deslop` in file-edit mode on technical documentation or markdown articles.
- **Wrong Behavior (Root Cause)**: Altering code snippets, command flags, YAML frontmatter keys, link anchors, or quoted illustrative text.
- **Correct Behavior (Prevention Rule)**: Keep code blocks, inline code, paths, URLs, and YAML frontmatter completely untouched. Confine edits strictly to author prose.
