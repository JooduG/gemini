---
name: perchance-plugin-text
description: Technical mastery of the Perchance AI Text Plugin API layer, iframe messaging lifecycle, token approximation utilities, and stream rendering controls.
---

# AI Text Plugin Technical Specification

## 1.0 Low-Level Architecture & Iframe Communication

The text plugin interfaces with the host generation system by spawning a dedicated, sandboxed iframe pointing directly to `https://text-generation.perchance.org/embed`.

- State Preservation: The interface initializes a unique global variable (`window.__alreadyAddedAiTextPluginStuff8492739`) to prevent multi-mount degradation across hot-reloading cycles.
- Keep-Alive Cycles: The local stream loop transmits a `streamKeepAlive` packet via `window.postMessage` every 800ms to defend against connection dropping.
- Anti-Phantom Garbage Collection: Every completion instance binds to a distinct, randomized `completionId`. If the target DOM node vanishes or undergoes state transformation during execution, the stream terminates instantly to prevent memory leaks.

## 2.0 API Parameters & String Normalization

- `instruction`: The programmatic string directive passed to the generation model.
- `startWith`: An anchor string forcing the AI's response down a predictable path. *Correction Policy*: The API forcefully strips trailing spaces while keeping newline (`\n`) formats intact, bypassing tokenization space-merging bugs common in text transformers.
- `stopSequences`: An array defining hard string boundaries that trigger an immediate completion cutoff.
- `outputTo`: Reference mapping to an HTML element container where the streaming payload is piped directly.
- `hideStartWith`: Boolean value that allows an anchor string to be evaluated in the model context while suppressing its visual rendering in the DOM.

## 3.0 Real-Time Token Budgeting

- Bigram Approximation Engine: Rather than downloading massive transformer libraries, the codebase parses strings locally using a compact, binary-mapped bigram layout array stored as a base64 string (`MODEL_BASE64`).
- Performance Layer: Operates significantly faster and smaller than default tokenizer packages by executing low-level bitwise operations (`keyHash`) and direct byte lookups against array tables.
- Context Constraints: Monitored against an engine sweet-spot threshold, targeting a baseline optimal limit (`idealMaxContextTokens: 6000`).

## 4.0 Stream Lifecycle Callbacks

- `onStart(promise)`: Fires immediately upon execution initialization.
- `onChunk({ fullTextSoFar, textChunk, isFromStartWith })`: Fires on every single sub-word token block pulled from the streaming network buffer.
- `onFinish(result)`: Resolved upon natural completion, error timeouts, or stop sequence hits. The resulting payload returns metadata properties including `.text`, `.generatedText`, and `.stopReason`.
- `render({ text, isPartial })`: Evaluates incoming chunks synchronously, allowing real-time character mutations or string replacements before DOM rendering occurs.

## 5.0 Progressive Implementation Protocol

1. Assembly: Collect parameters (`instruction`, `startWith`, `stopSequences`) into a clean configuration object inside your script modules.
2. Validation: Verify that target DOM elements contain active identity data tags mapping to the specific generation ID.
3. Activation: **Fire the async controller** to activate the hidden communication iframe.
4. Cleaning: **Sanitize incoming text fragments** through a processing array before writing data straight into reactive UI variables.
5. Termination: **Trigger the manual abort switch** if viewport listeners detect parent container destruction events.

## 6.0 Transport Bridging & Registry Architecture

- Global Scope Anchor: Explicitly bind the instantiated text generation handler to the global window layer (`window.pluginAi`). This prevents catastrophic transport layer drops during intense Svelte framework reactive hydration phases.
- Declarative Registry: Shift initialization pathways from fragile imperative conditional chains into a unified, flat declarative plugin registry array. This structure guarantees proper tracking when running parallel asset pipelines.
- Lego-Brick Context Scaling: Modularize incoming prompt payloads into distinct semantic layout nodes (system instructions, persona structures, and dynamic keyword lorebooks). This modularity respects token ceiling limits while feeding optimized semantic blocks to the transformer engine.
