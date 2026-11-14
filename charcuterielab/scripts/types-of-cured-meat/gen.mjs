// Builds content/blog/types-of-cured-meat.md from data.mjs (Nov 14, 2026).
// Modeled on scripts/types-of-cheese/gen.mjs and reuses its tc-* styles.
// Run from the charcuterielab folder:  node scripts/types-of-cured-meat/gen.mjs
// Re-run it after adding photos: a meat without an ingredient page shows a drawn
// slice until /images/cured-meat-types/<id>.jpg exists and make-thumbs.py has run.
// The hero, the families photo and the chart image are used once they exist.
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { FAMILIES, MEATS, STRENGTH, EAT, animalKey } from "./data.mjs";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = JSON.parse(fs.readFileSync(join(SITE, "public/images/thumbs/manifest.json"), "utf8"));
const ingDir = join(SITE, "..", "content", "ingredients");
const imgExists = (p) => fs.existsSync(join(SITE, "public", p)) && fs.statSync(join(SITE, "public", p)).size > 0;
const pages = new Set(fs.readdirSync(ingDir).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fam = Object.fromEntries(FAMILIES.map((f) => [f.key, f]));

const rows = MEATS.map(([id, name, f, animal, from, str, taste, pair, eat, price]) => {
  const hasPage = pages.has(id);
  const href = hasPage ? `/ingredients/${id}/` : "";
  const t = hasPage ? manifest.thumbs[`/images/ingredients/${id}.jpg`] : manifest.thumbs[`/images/cured-meat-types/${id}.jpg`];
  const img = t && t.s ? { s: t.s, m: t.m || t.s } : null;
  return { id, name, f, animal, from, str, taste, pair, eat, price, href, img, ak: animalKey(animal) };
});
if (rows.length !== 100) throw new Error(`expected 100, got ${rows.length}`);
for (const r of rows) {
  if (!fam[r.f]) throw new Error(`bad family ${r.f}`);
  if (!EAT[r.eat]) throw new Error(`bad eat ${r.eat} on ${r.id}`);
}
const missingPages = [...pages].filter((p) => {
  const t = fs.readFileSync(`${ingDir}/${p}.md`, "utf8");
  return /^category: "Cured Meat & Seafood"/m.test(t) && !rows.some((r) => r.id === p);
});
if (missingPages.length) throw new Error(`meat pages not used: ${missingPages}`);
const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
const L = (id, label) => {
  const r = byId[id];
  if (!r) throw new Error(`no meat ${id}`);
  const text = esc(label || r.name);
  return r.href ? `<a href="${r.href}">${text}</a>` : text;
};
const mdL = (id, label) => {
  const r = byId[id];
  if (!r) throw new Error(`no meat ${id}`);
  return r.href ? `[${label || r.name}](${r.href})` : label || r.name;
};

const dots = (n) => `<span class="tc-str" aria-label="Strength ${n} of 5: ${STRENGTH[n]}">${[1, 2, 3, 4, 5].map((i) => `<i${i <= n ? ' class="on"' : ""}></i>`).join("")}</span>`;
const eatPill = (r) => (r.eat === "ready" ? "" : ` <span class="tm-eat tm-eat-${r.eat}">${r.eat === "cook" ? "Cook first" : "Serve warm"}</span>`);
const slice = `<svg viewBox="0 0 64 48" aria-hidden="true"><circle cx="32" cy="24" r="19" fill="currentColor" opacity=".55"/><circle cx="32" cy="24" r="19" fill="none" stroke="currentColor" stroke-width="2.5" opacity=".85"/><g fill="#fff" opacity=".75"><circle cx="25" cy="17" r="2.4"/><circle cx="37" cy="15" r="1.8"/><circle cx="40" cy="27" r="2.6"/><circle cx="28" cy="31" r="2"/><circle cx="33" cy="23" r="1.5"/><circle cx="22" cy="25" r="1.6"/></g></svg>`;

function card(r) {
  const F = fam[r.f];
  const pic = r.img
    ? `<img src="${r.img.s}" srcset="${r.img.s} 240w, ${r.img.m} 640w" sizes="(max-width: 640px) 46vw, 240px" alt="${esc(r.name)}" width="240" height="161" loading="lazy" decoding="async">`
    : `<span class="tc-noimg" style="--fc:${F.color}">${slice}</span>`;
  const inner = `<span class="tc-card-pic">${pic}</span><span class="tc-card-body"><span class="tc-card-name">${esc(r.name)}</span><span class="tc-card-meta">${esc(r.animal)} · ${esc(r.from)}</span>${dots(r.str)}${eatPill(r)}<span class="tc-card-taste">${esc(r.taste)}</span><span class="tc-card-pair"><b>Try with:</b> ${esc(r.pair)}</span></span>`;
  return r.href ? `<a class="tc-card" href="${r.href}">${inner}</a>` : `<div class="tc-card">${inner}</div>`;
}

// Page-only styles: the spectrum line in meat colors and the cook/warm pills.
const css = `<style>
.post-body .tm-spec .tc-spec-line::before { background: linear-gradient(90deg, ${["cooked", "semidry", "whole", "salami", "dried"].map((k) => fam[k].color).join(", ")}); }
.post-body .tm-eat { display: inline-block; margin-left: 6px; padding: 1px 7px; border-radius: 999px; font: 700 11px/1.5 var(--sans); letter-spacing: .02em; vertical-align: middle; white-space: nowrap; }
.post-body .tm-eat-cook { background: #f6dfd6; color: #8a2f1b; }
.post-body .tm-eat-warm { background: #f3e7cf; color: #6b4a12; }
.post-body .tc-card .tm-eat { margin: 4px 0 0; align-self: flex-start; }
.post-body .tm-safe { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 0 0 30px; }
.post-body .tm-safe > div { padding: 14px 16px; border-radius: 12px; background: #fff; border: 1px solid rgba(169, 87, 43, 0.14); font-family: var(--sans); }
.post-body .tm-safe b { display: block; font: 700 18px/1.25 var(--serif); color: var(--green-deep); }
.post-body .tm-safe p { margin: 6px 0 0; font-size: 15px; line-height: 1.5; }
@media (max-width: 700px) { .post-body .tm-safe { grid-template-columns: 1fr; } }
</style>`;

// ---------- Top visual: the cured meat spectrum ----------
const line = ["cooked", "semidry", "whole", "salami", "dried"].map((k) => fam[k]);
const extra = ["fat", "spread", "fish"].map((k) => fam[k]);
const SPEC_EX = { cooked: "mortadella", semidry: "summer-sausage", whole: "prosciutto-di-parma", salami: "genoa-salami", dried: "beef-jerky" };
const spectrum = `${css}
<div class="tc-spec tm-spec" role="img" aria-label="Cured meat families arranged from cooked, moist and mild to dried, aged and intense, plus cured fat, spreads and cured fish">
<p class="tc-spec-label">Every cured meat in one picture</p>
<div class="tc-spec-ends"><span>← Cooked · moister · milder</span><span>Drier · longer aged · stronger →</span></div>
<p class="tc-spec-m">Top to bottom: moist and mild, down to dry and intense</p>
<div class="tc-spec-line">${line.map((f) => `<a href="#${f.key}" style="--fc:${f.color}"><b>${f.n}</b><span>${f.name}</span><small>${esc(byId[SPEC_EX[f.key]].name.replace(" (Spanish)", ""))}</small></a>`).join("")}</div>
<p class="tc-spec-sub">Plus three more families</p>
<div class="tc-spec-extra">${extra.map((f) => `<a href="#${f.key}" style="--fc:${f.color}"><b>${f.n}</b><span>${f.name}</span><small>${{ fat: "Mostly fat, sliced or cooked", spread: "Soft enough to spread", fish: "From the sea" }[f.key]}</small></a>`).join("")}</div>
<p class="tc-spec-df">No pork? Jump to the <a href="#for-the-job">pork-free picks</a>.</p>
</div>`;

// The families photo (once it exists), with a numbered label under each meat.
const famPhotoPath = "/images/types-of-cured-meat-families.jpg";
const famPhoto = manifest.thumbs[famPhotoPath];
const LINEUP = [["cooked", "Mortadella"], ["semidry", "Summer sausage"], ["whole", "Prosciutto"], ["salami", "Genoa salami"], ["dried", "Beef jerky"], ["fat", "Lardo"], ["spread", "Pâté"], ["fish", "Smoked salmon"]];
const lineup = imgExists(famPhotoPath)
  ? `<figure class="tc-lineup"><img src="${famPhoto && famPhoto.m ? famPhoto.m : famPhotoPath}" srcset="${famPhoto && famPhoto.m ? `${famPhoto.m} 640w, ` : ""}${famPhotoPath} 1024w" sizes="(max-width: 792px) calc(100vw - 32px), 760px" alt="Eight cured meats in a row on a long wooden board, one from each family, left to right: mortadella, summer sausage, folded prosciutto, Genoa salami, beef jerky, lardo, a slice of pâté and smoked salmon" width="1024" height="687" loading="lazy" decoding="async">
<figcaption><ol>${LINEUP.map(([k, c]) => `<li style="--fc:${fam[k].color}"><a href="#${k}"><b>${fam[k].n}</b><span>${esc(fam[k].name)}</span><small>${c}</small></a></li>`).join("")}</ol></figcaption></figure>`
  : "";

// How cured meat is made, in 4 steps. Each step links to the families it explains.
const famLink = (k, label) => `<a href="#${k}" class="tc-mk-fam" style="--fc:${fam[k].color}">${label || fam[k].name}</a>`;
const MAKE = [
  ["Salt it", "Salt pulls water out of the meat, and with less water, spoilage bacteria can't grow. Most cures also use a little nitrite, which guards against botulism and keeps the meat pink.", `Prosciutto di Parma is the famous exception: salt is its only cure. All ${famLink("whole", "whole-muscle meats")} start here.`],
  ["Grind and ferment (sausages only)", "For salami, meat and fat are chopped, seasoned and stuffed into a casing. Friendly bacteria then turn a little sugar into lactic acid, which adds tang and makes the meat safer.", `Long fermenting and drying makes ${famLink("salami", "salami")}; a short one plus smoke makes ${famLink("semidry", "semi-dry sausages")}.`],
  ["Dry and age", "The meat hangs in cool, humid rooms for weeks, months or years while it loses water and its flavor deepens.", `Prosciutto di Parma must age at least 14 months; ${famLink("dried", "jerky")} is dried fast with heat.`],
  ["Or cook and smoke it", "Instead of drying, some cured meats are cooked or hot-smoked, which makes them moist, mild and ready to eat in days.", `That's the whole ${famLink("cooked", "deli counter")}: ham, mortadella, pastrami, smoked turkey.`],
];
const howMade = `<h2 id="how-made">How cured meat is made, in 4 steps</h2>
<p class="sk-lede">All cured meat starts with salt. What happens next decides which family it lands in. Here's <a href="/blog/why-cured-meat-doesnt-spoil/">the science of why it doesn't spoil</a>.</p>
<ol class="tc-make">${MAKE.map(([t, d, fx], i) => `<li><span class="tc-mk-n">${i + 1}</span><b>${t}</b><p>${d}</p><p class="tc-mk-fx">${fx}</p></li>`).join("")}</ol>`;

// "Save this chart": shareable image, Pinterest button, printable and embed code.
const SITE_URL = "https://charcuterielab.com";
const POST = "/blog/types-of-cured-meat/";
const chartImg = "/images/types-of-cured-meat-chart.jpg";
const chartThumb = manifest.thumbs[chartImg];
const pinUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(SITE_URL + POST)}&media=${encodeURIComponent(SITE_URL + chartImg)}&description=${encodeURIComponent("Types of cured meat chart: the 8 families of charcuterie, from deli ham to prosciutto, salami and jerky. All 100 meats at Charcuterie Lab.")}`;
const embedCode = `<a href="${SITE_URL}${POST}"><img src="${SITE_URL}${chartImg}" alt="Types of cured meat chart: the 8 families of charcuterie" width="500" height="750"></a><br>Chart: <a href="${SITE_URL}${POST}">Types of Cured Meat by Charcuterie Lab</a>`;
const shareBox = imgExists(chartImg) ? `<div class="tc-share" id="save-chart">
<a class="tc-share-img" href="${chartImg}"><img src="${chartThumb && chartThumb.m ? chartThumb.m : chartImg}" alt="Types of cured meat chart: the 8 families of charcuterie, with examples of each" width="320" height="480" loading="lazy" decoding="async"></a>
<div class="tc-share-copy">
<p class="tc-share-kicker">Save this chart</p>
<p class="tc-share-title">The 8 cured meat families on one page</p>
<p>Pin it for later, or get the free 3-page printable with all 100 meats and a box to tick off each one you've tried.</p>
<div class="tc-share-btns"><a class="button tc-pin" href="${esc(pinUrl)}" target="_blank" rel="noopener">Save to Pinterest</a><a class="button secondary" href="#cheat">Get the free printable</a></div>
<details class="tc-embed"><summary>Use this chart on your site</summary><p>You're welcome to share it. Copy this code, which includes a credit link:</p><textarea readonly rows="4" aria-label="Embed code for the cured meat chart">${esc(embedCode)}</textarea><button type="button" class="tc-copy" data-tc-copy>Copy code</button></details>
</div></div>
<script>(function(){var b=document.querySelector('[data-tc-copy]');if(!b)return;b.addEventListener('click',function(){var t=b.parentNode.querySelector('textarea');t.select();try{navigator.clipboard.writeText(t.value).then(function(){b.textContent='Copied';},function(){document.execCommand('copy');b.textContent='Copied';});}catch(e){document.execCommand('copy');b.textContent='Copied';}});})();</script>` : "";

const jump = `<p class="tc-jump-label" id="jump">Jump to a section</p>
<nav class="sk-jump" data-tc-jump aria-label="Jump to a section"><a href="#families">The 8 families</a><a href="#how-made">How it's made</a><a href="#chart">Cured meat chart (all 100)</a>${FAMILIES.map((f) => `<a href="#${f.key}">${f.name}</a>`).join("")}<a href="#by-country">By country</a><a href="#for-the-job">Best meat for…</a><a href="#ladder">If you like X, try Y</a><a href="#safety">Raw? Safe? Uncured?</a><a href="#label">Label words</a><a href="#faq">FAQ</a></nav>`;

// ---------- The chart ----------
const animalOpts = [["", "Any meat"], ["pork", "Pork"], ["beef", "Beef"], ["mixed", "Pork & beef mix"], ["poultry", "Poultry"], ["game", "Game"], ["seafood", "Fish & seafood"]];
const chart = `<h2 id="chart">The cured meat chart: all 100 types</h2>
<p class="sk-lede">The full list of meats in this guide. Tap a family, pick a meat or type a name, and tap any linked meat to open its full guide.</p>
<div class="tc-key">
<p class="tc-key-h">How to read the chart</p>
<div class="tc-key-str" aria-label="Strength scale from 1 to 5">${[1, 2, 3, 4, 5].map((n) => `<span>${dots(n)}<b>${STRENGTH[n]}</b><small>${["", "Soft, sweet, kid-friendly", "Gently salty and savory", "Real character: spice, smoke or age", "Salty, spicy or gamey", "Very salty, fiery or funky"][n]}</small></span>`).join("")}</div>
<ul>
<li><strong>Family</strong> is how it's made: cooked, lightly dried, whole and aged, chopped into salami, dried hard, or one of three specialties.</li>
<li><strong>Strength</strong> is how intense it is to eat, salt, spice and smoke included, for a typical piece from a US store.</li>
<li><strong>Ready to eat?</strong> Most are. Ones marked <span class="tm-eat tm-eat-cook">Cook first</span> are cured but raw, and ones marked <span class="tm-eat tm-eat-warm">Serve warm</span> are cooked but taste best heated.</li>
<li><strong>How we picked the 100:</strong> all ${rows.filter((r) => r.href).length} meats and fish with a Charcuterie Lab ingredient guide, plus ${rows.filter((r) => !r.href).length} more you'll meet at delis, butcher shops and on travels, from bacon and bologna to biltong and Jinhua ham.</li>
</ul>
</div>
<div class="tc-chart" data-tc-chart>
<div class="tc-controls">
<div class="tc-chips" role="group" aria-label="Filter by family"><button type="button" class="on" data-fam="">All</button>${FAMILIES.map((f) => `<button type="button" data-fam="${f.key}" style="--fc:${f.color}">${f.name}</button>`).join("")}</div>
<div class="tc-row">
<label class="tc-field"><span>Search</span><input type="search" placeholder="e.g. ham, Spain, smoky" data-tc-q></label>
<label class="tc-field"><span>Meat</span><select data-tc-milk>${animalOpts.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>
<label class="tc-field"><span>Strength</span><select data-tc-str><option value="">Any</option><option value="1-2">Mild (1–2)</option><option value="3">Medium (3)</option><option value="4-5">Bold (4–5)</option></select></label>
<label class="tc-field"><span>Sort</span><select data-tc-sort><option value="fam">By family</option><option value="az">A to Z</option><option value="mild">Mildest first</option><option value="bold">Boldest first</option></select></label>
</div>
<p class="tc-count" aria-live="polite" data-tc-count>Showing all 100 meats</p>
</div>
<div class="tc-tablewrap"><table class="tc-table">
<thead><tr><th>Meat</th><th>Family</th><th>Animal</th><th>From</th><th>Strength</th><th>Tastes like</th><th>Try with</th></tr></thead>
<tbody>
${rows.map((r, i) => `<tr data-i="${i}" data-fam="${r.f}" data-milk="${r.ak}" data-str="${r.str}" data-name="${esc(r.name.toLowerCase())}" data-text="${esc([r.name, r.animal, r.from, r.taste, r.pair, fam[r.f].name, EAT[r.eat]].join(" ").toLowerCase())}"><td data-l="Cheese" class="tc-name">${r.href ? `<a href="${r.href}">${esc(r.name)}</a>` : esc(r.name)}${eatPill(r)}</td><td data-l="Family"><span class="tc-fam" style="--fc:${fam[r.f].color}">${fam[r.f].name}</span></td><td data-l="Milk" data-from="${esc(r.from)}">${esc(r.animal)}</td><td data-l="From">${esc(r.from)}</td><td data-l="Strength">${dots(r.str)} <span class="tc-strw">${STRENGTH[r.str]}</span></td><td data-l="Tastes like">${esc(r.taste)}</td><td data-l="Try with">${esc(r.pair)}</td></tr>`).join("\n")}
</tbody></table></div>
<button type="button" class="button tc-more-btn" data-tc-more hidden>Show all 100 meats</button>
<p class="tc-empty" data-tc-empty hidden>Nothing matches that. Try fewer filters.</p>
</div>
<script>
(function(){var c=document.querySelector('[data-tc-chart]');if(!c)return;var tb=c.querySelector('tbody'),rows=[].slice.call(tb.rows),q=c.querySelector('[data-tc-q]'),mk=c.querySelector('[data-tc-milk]'),st=c.querySelector('[data-tc-str]'),so=c.querySelector('[data-tc-sort]'),ct=c.querySelector('[data-tc-count]'),mb=c.querySelector('[data-tc-more]'),em=c.querySelector('[data-tc-empty]'),fam='',open=false,LIM=12;
var chips=[].slice.call(c.querySelectorAll('.tc-chips button'));
chips.forEach(function(b){b.addEventListener('click',function(){fam=b.getAttribute('data-fam');chips.forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});run()})});
[q,mk,st,so].forEach(function(el){el.addEventListener(el===q?'input':'change',run)});
mb.addEventListener('click',function(){open=true;run()});
function run(){var t=(q.value||'').trim().toLowerCase(),m=mk.value,s=st.value,sort=so.value;
var list=rows.slice();
if(sort==='az')list.sort(function(a,b){return a.dataset.name<b.dataset.name?-1:1});
else if(sort==='mild')list.sort(function(a,b){return a.dataset.str-b.dataset.str||a.dataset.i-b.dataset.i});
else if(sort==='bold')list.sort(function(a,b){return b.dataset.str-a.dataset.str||a.dataset.i-b.dataset.i});
else list.sort(function(a,b){return a.dataset.i-b.dataset.i});
var filtered=!!(t||m||s||fam),n=0,shown=0;
list.forEach(function(r){tb.appendChild(r);var d=r.dataset,ok=(!fam||d.fam===fam)&&(!m||d.milk===m)&&(!t||d.text.indexOf(t)>-1);
if(ok&&s){var v=+d.str;ok=s==='1-2'?v<=2:s==='3'?v===3:v>=4}
if(ok){n++;var vis=filtered||open||n<=LIM;r.hidden=!vis;if(vis)shown++}else r.hidden=true});
ct.textContent=filtered?('Showing '+n+' of 100 meats'):(open?'Showing all 100 meats':'Showing '+shown+' of 100 meats');
mb.hidden=filtered||open;em.hidden=n>0}
c.classList.add('js');run();})();
</script>`;

// ---------- Family sections ----------
const famExamples = {
  cooked: "ham, mortadella, pastrami, smoked turkey",
  semidry: "summer sausage, meat sticks, landjäger",
  whole: "prosciutto, jamón, coppa, bresaola",
  salami: "Genoa, soppressata, chorizo, pepperoni",
  dried: "beef jerky, biltong, droëwors",
  fat: "lardo, pancetta, guanciale, bacon",
  spread: "pâté, rillettes, liverwurst, 'nduja",
  fish: "smoked salmon, anchovies, sardines, caviar",
};
const GLANCE_TASTE = { cooked: "Mild, juicy, a little sweet", semidry: "Tangy, smoky, chewy", whole: "Silky, sweet-salty, nutty", salami: "Tangy, garlicky, often spiced", dried: "Chewy, concentrated, seasoned", fat: "Rich, melting, peppery", spread: "Rich, smooth or rustic", fish: "Briny, smoky, savory" };
const SHOW = 6;
// Head-to-head posts that already exist, shown under each family's cards.
const CONFUSED = {
  cooked: [["/blog/mortadella-vs-bologna/", "Mortadella vs. bologna"]],
  whole: [["/blog/prosciutto-vs-serrano/", "Prosciutto vs. serrano"], ["/blog/bresaola-vs-prosciutto/", "Bresaola vs. prosciutto"]],
  salami: [["/blog/genoa-salami-vs-hard-salami/", "Genoa vs. hard salami"], ["/blog/soppressata-vs-salami/", "Soppressata vs. salami"], ["/blog/salami-vs-pepperoni/", "Salami vs. pepperoni"], ["/blog/salami-vs-chorizo/", "Salami vs. chorizo"]],
  fat: [["/blog/prosciutto-vs-pancetta/", "Prosciutto vs. pancetta"]],
};
const MORE = {
  salami: `Want to go deeper? See <a href="/blog/types-of-salami/">the types of salami</a>.`,
  fish: `Building a whole board of it? See <a href="/blog/best-tinned-fish/">the best tinned fish</a> and <a href="/blog/best-smoked-salmon/">the best smoked salmon</a>.`,
  spread: `Shopping for one? See <a href="/blog/best-pate/">the best pâté you can buy</a>.`,
  dried: `Shopping for one? See <a href="/blog/best-beef-jerky/">the best beef jerky</a> and <a href="/blog/best-meat-sticks/">the best meat sticks</a>.`,
  cooked: `Shopping for one? See <a href="/blog/best-deli-meat-brands/">the best deli meat brands</a>.`,
  whole: `Shopping for one? See <a href="/blog/best-prosciutto-brands/">the best prosciutto brands</a>.`,
};
function famSection(f) {
  const list = rows.filter((r) => r.f === f.key);
  const head = list.slice(0, SHOW).map(card).join("");
  const rest = list.slice(SHOW).map(card).join("");
  return `<h2 id="${f.key}" class="tc-famh" style="--fc:${f.color}"><span class="tc-famn">${f.n}</span> ${esc(f.long)} <span class="tc-famc">${list.length} types</span></h2>
<p class="tc-what">${f.what}</p>
<div class="tc-facts" style="--fc:${f.color}"><div><span>Texture</span><b>${f.texture}</b></div><div><span>Aged</span><b>${f.aged}</b></div><div><span>Best for</span><b>${f.best}</b></div></div>
<p class="tc-why"><strong>Why it tastes this way:</strong> ${f.why}</p>
<div class="tc-cards">${head}</div>
${rest ? `<details class="tc-moreset"><summary>See all ${list.length} ${esc(f.name.toLowerCase())} types</summary><div class="tc-cards">${rest}</div></details>` : ""}
${CONFUSED[f.key] ? `<p class="tc-vs"><span>Often confused:</span> ${CONFUSED[f.key].map(([href, t]) => `<a href="${href}">${t}</a>`).join("")}</p>` : ""}
${MORE[f.key] ? `<p>${MORE[f.key]}</p>` : ""}
<p class="tc-tip" style="--fc:${f.color}"><span>Tip</span> ${f.tip}</p>`;
}

// ---------- By country ----------
const COUNTRIES = [
  ["Italian cured meats (salumi)", /^Italy/, "Italy has the longest list. <em>Salumi</em> is the Italian word for all of them; salami is just one kind."],
  ["Spanish cured meats (embutidos and jamón)", /^Spain/, "Paprika (pimentón) is the signature, and jamón is the national treasure."],
  ["French charcuterie", /^France/, "The French gave us the word <em>charcuterie</em>, from <em>chair cuite</em>, \"cooked meat\", and they lead on pâtés and rillettes."],
  ["German & Central European", /Germany|Switzerland|Austria|Poland|Hungary|Croatia|Slovenia|Serbia|Ukraine/, "Smoke, caraway, paprika and garlic: hearty meats made for cold winters."],
  ["American", /^USA|^Canada/, "Deli classics, smokehouse sausages and jerky."],
  ["Around the world", null, "From Chinese lap cheong to South African biltong."],
];
const used = new Set();
const countryHtml = `<h2 id="by-country">Cured meats by country</h2>
<p class="sk-lede">Every tradition has its own. Here's where each of the 100 comes from (seafood is in <a href="#fish">its own section</a>).</p>
<div class="tc-jobs">${COUNTRIES.map(([t, re, note]) => {
  const ids = rows.filter((r) => r.f !== "fish" && !used.has(r.id) && (re ? re.test(r.from) : true));
  ids.forEach((r) => used.add(r.id));
  return `<div><b>${t}</b><p class="tm-cnote">${note}</p><p>${ids.map((r) => L(r.id)).join(" · ")}</p></div>`;
}).join("")}</div>`;

// ---------- Jobs ----------
const jobs = [
  ["Mild crowd-pleasers", ["genoa-salami", "prosciutto-di-parma", "prosciutto-cotto", "mortadella", "summer-sausage", "smoked-turkey"]],
  ["Best for pizza and flatbread", ["pepperoni", "soppressata", "nduja", "calabrese-salami", "speck", "prosciutto-di-parma"]],
  ["Best for cooking", ["guanciale", "pancetta", "bacon", "lap-cheong", "andouille", "tasso"]],
  ["Pork-free picks", ["bresaola", "bundnerfleisch", "cecina", "pastirma", "biltong", "duck-prosciutto", "beef-jerky", "smoked-salmon"]],
  ["Spicy", ["chorizo", "calabrese-salami", "nduja", "sobrasada", "kulen", "andouille"]],
  ["Smoky", ["speck", "black-forest-ham", "cecina", "landjager", "pastrami", "smoked-trout"]],
  ["Showpieces for a board", ["jamon-iberico", "culatello", "caviar", "foie-gras", "pate-en-croute", "bottarga"]],
  ["For the adventurous", ["morcilla", "head-cheese", "lardo", "anchovies", "bottarga", "nduja"]],
];
const jobsHtml = `<h2 id="for-the-job">The best cured meat for the job</h2>
<div class="tc-jobs">${jobs.map(([t, ids]) => `<div><b>${t}</b><p>${ids.map((id) => L(id)).join(" · ")}</p></div>`).join("")}</div>`;

// ---------- Ladder ----------
const ladder = [
  ["Ham", "prosciutto-cotto", "prosciutto-di-parma", "jamon-serrano", "jamon-iberico"],
  ["Salami", "genoa-salami", "finocchiona", "soppressata", "wild-boar-salami"],
  ["Spicy", "pepperoni", "chorizo", "calabrese-salami", "nduja"],
  ["Beef", "bresaola", "bundnerfleisch", "biltong", "pastirma"],
  ["Smoky", "smoked-turkey", "black-forest-ham", "speck", "cecina"],
  ["From the sea", "smoked-salmon", "gravlax", "anchovies", "bottarga"],
];
const ladderHtml = `<h2 id="ladder">If you like this, try that</h2>
<p class="sk-lede">Each row goes from easy to bold. Find a meat you already like and take one step right.</p>
<div class="tc-ladder">${ladder.map(([t, ...ids]) => `<div class="tc-lrow"><span class="tc-lt">${t}</span><ol>${ids.map((id) => `<li>${L(id)}</li>`).join("")}</ol></div>`).join("")}</div>`;

// ---------- Safety ----------
const safety = `<h2 id="safety">Is it raw? Is it safe? What does "uncured" mean?</h2>
<div class="tm-safe">
<div><b>Is cured meat raw?</b><p>Many of the best ones were never cooked. Prosciutto and salami are made safe by salt, drying and (for salami) fermentation, and they're sold ready to eat. A few are cured but still raw and need cooking: ${L("pancetta", "pancetta")}, ${L("guanciale", "guanciale")}, ${L("bacon", "bacon")} and ${L("lap-cheong", "lap cheong")}. The label will say "cook before eating".</p></div>
<div><b>Pregnant?</b><p>The CDC advises people who are pregnant, 65 or older, or have a weakened immune system to heat deli meats to 165°F, or until steaming hot, before eating. Cooked-on-a-pizza prosciutto and salami are fine. More in <a href="/blog/can-you-eat-prosciutto-while-pregnant/">can you eat prosciutto while pregnant</a> and our <a href="/blog/pregnancy-safe-charcuterie-board/">pregnancy-safe board</a>.</p></div>
<div><b>"Uncured" and "no nitrates added"</b><p>In the US, these words usually mean the maker cured the meat with celery powder or another natural source of nitrite instead of sodium nitrite. The meat is still cured. USDA has said it plans to change these label rules.</p></div>
<div><b>How long does it keep?</b><p>An uncut dry salami keeps for weeks (check the label). Sliced deli meat is the most perishable: eat an opened pack within 3 to 5 days. On the table, perishable food shouldn't sit out more than 2 hours (1 hour above 90°F).</p></div>
</div>`;

// ---------- Markdown ----------
const faq = [
  ["How many types of cured meat are there?", "There's no official count. Almost every region of Italy, Spain, France and Germany has its own hams and sausages, so the true number runs into the hundreds. This guide covers 100, and nearly all cured meats fit into 8 families: cooked cold cuts, semi-dry sausages, whole-muscle meats, salami, jerky, cured fat, spreads and cured fish."],
  ["What are the main types of cured meat?", "Cooked and smoked cold cuts (ham, mortadella, pastrami), semi-dry sausages (summer sausage, meat sticks), whole-muscle cured meats (prosciutto, jamón, coppa, bresaola), dry-cured salami (Genoa, soppressata, chorizo), jerky and dried meats (beef jerky, biltong), cured fat (lardo, pancetta), spreads (pâté, rillettes, 'nduja) and cured fish (smoked salmon, anchovies)."],
  ["What is the difference between salami and prosciutto?", "Prosciutto is a whole pork leg that's salted and air-dried for many months, often more than a year, then sliced paper-thin. Salami is chopped meat and fat mixed with spices, stuffed into a casing, fermented and dried. Prosciutto tastes sweet and silky; salami is firmer, tangier and usually more seasoned."],
  ["Is cured meat raw?", "Many dry-cured meats, like prosciutto and salami, are never cooked. Salt, drying and fermentation make them safe, and they're sold ready to eat. Some cured meats are still raw and must be cooked, including pancetta, guanciale, bacon and Chinese sausage. Check the label for \"cook before eating\"."],
  ["What does uncured mean on a meat label?", "In the US, \"uncured\" usually means the meat was cured with a natural source of nitrite, such as celery powder, instead of sodium nitrite. It is still cured and still contains nitrite. USDA has said it plans to update these labeling rules."],
  ["What is the difference between charcuterie and salumi?", "Charcuterie is the French word for prepared meats (from chair cuite, \"cooked meat\") and is now used for any cured meat board. Salumi is the Italian word for cured meats. Salami is only one kind of salumi."],
  ["What are the best cured meats for a charcuterie board?", "Pick three from different families: one whole-muscle meat like prosciutto, one salami like Genoa or soppressata, and one surprise, like a spicy 'nduja, a pâté or bresaola for guests who don't eat pork. Plan about 2 ounces of meat per person when there's a meal and 3 to 4 when the board is the meal."],
];

const fm = {
  title: "Types of Cured Meat: 100 Kinds Explained, With a Chart",
  seo_title: "Types of Cured Meat: 100 Charcuterie Meats (Chart + Photos)",
  date: "2026-11-14",
  image: imgExists("/images/types-of-cured-meat.jpg") ? "/images/types-of-cured-meat.jpg" : "/images/best-meats-charcuterie-board.webp",
  excerpt: "Every cured meat fits one of 8 families, from deli ham to prosciutto, salami and jerky. Here are 100 types of cured meat with a searchable chart, what each tastes like, what to pair it with and which ones to cook first.",
  description: "100 types of cured meat explained: the 8 families of charcuterie, a searchable chart, Italian, Spanish and French meats, and which are raw or need cooking.",
  slug: "types-of-cured-meat",
  tags: ["types of cured meat", "cured meats", "types of charcuterie meat", "list of cured meats", "charcuterie meats", "italian cured meats", "salumi", "deli meats", "cured meat chart", "dry cured meat"],
};
const fmText = `---
title: "${fm.title}"
seo_title: "${fm.seo_title}"
date: "${fm.date}"
image: "${fm.image}"
excerpt: "${fm.excerpt}"
description: "${fm.description}"
faq: "${JSON.stringify(faq.map(([question, answer]) => ({ question, answer })))}"
slug: "${fm.slug}"
tags: "${JSON.stringify(fm.tags)}"
---`;

const count = Object.fromEntries(FAMILIES.map((f) => [f.key, rows.filter((r) => r.f === f.key).length]));

const md = `${fmText}

# ${fm.title}

> **Quick Answer:** There are hundreds of cured meats, but almost all of them fit into **8 families**. Five sit on a line from **cooked** deli meats (moist and mild) through **semi-dry** sausages, **whole-muscle** meats like prosciutto and **salami** to **jerky** (dry and intense). The other three are **cured fat** like lardo, **pâtés and spreads**, and **cured fish**. Know the family and you know roughly how it will taste, and whether you need to cook it.

:::html
${spectrum}
:::

:::html
${lineup}
${jump}
:::

:::html
<h2 id="families">The 8 types of cured meat at a glance</h2>
<p class="sk-lede">Cured meats mostly differ in two ways: <strong>whether they're cooked or dried</strong>, and <strong>whether they're a whole cut or chopped</strong>. The drier and older, the stronger the flavor.</p>
:::

:::html
<div class="tc-glance">${FAMILIES.map((f) => `<a href="#${f.key}" class="tc-gl" style="--fc:${f.color}"><span class="tc-famn">${f.n}</span><span class="tc-gl-main"><b>${esc(f.long)}</b><span class="tc-gl-taste">${GLANCE_TASTE[f.key]}</span><span class="tc-gl-ex">${famExamples[f.key]}</span></span><span class="tc-gl-aged"><small>Aged</small>${f.aged}</span></a>`).join("")}</div>
:::

:::html
${howMade}
:::

**Building a board?** Pick one meat from three different families, like a whole-muscle meat (${mdL("prosciutto-di-parma", "prosciutto")}), a salami (${mdL("soppressata", "soppressata")}) and something spreadable (${mdL("pate-de-campagne", "pâté")}), and every guest finds a favorite. See [the best meats for a charcuterie board](/blog/best-meats-charcuterie-board/) and [how much charcuterie per person](/blog/how-much-charcuterie-per-person/).

:::html
${chart}
${shareBox}
:::

:::html
${FAMILIES.map(famSection).join("\n")}
:::

:::html
${countryHtml}
${jobsHtml}
${ladderHtml}
${safety}
:::

:::html
<h2 id="label">Words you'll see on the label</h2>
:::

| Word | What it means |
|---|---|
| **Dry-cured** | Salted and air-dried, not cooked. Prosciutto, jamón and most salami. |
| **Fermented** | Friendly bacteria were added to give a tang and help preserve it. Most salami and summer sausage. |
| **Fully cooked** | Cooked during processing, so it's ready to eat cold or warm. Ham, mortadella, kielbasa. |
| **Cook before eating** | Cured but still raw. Bacon, pancetta, guanciale, lap cheong. |
| **Uncured** | In the US, cured with celery powder or another natural nitrite source. Still cured. |
| **Curing salt (pink salt)** | Salt mixed with a little sodium nitrite, dyed pink so it isn't mistaken for table salt. |
| **PDO / DOP / AOP** | A protected name: made in one region by set rules. ${mdL("prosciutto-di-parma")} is one. |
| **PGI / IGP** | Protected too, with looser rules than PDO. ${mdL("speck")} Alto Adige and ${mdL("bresaola")} della Valtellina are examples. |
| **Ibérico de bellota** | From Ibérico pigs fattened on acorns. A black label means 100% Ibérico and acorn-fed, the top grade. |
| **White coating** | The powdery mold on salami. It's harmless and part of the aging, but most people peel the casing off. |

## Good to know

- **How much to buy:** about 2 ounces of meat per person with a meal, 3 to 4 ounces when the board is the meal. Here's [how much charcuterie per person](/blog/how-much-charcuterie-per-person/).
- **Serving:** take whole-muscle meats and salami out of the fridge about 20 minutes early so the fat softens and the flavor opens up. Fold, don't stack, so slices don't stick.
- **Shaping:** try a [salami rose](/blog/how-to-make-a-salami-rose/), a [salami river](/blog/salami-river/) or a [prosciutto rose](/blog/prosciutto-rose/).
- **Why it lasts:** salt, drying and acidity keep bacteria from growing. Here's [why cured meat doesn't spoil](/blog/why-cured-meat-doesnt-spoil/).

## Related Reading

- [The Best Meats for a Charcuterie Board](/blog/best-meats-charcuterie-board/)
- [Types of Salami](/blog/types-of-salami/)
- [Types of Cheese: 100 Cheeses Explained](/blog/types-of-cheese/)
- [How Much Charcuterie per Person](/blog/how-much-charcuterie-per-person/)
- [The Best Salami Brands](/blog/best-salami-brands/)
- [All Cured Meat & Seafood Guides](/ingredients/cured-meat-and-seafood/)

## Sources

- [Consorzio del Prosciutto di Parma: New production rules](https://www.prosciuttodiparma.com/en/news/parma-ham-consortium-announces-new-production-rules/)
- [USDA FSIS: Jerky and Food Safety](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-fish/jerky)
- [USDA FSIS: Response to the petition on "uncured" and "no nitrate or nitrite added" labels (PDF)](https://www.fsis.usda.gov/sites/default/files/media_file/2021-04/19-03-fsis-final-response.pdf)
- [CDC: Listeria and deli meats](https://www.cdc.gov/listeria/outbreaks/deli-meat-and-cheese-11-22.html)
- [FoodSafety.gov: Cold food storage chart](https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts)

:::html
<h2 id="faq">FAQ</h2>
:::

${faq.map(([q, a]) => `**${q}**\n\n${a}`).join("\n\n")}
`;

fs.writeFileSync(join(SITE, "content", "blog", "types-of-cured-meat.md"), md);
console.log("written", md.length, "chars; families", count, "; with photos", rows.filter((r) => r.img).length);
