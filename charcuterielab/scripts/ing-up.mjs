// 12 Nov 2026: ingredients hub and ingredient pages, applied after the build
// (hub-calm). Reads the ingredient front matter from ../content/ingredients.
//
// Hub: "Start here" (the 12 most-used), "Build a board" by role, a holiday row
// (Nov–Dec only), and a Cards / List toggle for the A–Z grid. The extra rows
// hide as soon as someone searches or filters.
// Pages: "Pairs best with" in the glance box mixes kinds (a sweet, a fruit, a
// crunch...) instead of the first three in the list; a "Swap in" row (same job
// on the board); "The short version" loses its heading and "What it is" folds;
// the big "Pairs well with" tile grid becomes a line of links under the
// pairing table; drinks, diet notes, boards, read-more and the two tool cards
// become one "Keep going" box.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s = "") => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim();

let DATA = null;
function data() {
  if (DATA) return DATA;
  const here = dirname(fileURLToPath(import.meta.url));
  const dirs = [join(here, "..", "..", "content", "ingredients"), join(here, "..", "content", "ingredients")];
  const dir = dirs.find((d) => existsSync(d));
  const map = new Map();
  if (dir) for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const t = readFileSync(join(dir, f), "utf8").replace(/\r\n/g, "\n");
    const fm = (t.match(/^---\n([\s\S]*?)\n---/) || [])[1] || "";
    const get = (k) => ((fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, "m")) || [])[1] || "").trim();
    const list = (k) => { const m = fm.match(new RegExp(`^${k}:\\s*\\[(.*)\\]`, "m")); return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : []; };
    const slug = get("slug") || f.replace(/\.md$/, "");
    map.set(slug, { slug, title: get("title"), category: get("category"), role: get("board_role"), group: get("role_group"), price: get("price_tier"), pairs: list("pairs_with"), tags: list("tags") });
  }
  // how often each ingredient is named as a partner: a rough "how common" score
  const pop = new Map();
  for (const v of map.values()) for (const p of v.pairs) pop.set(p, (pop.get(p) || 0) + 1);
  for (const v of map.values()) v.pop = pop.get(v.slug) || 0;
  DATA = map;
  return map;
}

// ---------- ingredient pages ----------

const KIND = (c = "") => /cheese/i.test(c) ? "cheese" : /meat|seafood/i.test(c) ? "meat" : /cracker|bread/i.test(c) ? "crunch" : /fruit/i.test(c) ? "fruit" : /nut|seed/i.test(c) ? "nut" : /spread|jam|honey/i.test(c) ? "sweet" : /pickle|olive|briny/i.test(c) ? "briny" : "other";
const ORDER = { cheese: ["sweet", "fruit", "meat", "nut", "briny", "crunch"], meat: ["cheese", "fruit", "briny", "sweet", "crunch", "nut"], crunch: ["cheese", "meat", "sweet", "fruit"], fruit: ["cheese", "meat", "nut", "sweet"], nut: ["cheese", "fruit", "sweet", "meat"], sweet: ["cheese", "fruit", "nut", "crunch"], briny: ["meat", "cheese", "crunch", "nut"], other: ["cheese", "meat", "fruit", "sweet", "nut", "crunch"] };

// The page's own "What it pairs with — and why" table is the curated list:
// match its first column to ingredient pages, then keep one per kind.
const sing = (w) => w.replace(/(ies)$/, "y").replace(/(oes|ches|shes)$/, (x) => x.slice(0, -2)).replace(/s$/, "");
function tablePairs(html, me, m) {
  const i = html.indexOf('id="ing-pairs"');
  if (i < 0) return [];
  const tbl = html.slice(i, html.indexOf("</table>", i));
  const cells = [...tbl.matchAll(/<td data-label="[^"]*"><span class="t-v"><strong>([\s\S]*?)<\/strong>/g)].map((x) => strip(x[1]).toLowerCase());
  const titles = [...m.values()].filter((x) => x.slug !== me.slug).map((x) => ({ x, words: x.title.toLowerCase().replace(/[^a-z\u00e0-\u00ff ]/g, " ").split(/\s+/).filter(Boolean).map(sing) }));
  const out = [];
  for (const cell of cells) {
    for (const piece of cell.split(/\s+or\s+|\s+and\s+|,\s*/)) {
      const words = new Set(piece.replace(/[^a-z\u00e0-\u00ff ]/g, " ").split(/\s+/).filter(Boolean).map(sing));
      const hit = titles.filter((t) => t.words.length && t.words.every((w) => words.has(w))).sort((a, b) => b.words.length - a.words.length || b.x.pop - a.x.pop)[0];
      if (hit && !out.includes(hit.x)) out.push(hit.x);
    }
  }
  return out;
}

function bestPairs(me, m, html = "") {
  const mine = KIND(me.category);
  const fromTable = tablePairs(html, me, m);
  if (fromTable.length) {
    const out = [];
    for (const c of fromTable) { if (out.length >= 3) break; const k = KIND(c.category); if (!out.some((o) => KIND(o.category) === k)) out.push(c); }
    for (const c of fromTable) { if (out.length >= 3) break; if (!out.includes(c)) out.push(c); }
    if (out.length >= 2) return out;
  }
  return bestPairsFromData(me, m);
}

function bestPairsFromData(me, m) {
  const mine = KIND(me.category);
  const cands = me.pairs.map((s) => m.get(s)).filter(Boolean);
  const out = [];
  for (const k of ORDER[mine] || ORDER.other) {
    if (out.length >= 3) break;
    // within a kind, the most widely used partner (fig jam before orange marmalade)
    const c = cands.filter((x) => KIND(x.category) === k && !out.includes(x)).sort((a, b) => b.pop - a.pop)[0];
    if (c) out.push(c);
  }
  for (const c of cands) { if (out.length >= 3) break; if (!out.includes(c) && KIND(c.category) !== mine) out.push(c); }
  return out.slice(0, 3);
}

function swaps(me, m) {
  // Same category; ranked by the same board job, shared tags (soft, french,
  // smoked…), a similar price tier, then how common it is.
  const tags = new Set(me.tags.filter((t) => t !== me.category.toLowerCase() && t !== "cheese" && t !== "beginner"));
  const tierGap = (x) => Math.abs((x.price || "$$").length - (me.price || "$$").length);
  const score = (x) => (x.role && x.role === me.role ? 6 : 0) + (x.group && x.group === me.group ? 2 : 0) + 2 * x.tags.filter((t) => tags.has(t)).length - tierGap(x) + Math.min(x.pop, 10) * 0.05;
  return [...m.values()]
    .filter((x) => x.slug !== me.slug && x.category === me.category && !/^vegan-|-crisps$/.test(x.slug))
    .map((x) => [score(x), x]).filter(([sc]) => sc >= 3)
    .sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, x]) => x);
}

const link = (x) => `<a href="/ingredients/${x.slug}/">${esc(x.title)}</a>`;

export function upIngredient(html, path) {
  const mm = /^\/ingredients\/([a-z0-9-]+)\/$/.exec(path);
  if (!mm || !html.includes('class="ing-glance"')) return { html, n: 0 };
  const m = data();
  const me = m.get(mm[1]);
  if (!me) return { html, n: 0 };
  let n = 0;
  // 7. pairs best with, mixed kinds
  const bp = bestPairs(me, m, html);
  if (bp.length >= 2) html = html.replace(/(<dt>Pairs best with<\/dt><dd>)[\s\S]*?(<\/dd>)/, (a, x, y) => { n++; return `${x}${bp.map(link).join(", ")}${y}`; });
  // 8. swap in
  const sw = swaps(me, m);
  if (sw.length >= 2) html = html.replace(/(<div><dt>The one to buy<\/dt>|<div><dt>Price<\/dt>)/, (a) => { n++; return `<div><dt>Out of it? Swap in</dt><dd>${sw.map(link).join(", ")} <span class="ing-glance-note">same job on the board</span></dd></div>${a}`; });
  // 6. the short version keeps its words, loses its heading; what it is folds
  html = html.replace(/<h2>The short version<\/h2>\s*/, () => { n++; return ""; });
  html = html.replace(/<h2>What it is<\/h2>([\s\S]*?)(?=<h2\b)/, (a, body) => { n++; return `<details class="ing-fold"><summary><h2>What it is</h2><span class="ing-fold-line">Where it comes from, taste, texture and why it behaves the way it does</span></summary>${body}</details>\n`; });
  // 6. "Pairs well with" tiles become a line under the pairing table
  const pw = html.match(/<section class="ing-related">\s*<h2>Pairs well with<\/h2>[\s\S]*?<\/section>/);
  if (pw) {
    const items = [...pw[0].matchAll(/<a href="(\/ingredients\/[^"]+)">[\s\S]*?<strong>([\s\S]*?)<\/strong>/g)].map((x) => `<a href="${x[1]}">${x[2]}</a>`);
    html = html.replace(pw[0], "");
    if (items.length) {
      const line = `<p class="ing-pairs-more"><strong>More that pair well:</strong> ${items.join(", ")}</p>`;
      const at = html.search(/<h2>How to prep it for the board<\/h2>/);
      if (at > 0) html = html.slice(0, at) + line + "\n" + html.slice(at);
      else html = html.replace(/(<h2 id="ing-buy">)/, `${line}\n$1`);
    }
    n++;
  }
  // 11. one "Keep going" box
  const pick = (re) => { const x = html.match(re); return x ? x[0] : ""; };
  const drinks = pick(/<section class="ing-related pr-ing">[\s\S]*?<\/section>/);
  const diet = pick(/<section class="ing-related dt-ing"[\s\S]*?<\/section>/);
  const boards = pick(/<section class="ing-boards">[\s\S]*?<\/section>/);
  const read = pick(/<section class="ing-read">[\s\S]*?<\/section>/);
  const next = pick(/<section class="lab-next"[\s\S]*?<\/section>/);
  if (drinks || diet || boards || read) {
    const links = (blk, re) => [...blk.matchAll(re)].map((x) => ({ href: x[1], t: strip(x[2]) })).filter((x) => x.t);
    const dl = links(drinks, /<a href="([^"]+)"><span class="pr-drink-swatch"[^>]*><\/span><strong>([\s\S]*?)<\/strong>/g);
    const dMore = (drinks.match(/<a class="pr-more" href="([^"]+)">/) || [])[1];
    const bl = links(boards, /<a href="(\/boards\/[^"]+)">([\s\S]*?)<\/a>/g);
    const posts = [...html.matchAll(/<p class="ing-boardpost">[\s\S]*?<\/p>/g)].map((x) => x[0]);
    const rl = links(read, /<a class="ing-read-card" href="([^"]+)">[\s\S]*?<span>([\s\S]*?)<\/span>/g).concat(posts.flatMap((p) => { const a = p.match(/<a href="([^"]+)">([\s\S]*?)<\/a>/); const lead = strip(p.replace(/<a[\s\S]*$/, "")); return a ? [{ href: a[1], t: (/board ideas/i.test(a[2]) ? `Board ideas with ${me.title.toLowerCase()}` : /types of cheese/i.test(a[2]) ? "All 100 types of cheese, with a chart" : strip(a[2]).replace(/\s*→$/, "")) }] : []; }));
    const dItems = [...diet.matchAll(/<li><a href="([^"]+)">([^<]+)<\/a>\s*<span class="dt-badge ([^"]+)">([^<]+)<\/span>/g)].map((x) => `<li><a href="${x[1]}">${x[2]}</a> <span class="dt-badge ${x[3]}">${x[4]}</span></li>`);
    const uniq = (xs) => xs.filter((x, i) => xs.findIndex((y) => y.href === x.href) === i);
    const col = (h, xs, more) => xs.length ? `<div><h3>${h}</h3><ul>${uniq(xs).slice(0, 6).map((x) => `<li><a href="${x.href}">${esc(x.t)}</a></li>`).join("")}${more || ""}</ul></div>` : "";
    const box = `<section class="ing-keep" aria-labelledby="ing-keep-h">
      <h2 id="ing-keep-h">Keep going</h2>
      <div class="ing-keep-grid">
        ${col("Drinks that match", dl, dMore ? `<li><a href="${dMore}">Every pairing, with the reasons &rarr;</a></li>` : "")}
        ${col(`Boards with ${esc(me.title.toLowerCase())}`, bl)}
        ${col("Read more", rl.concat([{ href: "/board-builder/", t: "Build your own board (free tool)" }]))}
        ${dItems.length ? `<div class="ing-keep-diet"><h3>Diet notes</h3><ul>${dItems.join("")}</ul></div>` : ""}
      </div>
    </section>`;
    let first = true;
    for (const p of posts) html = html.replace(p, "");
    for (const part of [drinks, diet, boards, read, next]) {
      if (!part) continue;
      html = html.replace(part, first ? box : "");
      first = false;
    }
    n++;
  }
  return { html, n };
}

// ---------- hub ----------

const START = ["brie", "aged-cheddar", "manchego", "prosciutto-di-parma", "genoa-salami", "soppressata", "fig-jam", "honey", "grapes", "marcona-almonds", "castelvetrano-olives", "water-crackers"];
const ROLES = [
  ["1 soft cheese", "/ingredients/cheese/", ["brie", "camembert", "burrata"]],
  ["1 firm or aged cheese", "/ingredients/cheese/", ["aged-cheddar", "manchego", "parmigiano-reggiano"]],
  ["1 blue (optional)", "/ingredients/cheese/", ["stilton", "gorgonzola", "humboldt-fog"]],
  ["2 cured meats", "/ingredients/cured-meat-and-seafood/", ["prosciutto-di-parma", "genoa-salami", "chorizo"]],
  ["Something sweet", "/ingredients/spreads-jams-and-honey/", ["fig-jam", "honey", "honeycomb"]],
  ["Fresh fruit", "/ingredients/fruit/", ["grapes", "pears", "apples"]],
  ["Something briny", "/ingredients/pickles-olives-and-briny/", ["castelvetrano-olives", "cornichons", "kalamata-olives"]],
  ["Crunch", "/ingredients/nuts-and-seeds/", ["marcona-almonds", "candied-pecans", "pistachios"]],
  ["Crackers and bread", "/ingredients/crackers-and-breads/", ["water-crackers", "baguette", "olive-oil-crackers"]]
];
const HOLIDAY = ["brie", "stilton", "cranberry-sauce", "pomegranate", "smoked-salmon", "candied-pecans", "dark-chocolate", "rosemary-sprigs", "champagne-grapes", "wensleydale-cranberry"];

const HUB_JS = `<script data-ing-up>(function(){try{var hol=document.querySelector("[data-ing-holiday]");if(hol){var d=new Date(),mo=d.getMonth();if(mo===10||mo===11)hol.hidden=false}}catch(e){}var rows=document.querySelectorAll("[data-ing-rows]"),f=document.querySelector(".ing-finder");function hide(){rows.forEach(function(r){r.hidden=true})}if(f){f.addEventListener("input",function(e){if(e.target.closest(".ing-controls,.ing-searchbar"))hide()});f.addEventListener("click",function(e){if(e.target.closest(".ing-chip"))hide()})}if(location.hash||location.search)hide();var g=document.getElementById("ing-grid"),t=document.querySelectorAll("[data-ing-view]");function view(v){if(!g)return;g.classList.toggle("ing-list-view",v==="list");t.forEach(function(b){b.setAttribute("aria-pressed",b.dataset.ingView===v?"true":"false")});try{localStorage.setItem("ing-view",v)}catch(e){}}t.forEach(function(b){b.addEventListener("click",function(){view(b.dataset.ingView)})});try{var s=localStorage.getItem("ing-view");if(s)view(s)}catch(e){}var jb=document.querySelectorAll("[data-ing-jump]");if(jb.length&&g){jb.forEach(function(b){b.addEventListener("click",function(){g.classList.add("show-all");var w=document.querySelector(".ing-more-wrap");if(w)w.hidden=true;hide();var L=b.getAttribute("data-ing-jump"),c=null,i;for(i=0;i<g.children.length;i++){var el=g.children[i];if(!el.hasAttribute("hidden")&&(el.getAttribute("data-name")||"").charAt(0)===L){c=el;break}}if(c){c.scrollIntoView({block:"start"});requestAnimationFrame(function(){c.scrollIntoView({block:"start"});setTimeout(function(){c.scrollIntoView({block:"start",behavior:"smooth"})},160)})}})})}var sb=document.querySelector(".ing-searchbar");if(sb&&"IntersectionObserver" in window){var sent=document.createElement("div");sent.setAttribute("aria-hidden","true");sent.style.cssText="height:1px;margin:0";sb.parentNode.insertBefore(sent,sb);new IntersectionObserver(function(e){sb.classList.toggle("is-stuck",!e[0].isIntersecting)},{rootMargin:"-57px 0px 0px 0px"}).observe(sent)}})();</script>`;

// Pull a balanced <div>...</div> out of the page, starting at `open`.
// Returns [htmlWithoutIt, theBlock]; the block is "" when not found.
function cutDiv(html, open) {
  const start = html.indexOf(open);
  if (start < 0) return [html, ""];
  let i = start, depth = 0;
  const re = /<\/?div\b/gi;
  re.lastIndex = start;
  let m;
  while ((m = re.exec(html))) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) { i = m.index + html.slice(m.index).indexOf(">") + 1; break; }
  }
  if (depth !== 0) return [html, ""];
  return [html.slice(0, start) + html.slice(i), html.slice(start, i)];
}

function cutTag(html, open, close) {
  const a = html.indexOf(open);
  if (a < 0) return [html, ""];
  const b = html.indexOf(close, a);
  if (b < 0) return [html, ""];
  const end = b + close.length;
  return [html.slice(0, a) + html.slice(end), html.slice(a, end)];
}

// The eight category pages run the same finder as the hub, so they had the same
// problem: the email form sat between the H1 and the search box for 87 cheeses.
// Here there is no "start here" block to tuck it behind, so it goes below the
// filters, just above the A-Z grid (14 Nov 2026).
export function upIngCategory(html) {
  if (!html.includes('id="ing-grid"') || !html.includes('<div class="qs-wrap"')) return { html, n: 0 };
  let email = "", aff = "";
  [html, email] = cutDiv(html, '<div class="qs-wrap"');
  [html, aff] = cutTag(html, '<p class="aff-note"', "</p>");
  if (!email && !aff) return { html, n: 0 };

  const letters = [...new Set((html.match(/data-name="([a-z0-9])/g) || [])
    .map((x) => x.slice(11).toUpperCase()))].sort();
  const jump = letters.length > 6
    ? `<ul class="ing-az-jump">${letters
        .map((L) => `<li><button type="button" data-ing-jump="${L.toLowerCase()}">${L}</button></li>`)
        .join("")}</ul>`
    : "";

  // A function replacer, not a string: the subscribe block contains the price
  // "$14", and in a replacement string "$1" is a backreference, which spliced
  // the grid's opening tag into the middle of a link (14 Nov 2026).
  html = html.replace(/<ul class="ing-grid" id="ing-grid">/,
    (a) => `<div class="ing-ask">${email}${aff}</div>\n${jump}\n${a}`);
  html = html.replace(/<\/main>/, `${HUB_JS}\n</main>`);
  return { html, n: 1 };
}

export function upIngHub(html) {
  const m = data();
  if (!html.includes('id="ing-grid"')) return { html, n: 0 };
  const card = (s) => { const x = m.get(s); return x ? `<li><a href="/ingredients/${x.slug}/"><img src="${esc(thumbFor(html, x.slug))}" alt="" width="64" height="43" loading="lazy" decoding="async"><span><strong>${esc(x.title)}</strong><span>${esc(x.role)}</span></span></a></li>` : ""; };
  const chip = (s) => { const x = m.get(s); return x ? link(x) : ""; };
  // Order on the page used to be: h1, email form, affiliate note, intro, "New:"
  // line, then search - so the search box for 375 ingredients sat a full screen
  // below the fold. Search now comes straight after the intro; the email form
  // moves below the 12 most-used tiles and the "New:" line down to the A-Z
  // (14 Nov 2026).
  let email = "", aff = "", note = "";
  [html, email] = cutDiv(html, '<div class="qs-wrap"');
  [html, aff] = cutTag(html, '<p class="aff-note"', "</p>");
  [html, note] = cutTag(html, '<p class="ing-intro ing-note"', "</p>");
  const emailBlock = email || aff ? `    <div class="ing-ask">${email}${aff}</div>\n` : "";

  const letters = [...new Set((html.match(/data-name="([a-z0-9])/g) || [])
    .map((x) => x.slice(11).toUpperCase()))].sort();
  const jump = letters.length > 6
    ? `<ul class="ing-az-jump">${letters
        .map((L) => `<li><button type="button" data-ing-jump="${L.toLowerCase()}">${L}</button></li>`)
        .join("")}</ul>`
    : "";

  const rows = `<div class="ing-rows" data-ing-rows>
    <section class="ing-start" aria-labelledby="ing-start-h">
      <h2 id="ing-start-h">Start here: the 12 most-used</h2>
      <ul class="ing-start-grid">${START.map(card).join("")}</ul>
    </section>
${emailBlock}    <section class="ing-role" aria-labelledby="ing-role-h">
      <h2 id="ing-role-h">Build a board: what you need</h2>
      <p class="ing-role-sub">A classic board for 6 to 10 people, one pick per line. Tap a line for every option in that group.</p>
      <ul class="ing-role-list">${ROLES.map(([label, href, picks]) => `<li><a class="ing-role-k" href="${href}">${esc(label)}</a><span class="ing-role-v">${picks.map(chip).filter(Boolean).join(" · ")}</span></li>`).join("")}</ul>
      <p class="ing-role-more"><a href="/board-builder/">Build it with the free Board Builder &rarr;</a> <a href="/party-planner/">How much of each to buy &rarr;</a></p>
    </section>
    <section class="ing-holiday" data-ing-holiday hidden aria-labelledby="ing-hol-h">
      <h2 id="ing-hol-h">On holiday boards right now</h2>
      <p class="ing-hol-chips">${HOLIDAY.map(chip).filter(Boolean).join("")}</p>
    </section>
  </div>
  ${note}
  <div class="ing-az-head"><h2>Every ingredient, A to Z</h2><div class="ing-view" role="group" aria-label="View"><button type="button" data-ing-view="cards" aria-pressed="true">Cards</button><button type="button" data-ing-view="list" aria-pressed="false">List</button></div></div>
  ${jump}`;
  let n = 0;
  html = html.replace(/(<ul class="ing-grid" id="ing-grid">)/, (a) => { n++; return rows + "\n" + a; });
  if (n) html = html.replace(/<\/main>/, `${HUB_JS}\n</main>`);
  return { html, n };
}

function thumbFor(html, slug) {
  const m = html.match(new RegExp(`<a href="/ingredients/${slug}/">\\s*<span class="ing-thumb"><img src="([^"]+)"`));
  return m ? m[1] : `/images/ingredients/${slug}.jpg`;
}
