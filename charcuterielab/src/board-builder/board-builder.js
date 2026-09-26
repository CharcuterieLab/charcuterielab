/* Charcuterie Lab - Board Builder page.
 * People add ingredients by category, ask for recommendations, read advice as
 * they go, then say how many people it's for and get a free shopping list with
 * prep and presentation steps, next to a newsletter sign-up.
 * Scoring, advice, amounts and presentation live in board-logic.js.
 * Progress is kept in localStorage. */
import { createBoard, DIETS } from "./board-logic.js";

const root = document.getElementById("bb");
const app = document.getElementById("bb-app");
const bar = document.getElementById("bb-bar");
const picker = document.getElementById("bb-picker");

const STORE = "cl-board-builder-v2";
const SUBSCRIBED = "cl-lab-report-subscribed";
const RECS_PAGE = 6;

let B = null;
let B_data = null;
let state = fresh();
const ui = { recsOpen: false, recs: [], recsShown: RECS_PAGE, recsStale: false, pickerCat: null, pickerOrder: [], prep: null, prepLoading: false };

function fresh() {
  return { v: 2, picks: [], diets: [], guests: 8, mode: "app", view: "build" };
}

function h(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* private mode */ }
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "null");
    if (raw && raw.v === 2) return Object.assign(fresh(), raw);
  } catch (e) { /* ignore */ }
  return null;
}

const picks = () => B.get(state.picks);
const isPicked = (slug) => state.picks.indexOf(slug) !== -1;
const catOf = (item) => B.catOf(item);
const art = (item) => B.cats[item.c];

// ------------------------------------------------------------------ board art

const FRUIT_COLORS = [
  [/champagne-grapes|^grapes/, "#6f3b68"], [/berries/, "#b3243c"], [/cherr/, "#9b1b30"], [/apple/, "#c9d36c"],
  [/pear/, "#cdd578"], [/fig/, "#7a3e55"], [/orange|mandarin|kumquat|grapefruit|citrus/, "#ef922a"],
  [/date|prune/, "#5e3321"], [/apricot|mango|peach|persimmon|physalis|passion/, "#eca040"], [/melon/, "#f2b27f"],
  [/kiwi/, "#86ad45"], [/pomegranate|cranberr/, "#b01f36"], [/raisin/, "#c28a3a"], [/pineapple/, "#f0cf4c"],
  [/plum/, "#6a2a55"], [/dragon/, "#d8407a"]
];
const SPREAD_COLORS = [
  [/honey/, "#e7a927"], [/mustard/, "#d6ae34"], [/chocolate/, "#5a3620"], [/pesto/, "#6f8f3a"],
  [/hummus|baba|labneh|tzatziki|whipped|pimento/, "#ead9b8"], [/harissa|ajvar|muhammara|romesco|pepper-jelly|tomato/, "#c0432b"],
  [/lemon|marmalade|apricot|mango/, "#eaa43a"], [/tapenade/, "#3f3a2c"], [/butter|membrillo|onion|bacon/, "#9a4b2a"]
];

const colorFor = (list, slug, fallback) => (list.find((x) => x[0].test(slug)) || [0, fallback])[1];

function shapeCheese(item) {
  const r = item.r;
  if (r === "Soft & fresh" || r === "Washed-rind") {
    const fill = r === "Washed-rind" ? "#e3a25a" : "#fbf5e6";
    return `<circle r="36" fill="${fill}" stroke="#e2d4b4" stroke-width="3"/><path d="M0 0 L36 0 A36 36 0 0 1 18 31 Z" fill="#fffaf0" stroke="#e2d4b4" stroke-width="2"/>`;
  }
  if (r === "Goat & sheep") {
    return `<rect x="-44" y="-17" width="88" height="34" rx="17" fill="#f7f1e2" stroke="#ddd0b3" stroke-width="3"/><circle cx="-28" cy="0" r="14" fill="#fffdf6" stroke="#ddd0b3" stroke-width="2"/>`;
  }
  const fill = r === "Blue" ? "#ece6d4" : r === "Aged & hard" ? "#e8b84a" : r === "Plant-based" ? "#efe4c8" : "#f2cf6e";
  const specks = r === "Blue"
    ? `<circle cx="-12" cy="10" r="3.5" fill="#56708a"/><circle cx="8" cy="0" r="3" fill="#56708a"/><circle cx="18" cy="16" r="3.5" fill="#56708a"/><circle cx="-24" cy="18" r="2.5" fill="#56708a"/>`
    : r === "Aged & hard"
      ? `<circle cx="-10" cy="12" r="1.8" fill="#fff4d0"/><circle cx="10" cy="4" r="1.8" fill="#fff4d0"/><circle cx="20" cy="18" r="1.8" fill="#fff4d0"/>`
      : `<circle cx="-8" cy="12" r="4" fill="#e3b650"/><circle cx="14" cy="6" r="3" fill="#e3b650"/>`;
  return `<path d="M-48 26 L44 26 L30 -34 Z" fill="${fill}" stroke="#c79a3c" stroke-width="3" stroke-linejoin="round"/>${specks}
    <rect x="22" y="30" width="16" height="14" rx="2" fill="${fill}" stroke="#c79a3c" stroke-width="2" transform="rotate(8 30 37)"/>
    <rect x="-40" y="31" width="16" height="14" rx="2" fill="${fill}" stroke="#c79a3c" stroke-width="2" transform="rotate(-10 -32 38)"/>`;
}

function shapeMeat(item) {
  if (item.r === "Smoked & tinned fish") {
    return `<path d="M-44 -10 C-20 -30 10 10 44 -12 L44 4 C10 26 -20 -14 -44 6 Z" fill="#ef8a60"/><path d="M-44 10 C-20 -10 10 30 44 8 L44 24 C10 46 -20 6 -44 26 Z" fill="#f29b73"/><path d="M-36 -6 L36 -6 M-36 14 L36 14" stroke="#fbd0b9" stroke-width="1.5"/>`;
  }
  if (item.r === "Spreadable") {
    return `<circle r="32" fill="#fffaf0" stroke="#d8c9ab" stroke-width="3"/><circle r="24" fill="#9a5a3c"/><path d="M-8 -6 h16" stroke="#b77756" stroke-width="3" stroke-linecap="round"/>`;
  }
  const fill = /prosciutto|jamon|serrano|bayonne|speck|culatello|ham|bresaola|coppa|lomo/.test(item.s) ? "#d4707a" : "#b9434e";
  let out = "";
  for (let k = 0; k < 7; k += 1) {
    const ang = (k / 7) * Math.PI * 2;
    const x = Math.cos(ang) * 22;
    const y = Math.sin(ang) * 18;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="17" fill="${fill}" stroke="#8e2f38" stroke-width="1.5"/><circle cx="${(x + 4).toFixed(1)}" cy="${(y - 3).toFixed(1)}" r="2.2" fill="#f4d6d0"/>`;
  }
  return out + `<circle r="12" fill="${fill}" stroke="#8e2f38" stroke-width="1.5"/>`;
}

function shapeCracker(item) {
  let out = "";
  const bread = item.r === "Bread";
  const dark = /charcoal|pumpernickel|chocolate|rye/.test(item.s);
  const fill = dark ? "#5b4636" : bread ? "#ecd09b" : "#e2bd80";
  const stroke = dark ? "#3b2c21" : bread ? "#b07a3b" : "#c29352";
  for (let k = 0; k < 6; k += 1) {
    const x = -40 + k * 15;
    out += bread
      ? `<ellipse cx="${x}" cy="0" rx="15" ry="26" fill="${fill}" stroke="${stroke}" stroke-width="3" transform="rotate(${-10 + k * 4} ${x} 0)"/>`
      : `<rect x="${x - 14}" y="-24" width="28" height="48" rx="${item.r === "Neutral base" ? 14 : 4}" fill="${fill}" stroke="${stroke}" stroke-width="2" transform="rotate(${-12 + k * 5} ${x} 0)"/><circle cx="${x}" cy="-8" r="1.3" fill="${stroke}"/><circle cx="${x}" cy="8" r="1.3" fill="${stroke}"/>`;
  }
  return out;
}

function shapeFruit(item, small) {
  const fill = colorFor(FRUIT_COLORS, item.s, "#b24d6b");
  const n = small ? 7 : 11;
  let out = "";
  for (let k = 0; k < n; k += 1) {
    const ang = k * 2.4;
    const rad = (small ? 5 : 7) * Math.sqrt(k);
    const r = small ? 7.5 : 10;
    out += `<circle cx="${(Math.cos(ang) * rad).toFixed(1)}" cy="${(Math.sin(ang) * rad).toFixed(1)}" r="${r}" fill="${fill}" stroke="rgba(0,0,0,.18)" stroke-width="1"/><circle cx="${(Math.cos(ang) * rad - 3).toFixed(1)}" cy="${(Math.sin(ang) * rad - 3).toFixed(1)}" r="2" fill="rgba(255,255,255,.45)"/>`;
  }
  return out;
}

function shapeBowl(inner) {
  return `<circle r="34" fill="#fffaf0" stroke="#d6c7a8" stroke-width="3"/><circle r="27" fill="#f3ead8"/>${inner}`;
}

function shapeSpread(item) {
  const fill = colorFor(SPREAD_COLORS, item.s, "#8f2336");
  return shapeBowl(`<circle r="24" fill="${fill}"/><path d="M-6 -10 q10 4 14 14" stroke="rgba(255,255,255,.4)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 -14 L40 -40" stroke="#b9a37a" stroke-width="5" stroke-linecap="round"/>`);
}

function shapeBriny(item) {
  let inner = "";
  const fill = /kalamata|oil-cured|nicoise/.test(item.s) ? "#4a2a3a" : /pepper|peppadew|piquillo|tomato|beet|onion/.test(item.s) ? "#c9302c" : /pickle|cornichon|gherkin|bean|okra|jalap/.test(item.s) ? "#7c9a3c" : "#7b8a34";
  const pts = [[-10, -8], [8, -12], [-14, 8], [4, 4], [14, 12], [-2, 16], [16, -2]];
  pts.forEach((p) => {
    inner += `<ellipse cx="${p[0]}" cy="${p[1]}" rx="8" ry="6" fill="${fill}" stroke="rgba(0,0,0,.2)"/>`;
  });
  return shapeBowl(inner);
}

function shapeNuts(item) {
  const fill = /pistach|pumpkin/.test(item.s) ? "#9bb05a" : /cashew|macadamia|pine/.test(item.s) ? "#e6cf9c" : /wasabi/.test(item.s) ? "#9cc062" : "#a9713f";
  let out = "";
  for (let k = 0; k < 9; k += 1) {
    const ang = k * 2.4;
    const rad = 5.5 * Math.sqrt(k);
    out += `<ellipse cx="${(Math.cos(ang) * rad).toFixed(1)}" cy="${(Math.sin(ang) * rad).toFixed(1)}" rx="7" ry="4.6" transform="rotate(${k * 37} ${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)})" fill="${fill}" stroke="rgba(0,0,0,.25)"/>`;
  }
  return out;
}

function shapeFinish(item) {
  if (/chocolate|caramel|amaretti|biscotti|nibs|ginger/.test(item.s)) {
    const fill = /caramel|amaretti|biscotti|ginger/.test(item.s) ? "#c98a45" : "#4a2c1d";
    return `<rect x="-20" y="-14" width="16" height="14" rx="2" fill="${fill}"/><rect x="-2" y="-10" width="16" height="14" rx="2" fill="${fill}" transform="rotate(12 6 -3)"/><rect x="-12" y="4" width="16" height="14" rx="2" fill="${fill}" transform="rotate(-8 -4 11)"/>`;
  }
  if (/basil|mint|thyme|rosemary|flower/.test(item.s)) {
    const leaf = /flower/.test(item.s) ? "#d9669b" : "#4f8a3c";
    return `<path d="M-22 18 Q0 0 22 -18" stroke="#3f6d31" stroke-width="2.5" fill="none"/><ellipse cx="-10" cy="4" rx="8" ry="4" fill="${leaf}" transform="rotate(-40 -10 4)"/><ellipse cx="4" cy="-6" rx="8" ry="4" fill="${leaf}" transform="rotate(40 4 -6)"/><ellipse cx="14" cy="-14" rx="7" ry="3.5" fill="${leaf}" transform="rotate(-40 14 -14)"/><ellipse cx="-4" cy="10" rx="7" ry="3.5" fill="${leaf}" transform="rotate(40 -4 10)"/>`;
  }
  const fill = /chili|aleppo|pink/.test(item.s) ? "#c0392b" : /pepper|za-atar|everything/.test(item.s) ? "#4b4037" : /balsamic/.test(item.s) ? "#3a1f1f" : /oil/.test(item.s) ? "#c9b53a" : "#ffffff";
  let out = "";
  for (let k = 0; k < 14; k += 1) {
    const ang = k * 2.4;
    const rad = 4.5 * Math.sqrt(k);
    out += `<circle cx="${(Math.cos(ang) * rad).toFixed(1)}" cy="${(Math.sin(ang) * rad).toFixed(1)}" r="2" fill="${fill}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/>`;
  }
  return out;
}

function boardSvg(picks) {
  // 4 x 3 grid of main cells, plus 6 gap spots for small fillers
  const cells = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) cells.push({ x: 110 + col * 140, y: 88 + row * 122, used: false });
  }
  const gaps = [[180, 149], [320, 149], [460, 149], [180, 271], [320, 271], [460, 271], [40 + 30, 210], [640 - 70, 210]].map((p) => ({ x: p[0], y: p[1], used: false }));
  const prefer = {
    spreads: [5, 6, 1, 10],
    cheese: [0, 7, 8, 3, 11, 4],
    meat: [1, 10, 4, 6, 2, 9],
    briny: [2, 9, 11, 3],
    crackers: [4, 11, 3, 8, 9],
    fruit: [3, 8, 6, 2]
  };
  const groups = { cheese: [], meat: [], crackers: [], fruit: [], spreads: [], nuts: [], briny: [], finish: [] };
  picks.forEach((p) => groups[catOf(p).key].push(p));

  const placed = [];
  const fillers = [];
  const take = (list, pref) => {
    const idx = pref.concat(cells.map((_, i) => i)).find((i) => !cells[i].used);
    if (idx === undefined) return null;
    cells[idx].used = true;
    return cells[idx];
  };
  ["spreads", "cheese", "meat", "briny", "crackers", "fruit"].forEach((key) => {
    groups[key].forEach((item, n) => {
      if (key === "fruit" && n > 0) { fillers.push(item); return; }
      const cell = take(key, prefer[key]);
      if (cell) placed.push({ item, x: cell.x, y: cell.y, small: false });
      else fillers.push(item);
    });
  });
  groups.nuts.concat(groups.finish).forEach((item) => fillers.push(item));

  let hidden = 0;
  fillers.forEach((item) => {
    const spot = gaps.find((g) => !g.used);
    if (spot) {
      spot.used = true;
      placed.push({ item, x: spot.x, y: spot.y, small: true });
      return;
    }
    const cell = cells.find((c) => !c.used);
    if (cell) {
      cell.used = true;
      placed.push({ item, x: cell.x, y: cell.y, small: false });
    } else hidden += 1;
  });

  const draw = (p) => {
    const key = catOf(p.item).key;
    let body = "";
    if (key === "cheese") body = shapeCheese(p.item);
    else if (key === "meat") body = shapeMeat(p.item);
    else if (key === "crackers") body = shapeCracker(p.item);
    else if (key === "fruit") body = shapeFruit(p.item, p.small);
    else if (key === "spreads") body = shapeSpread(p.item);
    else if (key === "briny") body = shapeBriny(p.item);
    else if (key === "nuts") body = shapeNuts(p.item);
    else body = shapeFinish(p.item);
    const scale = p.small && (key === "cheese" || key === "meat" || key === "crackers" || key === "spreads" || key === "briny") ? 0.6 : 1;
    return `<g transform="translate(${p.x} ${p.y}) scale(${scale})"><title>${h(p.item.t)}</title>${body}</g>`;
  };

  const empty = picks.length ? "" : `<text x="320" y="216" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#fff4dc">Your board is empty</text>`;
  return `<svg class="bb-board-svg" viewBox="0 0 640 420" role="img" aria-label="Illustration of your board with ${picks.length} ingredients">
<defs>
  <linearGradient id="bbWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c99461"/><stop offset=".55" stop-color="#b57d47"/><stop offset="1" stop-color="#9c6536"/></linearGradient>
  <filter id="bbShadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#2a1a0c" flood-opacity=".28"/></filter>
</defs>
<rect x="14" y="16" width="612" height="390" rx="46" fill="url(#bbWood)" filter="url(#bbShadow)"/>
<path d="M40 90 C200 70 420 110 600 84 M36 170 C220 150 400 196 604 168 M38 262 C230 240 420 286 602 256 M44 344 C220 326 430 362 598 338" stroke="#a66f3c" stroke-width="2" fill="none" opacity=".45"/>
<rect x="14" y="16" width="612" height="390" rx="46" fill="none" stroke="#8a5a2f" stroke-width="3"/>
${placed.map(draw).join("")}
${empty}
${hidden ? `<text x="604" y="392" text-anchor="end" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#fff4dc">+${hidden} more</text>` : ""}
</svg>`;
}


// ------------------------------------------------------------------ pieces

function glyph(item, size) {
  const c = art(item);
  const inner = item.i ? `<img src="${h(item.i)}" alt="" loading="lazy">` : c.glyph;
  return `<span class="bb-thumb ${size || ""}" style="--tint:${c.tint}">${inner}</span>`;
}

function catGlyph(cat, size) {
  return `<span class="bb-thumb ${size || ""}" style="--tint:${cat.tint}">${cat.glyph}</span>`;
}

function chipsHtml(r) {
  return r.chips.length ? `<span class="bb-chips">${r.chips.map((c) => `<span class="bb-reason is-${c.kind}">${h(c.text)}</span>`).join("")}</span>` : "";
}

function ideaInner(item) {
  const on = isPicked(item.s);
  const r = B.reason(item, picks());
  return `${glyph(item)}
    <span class="bb-idea-body">
      <span class="bb-idea-cat">${h(catOf(item).label)}</span>
      <span class="bb-idea-title">${h(item.t)}</span>
      <span class="bb-idea-role">${h(item.b)}${item.p ? ` · <b>${h(item.p)}</b>` : ""}</span>
      ${chipsHtml(r)}
      ${r.why ? `<span class="bb-why">${h(r.why)}</span>` : ""}
    </span>
    <span class="bb-add-pill${on ? " is-on" : ""}" aria-hidden="true">${on ? "Added ✓" : "+ Add"}</span>`;
}

function ideaCard(item) {
  const on = isPicked(item.s);
  return `<li><button type="button" class="bb-idea${on ? " is-on" : ""}" data-toggle="${h(item.s)}" aria-pressed="${on}" aria-label="${h((on ? "Remove " : "Add ") + item.t)}">${ideaInner(item)}</button></li>`;
}

function refreshIdeas(scope) {
  scope.querySelectorAll("[data-toggle]").forEach((el) => {
    const item = B.bySlug.get(el.dataset.toggle);
    if (!item) return;
    const on = isPicked(item.s);
    el.classList.toggle("is-on", on);
    el.setAttribute("aria-pressed", String(on));
    el.setAttribute("aria-label", (on ? "Remove " : "Add ") + item.t);
    el.innerHTML = el.classList.contains("bb-row") ? rowInner(item) : ideaInner(item);
  });
}

// ------------------------------------------------------------------ build view

function boardSection() {
  const list = picks();
  const groups = B.cats.map((cat, idx) => {
    const items = list.filter((p) => p.c === idx);
    if (!items.length) return "";
    return `<li><span class="bb-group-cat">${h(cat.label)}</span><ul>${items.map((p) => `<li>${glyph(p, "sm")}<a href="/ingredients/${h(p.s)}/" target="_blank" rel="noopener">${h(p.t)}</a><button type="button" class="bb-x" data-remove="${h(p.s)}" aria-label="Remove ${h(p.t)}">×</button></li>`).join("")}</ul></li>`;
  }).join("");
  const starters = B.get(B_data.starters).filter((i) => B.allowed(i, state.diets)).slice(0, 6);
  return `<section class="bb-board" aria-labelledby="bb-board-title">
    <div class="bb-board-head">
      <h2 class="bb-h2" id="bb-board-title">Your board</h2>
      <span class="bb-pill">${list.length} ${list.length === 1 ? "ingredient" : "ingredients"}</span>
    </div>
    ${list.length ? `<div class="bb-board-art">${boardSvg(list)}</div>` : ""}
    ${list.length
      ? `<ul class="bb-groups">${groups}</ul>`
      : `<div class="bb-empty"><p>Nothing on it yet. Tap an "Add" button below, or start with one of these:</p>
         <div class="bb-quick">${starters.map((i) => `<button type="button" class="bb-chip" data-toggle-quick="${h(i.s)}">+ ${h(i.t)}</button>`).join("")}</div></div>`}
  </section>`;
}

function addSection() {
  const list = picks();
  return `<section class="bb-add" aria-labelledby="bb-add-title">
    <h3 class="bb-h3" id="bb-add-title">Add to your board</h3>
    <div class="bb-add-grid">${B.cats.map((cat, idx) => {
      const n = list.filter((p) => p.c === idx).length;
      const [min, max] = cat.target;
      const sub = n ? `${n} added` : min ? `Most boards: ${min === max ? min : `${min}–${max}`}` : "Optional";
      return `<button type="button" class="bb-add-btn${n ? " has" : ""}" data-open="${idx}">
        ${catGlyph(cat)}
        <span><strong>${h(cat.add)}</strong><small>${h(sub)}</small></span>
        <span class="bb-plus" aria-hidden="true">+</span>
      </button>`;
    }).join("")}</div>
    <div class="bb-diet">
      <span class="bb-label" id="bb-diet-label">Dietary needs</span>
      <div class="bb-quick" role="group" aria-labelledby="bb-diet-label">${DIETS.map((d) => {
        const on = state.diets.indexOf(d.key) !== -1;
        return `<button type="button" class="bb-chip${on ? " is-on" : ""}" data-diet="${d.key}" aria-pressed="${on}">${h(d.label)}</button>`;
      }).join("")}</div>
    </div>
  </section>`;
}

function recsSection() {
  if (!ui.recsOpen) {
    return `<section class="bb-recs" id="bb-recs" aria-labelledby="bb-recs-title">
      <div class="bb-recs-closed">
        <div><h3 class="bb-h3" id="bb-recs-title">Need ideas?</h3>
        <p>Get recommendations that pair with what's already on your board and fill what it's missing.</p></div>
        <button type="button" class="bb-btn primary" data-recs="open">Get recommendations</button>
      </div>
    </section>`;
  }
  const shown = B.get(ui.recs.slice(0, ui.recsShown));
  const more = ui.recs.length > ui.recsShown;
  return `<section class="bb-recs is-open" id="bb-recs" aria-labelledby="bb-recs-title">
    <div class="bb-recs-head">
      <h3 class="bb-h3" id="bb-recs-title">Recommended for your board</h3>
      ${ui.recsStale ? `<button type="button" class="bb-link" data-recs="refresh">Your board changed. Refresh ideas</button>` : `<button type="button" class="bb-link" data-recs="refresh">Refresh ideas</button>`}
    </div>
    ${shown.length ? `<ul class="bb-ideas">${shown.map(ideaCard).join("")}</ul>` : `<p class="bb-note">No more ideas fit your dietary needs.</p>`}
    <div class="bb-recs-actions">
      ${more ? `<button type="button" class="bb-btn" data-recs="more">More ideas</button>` : ""}
      <button type="button" class="bb-btn ghost" data-recs="close">Hide ideas</button>
    </div>
  </section>`;
}

function adviceSection() {
  const tips = B.advice(picks(), { diets: state.diets });
  const icon = { good: "✓", todo: "!", tip: "i" };
  const n = state.picks.length;
  return `<section class="bb-advice" aria-labelledby="bb-advice-title">
    <h3 class="bb-h3" id="bb-advice-title">Lab advice</h3>
    <ul class="bb-tips" aria-live="polite">${tips.map((t) => `<li class="is-${t.level}">
      <span class="bb-tip-icon" aria-hidden="true">${icon[t.level]}</span>
      <span>${h(t.text)}${t.category !== undefined ? ` <button type="button" class="bb-link" data-open="${t.category}">${h(B.cats[t.category].add)}</button>` : ""}</span>
    </li>`).join("")}</ul>
    <button type="button" class="bb-btn primary wide bb-done-side" data-view="finish" ${n ? "" : "disabled"}>Done: get my shopping list</button>
  </section>`;
}

function viewBuild() {
  return `<div class="bb-build">
    <div class="bb-col-main">${boardSection()}${addSection()}${recsSection()}</div>
    <aside class="bb-col-side">${adviceSection()}</aside>
  </div>`;
}

// ------------------------------------------------------------------ list view

function peopleText(n) {
  return `${n} ${n === 1 ? "person" : "people"}`;
}

function totalsLine() {
  const list = picks();
  const t = B.totals(list, state.guests, state.mode);
  const parts = [t.cheese && `${t.cheese} of cheese`, t.meat && `${t.meat} of meat`].filter(Boolean);
  return `${list.length} ingredients, ${state.mode === "meal" ? "as the meal" : state.mode === "main" ? "as the party food" : "as an appetizer"}${parts.length ? `: about ${parts.join(" and ")} in total` : ""}.`;
}

function subscribed() {
  try { return localStorage.getItem(SUBSCRIBED) === "1"; } catch (e) { return false; }
}

function newsCard(where) {
  if (subscribed()) {
    return where === "top" ? "" : `<aside class="bb-news is-done"><p><strong>You're on the list.</strong> The next Charcuterie Lab Report will land in your inbox. If you haven't yet, confirm your subscription in the tab that opened.</p></aside>`;
  }
  const top = where === "top";
  return `<aside class="bb-news${top ? " is-top" : ""}" aria-labelledby="bb-news-${where}">
    <div class="bb-news-copy">
      <p class="bb-news-kicker">Free newsletter · The Charcuterie Lab Report</p>
      <h3 id="bb-news-${where}">${top ? "Like this list? Get more boards like it, free." : "Want your next board idea in your inbox?"}</h3>
      <p>${top
        ? "One pairing that works and why, a board worth stealing, and new printables the day they land."
        : "Pairings that work and why, boards worth stealing, and new printables the day they land. Free, and you can leave any time."}</p>
    </div>
    <form class="bb-news-form" data-news action="${h(root.dataset.newsletter)}" method="get" target="_blank" rel="noopener" novalidate>
      <label class="sr-only" for="bb-news-email-${where}">Email address</label>
      <input id="bb-news-email-${where}" class="bb-input" name="email" type="email" autocomplete="email" placeholder="Email address" required>
      <input type="hidden" name="utm_source" value="charcuterielab">
      <input type="hidden" name="utm_medium" value="site">
      <input type="hidden" name="utm_campaign" value="board_builder_${where}">
      <button class="bb-btn primary" type="submit">Subscribe free</button>
      <p class="bb-news-error" hidden>Enter a valid email address, like name@example.com.</p>
    </form>
    <p class="bb-news-fine">Confirm in the tab that opens. No spam, unsubscribe any time. <a href="/privacy/">Privacy</a></p>
  </aside>`;
}

function shareUrl() {
  const base = location.origin && location.origin !== "null" ? location.origin + location.pathname : "https://charcuterielab.com/board-builder/";
  return `${base}?b=${encodeURIComponent(state.picks.join(","))}&g=${state.guests}&m=${state.mode}`;
}

// The book is the site's first product, so the finished shopping list offers
// it before the newsletter: the reader has just planned one board, the book
// has fifty. URLs and prices come from the page (set in build.mjs).
function bookCard() {
  const d = root.dataset;
  if (!d.ebook || !d.paperback) return "";
  return `<aside class="bb-book" aria-labelledby="bb-book-title">
    <img class="bb-book-cover" src="/images/book-cover.jpg" alt="" width="96" height="124" loading="lazy" decoding="async">
    <div class="bb-book-copy">
      <p class="bb-news-kicker">The Charcuterie Lab book</p>
      <h3 id="bb-book-title">Liked planning this one? Here are 50 more, already done.</h3>
      <p>Every board comes with its shopping list, pairing logic, substitutions and build order.</p>
      <div class="bb-book-actions">
        <a class="bb-btn primary" href="${h(d.ebook)}" target="_blank" rel="noopener">Get the ebook · ${h(d.ebookPrice)}</a>
        <a class="bb-btn" href="${h(d.paperback)}" target="_blank" rel="noopener">Paperback on Amazon · ${h(d.paperbackPrice)}</a>
      </div>
    </div>
  </aside>`;
}

function shareSection() {
  const url = shareUrl();
  const text = `The charcuterie board I built for ${peopleText(state.guests)} on Charcuterie Lab`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const pin = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent("https://charcuterielab.com/images/50-boards-01-classic-american-starter.webp")}&description=${encodeURIComponent(text)}`;
  return `<section class="bb-share" aria-labelledby="bb-share-title">
    <h3 class="bb-h3" id="bb-share-title">Share your board</h3>
    <p>Hosting together? Send this board to a friend. The link opens it exactly as you built it.</p>
    <div class="bb-share-row">
      ${typeof navigator.share === "function" ? `<button type="button" class="bb-btn" data-share="native">Share…</button>` : ""}
      <a class="bb-btn" href="${h(fb)}" target="_blank" rel="noopener">Facebook</a>
      <a class="bb-btn" href="${h(pin)}" target="_blank" rel="noopener">Pinterest</a>
      <button type="button" class="bb-btn" data-share="copy">Copy link</button>
    </div>
  </section>`;
}

function prepStep(step) {
  const [lead, rest] = step;
  const gap = /^[,.;:)]/.test(rest) ? "" : " ";
  return `<li><strong>${h(lead)}</strong>${rest ? gap + h(rest) : ""}</li>`;
}

function resultsHtml() {
  const list = picks();
  const groups = B.shoppingList(list, state.guests, state.mode);
  const present = B.presentation(list, state.guests);
  const whys = B.whyItWorks(list, 8);
  const prep = ui.prep ? B.prepFor(list, ui.prep) : null;
  return `<div class="bb-results-head">
      <div>
        <p class="bb-kicker-dark">Your shopping list</p>
        <h2 class="bb-h2" id="bb-results-title">Your board for ${h(peopleText(state.guests))}</h2>
        <p class="bb-hint">${h(totalsLine())}</p>
        <div class="bb-results-actions">
          <button type="button" class="bb-btn primary" data-print>Print or save as PDF</button>
          <button type="button" class="bb-btn ghost" data-view="build">Edit board</button>
        </div>
      </div>
      <div class="bb-board-art bb-results-art">${boardSvg(list)}</div>
    </div>

    ${newsCard("top")}

    <section class="bb-sec" aria-labelledby="bb-shop-title">
      <h3 class="bb-sec-title" id="bb-shop-title"><span>1</span>Shopping list</h3>
      <div class="bb-shop">${groups.map((g) => `<div class="bb-shop-group">
        <h4>${h(g.section)}</h4>
        <ul>${g.items.map((i) => `<li><label><input type="checkbox"><span class="bb-shop-name">${h(i.name)}<small>${h(i.role)}</small></span><span class="bb-shop-amt">${h(i.amount)}${i.note ? `<small>${h(i.note)}</small>` : ""}</span></label></li>`).join("")}</ul>
      </div>`).join("")}</div>
      <p class="bb-fine">Amounts are rounded. For a big group, buy a little extra cheese and crackers.</p>
    </section>

    <section class="bb-sec" aria-labelledby="bb-prep-title">
      <h3 class="bb-sec-title" id="bb-prep-title"><span>2</span>How to prepare each item</h3>
      ${prep === null
        ? `<p class="bb-note">Loading prep steps…</p>`
        : `<div class="bb-prep">${prep.map((p) => `<div class="bb-prep-item">
            <h4><a href="/ingredients/${h(p.slug)}/" target="_blank" rel="noopener">${h(p.name)}</a></h4>
            <ul>${p.steps.map(prepStep).join("")}</ul>
          </div>`).join("")}</div>`}
    </section>

    <section class="bb-sec" aria-labelledby="bb-present-title">
      <h3 class="bb-sec-title" id="bb-present-title"><span>3</span>How to present it</h3>
      <p class="bb-board-size"><strong>Board size:</strong> ${h(present.board)}</p>
      <ol class="bb-order">${present.steps.map((s) => `<li><strong>${h(s.label)}.</strong> ${h(s.text)}</li>`).join("")}</ol>
      <ul class="bb-present-tips">${present.tips.map((t) => `<li>${h(t)}</li>`).join("")}</ul>
      <p class="bb-fine"><a href="/blog/charcuterie-board-presentation/">More presentation tips →</a></p>
    </section>

    ${whys.length ? `<section class="bb-sec" aria-labelledby="bb-why-title">
      <h3 class="bb-sec-title" id="bb-why-title"><span>4</span>Why your pairings work</h3>
      <ul class="bb-whys">${whys.map((w) => `<li><strong>${h(w.a)} + ${h(w.b)}</strong><span>${h(w.text || "A pairing our ingredient pages recommend.")}</span></li>`).join("")}</ul>
    </section>` : ""}

    ${bookCard()}
    ${newsCard("bottom")}
    ${shareSection()}

    <div class="bb-end-actions">
      <button type="button" class="bb-btn" data-view="build">Edit this board</button>
      <button type="button" class="bb-btn ghost" data-restart>Start a new board</button>
    </div>`;
}

function viewFinish() {
  return `<section class="bb-finish">
    <button type="button" class="bb-link bb-back" data-view="build">← Back to your board</button>
    <div class="bb-people">
      <h2 class="bb-h2" id="bb-finish-title">How many people is it for?</h2>
      <div class="bb-people-grid">
        <div class="bb-field">
          <label class="bb-label" for="bb-guests">People</label>
          <div class="bb-stepper">
            <button type="button" class="bb-btn icon" data-guests="-1" aria-label="Fewer people">−</button>
            <input id="bb-guests" class="bb-input bb-num" type="number" inputmode="numeric" min="1" max="200" value="${state.guests}">
            <button type="button" class="bb-btn icon" data-guests="1" aria-label="More people">+</button>
          </div>
          <div class="bb-quick">${[2, 4, 6, 8, 12, 20].map((n) => `<button type="button" class="bb-chip${state.guests === n ? " is-on" : ""}" data-guests-set="${n}">${n}</button>`).join("")}</div>
        </div>
        <div class="bb-field">
          <span class="bb-label">How is it being served?</span>
          <div class="bb-options">
            <button type="button" class="bb-option${state.mode === "app" ? " is-on" : ""}" data-mode="app" aria-pressed="${state.mode === "app"}"><strong>Before a meal</strong><span>About 2 oz each of cheese and meat per person.</span></button>
            <button type="button" class="bb-option${state.mode === "main" ? " is-on" : ""}" data-mode="main" aria-pressed="${state.mode === "main"}"><strong>It's the party food</strong><span>A party with no dinner. About 3 oz of each.</span></button>
            <button type="button" class="bb-option${state.mode === "meal" ? " is-on" : ""}" data-mode="meal" aria-pressed="${state.mode === "meal"}"><strong>It's the meal</strong><span>The board is dinner. About 4 oz of each.</span></button>
          </div>
        </div>
      </div>
    </div>
    <div class="bb-results" id="bb-results" aria-live="polite">${resultsHtml()}</div>
  </section>`;
}

let resultsTimer = 0;
function refreshResults() {
  const box = document.getElementById("bb-results");
  if (!box) return;
  clearTimeout(resultsTimer);
  resultsTimer = setTimeout(() => {
    // keep anything typed into the newsletter boxes
    const typed = {};
    box.querySelectorAll("[data-news] input[type=email]").forEach((i) => { typed[i.id] = i.value; });
    box.innerHTML = resultsHtml();
    Object.keys(typed).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = typed[id];
    });
  }, 120);
}

function loadPrep() {
  if (ui.prep || ui.prepLoading) return;
  ui.prepLoading = true;
  const got = window.BB_PREP
    ? Promise.resolve(window.BB_PREP)
    : fetch(root.dataset.prep, { credentials: "same-origin" }).then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  got
    .then((prep) => {
      ui.prep = prep;
      refreshResults();
    })
    .catch(() => {
      ui.prep = {};
      refreshResults();
    })
    .finally(() => { ui.prepLoading = false; });
}

// ------------------------------------------------------------------ picker

function rowInner(item) {
  const on = isPicked(item.s);
  const r = B.reason(item, picks());
  return `${glyph(item)}
    <span class="bb-row-body">
      <span class="bb-row-title">${h(item.t)}</span>
      <span class="bb-idea-role">${h(item.b)}${item.p ? ` · <b>${h(item.p)}</b>` : ""}</span>
      ${chipsHtml(r)}
    </span>
    <span class="bb-add-pill${on ? " is-on" : ""}" aria-hidden="true">${on ? "Added ✓" : "+ Add"}</span>`;
}

function openPicker(idx) {
  const cat = B.cats[idx];
  const list = picks();
  const already = list.filter((p) => p.c === idx);
  const ranked = B.rank(list, { category: idx, diets: state.diets });
  const hidden = B.rank(list, { category: idx }).length - ranked.length;
  ui.pickerCat = idx;
  ui.pickerOrder = already.concat(ranked);
  const roles = [...new Set(ui.pickerOrder.map((i) => i.r).filter(Boolean))].sort();
  picker.innerHTML = `<div class="bb-picker-inner">
    <header class="bb-picker-head">
      ${catGlyph(cat)}
      <div><h2 id="bb-picker-title">${h(cat.add)}</h2><p class="bb-picker-tip">${h(cat.tip)}</p></div>
      <button type="button" class="bb-x" data-close aria-label="Close">×</button>
    </header>
    <div class="bb-picker-tools">
      <label class="sr-only" for="bb-picker-q">Search ${h(cat.label.toLowerCase())}</label>
      <input id="bb-picker-q" class="bb-input" type="search" placeholder="Search ${h(cat.label.toLowerCase())}" autocomplete="off">
      ${roles.length > 1 ? `<div class="bb-quick bb-roles" role="group" aria-label="Filter by style">${roles.map((r) => `<button type="button" class="bb-chip" data-role="${h(r)}" aria-pressed="false">${h(r)}</button>`).join("")}</div>` : ""}
    </div>
    <div class="bb-picker-note" id="bb-picker-note" aria-live="polite"></div>
    <div class="bb-picker-scroll">
      <p class="bb-picker-label">Best matches for your board first${hidden ? ` · ${hidden} hidden by your dietary needs` : ""}</p>
      <ul class="bb-rows" id="bb-rows">${ui.pickerOrder.map((i) => `<li><button type="button" class="bb-row${isPicked(i.s) ? " is-on" : ""}" data-toggle="${h(i.s)}" aria-pressed="${isPicked(i.s)}" aria-label="${h((isPicked(i.s) ? "Remove " : "Add ") + i.t)}">${rowInner(i)}</button></li>`).join("")}</ul>
      <p class="bb-note" id="bb-rows-empty" hidden>Nothing matches. Clear the search or filter.</p>
    </div>
    <footer class="bb-picker-foot">
      <span class="bb-picker-count" id="bb-picker-count"></span>
      <button type="button" class="bb-btn primary" data-close>Done</button>
    </footer>
  </div>`;
  updatePickerCount();
  if (typeof picker.showModal === "function") picker.showModal();
  else picker.setAttribute("open", "");
  document.body.classList.add("bb-lock");
  const q = document.getElementById("bb-picker-q");
  if (q && window.matchMedia("(min-width: 700px)").matches) q.focus();
}

function closePicker() {
  if (picker.open) {
    if (typeof picker.close === "function") picker.close();
    else picker.removeAttribute("open");
  }
  document.body.classList.remove("bb-lock");
  ui.pickerCat = null;
  render();
}

function updatePickerCount() {
  const el = document.getElementById("bb-picker-count");
  if (!el || ui.pickerCat === null) return;
  const n = picks().filter((p) => p.c === ui.pickerCat).length;
  el.textContent = n ? `${n} added from this list` : "";
}

function filterRows() {
  const q = (document.getElementById("bb-picker-q").value || "").trim().toLowerCase();
  const roles = [...picker.querySelectorAll("[data-role].is-on")].map((b) => b.dataset.role);
  let shown = 0;
  picker.querySelectorAll(".bb-row").forEach((el) => {
    const item = B.bySlug.get(el.dataset.toggle);
    const hay = (item.t + " " + item.b + " " + item.r + " " + item.g.join(" ")).toLowerCase();
    const ok = (!q || hay.indexOf(q) !== -1) && (!roles.length || roles.indexOf(item.r) !== -1);
    el.parentElement.hidden = !ok;
    if (ok) shown += 1;
  });
  document.getElementById("bb-rows-empty").hidden = shown !== 0;
}

// ------------------------------------------------------------------ bar + render

function renderBar() {
  const n = state.picks.length;
  bar.hidden = state.view !== "build";
  bar.innerHTML = `<div class="bb-bar-inner">
    <button type="button" class="bb-btn" data-recs="jump">Ideas</button>
    <button type="button" class="bb-btn primary" data-view="finish" ${n ? "" : "disabled"}>My list (${n}) →</button>
  </div>`;
}

function render() {
  const view = state.view;
  app.innerHTML = view === "finish" ? viewFinish() : viewBuild();
  if (view === "finish") loadPrep();
  root.classList.toggle("is-building", view !== "build" || state.picks.length > 0);
  renderBar();
}

function setView(view, opts) {
  opts = opts || {};
  if (view !== "build" && !state.picks.length) view = "build";
  state.view = view;
  const t = document.getElementById("bb-toast");
  if (t) t.classList.remove("is-on");
  save();
  render();
  if (!opts.fromHistory) {
    try { history.pushState({ bb: view }, "", location.pathname); } catch (e) { /* ignore */ }
  }
  if (!opts.noScroll) scrollToApp();
  const heading = app.querySelector(".bb-finish .bb-h2");
  if (heading && !opts.noScroll) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
}

function scrollToApp(el) {
  const header = document.querySelector(".site-header");
  const offset = (header ? header.offsetHeight : 80) + 12;
  const target = el || app;
  const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
  if (el || window.pageYOffset > top) window.scrollTo({ top: Math.max(0, top), behavior: el ? "smooth" : "auto" });
}

// ------------------------------------------------------------------ actions

let toastTimer = 0;
function toast(title, text) {
  let el = document.getElementById("bb-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "bb-toast";
    el.className = "bb-toast";
    el.setAttribute("role", "status");
    root.appendChild(el);
  }
  el.innerHTML = `<strong>${h(title)}</strong>${text ? `<span>${h(text)}</span>` : ""}`;
  el.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-on"), text && text.length > 60 ? 6500 : 3800);
}

function toggle(slug, where) {
  const item = B.bySlug.get(slug);
  if (!item) return;
  const at = state.picks.indexOf(slug);
  let added = false;
  if (at === -1) {
    state.picks.push(slug);
    added = true;
  } else state.picks.splice(at, 1);
  ui.recsStale = ui.recsOpen;
  save();

  if (where === "picker") {
    refreshIdeas(picker);
    updatePickerCount();
    const noteEl = document.getElementById("bb-picker-note");
    if (noteEl) {
      if (added) {
        const n = B.addedNote(item, picks());
        noteEl.innerHTML = `<strong>${h(n.title)}</strong>${n.text ? ` <span>${h(n.text)}</span>` : ""}`;
        noteEl.classList.add("is-on");
      } else {
        noteEl.innerHTML = `<strong>Removed ${h(item.t)}</strong>`;
      }
    }
    return;
  }
  const y = window.pageYOffset;
  render();
  window.scrollTo(0, y);
  if (added) {
    const n = B.addedNote(item, picks());
    toast(n.title, n.text);
  }
}

function openRecs() {
  ui.recsOpen = true;
  ui.recs = B.recommendations(picks(), { diets: state.diets }).map((i) => i.s);
  ui.recsShown = RECS_PAGE;
  ui.recsStale = false;
}

function setGuests(n) {
  n = Math.max(1, Math.min(200, Math.round(Number(n) || 1)));
  state.guests = n;
  save();
  const input = document.getElementById("bb-guests");
  if (input && document.activeElement !== input) input.value = n;
  app.querySelectorAll("[data-guests-set]").forEach((b) => b.classList.toggle("is-on", Number(b.dataset.guestsSet) === n));
  refreshResults();
}

function onNewsletter(form, e) {
  const input = form.querySelector("input[type=email]");
  const err = form.querySelector(".bb-news-error");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
    e.preventDefault();
    err.hidden = false;
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }
  // the form opens Beehiiv's confirmation in a new tab; remember it here
  try { localStorage.setItem(SUBSCRIBED, "1"); } catch (x) { /* ignore */ }
  setTimeout(() => {
    toast("Almost done", "Confirm your subscription in the tab that just opened.");
    refreshResults();
  }, 60);
}

async function share(kind) {
  const url = shareUrl();
  if (kind === "native") {
    try {
      await navigator.share({ title: "My charcuterie board", text: `The board I built for ${peopleText(state.guests)} on Charcuterie Lab`, url });
    } catch (e) { /* cancelled */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    toast("Link copied", "Anyone who opens it sees this exact board.");
  } catch (e) {
    window.prompt("Copy this link:", url);
  }
}

// ------------------------------------------------------------------ events

function onClick(e) {
  const t = e.target.closest("button, a");
  if (!t) return;
  const d = t.dataset;
  const inPicker = picker.contains(t);
  if (d.toggle) toggle(d.toggle, inPicker ? "picker" : "page");
  else if (d.toggleQuick) toggle(d.toggleQuick, "page");
  else if (d.remove) toggle(d.remove, "page");
  else if (d.open !== undefined) openPicker(Number(d.open));
  else if (d.close !== undefined) closePicker();
  else if (d.role !== undefined) {
    const on = !t.classList.contains("is-on");
    t.classList.toggle("is-on", on);
    t.setAttribute("aria-pressed", String(on));
    filterRows();
  } else if (d.diet) {
    const at = state.diets.indexOf(d.diet);
    if (at === -1) state.diets.push(d.diet);
    else state.diets.splice(at, 1);
    if (ui.recsOpen) openRecs();
    save();
    const y = window.pageYOffset;
    render();
    window.scrollTo(0, y);
  } else if (d.recs) {
    if (d.recs === "open" || d.recs === "refresh") openRecs();
    else if (d.recs === "more") ui.recsShown += RECS_PAGE;
    else if (d.recs === "close") ui.recsOpen = false;
    else if (d.recs === "jump" && !ui.recsOpen) openRecs();
    const y = window.pageYOffset;
    render();
    if (d.recs === "jump" || d.recs === "open") scrollToApp(document.getElementById("bb-recs"));
    else window.scrollTo(0, y);
  } else if (d.view) setView(d.view);
  else if (d.guests) setGuests(state.guests + Number(d.guests));
  else if (d.guestsSet) setGuests(d.guestsSet);
  else if (d.share) share(d.share);
  else if (d.print !== undefined) window.print();
  else if (d.mode) {
    state.mode = d.mode;
    save();
    app.querySelectorAll("[data-mode]").forEach((b) => {
      const on = b.dataset.mode === state.mode;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    refreshResults();
  } else if (d.restart !== undefined) {
    const keep = { guests: state.guests, mode: state.mode, diets: state.diets };
    state = Object.assign(fresh(), keep);
    ui.recsOpen = false;
    setView("build");
  }
}

app.addEventListener("click", onClick);
bar.addEventListener("click", onClick);
picker.addEventListener("click", (e) => {
  if (e.target === picker) closePicker(); // backdrop
  else onClick(e);
});
picker.addEventListener("cancel", (e) => {
  e.preventDefault();
  closePicker();
});
picker.addEventListener("input", (e) => {
  if (e.target.id === "bb-picker-q") filterRows();
});

app.addEventListener("input", (e) => {
  if (e.target.id === "bb-guests" && e.target.value !== "") setGuests(e.target.value);
  if (e.target.type === "email") {
    e.target.removeAttribute("aria-invalid");
    const err = e.target.form && e.target.form.querySelector(".bb-news-error");
    if (err) err.hidden = true;
  }
});
app.addEventListener("change", (e) => {
  if (e.target.id === "bb-guests") {
    setGuests(e.target.value);
    e.target.value = state.guests;
  }
});
app.addEventListener("submit", (e) => {
  if (e.target.matches("[data-news]")) onNewsletter(e.target, e);
});

window.addEventListener("popstate", (e) => {
  if (picker.open) closePicker();
  if (e.state && e.state.bb) setView(e.state.bb, { fromHistory: true });
});

// ------------------------------------------------------------------ boot

function fromLink() {
  // shared links reopen a board: ?b=slug,slug&g=12&m=main
  const params = new URLSearchParams(location.search);
  const MODES = ["app", "main", "meal"];
  if (!params.has("b")) {
    // Party Planner links: ?g=20&m=main opens an empty board sized for 20
    const g0 = parseInt(params.get("g"), 10);
    if (!(g0 > 0 && g0 <= 200)) return false;
    state = Object.assign(fresh(), load() || {}, { guests: g0 });
    if (MODES.includes(params.get("m"))) state.mode = params.get("m");
    save();
    return false;
  }
  const slugs = params.get("b").split(",").map((s) => s.trim()).filter((s) => B.bySlug.has(s));
  if (!slugs.length) return false;
  state = Object.assign(fresh(), load() || {}, { picks: [...new Set(slugs)], view: "build" });
  const g = parseInt(params.get("g"), 10);
  if (g > 0 && g <= 200) state.guests = g;
  if (MODES.includes(params.get("m"))) state.mode = params.get("m");
  save();
  return true;
}

function boot(data) {
  B_data = data;
  B = createBoard(data);
  const linked = fromLink();
  if (!linked) {
    const saved = load();
    if (saved) {
      state = saved;
      state.picks = state.picks.filter((s) => B.bySlug.has(s));
    }
  }
  try { history.replaceState({ bb: state.view }, "", location.pathname); } catch (e) { /* ignore */ }
  setView(state.view, { fromHistory: true, noScroll: true });
  if (linked) toast("Here's the shared board", "Add or swap anything, then get your own shopping list.");
}

(window.BB_DATA ? Promise.resolve(window.BB_DATA) : fetch(root.dataset.src, { credentials: "same-origin" }).then((r) => {
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}))
  .then(boot)
  .catch(() => {
    app.innerHTML = `<p class="bb-note">The builder couldn't load. Refresh to try again, or browse the <a href="/ingredients/">ingredients page</a>.</p>`;
  });
