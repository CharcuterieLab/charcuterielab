// Charcuterie Lab - Diet Checker (/dietary/)
// Loads /assets/dietary-data.json and sorts every ingredient into Safe /
// Check the label / Skip for the diets picked. Deep links: ?d=vegan,nut-free&g=20
const root = document.querySelector(".dt-checker");
const out = document.getElementById("dt-result");
const qIn = document.getElementById("dt-q");
const gIn = document.getElementById("dt-guests");
const NAMES = ["Safe", "Check the label", "Skip"];
const CLS = ["dt-safe", "dt-check", "dt-skip"];
let D = null;
const state = { diets: [], q: "", guests: 12 };

const h = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const list = (a) => (a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);

function verdict(item) {
  // worst verdict across the chosen diets, with the reasons behind it
  let worst = 0;
  const why = [];
  state.diets.forEach((k) => {
    const at = D.diets.findIndex((d) => d.key === k);
    const v = item[3][at];
    if (v > worst) { worst = v; why.length = 0; }
    if (v === worst && v > 0) why.push(`${D.diets[at].label}: ${D.reasons[item[4][at]]}`);
  });
  if (worst === 0 && state.diets.length) {
    const at = D.diets.findIndex((d) => d.key === state.diets[0]);
    why.push(D.reasons[item[4][at]]);
  }
  return [worst, [...new Set(why)]];
}

function stations(n) {
  return n < 20 ? 1 : n <= 30 ? 2 : n <= 50 ? 3 : 4;
}

function advice() {
  const d = state.diets;
  const n = state.guests;
  const strict = d.filter((k) => k === "gluten-free" || k === "nut-free");
  const tips = [];
  if (strict.length) tips.push(`<strong>${list(strict.map((k) => D.diets.find((x) => x.key === k).label))}:</strong> build that part first with clean hands and knives, and give it its own plate.`);
  if (d.includes("vegan") && d.includes("nut-free")) tips.push("<strong>Vegan + nut-free:</strong> most plant cheeses are nut-based, so center the vegan side on hummus, baba ganoush and marinated vegetables.");
  if (d.includes("gluten-free") && d.includes("nut-free")) tips.push("<strong>Gluten-free + nut-free:</strong> skip Nut-Thins and almond-flour crackers; use rice or cassava crackers labeled gluten-free.");
  if (d.includes("vegetarian") || d.includes("vegan")) tips.push("<strong>Labels:</strong> put a card on every cheese and spread so guests don't have to ask.");
  const s = stations(n);
  tips.push(`<strong>${n} guests:</strong> ${s === 1 ? "one board" : `${s} stations`}${strict.length ? (s === 1 ? " plus a small safe plate" : ", one of them the allergy-safe station") : ""}. <a href="/party-planner/">Amounts in the Party Planner</a>.`);
  return tips;
}

function render() {
  root.querySelectorAll("[data-diet]").forEach((b) => b.setAttribute("aria-pressed", state.diets.includes(b.dataset.diet)));
  if (!state.diets.length) {
    out.innerHTML = `<p class="dt-hint">Choose one or more diets above.</p>`;
    return;
  }
  const q = state.q.trim().toLowerCase();
  const groups = [[], [], []];
  D.items.forEach((it) => {
    if (q && it[1].toLowerCase().indexOf(q) === -1 && it[0].indexOf(q.replace(/\s+/g, "-")) === -1) return;
    const [v, why] = verdict(it);
    groups[v].push([it, why]);
  });
  const total = groups.reduce((a, g) => a + g.length, 0);
  const build = `/board-builder/?d=${state.diets.join(",")}&g=${state.guests}&utm_source=charcuterielab&utm_medium=site&utm_campaign=diet_checker`;
  const pages = [...new Set(state.diets.map((k) => D.diets.find((d) => d.key === k)).map((d) => d.page))];
  out.innerHTML = `
    <div class="dt-summary">
      <p>${q ? `${total} match${total === 1 ? "" : "es"} for "${h(state.q)}". ` : ""}<span class="dt-badge dt-safe">${groups[0].length} safe</span> <span class="dt-badge dt-check">${groups[1].length} check</span> <span class="dt-badge dt-skip">${groups[2].length} skip</span></p>
      <a class="button primary" href="${build}">Build this board for ${state.guests} guests</a>
    </div>
    <ul class="dt-advice">${advice().map((t) => `<li>${t}</li>`).join("")}</ul>
    ${groups.map((g, v) => g.length ? `<details class="dt-group ${CLS[v]}"${v < 2 || q ? " open" : ""}>
      <summary><span class="dt-badge ${CLS[v]}">${NAMES[v]}</span> ${g.length} ingredient${g.length === 1 ? "" : "s"}</summary>
      ${D.cats.map((c, ci) => { const rows = g.filter(([it]) => it[2] === ci); return rows.length ? `<h4>${h(c)} <span>${rows.length}</span></h4><ul class="dt-items">${rows.map(([it, why]) => `<li><a href="/ingredients/${it[0]}/">${h(it[1])}</a>${v > 0 || q ? `<span class="dt-why">${h(why.join(" "))}</span>` : ""}</li>`).join("")}</ul>` : ""; }).join("")}
    </details>` : "").join("")}
    <p class="dt-hint">Full guides: ${pages.map((p) => `<a href="${p}">${h(D.diets.find((d) => d.page === p).label)}</a>`).join(" · ")}. Verdicts are a starting point; read the label for a serious allergy.</p>`;
}

function syncUrl() {
  try {
    const p = new URLSearchParams();
    if (state.diets.length) p.set("d", state.diets.join(","));
    if (state.guests !== 12) p.set("g", state.guests);
    history.replaceState(null, "", location.pathname + (p.toString() ? `?${p}` : "") + location.hash);
  } catch (e) { /* ignore */ }
}

function boot(data) {
  D = data;
  const p = new URLSearchParams(location.search);
  state.diets = (p.get("d") || "").split(",").filter((k) => D.diets.some((d) => d.key === k));
  const g = parseInt(p.get("g"), 10);
  if (g >= 2 && g <= 200) state.guests = g;
  gIn.value = state.guests;
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-diet]");
    if (!b) return;
    const k = b.dataset.diet;
    state.diets = state.diets.includes(k) ? state.diets.filter((x) => x !== k) : [...state.diets, k];
    render();
    syncUrl();
  });
  qIn.addEventListener("input", () => { state.q = qIn.value; render(); });
  gIn.addEventListener("change", () => {
    const n = parseInt(gIn.value, 10);
    state.guests = n >= 2 && n <= 200 ? n : 12;
    gIn.value = state.guests;
    render();
    syncUrl();
  });
  render();
}

fetch(root.dataset.src, { credentials: "same-origin" })
  .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
  .then(boot)
  .catch(() => { out.innerHTML = `<p class="dt-hint">The checker couldn't load. Refresh to try again, or use the diet guides below.</p>`; });
