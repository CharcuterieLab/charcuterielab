// Pairings Hub - one small script for every /pairings/ page.
// Hub: Pairing Finder ("What goes with..." and "Do these go together?").
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
    else { if (!picks.includes(id) && picks.length < 4) picks.push(id); renderCheck(); }
  }

  $$(".pr-tab").forEach((t) => t.addEventListener("click", () => setMode(t.dataset.mode)));
  function setMode(m, silent) {
    mode = m;
    $$(".pr-tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.mode === m ? "true" : "false"));
    input.placeholder = m === "find" ? "Try brie, prosciutto, Pinot Noir, IPA…" : "Add 2 to 4 foods or drinks…";
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

  function renderCheck(combo) {
    url(picks.length ? `?check=${picks.map(encodeURIComponent).join(",")}` : "");
    const chips = picks.map((id) => `<li><span>${esc(label(id))}</span><button type="button" data-remove="${esc(id)}" aria-label="Remove ${esc(label(id))}">&times;</button></li>`).join("");
    if (picks.length < 2) {
      result.innerHTML = `<ul class="pr-picks">${chips}</ul><p class="pr-rhint">${picks.length ? "Add one more food or drink to check the pairing." : "Add 2 to 4 foods or drinks with the search box, or hit <strong>Surprise me</strong>."}</p>`;
      return;
    }
    const pairs = [];
    for (let a = 0; a < picks.length; a++) for (let b = a + 1; b < picks.length; b++) pairs.push([picks[a], picks[b], linked(picks[a], picks[b])]);
    const ok = pairs.filter((p) => p[2]).length;
    const verdict = ok === pairs.length ? ["yes", "Yes, these all go together."] : ok >= pairs.length / 2 ? ["mostly", `Mostly: ${ok} of ${pairs.length} pairs are proven matches.`] : ok ? ["maybe", `A stretch: only ${ok} of ${pairs.length} pairs are proven matches.`] : ["no", "No proven match here. Try one of the bridges below."];
    const foods = picks.filter((id) => !id.startsWith("drink:")).map((id) => bySlug.get(id)).filter(Boolean);
    const count = new Map();
    for (const f of foods) for (const n of f.pairs) if (!picks.includes(I[n].slug)) count.set(n, (count.get(n) || 0) + 1);
    const bridges = [...count].filter(([, c]) => c >= Math.max(2, foods.length - 1) || foods.length === 1).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n]) => I[n]);
    result.innerHTML = `
      <ul class="pr-picks">${chips}</ul>
      <p class="pr-verdict pr-verdict-${verdict[0]}">${verdict[1]}</p>
      ${combo ? `<p class="pr-rhint"><strong>${esc(combo[1])}:</strong> ${esc(combo[2])}</p>` : ""}
      <ul class="pr-pairs">${pairs.map(([a, b, why]) => `<li class="${why ? "is-yes" : "is-no"}"><strong>${esc(label(a))} + ${esc(label(b))}</strong><span>${why ? esc(why) : "Not a listed pairing. It may still work, but nothing here backs it up."}</span></li>`).join("")}</ul>
      ${bridges.length && picks.length < 4 ? `<h3>${ok === pairs.length ? "Add a fourth" : "Bridges"}: goes with ${foods.length > 1 ? "most of these" : "this"}</h3><ul class="pr-rgrid pr-rgrid-sm">${bridges.map((p) => `<li class="pr-rcard"><button type="button" data-add="${esc(p.slug)}">${thumb(p)}<strong>+ ${esc(p.title)}</strong></button></li>`).join("")}</ul>` : ""}
      ${foods.length ? `<p class="pr-ractions"><a class="button primary" href="${builder(foods.map((f) => f.slug), "finder_check")}">Build a board with ${foods.length > 1 ? "these" : "this"}</a></p>` : ""}`;
  }

  result.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) { setMode("find", true); return show(go.dataset.go); }
    const add = e.target.closest("[data-add]");
    if (add) { if (picks.length < 4) picks.push(add.dataset.add); return renderCheck(); }
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
    picks = p.get("check").split(",").filter((id) => ent(id).i || ent(id).d).slice(0, 4);
    renderCheck();
  } else if (p.get("q") && (ent(p.get("q")).i || ent(p.get("q")).d)) {
    show(p.get("q"));
  }
}

filters();
chart();
season();
finder();
