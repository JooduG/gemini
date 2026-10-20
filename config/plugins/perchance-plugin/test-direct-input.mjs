import { session } from "./scripts/perchance-tools.mjs";

async function inspectTextarea() {
  await session.start({ name: "glitchofhand", headed: false });
  const ed = session.page;

  const res = await ed.evaluate(() => {
    const el = document.querySelector("#aiAgentInputEl");
    if (!el) return { error: "not found" };
    
    // Set value and trigger input & change events
    el.value = "Add a test comment";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));

    const afterDirect = el.value;

    // Check if there's an attached framework property or CodeMirror/Monaco editor wrapping it
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);

    return {
      afterDirect,
      disabled: el.disabled,
      readOnly: el.readOnly,
      visibility: style.visibility,
      pointerEvents: style.pointerEvents,
      rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
      hasOnInput: !!el.oninput
    };
  });
  console.log("Direct JS Evaluation:", res);

  // Now click send
  await ed.evaluate(() => {
    const btn = document.querySelector("#aiAgentSendBtn");
    btn.click();
  });
  console.log("Triggered btn.click() via DOM");

  await ed.waitForTimeout(4000);
  const resultState = await ed.evaluate(() => {
    const p = document.querySelector("#aiAgentPanelEl");
    return {
      text: p.innerText.slice(0, 500)
    };
  });
  console.log("Result State:", resultState);

  await session.stop();
  process.exit(0);
}

inspectTextarea().catch(e => { console.error(e); process.exit(1); });
