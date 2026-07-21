---
name: perchance-plugin-image
description: Technical execution of the Perchance text-to-image-plugin API layer, base64 data URL handling, character prompt mapping, gallery integration & moderation, NSFW verification, reference image guidance, and background removal.
version: 2.1.0
---

# Image Generation Technical Specification & Usage Guide

```pjs
generateImage = {import:text-to-image-plugin}
```

## 1.0 Architectural Laws & Anti-Patterns ("What NOT to Do")

> [!CAUTION]
> **DO NOT VENDOR OR FORK `text-to-image-plugin` SOURCE CODE**: The plugin's client JS is tightly coupled with server-side endpoints on `https://image-generation.perchance.org`. Forking or copying the plugin code directly will cause your generator to break silently whenever server APIs update.

- **Use Official Import**: Always import `{import:text-to-image-plugin}`.
- **Respect Lazy Loading**: Do not override or remove iframe intersection observers. The plugin lazily instantiates generation iframes as they enter the viewport to avoid server rate-limiting and browser freeze.
- **Avoid Synchronous Bulk Generation**: Batching too many concurrent generations triggers user-level server queue delays.

## 2.0 API Invocation & Method Architecture

The generation layer interfaces with native platform image utilities, primarily interacting through `oc.textToImage()` or by importing `{import:text-to-image-plugin}` (`root.generateImage`).

- **Execution Isolation**: Image generation runs inside a secure web worker or sandboxed iframe window to prevent cross-origin memory leaks.
- **Invocation Patterns**: Call with a prompt string, `(promptString, optionsObject)`, a single options object, or a pjs list (`[root.generateImage(promptData)]`).

## 3.0 Options & Advanced Parameters

```pjs
promptData
  prompt = detailed painting of [character] in [place], [season]
  negativePrompt = blur, blurry image
  resolution = 512x768
  width = 400   // display size; height auto-picked from aspect ratio (and vice versa)
  seed = 123    // -1 (default) = random; same seed+prompt ≈ same image
  style = border:4px solid blue;   // CSS on the output
```

### Parameter Reference

- `resolution`: Rigid multi-aspect scaling limits: `512x512`, `512x768`, `768x512`, `768x768`. (`size = 400` works for square images).
- `negativePrompt`: Visual elements to suppress (e.g. `blur`, or `NSFW, nudity` to mitigate accidental NSFW).
- `guidanceScale` (CFG): Prompt adherence vs realism; default 7, range 1–30.
- `removeBackground`: `true` enables client-side AI background segmentation (`briaai/RMBG-1.4`), returning a transparent PNG canvas/dataURL.
- `referenceImage`: Image-to-image guidance payload:

  ```js
  referenceImage: {
    url: "https://user-uploads.perchance.org/file/..."; // HTTPS URL, Blob, or Data URL
    blur: 0.3; // float from 0 to 1 (0 = strict structure, 1 = maximum blur/creative freedom)
  }
  ```

- `saveTitle` / `saveDescription`: Metadata used when saving images to the public gallery.
- `hideGalleryButtons`: `true` suppresses save-to-gallery / open-gallery hover controls.
- Inline syntax: Parameters can be embedded at the end of prompt strings: `a cat (resolution:::512x768) (seed:::123)`.
- `[lastTextToImagePrompt]` / `[promptData.lastUsedPrompt]`: Variables holding the most recently evaluated prompt.

## 4.0 Result Object & Return Payloads

### Programmatic JS Usage

```js
let result = await root.generateImage({ prompt: "a cute mouse" });
imageEl.src = result.dataUrl; // String-like object; imageEl.src = result also works
document.body.append(result.canvas);
console.log(result.inputs.prompt, result.inputs.seed);
```

- **Base64 Data Streams**: Resolving `oc.textToImage()` or `root.generateImage()` yields a result object containing an explicit base64 `.dataUrl` string (`data:image/jpeg;base64,...`).
- **Un-awaited Streaming Iframe**: Assigned directly to HTML (`outputCtn.innerHTML = root.generateImage("...")`), the promise stringifies into a live generation tile `<iframe>`. Once finished, the iframe element receives `.textToImagePluginOutput` (`.canvas`, `.dataUrl`, `.inputs.*`).
- **Reloading**: A prompt list with `id = myImg` can be programmatically reloaded via `<button onclick="myImg.reload()">Try Again</button>`.

## 5.0 Global Character Properties & Context Modifiers

The platform context engine natively exposes and tracks specific properties on the `oc.character` object:

- `oc.character.imagePromptPrefix`: Programmatic text string prepended to every graphic asset request for the character.
- `oc.character.imagePromptSuffix`: String appended to the tail end of the prompt payload to enforce foundational style sheets.
- `oc.character.imagePromptTriggers`: Newline-delimited trait array used by custom script hooks to swap shorthand tags for expanded visual token matrices.

## 6.0 Gallery Integration & Moderation

Embed the public per-generator gallery by passing `gallery = true`:

```pjs
galleryOptions
  gallery = true
  sort = top // 'top', 'recent', or 'trending'
  contentFilter = g // 'g' or 'pg13' for looser moderation
  timeRange = 1-week // 1-day, 3-day, 1-week, 1-month, 1-year, all-time
  hideIfScoreIsBelow = -2
  adaptiveHeight = true // expands container height to fit all images
  style = ... // optional CSS styling
  defaultGalleryNames = characters,memes,chat // default clickable gallery category names
  customButton
    emoji = ⭐
    onClick(data) =>
      console.log(data);
```

### Gallery Moderation & Admin Rules

```pjs
galleryOptions
  gallery = true
  bannedUsers
    263efb15c47c2d2f398e91bf...
  bannedPromptPhrases
    pg13:blood            // ban strictly in pg13 mode
    /twin.?towers?/       // regex pattern support
    pg13:/\b(gore|blood)\b/i
  bannedNegativePromptPhrases
    pg13:wearing clothes
```

_Admin Mode_: Type `"admin"` into gallery settings to outline banned-phrase images in red and inspect creator user IDs on double-click.

## 7.0 Hosted Image NSFW Verification (`imageTags` API)

Verify hosted image safety (`aigc.uploads.dev`) prior to public display:

```js
let info = await fetch(
  `https://image-generation.perchance.org/api/imageTags?url=${encodeURIComponent(url)}`,
).then((r) => r.json());
if (info.tags && info.tags.includes("nsfw")) {
  // apply blur or warning overlay
}
```

## 8.0 Operational Gotchas & Best Practices

- **Latency**: Generation takes several seconds to tens of seconds. Always display loading indicators or inline SVG placeholders.
- **Ad Banner**: Importing this plugin appends an ad block for non-logged-in users.
- **Concurrency Queuing**: Requests per user are rate-limited; multiple simultaneous image calls queue automatically.
- **Prompt Sensitivity & NSFW Control**: Prompt choice heavily affects image quality. Use descriptive style tokens ("oil painting, octane render, trending on artstation, masterpiece"). Include `negativePrompt = blur, NSFW, nudity` and `fully clothed` in prompts to prevent unintended adult content.

## 9.0 Explicit Trigger Matrix & Progressive Protocol

### Positive Triggers

- Orchestrating `oc.textToImage` asynchronous promises or parsing inline syntax parameter vectors.
- Accessing or programmatically updating character property tags (`imagePromptPrefix`, `imagePromptSuffix`).
- Engineering state routines that classify message data to append context-aware visual overlays or facial expression assets.
- Synchronizing generated base64 strings with localized asset array states or state engines.

### Technical Implementation Steps

1. **Assembly**: Collect raw visual token text and technical values (`prompt`, `negativePrompt`, `resolution`, `seed`) into an execution payload object.
2. **Configuration**: Map systemic variables into the prefix or suffix fields of the active context handler to preserve visual consistency across generation loops.
3. **Execution**: Invoke the asynchronous engine utility to send the prompt payload to the platform generation host.
4. **Capture**: Extract the base64 encoded `dataUrl` string hash directly from the resolved response payload.
5. **Persistence**: Route the base64 data string into tracking registry blocks to protect layout state against lifecycle drops.
