---
name: html
description: Authoritative style rules and best practices for HTML development.
---

# Google HTML Style Guide Summary

This document summarizes key rules and best practices from the Google HTML Style Guide.

> [!IMPORTANT]
> When operating within this repository, local project rules supersede the generic guidelines in this document. In the event of a conflict, the authoritive [rules/](../../../../rules/) are absolute, like in these cases (but not limited to):
>
> 1. **Lexical & Workflow**: Naming conventions and process logic defined in [05-intelligence.md](../../../../../.agents/rules/05-intelligence.md) take precedence. (e.g., Use `snake_case` for variables and `kebab-case` for files regardless of generic language standards).
> 2. **Aesthetics & UI**: Design tokens and visual laws defined in [04-aesthetics.md](../../../../../.agents/rules/04-aesthetics.md) take precedence. Never use raw CSS values (`px`, `#`, `rem`) when tokens are available.
> 3. **Framework Logic**: If this project uses **Svelte**, all UI and state logic must adhere to [03-infrastructure.md](../../../../../.agents/rules/03-infrastructure.md).
> 4. **General Precedence**: Any and all information found in [rules/](../../../../rules/) is master above the information found in this file.

## 1. General Rules

- **Protocol:** Use HTTPS for all embedded resources.
- **Indentation:** Indent by 2 spaces. Do not use tabs.
- **Capitalization:** Use only lowercase for all code (element names, attributes, selectors, properties).
- **Trailing Whitespace:** Remove all trailing whitespace.
- **Encoding:** Use UTF-8 (without a BOM). Specify `<meta charset="utf-8">` in HTML.

## 2. HTML Style Rules

- **Document Type:** Use `<!doctype html>`.
- **HTML Validity:** Use valid HTML.
- **Semantics:** Use HTML elements according to their intended purpose (e.g., use `<p>` for paragraphs, not for spacing).
- **Multimedia Fallback:** Provide `alt` text for images and transcripts/captions for audio/video.
- **Separation of Concerns:** Strictly separate structure (HTML), presentation (CSS), and behavior (JavaScript). Link to CSS and JS from external files.
- **`type` Attributes:** Omit `type` attributes for stylesheets (`<link>`) and scripts (`<script>`).

## 3. HTML Formatting Rules

- **General:** Use a new line for every block, list, or table element, and indent its children.
- **Quotation Marks:** Use double quotation marks (`""`) for attribute values.

**BE CONSISTENT.** When editing code, match the existing style.

_Source: [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)_
