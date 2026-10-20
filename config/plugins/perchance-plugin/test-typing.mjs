import { session } from "./scripts/perchance-tools.mjs";

async function testType() {
  await session.start({ name: "glitchofhand", headed: false });
  const ed = session.page;

  // Let's examine #aiAgentInputEl tag and events
  const inputInfo = await ed.evaluate(() => {
    const el = document.querySelector("#aiAgentInputEl");
    if (!el) return { found: false };
    return {
      found: true,
      tag: el.tagName,
      contentEditable: el.contentEditable,
      isTextarea: el instanceof HTMLTextAreaElement,
      id: el.id
    };
  });
  console.log("Input element info:", inputInfo);

  // Type using pressSequentially / native keyboard
  const el = ed.locator("#aiAgentInputEl");
  await el.click();
  await ed.keyboard.type("Add a comment at line 1: // Test from native prompt", { delay: 50 });
  
  const valAfterType = await ed.evaluate(() => {
    const t = document.querySelector("#aiAgentInputEl");
    return {
      value: t.value,
      innerText: t.innerText,
      textContent: t.textContent
    };
  });
  console.log("Value after keyboard typing:", valAfterType);

  // Click send button
  await ed.locator("#aiAgentSendBtn").click();
  console.log("Clicked send button after real typing");

  await ed.waitForTimeout(5000);
  const afterSend = await ed.evaluate(() => {
    const p = document.querySelector("#aiAgentPanelEl");
    return {
      val: document.querySelector("#aiAgentInputEl")?.value,
      innerText: p?.innerText.slice(0, 400)
    };
  });
  console.log("After Send Panel State:", afterSend);

  await session.stop();
  process.exit(0);
}

testType().catch(e => { console.error(e); process.exit(1); });
