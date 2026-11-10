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
├── agents/           # Optional: Sovereign subagents exposed by the plugin
│   └── <agent-name>.md # Agent descriptor with frontmatter (name, description)
├── rules/            # Optional: Contextual rules bundled with the plugin (MUST be AGENTS.md)
│   └── AGENTS.md     # Invariant: parser only binds rules/AGENTS.md or rules/GEMINI.md
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
  "name": "team-developer-kit",
  "displayName": "Team Developer Kit",
  "version": "1.0.0",
  "description": "Unified skills, hooks, rules, and MCP servers for backend engineering.",
  "logo": "assets/logo.svg",
  "suggestedPrompts": [
    "Run backend architecture audit",
    "Scaffold a new microservice route",
    "Verify database schema migrations"
  ]
}
```

* **Allowed Fields**:
  - `name` (string): Global unique identifier (lowercase kebab-case). Defaults to folder name if omitted.
  - `displayName` (string): Presentation title shown in UI headers and slash command menus.
  - `version` (string): Semantic version string (e.g. `1.0.0`).
  - `description` (string): Summary matched by Marketplace search.
  - `logo` (string): Relative path to square image (e.g. `assets/logo.svg`, at least 128x128).
  - `suggestedPrompts` (string[]): Up to 3 starter prompts for card/detail views.
  - `author` (string/object): Developer name or `{"name": "...", "url": "..."}`.
  - `homepage` / `repository` (string/object): Documentation or Git repository URLs.
  - `disabled` (boolean): Default disabled state.
* **Invariant**: Unknown top-level fields are silently discarded by the Antigravity loader.

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

---

## 6. Language Server Inventory & Operational Guardrails

To inventory installed plugins and inspect their active configuration, communicate with the local language server Connect endpoint:

```bash
cat > /tmp/lsrpc.sh <<'EOF'
: "${ANTIGRAVITY_LS_ADDRESS:=localhost:5387}"
lsrpc() {
  curl -sS -X POST \
    "http://${ANTIGRAVITY_LS_ADDRESS}/exa.language_server_pb.LanguageServerService/$1" \
    -H "Content-Type: application/json" \
    -H "x-codeium-csrf-token: ${ANTIGRAVITY_CSRF_TOKEN}" \
    -d "$2"
}
EOF
```

### Piped Discovery Recipe (`[PF-011]`)

> [!WARNING]
> Never read `lsrpc GetAllPlugins` unfiltered! It dumps the full text of every installed `SKILL.md` inline and will flood your context window. Always pipe through `jq`:

```bash
source /tmp/lsrpc.sh && lsrpc GetAllPlugins '{"workspaceUris":["file:///path/to/workspace"]}' | jq '[.plugins[] | {
  name,
  dir: (.path | split("/") | last),
  disabled: (.disabled // false),
  isGlobal,
  skills: [.skills[]?.name],
  agents: [.agents[]?.agent.name],
  rules: [.rules[]?.absolutePath],
  hooks: ((.hooksJson // "") | length > 0),
  mcp: [.mcpServers[]?.name]
}]'
```

### Operational Guardrails (`[PF-010]`)

1. **Key on `dir`, never `name`**: Links in chat must use `[<name>](customization://<dir>)` where `<dir>` is the directory name (`.path | split("/") | last`). Keying on `name` creates broken links.
2. **Never Call Restricted Mutation RPCs**: `JetboxWriteState`, `DeletePlugin`, and `InstallCustomization` are restricted inside `run_command`. Direct the user to the `customization://<dir>` link or render `<plugin-card catalog-id="...">`.
3. **Never Hand-Edit `config.json`**: Editing `config.json` bypasses the language server, misses live reloading, and risks clobbering concurrent `userSettings`.

---

## 7. Cross-Agent Settings Migration (`migrate-agent-settings`)

When importing configurations from Claude Code (`~/.claude`), Codex (`~/.codex`), Cursor (`.cursor/rules`), or Gemini CLI (`~/.gemini/commands`):

1. **Target Destination**: Bundle all imported configurations into a single reversible plugin at `~/.gemini/config/plugins/<plugin-name>/`.
2. **Mapping Rules**:
   - **MCP Servers**: Map to `mcp_config.json`. Convert Claude/Codex/Cursor `url` to Antigravity's `url`. Make every `cwd` absolute. Declare any `${X}` placeholders in `variables`.
   - **Skills / Prompts**: Copy folders into `skills/<name>/SKILL.md`. Ensure strict 2-field frontmatter (`name`, `description`).
   - **Cursor Rules (`.mdc`)**: Map `alwaysApply: true` to `trigger: always_on`, non-empty `globs` to `trigger: glob`, and descriptions to `trigger: model_decision`.
   - **Claude Subagents**: Map to `agents/<name>.md`. Set `subagent: true`, `mainAgent: false`, and map tool names (`Bash` $\rightarrow$ `run_command`, `Read`/`Glob` $\rightarrow$ `read_file`, `Edit` $\rightarrow$ `edit_file`).
   - **Plugin Rules**: Consolidate persistent instructions into `rules/AGENTS.md` (`[PF-007]`).
