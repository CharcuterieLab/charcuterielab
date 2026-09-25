// Board Library: /boards/ hub, one page per category, one page per board.
// Content lives in content/boards/<slug>.json. Only "status": "published" boards
// are built, listed and put in the sitemap; drafts wait for their wave.
import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export const BOARD_CATEGORIES = [
  { slug: "seasonal-holiday", name: "Seasonal & Holiday", intro: "Boards for the dates on the calendar: Thanksgiving, the holidays, New Year's Eve and every season in between." },
  { slug: "occasions-parties", name: "Occasions & Parties", intro: "Boards sized and styled for the event: game day, the office party, cocktail hour, showers and celebrations." },
  { slug: "classic-budget-luxury", name: "Classic, Budget & Luxury", intro: "From the first board you'll ever make to the one-night splurge, and a $25 board that doesn't look it." },
  { slug: "around-the-world", name: "Around the World", intro: "Italian antipasto, Spanish tapas, a French brasserie spread and more, each built from its own region's pantry." },
  { slug: "dietary-kids", name: "Dietary & Kids", intro: "Gluten-free, keto, vegan and kid-friendly boards that nobody at the table has to work around." },
  { slug: "pairings-sweet", name: "Pairings & Sweet", intro: "Boards built around a drink or for the sweet end of the evening." },
  { slug: "plant-based", name: "Plant-Based", intro: "Fifteen boards with no meat and no dairy, built on the same pairing science as every other board here." }
];

// Book 3 in the series. While "status" is "coming", every world board and the
// /around-the-world/ page show a launch-day signup. On launch day: fill in the
// two URLs and prices, set status to "live", rebuild, push.
export const WORLD_BOOK = {
  title: "Charcuterie Lab: Around the World in 16 Boards",
  status: "coming",
  launch: "October 1, 2026",
  launchIso: "2026-10-01",
  ebookUrl: "",
  ebookPrice: "",
  paperbackUrl: "",
  paperbackPrice: "",
  cover: "/images/books/around-the-world-cover.svg"
};

export const PLANT_BOOK = {
  title: "Charcuterie Lab: 15 Show-Stopping Plant-Based Boards",
  kindleUrl: "https://www.amazon.com/dp/B0H32HT617",
  kindlePrice: "$9.99",
  paperbackPrice: "$18.99"
};

export async function loadBoards(root) {
  const dir = join(root, "content", "boards");
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const all = await Promise.all(files.map(async (f) => JSON.parse(await readFile(join(dir, f), "utf8"))));
  const order = (b) => ({ plant: 100, world: 200 }[b.book] || 0) + Number(b.number.slice(3));
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

export function card(b, h) {
  const cat = catOf(b);
  const badges = [b.book === "plant" ? "Plant-based" : "", b.difficulty || ""].filter(Boolean);
  return `<li class="bl-card" data-cat="${b.category}" data-plant="${b.book === "plant" ? 1 : 0}" data-guests="${b.guests}">
    <a href="/boards/${b.slug}/">
      <img src="${h.escapeHtml(b.image)}" alt="${h.escapeHtml(b.h1 || b.title)}" width="600" height="400" loading="lazy" decoding="async">
      <span class="bl-card-body">
        <span class="bl-card-cat">${h.escapeHtml(cat.name)}</span>
        <strong>${h.escapeHtml(b.h1 || b.title)}</strong>
        <span class="bl-card-facts">Serves ${h.escapeHtml(b.serves)} · ${h.escapeHtml(b.cost)}</span>
        <span class="bl-badges">${badges.map((x) => `<span>${h.escapeHtml(x)}</span>`).join("")}</span>
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
  const cards = [...root.querySelectorAll('.bl-card')];
  const count = root.querySelector('.bl-count');
  let cat = 'all', guests = 0, plant = false;
  const apply = () => {
    let n = 0;
    for (const c of cards) {
      const show = (cat === 'all' || c.dataset.cat === cat) && (!plant || c.dataset.plant === '1') && (!guests || Number(c.dataset.guests) >= guests);
      c.hidden = !show; if (show) n++;
    }
    count.textContent = n + (n === 1 ? ' board' : ' boards');
  };
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter-cat]');
    if (!b) return;
    cat = b.dataset.filterCat;
    root.querySelectorAll('[data-filter-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  });
  root.querySelector('#bl-guests').addEventListener('change', (e) => { guests = Number(e.target.value); apply(); });
  root.querySelector('#bl-plant').addEventListener('change', (e) => { plant = e.target.checked; apply(); });
  apply();
})();
</script>`;

function finder(h, boards, { heading, intro, showFilters = true, crumb = "" }) {
  const cats = BOARD_CATEGORIES.filter((c) => boards.some((b) => b.category === c.slug));
  return `<section class="bl-finder">
  <div class="bl-inner">
    ${crumb}
    <p class="section-kicker">Board Library</p>
    <h1>${h.escapeHtml(heading)}</h1>
    <p class="bl-intro">${h.escapeHtml(intro)}</p>
    ${showFilters ? `<div class="bl-filters" role="group" aria-label="Filter boards">
      <button type="button" class="bl-chip" data-filter-cat="all" aria-pressed="true">All</button>
      ${cats.map((c) => `<button type="button" class="bl-chip" data-filter-cat="${c.slug}" aria-pressed="false">${h.escapeHtml(c.name)}</button>`).join("\n      ")}
    </div>
    <div class="bl-controls">
      <label>Guests <select id="bl-guests"><option value="0">Any</option><option value="2">2+</option><option value="8">8+</option><option value="12">12+</option><option value="16">16+</option><option value="20">20+</option></select></label>
      <label class="bl-check"><input type="checkbox" id="bl-plant"> Plant-based only</label>
      <span class="bl-count" aria-live="polite"></span>
    </div>` : `<div class="bl-controls"><span class="bl-count">${boards.length} boards</span></div>`}
    <ul class="bl-grid">
${boards.map((b) => card(b, h)).join("\n")}
    </ul>
    ${showFilters ? `<nav class="bl-cats" aria-label="Board categories"><span>Browse by category:</span> ${cats.map((c) => `<a href="/boards/${c.slug}/">${h.escapeHtml(c.name)}</a>`).join(" ")}</nav>` : `<nav class="bl-cats"><a href="/boards/">&larr; All boards</a></nav>`}
  </div>
</section>`;
}

export function boardsHub(h, boards) {
  return h.layout({
    title: "Charcuterie Board Ideas: Shopping Lists & Plans | Charcuterie Lab",
    canonical: "/boards/",
    image: boards.find((b) => !b.placeholder)?.image,
    description: `${boards.length} complete charcuterie boards for every occasion, each with what to buy, why it works, a timeline and a one-tap shopping list for your guest count.`,
    head: `${itemListSchema(h, "Charcuterie Lab Board Library", "/boards/", boards)}\n${breadcrumbSchema(h, [["Boards", "/boards/"]])}`,
    body: `<main class="bl-main">
${h.bookBar("boards_hub_top", "Every board, fully planned")}
<div class="bl-inner">${boards.some((b) => b.book === "world") ? worldBanner(h) : ""}</div>
${finder(h, boards, { heading: "Charcuterie boards for every occasion", intro: "Each board comes with what to buy, why it works, a timeline, and a one-tap shopping list sized to your guest count." })}
${h.labNext("boards_hub", { skip: ["book"], heading: "Plan your own" })}
</main>
${FILTER_JS}`
  });
}

export function boardCategoryPage(h, cat, boards) {
  return h.layout({
    title: `${cat.name} Charcuterie Boards | Charcuterie Lab`,
    canonical: `/boards/${cat.slug}/`,
    image: boards.find((b) => !b.placeholder)?.image,
    description: `${cat.intro} Each with what to buy, why it works and a shopping list for your guest count.`.slice(0, 300),
    head: `${itemListSchema(h, `${cat.name} charcuterie boards`, `/boards/${cat.slug}/`, boards)}\n${breadcrumbSchema(h, [["Boards", "/boards/"], [cat.name, `/boards/${cat.slug}/`]])}`,
    body: `<main class="bl-main">
${finder(h, boards, { heading: `${cat.name} boards`, intro: cat.intro, showFilters: false, crumb: `<p class="ing-crumb"><a href="/boards/">Boards</a> <span aria-hidden="true">/</span> ${h.escapeHtml(cat.name)}</p>` })}
${h.labNext(`boards_${cat.slug}`, { skip: ["book"], heading: "Plan your own" })}
</main>`
  });
}

export function worldOffer(h, campaign, { heading = "Get the full blueprint", lead = "" } = {}) {
  const W = WORLD_BOOK;
  const buy = W.status === "live" && W.paperbackUrl;
  return `<section class="bl-book bl-world" aria-labelledby="bl-book-title">
      <div>
        <p class="eyebrow">${buy ? "New book" : `Coming ${h.escapeHtml(W.launch)}`}</p>
        <h2 id="bl-book-title">${h.escapeHtml(heading)}</h2>
        <p>${lead || `This board's exact shopping list with amounts and prices, the prep countdown, all seven placement steps, five swaps and five upgrades are in <em>${h.escapeHtml(W.title)}</em>, with 15 more international boards.`}</p>
        ${buy
          ? `<div class="book-buy">${W.ebookUrl ? `<a class="button primary" href="${h.escapeHtml(W.ebookUrl)}" target="_blank" rel="noopener">Get the ebook${W.ebookPrice ? ` · ${W.ebookPrice}` : ""}</a>` : ""}<a class="button book-buy-print" href="${h.escapeHtml(W.paperbackUrl)}" target="_blank" rel="noopener">Paperback on Amazon${W.paperbackPrice ? ` · ${W.paperbackPrice}` : ""}</a></div>`
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

function bookOffer(h, board) {
  if (board.book === "world") return worldOffer(h, `board_${board.slug}`, { heading: "Build it exactly, with the new book" });
  if (board.book === "plant") {
    return `<section class="bl-book" aria-labelledby="bl-book-title">
      <img src="${h.escapeHtml(board.image)}" alt="" width="220" height="146" loading="lazy" decoding="async">
      <div>
        <p class="eyebrow">The full blueprint</p>
        <h2 id="bl-book-title">Build it exactly, with the plant-based book</h2>
        <p>This board's exact shopping list with amounts and prices, the step-by-step build and every swap are in <em>${h.escapeHtml(PLANT_BOOK.title)}</em>, with 14 more plant-based boards.</p>
        <div class="book-buy">
          <a class="button primary" href="${PLANT_BOOK.kindleUrl}" target="_blank" rel="noopener">Kindle · ${PLANT_BOOK.kindlePrice}</a>
          <a class="button book-buy-print" href="${PLANT_BOOK.kindleUrl}" target="_blank" rel="noopener">Paperback on Amazon · ${PLANT_BOOK.paperbackPrice}</a>
        </div>
      </div>
    </section>`;
  }
  const bb = bookBoardOf(h, board);
  if (bb && h.bookCard) {
    return h.bookCard(bb, `board_${board.slug}`, { lead: `This page is the free preview. The book has the full plan: the exact shopping list with amounts and prices, the 7-step build with where every item goes and why, and a swap for every ingredient. Plus 49 more boards.` });
  }
  return `<section class="bl-book" aria-labelledby="bl-book-title">
      <img src="/images/book-cover.jpg" alt="" width="160" height="207" loading="lazy" decoding="async">
      <div>
        <p class="eyebrow">The full blueprint</p>
        <h2 id="bl-book-title">Build it exactly, with the book</h2>
        <p>This board's exact shopping list with amounts and prices, the 7-step build and every substitution are in <em>${h.escapeHtml(h.bookTitle)}</em>, with 49 more boards.</p>
        ${h.bookButtons(`board_${board.slug}`)}
      </div>
    </section>`;
}

function recipeSchema(h, b) {
  const ingredients = b.groups.flatMap((g) => g.items.map((i) => i.name));
  const minutes = Number((b.prep_time || "").match(/(\d+)(?=\s*min)/)?.[1] || 0);
  return `  <script type="application/ld+json">${h.jsonForScript({
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: b.h1,
    description: b.description,
    ...(b.placeholder ? {} : { image: [h.absoluteUrl(b.image)] }),
    author: { "@type": "Organization", name: "Charcuterie Lab", url: h.absoluteUrl("/") },
    recipeCategory: "Appetizer",
    recipeYield: `${b.serves} people`,
    ...(minutes ? { prepTime: `PT${minutes}M`, totalTime: `PT${minutes}M` } : {}),
    keywords: [b.h1.toLowerCase(), "charcuterie board", catOf(b).name.toLowerCase()].join(", "),
    recipeIngredient: ingredients,
    recipeInstructions: b.timeline.map((t) => ({ "@type": "HowToStep", name: t.when, text: t.what }))
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

export function boardPage(h, b, { all, bySlug, notes, blogTitles }) {
  const cat = catOf(b);
  const known = new Set(bySlug.keys());
  const pair = firstPairing(b, notes, bySlug);
  const related = all.filter((x) => x.slug !== b.slug && x.category === b.category).slice(0, 3);
  const fill = related.length < 3 ? all.filter((x) => x.slug !== b.slug && !related.includes(x)).slice(0, 3 - related.length) : [];
  const blogs = (b.blog || []).filter((s) => blogTitles.has(s));
  const glance = [["Serves", b.serves], ["Board", plain(b.board_size)], ["Prep", b.prep_time], ["Cost", b.cost], ["Level", b.difficulty]];
  const item = (i) => (i.slug && known.has(i.slug) ? `<a href="/ingredients/${i.slug}/">${h.escapeHtml(i.name)}</a>` : h.escapeHtml(i.name));

  return h.layout({
    title: `${b.seo_title} | Charcuterie Lab`,
    canonical: `/boards/${b.slug}/`,
    image: b.placeholder ? undefined : b.image,
    type: "article",
    description: b.description,
    head: `${recipeSchema(h, b)}\n${breadcrumbSchema(h, [["Boards", "/boards/"], [cat.name, `/boards/${cat.slug}/`], [b.h1, `/boards/${b.slug}/`]])}\n${faqSchemaFor(h, b)}`,
    body: `<main class="bl-main bl-board">
  <div class="bl-inner">
    <p class="ing-crumb"><a href="/boards/">Boards</a> <span aria-hidden="true">/</span> <a href="/boards/${cat.slug}/">${h.escapeHtml(cat.name)}</a> <span aria-hidden="true">/</span> ${h.escapeHtml(b.h1)}</p>
    <header class="bl-hero">
      <p class="section-kicker">${h.escapeHtml(cat.name)}${b.book === "plant" && cat.slug !== "plant-based" ? " · 100% plant-based" : ""}</p>
      <h1>${h.escapeHtml(b.h1)}</h1>
      <p class="bl-lede">${h.escapeHtml(b.hook)}</p>
      <img class="bl-photo" src="${h.escapeHtml(b.image)}" alt="${h.escapeHtml(b.h1)}: the finished board" width="1200" height="800" fetchpriority="high">
      <dl class="bl-glance">
        ${glance.filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${h.escapeHtml(v)}</dd></div>`).join("\n        ")}
      </dl>
      <p class="bl-cta-row">
        ${boardSlugsFor(b).filter((s) => known.has(s)).length >= 5
          ? `<a class="button primary" href="${builderLink(b, known)}">Open this board in the Board Builder</a>
        <span>Get amounts for your own guest count, free.</span>`
          : `<a class="button primary" href="/board-builder/">Plan a board in the Board Builder</a>
        <span>Pick ingredients and your guest count, free.</span>`}
      </p>
    </header>

    <section class="bl-section" aria-labelledby="bl-on">
      <h2 id="bl-on">What's on the board</h2>
      <div class="bl-groups">
        ${b.groups.map((g) => `<div class="bl-group"><h3>${h.escapeHtml(g.name)}</h3><ul>${g.items.map((i) => `<li>${item(i)}</li>`).join("")}</ul></div>`).join("\n        ")}
      </div>
      <p class="bl-note">Amounts and prices for each item are in the book${boardSlugsFor(b).filter((s) => known.has(s)).length >= 5 ? ", or open the board in the Board Builder for amounts sized to your guest count" : ""}.</p>
    </section>

    <section class="bl-section" aria-labelledby="bl-why">
      <h2 id="bl-why">Why it works</h2>
      ${b.why.map((p) => `<p>${h.escapeHtml(p)}</p>`).join("\n      ")}
      ${pair ? `<aside class="bl-pair"><p class="eyebrow">The bite to try first</p><p><strong><a href="/ingredients/${pair.a.slug}/">${h.escapeHtml(pair.a.title)}</a> + <a href="/ingredients/${pair.b.slug}/">${h.escapeHtml(pair.b.title)}</a></strong> ${h.escapeHtml(pair.text)}</p></aside>` : ""}
    </section>

    <section class="bl-section" aria-labelledby="bl-when">
      <h2 id="bl-when">Timeline</h2>
      <ol class="bl-timeline">
        ${b.timeline.map((t) => `<li><b>${h.escapeHtml(t.when)}</b><span>${h.escapeHtml(t.what)}</span></li>`).join("\n        ")}
      </ol>
      <p class="bl-note">The seven-step placement plan (what goes where, and why) is in the book.</p>
    </section>

    ${bookOffer(h, b)}

    <section class="bl-section" aria-labelledby="bl-faq">
      <h2 id="bl-faq">Questions</h2>
      <div class="ebook-faq-list">
        ${b.faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${h.escapeHtml(f.q)}</summary><p>${h.escapeHtml(f.a)}</p></details>`).join("\n        ")}
      </div>
    </section>

    <section class="bl-section" aria-labelledby="bl-more">
      <h2 id="bl-more">More boards</h2>
      <ul class="bl-grid bl-grid-3">
${[...related, ...fill].map((x) => card(x, h)).join("\n")}
      </ul>
      ${blogs.length ? `<p class="bl-note">Want more ideas? Read ${blogs.map((s) => `<a href="/blog/${s}/">${h.escapeHtml(blogTitles.get(s))}</a>`).join(" or ")}.</p>` : ""}
      <p class="bl-note"><a href="/boards/">All boards &rarr;</a></p>
    </section>
  </div>
${h.newsletterPanel("board-email", `board_${b.slug}`)}
${bookBoardOf(h, b) && h.stickyBar ? h.stickyBar(`sticky_board_${b.slug}`, bookBoardOf(h, b)) : ""}
</main>`
  });
}

// Six cards for the home page
export function boardsStrip(h, boards) {
  if (!boards.length) return "";
  return `<section class="section bl-strip" aria-label="Board Library">
    <div class="section-inner">
      <p class="section-kicker">Board Library</p>
      <h2 class="section-title">Pick a board, get the plan</h2>
      <ul class="bl-grid bl-grid-3">
${boards.slice(0, 6).map((b) => card(b, h)).join("\n")}
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
<defs><pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="28" height="28" fill="#14231a"/><rect width="14" height="28" fill="#182a1f"/></pattern></defs>
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
  const live = W.status === "live" && W.paperbackUrl;
  return h.layout({
    title: live ? `${W.title} | Charcuterie Lab` : `${W.title}: Coming ${W.launch} | Charcuterie Lab`,
    canonical: "/around-the-world/",
    image: world.find((b) => !b.placeholder)?.image,
    description: `16 international charcuterie boards, from a Bavarian beer-hall spread to a Korean BBQ board, with shopping lists, step-by-step blueprints and pairing science. ${live ? "Out now." : `Coming ${W.launch}.`}`,
    head: `  <script type="application/ld+json">${h.jsonForScript({
      "@context": "https://schema.org", "@type": "Book", name: W.title, author: { "@type": "Organization", name: "Charcuterie Lab" },
      bookFormat: "https://schema.org/Paperback", numberOfPages: 88, inLanguage: "en", datePublished: W.launchIso,
      url: h.absoluteUrl("/around-the-world/"), about: "International charcuterie boards"
    })}</script>`,
    body: `<main class="bl-main">
  <section class="bl-finder">
    <div class="bl-inner">
      <p class="section-kicker">${live ? "The new book" : `Coming ${h.escapeHtml(W.launch)}`}</p>
      <h1>Around the World in 16 Boards</h1>
      <p class="bl-intro">Tapas, meze, petiscos, banchan, the Brotzeit plate: every food culture has its own board. The third Charcuterie Lab book blueprints sixteen of them, with the same shopping lists, prep countdowns, placement steps and pairing science as <a href="/ebook/">50 Boards Built by Science</a>.</p>
      ${worldOffer(h, "world_book_page", { heading: live ? "Get the book" : "Be first to know on launch day", lead: live ? "Paperback on Amazon, or the ebook as an instant download." : "Sign up and we'll email you the day the paperback and ebook go live. You can already see every board's plan below." })}
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
  const live = W.status === "live" && W.paperbackUrl;
  return `<a class="bl-banner" href="/around-the-world/"><span class="bl-banner-k">${live ? "New book" : `Coming ${h.escapeHtml(W.launch)}`}</span> <strong>Around the World in 16 Boards</strong> <span>Germany to Korea, Turkey to Peru. See the boards &rarr;</span></a>`;
}
