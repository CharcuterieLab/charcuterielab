// Gumroad printables off the content pages (25 Nov 2026).
// Chris: the site's priorities are Amazon (Associates + paperbacks), book
// sales and newsletter sign-ups. About 0.1% of visitors click a Gumroad link,
// so the paid printable cards come off every content page. Printables stay on
// /shop/, /printables/, the Party Planner and the holiday pages (and the book
// pages keep their ebook buttons). Ebooks are book sales, so ebook buttons stay
// everywhere; only the printables, plans and bundles come off. Runs last.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// First path segment of pages that keep their Gumroad offers.
export const GUMROAD_KEEP = new Set([
  "shop", "printables", "party-planner", "holidays", "books", "ebook",
  "around-the-world", "thanks", "newsletter"
]);

const GUM = /gumroad\.com/;
// Gumroad slugs that are books (ebook editions). These links stay.
export const BOOK_SLUGS = new Set([
  "tabajj", "impossible-boards", "hulgi", "xdwhtq", "gvjsf", "yshmj",
  "ingredient-guide", "charcuterie-on-any-budget"
]);
const slugOf = (href) => (/gumroad\.com\/l\/([A-Za-z0-9_-]+)/.exec(href) || [])[1];
const isPrintableLink = (s) => {
  const m = s.match(/gumroad\.com\/l\/[A-Za-z0-9_-]+/g) || [];
  return m.some((h) => !BOOK_SLUGS.has(slugOf(h)));
};

// End index of the element that opens at `start` (balanced on its own tag name).
function elementEnd(html, start) {
  const tag = /^<([a-z0-9]+)/i.exec(html.slice(start))[1];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    if (m[1]) { if (--depth === 0) return m.index + m[0].length; }
    else if (!m[0].endsWith("/>")) depth++;
  }
  return -1;
}

// Remove every <tag class="... cls ..."> element (whole), returns [html, count].
function removeByClass(html, tag, cls) {
  const re = new RegExp(`<${tag}\\b[^>]*\\bclass="(?:[^"]*\\s)?${cls}(?:\\s[^"]*)?"[^>]*>`, "gi");
  let n = 0, m;
  while ((m = re.exec(html))) {
    const end = elementEnd(html, m.index);
    if (end < 0) break;
    html = html.slice(0, m.index) + html.slice(end);
    re.lastIndex = m.index;
    n++;
  }
  return [html, n];
}

// Inside each <div class="cls">, drop the Gumroad <a> buttons and make the
// first remaining button primary. Drops the container if nothing is left.
function stripButtons(html, cls) {
  const re = new RegExp(`<div\\b[^>]*\\bclass="(?:[^"]*\\s)?${cls}(?:\\s[^"]*)?"[^>]*>`, "gi");
  let n = 0, m;
  while ((m = re.exec(html))) {
    const end = elementEnd(html, m.index);
    if (end < 0) break;
    const box = html.slice(m.index, end);
    if (!isPrintableLink(box)) { re.lastIndex = end; continue; }
    let out = box.replace(/\s*<a\b[^>]*href="([^"]*gumroad\.com[^"]*)"[^>]*>[\s\S]*?<\/a>/g, (a, href) => (BOOK_SLUGS.has(slugOf(href)) ? a : ""));
    if (!/<a\b/.test(out)) out = "";
    else if (!/class="button primary/.test(out)) out = out.replace(/class="button\b/, 'class="button primary');
    html = html.slice(0, m.index) + out + html.slice(end);
    re.lastIndex = m.index + out.length;
    n++;
  }
  return [html, n];
}

// Remove the <section> that holds the homepage printable picks.
function removeHomePicks(html) {
  const i = html.indexOf('class="home-picks"');
  if (i < 0) return [html, 0];
  const s = html.lastIndexOf("<section", i);
  const end = s < 0 ? -1 : elementEnd(html, s);
  if (end < 0) return [html, 0];
  return [html.slice(0, s) + html.slice(end), 1];
}

// A <p> in the body that sells a printable plan (an inline promo line).
function removePromoParagraphs(html) {
  let n = 0;
  html = html.replace(/<p\b[^>]*>(?:(?!<\/?p\b)[\s\S])*?gumroad\.com(?:(?!<\/?p\b)[\s\S])*?<\/p>/g, (m) => {
    if (!isPrintableLink(m)) return m;
    n++; return "";
  });
  return [html, n];
}

export function gumroadOff(html, section) {
  const counts = {};
  const add = (k, [h, n]) => { if (n) counts[k] = (counts[k] || 0) + n; html = h; };
  if (GUMROAD_KEEP.has(section)) {
    return { html, counts };
  }
  // Footer link on every page: "Ebook on Gumroad" becomes the free printables page.
  {
    const before = html;
    html = html.replace(/<a href="[^"]*gumroad\.com[^"]*"[^>]*>Ebook on Gumroad<\/a>/, '<a href="/newsletter/">Free printables</a>');
    if (html !== before) counts.footer = 1;
  }
  const mainStart = html.indexOf("<main");
  const mainEnd = html.lastIndexOf("</main>");
  if (mainStart < 0 || mainEnd < 0) return { html, counts };
  const head = html.slice(0, mainStart), tail = html.slice(mainEnd);
  let body = html.slice(mainStart, mainEnd);
  const run = (k, fn) => { const [b, n] = fn(body); body = b; if (n) counts[k] = (counts[k] || 0) + n; };
  run("printable card", (b) => removeByClass(b, "aside", "fx-print"));
  run("top card", (b) => removeByClass(b, "aside", "fx-top"));
  run("top-card alt line", (b) => removeByClass(b, "p", "fx-top-alt"));
  run("single-plan line", (b) => removeByClass(b, "p", "fx-single"));
  run("boards hub packs", (b) => removeByClass(b, "section", "bl-packs"));
  run("by-price pack line", (b) => removeByClass(b, "p", "bp-rung-buy"));
  run("home printable picks", removeHomePicks);
  run("pack button", (b) => stripButtons(b, "bp-buy"));
  // One-line printable plugs ("Serving brie? Soft Cheese Field Guide $5"), not the book lines (fx-line fx-book).
  run("printable line", (b) => {
    let n = 0;
    const u = b.replace(/<p class="fx-line">(?:(?!<\/p>)[\s\S])*?href="\/printables\/[\s\S]*?<\/p>/g, () => { n++; return ""; });
    return [u, n];
  });
  run("promo paragraph", removePromoParagraphs);
  html = head + body + tail;
  return { html, counts };
}

export async function injectGumroadOff(dist) {
  const totals = {};
  let pages = 0;
  const left = [];
  async function sweep(dir, rel) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const f = join(dir, e.name);
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) await sweep(f, r);
      else if (e.name.endsWith(".html")) {
        const section = r.includes("/") ? r.split("/")[0] : "home";
        const t = await readFile(f, "utf8");
        if (!GUM.test(t) && !t.includes("/printables/")) continue;
        const { html, counts } = gumroadOff(t, section);
        if (html !== t) {
          pages++;
          for (const [k, v] of Object.entries(counts)) totals[k] = (totals[k] || 0) + v;
          await writeFile(f, html);
        }
        if (!GUMROAD_KEEP.has(section)) {
          const m = html.indexOf("<main"), n = html.lastIndexOf("</main>");
          if (m >= 0 && isPrintableLink(html.slice(m, n))) left.push(r);
        }
      }
    }
  }
  await sweep(dist, "");
  return { pages, totals, left };
}
