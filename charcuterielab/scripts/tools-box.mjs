// "What you'll need" tools boxes (2 Nov 2026, Amazon audit). One small box per
// page, placed where the article already talks about the gear, so it reads as
// a shopping note, not an ad. Kitchen tools pay 4.5% on Amazon against 1% for
// food. Every link is an exact product (/dp/ASIN, checked on amazon.com on
// 2 Nov 2026: in stock, buy box live; prefer listings sold by Amazon or the brand); affiliate.mjs runs after this and adds the tag, rel=sponsored
// and the disclosure under the H1. Also links the "Board" spec tile on every
// board page to the board buying guide.
// Plan: claude/amazon-affiliate-audit-2026-11-02.md
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const amz = (asin) => `https://www.amazon.com/dp/${asin}`;

// name, why it's here, Amazon ASIN, optional [our guide url, label]
const T = {
  smallSet: ["RoyalHouse Bamboo Cheese Board and Knife Set", "A small board with knives in a slide-out drawer, right for 4 to 6.", "B08HFLNS6T", ["/blog/best-charcuterie-boards/", "All board picks"]],
  board: ["Picnic Time Artisan 18-inch Acacia Board", "Raw-edge acacia, the right size for 6 to 10 guests.", "B07HCYGVG2", ["/blog/amazon-charcuterie-board-sets-reviewed/", "How it compares"]],
  boardLarge: ["Picnic Time Artisan 24-inch Acacia Board", "Room for 12 to 15 guests, and light for its size.", "B06XRDD218", ["/blog/amazon-charcuterie-board-sets-reviewed/", "How it compares"]],
  boardStation: ["Picnic Time Artisan 24-inch Acacia Board", "Get one per station so every board holds the full spread.", "B06XRDD218", ["/blog/amazon-charcuterie-board-sets-reviewed/", "How it compares"]],
  knives: ["Boska Copenhagen Cheese Knife Set", "Three knives that cover soft, semi-hard and hard cheese.", "B07B5Q337D", ["/blog/best-cheese-knife-sets/", "All knife picks"]],
  plane: ["Wüsthof Gourmet Cheese Plane", "Thin, even slices of Gouda, Jarlsberg and Gruyère.", "B08XK14FNK", ["/blog/best-cheese-knife-sets/", "All knife picks"]],
  ramekins: ["DOWAN 4 oz Ramekins, set of 6", "Small bowls for honey, jam, mustard and olives.", "B081N5DSF4"],
  markers: ["Juvale Slate Cheese Labels", "Chalk labels so guests know what they're eating.", "B0922F73N1"],
  picks: ["Bamboo Knot Cocktail Picks, 200", "For olives, cubes and skewers; no sticky fingers.", "B08QCDZVCX"],
  trays: ["Charity Leaf Disposable Bamboo Trays, 14 × 10 in, 10 pack", "Several small stations instead of one giant board.", "B07YBSCRX5"],
  lidBoard: ["Farberware Build-a-Board with Locking Lid", "Build it in the compartments, lock the lid, carry it.", "B0CKBYP86C", ["/blog/amazon-charcuterie-board-sets-reviewed/", "All board sets"]],
  breadKnife: ["Mercer Millennia 10-inch Bread Knife", "A wavy edge cuts baguette without crushing it.", "B000PS1HS6"],
  adventBox: ["Wooden Advent Calendar with 24 Empty Drawers", "Fill it with cheese cubes, crackers and chocolate.", "B0D7CHXHHX"]
};

// Blog posts: slug → { before: text of the h2 the box goes in front of, items, title }
const POSTS = {
  "how-to-make-charcuterie-board": { before: "Step 2", items: ["board", "knives", "ramekins", "markers"] },
  "what-bread-for-charcuterie-board": { before: "Timing", items: ["breadKnife", "board"] },
  "how-to-cut-cheese-charcuterie-board": { before: "Cut cold", items: ["knives", "plane"] },
  "make-charcuterie-board-night-before": { before: "Keeping it fresh", items: ["lidBoard", "ramekins"] },
  "how-to-transport-charcuterie-board": { before: "Keeping it cold", items: ["lidBoard"] },
  "charcuterie-board-sizes": { before: "Shape", items: ["board", "boardLarge"] },
  "easy-charcuterie-board": { before: "Tips That Actually Matter", items: ["board", "knives", "ramekins"] },
  "charcuterie-board-beginners": { before: "Quantities for Beginners", items: ["board", "knives", "ramekins"] },
  "what-goes-on-charcuterie-board": { before: "Quick Board Formula", items: ["ramekins", "markers", "picks"] },
  "charcuterie-board-presentation": { before: "Color Distribution", items: ["ramekins", "markers"] },
  "charcuterie-board-for-large-group": { before: "Timing and Replenishment", items: ["trays", "picks", "markers"] },
  "grazing-table": { before: "The Charcuterie Lab Takeaway", items: ["trays", "markers", "picks"] },
  "charcuterie-skewers": { before: "How to build them", items: ["picks"] },
  "cheese-advent-calendars-2026": { before: "Finish with a board", items: ["adventBox"], title: "To build your own" }
};

// Party Planner: gear sized to the guest count, in front of the Timeline.
const partyItems = (n) => (n <= 6 ? ["smallSet", "ramekins"] : n <= 10 ? ["board", "knives", "ramekins"] : n <= 15 ? ["boardLarge", "knives", "ramekins"] : n <= 30 ? ["boardStation", "ramekins", "markers", "picks"] : ["trays", "markers", "picks"]);
const PARTY = [4, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function toolsBox(keys, title = "What you'll need") {
  const rows = keys.map((k) => {
    const [name, why, asin, guide] = T[k];
    return `<li><a class="tb-name" href="${amz(asin)}" target="_blank">${esc(name)}</a><span class="tb-why">${esc(why)}</span><span class="tb-links"><a href="${amz(asin)}" target="_blank">Check price on Amazon</a>${guide ? ` · <a href="${guide[0]}">${esc(guide[1])}</a>` : ""}</span></li>`;
  }).join("");
  return `<aside class="tools-box" aria-label="${esc(title)}"><p class="tb-title">${esc(title)}</p><ul>${rows}</ul></aside>\n`;
}

function insertBefore(html, headingText, box) {
  const re = new RegExp(`<h2\\b[^>]*>\\s*${headingText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  const m = re.exec(html);
  if (!m) return null;
  return html.slice(0, m.index) + box + html.slice(m.index);
}

export async function injectTools(dist) {
  let boxes = 0, tiles = 0;
  const missed = [];
  const put = async (rel, before, items, title) => {
    const f = join(dist, rel, "index.html");
    if (!existsSync(f)) return missed.push(rel + " (no page)");
    const html = await readFile(f, "utf8");
    if (html.includes('class="tools-box"')) return;
    const out = insertBefore(html, before, toolsBox(items, title));
    if (!out) return missed.push(`${rel} (no h2 "${before}")`);
    await writeFile(f, out);
    boxes++;
  };
  for (const [slug, p] of Object.entries(POSTS)) await put(join("blog", slug), p.before, p.items, p.title);
  for (const n of PARTY) await put(join("party-planner", `charcuterie-board-for-${n}-people`), "Timeline", partyItems(n));
  // Board pages: the "Board" spec tile links to the board buying guide.
  const { readdir } = await import("node:fs/promises");
  for (const e of await readdir(join(dist, "boards"), { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const f = join(dist, "boards", e.name, "index.html");
    if (!existsSync(f)) continue;
    const html = await readFile(f, "utf8");
    const out = html.replace(/<dt>Board<\/dt><dd>([^<]+)<\/dd>/, (_, v) => `<dt>Board</dt><dd><a href="/blog/best-charcuterie-boards/" title="Which board to buy">${v}</a></dd>`);
    if (out !== html) { await writeFile(f, out); tiles++; }
  }
  return { boxes, tiles, missed };
}
