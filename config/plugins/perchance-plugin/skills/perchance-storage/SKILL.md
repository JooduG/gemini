---
name: perchance-storage
description: Authoritative technical specification for Perchance Storage mechanisms, covering programmatic CDN file hosting (upload-plugin), stable editable text URLs (uploadPlugin.editable), temporary high-limit uploads, and persistent client-side IndexedDB key-value storage (kv-plugin).
---

# Perchance Storage — Operating Manual

Perchance provides two complementary persistence paradigms:

1. **`upload-plugin`**: Programmatic file uploads to Perchance CDN hosts (`user.uploads.dev`), public editable files with stable URLs, and temporary high-allowance scratch storage.
2. **`kv-plugin`**: Client-side IndexedDB storage (hundreds of megabytes) with support for structured objects, arrays, and atomic `update` transactions.

---

## 1.0 Empirical Pitfalls & Scar Tissue

| Trigger                       | Wrong Behavior                                                           | Correct Behavior                                                                                                                                   |
| :---------------------------- | :----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lost `editKey`**            | Creating an editable file without persisting the generated `editKey`.    | `editKey` is returned **only once** on creation. Save it to `localStorage` or server state immediately; lost keys make files unmodifiable forever. |
| **Editable Write Flood**      | Updating the same editable file multiple times per second.               | Writes to an editable name are throttled to **1 commit per 10 seconds**. Coalesce updates or debounce saves; intermediate calls supersede cleanly. |
| **Anonymous Quota Limit**     | Uploading large temporary build assets without `expires`.                | Add `{ expires: Date.now() + 86400000 }` (≤24h) to boost maximum file size and daily quota by **400x** (~10GB allowance).                          |
| **KV Read-Modify-Write Race** | Running `await kv.get()` then `await kv.set()` for counters or balances. | Use `await root.kv.folder.update(key, v => v + 1)`. Runs inside a single IndexedDB transaction to prevent data loss.                               |

---

## 2.0 `upload-plugin` (CDN Hosting & Editable Files)

```pjs
// main.pjs
uploadPlugin = {import:upload-plugin}
```

### 2.1 Basic CDN Uploads

Uploads text or a `Blob` directly to Perchance storage without requiring an API key:

```javascript
let { url, size, error, deletionUrl } = await root.uploadPlugin(stringOrBlob);
if (error) {
  // "over_daily_allowance" | "file_too_big" | "invalid_filetype"
  console.error("Upload failed:", error);
} else {
  console.log("Permanent URL:", url); // e.g. https://user.uploads.dev/file/...
}
```

### 2.2 Editable Text Files (Stable URLs)

Editable files maintain a fixed, predictable public URL while allowing their contents to be overwritten:

```javascript
const name = "game-save-4mtq8jpn2v6xkycqzr5lhw"; // 1-200 chars: a-z, 0-9, -

// 1. Initial Creation (returns editKey)
const created = await root.uploadPlugin.editable.set(
  name,
  JSON.stringify(gameData),
);
if (created.editKey) {
  localStorage.setItem("myEditKey", created.editKey);
}

// 2. Subsequent Updates
const editKey = localStorage.getItem("myEditKey");
const updated = await root.uploadPlugin.editable.set(
  name,
  JSON.stringify(nextData),
  { editKey },
);

// 3. Public Read (fetchable from any generator)
const text = await root.uploadPlugin.editable.get(name);
// Raw URL: https://editable.uploads.dev/file/<generatorName>/<name>?v=1
```

### 2.3 Temporary Uploads (400x Quota Boost)

If a file is only needed temporarily (audio render, diagnostic dump, intermediate replay):

```javascript
// Expiration epoch timestamp: <= 24 hours boosts quota by 400x
let { url } = await root.uploadPlugin(largeData, {
  expires: Date.now() + 1000 * 60 * 60 * 24,
});
```

---

## 3.0 `kv-plugin` (Client-Side IndexedDB Storage)

```pjs
// main.pjs
kv = {import:kv-plugin}
```

Provides structured-cloneable, device-local persistence surviving reloads (hundreds of MBs):

```javascript
// Basic CRUD
await root.kv.players.set("hero", {
  name: "Aria",
  hp: 100,
  inventory: ["sword", "map"],
});
const hero = await root.kv.players.get("hero");
await root.kv.players.delete("hero");

// Bulk Operations
await root.kv.cache.setMany([
  ["a", 1],
  ["b", 2],
]);
const [a, b] = await root.kv.cache.getMany(["a", "b"]);
const allKeys = await root.kv.cache.keys();

// Atomic Update (single transaction)
await root.kv.stats.update("sessionCount", (count = 0) => count + 1);
```
