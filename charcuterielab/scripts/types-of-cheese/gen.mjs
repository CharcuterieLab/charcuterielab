// Builds content/blog/types-of-cheese.md from data.mjs (Nov 3, 2026).
// Run from the charcuterielab folder:  node scripts/types-of-cheese/gen.mjs
// Re-run it after adding photos: a cheese without an ingredient page shows a
// drawn wedge until /images/cheese-types/<id>.jpg exists and make-thumbs.py
// has been run. The hero and the families photo are used once they exist.
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { FAMILIES, CHEESES, STRENGTH, milkKey } from "./data.mjs";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = JSON.parse(fs.readFileSync(join(SITE, "public/images/thumbs/manifest.json"), "utf8"));
const ingDir = join(SITE, "..", "content", "ingredients");
const imgExists = (p) => fs.existsSync(join(SITE, "public", p)) && fs.statSync(join(SITE, "public", p)).size > 0;
const pages = new Set(fs.readdirSync(ingDir).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fam = Object.fromEntries(FAMILIES.map((f) => [f.key, f]));

const rows = CHEESES.map(([id, name, f, milk, from, str, taste, pair, uses, price, link]) => {
  const hasPage = pages.has(id) && link === undefined;
  const href = hasPage ? `/ingredients/${id}/` : link || "";
  const own = `/images/cheese-types/${id}.jpg`;
  const t = hasPage ? manifest.thumbs[`/images/ingredients/${id}.jpg`] : manifest.thumbs[own];
  const img = t && t.s ? { s: t.s, m: t.m || t.s } : null;
  return { id, name, f, milk, from, str, taste, pair, uses: uses.split(" "), price, href, img, mk: milkKey(milk) };
});
if (rows.length !== 100) throw new Error(`expected 100, got ${rows.length}`);
for (const r of rows) if (!fam[r.f]) throw new Error(`bad family ${r.f}`);
const missingPages = [...pages].filter((p) => {
  const t = fs.readFileSync(`${ingDir}/${p}.md`, "utf8");
  return /^category: "Cheese"/m.test(t) && !rows.some((r) => r.id === p);
});
if (missingPages.length) throw new Error(`cheese pages not used: ${missingPages}`);
const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
const L = (id, label) => {
  const r = byId[id];
  if (!r) throw new Error(`no cheese ${id}`);
  const text = esc(label || r.name);
  return r.href ? `<a href="${r.href}">${text}</a>` : text;
};
const mdL = (id, label) => {
  const r = byId[id];
  if (!r) throw new Error(`no cheese ${id}`);
  return r.href ? `[${label || r.name}](${r.href})` : label || r.name;
};

const dots = (n) => `<span class="tc-str" aria-label="Strength ${n} of 5: ${STRENGTH[n]}">${[1, 2, 3, 4, 5].map((i) => `<i${i <= n ? ' class="on"' : ""}></i>`).join("")}</span>`;
const wedge = `<svg viewBox="0 0 64 48" aria-hidden="true"><path d="M6 38 L58 38 L58 22 L6 38 Z" fill="currentColor" opacity=".35"/><path d="M6 38 L58 22 L44 10 Z" fill="currentColor" opacity=".7"/><circle cx="40" cy="30" r="2.6" fill="#fff" opacity=".7"/><circle cx="50" cy="27" r="1.8" fill="#fff" opacity=".7"/></svg>`;

function card(r) {
  const F = fam[r.f];
  const pic = r.img
    ? `<img src="${r.img.s}" srcset="${r.img.s} 240w, ${r.img.m} 640w" sizes="(max-width: 640px) 46vw, 240px" alt="${esc(r.name)} cheese" width="240" height="161" loading="lazy" decoding="async">`
    : `<span class="tc-noimg" style="--fc:${F.color}">${wedge}</span>`;
  const inner = `<span class="tc-card-pic">${pic}</span><span class="tc-card-body"><span class="tc-card-name">${esc(r.name)}</span><span class="tc-card-meta">${esc(r.milk)} · ${esc(r.from)}</span>${dots(r.str)}<span class="tc-card-taste">${esc(r.taste)}</span><span class="tc-card-pair"><b>Try with:</b> ${esc(r.pair)}</span></span>`;
  return r.href ? `<a class="tc-card" href="${r.href}">${inner}</a>` : `<div class="tc-card">${inner}</div>`;
}

// ---------- Top visual: the cheese spectrum ----------
const line = ["fresh", "bloomy", "semisoft", "firm", "hard"].map((k) => fam[k]);
const extra = ["blue", "washed", "flavored"].map((k) => fam[k]);
const spectrum = `<div class="tc-spec" role="img" aria-label="Cheese families arranged from fresh, soft and mild to hard, aged and strong, with blue, washed-rind, flavored and plant-based cheeses made with an extra step">
<p class="tc-spec-label">Every cheese in one picture</p>
<div class="tc-spec-ends"><span>← Wetter · younger · milder</span><span>Drier · older · stronger →</span></div>
<p class="tc-spec-m">Top to bottom: wetter and milder, down to drier and stronger</p>
<div class="tc-spec-line">${line.map((f) => `<a href="#${f.key}" style="--fc:${f.color}"><b>${f.n}</b><span>${f.name}</span><small>${esc(byId[{ fresh: "ricotta", bloomy: "brie", semisoft: "havarti", firm: "aged-cheddar", hard: "parmigiano-reggiano" }[f.key]].name)}</small></a>`).join("")}</div>
<p class="tc-spec-sub">Plus three made with an extra step</p>
<div class="tc-spec-extra">${extra.map((f) => `<a href="#${f.key}" style="--fc:${f.color}"><b>${f.n}</b><span>${f.name}</span><small>${{ blue: "Mold grown inside", washed: "Rind washed in brine", flavored: "Something added", plant: "No dairy" }[f.key]}</small></a>`).join("")}</div>
<p class="tc-spec-df">Dairy-free? Jump to <a href="#plant">plant-based cheese</a>.</p>
</div>`;

const jump = `<nav class="sk-jump" data-tc-jump aria-label="On this page"><a href="#families">The 8 families</a><a href="#chart">Cheese chart (all 100)</a>${FAMILIES.map((f) => `<a href="#${f.key}">${f.name}</a>`).join("")}<a href="#milk">Cow, goat or sheep?</a><a href="#for-the-job">Best cheese for…</a><a href="#ladder">If you like X, try Y</a><a href="#label">Label words</a><a href="#faq">FAQ</a></nav>`;

// ---------- The chart ----------
const milkOpts = [["", "Any milk"], ["cow", "Cow"], ["goat", "Goat"], ["sheep", "Sheep"], ["mixed", "Mixed / other"], ["plant", "Plant-based"]];
const chart = `<h2 id="chart">The cheese chart: all 100 types</h2>
<p class="sk-lede">The full list of cheeses in this guide. Tap a family, pick a milk or type a name, and tap any linked cheese to open its full guide.</p>
<div class="tc-key">
<p class="tc-key-h">How to read the chart</p>
<div class="tc-key-str" aria-label="Strength scale from 1 to 5">${[1, 2, 3, 4, 5].map((n) => `<span>${dots(n)}<b>${STRENGTH[n]}</b><small>${["", "Milky, kid-friendly", "A little tang or butter", "Nutty, savory, real character", "Sharp, salty or funky", "Very sharp or pungent"][n]}</small></span>`).join("")}</div>
<ul>
<li><strong>Family</strong> is how the cheese is made: how much water is left, how long it aged, and any extra step (blue mold, a washed rind, something added).</li>
<li><strong>Strength</strong> is how intense it is to eat, smell included, for a typical piece from a US store. Age changes it: an aged Gouda is much stronger than a young one.</li>
<li><strong>Try with</strong> is one classic pairing. Each cheese's own guide has the full list.</li>
<li><strong>How we picked the 100:</strong> all ${rows.filter((r) => r.href.startsWith("/ingredients/")).length} cheeses with a Charcuterie Lab ingredient guide, plus ${rows.filter((r) => !r.href.startsWith("/ingredients/")).length} everyday supermarket cheeses like American, Colby and cottage cheese.</li>
</ul>
</div>
<div class="tc-chart" data-tc-chart>
<div class="tc-controls">
<div class="tc-chips" role="group" aria-label="Filter by family"><button type="button" class="on" data-fam="">All</button>${FAMILIES.map((f) => `<button type="button" data-fam="${f.key}" style="--fc:${f.color}">${f.name}</button>`).join("")}</div>
<div class="tc-row">
<label class="tc-field"><span>Search</span><input type="search" placeholder="e.g. brie, Spain, honey" data-tc-q></label>
<label class="tc-field"><span>Milk</span><select data-tc-milk>${milkOpts.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>
<label class="tc-field"><span>Strength</span><select data-tc-str><option value="">Any</option><option value="1-2">Mild (1–2)</option><option value="3">Medium (3)</option><option value="4-5">Bold (4–5)</option></select></label>
<label class="tc-field"><span>Sort</span><select data-tc-sort><option value="fam">By family</option><option value="az">A to Z</option><option value="mild">Mildest first</option><option value="bold">Boldest first</option></select></label>
</div>
<p class="tc-count" aria-live="polite" data-tc-count>Showing all 100 cheeses</p>
</div>
<div class="tc-tablewrap"><table class="tc-table">
<thead><tr><th>Cheese</th><th>Family</th><th>Milk</th><th>From</th><th>Strength</th><th>Tastes like</th><th>Try with</th></tr></thead>
<tbody>
${rows.map((r, i) => `<tr data-i="${i}" data-fam="${r.f}" data-milk="${r.mk}" data-str="${r.str}" data-name="${esc(r.name.toLowerCase())}" data-text="${esc([r.name, r.milk, r.from, r.taste, r.pair, fam[r.f].name].join(" ").toLowerCase())}"><td data-l="Cheese" class="tc-name">${r.href ? `<a href="${r.href}">${esc(r.name)}</a>` : esc(r.name)}</td><td data-l="Family"><span class="tc-fam" style="--fc:${fam[r.f].color}">${fam[r.f].name}</span></td><td data-l="Milk" data-from="${esc(r.from)}">${esc(r.milk)}</td><td data-l="From">${esc(r.from)}</td><td data-l="Strength">${dots(r.str)} <span class="tc-strw">${STRENGTH[r.str]}</span></td><td data-l="Tastes like">${esc(r.taste)}</td><td data-l="Try with">${esc(r.pair)}</td></tr>`).join("\n")}
</tbody></table></div>
<button type="button" class="button tc-more-btn" data-tc-more hidden>Show all 100 cheeses</button>
<p class="tc-empty" data-tc-empty hidden>No cheese matches that. Try fewer filters.</p>
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
ct.textContent=filtered?('Showing '+n+' of 100 cheeses'):(open?'Showing all 100 cheeses':'Showing '+shown+' of 100 cheeses');
mb.hidden=filtered||open;em.hidden=n>0}
c.classList.add('js');run();})();
</script>`;

// ---------- Family sections ----------
const famExamples = {
  fresh: "ricotta, mozzarella, burrata, feta, goat cheese",
  bloomy: "Brie, Camembert, Humboldt Fog",
  semisoft: "Havarti, Monterey Jack, young Gouda, provolone",
  firm: "cheddar, Gruyère, Manchego, Comté",
  hard: "Parmigiano-Reggiano, Pecorino Romano, aged Gouda",
  blue: "Gorgonzola, Stilton, Roquefort",
  washed: "Taleggio, Époisses, Limburger",
  flavored: "smoked Gouda, truffle cheese, cranberry Wensleydale",
  plant: "cashew cheese, vegan Brie",
};
const SHOW = 6;
// Head-to-head posts that already exist, shown under each family's cards.
const CONFUSED = {
  fresh: [["/blog/burrata-vs-mozzarella/", "Burrata vs. mozzarella"]],
  bloomy: [["/blog/brie-vs-camembert/", "Brie vs. Camembert"]],
  semisoft: [["/blog/gouda-vs-edam/", "Gouda vs. Edam"]],
  firm: [["/blog/gruyere-vs-comte/", "Gruyère vs. Comté"], ["/blog/manchego-vs-pecorino/", "Manchego vs. Pecorino"], ["/blog/white-vs-orange-cheddar/", "White vs. orange cheddar"]],
  hard: [["/blog/parmesan-vs-parmigiano-reggiano/", "Parmesan vs. Parmigiano-Reggiano"]],
};
function famSection(f) {
  const list = rows.filter((r) => r.f === f.key);
  const head = list.slice(0, SHOW).map(card).join("");
  const rest = list.slice(SHOW).map(card).join("");
  return `<h2 id="${f.key}" class="tc-famh" style="--fc:${f.color}"><span class="tc-famn">${f.n}</span> ${esc(f.long)} <span class="tc-famc">${list.length} cheeses</span></h2>
<p class="tc-what">${f.what}</p>
<div class="tc-facts" style="--fc:${f.color}"><div><span>Texture</span><b>${f.texture}</b></div><div><span>Aged</span><b>${f.aged}</b></div><div><span>Best for</span><b>${f.best}</b></div></div>
<p class="tc-why"><strong>Why it tastes this way:</strong> ${f.why}</p>
<div class="tc-cards">${head}</div>
${rest ? `<details class="tc-moreset"><summary>See all ${list.length} ${esc(f.name.toLowerCase())} cheeses</summary><div class="tc-cards">${rest}</div></details>` : ""}
${CONFUSED[f.key] ? `<p class="tc-vs"><span>Often confused:</span> ${CONFUSED[f.key].map(([href, t]) => `<a href="${href}">${t}</a>`).join("")}</p>` : ""}
<p class="tc-tip" style="--fc:${f.color}"><span>Tip</span> ${f.tip}</p>`;
}

// ---------- Milk ----------
const milk = `<h2 id="milk">Cow, goat, sheep or buffalo? How milk changes the taste</h2>
<div class="tc-milk">
<div><b>Cow</b><p>Mild, buttery and sweet. Most cheese sold in the US.</p><small>${L("aged-cheddar", "Cheddar")}, ${L("brie")}, ${L("gouda", "Gouda")}, ${L("parmigiano-reggiano", "Parmigiano")}</small></div>
<div><b>Goat</b><p>Bright, tangy and lemony. Bright white, because goats turn the yellow pigment in grass into colorless vitamin A.</p><small>${L("fresh-chevre", "Chèvre")}, ${L("humboldt-fog")}, ${L("bucheron")}</small></div>
<div><b>Sheep</b><p>Rich, nutty and buttery. Sheep's milk has more fat and protein than cow's milk, so the cheese tastes rich even when young.</p><small>${L("manchego")}, ${L("pecorino-romano")}, ${L("roquefort")}</small></div>
<div><b>Buffalo</b><p>Very rich, sweet and creamy. Mostly used for mozzarella di bufala.</p><small>${L("fresh-mozzarella", "Fresh mozzarella")}, some ${L("burrata", "burrata")}</small></div>
</div>`;

// ---------- Jobs ----------
const jobs = [
  ["Best for melting", ["gruyere", "fontina", "raclette", "monterey-jack", "havarti", "low-moisture-mozzarella", "oaxaca", "american"]],
  ["Best for grating", ["parmigiano-reggiano", "grana-padano", "pecorino-romano", "asiago", "parmesan", "ricotta-salata"]],
  ["Best for crumbling", ["feta", "cotija", "queso-fresco", "fresh-chevre", "danish-blue", "maytag-blue"]],
  ["Won't melt (grill or fry it)", ["halloumi", "paneer", "queso-blanco", "juustoleipa"]],
  ["Best for spreading", ["cream-cheese", "boursin", "mascarpone", "ricotta", "stracciatella", "harbison"]],
  ["Mild crowd-pleasers", ["havarti", "gouda", "colby-jack", "baby-swiss", "brie", "jarlsberg"]],
  ["Showpieces for a board", ["humboldt-fog", "morbier", "mimolette", "tete-de-moine", "drunken-goat", "burrata"]],
  ["For the adventurous", ["epoisses", "roquefort", "cabrales", "limburger", "red-hawk", "langres"]],
];
const jobsHtml = `<h2 id="for-the-job">The best cheese for the job</h2>
<div class="tc-jobs">${jobs.map(([t, ids]) => `<div><b>${t}</b><p>${ids.map((id) => L(id)).join(" · ")}</p></div>`).join("")}</div>`;

// ---------- Ladder ----------
const ladder = [
  ["Soft and creamy", "brie", "camembert", "taleggio", "epoisses"],
  ["Nutty and firm", "swiss", "gruyere", "comte", "beaufort"],
  ["Sharp", "mild-cheddar", "aged-cheddar", "aged-gouda", "parmigiano-reggiano"],
  ["Blue", "cambozola", "gorgonzola", "stilton", "roquefort"],
  ["Goat", "midnight-moon", "fresh-chevre", "humboldt-fog", "crottin-de-chavignol"],
  ["Sheep", "pecorino-toscano", "manchego", "idiazabal", "pecorino-romano"],
];
const ladderHtml = `<h2 id="ladder">If you like this, try that</h2>
<p class="sk-lede">Each row goes from easy to bold. Find a cheese you already like and take one step right.</p>
<div class="tc-ladder">${ladder.map(([t, ...ids]) => `<div class="tc-lrow"><span class="tc-lt">${t}</span><ol>${ids.map((id) => `<li>${L(id)}</li>`).join("")}</ol></div>`).join("")}</div>`;

// ---------- Markdown ----------
const faq = [
  ["How many types of cheese are there?", "There's no official count. By some estimates there are more than 1,800, according to Wisconsin Cheese. Nearly all of them fit into 8 families: fresh, soft-ripened, semi-soft, firm, hard, blue, washed-rind and flavored. Once you know the family, you can roughly guess how a new cheese will taste."],
  ["What are the main types of cheese?", "Fresh (ricotta, mozzarella, feta), soft-ripened (Brie, Camembert), semi-soft (Havarti, Monterey Jack), firm (cheddar, Gruyère, Manchego), hard (Parmigiano-Reggiano, Pecorino Romano), blue (Gorgonzola, Stilton), washed-rind (Taleggio, Époisses) and flavored or specialty (smoked Gouda, truffle cheese)."],
  ["What is the most popular cheese in the US?", "Mozzarella. Americans ate about 12.5 pounds of mozzarella per person in 2024, compared with 10.9 pounds of cheddar, according to USDA data reported by Cheese Reporter. Pizza is a big reason why."],
  ["What is the difference between soft and hard cheese?", "Mostly water and time. Soft cheeses keep more moisture and are eaten young, so they taste milky and mild. Hard cheeses are pressed to remove whey and aged for months or years, so they're drier, saltier and more intense, and they keep much longer."],
  ["What are the mildest cheeses?", "Fresh mozzarella, ricotta, Havarti, young Gouda, Colby Jack, Monterey Jack, Baby Swiss and Brie are the mildest common cheeses. They're the safest picks for kids and picky eaters."],
  ["What cheese melts best?", "Gruyère, Fontina, Raclette, Monterey Jack, Havarti, low-moisture mozzarella, Oaxaca and American cheese melt the smoothest. Halloumi, paneer and queso blanco barely melt at all, which is why you can grill or fry them."],
  ["Which cheeses smell strong but taste mild?", "Washed-rind cheeses. Taleggio, Limburger and Pont-l'Évêque smell much stronger than they taste. The smell comes from bacteria on the rind, and the inside is usually buttery and mild."],
];

const fm = {
  title: "Types of Cheese: 100 Cheeses Explained, With a Chart",
  seo_title: "Types of Cheese: 100 Kinds Explained (Chart + Photos)",
  date: "2026-11-03",
  image: imgExists("/images/types-of-cheese.jpg") ? "/images/types-of-cheese.jpg" : "/images/best-cheese-charcuterie-board.webp",
  excerpt: "Every cheese fits one of 8 families, from fresh and mild to hard and aged. Here are 100 types of cheese with photos, a searchable chart, what each tastes like, what to pair it with and which to buy for melting, grating or a board.",
  description: "100 types of cheese explained: the 8 cheese families, a searchable cheese chart with milk, origin, strength and pairings, photos of every cheese, the best cheeses for melting and grating, and how to move from mild to bold.",
  slug: "types-of-cheese",
  tags: ["types of cheese", "different types of cheese", "kinds of cheese", "cheese types", "list of cheeses", "cheese chart", "cheese varieties", "soft cheese", "hard cheese", "blue cheese"],
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

> **Quick Answer:** There are more than 1,800 cheeses, but almost all of them fit into **8 families**. Five sit on a line from **fresh** (wet, young, mild) through **soft-ripened**, **semi-soft** and **firm** to **hard** (dry, old, strong). The other three get an extra step: **blue** (mold grown inside), **washed-rind** (the stinky ones) and **flavored**. Know the family and you know roughly how a cheese will taste.

:::html
${spectrum}
${jump}
:::

${imgExists("/images/types-of-cheese-families.jpg") ? "" : "<!--families-photo-->"}![Eight cheeses in a row on a long marble slab, one from each family, left to right: fresh mozzarella, Brie, Havarti, aged cheddar, Parmigiano-Reggiano, blue Stilton, orange-rinded Taleggio and smoked Gouda](/images/types-of-cheese-families.jpg)

:::html
<h2 id="families">The 8 types of cheese at a glance</h2>
<p class="sk-lede">The different kinds of cheese mostly differ in two ways: <strong>how much water is left</strong> and <strong>how long they aged</strong>. Less water and more time means firmer and stronger.</p>
:::

:::html
<div class="tc-glance">${FAMILIES.map((f) => `<a href="#${f.key}" class="tc-gl" style="--fc:${f.color}"><span class="tc-famn">${f.n}</span><span class="tc-gl-main"><b>${esc(f.long)}</b><span class="tc-gl-taste">${{ fresh: "Milky, tangy, mild", bloomy: "Buttery, mushroomy", semisoft: "Mild, buttery", firm: "Nutty, savory, sharper with age", hard: "Salty, savory, intense", blue: "Sharp, salty, peppery", washed: "Rich and meaty; smells strong", flavored: "Whatever's added", plant: "Nutty, tangy" }[f.key]}</span><span class="tc-gl-ex">${famExamples[f.key]}</span></span><span class="tc-gl-aged"><small>Aged</small>${f.aged}</span></a>`).join("")}</div>
:::

**Building a board?** Pick one cheese from three different families, like a soft one (${mdL("brie")}), a firm one (${mdL("manchego")}) and a blue (${mdL("gorgonzola")}), and every guest finds something they like. See [the best cheeses for a charcuterie board](/blog/best-cheese-charcuterie-board/) and [how many cheeses to serve](/blog/how-many-cheeses/).

:::html
${chart}
:::

:::html
${FAMILIES.map(famSection).join("\n")}
:::

:::html
${milk}
${jobsHtml}
${ladderHtml}
:::

Want a slower climb? Our [12 cheeses from mild to strong](/blog/cheeses-from-mild-to-strong/) takes it one step at a time, and [15 cheeses most people have never tried](/blog/cheeses-you-have-never-tried/) picks up where this leaves off.

:::html
<h2 id="label">Words you'll see on the label</h2>
:::

| Word | What it means |
|---|---|
| **Rind** | The outside of the cheese. Bloomy and washed rinds are edible. Skip wax, cloth and very hard rinds. |
| **Paste** | The inside of the cheese. |
| **Bloomy rind** | A white, fuzzy mold rind, like on ${mdL("brie")}. |
| **Washed rind** | A sticky orange rind washed in brine, beer or wine, like on ${mdL("taleggio")}. |
| **Natural rind** | A rind that forms by itself as the cheese dries, like on ${mdL("tomme-de-savoie")}. |
| **Pasta filata** | "Stretched curd": the curd is heated and stretched. Mozzarella, provolone, Oaxaca, string cheese. |
| **Raw milk** | Unpasteurized. In the US, raw-milk cheese has to be aged at least 60 days. |
| **PDO / DOP / AOP** | A protected name. It must be made in one region, by set rules. ${mdL("parmigiano-reggiano")}, ${mdL("roquefort")} and ${mdL("manchego")} are examples. |
| **Crystals** | Crunchy white bits in aged cheese: harmless crystals of amino acids or calcium lactate that form with age. Not mold. |

## Good to know

- **Pregnant?** In the US, most cheese made with pasteurized milk is fine, but be careful with soft Latin-style cheeses like queso fresco. See [which cheeses are safe during pregnancy](/blog/cheese-safe-during-pregnancy/).
- **Lactose:** Long-aged hard cheeses like ${mdL("parmigiano-reggiano")}, aged cheddar and ${mdL("aged-gouda")} have very little lactose. Most of it drains off with the whey, and aging breaks down what's left.
- **Serving:** Take hard cheese out of the fridge 45 to 60 minutes before serving and soft cheese 20 to 30 minutes before. Cold cheese tastes muted. Here's [how to cut each shape](/blog/how-to-cut-cheese-charcuterie-board/).
- **Storing:** Wrap it in cheese paper or wax paper, not tight plastic. See [how to store cheese](/blog/cheese-storage/) and [whether you can freeze it](/blog/can-you-freeze-cheese/).

## Related Reading

- [The Best Cheese for a Charcuterie Board](/blog/best-cheese-charcuterie-board/)
- [12 Cheeses from Mild to Strong](/blog/cheeses-from-mild-to-strong/)
- [15 Cheeses Most People Have Never Tried](/blog/cheeses-you-have-never-tried/)
- [How Much Cheese for a Charcuterie Board](/blog/how-much-cheese-charcuterie-board/)
- [Wine and Cheese Pairing Chart](/pairings/wine-and-cheese-chart/)
- [All Cheese Guides](/ingredients/cheese/)

## Sources

- [Wisconsin Cheese: Different Types of Cheese](https://wisconsincheese.com/about-cheese/different-types-of-cheese)
- [Cheese Reporter: Per capita cheese consumption in 2024 (USDA data)](https://cheesereporter.com/column/2026/01/13/per-capita-cheese-consumption-declined-in-2024-to-lowest-level-since-2021/)
- [eCFR: 21 CFR Part 133, Cheeses and related cheese products](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-133)
- [CDC: Preventing Listeria Infection](https://www.cdc.gov/listeria/prevention/index.html)

:::html
<h2 id="faq">FAQ</h2>
:::

${faq.map(([q, a]) => `**${q}**\n\n${a}`).join("\n\n")}
`;

const out = md.replace(/^<!--families-photo-->.*\n\n/m, "");
fs.writeFileSync(join(SITE, "content", "blog", "types-of-cheese.md"), out);
console.log("written", md.length, "chars; families", count);
