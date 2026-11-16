// Charts for /blog/charcuterie-pairing-data-study/ (16 Nov 2026).
// Reads the live pairing graph (pairs_with on every ingredient page, treated as two-way,
// the same graph the Pairings Hub uses) and writes two images:
//   public/images/pairing-study-most-versatile.png   top 25 ingredients by number of pairings
//   public/images/pairing-study-category-map.png     how often each pair of categories pairs
// Run from charcuterielab:  PW_CHROME=/usr/bin/google-chrome node scripts/pairing-study-charts.mjs
// Prints the numbers the post quotes, so the text can be checked against the data.
import fs from "fs";
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const ING = join(SITE, "..", "content", "ingredients");
const font = (f) => pathToFileURL(join(SITE, "public", "fonts", f)).href;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const items = {};
const G = {};
for (const f of fs.readdirSync(ING).filter((x) => x.endsWith(".md"))) {
  const s = fs.readFileSync(join(ING, f), "utf8");
  const slug = f.slice(0, -3);
  const g = (k) => (s.match(new RegExp(`^${k}:\\s*(.*)$`, "m")) || [])[1] || "";
  items[slug] = { title: g("title").replace(/^"|"$/g, ""), cat: g("category").replace(/^"|"$/g, "") };
  const pw = g("pairs_with");
  if (pw) for (const p of JSON.parse(pw)) { (G[slug] ||= new Set()).add(p); (G[p] ||= new Set()).add(slug); }
}
for (const k of Object.keys(G)) { if (!items[k]) { delete G[k]; continue; } G[k] = new Set([...G[k]].filter((p) => items[p])); }
const deg = Object.fromEntries(Object.keys(items).map((k) => [k, (G[k] || new Set()).size]));
const edges = Object.values(deg).reduce((a, b) => a + b, 0) / 2;
const ranked = Object.keys(deg).sort((a, b) => deg[b] - deg[a] || items[a].title.localeCompare(items[b].title));
const CATS = ["Cheese", "Cured Meat & Seafood", "Fruit", "Nuts & Seeds", "Spreads, Jams & Honey", "Crackers & Breads", "Pickles, Olives & Briny", "Finishing Touches"];
const SHORT = { "Cheese": "Cheese", "Cured Meat & Seafood": "Cured meat", "Fruit": "Fruit", "Nuts & Seeds": "Nuts", "Spreads, Jams & Honey": "Spreads & honey", "Crackers & Breads": "Crackers & bread", "Pickles, Olives & Briny": "Pickles & olives", "Finishing Touches": "Finishing touches" };
const COLOR = { "Cheese": "#d9a326", "Cured Meat & Seafood": "#a8442f", "Fruit": "#6f9a3c", "Nuts & Seeds": "#8a5a32", "Spreads, Jams & Honey": "#e08a1e", "Crackers & Breads": "#c9a97a", "Pickles, Olives & Briny": "#56704a", "Finishing Touches": "#7a7a8c" };

// category-pair density: pairings found / pairings possible
const n = Object.fromEntries(CATS.map((c) => [c, Object.keys(items).filter((k) => items[k].cat === c).length]));
const ec = {};
for (const a of Object.keys(G)) for (const b of G[a]) if (a < b) { const key = [items[a].cat, items[b].cat].sort().join("|"); ec[key] = (ec[key] || 0) + 1; }
const dens = (a, b) => { const key = [a, b].sort().join("|"); const possible = a === b ? (n[a] * (n[a] - 1)) / 2 : n[a] * n[b]; return possible ? (ec[key] || 0) / possible : 0; };
const N = Object.keys(items).length;
const overall = edges / ((N * (N - 1)) / 2);

console.log(JSON.stringify({ ingredients: N, pairings: edges, median: [...Object.values(deg)].sort((a, b) => a - b)[Math.floor(N / 2)], overallPct: +(overall * 100).toFixed(2),
  top10: ranked.slice(0, 10).map((k) => [items[k].title, deg[k]]),
  cheeseFruit: +(dens("Cheese", "Fruit") * 100).toFixed(1), cheeseMeat: +(dens("Cheese", "Cured Meat & Seafood") * 100).toFixed(1),
  meatPickles: +(dens("Cured Meat & Seafood", "Pickles, Olives & Briny") * 100).toFixed(1), fruitPickles: ec[["Fruit", "Pickles, Olives & Briny"].sort().join("|")] || 0 }, null, 0));

const BASE = `
@font-face { font-family: Lora; src: url(${font("lora-latin-700-normal.woff2")}); font-weight: 700; }
@font-face { font-family: Sans; src: url(${font("source-sans-3-latin-400-normal.woff2")}); font-weight: 400; }
@font-face { font-family: Sans; src: url(${font("source-sans-3-latin-700-normal.woff2")}); font-weight: 700; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1200px; font-family: Sans; background: #f7f2e7; color: #17130e; padding: 40px 44px 30px; }
.k { font-size: 15px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #a9572b; }
h1 { font-family: Lora; font-size: 42px; color: #4a2512; margin: 4px 0 6px; line-height: 1.1; }
.sub { font-size: 18px; color: #4a3f36; margin-bottom: 18px; }
.foot { margin-top: 14px; font-size: 15px; color: #6b5d50; display: flex; justify-content: space-between; }
`;

// 1. bar chart
const top = ranked.slice(0, 25);
const max = deg[top[0]];
const bars = `<p class="k">Charcuterie Lab · pairing data study</p><h1>The 25 most versatile things on a charcuterie board</h1>
<p class="sub">How many of our ${N} ingredients each one pairs well with. The typical ingredient pairs with ${[...Object.values(deg)].sort((a, b) => a - b)[Math.floor(N / 2)]}.</p>
<div class="bars">${top.map((k, i) => `<div class="row"><span class="n">${i + 1}</span><span class="t">${esc(items[k].title)}</span><span class="bar"><i style="width:${(deg[k] / max) * 100}%;background:${COLOR[items[k].cat]}"></i></span><b>${deg[k]}</b></div>`).join("")}</div>
<div class="legend">${CATS.filter((c) => top.some((k) => items[k].cat === c)).map((c) => `<span><i style="background:${COLOR[c]}"></i>${SHORT[c]}</span>`).join("")}</div>
<p class="foot"><span>Data: ${edges.toLocaleString("en-US")} pairings across ${N} ingredients, Nov 2026</span><span>charcuterielab.com/blog/charcuterie-pairing-data-study</span></p>`;
const barCss = `${BASE}
.row { display: grid; grid-template-columns: 34px 230px 1fr 52px; align-items: center; gap: 10px; height: 34px; }
.n { font-size: 15px; color: #6b5d50; text-align: right; }
.t { font-size: 18px; font-weight: 700; color: #2e2620; white-space: nowrap; }
.bar { height: 22px; background: #efe6d6; border-radius: 6px; overflow: hidden; }
.bar i { display: block; height: 100%; border-radius: 6px; }
b { font-size: 18px; color: #4a2512; }
.legend { display: flex; gap: 18px; margin-top: 14px; font-size: 16px; color: #4a3f36; flex-wrap: wrap; }
.legend i { display: inline-block; width: 16px; height: 16px; border-radius: 4px; margin-right: 6px; vertical-align: -2px; }
`;

// 2. category heat map
const shade = (v) => { const t = Math.min(v / 0.08, 1); return `rgba(63,107,58,${0.08 + t * 0.92})`; };
const heat = `<p class="k">Charcuterie Lab · pairing data study</p><h1>Which parts of a board pair best with each other</h1>
<p class="sub">The share of possible pairings between two groups that actually work. Average across the whole board: ${(overall * 100).toFixed(1)}%.</p>
<table><thead><tr><th></th>${CATS.map((c) => `<th>${SHORT[c]}</th>`).join("")}</tr></thead><tbody>
${CATS.map((a) => `<tr><th class="r">${SHORT[a]}</th>${CATS.map((b) => { if (a === b) return `<td class="same">—</td>`; const v = dens(a, b); return `<td style="background:${shade(v)};color:${v > 0.045 ? "#fff" : "#2e2620"}">${(v * 100).toFixed(1)}%</td>`; }).join("")}</tr>`).join("")}
</tbody></table>
<p class="foot"><span>Darker = pairs more often. Same-group squares are blank: those lists are mostly swaps.</span><span>charcuterielab.com</span></p>`;
const heatCss = `${BASE}
table { width: 100%; border-collapse: separate; border-spacing: 4px; table-layout: fixed; }
th { font-size: 14px; color: #4a2512; padding: 4px; text-align: center; vertical-align: bottom; line-height: 1.2; }
th.r { text-align: left; font-size: 15px; width: 150px; background: #efe6d6; border-radius: 6px; padding: 8px; vertical-align: middle; }
td.same { background: #ece6da !important; color: #9a8f82; font-weight: 400; }
td { height: 72px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: 700; }
`;

const { chromium } = createRequire(import.meta.url)("playwright");
const browser = await chromium.launch(process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {});
for (const [file, css, body] of [["pairing-study-most-versatile.png", barCss, bars], ["pairing-study-category-map.png", heatCss, heat]]) {
  const p = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`, { waitUntil: "networkidle" });
  await p.screenshot({ path: join(SITE, "public/images", file), fullPage: true });
}
await browser.close();
