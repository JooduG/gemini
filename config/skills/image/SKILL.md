---
name: perchance-plugin-image
description: Technical execution of the Perchance text-to-image-plugin API layer, base64 data URL handling, character prompt mapping, and memory-isolated asset registration.
version: 2.0.0
---

# Image Generation Technical Specification

## 1.0 API Invocation & Method Architecture

The generation layer utilizes the native platform image utilities, primarily interacting with the system through the core `oc.textToImage()` asynchronous method or via importing the legacy global plugin reference wrapper `{import:text-to-image-plugin}`.

- Execution Isolation: Image generation calls run inside a secure web worker or sandboxed iframe execution window. The framework intercepts calls to prevent cross-origin memory leaks.
- Parameter Configurations: Execution payloads pass through specialized initialization arrays handling key evaluation objects: `prompt`, `negativePrompt`, `resolution`, `guidanceScale` (CFG), and `seed`.

## 2.0 Return Payloads & Data URLs

- Data Format: Resolving a valid `oc.textToImage` execution loop yields a structured result object containing an explicit `.dataUrl` string hash.
- Base64 Structuring: The engine outputs media raw-encoded as an inline base64 data stream string pattern matching: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...`
- DOM Integration: The base64 output string is treated as a fully qualified source path directly by the browser layout engine. It is assigned straight to standard `src` element tags without requiring secondary filesystem compilation or server-side resource hosting.

## 3.0 Global Character Properties & Context Modifiers

The platform context engine natively exposes and tracks a specific set of properties on the `oc.character` object to dynamically intercept and mutate outgoing image generation strings before they hit the inference queue:

- `oc.character.imagePromptPrefix`: A global programmatic text string prepended directly to the front of every graphic asset request generated during interactions with the character instance.
- `oc.character.imagePromptSuffix`: An explicit string layout appended to the tail end of the prompt payload to enforce foundational style sheets or universal asset modifiers.
- `oc.character.imagePromptTriggers`: A newline-delimited trait array used by custom script hooks to swap out shorthand tags for expanded visual token matrices during processing cycles.

## 4.0 Inline Command Parsing & Shorthand Syntax

When triggering generations via chat UI components, automated systems, or macro shortcut buttons, parameters can be passed natively within the text stream using the triple-colon namespace formatting syntax.

- Inline Array Layout: `YOUR_VISUAL_DESCRIPTION (resolution:::512x768) (seed:::12345) (negativePrompt:::low quality, blur)`
- Attribute Extraction: Custom regex parsers monitor the text stream for parenthetical parameters, separating the target visual tokens from the raw technical settings prior to generating the execution call.
- Resolution Constraints: Core generation resolutions are bound to rigid multi-aspect scaling limits: `512x512`, `512x768`, `768x512`, and `768x768`.

## 5.0 Explicit Trigger Matrix

### Positive Triggers

- Orchestrating `oc.textToImage` asynchronous promises or parsing inline syntax parameter vectors.
- Accessing or programmatically updating character property tags (`imagePromptPrefix`, `imagePromptSuffix`).
- Engineering state routines that classify message data to append context-aware visual overlays or facial expression assets.
- Synchronizing generated base64 strings with localized asset array states or state engines.

### Core Exclusions

- Designing structural user interface components, configuring CSS layout properties, or engineering baseline state runes that do not directly feed image processing parameters.

## 6.0 Progressive Technical Protocol

1. Parameters: Assemble the raw visual token text alongside targeted runtime values into an execution object.
2. Configuration: Map systemic variables directly into the prefix or suffix fields of the active context handler to preserve layout uniformity across generation loops.
3. Generation: Execute the asynchronous engine utility to transmit the prompt payload array straight to the platform asset host.
4. Capture: Extract the base64 encoded dataUrl directly from the successfully resolved response payload.
5. Persistence: Route the base64 data string immediately into tracking registry blocks to protect the layout against context lifecycle drops.
