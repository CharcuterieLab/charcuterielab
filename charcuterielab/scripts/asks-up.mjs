// 13 Nov 2026 (visitor review round 5): two email asks per page, not three or
// four. The quick bar under the title (it restored signups on 10 Nov) and the
// matched box under the quick answer stay; the bottom "Get the Charcuterie
// Cheat Sheet" panel goes wherever both are already on the page. On the diet
// pages the diet label cards (their own matched freebie) move up into the
// box's place, replacing the generic Cheat Sheet box.
export function twoAsks(html, path) {
  let n = 0;
  if (!html.includes("data-qs-bar")) return { html, n };
  const box = /<aside class="fx-hi"[\s\S]*?<\/aside>/.exec(html);
  if (/^\/dietary\/[^/]+\/$/.test(path) && box) {
    const lead = /<aside class="dt-lead"[\s\S]*?<\/aside>/.exec(html);
    if (lead) {
      html = html.replace(lead[0], "");
      html = html.replace(box[0], lead[0]);
      n++;
    }
  }
  // Party Planner size pages already carry their own "email me this list" form.
  if (box || html.includes('class="dt-lead"') || html.includes('id="pp-email-')) {
    html = html.replace(/<section class="lab-news"[\s\S]*?<\/section>\s*/, (m) => { n++; return ""; });
  }
  return { html, n };
}
