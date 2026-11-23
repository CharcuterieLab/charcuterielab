// Food pairing pages and the pairings hub (23 Nov 2026).
// Food pages (/pairings/food/<slug>/):
//  - "All N pairings, ranked by type" becomes tabs (Sweet, Crunch, Salty...):
//    one group shows at a time, so the section is about one phone screen, not four.
//  - Quick answers show the first 3; the rest sit behind "Show N more answers".
//  - The free-printable box (second email ask) moves from under the top 5 to
//    just above the drinks, so the first screens carry one ask, not two.
//  - Cheese pages link to their row of the wine and cheese chart.
// Hub (/pairings/): the bookshelf moves below the six rules, the old one-line
// shelf and the separate "Printable pairing charts" section go (the tools list
// at the top already links both charts), and the food tabs get their script.
// Everything stays in the HTML: the script only hides and shows.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const QA_SHOW = 3;

const TAB_JS = `<script>(function(){
function tabs(box){var t=[].slice.call(box.querySelectorAll("[data-fp-tab]")),p=[].slice.call(box.querySelectorAll("[data-fp-panel]"));if(!t.length)return null;
function show(id,f){t.forEach(function(b){var on=b.getAttribute("data-fp-tab")===id;b.setAttribute("aria-selected",on?"true":"false");b.tabIndex=on?0:-1;if(on&&f)b.focus()});p.forEach(function(x){x.hidden=x.getAttribute("data-fp-panel")!==id})}
box.classList.add("fp-on");t.forEach(function(b,i){b.addEventListener("click",function(){show(b.getAttribute("data-fp-tab"))});b.addEventListener("keydown",function(e){var k=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;if(!k)return;e.preventDefault();var n=t[(i+k+t.length)%t.length];show(n.getAttribute("data-fp-tab"),true)})});
show(t[0].getAttribute("data-fp-tab"));return show}
var boxes=[].slice.call(document.querySelectorAll("[data-fp-tabs]")).map(function(b){return{b:b,show:tabs(b)}});
var qa=document.querySelector("[data-fp-fold]"),qb=null;
if(qa){var it=[].slice.call(qa.querySelectorAll(".pr-qa-item"));if(it.length>${QA_SHOW}){it.slice(${QA_SHOW}).forEach(function(x){x.hidden=true});var w=document.createElement("p");w.className="fp-more";qb=document.createElement("button");qb.type="button";qb.className="button";qb.textContent="Show "+(it.length-${QA_SHOW})+" more answers";w.appendChild(qb);qa.appendChild(w);qb.addEventListener("click",function(){it.forEach(function(x){x.hidden=false});w.hidden=true})}}
function go(){var id=location.hash.slice(1),e=id&&document.getElementById(id);if(!e)return;boxes.forEach(function(o){if(!o.show)return;var pn=e.closest&&e.closest("[data-fp-panel]");if(pn&&o.b.contains(pn))o.show(pn.getAttribute("data-fp-panel"))});if(qb&&e.closest&&e.closest(".pr-qa-item[hidden]"))qb.click();if(e.closest&&e.closest("[hidden]"))return;e.scrollIntoView()}
if(location.hash)go();window.addEventListener("hashchange",go);
})();</script>`;

let chartRows = null;
function chartAnchor(dist, slug) {
  if (chartRows === null) {
    chartRows = new Map();
    try {
      const c = readFileSync(join(dist, "pairings/wine-and-cheese-chart/index.html"), "utf8");
      for (const m of c.matchAll(/<section[^>]*id="(wc-[a-z]+)"[\s\S]*?<\/section>/g)) {
        for (const a of m[0].matchAll(/href="\/pairings\/food\/([^/"]+)\/"/g)) if (!chartRows.has(a[1])) chartRows.set(a[1], m[1]);
      }
      // cheeses only in the chart table still get the chart, at the top
      for (const a of c.matchAll(/<tr data-row="([^"]+)"/g)) if (!chartRows.has(a[1])) chartRows.set(a[1], "pr-chart");
    } catch { /* chart page missing: no links */ }
  }
  return chartRows.get(slug) || "";
}

// the whole element starting at `at` (balanced on tag name)
function elementAt(html, at, tag) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
  re.lastIndex = at;
  let depth = 0;
  for (let m; (m = re.exec(html));) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(at, m.index + m[0].length);
  }
  return "";
}

function foodPage(html, path, dist) {
  let n = 0;
  const slug = path.split("/")[3];
  // 1. ranked groups as tabs
  const allAt = html.indexOf('<section class="bl-section" aria-labelledby="all-h">');
  if (allAt > 0) {
    const sec = elementAt(html, allAt, "section");
    const groups = [...sec.matchAll(/<div class="pr-group" id="g-([a-z-]+)">\s*<h3>([^<]*?)\s*<span class="pr-count">(\d+)<\/span><\/h3>/g)];
    if (groups.length > 1) {
      let s = sec.replace('<section class="bl-section" aria-labelledby="all-h">', '<section class="bl-section fp-tabbox fp-all" aria-labelledby="all-h" data-fp-tabs>');
      s = s.replace(/<p class="pr-jump pr-jump-groups">[\s\S]*?<\/p>/, `<div class="fp-tabs" role="tablist" aria-label="Pairings by type">${groups.map((g, i) => `<button type="button" role="tab" id="fpt-${g[1]}" aria-controls="g-${g[1]}" aria-selected="${i === 0}" data-fp-tab="${g[1]}">${g[2].replace(/^Something /, "").replace(/^Another /, "").replace(/^./, (c) => c.toUpperCase())} <span>${g[3]}</span></button>`).join("")}</div>`);
      s = s.replace(/<div class="pr-group" id="g-([a-z-]+)">/g, '<div class="pr-group" id="g-$1" role="tabpanel" aria-labelledby="fpt-$1" data-fp-panel="$1">');
      html = html.replace(sec, s);
      n++;
    }
  }
  // 1b. the bookshelf lands inside the ranked list (40-60% rule); move it below
  // the skip list (or the drinks), so the tabs sit right under their heading
  {
    const aAt = html.indexOf('aria-labelledby="all-h"');
    const shAt = html.indexOf('<aside class="book-shelf"');
    if (aAt > 0 && shAt > aAt) {
      const secStart = html.lastIndexOf("<section", aAt);
      const sec = elementAt(html, secStart, "section");
      if (shAt < secStart + sec.length) {
        const shelf = elementAt(html, shAt, "aside");
        html = html.replace(shelf, "");
        const after = ['aria-labelledby="skip-h"', 'aria-labelledby="drinks-h"'].map((t) => html.indexOf(t)).find((i) => i > 0);
        if (after > 0) { const st = html.lastIndexOf("<section", after); const el = elementAt(html, st, "section"); html = html.replace(el, `${el}\n    ${shelf}`); n++; }
      }
    }
  }
  // 1c. combinations: 3 on phones, with the rest a tap away in the Lab
  {
    const cAt = html.indexOf('<section class="bl-section" aria-labelledby="combo-h">');
    if (cAt > 0) {
      const sec = elementAt(html, cAt, "section");
      const k = (sec.match(/<li class="pr-combo/g) || []).length;
      const name = ((html.match(/<h1>What goes with (.*?)\?<\/h1>/) || [])[1]) || "";
      if (k > 3 && !sec.includes('class="pr-more"') && name) {
        html = html.replace(sec, sec.replace(/<\/section>$/, `<p class="fp-phone-more"><a class="pr-more" href="/pairings/classics/?q=${encodeURIComponent(name.replace(/&amp;/g, "&"))}#lab-find">More combinations with ${name} in the Lab &rarr;</a></p></section>`));
        n++;
      }
    }
  }
  // 2. quick answers: first 3 open
  html = html.replace('<section class="bl-section pr-qa" aria-labelledby="qa-h">', (m) => { n++; return '<section class="bl-section pr-qa" aria-labelledby="qa-h" data-fp-fold>'; });
  // 3. one email ask up top: the printable box moves down to the drinks
  const boxAt = html.indexOf('<aside class="fx-hi"');
  const target = ['<section class="bl-section" aria-labelledby="drinks-h">', '<section class="bl-section" aria-labelledby="skip-h">'].map((t) => html.indexOf(t)).find((i) => i > boxAt);
  if (boxAt > 0 && target > 0 && html.includes("data-qs-bar")) {
    const box = elementAt(html, boxAt, "aside");
    const t = html.slice(target, target + 80).match(/^<section[^>]*>/)[0];
    html = html.replace(box, "").replace(t, `${box}\n    ${t}`);
    n++;
  }
  // 4. cheese pages: their row of the wine chart
  if (html.includes('<p class="section-kicker">Cheese pairing guide</p>')) {
    const anchor = chartAnchor(dist, slug);
    const name = ((html.match(/<h1>What goes with (.*?)\?<\/h1>/) || [])[1]) || "";
    const drinksAt = html.indexOf('<section class="bl-section" aria-labelledby="drinks-h">');
    if (anchor && name && drinksAt > 0) {
      const sec = elementAt(html, drinksAt, "section");
      html = html.replace(sec, sec.replace(/<\/section>$/, `<p class="fp-chart-link">Which wine goes best with ${name}? See it against every wine on the <a href="/pairings/wine-and-cheese-chart/#${anchor}">wine and cheese pairing chart</a>, free to print.</p>\n    </section>`));
      n++;
    }
  }
  return { html, n };
}

function hub(html) {
  let n = 0;
  // the old one-line shelf goes when the full shelf is on the page
  if (html.includes('<aside class="book-shelf"')) html = html.replace(/<aside class="pr-shelf"[\s\S]*?<\/aside>\s*/, () => { n++; return ""; });
  // the charts section duplicates the tools list at the top
  const chAt = html.indexOf('<section class="bl-section" aria-labelledby="chart-h">');
  if (chAt > 0) { html = html.replace(elementAt(html, chAt, "section"), ""); n++; }
  // bookshelf below the rules
  const shAt = html.indexOf('<aside class="book-shelf"');
  const rAt = html.indexOf('<section class="bl-section" id="rules"');
  if (shAt > 0 && rAt > shAt) {
    const shelf = elementAt(html, shAt, "aside");
    html = html.replace(shelf, "");
    const r = elementAt(html, html.indexOf('<section class="bl-section" id="rules"'), "section");
    html = html.replace(r, `${r}\n    ${shelf}`);
    n++;
  }
  return { html, n };
}

export function foodPairUp(html, path, dist) {
  let r = { html, n: 0 };
  if (path === "/pairings/") r = hub(html);
  else if (/^\/pairings\/food\/[^/]+\/$/.test(path)) r = foodPage(html, path, dist);
  if (r.html.includes("data-fp-tabs") || r.html.includes("data-fp-fold")) {
    if (!r.html.includes("data-fp-js")) r.html = r.html.replace(/<\/main>/, `${TAB_JS.replace("<script>", "<script data-fp-js>")}\n</main>`);
  }
  return r;
}
