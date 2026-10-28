---
name: perchance-server-plugin
description: Authoritative technical specification for the Perchance Server Plugin (server-plugin). Use when implementing, debugging, or asking about realtime multiplayer, createServerSocket(), synchronous server sandboxes, 50 MiB persistent binary state (Uint8Array), server jobs with client tickets (jobs.generateText, jobs.generateImage, jobs.upload), or QuickJS emulator testing.
---

# Perchance Server Plugin — Technical Specification & Operating Manual

The Perchance Server Plugin (`server-plugin`) enables realtime multiplayer, WebSocket RPC, persistent binary server state, and background server jobs without external infrastructure.

```pjs
// main.pjs
createServerSocket = {import:server-plugin}
```

```html
<!-- index.html (client-side connection) -->
<script type="module">
  const socket = root.createServerSocket();
  socket.addEventListener("open", () => socket.send("hello"));
  socket.addEventListener("message", (e) => console.log(e.data));
</script>

<!-- Server script (first script tag with type="text/x-server-plugin") -->
<script type="text/x-server-plugin">
  self.onopen = ({conn}) => conn.subscribe("world");
  self.onmessage = ({conn, data}) => pubsub.publish("world", data);
  self.onclose = ({conn, code, reason, wasClean}) => {};
</script>
```

---

## 1.0 Empirical Pitfalls & Scar Tissue

| Trigger                           | Wrong Behavior                                                                   | Correct Behavior                                                                                                                                              |
| :-------------------------------- | :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`async` / `Promise` on Server** | Writing `async function`, `fetch()`, or `setTimeout()` inside the server script. | Server execution is **strictly synchronous**. Absolutely zero promises, timers, or network calls inside handlers. Use `jobs.*` for async work.                |
| **Decoding Entire 50MB `state`**  | Running `JSON.parse` or decoding all of `state` per event/reconnection.          | Touch only bounded byte offsets via `DataView`. Full-buffer iteration causes CPU timeouts (50 ms limit) and kills the server.                                 |
| **Storing `conn.id` in `state`**  | Persisting connection IDs across hibernations or restarts.                       | Sockets close with code `1012` on server restarts. Store records by persistent user key or author identity, never ephemeral connection IDs.                   |
| **Mid-Write Server Timeout**      | Writing length/count header before payload bytes.                                | **Write payload data first, commit version/length pointer last**. Partial writes from mid-handler timeouts will corrupt state if headers advance prematurely. |
| **Quarantine Trigger (`4429`)**   | Looping reconnects on repeated `1011` server crashes.                            | Honor retry delays on `4429`. Fix handler crashes and timeout bottlenecks in the local emulator first before deploying.                                       |

---

## 2.0 The Synchronous Server Sandbox Laws

Server handlers run in an isolated V8/QuickJS compartment. Everything inside the server script is **public to all clients** (never store plaintext passwords or private keys).

### Resource & Execution Limits

- **Execution**: 100% synchronous. No `async`, `Promise`, `setTimeout`, `setInterval`, `fetch`, `WebSocket`, `URL`, `crypto`, `DOM`, `window`, or `document`.
- **CPU Limits**: **50 ms CPU** per event/RPC; 200 ms initialization. Sustained ~250 ms CPU/s per generator.
- **Memory**: V8 heap 64 MiB; guest/external 128 MiB.
- **Messages**: 1 MiB max per message (including RPC replies). Inbound 200 msg/s sustained, burst 400.
- **Connections**: Up to 10,000 per generator.

### Handlers & Globals

Available in server script: ES primitives, `JSON`, `Math`, `Date`, `Map`, `Set`, `ArrayBuffer`, `DataView`, typed arrays, `self`, `state`, `pubsub`, `console`, `TextEncoder`, `TextDecoder`.

```javascript
// RPC Pattern
self.rpc = {
  getPlayerState({ conn }, data) {
    // Synchronous request -> response
    return JSON.stringify({ x: 10, y: 20 });
  },
};
```

---

## 3.0 Persistent Binary Memory (`state: Uint8Array`)

`state` is a zero-initialized, fixed-size `Uint8Array` (50 MiB) persisted per generator with **no expiration**. It is the **only durable memory** surviving hibernation, server restarts, and code changes.

```javascript
// Canonical Binary Memory Allocation
const HEADER_SIZE = 16;
const view = new DataView(state.buffer, state.byteOffset, state.byteLength);

// Read magic bytes and count
const magic = view.getUint32(0, true);
let count = view.getUint32(4, true);

// Atomic Commit Pattern:
// 1. Write entity payload to offset
const offset = HEADER_SIZE + count * 32;
view.setUint32(offset, playerId, true);
view.setInt16(offset + 4, posX, true);
view.setInt16(offset + 6, posY, true);

// 2. Commit transaction by updating header count last
view.setUint32(4, count + 1, true);
```

---

## 4.0 Server Jobs with Browser-Minted Tickets

The server cannot call external APIs directly. Instead, client browsers mint single-use cryptographic tickets that authorize the server to execute background jobs charged to the user's allowance.

### Step 1: Client Browser Mints Ticket

```javascript
// Client-side (async allowed in browser)
const ticket = await root.generateText.createTicket();
socket.rpc.requestAiTurn(JSON.stringify({ prompt: "Describe room", ticket }));
```

### Step 2: Server Enqueues Background Job

```javascript
// Server script (synchronous enqueue)
self.rpc = {
  requestAiTurn({ conn }, payload) {
    const { prompt, ticket } = JSON.parse(payload);
    // Returns job id immediately; does not block
    jobs.generateText(
      {
        ticket,
        instruction: prompt,
        startWith: "Room:",
        stopSequences: ["\n\n"],
      },
      { tag: `turn:${conn.id}:${Date.now()}` },
    );
    return "queued";
  },
};
```

### Step 3: Server Receives Result via `onjobresult`

```javascript
self.onjobresult = ({ id, tag, kind, ok, value, error, retryable }) => {
  if (ok && kind === "generateText") {
    // Broadcast continuation to subscribed clients
    pubsub.publish("world", JSON.stringify({ tag, text: value.text }));
  }
};
```

Available jobs: `jobs.generateText`, `jobs.generateImage`, `jobs.upload`, `jobs.fetch`, `jobs.fileInfo`.

---

## 5.0 Local QuickJS Emulator Testing

When editing an unsaved generator (`window.generatorIsUnsaved`), Perchance runs a local QuickJS emulator in the preview frame.

### Seeding Emulator State

You can seed, inspect, or test recovery with `root.createServerSocket`:

```javascript
// Inspect current 50MB state
const currentState = await root.createServerSocket.getEmulatorState();

// Seed custom binary state or test migrations
await root.createServerSocket.setEmulatorState(new Uint8Array([1, 2, 3]));
```
