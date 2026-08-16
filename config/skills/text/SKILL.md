---
name: perchance-plugin-text
description: Technical mastery of the Perchance AI Text Plugin API layer, iframe messaging lifecycle, token approximation utilities, prefix caching, streaming, vision/image attachments, and stream rendering controls.
---

# AI Text Plugin Technical Specification & Usage Guide

> **Persona: Sovereign Scribe**  
> *"I master the low-level mechanics of text streaming, prompt assembly, and iframe message lifecycles across the simulation continuum."*

```pjs
generateText = {import:ai-text-plugin}
```

## 1.0 Low-Level Architecture & Iframe Communication

The text plugin interfaces with the host generation system by spawning a dedicated, sandboxed iframe pointing directly to `https://text-generation.perchance.org/embed`.

- **State Preservation**: The interface initializes a unique global variable (`window.__alreadyAddedAiTextPluginStuff8492739`) to prevent multi-mount degradation across hot-reloading cycles.
- **Keep-Alive Cycles**: The local stream loop transmits a `streamKeepAlive` packet via `window.postMessage` every 800ms to defend against connection dropping.
- **Anti-Phantom Garbage Collection**: Every completion instance binds to a distinct, randomized `completionId`. If the target DOM node vanishes or undergoes state transformation during execution, the stream terminates instantly to prevent memory leaks.

## 2.0 API Parameters & Programmatic Usage

Call `root.generateText` with a plain string (interpreted as `instruction`), or an options object:

```js
let result = await root.generateText(
  "Explain quantum field theory to a toddler.",
);
let result2 = await root.generateText({
  instruction: `You are Bob, a gruff blacksmith. Continue the conversation.\n${chatLog}`,
  startWith: "Bob:",
  stopSequences: ["\nUser:"],
  onChunk: (data) => {
    replyEl.textContent += data.textChunk;
  },
});
```

### Core API Parameters & String Normalization

- `instruction`: The programmatic string directive passed to the generation model (or array containing text and max 1 image Blob/File for vision).
- `startWith`: An anchor string forcing the AI's response down a predictable path. *Correction Policy*: The API forcefully strips trailing spaces while keeping newline (`\n`) formats intact, bypassing tokenization space-merging bugs common in text transformers.
- `stopSequences`: An array defining hard string boundaries that trigger an immediate completion cutoff. The stop sequence IS included at the end of the generated response.
- `outputTo`: Reference mapping to an HTML element container where the streaming payload is piped directly.
- `hideStartWith`: Boolean value that allows an anchor string to be evaluated in the model context while suppressing its visual rendering in the DOM.

### Return Values & Control Properties

The `await` resolves to a String-like object:

- `.text`: Equals the full text including `startWith`.
- `.generatedText`: Excludes `startWith`.
- `.liveResponseText`: Current text including any user edits made via the UI edit button.
- Un-awaited Promise extras:
  - Direct HTML assignment: `outputEl.innerHTML = root.generateText("...")` streams automatically into the element.
  - Abort method: Call `.stop()` on the un-awaited promise object to cancel generation.

## 3.0 Real-Time Token Budgeting & Prefix Caching

### Token Approximation Engine

- **Bigram Parser**: Rather than downloading massive transformer libraries, the codebase parses strings locally using a compact, binary-mapped bigram layout array stored as a base64 string (`MODEL_BASE64`).
- **Performance**: Operates significantly faster and smaller than default tokenizer packages by executing low-level bitwise operations (`keyHash`) and direct byte lookups against array tables.
- **Budgeting API**: Retrieve meta utilities synchronously via `let { countTokens, idealMaxContextTokens } = root.generateText({getMetaObject:true})`. Always read `idealMaxContextTokens` from the meta object rather than hardcoding.

### Fast Successive Generations (Prefix Caching)

The backing service caches the KV-prefix of recent prompts. Prompts sharing a long UNCHANGED PREFIX with previous calls start significantly faster.

- **Append-Only Transcripts**: Place fixed instructions/persona text first, followed by the log. Append new turns at the END. Never rewrite, reorder, or timestamp-prefix earlier text per call.
- **Task at the End**: Place changing tasks or dynamic state (e.g. user status/location/HP) at the *end* of the prompt after static logs/history so the long prefix remains valid.
- **Intermittent Summarization**: Compact long logs only when exceeding token budgets, folding older messages into a summary block while preserving recent turns verbatim.

```js
let { countTokens, idealMaxContextTokens } = root.generateText({
  getMetaObject: true,
});

let summary = ""; // rolling summary of compacted history
let messages = []; // verbatim transcript tail: "User: ..." / "Bob: ..."
const KEEP = 8; // newest messages kept verbatim

function buildPrompt(task) {
  let log = [
    summary && `[Summary of earlier conversation:\n${summary}]`,
    ...messages,
  ].filter(Boolean);
  return `Below is a series of messages. Follow the TASK at the end of the messages.
<MESSAGES>
${log.join("\n\n")}
</MESSAGES>
TASK: ${task}`;
}

async function chat(userMsg) {
  messages.push(`User: ${userMsg}`);
  let reply = await root.generateText({
    instruction: buildPrompt("Write the next response as 'Bob'."),
    startWith: "Bob:",
    stopSequences: ["\nUser:"],
    onChunk: (d) => {
      replyEl.textContent = d.fullTextSoFar;
    },
  });
  messages.push(reply.text.trim());
  maybeCompact(); // deliberately NOT awaited to avoid delaying the next turn
}

let compacting = false;
async function maybeCompact() {
  if (compacting || messages.length <= KEEP) return;
  if (countTokens(buildPrompt("")) < idealMaxContextTokens * 0.9) return;
  compacting = true;
  try {
    let n = messages.length - KEEP;
    let boundary = messages[n - 1].slice(-30);
    let result = await root.generateText(
      buildPrompt(
        `Summarize the first ${n} messages, stopping after the message that ends with "${boundary}". Fold in the [Summary of earlier conversation...] block if present. Terse bullets; preserve names, facts, decisions, and unresolved threads. Output ONLY the new summary text.`,
      ),
    );
    summary = result.text.trim();
    messages = messages.slice(n);
  } finally {
    compacting = false;
  }
}
```

## 4.0 Stream Lifecycle & Callbacks

- `onStart(data)`: Fires upon execution initialization (`data.inputs.instruction`, `data.inputs.startWith`).
- `onChunk(data)`: Fires on every sub-word token block pulled from the streaming network buffer (`data.textChunk`, `data.fullTextSoFar`, `data.isFromStartWith`).
- `onFinish(data)`: Resolved upon completion or stop sequence hit (`data.text`, `data.generatedText`, `data.liveResponseText`).
- `render(data)`: Evaluates incoming chunks synchronously (`data.text`, `data.isPartial`). Whatever string is returned is displayed in DOM mode.

*UX Best Practice*: For medium-to-large text visible to the user, always use `onChunk` streaming so users can begin reading immediately.

## 5.0 Image Attachments (Vision)

Pass an array containing text parts and at most ONE image `Blob`/`File` (PNG, JPEG, WebP; GIF throws) as `instruction`:

```js
let blob = await (await fetch(imgUrl)).blob();
let result = await root.generateText({
  instruction: [
    "Here is a photo of my fridge contents:",
    blob,
    "\nSuggest a dinner recipe using only what you can see.",
  ],
  startWith: "Recipe:",
});
```

- **Constraints**: Maximum 1 image per call (extra images throw synchronously). Client auto-encodes to ≤768px and ≤200KB. Anything >250KB throws.
- **Token Budget**: An image costs a flat **~570 tokens**. Budget using `getMetaObject().countTokens(textOnly) + 570`.
- **Caching Strategy**: Place dynamic changing images at the END of the prompt to keep static text prefixes cached. Constant images can be placed anywhere.

## 6.0 Template & pjs-Template Usage

Direct evaluation in Perchance HTML/Lists (`[root.generateText(poemPrompt)]`):

```pjs
poemPrompt
  instruction = Write a haiku about a [character] in [place] during [season].
```

- `outputTo = [someEl]`: Stream response into designated element.
- `style = ...`: CSS applied to output text display.
- `endButtons = none`: Hide edit/continue buttons post-generation.
- `render(data)`: Transform output chunks (e.g. converting asterisks to markdown italics).
- `hideStartWith = true`: Generate from anchor string without rendering it.
- Functions as values: `instruction`/`startWith`/`stopSequences` can be functions returning strings to prevent premature `[...]`/`{...}` template evaluation.

## 7.0 Gotchas & Operational Boundaries

- **Latency**: Generation may take up to 60 seconds (much faster on prefix-cache hits). Always render loading indicators.
- **Ad Banner**: Non-logged-in users will see an ad container appended to generators using this plugin.
- **Concurrency**: Server requests per user are rate/concurrency limited; extra requests queue automatically.
- **Safety Filters**: The model follows NSFW prompts; if unintended NSFW occurs, append safety constraints to `instruction`.

## 8.0 Progressive Implementation Protocol & Architecture

1. **Assembly**: Collect parameters (`instruction`, `startWith`, `stopSequences`) into a clean configuration object inside script modules.
2. **Validation**: Verify target DOM elements contain active identity data tags mapping to the specific generation ID.
3. **Activation**: Fire the async controller to activate the sandboxed communication iframe.
4. **Cleaning**: Sanitize incoming text fragments through a processing array before writing data into reactive UI variables.
5. **Termination**: Trigger manual abort switch (`.stop()`) if viewport listeners detect parent container destruction events.

### Transport Bridging & Registry Architecture

- **Global Scope Anchor**: Explicitly bind the text generation handler to global window (`window.pluginAi`) to prevent transport drops during Svelte reactive hydration.
- **Declarative Registry**: Use a flat declarative plugin registry array rather than imperative conditional chains for multi-asset pipelines.
- **Lego-Brick Context Scaling**: Modularize prompt payloads into distinct semantic layout nodes (system instructions, persona structures, dynamic keyword lorebooks) to optimize prefix caching and respect token ceilings.
