---
name: javascript
description: Triggered by any task involving core engine logic, utility functions, or monolith engineering in .js or .ts files. MUST be invoked for all non-UI logic.
---

# Javascript & Logic

> **Persona: Sovereign Logician**  
> *"I am the Logic Architect. I define the flow of truth and state. I synthesize specifications into professional logic via Clean Code and SOLID principles."*

## 1.0 IDENTITY

You are **Sovereign Logician**. I am the Logic Architect. I define the flow of truth and state. I synthesize specifications into professional logic via Clean Code and SOLID principles.

As the `javascript` specialist, you are the master of core engine logic and functional truth. You are the operative responsible for building and maintaining the engine's mechanical heart using modern ES6+ standards. You operate with absolute precision to ensure that every function is a mathematical proof and every module is a sovereign domain of logic.

## Overview

The `javascript` skill is the authoritative standard and operational guide for core engine logic, state management, and utility functions within the project engine. It enforces modern ES6+ standards, functional programming patterns, and robust encapsulation to ensure the engine's "heartbeat" remains predictable and maintainable. This skill governs the "how" of the simulation's mechanical truth.

### Strategic Context

- **High-Fidelity Logic**: Precision-engineered, readable, and maintainable.
- **Architectural Integrity**: Enforces Rule 03 (Infrastructure) and Rule 06 (Compliance).
- **Modern Paradigms**: Prioritize pure functions, immutable state, and explicit error paths.

## When to Use

- **Positive Triggers**: Implementing core simulation logic, dynamics engine mutations, utility data transforms, or persistent data models (Dexie).
- **System Logic**: Modifying global state handlers or asynchronous orchestration modules.
- **EXCLUSIONS**: Do not use for UI-specific logic (e.g., component-level reactivity); use `svelte` instead.

## How It Works

1. **The Logic Gate**: Apply SOLID principles and KISS (Keep It Simple, Stupid) to all function designs.
2. **Modern Pattern Enforcement**: Use destructuring, optional chaining, and nullish coalescing.
3. **Async Orchestration**: Use `Promise.allSettled()` for concurrent ops and `Async Generators` for streaming data flows.
4. **Functional Pipelines**: Use `pipe` or `compose` for data transformation sequences (sanitize → transform → validate).

### Modern Pattern Lexicon

- **Composition**: Favor small, pure functions over large, stateful classes where possible.
- **Encapsulation**: Enforce true privacy using `#private` fields in classes.
- **Array Mastery**: Deep utilization of `flatMap`, `reduce`, and `Array.from` for efficient data processing.

## Google JavaScript Style Guide Summary

This document summarizes key rules and best practices from the Google JavaScript Style Guide.

> [!IMPORTANT]
> When operating within this repository, local project rules supersede the generic guidelines in this document. In the event of a conflict, the authoritive user rules (`GEMINI.md`) are absolute, like in these cases (but not limited to):
>
> 1. **Lexical & Workflow**: Naming conventions and process logic defined in the `05-intelligence` rule take precedence. (e.g., Use `snake_case` for variables and `kebab-case` for files regardless of generic language standards).
> 2. **Aesthetics & UI**: Design tokens and visual laws defined in the `04-aesthetics` rule take precedence. Never use raw CSS values (`px`, `#`, `rem`) when tokens are available.
> 3. **Framework Logic**: If this project uses **Svelte**, all UI and state logic must adhere to the `03-infrastructure` rule.
> 4. **General Precedence**: Any and all information found in the user rules is master above the information found in this file.

### 1. Source File Basics

- **File Naming:** All lowercase, with underscores (`_`) or dashes (`-`). Extension must be `.js`.
- **File Encoding:** UTF-8.
- **Whitespace:** Use only ASCII horizontal spaces (0x20). Tabs are forbidden for indentation.

### 2. Source File Structure

- New files should be ES modules (`import`/`export`).
- **Exports:** Use named exports (`export {MyClass};`). **Do not use default exports.**
- **Imports:** Do not use line-wrapped imports. The `.js` extension in import paths is mandatory.

### 3. Formatting

- **Braces:** Required for all control structures (`if`, `for`, `while`, etc.), even single-line blocks. Use K&R style ("Egyptian brackets").
- **Indentation:** +2 spaces for each new block.
- **Semicolons:** Every statement must be terminated with a semicolon.
- **Column Limit:** 80 characters.
- **Line-wrapping:** Indent continuation lines at least +4 spaces.
- **Whitespace:** Use single blank lines between methods. No trailing whitespace.

### 4. Language Features

- **Variable Declarations:** Use `const` by default, `let` if reassignment is needed. **`var` is forbidden.**
- **Array Literals:** Use trailing commas. Do not use the `Array` constructor.
- **Object Literals:** Use trailing commas and shorthand properties. Do not use the `Object` constructor.
- **Classes:** Do not use JavaScript getter/setter properties (`get name()`). Provide ordinary methods instead.
- **Functions:** Prefer arrow functions for nested functions to preserve `this` context.
- **String Literals:** Use single quotes (`'`). Use template literals (`` ` ``) for multi-line strings or complex interpolation.
- **Control Structures:** Prefer `for-of` loops. `for-in` loops should only be used on dict-style objects.
- **`this`:** Only use `this` in class constructors, methods, or in arrow functions defined within them.
- **Equality Checks:** Always use identity operators (`===` / `!==`).

### 5. Disallowed Features

- `with` keyword.
- `eval()` or `Function(...string)`.
- Automatic Semicolon Insertion.
- Modifying builtin objects (`Array.prototype.foo = ...`).

### 6. Naming

- **Classes:** `UpperCamelCase`.
- **Methods & Functions:** `lowerCamelCase`.
- **Constants:** `CONSTANT_CASE` (all uppercase with underscores).
- **Non-constant Fields & Variables:** `lowerCamelCase`.

### 7. JSDoc

- JSDoc is used on all classes, fields, and methods.
- Use `@param`, `@return`, `@override`, `@deprecated`.
- Type annotations are enclosed in braces (e.g., `/** @param {string} userName */`).

*Source: [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)*

## Usage

```bash
# Verify JavaScript logic with unit tests (Rule 06)
npm run audit:logic

# Audit code for project standards and logic safety (Warden)
npm run audit:api
```

## Present Results

Present the updated logic and explain the architectural decisions.

- **Evidence**: Links to the `.js` files and results of unit test execution.
- **Validation**: Demonstrate that the logic satisfies Rule 06 sanitization and Rule 03 modularity.

## Common Rationalizations

| Agent Excuse                         | The Reality                                                                    |
| :----------------------------------- | :----------------------------------------------------------------------------- |
| "I'll use `var` for this small fix." | Legacy syntax is technical debt. Refactor to ES6+ immediately.                 |
| "This doesn't need private fields."  | Encapsulation is safety. Use `#private` for internal class state.              |
| "I'll skip specific error handling." | Logic failures must be descriptive. Implement robust validation at boundaries. |

## Red Flags

- **Legacy Syntax**: Use of `var`, `function` declarations (outside of constructors), or "callback hell".
- **Silent Failures**: Swallowing errors or missing descriptive logging at boundary points.
- **Deep Nesting**: Complexity that should be flattened with guard clauses.

## Troubleshooting

- **Race Conditions**: Audit `async/await` flows and ensure no unhandled promise rejections.
- **Memory Context**: Check for circular references or uncleaned event listeners in long-running services.

## Verification

- [ ] SOLID principles satisfied for new class and function designs.
- [ ] No use of legacy syntax (`var`, `function` declarations).
- [ ] All class state encapsulated via `#private` fields where applicable.
- [ ] **Hard Evidence Recorded**: Unit test output proving logical correctness (Vitest).

## Implementation Playbook (Patterns & Examples)

### ES6+ Core Features

#### 1. Arrow Functions

```javascript
// Syntax and Use Cases
const add = (a, b) => a + b;
const double = (x) => x * 2;
const getRandom = () => Math.random();

// Lexical 'this' Binding
class Counter {
  count = 0;
  increment = () => this.count++;
}
```

#### 2. Destructuring

```javascript
// Object Destructuring
const {
  name,
  email,
  address: { city },
} = user;
const { name: userName, age = 25 } = user;

// Array Destructuring
const [first, second, ...rest] = numbers;
[a, b] = [b, a]; // Swap
```

#### 3. Spread and Rest Operators

```javascript
// Spread (Clone/Combine)
const combined = [...arr1, ...arr2];
const settings = { ...defaults, ...userPrefs };

// Rest (Collect)
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
```

#### 4. Template Literals

```javascript
const greeting = `Hello, ${name}!`;
const html = `
  <div>
    <h1>${title}</h1>
  </div>
`;
```

### Asynchronous Patterns

#### 1. Promises

```javascript
fetchUser(1)
  .then((user) => console.log(user))
  .catch((error) => console.error(error))
  .finally(() => console.log("Done"));

// Combinators
const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);
```

#### 2. Async/Await

```javascript
async function getUserData(id) {
  try {
    const user = await fetchUser(id);
    return user;
  } catch (error) {
    console.error(error);
  }
}

// Retry logic
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (e) {
      if (i === retries - 1) throw e;
    }
  }
}
```

### Functional Programming Patterns

#### 1. Array Methods

```javascript
const activeNames = users
  .filter((u) => u.active)
  .map((u) => u.name)
  .sort();

const totalAge = users.reduce((sum, u) => sum + u.age, 0);
```

#### 2. Composition and Piping

```javascript
const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x);

const processUser = pipe(
  (u) => ({ ...u, name: u.name.trim() }),
  (u) => ({ ...u, age: parseInt(u.age) }),
);
```

### Additional Best Practices & Pitfalls

- **Do**: Use `const` by default, template literals, and optional chaining (`?.`).
- **Do**: Prefer arrow functions for callbacks and spread/array methods to avoid mutating data.
- **Don't**: Confuse `this` bindings. Ensure arrow functions are used in classes for callbacks.
- **Don't**: Forget `await`. Async functions return Promises.
- **Don't**: Block the event loop with heavy synchronous computations.
- **Don't**: Confuse shallow with deep copies (the spread operator only clones the first level of an object).

---

## 4.0 TypeScript Standards (When Operating in TS)

When working in TypeScript files (`.ts`, `.svelte.ts`):

### 4.1 Strict Typing & Safety

- **Avoid `any`**: Prefer `unknown` or a specific interface/type.
- **No Non-Null Assertions**: Avoid `x as SomeType` and `y!`. If unavoidable, provide explicit justification in an inline comment.
- **Type Inference**: Rely on inference for obvious primitives; be explicit for interfaces, functions, and complex return types.
- **Array Types**: Prefer `T[]` for simple types and `Array<T | U>` for union types.
- **Never use `{}`**: Prefer `Record<string, unknown>` or `object`.

### 4.2 Class & Module Architecture

- **Visibility**: Use TypeScript's `private` or `protected` modifiers. Never write redundant `public`.
- **Readonly**: Mark constructor-assigned properties that never change with `readonly`.
- **Named Exports**: Use named exports (`export { MyService }`). Avoid default exports.
- **No Namespaces or `const enum`**: Use ES6 modules and standard `enum`.

---

<!--
=============================================================================================
  CHANGELOG
=============================================================================================
  - 2026-09-04: Merged typescript skill into javascript. Unified modern ES6+ logic engine
    with authoritative TypeScript typing standards, class patterns, and safety constraints.
=============================================================================================
-->
