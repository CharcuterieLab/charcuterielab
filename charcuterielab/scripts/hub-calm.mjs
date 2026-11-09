// Calmer hubs (8 Nov 2026, visitor review round 3). Applied to the built
// pages after the offers and quick-subscribe passes, so the hub generators
// stay untouched.
//   /dietary/: one email ask. The page-matched "Diet label cards" box moves up
//   to sit right after the Diet Checker; the quick bar (skipped in
//   quick-subscribe.mjs) and the closing cheat-sheet panel go. The swap chart
//   folds behind its heading.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function calmHubs(dist) {
  const done = [];
  const file = join(dist, "dietary", "index.html");
  let html;
  try { html = await readFile(file, "utf8"); } catch { return done; }
  // 1. Drop the closing newsletter panel.
  html = html.replace(/<section class="lab-news"[\s\S]*?<\/section>\s*/, () => { done.push("lab-news"); return ""; });
  // 2. Move the label-card email box to right after the Diet Checker.
  const lead = html.match(/<aside class="dt-lead"[\s\S]*?<\/aside>\s*/);
  const chk = html.indexOf('<section class="dt-checker"');
  if (lead && chk > 0 && lead.index > chk) {
    html = html.slice(0, lead.index) + html.slice(lead.index + lead[0].length);
    const end = html.indexOf("</section>", chk) + "</section>".length;
    html = html.slice(0, end) + "\n\n    " + lead[0] + html.slice(end);
    done.push("lead-moved");
  }
  // 3. Fold the swap chart.
  html = html.replace(/<section class="bl-section" aria-labelledby="swaps-h">\s*<h2 id="swaps-h">([^<]*)<\/h2>([\s\S]*?)<\/section>/, (all, title, body) => {
    done.push("swaps-folded");
    return `<details class="bl-section dt-fold" id="swaps">
      <summary><h2 id="swaps-h">${title}</h2><span>The easy swap for each diet, item by item.</span></summary>${body}</details>`;
  });
  await writeFile(file, html);
  return done;
}
