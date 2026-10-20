// Amazon Associates (store ID set 19 Oct 2026). Runs after every page is
// written: tags each amazon.com URL in dist/*.html, marks Amazon <a> links
// rel="sponsored nofollow noopener", and puts a disclosure under the H1 of any
// page whose main content links to Amazon. The footer carries the required
// line on every page (build.mjs). Plan: claude/gift-audit-and-associates-plan-2026-10-19.md
//
// Amazon rules this follows: the exact disclosure sentence below; plain
// amazon.com links (no cloaking or shorteners); no Amazon prices, ratings or
// images copied onto our pages.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const AMAZON_TAG = "charcuteriela-20";
export const DISCLOSURE = "As an Amazon Associate I earn from qualifying purchases.";

const AMZ = /https?:\/\/(?:www\.)?amazon\.com\/[^\s"'<>\\]*/g;

export function tagAmazonUrl(u, amp = "&") {
  if (/[?&](?:amp;)?tag=/.test(u)) return u;
  const hash = u.indexOf("#");
  const base = hash >= 0 ? u.slice(0, hash) : u, frag = hash >= 0 ? u.slice(hash) : "";
  return `${base}${base.includes("?") ? amp : "?"}tag=${AMAZON_TAG}${frag}`;
}

function relSponsored(tag) {
  const rel = /\srel="([^"]*)"/.exec(tag);
  const want = new Set([...(rel ? rel[1].split(/\s+/).filter(Boolean) : []), "sponsored", "nofollow", "noopener"]);
  const attr = ` rel="${[...want].join(" ")}"`;
  return rel ? tag.replace(rel[0], attr) : tag.replace(/^<a\b/, `<a${attr}`);
}

export function affiliateHtml(html) {
  // JSON-LD keeps a raw "&"; everything else is HTML, so "&amp;".
  const parts = html.split(/(<script type="application\/ld\+json">[\s\S]*?<\/script>)/);
  let out = parts.map((p, i) => (i % 2 ? p.replace(AMZ, (u) => tagAmazonUrl(u, "&")) : p.replace(AMZ, (u) => tagAmazonUrl(u, "&amp;")))).join("");
  out = out.replace(/<a\b[^>]*href="https?:\/\/(?:www\.)?amazon\.com\/[^"]*"[^>]*>/g, relSponsored);
  // Page notice: only when the content above the footer links to Amazon.
  const foot = out.indexOf("<footer");
  const body = foot > 0 ? out.slice(0, foot) : out;
  const inBody = /<a\b[^>]*href="https?:\/\/(?:www\.)?amazon\.com\//.test(body);
  let noted = false;
  if (inBody && !out.includes('class="aff-note"')) {
    const h1 = body.indexOf("</h1>");
    if (h1 > 0) {
      out = out.slice(0, h1 + 5) + `\n<p class="aff-note">Some links on this page go to Amazon. ${DISCLOSURE}</p>` + out.slice(h1 + 5);
      noted = true;
    }
  }
  return { html: out, noted, inBody };
}

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith(".html")) yield p;
  }
}

export async function injectAffiliate(dist) {
  let pages = 0, tagged = 0, notes = 0, noH1 = [];
  for await (const f of htmlFiles(dist)) {
    const src = await readFile(f, "utf8");
    if (!AMZ.test(src)) { AMZ.lastIndex = 0; continue; }
    AMZ.lastIndex = 0;
    const r = affiliateHtml(src);
    pages++;
    tagged += (r.html.match(/tag=charcuteriela-20/g) || []).length;
    if (r.noted) notes++; else if (r.inBody && !r.html.includes('class="aff-note"')) noH1.push(f.slice(dist.length));
    if (r.html !== src) await writeFile(f, r.html);
  }
  return { pages, tagged, notes, noH1 };
}
