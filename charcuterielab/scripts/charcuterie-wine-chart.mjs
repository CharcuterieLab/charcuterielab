// Charcuterie wine pairing chart image for /blog/wine-and-charcuterie-board/ (16 Nov 2026).
// The same grid as the post's "meat by meat" and "cheese by cheese" tables; edit both together.
// Run from charcuterielab:  PW_CHROME=/usr/bin/google-chrome node scripts/charcuterie-wine-chart.mjs
// Writes public/images/charcuterie-wine-pairing-chart.png (1200 wide).
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const font = (f) => pathToFileURL(join(SITE, "public", "fonts", f)).href;
const COLS = [
  ["Sparkling", "Champagne, Cava, Prosecco"],
  ["Crisp white", "Sauvignon Blanc, Albariño, Chablis"],
  ["Dry rosé", "Provence-style"],
  ["Light red", "Pinot Noir, Beaujolais"],
  ["Medium red", "Chianti, Barbera, Merlot"],
  ["Big red", "Cabernet, Malbec, Rioja"],
  ["Sherry, port & sweet", "Fino, port, Sauternes"]
];
// 2 = best, 1 = good, 0 = fine, -1 = skip
const ROWS = [
  ["Meat", "Prosciutto", [2, 1, 1, 1, 0, -1, 0]],
  ["Meat", "Jamón", [1, 1, 1, 0, 0, -1, 2]],
  ["Meat", "Mild salami (Genoa, finocchiona)", [1, 0, 1, 2, 2, 0, 0]],
  ["Meat", "Bold salami (soppressata)", [0, 0, 1, 1, 2, 1, 0]],
  ["Meat", "Spicy (chorizo, pepperoni, 'nduja)", [1, 1, 2, 1, 1, -1, 1]],
  ["Meat", "Coppa / capicola", [0, 0, 1, 1, 2, 1, 0]],
  ["Meat", "Bresaola", [0, 0, 1, 2, 1, 1, -1]],
  ["Meat", "Mortadella", [2, 0, 1, 1, 1, -1, 0]],
  ["Meat", "Pâté and rillettes", [1, 1, 0, 2, 1, 0, 1]],
  ["Meat", "Smoked salmon", [2, 2, 1, 0, -1, -1, -1]],
  ["Cheese", "Fresh and goat (burrata, chèvre)", [1, 2, 2, 0, -1, -1, 0]],
  ["Cheese", "Brie and soft (camembert, triple-crème)", [2, 1, 1, 1, 0, -1, 0]],
  ["Cheese", "Alpine (Gruyère, Comté)", [1, 2, 1, 2, 1, 0, 0]],
  ["Cheese", "Aged hard (cheddar, Manchego, Parmesan)", [1, 0, 0, 1, 2, 2, 1]],
  ["Cheese", "Blue (Stilton, Gorgonzola)", [0, -1, 0, -1, 0, 0, 2]]
];
const MARK = { 2: ["★", "best", "#3f6b3a", "#fff"], 1: ["●", "good", "#e2ecdd", "#2f4a2a"], 0: ["", "fine", "#fff", "#999"], "-1": ["✕", "skip", "#f3dfdb", "#8a2c22"] };

const css = `
@font-face { font-family: Lora; src: url(${font("lora-latin-700-normal.woff2")}); font-weight: 700; }
@font-face { font-family: Sans; src: url(${font("source-sans-3-latin-400-normal.woff2")}); font-weight: 400; }
@font-face { font-family: Sans; src: url(${font("source-sans-3-latin-700-normal.woff2")}); font-weight: 700; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: 1200px; font-family: Sans; background: #f7f2e7; color: #17130e; padding: 40px 44px 34px; }
.k { font-size: 15px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #a9572b; }
h1 { font-family: Lora; font-size: 44px; color: #4a2512; margin: 4px 0 6px; }
.sub { font-size: 18px; color: #4a3f36; margin-bottom: 18px; }
table { width: 100%; border-collapse: separate; border-spacing: 4px; table-layout: fixed; }
th { font-size: 15px; color: #4a2512; text-align: center; vertical-align: bottom; padding: 4px 2px; }
th small { display: block; font-weight: 400; font-size: 12px; color: #6b5d50; margin-top: 2px; line-height: 1.2; }
th.row { text-align: left; font-size: 16px; vertical-align: middle; background: #efe6d6; border-radius: 7px; padding: 8px 10px; }
th.row i { font-style: normal; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #a9572b; display: block; }
td { height: 46px; border-radius: 7px; text-align: center; font-size: 22px; font-weight: 700; border: 1px solid #e6dccb; }
tr.gap td, tr.gap th { height: 10px; background: none; border: 0; padding: 0; }
.legend { display: flex; gap: 22px; margin-top: 16px; font-size: 16px; color: #4a3f36; align-items: center; }
.legend b { display: inline-flex; width: 30px; height: 26px; border-radius: 6px; align-items: center; justify-content: center; margin-right: 6px; border: 1px solid #e6dccb; }
.foot { margin-top: 12px; font-size: 15px; color: #6b5d50; display: flex; justify-content: space-between; }
`;
let last = "";
const body = `<p class="k">Charcuterie Lab · pairing chart</p><h1>Charcuterie wine pairing chart</h1>
<p class="sub">Find what's on your board on the left, read across to the wine. One sparkling wine and one light red cover most boards.</p>
<table><colgroup><col style="width:300px">${COLS.map(() => "<col>").join("")}</colgroup><thead><tr><th></th>${COLS.map(([n, s]) => `<th>${n}<small>${s}</small></th>`).join("")}</tr></thead><tbody>
${ROWS.map(([g, n, v]) => { const gap = last && g !== last ? `<tr class="gap"><th></th>${COLS.map(() => "<td></td>").join("")}</tr>` : ""; last = g; return `${gap}<tr><th class="row"><i>${g}</i>${n}</th>${v.map((x) => { const [m, , bg, fg] = MARK[x]; return `<td style="background:${bg};color:${fg}">${m}</td>`; }).join("")}</tr>`; }).join("")}
</tbody></table>
<div class="legend">${[2, 1, -1].map((x) => { const [m, w, bg, fg] = MARK[x]; return `<span><b style="background:${bg};color:${fg}">${m}</b>${w}</span>`; }).join("")}<span><b style="background:#fff">&nbsp;</b>fine</span></div>
<p class="foot"><span>charcuterielab.com/blog/wine-and-charcuterie-board</span><span>Serve sparkling and whites cold, light reds slightly cool</span></p>`;

const { chromium } = createRequire(import.meta.url)("playwright");
const browser = await chromium.launch(process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {});
const p = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`, { waitUntil: "networkidle" });
await p.screenshot({ path: join(SITE, "public/images/charcuterie-wine-pairing-chart.png"), fullPage: true });
await browser.close();
console.log("chart written");
