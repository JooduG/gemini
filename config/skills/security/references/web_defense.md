# Web Frontend Defense & Client Hardening

<!--
=============================================================================================
  FILE: C:/Users/johng/.gemini/config/skills/security/references/web_defense.md
  PURPOSE: Authoritative guidelines for XSS prevention, DOM manipulation, storage security,
           Content Security Policy (CSP), Subresource Integrity (SRI), and client hardening.
  PARENT SKILL: config/skills/security/SKILL.md
=============================================================================================
-->

This guide establishes the mandatory frontend engineering standards to prevent Cross-Site Scripting (XSS), token theft, and DOM tampering.

---

## 1.0 XSS Prevention & DOM Manipulation

### 1.1 Svelte & Framework Auto-Escaping

- Modern frameworks escape dynamic expressions in templates by default. Always rely on native escaping:

  ```svelte
  <!-- SECURE: Automatically escaped -->
  <p>{user_narrative}</p>

  <!-- SECURE: Explicit attribute quotation prevents attribute breakout -->
  <div class="{theme_name}"></div>
  ```

- **Dangerous Constructs (`{@html ...}`)**:
  - Only permit `{@html ...}` for internally verified, rich narrative markup.
  - **MANDATORY**: Any string passed to `{@html ...}` MUST pass through `DOMPurify.sanitize()` first.

### 1.2 Vanilla JavaScript DOM Rules

When operating without a framework or modifying the DOM directly:

- **FORBIDDEN**: Never use `innerHTML`, `outerHTML`, or `document.write`.
- **MANDATORY**: Use safe text setters or DOM node factories:

  ```javascript
  // VULNERABLE:
  element.innerHTML = '<span>' + user_input + '</span>';

  // SECURE:
  const span = document.createElement('span');
  span.textContent = user_input;
  element.appendChild(span);

  // SECURE (Clearing children):
  element.replaceChildren(); // instead of element.innerHTML = ''
  ```

- **Static SVG & Complex Strings**: Use `DOMParser` rather than `innerHTML` assignments:

  ```javascript
  const document_parser = new DOMParser();
  const parsed_svg = document_parser.parseFromString(svg_content, 'image/svg+xml');
  element.appendChild(parsed_svg.documentElement);
  ```

---

## 2.0 Client Storage & Session Tokens

### 2.1 The LocalStorage Prohibition

- **STRICTLY FORBIDDEN**: Never store sensitive session IDs, JWTs, or auth bearer tokens in `localStorage` or `sessionStorage`. Any script injected via XSS can immediately steal `localStorage` contents.
- **MANDATORY**: Rely on `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict`) cookies set directly by the server. These cookies cannot be read via JavaScript `document.cookie`.

### 2.2 Client-Side Session Cleanup

- On logout or session termination:
  - Clear all reactive in-memory state (stores, runes, entity maps).
  - Explicitly perform a full page reload (`window.location.href = '/login'`) to flush cached memory and DOM artifacts.

---

## 3.0 Configuration, Headers & Browser Sandboxing

### 3.1 Content Security Policy (CSP)

Configure strict headers to prevent malicious external script execution:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-xyz123'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';
```

- Forbid `unsafe-inline` or `unsafe-eval` unless strictly bounded.

### 3.2 Anti-Clickjacking & Framing

Protect against UI redressing attacks:

```http
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none';
```

*(If framing is required for specific iframe integrations, restrict strictly to the allowed domain e.g. `frame-ancestors https://trusted-partner.com`)*.

### 3.3 Subresource Integrity (SRI)

- When loading external CDN assets (fonts, icons, polyfills):
  - Always include the cryptographic SRI hash (`integrity="sha384-..." crossorigin="anonymous"`).
  - Pin exact patch versions rather than `@latest` URLs.

---

## 4.0 Data Hygiene, Logging & UI Masking

### 4.1 PII Masking

- Never render raw sensitive identifiers (account numbers, credit cards, emails, SSNs) directly in UI labels.
- Apply deterministic masking functions:

  ```javascript
  function mask_account(account_number) {
    return `***-***-${account_number.slice(-4)}`;
  }
  ```

### 4.2 Logging Discipline

- **FORBIDDEN**: Never pass user objects, auth tokens, or error payloads containing request bodies to `console.log()` or `console.warn()`.
- Use structured, low-cardinality log messages with identifiers only:

  ```javascript
  // SECURE:
  logger.info({ entity_id: entity.id }, 'Entity loaded successfully');
  ```

---

<!--
=============================================================================================
  CHANGELOG
=============================================================================================
  - 2026-09-04: Created web_defense.md reference guide integrating Google SecureCoder
    frontend generation and XSS prevention rules into config/skills/security.
=============================================================================================
-->
