// Calmer, shorter pages (8 Nov 2026, visitor review round 3). Applied to the
// built pages after the offers and quick-subscribe passes, so the page
// generators stay untouched.
//   /dietary/: one email ask. The page-matched "Diet label cards" box moves up
//   to sit right after the Diet Checker; the quick bar (skipped in
//   quick-subscribe.mjs) and the closing cheat-sheet panel go. The swap chart
//   folds behind its heading.
//   Holiday pages: the first 3 board ideas show, the rest behind "Show all";
//   shapes and mistakes fold; the closing cheat-sheet panel goes (the page
//   already has its matched email box under the quick answer).
//   Ingredient pages: the closing panel goes (same reason).
//   /ebook/: the 50-board list folds (links to #board-NN still open it).
//   Trust: Best Buys guides say when they were last checked and how they're
//   scored; every printable and $3 plan button says "Instant PDF · 30-day
//   refund"; real reader quotes from src/data/reviews.json show on /shop/ and
//   /ebook/ once there are any.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { readLists, foldLongPost, deepDive } from "./read-lists.mjs";
import { join } from "node:path";

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const longDate = (iso) => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(iso || ""); return m ? `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}` : ""; };

// Opens a folded section when the page is opened at (or a link jumps to) an
// id inside it.
const OPEN_JS = `<script data-fold-js>(function(){function o(id){if(!id)return;var e=document.getElementById(id);if(!e)return;var d=e.tagName==="DETAILS"?e:e.closest("details");if(d&&!d.open){d.open=true;if(e!==d)setTimeout(function(){e.scrollIntoView()},0)}}o(location.hash.slice(1));addEventListener("hashchange",function(){o(location.hash.slice(1))});document.addEventListener("click",function(ev){var a=ev.target.closest&&ev.target.closest('a[href*="#"]');if(!a)return;var u=new URL(a.href,location.href);if(u.pathname===location.pathname)o(u.hash.slice(1))})})();</script>`;
const addOpenJs = (html) => (html.includes("data-fold-js") ? html : html.replace(/<\/main>/, `${OPEN_JS}\n</main>`));

function foldSection(html, id, line) {
  const re = new RegExp(`<section class="bl-section" id="${id}" aria-labelledby="${id}-h">\\s*<h2 id="${id}-h">([\\s\\S]*?)<\\/h2>([\\s\\S]*?)<\\/section>`);
  return html.replace(re, (all, title, body) => `<details class="bl-section pg-fold" id="${id}">
      <summary><h2 id="${id}-h">${title}</h2>${line ? `<span>${esc(line)}</span>` : ""}</summary>${body}</details>`);
}
const dropClosingPanel = (html) => html.replace(/<section class="lab-news"[\s\S]*?<\/section>\s*/, "");

async function edit(file, fn) {
  let html;
  try { html = await readFile(file, "utf8"); } catch { return false; }
  const out = fn(html);
  if (out !== html) { await writeFile(file, out); return true; }
  return false;
}

async function* pages(dir, rel = "") {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!rel && ["assets", "images", "downloads"].includes(e.name)) continue;
      yield* pages(join(dir, e.name), `${rel}/${e.name}`);
    } else if (e.name === "index.html") yield [join(dir, e.name), `${rel}/`];
  }
}

// Gift posts (9 Nov 2026): every post a gift shopper lands on gets a slim
// "Shopping for a gift?" strip into the gift guide, before its FAQ, so the
// ranked posts and the /gifts/ guides tie together both ways.
const GIFT_POSTS = new Set(["cheese-advent-calendars-2026", "cheese-advent-calendar-australia-canada", "best-charcuterie-gift-boxes", "best-charcuterie-gift-baskets-amazon", "charcuterie-gift-basket", "best-cheese-of-the-month-clubs", "best-cheese-knife-sets", "best-charcuterie-boards", "best-charcuterie-board-accessories", "amazon-charcuterie-board-sets-reviewed", "best-panettone", "best-hot-cocoa-mix", "best-store-bought-christmas-cookies"]);
// 9 Nov 2026: the newest gift guide that fits each post leads the strip's links.
const GIFT_LEAD = {
  "cheese-advent-calendars-2026": ["Wine advent calendars", "/gifts/wine-advent-calendars/"],
  "best-charcuterie-boards": ["Personalized boards", "/gifts/personalized-boards/"],
  "amazon-charcuterie-board-sets-reviewed": ["Personalized boards", "/gifts/personalized-boards/"],
  "best-cheese-knife-sets": ["Secret Santa", "/gifts/secret-santa/"],
  "best-charcuterie-board-accessories": ["Secret Santa", "/gifts/secret-santa/"],
  "charcuterie-gift-basket": ["Secret Santa", "/gifts/secret-santa/"],
  "best-hot-cocoa-mix": ["Secret Santa", "/gifts/secret-santa/"],
  "best-store-bought-christmas-cookies": ["Secret Santa", "/gifts/secret-santa/"],
  "best-cheese-of-the-month-clubs": ["Has everything", "/gifts/has-everything/"],
  "best-charcuterie-gift-boxes": ["Ships well", "/gifts/ship-well/"],
  "best-charcuterie-gift-baskets-amazon": ["Ships well", "/gifts/ship-well/"],
  "best-panettone": ["Secret Santa", "/gifts/secret-santa/"]
};
function giftStrip(slug) {
  const us = slug !== "cheese-advent-calendar-australia-canada";
  const lead = GIFT_LEAD[slug];
  return `<aside class="gift-strip" data-gift-strip aria-label="Charcuterie gift guide">
      <p class="gift-strip-h"><strong>Shopping for a gift?</strong>${us ? ` <span data-gs-when>Order perishable gift boxes by Dec 11 and anything sent USPS Priority Mail by Dec 18.</span>` : " Our gift guides cover every budget, and the ebooks and printables arrive instantly anywhere."}</p>
      <p class="gift-strip-links">${lead ? `<a href="${lead[1]}"><strong>${lead[0]}</strong></a>` : ""}<a href="/gifts/#finder">Gift finder</a><a href="/gifts/under-25/">Under $25</a><a href="/gifts/cheese-lovers/">Cheese lovers</a><a href="/gifts/last-minute/">Last-minute</a><a href="/gifts/">All gift guides</a></p>
      <script>(function(){try{var a=document.currentScript.parentNode,t=new Date();if(t.getMonth()===11&&t.getDate()>=26||t.getMonth()===0){a.hidden=true;return}var w=a.querySelector("[data-gs-when]");if(!w)return;var d=t.getMonth()===11?t.getDate():0;if(d>19)w.innerHTML='Too late to ship? Give an ebook or a cheese club gift with our <a href="/gifts/#gift-card">free gift card</a>.';else if(d>11)w.textContent="USPS Priority Mail ships for Christmas until Dec 18, Priority Mail Express until Dec 19."}catch(e){}})();</script>
    </aside>
    `;
}

export async function calmHubs(dist) {
  const done = [];
  const n = { holidays: 0, ingredients: 0, guides: 0, refund: 0 };

  // ---- Dietary hub
  await edit(join(dist, "dietary", "index.html"), (html) => {
    html = dropClosingPanel(html);
    const lead = html.match(/<aside class="dt-lead"[\s\S]*?<\/aside>\s*/);
    const chk = html.indexOf('<section class="dt-checker"');
    if (lead && chk > 0 && lead.index > chk) {
      html = html.slice(0, lead.index) + html.slice(lead.index + lead[0].length);
      const end = html.indexOf("</section>", chk) + "</section>".length;
      html = html.slice(0, end) + "\n\n    " + lead[0] + html.slice(end);
    }
    html = html.replace(/<section class="bl-section" aria-labelledby="swaps-h">\s*<h2 id="swaps-h">([^<]*)<\/h2>([\s\S]*?)<\/section>/, (all, title, body) => `<details class="bl-section dt-fold" id="swaps">
      <summary><h2 id="swaps-h">${title}</h2><span>The easy swap for each diet, item by item.</span></summary>${body}</details>`);
    done.push("dietary");
    return html;
  });

  // ---- The Book: the full 50-board list folds
  await edit(join(dist, "ebook", "index.html"), (html) => {
    html = html.replace(/<section class="ebook-section fx-all" id="all-boards">\s*<div class="ebook-section-inner">\s*<p class="section-kicker">[^<]*<\/p>\s*<h2>([^<]*)<\/h2>([\s\S]*?)<\/div>\s*<\/section>/, (all, title, body) => `<section class="ebook-section fx-all" id="all-boards">
    <div class="ebook-section-inner">
      <details class="pg-fold pg-fold-plain" id="all-boards-list">
        <summary><h2>${title}</h2><span>All 50 boards by section, with the ones you can buy on their own for $3.</span></summary>${body}</details>
    </div>
  </section>`);
    if (html.includes("all-boards-list")) { done.push("ebook"); html = addOpenJs(html); }
    return html;
  });

  // ---- Reader quotes, once there are real ones
  let reviews = [];
  try { reviews = JSON.parse(await readFile(join(dist, "..", "src", "data", "reviews.json"), "utf8")).filter((r) => r && r.quote && r.name); } catch {}
  if (reviews.length) {
    const block = (list) => `<section class="rv-quotes" aria-label="What readers say"><div class="rv-inner">${list.slice(0, 3).map((r) => `<figure><blockquote>&ldquo;${esc(r.quote)}&rdquo;</blockquote><figcaption>${esc(r.name)}${r.source ? ` &middot; ${esc(r.source)}` : ""}${r.stars ? ` &middot; ${"&#9733;".repeat(Math.max(1, Math.min(5, +r.stars)))}` : ""}</figcaption></figure>`).join("")}</div></section>`;
    await edit(join(dist, "ebook", "index.html"), (html) => html.replace('<section class="ebook-section ebook-faq">', `${block(reviews.filter((r) => !r.product || r.product === "book"))}\n<section class="ebook-section ebook-faq">`));
    await edit(join(dist, "shop", "index.html"), (html) => { const i = html.indexOf("<h2", html.indexOf("<main")); return i > 0 ? html.slice(0, i) + block(reviews) + html.slice(i) : html; });
    done.push(`reviews:${reviews.length}`);
  }

  for await (const [file, path] of pages(dist)) {
    await edit(file, (html) => {
      const before = html;
      // ---- Labelled paragraphs become short lists; diet key becomes chips (9 Nov 2026)
      { const r = readLists(html, path); if (r.n) { html = r.html; n.lists = (n.lists || 0) + r.n; } }
      { const r = foldLongPost(html, path); if (r.n) { html = addOpenJs(r.html); n.folds = (n.folds || 0) + r.n; } }
      { const r = deepDive(html, path, dist); if (r.n) { html = addOpenJs(r.html); n.deep = (n.deep || 0) + 1; } }
      // ---- Holiday pages
      if (/^\/holidays\/[^/]+\/$/.test(path) && html.includes('id="ideas"')) {
        let k = 0;
        html = html.replace(/<article class="hol-idea"/g, (m) => (++k > 3 ? '<article class="hol-idea" data-more hidden' : m));
        if (k > 3) html = html.replace(/(<section class="bl-section" id="ideas"[\s\S]*?<\/div>)(\s*<\/section>)/, (all, a, b) => `${a}\n      <p class="pg-more"><button type="button" class="button" data-show-more>Show all ${k} ideas</button></p>${b}`);
        html = foldSection(html, "shapes", "Turkey, wreath, tree and other shapes, with how to build each.");
        html = foldSection(html, "mistakes", "");
        html = dropClosingPanel(html);
        if (k > 3) html = html.replace(/<\/main>/, `<script>(function(){var b=document.querySelector("[data-show-more]");if(!b)return;function all(){document.querySelectorAll(".hol-idea[data-more]").forEach(function(a){a.hidden=false});b.parentNode.hidden=true}b.addEventListener("click",all);var h=location.hash.slice(1),e=h&&document.getElementById(h);if(e&&e.closest&&e.closest(".hol-idea[data-more]"))all()})();</script>\n</main>`);
        html = addOpenJs(html);
        n.holidays++;
      }
      // ---- Hanukkah board page: its gift card goes to the Hanukkah gift guide (9 Nov 2026)
      if (path === "/holidays/hanukkah/") {
        html = html.replace('<a href="/gifts/"><span class="bn-k">Gift guide</span><strong>Charcuterie gifts</strong><span>Books, sets and gifts under $25</span></a>', '<a href="/gifts/hanukkah/"><span class="bn-k">Gift guide</span><strong>Hanukkah gifts for a cheese lover</strong><span>10 ideas for eight nights, kosher kitchens included</span></a>');
        n.hanukkahGift = html.includes('href="/gifts/hanukkah/"') ? 1 : 0;
      }
      // ---- Gift posts: a way into the gift guide
      const gp = /^\/blog\/([^/]+)\/$/.exec(path);
      if (gp && GIFT_POSTS.has(gp[1]) && !html.includes("data-gift-strip")) {
        const hm = /<h2[^>]*>(?:[^<]*?(?:questions|FAQ|What to look for|Key dates))[^<]*<\/h2>/i.exec(html);
        let at = hm ? hm.index : html.indexOf('<section class="lab-next"');
        if (hm) { const kick = html.lastIndexOf('<p class="section-kicker">', at); if (kick > at - 200 && kick > 0) at = kick; }
        if (at > 0) { html = html.slice(0, at) + giftStrip(gp[1]) + html.slice(at); n.giftPosts = (n.giftPosts || 0) + 1; }
      }
      // ---- Ingredient pages: one email ask is enough
      if (/^\/ingredients\/[^/]+\/$/.test(path) && html.includes("ing-detail")) { html = dropClosingPanel(html); n.ingredients++; }
      // ---- Best Buys guides: when last checked, and how they're scored
      if (/^\/blog\/[^/]+\/$/.test(path) && html.includes('class="ing-crumb post-crumb"><a href="/blog/best-charcuterie-brands/">')) {
        const mod = (html.match(/"dateModified":"([^"]+)"/) || [])[1];
        const when = longDate(mod);
        if (when) html = html.replace(/<p class="post-date">[^<·]*·/, `<p class="post-date">Last checked ${when} ·`);
        html = html.replace(/<p class="aff-note">([^<]*)<a href="\/privacy\/#affiliate-links">How that works<\/a><\/p>/, (all, t) => `<p class="aff-note bb-trust">Scored on published taste tests, reviews and awards, ingredients, value and how easy it is to find. Prices vary by store. <a href="/blog/best-charcuterie-brands/#how-we-rank">How we rank</a> &middot; ${t}<a href="/privacy/#affiliate-links">How that works</a></p>`);
        n.guides++;
      }
      // ---- Refund line beside every printable and $3 plan button (not on the
      // Shop grids, where one line per card would crowd the page)
      if (!/^\/shop\//.test(path)) html = html.replace(/(<a class="button[^"]*" href="https:\/\/[^"]*gumroad[^"]*"[^>]*>((?:Get the PDF|Get the full plan|Get the shopping list with amounts|Get the plan|Get the pack|Get it) · \$[\d.]+)<\/a>)/g, (all, a, t, off, s) => {
        const near = s.slice(Math.max(0, off - 300), off + all.length + 300);
        if (/refund/i.test(near)) return all;
        n.refund++;
        return `${a}<span class="fx-refund">Instant PDF &middot; 30-day refund</span>`;
      });
      return html === before ? before : html;
    });
  }
  done.push(`holidays:${n.holidays}`, `ingredients:${n.ingredients}`, `guides:${n.guides}`, `refund lines:${n.refund}`, `gift posts:${n.giftPosts || 0}`, `label lists:${n.lists || 0}`, `long-post folds:${n.folds || 0}`, `deep dives:${n.deep || 0}`);
  return done;
}
