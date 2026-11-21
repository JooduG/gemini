# Security Audit Reporting & Verification

Standardized reporting protocol for security audits, remediation tracking, and verification proof.

---

## 1.0 Vulnerability Item Structure

When documenting scanner findings or code audit results, format each item using this template:

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

```markdown
# Security Audit Report

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
[Summary of diffs applied with file links and verification tests]

## 5. Verification Checklist
- [x] Failing reproduction test written before patch (Red)
- [x] Minimal defensive code implemented (Green)
- [x] Zero regressions across existing test suite
- [x] No secrets or credentials in git staged diff
```

---

## 3.0 Comprehensive Audit Scope & Verification Checklist

### 3.1 Review Scope

- **Input & Sink Integrity**:
  - External user, URL, and API inputs validated at system boundaries via explicit schemas.
  - Dynamic HTML rendering sanitized with `DOMPurify` (or the Web Platform Sanitizer API).
- **Authentication, Authorization & Access Control**:
  - Passwords hashed with argon2, scrypt, or bcrypt; session cookies configured with `HttpOnly`, `Secure`, `SameSite`.
  - Authorization and ownership checks enforced server-side on all state-mutating endpoints (preventing IDOR).
- **Data Protection & Persistence**:
  - Zero secrets, tokens, or API keys in source code; loaded strictly from environment variables.
  - Database/IndexedDB queries use parameterized bindings (no string-concatenated queries).
- **Infrastructure & Dependencies**:
  - CSP, HSTS, `X-Frame-Options`, and strict CORS origin allowlists enforced.
  - Dependencies audited with `npm audit` (0 critical / 0 high).

### 3.2 Pre-Commit Checklist

- [ ] **No Secrets**: No keys, tokens, or credentials in staged git diff.
- [ ] **Sanitization Boundary**: Untrusted input sanitized before HTML or query sinks.
- [ ] **Permission Gates**: Mutation operations enforce authority checks.
- [ ] **Storage Safety**: No unencrypted sensitive tokens in `localStorage`.
- [ ] **Dependency Audit**: Zero critical or high unmitigated CVEs.

---

## 4.0 Edge Case Handling

- **Zero Vulnerabilities Found**: Do not omit the report—emit a clean summary confirming which entry points and trust boundaries were inspected.
- **Unfixable / Third-Party Vulnerabilities**: If an upstream dependency has no patch available, document the risk, pin the dependency version, and wrap the call behind a strict input-sanitizing boundary layer.
