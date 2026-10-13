#!/usr/bin/env node

/**
 * @file config/skills/developer-database/scripts/developer-database.js
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 🔮 DEVELOPER DATABASE ENGINE — The Sovereign Memory & Relational Module
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * PURPOSE
 * Orchestrates the project's "Living Memory" (Pinecone Vector DB) and "Cold Storage"
 * (Supabase Relational DB) for developer-only telemetry and trace tracking.
 *
 * RESPONSIBILITIES
 * - Logic       : Semantic search (Vector) and decision archival (Relational).
 * - Persistence : Unified storage boundary for agentic memory.
 * - Integration : Acts as both an MCP Server and a standalone CLI.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config";
import ignore from "ignore";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

/**
 * Sovereign Developer Database Engine
 */
export class DeveloperDatabaseEngine {
  // --- PRIVATE CONFIG (#) ---
  #pinecone_config = {
    index_name: "knowledge-library",
    api_key: process.env.PINECONE_API_KEY,
    batch_size: 50,
    cached_host: null,
  };

  #supabase_config = {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  };

  /**
   * Initializes the engine.
   * Allows injecting configuration keys for advanced modular testability.
   *
   * @param {object} [config] Optional override configuration
   * @param {string} [config.pineconeKey] Pinecone API Key
   * @param {string} [config.supabaseUrl] Supabase Rest URL
   * @param {string} [config.supabaseKey] Supabase Anon/Service Key
   */
  constructor(config = {}) {
    if (config.pineconeKey) this.#pinecone_config.api_key = config.pineconeKey;
    if (config.supabaseUrl) this.#supabase_config.url = config.supabaseUrl;
    if (config.supabaseKey) this.#supabase_config.key = config.supabaseKey;
  }

  /**
   * Detects the active project name from path.
   */
  async #detect_project(rootPath) {
    try {
      const pkgPath = path.join(rootPath, "package.json");
      const pkgContent = await fs.readFile(pkgPath, "utf-8");
      const pkg = JSON.parse(pkgContent);
      if (pkg.name) {
        return pkg.name.trim().toLowerCase();
      }
    } catch {
      // Ignore and fallback
    }
    try {
      const gitConfigPath = path.join(rootPath, ".git", "config");
      const gitConfig = await fs.readFile(gitConfigPath, "utf-8");
      const remoteMatch = gitConfig.match(/url\s*=\s*.*github\.com[:/][^/]+\/(.+?)(\.git)?$/m);
      if (remoteMatch && remoteMatch[1]) {
        return remoteMatch[1].trim().toLowerCase();
      }
    } catch {
      // Ignore and fallback
    }
    try {
      return path.basename(rootPath).trim().toLowerCase();
    } catch {
      // Ignore
    }
    return null;
  }

  // --- CORE NETWORKING UTILITIES ---

  #last_supabase_keepalive_timestamp = 0;

  /**
   * Non-blocking keepalive ping to Supabase to prevent project dormancy.
   * Throttled to at most once every 10 minutes.
   */
  async #ping_supabase_keepalive() {
    const current_timestamp = Date.now();
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    if (current_timestamp - this.#last_supabase_keepalive_timestamp < TEN_MINUTES_MS) {
      return;
    }
    this.#last_supabase_keepalive_timestamp = current_timestamp;

    if (!this.#supabase_config.url || !this.#supabase_config.key) {
      return;
    }

    try {
      // Lightweight HEAD/GET limit 1 to record activity and keep database warm
      await this.#supabase_request("/rest/v1/development_logs?select=id&limit=1", {
        method: "GET",
      });
    } catch (error) {
      // Non-fatal background keepalive warning
      console.warn(`[DeveloperDatabase] Supabase keepalive ping failed: ${/** @type {Error} */ (error).message}`);
    }
  }

  /**
   * Performs a request to the Pinecone API.
   * Abstracts header generation and robust error handling.
   * Automatically triggers a non-blocking keepalive ping to Supabase.
   *
   * @param {string} endpoint API endpoint path (e.g. '/query') or absolute URL
   * @param {object} [options] Fetch options
   * @returns {Promise<any>} Parsed response data
   */
  async #pinecone_request(endpoint, options = {}) {
    // Non-blocking keepalive ping whenever Pinecone is accessed
    this.#ping_supabase_keepalive().catch(() => {});

    const host = await this.#get_pinecone_host();
    const isAbsolute = endpoint.startsWith("http");
    const targetUrl = isAbsolute ? endpoint : `https://${host}${endpoint}`;

    const headers = {
      "Api-Key": this.#pinecone_config.api_key || "",
      "Content-Type": "application/json",
      "X-Pinecone-API-Version": "2026-07",
      ...options.headers,
    };

    if (endpoint.includes("/embed")) {
      headers["X-Pinecone-API-Version"] = "2024-07";
    }

    const res = await fetch(targetUrl, { ...options, headers });
    if (!res.ok) {
      throw new Error(`Pinecone Request Failed [${res.status}]: ${await res.text()}`);
    }
    return res.json();
  }

  /**
   * Performs a request to the Supabase API.
   *
   * @param {string} endpoint API endpoint path (e.g. '/rest/v1/...')
   * @param {object} [options] Fetch options
   * @returns {Promise<any>} Parsed response data or raw response if requested
   */
  async #supabase_request(endpoint, options = {}) {
    const targetUrl = `${this.#supabase_config.url}${endpoint}`;
    const headers = {
      apikey: this.#supabase_config.key || "",
      Authorization: `Bearer ${this.#supabase_config.key}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const res = await fetch(targetUrl, { ...options, headers });
    if (!res.ok) {
      throw new Error(`Supabase Request Failed [${res.status}]: ${await res.text()}`);
    }

    if (options.headers?.Prefer?.includes("return=minimal")) {
      return { success: true };
    }
    return res.json();
  }

  // --- CORE ENGINE: PINECONE (VECTOR) ---

  /**
   * Resolves the primary Pinecone index host.
   *
   * @returns {Promise<string>} Target index host domain
   */
  async #get_pinecone_host() {
    if (this.#pinecone_config.cached_host) return this.#pinecone_config.cached_host;

    console.error("📡 Fetching Pinecone index host...");
    const res = await fetch("https://api.pinecone.io/indexes", {
      headers: { "Api-Key": this.#pinecone_config.api_key || "" },
    });

    if (!res.ok) {
      throw new Error(`Failed to list Pinecone indexes: ${res.statusText}`);
    }

    const data = /** @type {any} */ (await res.json());
    const index = data.indexes?.find(
      (/** @type {any} */ i) => i.name === this.#pinecone_config.index_name,
    );

    if (!index) throw new Error(`Pinecone Index '${this.#pinecone_config.index_name}' not found`);
    this.#pinecone_config.cached_host = index.host;
    return this.#pinecone_config.cached_host;
  }

  /**
   * Queries vector namespaces semantically with optional metadata filtering.
   *
   * @param {object} params
   * @param {string} params.query Semantically queried string
   * @param {string[]} [params.namespaces] Namespaces to look up
   * @param {number} [params.top_k] Number of returned items
   * @param {object} [params.filter] MongoDB-style metadata filter (e.g. { source: { $eq: "src/..." } })
   * @param {string} [params.project] Optional project filter
   */
  async query_knowledge_base({
    query,
    namespaces = null,
    top_k = 5,
    filter = null,
    project = null,
  }) {
    const resolvedProject = project || await this.#detect_project(process.cwd()) || "rpglitch";
    const defaultNamespaces = [resolvedProject, "global.docs"];
    const targetNamespaces = namespaces && namespaces.length > 0 ? namespaces : defaultNamespaces;

    // 1. Generate Query Embedding
    const embed_data = await this.#pinecone_request("https://api.pinecone.io/embed", {
      method: "POST",
      body: JSON.stringify({
        model: "multilingual-e5-large",
        parameters: { input_type: "query", truncate: "END" },
        inputs: [{ text: query }],
      }),
    });

    if (!embed_data.data?.[0]) throw new Error("Embedding failed");
    const vector = embed_data.data[0].values;

    // 2. Parallel Namespace Query with Metadata Filter Support
    const query_promises = targetNamespaces.map(async (ns) => {
      try {
        const query_body = {
          namespace: ns,
          vector,
          topK: top_k,
          includeMetadata: true,
        };
        if (filter && typeof filter === "object") {
          query_body.filter = filter;
        }

        const data = await this.#pinecone_request("/query", {
          method: "POST",
          body: JSON.stringify(query_body),
        });
        return { ns, matches: data.matches || [] };
      } catch (err) {
        const error = /** @type {Error} */ (err);
        console.warn(`⚠️ Namespace ${ns} query failed: ${error.message}`);
        return { ns, matches: [] };
      }
    });

    const results = await Promise.all(query_promises);

    // 3. Flatten and Sort
    return results
      .filter((res) => res?.matches)
      .flatMap((res) => res.matches.map((/** @type {any} */ m) => ({ ...m, namespace: res.ns })))
      .sort((a, b) => b.score - a.score)
      .slice(0, top_k * 2);
  }

  /**
   * Filters and normalizes relative directory path checking.
   *
   * @param {string} relPath Path relative to root
   * @param {any} gitignoreFilter Active .gitignore filter instance
   * @returns {boolean} True if the path should be ignored
   */
  #should_ignore(relPath, gitignoreFilter) {
    const normalized = relPath.replace(/\\/g, "/");
    return (
      gitignoreFilter.ignores(normalized) ||
      normalized.includes(".git/") ||
      normalized.includes("node_modules/")
    );
  }

  /**
   * Segments file text into structural chunks based on file type.
   *
   * @param {string} content File body contents
   * @param {string} ext Extension of file
   * @returns {string[]} Formatted segments
   */
  #chunk_content(content, ext) {
    const isMarkdown = ext.toLowerCase() === ".md";
    let segments = isMarkdown
      ? content.split(/^#+\s/gm).filter((s) => s.trim().length > 20)
      : content.split(/\n(?=\/\*\*|\/\/\s[A-Z]{3,})/).filter((s) => s.trim().length > 30);

    if (segments.length === 0 && content.trim().length > 0) {
      segments = [content];
    }

    const finalSegments = [];
    const MAX_CHUNK_SIZE = 8000;

    for (const seg of segments) {
      if (seg.length <= MAX_CHUNK_SIZE) {
        finalSegments.push(seg);
      } else {
        const lines = seg.split("\n");
        let currentChunk = [];
        let currentLen = 0;
        for (const line of lines) {
          if (currentLen + line.length + 1 > MAX_CHUNK_SIZE) {
            if (currentChunk.length > 0) {
              finalSegments.push(currentChunk.join("\n"));
            }
            currentChunk = [line];
            currentLen = line.length;
          } else {
            currentChunk.push(line);
            currentLen += line.length + 1;
          }
        }
        if (currentChunk.length > 0) {
          finalSegments.push(currentChunk.join("\n"));
        }
      }
    }

    return finalSegments;
  }

  /**
   * Ingests files/directories into the vector database.
   *
   * @param {object} params
   * @param {string[]} params.paths Target paths to index
   * @param {string} [params.namespace] Target namespace (defaults to active project, e.g. "rpglitch")
   * @param {string} [params.root] Workspace root directory
   * @param {string} [params.project] Optional project filter
   */
  async write_knowledge_base({ paths, namespace = null, root = process.cwd(), project = null }) {
    const resolvedProject = project || await this.#detect_project(root) || "rpglitch";
    const targetNamespace = namespace || resolvedProject;

    let gitignore_filter = ignore();
    try {
      const git_content = await fs.readFile(path.join(root, ".gitignore"), "utf-8");
      gitignore_filter.add(git_content);
    } catch {
      /* No .gitignore found */
    }

    const files = [];
    const walk = async (/** @type {string} */ dir) => {
      const items = await fs.readdir(dir);
      for (const item of items) {
        const full_path = path.join(dir, item);
        const rel_path = path.relative(root, full_path);

        if (this.#should_ignore(rel_path, gitignore_filter)) continue;

        // Skip test files from codebase indexing
        if (/\.(test|spec)\.(js|ts)$/i.test(item)) continue;

        const stat = await fs.stat(full_path);
        if (stat.isDirectory()) {
          await walk(full_path);
        } else if (/\.(md|txt|json|js|ts|svelte)$/i.test(item)) {
          files.push(full_path);
        }
      }
    };

    for (const p of paths) {
      const abs = path.resolve(root, p.trim());
      try {
        const stat = await fs.stat(abs);
        if (stat.isDirectory()) await walk(abs);
        else files.push(abs);
      } catch {
        console.warn(`⚠️ Skipping invalid path: ${p}`);
      }
    }

    console.error(`📑 Processing ${files.length} files for namespace: ${targetNamespace}`);

    /** @type {any[]} */
    const all_chunks = [];
    for (const file of files) {
      const content = await fs.readFile(file, "utf-8");
      const rel_path = path.relative(root, file).replace(/\\/g, "/");

      // Categorize chunk
      const is_doc = /\.md$/i.test(file);
      const category = is_doc ? "docs" : "src";

      // 1. Delete existing vectors for this file to ensure clean overwrite (zero ghost chunks)
      // Pinecone rate limits delete-by-metadata to 5 req/sec; throttle with 220ms delay and retry on 429
      let delete_attempts = 0;
      while (delete_attempts < 3) {
        try {
          await this.#pinecone_request("/vectors/delete", {
            method: "POST",
            body: JSON.stringify({ namespace: targetNamespace, filter: { source: { $eq: rel_path } } }),
          });
          await new Promise((resolve) => setTimeout(resolve, 220));
          break;
        } catch (err) {
          if (err.message.includes("Namespace not found")) {
            break;
          }
          if (err.message.includes("429") && delete_attempts < 2) {
            delete_attempts++;
            await new Promise((resolve) => setTimeout(resolve, 1000 * delete_attempts));
            continue;
          }
          throw err;
        }
      }

      // 2. Fragment file content and map metadata chunks
      const segments = this.#chunk_content(content, path.extname(file));
      segments.forEach((seg, i) => {
        const id = crypto
          .createHash("sha256")
          .update(targetNamespace + rel_path + i)
          .digest("hex");
        all_chunks.push({
          id,
          metadata: {
            content: seg.trim(),
            source: rel_path,
            category,
            chunk_index: i,
            indexed_at: new Date().toISOString(),
          },
        });
      });
    }

    // 3. Batch Upload Chunks (batch size 25 with TPM rate limit retry)
    const BATCH_SIZE = 25;
    for (let i = 0; i < all_chunks.length; i += BATCH_SIZE) {
      const batch = all_chunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((c) => c.metadata.content);

      let embed_data = null;
      let attempts = 0;
      while (attempts < 5) {
        try {
          embed_data = await this.#pinecone_request("https://api.pinecone.io/embed", {
            method: "POST",
            body: JSON.stringify({
              model: "multilingual-e5-large",
              parameters: { input_type: "passage", truncate: "END" },
              inputs: texts.map((t) => ({ text: t })),
            }),
          });
          break;
        } catch (err) {
          if (err.message.includes("429") && attempts < 4) {
            attempts++;
            const backoffSec = Math.pow(2, attempts) * 5;
            process.stderr.write(`\n⏳ TPM limit hit. Backing off for ${backoffSec}s (attempt ${attempts}/4)...\n`);
            await new Promise((r) => setTimeout(r, backoffSec * 1000));
            continue;
          }
          throw err;
        }
      }

      if (!embed_data?.data) throw new Error(`Embedding failed: ${JSON.stringify(embed_data)}`);

      const vectors = batch.map((record, idx) => ({
        id: record.id,
        values: embed_data.data[idx].values,
        metadata: record.metadata,
      }));

      await this.#pinecone_request("/vectors/upsert", {
        method: "POST",
        body: JSON.stringify({ namespace: targetNamespace, vectors }),
      });

      process.stderr.write(
        `\r✅ Uploaded chunk ${Math.min(i + BATCH_SIZE, all_chunks.length)}/${all_chunks.length}`,
      );
      // Brief pause between batches to avoid token-per-minute spikes
      await new Promise((r) => setTimeout(r, 600));
    }
    process.stderr.write("\n✨ Ingestion complete.\n");
  }

  /**
   * Shows stats for the active index namespaces.
   */
  async describe_index_stats() {
    return this.#pinecone_request("/describe_index_stats", { method: "POST" });
  }

  /**
   * Deletes vectors from a namespace.
   * Supports deleting by source, arbitrary filter, or deleting the entire namespace.
   *
   * @param {object} params
   * @param {string} params.namespace Target namespace to delete from
   * @param {string} [params.source] Specific file source path to delete
   * @param {object} [params.filter] MongoDB-style metadata filter
   * @param {boolean} [params.deleteAll] Whether to wipe the entire namespace
   */
  async delete_knowledge_base({ namespace, source = null, filter = null, deleteAll = false }) {
    if (!namespace) {
      throw new Error("Target namespace is required for deletion.");
    }

    const body = { namespace };
    if (deleteAll) {
      body.deleteAll = true;
    } else if (source) {
      body.filter = { source: { $eq: source } };
    } else if (filter && typeof filter === "object") {
      body.filter = filter;
    } else {
      throw new Error("Must specify 'source', 'filter', or 'deleteAll: true'.");
    }

    return this.#pinecone_request("/vectors/delete", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // --- CORE ENGINE: SUPABASE (COLD STORAGE) ---

  /**
   * Archives a development trace/log into Supabase Relational Cold Storage.
   *
   * @param {object} params
   * @param {string} params.session_id Session identifier
   * @param {string} params.task_slug Task identifier
   * @param {string} params.content Narrative log content
   * @param {object} [params.metadata] Supplementary metadata object
   * @param {string} [params.project] Optional project filter
   */
  async archive_log({ session_id, task_slug, content, metadata = {}, project = null }) {
    const resolvedProject = project || await this.#detect_project(process.cwd());
    const finalMetadata = { ...metadata };
    if (resolvedProject) {
      finalMetadata.project = resolvedProject;
    }

    return this.#supabase_request("/rest/v1/development_logs", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        session_id,
        task_slug,
        content,
        metadata: finalMetadata,
        created_at: new Date().toISOString(),
      }),
    });
  }

  /**
   * Queries relational development logs.
   *
   * @param {object} params
   * @param {string} [params.task_slug] Optional filter key
   * @param {number} [params.limit] Max items returned
   * @param {string} [params.project] Optional project filter
   */
  async query_logs({ task_slug, limit = 10, project = null }) {
    const resolvedProject = project || await this.#detect_project(process.cwd());
    let endpoint = `/rest/v1/development_logs?select=*&order=created_at.desc&limit=${limit}`;
    const params = [];
    if (task_slug) params.push(`task_slug=eq.${task_slug}`);
    if (resolvedProject) {
      params.push(`metadata->>project=eq.${resolvedProject}`);
    }
    if (params.length > 0) {
      endpoint += `&${params.join("&")}`;
    }
    return this.#supabase_request(endpoint, { method: "GET" });
  }

  // --- MCP SERVER INTEGRATION ---

  /**
   * Starts the Model Context Protocol stdio server.
   */
  async create_mcp_server() {
    const server = new Server(
      { name: "developer-database", version: "3.3.0" },
      { capabilities: { tools: {} } },
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "search",
          description: "Search living memory (Pinecone) semantically with optional metadata filtering.",
          inputSchema: {
            type: "object",
            properties: { 
              query: { type: "string", description: "Semantic search query string." },
              top_k: { type: "integer", description: "Number of top matches to return (default: 5)." },
              filter: { type: "object", description: "Optional MongoDB-style metadata filter (e.g. { category: { $eq: 'docs' } })." },
              project: { type: "string", description: "Optional project namespace override." }
            },
            required: ["query"],
          },
        },
        {
          name: "ingest",
          description: "Ingest local directory files recursively into living vector memory.",
          inputSchema: {
            type: "object",
            properties: {
              paths: { type: "array", items: { type: "string" }, description: "Array of paths to index." },
              namespace: { type: "string", description: "Optional target namespace (defaults to active project, e.g. 'rpglitch')." },
              project: { type: "string", description: "Optional project identifier." }
            },
            required: ["paths"],
          },
        },
        {
          name: "status",
          description: "Inspect living vector index allocation, namespaces, and dimensions.",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "prune",
          description: "Prune vectors from a namespace by file source, metadata filter, or wipe entire namespace.",
          inputSchema: {
            type: "object",
            properties: {
              namespace: { type: "string", description: "Target namespace to prune from." },
              source: { type: "string", description: "Optional specific file source path to prune." },
              filter: { type: "object", description: "Optional MongoDB-style metadata filter." },
              deleteAll: { type: "boolean", description: "Set true to wipe the entire namespace." }
            },
            required: ["namespace"],
          },
        },
        {
          name: "archive",
          description: "Record completed mission post-mortem or retrospective into relational cold storage (Supabase).",
          inputSchema: {
            type: "object",
            properties: {
              session_id: { type: "string" },
              task_slug: { type: "string" },
              content: { type: "string" },
              metadata: { type: "object" },
              project: { type: "string", description: "Optional project identifier." }
            },
            required: ["session_id", "task_slug", "content"],
          },
        },
        {
          name: "search_archive",
          description: "Search and retrieve historical mission logs from relational cold storage (Supabase).",
          inputSchema: {
            type: "object",
            properties: { 
              task_slug: { type: "string" }, 
              limit: { type: "number" },
              project: { type: "string", description: "Optional project identifier." }
            },
          },
        },
      ],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        switch (name) {
          case "search": {
            const matches = await this.query_knowledge_base(/** @type {any} */ (args));
            const text = matches
              .map(
                (m) =>
                  `### [Score: ${(m.score * 100).toFixed(1)}% | Namespace: ${m.namespace} | Category: ${m.metadata.category || "n/a"} | Source: ${m.metadata.source}${m.metadata.chunk_index !== undefined ? ` (chunk ${m.metadata.chunk_index})` : ""}]\n\n${m.metadata.content}`,
              )
              .join("\n\n---\n\n");
            return { content: [{ type: "text", text: text || "No documentation found." }] };
          }
          case "ingest":
            await this.write_knowledge_base(/** @type {any} */ (args));
            return { content: [{ type: "text", text: "Living memory updated." }] };
          case "status":
            return {
              content: [
                { type: "text", text: JSON.stringify(await this.describe_index_stats(), null, 2) },
              ],
            };
          case "prune":
            await this.delete_knowledge_base(/** @type {any} */ (args));
            return { content: [{ type: "text", text: "Vector(s) pruned." }] };
          case "archive":
            await this.archive_log(/** @type {any} */ (args));
            return { content: [{ type: "text", text: "Mission archived." }] };
          case "search_archive": {
            const logs = /** @type {any[]} */ (await this.query_logs(/** @type {any} */ (args)));
            const text = logs
              .map((l) => `[${l.created_at}] ${l.task_slug}: ${l.content}`)
              .join("\n---\n");
            return { content: [{ type: "text", text: text || "No logs found." }] };
          }
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (err) {
        const error = /** @type {Error} */ (err);
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🟢 Developer Database MCP Server v3.3.0 running on stdio");
  }

  // --- CLI BOOTSTRAP ---

  /**
   * Standalone CLI Entry Point
   *
   * @param {string[]} args CommandLine arguments
   */
  static async bootstrap(args) {
    const engine = new DeveloperDatabaseEngine();
    if (args.length === 0) {
      return await engine.create_mcp_server();
    }

    const command = args[0];
    console.error(`🔮 Developer Database CLI: Executing ${command}...`);
    switch (command) {
      case "upsert":
        await engine.write_knowledge_base({
          paths: [".agents/rules", ".agents/skills", "src/core"],
          namespace: "knowledge-base.meta",
        });
        break;
      case "upsert-all": {
        const home_dir = (await import("node:os")).homedir();
        const projects = [
          {
            name: "joodug-rpglitch",
            path: path.join(home_dir, "source/repos/RPGlitch"),
            paths: [".agents/skills", "tasks"],
            namespace: "knowledge-base.meta",
            project: "joodug-rpglitch"
          },
          {
            name: "joodug-imageglitch",
            path: path.join(home_dir, "source/repos/ImageGlitch"),
            paths: ["tasks", "src"],
            namespace: "knowledge-base.meta",
            project: "joodug-imageglitch"
          },
          {
            name: "global-config",
            path: path.join(home_dir, ".gemini"),
            paths: ["config/skills"],
            namespace: "knowledge-base.external",
            project: null
          }
        ];
        for (const proj of projects) {
          console.error(`\n🔮 Ingesting '${proj.name}' at: ${proj.path}...`);
          try {
            await fs.access(proj.path);
            await engine.write_knowledge_base({
              paths: proj.paths,
              namespace: proj.namespace,
              root: proj.path,
              project: proj.project
            });
          } catch (err) {
            console.error(`⚠️ Skipping ${proj.name}: ${err.message}`);
          }
        }
        break;
      }
      case "select": {
        const query = args[1] || "";
        const results = await engine.query_knowledge_base({ query });
        console.log(JSON.stringify(results, null, 2));
        break;
      }
      case "archive": {
        const content = await fs.readFile(args[1], "utf-8");
        await engine.archive_log({
          session_id: "manual-cli-archive",
          task_slug: "historical-cleanup",
          content,
        });
        break;
      }
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  }
}

if (process.argv[1] && import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  DeveloperDatabaseEngine.bootstrap(process.argv.slice(2)).catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
  });
}

export const developerDatabase = new DeveloperDatabaseEngine();
