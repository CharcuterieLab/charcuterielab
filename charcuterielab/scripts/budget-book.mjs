// Charcuterie on Any Budget on the site (23 Nov 2026).
//   /boards/by-price/   all 24 boards by price level, with photo, total, cost per guest and store
//   price box           "Make this board for $X" on the 20 board and party-planner pages that match a book board
//   board hub line      a link from /boards/ to the by-price page
// What's free on the site: each board's total, cost per guest, store and item names.
// Each item's price, the amounts, the build steps and the swaps stay in the book and the $5 packs.
// Data: content/books/budget.json (written from the book's own build data, so totals can't drift).
// Plan: claude/book-price-ladder-site-2026-11-23.md
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { BUDGET_BOOK } from "./boards.mjs";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (v) => `$${Number(v).toFixed(2)}`;
const track = (url, c) => `${url}${url.includes("?") ? "&" : "?"}utm_source=charcuterielab&utm_medium=site&utm_campaign=${c}`;
const rungWord = (k) => (k === "crowd" ? "crowd" : `$${k}`);

export async function loadBudget(root) {
  const f = join(root, "content", "books", "budget.json");
  return existsSync(f) ? JSON.parse(await readFile(f, "utf8")) : null;
}

// Pages that get a price box, on top of each board's own page in budget.json.
// The $25 board page points down to the $15 board; the luxury page to the $250 Italian board.
const EXTRA = { "/boards/25-dollar-budget-charcuterie-board/": 1, "/boards/luxury-charcuterie-board/": 18, "/boards/middle-eastern-mezze-board/": 7, "/boards/sweet-and-savory-dessert-board/": 4 };

// The book's own board pages (content/boards, book "budget"); every other page is an existing board the book re-prices.
const OWN = new Set(["/boards/15-dollar-charcuterie-board/", "/boards/wine-night-board-for-four/", "/boards/italian-salumeria-board/", "/boards/american-cheese-board/"]);

function names(b, n = 99) {
  return b.items.map((i) => i.name.replace(/,? sliced$/i, "")).slice(0, n);
}

function packUrl(sec, campaign) {
  return track(BUDGET_BOOK.packs[sec], campaign);
}

export function priceBox(data, b, path, campaign) {
  const sec = data.sections.find((s) => s.boards.includes(b.n));
  const own = OWN.has(path);
  const crowd = b.rung === "crowd";
  const headline = path === "/boards/25-dollar-budget-charcuterie-board/" ? `Even less: a $15 board for 4, priced at ${b.store}`
    : path === "/boards/luxury-charcuterie-board/" ? `A $250 board for 10: the Italian Salumeria Board`
    : own && !path.startsWith("/party-planner/") ? `What it costs at ${b.store}`
    : crowd ? `A board for ${b.serves} guests for $${b.cap}, priced at ${b.store}`
    : `Make this board for $${b.cap}, priced at ${b.store}`;
  const lead = own && !crowd ? esc(b.buys)
    : crowd ? `Board ${b.num} in <em>Charcuterie on Any Budget</em> feeds ${b.serves} guests beside other food for ${money(b.total)}, about ${money(b.perGuest)} a guest. ${esc(b.buys)}`
    : `Board ${b.num} in <em>Charcuterie on Any Budget</em>, the ${esc(b.title.replace(/^The /, ""))}, comes in at ${money(b.total)} for ${b.serves}. ${esc(b.buys)}`;
  return `<section class="bp-box" id="bp-price" aria-labelledby="bp-box-h">
  <div class="bp-box-photo"><img src="${esc(b.photo)}" alt="${esc(b.title)} from Charcuterie on Any Budget" width="800" height="537" loading="lazy" decoding="async"><span class="bp-tag">${esc(b.label)}</span></div>
  <div class="bp-box-body">
    <p class="eyebrow">From Charcuterie on Any Budget</p>
    <h2 id="bp-box-h">${esc(headline)}</h2>
    <p>${lead}</p>
    <dl class="bp-stats"><div><dt>Estimated total</dt><dd>${money(b.total)}</dd></div><div><dt>Per guest</dt><dd>${money(b.perGuest)}</dd></div><div><dt>Serves</dt><dd>${b.serves}</dd></div><div><dt>Store</dt><dd>${esc(b.store)}</dd></div></dl>
    <p class="bp-items"><strong>On the receipt:</strong> ${esc(names(b).join(", "))}.</p>
    <p class="bp-fine">Estimated regular prices for fall 2026, before tax. The book has the price of every item, the seven build steps and three swaps each way to spend less or more.</p>
    <div class="bp-buy"><a class="button primary" href="${esc(packUrl(sec.key, `${campaign}_pack`))}" target="_blank" rel="noopener">The ${esc(rungWord(sec.key))} boards · ${esc(BUDGET_BOOK.packPrice)}</a><a class="button" href="${esc(BUDGET_BOOK.path)}">All 24 boards · ebook ${esc(BUDGET_BOOK.ebookPrice)}</a><a class="fx-more" href="/boards/by-price/#b-${b.num}">Every board by price &rarr;</a></div>
  </div>
</section>
`;
}

// Box goes after the "why it works" section on board pages, after the setup
// section on party-planner pages. Runs before the book shelf is placed, so the
// shelf can see it and won't stack against it.
export async function injectBudgetBoxes(dist, data) {
  if (!data) return { pages: 0, missed: [] };
  const map = new Map(data.boards.map((b) => [b.page, b]));
  for (const [p, n] of Object.entries(EXTRA)) map.set(p, data.boards.find((b) => b.n === n));
  let pages = 0;
  const missed = [];
  for (const [path, b] of map) {
    const f = join(dist, path, "index.html");
    if (!existsSync(f)) { missed.push(path); continue; }
    let html = await readFile(f, "utf8");
    if (html.includes('class="bp-box"')) continue;
    const anchors = path.startsWith("/party-planner/")
      ? ['<section class="pp-section" aria-labelledby="pp-time">', '<section class="pp-section" aria-labelledby="pp-near">']
      : ['<section class="bl-section" aria-labelledby="bl-when">', '<section class="bl-section" aria-labelledby="bl-faq">'];
    const at = anchors.map((a) => html.indexOf(a)).find((i) => i > 0);
    if (!at) { missed.push(path); continue; }
    const camp = `budget_box_${path.split("/").filter(Boolean).pop()}`;
    html = html.slice(0, at) + priceBox(data, b, path, camp) + html.slice(at);
    await writeFile(f, html);
    pages++;
  }
  // The Board Library points to the by-price page.
  const hub = join(dist, "boards", "index.html");
  if (existsSync(hub)) {
    let h = await readFile(hub, "utf8");
    const m = /<p class="bl-intro">[\s\S]*?<\/p>/.exec(h);
    if (m && !h.includes('class="bp-hub-link"')) {
      h = h.slice(0, m.index + m[0].length) + `\n    <p class="bp-hub-link">On a budget? <a href="/boards/by-price/">See 24 boards by price, from $15 for four to $250 for ten</a>, each with its estimated total and cost per guest.</p>` + h.slice(m.index + m[0].length);
      await writeFile(hub, h);
    }
  }
  return { pages, missed };
}

export function byPriceHub(h, data) {
  const B = data.boards;
  const by = (n) => B.find((x) => x.n === n);
  const range = (ns, f) => { const v = ns.map((n) => f(by(n))); return `${money(Math.min(...v))}–${money(Math.max(...v))}`; };
  const faq = [
    ["How much does a charcuterie board cost?", "For ten guests, about $27 to $29 for an everyday board, $47 to $49 with a second cured meat or a themed board, $74 to $92 from the cheese counter and $196 to $233 for a splurge. A board for four can cost $13 to $15. At the store prices in this guide that's about $2.70 to $4.90 a guest for everyday boards."],
    ["What's the cheapest store for a charcuterie board?", `In the Charcuterie Lab Price Index (October 2026), the same nine-item board for ten cost $33.90 at Aldi, $42.52 at Walmart, $44.29 at Kroger and $50.20 at Trader Joe's. Buying each item wherever it was cheapest saved only $3.32 over shopping at Aldi alone.`],
    ["How much does a charcuterie board for a crowd cost?", "About $2.50 to $2.90 a guest when the board sits beside other food: $49 for 20 guests, $82 for 30, $145 for 50 and $256 for 100, bought in bulk at Sam's Club and Aldi."],
    ["What do you get for more money?", "Variety and rarity, not more food. Moving from $15 to $50 adds a second cured meat, an aged cheese and a better cracker. Above $100, each extra dollar buys rarer foods like long-aged Parmigiano, Prosciutto di Parma, caviar or jamón ibérico."],
    ["Are these prices exact?", "They're estimates of regular shelf prices in fall 2026, before tax, at the store named on each board. Prices vary by region, season and week, so treat each total as a close guide. Specialty and online items on the $250 boards don't include shipping."]
  ];
  const secs = data.sections.map((s) => {
    const cards = s.boards.map((n) => {
      const b = by(n);
      return `<li class="bp-card" id="b-${b.num}">
        <a href="${esc(b.page)}"><img src="${esc(h.thumb(b.photo, "m"))}" alt="${esc(b.title)}" width="800" height="537" loading="lazy" decoding="async"></a>
        <div class="bp-card-body">
          <p class="bp-card-k">Board ${b.num} · ${esc(b.store)}</p>
          <h3><a href="${esc(b.page)}">${esc(b.title)}</a></h3>
          <p class="bp-card-nums"><strong>${money(b.total)}</strong> for ${b.serves} · ${money(b.perGuest)} a guest</p>
          <p class="bp-card-items">${esc(names(b, 6).join(" · "))}${b.items.length > 6 ? ` and ${b.items.length - 6} more` : ""}</p>
        </div>
      </li>`;
    }).join("\n      ");
    const totals = range(s.boards, (b) => b.total);
    return `<section class="bp-rung" id="rung-${s.key}" aria-labelledby="rung-${s.key}-h">
    <div class="bp-rung-head">
      <p class="bp-rung-price">${s.key === "crowd" ? "Crowd" : `$${s.key}`}</p>
      <div><h2 id="rung-${s.key}-h">${esc(s.name)} <span>${esc(s.sub)}</span></h2>
      <p>${esc(s.intro)} Totals run ${totals}.</p></div>
    </div>
    <ul class="bp-cards">
      ${cards}
    </ul>
    <p class="bp-rung-buy"><a class="button" href="${esc(packUrl(s.key, `by_price_pack_${s.key}`))}" target="_blank" rel="noopener">Get these 4 boards with their priced receipts · ${esc(BUDGET_BOOK.packPrice)}</a></p>
  </section>`;
  }).join("\n  ");
  const chips = data.sections.map((s) => `<a href="#rung-${s.key}">${s.key === "crowd" ? "Crowds" : `$${s.key}`}</a>`).join("");
  const idx = Object.entries(data.index).map(([s, v]) => `<tr><th scope="row">${esc(s)}</th><td>${money(v)}</td><td>${money(v / 10)}</td></tr>`).join("");
  const head = [
    { "@context": "https://schema.org", "@type": "ItemList", name: "Charcuterie boards by price", itemListElement: B.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: `${b.title} (${b.label})`, url: h.absoluteUrl(b.page) })) },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Boards", "/boards/"], ["By price", "/boards/by-price/"]].map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: h.absoluteUrl(url) })) }
  ].map((s) => `  <script type="application/ld+json">${h.jsonForScript(s)}</script>`).join("\n");
  return h.layout({
    title: "Charcuterie Board Ideas by Price: 24 Boards from $15 to $250 | Charcuterie Lab",
    canonical: "/boards/by-price/",
    image: "/images/books/budget/five-prices.webp",
    description: "What a charcuterie board costs, board by board: 24 boards from $15 for four to $250 for ten, plus crowd boards for 20 to 100, each with its estimated total, cost per guest and store.",
    head,
    body: `<main class="bp-main">
  <section class="bp-hero">
    <p class="ing-crumb"><a href="/boards/">Boards</a> <span aria-hidden="true">/</span> By price</p>
    <h1>Charcuterie boards by price: 24 boards from $15 to $250</h1>
    <p class="bp-lead"><strong>A charcuterie board for ten costs about $27–$29 for an everyday board, $47–$49 with a second meat or a theme, $74–$92 from the cheese counter and $196–$233 for a splurge.</strong> A board for four can cost under $15, and a crowd board runs about $2.50–$2.90 a guest. Here are the 24 boards behind those numbers, each with its estimated total, cost per guest and the store it was priced at.</p>
    <img class="bp-hero-img" src="/images/books/budget/five-prices.webp" alt="The same classic board at $15, $30, $50, $100 and $250" width="1200" height="556" fetchpriority="high">
    <nav class="bp-chips" aria-label="Jump to a price">${chips}</nav>
  </section>
  ${secs}
  <section class="bp-section" aria-labelledby="bp-idx-h">
    <h2 id="bp-idx-h">Which store is cheapest?</h2>
    <p>The <a href="/blog/charcuterie-price-index/">Charcuterie Lab Price Index</a> priced the same nine-item board for ten at four stores on October 27, 2026, at regular prices.</p>
    <div class="bk-table-wrap"><table class="bk-table"><thead><tr><th scope="col">Store</th><th scope="col">Board for 10</th><th scope="col">Per guest</th></tr></thead><tbody>${idx}</tbody></table></div>
    <p class="bk-fine">Meat and cheese are about half of the bill at every store, so that's where the choices matter most. More: <a href="/blog/how-much-does-a-charcuterie-board-cost/">how much a charcuterie board costs</a> · <a href="/blog/budget-charcuterie-board/">budget board tips</a> · <a href="/party-planner/">how much to buy for your guest count</a>.</p>
  </section>
  <section class="bp-section bp-book" aria-labelledby="bp-book-h">
    <img src="${esc(h.thumb(BUDGET_BOOK.cover, "s"))}" alt="Charcuterie on Any Budget cover" width="200" height="259" loading="lazy" decoding="async">
    <div>
      <p class="eyebrow">Every board, fully priced</p>
      <h2 id="bp-book-h">Charcuterie on Any Budget</h2>
      <p>All 24 boards in one book, each with a shopping list printed like a store receipt: every item's size and estimated price, the total and the room left under budget. Plus seven build steps, a prep timeline, and three swaps each way to move a rung down or up.</p>
      <div class="bp-buy"><a class="button primary" href="${esc(track(BUDGET_BOOK.ebookUrl, "by_price_book"))}" target="_blank" rel="noopener">Get the ebook · ${esc(BUDGET_BOOK.ebookPrice)}</a>${BUDGET_BOOK.paperbackUrl ? `<a class="button" href="${esc(BUDGET_BOOK.paperbackUrl)}" target="_blank" rel="noopener sponsored">Paperback on Amazon</a>` : `<a class="button" href="${esc(BUDGET_BOOK.path)}">See inside the book</a>`}</div>
    </div>
  </section>
  <section class="bp-section" aria-labelledby="bp-faq-h">
    <h2 id="bp-faq-h">Charcuterie board cost: questions</h2>
    <div class="ebook-faq-list">${faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n      ")}</div>
  </section>
</main>`
  });
}

export async function writeByPriceHub(dist, h, data) {
  if (!data) return false;
  await mkdir(join(dist, "boards", "by-price"), { recursive: true });
  await writeFile(join(dist, "boards", "by-price", "index.html"), byPriceHub(h, data));
  return true;
}
