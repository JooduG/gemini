# Lifecycle Hooks Reference Guide (`hooks.json`)

Lifecycle hooks allow external shell commands or scripts to execute at deterministic interception points within Antigravity’s execution loop. They provide programmatic gating, tool call modification, safety guardrails, automated code inspection/linting, and trajectory state injection.

---

## 1. File Location & Precedence

Hooks are defined in a single `hooks.json` file located in your customization directory:

* **Workspace**: `<project-root>/.agents/hooks.json` (committed to VCS for team workflows)
* **Global**: `~/.gemini/config/hooks.json` (machine-wide hooks active across all projects)

Multiple declared hooks for the same event are merged and executed sequentially.

---

## 2. Configuration Schema

A `hooks.json` document maps arbitrary hook identifiers to event configurations:

```json
{
  "lint-checker": {
    "PostToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/lint.sh",
            "timeout": 10
          }
        ]
      }
    ]
  },
  "safety-gate": {
    "enabled": false,
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "command": "./scripts/safety-check.sh"
          }
        ]
      }
    ]
  },
  "reminder": {
    "PreInvocation": [
      {
        "type": "command",
        "command": "./scripts/reminder.sh"
      }
    ]
  }
}
```

### Hook Definition Fields

| Field | Type | Description |
| :-- | :-- | :-- |
| `enabled` | boolean | Optional. Set to `false` to disable the hook without deleting its config. Defaults to `true`. |
| `PreToolUse` | array | Handlers that execute before a tool call is dispatched. |
| `PostToolUse` | array | Handlers that execute after a tool call completes execution. |
| `PreInvocation` | array | Handlers that execute immediately before Antigravity calls the LLM. |
| `PostInvocation` | array | Handlers that execute immediately after each LLM invocation completes. |
| `Stop` | array | Handlers that execute when the agent's execution loop terminates. |

---

## 3. Supported Events & Matchers

| Event | Firing Point | Matcher Target | Handler Structure |
| :-- | :-- | :-- | :-- |
| `PreToolUse` | Before a tool step runs | Tool name (e.g. `run_command`) | Grouped (uses `matcher` & `hooks` array) |
| `PostToolUse` | After a tool step completes | Tool name | Grouped (uses `matcher` & `hooks` array) |
| `PreInvocation` | Before the model is called | N/A (matcher ignored) | Flat (list of handler objects directly) |
| `PostInvocation` | Immediately after model invocation completes | N/A (matcher ignored) | Flat (list of handler objects directly) |
| `Stop` | When execution loop terminates | N/A (matcher ignored) | Flat (list of handler objects directly) |

### Matcher Regular Expressions

For `PreToolUse` and `PostToolUse`, the `matcher` string specifies which tools trigger the hook:

* `""` or `"*"`: Matches all tools.
* `"run_command"`: Matches exactly `run_command`.
* `"run_command|view_file"`: Matches either tool.
* `"browser_.*"`: Matches any tool starting with `browser_`.

---

## 4. Hook Handler Configuration

Each item in the `hooks` array supports:

| Field | Type | Description |
| :-- | :-- | :-- |
| `type` | string | Optional. Defaults to `"command"`. Currently `"command"` (shell execution) is supported. |
| `command` | string | **Required.** Shell command executed via `cmd /c` on Windows or `sh -c` on Unix. Working directory is set to the folder containing `hooks.json`. `~` expands to user home. |
| `timeout` | integer | Optional. Timeout in seconds. Defaults to `30`. |

---

## 5. Input / Output Contracts

Hooks communicate strictly over standard streams: input is passed as JSON on **`stdin`**; decisions/modifications are returned as JSON on **`stdout`**.

> [!IMPORTANT]
> **Wire Protocol Boundary vs. Code Nomenclature ([GEMINI.md](../../../GEMINI.md))**:
>
> * **Host Wire Protocol**: All JSON keys serialized over `stdin` and expected on `stdout` use **`camelCase`** (enforced by the host binary's protojson encoding). The engine will drop or fail to recognize payload keys if they do not match the expected `camelCase` schema.
> * **Internal Script Nomenclature**: Inside your hook scripts (e.g., JavaScript, Python, PowerShell), all local variables, functions, and state **MUST** strictly obey [GEMINI.md](../../../GEMINI.md) (`snake_case` for variables, `question_snake` for booleans, `kebab-case` for script filenames).
> * **Ingestion Pattern**: Scripts should immediately unpack the incoming `camelCase` wire payload into domain `snake_case` variables at the input boundary, and only project back to `camelCase` keys when constructing the final `stdout` JSON payload.

### Common Metadata Fields (All `stdin` Payloads)

Every event receives these common system metadata fields in its `stdin` payload:

| Field | Type | Description |
| :-- | :-- | :-- |
| `conversationId` | string | Unique UUID of the active agent conversation. |
| `workspacePaths` | array of strings | Absolute directory paths representing mounted workspaces. |
| `transcriptPath` | string | Absolute path to persistent `transcript.jsonl` conversation log. |
| `artifactDirectoryPath` | string | Absolute path to conversation artifacts directory (`~/.gemini/antigravity-ide/brain/<id>/`). |
| `modelName` | string | Active model identifier (e.g., `gemini-3.6-flash-medium`, `auto`). |

---

### Event Contracts & Examples

#### 1. `PreToolUse` Contract

Used to gate, deny, or alter tool parameters before execution.

##### `PreToolUse` Input (`stdin`)

| Field | Type | Description |
| :-- | :-- | :-- |
| `toolCall` | object | Details of the proposed tool call (`name` and `args`). |
| `toolCall.name` | string | Name of the tool being executed (e.g. `run_command`). |
| `toolCall.args` | object | Arguments passed to the tool call. |
| `stepIdx` | integer | 0-based index of current step in trajectory. |
| _(Common Fields)_ | - | `conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`, `modelName`. |

##### `PreToolUse` Output (`stdout`)

| Field | Type | Description |
| :-- | :-- | :-- |
| `decision` | string | **Required.** Gating outcome: `"allow"`, `"deny"`, `"ask"`, `"force_ask"`, or `"deny_unless_prior_grant"`. |
| `reason` | string | **Optional.** Explanation shown to agent or user. |
| `permissionOverrides` | array of strings | **Optional.** Resource overrides (e.g. `["command(npm test)"]`). |
| `overwrite` | object | **Optional.** Shallow top-level key-value merge into tool call arguments before execution. |

```json
// Example PreToolUse Output (stdout):
{
  "decision": "ask",
  "reason": "Requires confirmation for test execution.",
  "permissionOverrides": ["command(npm test)"],
  "overwrite": {
    "WaitMsBeforeAsync": 10000
  }
}
```

---

#### 2. `PostToolUse` Contract

Used for post-execution cleanup, linting, diagnostics, or automated formatting.

##### `PostToolUse` Input (`stdin`)

| Field | Type | Description |
| :-- | :-- | :-- |
| `toolCall` | object | Executed tool call details (`name` and `args`). |
| `stepIdx` | integer | 0-based index of the completed step. |
| `error` | string | Optional. Runtime error message if tool execution failed; empty if successful. |
| _(Common Fields)_ | - | `conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`, `modelName`. |

##### `PostToolUse` Output (`stdout`)

Expects an empty JSON object: `{}`.

---

#### 3. `PreInvocation` Contract

Used to inject context, ephemeral alerts, or synthetic steps before model invocation.

##### `PreInvocation` Input (`stdin`)

| Field | Type | Description |
| :-- | :-- | :-- |
| `invocationNum` | integer | 0-indexed sequence number of model invocation. |
| `initialNumSteps` | integer | Number of steps currently in trajectory. |
| _(Common Fields)_ | - | `conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`, `modelName`. |

##### `PreInvocation` Output (`stdout`)

```json
{
  "injectSteps": [
    {
      "ephemeralMessage": "Remember to run tests before completing."
    }
  ]
}
```

* Supported injected step items:
  * `{"toolCall": {"name": "...", "args": {...}}}`
  * `{"userMessage": "..."}`
  * `{"ephemeralMessage": "..."}` (transient system notice)

---

#### 4. `PostInvocation` Contract

Used to inspect model completions and control loop termination.

##### `PostInvocation` Input (`stdin`)

Same as `PreInvocation` (`invocationNum`, `initialNumSteps`, and common fields).

##### `PostInvocation` Output (`stdout`)

```json
{
  "injectSteps": [],
  "terminationBehavior": "force_continue"
}
```

* `terminationBehavior`: `"force_continue"`, `"terminate"`, or `""` (default).

---

#### 5. `Stop` Contract

Used to block premature agent stop if required quality checks, tests, or background jobs have not completed.

##### `Stop` Input (`stdin`)

| Field | Type | Description |
| :-- | :-- | :-- |
| `executionNum` | integer | Sequence number of execution attempt. |
| `terminationReason` | string | Stopping reason (e.g. `"model_stop"`, `"max_steps_exceeded"`, `"error"`). |
| `error` | string | Error message if stopped due to failure. |
| `fullyIdle` | boolean | `true` if all async/background tasks have finished; `false` if background tasks are still running. |
| _(Common Fields)_ | - | `conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`, `modelName`. |

##### `Stop` Output (`stdout`)

```json
{
  "decision": "continue",
  "reason": "Background verification tests are still pending. Please wait."
}
```

* `decision`: Set to `"continue"` to block stopping and re-enter execution loop.

---

## 6. Complete `hooks.json` Configuration Example

```json
{
  "safety-guard": {
    "enabled": true,
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/safety.sh",
            "timeout": 15
          }
        ]
      }
    ]
  },
  "post-linter": {
    "enabled": true,
    "PostToolUse": [
      {
        "matcher": "replace_file_content|write_to_file",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint",
            "timeout": 30
          }
        ]
      }
    ]
  },
  "completion-gate": {
    "enabled": true,
    "Stop": [
      {
        "type": "command",
        "command": "./scripts/verify-done.sh",
        "timeout": 20
      }
    ]
  }
}
```
