// Board Library: /boards/ hub, one page per category, one page per board.
// Content lives in content/boards/<slug>.json. Only "status": "published" boards
// are built, listed and put in the sitemap; drafts wait for their wave.
import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { plan as partyPlan, COUNTS as PARTY_COUNTS_B, urlFor as partyUrlB } from "./party.mjs";
import { qsForm, QS_JS, CHEAT } from "./quick-subscribe.mjs";

export const BOARD_CATEGORIES = [
  { slug: "seasonal-holiday", name: "Seasonal & Holiday", intro: "Boards for the dates on the calendar: Thanksgiving, the holidays, New Year's Eve and every season in between." },
  { slug: "occasions-parties", name: "Occasions & Parties", intro: "Boards sized and styled for the event: game day, the office party, cocktail hour, showers and celebrations." },
  { slug: "classic-budget-luxury", name: "Classic, Budget & Luxury", title: "Classic, Budget & Luxury Charcuterie Board Ideas", intro: "From the first board you'll ever make to the one-night splurge, and a $25 board that doesn't look it.", seo_description: "Classic, budget and luxury charcuterie board ideas: the starter board, a $25 board that doesn't look it, and the splurge board, with what goes on each." },
  { slug: "around-the-world", name: "Around the World", intro: "Italian antipasto, Spanish tapas, a French brasserie spread and more, each built from its own region's pantry." },
  { slug: "dietary-kids", name: "Dietary & Kids", title: "Gluten-Free, Vegan & Kid-Friendly Charcuterie Boards", intro: "Gluten-free, keto, vegan and kid-friendly boards that nobody at the table has to work around.", seo_description: "Gluten-free, keto, vegan and kid-friendly charcuterie board ideas that nobody at the table has to work around, each with what goes on it and what to buy." },
  { slug: "pairings-sweet", name: "Pairings & Sweet", title: "Wine, Beer & Dessert Charcuterie Board Ideas", intro: "Boards built around a drink or for the sweet end of the evening.", seo_description: "Charcuterie board ideas built around a drink or the sweet end of the night: wine and cheese, beer, cocktails, dessert and chocolate boards, with pairings." },
  { slug: "plant-based", name: "Plant-Based", intro: "Fifteen boards with no meat and no dairy, built on the same pairing science as every other board here." },
  { slug: "for-two", name: "Boards for Two", intro: "Twenty-five boards sized for two: date nights, anniversaries, a cozy night in and a few splurges, each with a drink to pour." },
  { slug: "keto-low-carb", name: "Keto & Low-Carb", intro: "Keto boards at 4 to 9 g net carbs per serving, with low-carb dippers standing in for crackers." },
  { slug: "showpiece", name: "Showpiece Boards", title: "Shaped Charcuterie Boards: 25 Showpiece Board Ideas", intro: "Boards shaped like a dragon, a guitar, a turkey or a pirate ship, each with the one trick that makes it work.", seo_description: "25 shaped charcuterie board ideas: a salami dragon, a bread pirate ship, a turkey, a unicorn and more, each with the one trick that makes it work." }
];

// Book 3 in the series. While "status" is "coming", every world board and the
// /around-the-world/ page show a launch-day signup. On launch day: fill in the
// two URLs and prices, set status to "live", rebuild, push.
export const WORLD_BOOK = {
  title: "Charcuterie Lab: Around the World in 16 Boards",
  status: "live",
  launch: "October 1, 2026",
  launchIso: "2026-10-01",
  ebookUrl: "https://charcuterieflavor.gumroad.com/l/hulgi",
  ebookPrice: "$9.99",
  paperbackUrl: "https://www.amazon.com/dp/B0HLKC56MG",
  paperbackPrice: "$16.99",
  cover: "/images/books/around-the-world-cover.webp"
};

// Live once either edition has a link: the ebook can go out before Amazon
// finishes review, and the paperback button appears when its URL is filled.
export const worldIsLive = (W = WORLD_BOOK) => W.status === "live" && Boolean(W.paperbackUrl || W.ebookUrl);

// Book 4. Gumroad ebook live 5 Oct 2026; add paperbackUrl when the KDP paperback is live.
export const TWO_BOOK = {
  title: "Charcuterie Lab: Boards for Two",
  ebookUrl: "https://charcuterieflavor.gumroad.com/l/xdwhtq",
  ebookPrice: "$9.99",
  cover: "/images/books/boards-for-two-cover.jpg",
  paperbackUrl: "https://www.amazon.com/dp/B0HMX22BRF",
  paperbackPrice: "$19.99"
};

// Paperbacks for Boards for Two, the Ingredient Guide and Keto added 27 Oct 2026.
// Book 6 (10 Oct 2026): ebook on Gumroad; paperback on Amazon since Oct 2026.
export const GUIDE_BOOK = {
  title: "Charcuterie Lab: The Ingredient Guide",
  ebookUrl: "https://charcuterieflavor.gumroad.com/l/ingredient-guide",
  ebookPrice: "$12.99",
  cover: "/images/books/ingredient-guide-cover.jpg",
  paperbackUrl: "https://www.amazon.com/dp/B0HMPQKF7G",
  paperbackPrice: "$25.99"
};

export const KETO_BOOK = {
  title: "Charcuterie Lab: Keto & Low-Carb Boards",
  ebookUrl: "https://charcuterieflavor.gumroad.com/l/gvjsf",
  ebookPrice: "$9.99",
  cover: "/images/books/keto-cover.jpg",
  paperbackUrl: "https://www.amazon.com/dp/B0HM38L8VH",
  paperbackPrice: "$16.99"
};

// Book 7 (Oct 2026): Gumroad ebook live 19 Oct, Amazon paperback live 23 Oct.
export const IMPOSSIBLE_BOOK = {
  title: "Charcuterie Lab: Impossible Boards",
  ebookUrl: "https://charcuterieflavor.gumroad.com/l/impossible-boards",
  ebookPrice: "$12.99",
  cover: "/images/books/impossible-boards-cover.jpg",
  paperbackUrl: "https://www.amazon.com/dp/B0HNJJGJTN",
  paperbackPrice: "$24.99"
};

export const PLANT_BOOK = {
  title: "Charcuterie Lab: 15 Show-Stopping Plant-Based Boards",
  // Gumroad ebook (PDF) is the main button since 5 Oct 2026; Kindle is the second option.
  ebookUrl: "https://charcuterieflavor.gumroad.com/l/yshmj",
  ebookPrice: "$9.99",
  cover: "/images/books/plant-based-cover.webp",
  kindleUrl: "https://www.amazon.com/dp/B0H32HT617",
  // Paste the paperback's Amazon link here; until then the second button is Kindle.
  paperbackUrl: "https://www.amazon.com/dp/B0H33YLLR3",
  kindlePrice: "$9.99",
  paperbackPrice: "$18.99"
};

// A matched printable on every board page: the Grazing Table Planner for
// boards that serve 20+, the Classic Board Blueprint otherwise. Plant-based
// boards get none (the printables use meat and dairy).
function boardPrintable(h, b) {
  if (!h.printCard || b.book === "plant" || /plant-based|vegan/.test(b.slug)) return "";
  const most = Math.max(...String(b.serves || "").match(/\d+/g)?.map(Number) || [0]);
  const slug = most >= 20 ? "grazing-table-planner" : "classic-entertaining-board-blueprint";
  return `<div class="bl-inner bl-print">${h.printCard(slug, `board_print_${b.slug}`)}</div>`;
}

export async function loadBoards(root) {
  const dir = join(root, "content", "boards");
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const all = await Promise.all(files.map(async (f) => JSON.parse(await readFile(join(dir, f), "utf8"))));
  const order = (b) => ({ plant: 100, world: 200, two: 300, keto: 400, impossible: 500 }[b.book] || 0) + Number(b.number.slice(3));
  const exists = (p) => access(join(root, "public", p)).then(() => true, () => false);
  // A board whose photo isn't in public/ yet gets a typographic placeholder
  // (written by build.mjs) and no social/schema image until the photo lands.
  await Promise.all(all.map(async (b) => {
    if (!(await exists(b.image))) {
      b.placeholder = true;
      b.image = `/images/boards/${b.slug}.svg`;
    }
  }));
  return all
    .filter((b) => b.status === "published")
    .sort((a, b) => a.wave - b.wave || order(a) - order(b));
}

const catOf = (b) => BOARD_CATEGORIES.find((c) => c.slug === b.category);
const plain = (s = "") => String(s).replace(/"/g, "″");

export function boardSlugsFor(board) {
  return [...new Set(board.groups.flatMap((g) => g.items.map((i) => i.slug)).filter(Boolean))];
}

export function builderLink(board, known) {
  const slugs = boardSlugsFor(board).filter((s) => known.has(s));
  return `/board-builder/?b=${slugs.join(",")}&g=${board.guests}&m=app&utm_source=charcuterielab&utm_medium=site&utm_campaign=board_${board.slug}`;
}

// Sales upgrade (2 Nov 2026): every card says how to get the plan ($3 or the
// book), and carries the data the hub sorts and filters on.
const LEVEL_RANK = (d = "") => (/master|5 of 5/i.test(d) ? 5 : /advanced|4 of 5/i.test(d) ? 4 : /intermediate|3 of 5/i.test(d) ? 3 : /mid|2 of 5/i.test(d) ? 2 : 1);
const MIN_COST = (c = "") => Number((String(c).match(/\d+/) || [0])[0]);
export function card(b, h, { plain = false } = {}) {
  const cat = catOf(b);
  const badges = [b.book === "plant" ? "Plant-based" : "", b.difficulty || ""].filter(Boolean);
  const single = h.bookSingles || h.bookBoards ? singleOf(h, b) : null;
  return `<li class="bl-card" data-cat="${b.category}" data-plant="${b.book === "plant" ? 1 : 0}" data-guests="${b.guests}" data-cost="${MIN_COST(b.cost)}" data-level="${LEVEL_RANK(b.difficulty)}" data-plan="${single ? 1 : 0}">
    <a href="/boards/${b.slug}/">
      <img src="${h.escapeHtml((h.thumb || ((x) => x))(b.image))}" alt="${h.escapeHtml(b.h1 || b.title)}" width="600" height="400" loading="lazy" decoding="async">
      <span class="bl-card-body">
        <span class="bl-card-cat">${h.escapeHtml(cat.name)}</span>
        <strong>${h.escapeHtml(b.h1 || b.title)}</strong>
        <span class="bl-card-facts">Serves ${h.escapeHtml(b.serves)} · ${h.escapeHtml(b.cost)}</span>
        <span class="bl-badges">${plain ? "" : single ? `<span class="bl-pill">Full plan · ${h.escapeHtml(single.price)}</span>` : `<span class="bl-pill is-book">Plan in the book</span>`}${badges.map((x) => `<span>${h.escapeHtml(x)}</span>`).join("")}</span>
      </span>
    </a>
  </li>`;
}

function itemListSchema(h, name, url, boards) {
  return `  <script type="application/ld+json">${h.jsonForScript({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: h.absoluteUrl(url),
    itemListElement: boards.map((b, i) => ({ "@type": "ListItem", position: i + 1, url: h.absoluteUrl(`/boards/${b.slug}/`), name: b.h1 || b.title }))
  })}</script>`;
}

function breadcrumbSchema(h, trail) {
  return `  <script type="application/ld+json">${h.jsonForScript({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: h.absoluteUrl(url) }))
  })}</script>`;
}

const FILTER_JS = `<script>
(() => {
  const root = document.querySelector('.bl-finder');
  if (!root) return;
  const grid = root.querySelector('#bl-all');
  const cards = grid ? [...grid.querySelectorAll('.bl-card')] : [...root.querySelectorAll('.bl-grid:not(.season-grid) .bl-card')];
  cards.forEach((c, i) => { c.dataset.i = i; });
  const count = root.querySelector('.bl-count');
  let cat = 'all', guests = 0, plant = false, plan = false, sort = 'rec';
  const more = root.querySelector('[data-bl-more]');
  const uncap = () => { if (grid) grid.classList.remove('bl-capped'); if (more) more.parentNode.hidden = true; };
  if (more) more.addEventListener('click', uncap);
  // The book that holds most boards in the chosen category (2 Nov 2026).
  const box = root.querySelector('[data-bl-bookbox]');
  let books = {};
  try { books = JSON.parse((root.querySelector('#bl-books-data') || {}).textContent || '{}'); } catch (e) {}
  const showBook = () => {
    if (!box) return;
    const b = books[cat];
    if (!b) { box.hidden = true; box.innerHTML = ''; return; }
    box.innerHTML = '<img src="' + b.cover + '" alt="" width="72" height="93" loading="lazy"><div><p class="eyebrow">Save with the book</p><p><strong>' + b.k + ' of these boards</strong> are in <a href="' + b.page + '">' + b.title + '</a>: ' + b.n + ' complete plans for ' + b.price + ', about ' + b.per + ' a board instead of $3.</p></div><a class="button primary" href="' + b.url + '" target="_blank" rel="noopener">Get the ebook · ' + b.price + '</a>';
    box.hidden = false;
  };
  const KEY = { rec: (c) => +c.dataset.i, cost: (c) => +c.dataset.cost, big: (c) => -(+c.dataset.guests), small: (c) => +c.dataset.guests, easy: (c) => +c.dataset.level * 1000 + +c.dataset.i };
  const order = () => {
    if (!grid) return;
    const k = KEY[sort] || KEY.rec;
    cards.slice().sort((a, b) => k(a) - k(b) || +a.dataset.i - +b.dataset.i).forEach((c) => grid.appendChild(c));
  };
  const apply = () => {
    let n = 0;
    for (const c of cards) {
      const show = (cat === 'all' || c.dataset.cat === cat) && (!plant || c.dataset.plant === '1') && (!plan || c.dataset.plan === '1') && (!guests || Number(c.dataset.guests) >= guests);
      c.hidden = !show; if (show) n++;
    }
    count.textContent = n + (n === 1 ? ' board' : ' boards');
    showBook();
  };
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter-cat]');
    if (!b) return;
    cat = b.dataset.filterCat;
    uncap();
    root.querySelectorAll('[data-filter-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  });
  const on = (id, ev, fn) => { const el = root.querySelector(id); if (el) el.addEventListener(ev, fn); };
  on('#bl-guests', 'change', (e) => { guests = Number(e.target.value); uncap(); apply(); });
  on('#bl-plant', 'change', (e) => { plant = e.target.checked; uncap(); apply(); });
  on('#bl-plan', 'change', (e) => { plan = e.target.checked; uncap(); apply(); });
  on('#bl-sort', 'change', (e) => { sort = e.target.value; order(); });
  apply();
})();
</script>`;

function finder(h, boards, { heading, intro, showFilters = true, crumb = "", extra = "", capped = false, books = null }) {
  const cats = BOARD_CATEGORIES.filter((c) => boards.some((b) => b.category === c.slug));
  const plans = boards.filter((b) => b.__plan).length;
  return `<section class="bl-finder">
  <div class="bl-inner">
    ${crumb}
    <p class="section-kicker">Board Library</p>
    <h1>${h.escapeHtml(heading)}</h1>
    <p class="bl-intro">${intro}</p>${extra}
    ${showFilters ? `<div class="bl-filters" role="group" aria-label="Filter boards">
      <button type="button" class="bl-chip" data-filter-cat="all" aria-pressed="true">All</button>
      ${cats.map((c) => `<button type="button" class="bl-chip" data-filter-cat="${c.slug}" aria-pressed="false">${h.escapeHtml(c.name)}</button>`).join("\n      ")}
    </div>
    <div class="bl-controls">
      <label>Guests <select id="bl-guests"><option value="0">Any</option><option value="2">2+</option><option value="8">8+</option><option value="12">12+</option><option value="16">16+</option><option value="20">20+</option></select></label>
      <label>Sort <select id="bl-sort"><option value="rec">Recommended</option><option value="cost">Lowest cost</option><option value="big">Most guests</option><option value="small">Fewest guests</option><option value="easy">Easiest first</option></select></label>
      ${plans ? `<label class="bl-check"><input type="checkbox" id="bl-plan"> $3 plan only</label>` : ""}
      <label class="bl-check"><input type="checkbox" id="bl-plant"> Plant-based only</label>
      <span class="bl-count" aria-live="polite"></span>
    </div>
    ${books ? `<div class="bl-bookbox" data-bl-bookbox hidden></div>
    <script type="application/json" id="bl-books-data">${h.jsonForScript(books)}</script>` : ""}` : `<div class="bl-controls"><span class="bl-count">${boards.length} boards</span></div>`}
    <ul class="bl-grid${capped && boards.length > 24 ? " bl-capped" : ""}" id="bl-all">
${boards.map((b) => card(b, h)).join("\n")}
    </ul>
    ${capped && boards.length > 24 ? `<p class="bl-more-wrap"><button type="button" class="button bl-more" data-bl-more>Show all ${boards.length} boards</button></p>` : ""}
    ${showFilters ? `<nav class="bl-cats" aria-label="Board categories"><span>Browse by category:</span> ${cats.map((c) => `<a href="/boards/${c.slug}/">${h.escapeHtml(c.name)}</a>`).join(" ")}</nav>` : `<nav class="bl-cats"><a href="/boards/">&larr; All boards</a></nav>`}
  </div>
</section>`;
}

// The Board Library (sales upgrade, 2 Nov 2026). The page's job is to sell
// board plans: $3 singles on Gumroad, the plan packs and the books.
//   1. A plain promise: what a $3 plan is, with a page from one.
//   2. Boards for this season.
//   3. All boards: plan-first order, sort, "$3 plan only", price pill on every
//      card, and the matching book offer when a category is chosen.
//   4. Plan packs, the books compared per board, a free sample plan, FAQ.
// opts.books: [{ key, title, cover, page, url, price, paperbackUrl, paperbackPrice, n }]
// opts.packs: [{ slug, title, image, price, save, separately, url, names: [] }]
export function boardsHub(h, boards, { season = "", books = [], packs = [], sample = "", planLook = "" } = {}) {
  const withPlan = boards.filter((b) => singleOf(h, b));
  const priced = new Set(withPlan.map((b) => b.slug));
  // Recommended order: boards with a $3 plan first, books mixed in turn.
  const ordered = [...mixBooks(boards.filter((b) => priced.has(b.slug))), ...mixBooks(boards.filter((b) => !priced.has(b.slug)))].map((b) => Object.assign(b, { __plan: priced.has(b.slug) }));
  const money = (s) => Number(String(s).replace(/[^0-9.]/g, ""));
  const per = (b) => { const c = Math.round((money(b.price) / b.n) * 100); return c < 100 ? `${c}¢` : `$${(c / 100).toFixed(2)}`; };
  const byKey = new Map(books.map((b) => [b.key, b]));
  // Category -> the book holding most of its boards.
  const bookFor = {};
  for (const c of BOARD_CATEGORIES) {
    const counts = {};
    boards.filter((b) => b.category === c.slug).forEach((b) => { counts[b.book] = (counts[b.book] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const bk = top && byKey.get(top[0]);
    if (bk) bookFor[c.slug] = { k: top[1], title: bk.title, page: bk.page, n: bk.n, price: bk.price, per: per(bk), cover: (h.thumb || ((x) => x))(bk.cover, "s"), url: h.withTracking ? h.withTracking(bk.url, `boards_hub_bookbox_${bk.key}`) : bk.url };
  }
  const lowest = Math.min(...withPlan.map((b) => money((singleOf(h, b) || {}).price || 3)));
  const faq = [
    ["What's in a $3 board plan?", "A printable PDF of about 5 pages: the exact shopping list for the board, with an amount and an estimated price for every item, where everything goes on the board step by step, the full timeline from the day before, and a swap for anything your store is out of."],
    ["How do I get it?", "Tap Get the full plan on any board. Checkout is on Gumroad, and the download link arrives by email straight away. The PDF also stays in your Gumroad library."],
    ["Can I print it or use it on my phone?", "Both. It prints on any home printer (US Letter) and reads fine on a phone at the store."],
    ["What if it's not what I expected?", "Reply to your Gumroad receipt within 30 days for a full refund. No forms."],
    ["Should I buy single plans or a book?", `If you'll make more than four or five boards, a book is cheaper: 50 Boards Built by Science is ${byKey.get("main") ? byKey.get("main").price : "$14"} for 50 plans. A single-plan receipt also includes a code for $3 off the book.`],
    ["Does every board have a $3 plan?", `${withPlan.length} of the ${boards.length} boards do. The rest, mostly the shaped showpiece boards, are planned in full in their book, and each board page says which.`]
  ];
  const promise = `<div class="bl-promise">
      ${planLook ? `<img class="bl-promise-look" src="${h.escapeHtml(planLook)}" alt="A page from a $3 board plan, partly blurred" width="800" height="600" loading="lazy" decoding="async">` : ""}
      <div>
        <p class="eyebrow">How the plans work</p>
        <ol class="bl-steps">
          <li><strong>Pick a board.</strong> ${boards.length} boards for 2 to 50 guests, each with a photo, what's on it and why it works.</li>
          <li><strong>Get its plan for $${lowest || 3}.</strong> A printable PDF with the shopping list, amounts, prices, where everything goes and the timeline.</li>
          <li><strong>Shop and build.</strong> Print it, or open it on your phone at the store.</li>
        </ol>
        <p class="bl-promise-fine">Instant download · 30-day refund · The receipt includes $3 off the full book</p>
      </div>
    </div>`;
  const packHtml = packs.length ? `<section class="bl-inner bl-section bl-packs" aria-labelledby="bl-packs-h">
    <h2 id="bl-packs-h">Plan packs: several boards, one price</h2>
    <p class="bl-note">Matched board plans in one download, for a season or an occasion.</p>
    <div class="bl-pack-grid">
      ${packs.map((p) => `<article class="bl-pack">
        <a href="/printables/${p.slug}/"><img src="${h.escapeHtml((h.thumb || ((x) => x))(p.image, "s"))}" alt="${h.escapeHtml(p.title)}" width="240" height="240" loading="lazy" decoding="async"></a>
        <div>
          <p class="eyebrow">${h.escapeHtml(p.price)} · save ${h.escapeHtml(p.save)}</p>
          <h3><a href="/printables/${p.slug}/">${h.escapeHtml(p.title)}</a></h3>
          <p>${h.escapeHtml(p.names.join(" · "))}</p>
          <p class="bl-pack-buy"><a class="button primary" href="${h.escapeHtml(h.withTracking ? h.withTracking(p.url, `boards_hub_pack_${p.slug}`) : p.url)}" target="_blank" rel="noopener">Get the pack · ${h.escapeHtml(p.price)}</a> <a class="fx-more" href="/printables/${p.slug}/">What's inside &rarr;</a></p>
        </div>
      </article>`).join("\n      ")}
    </div>
  </section>` : "";
  const bookHtml = books.length ? `<section class="bl-inner bl-section bl-books" aria-labelledby="bl-books-h">
    <h2 id="bl-books-h">Every plan in a book: the cheapest way per board</h2>
    <p class="bl-note">Single plans are $3 each. Each book holds the full plans for all its boards.</p>
    <div class="bl-book-grid">
      ${books.map((b) => `<article class="bl-bk">
        <a href="${b.page}"><img src="${h.escapeHtml((h.thumb || ((x) => x))(b.cover, "s"))}" alt="${h.escapeHtml(b.title)} cover" width="240" height="310" loading="lazy" decoding="async"></a>
        <h3><a href="${b.page}">${h.escapeHtml(b.title)}</a></h3>
        <p class="bl-bk-math"><strong>${b.n} boards</strong> · ebook ${h.escapeHtml(b.price)} · <span>${per(b)} a board</span></p>
        <p class="bl-bk-buy"><a class="button primary" href="${h.escapeHtml(h.withTracking ? h.withTracking(b.url, `boards_hub_book_${b.key}`) : b.url)}" target="_blank" rel="noopener">Ebook · ${h.escapeHtml(b.price)}</a>${b.paperbackUrl ? `<a class="fx-more" href="${h.escapeHtml(b.paperbackUrl)}" target="_blank" rel="noopener">Paperback · ${h.escapeHtml(b.paperbackPrice)}</a>` : ""}</p>
      </article>`).join("\n      ")}
    </div>
  </section>` : "";
  const sampleHtml = sample ? `<section class="bl-inner bl-section bl-sample" aria-labelledby="bl-sample-h">
    <div class="bl-sample-inner">
      <img src="/images/book/look-shopping-list-sm.webp" alt="The shopping list page from the free Board 01 plan" width="360" height="466" loading="lazy" decoding="async">
      <div>
        <p class="eyebrow">Free · see a full plan first</p>
        <h2 id="bl-sample-h">Try one plan free: the Classic American Starter</h2>
        <p>The complete 11-page plan for Board 01, the same format as every $3 plan: shopping list with amounts and prices, timed build, placement and swaps.</p>
        ${sample}
      </div>
    </div>
  </section>` : "";
  const faqHtml = `<section class="bl-inner bl-section" aria-labelledby="bl-faq-h">
    <h2 id="bl-faq-h">Questions about the plans</h2>
    <div class="ebook-faq-list">
      ${faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${h.escapeHtml(q)}</summary><p>${h.escapeHtml(a)}</p></details>`).join("\n      ")}
    </div>
  </section>`;
  return h.layout({
    title: `Charcuterie Board Ideas: ${boards.length} Boards for Every Occasion | Charcuterie Lab`,
    canonical: "/boards/",
    image: boards.find((b) => !b.placeholder)?.image,
    description: `${boards.length} charcuterie board ideas for every occasion, holiday, diet and budget. Each board shows what goes on it, how much to buy and why it works.`,
    head: `${itemListSchema(h, "Charcuterie Lab Board Library", "/boards/", boards)}\n${breadcrumbSchema(h, [["Boards", "/boards/"]])}
  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) })}</script>`,
    body: `<main class="bl-main">
${finder(h, ordered, { heading: "Charcuterie board ideas for every occasion", intro: `Browse ${boards.length} boards free. When you find the one, get its printable plan for $3: the exact shopping list with amounts and prices, where everything goes, and the timeline.`, capped: true, books: bookFor, extra: `\n    ${promise}${season ? `\n    ${season}` : ""}\n    <h2 class="bl-all-h">All ${boards.length} boards</h2>\n    <p class="bl-all-sub">Still choosing a theme? See <a href="/blog/charcuterie-board-ideas/">50 boards by cost and time</a> or the <a href="/holidays/">holiday boards</a>, and size any board with the <a href="/party-planner/">Party Planner</a>.</p>` })}
${packHtml}
${bookHtml}
${sampleHtml}
${faqHtml}
${h.labNext("boards_hub", { skip: ["book"], heading: "Plan your own" })}
</main>
${FILTER_JS}`
  });
}

// Alt text for the board photo (10 Nov 2026). "<name>: the finished board"
// said nothing about the picture, and board searches are image-led, so the
// alt now names the board and the first few things actually on it. Item names
// keep their own capitalisation (Parmigiano-Reggiano, Époisses) and lose any
// "or ..." alternative, bracket or pairing note, which belong on the page and
// not in alt text.
function boardAlt(b) {
  if (b.image_alt) return b.image_alt;
  const items = [];
  for (const g of b.groups || []) {
    for (const it of g.items || []) {
      const n = String(it.name || "")
        .replace(/\s*[(\u00b7\u2013\u2014].*$/, "")
        .replace(/\s+\bor\b\s+.*$/i, "")
        .replace(/,\s*(sliced|cubed|torn|halved|whole|aged|about)\b.*$/i, "")
        .replace(/\s+\b(plus|mixed with)\b\s+.*$/i, "")
        .trim();
      if (n && !items.some((x) => x.toLowerCase() === n.toLowerCase())) items.push(n);
      if (items.length >= 5) break;
    }
    if (items.length >= 5) break;
  }
  const name = b.h1 || b.title || "Charcuterie board";
  if (!items.length) return `${name}, photographed for Charcuterie Lab`;
  let picked = items;
  while (picked.length > 2 && `${name}: ${picked.join(", ")}`.length > 125) picked = picked.slice(0, -1);
  const list = picked.length > 1 ? `${picked.slice(0, -1).join(", ")} and ${picked[picked.length - 1]}` : picked[0];
  return `${name}: ${list}`;
}

export function boardCategoryPage(h, cat, boards) {
  if (h.categoryPages && h.categoryPages[cat.slug]) return ideasPage(h, cat, boards, h.categoryPages[cat.slug]);
  return h.layout({
    title: `${cat.title || `${cat.name} Charcuterie Boards`} | Charcuterie Lab`,
    canonical: `/boards/${cat.slug}/`,
    image: boards.find((b) => !b.placeholder)?.image,
    description: cat.seo_description || `${cat.intro} Each with what goes on it, why it works and a full printable plan.`.slice(0, 300),
    head: `${itemListSchema(h, `${cat.name} charcuterie boards`, `/boards/${cat.slug}/`, boards)}\n${breadcrumbSchema(h, [["Boards", "/boards/"], [cat.name, `/boards/${cat.slug}/`]])}`,
    body: `<main class="bl-main">
${finder(h, boards, { heading: `${cat.name} boards`, intro: cat.intro, showFilters: false, crumb: `<p class="ing-crumb"><a href="/boards/">Boards</a> <span aria-hidden="true">/</span> ${h.escapeHtml(cat.name)}</p>` })}
${h.labNext(`boards_${cat.slug}`, { skip: ["book"], heading: "Plan your own" })}
</main>`
  });
}

export function worldOffer(h, campaign, { heading = "Get the full blueprint", lead = "" } = {}) {
  const W = WORLD_BOOK;
  const buy = worldIsLive(W);
  return `<section class="bl-book bl-world" aria-labelledby="bl-book-title">
      <div>
        <p class="eyebrow">${buy ? "New book" : `Coming ${h.escapeHtml(W.launch)}`}</p>
        <h2 id="bl-book-title">${h.escapeHtml(heading)}</h2>
        <p>${lead || `This board's exact shopping list with amounts and prices, the prep countdown, all seven placement steps, five swaps and five upgrades are in <em>${h.escapeHtml(W.title)}</em>, with 15 more international boards.`}</p>
        ${buy
          ? `<div class="book-buy">${W.ebookUrl ? `<a class="button primary" href="${h.escapeHtml(W.ebookUrl)}" target="_blank" rel="noopener">Get the ebook${W.ebookPrice ? ` · ${W.ebookPrice}` : ""}</a>` : ""}${W.paperbackUrl ? `<a class="button book-buy-print" href="${h.escapeHtml(W.paperbackUrl)}" target="_blank" rel="noopener">Paperback on Amazon${W.paperbackPrice ? ` · ${W.paperbackPrice}` : ""}</a>` : `<span class="bl-note">Paperback on Amazon coming soon.</span>`}</div>`
          : `<div class="book-buy"><a class="button primary" href="${h.newsletterHref(campaign)}" target="_blank" rel="noopener">Tell me on launch day</a><a class="button book-buy-print" href="/around-the-world/">See what's inside</a></div>
        <p class="bl-note">Free newsletter signup. One email when the book is out, plus the weekly Lab Report.</p>`}
      </div>
    </section>`;
}

// The book-1 board behind a Board Library page (number "B1-20" is board #20).
function bookBoardOf(h, board) {
  if (!h.bookBoards || board.book !== "main" || !/^B1-\d\d$/.test(board.number || "")) return null;
  return h.bookBoards.get(Number(board.number.slice(3))) || null;
}

// Books 4, 5 and 7: the board page's "which book it's in" box (26 Oct 2026).
const SERIES = {
  two: { B: TWO_BOOK, what: "the shopping list for two with amounts and prices, the prep countdown, the step-by-step build and the drink to pour", more: "24 more boards for two" },
  keto: { B: KETO_BOOK, what: "the shopping list with the net carbs of every item, full macros per serving, the step-by-step build and the carb traps to avoid", more: "19 more keto boards" },
  impossible: { B: IMPOSSIBLE_BOOK, what: "the full shopping list, the layout, all eight build steps with the trick that makes the shape work, and easy, budget and luxe versions", more: "24 more showpiece boards" }
};
// Book box for a category ideas page backed by a series book (two, keto, impossible), 1 Nov 2026
export function seriesHubBox(h, key, campaign) {
  const S = SERIES[key];
  if (!S || !S.B || !S.B.ebookUrl) return "";
  const B = S.B;
  const url = h.withTracking ? h.withTracking(B.ebookUrl, campaign) : B.ebookUrl;
  return `<section class="bl-book" aria-labelledby="bl-book-title">
      <img src="${h.escapeHtml((h.thumb || ((x) => x))(B.cover, "s"))}" alt="" width="160" height="207" loading="lazy" decoding="async">
      <div>
        <p class="eyebrow">Every board, fully planned</p>
        <h2 id="bl-book-title">Get them all in one book</h2>
        <p>The boards on this page are in <em>${h.escapeHtml(B.title)}</em>. The book has ${S.what} for each one. Or get a single board's printable plan for $3 from its page.</p>
        <div class="book-buy">
          <a class="button primary" href="${h.escapeHtml(url)}" target="_blank" rel="noopener">Get the ebook · ${B.ebookPrice}</a>
          ${B.paperbackUrl ? `<a class="button book-buy-print" href="${B.paperbackUrl}" target="_blank" rel="noopener">Paperback on Amazon · ${B.paperbackPrice}</a>` : ""}
        </div>
      </div>
    </section>`;
}
function seriesOffer(h, board) {
  const S = SERIES[board.book];
  const B = S.B;
  const url = h.withTracking ? h.withTracking(B.ebookUrl, `board_${board.slug}`) : B.ebookUrl;
  return `<section class="bl-book" aria-labelledby="bl-book-title">
      <img src="${h.escapeHtml((h.thumb || ((x) => x))(B.cover, "s"))}" alt="" width="160" height="207" loading="lazy" decoding="async">
      <div>
        <p class="eyebrow">The book it's in</p>
        <h2 id="bl-book-title">Build it exactly, with the book</h2>
        <p>This board is in <em>${h.escapeHtml(B.title)}</em>, with ${S.more}. The book has ${S.what}.</p>
        <div class="book-buy">
          <a class="button primary" href="${h.escapeHtml(url)}" target="_blank" rel="noopener">Get the ebook · ${B.ebookPrice}</a>
          ${B.paperbackUrl ? `<a class="button book-buy-print" href="${B.paperbackUrl}" target="_blank" rel="noopener">Paperback on Amazon · ${B.paperbackPrice}</a>` : ""}
        </div>
      </div>
    </section>`;
}

function bookOffer(h, board) {
  if (SERIES[board.book]) return seriesOffer(h, board);
  if (board.book === "world") return worldOffer(h, `board_${board.slug}`, { heading: "Build it exactly, with the new book" });
  if (board.book === "plant") {
    return `<section class="bl-book" aria-labelledby="bl-book-title">
      <img src="${h.escapeHtml((h.thumb || ((x) => x))(board.image))}" alt="" width="220" height="146" loading="lazy" decoding="async">
      <div>
        <p class="eyebrow">The full blueprint</p>
        <h2 id="bl-book-title">Build it exactly, with the plant-based book</h2>
        <p>This board's exact shopping list with amounts and prices, the step-by-step build and every swap are in <em>${h.escapeHtml(PLANT_BOOK.title)}</em>, with 14 more plant-based boards.</p>
        <div class="book-buy">
          <a class="button primary" href="${h.withTracking ? h.withTracking(PLANT_BOOK.ebookUrl, `board_${board.slug}`) : PLANT_BOOK.ebookUrl}" target="_blank" rel="noopener">Get the ebook · ${PLANT_BOOK.ebookPrice}</a>
          <a class="button book-buy-print" href="${PLANT_BOOK.paperbackUrl || PLANT_BOOK.kindleUrl}" target="_blank" rel="noopener">${PLANT_BOOK.paperbackUrl ? `Paperback on Amazon · ${PLANT_BOOK.paperbackPrice}` : `Kindle on Amazon · ${PLANT_BOOK.kindlePrice}`}</a>
        </div>
      </div>
    </section>`;
  }
  const bb = bookBoardOf(h, board);
  if (bb && h.bookCard) {
    return h.bookCard(bb, `board_${board.slug}`, { lead: `This board is in the book, with the full plan: the exact shopping list with amounts and prices, the 7-step build with where every item goes and why, and a swap for every ingredient. Plus 49 more boards.` }).replace('<aside class="fx-book"', '<aside id="bl-book-title" class="fx-book"')
      // Fewer buttons (8 Nov 2026): the $3 plan already has its button at the top and under the list, so the book card sells just the book.
      .replace(/<p class="fx-single">[\s\S]*?<\/p>/g, "");
  }
  return `<section class="bl-book" aria-labelledby="bl-book-title">
      <img src="${(h.thumb || ((x) => x))("/images/book-cover.jpg", "s")}" alt="" width="160" height="207" loading="lazy" decoding="async">
      <div>
        <p class="eyebrow">The full blueprint</p>
        <h2 id="bl-book-title">Build it exactly, with the book</h2>
        <p>This board's exact shopping list with amounts and prices, the 7-step build and every substitution are in <em>${h.escapeHtml(h.bookTitle)}</em>, with 49 more boards.</p>
        ${h.bookButtons(`board_${board.slug}`)}
      </div>
    </section>`;
}

// Board pages went live 23 Sep; a board file can override with "date" / "updated".
const BOARD_PUBLISHED = "2026-09-23";
const BOARD_UPDATED = "2026-09-26";

// recipeCuisine from the board slug; occasion boards default to American.
const CUISINES = [
  [/italian|antipasto/, "Italian"], [/spanish|tapas/, "Spanish"], [/portuguese/, "Portuguese"],
  [/french|brasserie/, "French"], [/greek/, "Greek"], [/mediterranean/, "Mediterranean"], [/turkish/, "Turkish"],
  [/mezze|middle-eastern/, "Middle Eastern"], [/moroccan/, "Moroccan"], [/german|bavarian/, "German"],
  [/swiss/, "Swiss"], [/british|ploughman/, "British"], [/scandinavian/, "Scandinavian"],
  [/eastern-european/, "Eastern European"], [/japanese/, "Japanese"], [/korean/, "Korean"],
  [/dim-sum/, "Chinese"], [/thai/, "Thai"], [/vietnamese/, "Vietnamese"], [/indian/, "Indian"],
  [/plant-based-asian/, "Asian"], [/tex-mex/, "Tex-Mex"], [/mexican/, "Mexican"],
  [/argentine/, "Argentine"], [/brazilian/, "Brazilian"], [/peruvian/, "Peruvian"],
  [/caribbean/, "Caribbean"], [/st-patricks/, "Irish"], [/southern-bbq/, "Southern American"]
];
const cuisineOf = (b) => b.cuisine || (CUISINES.find(([re]) => re.test(b.slug)) || [, "American"])[1];

function recipeSchema(h, b) {
  const pageUrl = h.absoluteUrl(`/boards/${b.slug}/`);
  const minutes = Number((b.prep_time || "").match(/(\d+)(?=\s*min)/)?.[1] || 0);
  return `  <script type="application/ld+json">${h.jsonForScript({
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: b.h1,
    description: b.description,
    ...(b.placeholder ? {} : { image: [h.absoluteUrl(b.image)] }),
    author: h.authorRef || { "@type": "Organization", name: "Charcuterie Lab", url: h.absoluteUrl("/") },
    datePublished: b.date || BOARD_PUBLISHED,
    dateModified: b.updated || BOARD_UPDATED,
    recipeCategory: "Appetizer",
    recipeCuisine: cuisineOf(b),
    recipeYield: `${b.serves} people`,
    ...(minutes ? { prepTime: `PT${minutes}M`, totalTime: `PT${minutes}M` } : {}),
    keywords: [b.h1.toLowerCase(), "charcuterie board", catOf(b).name.toLowerCase()].join(", "),
    // Names only, matching the free "What's on the board" list (8 Nov 2026).
    recipeIngredient: (b.groups || []).flatMap((g) => g.items.map((i) => i.name)),
    recipeInstructions: b.timeline.map((t, k) => ({ "@type": "HowToStep", position: k + 1, name: t.when, text: t.what, url: `${pageUrl}#step-${k + 1}` }))
  })}</script>`;
}

function faqSchemaFor(h, b) {
  return `  <script type="application/ld+json">${h.jsonForScript({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: b.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
  })}</script>`;
}

const ANIMAL = /\b(cheese|cheeses|brie|blue|gorgonzola|cheddar|gouda|parm\w*|prosciutto|salami|ham|pork|beef|meat|butter|cream|milk|honey|dairy)\b/i;

function firstPairing(board, notes, bySlug) {
  const slugs = boardSlugsFor(board);
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      const key = [slugs[i], slugs[j]].sort().join("|");
      // a plant board can't point at a note that talks about cheese or meat
      if (notes[key] && board.book === "plant" && ANIMAL.test(notes[key])) continue;
      if (notes[key]) return { a: bySlug.get(slugs[i]), b: bySlug.get(slugs[j]), text: notes[key] };
    }
  }
  return null;
}

// Free amounts (12 Oct 2026): boards with a cheese group and a meat group show
// how much to buy for the middle of their serving range, from the same
// 2/3/4 oz rule as the Party Planner. The book and the $3 plan keep the
// exact shopping list, prices and placement.
function boardAmounts(h, b) {
  const cheeseG = b.groups.filter((g) => /^chees/i.test(g.name));
  const meatG = b.groups.filter((g) => /meat/i.test(g.name));
  if (!cheeseG.length || !meatG.length) return "";
  const nums = String(b.serves || "").match(/\d+/g);
  if (!nums) return "";
  const n = Math.max(2, Math.round(nums.map(Number).reduce((a, x) => a + x, 0) / nums.length));
  const P = partyPlan(n, "main");
  const nc = cheeseG.reduce((a, g) => a + g.items.length, 0);
  const nm = meatG.reduce((a, g) => a + g.items.length, 0);
  const each = (oz, k) => (k > 1 ? `, about ${Math.max(2, Math.round(oz / k))} oz of each of the ${k}` : "");
  const near = PARTY_COUNTS_B.reduce((a, x) => (Math.abs(x - n) < Math.abs(a - n) ? x : a), PARTY_COUNTS_B[0]);
  return `<div class="bl-amounts">
        <h3>How much to buy for ${n} guests</h3>
        <p class="bl-amounts-sub">When the board is the party food. Before a dinner, buy about a third less.</p>
        <table><tbody>
          <tr><th scope="row">Cheese</th><td>${P.cheese} in total${each(P.cheeseOz, nc)}</td></tr>
          <tr><th scope="row">Meat</th><td>${P.meat} in total${each(P.meatOz, nm)}</td></tr>
          <tr><th scope="row">Crackers and bread</th><td>${P.crackers[0]}–${P.crackers[1]} pieces</td></tr>
          <tr><th scope="row">Fruit</th><td>${P.fruit}</td></tr>
          <tr><th scope="row">Olives and pickles</th><td>${P.briny}</td></tr>
          <tr><th scope="row">Nuts</th><td>${P.nuts}</td></tr>
        </tbody></table>
        <p class="bl-amounts-more">Different guest count? <a href="${partyUrlB(near)}">Party Planner for ${near} people</a>. Exact amounts per item, prices and where everything goes are in the full plan.</p>
      </div>`;
}

// Board pages are the free pitch for the $3 plan (18 Oct 2026). Since the
// evening of 18 Oct they list every item by name (for search and AI answers),
// but the amounts, prices, placement and full timeline stay in the plan.
const TEASE_STEPS = 2;
function singleOf(h, b) {
  if (b.book === "main") return (bookBoardOf(h, b) || {}).single || null;
  return (h.bookSingles && h.bookSingles[b.slug]) || null;
}
// What the $3 plan holds, by book (26 Oct 2026: Keto, Two and Impossible plans joined).
function planPoints(b, steps) {
  const guests = b.serves === "2" ? "two" : `${b.serves} guests`;
  if (b.book === "impossible") return [
    `The full shopping list for ${b.serves} guests, with amounts`,
    "The layout, and the one trick that makes the shape work",
    "All eight build steps, plus the prep timeline from the day before",
    "Easy, budget, luxe, kid-friendly and gluten-free versions"
  ];
  return [
    `The exact shopping list for ${guests}, with an amount and an estimated price for every item${b.book === "keto" ? ", plus its net carbs" : ""}`,
    b.book === "keto" ? "Net carbs, protein and calories per serving" : "Where every item goes on the board, step by step, and why",
    `The full ${steps}-step timeline, from fridge to table`,
    b.book === "two" ? "The drink to pour, and a swap for anything your store is out of" : "A swap for anything your store is out of, plus optional upgrades"
  ];
}
function planBox(h, b, single) {
  const steps = b.timeline.length;
  const look = h.planLook ? h.planLook(b) : "";
  return `<section class="bl-section bl-plan" aria-labelledby="bl-plan-title">
      <div class="bl-plan-inner">
        ${look ? `<img class="bl-plan-look" src="${h.escapeHtml(look)}" alt="A page from the ${h.escapeHtml(b.h1)} plan, partly blurred" width="800" height="600" loading="lazy" decoding="async">` : ""}
        <div>
          <p class="eyebrow">The full plan · ${h.escapeHtml(single.price)} · ${single.pages || 5}-page printable PDF</p>
          <h2 id="bl-plan-title">Build this exact board</h2>
          <p>This page shows what the board is and why it works. The plan is what you take to the store and the counter:</p>
          <ul class="bl-plan-list">
            ${planPoints(b, steps).map((x) => `<li>${h.escapeHtml(x)}</li>`).join("\n            ")}
          </ul>
          <p class="bl-cta-row"><a class="button primary" href="${h.escapeHtml(h.withTracking ? h.withTracking(single.url, `board_plan_${b.slug}`) : single.url)}" target="_blank" rel="noopener">Get the full plan · ${h.escapeHtml(single.price)}</a>
          <span>Instant PDF · 30-day refund. ${(b.groups || []).some((g) => g.items && g.items.length) ? `<a href="#bl-on">See everything on the board &darr;</a>` : ""}</span></p>
        </div>
      </div>
    </section>`;
}

// "What's on the board" (8 Nov 2026): every item by group, free, linked to
// its ingredient page and, where a buying guide covers it, our #1 brand. The
// $3 plan (or the book) keeps the amount and price of each item, where it
// goes and the full timeline. The free totals table sits under the list.
// "Our pick" only shows when the Best Buys pick is clearly the same food as the
// board item (a guide can cover several ingredients, and its top pick is for one).
const PICK_STOP = new Set("a and or of the for with plus to de di la le board more optional month months about style cubed dry dried aged sharp white orange yellow golden fresh thin sliced small large block round wheel wedge wedges mild smoked extra local pitted plain good whole store brand domestic thick mini log logs ball oz lb".split(" "));
const PICK_GENERIC = new Set("cheese cracker chip olive mustard honey jam sausage nut".split(" "));
const PICK_ALIAS = [[/affinois/i, "brie"], [/salumeria/i, "salami"], [/membrillo/i, "quince paste"], [/cochons/i, "pate"], [/chenel/i, "chevre"], [/parmigiano/i, "parmesan"]];
const pickWords = (t) => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z]+/).filter((w) => w.length > 1).map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
export function pickFits(item, pick) {
  if (/\bdip\b/i.test(pick) && !/\bdip\b/i.test(item)) return false;
  if (/di parma/i.test(item) && !/parma/i.test(pick)) return false; // a protected name needs the real thing
  // A pick that is a different style of the same food (8 Nov 2026).
  for (const re of [/praline|candied/i, /crisps?\b/i, /\baged\b|1000 day/i]) if (re.test(pick) && !re.test(item)) { if (re.source.includes("aged") ? /baby|young|mild|fresh/i.test(item) : true) return false; }
  const CHEESE = /cheddar|parmesan|parmigiano|gouda|swiss|brie|havarti|manchego|provolone|mozzarella|feta|asiago|pecorino|gruy[eè]re|stilton|gorgonzola/gi;
  const inItem = new Set((item.match(CHEESE) || []).map((w) => w.toLowerCase()));
  const inPick = (pick.match(CHEESE) || []).map((w) => w.toLowerCase());
  if (inItem.size && inPick.length && !inPick.some((w) => inItem.has(w) || (w.startsWith("parm") && [...inItem].some((x) => x.startsWith("parm"))))) return false;
  if (/vegan|cashew|plant|dairy-free|coconut/i.test(item) && !/vegan|dairy-free|plant/i.test(pick)) return false;
  const P = new Set(pickWords(pick + " " + PICK_ALIAS.filter(([re]) => re.test(pick)).map(([, w]) => w).join(" ")));
  const S = pickWords(item).filter((w) => !PICK_STOP.has(w));
  if (!S.length) return false;
  const N = S.filter((w) => !PICK_GENERIC.has(w));
  return N.length ? N.some((w) => P.has(w)) : S.every((w) => P.has(w));
}

function onBoard(h, b, known, single) {
  const groups = (b.groups || []).filter((g) => g.items && g.items.length);
  if (!groups.length) return "";
  const n = groups.reduce((a, g) => a + g.items.length, 0);
  const item = (i) => {
    const name = known.has(i.slug) ? `<a href="/ingredients/${i.slug}/">${h.escapeHtml(i.name)}</a>` : h.escapeHtml(i.name);
    // 9 Nov 2026: no "Our pick" shopping links here. A board page sells one thing, its plan.
    const best = null;
    return `<li>${name}${best ? ` <a class="bl-on-pick" href="/blog/${best.slug}/">Our pick: ${h.escapeHtml(best.pick)}</a>` : ""}</li>`;
  };
  const href = single ? (h.withTracking ? h.withTracking(single.url, `board_list_${b.slug}`) : single.url) : "";
  return `<section class="bl-section bl-on" aria-labelledby="bl-on">
      <h2 id="bl-on">What's on the board</h2>
      <p class="bl-note">All ${n} items, by group. The full plan adds the amount and price of each one, where it goes on the board, and the build steps.</p>
      <div class="bl-on-groups">
        ${groups.map((g) => `<div class="bl-on-g"><h3>${h.escapeHtml(g.name)} <span>${g.items.length}</span></h3><ul>${g.items.map(item).join("")}</ul></div>`).join("\n        ")}
      </div>
      ${boardAmounts(h, b)}
      <p class="bl-on-cta">${single ? `<a class="button primary" href="${h.escapeHtml(href)}" target="_blank" rel="noopener">Get the shopping list with amounts · ${h.escapeHtml(single.price)}</a>` : `<a class="button primary" href="#bl-book-title">Get the full plan</a>`}</p>
    </section>`;
}

// Board pages sell one thing (9 Nov 2026): the board's own $3 plan, or the
// book where there is no plan yet. No Amazon buttons, no other products.
const noAmazon = (html) => html.replace(/<a\b[^>]*href="https?:\/\/(?:www\.)?amazon\.[^"]*"[^>]*>[\s\S]*?<\/a>\s*/g, "");

// Phones: a bar for the plan once the reader is past the hero (9 Nov 2026).
function planSticky(h, b, single) {
  const href = h.withTracking ? h.withTracking(single.url, `board_sticky_${b.slug}`) : single.url;
  return `<div class="fx-sticky bl-sticky" data-bl-sticky hidden>
    <a href="${h.escapeHtml(href)}" target="_blank" rel="noopener"><strong>Build this exact board</strong><span>Full plan · ${h.escapeHtml(single.price)}</span></a>
    <button type="button" aria-label="Close" data-fx-close>&times;</button>
  </div>
  <script>(function(){var b=document.querySelector("[data-bl-sticky]");if(!b)return;var k="bl-sticky-closed";try{if(sessionStorage.getItem(k))return}catch(e){}var mq=window.matchMedia("(max-width: 760px)");var hero=document.querySelector(".bl-hero .bl-cta-row");function on(){var past=hero?hero.getBoundingClientRect().bottom<0:window.scrollY>600;var more=document.getElementById("bl-signup-title")||document.getElementById("bl-more");var end=more?more.getBoundingClientRect().top<window.innerHeight:false;b.hidden=!(mq.matches&&past&&!end)}window.addEventListener("scroll",on,{passive:true});b.querySelector("[data-fx-close]").addEventListener("click",function(){b.remove();window.removeEventListener("scroll",on);try{sessionStorage.setItem(k,"1")}catch(e){}})})();</script>`;
}

// For readers who aren't hosting yet (9 Nov 2026): the free Cheat Sheet for an
// email, on the page, near the end. The plan stays the only thing for sale.
function boardSignup(h, b) {
  return `<section class="bl-section bl-signup" aria-labelledby="bl-signup-title">
      <img class="fx-hi-img" src="${h.escapeHtml((h.thumb || ((x) => x))("/images/charcuterie-cheat-sheet.webp", "s"))}" alt="" width="64" height="83" loading="lazy" decoding="async">
      <div class="bl-signup-copy">
        <p class="eyebrow">Not hosting yet?</p>
        <h2 id="bl-signup-title">Get the free Charcuterie Cheat Sheet</h2>
        <p>How much to buy for 4 to 50 guests, the build order and four pairing rules, on two pages. Then one board idea a week in the Lab Report, so this board is in your inbox when the party gets close.</p>
      </div>
      <div class="bl-signup-form">
        ${qsForm({ id: "qs-board", fb: CHEAT, keep: true, button: "Send it free", note: "Free PDF now, then one board idea a week. Leave any time." })}
      </div>
    </section>
${QS_JS}`;
}

export function boardPage(h, b, { all, bySlug, notes, blogTitles }) {
  const cat = catOf(b);
  const known = new Set(bySlug.keys());
  const pair = firstPairing(b, notes, bySlug);
  const related = all.filter((x) => x.slug !== b.slug && x.category === b.category).slice(0, 3);
  const fill = related.length < 3 ? all.filter((x) => x.slug !== b.slug && !related.includes(x)).slice(0, 3 - related.length) : [];
  const blogs = (b.blog || []).filter((s) => blogTitles.has(s));
  const glance = [["Serves", b.serves], ["Board", plain(b.board_size)], ["Prep", b.prep_time], ["Cost", b.cost], ["Level", b.difficulty]];
  const single = singleOf(h, b);
  const steps = b.timeline.slice(0, TEASE_STEPS);
  const visible = { ...b, timeline: steps };
  const hub = h.categoryPages && h.categoryPages[cat.slug];
  // Scannable format (Oct 20 2026): jump links, compact ingredient rows, bold lead-ins.
  const offer = noAmazon(bookOffer(h, b));
  const planId = single ? "bl-plan-title" : offer.includes('id="bl-book-title"') ? "bl-book-title" : "";
  // Sales layout (26 Oct 2026): the $3 plan (or, with no $3 plan yet, the book)
  // sits right under the hero; the item list, the printable card and the
  // newsletter are gone; the book the board is in closes the page.
  const onList = onBoard(h, b, known, single);
  const jump = [...(planId ? [["The plan", planId]] : []), ...(onList ? [["What's on it", "bl-on"]] : []), ["Why it works", "bl-why"], ["Timeline", "bl-when"], ["Questions", "bl-faq"]];
  const lead = (t) => { const m = String(t).match(/^(.*?[.!?])(\s+[\s\S]*)?$/); return m ? `<strong>${h.escapeHtml(m[1])}</strong>${h.escapeHtml(m[2] || "")}` : h.escapeHtml(t); };

  return h.layout({
    title: `${b.seo_title} | Charcuterie Lab`,
    canonical: `/boards/${b.slug}/`,
    image: b.placeholder ? undefined : b.image,
    type: "article",
    description: b.description,
    head: `${recipeSchema(h, visible)}\n${breadcrumbSchema(h, [["Boards", "/boards/"], [cat.name, `/boards/${cat.slug}/`], [b.h1, `/boards/${b.slug}/`]])}\n${faqSchemaFor(h, b)}`,
    body: `<main class="bl-main bl-board">
  <div class="bl-inner">
    <p class="ing-crumb"><a href="/boards/">Boards</a> <span aria-hidden="true">/</span> <a href="/boards/${cat.slug}/">${h.escapeHtml(cat.name)}</a> <span aria-hidden="true">/</span> ${h.escapeHtml(b.h1)}</p>
    <header class="bl-hero">
      <p class="section-kicker">${h.escapeHtml(cat.name)}${b.book === "plant" && cat.slug !== "plant-based" ? " · 100% plant-based" : ""}</p>
      <h1>${h.escapeHtml(b.h1)}</h1>
      <p class="bl-lede">${h.escapeHtml(b.hook)}</p>
      ${h.byline ? `<p class="bl-byline">${h.byline(h.longDate ? ` · Updated ${h.longDate(b.updated || BOARD_UPDATED)}` : "")}</p>` : ""}
      <img class="bl-photo" src="${h.escapeHtml(b.image)}" alt="${h.escapeHtml(boardAlt(b))}" width="1200" height="800" fetchpriority="high">
      <dl class="bl-glance">
        ${glance.filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${h.escapeHtml(v)}</dd></div>`).join("\n        ")}
      </dl>
      <p class="bl-cta-row">
        ${single
          ? `<a class="button primary" href="${h.escapeHtml(h.withTracking ? h.withTracking(single.url, `board_hero_${b.slug}`) : single.url)}" target="_blank" rel="noopener">Get the full plan · ${h.escapeHtml(single.price)}</a>
        <span>Shopping list with amounts, placement and timeline. <a href="#bl-plan-title">What's inside</a></span>`
          : `<a class="button primary" href="#bl-book-title">Get the full plan</a>
        <span>Shopping list with amounts, placement and timeline.</span>`}
      </p>
      <nav class="bl-jump" aria-label="On this page">${jump.map(([t, id]) => `<a href="#${id}">${t}</a>`).join("")}</nav>
    </header>
<!--no-offers-->
    ${single ? planBox(h, b, single) : offer}

    ${onList}

    <section class="bl-section" aria-labelledby="bl-why">
      <h2 id="bl-why">Why it works</h2>
      ${b.why.map((p) => `<p>${lead(p)}</p>`).join("\n      ")}
      ${pair ? `<aside class="bl-pair"><p class="eyebrow">The bite to try first</p><p><strong><a href="/ingredients/${pair.a.slug}/">${h.escapeHtml(pair.a.title)}</a> + <a href="/ingredients/${pair.b.slug}/">${h.escapeHtml(pair.b.title)}</a></strong> ${h.escapeHtml(pair.text)}</p></aside>` : ""}
    </section>

    <section class="bl-section" aria-labelledby="bl-when">
      <h2 id="bl-when">Timeline</h2>
      <ol class="bl-timeline">
        ${steps.map((t, k) => `<li id="step-${k + 1}"><b>${h.escapeHtml(t.when)}</b><span>${h.escapeHtml(t.what)}</span></li>`).join("\n        ")}
        ${b.timeline.length > steps.length ? `<li class="bl-more-steps"><b>+ ${b.timeline.length - steps.length} more steps</b><span>The rest of the timeline and the step-by-step placement are in the full plan.</span></li>` : ""}
      </ol>
    </section>

    <section class="bl-section" aria-labelledby="bl-faq">
      <h2 id="bl-faq">Questions</h2>
      <div class="ebook-faq-list">
        ${b.faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${h.escapeHtml(f.q)}</summary><p>${h.escapeHtml(f.a)}</p></details>`).join("\n        ")}
      </div>
    </section>

    ${boardSignup(h, b)}

    <section class="bl-section" aria-labelledby="bl-more">
      <h2 id="bl-more">More boards</h2>
      <ul class="bl-grid bl-grid-3">
${[...related, ...fill].map((x) => card(x, h, { plain: true })).join("\n")}
      </ul>
      ${blogs.length ? `<p class="bl-note">Want more ideas? Read ${blogs.map((s) => `<a href="/blog/${s}/">${h.escapeHtml(blogTitles.get(s))}</a>`).join(" or ")}.</p>` : ""}
      ${hub ? `<p class="bl-note">More ideas: <a href="/boards/${cat.slug}/">${h.escapeHtml(hub.link_text || hub.h1)}</a></p>` : ""}
      <p class="bl-note"><a href="/boards/">All boards &rarr;</a></p>
    </section>
  </div>
${single ? planSticky(h, b, single) : ""}
<script src="https://gumroad.com/js/gumroad.js" async></script>
</main>`
  });
}

// Six cards for the home page: one board from each book, picked for the
// time of year (26 Oct 2026), so the strip shows the range of the library.
const HOME_BOOKS = ["impossible", "main", "world", "two", "keto", "plant"];
const HOME_PICKS = [
  // [months, slugs in HOME_BOOKS order]
  [[10, 11], ["thanksgiving-turkey-board", "thanksgiving-charcuterie-board", "moroccan-charcuterie-board", "cozy-night-in-charcuterie-board", "keto-thanksgiving-charcuterie-board", "plant-based-fall-harvest-board"]],
  [[12], ["santas-sleigh-charcuterie-board", "holiday-entertaining-board", "swiss-alpine-charcuterie-board", "new-years-eve-board-for-two", "keto-christmas-charcuterie-board", "plant-based-holiday-board"]],
  [[1, 2], ["football-field-charcuterie-board", "valentines-day-charcuterie-board", "korean-bbq-charcuterie-board", "valentines-day-board-for-two", "keto-game-day-board", "plant-based-date-night-board"]],
  [[3, 4, 5], ["easter-egg-charcuterie-board", "easter-charcuterie-board", "greek-mediterranean-board", "lazy-sunday-charcuterie-board", "keto-brunch-board", "plant-based-brunch-board"]],
  [[6, 7, 8, 9], ["tropical-island-charcuterie-board", "summer-backyard-board", "brazilian-churrasco-board", "picnic-board-for-two", "keto-picnic-board", "plant-based-summer-board"]]
];
function homePicks(boards, month = new Date().getMonth() + 1) {
  const bySlug = new Map(boards.map((b) => [b.slug, b]));
  const want = (HOME_PICKS.find(([ms]) => ms.includes(month)) || HOME_PICKS[0])[1];
  const out = HOME_BOOKS.map((book, i) => {
    const b = bySlug.get(want[i]);
    return b && b.book === book ? b : boards.find((x) => x.book === book && !x.placeholder);
  }).filter(Boolean);
  for (const b of boards) if (out.length < 6 && !out.includes(b)) out.push(b);
  return out.slice(0, 6);
}

// Round-robin across the books, so a grid of boards doesn't open on six
// that look alike.
export function mixBooks(boards) {
  const lanes = HOME_BOOKS.map((k) => boards.filter((b) => b.book === k)).concat([boards.filter((b) => !HOME_BOOKS.includes(b.book))]);
  const out = [];
  for (let i = 0; out.length < boards.length; i++) for (const l of lanes) if (l[i]) out.push(l[i]);
  return out;
}

export function boardsStrip(h, boards, { kicker = "Board Library", title = "Pick a board, get the plan", picks = null } = {}) {
  if (!boards.length) return "";
  return `<section class="section bl-strip" aria-label="Board Library">
    <div class="section-inner">
      <p class="section-kicker">${h.escapeHtml(kicker)}</p>
      <h2 class="section-title">${h.escapeHtml(title)}</h2>
      <ul class="bl-grid bl-grid-3">
${(picks && picks.length >= 3 ? picks : homePicks(boards)).map((b) => card(b, h)).join("\n")}
      </ul>
      <div class="section-link"><a class="text-link" href="/boards/">Browse all ${boards.length} boards</a></div>
    </div>
  </section>`;
}

// Typographic stand-in until the board's photo is added to public/images/boards/
const WORLD_COUNTRY = { "01": "Germany", "02": "England", "03": "Switzerland", "04": "Portugal", "05": "Eastern Europe", "06": "Turkey", "07": "Morocco", "08": "India", "09": "Thailand", "10": "Vietnam", "11": "China", "12": "Korea", "13": "Brazil", "14": "Argentina", "15": "Peru", "16": "Caribbean" };
export function placeholderSvg(b) {
  const x = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const country = b.book === "world" ? WORLD_COUNTRY[b.number.slice(3)] || "" : "";
  const words = (b.title || b.h1).replace(/^The /, "").split(" ");
  const lines = [];
  for (const w of words) {
    if (lines.length && (lines[lines.length - 1] + " " + w).length <= 16) lines[lines.length - 1] += " " + w;
    else lines.push(w);
  }
  const y0 = 400 - (lines.length - 1) * 34;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
<defs><pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="28" height="28" fill="#2b1b12"/><rect width="14" height="28" fill="#342116"/></pattern></defs>
<rect width="1200" height="800" fill="url(#p)"/>
<rect x="40" y="40" width="1120" height="720" fill="none" stroke="#d8b25a" stroke-width="3" rx="18"/>
<text x="600" y="${y0 - 110}" text-anchor="middle" font-family="Georgia,serif" font-size="30" letter-spacing="8" fill="#f3a35a">${x(country.toUpperCase())}</text>
${lines.map((l, i) => `<text x="600" y="${y0 + i * 68}" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="62" fill="#f5ecd9">${x(l)}</text>`).join("\n")}
<text x="600" y="${y0 + lines.length * 68 + 50}" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" letter-spacing="6" fill="#d8b25a">CHARCUTERIE LAB · AROUND THE WORLD</text>
</svg>`;
}

// /around-the-world/ : the book's launch page
export function worldBookPage(h, boards) {
  const W = WORLD_BOOK;
  const world = boards.filter((b) => b.book === "world");
  const regions = [["Europe", ["01", "02", "03", "04", "05"]], ["The Mediterranean & North Africa", ["06", "07"]], ["Asia", ["08", "09", "10", "11", "12"]], ["The Americas & Caribbean", ["13", "14", "15", "16"]]];
  const byNum = new Map(world.map((b) => [b.number.slice(3), b]));
  const live = worldIsLive(W);
  return h.layout({
    title: live ? `${W.title} | Charcuterie Lab` : `Around the World in 16 Boards: Coming ${W.launch}`,
    canonical: "/around-the-world/",
    image: world.find((b) => !b.placeholder)?.image,
    description: `16 international charcuterie boards, from a Bavarian beer-hall spread to a Korean BBQ board, with shopping lists, step-by-step blueprints and pairing science. ${live ? "Out now." : `Coming ${W.launch}.`}`,
    head: `  <script type="application/ld+json">${h.jsonForScript({
      "@context": "https://schema.org", "@type": "Book", name: W.title, author: h.authorRef || { "@type": "Organization", name: "Charcuterie Lab" },
      bookFormat: "https://schema.org/Paperback", numberOfPages: 88, inLanguage: "en", datePublished: W.launchIso,
      url: h.absoluteUrl("/around-the-world/"), about: "International charcuterie boards"
    })}</script>`,
    body: `<main class="bl-main">
  <section class="bl-finder">
    <div class="bl-inner">
      <p class="section-kicker">${live ? "The new book" : `Coming ${h.escapeHtml(W.launch)}`}</p>
      <h1>Around the World in 16 Boards</h1>
      <p class="bl-intro">Tapas, meze, petiscos, banchan, the Brotzeit plate: every food culture has its own board. The third Charcuterie Lab book blueprints sixteen of them, with the same shopping lists, prep countdowns, placement steps and pairing science as <a href="/ebook/">50 Boards Built by Science</a>.</p>
      ${worldOffer(h, "world_book_page", { heading: live ? "Get the book" : "Be first to know on launch day", lead: live ? (W.paperbackUrl ? "Paperback on Amazon, or the ebook as an instant download." : "The ebook is out now as an instant PDF download. The paperback follows on Amazon.") : "Sign up and we'll email you the day the paperback and ebook go live. You can already see every board's plan below." })}
      <div class="bl-section">
        <h2>What's in every board</h2>
        <ul class="bl-wib">
          <li><b>A complete shopping list</b> with amounts for 6–10 guests and estimated prices</li>
          <li><b>A prep countdown</b> so warm items and cold ones land on the table together</li>
          <li><b>Seven placement steps</b>, each with the reason it works</li>
          <li><b>Five substitutions</b> for hard-to-find items, and <b>five upgrades</b></li>
          <li>Plus a global pantry guide: what to buy at which kind of market</li>
        </ul>
      </div>
      ${regions.map(([r, ns]) => `<div class="bl-section"><h2>${h.escapeHtml(r)}</h2><ul class="bl-grid bl-grid-3">${ns.map((n) => byNum.get(n)).filter(Boolean).map((b) => card(b, h)).join("\n")}</ul></div>`).join("\n")}
    </div>
  </section>
${h.newsletterPanel("world-email", "world_book_page")}
</main>`
  });
}

export function worldBanner(h) {
  const W = WORLD_BOOK;
  const live = worldIsLive(W);
  return `<a class="bl-banner" href="/around-the-world/"><span class="bl-banner-k">${live ? "New book" : `Coming ${h.escapeHtml(W.launch)}`}</span> <strong>Around the World in 16 Boards</strong> <span>Germany to Korea, Turkey to Peru. See the boards &rarr;</span></a>`;
}

// Ideas pages (18 Oct 2026): a category hub with its own copy in
// content/board-hubs/<category>.json becomes a full "X board ideas" page:
// an answer up top, every board as an idea with its photo and what's on it,
// then how to build one, amounts, mistakes, make-ahead and an FAQ.
const mdLinks = (h, s = "") => h.escapeHtml(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);

function ideasPage(h, cat, boards, P) {
  // Ideas can use any published board (h.allBoards), not only this category's,
  // and live blog posts ({ post, name, image, best_for, blurb, on_it }) (19 Oct 2026).
  const bySlug = new Map([...(h.allBoards || []), ...boards].map((b) => [b.slug, b]));
  const used = new Set();
  const entries = [];
  let n = 0;
  // { link } entries point at any page on the site, e.g. a holiday hub (19 Oct 2026)
  const postIdea = (x) => {
    if (!x.link && (!h.blogTitles || !h.blogTitles.has(x.post))) return "";
    n += 1;
    const href = x.link || `/blog/${x.post}/`;
    entries.push({ name: x.name, url: href });
    return `<article class="bi-idea" id="${x.id || x.post || href.split("/").filter(Boolean).pop()}">
        ${x.image ? `<a class="bi-photo" href="${href}"><img src="${h.escapeHtml((h.thumb || ((y) => y))(x.image))}" alt="${h.escapeHtml(x.name)}" width="600" height="400" loading="lazy" decoding="async"></a>` : "<span></span>"}
        <div class="bi-body">
          <h3><span class="bi-num">${n}.</span> <a href="${href}">${h.escapeHtml(x.name)}</a></h3>
          <p class="bi-best"><strong>Best for:</strong> ${h.escapeHtml(x.best_for)}${x.facts ? ` <span class="bi-facts">${h.escapeHtml(x.facts)}</span>` : ""}</p>
          <p>${mdLinks(h, x.blurb)}</p>
          ${x.on_it ? `<p class="bi-items"><strong>On it:</strong> ${h.escapeHtml(x.on_it)}</p>` : ""}
          <p class="bi-link"><a href="${href}">${h.escapeHtml(x.link_text || "Read the full guide")} &rarr;</a></p>
        </div>
      </article>`;
  };
  const idea = (x) => {
    if (x.post || x.link) return postIdea(x);
    const b = bySlug.get(x.slug);
    if (!b) return "";
    used.add(b.slug);
    entries.push({ name: x.name || b.h1, url: `/boards/${b.slug}/` });
    n += 1;
    const items = b.groups.flatMap((g) => g.items.map((i) => i.name));
    const facts = [b.serves && `Serves ${b.serves}`, b.cost, b.prep_time].filter(Boolean).map(h.escapeHtml).join(" · ");
    return `<article class="bi-idea" id="${b.slug}">
        <a class="bi-photo" href="/boards/${b.slug}/"><img src="${h.escapeHtml((h.thumb || ((y) => y))(b.image))}" alt="${h.escapeHtml(b.h1)}" width="600" height="400" loading="lazy" decoding="async"></a>
        <div class="bi-body">
          <h3><span class="bi-num">${n}.</span> <a href="/boards/${b.slug}/">${h.escapeHtml(x.name || b.h1)}</a></h3>
          <p class="bi-best"><strong>Best for:</strong> ${h.escapeHtml(x.best_for)}${facts ? ` <span class="bi-facts">${facts}</span>` : ""}</p>
          <p>${mdLinks(h, x.blurb)}</p>
          <p class="bi-items"><strong>On it:</strong> ${h.escapeHtml(items.slice(0, 8).join(", "))}${items.length > 8 ? ` and ${items.length - 8} more` : ""}.</p>
          <p class="bi-link"><a href="/boards/${b.slug}/">See the board &rarr;</a></p>
        </div>
      </article>`;
  };
  const groups = P.ideas.map((g) => `<div class="bi-group">
      <h2 id="${g.id}">${h.escapeHtml(g.heading)}</h2>
      ${g.intro ? `<p>${mdLinks(h, g.intro)}</p>` : ""}
      ${g.boards.map(idea).join("\n      ")}
    </div>`).join("\n    ");
  const rest = boards.filter((b) => !used.has(b.slug));
  const listed = [...used].map((s) => bySlug.get(s));
  const total = used.size + rest.length;
  const toc = P.ideas.map((g) => `<li><a href="#${g.id}">${h.escapeHtml(g.heading)}</a></li>`).concat(P.sections.map((s) => `<li><a href="#${s.id}">${h.escapeHtml(s.heading)}</a></li>`), ['<li><a href="#bi-faq">Questions</a></li>']).join("");
  const section = (s) => `<section class="bl-section" aria-labelledby="${s.id}">
      <h2 id="${s.id}">${h.escapeHtml(s.heading)}</h2>
      ${(s.paras || []).map((p) => `<p>${mdLinks(h, p)}</p>`).join("\n      ")}
      ${s.items ? `<${s.ordered ? "ol" : "ul"} class="bi-list">${s.items.map((i) => `<li><strong>${h.escapeHtml(i.lead)}</strong> ${mdLinks(h, i.text)}</li>`).join("")}</${s.ordered ? "ol" : "ul"}>` : ""}
    </section>`;
  const faqLd = `  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: P.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") } })) })}</script>`;
  const ordered = listed.concat(rest);
  return h.layout({
    title: `${P.seo_title} | Charcuterie Lab`,
    canonical: `/boards/${cat.slug}/`,
    image: P.image || ordered.find((b) => !b.placeholder)?.image,
    type: "article",
    description: P.description,
    head: `  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "ItemList", name: P.h1, url: h.absoluteUrl(`/boards/${cat.slug}/`), itemListElement: entries.concat(rest.map((b) => ({ name: b.h1, url: `/boards/${b.slug}/` }))).map((e, i) => ({ "@type": "ListItem", position: i + 1, url: h.absoluteUrl(e.url), name: e.name })) })}</script>\n${breadcrumbSchema(h, [["Boards", "/boards/"], [cat.name, `/boards/${cat.slug}/`]])}\n${faqLd}`,
    body: `<main class="bl-main bl-board bi-page">
  <div class="bl-inner">
    <p class="ing-crumb"><a href="/boards/">Boards</a> <span aria-hidden="true">/</span> ${h.escapeHtml(cat.name)}</p>
    <header class="bl-hero">
      <p class="section-kicker">Board ideas</p>
      <h1>${h.escapeHtml(P.h1)}</h1>
      <div class="bi-answer"><p class="eyebrow">Quick answer</p><p>${mdLinks(h, P.answer)}</p></div>
      ${h.byline ? `<p class="bl-byline">${h.byline(h.longDate && P.updated ? ` · Updated ${h.longDate(P.updated)}` : "")}</p>` : ""}
      ${(P.intro || []).map((p) => `<p class="bl-lede">${mdLinks(h, p)}</p>`).join("\n      ")}
      <nav class="bi-toc" aria-label="On this page"><p class="eyebrow">On this page</p><ol>${toc}</ol></nav>
    </header>
    ${groups}
    ${rest.length ? `<div class="bi-group"><h2>More ${h.escapeHtml(cat.name.toLowerCase())} boards</h2><ul class="bl-grid bl-grid-3">${rest.map((b) => card(b, h)).join("\n")}</ul></div>` : ""}
    ${P.book_box && P.book_box(h) || ""}
    ${P.sections.map(section).join("\n    ")}
    <section class="bl-section" aria-labelledby="bi-faq">
      <h2 id="bi-faq">Questions</h2>
      <div class="ebook-faq-list">
        ${P.faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${h.escapeHtml(f.q)}</summary><p>${mdLinks(h, f.a)}</p></details>`).join("\n        ")}
      </div>
    </section>
    <p class="bl-note"><a href="/boards/">All ${total > 1 ? "boards" : "board"} &rarr;</a></p>
  </div>
${h.newsletterPanel ? h.newsletterPanel("board-email", `boards_${cat.slug}`) : ""}
</main>`
  });
}

// The plant-based book box on the vegan ideas page
export function plantBookBox(h, campaign = "boards_plant_hub") {
  const url = h.withTracking ? h.withTracking(PLANT_BOOK.ebookUrl, campaign) : PLANT_BOOK.ebookUrl;
  return `<section class="bl-book" aria-labelledby="bl-book-title">
      <img src="${h.escapeHtml((h.thumb || ((x) => x))(PLANT_BOOK.cover))}" alt="" width="160" height="207" loading="lazy" decoding="async">
      <div>
        <p class="eyebrow">All 15, fully planned</p>
        <h2 id="bl-book-title">Every board above, with exact shopping lists</h2>
        <p><em>${h.escapeHtml(PLANT_BOOK.title)}</em> has all 15 boards on this page: the shopping list with amounts and prices, the step-by-step build, swaps and the pairing science behind each one.</p>
        <div class="book-buy">
          <a class="button primary" href="${h.escapeHtml(url)}" target="_blank" rel="noopener">Get the ebook · ${PLANT_BOOK.ebookPrice}</a>
          <a class="button book-buy-print" href="${PLANT_BOOK.paperbackUrl || PLANT_BOOK.kindleUrl}" target="_blank" rel="noopener">${PLANT_BOOK.paperbackUrl ? `Paperback on Amazon · ${PLANT_BOOK.paperbackPrice}` : `Kindle on Amazon · ${PLANT_BOOK.kindlePrice}`}</a>
        </div>
      </div>
    </section>`;
}
