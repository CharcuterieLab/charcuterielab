// Best Buys upgrade (2 Nov 2026): an easier hub and easier guides.
//
// Hub (/blog/best-charcuterie-brands/):
//   - a one-line "how this works" with a score key
//   - a seasonal row of guides (picked by month on the visitor's clock)
//   - the finder, grouped by category (4 per group, "Show all" opens it),
//     with the #1 pick, the score and the best-value pick on every card,
//     store shortcuts, and the gift guides (they were missing)
//   - "One winner for every spot on the board": the #1 pick per slot
//   - the long markdown tables folded into one "See every guide as a table"
// Guides (best-*):
//   - "Which one should you buy?": need -> pick, in one glance, above the cards
//   - a score key in the cards' intro line
//   - breadcrumb Best buys / Category / Guide (and in the schema)
//   - "More cheese guides" chips under "Put the winners to work"

export const BEST_CATS = [
  [/cheese/i, "cheese", "Cheese"], [/meat|fish/i, "meat", "Cured meat"], [/cracker|chip|pretzel/i, "crackers", "Crackers and chips"],
  [/spread|dip|sauce|honey|mustard|glaze/i, "spreads", "Spreads and dips"], [/olive|pickle|nut/i, "extras", "Olives, pickles and nuts"], [/sweet/i, "sweets", "Sweets"], [/drink/i, "drinks", "Drinks"], [/gift/i, "gifts", "Gifts and gear"], [/store/i, "stores", "Store guides"]
];

const NAME_FIX = {
  "best-charcuterie-gift-boxes": "Gift boxes",
  "best-charcuterie-gift-baskets-amazon": "Gift baskets on Amazon",
  "best-cheese-of-the-month-clubs": "Cheese-of-the-month clubs",
  "best-cheese-knife-sets": "Cheese knife sets",
  "best-cheese-paper": "Cheese paper and storage",
  "best-charcuterie-boards": "Boards to buy",
  "amazon-charcuterie-board-sets-reviewed": "Board sets on Amazon",
  "best-crackers-for-charcuterie": "Crackers (all kinds)",
  "best-champagne-under-30": "Champagne under $30",
  "best-wine-for-charcuterie-board": "Wine under $20",
  "best-sparkling-cider": "Sparkling cider",
  "best-mixed-nuts": "Mixed nuts",
  "best-dried-fruit-for-charcuterie": "Dried fruit",
  "best-pickles-for-charcuterie": "Pickles",
  "best-olives-for-charcuterie": "Olives",
  "best-honey-for-cheese": "Honey",
  "best-mustard-for-charcuterie": "Mustard",
  "best-pretzels-for-charcuterie": "Pretzels",
  "best-butter-for-butter-board": "Butter (for a butter board)",
  "best-herb-cheese-spreads": "Herb cheese spreads",
  "best-store-bought-cheese-balls": "Cheese balls",
  "best-store-bought-christmas-cookies": "Christmas cookies",
  "best-trader-joes-cheeses": "Trader Joe's cheeses",
  "best-trader-joes-charcuterie-items": "Trader Joe's meats and extras",
  "trader-joes-holiday-charcuterie-items": "Trader Joe's holiday items",
  "costco-holiday-charcuterie": "Costco holiday items",
  "aldi-holiday-charcuterie-items": "Aldi holiday items"
};

// Shopping at one store? Label -> guide slug (first that exists wins).
const STORES = [
  ["Costco", "best-costco-charcuterie-items"], ["Trader Joe's", "best-trader-joes-cheeses"], ["Aldi", "best-aldi-charcuterie-items"],
  ["Walmart", "best-walmart-charcuterie-items"], ["Target", "best-target-charcuterie-items"], ["Whole Foods", "best-whole-foods-cheeses"],
  ["Sam's Club", "best-sams-club-charcuterie-items"], ["Kroger", "best-kroger-charcuterie-items"], ["Publix", "best-publix-charcuterie-items"],
  ["H-E-B", "best-heb-charcuterie-items"], ["Wegmans", "best-wegmans-charcuterie-items"], ["Safeway", "best-safeway-albertsons-charcuterie-items"],
  ["Sprouts", "best-sprouts-charcuterie-items"], ["Lidl", "best-lidl-charcuterie-items"]
];

// One winner for every spot on a classic board.
const BOARD_SLOTS = [
  ["Aged cheese", "best-cheddar-brands"], ["Soft cheese", "best-brie-brands"], ["Crowd-pleaser cheese", "best-gouda-brands"],
  ["Salami", "best-salami-brands"], ["Prosciutto", "best-prosciutto-brands"], ["Crackers", "best-crackers-for-charcuterie"],
  ["Something sweet", "best-fig-jam"], ["Drizzle", "best-honey-for-cheese"], ["Something briny", "best-olives-for-charcuterie"],
  ["Crunch", "best-marcona-almonds"], ["Something sharp", "best-mustard-for-charcuterie"]
];

// What people are buying right now (months 1-12).
const SEASONS = [
  { m: [11, 12], h: "Holiday buys right now", s: ["best-panettone", "best-stilton", "best-cranberry-cheese", "best-cranberry-sauce", "best-charcuterie-gift-boxes", "best-champagne-under-30", "best-store-bought-christmas-cookies", "best-hot-cocoa-mix", "best-port-wine", "costco-holiday-charcuterie", "trader-joes-holiday-charcuterie-items", "best-cheese-knife-sets"] },
  { m: [1, 2], h: "Game day and Valentine's buys", s: ["best-queso", "best-salsa", "best-guacamole", "best-tortilla-chips", "best-kettle-chips", "best-buffalo-chicken-dip", "best-meat-sticks", "best-pickle-dip", "best-dark-chocolate", "best-strawberry-jam", "best-prosecco"] },
  { m: [3, 4, 5], h: "Spring and Easter buys", s: ["best-burrata", "best-goat-cheese-brands", "best-fresh-mozzarella", "best-ricotta-brands", "best-prosecco", "best-pesto", "best-hummus", "best-smoked-salmon", "best-strawberry-jam", "best-whipped-feta"] },
  { m: [6, 7, 8], h: "Summer party buys", s: ["best-burrata", "best-fresh-mozzarella", "best-sparkling-cider", "best-prosecco", "best-salsa", "best-guacamole", "best-ranch-dip", "best-hummus", "best-tzatziki", "best-kettle-chips"] },
  { m: [9, 10], h: "Fall and game day buys", s: ["best-cheddar-brands", "best-summer-sausage", "best-pepper-jelly", "best-hot-honey", "best-tortilla-chips", "best-queso", "best-beef-jerky", "best-candied-pecans", "best-fig-jam", "best-kettle-chips"] }
];

const norm = (s = "") => s.toLowerCase().replace(/&#x27;|'/g, "").replace(/\(.*?\)/g, "").replace(/\b(brands?|for a .*|cheese board|charcuterie board)\b/g, "").replace(/[^a-z ]/g, " ").replace(/s\b/g, "").replace(/\s+/g, " ").trim();
const scoreOf = (r = "") => { const m = String(r).match(/^(\d(?:\.\d)?)\/5/); return m ? Number(m[1]) : null; };

// Read the hub's tables into cards (one per guide) plus the value picks.
export function parseHub(body, postsBySlug) {
  const cards = [];
  const values = [];
  let cat = null;
  let inValue = false;
  for (const line of String(body || "").split("\n")) {
    const h = line.match(/^##\s+(.+)/);
    if (h) {
      inValue = /value/i.test(h[1]);
      const c = BEST_CATS.find(([re]) => re.test(h[1]));
      cat = c && !/value|rank|work/i.test(h[1]) ? c : null;
      continue;
    }
    if (inValue) {
      const v = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
      if (v && !/^(Ingredient|-+)$/.test(v[1])) values.push({ ing: v[1], pick: v[2], rating: v[3] });
      continue;
    }
    const row = cat && line.match(/^\|\s*\[([^\]]+)\]\(\/blog\/([^/)]+)\/\)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (!row) continue;
    const post = postsBySlug.get(row[2]);
    if (!post) continue;
    const name = NAME_FIX[row[2]] || (cat[1] === "stores" ? row[1].replace(/^(The )?Best /, "").replace(/^What to Buy at (.+?) for a .*$/i, "$1").replace(/ Charcuterie Board Items$/i, "") : null) || row[1].replace(/^(The )?Best /, "").replace(/ (for a|at the|by|for|to) .*$/i, "").replace(/, (From|Compared).*$/i, "").replace(/^Store-Bought /, "").replace(/^Jarred /, "").replace(/ Brands$/, "").replace(/^What to Buy at /i, "").replace(/^(\w)/, (x) => x.toUpperCase());
    cards.push({ slug: row[2], cat: cat[1], catLabel: cat[2], name, title: row[1], pick: row[3].replace(/\s*\(best cheese\)/, ""), rating: row[4], score: scoreOf(row[4]), image: post.image });
  }
  // Best value pick onto its guide's card (when it differs from the #1).
  for (const v of values) {
    const key = norm(v.ing);
    const c = cards.find((x) => x.cat !== "stores" && norm(x.name) === key) || cards.find((x) => x.cat !== "stores" && norm(x.name).startsWith(key + " "));
    if (c && !c.value && norm(v.pick) !== norm(c.pick)) c.value = v.pick;
  }
  return { cards, values };
}

function rateHtml(c, h) {
  if (c.score != null) return `<span class="best-rate bb-t${c.score >= 4.5 ? 1 : c.score >= 4 ? 2 : 3}">Score ${c.score.toFixed(1)}</span>`;
  return `<span class="best-rate bb-t0">${h.escapeHtml(c.rating.replace(/\s*\(unscored\)/i, ""))}</span>`;
}

function cardLi(c, h) {
  const q = `${c.name} ${c.title} ${c.pick} ${c.value || ""} ${c.catLabel}`.toLowerCase();
  return `<li data-c="${c.cat}" data-q="${h.escapeHtml(q)}"><a href="/blog/${c.slug}/"><img src="${h.escapeHtml(h.thumb(c.image, "s"))}" alt="" width="120" height="80" loading="lazy" decoding="async"><span class="best-name">${h.escapeHtml(c.name)}</span><span class="best-pick"><b>#1</b> ${h.escapeHtml(c.pick)}</span>${rateHtml(c, h)}${c.value ? `<span class="best-val">Best value: ${h.escapeHtml(c.value)}</span>` : ""}</a></li>`;
}

const FINDER_JS = `(function(){var s=document.getElementById("finder");if(!s)return;var q=s.querySelector("#best-q"),bs=s.querySelectorAll(".best-chips button"),gs=s.querySelectorAll(".bb-group"),none=s.querySelector(".best-none"),cnt=s.querySelector(".bb-count"),c="";function run(){var v=q.value.trim().toLowerCase(),n=0;gs.forEach(function(g){var gn=0,show=!c||g.dataset.c===c;g.querySelectorAll("li").forEach(function(x){var ok=show&&(!v||x.dataset.q.indexOf(v)>=0);x.hidden=!ok;if(ok)gn++});g.hidden=gn===0;g.classList.toggle("is-open",!!(c||v));n+=gn});none.hidden=n>0;if(cnt)cnt.textContent=(c||v)?n+(n===1?" guide":" guides"):""}function set(k){c=k;bs.forEach(function(b){b.setAttribute("aria-pressed",b.dataset.c===k?"true":"false")});run()}bs.forEach(function(b){b.addEventListener("click",function(){set(b.dataset.c)})});s.querySelectorAll(".bb-more").forEach(function(b){b.addEventListener("click",function(){set(b.dataset.c);var t=s.querySelector(".best-chips");if(t&&t.getBoundingClientRect().top<0)s.scrollIntoView()})});q.addEventListener("input",run);try{var p=new URLSearchParams(location.search).get("c");if(p)set(p)}catch(e){}})();`;

export function finderHtml(cards, h) {
  const cats = BEST_CATS.filter(([, k]) => cards.some((c) => c.cat === k));
  const have = new Set(cards.map((c) => c.slug));
  const stores = STORES.filter(([, s]) => have.has(s));
  return `<section class="best-finder" id="finder" aria-label="Find a buying guide">
  <h2 class="best-finder-h">What are you buying?</h2>
  <p class="bb-finder-sub">Tap a category or type what's on your list. Every guide names our #1, a budget pick and where to buy them.</p>
  <div class="best-finder-tools">
    <label class="sr-only" for="best-q">Search the buying guides</label>
    <input id="best-q" type="search" placeholder="Try brie, salami, crackers, Costco..." autocomplete="off">
    <div class="best-chips" role="group" aria-label="Filter by category"><button type="button" data-c="" aria-pressed="true">All ${cards.length}</button>${cats.map(([, k, label]) => `<button type="button" data-c="${k}" aria-pressed="false">${label} <span>${cards.filter((c) => c.cat === k).length}</span></button>`).join("")}</div>
  </div>
  ${stores.length ? `<p class="bb-stores"><span>Shopping at one store?</span> ${stores.map(([n, s]) => `<a href="/blog/${s}/">${h.escapeHtml(n)}</a>`).join("")}</p>` : ""}
  <p class="bb-count" aria-live="polite"></p>
${cats.map(([, k, label]) => {
    const list = cards.filter((c) => c.cat === k);
    return `  <div class="bb-group" data-c="${k}">
    <h3 class="bb-group-h">${label} <span>${list.length} guides</span></h3>
    <ul class="best-grid">
${list.map((c) => `      ${cardLi(c, h)}`).join("\n")}
    </ul>
    ${list.length > 4 ? `<button type="button" class="bb-more${list.length <= 6 ? " bb-more-sm" : ""}" data-c="${k}">Show all ${list.length} ${label.toLowerCase().replace(/ guides$/, "")} guides</button>` : ""}
  </div>`;
  }).join("\n")}
  <p class="best-none" hidden>No guide for that yet. Try the <a href="/ingredients/">ingredient library</a> or <a href="/search/">search the whole site</a>.</p>
  <script>${FINDER_JS}</script>
</section>`;
}

function howHtml() {
  return `<div class="bb-how">
  <ol class="bb-how-steps"><li><strong>Pick</strong> what you're buying</li><li><strong>See</strong> our #1 and a budget pick</li><li><strong>Buy</strong> it at your store</li></ol>
  <p class="bb-key"><span class="bb-key-l">Our scores, out of 5:</span> <span class="best-rate bb-t1">4.5+</span> standout <span class="best-rate bb-t2">4.0 to 4.4</span> great <span class="best-rate bb-t3">under 4</span> good, with a catch <span class="best-rate bb-t0">Buyer's guide</span> no published taste test yet, so we picked on labels, price and reputation. <a href="#how-we-rank">How we rank</a></p>
</div>`;
}

function seasonHtml(bySlug, h) {
  const now = new Date().getUTCMonth() + 1;
  const rows = SEASONS.map((s) => ({ ...s, list: s.s.map((x) => bySlug.get(x)).filter(Boolean) })).filter((s) => s.list.length >= 4);
  if (!rows.length) return "";
  return `<div class="bb-season-wrap">
${rows.map((s) => `  <div class="bb-season" data-m="${s.m.join(",")}"${s.m.includes(now) ? "" : " hidden"}>
    <p class="bb-season-h">${h.escapeHtml(s.h)}</p>
    <ul class="bb-season-row">${s.list.map((c) => `<li><a href="/blog/${c.slug}/"><img src="${h.escapeHtml(h.thumb(c.image, "s"))}" alt="" width="120" height="80" loading="lazy" decoding="async"><strong>${h.escapeHtml(c.name)}</strong><span>#1 ${h.escapeHtml(c.pick)}</span></a></li>`).join("")}</ul>
  </div>`).join("\n")}
  <script>(function(){var m=new Date().getMonth()+1;document.querySelectorAll(".bb-season").forEach(function(r){r.hidden=r.dataset.m.split(",").indexOf(String(m))<0})})();</script>
</div>`;
}

function boardHtml(bySlug, h) {
  const rows = BOARD_SLOTS.map(([slot, s]) => [slot, bySlug.get(s)]).filter(([, c]) => c);
  if (rows.length < 6) return "";
  return `<div class="bb-board" id="winning-board">
  <h2>One winner for every spot on the board</h2>
  <p class="bb-board-sub">Building a classic board? Here is our #1 pick for each spot. Tap any row for the budget pick and the runners-up.</p>
  <ol class="bb-board-list">${rows.map(([slot, c]) => `<li><a href="/blog/${c.slug}/"><span class="bb-slot">${h.escapeHtml(slot)}</span><strong>${h.escapeHtml(c.pick)}</strong>${c.score != null ? `<span class="best-rate bb-t${c.score >= 4.5 ? 1 : c.score >= 4 ? 2 : 3}">${c.score.toFixed(1)}</span>` : ""}</a></li>`).join("")}</ol>
  <p class="bb-board-cta"><a class="bb-btn" href="#cheat">Get every #1 pick as a free printable</a> <a class="bb-link" href="/party-planner/">How much of each to buy &rarr;</a></p>
</div>`;
}

// Rebuild the hub body: quick answer, how it works, season row, finder,
// winning board, then the tables folded away, then how we rank.
export function hubHtml(html, cards, h) {
  const bySlug = new Map(cards.map((c) => [c.slug, c]));
  const bqEnd = html.indexOf("</blockquote>");
  const head = bqEnd > 0 ? html.slice(0, bqEnd + 13) : "";
  let rest = bqEnd > 0 ? html.slice(bqEnd + 13) : html;
  // Drop the one-line intro ("Each guide gives you...") - the how-it-works says it.
  rest = rest.replace(/^\s*<p>Each guide gives you[\s\S]*?<\/p>/, "");
  const firstH2 = rest.search(/<h2\b/i);
  const rankAt = rest.search(/<h2\b[^>]*>\s*How we rank/i);
  let tables = "";
  let tail = rest;
  let lead = "";
  if (firstH2 >= 0 && rankAt > firstH2) {
    lead = rest.slice(0, firstH2);
    tables = rest.slice(firstH2, rankAt).replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, "<h3$1>$2</h3>");
    tail = rest.slice(rankAt).replace(/<h2\b([^>]*)>\s*How we rank/i, (m, a) => `<h2 id="how-we-rank"${a.replace(/\sid="[^"]*"/, "")}>How we rank`);
  }
  return `${head}
${howHtml()}
${seasonHtml(bySlug, h)}
${lead}${finderHtml(cards, h)}
${boardHtml(bySlug, h)}
${tables ? `<details class="bb-tables"><summary>See every guide in one table, plus the best-value pick for each ingredient</summary>
${tables}
</details>` : ""}
${tail}`;
}

// ---------- Guides ----------

const strip = (s = "") => s.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export function needBox(html, h) {
  const cardsAt = html.indexOf('<div class="sk-cards">');
  if (cardsAt < 0) return "";
  const rows = [];
  const re = /<article class="sk-card" id="(pick-\d+)">([\s\S]*?)<\/article>/g;
  let m;
  while ((m = re.exec(html))) {
    const body = m[2];
    const name = strip((body.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1] || "");
    const pill = strip((body.match(/<p class="sk-pill">([\s\S]*?)<\/p>/) || [])[1] || "");
    const forDd = strip((body.match(/<dt>Best for<\/dt><dd>([\s\S]*?)<\/dd>/) || [])[1] || "");
    const price = ((strip((body.match(/<dt>Price<\/dt><dd>([\s\S]*?)<\/dd>/) || [])[1] || "")).match(/^\${1,4}(?=\s|$)/) || [])[0] || "";
    const score = (body.match(/<span class="sk-label">Our score<\/span><b>([\d.]+)<\/b>/) || [])[1] || "";
    const label = forDd || pill;
    if (name && label) rows.push({ id: m[1], name, label, price, score });
  }
  if (rows.length < 3) return "";
  const shown = rows.slice(0, 8);
  return `<div class="bb-need">
  <p class="bb-need-h">Which one should you buy?</p>
  <ul>${shown.map((r) => `<li><a href="#${r.id}"><span class="bb-need-k">${h.escapeHtml(r.label.replace(/^(\w)/, (x) => x.toUpperCase()))}</span><strong>${h.escapeHtml(r.name)}</strong><span class="bb-need-m">${[r.score ? `Score ${r.score}` : "", r.price].filter(Boolean).join(" · ")}</span></a></li>`).join("")}</ul>
  ${rows.length > shown.length ? `<p class="bb-need-more"><a href="#picks">See all ${rows.length}</a></p>` : ""}
</div>`;
}

export function guideHtml(html, h) {
  if (!html.includes('class="sk-cards"')) return html;
  let out = html.replace(/(<p class="sk-lede">Scored out of 5[^<]*?\.)\s*(Tap "Why we ranked it here" for the details\.)/, "$1 A 4.5 or higher is a standout, 4.0 to 4.4 is great, and under 4 is good with a catch. $2");
  const box = needBox(out, h);
  if (!box) return out;
  const at = out.search(/<h2\b/i);
  return at > 0 ? out.slice(0, at) + box + out.slice(at) : out;
}

// "More cheese guides" under "Put the winners to work".
export function siblingsHtml(slug, cards, h) {
  const me = cards.find((c) => c.slug === slug);
  if (!me) return "";
  const list = cards.filter((c) => c.cat === me.cat);
  const i = list.indexOf(me);
  const sibs = [...list.slice(i + 1), ...list.slice(0, i)].slice(0, 8);
  if (!sibs.length) return "";
  return `<div class="bb-sib"><p class="bb-sib-h">More ${h.escapeHtml(me.catLabel.toLowerCase().replace(/ guides$/, ""))} guides</p><p class="bb-sib-chips">${sibs.map((c) => `<a href="/blog/${c.slug}/">${h.escapeHtml(c.name)}</a>`).join("")}<a class="bb-sib-all" href="/blog/best-charcuterie-brands/?c=${me.cat}#finder">All ${list.length} &rarr;</a></p></div>`;
}

export function crumbFor(slug, cards) {
  const me = cards.find((c) => c.slug === slug);
  return me ? { cat: me.cat, label: me.catLabel, name: me.name } : null;
}
