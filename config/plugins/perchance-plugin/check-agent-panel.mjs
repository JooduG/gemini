import { session } from "./scripts/perchance-tools.mjs";

async function check() {
  await session.start({ name: "glitchofhand", headed: false });
  const info = await session.eval({
    frame: "editor",
    js: `
      (() => {
        const p = document.querySelector("#aiAgentPanelEl");
        if (!p) return { found: false };
        return {
          found: true,
          style: p.style.cssText,
          inputs: Array.from(p.querySelectorAll("input, textarea, button")).map(el => ({
            tag: el.tagName,
            id: el.id,
            type: el.type,
            placeholder: el.placeholder,
            text: el.innerText || el.textContent || el.value
          }))
        };
      })()
    `
  });
  console.log("INFO:", JSON.stringify(info, null, 2));
  await session.stop();
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
