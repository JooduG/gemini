import { session } from "./scripts/perchance-tools.mjs";

async function main() {
  console.log("Starting session on glitchofhand...");
  await session.start({ name: "glitchofhand", headed: false });

  console.log("Submitting prompt to native Perchance AI agent...");
  const result = await session.promptNativeAgent({
    prompt: "Add a comment at the top of the lists panel saying: // Hello from Antigravity Swarm",
    timeout: 90000
  });

  console.log("Result:", JSON.stringify(result, null, 2));
  await session.stop();
  process.exit(0);
}

main().catch(err => {
  console.error("Failure:", err);
  process.exit(1);
});
