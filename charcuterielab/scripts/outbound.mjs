// Outbound links (9 Nov 2026). Runs over dist/*.html after the Amazon tagging.
// Plan: claude/statcounter-exit-links-2026-11-09.md
//
// 1. Amazon search guard: Associates only pays on the exact product linked, so
//    an amazon.com/s?k= link earns nothing. The build stops and lists them.
// 2. Citations to the end: when a page has a Sources list, a link in the
//    article to a page already in that list becomes plain text, so readers
//    finish the article and still find every source at the bottom.
// 3. Amazon OneLink: once ONELINK_ID is set (Associates Central > Tools >
//    OneLink), pages that link to Amazon load the OneLink script, which sends
//    Canada, UK, Germany, France, Italy and Spain visitors to their own store.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Paste the adInstanceId from the OneLink script in Associates Central here.
export const ONELINK_ID = "";

const SEARCH = /https?:\/\/(?:www\.)?amazon\.com\/s\?[^"'<>\s]*/g;

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith(".html")) yield p;
  }
}

const norm = (u) => u.replace(/&amp;/g, "&").replace(/#.*$/, "").replace(/\/$/, "");

// The Sources part of a page: the section under an <h2> whose text is
// "Sources" (to the next <h2>, </article> or </main>), plus every ul.sk-src.
function sourceRanges(html) {
  const ranges = [];
  const h2 = /<h2\b[^>]*>\s*(?:[^<]*\s)?Sources\s*<\/h2>/gi;
  let m;
  while ((m = h2.exec(html))) {
    const start = m.index;
    const rest = html.slice(m.index + m[0].length);
    const end = rest.search(/<h2\b|<\/article>|<\/main>/i);
    ranges.push([start, end < 0 ? html.length : m.index + m[0].length + end]);
  }
  const ul = /<ul class="sk-src">[\s\S]*?<\/ul>/g;
  while ((m = ul.exec(html))) ranges.push([m.index, m.index + m[0].length]);
  return ranges;
}

export function citeToSources(html) {
  const main = html.indexOf("<main"), mainEnd = html.lastIndexOf("</main>");
  if (main < 0 || mainEnd < 0) return { html, moved: 0 };
  const ranges = sourceRanges(html);
  if (!ranges.length) return { html, moved: 0 };
  const inSources = (i) => ranges.some(([a, b]) => i >= a && i < b);
  const listed = new Set();
  for (const [a, b] of ranges) {
    for (const h of html.slice(a, b).matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"/g)) listed.add(norm(h[1]));
  }
  let moved = 0;
  const out = html.replace(/<a\b([^>]*)href="(https?:\/\/[^"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (all, pre, href, post, text, i) => {
    if (i < main || i > mainEnd || inSources(i)) return all;
    if (/charcuterielab\.com/.test(href)) return all;
    if (/class="[^"]*button/.test(pre + post)) return all;
    if (/<(?:img|picture)\b/.test(text)) return all;
    if (!listed.has(norm(href))) return all;
    moved++;
    return `<span class="cite-src">${text}</span>`;
  });
  return { html: out, moved };
}

function oneLink(html) {
  if (!ONELINK_ID || html.includes("adInstanceId=")) return html;
  const foot = html.indexOf("<footer");
  if (!/<a\b[^>]*href="https?:\/\/(?:www\.)?amazon\.com\/dp\//.test(foot > 0 ? html.slice(0, foot) : html)) return html;
  const tag = `<div id="amzn-assoc-ad-${ONELINK_ID}"></div><script async src="//z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US&amp;adInstanceId=${ONELINK_ID}"></script>`;
  return html.replace("</body>", `${tag}\n</body>`);
}

export async function outboundLinks(dist) {
  const searchHits = [];
  let pages = 0, moved = 0, onelink = 0;
  for await (const f of htmlFiles(dist)) {
    const src = await readFile(f, "utf8");
    const page = f.slice(dist.length);
    const hits = src.match(SEARCH);
    if (hits) searchHits.push(`${page}: ${[...new Set(hits)].slice(0, 3).join(" ")}`);
    const c = citeToSources(src);
    let html = c.html;
    if (c.moved) { pages++; moved += c.moved; }
    const o = oneLink(html);
    if (o !== html) onelink++;
    html = o;
    if (html !== src) await writeFile(f, html);
  }
  if (searchHits.length) {
    throw new Error(`Amazon search links found on ${searchHits.length} page(s). Link the exact product (amazon.com/dp/...) or a store instead:\n  ${searchHits.slice(0, 20).join("\n  ")}`);
  }
  return { pages, moved, onelink };
}
