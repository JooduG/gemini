import { session } from "./scripts/perchance-tools.mjs";

async function diagnose() {
  await session.start({ name: "glitchofhand", headed: false });
  const ed = session.page;

  // 1. Check if AI Agent panel is open
  const panelVisible = await ed.evaluate(() => {
    const p = document.querySelector("#aiAgentPanelEl");
    return p ? { exists: true, display: window.getComputedStyle(p).display } : { exists: false };
  });
  console.log("Panel Visible:", panelVisible);

  // 2. Click textarea and type
  const textarea = ed.locator("#aiAgentInputEl");
  await textarea.click();
  await textarea.fill("Hello from automated agent test");
  console.log("Filled text:", await textarea.inputValue());

  // 3. Inspect Send button before click
  const btnState = await ed.evaluate(() => {
    const btn = document.querySelector("#aiAgentSendBtn");
    return btn ? {
      disabled: btn.disabled,
      onclick: !!btn.onclick,
      type: btn.type,
      text: btn.innerText
    } : null;
  });
  console.log("Btn State:", btnState);

  // 4. Click Send button
  const sendBtn = ed.locator("#aiAgentSendBtn");
  await sendBtn.click();
  console.log("Clicked Send button");

  // 5. Wait 3 seconds and check what changes in the panel
  await ed.waitForTimeout(3000);
  const afterClick = await ed.evaluate(() => {
    const p = document.querySelector("#aiAgentPanelEl");
    return {
      inputValue: document.querySelector("#aiAgentInputEl")?.value,
      messagesCount: p?.querySelectorAll(".chat-message, .message, [class*='message']").length,
      innerTextSnippet: p?.innerText.slice(0, 300)
    };
  });
  console.log("After Click State:", afterClick);

  await session.stop();
  process.exit(0);
}

diagnose().catch(e => { console.error(e); process.exit(1); });
