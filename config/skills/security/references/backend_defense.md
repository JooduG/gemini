# Backend Defense, Persistence & API Hardening

<!--
=============================================================================================
  FILE: C:/Users/johng/.gemini/config/skills/security/references/backend_defense.md
  PURPOSE: Authoritative guidelines for authentication, JWT hardening, CSRF defense,
           SQL injection prevention, secure file handling, and database least-privilege.
  PARENT SKILL: config/skills/security/SKILL.md
=============================================================================================
-->

This guide establishes the mandatory backend engineering standards for data validation, authentication lifecycles, and database boundary hardening.

---

## 1.0 Authentication & Session Lifecycle

### 1.1 Cookie Hardening

When setting session or authentication cookies:

- Prefix cookie names with `__Host-` (or `__Secure-` if domain scoping is unavoidable).
- Enforce the essential flags: `HttpOnly`, `Secure`, `SameSite=Lax` (or `SameSite=Strict`).
- Do not set the `Domain` attribute by default (restricts cookie strictly to the origin host).

### 1.2 JWT (JSON Web Token) Security

- **Reject `none` algorithm**: Always reject unencrypted or unsigned tokens.
- **Hardcode verification algorithm**: Explicitly specify `algorithms: ['HS256']` or `['RS256']` on verification calls; never infer algorithm from the untrusted token header.
- **Enforce Expiration**: Always include and validate the `exp` and `nbf` claims.
- **Symmetric Key Entropy**: Secrets for symmetric HMAC algorithms must be cryptographically generated (minimum 256 bits of entropy).

### 1.3 CSRF (Cross-Site Request Forgery) Defense

- For cookie-based authentication, all state-changing endpoints (`POST`, `PUT`, `PATCH`, `DELETE`) MUST validate a CSRF token.
- Implement Synchronizer Token or Double-Submit Cookie patterns.
- Never rely exclusively on `SameSite` cookies for state-changing operations.
- **FORBIDDEN**: Never disable framework CSRF guards (e.g. `@csrf_exempt`).

---

## 2.0 Secret Management & Zero Hardcoding

- **STRICTLY FORBIDDEN**: Never commit API keys, passwords, database credentials, or JWT secrets in source files or git history.
- **Multi-Tiered Resolution Pattern**:

  ```javascript
  import crypto from 'node:crypto';

  function resolve_session_secret() {
    if (process.env.SESSION_SECRET) {
      return process.env.SESSION_SECRET;
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: SESSION_SECRET must be configured in production environment.');
    }
    console.warn('WARNING: Using ephemeral instance-isolated secret for local development.');
    return crypto.randomBytes(32).toString('hex');
  }
  ```

- Never accept fallback literal strings (e.g. `process.env.SECRET || 'default-secret'`) in production code.

---

## 3.0 Database Security & Injection Prevention

### 3.1 Parameterized Queries

- **FORBIDDEN**: Never concatenate or interpolate strings into SQL/NoSQL queries.
- **MANDATORY**: Use parameterized queries, prepared statements, or ORMs:

  ```javascript
  // VULNERABLE:
  await db.query(`SELECT * FROM accounts WHERE id = ${user_id}`);

  // SECURE (Parameterized):
  await db.query('SELECT * FROM accounts WHERE id = $1', [user_id]);

  // SECURE (ORM):
  await prisma.account.findUnique({ where: { id: user_id } });
  ```

### 3.2 Database Least Privilege

- Restrict database permissions to only what is required (e.g., reporting workers should only have `SELECT` grants, not `DELETE` or `DROP`).
- Disable administrative stored procedures (e.g. `xp_cmdshell`).
- For test environments, database servers MUST listen on `127.0.0.1` / `localhost`, never `0.0.0.0`.

---

## 4.0 Secure File Handling & Upload Pipelines

When accepting file uploads or reading file system paths:

### 4.1 Path Traversal Prevention

- User-supplied filenames must NEVER be passed directly to file system sinks (`fs.readFile`, `fs.writeFile`, `path.join`).
- Always sanitize with `path.basename()` and enforce an allow-list of safe characters:

  ```javascript
  import path from 'node:path';

  const safe_filename = path.basename(user_supplied_filename).replace(/[^a-zA-Z0-9._-]/g, '');
  const destination_path = path.resolve(STORAGE_DIR, safe_filename);

  if (!destination_path.startsWith(STORAGE_DIR)) {
    throw new Error('Access denied: Path traversal attempt detected.');
  }
  ```

### 4.2 File Upload Validation

- **Content Inspection**: Inspect magic bytes headers (e.g. via `file-type`) to verify that the file content matches its extension. Never trust `Content-Type` headers or file extensions alone.
- **Unique Name Generation**: Rename uploaded files to random UUIDs on disk (e.g. `${crypto.randomUUID()}.png`) and store the original name in database metadata.
- **Storage Location**: Store uploaded files outside the public web server root and serve them through an authenticated handler with `Content-Disposition: attachment; filename="..."` and `X-Content-Type-Options: nosniff`.
- **Payload Limits**: Impose strict size limits (e.g. 5MB–10MB) before processing input streams.

---

<!--
=============================================================================================
  CHANGELOG
=============================================================================================
  - 2026-09-04: Created backend_defense.md reference guide integrating Google SecureCoder
    backend generation, database access, and file upload rules into config/skills/security.
=============================================================================================
-->
