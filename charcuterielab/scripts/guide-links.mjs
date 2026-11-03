// Ingredient page -> buying guide links (2 Nov 2026, Amazon audit item 6).
// Ingredient pages get search traffic but rarely pointed to the matching
// "best X" guide, so readers ready to buy never saw the picks. Each mapped
// ingredient page gets one line at the end of its "What to buy" section.
// Runs before affiliate.mjs. Plan: claude/amazon-affiliate-audit-2026-11-02.md
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Store roundups, gifts and gear guides are not "the best X" for one ingredient.
const SKIP = /(aldi|costco|trader-joes|kroger|wegmans|target|heb|lidl|sprouts|safeway|walmart|sams-club|publix|whole-foods|gift|charcuterie-boards|knife|cheese-of-the-month|wine-for|champagne|store-bought-christmas|charcuterie-brands|meats-charcuterie|cheese-charcuterie-board|butter-for)/;

// Hand checks on top of the name match: corrections and ingredients whose
// slug doesn't share a word with their guide. null = no guide link.
const MANUAL = {
  "almond-ricotta": null, "vegan-brie": "best-vegan-cheese", "vegan-cream-cheese": "best-vegan-cheese",
  "duck-prosciutto": null, "prawn-crackers": null, "graham-crackers": null, "chocolate-covered-pretzels": null,
  "cranberry-goat-cheese": "best-cranberry-cheese", "wensleydale-cranberry": "best-cranberry-cheese",
  "almond-flour-crackers": "best-gluten-free-crackers", "cassava-crackers": "best-gluten-free-crackers",
  "chickpea-crackers": "best-gluten-free-crackers", "flaxseed-crackers": "best-gluten-free-crackers",
  "danish-blue": "best-blue-cheese-brands", "maytag-blue": "best-blue-cheese-brands", "rogue-river-blue": "best-blue-cheese-brands",
  "coppa": "best-capicola-coppa", "parmigiano-reggiano": "best-parmesan-brands",
  "baby-swiss": "best-swiss-cheese", "emmental": "best-swiss-cheese", "chorizo": "best-spanish-chorizo",
  "membrillo": "best-quince-paste", "dried-apricots": "best-dried-fruit-for-charcuterie",
  "dried-cherries": "best-dried-fruit-for-charcuterie", "dried-cranberries": "best-dried-fruit-for-charcuterie",
  "dried-figs": "best-dried-fruit-for-charcuterie", "dried-mango": "best-dried-fruit-for-charcuterie",
  "marinated-artichokes": "best-marinated-artichoke-hearts", "tapenade": "best-olive-tapenade",
  "pate-de-campagne": "best-pate", "parmesan-crisps": "best-cheese-crisps", "cheddar-crisps": "best-cheese-crisps",
  "queso-fresco": null,
};

const variants = (k) => new Set([k, k.replace(/s$/, ""), `${k}s`]);

export async function injectGuideLinks(dist) {
  const blog = join(dist, "blog"), ingDir = join(dist, "ingredients");
  if (!existsSync(blog) || !existsSync(ingDir)) return { links: 0, mapped: 0 };
  const guides = (await readdir(blog)).filter((d) => d.startsWith("best-") && existsSync(join(blog, d, "index.html")));
  const keys = new Map();
  for (const g of guides) if (!SKIP.test(g)) keys.set(g.slice(5).replace(/-(brands|for-charcuterie|for-cheese|for-charcuterie-board)$/, ""), g);
  const title = {};
  let links = 0, mapped = 0;
  for (const s of await readdir(ingDir)) {
    const file = join(ingDir, s, "index.html");
    if (!existsSync(file)) continue;
    let g = null;
    if (s in MANUAL) g = MANUAL[s];
    else {
      let best = "";
      for (const [k, slug] of keys) {
        const V = variants(k);
        if ((V.has(s) || [...V].some((v) => s.endsWith(`-${v}`))) && k.length > best.length) { best = k; g = slug; }
      }
    }
    if (!g || !guides.includes(g)) continue;
    mapped++;
    if (!title[g]) {
      const h = await readFile(join(blog, g, "index.html"), "utf8");
      title[g] = (h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, g])[1].replace(/<[^>]+>/g, "").trim();
    }
    let html = await readFile(file, "utf8");
    const h2 = html.search(/<h2[^>]*>\s*What to buy/);
    if (h2 < 0) continue;
    const next = html.indexOf("<h2", h2 + 4);
    const end = next > 0 ? next : html.indexOf("</article>", h2);
    if (end < 0) continue;
    if (html.slice(h2, end).includes(`/blog/${g}/`)) continue; // already linked in that section
    const line = `<p class="ing-guide-link">Ready to buy? See our ranked picks: <a href="/blog/${g}/">${title[g]}</a>.</p>\n`;
    html = html.slice(0, end) + line + html.slice(end);
    await writeFile(file, html);
    links++;
  }
  return { links, mapped };
}
