---
name: security
description: >-
  Defense-in-depth threat modeling, vulnerability remediation, and CWE-mapped audit
  reporting. Use when threat modeling trust boundaries, sanitizing untrusted inputs,
  preventing XSS/SQLi/traversal, handling secrets, or writing security audit reports.
  Do NOT use for general architectural refactoring (use `refactor`), Supabase RLS
  policies (use `dev-supabase`), or browser sanitization/passkey APIs alone (delegate
  web platform guides to `modern-web-guidance`).
---

# Security Framework (Threat Modeling & Audits)

## 1.0 Core Zero-Trust Laws

- **Zero-Trust Boundaries**: Treat every external user input, AI output stream, URL parameter, and third-party payload as untrusted until validated and sanitized.
- **Defense-in-Depth**: Validate schemas at entry, enforce authorization/domain checks in business logic, and use parameterized queries or strict sanitization at every sink.
- **Secret Quarantine**: Resolve keys and tokens from environment variables at runtime; never hardcode or commit credentials or `.env` values.

## 2.0 5-Stage Security Execution Protocol

1. **Threat Model & Boundary Mapping**: Enumerate entry points, trust boundaries, assets, and threat vectors using [references/threat_modeling.md](./references/threat_modeling.md).
2. **Web Frontend & Client Hardening**: Enforce framework auto-escaping and `DOMPurify.sanitize()` / Web Sanitizer APIs; consult [modern-web-guidance](../../plugins/modern-web-guidance-plugin/skills/modern-web-guidance/SKILL.md) for current CSP, SRI, Passkeys, and Web Sanitizer best practices.
3. **Authentication & Access Control**: Forbid sensitive tokens in `localStorage`/`sessionStorage`; enforce `HttpOnly`/`Secure`/`SameSite` cookies, strict JWT algorithm verification, and CSRF protection.
4. **Persistence & File I/O**: Use parameterized database queries exclusively; normalize paths (`path.basename` / root containment checks) against traversal; validate uploads via magic bytes outside web roots.
5. **Forensic Verification & CWE Audit Report**: Reproduce bugs with a failing Red test, patch minimally, verify Green, and format findings using [references/audit_reports.md](./references/audit_reports.md).

## 3.0 Boundary Do / Don't Matrix

| Category | Always Do | Never Do |
| :--- | :--- | :--- |
| **HTML & DOM** | Use `DOMPurify.sanitize()` or `textContent` | Never pass raw untrusted strings to `innerHTML`, `outerHTML`, or `{@html ...}` |
| **Secrets & Keys** | Load via environment variables with fail-fast guards | Never commit `.env`, API keys, or fallback secrets |
| **Database** | Parameterize queries (`$1`, `?`) with least-privilege roles | Never concatenate user strings into SQL or query clauses |
| **File I/O** | Enforce canonical path containment inside root | Never pass raw user paths directly to `fs` calls |

## 4.0 Reference Library (1-Hop)

- [references/threat_modeling.md](./references/threat_modeling.md) — STRIDE / trust-boundary modeling and attack-surface mapping.
- [references/audit_reports.md](./references/audit_reports.md) — CWE finding structure, audit report template, and pre-commit checklist.
- [modern-web-guidance](../../plugins/modern-web-guidance-plugin/skills/modern-web-guidance/SKILL.md) — Current browser security, CSP, Passkeys, and HTML Sanitizer API guides.
- [refactor](../refactor/SKILL.md) — Ground-up structural refactoring and P4 cleanup when remediating insecure modules.
