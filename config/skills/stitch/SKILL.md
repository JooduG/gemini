---
name: stitch
description: Interface with the Google Stitch UI/UX design and screen generation platform. Use when creating design projects, generating screens from text/image prompts, listing or modifying UI screens, applying design systems, or enhancing design prompts via StitchMCP.
---

<!--
=============================================================================================
  FILE: C:/Users/johng/.gemini/config/skills/stitch/SKILL.md
  PURPOSE: Sovereign technical skill and operation manual for Google Stitch MCP integration.
  DEPENDENCIES: StitchMCP (lazy MCP tools via call_mcp_tool), Google Stitch API.
  CHANGELOG: See footer block.
=============================================================================================
-->

# 🎨 Stitch UI/UX Design & Generation Protocol

> **Persona: Sovereign Design Architect**  
> *"I orchestrate visual interfaces and rapid design iteration through deterministic prompt mechanics and the Google Stitch MCP layer."*

---

## 1.0 System Architecture & Tool Integration

Stitch is integrated as a lazy MCP server (`StitchMCP`) registered in `config/mcp_config.json`. All tool invocations use the `call_mcp_tool` interface with `ServerName: "StitchMCP"`.

### Core Tool Registry

| MCP Tool Name | Primary Purpose | Key Parameters |
| :--- | :--- | :--- |
| `list_projects` | List all existing user projects | - |
| `get_project` | Inspect project details and design systems | `projectId` |
| `create_project` | Scaffold a new Stitch project container | `title` |
| `generate_screen_from_text` | Generate a new UI screen from prompt | `projectId`, `prompt`, `deviceType`, `modelId`, `designSystem` |
| `list_screens` | Retrieve screen catalog for a project | `projectId` |
| `get_screen` | Download screen HTML / design asset metadata | `screenId`, `projectId` |
| `edit_screens` | Iteratively edit existing screens | `projectId`, `screenIds`, `prompt` |
| `generate_variants` | Produce aesthetic variations of a screen | `projectId`, `screenId`, `prompt` |
| `create_design_system` | Establish project-wide color & font rules | `projectId`, `name`, `colors`, `typography` |
| `upload_design_md` | Import a design system directly from markdown | `projectId`, `designMdContent` |
| `apply_design_system` | Enforce design tokens on existing screens | `projectId`, `designSystemId`, `screenIds` |

---

## 2.0 Operational Directives

### 2.1 Intent Classification

Analyze the user's intent to route into the appropriate execution mode:

1. **Design Generation (`generate_screen_from_text`)**:
   - Model selection: Default to `GEMINI_3_1_PRO` (or `GEMINI_3_FLASH` for ultra-fast drafts). Do not use deprecated `GEMINI_3_PRO`.
   - Device Types: `DESKTOP`, `MOBILE`, `TABLET`, or `AGNOSTIC`.
   - If generating for an existing project, check `get_project` first to inherit its active `designSystem`.

2. **Prompt Enhancement (The Enhancer)**:
   - When the user asks to "enhance", "refine", or "improve" a UI prompt, apply the **Stitch Effective Prompting Template** below before calling the tool.

3. **Asset Inspection & Code Extraction**:
   - Stitch screens output HTML configured with modern Tailwind CSS via CDN.
   - When extracting code for implementation in Svelte or web apps, translate Tailwind tokens cleanly into the target project's design system.

---

## 3.0 Stitch Effective Prompting Template

When enhancing prompts for screen generation, structure the output using these distinct dimensional layers:

```markdown
### 1. Viewport & Archetype
- Device: [Desktop 1440px | Mobile 390px]
- Layout Archetype: [Dashboard / Hero Landing / Modal Drawer / Form Wizard]

### 2. Information Hierarchy & Content
- Primary Focus: [Main CTA, key metrics, canvas]
- Supporting Sections: [Secondary navigation, data table, user avatar, filters]
- Micro-copy: [Specific, realistic button labels and headline text, NO lorem ipsum]

### 3. Visual & Aesthetic Tokens
- Color Palette: [Dark slate, electric cobalt accents, subtle borders #2D3748]
- Elevation & Depth: [Subtle card shadows, glassmorphic backdrop-blur, clean dividers]
- Typography: [Clean grotesque sans-serif, bold tabular numerals]

### 4. Interactive State & Kinetic Cues
- Default state with visible hover hints and active badges
```

---

## 4.0 Error Handling & Polling Rules

- **Generation Timeout**: `generate_screen_from_text` can take 30–90 seconds. If a connection timeout occurs, do NOT immediately retry the generation. Instead, query `list_screens` or `get_screen` after a brief interval to check if the backend generation completed.
- **Component Suggestions**: If `output_components` in the response suggests specific next steps (e.g. variants, follow-up screens), present those clearly to the user.

---

<!--
=============================================================================================
  CHANGELOG
=============================================================================================
  - 2026-09-04: Migrated from legacy antigravity-cli/plugins/Stitch to global config/skills/stitch.
    Upgraded documentation with active StitchMCP tool schema (Gemini 3.1 Pro, design system support).
=============================================================================================
-->
