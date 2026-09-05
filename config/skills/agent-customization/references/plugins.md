# Plugins Reference Guide (`plugin.json`)

Plugins are namespaced, shareable bundles that package **Skills**, **Rules**, **Hooks**, **MCP Servers**, and **Sidecars** into a single deployable unit. They provide a unified distribution format for sharing multi-faceted customization suites across teams and repositories.

---

## 1. Directory Structure

A plugin is structured as a directory containing a required `plugin.json` manifest and optional subdirectories for each customization component:

```text
plugins/<plugin-name>/
├── plugin.json       # Required: Manifest declaring the plugin
├── mcp_config.json   # Optional: MCP tool servers provided by the plugin
├── hooks.json        # Optional: Lifecycle event hooks registered by the plugin
├── skills/           # Optional: On-demand agent skills exposed by the plugin
│   └── <skill-name>/
│       ├── SKILL.md
│       └── scripts/
├── rules/            # Optional: Contextual rules bundled with the plugin
│   └── <rule-name>.md
└── sidecars/         # Optional: Background worker daemons exposed by the plugin
    └── <sidecar-name>/
        ├── sidecar.json
        └── worker.py
```

---

## 2. Manifest (`plugin.json`)

Every plugin directory must contain a `plugin.json` file at its root. This file serves as the discovery marker:

```json
{
  "name": "team-developer-kit"
}
```

* **`name`** (`string`, optional): Display name for the plugin. Defaults to the folder name if omitted.

---

## 3. Discovery & Installation Locations

Antigravity scans the following standard locations for plugins:

| Scope | Path | Description |
| :--- | :--- | :--- |
| **Workspace Plugin** | `<workspace-root>/.agents/plugins/<name>/` | Project-specific; committed to VCS and shared with your repository team. |
| **Global Plugin** | `~/.gemini/config/plugins/<name>/` | Machine-wide; active across all workspaces on your computer. |

*Note: Antigravity also supports legacy alias paths like `_agents/plugins/`.*

---

## 4. Component Ingestion & Scoping

When a plugin is discovered and enabled:

1. **Skills**: Any skills located under `plugins/<name>/skills/<skill-name>/` are automatically indexed and available to the agent via semantic description matching and slash commands (`/<skill-name>`).
2. **MCP Servers**: Servers declared in `plugins/<name>/mcp_config.json` are launched by the IDE, exposing their native toolsets directly into the agent's runtime.
3. **Hooks**: Lifecycle handlers in `plugins/<name>/hooks.json` are registered into the active event execution queue and merged with workspace/global hooks.
4. **Sidecars**: Daemons under `plugins/<name>/sidecars/<sidecar-name>/` are registered with the identifier `<plugin-name>/<sidecar-name>`.
5. **Namespacing**: Tool names and sidecar identifiers are namespaced to prevent collisions with other plugins or local configurations.

---

## 5. Explicit Registration & Inheritance (`plugins.json`)

Plugins in standard customization roots are auto-discovered. However, plugins can also be explicitly registered, loaded from external directories, or inherited across configurations using `plugins.json` (located in `.agents/plugins.json` or `~/.gemini/config/plugins.json`):

```json
{
  "inherits": [
    {
      "path": "/path/to/shared/plugins.json",
      "include_only": ["team-developer-kit"],
      "exclude": ["deprecated-.*"]
    }
  ],
  "entries": [
    {
      "path": "tools/plugins",
      "exclude": ["experimental-.*"]
    },
    {
      "path": "~/personal-plugins"
    }
  ]
}
```

* **`inherits`**: Array of paths to other `plugins.json` configurations to merge.
* **`entries`**: Array of directory paths to scan for plugins (`plugins/<name>/plugin.json`).
* **`include_only` / `exclude`**: Regex filter arrays matching plugin directory names.
* **Path Resolution**: Absolute (`/`), home-relative (`~/`), or workspace-relative (relative to repository root containing `.git`).
