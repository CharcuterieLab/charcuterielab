// Page-two pushes (10 Nov 2026, SEO review round 1, item 3).
// 36 pages sat at average positions 10-20 with 100+ impressions in the 28 days
// to Nov 8, plus the holiday pages heading into their season. Internal links in
// the body text count for more than nav and footer links, so this pass links
// the first plain-text mention of each target's name in other pages' body
// copy, with the name itself as the link text.
//
// Rules: only <p> and <li> with no attributes (body copy, not cards, menus,
// tables or headings), never inside an existing link, never on the target page
// itself or on a page that already links the target in its body copy. Sources
// are tried most-visited first (POPULAR, from Search Console) and then by how
// often they mention the name. At most PER_TARGET new links per target and
// PER_PAGE per source page.
// Plan and list: claude/ctr-onepage-pushes-2026-11-10.md in the project.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const PER_TARGET = 8;
const PER_PAGE = 2;

// [target URL, phrases to match (first that appears in a paragraph wins), cap]
// The cap defaults to PER_TARGET. The Q4 holidays get a bigger one for their
// season (13 Nov 2026): they are the pages with a deadline, and the site has
// 62 pages mentioning Christmas, 30 Thanksgiving and 22 New Year's Eve, so 8
// was leaving most of the relevant copy unlinked. Super Bowl is February, so
// it stays at the default until the new year.
const TARGETS = [
  // Holiday pages, before their season
  ["/holidays/thanksgiving/", ["Thanksgiving charcuterie board", "Thanksgiving board", "Thanksgiving"], 16],
  ["/holidays/christmas/", ["Christmas charcuterie board", "Christmas board", "Christmas"], 16],
  ["/holidays/new-years-eve/", ["New Year's Eve charcuterie board", "New Year's Eve board", "New Year's Eve"], 16],
  // Hanukkah is 4 Dec and ranks 6.1, but it was not a target at all and only
  // one page on the whole site mentions it. Links alone cannot fix that.
  ["/holidays/hanukkah/", ["Hanukkah charcuterie board", "Hanukkah board", "Hanukkah"], 12],
  ["/holidays/super-bowl/", ["Super Bowl charcuterie board", "Super Bowl board", "Super Bowl"]],
  // Best Buys guides at positions 10-20
  ["/blog/best-meat-sticks/", ["meat sticks", "beef sticks", "meat stick"]],
  ["/blog/best-salsa/", ["salsa"]],
  ["/blog/best-crackers-for-charcuterie/", ["crackers for charcuterie", "best crackers", "crackers"]],
  ["/blog/best-gluten-free-crackers/", ["gluten-free crackers"]],
  ["/blog/best-hot-cocoa-mix/", ["hot cocoa mix", "hot chocolate mix", "hot cocoa"]],
  ["/blog/best-meats-charcuterie-board/", ["charcuterie meats", "best meats", "cured meats"]],
  ["/blog/best-dark-chocolate/", ["dark chocolate"]],
  ["/blog/best-shortbread/", ["shortbread"]],
  ["/blog/best-cheese-knife-sets/", ["cheese knife set", "cheese knives", "cheese knife"]],
  ["/blog/best-butter-for-butter-board/", ["European butter", "cultured butter", "salted butter"]],
  ["/blog/best-cranberry-sauce/", ["cranberry sauce"]],
  ["/blog/best-champagne-under-30/", ["Champagne"]],
  ["/blog/best-honey-for-cheese/", ["honey for cheese", "honeycomb", "honey"]],
  ["/blog/best-beef-jerky/", ["beef jerky", "jerky"]],
  ["/blog/best-meat-slicer/", ["meat slicer", "deli slicer"]],
  ["/blog/best-caviar/", ["caviar"]],
  // Best Buys guides sitting at positions 10-26 on their own head term
  // (Search Console, 28 days to 12 Nov 2026). Only the three below had any
  // room left: blue cheese, pesto, queso, pepperoni, salami, smoked salmon,
  // feta, eggnog and dark chocolate already have 15 to 37 internal links each
  // through guide-links.mjs, so every page that mentions them links them
  // already. Those need links from other sites, not more of ours.
  ["/blog/best-french-onion-dip/", ["French onion dip"]],
  ["/blog/best-pita-chips/", ["pita chips"]],
  ["/blog/best-prosecco/", ["prosecco"]],
  // Ingredient pages at positions 10-20
  ["/ingredients/black-garlic/", ["black garlic"]],
  ["/ingredients/red-leicester/", ["Red Leicester"]],
  ["/ingredients/dijon-mustard/", ["Dijon mustard", "Dijon"]],
  ["/ingredients/kalamata-olives/", ["Kalamata olives", "Kalamata"]],
  ["/ingredients/brunost/", ["brunost", "Norwegian brown cheese"]],
  ["/ingredients/mortadella/", ["mortadella"]],
  ["/ingredients/hot-honey/", ["hot honey"]],
  ["/ingredients/cured-meat-and-seafood/", ["cured meat and seafood"]],
  ["/ingredients/chili-flakes/", ["chili flakes", "red pepper flakes"]],
  ["/ingredients/cerignola-olives/", ["Cerignola olives", "Cerignola"]],
  ["/ingredients/truffle-honey/", ["truffle honey"]],
  ["/ingredients/pimento-cheese/", ["pimento cheese"]],
  ["/ingredients/orange-marmalade/", ["orange marmalade", "marmalade"]],
  ["/ingredients/bottarga/", ["bottarga"]],
  ["/ingredients/banana-peppers/", ["banana peppers"]],
  ["/ingredients/lupini-beans/", ["lupini beans", "lupini"]],
  ["/ingredients/lefse/", ["lefse"]],
  ["/ingredients/cranberry-goat-cheese/", ["cranberry goat cheese"]],
  ["/ingredients/spicy-brown-mustard/", ["spicy brown mustard"]],
  ["/ingredients/blood-oranges/", ["blood oranges", "blood orange"]],
];

// Most-clicked pages, Search Console Oct 12 - Nov 8 2026 (5+ clicks), best first.
const POPULAR = ["/blog/cheese-advent-calendars-2026/", "/blog/what-bread-for-charcuterie-board/", "/blog/cheese-advent-calendar-australia-canada/", "/blog/best-prosciutto-brands/", "/blog/best-brie-brands/", "/blog/best-trader-joes-cheeses/", "/blog/best-spinach-dip/", "/blog/best-fig-jam/", "/blog/best-balsamic-glaze/", "/pairings/food/camembert/", "/blog/how-much-does-a-charcuterie-board-cost/", "/blog/best-mortadella-brands/", "/blog/best-cheese-charcuterie-board/", "/blog/best-salami-brands/", "/blog/best-feta-brands/", "/blog/best-provolone-brands/", "/pairings/food/brie/", "/blog/best-smoked-salmon/", "/blog/trader-joes-charcuterie-board/", "/blog/best-prosecco/", "/blog/wine-and-charcuterie-board/", "/blog/make-charcuterie-board-night-before/", "/blog/best-blue-cheese-brands/", "/blog/best-panettone/", "/blog/best-aldi-charcuterie-items/", "/blog/charcuterie-cups/", "/blog/cheeses-from-mild-to-strong/", "/blog/best-costco-charcuterie-items/", "/blog/salami-vs-pepperoni/", "/blog/charcuterie-gift-basket/", "/blog/pregnancy-safe-charcuterie-board/", "/blog/best-queso/", "/ingredients/rogue-river-blue/", "/pairings/food/smoked-salmon/", "/party-planner/charcuterie-board-for-20-people/", "/blog/types-of-salami/", "/blog/best-pate/", "/party-planner/charcuterie-board-for-25-people/", "/blog/best-marcona-almonds/", "/blog/best-summer-sausage/", "/blog/charcuterie-skewers/", "/blog/best-charcuterie-gift-boxes/", "/blog/how-to-store-charcuterie-board/", "/pairings/food/apples/", "/blog/charcuterie-board-nuts/", "/dietary/nut-free/", "/blog/best-wegmans-charcuterie-items/", "/blog/can-you-eat-brie-rind/", "/blog/best-pesto/", "/blog/charcuterie-board-olives/", "/blog/best-trader-joes-charcuterie-items/", "/blog/best-sparkling-cider/", "/pairings/food/comte/", "/blog/best-lidl-charcuterie-items/", "/ingredients/lomo/", "/blog/best-pepperoni-brands/", "/blog/best-pickles-for-charcuterie/", "/blog/best-eggnog/", "/blog/best-ricotta-brands/", "/blog/how-to-cut-cheese-charcuterie-board/", "/blog/cheese-safe-during-pregnancy/", "/blog/brie-vs-camembert/", "/blog/costco-charcuterie-board/", "/blog/best-pimento-cheese/", "/blog/best-capicola-coppa/", "/blog/best-pepper-jack/", "/blog/best-soppressata-brands/", "/blog/grazing-board-vs-charcuterie-board/", "/pairings/wine/pinot-noir/", "/blog/charcuterie-board-baby-shower/", "/blog/best-gruyere-brands/", "/pairings/food/stilton/", "/blog/best-store-bought-cheese-balls/", "/blog/coppa/", "/dietary/questions/is-salami-gluten-free/", "/blog/charcuterie-board-fruit/", "/blog/baked-brie-recipe/", "/blog/bagel-board/", "/blog/best-olives-for-charcuterie/", "/blog/bresaola-vs-prosciutto/", "/blog/best-mustard-for-charcuterie/", "/blog/best-marinated-artichoke-hearts/", "/blog/best-cornichons/"];

// Sections whose pages carry body copy worth linking from.
const SOURCE_DIRS = ["blog", "ingredients", "boards", "pairings", "holidays", "dietary", "party-planner", "gifts"];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function htmlFiles(dist) {
  const out = [];
  async function walk(dir, url) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (e.isDirectory()) await walk(join(dir, e.name), `${url}${e.name}/`);
      else if (e.name === "index.html" && url.split("/").length > 3) out.push([url, join(dir, e.name)]); // skip section hubs
    }
  }
  for (const d of SOURCE_DIRS) {
    try { await walk(join(dist, d), `/${d}/`); } catch { /* section missing */ }
  }
  return out;
}

// Link the first plain-text match of `re` in body paragraphs; returns [html, done].
function linkFirst(html, re, url) {
  let done = false;
  const out = html.replace(/<(p|li)>([\s\S]*?)<\/\1>/g, (whole, tag, inner) => {
    // plain copy only: nested blocks or styled spans mean a card, price row or widget
    if (done || /<(p|li|ul|ol|div|table|small|button)[\s>]/.test(inner) || / class=/.test(inner)) return whole;
    // split into existing links and the text between them; touch text only
    const parts = inner.split(/(<a\b[\s\S]*?<\/a>|<[^>]+>)/);
    for (let i = 0; i < parts.length && !done; i += 2) {
      const m = parts[i].match(re);
      if (!m) continue;
      parts[i] = parts[i].slice(0, m.index) + `<a href="${url}">${m[0]}</a>` + parts[i].slice(m.index + m[0].length);
      done = true;
    }
    return done ? `<${tag}>${parts.join("")}</${tag}>` : whole;
  });
  return [out, done];
}

export async function pushLinks(dist) {
  const files = await htmlFiles(dist);
  const html = new Map();
  for (const [url, file] of files) html.set(url, await readFile(file, "utf8"));
  const added = new Map(); // source url -> new links on it
  const report = [], detail = [];
  const rank = new Map(POPULAR.map((u, i) => [u, i]));
  for (const [target, phrases, cap = PER_TARGET] of TARGETS) {
    const res = phrases.map((p) => new RegExp(`(?<![\\w-])${esc(p)}(?![\\w-])`, "i"));
    const bodyOf = (h) => (h.match(/<main[\s\S]*<\/main>/) || [""])[0];
    const candidates = [];
    for (const [url, h] of html) {
      if (url === target || (added.get(url) || 0) >= PER_PAGE) continue;
      const body = bodyOf(h);
      if (body.includes(`href="${target}"`)) continue; // already linked in the page body
      const text = body.replace(/<a\b[\s\S]*?<\/a>/g, " ").replace(/<[^>]+>/g, " ");
      const hits = res.reduce((n, re) => n + (text.match(new RegExp(re.source, "gi")) || []).length, 0);
      if (hits) candidates.push([url, hits]);
    }
    candidates.sort((a, b) => (rank.get(a[0]) ?? 1e6) - (rank.get(b[0]) ?? 1e6) || b[1] - a[1] || a[0].localeCompare(b[0]));
    let n = 0;
    for (const [url] of candidates) {
      if (n >= cap) break;
      if ((added.get(url) || 0) >= PER_PAGE) continue;
      const h = html.get(url);
      const start = h.indexOf("<main"), end = h.lastIndexOf("</main>");
      if (start < 0 || end < 0) continue;
      let body = h.slice(start, end), ok = false;
      for (const re of res) { [body, ok] = linkFirst(body, re, target); if (ok) break; }
      if (!ok) continue;
      html.set(url, h.slice(0, start) + body + h.slice(end));
      added.set(url, (added.get(url) || 0) + 1);
      detail.push([target, url]);
      n++;
    }
    report.push([target, n]);
  }
  for (const [url, file] of files) if (added.has(url)) await writeFile(file, html.get(url));
  if (process.env.PUSH_LINKS_REPORT) await writeFile(process.env.PUSH_LINKS_REPORT, JSON.stringify({ report, detail }, null, 1));
  return { links: report.reduce((s, [, n]) => s + n, 0), pages: added.size, report };
}
