---
name: perchance-platform
description: Authoritative technical specification for the Perchance Platform Engine, DSL compilation semantics, lifecycle execution order, dynamic metadata sandbox ($meta.dynamic), engine gotchas, and official auxiliary plugins directory (comments-plugin, secret-plugin, super-fetch-plugin, music-generation).
---

# Perchance Platform & DSL Specification

Authoritative reference for Perchance platform semantics, compilation invariants, execution order, `$meta.dynamic`, and auxiliary plugins.

---

## 1.0 Empirical Pitfalls & Scar Tissue

| Trigger                         | Wrong Behavior                                                                                   | Correct Behavior                                                                                                                                   |
| :------------------------------ | :----------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HTML in Square Blocks**       | Putting raw HTML tags inside `[...]` blocks in the HTML panel: `[p = "<p>hi</p>"]`.              | `innerHTML` parses before square blocks. Raw `<` breaks the template. Build markup in the lists panel or use `\u003c` unicode escapes.             |
| **Comma-Command `if/else`**     | Appending `if/else` after a comma in the same block: `[a = 1, if (a) { "yes" }]`.                | **Engine bug**: `if/else` cannot follow a comma-command in the same block. Split into separate blocks: `[a = 1][if (a) { "yes" }]`.                |
| **Re-Randomizing Picks**        | Storing `[f = fruit.selectOne]` and expecting `[f]` to remain stable across evaluations.         | `selectOne` does not freeze random sub-items. Always use `[f = fruit.evaluateItem]` to evaluate and freeze a selection.                            |
| **DOM ID / List Shadowing**     | Giving an HTML element an `id` that matches a top-level list name (e.g. `<div id="character">`). | Element IDs become window globals and shadow list names in expressions, leading to silent calculation errors or `[object HTMLDivElement]` strings. |
| **`$meta.dynamic` Scope Leaks** | Accessing `root`, `window`, top-level lists, or `document` inside `$meta.dynamic`.               | Dynamic metadata runs in an isolated server compartment. Read ONLY `inputs.urlParams` and inline all helper mappings.                              |

---

## 2.0 Engine Execution Model

Execution proceeds strictly in three distinct phases:

1. **HTML Parsing**: HTML panel structure is inserted without executing `<script>` tags.
2. **Script Execution**: All `<script>` and `<script type="module">` tags run top-to-bottom.
3. **Square Block Evaluation**: All square blocks `[...]` across the lists and HTML panels execute top-to-bottom and left-to-right **only after all scripts have completed**.

### Dynamic Updates

- `update()`: Re-evaluates all square blocks in the DOM (does not reload the page or reset JavaScript variables).
- `update(elementId)`: Scopes re-evaluation strictly to children of the specified container element.

---

## 3.0 DSL Compilation & Selection Semantics

### Odds (`^`)

- Static odds: `item ^2`, fractional `item ^0.3`.
- Dynamic odds: `item ^[expr]` re-evaluated on every selection (e.g. `item ^[level > 5]`).

### Alternation & Interpolation

- Inline choices: `{sword|bow|staff}`. Weighted: `{sword^3|bow}`.
- Silent assignment: `[x = 5, ""]` (runs expression, returns empty string).
- Dynamic-variable shorthand: `init = [a=1, b=2]` re-runs every time `init` is referenced.

---

## 4.0 Dynamic Metadata (`$meta.dynamic`)

Use `$meta.dynamic` when social share cards or page titles depend on URL parameters:

```pjs
$meta
  title = Character Library
  description = Default fallback description.

  async dynamic(inputs) =>
    const id = inputs.urlParams.character;
    if (!id || !/^[a-z0-9-]{1,60}$/i.test(id)) return {};

    const res = await fetch(`https://example.com/api/characters/${encodeURIComponent(id)}`);
    if (!res.ok) return {};
    const char = await res.json();

    return {
      title: `${char.name} — RPGlitch`,
      description: char.summary,
      image: char.avatarUrl
    };
```

- **Sandbox Constraints**: Self-contained JavaScript only. No DOM, `window`, `document`, or top-level lists. Execution has a **4-second hard timeout**.

---

## 5.0 Auxiliary Official Plugins Directory

### 5.1 `comments-plugin` (Chat & Discussion)

```pjs
comments = {import:comments-plugin}
```

Embeds a realtime discussion stream:

```javascript
outputEl.innerHTML = root.comments({
  channel: "general-chat",
  forceColorScheme: "dark",
  adminPasswordHash: "sha256-hash-here",
});
```

### 5.2 `secret-plugin` (Post-Quantum Public-Key Encryption)

```pjs
secret = {import:secret-plugin}
```

FIPS 203 ML-KEM post-quantum asymmetric encryption:

```javascript
const keys = root.secret.generateKeyPair(); // { public, private }
const cipher = root.secret.encrypt("Secret message", keys.public);
const plain = root.secret.decrypt(cipher, keys.private);
```

### 5.3 `super-fetch-plugin` (CORS Proxy)

```pjs
superFetch = {import:super-fetch-plugin}
```

Bypasses CORS restrictions in generator runtime code via an official proxy:

```javascript
const data = await root
  .superFetch("https://api.external.com/data")
  .then((r) => r.json());
```

### 5.4 `music-generation` (Soundtrack Composition)

Composes structured instrumental/vocal MP3 tracks via the Perchance audio engine.

- Always require user gesture before initiating playback (`new Audio(url).play()`).
- Implement volume crossfading for seamless atmosphere transitions.
