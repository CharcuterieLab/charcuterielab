// Dietary hub and diet pages (14 Nov 2026).
// Hub: one photo grid to pick a diet (replaces the 4-tile band, "Guides by diet"
// and "More diets"), and the quick-answer links join the Questions list.
// Diet pages: a board photo up top, a ready-made board for 8 checked against the
// site's own diet data, no quick answer that repeats a Question, compact board
// cards and a one-line swap table on phones (CSS in diet-up.css).
import { readFileSync } from "node:fs";
import { join } from "node:path";

const THUMB = (src) => "/images/thumbs/" + src.replace(/^\/images\//, "").replace(/\//g, "__").replace(/\.(\w+)$/, "-$1-m.webp");

const PICK = {
  "/dietary/gluten-free/": { img: "/images/50-boards-17-gluten-free.webp", line: "Safe cheeses, meats and crackers for a guest with celiac disease." },
  "/dietary/nut-free/": { img: "/images/50-boards-07-summer-backyard.webp", line: "What to remove, what to check, and the seeds that replace nuts." },
  "/dietary/vegetarian/": { img: "/images/vegetarian-charcuterie-board.webp", line: "Meat swaps that still look full, and the rennet check for cheese." },
  "/dietary/vegan/": { img: "/images/50-boards-16-vegan-plant-based.webp", line: "Plant cheeses, meat swaps, and the butter or honey hiding in crackers." },
  "/boards/keto-low-carb/": { img: "/images/50-boards-46-low-carb-keto.webp", line: "No crackers, more cheese and meat, net carbs per serving." },
  "/blog/pregnancy-safe-charcuterie-board/": { img: "/images/pregnancy-safe-charcuterie-board.jpg", line: "What to skip, and the safe swaps that taste just as good." },
  "/boards/kid-friendly-charcuterie-board/": { img: "/images/50-boards-15-kid-friendly.webp", line: "Mild cheeses and easy finger food, sized for a kids' party." },
  "/blog/dairy-free-charcuterie-board/": { img: "/images/dairy-free-charcuterie-board.webp", line: "Keep the meat, swap the cheese, check the crackers for butter." }
};

// Ready-made boards for 8 guests (appetizer amounts, about 2 oz cheese and 2 oz meat a person)
const BOARDS = {
  "gluten-free": { key: 0, title: "A gluten-free board for 8", items: [
    ["aged-cheddar", "6 oz"], ["brie", "one 8 oz wheel"], ["manchego", "4 oz"],
    ["prosciutto-di-parma", "4 oz"], ["coppa", "4 oz"],
    ["cassava-crackers", "1 box, labeled gluten-free"], ["rice-crackers", "1 box, labeled gluten-free"],
    ["grapes", "2 cups"], ["apples", "2, sliced"], ["marcona-almonds", "1 cup"],
    ["fig-jam", "½ cup"], ["castelvetrano-olives", "1 cup"], ["cornichons", "½ cup"]],
    tip: "Plate it first with clean knives, before any wheat crackers come out." },
  "nut-free": { key: 1, title: "A nut-free board for 8", items: [
    ["aged-cheddar", "6 oz"], ["brie", "one 8 oz wheel"], ["gouda", "4 oz"],
    ["prosciutto-di-parma", "4 oz"], ["genoa-salami", "4 oz"],
    ["water-crackers", "2 boxes"], ["grapes", "2 cups"], ["apples", "2, sliced"],
    ["pumpkin-seeds", "½ cup, from a nut-free facility"],
    ["fig-jam", "½ cup"], ["castelvetrano-olives", "1 cup"], ["cornichons", "½ cup"]],
    tip: "Skip pesto, mortadella and pink peppercorns, and keep any nut dish on another table." },
  "vegetarian": { key: 2, title: "A vegetarian board for 8", items: [
    ["aged-cheddar", "6 oz, vegetarian rennet"], ["brie", "one 8 oz wheel"], ["ricotta", "1 cup, whipped with honey"],
    ["marinated-mushrooms", "1 cup"], ["piquillo-peppers", "1 jar"], ["hummus", "1 cup"],
    ["water-crackers", "2 boxes"], ["grapes", "2 cups"], ["apples", "2, sliced"],
    ["marcona-almonds", "1 cup"], ["honey", "¼ cup"], ["castelvetrano-olives", "1 cup"]],
    tip: "Look for vegetarian, microbial or vegetable rennet on each cheese label." },
  "vegan": { key: 3, title: "A vegan & dairy-free board for 8", items: [
    ["vegan-brie", "one 6–8 oz wheel"], ["cashew-cheese", "6 oz"], ["hummus", "1 cup"],
    ["marinated-mushrooms", "1 cup"], ["piquillo-peppers", "1 jar"],
    ["water-crackers", "2 boxes, no butter or honey"], ["grapes", "2 cups"], ["apples", "2, sliced"],
    ["medjool-dates", "8"], ["fig-jam", "½ cup"], ["castelvetrano-olives", "1 cup"], ["pickled-red-onions", "½ cup"]],
    tip: "Plant cheeses are usually cashew-based: label them 'Contains nuts'." }
};
const TOP = {
  "/dietary/gluten-free/": "/images/50-boards-17-gluten-free.webp",
  "/dietary/nut-free/": "/images/50-boards-07-summer-backyard.webp",
  "/dietary/vegetarian/": "/images/vegetarian-charcuterie-board.webp",
  "/dietary/vegan/": "/images/50-boards-16-vegan-plant-based.webp"
};

let DATA = null, PAGES = null;
function load(dist) {
  if (DATA) return;
  try { DATA = JSON.parse(readFileSync(join(dist, "assets", "dietary-data.json"), "utf8")); } catch { DATA = { items: [] }; }
  DATA.by = Object.fromEntries(DATA.items.map((it) => [it[0], it]));
  PAGES = dist;
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const norm = (s) => s.replace(/<[^>]+>/g, "").replace(/&#x27;|&#39;|’/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().toLowerCase();

function hub(html) {
  let n = 0;
  // Collect the diet cards from "Guides by diet" and "More diets"
  const cards = [];
  for (const id of ["diets-h", "more-diets-h"]) {
    const re = new RegExp(`<section class="bl-section" aria-labelledby="${id}">[\\s\\S]*?<\\/section>\\s*`);
    const m = re.exec(html);
    if (!m) continue;
    for (const li of m[0].matchAll(/<li><a href="([^"]+)"[^>]*><strong>([\s\S]*?)<\/strong><span>[\s\S]*?<\/span><em>([\s\S]*?)<\/em><\/a><\/li>/g)) cards.push({ href: li[1], name: li[2], em: li[3] });
    html = html.replace(m[0], "");
    n++;
  }
  if (!cards.length) return { html, n: 0 };
  const grid = `<section class="dt-pick" aria-labelledby="dt-pick-h"><h2 id="dt-pick-h">Pick a diet</h2><ul class="dt-pick-grid">${cards.map((c) => {
    const p = PICK[c.href] || {};
    const img = p.img ? `<img src="${THUMB(p.img)}" alt="" width="640" height="427" loading="lazy" decoding="async">` : "";
    return `<li><a href="${c.href}">${img}<span class="dt-pick-t"><strong>${c.name}</strong><span>${p.line || ""}</span><em>${c.em}</em></span></a></li>`;
  }).join("")}</ul><p class="bl-note">Several diets at one party? Read <a href="/dietary/mixed-diets/">one board or two</a> first, or use the Diet Checker below.</p></section>`;
  // The grid takes the photo band's place, right under the intro
  const band = /<nav class="hub-band"[\s\S]*?<\/nav>\s*/.exec(html);
  if (band) html = html.replace(band[0], grid);
  else html = html.replace('<section class="dt-checker"', grid + '<section class="dt-checker"');
  // Quick answers join the Questions list
  html = html.replace(/<h3 class="dt-qs-h">Quick answers<\/h3>\s*<ul class="dt-qlist">/, '<ul class="dt-qlist dt-qlist-merged" aria-label="More questions">');
  return { html, n: n + 1 };
}

function boardBox(diet) {
  const b = BOARDS[diet];
  if (!b) return "";
  const lis = b.items.map(([slug, amt]) => {
    const it = DATA.by[slug];
    if (!it) return "";
    const v = it[3][b.key];
    if (v === 2) return ""; // never list something the data says to skip
    const name = esc(it[1]);
    const badge = v === 1 ? ' <span class="dt-badge dt-check" title="Check the label">check label</span>' : "";
    return `<li><span class="dt-rb-n"><a href="/ingredients/${slug}/">${name}</a>${badge}</span><span class="dt-rb-a">${esc(amt)}</span></li>`;
  }).join("");
  const d = diet === "vegan" ? "vegan" : diet;
  return `<section class="bl-section dt-ready" id="ready" aria-labelledby="ready-h"><h2 id="ready-h">${b.title}</h2><p class="bl-note">A shopping list that works as is. Every item is checked against the list below.</p><ul class="dt-rb">${lis}</ul><p class="dt-rb-tip"><strong>Tip:</strong> ${esc(b.tip)}</p><p class="dt-rb-go"><a class="button primary" href="/board-builder/?d=${d}&amp;g=8&amp;utm_source=charcuterielab&amp;utm_medium=site&amp;utm_campaign=diet_${diet}_ready">Make it for more guests &rarr;</a></p></section>`;
}

function dietPage(html, path) {
  let n = 0;
  const diet = path.split("/")[2];
  // Board photo under the H1 and jump links
  const top = TOP[path];
  if (top && !html.includes('class="dt-topimg"')) {
    const jump = /<nav class="dt-jump"[\s\S]*?<\/nav>/.exec(html);
    if (jump) { html = html.replace(jump[0], jump[0] + `<figure class="dt-topimg"><img src="${top}" srcset="${THUMB(top)} 640w, ${top} 1200w" sizes="(max-width: 860px) calc(100vw - 32px), 820px" alt="" decoding="async"></figure>`); n++; }
  }
  // Ready-made board after the intro, and a jump link to it
  const box = boardBox(diet);
  if (box && !html.includes('id="ready"')) {
    const intro = /<section class="bl-section dt-intro">[\s\S]*?<\/section>/.exec(html);
    if (intro) {
      html = html.replace(intro[0], intro[0] + box);
      html = html.replace(/(<nav class="dt-jump"[^>]*>)/, '$1<a href="#ready">Ready board</a>');
      n++;
    }
  }
  // The ingredient lists start closed on desktop too (phones already close them):
  // three open lists made these pages 23 screens long on a laptop
  if (html.includes('<details class="dt-cat" open>')) { html = html.split('<details class="dt-cat" open>').join('<details class="dt-cat">'); n++; }
  // Quick answers that repeat a Question below
  const faq = new Set([...html.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary>/g)].map((m) => norm(m[1])));
  html = html.replace(/<section class="bl-section" aria-labelledby="qs-h">[\s\S]*?<\/section>\s*/, (sec) => {
    const kept = sec.replace(/<li><a href="[^"]+">([\s\S]*?)<\/a>[\s\S]*?<\/li>/g, (li, q) => (faq.has(norm(q)) ? "" : li));
    n++;
    return /<li>/.test(kept) ? kept : "";
  });
  return { html, n };
}

export function upDiet(html, path, dist) {
  if (!path.startsWith("/dietary/")) return { html, n: 0 };
  load(dist);
  if (path === "/dietary/") return hub(html);
  if (/^\/dietary\/(gluten-free|nut-free|vegetarian|vegan)\/$/.test(path)) return dietPage(html, path);
  return { html, n: 0 };
}
