# Comprehensive AI Writing Pattern Catalog

> **Authority: Tier 3 Reference Leaf for `/deslop`**  
> *"Every entry lists the tell and the fix. Subtraction and sharpening are in scope; manufactured stance is out."*

---

## 1. Severity Tiers

* **P0 (Credibility Killers)**: Cutoff disclaimers (*"As of my last update"*), chatbot leftovers (*"I hope this helps!"*, *"Certainly!"*), vague attributions (*"Experts believe"*, *"Studies show"*), significance inflation on routine refactors (*"pivotal milestone"*, *"revolutionizing"*), unfilled placeholders (`[Your Name]`), chat citation markup leaks (`citeturn0search0`), and AI-tool tracking parameters (`utm_source=chatgpt.com`).
* **P1 (Obvious AI Smell)**: Formulaic *"Not X, but Y"* constructions, *"In the rapidly evolving world of..."* openers, hollow intensifiers (*"truly"*, *"quite frankly"*, *"genuine"*), hedge-stacks (*"could potentially create"*), em dashes exceeding 1 per 1,000 words, bold overuse on every list item, bullet lists of bare noun phrases, and synonym cycling (*"practitioners... builders... developers"*).
* **P2 (Polish & Rhythm)**: Metronomic sentence length, copula avoidance (*"serves as"*, *"boasts"*, *"represents"* instead of *"is"*), formulaic transitions (*"Moreover"*, *"Furthermore"*, *"Additionally"*), and compulsive triads (*"fast, scalable, and robust"*).

---

## 2. Formatting & Typography Tells

* **Em Dashes**: Target zero; hard cap at one per 1,000 words. Mid-sentence dashes frequently mask an inability to write clean compound sentences. Carve-out: a dash separating a bolded lead term from its gloss in a list item (`- **Term** - description`) is typography, not a prose splice.
* **Bold Overuse**: At most one bolded phrase per major section. If something is important, structure the sentence to lead with it rather than bolding entire clauses.
* **List-Label Periods**: Avoid ending a bold list label with a period when the gloss is a fragment (`- **Speed.** High throughput`). Use colons (`- **Speed:** high throughput`).
* **Excessive Structure**: More than 3 headings in 300 words or 8+ bullets in 200 words is scaffolding masking an absence of substance. Formulaic headers (*"Overview"*, *"Key Points"*, *"Summary"*) say nothing.
* **Hyphenated-Pair Overuse**: Compound modifiers piled on one noun. Hyphenate before the noun (*"a high-quality report"*) and not after a linking verb (*"the report is high quality"*).
* **Curly Quotes in Plain Text**: A weak paste-from-chat signal in source code comments, commit messages, or plaintext drafts where text does not auto-curl.

---

## 3. Sentence Structure & Framing Tells

* **"It's not X, it's Y"**: Rewrite as a direct positive claim. Includes the split-sentence form across two sentences, the multi-negation countdown (*"Not the price. Not the features. The trust."*), and the tailing negation fragment (*"...comes from the selected item, no guessing"*).
* **Hollow Intensifiers**: Delete `genuine`, `truly`, `quite frankly`, `to be honest`, `let's be clear`, `it's worth noting that`.
* **Vague Endorsement**: Replace `worth reading`, `worth a look`, `worth your time` with the concrete reason why.
* **Copula Avoidance**: Replace `serves as`, `boasts`, `features`, `represents` with plain `is` or `has`. Default to plain verbs.
* **Subjectless Fragments & Agentless Passives**: Name the actor when it clarifies (*"Engineers added nested query support"* rather than *"Support for nested queries was added"*). Carve-out: terse changelogs or git commit subjects.
* **Hedge-Stacked Predictions**: A modal plus a hedge adverb (*"could potentially create"*, *"may eventually unlock"*). Either word alone is fine; the stack asserts nothing. Pick one.
* **Compulsive Rule of Three**: Vary sentence cadence. Never force items into arbitrary groups of three adjectives or nouns.
* **Invented Contrast-Pair Mirroring**: One half is a real term of art, the other fabricated for symmetry (*"false precision rather than genuine accuracy"*). State the positive claim directly.

---

## 4. Openers, Transitions, and Closers

* **Formulaic Openings**: Broad context before the point (*"In the rapidly evolving world of..."*). Lead with the concrete news.
* **"Let's" Constructions**: *"Let's explore"*, *"Let's break this down"*. Start directly with the point.
* **Reader-Steering Frames**: Cut *"Here's what's interesting"*, *"Here's what caught my eye"*. Let the content signal its own importance.
* **Transition Clichés**: Eliminate *"Moreover"*, *"Furthermore"*, *"Additionally"*, *"In terms of"*, *"At the end of the day"*, *"In conclusion"*.
* **Generic Future Closers**: Modal plus *"become"* plus *"one of the most `[adjective]` `[narratives/trends]`"*. Replace with a falsifiable, concrete next step or cut.

---

## 5. Machine Fingerprints & Publishing Artifacts

These are deterministic publishing bugs. Strip on sight:

* **Unfilled Placeholders**: `[Your Name]`, `[INSERT SOURCE URL]`, `2025-XX-XX`, HTML comment placeholders.
* **Chat Citation Leaks**: `citeturn0search0`, `contentReference[oaicite:0]`, `oai_citation`, `[attached_file:1]`, `grok_card`.
* **AI-Tool URL Tracking Parameters**: Strip `utm_source=chatgpt.com`, `utm_source=claude.ai`, `utm_source=perplexity.ai`, `referrer=grok.com`. Leave functional query parameters intact.

---

## 6. Rhythm, Structure, & Writer-Side Tests

Structural regularity is the hardest signal to mask: a piece with every flagged word replaced and its rhythm untouched still reads as machine output.

* **Sentence-Length Uniformity**: Sentences consistently landing in the 15-to-25 word band sound robotic. Alternate 3-to-8 word sentences with 20-plus word complex sentences.
* **Paragraph-Length Uniformity**: Vary deliberately. Some paragraphs should be a single punchy sentence.
* **Paragraph-Reshuffle Immunity**: Can two body paragraphs swap without breaking the piece? If order does not matter, it is a list of points rather than a cohesive argument that builds.
* **The Treadmill Test**: Read each paragraph and ask what is new. If 40% to 60% can be cut without losing information, the prose is restating its premise in fresh words. Cut to the core fact.
* **Rewrite from Scratch**: When 5 or more vocabulary flags, 3 or more distinct pattern categories, and metronomic sentence length all appear together, patching phrases will not save it. State the core point in one sentence and rebuild from there.
