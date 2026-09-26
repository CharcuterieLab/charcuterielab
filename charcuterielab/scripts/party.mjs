// Party Planner: /party-planner/ plus one page per guest count.
//
// One quantity standard for the whole site (the Board Builder uses the same
// numbers in src/board-builder/board-logic.js): meat and cheese per guest are
// 2 oz before a meal, 3 oz as the party food, 4 oz when the board is dinner,
// plus 10% from 20 guests up. Every number on every page comes from plan()
// below, so changing the standard is a one-line change.

export const COUNTS = [4, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 100];

export const MODES = {
  app: { label: "Appetizer", long: "Appetizer (a meal follows)", meat: 2, cheese: 2, crackers: [6, 8], fruit: 2, nuts: 0.5, briny: 1, budget: 1 },
  main: { label: "Party spread", long: "Party spread (no meal)", meat: 3, cheese: 3, crackers: [10, 12], fruit: 3, nuts: 1, briny: 1.5, budget: 1.5 },
  meal: { label: "Meal", long: "Meal (the board is dinner)", meat: 4, cheese: 4, crackers: [12, 15], fruit: 4, nuts: 1, briny: 2, budget: 2 }
};

// Per-guest food cost for an appetizer-size portion, from the book's own
// boards: the $25 Budget Board ($20-25 for 6-8), the Classic American Starter
// ($40-65 for 8-12) and the Luxury Splurge ($150-250 for 8-12).
const BUDGET = [["Budget", 3, 4], ["Standard", 5, 7], ["Splurge", 13, 20]];

// Book board to build for each guest count (serving sizes as printed in the book).
export const BOARD_FOR = { 4: 21, 6: 13, 8: 1, 10: 1, 12: 6, 15: 6, 20: 30, 25: 30, 30: 49, 40: 49, 50: 49, 100: 49 };

export const slugFor = (n) => `charcuterie-board-for-${n}-people`;
export const urlFor = (n) => `/party-planner/${slugFor(n)}/`;
export const defaultMode = (n) => (n >= 20 ? "main" : "app");

const FRAC = { 0.25: "¼", 0.5: "½", 0.75: "¾" };
export function lb(oz) {
  // round up to the next quarter pound; under a pound, whole ounces
  if (oz < 16) return `${Math.ceil(oz)} oz`;
  const q = Math.ceil((oz / 16) * 4) / 4;
  const whole = Math.floor(q);
  const f = FRAC[q - whole] || "";
  return `${whole || ""}${f} lb`.replace(/^ /, "");
}
const halfPound = (oz) => Math.ceil(oz / 8) * 8;

export function plan(n, mode) {
  const m = MODES[mode];
  const buf = n >= 20 ? 1.1 : 1;
  const meatOz = n * m.meat * buf;
  const cheeseOz = halfPound(n * m.cheese * buf);
  const varieties = n <= 8 ? [3, 2] : n <= 15 ? ["3–4", 3] : n <= 30 ? ["4–5", "3–4"] : ["5–6", "4–5"];
  const spreads = n <= 10 ? 2 : n <= 25 ? 3 : n <= 50 ? 4 : 5;
  const setup = n <= 6 ? "One 12–14 inch board"
    : n <= 10 ? "One 16–18 inch board"
    : n <= 15 ? "One large 22–28 inch board"
    : n <= 30 ? "Two boards, or two stations on one table"
    : n <= 50 ? "A grazing table, or three stations"
    : "A grazing table in four stations, refilled from the fridge";
  const budget = BUDGET.map(([name, lo, hi]) => [name, Math.round(n * lo * m.budget / 5) * 5, Math.round(n * hi * m.budget / 5) * 5]);
  return {
    n, mode, buffer: buf > 1,
    meat: lb(meatOz), meatOz, packs: Math.ceil(meatOz / 3.5),
    cheese: lb(cheeseOz), cheeseOz,
    crackers: [n * m.crackers[0], n * m.crackers[1]],
    fruit: lb(n * m.fruit * buf), nuts: lb(n * m.nuts * buf), briny: lb(n * m.briny * buf),
    spreads, cheeses: varieties[0], meats: varieties[1], setup, budget
  };
}

export function timeline(n) {
  const big = n >= 20;
  return [
    [big ? "1 week before" : "2–3 days before", big ? "Order large pieces from the deli or warehouse store, and borrow extra boards or platters." : "Buy crackers, nuts, jams and anything shelf-stable."],
    [big ? "2 days before" : "The day before", big ? "Buy the cheese, meat and fruit. Buy crackers and nuts too." : "Buy the cheese, meat and fruit."],
    ["The night before", big ? "Cut the firm cheeses and portion everything into containers, one set per station and one set for the refill. Cover and chill." : "Cut the firm cheeses, cover and chill. Wash the grapes."],
    ["1 hour before", "Take the cheese out so it can warm up. Soft cheese takes the full hour."],
    ["30–45 minutes before", big ? "Build the stations: cheese first, then meat, then bowls, crackers and fruit." : "Build the board: cheese first, then meat, then bowls, crackers and fruit."],
    ["While it's out", big ? "Swap in the fresh, fridge-cold refill before any tray has been out 2 hours." : "Keep it out no longer than 2 hours, then refrigerate what's left."]
  ];
}

export function faq(n, P, board) {
  const a = P.app, p = P.main;
  const boards = a.setup.replace(/^One /, "one ");
  const out = [
    [`How much meat and cheese do I need for ${n} people?`, `As an appetizer before a meal, about ${a.meat} of meat and ${a.cheese} of cheese. If the board is the party food with no meal, about ${p.meat} of meat and ${p.cheese} of cheese. If it's dinner, plan ${P.meal.meat} of meat and ${P.meal.cheese} of cheese.${n >= 20 ? " These include a 10% buffer, because crowds eat the favorites first." : ""}`],
    [`How many crackers for ${n} people?`, `${a.crackers[0]} to ${a.crackers[1]} crackers or slices of bread as an appetizer, ${p.crackers[0]} to ${p.crackers[1]} as the party food. Put out half and refill.`],
    [`How big a board do I need for ${n} people?`, `${boards.charAt(0).toUpperCase() + boards.slice(1)}. Guests eat more comfortably from two smaller boards than from one crowded one.`],
    [`How much does a charcuterie board for ${n} people cost?`, `As an appetizer, roughly $${a.budget[0][1]}–$${a.budget[0][2]} on a budget, $${a.budget[1][1]}–$${a.budget[1][2]} for a standard board, and $${a.budget[2][1]}–$${a.budget[2][2]} with splurge cheeses and meats. Prices vary by store and region.`],
    [`How far ahead can I make a charcuterie board for ${n} people?`, `Cut firm cheeses the night before and build the board 30–45 minutes before guests arrive. Perishable food shouldn't sit out more than 2 hours${n >= 20 ? ", so build a fresh refill tray instead of putting everything out at once" : ""}.`]
  ];
  if (board) out.push([`Is there a complete plan for ${n} people?`, `Yes: ${board.name} (board #${board.nn} in 50 Boards Built by Science) serves ${board.serves}${n > 30 ? " per station" : ""}, with the exact shopping list, a timed build and a swap for every ingredient.`]);
  return out;
}

// ---------------------------------------------------------------- pages ---

const USDA = "https://ask.fsis.usda.gov/article/What-is-the-2-Hour-Rule-with-leaving-food-out";

function amountRows(p) {
  return [
    ["Cured meat", p.meat, p.meatOz > 64 ? `${p.meats} kinds · buy sliced at the deli counter or in 1 lb packs` : `${p.meats} kinds · about ${p.packs} packs of 3–4 oz`],
    ["Cheese", p.cheese, `${p.cheeses} kinds`],
    ["Crackers and bread", `${p.crackers[0]}–${p.crackers[1]} pieces`, "Two kinds: one plain, one with flavor"],
    ["Fresh and dried fruit", p.fruit, "Grapes, apples or pears, plus one dried fruit"],
    ["Nuts", p.nuts, "Marcona almonds, candied pecans or walnuts"],
    ["Olives and pickles", p.briny, "Olives plus cornichons or pickled vegetables"],
    ["Spreads and honey", `${p.spreads} kinds`, "A jam, a honey, a mustard"]
  ];
}

function amountsTable(h, p, id) {
  return `<table class="pp-table" id="${id}">
        <thead><tr><th scope="col">Buy</th><th scope="col">Amount</th><th scope="col">Notes</th></tr></thead>
        <tbody>${amountRows(p).map(([a, b, c]) => `<tr><th scope="row">${h.escapeHtml(a)}</th><td><strong>${h.escapeHtml(b)}</strong></td><td>${h.escapeHtml(c)}</td></tr>`).join("")}</tbody>
      </table>`;
}

const modeSwitchJs = `<script>(function(){document.querySelectorAll("[data-pp-modes]").forEach(function(w){var bs=w.querySelectorAll("[data-pp-mode]");function set(m){bs.forEach(function(b){var on=b.dataset.ppMode===m;b.classList.toggle("is-on",on);b.setAttribute("aria-pressed",on)});document.querySelectorAll("[data-pp-panel]").forEach(function(p){p.hidden=p.dataset.ppPanel!==m})}bs.forEach(function(b){b.addEventListener("click",function(){set(b.dataset.ppMode)})});set(w.dataset.ppDefault)})})();</script>`;

function leadForm(h, id, campaign, pdf, label) {
  return `<form class="fx-sample-form pp-lead" action="${h.newsletterUrl}" method="get" target="_blank" rel="noopener" data-fx-sample>
      <label class="sr-only" for="${id}">Email address</label>
      <input id="${id}" name="email" type="email" autocomplete="email" placeholder="Email address" required>
      <input type="hidden" name="utm_source" value="charcuterielab">
      <input type="hidden" name="utm_medium" value="site">
      <input type="hidden" name="utm_campaign" value="${h.escapeHtml(campaign)}">
      <button class="button primary" type="submit">${h.escapeHtml(label)}</button>
      <p class="fx-sample-done" hidden>Your list is ready: <a class="button" href="${pdf}" download>Download the PDF</a><span>You're also on the weekly Lab Report. Confirm in the tab that just opened.</span></p>
    </form>
    <script>(function(){document.querySelectorAll("[data-fx-sample]").forEach(function(f){if(f.dataset.bound)return;f.dataset.bound=1;f.addEventListener("submit",function(){var d=f.querySelector(".fx-sample-done");setTimeout(function(){d.hidden=false},200)})})})();</script>`;
}

export function pdfFor(n) {
  return `/downloads/party-planner/charcuterie-shopping-list-${n}-people.pdf`;
}

function crumbs(h, items) {
  return `  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: h.absoluteUrl(url) })) })}</script>`;
}

function faqSchema(h, list) {
  return `  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: list.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) })}</script>`;
}

export function partyPage(h, n, { bookBoards, libraryByNumber, known, builderLink }) {
  const P = { app: plan(n, "app"), main: plan(n, "main"), meal: plan(n, "meal") };
  const dm = defaultMode(n);
  const d = P[dm];
  const book = bookBoards.get(BOARD_FOR[n]);
  const lib = book ? libraryByNumber.get(book.n) : null;
  const builder = lib && known ? builderLink(lib, known).replace(/&g=\d+&m=\w+/, `&g=${Math.min(n, 200)}&m=${dm}`) : `/board-builder/?g=${n}&m=${dm}`;
  const Q = faq(n, P, book);
  const answer = `For ${n} people, buy about ${d.meat} of cured meat and ${d.cheese} of cheese, ${d.crackers[0]}–${d.crackers[1]} crackers, ${d.fruit} of fruit and ${d.spreads} spreads${dm === "main" ? " if the board is the party food" : " as an appetizer before a meal"}. ${dm === "main" ? `Before a meal, ${P.app.meat} of meat and ${P.app.cheese} of cheese is enough` : `If it's the party food, go up to ${P.main.meat} of meat and ${P.main.cheese} of cheese`}; if it's dinner, ${P.meal.meat} of meat and ${P.meal.cheese} of cheese.`;
  const i = COUNTS.indexOf(n);
  const near = [COUNTS[i - 1], COUNTS[i + 1]].filter(Boolean);
  const stations = n < 20 ? 1 : n <= 30 ? 2 : n <= 50 ? 3 : 4;
  const builds = n > 30 ? Math.ceil(n / 25) : 1;
  const T = timeline(n);
  const title = `Charcuterie Board for ${n} People: How Much to Buy`;
  const printCard = h.printCard(n >= 20 ? "grazing-table-planner" : "classic-entertaining-board-blueprint", `party_print_${n}`) || h.printCard("complete-board-builder-bundle", `party_print_${n}`);

  return h.layout({
    title: `${title} | Charcuterie Lab`,
    canonical: urlFor(n),
    image: book ? book.image : "/images/how-much-charcuterie-per-person.webp",
    description: `For ${n} people: about ${d.meat} of meat, ${d.cheese} of cheese, ${d.crackers[0]}–${d.crackers[1]} crackers and ${d.spreads} spreads. Full shopping list, cost, board size and timeline.`.slice(0, 158),
    head: `${faqSchema(h, Q)}
${crumbs(h, [["Party Planner", "/party-planner/"], [`${n} people`, urlFor(n)]])}
  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "HowTo", name: `How to plan a charcuterie board for ${n} people`, step: T.map(([when, what], k) => ({ "@type": "HowToStep", position: k + 1, name: when, text: what })) })}</script>`,
    body: `<main class="pp-main">
  <nav class="fx-crumbs" aria-label="Breadcrumb"><a href="/party-planner/">Party Planner</a> / ${n} people</nav>
  <header class="pp-hero">
    <p class="section-kicker">Party Planner</p>
    <h1>Charcuterie board for ${n} people</h1>
    <p class="pp-answer">${h.escapeHtml(answer)}</p>
  </header>

  <section class="pp-section" aria-labelledby="pp-list">
    <h2 id="pp-list">What to buy for ${n} people</h2>
    <div class="pp-modes" role="group" aria-label="How is it being served?" data-pp-modes data-pp-default="${dm}">
      ${Object.entries(MODES).map(([k, m]) => `<button type="button" class="pp-mode" data-pp-mode="${k}" aria-pressed="${k === dm}">${h.escapeHtml(m.label)}<span>${m.meat} oz each</span></button>`).join("")}
    </div>
    ${Object.keys(MODES).map((k) => `<div class="pp-panel" data-pp-panel="${k}"${k === dm ? "" : " hidden"}>
      <p class="pp-panel-k">${h.escapeHtml(MODES[k].long)}</p>
      ${amountsTable(h, P[k], `pp-t-${k}`)}
    </div>`).join("\n    ")}
    <p class="bl-note">${n >= 20 ? "Amounts include a 10% buffer for a crowd. " : ""}Based on ${MODES.app.meat} oz each of meat and cheese per guest before a meal, ${MODES.main.meat} oz as the party food and ${MODES.meal.meat} oz as the meal. <a href="/party-planner/#rules">How we worked it out</a>.</p>
    <div class="pp-actions">
      <a class="button primary" href="${builder}">Build it in the Board Builder for ${n}</a>
      <button type="button" class="button" onclick="window.print()">Print this list</button>
    </div>
    <div class="pp-lead-box">
      <p><strong>Get this list as a printable PDF</strong> with checkboxes, all three party sizes and the timeline.</p>
      ${leadForm(h, `pp-email-${n}`, `party_list_${n}`, pdfFor(n), "Email me the list")}
    </div>
  </section>

  <section class="pp-section" aria-labelledby="pp-cost">
    <h2 id="pp-cost">How much it costs</h2>
    <table class="pp-table pp-cost">
      <thead><tr><th scope="col">Level</th>${Object.values(MODES).map((m) => `<th scope="col">${h.escapeHtml(m.label)}</th>`).join("")}</tr></thead>
      <tbody>${BUDGET.map(([name], r) => `<tr><th scope="row">${name}</th>${Object.keys(MODES).map((k) => `<td>$${P[k].budget[r][1]}–$${P[k].budget[r][2]}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
    <p class="bl-note">Estimates for the food only, scaled from the costs of the boards in our book. Store, region and season all change the total.</p>
  </section>

  <section class="pp-section" aria-labelledby="pp-setup">
    <h2 id="pp-setup">Board size and setup</h2>
    <p><strong>${h.escapeHtml(d.setup)}.</strong> ${stations > 1 ? `Split the food into ${stations} identical stations so guests don't queue at one end. Each station gets every cheese, meat and cracker, and its own knives.` : "Keep bowls for olives, jams and honey on the board so nothing rolls into the crackers."} See <a href="/blog/charcuterie-board-sizes/">board sizes</a>${n >= 30 ? ` and <a href="/blog/grazing-table/">how to build a grazing table</a>` : ""}.</p>
  </section>

  <section class="pp-section" aria-labelledby="pp-time">
    <h2 id="pp-time">Timeline</h2>
    <ol class="bl-timeline">${T.map(([w, t]) => `<li><b>${h.escapeHtml(w)}</b><span>${h.escapeHtml(t)}</span></li>`).join("")}</ol>
    <p class="bl-note">Perishable food shouldn't sit out more than 2 hours (1 hour above 90°F). <a href="${USDA}" target="_blank" rel="noopener">USDA guidance</a>.</p>
  </section>

  ${book ? h.bookCard(book, `party_book_${n}`, { lead: `A complete board for this size: ${book.name} serves ${book.serves}${builds > 1 ? `, so build it ${builds} times over and split it across the stations` : ""}. The book has its exact shopping list with amounts and prices, a timed build, where every item goes and why, and a swap for every ingredient.` }) : ""}
  ${lib ? `<p class="bl-note pp-free-board">Or see the free preview of <a href="/boards/${lib.slug}/">${h.escapeHtml(lib.h1 || lib.title)}</a>.</p>` : ""}

  <section class="pp-section" aria-labelledby="pp-near">
    <h2 id="pp-near">Other guest counts</h2>
    <ul class="pp-counts">${COUNTS.map((c) => `<li>${c === n ? `<span aria-current="page">${c}</span>` : `<a href="${urlFor(c)}">${c}</a>`}</li>`).join("")}</ul>
    <p class="bl-note">${near.map((c) => `Hosting ${c} instead? <a href="${urlFor(c)}">See the plan for ${c}</a>.`).join(" ")}</p>
  </section>

  ${printCard}

  <section class="pp-section" id="faq" aria-labelledby="pp-faq">
    <h2 id="pp-faq">Questions about a board for ${n}</h2>
    <div class="ebook-faq-list">${Q.map(([q, a], k) => `<details${k === 0 ? " open" : ""}><summary>${h.escapeHtml(q)}</summary><p>${h.escapeHtml(a)}</p></details>`).join("")}</div>
  </section>
</main>
${h.newsletterPanel("pp-news", `party_${n}`)}
${modeSwitchJs}`
  });
}

export function partyHub(h, { bookBoards }) {
  const hubFaq = [
    ["How much charcuterie per person?", `About ${MODES.app.meat} oz of meat and ${MODES.app.cheese} oz of cheese per person before a meal, ${MODES.main.meat} oz of each when the board is the party food, and ${MODES.meal.meat} oz of each when it's dinner. Add 10% from 20 guests up.`],
    ["How many crackers per person?", `${MODES.app.crackers[0]}–${MODES.app.crackers[1]} as an appetizer, ${MODES.main.crackers[0]}–${MODES.main.crackers[1]} as the party food, ${MODES.meal.crackers[0]}–${MODES.meal.crackers[1]} as a meal.`],
    ["How many cheeses should I serve?", "Three for up to 8 guests, three or four up to 15, four or five up to 30, and five or six in bigger amounts for a crowd. More kinds doesn't mean more food; it means smaller pieces of each."],
    ["How long can a charcuterie board sit out?", "No more than 2 hours, or 1 hour above 90°F, per USDA guidance for perishable food. For a long party, keep a refill tray in the fridge."]
  ];
  const chart = COUNTS.map((n) => ({ n, p: plan(n, defaultMode(n)), a: plan(n, "app") }));
  const data = JSON.stringify({ modes: MODES, counts: COUNTS });
  return h.layout({
    title: "How Much Charcuterie Do I Need? Party Planner for 4 to 100 Guests | Charcuterie Lab",
    canonical: "/party-planner/",
    image: "/images/how-much-charcuterie-per-person.webp",
    description: `How much charcuterie you need: ${MODES.app.meat} oz each of meat and cheese per guest before a meal, ${MODES.main.meat} oz as the party food. Plans for 4 to 100 guests.`,
    head: `${faqSchema(h, hubFaq)}
  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "ItemList", name: "Charcuterie board plans by guest count", itemListElement: COUNTS.map((n, i) => ({ "@type": "ListItem", position: i + 1, url: h.absoluteUrl(urlFor(n)), name: `Charcuterie board for ${n} people` })) })}</script>`,
    body: `<main class="pp-main">
  <header class="pp-hero">
    <p class="section-kicker">Party Planner</p>
    <h1>How much charcuterie do I need?</h1>
    <p class="pp-answer">Plan about ${MODES.app.meat} oz of cured meat and ${MODES.app.cheese} oz of cheese per guest when a meal follows, ${MODES.main.meat} oz of each when the board is the party food, and ${MODES.meal.meat} oz of each when it's dinner. Add 10% from 20 guests up.</p>
  </header>

  <section class="pp-section pp-picker" aria-labelledby="pp-pick">
    <h2 id="pp-pick">Work it out for your party</h2>
    <form class="pp-pick-form" data-pp-picker onsubmit="return false">
      <label for="pp-n">Guests</label>
      <input id="pp-n" type="number" inputmode="numeric" min="1" max="300" value="12">
      <div class="pp-modes" role="group" aria-label="How is it being served?">
        ${Object.entries(MODES).map(([k, m]) => `<button type="button" class="pp-mode${k === "app" ? " is-on" : ""}" data-pick-mode="${k}" aria-pressed="${k === "app"}">${h.escapeHtml(m.label)}<span>${m.meat} oz each</span></button>`).join("")}
      </div>
    </form>
    <div class="pp-pick-out" data-pp-out aria-live="polite"></div>
    <noscript><p>Pick your guest count below for the full plan.</p></noscript>
  </section>

  <section class="pp-section" aria-labelledby="pp-chart">
    <h2 id="pp-chart">Quick chart: how much for 4 to 100 guests</h2>
    <div class="pp-scroll"><table class="pp-table pp-chart">
      <thead><tr><th scope="col">Guests</th><th scope="col">Meat</th><th scope="col">Cheese</th><th scope="col">Crackers</th><th scope="col">Setup</th><th scope="col">Plan</th></tr></thead>
      <tbody>${chart.map(({ n, a }) => `<tr><th scope="row">${n}</th><td>${a.meat}</td><td>${a.cheese}</td><td>${a.crackers[0]}–${a.crackers[1]}</td><td>${h.escapeHtml(a.setup)}</td><td><a href="${urlFor(n)}">For ${n} &rarr;</a></td></tr>`).join("")}</tbody>
    </table></div>
    <p class="bl-note">Appetizer amounts (a meal follows). For a party with no meal, multiply meat and cheese by 1.5; if the board is dinner, double them. Each guest-count page has all three.</p>
  </section>

  <section class="pp-section" aria-labelledby="pp-by">
    <h2 id="pp-by">Plan by guest count</h2>
    <ul class="pp-count-cards">${COUNTS.map((n) => { const b = bookBoards.get(BOARD_FOR[n]); return `<li><a href="${urlFor(n)}"><strong>${n} people</strong><span>${plan(n, defaultMode(n)).meat} meat · ${plan(n, defaultMode(n)).cheese} cheese</span>${b ? `<em>Build: ${h.escapeHtml(b.name.replace(/^The /, ""))}</em>` : ""}</a></li>`; }).join("")}</ul>
    <p class="bl-note">Just two of you? See the <a href="/blog/charcuterie-board-two/">board for two</a>.</p>
  </section>

  <section class="pp-section" id="rules" aria-labelledby="pp-rules">
    <h2 id="pp-rules">The rules behind the numbers</h2>
    <table class="pp-table">
      <thead><tr><th scope="col">Per guest</th>${Object.values(MODES).map((m) => `<th scope="col">${h.escapeHtml(m.label)}</th>`).join("")}</tr></thead>
      <tbody>
        <tr><th scope="row">Cured meat</th>${Object.values(MODES).map((m) => `<td>${m.meat} oz</td>`).join("")}</tr>
        <tr><th scope="row">Cheese</th>${Object.values(MODES).map((m) => `<td>${m.cheese} oz</td>`).join("")}</tr>
        <tr><th scope="row">Crackers or bread</th>${Object.values(MODES).map((m) => `<td>${m.crackers[0]}–${m.crackers[1]}</td>`).join("")}</tr>
        <tr><th scope="row">Fruit</th>${Object.values(MODES).map((m) => `<td>${m.fruit} oz</td>`).join("")}</tr>
        <tr><th scope="row">Nuts</th>${Object.values(MODES).map((m) => `<td>${m.nuts} oz</td>`).join("")}</tr>
        <tr><th scope="row">Olives and pickles</th>${Object.values(MODES).map((m) => `<td>${m.briny} oz</td>`).join("")}</tr>
      </tbody>
    </table>
    <ul class="pp-rules">
      <li><strong>Add 10% from 20 guests up.</strong> Crowds eat unevenly and the favorites run out first.</li>
      <li><strong>Spreads go by count, not per person:</strong> 2 up to 10 guests, 3 up to 25, then 4 or 5.</li>
      <li><strong>More guests, a few more kinds:</strong> 3 cheeses and 2 meats up to 8 guests; 5 or 6 cheeses in bigger pieces for a crowd.</li>
      <li><strong>Two boards beat one crowded board</strong> from about 20 guests. From 40, set up a grazing table in stations.</li>
      <li><strong>Two hours out, then refill.</strong> Perishable food shouldn't sit out longer (<a href="${USDA}" target="_blank" rel="noopener">USDA</a>).</li>
    </ul>
    <p class="bl-note">More detail: <a href="/blog/how-much-charcuterie-per-person/">how much charcuterie per person</a>, <a href="/blog/how-much-cheese-charcuterie-board/">how much cheese</a>, <a href="/blog/charcuterie-board-sizes/">board sizes</a>, <a href="/blog/grazing-table/">grazing tables</a>.</p>
  </section>

  <section class="pp-section" aria-labelledby="pp-occ">
    <h2 id="pp-occ">Planning for an occasion?</h2>
    <p><a href="/boards/office-party-charcuterie-board/">Office party</a> · <a href="/boards/cocktail-party-charcuterie-board/">Cocktail party</a> · <a href="/boards/game-day-charcuterie-board/">Game day</a> · <a href="/holidays/thanksgiving/">Thanksgiving</a> · <a href="/holidays/christmas/">Christmas</a> · <a href="/boards/new-years-eve-charcuterie-board/">New Year's Eve</a> · <a href="/boards/">All boards</a></p>
  </section>

  ${h.printCard("grazing-table-planner", "party_hub_print") || h.printCard("complete-board-builder-bundle", "party_hub_print")}
  ${h.bookCard(null, "party_hub_book")}

  <section class="pp-section" id="faq" aria-labelledby="pp-hfaq">
    <h2 id="pp-hfaq">Questions</h2>
    <div class="ebook-faq-list">${hubFaq.map(([q, a], k) => `<details${k === 0 ? " open" : ""}><summary>${h.escapeHtml(q)}</summary><p>${h.escapeHtml(a)}</p></details>`).join("")}</div>
  </section>
</main>
${h.newsletterPanel("pp-news", "party_hub")}
<script>(function(){var D=${data};var f=document.querySelector("[data-pp-picker]");if(!f)return;var n=f.querySelector("#pp-n"),out=document.querySelector("[data-pp-out]"),mode="app";
function lb(oz){if(oz<16)return Math.ceil(oz)+" oz";var q=Math.ceil(oz/16*4)/4,w=Math.floor(q),fr={0.25:"¼",0.5:"½",0.75:"¾"}[q-w]||"";return (w||"")+fr+" lb"}
function near(g){var best=D.counts[0];D.counts.forEach(function(c){if(Math.abs(c-g)<Math.abs(best-g))best=c});return best}
function draw(){var g=Math.max(1,Math.min(300,parseInt(n.value,10)||1)),m=D.modes[mode],b=g>=20?1.1:1,c=Math.ceil(g*m.cheese*b/8)*8,s=g<=10?2:g<=25?3:g<=50?4:5,k=near(g);
out.innerHTML='<ul class="pp-out-list"><li><strong>'+lb(g*m.meat*b)+'</strong> cured meat</li><li><strong>'+lb(c)+'</strong> cheese</li><li><strong>'+g*m.crackers[0]+'–'+g*m.crackers[1]+'</strong> crackers</li><li><strong>'+lb(g*m.fruit*b)+'</strong> fruit</li><li><strong>'+s+'</strong> spreads</li></ul><p class="pp-out-links"><a class="button primary" href="/board-builder/?g='+Math.min(g,200)+'&m='+mode+'">Build it for '+g+'</a> <a class="fx-more" href="/party-planner/charcuterie-board-for-'+k+'-people/">Full plan for '+k+' people &rarr;</a></p>'}
f.querySelectorAll("[data-pick-mode]").forEach(function(btn){btn.addEventListener("click",function(){mode=btn.dataset.pickMode;f.querySelectorAll("[data-pick-mode]").forEach(function(x){var on=x===btn;x.classList.toggle("is-on",on);x.setAttribute("aria-pressed",on)});draw()})});
n.addEventListener("input",draw);draw()})();</script>`
  });
}
