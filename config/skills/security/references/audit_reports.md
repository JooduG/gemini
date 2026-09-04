# Security Audit Reporting & Verification

<!--
=============================================================================================
  FILE: C:/Users/johng/.gemini/config/skills/security/references/audit_reports.md
  PURPOSE: Standardized templates and procedures for security findings, remediation logs,
           and walkthrough artifacts.
  PARENT SKILL: config/skills/security/SKILL.md
=============================================================================================
-->

This guide establishes the reporting protocol for security audits, remediation tracking, and verification proof.

---

## 1.0 Vulnerability Item Structure

When documenting scanner findings or code audit results, format each item using this structured template:

```text
### [SEVERITY] [Vulnerability Class]

- **Location**: `path/to/file.js:L42-L48`
- **CWE**: CWE-79 (Cross-Site Scripting) / CWE-89 (SQL Injection) / CWE-22 (Path Traversal)
- **Description**: Concise summary of what was found and how untrusted data reaches the sink.
- **Remediation**: Summary of the code change applied or required.
- **Proof / Test**: Test file and line verifying the patch.
```

---

## 2.0 Security Audit Report Template

When performing a comprehensive security gate or generating an audit artifact:

```markdown
# 🛡️ Sovereign Security Audit Report

## 1. Executive Summary
- **Target Repository/Component**: [Name]
- **Audit Timestamp**: [YYYY-MM-DD HH:MM]
- **Overall Status**: [PASS / REMEDIATED / ACTION REQUIRED]
- **Total Findings Audited**: [N] (Critical: [N], High: [N], Medium: [N], Low: [N])

## 2. Threat Model & Boundaries
- **Entry Points Evaluated**: [HTTP / Local Persistence / Iframe / CLI]
- **Trust Boundaries Inspected**: [Client-Server / User-Admin / Third-Party]

## 3. Findings Matrix

| ID | Severity | Vulnerability Class | File / Location | Disposition |
| :--- | :--- | :--- | :--- | :--- |
| SEC-01 | CRITICAL | Stored XSS | `src/ui/EntityView.svelte:14` | True Positive (Remediated) |
| SEC-02 | HIGH | Missing CSRF | `src/routes/api/transfer/+server.js` | True Positive (Remediated) |
| SEC-03 | MEDIUM | Hardcoded Fallback | `src/config/auth.js:22` | False Positive (Test Mock) |

## 4. Remediation Walkthrough
[Detailed summary of diffs applied with file links and verification tests]

## 5. Verification Checklist
- [x] Failing reproduction test written before patch (Red)
- [x] Minimal defensive code implemented (Green)
- [x] Zero regressions across existing test suite
- [x] No secrets or credentials in git staged diff
```

---

## 3.0 Comprehensive Audit Scope & Verification Checklist

When conducting a dedicated security review or pre-release verification, inspect the codebase across these critical vectors:

### 3.1 Review Scope

- **Input & Narrative Integrity**:
  - All external user and API input validated at system boundaries via typed schemas (e.g., Zod).
  - Every dynamic HTML render (`{@html ...}`) sanitized using `DOMPurify`.
  - Props and arguments guarded with strict types.
- **Authentication, Authorization & Access Control**:
  - Passwords hashed using industry standards (argon2, scrypt, bcrypt).
  - Sessions configured with secure cookie attributes (`httpOnly`, `secure`, `sameSite`).
  - Access control and simulation permissions checked on all protected endpoints and state-mutating actions (preventing IDOR).
  - Rate limiting applied to sensitive endpoints.
- **Data Protection & Persistence**:
  - Zero secrets, tokens, or API keys in source code; all loaded from environment variables.
  - Queries to local stores (Dexie.js) use parameterized keys (no string-concatenated indexes).
  - PII and persona metadata excluded from telemetry, logs, and safely purged upon session resets.
- **Infrastructure & Dependencies**:
  - Security headers enforced (CSP, HSTS, X-Frame-Options).
  - Strict origin validation on CORS.
  - Dependencies audited with `npm audit` (0 critical / 0 high).

### 3.2 Pre-Commit Warden Checklist

- [ ] **No Secrets**: No keys, tokens, or credentials in git staged diff.
- [ ] **Sanitization Boundary**: Untrusted input sanitized before presentation sink.
- [ ] **Permission Gates**: Mutation operations check active entity authority.
- [ ] **Storage Safety**: No reliance on unencrypted, sensitive keys in `localStorage`.
- [ ] **npm audit**: Zero critical or high vulnerabilities.

---

## 4.0 Edge Case Handling

- **Zero Vulnerabilities Found**: If a security scan or audit detects no issues, do not omit the report. Generate a clean audit summary confirming that all entry points and trust boundaries were evaluated and verified compliant with Rule 06.
- **Unfixable / Third-Party Vulnerabilities**: If a vulnerability exists in an upstream dependency and no patch is available, document the risk, pin the dependency version, and implement a defensive input-sanitizing boundary layer upstream of the library call.

---

<!--
=============================================================================================
  CHANGELOG
=============================================================================================
  - 2026-09-04: Created audit_reports.md reference guide integrating Google SecureCoder
    reporting and verification protocols into config/skills/security.
=============================================================================================
-->
