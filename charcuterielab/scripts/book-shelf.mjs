// Book shelf (17 Nov 2026). All seven Charcuterie Lab books in one row, placed
// about 40% of the way down every blog post (where readers actually are,
// instead of only in the footer block) and at the top of the blog index.
// The book that fits the post comes first and is marked "Fits this post";
// 50 Boards follows, then the rest in series order. Each cover links to that
// book's own page. On phones the row scrolls sideways with full-size covers.
// Plan: claude/book-shelf-2026-11-17.md
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { GUIDE_BOOK, IMPOSSIBLE_BOOK, KETO_BOOK, PLANT_BOOK, TWO_BOOK, WORLD_BOOK } from "./boards.mjs";

const track = (url, c) => `${url}${url.includes("?") ? "&" : "?"}utm_source=charcuterielab&utm_medium=site&utm_campaign=${c}`;

// Order here is the default order on the shelf after the matched book.
export const SHELF = [
  { key: "main", name: "50 Boards", line: "50 boards for every party", cover: "/images/book-cover.jpg", href: "/ebook/", price: "$14" },
  { key: "impossible", name: "Impossible Boards", line: "25 showstopper shapes", cover: IMPOSSIBLE_BOOK.cover, href: "/books/impossible-boards/", price: IMPOSSIBLE_BOOK.ebookPrice },
  { key: "guide", name: "Ingredient Guide", line: "325 ingredients explained", cover: GUIDE_BOOK.cover, href: GUIDE_BOOK.ebookUrl, external: true, price: GUIDE_BOOK.ebookPrice },
  { key: "world", name: "Around the World", line: "16 countries, 16 boards", cover: WORLD_BOOK.cover, href: "/around-the-world/", price: WORLD_BOOK.ebookPrice },
  { key: "two", name: "Boards for Two", line: "25 date-night boards", cover: TWO_BOOK.cover, href: "/books/boards-for-two/", price: TWO_BOOK.ebookPrice },
  { key: "plant", name: "Plant-Based", line: "15 vegan boards", cover: PLANT_BOOK.cover, href: "/books/plant-based-charcuterie-boards/", price: PLANT_BOOK.ebookPrice },
  { key: "keto", name: "Keto & Low\u2011Carb", line: "net carbs on every item", cover: KETO_BOOK.cover, href: "/books/keto-charcuterie-boards/", price: KETO_BOOK.ebookPrice }
];

// First rule that matches the post's slug, title or tags wins, so a vegan
// Christmas board goes to Plant-Based, and "brie vs camembert" goes to the
// Ingredient Guide rather than Around the World.
const MEATS_CHEESES = "bresaola|coppa|capicola|pancetta|mortadella|prosciutto|serrano|jamon|iberico|chorizo|salami|soppressata|nduja|kielbasa|sausage|cured meat|brie|camembert|gouda|cheddar|manchego|gruyere|comte|stilton|blue cheese|gorgonzola|parmesan|parmigiano|feta|ricotta|mozzarella|burrata|havarti|goat cheese|chevre|asiago|pecorino|fontina|swiss cheese|cheeses?";
const RULES = [
  ["plant", /\b(vegan|vegetarian|plant based|dairy free|hummus|meatless)\b/],
  ["keto", /\b(keto|low carb|carb|gluten free|paleo|healthy|healthier)\b/],
  ["two", /\b(date night|for two|two people|valentine|anniversary|romantic|couple|galentine|mini charcuterie)\b/],
  ["guide", /\b(vs|versus|types of|difference|deep dive|what is)\b/],
  ["world", /\b(tapas|antipasto (board|platter)|mezze|meze|noche buena|smorgasbord|international|around the world|fusion|grazing around)\b|\b(spanish|italian|french|greek|mexican|japanese|korean|indian|british|german|mediterranean|middle eastern|scandinavian)\b.*\bboard\b/],
  // Holiday and themed words count only in the slug and title: a tag like
  // "christmas skewers" shouldn't send a general party post to Impossible.
  ["impossible", (t) => !/^ best /.test(t) && /\b(turkey|christmas|halloween|jack o|wreath|easter|super bowl|football|game day|new year|nye|themed|unique|shaped|showstopper|birthday|santa|pumpkin|candy|hot cocoa)\b/.test(t.split(" tagsfollow ")[0])],
  // Thanksgiving is Board 20 in 50 Boards, and amount and cost questions are
  // what its shopping lists answer.
  ["main", /\b(thanksgiving|friendsgiving|fall|how much|cost|budget|per person)\b/],
  ["guide", new RegExp(`\\b(pairing|pairs|goes with|what goes|ingredient|${MEATS_CHEESES}|fig jam|honey|honeycomb|crackers|olives|jam|mustard|nuts|dried fruit|wine|beer)\\b`)]
];

export function matchBook(text) {
  const t = ` ${String(text).toLowerCase().replace(/[-_]/g, " ").replace(/[^a-z0-9 ]+/g, " ")} `;
  for (const [key, re] of RULES) if (typeof re === "function" ? re(t) : re.test(t)) return key;
  return "main";
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function shelfHtml(first, campaign, thumb = (x) => x) {
  const order = [SHELF.find((b) => b.key === first), ...SHELF.filter((b) => b.key !== first)].filter(Boolean);
  const items = order.map((b, i) => {
    const href = b.external ? track(b.href, `${campaign}_${b.key}`) : b.href;
    const ext = b.external ? ' target="_blank" rel="noopener"' : "";
    const fit = i === 0 && first !== "main" ? '<span class="bs-fit">Fits this post</span>' : "";
    return `<li${i === 0 ? ' class="bs-first"' : ""}><a href="${esc(href)}"${ext} data-book="${b.key}">
        <span class="bs-cover">${fit}<img src="${esc(thumb(b.cover))}" alt="${esc(b.name)} cover" width="150" height="196" loading="lazy" decoding="async"></span>
        <span class="bs-name">${esc(b.name)}</span>
        <span class="bs-line">${esc(b.line)}</span>
        <span class="bs-price">Ebook ${esc(b.price)}</span>
      </a></li>`;
  }).join("\n      ");
  return `<aside class="book-shelf" aria-label="Charcuterie Lab books" data-campaign="${esc(campaign)}">
    <p class="bs-eyebrow">The Charcuterie Lab books</p>
    <p class="bs-title">A book for every kind of host</p>
    <p class="bs-sub">Every board comes with the shopping list, the build order and the pairing logic. PDF on Gumroad or paperback on Amazon.</p>
    <ul class="bs-row">
      ${items}
    </ul>
    <a class="bs-all" href="/shop/#ebooks">See all seven books &rarr;</a>
  </aside>\n`;
}

// The post body can hold nested <article> cards (buying guides), so find the
// </article> that closes it by counting.
function articleEnd(html, b) {
  const re = /<article\b|<\/article>/g;
  re.lastIndex = b;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0] === "</article>" ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return -1;
}

// Before the first section heading at or past 40% of the article, skipping
// anything after the printable card or the FAQ, and never directly under
// another box (the email offer, the product card or the book line).
export function placeShelf(html, shelf) {
  if (html.includes('class="book-shelf"')) return null;
  const b = html.indexOf('<article class="post-body">');
  if (b < 0) return null;
  const e = articleEnd(html, b);
  if (e < 0) return null;
  const stops = ['<aside class="fx-print"', '<div class="faq-fold"', '<h2 id="faq"', '<h2 id="frequently'].map((s) => html.indexOf(s, b)).filter((i) => i > b && i < e);
  const end = stops.length ? Math.min(...stops) : e;
  const heads = [];
  const re = /<h2 id="[^"]+"/g;
  re.lastIndex = b;
  let m;
  while ((m = re.exec(html)) && m.index < end) heads.push(m.index);
  if (heads.length < 2) return null;
  const len = e - b;
  const boxBefore = (at) => /<\/(aside|section)>\s*$/.test(html.slice(Math.max(b, at - 400), at)) || /class="fx-line fx-book"[^]*?<\/p>\s*$/.test(html.slice(Math.max(b, at - 600), at));
  let pick = heads.findIndex((h) => (h - b) / len >= 0.4);
  if (pick < 0) pick = heads.length - 1;
  if (pick === 0) pick = 1;
  while (pick < heads.length && boxBefore(heads[pick])) pick++;
  if (pick >= heads.length) {
    pick = heads.length - 1;
    while (pick > 0 && boxBefore(heads[pick])) pick--;
    if (pick <= 0) return null;
  }
  const at = heads[pick];
  return html.slice(0, at) + shelf + html.slice(at);
}

async function frontMatter(root, slug) {
  try {
    const t = await readFile(join(root, "content", "blog", `${slug}.md`), "utf8");
    const fm = t.startsWith("---") ? t.slice(3, t.indexOf("\n---", 3)) : "";
    const get = (k) => ((new RegExp(`^${k}:\\s*(.*)$`, "m").exec(fm) || [])[1] || "");
    return `${slug} ${get("title")} tagsfollow ${get("tags")}`;
  } catch {
    return slug;
  }
}

export async function injectBookShelf(dist, root, thumb = (x) => x) {
  const counts = {};
  let posts = 0;
  const skipped = [];
  const blog = join(dist, "blog");
  for (const slug of await readdir(blog)) {
    const f = join(blog, slug, "index.html");
    if (!existsSync(f)) continue;
    const html = await readFile(f, "utf8");
    const key = matchBook(await frontMatter(root, slug));
    const out = placeShelf(html, shelfHtml(key, `shelf_${slug}`, thumb));
    if (!out) { skipped.push(slug); continue; }
    await writeFile(f, out);
    counts[key] = (counts[key] || 0) + 1;
    posts++;
  }
  // Blog index: after the This week / Start here / New / Popular rows, before
  // the topic rows (the slim 50 Boards bar that used to sit at the top is gone).
  let index = false;
  const bi = join(blog, "index.html");
  if (existsSync(bi)) {
    const html = await readFile(bi, "utf8");
    const at = html.indexOf('<section class="section bp-row bp-topic-row"');
    if (at > 0 && !html.includes('class="book-shelf"')) {
      await writeFile(bi, html.slice(0, at) + `<div class="bs-wrap">${shelfHtml("main", "shelf_blog_index", thumb)}</div>\n` + html.slice(at));
      index = true;
    }
  }
  return { posts, counts, skipped, index };
}
