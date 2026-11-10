// 9 Nov 2026: easier reading. Paragraphs that pack three or more bold labels
// ("<strong>2 people:</strong> 8–10 inch. <strong>4–6:</strong> ...") become a
// short labelled list, and the Safe / Check the label / Skip key on the diet
// pages becomes three chips that match the badges below it.
// Called from hub-calm.mjs on every page after the build.

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
