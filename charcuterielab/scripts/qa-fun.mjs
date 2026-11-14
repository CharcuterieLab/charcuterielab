// Best Buys guides (14 Nov 2026): the Quick Answer becomes a short, playful
// bullet list built from the guide's own "Our top picks" rows: the #1 pick,
// best value, splurge (with the checked price when the guide has one) and the
// easiest-to-find pick from the "Best for..." row when it's a different brand.
const POOLS = {
  lead: ["The short version:", "In a hurry? Here's your cheat sheet:", "Standing in the aisle right now? Grab one of these:", "Skip the reading. Here's what to buy:", "The 10-second answer:"],
  top: ["If you only buy one", "The crowd-pleaser", "Our gold medal", "The no-brainer", "Top of the board"],
  value: ["Easy on the wallet", "Most bang for your buck", "Budget hero", "Cheap and cheerful", "Big flavor, small bill"],
  splurge: ["Treat yourself", "Feeling fancy?", "Worth the splurge", "The show-off pick", "Special-occasion pick"],
  find: ["On almost every shelf", "Can't find the others?", "Grab-and-go anywhere", "Easiest to track down"]
};
const ICON = { top: "🏆", value: "💸", splurge: "✨", find: "🛒" };
// Words that stay capitalized when two short sentences are joined with a comma
const KEEP_CAPS = /^(Brie|Salami|Halloumi|Nduja|Calabrese|PT|DOP|AOP|Trader|Costco|Aldi|Walmart|Target|American|Italian|French|Spanish)\b|^[A-Z]{2,}/;
const OTHER = ["🎯", "⭐", "🎉", "👌"];

function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
const pick = (pool, seed, k) => pool[(seed + k) % pool.length];
const text = (s = "") => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export function funQuickAnswer(html, path) {
  if (!/^\/blog\/[^/]+\/$/.test(path) || !html.includes('class="sk-top"') || html.includes('class="qa-fun"')) return { html, n: 0 };
  const qa = /<blockquote><p><strong>Quick Answer:<\/strong>[\s\S]*?<\/blockquote>/.exec(html);
  if (!qa) return { html, n: 0 };
  const rows = [];
  for (const m of html.matchAll(/<div class="sk-top-row">([\s\S]*?)<\/div><\/div>/g)) {
    const r = m[1];
    const name = (/<a class="sk-top-name" href="(#[^"]+)">([\s\S]*?)<\/a>/.exec(r)) || [];
    if (!name[2]) continue;
    rows.push({
      href: name[1], name: text(name[2]),
      pill: text((/<p class="sk-pill">([\s\S]*?)<\/p>/.exec(r) || [])[1]),
      line: text((/<p class="sk-top-line">([\s\S]*?)<\/p>/.exec(r) || [])[1]),
      price: (/· (about [^<]*)<\/span>/.exec(r) || [])[1] || ""
    });
  }
  if (!rows.length) return { html, n: 0 };
  const seed = hash(path);
  const kind = (p) => /overall|top pick|^best$/i.test(p) ? "top" : /value|budget|cheap/i.test(p) ? "value" : /splurge|premium|luxury/i.test(p) ? "splurge" : /easiest|easy to find|everywhere/i.test(p) ? "find" : "other";
  const items = rows.slice(0, 3).map((r, i) => {
    const k = i === 0 && kind(r.pill) === "other" ? "top" : kind(r.pill);
    const label = (k === "other" || (k === "find" && r.pill)) ? (r.pill || "Also great") : pick(POOLS[k], seed, i);
    return { ...r, k, label };
  });
  // Easiest to find, from the "Best for..." row, when it's a brand not already listed
  const easy = /<span>Easiest to find<\/span><strong>([\s\S]*?)<\/strong>/.exec(html);
  if (easy && !items.some((x) => x.name === text(easy[1]))) {
    const href = (new RegExp('<a href="(#pick-\\d+)"><span>Easiest to find</span>').exec(html) || [])[1] || "#picks";
    items.push({ name: text(easy[1]), href, line: "", price: "", k: "find", label: pick(POOLS.find, seed, 0) });
  }
  const li = items.map((x, i) => {
    const why = x.line ? ` — ${x.line.replace(/\.\s+(\S+)/g, (m, w) => ", " + (KEEP_CAPS.test(w) ? w : w.charAt(0).toLowerCase() + w.slice(1))).replace(/\.$/, "")}` : "";
    const cost = x.price ? ` <span class="qa-price">(${x.price})</span>` : "";
    return `<li><span class="qa-ico" aria-hidden="true">${ICON[x.k] || OTHER[(seed + i) % OTHER.length]}</span><span><strong>${x.label}${/\?$/.test(x.label) ? "" : ":"}</strong> <a href="${x.href}">${x.name}</a>${why}${cost}</span></li>`;
  }).join("");
  const box = `<blockquote class="qa-fun"><p><strong>Quick Answer:</strong> ${pick(POOLS.lead, seed, 0)}</p><ul class="qa-list">${li}</ul></blockquote>`;
  return { html: html.replace(qa[0], box), n: 1 };
}
