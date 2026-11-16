// Printable Meat & Cheese Pairing Chart: the free email gift on food pairing
// guides, the Combination Lab and the pairing charts (15 Nov 2026).
// Everything comes from content/pairings/meat-cheese.json plus the proven pairs
// the build writes into /pairings/meat-and-cheese-chart/ (#mc-data), so the PDF
// always matches the page. Run a build first, then from charcuterielab:
//   PW_CHROME=/usr/bin/google-chrome node scripts/pairings-chart-printable.mjs
// Writes:
//   public/downloads/meat-and-cheese-pairing-chart.pdf   2 pages, US letter landscape
//   public/images/leads/meat-and-cheese-pairing-chart.png 480x621 cover for the email box (convert to webp)
import fs from "fs";
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const font = (f) => pathToFileURL(join(SITE, "public", "fonts", f)).href;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const mc = JSON.parse(fs.readFileSync(join(SITE, "content/pairings/meat-cheese.json"), "utf8"));
const built = fs.readFileSync(join(SITE, "dist/pairings/meat-and-cheese-chart/index.html"), "utf8");
const detail = JSON.parse(built.match(/<script type="application\/json" id="mc-data">([\s\S]*?)<\/script>/)[1]);
const WORD = ["Skip", "With a bridge", "Good", "Classic"];
const cell = (m, c) => mc.cells[m.id][c.id];
// drinks whose own pairings list foods from this meat family
const drinks = JSON.parse(fs.readFileSync(join(SITE, "content/pairings/drinks.json"), "utf8"));
const pours = (m) => [...drinks.wines, ...drinks.beers]
  .map((d) => ({ d, n: d.matches.filter((x) => m.foods.includes(x.s)).length }))
  .filter((x) => x.n).sort((a, b) => b.n - a.n).slice(0, 3).map((x) => x.d.name);

const BASE = `
@font-face { font-family: Lora; src: url(${font("lora-latin-700-normal.woff2")}); font-weight: 700; }
@font-face { font-family: Lora; src: url(${font("lora-latin-400-normal.woff2")}); font-weight: 400; }
@font-face { font-family: Sans; src: url(${font("source-sans-3-latin-400-normal.woff2")}); font-weight: 400; }
@font-face { font-family: Sans; src: url(${font("source-sans-3-latin-600-normal.woff2")}); font-weight: 600; }
@font-face { font-family: Sans; src: url(${font("source-sans-3-latin-700-normal.woff2")}); font-weight: 700; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Sans; color: #17130e; background: #f7f2e7; }
.s3 { background: #3f6b3a; color: #fff; } .s2 { background: #e2ecdd; color: #2f4a2a; }
.s1 { background: #fbecc9; color: #7a5410; } .s0 { background: #f3dfdb; color: #8a2c22; }
.chip { display: inline-block; font-weight: 700; font-size: 8.5px; letter-spacing: .04em; text-transform: uppercase; padding: 2px 6px; border-radius: 99px; }
`;

const legend = `<div class="legend">${[3, 2, 1, 0].map((n) => `<span><i class="chip s${n}">${WORD[n]}</i> ${["Skip it on the same cracker", "Add honey, jam or fruit to the bite", "A good match", "The classic match"][n]}</span>`).join("")}</div>`;

const page1 = `<section class="pg">
  <header><div><p class="kicker">Charcuterie Lab · Free printable</p><h1>Meat &amp; Cheese Pairing Chart</h1></div>
  <p class="how">Find your meat on the left, read across to a cheese. Each square says how well they pair and why.</p></header>
  ${legend}
  <table><thead><tr><th class="corner">Meat ↓ · Cheese →</th>${mc.cheeses.map((c) => `<th><b>${esc(c.name)}</b><span>${esc(c.short)}</span></th>`).join("")}</tr></thead>
  <tbody>${mc.meats.map((m) => `<tr><th><b>${esc(m.name)}</b><span>${esc(m.short)}</span></th>${mc.cheeses.map((c) => { const [n, why] = cell(m, c); return `<td class="t${n}"><i class="chip s${n}">${WORD[n]}</i><p>${esc(why)}</p></td>`; }).join("")}</tr>`).join("")}</tbody></table>
  <footer><span>The interactive chart, with the exact pairs behind every square: <b>charcuterielab.com/pairings/meat-and-cheese-chart</b></span><span>Page 1 of 2</span></footer>
</section>`;

const card = (m) => {
  const rows = [...mc.cheeses].sort((a, b) => cell(m, b)[0] - cell(m, a)[0]);
  const by = (n) => rows.filter((c) => cell(m, c)[0] === n);
  const proven = by(3).concat(by(2)).flatMap((c) => detail[`${m.id}|${c.id}`]?.p || []).slice(0, 4);
  const line = (n, label) => (by(n).length ? `<p class="row"><i class="chip s${n}">${label}</i> ${by(n).map((c) => esc(c.name)).join(" · ")}</p>` : "");
  return `<div class="card"><h3>${esc(m.name)}</h3><p class="inc">${esc(m.short)}</p><p class="line">${esc(m.line)}</p>
    ${line(3, "Classic")}${line(2, "Good")}${line(1, "Bridge")}${line(0, "Skip")}
    ${by(3).slice(0, 2).map((c) => `<p class="why"><b>${esc(c.name)}:</b> ${esc(cell(m, c)[1])}</p>`).join("")}
    ${pours(m).length ? `<p class="pour"><b>Pour:</b> ${pours(m).map(esc).join(" · ")}</p>` : ""}
    ${proven.length ? `<p class="try"><b>Try:</b> ${proven.map(esc).join(" · ")}</p>` : ""}</div>`;
};

const page2 = `<section class="pg">
  <header><div><p class="kicker">Charcuterie Lab · Free printable</p><h1>Pick your meat</h1></div>
  <p class="how">The best cheeses for each cured meat, from the classic match down to the one to skip, with pairs to try.</p></header>
  <div class="cards">${mc.meats.map(card).join("")}</div>
  <div class="rules">
    <div><b>1. Match the weight.</b> Delicate ham with gentle cheese; bold salami with firm, aged cheese.</div>
    <div><b>2. Contrast the texture.</b> Cool, creamy cheese against chewy, salty or spicy meat.</div>
    <div><b>3. Bridge the clash.</b> Two loud flavors? Put honey, fig jam or a slice of pear between them.</div>
  </div>
  <footer><span>A star ingredient and its pairings every Wednesday in the Lab Report · <b>charcuterielab.com/pairings</b></span><span>Page 2 of 2</span></footer>
</section>`;

const css = `${BASE}
@page { size: 11in 8.5in; margin: 0; }
.pg { width: 11in; height: 8.5in; padding: .42in .45in .36in; display: flex; flex-direction: column; gap: 9px; page-break-after: always; overflow: hidden; }
header { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; border-bottom: 2px solid #a9572b; padding-bottom: 7px; }
.kicker { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #a9572b; }
h1 { font-family: Lora; font-size: 30px; line-height: 1.05; color: #4a2512; }
.how { font-size: 11.5px; max-width: 4.3in; text-align: right; color: #4a3f36; }
.legend { display: flex; gap: 16px; font-size: 10px; color: #4a3f36; }
.legend span { display: flex; align-items: center; gap: 5px; }
table { width: 100%; border-collapse: separate; border-spacing: 3px; table-layout: fixed; flex: 1; }
th { text-align: left; vertical-align: bottom; padding: 3px 5px; }
thead th b, tbody th b { display: block; font-family: Lora; font-size: 11.5px; line-height: 1.15; color: #4a2512; }
th span { display: block; font-weight: 400; font-size: 9px; line-height: 1.2; color: #6b5d50; margin-top: 2px; }
th.corner { font-size: 9px; color: #6b5d50; width: 1.15in; }
tbody th { vertical-align: middle; background: #efe6d6; border-radius: 6px; }
td { vertical-align: top; padding: 5px 5px 4px; border-radius: 6px; background: #fff; border: 1px solid #e6dccb; }
td p { font-size: 8.4px; line-height: 1.28; margin-top: 3px; color: #2e2620; }
td.t3 { background: #eef4ea; border-color: #b9cfb2; } td.t0 { background: #fbf2f0; border-color: #ecd0ca; }
footer { display: flex; justify-content: space-between; font-size: 9.5px; color: #6b5d50; border-top: 1px solid #d9ccb6; padding-top: 5px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex: 1; }
.card { background: #fff; border: 1px solid #e6dccb; border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; }
.card h3 { font-family: Lora; font-size: 16px; color: #4a2512; }
.inc { font-size: 10px; color: #6b5d50; margin-top: -3px; }
.line { font-size: 10px; line-height: 1.35; color: #2e2620; margin-bottom: 2px; }
.row { font-size: 10px; line-height: 1.3; } .row .chip { margin-right: 3px; min-width: 52px; text-align: center; }
.try { font-size: 9.5px; line-height: 1.3; color: #4a3f36; margin-top: auto; padding-top: 4px; border-top: 1px dashed #e0d4c0; }
.why { font-size: 9.5px; line-height: 1.32; color: #2e2620; background: #f4f8f1; border-radius: 6px; padding: 4px 6px; }
.why b { color: #2f4a2a; }
.pour { font-size: 9.8px; color: #4a2512; }
.rules { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 10.5px; line-height: 1.35; }
.rules div { background: #efe6d6; border-radius: 8px; padding: 8px 10px; }
.rules b { color: #4a2512; }
`;

const coverCss = `${BASE}
body { width: 480px; height: 621px; background: #f7f2e7; padding: 34px 30px; display: flex; flex-direction: column; gap: 14px; }
.kicker { font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #a9572b; }
h1 { font-family: Lora; font-size: 40px; line-height: 1.04; color: #4a2512; }
.grid { display: grid; grid-template-columns: 70px repeat(7, 1fr); gap: 4px; flex: 1; align-content: start; }
.grid span { font-size: 10px; font-weight: 700; color: #4a2512; display: flex; align-items: center; line-height: 1.1; }
.grid i { border-radius: 5px; height: 46px; }
.grid em { font-style: normal; font-size: 9.5px; font-weight: 700; color: #6b5d50; text-align: center; }
.foot { font-size: 14px; color: #4a3f36; line-height: 1.35; }
`;
const cover = `<p class="kicker">Free printable</p><h1>Meat &amp; Cheese Pairing Chart</h1>
<div class="grid"><span></span>${["Fresh", "Soft", "Goat", "Mild", "Alpine", "Aged", "Blue"].map((t) => `<em>${t}</em>`).join("")}${mc.meats.map((m) => `<span>${esc(m.name.replace(/ & .*/, ""))}</span>${mc.cheeses.map((c) => `<i class="s${cell(m, c)[0]}"></i>`).join("")}`).join("")}</div>
<p class="foot">6 cured meats × 7 cheese families, with the reason for every square.</p>`;

const { chromium } = createRequire(import.meta.url)("playwright");
const browser = await chromium.launch(process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {});
const p = await browser.newPage();
await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${page1}${page2}</body></html>`, { waitUntil: "networkidle" });
const over = await p.evaluate(() => [...document.querySelectorAll(".pg")].map((s) => s.scrollHeight > s.clientHeight + 1));
if (over.some(Boolean)) console.warn("WARNING: content overflows a page", over);
await p.pdf({ path: join(SITE, "public/downloads/meat-and-cheese-pairing-chart.pdf"), width: "11in", height: "8.5in", printBackground: true });
if (process.env.PREVIEW) { await p.setViewportSize({ width: 1056, height: 816 }); await p.screenshot({ path: process.env.PREVIEW, fullPage: true }); }
const c = await browser.newPage({ viewport: { width: 480, height: 621 } });
await c.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${coverCss}</style></head><body>${cover}</body></html>`, { waitUntil: "networkidle" });
await c.screenshot({ path: join(SITE, "public/images/leads/meat-and-cheese-pairing-chart.png") });
await browser.close();
console.log("PDF and cover written (cover is a PNG; convert to webp)");
