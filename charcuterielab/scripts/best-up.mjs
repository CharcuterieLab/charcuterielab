// 10 Nov 2026: Best Buys guides, applied after the build (hub-calm).
// 1. "Best for…" row under "Our top picks": the pick for each situation,
//    read off the guide's own cards (sub-scores, $ price, Where): best value,
//    splurge, easiest to find, best on the board, and the top pick at
//    Trader Joe's / Costco / Aldi / Walmart when the cards say they carry it.
// 2. The end of each guide: "What to pour and what to build", "Keep building
//    the board" and the two tool cards become one compact "Keep going" block
//    of plain links ("Put the winners to work" and the email box stay).

const strip = (s = "") => s.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const STORES = [["Trader Joe", "At Trader Joe's"], ["Costco", "At Costco"], ["Aldi", "At Aldi"], ["Walmart", "At Walmart"], ["Target", "At Target"], ["Kroger", "At Kroger"]];
const EVERYWHERE = /nearly every|most grocery|every grocery|everywhere|widely|most supermarkets|any grocery|most stores/i;

function cards(html) {
  const out = [];
  const re = /<article class="sk-card" id="(pick-\d+)">([\s\S]*?)<\/article>/g;
  let m;
  while ((m = re.exec(html))) {
    const b = m[2];
    const sub = {};
    const ss = (b.match(/Scores: ([^<]*)</) || [])[1] || "";
    for (const part of ss.split("·")) { const x = part.trim().match(/^(.+?)\s+(\d(?:\.\d)?)$/); if (x) sub[x[1].toLowerCase()] = +x[2]; }
    out.push({
      id: m[1],
      name: strip((b.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1]),
      pill: strip((b.match(/<p class="sk-pill">([\s\S]*?)<\/p>/) || [])[1]),
      score: +((b.match(/<span class="sk-label">Our score<\/span><b>([\d.]+)<\/b>/) || [])[1] || 0),
      cost: (((strip((b.match(/<dt>Price<\/dt><dd>([\s\S]*?)<\/dd>/) || [])[1])).match(/^\${1,4}/) || [""])[0]).length,
      where: strip((b.match(/<dt>Where<\/dt><dd>([\s\S]*?)<\/dd>/) || [])[1]),
      sub
    });
  }
  return out;
}

function bestFor(html, path = "") {
  const cs = cards(html);
  const storeGuide = /(trader-joe|costco|aldi|walmart|target|kroger|sams-club|whole-foods|wegmans|publix|sprouts|heb)/.exec(path);
  if (cs.length < 3) return "";
  const top = cs[0];
  const shownTop = new Set([...html.matchAll(/<a class="sk-top-name" href="#(pick-\d+)">/g)].map((x) => x[1]));
  const by = (key, f) => [...cs].sort((a, b) => (f(b) - f(a)) || (b.score - a.score))[0];
  const rows = [];
  const topPills = [...html.matchAll(/<div class="sk-top-text"><p class="sk-pill">([^<]*)<\/p>/g)].map((x) => x[1].toLowerCase()).join(" ");
  // situations already answered in "Our top picks" aren't repeated
  const add = (label, c, store = false) => {
    if (!c || rows.some((r) => r.label === label)) return;
    if (!store && shownTop.has(c.id)) return;
    if (/splurge/i.test(label) && /splurge|premium|luxury/.test(topPills)) return;
    if (/value/i.test(label) && /value|budget/.test(topPills)) return;
    rows.push({ label, c });
  };
  // best value: the pill if there is one, else the best Value sub-score among the cheapest tier
  const pillValue = cs.find((c) => /best value|budget/i.test(c.pill));
  if (pillValue && !shownTop.has(pillValue.id)) add("Best value", pillValue);
  else if (!pillValue && cs.some((c) => c.sub.value != null)) {
    const v = by("value", (c) => (c.sub.value ?? 0) * 10 - c.cost);
    if (v && v.id !== top.id) add("Best value", v);
  }
  const costs = cs.map((c) => c.cost).filter(Boolean);
  const maxCost = Math.max(...costs, 0);
  const splurgers = cs.filter((c) => c.cost === maxCost && maxCost >= 3);
  if (splurgers.length && maxCost > Math.min(...costs)) { const s = splurgers.sort((a, b) => b.score - a.score)[0]; if (s.id !== top.id) add("The splurge", s); }
  const easy = cs.some((c) => c.sub["easy to find"] != null) ? by("easy", (c) => c.sub["easy to find"] ?? 0) : cs.find((c) => EVERYWHERE.test(c.where));
  if (easy && easy.id !== top.id) add("Easiest to find", easy);
  if (cs.some((c) => c.sub["on the board"] != null)) { const ob = by("board", (c) => c.sub["on the board"] ?? 0); if (ob.id !== top.id) add("Best on the board", ob); }
  let stores = 0;
  for (const [needle, label] of STORES) {
    if (stores >= 3) break;
    if (storeGuide) break; // a store's own guide doesn't need "At <store>"
    const c = cs.find((x) => x.where.includes(needle));
    if (c) { add(label, c, true); stores++; }
  }
  if (rows.length < 2) return "";
  return `<div class="bb-bestfor"><p class="bb-bestfor-h">Best for…</p><ul>${rows.slice(0, 6).map(({ label, c }) => `<li><a href="#${c.id}"><span>${esc(label)}</span><strong>${esc(c.name)}</strong></a></li>`).join("")}</ul></div>`;
}

function keepGoing(html) {
  const pp = (html.match(/<aside class="pair-plate"[\s\S]*?<\/aside>/) || [""])[0];
  const rr = (html.match(/<aside class="related-reading"[\s\S]*?<\/aside>/) || [""])[0];
  const ln = (html.match(/<section class="lab-next"[\s\S]*?<\/section>/) || [""])[0];
  if (!pp && !rr && !ln) return null;
  const tiles = [...pp.matchAll(/<a class="pp-tile" href="([^"]+)">[\s\S]*?<small>([^<]*)<\/small><strong>([\s\S]*?)<\/strong>/g)].map((m) => ({ href: m[1], kind: m[2], title: strip(m[3]) }));
  const pair = tiles.filter((t) => /pairing/i.test(t.kind));
  const boards = tiles.filter((t) => /board/i.test(t.kind));
  const reads = [...rr.matchAll(/<a class="related-card" href="([^"]+)">[\s\S]*?<span>([\s\S]*?)<\/span>/g)].map((m) => ({ href: m[1], title: strip(m[2]).replace(/^The Best /, "Best ").replace(/ for a Charcuterie Board, Ranked$| at the Grocery Store, Ranked$|, Ranked$/, "") }));
  const li = (xs) => xs.map((x) => `<li><a href="${x.href}">${esc(x.title)}</a></li>`).join("");
  const block = `<section class="bb-keep" aria-labelledby="bb-keep-h">
    <h2 id="bb-keep-h">Keep going</h2>
    <div class="bb-keep-grid">
      ${pair.length ? `<div><h3>Pair it</h3><ul>${li(pair)}</ul></div>` : ""}
      <div><h3>Build it</h3><ul>${li(boards)}<li><a href="/board-builder/">Build your own board (free tool)</a></li><li><a href="/ingredients/">Look up any ingredient</a></li></ul></div>
      ${reads.length ? `<div><h3>More buying guides</h3><ul>${li(reads)}</ul></div>` : ""}
    </div>
  </section>`;
  return { pp, rr, ln, block };
}

export function upBest(html, path = "") {
  if (!html.includes('class="sk-cards"')) return { html, n: 0 };
  let n = 0;
  const bf = bestFor(html, path);
  if (bf) {
    const at = html.indexOf('<nav class="sk-jump"');
    if (at > 0) { html = html.slice(0, at) + bf + html.slice(at); n++; }
  }
  const k = keepGoing(html);
  if (k) {
    let first = true;
    for (const part of [k.pp, k.rr, k.ln]) {
      if (!part) continue;
      html = html.replace(part, first ? k.block : "");
      first = false;
    }
    n++;
  }
  return { html, n };
}
