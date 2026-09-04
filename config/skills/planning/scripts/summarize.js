/**
 * -------------------------------------------------------------------------------------------------
 * Antigravity Planning Script: Process Summarize & Execution Harness
 * -------------------------------------------------------------------------------------------------
 * Provides dual-mode (sequential or parallel) orchestration for test suites, audits,
 * and automated validation scripts. Logs aggregated diagnostic outputs to `tmp/audit_output.txt`.
 * -------------------------------------------------------------------------------------------------
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// =================================================================================================
// 1. Process Orchestrator
// =================================================================================================

/**
 * Runs a group of npm run targets in sequential or parallel mode, logging results to tmp/audit_output.txt.
 *
 * @param {"sequential" | "parallel"} execution_mode - Mode of process execution.
 * @param {string[]} script_names - Array of npm script identifiers to run.
 * @returns {Promise<void>}
 */
export async function execute_command_group(execution_mode, script_names) {
  const output_directory = path.join(process.cwd(), "tmp");
  const output_file_path = path.join(output_directory, "audit_output.txt");

  if (!fs.existsSync(output_directory)) {
    fs.mkdirSync(output_directory, { recursive: true });
  }

  fs.writeFileSync(output_file_path, "");
  const log_stream = fs.createWriteStream(output_file_path, { flags: "a" });

  const log_message = (message) => {
    console.log(message);
    log_stream.write(message + "\n");
  };

  const log_raw_data = (data) => {
    process.stdout.write(data);
    log_stream.write(data);
  };

  log_message("\n================================================================================");
  log_message(`🎨  ORCHESTRATION: SUMMARIZE [ MODE: ${execution_mode.toUpperCase()} ]`);
  log_message(`📦  TARGETS: ${script_names.join(" | ")}`);
  log_message("================================================================================\n");

  const summary_list = [];

  const print_summary_box = () => {
    log_message("\n" + "=".repeat(80));
    log_message(`🏁  EXECUTION SUMMARY [ MODE: ${execution_mode.toUpperCase()} ]`);
    log_message("=".repeat(80));
    summary_list.forEach((item) => {
      log_message(` ${item.status}  | npm run ${item.name}`);
    });
    log_message("=".repeat(80) + "\n");
  };

  if (execution_mode === "sequential") {
    for (const script_name of script_names) {
      log_message(`🚀 Executing Sequentially: npm run ${script_name}...\n`);
      try {
        await new Promise((resolve, reject) => {
          const child_process = spawn(`npm run ${script_name}`, { shell: true });

          child_process.stdout.on("data", (data) => log_raw_data(data));
          child_process.stderr.on("data", (data) => log_raw_data(data));

          child_process.on("close", (exit_code) => {
            if (exit_code === 0) {
              summary_list.push({ name: script_name, status: "✅ PASSED" });
              resolve();
            } else {
              summary_list.push({ name: script_name, status: "❌ FAILED" });
              reject(new Error(`Exit code ${exit_code}`));
            }
          });
        });
        log_message(`\n✅ ${script_name} complete.\n--------------------------------------------------------------------------------\n`);
      } catch {
        log_message(`\n❌ ${script_name} failed. Fail-fast active: Halting execution pipeline.\n`);
        print_summary_box();
        log_stream.end();
        process.exit(1);
      }
    }
    print_summary_box();
  } else if (execution_mode === "parallel") {
    log_message(`🚀 Launching Parallel Clusters simultaneously...\n`);

    const running_tasks = script_names.map((script_name) => {
      return new Promise((resolve) => {
        const child_process = spawn(`npm run ${script_name}`, { shell: true });
        let buffered_output = `\n================================================================================\n`;
        buffered_output += `📦 AGGREGATED OUTPUT: npm run ${script_name}\n`;
        buffered_output += `================================================================================\n`;
        let has_failed = false;

        child_process.stdout.on("data", (data) => {
          buffered_output += data.toString();
        });

        child_process.stderr.on("data", (data) => {
          buffered_output += `[STDERR] ${data.toString()}`;
        });

        child_process.on("close", (exit_code) => {
          if (exit_code !== 0) has_failed = true;
          buffered_output += `\n🏁 Status: ${has_failed ? "❌ FAILED" : "✅ PASSED"} (Code: ${exit_code})\n`;
          summary_list.push({
            name: script_name,
            status: has_failed ? "❌ FAILED" : "✅ PASSED",
          });
          resolve({ script_name, buffered_output, has_failed });
        });
      });
    });

    const results = await Promise.all(running_tasks);
    let total_failures = 0;

    for (const single_result of results) {
      log_raw_data(single_result.buffered_output);
      if (single_result.has_failed) total_failures++;
    }

    print_summary_box();

    if (total_failures > 0) {
      log_message(`❌ Parallel execution cycle complete with ${total_failures} process failure(s).`);
      log_stream.end();
      process.exit(1);
    } else {
      log_message("✅ All parallel pipelines completed cleanly.");
    }
  }

  log_stream.end();
}

// =================================================================================================
// 2. CLI Dispatcher
// =================================================================================================

if (process.argv[1] && process.argv[1].endsWith("summarize.js")) {
  const argument_list = process.argv.slice(2);
  const mode_parameter_index = argument_list.findIndex((argument) => argument.startsWith("--mode="));
  let selected_execution_mode = "sequential";
  let filtered_script_names = argument_list;

  if (mode_parameter_index !== -1) {
    selected_execution_mode = argument_list[mode_parameter_index].split("=")[1];
    filtered_script_names = argument_list.filter((_, index) => index !== mode_parameter_index);
  }

  filtered_script_names = filtered_script_names.filter((argument) => !argument.startsWith("--"));

  if (filtered_script_names.length > 0) {
    execute_command_group(selected_execution_mode, filtered_script_names).catch(() => process.exit(1));
  }
}

/**
 * -------------------------------------------------------------------------------------------------
 * CHANGELOG:
 * - 2026-09-05: Ground-up refactor under /deconstruct protocol: added Universal File Architecture
 *   header, structured domain sections, full nomenclature compliance (purged msg, arg, idx, res,
 *   err abbreviations), and standardized output streaming.
 * -------------------------------------------------------------------------------------------------
 */
