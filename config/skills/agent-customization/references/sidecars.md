# Sidecars Reference Guide (`sidecar.json`)

Sidecars are persistent or scheduled background worker processes managed directly by Antigravity. The platform monitors sidecar lifecycles, automatically launching them alongside the agent runtime, restarting them upon failures, and persisting runtime execution events.

---

## 1. Discovery & Locations

Sidecars are discovered by scanning for `sidecar.json` manifests in designated directories:

| Tier | Directory | ID Convention |
| :--- | :--- | :--- |
| **Global Sidecars** | `~/.gemini/config/sidecars/<sidecarName>/` | `<sidecarName>` |
| **Plugin Sidecars** | `~/.gemini/config/plugins/<pluginName>/sidecars/<sidecarName>/` | `<pluginName>/<sidecarName>` |

* The directory name acts as the sidecar's identifier.
* The sidecar directory serves as the current working directory (`cwd`) for command executions.
* Auxiliary scripts (e.g. `worker.py`, `poll.sh`) should be co-located within the sidecar folder.

### Directory Structure Example

```text
~/.gemini/config/sidecars/
├── review-triage/
│   ├── sidecar.json
│   └── triage.py
└── repo-watcher/
    └── sidecar.json

~/.gemini/config/plugins/
└── team-automation/
    └── sidecars/
        └── pr-monitor/
            ├── sidecar.json
            └── monitor.sh
```

---

## 2. Configuration Schema (`sidecar.json`)

Each sidecar directory must include a `sidecar.json` descriptor:

```json
{
  "description": "Background queue processor",
  "command": "python3",
  "args": ["worker.py", "--batch-size=50"],
  "restart_policy": "on-failure",
  "env": {
    "LOG_LEVEL": "info"
  },
  "display_name": "Queue Processor"
}
```

### Manifest Fields

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`command`** | `string` | **Yes\*** | Command executable (e.g. `python3`, `node`, `bash`). Mutually exclusive with `builtin`. |
| **`builtin`** | `string` | **Yes\*** | Builtin system utility (currently supports `"schedule"`). Mutually exclusive with `command`. |
| **`args`** | `string[]` | No | CLI arguments passed to `command` or `builtin`. |
| **`restart_policy`** | `string` | No | Restart behavior: `"always"`, `"on-failure"`, or `"never"`. Defaults to `"always"`. |
| **`description`** | `string` | No | Human-readable explanation of the daemon's task. |
| **`env`** | `object` | No | Key-value mapping of custom environment variables. |
| **`display_name`** | `string` | No | Human-readable label displayed in the Antigravity user interface. |

*\*Note: Exactly one of `command` or `builtin` must be specified.*

---

## 3. The `schedule` Builtin (Cron Daemon)

Antigravity provides a native scheduler to trigger recurring CLI tasks without configuring OS-level cron daemons.

```json
{
  "description": "Hourly agent to triage review requests",
  "builtin": "schedule",
  "args": [
    "0 * * * *",
    "agentapi",
    "new-conversation",
    "Provide a summary of incoming review requests."
  ]
}
```

* **Argument 1**: Standard 5-field cron expression (`minute hour day-of-month month day-of-week`).
* **Remaining Arguments**: The command and parameters executed on each schedule trigger.

---

## 4. Programmatic Agent Interaction (`agentapi`)

Sidecars have access to the bundled `agentapi` CLI tool, which is automatically injected into the sidecar's executable `$PATH`. This allows daemons to autonomously start conversations or dispatch messages to agents:

### CLI Commands

```bash
# 1. Start a new agent conversation with a prompt
# (Requires 'projectId' configured in config.json)
agentapi new-conversation "Inspect recent pull requests for open security gates."

# 2. Send a follow-up message to an existing conversation
agentapi send-message "<conversation-id>" "Additional diagnostics payload ready."
```

---

## 5. Enabling Sidecars (`config.json`)

To prevent unauthorized background processes from launching, all sidecars are **disabled by default**. They must be explicitly enabled in the global configuration file:

* **Config Path**: `~/.gemini/config/config.json`

```json
{
  "sidecars": {
    "review-triage": {
      "enabled": true
    },
    "team-automation/pr-monitor": {
      "enabled": true,
      "projectId": "my-cloud-project-id"
    }
  }
}
```

### Config Options

* **`enabled`** (`boolean`): Set to `true` to authorize Antigravity to launch and manage the process.
* **`projectId`** (`string`, optional): Cloud project ID used when `agentapi new-conversation` creates conversations.

---

## 6. Runtime Data & Storage

Sidecar output and persistent artifacts are stored deterministically:

* **Root Path**: `~/.gemini/antigravity/sidecar_data/<sidecarId>/`
* **`data/`**: Persistent data directory. The absolute path is exposed to the process via the `ANTIGRAVITY_EXECUTABLE_DATA_DIR` environment variable.
* **`logs/`**: Timestamped execution logs capturing `stdout` and `stderr`.
* **`events/`**: JSON transaction logs recorded when interacting with `agentapi`.
