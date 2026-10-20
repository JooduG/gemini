import { session, DISPATCH } from "./scripts/perchance-tools.mjs";

async function run() {
  const elements = await DISPATCH.perchance_evaluate({
    frame: "editor",
    js: `
      (() => {
        const buttons = Array.from(document.querySelectorAll("button, a, div[onclick], span[onclick], input[type='button']")).map(b => ({
          tag: b.tagName,
          id: b.id,
          class: String(b.className),
          text: (b.innerText || b.textContent || b.value || "").trim().slice(0, 50)
        }));
        const textareas = Array.from(document.querySelectorAll("textarea, input[type='text']")).map(t => ({
          tag: t.tagName,
          id: t.id,
          placeholder: t.placeholder,
          class: String(t.className)
        }));
        return {
          buttons: buttons.filter(b => b.text.length > 0 && b.text.length < 40),
          textareas
        };
      })()
    `
  });
  console.log("RESULT:", JSON.stringify(elements, null, 2));
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
