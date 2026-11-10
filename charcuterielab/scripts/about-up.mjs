// 9 Nov 2026: About page trust pass, applied after the build (hub-calm).
// - The wrong "Our own products only" line becomes "How we choose what to
//   recommend" (the site has Amazon affiliate links and ranked Best Buys).
// - The delivery business, in Wisconsin since 2021 (Chris, 9 Nov 2026).
// - How a pairing gets on the site (worked example), how a board plan is put
//   together, sources, corrections and recently updated pages, contact.
// - One email ask: the closing panel stays; the top bar (quick-subscribe SKIP)
//   and the slide-in go.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// A public contact address shows under "Get in touch" when set. Empty = the
// newsletter reply route only.
const CONTACT_EMAIL = "";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function recentlyUpdated(dist, k = 6) {
  const dir = join(dist, "blog");
  const out = [];
  for (const slug of readdirSync(dir)) {
    const f = join(dir, slug, "index.html");
    if (!existsSync(f)) continue;
    const t = readFileSync(f, "utf8");
    const mod = (t.match(/"dateModified":"([^"]+)"/) || [])[1];
    const pub = (t.match(/"datePublished":"([^"]+)"/) || [])[1];
    const title = (t.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
    if (!mod || !title || !pub || mod.slice(0, 10) <= pub.slice(0, 10)) continue; // updated, not just published
    out.push({ slug, mod, title: title.replace(/<[^>]+>/g, "").trim() });
  }
  return out.sort((a, b) => (a.mod < b.mod ? 1 : -1)).slice(0, k);
}
const day = (iso) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function upAbout(html, dist) {
  let n = 0;
  const sub = (a, b) => { if (html.includes(a)) { html = html.split(a).join(b); n++; } };
  // business, in the page and in the Person schema
  sub("I still run my own local charcuterie catering business.", "I still run my own charcuterie delivery business in Wisconsin.");
  sub("Runs a local charcuterie catering business.", "Runs a charcuterie delivery business in Wisconsin, started in 2021.");
  sub("alongside running a local charcuterie catering business.", "alongside running a charcuterie delivery business in Wisconsin, which he started in 2021. The amounts, build orders and swaps on this site are the ones he uses for real orders.");
  // recommendations, replacing the outdated "own products only" line
  html = html.replace(/\s*<li><strong>Our own products only\.<\/strong>[\s\S]*?<\/li>/, () => { n++; return ""; });
  const updated = recentlyUpdated(dist);
  const more = `
        <h2 id="recommend">How we choose what to recommend</h2>
        <ul>
          <li><strong>Scored, not paid.</strong> The Best Buys guides rank brands on published taste tests, reviews and awards, ingredients, value and how easy each one is to find. No brand pays to be listed or to rank higher.</li>
          <li><strong>Affiliate links, said plainly.</strong> Links to Amazon are affiliate links: if you buy, the site may earn a small commission at no extra cost to you. Pages with Amazon links say so under the title. <a href="/privacy/#affiliate-links">How that works</a>.</li>
          <li><strong>Prices with a date.</strong> Prices are typical ranges, and each guide shows when it was last checked. Check the price at checkout.</li>
          <li><strong>Our own titles, labeled as ours.</strong> The books and printables are Charcuterie Lab's own, sold on Gumroad and Amazon, and always named as ours.</li>
        </ul>

        <h2 id="pairing-method">How a pairing gets on the site</h2>
        <p>Every pairing comes with the reason it works, so you can use the idea with what's in your fridge. Take brie and fig jam:</p>
        <ol>
          <li><strong>The cheese.</strong> Brie is mild, buttery and a little salty, with a soft rind.</li>
          <li><strong>What it's missing.</strong> Contrast. On its own, the richness builds up bite after bite.</li>
          <li><strong>What the partner adds.</strong> Fig jam brings sugar and a little acid. Sweet against salt, and acid against fat, make each bite taste lighter than either one alone, and the jam is thick enough to stay put on a soft cheese.</li>
          <li><strong>How to serve it.</strong> On a plain baguette or water cracker, so nothing competes, with the brie out of the fridge for 20 to 30 minutes so its flavor comes through.</li>
        </ol>
        <p>The same few principles (salt and sweet, fat and acid, texture contrast, intensity matching) are behind every pairing in the <a href="/pairings/">Pairings Hub</a>.</p>

        <h2 id="board-method">How a board plan is put together</h2>
        <ul>
          <li><strong>A shopping list with amounts</strong> for the guest count, from the standard above.</li>
          <li><strong>A build order:</strong> the big shapes first, then the fillers, with crackers and anything delicate last.</li>
          <li><strong>A reason for every pairing</strong> on the board, and <strong>a swap for every ingredient</strong> in case the store is out.</li>
          <li><strong>A make-ahead timeline</strong> and the food-safety limit, so it can be built the night before and served safely.</li>
        </ul>

        <h2 id="sources">Sources we rely on</h2>
        <ul>
          <li><strong>Food safety:</strong> the <a href="https://www.fsis.usda.gov/" target="_blank" rel="noopener">USDA Food Safety and Inspection Service</a>, the <a href="https://www.fda.gov/" target="_blank" rel="noopener">FDA</a> and the <a href="https://www.cdc.gov/" target="_blank" rel="noopener">CDC</a>.</li>
          <li><strong>Brand rankings:</strong> published taste tests from Sporked, Tasting Table, The Takeout, Chowhound, The Daily Meal and America's Test Kitchen, listed under Sources on each guide.</li>
          <li><strong>Cheese and cured-meat facts:</strong> producer and consortium sites, university extension services and food-science references, cited on the page where they're used.</li>
        </ul>

        <h2 id="corrections">Corrections and updates</h2>
        <p>When something is wrong, it gets fixed and the page's "last updated" date changes. Prices and picks in the buying guides are rechecked regularly.</p>
        ${updated.length ? `<p>Recently updated:</p>
        <ul class="about-updated">${updated.map((u) => `<li><a href="/blog/${u.slug}/">${esc(u.title)}</a> <span>${day(u.mod)}</span></li>`).join("")}</ul>` : ""}
`;
  html = html.replace(/(\s*)<h2>Get in touch<\/h2>/, (m, ws) => { n++; return `${more}${ws}<h2 id="contact">Get in touch</h2>`; });
  if (CONTACT_EMAIL) html = html.replace(/(<h2 id="contact">Get in touch<\/h2>\s*<p>[\s\S]*?<\/p>)/, (m) => `${m}\n        <p>Or email <strong class="about-email">${esc(CONTACT_EMAIL)}</strong>.</p>`);
  // one email ask: drop the slide-in (the closing panel stays)
  html = html.replace(/<aside class="fx-slide"[\s\S]*?<\/aside>\s*/, () => { n++; return ""; });
  return { html, n };
}
