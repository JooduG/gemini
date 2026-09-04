# Perchance Text-to-Image Plugin — Prompt Guide (Flux backend)

System instructions for generating, structuring, and optimizing prompts for the Perchance `text-to-image-plugin` (`generateImage`), which runs a Flux-based image model. Only the options in this document are exposed by the plugin — features like multi-reference compositing, prompt upsampling, step counts, JSON prompt structures, and free aspect ratios are NOT available and have been removed from the original FLUX.2 spec.

---

## 1. Core Prompting Constraints

- **Prefer positive framing.** Describe what must be present ("sharp focus throughout, empty deserted street, detailed five-fingered hands") rather than what to exclude. This remains the primary tool.
- **`negativePrompt` is supported, but it's a secondary guard.** Pass exclusions (e.g. `blur`, or `NSFW, nudity`) as a short, specific string. It steers — it doesn't strictly forbid — so never rely on it to fix a prompt that wasn't positively framed. It accepts no weight syntax either (`(blur:1.2)` is just the word blur — see §2).
- **Use narrative prose over keyword lists.** Construct prompts using full, descriptive sentences with natural grammatical flow rather than disjointed comma-separated tags.
- **Front-load critical tokens.** Word order dictates attention weight. Place key visual elements at the very beginning of the prompt string to prevent feature decay.

---

## 2. Weighting — What the T5 Encoder Ignores

The FLUX backend encodes prompts with a T5-XXL text encoder, not CLIP. Classic CLIP-style bracket-arithmetic weighting is treated as plain text: the model reads the words inside and discards the math. `(keyword:1.3)`, `((keyword))`, and `[keyword:0.4]` all reduce to just `keyword` — no emphasis is added or removed. Perchance may accept the syntax, but the FLUX engine doesn't use it.

Never express emphasis with weights. Express it in prose:

- **Intensify with strong descriptors** — "strikingly prominent", "dominant", "intensely", "the undeniable focal point of the frame".
- **Reinforce through semantic redundancy** — restate the key concept with varied synonyms across separate clauses ("the colossal obsidian tower ... the towering black spire looming over the city").
- **Attenuate with low-salience phrasing** — "faint", "subtle touch of", "barely visible in the distance", "almost lost in the shadows".
- **Frame exclusions positively** — describe what IS in the frame rather than what isn't (see §1).

### `[KEY: VALUE]` pseudojson tags are fine

The bracketed `[EXPRESSION: predatory curiosity]`-style tags this generator uses throughout its prompt pipeline are NOT weight arithmetic. They're key:value structure that reads as ordinary words ("EXPRESSION predatory curiosity"), so they cost nothing and can anchor attention. Only numeric weights in brackets or parentheses — and stacking `((...))` — are dead weight. The words always carry the meaning.

## 3. Prompt Architecture & Ordering

`Prompt = Subject + Action + Style + Context`

### Token Priority Sequence

1. **Primary Subject:** Main entity, character, or product focus.
2. **Key Action / Pose:** Spatial positioning, interaction, or movement.
3. **Core Style / Medium:** Artistic discipline, camera hardware, or rendering engine.
4. **Context & Atmosphere:** Environment, ambient lighting, time of day, and mood.
5. **Secondary Details:** Background elements, textures, and subtle accents.

### Length Guidelines

- **Short (10–30 words):** High-level style testing and rapid spatial concepts.
- **Medium (30–80 words):** Recommended balance for production tasks.
- **Long (80+ words):** Complex multi-subject compositions and exact style specs.

---

## 4. Photorealism & Hardware Simulation

Avoid generic buzzwords like "photorealistic", "4K", or "hyperrealistic". Achieve authentic photographic aesthetics by specifying real-world camera gear, lens properties, film stocks, and lighting setups.

### Hardware Descriptors

- **Modern Digital:** "shot on Sony A7IV, 85mm lens at f/1.4, clean sharp render, high dynamic range"
- **Medium Format:** "shot on Hasselblad X2D, 80mm lens, f/2.8, studio strobe lighting"
- **Analog Film:** "shot on 35mm Kodak Portra 400, natural film grain, muted contrast"
- **2000s Digicam:** "early 2000s compact digital camera, direct flash, slight image noise, high exposure candid"
- **Vintage 1980s:** "1980s faded color print, warm color cast, soft focus, visible grain"
- **Specialty Film:** "cross-processed expired Kodak Ektachrome 64 slide film, cyan-magenta split tones"

---

## 5. Typography & Layout Controls

The model renders legibly when text parameters are explicitly declared.

### Typography Rules

- **Enclose exact text in quotes.** Use double or single quotation marks around all target strings.
- **Specify four layout parameters for every text element:**

1. **Literal Content:** `"OPEN"`
2. **Spatial Placement:** `"centered directly above the front double doors"`
3. **Font Style & Weight:** `"bold retro 70s serif typography"`
4. **Color & Material:** `"glowing red neon"` or `"color #FF0000"`

---

## 6. Hex Color Binding & Gradients

The model maps exact hex codes to specific scene elements when bound directly to object nouns.

### Hex Syntax Standard

- **Bind color to target noun explicitly.** Use the format `[Subject] in color #HEX` or `[Subject] in hex #HEX`.
- _Incorrect:_ "Use color #C92695 in the picture"
- _Correct:_ **"A single sunflower in color #C92695"**

### Gradient Specifications

- **Linear Gradients:** State start, transition, and end colors alongside spatial direction.
- "Upper sky deep indigo (#1B0A3E) transitioning through burnt amber (#CF6A2E) in the middle to rose pink (#E8728A) at the horizon line"

- **Radial Gradients:** State center focal color and outer edge color.
- "Radial gradient transitioning from rich purple (#6A0DAD) at the center to gold (#FFD700) along the outer edges"

---

## 7. Character Consistency

To preserve subject identity across multiple generations, maintain an identical, explicit character baseline block in every prompt:

```text
[Baseline Profile]: 30-year-old male, brown skin tone, short natural fade black hair, black-framed glasses, athletic build, strong jawline.
[Action]: Wearing a blue button-up shirt, frantically typing on a holographic keyboard in a dark server room.
```

Keep the baseline block byte-identical across generations and vary only the action/context lines. (Multi-reference image compositing — feeding reference images into the prompt — is NOT available through this plugin, so consistency must be carried by the baseline text alone.)

---

## 8. Structured Planning (JSON as an internal drafting tool)

The plugin accepts any prompt string — so a raw JSON blob _can_ be sent as the prompt, but it's a poor idea: the model was trained on natural-language captions, so JSON scaffolding wastes tokens and tends to render literally or flatten instead of honoring the structure. Drafting the prompt as structured fields first, then flattening into prose, produces far more complete prompts than free-form writing. Use this as an internal scaffold (e.g. in an LLM's chain-of-thought) before emitting the final string:

```json
{
  "scene": "Studio product layout on polished surface",
  "subjects": [
    {
      "type": "Primary Object",
      "description": "Ceramic coffee mug with rising steam",
      "position": "Center foreground",
      "color": "#000000"
    },
    {
      "type": "Secondary Object",
      "description": "Matching ceramic mug",
      "position": "Right side of primary mug",
      "color": "#FFD700"
    }
  ],
  "style": "Commercial studio product photography",
  "color_palette": ["#000000", "#FFD700", "#CCCCCC"],
  "lighting": "Three-point softbox setup, soft diffused highlights",
  "composition": "Rule of thirds, high angle",
  "camera": {
    "body": "Hasselblad X2D",
    "lens": "85mm",
    "aperture": "f/5.6",
    "iso": 200
  }
}
```

Then collapse it into one ordered prose prompt following §3's token priority (subject → action → style → context), e.g.:

> "A ceramic coffee mug with rising steam, center foreground, matte black, with a matching gold mug to its right; commercial studio product photography, three-point softbox lighting, rule-of-thirds high angle, shot on Hasselblad X2D, 85mm at f/5.6."

The structured form guarantees every category is covered; the flattened form is what actually gets sent to the model.

### Pseudojson — the middle ground

Lightweight tagged notation hits the sweet spot between prose and JSON: it anchors attention without JSON's scaffolding. The model responds well to bracketed key:value directives embedded in prose:

- `[EXPRESSION: predatory curiosity]`
- `[ALARM: red strobe]`
- `[MATERIAL: brushed steel]`

This is exactly the format this generator already uses throughout its prompt pipeline (`[KEY: VALUE]` physical traits, `<VISUAL_ENGINE>` blocks) and parses back with `safe_parse_pseudo_json` — so prefer pseudojson tags over full JSON in actual prompts.

---

## 9. Multi-Language Optimization

The model processes non-English natural language natively. Two uses:

- **Regional authenticity:** prompt in the native language of the cultural setting to generate regionally authentic architecture, streetscapes, and cultural details — even when the rest of the prompt is English, naming the setting's own language grounds it ("a Tokyo alley", then sign text in Japanese).
- **Non-Latin text rendering:** quoted text in its native script (Japanese, Cyrillic, Arabic, etc.) renders far more legibly than romanized approximations — combine with the typography rules in §5.

---

## 10. Plugin Parameters — the actual API surface

| Option                          | Allowed values                                                    | Notes                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `resolution`                    | `512x512`, `512x768` (portrait), `768x512` (landscape), `768x768` | Only these four. Prefer the largest; scale down with CSS. Portrait suits character shots, landscape suits scenes.    |
| `guidanceScale`                 | default `7`, range `1`–`30`                                       | Higher = stricter prompt adherence. Extreme values can flatten style; keep near default unless a prompt is drifting. |
| `seed`                          | integer, `-1` = random                                            | Same seed + same prompt ≈ same image. Model upgrades can break reproducibility across time.                          |
| `negativePrompt`                | string                                                            | Short exclusions like `blur` or `NSFW, nudity`. Secondary to positive framing (see §1).                              |
| `removeBackground`              | `true`                                                            | Transparent-background output.                                                                                       |
| `width` / `height`              | display size in px                                                | CSS display sizing only — does NOT change generation resolution.                                                     |
| `style`                         | CSS string                                                        | Inline CSS applied to the output element.                                                                            |
| `saveTitle` / `saveDescription` | string                                                            | Gallery metadata if the user saves the image.                                                                        |
| `hideGalleryButtons`            | `true`                                                            | Hides the save-to-gallery / open-gallery hover buttons.                                                              |

**Not available (do not try):** aspect ratios beyond the four above, arbitrary dimensions, step counts, prompt upsampling, JSON prompt structures, multi-reference compositing.

### Inline Options

Options can be appended directly to the prompt string: `a cat (resolution:::512x768) (seed:::123)`. Supported inline keys: `seed`, `size`, `style`, `resolution`, `width`, `height`, `guidanceScale`, `saveTitle`, `saveDescription`.

### Practical Notes

- Prompt wording changes output quality dramatically — style keywords ("oil painting, octane render, trending on artstation, masterpiece") matter.
- Generation takes a few seconds to tens of seconds and requests queue; always show a loading indicator.
- In the generator, call `await root.generateImage({prompt, ...})`; the result exposes `.dataUrl`, `.canvas`, and `.inputs` (prompt, seed, etc.).
