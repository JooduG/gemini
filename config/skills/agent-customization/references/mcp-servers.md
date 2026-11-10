# MCP Server Engineering & Antigravity Integration (`mcp-servers.md`)

> **Authority: Tier 3 Reference Guide**  
> *"Build MCP servers where tools are atomic, schemas are unambiguous, error messages are actionable, and integrations are thoroughly evaluated with read-only benchmarks."*

---

## 1. Antigravity MCP Architecture & Configuration (`mcp_config.json`)

Antigravity integrates Model Context Protocol (MCP) servers across two configuration scopes:
* **Global**: `~/.gemini/config/mcp_config.json`
* **Plugin**: `~/.gemini/config/plugins/<plugin-name>/mcp_config.json` (or workspace `.agents/plugins/<name>/mcp_config.json`)

### 1.1 Configuration Schema

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["C:/tools/github-mcp/build/index.js"],
      "cwd": "C:/tools/github-mcp",
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    },
    "jira-remote": {
      "url": "https://mcp.internal.net/jira",
      "headers": {
        "Authorization": "Bearer ${JIRA_API_KEY}"
      },
      "variables": [
        {
          "name": "JIRA_API_KEY",
          "title": "Jira API Key",
          "description": "Personal access token generated from Atlassian account"
        }
      ]
    }
  }
}
```

### 1.2 Non-Negotiable Engine Invariants

1. **Allowed Keys Only**:
   - Each server entry accepts strictly: `command`, `args`, `env`, `cwd`, `url`, `headers`, `disabled`, and `variables`.
   - Disallowed legacy keys (e.g., `type`, `timeout`, `trust`, `alwaysAllow`) are silently dropped.
2. **Absolute `cwd` Mandate (`[PF-011]`)**:
   - In plugin `mcp_config.json`, relative `cwd` paths resolve against the plugin root and do not undergo variable expansion. Always write fully resolved absolute paths.
3. **Plugin Variable Substitution (`variables`)**:
   - OS environment variables are not expanded automatically in plugins.
   - Any placeholder `${X}` in `command`, `args`, `env`, `url`, or `headers` must be declared in the server's `variables` array. If unconfigured, the plugin will load in a disabled state until the user provides the values on the plugin's configuration page.
4. **Transport Protocols & The SSE Deprecation Bridge**:
   - Supported transports: `stdio` (local subprocess) and Streamable HTTP (`url`).
   - Legacy SSE endpoints (`type: "sse"` or `/sse` URLs) are deprecated. Run them via the stdio bridge:
     ```json
     {
       "command": "npx",
       "args": ["-y", "mcp-remote", "https://example.com/sse"]
     }
     ```
5. **Secret Quarantine**:
   - Never commit raw API keys, bearer tokens, or high-entropy credentials into version-controlled `mcp_config.json` or plugin git repositories.

---

## 2. Eager vs. Lazy Tool Loading

To protect context windows from tool schema bloat, Antigravity supports both eager and lazy tool loading:
* **Eager Tools**: Registered natively as `mcp_<serverName>_<toolName>`. Only appropriate for lightweight, frequently called toolsets.
* **Lazy Tools**: Stored on disk in `<appDataDir>/mcp/<serverName>/<toolName>.json`. The agent inspects schemas on demand and executes them via `call_mcp_tool`.

---

## 3. Tool Design, Naming & Annotations

### 3.1 Naming Conventions

* **Server Name**:
  - Python: `{service}_mcp` (e.g., `sqlite_mcp`)
  - Node/TypeScript: `{service}-mcp-server` (e.g., `slack-mcp-server`)
* **Tool Name**:
  - Use `snake_case` with service prefix: `{service}_{action}_{resource}`
  - Good: `github_create_issue`, `slack_post_message`, `jira_search_tickets`
  - Bad: `create_issue`, `post`, `search` (collides with sibling MCP servers)

### 3.2 Tool Annotations

Always supply behavioral hints in tool definitions so models can plan safe execution sequences:

| Annotation | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `readOnlyHint` | boolean | `false` | `true` if tool only queries state without modifying data. |
| `destructiveHint` | boolean | `true` | `true` if tool mutates, overwrites, or deletes resources. |
| `idempotentHint` | boolean | `false` | `true` if repeating with identical arguments yields the same result. |
| `openWorldHint` | boolean | `true` | `true` if tool accesses external networks or third-party APIs. |

### 3.3 Pagination & Response Formats

* **Always Respect `limit`**: Default to 20–50 items. Never return unbounded data.
* **Return Pagination Metadata**: Return `has_more`, `next_offset` (or `next_cursor`), and `total_count`.
* **Dual Response Format Support**:
  - `response_format: "json"`: Raw structured objects for deterministic processing.
  - `response_format: "markdown"` (default): Human-readable summaries to preserve context.
* **Actionable Error Messages**: Include remediation steps in error strings (e.g., `"Error: User 'alice' not found. Use github_search_users to locate valid usernames."`).

---

## 4. Implementation Blueprints

### 4.1 TypeScript (`@modelcontextprotocol/sdk` + `zod`)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "ticket-mcp-server",
  version: "1.0.0"
});

server.tool(
  "ticket_get_issue",
  "Retrieve ticket details by ID. Use when inspecting bug status.",
  {
    issue_id: z.string().describe("Issue key, e.g. PROJ-1234"),
    response_format: z.enum(["json", "markdown"]).default("markdown")
  },
  async ({ issue_id, response_format }) => {
    // Note: NEVER write logs to stdout in stdio mode; use console.error for stderr!
    console.error(`[INFO] Fetching ticket ${issue_id}`);
    const issue = await fetchTicket(issue_id);
    
    if (response_format === "json") {
      return { content: [{ type: "text", text: JSON.stringify(issue) }] };
    }
    return {
      content: [{
        type: "text",
        text: `### [${issue.key}] ${issue.title}\n**Status**: ${issue.status}\n**Assignee**: ${issue.assignee}`
      }]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
```

### 4.2 Python (`FastMCP`)

```python
from mcp.server.fastmcp import FastMCP
from typing import Literal

mcp = FastMCP("ticket_mcp")

@mcp.tool()
def ticket_get_issue(issue_id: str, response_format: Literal["json", "markdown"] = "markdown") -> str:
    """Retrieve ticket details by ID. Use when inspecting bug status."""
    # Always log to stderr; stdout is reserved for JSON-RPC messages
    issue = fetch_ticket(issue_id)
    if response_format == "json":
        import json
        return json.dumps(issue)
    return f"### [{issue['key']}] {issue['title']}\n**Status**: {issue['status']}"

if __name__ == "__main__":
    mcp.run()
```

### 4.3 Testing with MCP Inspector

Test your server before deploying to Antigravity:
```bash
npx @modelcontextprotocol/inspector node build/index.js
```

---

## 5. The 10-Question Read-Only Evaluation Protocol

The quality of an MCP server is measured not by how many tools it exposes, but by whether an unassisted LLM can use those tools to solve realistic, difficult tasks.

### 5.1 Evaluation Requirements

Create an evaluation suite containing **10 QA pairs** that adhere to these invariants:
1. **Read-Only & Non-Destructive**: Every task must require zero write or delete operations.
2. **Mutually Independent**: No question may depend on the execution or outcome of another.
3. **Complex & Multi-Hop**: Requires multiple tool calls, pagination, or synthesizing data across endpoints.
4. **Stationary & Stable**: Answers must not drift over time (e.g., query closed milestones, historical quarters, or archived repositories).
5. **Verifiable via String Comparison**: Each answer must be a single human-readable value (e.g., username, date, count, project name).

### 5.2 Evaluation XML Schema

```xml
<evaluation>
  <qa_pair>
    <question>Find the pull request merged in January 2024 with the highest number of comments in the backend repository. What is the author's username?</question>
    <answer>johndoe</answer>
  </qa_pair>
  <qa_pair>
    <question>Among all bugs labeled 'critical' closed in Q1 2024, which project had the lowest average resolution time in days?</question>
    <answer>billing-core</answer>
  </qa_pair>
</evaluation>
```
