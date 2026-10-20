import { session } from "./scripts/perchance-tools.mjs";

async function runHeadedTest() {
  console.log("Reusing headed session...");
  await session.start({ name: "glitchofhand", headed: true });

  console.log("Submitting prompt to native AI agent in visible window...");
  const res = await session.promptNativeAgent({
    prompt: "Add a new list item under hands: visible swarm test cyber-glove",
    timeout: 90000
  });

  console.log("Headed Prompt Finished:", JSON.stringify(res, null, 2));
  process.exit(0);
}

runHeadedTest().catch(e => { console.error(e); process.exit(1); });
