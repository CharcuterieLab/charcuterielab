// Sales funnel pieces for the books and printables.
//
// 1. "Board #N in the book": every post, board and holiday page that matches a
//    board in 50 Boards Built by Science says so, with that board's photo, and
//    sells the book with the specific promise instead of a generic banner.
// 2. The printables get real pages on the site (/printables/ and one page per
//    product) and a matched card on the pages whose question they answer.
// 3. A free sample (the intro, contents and board 01 in full) for an email.
//
// Board facts come from content/boards/*.json (all 50 book-1 boards are there,
// drafts included), so numbers, names and photos can never drift from the book.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export const SAMPLE_PDF = "/downloads/charcuterie-lab-free-board-01.pdf";

// The book's own table of contents groups (pages 5-6 of the book).
export const BOOK_SECTIONS = [
  ["Classic & Everyday", [1, 7, 8, 13, 14, 35]],
  ["International Flavors", [2, 3, 4, 5, 38, 39, 40, 41]],
  ["Occasions & Celebrations", [6, 18, 19, 21, 22, 23, 24, 30, 31, 32, 33, 50]],
  ["Seasons & Settings", [20, 25, 26, 27, 36, 37, 48]],
  ["Pairings & Themes", [9, 10, 11, 12, 28, 29, 34, 42, 43, 44, 45, 47, 49]],
  ["Dietary & Lifestyle", [15, 16, 17, 46]]
];

export async function loadBookBoards(root) {
  const dir = join(root, "content", "boards");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const all = await Promise.all(files.map(async (f) => JSON.parse(await readFile(join(dir, f), "utf8"))));
  const map = new Map();
  for (const b of all) {
    if (b.book !== "main" || !/^B1-\d\d$/.test(b.number || "")) continue;
    const n = Number(b.number.slice(3));
    const name = /^the /i.test(b.title) ? b.title : `The ${b.title}`;
    map.set(n, {
      n,
      nn: String(n).padStart(2, "0"),
      name,
      slug: b.slug,
      published: b.status === "published",
      image: b.image,
      serves: b.serves || "",
      cost: b.cost || "",
      prep: b.prep_time || "",
      level: b.difficulty || ""
    });
  }
  return map;
}

// Posts that match a book board by topic. First match wins, so the specific
// patterns sit above the general ones (baby shower before shower, skewer
// before antipasto, Valentine's before date night).
const POST_RULES = [
  [20, /thanksgiving|friendsgiving/],
  [21, /valentine/],
  [22, /new-years?-eve|nye/],
  [23, /st-patrick/],
  [24, /easter/],
  [31, /baby-shower/],
  [19, /wedding|bridal/],
  [32, /graduation/],
  [50, /birthday|anniversary|50th/],
  [6, /christmas|holiday|winter|hanukkah/],
  [26, /fall-|autumn|harvest|halloween/],
  [25, /picnic|beach/],
  [7, /summer|backyard/],
  [8, /game-day|super-bowl|football|tailgate/],
  [27, /camping/],
  [28, /movie/],
  [29, /book-club/],
  [30, /office/],
  [33, /cocktail/],
  [18, /date-night|board-two|for-two/],
  [45, /skewer/],
  [2, /italian|antipasto/],
  [3, /spanish|tapas|chorizo-manchego/],
  [4, /french|brasserie/],
  [5, /greek|mediterranean/],
  [38, /tex-mex|mexican/],
  [39, /japanese/],
  [40, /mezze|middle-eastern/],
  [41, /nordic|scandinavian/],
  [37, /bbq/],
  [34, /seafood|smoked-salmon/],
  [44, /truffle/],
  [15, /kid/],
  [16, /vegan|dairy-free|vegetarian|plant-based/],
  [17, /gluten/],
  [46, /keto|low-carb/],
  [11, /brunch|breakfast/],
  [47, /dessert|chocolate/],
  [10, /beer/],
  [9, /wine/],
  [13, /budget|cheap|25-dollar/],
  [14, /luxury|expensive/],
  [49, /grazing|large-group|crowd/],
  [43, /best-meats|meat-lover/],
  [42, /best-cheese|cheese-board|all-cheese/],
  [1, /beginner|easy-charcuterie|how-to-make|first-board|what-goes-on|charcuterie-board-ideas/]
];

export function bookBoardFor(post, bookBoards, libraryBoard = null) {
  const explicit = Number(post.bookBoard || 0);
  if (explicit && bookBoards.has(explicit)) return bookBoards.get(explicit);
  if (libraryBoard && libraryBoard.book === "main" && /^B1-/.test(libraryBoard.number || "")) {
    return bookBoards.get(Number(libraryBoard.number.slice(3))) || null;
  }
  for (const [n, re] of POST_RULES) if (re.test(post.slug)) return bookBoards.get(n) || null;
  return null;
}

export function makeFunnel(h) {
  const { escapeHtml: esc, ebookHref, ebookPrice, paperbackUrl, paperbackPrice, withTracking, newsletterUrl } = h;
  const perBoard = `${Math.round((Number(ebookPrice.replace("$", "")) / 50) * 100)}¢`;

  const buyButtons = (campaign) => `<div class="book-buy">
      <a class="button primary book-buy-ebook" href="${ebookHref(campaign)}" target="_blank" rel="noopener">Get the ebook · ${ebookPrice}</a>
      <a class="button book-buy-print" href="${paperbackUrl}" target="_blank" rel="noopener">Paperback · ${paperbackPrice}</a>
    </div>`;

  // The matched book card: "The Thanksgiving Board is board #20 in the book".
  function bookCard(board, campaign, { headingLevel = 2, lead = "" } = {}) {
    const H = `h${headingLevel}`;
    if (!board) {
      return `<aside class="fx-book fx-book-general" aria-label="The Charcuterie Lab book">
    <a class="fx-book-photo" href="/ebook/"><img src="/images/book-3d-mockup.webp" alt="Charcuterie Lab: 50 Boards Built by Science" width="220" height="220" loading="lazy" decoding="async"></a>
    <div class="fx-book-copy">
      <p class="eyebrow">The Charcuterie Lab book</p>
      <${H}>50 boards, every one fully planned</${H}>
      <p>${lead || "Each board has an exact shopping list with amounts and prices, a timed build from prep to serving, and a swap for every ingredient."}</p>
      ${buyButtons(campaign)}
      <p class="fx-fine">That's ${perBoard} a board. <a href="/ebook/#sample">Read board 01 free</a></p>
    </div>
  </aside>`;
    }
    const facts = [board.serves && `Serves ${board.serves}`, board.cost, board.prep && `${board.prep} prep`].filter(Boolean).join(" · ");
    return `<aside class="fx-book" aria-label="Board ${board.nn} in the book">
    <a class="fx-book-photo" href="/ebook/#board-${board.nn}"><img src="${esc(board.image)}" alt="${esc(board.name)}, board ${board.nn} in Charcuterie Lab" width="300" height="164" loading="lazy" decoding="async"><span class="fx-num">#${board.nn}</span></a>
    <div class="fx-book-copy">
      <p class="eyebrow">Board #${board.nn} in the book</p>
      <${H}>${esc(board.name)}, fully planned</${H}>
      <p>${lead || `The exact shopping list with amounts and prices, a timed build from prep to serving, and a swap for every ingredient. Plus 49 more boards.`}</p>
      ${facts ? `<p class="fx-facts">${esc(facts)}</p>` : ""}
      ${buyButtons(campaign)}
      <p class="fx-fine">That's ${perBoard} a board. <a href="/ebook/#sample">Read board 01 free</a></p>
    </div>
  </aside>`;
  }

  // Slim one-line bar for the top of a post, replacing the big banner: the
  // reader came for the answer, so the answer comes first.
  function bookStrip(campaign, board = null) {
    const text = board ? `${esc(board.name)} is board #${board.nn} in <em>50 Boards Built by Science</em>` : `<em>50 Boards Built by Science</em>: every board fully planned`;
    return `<aside class="fx-strip" aria-label="The Charcuterie Lab book"><img src="/images/book-cover.jpg" alt="" width="28" height="36" loading="lazy" decoding="async"><span>${text}</span><a href="${ebookHref(campaign)}" target="_blank" rel="noopener">Ebook ${ebookPrice} &rarr;</a></aside>`;
  }

  // Mobile-only bottom bar. Appears after the reader is a third of the way
  // down, can be closed, and stays closed for the visit.
  function stickyBar(campaign, board = null) {
    const label = board ? `Board #${board.nn}, fully planned` : "50 boards, fully planned";
    return `<div class="fx-sticky" data-fx-sticky hidden>
    <a href="${ebookHref(campaign)}" target="_blank" rel="noopener"><strong>${esc(label)}</strong><span>Ebook ${ebookPrice}</span></a>
    <button type="button" aria-label="Close" data-fx-close>&times;</button>
  </div>
  <script>(function(){var b=document.querySelector("[data-fx-sticky]");if(!b)return;var k="fx-sticky-closed";try{if(sessionStorage.getItem(k))return}catch(e){}var mq=window.matchMedia("(max-width: 760px)");function on(){var s=window.scrollY/(document.documentElement.scrollHeight-window.innerHeight||1);b.hidden=!(mq.matches&&s>0.33&&s<0.97)}window.addEventListener("scroll",on,{passive:true});b.querySelector("[data-fx-close]").addEventListener("click",function(){b.remove();window.removeEventListener("scroll",on);try{sessionStorage.setItem(k,"1")}catch(e){}})})();</script>`;
  }

  // Free sample: the form sends the email to the newsletter (new tab, as every
  // form on the site does) and reveals the download link here.
  function sampleForm(id, campaign, { compact = false } = {}) {
    return `<form class="fx-sample-form${compact ? " fx-compact" : ""}" action="${newsletterUrl}" method="get" target="_blank" rel="noopener" data-fx-sample>
      <label class="sr-only" for="${id}">Email address</label>
      <input id="${id}" name="email" type="email" autocomplete="email" placeholder="Email address" required>
      <input type="hidden" name="utm_source" value="charcuterielab">
      <input type="hidden" name="utm_medium" value="site">
      <input type="hidden" name="utm_campaign" value="${esc(campaign)}">
      <button class="button primary" type="submit">Send me board 01</button>
      <p class="fx-sample-done" hidden>Your sample is ready: <a class="button" href="${SAMPLE_PDF}" download>Download the PDF (11 pages)</a><span>You're also on the weekly Lab Report. Confirm in the tab that just opened.</span></p>
    </form>
    <script>(function(){document.querySelectorAll("[data-fx-sample]").forEach(function(f){if(f.dataset.bound)return;f.dataset.bound=1;f.addEventListener("submit",function(){var d=f.querySelector(".fx-sample-done");setTimeout(function(){d.hidden=false},200)})})})();</script>`;
  }

  return { bookCard, bookStrip, stickyBar, sampleForm, buyButtons, perBoard };
}

// ---------------------------------------------------------------- ebook ---

export function ebookSections(h, bookBoards, F) {
  const esc = h.escapeHtml;
  const picks = [1, 20, 6, 9, 13, 8, 18, 49].map((n) => bookBoards.get(n)).filter(Boolean);
  const card = (b) => `<article id="sample-${b.nn}">
          <a href="${b.published ? `/boards/${b.slug}/` : `#board-${b.nn}`}"><img src="${esc(b.image)}" alt="${esc(b.name)}" width="400" height="218" loading="lazy" decoding="async"></a>
          <span>Board ${b.nn}</span>
          <h3>${esc(b.name)}</h3>
          <p>${esc([b.serves && `Serves ${b.serves}`, b.cost, b.level].filter(Boolean).join(" · "))}</p>
          ${b.published ? `<a class="fx-more" href="/boards/${b.slug}/">See the free preview &rarr;</a>` : ""}
        </article>`;
  const samples = `<section class="ebook-section ebook-samples">
    <div class="ebook-section-inner">
      <p class="section-kicker">Sample boards inside</p>
      <h2>Real boards you can shop for, build, and serve.</h2>
      <p>Eight of the fifty, with their numbers in the book. Each one is five pages: shopping list, timed build, placement steps, swaps and upgrades.</p>
      <div class="ebook-sample-grid fx-sample-grid">
        ${picks.map(card).join("\n        ")}
      </div>
    </div>
  </section>`;

  const pages = [
    ["look-shopping-list", "Page 1 of every board: the shopping list", "Quantities, estimated prices and a stats bar: board size, prep time, total cost, difficulty."],
    ["look-build-steps", "Page 2: the timeline and build steps", "A countdown from prep to serving, then where each item goes and why."],
    ["look-substitutions", "Page 4: swaps that keep the logic", "Every core ingredient has a swap, with why it still works."],
    ["look-thanksgiving-swaps", "Board 20: Thanksgiving", "Seasonal boards swap for what's in the store that month."],
    ["look-contents", "The contents", "Fifty boards in six groups, from a $25 board to a 50th celebration."]
  ];
  const look = `<section class="ebook-section fx-look" id="look-inside">
    <div class="ebook-section-inner">
      <p class="section-kicker">Look inside</p>
      <h2>Real pages from the book</h2>
      <p>Every board follows the same five-page blueprint, so once you've used one, you can use them all. Tap a page to see it full size.</p>
      <div class="fx-look-grid">
        ${pages.map(([f, t, d]) => `<figure>
          <a href="/images/book/${f}.webp" target="_blank" rel="noopener"><img src="/images/book/${f}-sm.webp" alt="${esc(t)}" width="360" height="466" loading="lazy" decoding="async"></a>
          <figcaption><strong>${esc(t)}</strong>${esc(d)}</figcaption>
        </figure>`).join("\n        ")}
      </div>
    </div>
  </section>`;

  const sample = `<section class="ebook-section fx-sample" id="sample">
    <div class="ebook-section-inner fx-sample-inner">
      <img src="/images/book/look-shopping-list-sm.webp" alt="Board 01 shopping list page" width="360" height="466" loading="lazy" decoding="async">
      <div>
        <p class="section-kicker">Free sample</p>
        <h2>Read board 01 before you buy</h2>
        <p>The Classic American Starter Board, all five pages, plus the introduction and the full contents: 11 pages as a PDF. Build it this weekend and see if the system works for you.</p>
        ${F.sampleForm("sample-email", "ebook_sample")}
      </div>
    </div>
  </section>`;

  const list = `<section class="ebook-section fx-all" id="all-boards">
    <div class="ebook-section-inner">
      <p class="section-kicker">All 50 boards</p>
      <h2>Every board in the book</h2>
      <div class="fx-all-groups">
        ${BOOK_SECTIONS.map(([name, nums]) => `<div class="fx-all-group">
          <h3>${esc(name)} <span>${nums.length} boards</span></h3>
          <ol>${nums.map((n) => bookBoards.get(n)).filter(Boolean).map((b) => `<li id="board-${b.nn}"><b>${b.nn}</b> ${b.published ? `<a href="/boards/${b.slug}/">${esc(b.name.replace(/^The /, ""))}</a>` : esc(b.name.replace(/^The /, ""))}</li>`).join("")}</ol>
        </div>`).join("\n        ")}
      </div>
    </div>
  </section>`;

  return { samples, look, sample, list };
}

// ----------------------------------------------------------- printables ---

// Which printable answers which page. Returns a product slug.
export function printableFor({ kind, slug = "", title = "", category = "" }) {
  const s = `${slug} ${title}`.toLowerCase();
  if (/dairy-free|vegan|plant-based/.test(s)) return "";
  if (kind === "chart" || kind === "drink" || /wine|sommelier|champagne|prosecco|port\b|pinot|cabernet|chardonnay|beer|cider/.test(s)) return "wine-cheese-pairing-guide";
  if (kind === "builder") return "complete-board-builder-bundle";
  if (/how-to-make|build-sequence|beginner|easy-charcuterie|what-goes-on|presentation|quantities|serving-size|per-person|how-much|board-ideas|appetizer|large-group|grazing/.test(s)) return "classic-entertaining-board-blueprint";
  if (category === "Cheese" || /cheese|brie|cheddar|gouda|manchego|parmesan|gorgonzola|stilton|chevre|feta|gruyere|camembert|comte|taleggio|burrata/.test(s)) return "cheese-pairing-science-card";
  if (kind === "board" || kind === "holiday" || kind === "hub") return "complete-board-builder-bundle";
  return "complete-board-builder-bundle";
}

const SCIENCE_CARD_CHEESES = ["brie", "aged-cheddar", "aged-gouda", "manchego", "parmesan", "parmigiano-reggiano", "gorgonzola", "stilton", "goat-cheese", "chevre", "fresh-chevre", "feta", "muenster", "smoked-gouda", "brie-de-meaux", "gruyere", "camembert", "comte"];

export function makePrintables(h, products) {
  const esc = h.escapeHtml;
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const buy = (p, campaign, label = "") => `<a class="button primary" href="${esc(h.withTracking(p.url, campaign))}" target="_blank" rel="noopener">${esc(label || `Get the PDF · ${p.priceShort}`)}</a>`;

  function card(slug, campaign, { lead = "", item = null } = {}) {
    const p = bySlug.get(slug);
    if (!p) return "";
    let line = lead || p.hook;
    if (!lead && slug === "cheese-pairing-science-card" && item && SCIENCE_CARD_CHEESES.includes(item.slug)) {
      line = `${item.title} is one of the 15 cheeses on the card: its best fruits, meats, crackers, condiments and drinks on one printable page.`;
    }
    return `<aside class="fx-print" aria-label="Printable: ${esc(p.title)}">
    <a class="fx-print-img" href="/printables/${p.slug}/"><img src="${esc(p.image)}" alt="${esc(p.title)} preview" width="240" height="240" loading="lazy" decoding="async"></a>
    <div>
      <p class="eyebrow">Printable · ${esc(p.priceShort)} · ${esc(p.pagesLabel)}</p>
      <h2>${esc(p.title)}</h2>
      <p>${esc(line)}</p>
      <div class="fx-print-actions">${buy(p, campaign)}<a class="fx-more" href="/printables/${p.slug}/">What's inside &rarr;</a></div>
    </div>
  </aside>`;
  }

  function productSchema(p) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.title,
      description: p.metaDescription,
      image: h.absoluteUrl(p.image),
      brand: { "@type": "Brand", name: "Charcuterie Lab" },
      url: h.absoluteUrl(`/printables/${p.slug}/`),
      offers: { "@type": "Offer", price: p.price.replace("$", ""), priceCurrency: "USD", availability: "https://schema.org/InStock", url: p.url }
    };
  }

  function productPage(p) {
    const bundle = bySlug.get("complete-board-builder-bundle");
    const inBundle = p.slug !== bundle.slug && (bundle.contains || []).includes(p.slug);
    const faq = [
      ["How do I get it?", "Checkout is on Gumroad. You get an instant download link by email, and the PDF stays in your Gumroad library."],
      ["What size does it print?", `${p.format}. It prints on any home printer, and reads fine on a phone too.`],
      ["Can I print it more than once?", "Yes. Print it for every party; it doesn't expire."],
      ...(inBundle ? [["Is it in a bundle?", `Yes. It's one of the three PDFs in the Complete Board Builder Bundle (${bundle.priceShort} for all three).`]] : [])
    ];
    return h.layout({
      title: `${p.seoTitle} | Charcuterie Lab`,
      canonical: `/printables/${p.slug}/`,
      image: p.image,
      description: p.metaDescription,
      head: `  <script type="application/ld+json">${h.jsonForScript(productSchema(p))}</script>
  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) })}</script>`,
      body: `<main class="fx-product">
  <nav class="fx-crumbs" aria-label="Breadcrumb"><a href="/shop/">Shop</a> / <a href="/printables/">Printables</a> / ${esc(p.title)}</nav>
  <section class="fx-product-hero">
    <img src="${esc(p.image)}" alt="${esc(p.title)} preview" width="480" height="480">
    <div>
      <p class="section-kicker">Printable · Instant PDF</p>
      <h1>${esc(p.title)}</h1>
      <p class="fx-product-lead">${esc(p.hook)}</p>
      <p class="fx-product-price">${esc(p.priceShort)} <span>${esc(p.pagesLabel)} · ${esc(p.format)}</span></p>
      ${buy(p, `printable_${p.slug}_hero`)}
      ${inBundle ? `<p class="fx-fine">Or get it with two more printables in the <a href="/printables/${bundle.slug}/">Complete Board Builder Bundle</a> for ${esc(bundle.priceShort)}.</p>` : ""}
    </div>
  </section>
  <section class="fx-product-body">
    <div>
      <h2>What's inside</h2>
      <ul class="fx-checks">${p.includes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <h2>Who it's for</h2>
      <p>${esc(p.who)}</p>
      <h2>Questions</h2>
      <div class="ebook-faq-list">${faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
    </div>
    <aside class="fx-product-side">
      <p class="eyebrow">Free on the site</p>
      <ul>${(p.free || []).map(([t, u]) => `<li><a href="${u}">${esc(t)}</a></li>`).join("")}</ul>
    </aside>
  </section>
  ${h.bookCard(null, `printable_${p.slug}_book`, { lead: "Want the whole system? The book has 50 complete boards, each with a shopping list, a timed build and a swap for every ingredient." })}
</main>`
    });
  }

  function landing(bookBoards) {
    const b01 = bookBoards.get(1);
    const faq = [
      ["Is there a free printable charcuterie shopping list?", "Yes. Board 01 from the book, the Classic American Starter, is free as an 11-page PDF with its full shopping list, and the Board Builder prints a shopping list sized to your guest count."],
      ["What's the difference between the printables and the book?", "Each printable is one focused tool: a pairing chart, a cheese card or one complete board plan. The book is 50 complete boards in the same format."],
      ["How do I download them?", "Checkout is on Gumroad. The download link arrives by email straight away."]
    ];
    return h.layout({
      title: "Printable Charcuterie Board Shopping Lists, Charts & Templates | Charcuterie Lab",
      canonical: "/printables/",
      image: products[0].image,
      description: "Printable charcuterie board shopping lists, a wine and cheese pairing chart, a cheese pairing card and board blueprints. Free board 01 sample plus instant PDFs from $7.",
      head: `  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "ItemList", name: "Charcuterie Lab printables", itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: h.absoluteUrl(`/printables/${p.slug}/`), name: p.title })) })}</script>
  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) })}</script>`,
      body: `<main class="fx-printables">
  <header class="fx-p-hero">
    <p class="section-kicker">Printables</p>
    <h1>Printable charcuterie board shopping lists, charts and templates</h1>
    <p>Print it, take it to the store, build from it. Start with the free ones; the paid PDFs are the designed, complete versions.</p>
  </header>
  <section class="fx-p-free" aria-labelledby="fx-free">
    <h2 id="fx-free">Free printables</h2>
    <div class="fx-p-free-grid">
      <article class="fx-p-free-card fx-p-sample">
        <img src="/images/book/look-shopping-list-sm.webp" alt="Board 01 shopping list" width="360" height="466" loading="lazy" decoding="async">
        <div>
          <p class="eyebrow">Free · 11-page PDF</p>
          <h3>Charcuterie board shopping list and plan: ${esc(b01 ? b01.name : "Board 01")}</h3>
          <p>A full board from the book: shopping list with quantities and prices, timed build, placement steps, swaps and upgrades. For 8 to 12 people.</p>
          ${h.sampleForm("printables-sample", "printables_sample", { compact: true })}
        </div>
      </article>
      <a class="fx-p-free-card" href="/board-builder/"><div><p class="eyebrow">Free · prints from your browser</p><h3>Shopping list sized to your guest count</h3><p>Pick your cheeses, meats and extras in the Board Builder, then print the list, prep steps and a layout.</p><span class="fx-more">Open the Board Builder &rarr;</span></div></a>
      <a class="fx-p-free-card" href="/pairings/wine-and-cheese-chart/"><div><p class="eyebrow">Free · prints from your browser</p><h3>Wine and cheese pairing chart</h3><p>Twelve wines against thirty cheeses on one page, with beer and cider columns if you want them.</p><span class="fx-more">Open the chart &rarr;</span></div></a>
      <a class="fx-p-free-card" href="/boards/"><div><p class="eyebrow">Free · 28 boards</p><h3>Board plans with checklists</h3><p>What to buy, why it works and a countdown timeline for every board in the library.</p><span class="fx-more">Browse the boards &rarr;</span></div></a>
    </div>
  </section>
  <section class="fx-p-paid" aria-labelledby="fx-paid">
    <h2 id="fx-paid">Printable PDFs</h2>
    <div class="fx-p-grid">
      ${products.map((p) => `<article class="fx-p-card">
        <a href="/printables/${p.slug}/"><img src="${esc(p.image)}" alt="${esc(p.title)} preview" width="320" height="320" loading="lazy" decoding="async"></a>
        <p class="eyebrow">${esc(p.priceShort)} · ${esc(p.pagesLabel)}</p>
        <h3><a href="/printables/${p.slug}/">${esc(p.title)}</a></h3>
        <p>${esc(p.hook)}</p>
        <div class="fx-print-actions">${buy(p, "printables_hub")}<a class="fx-more" href="/printables/${p.slug}/">What's inside &rarr;</a></div>
      </article>`).join("\n      ")}
    </div>
  </section>
  <section class="fx-p-faq ebook-faq-list" aria-label="Questions">
    <h2>Questions</h2>
    ${faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n    ")}
  </section>
  ${h.bookCard(null, "printables_hub_book")}
</main>`
    });
  }

  return { card, productPage, landing, bySlug };
}
