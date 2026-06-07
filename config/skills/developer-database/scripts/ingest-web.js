import { developerDatabase } from "./developer-database.js";
import fs from "node:fs/promises";
import path from "node:path";
import "dotenv/config";

async function scrapeAndIngest(targetUrl) {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error("FIRECRAWL_API_KEY is not defined in the environment.");
  }

  console.log(`📡 Scraping URL via Firecrawl: ${targetUrl}...`);
  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: targetUrl,
      formats: ["markdown"]
    })
  });

  if (!response.ok) {
    throw new Error(`Firecrawl API failed [${response.status}]: ${await response.text()}`);
  }

  const result = await response.json();
  const markdown = result.data?.markdown;
  if (!markdown) {
    throw new Error("No markdown content returned from Firecrawl.");
  }

  // Generate a clean filename based on URL
  const cleanName = targetUrl.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "_") + ".md";
  const tempPath = path.join(process.cwd(), cleanName);

  console.log(`💾 Writing temporary file: ${tempPath}`);
  await fs.writeFile(tempPath, markdown, "utf-8");

  try {
    console.log(`🔮 Ingesting into Pinecone (knowledge-base.external)...`);
    // Run the ingestion from the current CWD using our existing database methods
    await developerDatabase.write_knowledge_base({
      paths: [cleanName],
      namespace: "knowledge-base.external",
      root: process.cwd()
    });
    console.log(`✨ Successfully ingested: ${targetUrl}`);
  } finally {
    // Cleanup
    await fs.unlink(tempPath).catch(() => {});
  }
}

// CLI entry point
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node ingest-web.js <url-to-scrape> [additional-urls...]");
  process.exit(1);
}

// Set a dummy process.argv[1] in case it is undefined in some execution environments
if (!process.argv[1]) {
  process.argv[1] = "ingest-web.js";
}

(async () => {
  for (const url of args) {
    try {
      await scrapeAndIngest(url.trim());
    } catch (err) {
      console.error(`❌ Failed to ingest ${url}: ${err.message}`);
    }
  }
})();
