// Shareable chart image + printable Cured Meat Chart PDF for /blog/types-of-cured-meat/ (Nov 14, 2026).
// Adapted from scripts/types-of-cheese/printables.mjs.
// Everything comes from data.mjs, so the image and PDF always match the page.
// Needs Playwright (npm i playwright, then npx playwright install chromium). Run from charcuterielab:
//   node scripts/types-of-cured-meat/printables.mjs
// Writes:
//   public/images/types-of-cured-meat-chart.jpg   1000x1500 shareable chart (Pinterest 2:3)
//   public/downloads/meat-chart.pdf          3-page printable (US letter)
//   public/images/leads/meat-chart.webp      480x621 cover for the email signup box
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import { FAMILIES, MEATS, STRENGTH } from "./data.mjs";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const font = (f) => pathToFileURL(join(SITE, "public", "fonts", f)).href;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fam = Object.fromEntries(FAMILIES.map((f) => [f.key, f]));
const rows = MEATS.map(([id, name, f, animal, from, str, taste, pair, eat]) => ({ id, name, f, animal, from, str, taste, pair, eat }));

const TASTE = { cooked: "Mild, juicy, a little sweet", semidry: "Tangy, smoky, chewy", whole: "Silky, sweet-salty, nutty", salami: "Tangy, garlicky, often spiced", dried: "Chewy, concentrated, seasoned", fat: "Rich, melting, peppery", spread: "Rich, smooth or rustic", fish: "Briny, smoky, savory" };
const EX = { cooked: "Ham · Mortadella · Pastrami · Smoked turkey", semidry: "Summer sausage · Meat sticks · Landjäger", whole: "Prosciutto · Jamón · Coppa · Bresaola", salami: "Genoa · Soppressata · Chorizo · Pepperoni", dried: "Beef jerky · Biltong · Droëwors", fat: "Lardo · Pancetta · Guanciale · Bacon", spread: "Pâté · Rillettes · Liverwurst · 'Nduja", fish: "Smoked salmon · Anchovies · Sardines · Caviar" };
const LADDER = [["Ham", "Prosciutto cotto", "Prosciutto di Parma", "Jamón serrano", "Jamón ibérico"], ["Salami", "Genoa", "Finocchiona", "Soppressata", "Wild boar salami"], ["Spicy", "Pepperoni", "Chorizo", "Calabrese", "'Nduja"], ["Beef", "Bresaola", "Bündnerfleisch", "Biltong", "Pastirma"], ["Smoky", "Smoked turkey", "Black Forest ham", "Speck", "Cecina"], ["From the sea", "Smoked salmon", "Gravlax", "Anchovies", "Bottarga"]];
const range = (k) => { const s = rows.filter((r) => r.f === k).map((r) => r.str); return [Math.min(...s), Math.max(...s)]; };
// One value fills 1..n. A range (lo, hi) fills up to hi, with the dots below lo lighter.
const dots = (lo, hi) => { if (hi === undefined) { hi = lo; lo = 1; } return [1, 2, 3, 4, 5].map((i) => `<i class="${i <= hi ? (i >= lo ? "on" : "lo") : ""}"></i>`).join(""); };
const rangeWords = (lo, hi) => (lo === hi ? STRENGTH[lo] : `${STRENGTH[lo]} to ${STRENGTH[hi].toLowerCase()}`);

const BASE = `
@font-face { font-family: Lora; src: url(${font("lora-latin-700-normal.woff2")}); font-weight: 700; }
@font-face { font-family: Lora; src: url(${font("lora-latin-600-normal.woff2")}); font-weight: 600; }
@font-face { font-family: Lora; src: url(${font("lora-latin-400-normal.woff2")}); font-weight: 400; }
@font-face { font-family: Sans; src: url(${font("source-sans-3-latin-400-normal.woff2")}); font-weight: 400; }
@font-face { font-family: Sans; src: url(${font("source-sans-3-latin-600-normal.woff2")}); font-weight: 600; }
@font-face { font-family: Sans; src: url(${font("source-sans-3-latin-700-normal.woff2")}); font-weight: 700; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Sans; color: #17130e; background: #f7f2e7; }
.dots { display: inline-flex; gap: 3px; vertical-align: middle; }
.dots i { width: 9px; height: 9px; border-radius: 50%; background: #e0d6c3; }
.dots i.on { background: #a9572b; }
.dots i.lo { background: #e7c3a3; }
`;

// ---------------- shareable chart image ----------------
const line = ["cooked", "semidry", "whole", "salami", "dried"], extra = ["fat", "spread", "fish"];
const famRow = (k) => {
  const f = fam[k], [lo, hi] = range(k);
  return `<div class="row" style="--fc:${f.color}"><span class="n">${f.n}</span><div class="mid"><p class="name">${esc(f.long.replace(" (the stinky ones)", ""))}</p><p class="ex">${esc(EX[k])}</p><p class="meta">${esc(TASTE[k])}${{ cooked: " · cooked, not aged", spread: " · most are cooked", fish: " · cured for days to months", fat: " · pancetta & guanciale: cook first" }[k] || ` · aged ${esc(f.aged.replace(/ \(.*\)/, "").toLowerCase())}`}</p></div><div class="right"><span class="dots big">${dots(lo, hi)}</span><p class="taste">${rangeWords(lo, hi)}</p></div></div>`;
};
const chartHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
body { width: 1000px; height: 1500px; overflow: hidden; }
.head { height: 250px; padding: 44px 56px 0; background: #0a261a; color: #fff9eb; }
.brand { color: #caa652; font: 700 26px Lora; }
h1 { margin-top: 18px; font: 700 78px/1 Lora; }
.sub { margin-top: 14px; color: #e8dcb8; font: 400 27px Sans; }
.body { padding: 26px 56px 0; position: relative; }
.axis { display: flex; justify-content: space-between; margin: 0 0 10px 0; color: #5e5547; font: 700 17px Sans; letter-spacing: .06em; text-transform: uppercase; }
.row { display: grid; grid-template-columns: 62px 1fr 230px; gap: 18px; align-items: center; height: 118px; margin-bottom: 10px; padding: 0 22px; background: #fff; border-radius: 16px; border-left: 12px solid var(--fc); box-shadow: 0 4px 14px rgba(55,35,25,.08); }
.n { display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: var(--fc); color: #fff; font: 700 28px Sans; }
.name { font: 700 33px/1.1 Lora; color: #17130e; }
.ex { margin-top: 5px; font: 600 21px/1.25 Sans; color: #3a2f22; }
.meta { margin-top: 4px; font: 400 17px/1.2 Sans; color: #6b6151; }
.right { text-align: right; }
.dots.big { gap: 6px; } .dots.big i { width: 18px; height: 18px; }
.taste { margin-top: 8px; font: 600 18px/1.2 Sans; color: #5e5547; }
.divider { margin: 14px 0 12px; color: #8f6d2e; font: 700 18px Sans; letter-spacing: .06em; text-transform: uppercase; }
.foot { position: absolute; left: 0; right: 0; top: 1420px; height: 80px; display: flex; align-items: center; justify-content: space-between; padding: 0 56px; background: #0a261a; color: #e8dcb8; font: 600 22px Sans; }
.foot b { color: #caa652; font: 700 24px Lora; }
.legend { display: flex; align-items: center; gap: 10px; }
.legend .dots i { width: 12px; height: 12px; }
</style></head><body>
<div class="head"><p class="brand">Charcuterie Lab</p><h1>Types of Cured Meat</h1><p class="sub">The 8 families, from cooked and mild to dried and bold</p></div>
<div class="body">
<div class="axis"><span>↓ Cooked · moister · milder</span><span class="legend">Strength: mild <span class="dots">${dots(5)}</span> bold</span></div>
${line.map(famRow).join("")}
<p class="divider">Plus three more families</p>
${extra.map(famRow).join("")}
</div>
<div class="foot"><b>Charcuterie Lab</b><span>All 100 meats: charcuterielab.com/blog/types-of-cured-meat</span></div>
</body></html>`;

// ---------------- printable PDF ----------------
const pageHead = (title, sub, kicker = "FREE PRINTABLE", slim = false) => `<div class="ph${slim ? " slim" : ""}"><div class="ph-top"><span class="brand">Charcuterie Lab</span><span class="kick">${kicker}</span></div><h1>${title}</h1><p>${sub}</p></div>`;
const pageFoot = (n) => `<div class="pf"><span>charcuterielab.com/blog/types-of-cured-meat · Perishable food: no more than 2 hours out (1 hour above 90°F), per USDA guidance.</span><span>Page ${n} of 3</span></div>`;
const glance = FAMILIES.map((f) => { const [lo, hi] = range(f.key); return `<tr><td><span class="sw" style="background:${f.color}">${f.n}</span><b>${esc(f.long.replace(" (the stinky ones)", ""))}</b></td><td>${esc(TASTE[f.key])}</td><td>${esc(f.aged)}</td><td><span class="dots">${dots(lo, hi)}</span> <small class="rw">${rangeWords(lo, hi)}</small></td><td>${esc(EX[f.key])}</td></tr>`; }).join("");
const groups = FAMILIES.map((f) => ({ f, list: rows.filter((r) => r.f === f.key) }));
const tableFor = (gs) => `<table class="all"><thead><tr><th>Meat</th><th>Animal · from</th><th>Strength</th><th>Tastes like</th><th>Try with</th><th class="ck">Tried</th></tr></thead><tbody>${gs.map(({ f, list }) => `<tr class="gh"><td colspan="6" style="--fc:${f.color}"><span class="sw" style="background:${f.color}">${f.n}</span>${esc(f.long.replace(" (the stinky ones)", ""))} <small>${list.length} types</small></td></tr>${list.map((r) => `<tr><td><b>${esc(r.name)}</b>${r.eat === "cook" ? ' <small class="c1">cook first</small>' : ""}</td><td>${esc(r.animal.replace(/ \(.*\)/, ""))} · ${esc(r.from)}</td><td><span class="dots">${dots(r.str)}</span></td><td>${esc(r.taste)}</td><td>${esc(r.pair)}</td><td class="ck"><span class="box"></span></td></tr>`).join("")}`).join("")}</tbody></table>`;
const split = 3; // families 1-3 on page 2, the rest on page 3
const pdfHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}
@page { size: letter; margin: 0; }
body { background: #fff; }
.page { position: relative; width: 8.5in; height: 11in; overflow: hidden; page-break-after: always; }
.ph { background: #0a261a; color: #fff9eb; padding: 22px 42px 18px; }
.ph-top { display: flex; justify-content: space-between; align-items: center; }
.brand { color: #caa652; font: 700 15px Lora; } .kick { color: #caa652; font: 700 8.5px Sans; letter-spacing: .08em; }
.ph h1 { margin-top: 6px; font: 700 25px Lora; }
.ph.slim { padding: 14px 42px 10px; } .ph.slim h1 { margin-top: 3px; font-size: 19px; } .ph p { margin-top: 3px; color: #e8dcb8; font: 400 10px Sans; }
.pc { padding: 14px 42px 0; } .ph.slim + .pc { padding-top: 8px; }
h2 { margin: 12px 0 6px; color: #8f6d2e; font: 700 9px Sans; letter-spacing: .08em; text-transform: uppercase; border-bottom: 1.5px solid #caa652; padding-bottom: 3px; display: inline-block; }
p.note { font: 400 9.5px/1.4 Sans; color: #3a2f22; margin: 2px 0 6px; }
table { width: 100%; border-collapse: collapse; font-size: 9px; line-height: 1.25; }
th { text-align: left; font: 700 7.5px Sans; letter-spacing: .05em; text-transform: uppercase; color: #5e5547; padding: 3px 4px; border-bottom: 1px solid #cfc4ae; }
td { padding: 3.2px 4px; border-bottom: 0.5px solid #e5dccb; vertical-align: middle; }
.sw { display: inline-flex; align-items: center; justify-content: center; width: 13px; height: 13px; border-radius: 50%; color: #fff; font: 700 7.5px Sans; margin-right: 5px; vertical-align: middle; }
.glance td { padding: 5px 4px; font-size: 9.2px; }
.glance td:first-child { width: 165px; } .rw { display: block; color: #5e5547; font-size: 7.5px; margin-top: 1px; }
.legend { display: flex; gap: 16px; margin: 6px 0; font-size: 9px; color: #3a2f22; }
.legend span { display: inline-flex; gap: 5px; align-items: center; }
.ladder td { font-size: 9px; padding: 4px; } .ladder td:first-child { font-weight: 700; width: 105px; }
.ladder td.s1 { background: #f1ebdc; } .ladder td.s2 { background: #ead8b8; } .ladder td.s3 { background: #ddb98a; } .ladder td.s4 { background: #c88e5c; }
.tips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
.tip { background: #fbeedb; border-radius: 8px; padding: 8px 10px; font: 400 9px/1.4 Sans; }
.tip b { display: block; color: #0a261a; font: 700 9.5px Sans; margin-bottom: 2px; }
.all td { font-size: 8px; padding: 1.2px 4px; } .all th { font-size: 7px; }
.all { table-layout: fixed; } .all th:nth-child(1) { width: 22%; } .all th:nth-child(2) { width: 19%; } .all th:nth-child(3) { width: 9%; } .all th:nth-child(4) { width: 28%; } .all th:nth-child(5) { width: 18%; } .all th:nth-child(6) { width: 4%; }
.all td:nth-child(2) { color: #5e5547; } .all td { line-height: 1.15; }
.all .dots i { width: 6.5px; height: 6.5px; } .all .dots { gap: 2px; }
.gh td { background: #f7f2e7; font: 700 9.5px Lora; padding: 3px 4px; border-left: 4px solid var(--fc); }
.gh small { font: 400 7.5px Sans; color: #5e5547; margin-left: 4px; }
.c1 { color: #8a2f1b; font: 700 6.5px Sans; text-transform: uppercase; letter-spacing: .03em; }
.ck { text-align: center; } .box { display: inline-block; width: 8px; height: 8px; border: 0.9px solid #113a27; }
.pf { position: absolute; left: 0; right: 0; bottom: 0; height: 30px; display: flex; justify-content: space-between; align-items: center; padding: 0 42px; background: #fffcf4; color: #5e5547; font: 400 7.2px Sans; }
</style></head><body>
<div class="page">${pageHead("The Cured Meat Chart", "100 cured meats in 8 families: how each one tastes, how strong it is, what to serve with it and which ones to cook first.")}
<div class="pc">
<h2>The 8 families at a glance</h2>
<p class="note">All cured meat starts with salt. Then it is either cooked (deli meats) or dried, as a whole cut (prosciutto) or chopped into a sausage (salami). The drier and older it is, the stronger it tastes.</p>
<table class="glance"><thead><tr><th>Family</th><th>Tastes</th><th>Aged</th><th>Strength</th><th>Famous examples</th></tr></thead><tbody>${glance}</tbody></table>
<div class="legend"><b>Strength:</b>${[1, 2, 3, 4, 5].map((n) => `<span><span class="dots">${dots(n)}</span>${STRENGTH[n]}</span>`).join("")}</div>
<h2>If you like this, try that (easy to bold)</h2>
<table class="ladder"><tbody>${LADDER.map(([t, ...c]) => `<tr><td>${t}</td>${c.map((x, i) => `<td class="s${i + 1}">${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table>
<h2>Good to know</h2>
<div class="tips">
<div class="tip"><b>Building a board?</b>Pick one meat from three families: a whole-muscle meat (prosciutto), a salami (soppressata) and a spread (pâté). Plan 2 oz of meat per guest with a meal, 3 to 4 oz when the board is the meal.</div>
<div class="tip"><b>Serving</b>Take prosciutto and salami out of the fridge about 20 minutes early so the fat softens. Fold slices loosely so they don't stick. Peel salami casings first.</div>
<div class="tip"><b>Cook first</b>Pancetta, guanciale, bacon, lap cheong, sucuk, tasso and country ham are cured but meant to be cooked. The label will say "cook before eating".</div>
<div class="tip"><b>Pregnant?</b>The CDC advises heating deli meats to 165°F, or until steaming hot, if you are pregnant, 65 or older, or have a weakened immune system. Baked on a pizza is fine.</div>
</div>
</div>${pageFoot(1)}</div>
<div class="page">${pageHead("All 100 cured meats (1 of 2)", "Families 1–3: cooked cold cuts, semi-dry sausages and whole-muscle meats. Tick the ones you've tried.", "THE CURED MEAT CHART", true)}
<div class="pc">${tableFor(groups.slice(0, split))}</div>${pageFoot(2)}</div>
<div class="page">${pageHead("All 100 cured meats (2 of 2)", "Families 4–8: salami, jerky, cured fat, pâtés and spreads, and cured fish.", "THE CURED MEAT CHART", true)}
<div class="pc">${tableFor(groups.slice(split))}</div>${pageFoot(3)}</div>
</body></html>`;

import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)("playwright");
const browser = await chromium.launch(process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {});
const tmp = join(SITE, "scripts", "types-of-cured-meat");
// chart image
{
  const p = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
  fs.writeFileSync(join(tmp, "_chart.html"), chartHtml);
  await p.goto(pathToFileURL(join(tmp, "_chart.html")).href);
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: join(SITE, "public/images/types-of-cured-meat-chart.jpg"), type: "jpeg", quality: 88 });
  fs.unlinkSync(join(tmp, "_chart.html"));
}
// pdf + cover
{
  const p = await browser.newPage();
  fs.writeFileSync(join(tmp, "_pdf.html"), pdfHtml);
  await p.goto(pathToFileURL(join(tmp, "_pdf.html")).href);
  await p.evaluate(() => document.fonts.ready);
  const overflow = await p.evaluate(() => [...document.querySelectorAll(".page")].map((pg) => { const pc = pg.querySelector(".pc"); return pc.getBoundingClientRect().bottom > pg.getBoundingClientRect().bottom - 30; }));
  const ov = await p.evaluate(() => [...document.querySelectorAll(".page")].map((pg) => Math.round(pg.querySelector(".pc").getBoundingClientRect().bottom - pg.getBoundingClientRect().bottom + 30))); console.log("space left on each page (px, negative = overflow):", ov.map((x) => -x).join(", "));
  if (overflow.some(Boolean)) throw new Error(`page content runs into the footer: ${overflow}`);
  fs.mkdirSync(join(SITE, "public/downloads"), { recursive: true });
  await p.pdf({ path: join(SITE, "public/downloads/meat-chart.pdf"), format: "Letter", printBackground: true });
  const c = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 0.588 });
  await c.goto(pathToFileURL(join(tmp, "_pdf.html")).href);
  await c.evaluate(() => document.fonts.ready);
  fs.mkdirSync(join(SITE, "public/images/leads"), { recursive: true });
  await c.screenshot({ path: join(SITE, "public/images/leads/_cover.png"), clip: { x: 0, y: 0, width: 816, height: 1056 } });
  fs.unlinkSync(join(tmp, "_pdf.html"));
}
await browser.close();
console.log("chart image, PDF and cover written (cover is a PNG; convert to webp)");
