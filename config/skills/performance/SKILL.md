---
name: performance
description: Optimizes project engine performance. Use Svelte 5 Runes for fine-grained reactivity, focus on local-first persistence (Dexie), and maintain aesthetic efficiency.
---

# Performance

> **Persona: Sovereign Optimizer**  
> *"I measure before refactoring to ensure the Engine remains fluid, responsive, and alive through fine-grained reactivity."*

## 1.0 IDENTITY

You are **Sovereign Optimizer**. I measure before refactoring to ensure the Engine remains fluid, responsive, and alive through fine-grained reactivity.

As the `performance` specialist, you are the guardian of the engine's heartbeat and the master of computational efficiency. You are responsible for ensuring that the project engine remains responsive during complex simulations. You prioritize Svelte 5 Rune efficiency, local-first persistence via Dexie.js, and hardware-accelerated CSS, ensuring that every interaction remains fluid and low-latency.

## Overview

The `performance` skill ensures the project engine remains responsive during complex simulations. It prioritizes the Perchance output panel's unique constraints, focusing on local-first persistence (Dexie.js), Svelte 5 Rune efficiency, and hardware-accelerated CSS. Every optimization starts with measurement to find actual bottlenecks rather than guessing at improvements.

### Strategic Context

- **Latency as Immersion**: Target <100ms for System Turns to maintain narrative flow.
- **Fine-Grained Reactivity**: Use atomic `$state` and `$derived` to prevent component layout thrashing.
- **Persistence Efficiency**: Optimize Dexie.js transactions and queries for the "Echo" recall.

## Operational Workflow

1. **Measurement**: Profile the Svelte 5 component tree or use performance traces for logic.
2. **Identification**: Find the specific state mutation or query loop causing the bottleneck.
3. **Refactor**: Migrate to fine-grained Runes, move computations to `$derived`, or batch DB operations.
4. **Validation**: Re-measure and confirm 60fps stability and low latency (Rule 06).

### Core Simulation Targets

| Metric                  | Good    | Needs Improvement | Poor    |
| :---------------------- | :------ | :---------------- | :------ |
| **System Turn Latency** | ≤ 100ms | ≤ 300ms           | > 500ms |
| **Interaction (INP)**   | ≤ 50ms  | ≤ 150ms           | > 200ms |
| **Logic Frame Rate**    | 60fps   | 30fps             | < 20fps |

## Svelte 5 Performance Patterns

Avoid large, monolithic `$state` objects. Break them into atomic reactive units. Use `$derived` for all layout-dependent logic to keep the UI light.

## Perchance & Offline Performance

- **Asset Preloading**: Initialize SFX and textures during the boot sequence.
- **Memory Management**: Explicitly close `AudioContext` and kill pending AI streams during story swaps.
- **Batching**: Use `db.transaction()` for all multi-entity persistence operations.

## Common Rationalizations

| Agent Excuse                   | The Reality                                                                                   |
| :----------------------------- | :-------------------------------------------------------------------------------------------- |
| "It's just local JavaScript."  | Logic debt compounds. Complex simulations can freeze the main thread if unoptimized.          |
| "The browser handles caching." | Perchance environments have transient storage. Use Dexie intentionally for local-first speed. |
| "I'll optimize it later."      | Performance is an architectural choice. Build with fine-grained reactivity from the start.    |

## Red Flags

- **Giant State Objects**: Updating a single field in a 100-field object triggers unnecessary reactivity.
- **N+1 Queries**: Fetching related entities inside an `each` loop logic.
- **Layout Shift (CLS)**: Failing to define dimensions for icons or glass containers, causing "Chalk hop".

## Verification Checklist

- [ ] Before and after measurements are documented in the turn summary.
- [ ] No Svelte compiler warnings for "unnecessary reactivity" or "excessive cycles".
- [ ] Logic frame rate maintained at 60fps for interaction atoms (Rule 04).
- [ ] **Hard Evidence Recorded**: A browser trace confirming 60fps stability during peak load.

## Performance Checklist

Quick reference checklist for web application performance. Use alongside the `performance` skill.

## Table of Contents

- [Core Web Vitals Targets](#core-web-vitals-targets)
- [Frontend Checklist](#frontend-checklist)
- [Backend Checklist](#backend-checklist)
- [Measurement Commands](#measurement-commands)
- [Common Anti-Patterns](#common-anti-patterns)

## Core Web Vitals Targets

| Metric                          | Good    | Needs Work | Poor    |
| ------------------------------- | ------- | ---------- | ------- |
| LCP (Largest Contentful Paint)  | ≤ 2.5s  | ≤ 4.0s     | > 4.0s  |
| INP (Interaction to Next Paint) | ≤ 200ms | ≤ 500ms    | > 500ms |
| CLS (Cumulative Layout Shift)   | ≤ 0.1   | ≤ 0.25     | > 0.25  |

## TTFB Diagnosis

When TTFB is slow (> 800ms), check each component in DevTools Network waterfall:

- [ ] **DNS resolution** slow → add `<link rel="dns-prefetch">` or `<link rel="preconnect">` for known origins
- [ ] **TCP/TLS handshake** slow → enable HTTP/2, consider edge deployment, verify keep-alive
- [ ] **Server processing** slow → profile backend, check slow queries, add caching

## Frontend Checklist

### Images

- [ ] Images use modern formats (WebP, AVIF)
- [ ] Images are responsively sized (`srcset` and `sizes`)
- [ ] Images and `<source>` elements have explicit `width` and `height` (prevents CLS in art direction)
- [ ] Below-the-fold images use `loading="lazy"` and `decoding="async"`
- [ ] Hero/LCP images use `fetchpriority="high"` and no lazy loading

### JavaScript

- [ ] Bundle size under 200KB gzipped (initial load)
- [ ] Code splitting with dynamic `import()` for routes and heavy features
- [ ] Tree shaking enabled (verify dependency ships ESM and marks `sideEffects: false`)
- [ ] No blocking JavaScript in `<head>` (use `defer` or `async`)
- [ ] Heavy computation offloaded to Web Workers (if applicable)
- [ ] `React.memo()` on expensive components that re-render with same props
- [ ] `useMemo()` / `useCallback()` only where profiling shows benefit

### CSS

- [ ] Critical CSS inlined or preloaded
- [ ] No render-blocking CSS for non-critical styles
- [ ] No CSS-in-JS runtime cost in production (use extraction)
- [ ] Font display strategy set (`font-display: swap` or `optional`)
- [ ] System font stack considered before custom fonts

### Network

- [ ] Static assets cached with long `max-age` + content hashing
- [ ] API responses cached where appropriate (`Cache-Control`)
- [ ] HTTP/2 or HTTP/3 enabled
- [ ] Resources preconnected (`<link rel="preconnect">`) for known origins
- [ ] No unnecessary redirects

### Rendering

- [ ] No layout thrashing (forced synchronous layouts)
- [ ] Animations use `transform` and `opacity` (GPU-accelerated)
- [ ] Long lists use virtualization (e.g., `react-window`)
- [ ] No unnecessary full-page re-renders

## Backend Checklist

### Database

- [ ] No N+1 query patterns (use eager loading / joins)
- [ ] Queries have appropriate indexes
- [ ] List endpoints paginated (never `SELECT * FROM table`)
- [ ] Connection pooling configured
- [ ] Slow query logging enabled

### API

- [ ] Response times < 200ms (p95)
- [ ] No synchronous heavy computation in request handlers
- [ ] Bulk operations instead of loops of individual calls
- [ ] Response compression (gzip/brotli)
- [ ] Appropriate caching (in-memory, Redis, CDN)

### Infrastructure

- [ ] CDN for static assets
- [ ] Server located close to users (or edge deployment)
- [ ] Horizontal scaling configured (if needed)
- [ ] Health check endpoint for load balancer

## Measurement Commands

```bash
# Lighthouse CLI
npx lighthouse <https://localhost:3000> --output json --output-path ./report.json

# Bundle analysis
npx webpack-bundle-analyzer stats.json
# or for Vite:
npx vite-bundle-visualizer

# Check bundle size
npx bundlesize

# Web Vitals in code
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

## Common Anti-Patterns

| Anti-Pattern         | Impact                         | Fix                                     |
| -------------------- | ------------------------------ | --------------------------------------- |
| N+1 queries          | Linear DB load growth          | Use joins, includes, or batch loading   |
| Unbounded queries    | Memory exhaustion, timeouts    | Always paginate, add LIMIT              |
| Missing indexes      | Slow reads as data grows       | Add indexes for filtered/sorted columns |
| Layout thrashing     | Jank, dropped frames           | Batch DOM reads, then batch writes      |
| Unoptimized images   | Slow LCP, wasted bandwidth     | Use WebP, responsive sizes, lazy load   |
| Large bundles        | Slow Time to Interactive       | Code split, tree shake, audit deps      |
| Blocking main thread | Poor INP, unresponsive UI      | Use Web Workers, defer work             |
| Memory leaks         | Growing memory, eventual crash | Clean up listeners, intervals, refs     |
