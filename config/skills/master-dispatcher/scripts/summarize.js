import { spawn } from "child_process";
import fs from "fs";
import path from "path";

/**
 * 🎨 orchestration: DUAL-MODE SUMMARIZE WRAPPER
 * --------------------------------------------
 * Optimised handling for sequential or parallel process orchestration.
 */

export const runGroup = async (mode, scriptNames) => {
  const outputDir = path.join(process.cwd(), "tmp");
  const outputFile = path.join(outputDir, "audit_output.txt");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, "");
  const logStream = fs.createWriteStream(outputFile, { flags: "a" });

  const log = (msg) => {
    console.log(msg);
    logStream.write(msg + "\n");
  };

  const logRaw = (data) => {
    process.stdout.write(data);
    logStream.write(data);
  };

  log(
    "\n================================================================================",
  );
  log(`🎨  ORCHESTRATION: SUMMARIZE [ MODE: ${mode.toUpperCase()} ]`);
  log(`📦  TARGETS: ${scriptNames.join(" | ")}`);
  log(
    "================================================================================\n",
  );

  if (mode === "sequential") {
    for (const arg of scriptNames) {
      log(`🚀 Executing Sequentially: npm run ${arg}...\n`);
      try {
        await new Promise((resolve, reject) => {
          const child = spawn("npm", ["run", arg], { shell: true });

          child.stdout.on("data", (data) => logRaw(data));
          child.stderr.on("data", (data) => logRaw(data));

          child.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Exit code ${code}`));
          });
        });
        log(
          `\n✅ ${arg} complete.\n--------------------------------------------------------------------------------\n`,
        );
      } catch (err) {
        log(
          `\n❌ ${arg} failed. Fail-fast active: Halting execution pipeline.\n`,
        );
        logStream.end();
        process.exit(1);
      }
    }
  } else if (mode === "parallel") {
    log(`🚀 Launching Parallel Clusters simultaneously...\n`);

    const tasks = scriptNames.map((arg) => {
      return new Promise((resolve) => {
        const child = spawn("npm", ["run", arg], { shell: true });
        let buffer = `\n================================================================================\n`;
        buffer += `📦 AGGREGATED OUTPUT: npm run ${arg}\n`;
        buffer += `================================================================================\n`;
        let failed = false;

        child.stdout.on("data", (data) => {
          buffer += data.toString();
        });

        child.stderr.on("data", (data) => {
          buffer += `[STDERR] ${data.toString()}`;
          // The line setting failed = true has been removed to prevent false positives
        });

        child.on("close", (code) => {
          if (code !== 0) failed = true;
          buffer += `\n🏁 Status: ${failed ? "❌ FAILED" : "✅ PASSED"} (Code: ${code})\n`;
          resolve({ arg, buffer, failed });
        });
      });
    });

    const results = await Promise.all(tasks);
    let totalFailures = 0;

    // Dump aggregated buffers sequentially to keep the log file readable
    for (const res of results) {
      logRaw(res.buffer);
      if (res.failed) totalFailures++;
    }

    log(
      "\n================================================================================",
    );
    if (totalFailures > 0) {
      log(
        `❌ Parallel execution cycle complete with ${totalFailures} process failure(s).`,
      );
      logStream.end();
      process.exit(1);
    } else {
      log("✅ All parallel pipelines completed cleanly.");
    }
  }

  log(
    "================================================================================\n",
  );
  logStream.end();
};

if (process.argv[1] && process.argv[1].endsWith("summarize.js")) {
  const args = process.argv.slice(2);
  const modeIndex = args.findIndex((arg) => arg.startsWith("--mode="));
  let selectedMode = "sequential";
  let filteredScripts = args;

  if (modeIndex !== -1) {
    selectedMode = args[modeIndex].split("=")[1];
    filteredScripts = args.filter((_, idx) => idx !== modeIndex);
  }

  filteredScripts = filteredScripts.filter((arg) => !arg.startsWith("--"));

  if (filteredScripts.length > 0) {
    runGroup(selectedMode, filteredScripts).catch(() => process.exit(1));
  }
}
