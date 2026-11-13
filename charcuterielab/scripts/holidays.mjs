// Holiday Hub: /holidays/ plus one evergreen page per holiday.
// Content lives in content/holidays/<slug>.json. URLs never contain a year:
// each fall, update the dates, prices and one new board on each page and the
// page keeps its search history.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { card, worldOffer } from "./boards.mjs";

// The full calendar. Pages that exist link; the rest show as "coming".
export const HOLIDAY_CALENDAR = [
  { slug: "halloween", name: "Halloween", dates: ["2026-10-31", "2027-10-31"], season: "Fall" },
  { slug: "thanksgiving", name: "Thanksgiving & Friendsgiving", dates: ["2026-11-26", "2027-11-25"], season: "Fall" },
  { slug: "hanukkah", name: "Hanukkah", dates: ["2026-12-04", "2027-12-24"], season: "Winter" },
  { slug: "christmas", name: "Christmas & Holiday Parties", dates: ["2026-12-25", "2027-12-25"], season: "Winter" },
  { slug: "new-years-eve", name: "New Year's Eve", dates: ["2026-12-31", "2027-12-31"], season: "Winter" },
  { slug: "super-bowl", name: "Super Bowl", dates: ["2027-02-14"], season: "Winter" },
  { slug: "valentines-day", name: "Valentine's Day", dates: ["2027-02-14"], season: "Winter" },
  { slug: "st-patricks-day", name: "St. Patrick's Day", dates: ["2027-03-17"], season: "Spring" },
  { slug: "easter", name: "Easter", dates: ["2027-03-28"], season: "Spring" },
  { slug: "mothers-day", name: "Mother's Day", dates: ["2027-05-09"], season: "Spring" },
  { slug: "memorial-day", name: "Memorial Day & Graduation", dates: ["2027-05-31"], season: "Summer" },
  { slug: "fourth-of-july", name: "Fourth of July", dates: ["2027-07-04"], season: "Summer" }
];

export async function loadHolidays(root) {
  const dir = join(root, "content", "holidays");
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const all = await Promise.all(files.map(async (f) => JSON.parse(await readFile(join(dir, f), "utf8"))));
  return all.filter((x) => x.status === "published").sort((a, b) => a.order - b.order);
}

const nextDate = (dates, today = new Date().toISOString().slice(0, 10)) => dates.find((d) => d >= today) || dates[dates.length - 1];
const pretty = (iso) => new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

// Days-before for each plan step, read from its label
function daysBefore(when) {
  const w = when.toLowerCase();
  const n = Number((w.match(/(\d+)/) || [])[1] || 1);
  if (w.includes("week")) return n * 7;
  if (w.includes("day") && !w.includes("today")) return n;
  return 0;
}

export function builderPreset(items, guests, campaign) {
  return `/board-builder/?b=${items.join(",")}&g=${guests}&m=app&utm_source=charcuterielab&utm_medium=site&utm_campaign=${campaign}`;
}

// Simple layout diagrams for the shape ideas. Colors: cheese gold, meat red,
// crackers tan, greens green, fruit purple/orange.
const C = { cheese: "#e9b949", meat: "#b33a3a", cracker: "#d9b88a", green: "#4d7c3a", fruit: "#7b3f8c", orange: "#e5862c", dark: "#2b2320", white: "#f4efe4", board: "#8a5a3b" };
function shapeSvg(shape) {
  const dot = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  const ring = (cx, cy, R, n, r, colors) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return dot((cx + R * Math.cos(a)).toFixed(1), (cy + R * Math.sin(a)).toFixed(1), r, colors[i % colors.length]); }).join("");
  let body = "";
  if (shape === "wreath") body = `<circle cx="150" cy="110" r="92" fill="${C.board}" opacity=".25"/>${ring(150, 110, 70, 22, 13, [C.green, C.meat, C.cheese, C.green, C.fruit])}${ring(150, 110, 70, 11, 5, [C.meat])}${dot(150, 110, 26, C.white)}<path d="M136 182 l14 -8 l14 8 l-14 8z" fill="${C.meat}"/>`;
  else if (shape === "tree") body = [0, 1, 2, 3, 4, 5].map((r) => { const w = 40 + r * 34, y = 28 + r * 28, cols = [C.green, C.meat, C.cheese, C.green, C.cracker, C.fruit]; return `<rect x="${150 - w / 2}" y="${y}" width="${w}" height="20" rx="10" fill="${cols[r]}"/>`; }).join("") + `<rect x="138" y="196" width="24" height="18" fill="${C.board}"/><path d="M150 4 l6 12 h13 l-10 8 l4 13 l-13 -8 l-13 8 l4 -13 l-10 -8 h13z" fill="${C.cheese}"/>`;
  else if (shape === "candycane") body = `<path d="M110 200 V80 a40 40 0 0 1 80 0 v20" fill="none" stroke="${C.white}" stroke-width="34" stroke-linecap="round"/><path d="M110 200 V80 a40 40 0 0 1 80 0 v20" fill="none" stroke="${C.meat}" stroke-width="34" stroke-dasharray="16 16" stroke-linecap="butt"/>${ring(150, 150, 95, 14, 6, [C.green])}`;
  else if (shape === "pumpkin") body = `<ellipse cx="150" cy="118" rx="105" ry="88" fill="${C.orange}"/>${ring(150, 118, 60, 16, 9, [C.cheese, C.orange])}<path d="M100 95 l22 -22 l22 22z M156 95 l22 -22 l22 22z" fill="${C.dark}"/><path d="M95 140 q55 45 110 0 l-14 12 l-12 -10 l-12 10 l-14 -10 l-14 10 l-12 -10 l-12 10z" fill="${C.dark}"/><rect x="140" y="18" width="20" height="26" rx="4" fill="${C.green}"/>`;
  else if (shape === "web") body = `<circle cx="150" cy="112" r="98" fill="${C.board}" opacity=".25"/>${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<line x1="150" y1="112" x2="${(150 + 98 * Math.cos(a)).toFixed(1)}" y2="${(112 + 98 * Math.sin(a)).toFixed(1)}" stroke="${C.white}" stroke-width="3"/>`; }).join("")}${[30, 55, 80].map((r) => `<circle cx="150" cy="112" r="${r}" fill="none" stroke="${C.white}" stroke-width="3"/>`).join("")}${ring(150, 112, 68, 8, 9, [C.meat, C.cheese])}${dot(150, 112, 10, C.dark)}`;
  else if (shape === "cauldron") body = `${ring(150, 112, 80, 18, 13, [C.meat, C.cheese, C.fruit, C.cracker])}${ring(150, 112, 50, 12, 8, [C.cracker])}<circle cx="150" cy="112" r="32" fill="${C.dark}"/><ellipse cx="150" cy="104" rx="24" ry="10" fill="${C.green}"/>`;
  else if (shape === "turkey") body = `${[0, 1, 2, 3, 4, 5, 6].map((i) => { const a = Math.PI + (i + 0.5) * (Math.PI / 7); const cols = [C.cracker, C.meat, C.cheese, C.orange, C.cheese, C.meat, C.cracker]; return `<ellipse cx="${(150 + 70 * Math.cos(a)).toFixed(1)}" cy="${(150 + 70 * Math.sin(a)).toFixed(1)}" rx="16" ry="44" fill="${cols[i]}" transform="rotate(${((a * 180) / Math.PI + 90).toFixed(0)} ${(150 + 70 * Math.cos(a)).toFixed(1)} ${(150 + 70 * Math.sin(a)).toFixed(1)})"/>`; }).join("")}<circle cx="150" cy="160" r="38" fill="${C.board}"/><circle cx="150" cy="128" r="20" fill="${C.board}"/>${dot(143, 124, 3, C.dark)}${dot(157, 124, 3, C.dark)}<path d="M150 130 l-6 8 h12z" fill="${C.orange}"/>`;
  else if (shape === "cornucopia") body = `<path d="M40 60 q110 -20 150 60 l-30 30 q-40 -60 -120 -40z" fill="${C.cracker}"/>${ring(210, 150, 40, 10, 12, [C.fruit, C.meat, C.cheese, C.orange, C.green])}${dot(250, 190, 10, C.fruit)}${dot(185, 195, 10, C.orange)}`;
  else if (shape === "garland") body = Array.from({ length: 7 }, (_, i) => `<ellipse cx="${50 + i * 34}" cy="${190 - i * 26}" rx="18" ry="10" fill="${[C.orange, C.cheese, C.meat][i % 3]}" transform="rotate(-38 ${50 + i * 34} ${190 - i * 26})"/>`).join("") + ring(90, 80, 30, 6, 9, [C.fruit, C.cracker]) + ring(220, 170, 30, 6, 9, [C.cracker, C.green]);
  // Shapes for the winter and spring hubs (added 2026-10-05)
  else if (shape === "heart") { const pts = Array.from({ length: 26 }, (_, i) => { const a = (i / 26) * Math.PI * 2; return [150 + 5.2 * 16 * Math.sin(a) ** 3, 100 - 5.2 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]; }); body = `<path d="M${pts.map((q) => q.map((v) => v.toFixed(1)).join(" ")).join(" L")}Z" fill="${C.board}" opacity=".25"/>` + pts.map((q, i) => dot(q[0].toFixed(1), q[1].toFixed(1), 9, [C.meat, C.white, C.fruit, C.cheese][i % 4])).join("") + dot(150, 112, 22, C.dark); }
  else if (shape === "football") body = `<ellipse cx="150" cy="110" rx="120" ry="70" fill="${C.board}"/>${ring(150, 110, 48, 12, 10, [C.cheese, C.meat, C.cracker])}<rect x="105" y="104" width="90" height="12" rx="3" fill="${C.white}"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${117 + i * 15}" y="94" width="6" height="32" rx="2" fill="${C.white}"/>`).join("")}`;
  else if (shape === "menorah") body = `<rect x="40" y="186" width="220" height="14" rx="6" fill="${C.cracker}"/>${Array.from({ length: 9 }, (_, i) => { const x = 46 + i * 26, tall = i === 4; const top = tall ? 40 : 70; return `<rect x="${x}" y="${top}" width="12" height="${186 - top}" rx="5" fill="${i === 4 ? C.cheese : C.cracker}"/><ellipse cx="${x + 6}" cy="${top - 10}" rx="7" ry="11" fill="${C.orange}"/>`; }).join("")}`;
  else if (shape === "star6") body = `<path d="M150 20 L232 160 H68 Z" fill="none" stroke="#3b6fb6" stroke-width="16" stroke-linejoin="round"/><path d="M150 200 L68 60 H232 Z" fill="none" stroke="${C.white}" stroke-width="16" stroke-linejoin="round"/>${ring(150, 110, 30, 6, 9, [C.cheese, C.fruit])}${dot(150, 110, 14, C.white)}`;
  else if (shape === "clock") body = `<circle cx="150" cy="110" r="96" fill="${C.dark}"/>${ring(150, 110, 78, 12, 10, [C.cheese, C.white, C.cracker])}<rect x="146" y="44" width="8" height="70" rx="4" fill="${C.cheese}"/><rect x="146" y="58" width="8" height="56" rx="4" fill="${C.white}" transform="rotate(8 150 110)"/>${dot(150, 110, 9, C.meat)}`;
  else if (shape === "shamrock") body = `${dot(150, 62, 44, C.green)}${dot(104, 128, 44, C.green)}${dot(196, 128, 44, C.green)}<path d="M150 120 q8 60 -14 96" stroke="${C.green}" stroke-width="14" fill="none" stroke-linecap="round"/>${ring(150, 62, 24, 7, 7, [C.cheese, C.white])}${ring(104, 128, 24, 7, 7, [C.meat, C.cracker])}${ring(196, 128, 24, 7, 7, [C.cracker, C.cheese])}`;
  // Spring and summer shapes (3 Nov 2026)
  else if (shape === "flag") body = `<rect x="30" y="30" width="240" height="160" rx="10" fill="${C.board}" opacity=".25"/>${Array.from({ length: 7 }, (_, i) => `<rect x="30" y="${30 + i * 22.8}" width="240" height="22.8" fill="${i % 2 ? C.white : C.meat}"/>`).join("")}<rect x="30" y="30" width="104" height="91" fill="#3b6fb6"/>${Array.from({ length: 12 }, (_, i) => dot(46 + (i % 4) * 24, 46 + Math.floor(i / 4) * 28, 6, "#26487f")).join("")}`;
  else if (shape === "star5") { const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 40 : 98; return `${(150 + r * Math.cos(a)).toFixed(1)} ${(115 + r * Math.sin(a)).toFixed(1)}`; }); body = `<circle cx="150" cy="112" r="104" fill="${C.meat}" opacity=".85"/><path d="M${pts.join(" L")}Z" fill="${C.white}"/>${ring(150, 118, 22, 7, 7, ["#3b6fb6"])}${dot(150, 118, 9, "#3b6fb6")}`; }
  else if (shape === "flower") body = `${ring(150, 110, 62, 8, 34, [C.meat, C.fruit, C.cheese, C.orange])}<circle cx="150" cy="110" r="36" fill="${C.white}"/>${dot(150, 110, 18, C.cheese)}<path d="M150 170 q-6 30 4 46" stroke="${C.green}" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="174" cy="198" rx="18" ry="8" fill="${C.green}" transform="rotate(-25 174 198)"/>`;
  else if (shape === "gradcap") body = `<path d="M150 40 L270 90 L150 140 L30 90 Z" fill="${C.dark}"/>${ring(150, 90, 40, 10, 7, [C.cheese, C.cracker])}<path d="M80 112 v42 q70 40 140 0 v-42 l-70 28z" fill="${C.meat}"/><line x1="230" y1="96" x2="236" y2="170" stroke="${C.cheese}" stroke-width="5"/>${dot(236, 176, 9, C.cheese)}`;
  else if (shape === "rainbow") body = [C.meat, C.orange, C.cheese, C.green, "#3b6fb6", C.fruit].map((c, i) => `<path d="M${40 + i * 16} 190 a${110 - i * 16} ${110 - i * 16} 0 0 1 ${220 - i * 32} 0" fill="none" stroke="${c}" stroke-width="15"/>`).join("") + `${dot(36, 196, 18, C.white)}${dot(264, 196, 18, C.cheese)}`;
  else if (shape === "egg") body = `<defs><clipPath id="egg-clip"><ellipse cx="150" cy="112" rx="78" ry="98"/></clipPath></defs><ellipse cx="150" cy="112" rx="78" ry="98" fill="${C.white}"/><g clip-path="url(#egg-clip)">${[0, 1, 2, 3, 4].map((i) => `<rect x="72" y="${42 + i * 30}" width="156" height="14" fill="${[C.fruit, C.cheese, C.green, C.orange, C.meat][i]}" opacity=".85"/>`).join("")}</g><ellipse cx="150" cy="112" rx="78" ry="98" fill="none" stroke="${C.board}" stroke-width="6"/>`;
  else if (shape === "nest") body = `${ring(150, 112, 78, 30, 12, [C.cracker, C.board, C.cracker])}${ring(150, 112, 56, 20, 9, [C.cracker, C.cheese])}${dot(130, 104, 18, C.white)}${dot(168, 100, 18, "#cfe3f2")}${dot(150, 132, 18, C.cheese)}`;
  return `<svg viewBox="0 0 300 220" role="img" aria-label="Layout diagram" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="220" rx="14" fill="#f3ead8"/>${body}</svg>`;
}

function countdownJs() {
  return `<script>
(() => {
  const today = new Date(); today.setHours(0,0,0,0);
  document.querySelectorAll('[data-countdown]').forEach((el) => {
    const dates = JSON.parse(el.dataset.countdown);
    const next = dates.map((d) => new Date(d + 'T00:00:00')).find((d) => d >= today);
    if (!next) return;
    const days = Math.round((next - today) / 86400000);
    el.textContent = days === 0 ? 'Today!' : days === 1 ? '1 day to go' : days + ' days to go';
    const plan = el.dataset.plan && document.getElementById(el.dataset.plan);
    if (plan) {
      const steps = [...plan.querySelectorAll('[data-days]')];
      let active = null;
      for (const s of steps) if (Number(s.dataset.days) >= days) active = s;
      if (!active && steps.length) active = steps[0];
      if (active && days <= Number(steps[0].dataset.days) + 30) active.classList.add('is-now');
    }
  });
})();
</script>`;
}

// The house 2/3/4 standard at appetizer amounts (2 oz each), plus 10% from 20 guests up.
const amounts = [6, 12, 20].map((g) => { const k = g >= 20 ? 1.1 : 1; return { g, cheese: (g * 2 * k) / 16, meat: (g * 2 * k) / 16, crackers: `${g * 6}–${g * 8}` }; });
const lb = (x) => (x < 1 ? `${Math.round(x * 16)} oz` : `${(Math.round(x * 4) / 4).toString().replace(/\.25$/, "¼").replace(/\.5$/, "½").replace(/\.75$/, "¾")} lb`);

// Holiday -> its board in 50 Boards Built by Science
export const HOLIDAY_BOOK_BOARD = { thanksgiving: 20, christmas: 6, "new-years-eve": 22, "super-bowl": 8, "valentines-day": 21, "st-patricks-day": 23, easter: 24 };

function bookBox(h, hol) {
  if (hol.book === "world") return worldOffer(h, `holiday_${hol.slug}`, { heading: "The gift for the host who has everything", lead: `<em>Around the World in 16 Boards</em> blueprints sixteen international boards, from a Bavarian beer-hall spread to a Korean BBQ board, with shopping lists, prep countdowns and pairing science.` });
  const bb = h.bookBoards && HOLIDAY_BOOK_BOARD[hol.slug] ? h.bookBoards.get(HOLIDAY_BOOK_BOARD[hol.slug]) : null;
  if (bb && h.bookCard) {
    return h.bookCard(bb, `holiday_${hol.slug}`, { lead: `Everything on this page, plus the full plan: the exact shopping list with amounts and prices, a timed build, where every item goes and why, and a swap for every ingredient. With New Year's Eve, Game Day and 47 more boards.` });
  }
  return `<section class="bl-book" aria-labelledby="hol-book">
      <img src="${(h.thumb || ((x) => x))("/images/book-cover.jpg", "s")}" alt="" width="160" height="207" loading="lazy" decoding="async">
      <div>
        <p class="eyebrow">Plan every board this season</p>
        <h2 id="hol-book">50 boards, fully planned</h2>
        <p>Exact shopping lists, prep timelines, placement steps and pairing science for 50 boards, including Thanksgiving, Holiday Entertaining, New Year's Eve and Game Day, in <em>${h.escapeHtml(h.bookTitle)}</em>.</p>
        ${h.bookButtons(`holiday_${hol.slug}`)}
      </div>
    </section>`;
}

// Dates for the byline and schema; a holiday file can override with "date" / "updated".
const HOL_PUBLISHED = "2026-09-23";
const HOL_UPDATED = "2026-09-26";

export function holidayPage(h, hol, { boardsBySlug, known, blogTitles, holidays }) {
  const updated = hol.updated || HOL_UPDATED;
  const boards = hol.boards.map((s) => boardsBySlug.get(s)).filter(Boolean);
  // "blog" posts also carry this hub's banner; "read" posts are only linked from the hub.
  const blogs = [...(hol.blog || []), ...(hol.read || [])].filter((s) => blogTitles.has(s));
  const next = nextDate(hol.dates);
  const item = (s) => (known.has(s) ? `<a href="/ingredients/${s}/">${h.escapeHtml(known.get(s))}</a>` : h.escapeHtml(s));
  const others = holidays.filter((x) => x.slug !== hol.slug);
  const timely = holidayTimely(h, hol, holidays);
  const schema = [
    {
      "@context": "https://schema.org", "@type": "CollectionPage", name: hol.h1, url: h.absoluteUrl(`/holidays/${hol.slug}/`), description: hol.description, ...(h.authorRef ? { author: h.authorRef } : {}), datePublished: hol.date || HOL_PUBLISHED, dateModified: updated,
      mainEntity: { "@type": "ItemList", itemListElement: [...hol.ideas.map((i) => i.title), ...boards.map((b) => b.h1)].map((name, i) => ({ "@type": "ListItem", position: i + 1, name })) }
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: hol.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Holidays", "/holidays/"], [hol.name, `/holidays/${hol.slug}/`]].map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: h.absoluteUrl(url) })) }
  ];
  return h.layout({
    title: `${hol.seo_title} | Charcuterie Lab`,
    canonical: `/holidays/${hol.slug}/`,
    image: hol.image,
    description: hol.description,
    head: schema.map((s) => `  <script type="application/ld+json">${h.jsonForScript(s)}</script>`).join("\n"),
    body: `<main class="bl-main hol-main">
  <div class="bl-inner hol-inner">
    <p class="ing-crumb"><a href="/holidays/">Holidays</a> <span aria-hidden="true">/</span> ${h.escapeHtml(hol.name)}</p>
    ${timely.after}
    <header class="hol-hero">
      <div>
        <p class="section-kicker">${h.escapeHtml(pretty(next))}</p>
        <h1>${h.escapeHtml(hol.h1)}</h1>
        <p class="hol-count" data-countdown='${JSON.stringify(hol.dates)}' data-plan="hol-plan"></p>
        <p class="hol-answer">${h.escapeHtml(hol.answer)}</p>
        ${h.byline ? `<p class="bl-byline">${h.byline(h.longDate ? ` · Updated ${h.longDate(updated)}` : "")}</p>` : ""}
        <p class="bl-cta-row"><a class="button primary" href="${builderPreset(hol.builder.items, hol.builder.guests, `holiday_${hol.slug}`)}">Plan a ${h.escapeHtml(hol.name)} board for your guest count</a></p>
      </div>
      <img class="hol-photo" src="${h.escapeHtml(hol.image)}" alt="${h.escapeHtml(hol.name)} charcuterie board" width="1200" height="800" fetchpriority="high">
    </header>
    ${timely.last}
    ${timely.js}

    <nav class="hol-jump" aria-label="On this page"><a href="#ideas">Board ideas</a><a href="#shapes">Shapes</a><a href="#plan">Countdown and make-ahead</a><a href="#amounts">How much to buy</a>${hol.mistakes ? `<a href="#mistakes">Mistakes</a>` : ""}<a href="#faq">Questions</a></nav>

    <section class="bl-section" id="ideas" aria-labelledby="ideas-h">
      <h2 id="ideas-h">${h.escapeHtml(hol.name)} board ideas</h2>
      <div class="hol-ideas">
        ${hol.ideas.map((i) => {
          // An idea can point at a published board ("board") or a live post ("post") (18 Oct 2026).
          const ib = i.board ? boardsBySlug.get(i.board) : null;
          const post = i.post && blogTitles.has(i.post) ? i.post : "";
          const href = post ? `/blog/${post}/` : ib ? `/boards/${ib.slug}/` : "";
          const img = i.image || (ib && !ib.placeholder ? ib.image : "");
          const onIt = i.items && i.items.length ? i.items.map(item).join(" · ") : ib ? h.escapeHtml(ib.groups.flatMap((g) => g.items.map((x) => x.name)).slice(0, 10).join(" · ")) : i.on_it ? h.escapeHtml(i.on_it) : "";
          return `<article class="hol-idea">
          ${img ? `<a class="hol-idea-img" href="${href || "#ideas"}"><img src="${h.escapeHtml((h.thumb || ((x) => x))(img))}" alt="${h.escapeHtml(i.title)}" width="600" height="400" loading="lazy" decoding="async"></a>` : ""}
          <p class="hol-for">${h.escapeHtml(i.for)}</p>
          <h3>${href ? `<a href="${href}">${h.escapeHtml(i.title)}</a>` : h.escapeHtml(i.title)}</h3>
          <p>${h.escapeHtml(i.text)}</p>
          ${onIt ? `<p class="hol-items">${onIt}</p>` : ""}
          ${href ? `<a class="text-link" href="${href}">${h.escapeHtml(i.link_text || (post ? "Read the full guide" : "See the full board"))} &rarr;</a>` : ""}
          ${i.items && i.items.length ? `<a class="text-link" href="${builderPreset(i.items.filter((s) => known.has(s)), i.guests, `holiday_${hol.slug}_idea`)}">Get the shopping list for ${i.guests} &rarr;</a>` : ""}
        </article>`;
        }).join("\n        ")}
      </div>
    </section>

    ${boards.length ? `<section class="bl-section" aria-labelledby="plans-h">
      <h2 id="plans-h">Full board plans for ${h.escapeHtml(hol.name)}</h2>
      <p class="bl-note">Each one has what to buy, why it works and a timeline.</p>
      <ul class="bl-grid bl-grid-3">
${boards.map((b) => card(b, h)).join("\n")}
      </ul>
    </section>` : ""}

    <section class="bl-section" id="shapes" aria-labelledby="shapes-h">
      <h2 id="shapes-h">${h.escapeHtml(hol.name)} board shapes</h2>
      <div class="hol-shapes">
        ${hol.shapes.map((s) => `<article class="hol-shape">
          ${shapeSvg(s.shape)}
          <h3>${h.escapeHtml(s.name)}</h3>
          <ol>${s.steps.map((t) => `<li>${h.escapeHtml(t)}</li>`).join("")}</ol>
          ${s.post ? `<p class="hol-shape-more"><a href="/blog/${s.post}/">Full step-by-step guide and amounts</a></p>` : ""}
        </article>`).join("\n        ")}
      </div>
    </section>

    <section class="bl-section" id="plan" aria-labelledby="plan-h">
      <h2 id="plan-h">Countdown and make-ahead plan</h2>
      <ol class="bl-timeline hol-plan" id="hol-plan">
        ${hol.plan.map((p) => `<li data-days="${daysBefore(p.when)}"><b>${h.escapeHtml(p.when)}</b><span>${h.escapeHtml(p.what)}</span></li>`).join("\n        ")}
      </ol>
      ${hol.make_ahead ? `<div class="hol-ma">
        <div class="hol-ma-col"><h3>Make ahead</h3><ul>${hol.make_ahead.ahead.map((t) => `<li>${h.escapeHtml(t)}</li>`).join("")}</ul></div>
        <div class="hol-ma-col"><h3>Leave for the last hour</h3><ul>${hol.make_ahead.last.map((t) => `<li>${h.escapeHtml(t)}</li>`).join("")}</ul></div>
      </div>` : ""}
    </section>

    <section class="bl-section" id="amounts" aria-labelledby="amounts-h">
      <h2 id="amounts-h">How much to buy</h2>
      <p>Served as an appetizer before a meal, plan about <strong>2 oz of cheese, 2 oz of meat and 6–8 crackers per guest</strong>. If the board is the party food, plan 3 oz of each; if it's dinner, 4 oz. From 20 guests, add 10% (included below).</p>
      <table class="hol-amounts">
        <thead><tr><th>Guests</th><th>Cheese</th><th>Meat</th><th>Crackers</th><th></th></tr></thead>
        <tbody>
        ${amounts.map((a) => `<tr><td>${a.g}</td><td>${lb(a.cheese)}</td><td>${lb(a.meat)}</td><td>${a.crackers}</td><td><a href="${builderPreset(hol.builder.items, a.g, `holiday_${hol.slug}_amounts`)}">Full list</a></td></tr>`).join("\n        ")}
        </tbody>
      </table>
    </section>

    ${hol.mistakes ? `<section class="bl-section" id="mistakes" aria-labelledby="mistakes-h">
      <h2 id="mistakes-h">${h.escapeHtml(hol.name)} board mistakes to avoid</h2>
      <ul class="bi-list">${hol.mistakes.map((m) => `<li><strong>${h.escapeHtml(m.lead)}</strong> ${h.escapeHtml(m.text)}</li>`).join("")}</ul>
    </section>` : ""}

    ${bookBox(h, hol)}

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">${h.escapeHtml(hol.name)} charcuterie questions</h2>
      <div class="ebook-faq-list">
        ${hol.faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${h.escapeHtml(f.q)}</summary><p>${h.escapeHtml(f.a)}</p></details>`).join("\n        ")}
      </div>
    </section>

    ${holidayNext(h, hol)}

    <section class="bl-section" aria-labelledby="more-h">
      <h2 id="more-h">Keep planning</h2>
      ${blogs.length ? `<p class="bl-note">Read more: ${blogs.map((s) => `<a href="/blog/${s}/">${h.escapeHtml(blogTitles.get(s))}</a>`).join(" · ")}</p>` : ""}
      <p class="bl-note">Other holidays: ${others.map((x) => `<a href="/holidays/${x.slug}/">${h.escapeHtml(x.name)}</a>`).join(" · ")} · <a href="/holidays/">All holidays</a></p>
    </section>
  </div>
${h.newsletterPanel("hol-email", `holiday_${hol.slug}`)}
${h.stickyBar ? h.stickyBar(`sticky_holiday_${hol.slug}`, h.bookBoards && HOLIDAY_BOOK_BOARD[hol.slug] ? h.bookBoards.get(HOLIDAY_BOOK_BOARD[hol.slug]) : null) : ""}
</main>
${countdownJs()}`
  });
}

// Holiday next steps (12 Oct 2026): what to buy for this holiday (the brand
// guides), the gift guide in gift season, and the matching printable.
const HOLIDAY_NEXT = {
  thanksgiving: { guides: [["best-cranberry-sauce", "Best canned cranberry sauce"], ["best-brie-brands", "Best brie for baking"], ["best-mixed-nuts", "Best mixed nuts"], ["best-sparkling-cider", "Best sparkling cider"]], print: ["grazing-table-planner", "Grazing Table Planner"], gifts: true },
  christmas: { guides: [["best-charcuterie-gift-boxes", "Best charcuterie gift boxes"], ["best-shortbread", "Best shortbread"], ["best-cranberry-sauce", "Best cranberry sauce"], ["best-dark-chocolate", "Best dark chocolate"]], print: ["british-christmas-cheese-board", "British Christmas Cheese Board"], gifts: true },
  hanukkah: { guides: [["best-smoked-salmon", "Best smoked salmon"], ["best-cream-cheese", "Best cream cheese"], ["best-hummus", "Best hummus"]], gifts: true },
  "new-years-eve": { guides: [["best-prosecco", "Best prosecco"], ["best-smoked-salmon", "Best smoked salmon"], ["best-brie-brands", "Best brie"], ["best-sparkling-cider", "Best sparkling cider (non-alcoholic)"]], print: ["new-years-eve-blini-bar", "New Year's Eve Blini Bar"] },
  "super-bowl": { guides: [["best-salsa", "Best salsa"], ["best-guacamole", "Best guacamole"], ["best-queso", "Best queso"]], print: ["salami-tasting-party-kit", "Salami Tasting Party Kit"] },
  "valentines-day": { guides: [["best-dark-chocolate", "Best dark chocolate"], ["best-strawberry-jam", "Best strawberry jam"], ["best-brie-brands", "Best brie"]] },
  halloween: { guides: [["best-pretzels-for-charcuterie", "Best pretzels"], ["best-cheddar-brands", "Best cheddar"], ["best-meat-sticks", "Best meat sticks"]] },
  easter: { guides: [["best-goat-cheese-brands", "Best goat cheese"], ["best-strawberry-jam", "Best strawberry jam"], ["best-prosciutto-brands", "Best prosciutto"]] },
  "st-patricks-day": { guides: [["best-cheddar-brands", "Best cheddar"], ["best-butter-for-butter-board", "Best butter"], ["best-mustard-for-charcuterie", "Best mustard"]] }
};
function holidayNext(h, hol) {
  const x = HOLIDAY_NEXT[hol.slug];
  if (!x) return "";
  const cards = x.guides.map(([s, label]) => `<a href="/blog/${s}/"><span class="bn-k">Best buys</span><strong>${h.escapeHtml(label)}</strong><span>Ranked, with a best value pick</span></a>`);
  if (x.gifts) cards.push(`<a href="/gifts/"><span class="bn-k">Gift guide</span><strong>Charcuterie gifts</strong><span>Books, sets and gifts under $25</span></a>`);
  else if (x.print) cards.push(`<a href="/printables/${x.print[0]}/"><span class="bn-k">Printable plan</span><strong>${h.escapeHtml(x.print[1])}</strong><span>Instant PDF, from $3</span></a>`);
  return `<section class="bl-section best-next hol-next" aria-labelledby="hol-next-h">
      <h2 id="hol-next-h">Shop for ${h.escapeHtml(hol.name)}</h2>
      <div class="best-next-grid">${cards.slice(0, 4).join("")}</div>
    </section>`;
}

// Holidays hub upgrade (3 Nov 2026): a photo up top, the season's calendar
// (what to do this week, worked out on the visitor's clock), shaped boards,
// holiday board ideas from the blog, holiday shopping from Best Buys, and
// every holiday in date order (Halloween no longer shows next year's date
// above Thanksgiving).
const HUB_SHAPES = [
  ["board", "thanksgiving-turkey-board", "Turkey", "Thanksgiving"],
  ["post", "christmas-wreath-charcuterie-board", "Wreath", "Christmas"],
  ["post", "christmas-tree-charcuterie-board", "Christmas tree", "Christmas"],
  ["board", "santas-sleigh-charcuterie-board", "Santa's sleigh", "Christmas"],
  ["board", "champagne-bottle-charcuterie-board", "Champagne bottle", "New Year's Eve"],
  ["board", "football-field-charcuterie-board", "Football field", "Super Bowl"],
  ["board", "heart-shaped-charcuterie-board", "Giant heart", "Valentine's Day"],
  ["board", "easter-egg-charcuterie-board", "Giant egg", "Easter"],
  ["board", "giant-jack-o-lantern-board", "Jack-o'-lantern", "Halloween"]
];
const HUB_IDEAS = ["friendsgiving-charcuterie-board", "thanksgiving-pie-board", "christmas-cookie-charcuterie-board", "hot-cocoa-board", "christmas-morning-charcuterie-board", "noche-buena-charcuterie-board", "charcuterie-board-new-years-eve", "winter-charcuterie-board", "cheese-advent-calendars-2026", "halloween-to-new-years-charcuterie-boards", "christmas-appetizers", "holiday-board"];
const HUB_SHOP = ["best-panettone", "best-eggnog", "best-cranberry-sauce", "best-champagne-under-30", "best-store-bought-christmas-cookies", "best-charcuterie-gift-boxes", "costco-holiday-charcuterie", "trader-joes-holiday-charcuterie-items", "aldi-holiday-charcuterie-items", "best-hot-cocoa-mix", "best-stilton", "best-cranberry-cheese"];

const isoOf = (d) => d.toISOString().slice(0, 10);
function thirdThursdayNov(y) {
  const d = new Date(Date.UTC(y, 10, 1));
  const first = (4 - d.getUTCDay() + 7) % 7;
  return isoOf(new Date(Date.UTC(y, 10, 1 + first + 14)));
}
// Dated entries for the busy season; each shows from 45 days out until the day.
function seasonCalendar(built, postSet) {
  const nd = (slug) => built.get(slug) && nextDate(built.get(slug).dates);
  const today = new Date().toISOString().slice(0, 10);
  const y = Number(today.slice(0, 4));
  const yy = (md) => { const t = `${y}-${md}`; return t >= today ? t : `${y + 1}-${md}`; };
  const bj = thirdThursdayNov(y) >= today ? thirdThursdayNov(y) : thirdThursdayNov(y + 1);
  const rows = [
    postSet.has("beaujolais-nouveau-charcuterie") && { d: bj, name: "Beaujolais Nouveau day", href: "/blog/beaujolais-nouveau-charcuterie/", todo: "The new wine goes on sale. Pour it cool with salami, pâté, ham and soft French cheese." },
    nd("thanksgiving") && { d: nd("thanksgiving"), name: "Thanksgiving", href: "/holidays/thanksgiving/", todo: "Keep it light so guests still want turkey. Make a cheese ball up to 3 days ahead; set the board out an hour before dinner." },
    nd("hanukkah") && { d: nd("hanukkah"), name: "Hanukkah begins", href: "/holidays/hanukkah/", todo: "Pick a dairy board or a meat board, never both, and check which kosher certifications your guests need." },
    postSet.has("noche-buena-charcuterie-board") && { d: yy("12-24"), name: "Christmas Eve and Noche Buena", href: "/blog/noche-buena-charcuterie-board/", todo: "Queso de bola, glazed ham and warm pan de sal in the center for the after-midnight feast." },
    nd("christmas") && { d: nd("christmas"), name: "Christmas", href: postSet.has("christmas-morning-charcuterie-board") ? "/blog/christmas-morning-charcuterie-board/" : "/holidays/christmas/", todo: "A Christmas morning board: prep it on Christmas Eve and build it in 20 minutes." },
    nd("new-years-eve") && { d: nd("new-years-eve"), name: "New Year's Eve", href: "/holidays/new-years-eve/", todo: "It has to last until midnight: about 3 oz each of cheese and meat per guest, and half held back for 10 pm." },
    nd("super-bowl") && { d: nd("super-bowl"), name: "Super Bowl", href: "/holidays/super-bowl/", todo: "Build it in quarters and refill at halftime." },
    nd("valentines-day") && { d: nd("valentines-day"), name: "Valentine's Day", href: "/holidays/valentines-day/", todo: "A small board for two, or a red and pink one for Galentine's." }
  ].filter(Boolean).sort((a, b) => a.d.localeCompare(b.d));
  return rows;
}

function tile(h, href, img, k, title, sub) {
  const t = (h.thumb || ((x) => x))(img || "");
  return `<li><a href="${href}"><img src="${h.escapeHtml(t)}" alt=""${h.imageSize ? h.imageSize(t) : ""} loading="lazy" decoding="async"><span class="hx-k">${h.escapeHtml(k)}</span><strong>${h.escapeHtml(title)}</strong>${sub ? `<span class="hx-s">${h.escapeHtml(sub)}</span>` : ""}</a></li>`;
}

export function holidaysHub(h, holidays, { season = "", posts = [], boards = [], bestCards = [] } = {}) {
  const built = new Map(holidays.map((x) => [x.slug, x]));
  const cal = HOLIDAY_CALENDAR.map((c) => ({ ...c, next: nextDate(c.dates), page: built.get(c.slug) }));
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = cal.filter((c) => c.page && c.next >= today).sort((a, b) => a.next.localeCompare(b.next)).slice(0, 3);
  const postBy = new Map(posts.map((p) => [p.slug, p]));
  const boardBy = new Map(boards.map((b) => [b.slug, b]));
  const bestBy = new Map(bestCards.map((c) => [c.slug, c]));
  const hero = upcoming[0] && upcoming[0].page && upcoming[0].page.image;
  const calRows = seasonCalendar(built, new Set(posts.map((p) => p.slug)));
  const shapes = HUB_SHAPES.map(([kind, slug, label, hol]) => {
    const x = kind === "board" ? boardBy.get(slug) : postBy.get(slug);
    return x ? { href: kind === "board" ? `/boards/${slug}/` : `/blog/${slug}/`, img: x.image, label, hol } : null;
  }).filter(Boolean);
  const ideas = HUB_IDEAS.map((s) => postBy.get(s)).filter(Boolean);
  const shop = HUB_SHOP.map((s) => postBy.get(s) && { p: postBy.get(s), c: bestBy.get(s) }).filter(Boolean);
  const allDated = cal.filter((c) => c.page).sort((a, b) => a.next.localeCompare(b.next));
  return h.layout({
    title: "Holiday Charcuterie Board Ideas: Every Holiday, Planned | Charcuterie Lab",
    canonical: "/holidays/",
    image: holidays[0]?.image,
    description: "Holiday charcuterie board ideas for Thanksgiving, Christmas, New Year's Eve and every holiday of the year: shaped boards, countdown plans, what to buy and how much.",
    head: `  <script type="application/ld+json">${h.jsonForScript({
      "@context": "https://schema.org", "@type": "CollectionPage", name: "Holiday Charcuterie Hub", url: h.absoluteUrl("/holidays/"),
      mainEntity: { "@type": "ItemList", itemListElement: holidays.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: h.absoluteUrl(`/holidays/${x.slug}/`), name: x.h1 })) }
    })}</script>`,
    body: `<main class="bl-main hol-main">
  <section class="bl-finder">
    <div class="bl-inner">
      <p class="section-kicker">Holiday Hub</p>
      <h1>Holiday charcuterie boards, planned</h1>
      <p class="bl-intro">Board ideas, shapes, a countdown plan and exact amounts for every holiday of the year.</p>
      ${hero ? `<a class="hx-hero" href="/holidays/${upcoming[0].slug}/"><img src="${h.escapeHtml(hero)}" alt="${h.escapeHtml(upcoming[0].page.h1 || upcoming[0].name)}" width="1200" height="800" fetchpriority="high"><span class="hx-hero-cap"><span>Next up</span> ${h.escapeHtml(upcoming[0].name)} · <span class="hol-count" data-countdown='${JSON.stringify(upcoming[0].dates)}'></span></span></a>` : ""}
      <ul class="hol-has"><li><strong>3 board ideas</strong> sized for real parties</li><li><strong>A shaped board</strong> with a layout (wreath, menorah, football)</li><li><strong>A countdown plan</strong> from two weeks out</li><li><strong>How much to buy:</strong> about 2 oz each of cheese and meat per guest before a meal, 3 oz as party food</li></ul>
      <p class="hol-safe">Food out no more than 2 hours. Exact amounts for any guest count: <a href="/party-planner/">Party Planner</a>.</p>
      <div class="hol-next">
        ${upcoming.map((c) => `<a class="hol-next-card" href="/holidays/${c.slug}/">
          <img src="${h.escapeHtml((h.thumb || ((x) => x))(c.page.image))}" alt=""${h.imageSize ? h.imageSize((h.thumb || ((x) => x))(c.page.image)) : ""} loading="lazy" decoding="async">
          <span class="hol-next-body"><span class="hol-next-date">${h.escapeHtml(pretty(c.next))}</span><strong>${h.escapeHtml(c.name)}</strong><span class="hol-count" data-countdown='${JSON.stringify(c.dates)}'></span></span>
        </a>`).join("\n        ")}
      </div>

      ${calRows.length ? `<section class="hx-cal-wrap" aria-labelledby="hx-cal-h">
        <h2 id="hx-cal-h">This season's calendar</h2>
        <p class="hx-sub">What's coming and what to do for each, in date order.</p>
        <ol class="hx-cal">
          ${calRows.map((r) => `<li data-d="${r.d}"><a href="${r.href}"><span class="hx-cal-date">${h.escapeHtml(pretty(r.d).replace(/, \d{4}$/, ""))}<span class="hx-cal-in" data-countdown='${JSON.stringify([r.d])}'></span></span><strong>${h.escapeHtml(r.name)}</strong><span class="hx-cal-todo">${h.escapeHtml(r.todo)}</span></a></li>`).join("\n          ")}
        </ol>
        <script>(function(){var t=new Date();t.setHours(0,0,0,0);var first=true;document.querySelectorAll(".hx-cal li").forEach(function(li){var d=new Date(li.dataset.d+"T00:00:00"),n=Math.round((d-t)/864e5);if(n<0||n>100){li.hidden=true;return}if(first){li.classList.add("is-next");first=false}})})();</script>
      </section>` : ""}

      ${season}

      ${shapes.length ? `<section class="hx-row" aria-labelledby="hx-shapes-h">
        <h2 id="hx-shapes-h">Shaped boards</h2>
        <p class="hx-sub">The showpieces people save: each one has a layout to follow.</p>
        <ul class="hx-tiles">${shapes.map((x) => tile(h, x.href, x.img, x.hol, x.label)).join("")}</ul>
      </section>` : ""}

      ${ideas.length ? `<section class="hx-row" aria-labelledby="hx-ideas-h">
        <h2 id="hx-ideas-h">More holiday board ideas</h2>
        <ul class="hx-tiles">${ideas.map((p) => tile(h, `/blog/${p.slug}/`, p.image, "Idea", p.title.replace(/:.*$/, ""))).join("")}</ul>
      </section>` : ""}

      ${shop.length ? `<section class="hx-row" aria-labelledby="hx-shop-h">
        <h2 id="hx-shop-h">Holiday shopping: what to buy</h2>
        <p class="hx-sub">Our ranked picks for the seasonal extras, and the holiday items at Costco, Trader Joe's and Aldi.</p>
        <ul class="hx-tiles">${shop.map(({ p, c }) => tile(h, `/blog/${p.slug}/`, p.image, c ? (c.cat === "stores" ? "Store guide" : c.name) : "Buying guide", c ? `${c.pickLabel ? c.pickLabel : "Our #1"}: ${c.pick}` : p.title.replace(/:.*$/, ""), "")).join("")}</ul>
        <p class="bl-note"><a href="/blog/best-charcuterie-brands/">All ${bestCards.length || ""} buying guides &rarr;</a></p>
      </section>` : ""}

      <div class="best-next-grid hol-shop-row">
        <a href="/gifts/"><span class="bn-k">Gift Guide</span><strong>Charcuterie gifts for every budget</strong><span>Books, boards and gifts under $25 &rarr;</span></a>
        <a href="/printables/holiday-hosting-pack/"><span class="bn-k">Printable pack</span><strong>Holiday Hosting Pack</strong><span>Five holiday board plans in one PDF &rarr;</span></a>
        <a href="/party-planner/"><span class="bn-k">Party Planner</span><strong>How much to buy</strong><span>Exact amounts for your guest count &rarr;</span></a>
      </div>
      <div class="bl-section">
        <h2>Every holiday, in date order</h2>
        <ul class="hol-cal">${allDated.map((c) => `<li><a href="/holidays/${c.slug}/">${h.escapeHtml(c.name)}</a><small>${h.escapeHtml(pretty(c.next))}</small></li>`).join("")}</ul>
      </div>
    </div>
  </section>
${h.newsletterPanel("hol-hub-email", "holiday_hub")}
</main>
${countdownJs()}`
  });
}

// The next few holidays, for the site-wide footer. It used to hardcode
// Thanksgiving and Christmas on all 1,035 pages, so the day after Thanksgiving
// every page linked a dead holiday and Hanukkah (4 Dec) was never in the
// footer at all (13 Nov 2026).
export function upcomingHolidayLinks(holidays, count = 2, today = new Date().toISOString().slice(0, 10)) {
  return holidays
    .map((x) => ({ x, d: nextDate(x.dates, today) }))
    .filter((o) => o.d >= today)
    .sort((a, b) => a.d.localeCompare(b.d))
    .slice(0, count)
    .map((o) => [`/holidays/${o.x.slug}/`, `${o.x.name} boards`]);
}

export function holidayBanner(h, holidays) {
  const today = new Date().toISOString().slice(0, 10);
  const next = holidays.map((x) => ({ x, d: nextDate(x.dates) })).filter((o) => o.d >= today).sort((a, b) => a.d.localeCompare(b.d))[0];
  if (!next) return "";
  return `<a class="bl-banner hol-banner" href="/holidays/${next.x.slug}/"><span class="bl-banner-k">Holiday Hub</span> <strong>${h.escapeHtml(next.x.h1)}</strong> <span><span data-countdown='${JSON.stringify(next.x.dates)}'></span> · board ideas, shapes and a countdown plan &rarr;</span></a>`;
}

export { countdownJs };

// Timely boxes on holiday pages (2 Nov 2026). Both are in the HTML from the
// build and shown by a small script from today's date, so they switch on and
// off without a rebuild:
//   - "Last-minute plan": the 5 days before the holiday and the day itself.
//   - "Next up": once this year's holiday has passed and the next one is more
//     than 60 days away, a banner points to the next holiday page.
// Add ?today=YYYY-MM-DD to a holiday page's address to preview either box.
const LAST_PACK = {
  thanksgiving: ["fall-thanksgiving-pack", "Fall & Thanksgiving Pack"],
  hanukkah: ["holiday-hosting-pack", "Holiday Hosting Pack"],
  christmas: ["holiday-hosting-pack", "Holiday Hosting Pack"],
  "new-years-eve": ["holiday-hosting-pack", "Holiday Hosting Pack"],
  "super-bowl": ["game-day-pack", "Game Day Pack"],
  "valentines-day": ["date-night-pack", "Date Night Pack"]
};
const WINTER_STORES = ["thanksgiving", "hanukkah", "christmas", "new-years-eve"];

export function holidayTimely(h, hol, holidays) {
  const esc = h.escapeHtml;
  const party = /party food|as the party|four quarters|last until midnight/i.test(hol.answer || "") || ["super-bowl", "new-years-eve", "halloween"].includes(hol.slug);
  const oz = party ? 3 : 2;
  const quick = (hol.ideas || []).find((i) => /easy|quick|simple|last-minute|15-minute|under \$/i.test(`${i.title} ${i.for}`));
  const pack = LAST_PACK[hol.slug];
  const stores = WINTER_STORES.includes(hol.slug)
    ? [["/blog/costco-holiday-charcuterie/", "Costco holiday picks"], ["/blog/aldi-holiday-charcuterie-items/", "Aldi holiday items"], ["/blog/trader-joes-holiday-charcuterie-items/", "Trader Joe's holiday items"]]
    : [["/blog/best-costco-charcuterie-items/", "Costco picks"], ["/blog/best-aldi-charcuterie-items/", "Aldi picks"], ["/blog/best-trader-joes-cheeses/", "Trader Joe's cheeses"]];
  const others = holidays.filter((x) => x.slug !== hol.slug).map((x) => ({ s: x.slug, n: x.name, d: x.dates }));
  const last = `<aside class="hol-last" data-hol-last hidden aria-labelledby="hol-last-h">
      <p class="hol-last-k">Last-minute plan</p>
      <p class="hol-last-t" id="hol-last-h" role="heading" aria-level="2"><span data-hol-when>${esc(hol.name)} is almost here</span>: build a great board today</p>
      <div class="hol-last-grid">
        <div>
          <h3>Buy today</h3>
          <ul>
            <li><strong>3 cheeses:</strong> one soft (brie), one firm (aged cheddar or Manchego), one crowd-pleaser</li>
            <li><strong>2 meats:</strong> a salami and prosciutto</li>
            <li><strong>About ${oz} oz each</strong> of cheese and meat per guest${party ? ", since the board is the party food" : " before a meal"}</li>
            <li>Crackers, one jam or honey, olives or pickles, grapes or apples, a handful of nuts</li>
          </ul>
          <a class="text-link" href="/party-planner/">Exact amounts for your guest count &rarr;</a>
        </div>
        <div>
          <h3>The 45-minute build</h3>
          <ol>
            <li>Take firm cheese out 45 to 60 minutes ahead, brie 30.</li>
            <li>Put the cheeses down first, spread apart.</li>
            <li>Fold the meats into loose rows between them.</li>
            <li>Add small bowls for jam and olives.</li>
            <li>Fill the gaps with fruit and nuts; crackers go on last.</li>
          </ol>
          ${quick ? `<a class="text-link" href="#ideas">Easiest idea on this page: ${esc(quick.title.replace(/^The /, ""))} &rarr;</a>` : ""}
        </div>
        <div>
          <h3>Shortcuts</h3>
          <ul>
            ${stores.map(([u, t]) => `<li><a href="${u}">${esc(t)}</a></li>`).join("")}
            ${pack ? `<li><a href="/printables/${pack[0]}/">${esc(pack[1])}</a>: instant PDF, nothing to ship</li>` : ""}
          </ul>
        </div>
      </div>
    </aside>`;
  const after = `<aside class="hol-after" data-hol-after hidden></aside>`;
  const js = `<script>(function(){var D=${JSON.stringify(hol.dates)},N=${JSON.stringify(hol.name)},O=${JSON.stringify(others)};var t=new Date();try{var q=new URLSearchParams(location.search).get("today");if(q&&/^\\d{4}-\\d{2}-\\d{2}$/.test(q))t=new Date(q+"T12:00:00")}catch(e){}t.setHours(0,0,0,0);function d(s){return new Date(s+"T00:00:00")}function days(s){return Math.round((d(s)-t)/864e5)}var nx=D.filter(function(s){return days(s)>=0}).sort()[0],pv=D.filter(function(s){return days(s)<0}).sort().pop();var L=document.querySelector("[data-hol-last]");if(L&&nx&&days(nx)<=5){var n=days(nx);L.querySelector("[data-hol-when]").textContent=n===0?N+" is today":n===1?N+" is tomorrow":N+" is in "+n+" days";L.hidden=false}var A=document.querySelector("[data-hol-after]");if(A&&pv&&(!nx||days(nx)>60)){var up=O.map(function(o){return{o:o,s:o.d.filter(function(s){return days(s)>=0}).sort()[0]}}).filter(function(x){return x.s}).sort(function(a,b){return a.s<b.s?-1:1})[0];var was=d(pv).toLocaleDateString("en-US",{month:"long",day:"numeric"});A.innerHTML="<p><strong>"+N+" was "+was+".</strong> "+(up?"Next up: <a href=\\"/holidays/"+up.o.s+"/\\">"+up.o.n+"<\\/a>, "+(days(up.s)===0?"today":days(up.s)===1?"tomorrow":"in "+days(up.s)+" days")+" &rarr;":"")+"<\\/p>";A.hidden=false}})();</script>`;
  return { last, after, js };
}
