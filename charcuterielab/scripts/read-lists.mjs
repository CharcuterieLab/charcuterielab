// 9 Nov 2026: easier reading. Paragraphs that pack three or more bold labels
// ("<strong>2 people:</strong> 8–10 inch. <strong>4–6:</strong> ...") become a
// short labelled list, and the Safe / Check the label / Skip key on the diet
// pages becomes three chips that match the badges below it.
// Called from hub-calm.mjs on every page after the build.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const LABEL = /<strong>([^<]{1,40}?):<\/strong>|<strong>([^<]{1,40}?)<\/strong>:/g;

function kvList(inner) {
  const marks = [...inner.matchAll(LABEL)];
  if (marks.length < 3) return null;
  // Recipe meta lines ("Serves: 6 · Prep: 5 minutes") read fine already.
  if (/&middot;|·/.test(inner)) return null;
  let lead = inner.slice(0, marks[0].index).trim();
  let start = 0;
  // "Quick Answer:" is the opener, not a row.
  if (/^quick answer$/i.test((marks[0][1] || marks[0][2] || "").trim())) {
    lead = `<strong>Quick answer:</strong>`;
    start = 1;
    if (marks.length - start < 2) return null;
    const between = inner.slice(marks[0].index + marks[0][0].length, marks[1].index).trim();
    if (between) lead += " " + between;
  }
  const rows = [];
  for (let i = start; i < marks.length; i++) {
    const m = marks[i];
    const from = m.index + m[0].length;
    const to = i + 1 < marks.length ? marks[i + 1].index : inner.length;
    rows.push([(m[1] || m[2]).trim(), inner.slice(from, to).trim()]);
  }
  let tail = "";
  // A closing remark after the last row ("Food should cover most of the
  // board.") goes under the list when every other row is one short sentence.
  const last = rows[rows.length - 1];
  const sentences = last[1].split(/(?<=[.!?])\s+(?=[A-Z<])/);
  const short = rows.slice(0, -1).every(([, v]) => v.split(/(?<=[.!?])\s+(?=[A-Z<])/).length === 1);
  if (sentences.length > 1 && short) { last[1] = sentences[0]; tail = sentences.slice(1).join(" "); }
  const cap = (v) => (v.charAt(0) === "<" ? v : v.charAt(0).toUpperCase() + v.slice(1));
  return `${lead ? `<p class="kv-lead">${lead}</p>` : ""}<ul class="kv-list">${rows.map(([k, v]) => `<li><span class="kv-k">${k}</span><span class="kv-v">${cap(v)}</span></li>`).join("")}</ul>${tail ? `<p class="kv-tail">${tail}</p>` : ""}`;
}

export function readLists(html, path) {
  let n = 0;
  const main = html.indexOf("<main");
  const end = html.indexOf("</main>");
  if (main < 0 || end < 0) return { html, n };
  let body = html.slice(main, end);
  // Diet pages: the key above the categories.
  if (/^\/dietary\/[^/]+\/$/.test(path)) {
    body = body.replace(/<p class="bl-note"><strong>Safe<\/strong>: nothing in the usual recipe breaks the diet\. <strong>Check the label<\/strong>: some brands or recipes do\. <strong>Skip<\/strong>: the usual recipe does\.\s*([\s\S]*?)<\/p>/, (all, rest) => {
      n++;
      return `<ul class="dt-key" aria-label="What the labels mean"><li><span class="dt-badge dt-safe">Safe</span> Nothing in the usual recipe breaks the diet</li><li><span class="dt-badge dt-check">Check the label</span> Some brands or recipes do</li><li><span class="dt-badge dt-skip">Skip</span> The usual recipe does</li></ul>${rest.trim() ? `<p class="bl-note">${rest.trim()}</p>` : ""}`;
    });
  }
  // Runs of 3+ paragraphs that each open with a bold label ("Placement:",
  // "Temperature matters more than usual.") read as one divided list, label
  // on its own line, on blog posts and ingredient pages.
  if (/^\/(blog|ingredients)\//.test(path)) {
    body = body.replace(/(?:<p><strong>[^<?]{1,60}?[:.]?<\/strong>[:.]?\s(?:(?!<\/p>)[\s\S])*?<\/p>\s*){3,}/g, (run) => {
      n++;
      const items = run.match(/<p><strong>[\s\S]*?<\/p>/g);
      return `<div class="lead-list">${items.map((p) => p.replace(/^<p><strong>([^<]*?)[:.]?<\/strong>[:.]?\s*/, (m, k) => `<p class="lead-item"><strong class="lead-k">${k}</strong> `)).join("")}</div>\n`;
    });
  }
  body = body.replace(/<p(\s[^>]*)?>((?:(?!<\/p>)[\s\S])*?)<\/p>/g, (all, attrs = "", inner) => {
    if (/class="(?:bl-note|aff-note|post-date|ing-crumb)/.test(attrs)) return all;
    const out = kvList(inner);
    if (!out) return all;
    n++;
    return `<div class="kv-block">${out}</div>`;
  });
  return { html: html.slice(0, main) + body + html.slice(end), n };
}

// 9 Nov 2026: the four giant seasonal posts fold their long sections. Each
// section keeps its heading (and id, so the jump menus still work: hub-calm's
// open-from-hash script opens the fold) and shows what's inside on one line.
const FOLD_POSTS = {
  "/blog/christmas-appetizers/": { ids: ["no-cook", "warm", "dips", "boards"] },
  "/blog/new-years-eve-appetizers/": { ids: ["cold", "warm", "dips", "boards", "midnight", "lucky", "bubbly"] },
  "/blog/types-of-cheese/": { ids: ["fresh", "bloomy", "semisoft", "firm", "hard", "blue", "washed", "flavored", "plant", "label"] },
  "/blog/types-of-cured-meat/": { ids: ["cooked", "semidry", "whole", "salami", "dried", "fat", "spread", "fish", "label"] },
  "/blog/charcuterie-board-ideas/": {
    ids: ["the-five-foundations", "boards-built-around-the-drink", "the-holiday-calendar", "outdoors-backyards-and-game-day", "money-at-both-ends", "who-is-actually-coming", "dietary-boards-built-properly", "a-sense-of-place", "one-idea-taken-all-the-way", "the-showstoppers"],
    groups: true, open: ["the-five-foundations"]
  }
};
const strip = (x) => x.replace(/<span class="(?:ny-num|tc-famn|tc-famc)">[\s\S]*?<\/span>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export function foldLongPost(html, path, given) {
  const cfg = given || FOLD_POSTS[path];
  if (!cfg) return { html, n: 0 };
  const a = html.indexOf("<article");
  const z = html.indexOf("</article>", a);
  if (a < 0 || z < 0) return { html, n: 0 };
  let art = html.slice(a, z);
  const heads = [...art.matchAll(/<h2\b[^>]*\bid="([^"]+)"[^>]*>[\s\S]*?<\/h2>/g)].map((m) => ({ id: m[1], at: m.index, end: m.index + m[0].length, tag: m[0] }));
  const anyH2 = [...art.matchAll(/<h2\b/g)].map((m) => m.index);
  let n = 0;
  // Work from the last section back so earlier offsets stay valid.
  for (const id of [...cfg.ids].reverse()) {
    const h = heads.find((x) => x.id === id);
    if (!h) continue;
    let stop;
    if (cfg.groups) {
      // a group runs until the next heading that isn't a numbered board
      const next = heads.find((x) => x.at > h.at && !/^\d/.test(x.id));
      stop = next ? next.at : anyH2.find((p) => p > h.at && !heads.some((x) => x.at === p && /^\d/.test(x.id)));
    } else stop = anyH2.find((p) => p > h.at);
    if (!stop) continue;
    // keep a <!--nolink--> marker that belongs to the next heading outside the fold
    let cut = stop;
    const before = art.slice(Math.max(h.end, stop - 20), stop);
    const k = before.lastIndexOf("<!--nolink-->");
    if (k >= 0) cut = stop - before.length + k;
    const body = art.slice(h.end, cut);
    let names = cfg.groups ? [...body.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1]).replace(/^\d+\.\s*(The\s+)?/, "")) : [...body.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => strip(m[1]).replace(/^\d+\.\s*/, ""));
    if (/<a class="tc-card"/.test(body)) names = [...body.matchAll(/<a class="tc-card"[\s\S]*?<\/a>/g)].map((m) => strip((m[0].match(/<span class="tc-card-name">([\s\S]*?)<\/span>/) || ["", ""])[1])).filter(Boolean);
    const cards = /<a class="tc-card"/.test(body); // card rows don't list every cheese, so no count
    const line = names.length ? (names.length > 4 ? `${names.slice(0, 4).join(", ")} and ${cards ? "more" : `${names.length - 4} more`}` : names.join(", ")) : "";
    const open = (cfg.open || []).includes(id) ? " open" : "";
    art = art.slice(0, h.at) + `<details class="post-fold"${open}><summary>${h.tag}${line ? `<span class="pf-line">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>` : ""}</summary>` + body + `</details>\n` + art.slice(cut);
    n++;
  }
  return { html: html.slice(0, a) + art + html.slice(z), n };
}

// 9 Nov 2026: the older ingredient deep-dive posts (/blog/brie/ and friends,
// plus the <ingredient>-charcuterie-board posts) get the ingredient page's
// "At a glance" box under their Quick Answer, and their background and
// science sections fold. Only posts with a matching ingredient page and no
// glance box of their own.
const DEEP_FOLD = /^(what-is|how-[a-z-]*made|flavor-profile|the-lab-section|[a-z-]*science|[a-z-]*origin|what-washed|the-aroma|[a-z-]*-dop-|common-mistakes|the-history|history)/;
export function deepDive(html, path, dist) {
  const m = /^\/blog\/([a-z0-9-]+)\/$/.exec(path);
  if (!m) return { html, n: 0 };
  const slug = m[1].replace(/-charcuterie-board$/, "");
  const ingFile = join(dist, "ingredients", slug, "index.html");
  if (!existsSync(ingFile) || /id="glance"|class="ing-glance"/.test(html)) return { html, n: 0 };
  const ing = readFileSync(ingFile, "utf8");
  const box = (ing.match(/<section class="ing-glance"[\s\S]*?<\/section>/) || [])[0];
  if (!box) return { html, n: 0 };
  const name = ((box.match(/<h2 id="ing-glance-h">([\s\S]*?) at a glance<\/h2>/) || [])[1] || "").trim();
  const glance = box
    .replace('aria-labelledby="ing-glance-h"', 'aria-labelledby="post-glance-h" id="glance"')
    .replace('<h2 id="ing-glance-h">', '<h2 id="post-glance-h">')
    .replace(/<p class="ing-glance-jump">[\s\S]*?<\/p>/, (p) => {
      const pair = (p.match(/<a href="\/pairings\/[^"]*">[^<]*<\/a>/) || [""])[0];
      return `<p class="ing-glance-jump"><a href="/ingredients/${slug}/">Full ${name || "ingredient"} guide</a>${pair}<a href="/ingredients/${slug}/#ing-buy">What to buy</a></p>`;
    });
  let n = 0;
  const a = html.indexOf('<article class="post-body');
  if (a < 0) return { html, n: 0 };
  // Only the older long-template posts (they have background or science
  // sections to fold); the newer compact posts like /blog/coppa/ are left as is.
  if (![...html.slice(a).matchAll(/<h2\b[^>]*\bid="([^"]+)"/g)].some((x) => DEEP_FOLD.test(x[1]))) return { html, n: 0 };
  const open = html.indexOf(">", a) + 1;
  const bq = /^\s*<blockquote>[\s\S]*?<\/blockquote>/.exec(html.slice(open));
  const at = bq ? open + bq[0].length : open;
  html = html.slice(0, at) + "\n" + glance + "\n" + html.slice(at);
  n++;
  const ids = [...html.slice(a).matchAll(/<h2\b[^>]*\bid="([^"]+)"/g)].map((x) => x[1]).filter((id) => DEEP_FOLD.test(id));
  if (ids.length) {
    const r = foldLongPost(html, path, { ids });
    html = r.html; n += r.n;
  }
  return { html, n };
}
