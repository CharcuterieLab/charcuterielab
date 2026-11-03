// Charcuterie Lab site search (2 Nov 2026). One engine for the /search/ page
// and the search panel in the header. The index (/search-index.json) is
// fetched on first use and revalidated on every visit, so a new push is
// searched straight away.
//
// What it does with a query:
//   - drops filler words, treats "charcuterie" and "board" as weak words,
//     maps a few synonyms (cheap -> budget, 2 -> two, xmas -> christmas)
//   - fixes small typos against the site's own words (brei -> brie)
//   - puts hand-picked best pages first for common searches (PICKS)
//   - pins hubs for their topics (PIN)
//   - sends pairing questions to the pairing page
//   - logs searches (query + result count) to /api/search-log
(function () {
  "use strict";
  var IDX = "/search-index.json";
  var data = null, loading = null, byUrl = {}, vocab = [], allText = "";

  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[‘’']/g, ""); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var STOP = {};
  "a an and are be can could do does for from go goes going good how i im in into is it its me my of on or our should the their them then there these this to what whats when where which who why will with without you your yall vs versus".split(" ").forEach(function (w) { STOP[w] = 1; });
  var WEAK = { charcuterie: 1, board: 1, platter: 1, tray: 1 };
  var SYN = { cheap: "budget", inexpensive: "budget", affordable: "budget", xmas: "christmas", bday: "birthday", nye: "new year", "2": "two", veggie: "vegetarian", gf: "gluten free" };
  var PAIRW = { pair: 1, pairs: 1, paired: 1, pairing: 1, pairings: 1, serve: 1, served: 1, eat: 1, match: 1, matches: 1, wine: 1, wines: 1, beer: 1, beers: 1, drink: 1, drinks: 1, cheese: 1, cheeses: 1, charcuterie: 1, board: 1 };
  function stem(w) { if (w.length > 4 && /ies$/.test(w)) return w.slice(0, -3) + "y"; if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1); return w; }
  function words(q) { return q.replace(/[^a-z0-9$ ]+/g, " ").split(/\s+/).filter(function (w) { return w && !STOP[w]; }); }
  function expand(ws) { var out = []; ws.forEach(function (w) { (SYN[w] || w).split(" ").forEach(function (x) { out.push(x); }); }); return out; }

  // Hubs pinned for their topics.
  var PIN = [[/thanksgiving|friendsgiving/, "/holidays/thanksgiving/"], [/christmas|xmas/, "/holidays/christmas/"], [/hanukkah|chanukah/, "/holidays/hanukkah/"], [/new year|\bnye\b/, "/holidays/new-years-eve/"], [/halloween/, "/holidays/halloween/"], [/super ?bowl|game ?day|football/, "/holidays/super-bowl/"], [/valentine/, "/holidays/valentines-day/"], [/easter/, "/holidays/easter/"], [/patrick/, "/holidays/st-patricks-day/"], [/holiday/, "/holidays/"], [/\bgift/, "/gifts/"], [/how much|per person|\bpeople\b|\bguests?\b|serving size|quantit/, "/party-planner/"], [/\bpair|goes with|go with|\bwine\b|\bbeer\b/, "/pairings/"], [/gluten|dairy|nut.?free|allerg|\bdiet/, "/dietary/"], [/\bketo\b|low.?carb/, "/boards/keto-low-carb/"], [/plant.?based|\bvegan\b/, "/boards/plant-based/"], [/for two|date night|\bfor 2\b/, "/boards/for-two/"], [/\bebook|\bbooks?\b|printable|shopping list/, "/shop/"], [/builder|build (my|your) own|make (my|your) own/, "/board-builder/"], [/\bbrands?\b|best buy|costco|aldi|trader/, "/blog/best-charcuterie-brands/"]];

  // Best pages for common searches. Key: the query's strong words, stemmed
  // and sorted ("best cheese for a charcuterie board" -> "best cheese").
  var PICKS = {
    "idea": ["/blog/charcuterie-board-ideas/", "/boards/", "/blog/themed-charcuterie-board-ideas/", "/holidays/"],
    "cheese": ["/ingredients/cheese/", "/blog/best-cheese-charcuterie-board/", "/blog/how-much-cheese-charcuterie-board/"],
    "best cheese": ["/blog/best-cheese-charcuterie-board/", "/ingredients/cheese/"],
    "meat": ["/blog/best-meats-charcuterie-board/", "/ingredients/cured-meat-and-seafood/", "/printables/cured-meat-field-guide/"],
    "best meat": ["/blog/best-meats-charcuterie-board/", "/ingredients/cured-meat-and-seafood/"],
    "salami": ["/blog/types-of-salami/", "/blog/best-salami-brands/", "/ingredients/genoa-salami/"],
    "cracker": ["/blog/best-crackers-for-charcuterie/", "/blog/charcuterie-board-crackers/"],
    "best cracker": ["/blog/best-crackers-for-charcuterie/", "/blog/charcuterie-board-crackers/"],
    "much": ["/party-planner/", "/blog/how-much-charcuterie-per-person/"],
    "per person": ["/blog/how-much-charcuterie-per-person/", "/party-planner/"],
    "much per person": ["/blog/how-much-charcuterie-per-person/", "/party-planner/"],
    "wine": ["/pairings/wine/", "/blog/best-wine-for-charcuterie-board/", "/pairings/wine-and-cheese-chart/"],
    "beer": ["/pairings/beer/", "/blog/beer-pairing/", "/boards/beer-and-charcuterie-board/"],
    "budget": ["/blog/budget-charcuterie-board/", "/boards/25-dollar-budget-charcuterie-board/", "/blog/how-much-does-a-charcuterie-board-cost/"],
    "cost": ["/blog/how-much-does-a-charcuterie-board-cost/", "/blog/budget-charcuterie-board/"],
    "much cost": ["/blog/how-much-does-a-charcuterie-board-cost/", "/blog/budget-charcuterie-board/"],
    "vegan": ["/dietary/vegan/", "/boards/vegan-charcuterie-board/", "/boards/plant-based/"],
    "free gluten": ["/dietary/gluten-free/", "/boards/gluten-free-charcuterie-board/", "/blog/best-gluten-free-crackers/"],
    "keto": ["/boards/keto-low-carb/", "/blog/keto-charcuterie-board/"],
    "two": ["/boards/for-two/", "/blog/charcuterie-board-two/"],
    "date night": ["/boards/for-two/", "/blog/charcuterie-board-two/"],
    "costco": ["/blog/best-costco-charcuterie-items/", "/blog/costco-charcuterie-board/", "/blog/costco-holiday-charcuterie/"],
    "aldi": ["/blog/best-aldi-charcuterie-items/", "/blog/aldi-holiday-charcuterie-items/"],
    "joe trader": ["/blog/best-trader-joes-charcuterie-items/", "/blog/best-trader-joes-cheeses/", "/blog/trader-joes-charcuterie-board/"],
    "make": ["/blog/how-to-make-charcuterie-board/", "/board-builder/"],
    "dessert": ["/boards/dessert-charcuterie-board/", "/blog/dessert-board/"],
    "kid": ["/blog/charcuterie-board-for-kids/", "/boards/kid-friendly-charcuterie-board/"],
    "grazing table": ["/blog/grazing-table/", "/printables/grazing-table-planner/", "/party-planner/charcuterie-board-for-50-people/"],
    "advent": ["/blog/cheese-advent-calendars-2026/", "/printables/diy-cheese-advent-calendar-kit/"],
    "advent calendar": ["/blog/cheese-advent-calendars-2026/", "/printables/diy-cheese-advent-calendar-kit/"],
    "advent calendar cheese": ["/blog/cheese-advent-calendars-2026/", "/printables/diy-cheese-advent-calendar-kit/"],
    "dip": ["/blog/charcuterie-board-dips/"],
    "olive": ["/blog/best-olives-for-charcuterie/", "/blog/charcuterie-board-olives/"],
    "gift": ["/gifts/", "/gifts/under-25/"],
    "book": ["/shop/", "/ebook/"],
    "ebook": ["/shop/", "/ebook/"],
    "printable": ["/shop/printables/", "/newsletter/"],
    "brand": ["/blog/best-charcuterie-brands/"],
    "best": ["/blog/best-charcuterie-brands/"],
    "pairing": ["/pairings/", "/pairings/wine-and-cheese-chart/"],
    "cup": ["/blog/charcuterie-cups/"],
    "size": ["/blog/charcuterie-board-sizes/"],
    "before night": ["/blog/make-charcuterie-board-night-before/"],
    "ahead": ["/blog/make-charcuterie-board-night-before/"],
    "last long": ["/blog/how-long-charcuterie-board-last/"],
    "store": ["/blog/how-to-store-charcuterie-board/"],
    "fruit": ["/blog/charcuterie-board-fruit/", "/ingredients/fruit/"]
  };

  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) loading = fetch(IDX).then(function (r) { return r.json(); }).then(function (j) {
      data = j; var seen = {}, txt = [];
      j.forEach(function (p) {
        byUrl[p.u] = p; var s = norm(p.t + " " + p.d); txt.push(s);
        s.split(/[^a-z0-9]+/).forEach(function (w) { if (w.length >= 3 && !seen[w]) { seen[w] = 1; vocab.push(w); } });
      });
      allText = " " + txt.join(" ") + " ";
      return j;
    });
    return loading;
  }

  // Optimal string alignment distance (a typo with a swapped pair costs 1).
  function dist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 0; j <= b.length; j++) { d[0][j] = j; }
    for (i = 1; i <= a.length; i++) {
      var best = max + 1;
      for (j = 1; j <= b.length; j++) {
        var c = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        if (d[i][j] < best) best = d[i][j];
      }
      if (best > max) return max + 1;
    }
    return d[a.length][b.length];
  }
  function known(w) { return allText.indexOf(w) >= 0; }
  function fix(w) {
    if (/^\d+$/.test(w) || w.length < 4 || known(w)) return null;
    var max = w.length >= 8 ? 2 : 1, best = null, bd = max + 1;
    for (var i = 0; i < vocab.length; i++) {
      var v = vocab[i]; if (v[0] !== w[0] && v[1] !== w[1]) continue;
      var dd = dist(w, v, max);
      if (dd < bd || (dd === bd && best && v.length === w.length && best.length !== w.length)) { bd = dd; best = v; }
    }
    return bd <= max ? best : null;
  }

  function pairItem(raw) { return words(norm(raw)).filter(function (w) { return !PAIRW[w]; }).join(" "); }
  function isPairQ(raw) { var q = norm(raw); return /\b(goes?|go|pairs?|pairing|serve|eat) with\b|\bpair(s|ing)? (for|to)\b|\bwhat (wine|beer|cheese|drink)s?\b|\bwith what\b/.test(q); }
  function pairMatch(raw) {
    var q = pairItem(raw); if (!q) return null;
    var qs = q.replace(/ /g, "-"), qq = [q, q.replace(/s$/, ""), q.replace(/es$/, "")], starts = [];
    for (var i = 0; i < data.length; i++) {
      var p = data[i]; if (!/^\/pairings\/[^/]+\/[^/]+\/$/.test(p.u)) continue;
      var slug = p.u.split("/")[3], name = norm(p.t).replace(/^what (goes|to (serve|pair)) with /, "").replace(/[?.!]+$/, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
      if (qq.indexOf(name) > -1 || qq.indexOf(slug.replace(/-/g, " ")) > -1) return p.u;
      if (slug.indexOf(qs + "-") === 0 || name.indexOf(q + " ") === 0) starts.push(p.u);
    }
    return starts.length === 1 ? starts[0] : null;
  }

  // Search. opts.exact turns typo fixing off ("Search instead for ...").
  function search(raw, opts) {
    opts = opts || {};
    var q = norm(raw).trim();
    if (!q || !data) return { results: [], best: null, fixed: null };
    var ws0 = expand(words(q)), fixed = null;
    var ws = ws0.map(function (w) {
      if (opts.exact) return w;
      var f = fix(w); if (f) { fixed = fixed || {}; fixed[w] = f; return f; }
      return w;
    });
    var qf = fixed ? ws.join(" ") : q;
    var st = ws.map(stem), strong = st.filter(function (w) { return !WEAK[w]; });
    if (!strong.length) strong = st;
    var key = strong.slice().sort().join(" "), picks = PICKS[key] || [], pins = {}, best = null;
    PIN.forEach(function (r) { if (r[0].test(qf) && byUrl[r[1]]) pins[r[1]] = 1; });
    var hasDrink = /\b(wine|beer|cider|pairs?|pairing)\b/.test(qf) && pairItem(qf);
    if (isPairQ(qf) || hasDrink) {
      var u = pairMatch(qf), it = pairItem(qf);
      if (u && byUrl[u]) best = byUrl[u];
      else if (it && byUrl["/pairings/"]) best = { u: "/pairings/?q=" + encodeURIComponent(it), t: "What goes with " + it + "? Open the Pairing Finder", d: "Every match for " + it + ", with the reason each one works.", k: "Pairing Finder", c: "pairings", i: byUrl["/pairings/"].i };
    }
    var res = [];
    data.forEach(function (p) {
      var t = norm(p.t), d = norm(p.d), score = 0, hit = 0;
      strong.forEach(function (w) {
        var num = /^\d+$/.test(w), re = new RegExp((num ? "(^|[^0-9])" : "(^|[^a-z0-9])") + w.replace(/[$]/g, "\\$") + (num ? "($|[^0-9])" : ""));
        var inT = num ? re.test(t) : t.indexOf(w) >= 0, inD = num ? re.test(d) : d.indexOf(w) >= 0;
        if (inT || inD) hit++;
        if (inT) score += re.test(t) ? 10 : 6;
        if (inD) score += 2;
        if (t.indexOf(w) === 0) score += 4;
      });
      var pi = picks.indexOf(p.u);
      if (pi >= 0) score += 1000 - pi * 100;
      if (pins[p.u]) score += 18;
      if (!hit && !pins[p.u] && pi < 0) return;
      if (strong.length > 1 && hit === strong.length) score += 25;
      if (strong !== st) st.forEach(function (w) { if (WEAK[w] && t.indexOf(w) >= 0) score += 1; });
      if (/hub$/.test(p.k) || p.h) score += 4;
      if (p.k === "Party Planner" || p.k === "Board") score += 2;
      if (best && p.u === best.u) return;
      res.push({ s: score, p: p });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return { results: res.map(function (r) { return r.p; }), best: best, fixed: fixed, query: fixed ? ws.join(" ") : raw };
  }

  // Search log (anonymous: the query and how many results it got).
  var logged = {};
  try { logged = JSON.parse(sessionStorage.getItem("cl-sq") || "{}"); } catch (e) {}
  function log(q, n, where) {
    q = norm(q).replace(/\s+/g, " ").trim().slice(0, 80);
    if (q.length < 2 || logged[q]) return;
    logged[q] = 1; try { sessionStorage.setItem("cl-sq", JSON.stringify(logged)); } catch (e) {}
    var body = JSON.stringify({ q: q, n: n, where: where || "page" });
    try { if (navigator.sendBeacon) navigator.sendBeacon("/api/search-log", new Blob([body], { type: "application/json" })); else fetch("/api/search-log", { method: "POST", body: body, headers: { "content-type": "application/json" }, keepalive: true }); } catch (e) {}
  }

  function row(p, tag) {
    return '<li' + (tag ? ' class="search-best"' : "") + '><a href="' + esc(p.u) + '">' + (p.i ? '<img src="' + esc(p.i) + '" alt="" width="96" height="72" loading="lazy" decoding="async">' : '<span class="search-noimg" aria-hidden="true"></span>') + '<span class="search-body"><span class="search-kind">' + esc(tag || p.k) + "</span><strong>" + esc(p.t) + "</strong><span>" + esc(p.d) + "</span></span></a></li>";
  }

  // ---- /search/ page ----
  var CATS = [["boards", "Boards"], ["ingredients", "Ingredients"], ["pairings", "Pairings"], ["guides", "Guides"], ["holidays", "Holidays"], ["gifts", "Gifts"], ["planning", "Planning"], ["shop", "Shop"], ["more", "More"]];
  function page() {
    var input = document.getElementById("q"), list = document.querySelector("[data-search-results]");
    if (!input || !list) return;
    var count = document.querySelector("[data-search-count]"), chips = document.querySelector("[data-search-filters]"), fixP = document.querySelector("[data-search-fix]"), more = document.querySelector("[data-search-more]"), empty = document.querySelector("[data-search-empty]");
    var cat = "all", shown = 20, exact = false, last = null, timer = null;
    function render() {
      var raw = input.value.trim();
      if (!raw || !data) { list.innerHTML = ""; chips.innerHTML = ""; fixP.hidden = true; more.hidden = true; empty.hidden = false; count.textContent = count.getAttribute("data-default"); return; }
      empty.hidden = true;
      var r = last;
      var counts = {}; r.results.forEach(function (p) { counts[p.c] = (counts[p.c] || 0) + 1; });
      var total = r.results.length + (r.best ? 1 : 0);
      chips.innerHTML = total ? ['<button type="button" data-cat="all" aria-pressed="' + (cat === "all") + '">All <span>' + total + "</span></button>"].concat(CATS.filter(function (c) { return counts[c[0]]; }).map(function (c) { return '<button type="button" data-cat="' + c[0] + '" aria-pressed="' + (cat === c[0]) + '">' + c[1] + " <span>" + counts[c[0]] + "</span></button>"; })).join("") : "";
      var list2 = cat === "all" ? r.results : r.results.filter(function (p) { return p.c === cat; });
      var head = r.best && (cat === "all" || cat === r.best.c) ? row(r.best, "Best answer") : "";
      count.textContent = total ? total + " result" + (total === 1 ? "" : "s") + " for “" + (r.fixed ? r.query : raw) + "”" : "No results for “" + raw + "”. Try one ingredient (brie), a guest count (20 people) or a holiday, or browse the sections below.";
      if (r.fixed) { fixP.innerHTML = 'Showing results for <strong>' + esc(r.query) + '</strong>. <button type="button" data-exact>Search instead for “' + esc(raw) + "”</button>"; fixP.hidden = false; } else fixP.hidden = true;
      if (!total) empty.hidden = false;
      list.innerHTML = head + list2.slice(0, shown).map(function (p) { return row(p); }).join("");
      more.hidden = list2.length <= shown;
      if (!more.hidden) more.textContent = "Show more (" + (list2.length - shown) + " left)";
    }
    function run(reset) {
      if (reset) { cat = "all"; shown = 20; }
      last = search(input.value, { exact: exact });
      render();
      clearTimeout(timer);
      var q = input.value.trim();
      if (q.length >= 3) timer = setTimeout(function () { log(q, last.results.length + (last.best ? 1 : 0), "page"); }, 1500);
    }
    chips.addEventListener("click", function (e) { var b = e.target.closest("[data-cat]"); if (!b) return; cat = b.getAttribute("data-cat"); shown = 20; render(); });
    more.addEventListener("click", function () { shown += 20; render(); });
    fixP.addEventListener("click", function (e) { if (e.target.closest("[data-exact]")) { exact = true; run(true); } });
    list.addEventListener("click", function () { var q = input.value.trim(); if (q) log(q, last ? last.results.length : 0, "page"); });
    var fromUrl = false;
    try { var q0 = new URLSearchParams(location.search).get("q"); if (q0) { input.value = q0; fromUrl = true; } } catch (e) {}
    load().then(function () {
      if (fromUrl) {
        var pq = false; try { pq = new URLSearchParams(location.search).get("pair") === "1"; } catch (e) {}
        if (pq || isPairQ(input.value)) { var u = pairMatch(input.value); if (u) { log(input.value, 1, "redirect"); location.replace(u); return; } }
      }
      run(true);
    });
    input.addEventListener("input", function () { exact = false; if (data) run(true); try { history.replaceState(null, "", "/search/" + (input.value.trim() ? "?q=" + encodeURIComponent(input.value.trim()) : "")); } catch (e) {} });
    document.querySelector("[data-search-form]").addEventListener("submit", function (e) { e.preventDefault(); if (!data) return; run(true); var q = input.value.trim(); if (q) { clearTimeout(timer); log(q, last.results.length + (last.best ? 1 : 0), "page"); } input.blur(); });
  }

  // ---- header search panel (every other page) ----
  function panel() {
    if (/^\/search\//.test(location.pathname)) return;
    var header = document.querySelector(".site-header");
    var links = document.querySelectorAll(".nav-m-search, .nav-search");
    if (!header || !links.length) return;
    var box = null, input, ul, timer;
    function close() { if (box) { box.hidden = true; document.removeEventListener("keydown", onKey); } }
    function onKey(e) { if (e.key === "Escape") close(); }
    function open(e) {
      e.preventDefault();
      if (!box) {
        box = document.createElement("div");
        box.className = "hs-panel";
        box.innerHTML = '<form class="hs-form" action="/search/" method="get" role="search"><label class="sr-only" for="hs-q">Search Charcuterie Lab</label><input id="hs-q" name="q" type="search" placeholder="Search boards, ingredients, pairings…" autocomplete="off"><button type="submit" class="hs-go">Search</button><button type="button" class="hs-x" aria-label="Close search">&times;</button></form><ul class="hs-list" role="listbox" aria-label="Suggestions"></ul><p class="hs-hint">Try brie, 20 people, Thanksgiving or what wine goes with gouda</p>';
        header.appendChild(box);
        input = box.querySelector("input"); ul = box.querySelector(".hs-list");
        box.querySelector(".hs-x").addEventListener("click", close);
        input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(suggest, 90); });
        box.querySelector("form").addEventListener("submit", function () { var q = input.value.trim(); if (q && data) { var r = search(q); log(q, r.results.length + (r.best ? 1 : 0), "header"); } });
        ul.addEventListener("click", function (e) { if (e.target.closest("a")) { var q = input.value.trim(); var r = search(q); log(q, r.results.length + (r.best ? 1 : 0), "header-pick"); } });
        document.addEventListener("click", function (ev) { if (box && !box.hidden && !box.contains(ev.target) && !ev.target.closest(".nav-m-search, .nav-search")) close(); });
      }
      box.hidden = false;
      header.classList.remove("is-tucked");
      document.addEventListener("keydown", onKey);
      setTimeout(function () { input.focus(); }, 30);
      load();
    }
    function suggest() {
      var q = input.value.trim();
      if (!q) { ul.innerHTML = ""; box.classList.remove("has-results"); return; }
      load().then(function () {
        var r = search(q), top = (r.best ? [r.best] : []).concat(r.results).slice(0, 5), n = r.results.length + (r.best ? 1 : 0);
        ul.innerHTML = top.map(function (p, i) { return '<li><a href="' + esc(p.u) + '">' + (p.i ? '<img src="' + esc(p.i) + '" alt="" width="48" height="36" loading="lazy">' : '<span class="search-noimg" aria-hidden="true"></span>') + "<span><strong>" + esc(p.t) + "</strong><small>" + esc(i === 0 && r.best ? "Best answer" : p.k) + "</small></span></a></li>"; }).join("") + (n ? '<li class="hs-all"><a href="/search/?q=' + encodeURIComponent(q) + '">See all ' + n + " results &rarr;</a></li>" : '<li class="hs-none">No matches yet. Press Search to try the full search.</li>');
        box.classList.add("has-results");
      });
    }
    for (var i = 0; i < links.length; i++) links[i].addEventListener("click", open);
  }

  window.CLSearch = { load: load, search: search };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { page(); panel(); }); else { page(); panel(); }
})();
