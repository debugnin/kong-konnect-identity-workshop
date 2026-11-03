// Builds presentation/kong-konnect-identity-workshop.pptx
//   cd presentation/build && node build-deck.js
const pptxgen = require("pptxgenjs");
const path = require("path");
const { applyTheme } = require("/mnt/skills/public/pptx/scripts/apply_theme.js");
const { THEME, setup, mk } = require("./lib");

(async () => {
  const pres = new pptxgen();
  const C = setup(pres);
  const h = mk(pres, C);
  const parts = (process.env.PARTS || "1,2,3,4,5").split(",");
  for (const p of parts) {
    let mod; try { mod = require(`./slides-${p}.js`); } catch (e) { if (e.code === "MODULE_NOT_FOUND" && e.message.includes(`slides-${p}`)) continue; throw e; }
    mod(pres, h);
  }
  const out = path.resolve(__dirname, "..", "kong-konnect-identity-workshop.pptx");
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("wrote", out);
})().catch((e) => { console.error(e); process.exit(1); });
