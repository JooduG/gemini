---
name: stitch
description: >-
  Interface with the Google Stitch UI/UX design and screen generation platform via
  StitchMCP. Use when creating Stitch projects, generating screens from text/image
  prompts, listing/editing UI screens, or managing Stitch design systems. Do NOT use
  for implementing local Svelte/Tailwind code directly (use `svelte` or `tailwind`) or
  rendering inline chat widgets (use built-in `generative_ui`).
---

# Stitch UI/UX Design & Generation Protocol

Stitch connects via the lazy MCP server `StitchMCP` (`call_mcp_tool` with `ServerName: "StitchMCP"`). Consult the native `StitchMCP` tool schemas for full parameter signatures.

## 1.0 Operational Modes

1. **Design Generation (`generate_screen_from_text`)**:
   - Use `GEMINI_3_1_PRO` (or `GEMINI_3_FLASH` for quick drafts); never use deprecated `GEMINI_3_PRO`.
   - Choose `deviceType`: `DESKTOP`, `MOBILE`, `TABLET`, or `AGNOSTIC`.
   - Call `get_project` first when generating inside an existing project so its active `designSystem` is inherited.
2. **Prompt Enhancement**: Structure refined prompts using the 4-layer template below before invoking generation.
3. **Code Extraction**: Stitch outputs HTML with Tailwind CSS. When porting into a project, map tokens cleanly to the target design system instead of pasting raw CDN markup.

## 2.0 Stitch Prompting Template

```markdown
### 1. Viewport & Archetype
- Device: [Desktop 1440px | Mobile 390px]
- Layout Archetype: [Dashboard / Hero Landing / Modal Drawer / Form Wizard]

### 2. Information Hierarchy & Content
- Primary Focus: [Main CTA, key metrics, canvas]
- Supporting Sections: [Secondary navigation, data table, user avatar, filters]
- Micro-copy: [Specific, realistic button labels and headline text, NO lorem ipsum]

### 3. Visual & Aesthetic Tokens
- Color Palette: [Surfaces, primary accent, hairline borders]
- Elevation & Depth: [Subtle card shadows, backdrop blur, clean dividers]
- Typography: [Clean sans-serif, tabular numerals]

### 4. Interactive State & Kinetic Cues
- Default state with visible hover hints and active badges
```

## 3.0 Timeout & Polling Rules

- **Long Generation Latency (30–90s)**: If `generate_screen_from_text` times out, **do NOT immediately call `generate_screen_from_text` again** (spawns duplicate jobs). Poll `list_screens` or `get_screen` after a short interval to check completion.
- **Follow-Up Suggestions**: Surface any `output_components` hints returned by Stitch to the user.
