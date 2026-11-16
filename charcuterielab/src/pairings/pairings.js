// Pairings Hub - one small script for every /pairings/ page.
// Hub: Pairing Finder ("What goes with..." and "Check or complete a bite").
// Other pages: filters, the chart's highlight/print, the seasonal strip.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").trim();
const builder = (slugs, campaign) => `/board-builder/?b=${slugs.join(",")}&g=6&m=app&utm_source=charcuterielab&utm_medium=site&utm_campaign=${campaign}`;

// ---------------------------------------------------------------- filters ---
function pressGroup(buttons, active) {
  buttons.forEach((b) => b.setAttribute("aria-pressed", b === active ? "true" : "false"));
}
function filters() {
  const d = $$("[data-dfilter]");
  d.forEach((b) => b.addEventListener("click", () => {
    pressGroup(d, b);
    const f = b.dataset.dfilter;
    $$(".pr-drinks > li").forEach((li) => {
      const body = +li.dataset.body, sweet = +li.dataset.sweet;
      li.hidden = !(f === "all" || (f === "light" && body <= 2) || (f === "bold" && body >= 4) || (f === "sweet" && sweet >= 3));
    });
  }));
  const c = $$("[data-cfilter]");
  c.forEach((b) => b.addEventListener("click", () => {
    pressGroup(c, b);
    $$(".pr-grid > li").forEach((li) => (li.hidden = !(b.dataset.cfilter === "all" || li.dataset.cat === b.dataset.cfilter)));
  }));
  const k = $$("[data-kfilter]");
  const kq = $("#pr-kq");
  const applyK = () => {
    const active = k.find((b) => b.getAttribute("aria-pressed") === "true")?.dataset.kfilter || "all";
    const q = norm(kq?.value || "");
    $$("[data-kind-section]").forEach((sec) => {
      let shown = 0;
      $$(".pr-combo", sec).forEach((li) => {
        const ok = (active === "all" || li.dataset.kind === active) && (!q || li.dataset.search.includes(q));
        li.hidden = !ok;
        if (ok) shown++;
      });
      sec.hidden = !shown;
    });
  };
  k.forEach((b) => b.addEventListener("click", () => { pressGroup(k, b); applyK(); }));
  kq?.addEventListener("input", applyK);
}

// ------------------------------------------------------------------ chart ---
function chart() {
  const t = $("#pr-chart");
  if (!t) return;
  let sel = null;
  const clear = () => $$(".is-hl, .is-dim", t).forEach((el) => el.classList.remove("is-hl", "is-dim"));
  t.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const cell = e.target.closest("[data-col], tr[data-row] > th");
    if (!cell) return;
    const col = cell.dataset.col;
    const row = cell.closest("tr")?.dataset.row;
    const id = col ? `c:${col}` : `r:${row}`;
    clear();
    if (sel === id) { sel = null; return; }
    sel = id;
    t.classList.add("is-focus");
    if (col) {
      $$(`[data-col="${col}"]`, t).forEach((el) => el.classList.add("is-hl"));
      $$("tbody tr", t).forEach((tr) => { if (!$(`td[data-col="${col}"] .pr-dot`, tr)) tr.classList.add("is-dim"); });
    } else {
      $(`tr[data-row="${row}"]`, t).classList.add("is-hl");
      $$(`tr[data-row="${row}"] td`, t).forEach((td) => { if (!$(".pr-dot", td)) $$(`[data-col="${td.dataset.col}"]`, t).forEach((el) => el.classList.add("is-dim")); });
    }
  });
  const beer = $("[data-beer]");
  const syncBeer = () => t.classList.toggle("show-beer", !!beer?.checked);
  beer?.addEventListener("change", syncBeer);
  syncBeer();
  $("[data-print]")?.addEventListener("click", () => window.print());
}

// ---------------------------------------------------------- seasonal strip ---
function season() {
  const sec = $(".pr-season");
  if (!sec) return;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let best = null;
  for (const card of $$(".pr-season-card", sec)) {
    const next = JSON.parse(card.dataset.dates).map((d) => new Date(`${d}T00:00:00`)).find((d) => d >= today);
    if (!next) continue;
    const days = (next - today) / 86400000;
    if (days <= 75 && (!best || days < best.days)) best = { card, days };
  }
  if (!best) return;
  best.card.hidden = false;
  $("[data-season-name]", sec).textContent = best.card.dataset.name;
  sec.hidden = false;
}

// ----------------------------------------------------------------- finder ---
async function finder() {
  const input = $("#pr-q");
  if (!input) return;
  const src = $("script[data-src]")?.dataset.src;
  let D;
  try { D = await (await fetch(src)).json(); } catch { $("#pr-result").innerHTML = "<p>The finder couldn't load. Refresh to try again.</p>"; return; }

  const I = D.i.map(([slug, title, cat, img, pairs, avoid, page, role], n) => ({ n, slug, title, cat, img, pairs, avoid, page, role, key: norm(title) }));
  const K = D.d.map(([slug, name, fam, url, color, matches, whys, family], n) => ({ n, slug, name, fam, url, color, matches, whys, family, key: norm(name) }));
  const bySlug = new Map(I.map((x) => [x.slug, x]));
  const drinkBySlug = new Map(K.map((x) => [x.slug, x]));
  const reason = (a, b) => D.r[[String(a), String(b)].sort().join("-")] || "";
  const cats = D.c;
  const suggest = $("#pr-suggest");
  const result = $("#pr-result");
  let mode = "find";
  let picks = []; // check mode: ["brie", "drink:pinot-noir"]
  let active = -1;

  const thumb = (x, cls = "") => {
    const c = cats[x.cat] || { t: "#8f6d2e", g: "" };
    return x.img
      ? `<span class="pr-thumb${cls}" style="--t:${c.t}"><img src="${esc(x.img)}" alt="" loading="lazy"></span>`
      : `<span class="pr-thumb${cls} pr-thumb-art" style="--t:${c.t}" aria-hidden="true">${c.g}</span>`;
  };
  const swatch = (k) => `<span class="pr-drink-swatch" style="--d:${k.color}" aria-hidden="true"></span>`;
  const ent = (id) => (id.startsWith("drink:") ? { d: drinkBySlug.get(id.slice(6)) } : { i: bySlug.get(id) });
  const label = (id) => { const e = ent(id); return e.d ? e.d.name : e.i ? e.i.title : id; };
  const pageFor = (x) => (x.page ? `/pairings/food/${x.slug}/` : `/ingredients/${x.slug}/`);

  function search(q) {
    const n = norm(q);
    if (!n) return [];
    const score = (key) => (key === n ? 0 : key.startsWith(n) ? 1 : key.split(" ").some((w) => w.startsWith(n)) ? 2 : key.includes(n) ? 3 : 9);
    const all = [
      ...K.map((k) => ({ id: `drink:${k.slug}`, s: score(k.key), label: k.name, sub: k.fam, k })),
      ...I.map((x) => ({ id: x.slug, s: score(x.key), label: x.title, sub: cats[x.cat]?.n || "", x }))
    ].filter((r) => r.s < 9);
    const pop = (r) => (r.k ? (r.k.family === "wine" || r.k.family === "beer" ? 1 : 0) : r.x.page ? 2 : 0);
    return all.sort((a, b) => a.s - b.s || pop(b) - pop(a) || a.label.length - b.label.length).slice(0, 8);
  }
  function showSuggest(list) {
    active = -1;
    if (!list.length) { suggest.hidden = true; input.setAttribute("aria-expanded", "false"); return; }
    suggest.innerHTML = list.map((r, n) => `<li role="option" id="pr-opt-${n}" data-id="${esc(r.id)}">${r.k ? swatch(r.k) : thumb(r.x, " pr-thumb-xs")}<span>${esc(r.label)}</span><em>${esc(r.sub)}</em></li>`).join("");
    suggest.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }
  input.addEventListener("input", () => showSuggest(search(input.value)));
  input.addEventListener("keydown", (e) => {
    const opts = $$("li", suggest);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!opts.length) return;
      active = (active + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length;
      opts.forEach((o, n) => o.classList.toggle("is-active", n === active));
      input.setAttribute("aria-activedescendant", opts[active].id);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = opts[active] || opts[0];
      if (o) choose(o.dataset.id);
    } else if (e.key === "Escape") {
      suggest.hidden = true;
    }
  });
  suggest.addEventListener("mousedown", (e) => { const li = e.target.closest("li"); if (li) { e.preventDefault(); choose(li.dataset.id); } });
  document.addEventListener("click", (e) => { if (!e.target.closest(".pr-search")) suggest.hidden = true; });

  function choose(id) {
    suggest.hidden = true;
    input.value = "";
    if (mode === "find") show(id);
    else { if (!picks.includes(id) && picks.length < 5) picks.push(id); renderCheck(); }
  }

  $$(".pr-tab").forEach((t) => t.addEventListener("click", () => setMode(t.dataset.mode)));
  function setMode(m, silent) {
    mode = m;
    $$(".pr-tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.mode === m ? "true" : "false"));
    input.placeholder = m === "find" ? "Try brie, prosciutto, Pinot Noir, IPA…" : "Add 1 to 5 foods or drinks…";
    if (!silent) { if (m === "check") renderCheck(); else result.innerHTML = ""; }
    input.focus();
  }

  $$("[data-pick]").forEach((b) => b.addEventListener("click", () => choose(b.dataset.pick)));
  $("[data-surprise]")?.addEventListener("click", () => {
    const k = D.k[Math.floor(Math.random() * D.k.length)];
    setMode("check", true);
    picks = k[0].map((n) => I[n].slug);
    renderCheck(k);
  });

  const url = (params) => { const u = new URL(location.href); u.search = params; history.replaceState(null, "", u); };

  function card(x, why, extra = "") {
    return `<li class="pr-rcard">
      <button type="button" data-go="${esc(x.slug)}" title="Explore ${esc(x.title)}">${thumb(x)}<strong>${esc(x.title)}</strong>${why ? `<span>${esc(why)}</span>` : ""}</button>
      <a class="pr-rlink" href="${pageFor(x)}" aria-label="Open the ${esc(x.title)} page">&rarr;</a>${extra}
    </li>`;
  }

  function show(id) {
    url(`?q=${encodeURIComponent(id)}`);
    const e = ent(id);
    if (e.d) return showDrink(e.d);
    const x = e.i;
    if (!x) return;
    const pairs = x.pairs.map((n) => I[n]);
    const topN = (D.top[x.n] || []).map((n) => I[n]);
    const withWhy = pairs.filter((p) => reason(x.n, p.n) && !topN.includes(p));
    const best = [...topN, ...withWhy, ...pairs.filter((p) => !topN.includes(p) && !withWhy.includes(p))].slice(0, 6);
    const drinks = (D.df[x.n] || []).map((n) => K[n]);
    const combos = D.k.filter((k) => k[0].includes(x.n));
    const groups = cats.map((c, ci) => [c, pairs.filter((p) => p.cat === ci && !best.includes(p))]).filter(([, l]) => l.length);
    result.innerHTML = `
      <div class="pr-rhead">${thumb(x, " pr-thumb-big")}<div>
        <p class="pr-rkicker">${esc(cats[x.cat]?.n || "")}${x.role ? ` · ${esc(x.role)}` : ""}</p>
        <h2>What goes with ${esc(x.title)}</h2>
        <p>${pairs.length} pairings${drinks.length ? ` and ${drinks.length} drink${drinks.length === 1 ? "" : "s"}` : ""}. Tap any card to explore it next.</p>
        <p class="pr-ractions">${x.page ? `<a class="button primary" href="/pairings/food/${x.slug}/">Full ${esc(x.title)} pairing guide</a>` : ""}<a class="button" href="${builder([x.slug, ...best.map((p) => p.slug)].slice(0, 8), `finder_${x.slug}`)}">Build a board with this</a><a class="pr-more" href="/ingredients/${x.slug}/">About ${esc(x.title)} &rarr;</a></p>
      </div></div>
      <h3>Best matches</h3>
      <ul class="pr-rgrid">${best.map((p) => card(p, reason(x.n, p.n))).join("")}</ul>
      ${drinks.length ? `<h3>Drinks</h3><ul class="pr-rdrinks">${drinks.map((k) => `<li><button type="button" data-go="drink:${esc(k.slug)}">${swatch(k)}<strong>${esc(k.name)}</strong><em>${esc(k.fam)}</em></button></li>`).join("")}</ul>` : ""}
      ${combos.length ? `<h3>Try it as a combo</h3><ul class="pr-rcombos">${combos.map((k) => `<li><button type="button" data-combo="${k[0].join(",")}">${k[0].map((n) => thumb(I[n], " pr-thumb-xs")).join("")}<strong>${esc(k[1])}</strong></button></li>`).join("")}</ul>` : ""}
      ${groups.length ? `<h3>Everything else that works</h3>${groups.map(([c, l]) => `<details class="pr-rgroup"><summary>${esc(c.n)} <span>${l.length}</span></summary><ul class="pr-rgrid pr-rgrid-sm">${l.map((p) => card(p, reason(x.n, p.n))).join("")}</ul></details>`).join("")}` : ""}
      ${x.avoid.length ? `<h3>Skip with ${esc(x.title)}</h3><p class="pr-ravoid">${x.avoid.map((n) => `<a href="/ingredients/${I[n].slug}/">${esc(I[n].title)}</a>`).join(" · ")}</p>` : ""}`;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showDrink(k) {
    const m = k.matches.map((n, j) => [I[n], k.whys[j]]);
    result.innerHTML = `
      <div class="pr-rhead pr-rhead-drink" style="--d:${k.color}"><span class="pr-glass-lg" aria-hidden="true"></span><div>
        <p class="pr-rkicker">${esc(k.fam)}</p>
        <h2>What goes with ${esc(k.name)}</h2>
        <p>${m.length} matches. Tap any card to explore it next.</p>
        <p class="pr-ractions"><a class="button primary" href="${esc(k.url)}">Full ${esc(k.name)} guide</a><a class="button" href="${builder(m.slice(0, 8).map(([x]) => x.slug), `finder_${k.slug}`)}">Build a board for this drink</a></p>
      </div></div>
      <ul class="pr-rgrid">${m.map(([x, why]) => card(x, why)).join("")}</ul>`;
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function linked(a, b) {
    const A = ent(a), Bx = ent(b);
    if (A.i && Bx.i) return A.i.pairs.includes(Bx.i.n) ? reason(A.i.n, Bx.i.n) || "Listed as a match in our ingredient guides." : null;
    const d = A.d || Bx.d, x = A.i || Bx.i;
    if (d && x) { const j = d.matches.indexOf(x.n); return j >= 0 ? d.whys[j] : null; }
    return null;
  }

  // "Check or complete a bite" (15 Nov 2026): verdict, named-combination match,
  // one step to a named combination, fixes for weak pairs, fill-the-gap picks
  // by role (sweet, crunch, briny, cheese, meat) that go with every food, and drinks.
  const ROLE = { "Cheese": "cheese", "Cured Meat & Seafood": "meat", "Fruit": "sweet", "Spreads, Jams & Honey": "sweet", "Crackers & Breads": "crunch", "Nuts & Seeds": "crunch", "Pickles, Olives & Briny": "briny", "Finishing Touches": "finish" };
  const SLOTS = [
    ["sweet", "Something sweet", "Fruit, jam or honey rounds off salt."],
    ["crunch", "Something crunchy", "A cracker or nut adds the texture soft foods lack."],
    ["briny", "Something briny", "A pickle or olive cuts richness and resets your palate."],
    ["cheese", "A cheese", "Something creamy or nutty to anchor the bite."],
    ["meat", "A cured meat", "Salt and savory depth."]
  ];
  const roleOf = (x) => ROLE[cats[x.cat]?.n] || "";
  const topSet = new Map(Object.entries(D.top).map(([k, v]) => [+k, new Set(v)]));
  const comboIdx = (n) => D.k.filter((k) => k[0].includes(n)).length;
  const MAXP = 5;
  function rank(foods, exclude) {
    // every candidate that pairs with at least all-but-one of the foods
    const need = foods.length <= 2 ? foods.length : foods.length - 1;
    const out = [];
    for (const x of I) {
      if (exclude.has(x.n)) continue;
      const hits = foods.filter((f) => f.pairs.includes(x.n));
      if (hits.length < need) continue;
      let s = hits.length * 10;
      for (const f of hits) { if (reason(f.n, x.n)) s += 3; if (topSet.get(f.n)?.has(x.n)) s += 4; }
      s += Math.min(comboIdx(x.n), 4) + (x.page ? 2 : 0);
      out.push({ x, hits: hits.length, s });
    }
    return out.sort((a, b) => b.s - a.s);
  }
  const addBtn = (p, sub) => `<li class="pr-rcard"><button type="button" data-add="${esc(p.slug)}">${thumb(p)}<strong>+ ${esc(p.title)}</strong>${sub ? `<span>${esc(sub)}</span>` : ""}</button></li>`;
  const labLink = (k) => `/pairings/classics/#c-${k[4]}`;

  function renderCheck(combo) {
    url(picks.length ? `?check=${picks.map(encodeURIComponent).join(",")}` : "");
    const chips = picks.map((id) => `<li><span>${esc(label(id))}</span><button type="button" data-remove="${esc(id)}" aria-label="Remove ${esc(label(id))}">&times;</button></li>`).join("");
    const foods = picks.filter((id) => !id.startsWith("drink:")).map((id) => bySlug.get(id)).filter(Boolean);
    const drinkPicked = picks.some((id) => id.startsWith("drink:"));
    const exclude = new Set(foods.map((f) => f.n));
    const fns = foods.map((f) => f.n).sort((a, b) => a - b).join(",");
    const named = combo || D.k.find((k) => [...k[0]].sort((a, b) => a - b).join(",") === fns);
    // one step up: a named combination that has every pick plus one more food
    const nextUp = foods.length ? D.k.filter((k) => k[0].length === foods.length + 1 && foods.every((f) => k[0].includes(f.n))).slice(0, 4) : [];
    const nextHtml = nextUp.length && picks.length < MAXP ? `<h3>One step to a named combination</h3><ul class="pr-rcombos">${nextUp.map((k) => { const add = I[k[0].find((n) => !exclude.has(n))]; return `<li><button type="button" data-add="${esc(add.slug)}">${thumb(add, " pr-thumb-xs")}<strong>+ ${esc(add.title)}</strong><em>makes ${esc(k[1])}</em></button></li>`; }).join("")}</ul>` : "";

    // fill the gaps by role
    const have = new Set(foods.map(roleOf));
    const ranked = foods.length ? rank(foods, exclude) : [];
    const slots = SLOTS.filter(([r]) => !have.has(r) && !(r === "meat" && have.has("cheese") && have.has("sweet") && foods.length >= 3))
      .map(([r, t, why]) => [t, why, ranked.filter((c) => roleOf(c.x) === r).slice(0, 3)])
      .filter(([, , l]) => l.length).slice(0, 4);
    const gapHtml = slots.length && picks.length < MAXP ? `<h3>Complete the bite</h3><p class="pr-rhint">Each of these goes with ${foods.length > 2 ? "all or all but one" : foods.length === 2 ? "both" : "it"}. Tap one to add it.</p>${slots.map(([t, why, l]) => `<div class="pr-slot"><p class="pr-slot-h"><strong>${esc(t)}</strong> <span>${esc(why)}</span></p><ul class="pr-rgrid pr-rgrid-sm">${l.map((c) => addBtn(c.x, foods.length > 1 ? (c.hits === foods.length ? `goes with all ${foods.length === 2 ? "both" : foods.length}`.replace("all both", "both") : `goes with ${c.hits} of ${foods.length}`) : reason(foods[0].n, c.x.n))).join("")}</ul></div>`).join("")}` : "";

    // drinks: a named combination's own picks first, then the drinks that match
    // the most foods, making sure every food is represented (wine/beer, then one no-alcohol)
    let drinkHtml = "";
    let shownDrinks = [];
    if (foods.length && !drinkPicked) {
      const cnt = new Map();
      for (const f of foods) for (const n of D.df[f.n] || []) cnt.set(n, (cnt.get(n) || 0) + 1);
      const cardPick = named && named[5] ? named[5].map((n) => K[n]).filter(Boolean) : [];
      const chosen = [...cardPick];
      const take = (k) => { if (k && !chosen.includes(k)) chosen.push(k); };
      const top = Math.max(0, ...cnt.values());
      [...cnt].filter(([, c]) => c === top && top > 1).forEach(([n]) => take(K[n]));
      for (let round = 0; round < 3; round++) for (const f of foods) take((D.df[f.n] || []).map((n) => K[n]).filter((k) => k.family === "wine" || k.family === "beer" ? !chosen.includes(k) : false)[0]);
      const main = chosen.filter((k) => k.family !== "zero").slice(0, cardPick.length ? 4 : 3);
      const zero = chosen.find((k) => k.family === "zero") || [...cnt].map(([n]) => K[n]).find((k) => k.family === "zero");
      const shown = [...main, ...(zero ? [zero] : [])];
      shownDrinks = shown;
      const note = (k) => (cardPick.includes(k) ? "the card's pick" : foods.length > 1 ? `matches ${cnt.get(k.n) || 0} of ${foods.length}` : "");
      if (shown.length) drinkHtml = `<h3>What to pour</h3><ul class="pr-rdrinks">${shown.map((k) => `<li><button type="button" data-add="drink:${esc(k.slug)}" title="Add ${esc(k.name)} to the check">${swatch(k)}<strong>${esc(k.name)}</strong><em>${esc(k.fam)}${note(k) ? ` · ${note(k)}` : ""}</em></button></li>`).join("")}</ul>`;
    }

    if (picks.length < 2) {
      result.innerHTML = `<ul class="pr-picks">${chips}</ul><p class="pr-rhint">${picks.length ? "Add one more food or drink to check it, or pick from the ideas below." : "Add 2 to 5 foods or drinks with the search box, or hit <strong>Surprise me</strong>."}</p>${gapHtml}${nextHtml}`;
      return;
    }
    const pairs = [];
    for (let a = 0; a < picks.length; a++) for (let b = a + 1; b < picks.length; b++) pairs.push([picks[a], picks[b], linked(picks[a], picks[b])]);
    const ok = pairs.filter((p) => p[2]).length;
    const verdict = ok === pairs.length ? ["yes", "Yes, these all go together."] : ok >= pairs.length / 2 ? ["mostly", `Mostly: ${ok} of ${pairs.length} pairs are proven matches.`] : ok ? ["maybe", `A stretch: only ${ok} of ${pairs.length} pairs are proven matches.`] : ["no", "No proven match here. See the fixes below."];
    // fixes: for each food pair that doesn't match, a food that goes with both
    const fixes = [];
    for (const [a, b, why] of pairs) {
      const A = bySlug.get(a), Bf = bySlug.get(b);
      if (why || !A || !Bf) continue;
      const bridge = I.filter((x) => !exclude.has(x.n) && A.pairs.includes(x.n) && Bf.pairs.includes(x.n))
        .sort((x, y) => (reason(A.n, y.n) ? 1 : 0) + (reason(Bf.n, y.n) ? 1 : 0) - (reason(A.n, x.n) ? 1 : 0) - (reason(Bf.n, x.n) ? 1 : 0) || (y.page - x.page))[0];
      fixes.push([A, Bf, bridge]);
    }
    const fixHtml = fixes.length ? `<h3>How to fix it</h3><ul class="pr-fixes">${fixes.slice(0, 3).map(([A, Bf, br]) => `<li><strong>${esc(A.title)} + ${esc(Bf.title)}</strong> ${br ? `has no proven match. <button type="button" class="pr-chip" data-add="${esc(br.slug)}">+ ${esc(br.title)}</button> goes with both and bridges them, or <button type="button" class="pr-chip" data-remove="${esc(Bf.slug)}">drop ${esc(Bf.title)}</button>.` : `has no proven match and nothing bridges them. <button type="button" class="pr-chip" data-remove="${esc(Bf.slug)}">Drop ${esc(Bf.title)}</button>`}</li>`).join("")}</ul>` : "";
    result.innerHTML = `
      <ul class="pr-picks">${chips}</ul>
      <p class="pr-verdict pr-verdict-${verdict[0]}">${verdict[1]}</p>
      ${named ? `<p class="pr-named"><strong>That's ${/^The /.test(named[1]) ? "" : "a named combination: "}${esc(named[1])}.</strong> ${esc(named[2])} <a href="${labLink(named)}">See its card in the Combination Lab &rarr;</a></p>` : ""}
      <ul class="pr-pairs">${pairs.map(([a, b, why]) => `<li class="${why ? "is-yes" : "is-no"}"><strong>${esc(label(a))} + ${esc(label(b))}</strong><span>${why ? esc(why) : "Not a listed pairing. It may still work, but nothing here backs it up."}</span></li>`).join("")}</ul>
      ${fixHtml}${nextHtml}${gapHtml}${drinkHtml}
      ${foods.length ? `<p class="pr-ractions"><a class="button primary" href="${builder(foods.map((f) => f.slug), "finder_check")}">Build a board with ${foods.length > 1 ? "these" : "this"}</a>${picks.length > 1 ? `<button type="button" class="button" data-copy>Copy link to this bite</button>` : ""}${foods.length > 1 ? ` <a class="button" data-plate-list href="/pairings/list/?${named && named[4] ? `c=${encodeURIComponent(named[4])}` : `f=${foods.map((f) => encodeURIComponent(f.slug)).join(",")}${shownDrinks.length ? `&d=${shownDrinks.map((k) => encodeURIComponent(k.slug)).join(",")}` : ""}`}">Shopping list</a>` : ""}</p>` : ""}`;
  }

  result.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) { setMode("find", true); return show(go.dataset.go); }
    const add = e.target.closest("[data-add]");
    if (add) { if (picks.length < 5 && !picks.includes(add.dataset.add)) picks.push(add.dataset.add); return renderCheck(); }
    const cp = e.target.closest("[data-copy]");
    if (cp) { navigator.clipboard?.writeText(location.href).then(() => { cp.textContent = "Link copied"; }, () => {}); return; }
    const rm = e.target.closest("[data-remove]");
    if (rm) { picks = picks.filter((p) => p !== rm.dataset.remove); return renderCheck(); }
    const cb = e.target.closest("[data-combo]");
    if (cb) {
      const ns = cb.dataset.combo.split(",").map(Number);
      setMode("check", true);
      picks = ns.map((n) => I[n].slug);
      renderCheck(D.k.find((k) => k[0].join(",") === cb.dataset.combo));
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // deep links: ?q=brie  ?q=drink:pinot-noir  ?check=brie,fig-jam
  const p = new URLSearchParams(location.search);
  if (p.get("check")) {
    setMode("check", true);
    picks = p.get("check").split(",").filter((id) => ent(id).i || ent(id).d).slice(0, 5);
    renderCheck();
  } else if (p.get("q") && (ent(p.get("q")).i || ent(p.get("q")).d)) {
    show(p.get("q"));
  }
}

// ------------------------------------------------------- Combination Lab ---
// /pairings/classics/ (15 Nov 2026): kind chips, selects, search, Surprise me,
// in-season row, print one card or every card shown. Filters deep-link:
// ?kind=trios&season=holiday&occ=brunch&diet=gluten-free&price=$&rule=acid&level=easy&q=honey
function lab() {
  const cards = $$(".lab-cards > .lab-card");
  if (!cards.length) return;
  const chips = $$("[data-lfilter]");
  const q = $("#lab-q");
  const sels = { season: $("#lab-season-f"), occ: $("#lab-occ"), diet: $("#lab-diet"), price: $("#lab-price"), rule: $("#lab-rule"), level: $("#lab-level") };
  const count = $("#lab-count"), empty = $("#lab-empty");
  const has = (list, v) => (list || "").split(" ").includes(v);
  const apply = () => {
    const kind = chips.find((b) => b.getAttribute("aria-pressed") === "true")?.dataset.lfilter || "all";
    const words = norm(q?.value || "").split(" ").filter(Boolean);
    const v = Object.fromEntries(Object.entries(sels).map(([k, el]) => [k, el?.value || ""]));
    let shown = 0;
    cards.forEach((li) => {
      const d = li.dataset;
      const ok = (kind === "all" || d.kind === kind)
        && words.every((w) => norm(d.search).includes(w))
        && (!v.season || has(d.season, v.season))
        && (!v.occ || has(d.occ, v.occ))
        && (!v.diet || has(d.diet, v.diet))
        && (!v.price || d.price.length <= v.price.length)
        && (!v.rule || d.rule === v.rule)
        && (!v.level || d.level === v.level);
      li.hidden = !ok;
      if (ok) shown++;
    });
    $$("[data-kind-section]").forEach((sec) => (sec.hidden = !$$(".lab-card:not([hidden])", sec).length));
    if (count) count.textContent = shown === cards.length ? `Showing all ${cards.length}` : `Showing ${shown} of ${cards.length}`;
    if (empty) empty.hidden = shown > 0;
    const p = new URLSearchParams();
    if (kind !== "all") p.set("kind", kind);
    Object.entries(v).forEach(([k, val]) => val && p.set(k, val));
    if (q?.value) p.set("q", q.value);
    history.replaceState(null, "", `${location.pathname}${p.toString() ? `?${p}` : ""}${location.hash}`);
  };
  chips.forEach((b) => b.addEventListener("click", () => { pressGroup(chips, b); apply(); }));
  q?.addEventListener("input", apply);
  Object.values(sels).forEach((el) => el?.addEventListener("change", apply));
  // deep links
  const p = new URLSearchParams(location.search);
  const kc = chips.find((b) => b.dataset.lfilter === p.get("kind"));
  if (kc) pressGroup(chips, kc);
  Object.entries(sels).forEach(([k, el]) => { if (el && p.get(k) && [...el.options].some((o) => o.value === p.get(k))) el.value = p.get(k); });
  if (q && p.get("q")) q.value = p.get("q");
  if ([...p.keys()].length) apply();

  $("#lab-reset")?.addEventListener("click", () => {
    pressGroup(chips, chips[0]);
    Object.values(sels).forEach((el) => el && (el.value = ""));
    if (q) q.value = "";
    apply();
  });
  const flash = (li) => {
    $$("details", li).forEach((d) => (d.open = true));
    li.scrollIntoView({ behavior: "smooth", block: "center" });
    li.classList.remove("is-flash"); void li.offsetWidth; li.classList.add("is-flash");
  };
  $("#lab-surprise")?.addEventListener("click", () => {
    const pool = cards.filter((li) => !li.hidden);
    if (pool.length) flash(pool[Math.floor(Math.random() * pool.length)]);
  });
  // ladder steps and #c- links open the card they point to
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#c-"]');
    if (!a) return;
    const li = document.getElementById(a.getAttribute("href").slice(1));
    if (!li) return;
    e.preventDefault();
    if (li.hidden) $("#lab-reset")?.click();
    history.replaceState(null, "", a.getAttribute("href"));
    flash(li);
  });
  if (location.hash.startsWith("#c-")) { const li = document.getElementById(location.hash.slice(1)); if (li) setTimeout(() => flash(li), 300); }

  // print: one card, or every card currently shown
  const printWith = (mark) => {
    const sheet = document.createElement("div");
    sheet.id = "lab-print-sheet";
    sheet.innerHTML = `<p class="lab-print-head">Charcuterie Lab · Combination Lab · charcuterielab.com/pairings/classics/</p>`;
    const ul = document.createElement("ul");
    ul.className = "lab-print-cards";
    mark.forEach((li) => {
      const c = li.cloneNode(true);
      c.removeAttribute("id");
      $$("details", c).forEach((d) => (d.open = true));
      $$(".pr-combo-links, .lab-print", c).forEach((x) => x.remove());
      ul.append(c);
    });
    sheet.append(ul);
    document.body.append(sheet);
    document.body.classList.add("lab-printing");
    const done = () => { document.body.classList.remove("lab-printing"); sheet.remove(); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-print]");
    if (b) printWith([document.getElementById(b.dataset.print)].filter(Boolean));
  });
  $("#lab-print-all")?.addEventListener("click", () => printWith(cards.filter((li) => !li.hidden)));

  // in season now: up to 8 cards whose season matches today's date
  const box = $("#lab-season"), list = $("#lab-season-list");
  if (box && list) {
    const m = new Date().getMonth() + 1;
    const now = m === 12 ? ["holiday", "winter"] : m <= 2 ? ["winter"] : m <= 5 ? ["spring"] : m <= 8 ? ["summer"] : m <= 10 ? ["fall"] : ["holiday", "fall"];
    const score = (li) => now.reduce((n, s, i) => n + (has(li.dataset.season, s) ? (i === 0 ? 3 : 1) : 0), 0) + (li.dataset.kind === "plates" ? 1 : 0) + (li.dataset.featured ? 1 : 0);
    const picks = cards.filter((li) => score(li) >= 3).sort((a, b) => score(b) - score(a)).slice(0, 8);
    if (picks.length >= 3) {
      const names = { holiday: "the holidays", winter: "winter", spring: "spring", summer: "summer", fall: "fall" };
      $("#lab-season-note").textContent = `Combinations for ${names[now[0]]}, picked by today's date.`;
      picks.forEach((li) => {
        const c = li.cloneNode(true);
        c.removeAttribute("id");
        c.classList.remove("lab-card");
        $$("details, .lab-print", c).forEach((x) => x.remove());
        list.append(c);
      });
      box.hidden = false;
    }
  }
}

// ------------------------------------------------- meat & cheese chart ---
// /pairings/meat-and-cheese-chart/ (15 Nov 2026): tap a square for the reason
// and proven pairs; tap a row or column head to highlight it; print the chart.
function mcChart() {
  const t = $("#mc-chart");
  if (!t) return;
  let data = {};
  try { data = JSON.parse($("#mc-data").textContent); } catch {}
  const panel = $("#mc-panel");
  const clear = () => $$(".is-hl, .is-on", t).forEach((el) => el.classList.remove("is-hl", "is-on"));
  t.addEventListener("click", (e) => {
    const b = e.target.closest("[data-mc]");
    if (b) {
      const d = data[b.dataset.mc];
      clear();
      b.classList.add("is-on");
      const [m, c] = b.dataset.mc.split("|");
      $$(`[data-mcol="${c}"]`, t).forEach((el) => el.classList.add("is-hl"));
      $(`tr[data-mrow="${m}"]`, t)?.classList.add("is-hl");
      if (d && panel) {
        panel.innerHTML = `<p class="mc-panel-h"><span class="mc-chip ${b.className.match(/mc-s\d/)[0]}">${esc(d.s)}</span> <strong>${esc(d.t)}</strong></p><p>${esc(d.w)}</p>${d.p.length ? `<p class="mc-proven">Proven in our ingredient guides: ${d.p.map(esc).join(", ")}${d.q ? ` · <a href="${esc(d.q)}">Check or complete this bite &rarr;</a>` : ""}</p>` : ""}<p><a class="pr-more" href="#mc-${esc(m)}">All cheeses for this meat &darr;</a></p>`;
        panel.hidden = false;
      }
    }
  });
  $("[data-mc-print]")?.addEventListener("click", () => {
    const sheet = document.createElement("div");
    sheet.id = "mc-print-sheet";
    sheet.innerHTML = `<h1>Meat and cheese pairing chart</h1>${$(".mc-legend")?.outerHTML || ""}${t.closest(".mc-wrap").outerHTML}<p class="mc-print-foot">charcuterielab.com/pairings/meat-and-cheese-chart/</p>`;
    document.body.append(sheet);
    document.body.classList.add("mc-printing");
    const done = () => { document.body.classList.remove("mc-printing"); sheet.remove(); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
  });
}

// ---------------------------------------------- wine & cheese chart extras ---
// /pairings/wine-and-cheese-chart/ (15 Nov 2026): tap a dot for its reason
// (hover only worked on desktop) and "Find a wine for your cheese".
function wcChart() {
  const t = $("#pr-chart"), panel = $("#wc-panel");
  if (!t || !panel) return;
  t.addEventListener("click", (e) => {
    const td = e.target.closest("td[data-why]");
    if (!td) return;
    panel.innerHTML = `<p class="mc-panel-h"><strong>${esc(td.dataset.tip)}</strong></p><p>${esc(td.dataset.why)}</p><p><a class="pr-more" href="${esc(td.dataset.href)}">Everything that goes with this wine &rarr;</a></p>`;
    panel.hidden = false;
  });
  let data = {};
  try { data = JSON.parse($("#wc-data").textContent); } catch {}
  const sel = $("#wc-cheese"), out = $("#wc-result");
  const show = () => {
    const d = data[sel.value];
    if (!d) { out.innerHTML = ""; return; }
    const wines = d.y.filter((x) => x[3] !== "beer"), beers = d.y.filter((x) => x[3] === "beer");
    out.innerHTML = `<ul class="mc-rows">${wines.map(([n, u, why]) => `<li><span class="mc-chip mc-s3">Pour</span> <a href="${esc(u)}"><strong>${esc(n)}</strong></a>: ${esc(why)}</li>`).join("")}${beers.map(([n, u, why]) => `<li><span class="mc-chip mc-s2">Beer</span> <a href="${esc(u)}"><strong>${esc(n)}</strong></a>: ${esc(why)}</li>`).join("")}${d.n.map(([n, u, why]) => `<li><span class="mc-chip mc-s0">Skip</span> <a href="${esc(u)}"><strong>${esc(n)}</strong></a>: ${esc(why)}</li>`).join("")}</ul><p><a class="pr-more" href="${esc(d.u)}">Everything that goes with ${esc(d.t)} &rarr;</a></p>`;
    const p = new URLSearchParams(location.search); p.set("cheese", sel.value); history.replaceState(null, "", `${location.pathname}?${p}`);
  };
  sel?.addEventListener("change", show);
  const q = new URLSearchParams(location.search).get("cheese");
  if (q && data[q]) { sel.value = q; show(); }
}

// ------------------------------------------------- shopping list gate ---
// "Shopping list" on Lab cards and checked bites (15 Nov 2026): a subscriber
// goes straight to /pairings/list/; anyone else gets a one-field email form in
// place, and the list opens as soon as they're signed up. Posts to the same
// /api/subscribe as every other form on the site.
function plateList() {
  let panel = null;
  const subbed = () => { try { return !!localStorage.getItem("cl-sub"); } catch (e) { return false; } };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-plate-list]");
    if (!a || subbed() || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (panel) panel.remove();
    panel = document.createElement("div");
    panel.className = "pl-gate";
    panel.innerHTML = `<p class="pl-gate-t"><strong>Get this plate's shopping list</strong> Amounts for 8, what to pour and how to build the bite, ready to print. Free, then a star ingredient and its pairings every Wednesday in the Lab Report.</p>
      <form class="pl-gate-f" novalidate><label class="sr-only" for="pl-gate-e">Email address</label><input id="pl-gate-e" type="email" name="email" placeholder="Your email address" autocomplete="email" inputmode="email" required><input class="qs-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><button type="submit" class="button primary">Show my list</button></form>
      <p class="pl-gate-n" aria-live="polite">Leave any time. <a href="${esc(a.getAttribute("href"))}" data-skip>No thanks, just show the list</a></p>`;
    (a.closest("p") || a).insertAdjacentElement("afterend", panel);
    const f = $("form", panel), i = $("input[type=email]", panel), b = $("button", panel), n = $(".pl-gate-n", panel);
    i.focus({ preventScroll: true });
    f.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const v = i.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { n.textContent = "Please enter a full email address, like name@example.com."; i.focus(); return; }
      b.disabled = true; b.textContent = "Sending\u2026";
      fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: v, page: location.pathname, website: f.website.value }) })
        .then((r) => r.json().catch(() => ({ ok: false })))
        .then((j) => {
          if (!j.ok) throw j;
          try { localStorage.setItem("cl-sub", "1"); } catch (e2) {}
          n.innerHTML = `You're in. <a class="button primary" href="${esc(a.getAttribute("href"))}">Open my shopping list</a>`;
          f.hidden = true;
          location.href = a.getAttribute("href");
        })
        .catch(() => { b.disabled = false; b.textContent = "Show my list"; n.innerHTML = `That didn't go through. <a href="${esc(a.getAttribute("href"))}">Open the list anyway</a>.`; });
    });
  });
}

filters();
plateList();
lab();
mcChart();
wcChart();
chart();
season();
finder();
