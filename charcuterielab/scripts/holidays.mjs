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
const HOLIDAY_BOOK_BOARD = { thanksgiving: 20, christmas: 6, "new-years-eve": 22, "super-bowl": 8, "valentines-day": 21, "st-patricks-day": 23, easter: 24 };

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

    <nav class="hol-jump" aria-label="On this page"><a href="#ideas">Board ideas</a><a href="#shapes">Shapes</a><a href="#plan">Countdown plan</a><a href="#amounts">How much to buy</a><a href="#faq">Questions</a></nav>

    <section class="bl-section" id="ideas" aria-labelledby="ideas-h">
      <h2 id="ideas-h">${h.escapeHtml(hol.name)} board ideas</h2>
      <div class="hol-ideas">
        ${hol.ideas.map((i) => `<article class="hol-idea">
          <p class="hol-for">${h.escapeHtml(i.for)}</p>
          <h3>${h.escapeHtml(i.title)}</h3>
          <p>${h.escapeHtml(i.text)}</p>
          <p class="hol-items">${i.items.map(item).join(" · ")}</p>
          <a class="text-link" href="${builderPreset(i.items.filter((s) => known.has(s)), i.guests, `holiday_${hol.slug}_idea`)}">Get the shopping list for ${i.guests} &rarr;</a>
        </article>`).join("\n        ")}
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
        </article>`).join("\n        ")}
      </div>
    </section>

    <section class="bl-section" id="plan" aria-labelledby="plan-h">
      <h2 id="plan-h">Countdown plan</h2>
      <ol class="bl-timeline hol-plan" id="hol-plan">
        ${hol.plan.map((p) => `<li data-days="${daysBefore(p.when)}"><b>${h.escapeHtml(p.when)}</b><span>${h.escapeHtml(p.what)}</span></li>`).join("\n        ")}
      </ol>
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

    ${bookBox(h, hol)}

    <section class="bl-section" id="faq" aria-labelledby="faq-h">
      <h2 id="faq-h">${h.escapeHtml(hol.name)} charcuterie questions</h2>
      <div class="ebook-faq-list">
        ${hol.faq.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${h.escapeHtml(f.q)}</summary><p>${h.escapeHtml(f.a)}</p></details>`).join("\n        ")}
      </div>
    </section>

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

export function holidaysHub(h, holidays) {
  const built = new Map(holidays.map((x) => [x.slug, x]));
  const cal = HOLIDAY_CALENDAR.map((c) => ({ ...c, next: nextDate(c.dates), page: built.get(c.slug) }));
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = cal.filter((c) => c.page && c.next >= today).sort((a, b) => a.next.localeCompare(b.next)).slice(0, 3);
  const seasons = ["Fall", "Winter", "Spring", "Summer"];
  return h.layout({
    title: "Holiday Charcuterie Board Ideas: Every Holiday, Planned | Charcuterie Lab",
    canonical: "/holidays/",
    image: holidays[0]?.image,
    description: "Holiday charcuterie board ideas for Halloween, Thanksgiving, Christmas and every holiday of the year: board ideas, shapes, countdown plans and how much to buy.",
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
      <p>Each holiday page has three board ideas sized for real parties, shaped boards with a layout diagram (a wreath for Christmas, a menorah for Hanukkah, a football for the Super Bowl), a countdown plan that starts two weeks out, and a table of how much cheese, meat and crackers to buy. Every page uses the same amounts as the rest of the Lab: about 2 oz each of cheese and meat per guest before a meal, 3 oz when the board is the party food and 4 oz when it's dinner, plus 10% from 20 guests up.</p>
      <p>One food-safety rule runs through all of them: perishable food stays out no more than 2 hours, or 1 hour above 90°F. For a long party, build one board for the start and keep a refill tray in the fridge. The <a href="/party-planner/">Party Planner</a> works out exact amounts for any guest count.</p>
      <div class="hol-next">
        ${upcoming.map((c) => `<a class="hol-next-card" href="/holidays/${c.slug}/">
          <img src="${h.escapeHtml((h.thumb || ((x) => x))(c.page.image))}" alt=""${h.imageSize ? h.imageSize((h.thumb || ((x) => x))(c.page.image)) : ""} loading="lazy" decoding="async">
          <span class="hol-next-body"><span class="hol-next-date">${h.escapeHtml(pretty(c.next))}</span><strong>${h.escapeHtml(c.name)}</strong><span class="hol-count" data-countdown='${JSON.stringify(c.dates)}'></span></span>
        </a>`).join("\n        ")}
      </div>
      ${seasons.map((s) => {
        const list = cal.filter((c) => c.season === s);
        return list.length ? `<div class="bl-section"><h2>${s}</h2><ul class="hol-cal">${list.map((c) => `<li>${c.page ? `<a href="/holidays/${c.slug}/">${h.escapeHtml(c.name)}</a>` : `<span>${h.escapeHtml(c.name)}</span> <em>page coming</em>`}<small>${h.escapeHtml(pretty(c.next))}</small></li>`).join("")}</ul></div>` : "";
      }).join("\n      ")}
    </div>
  </section>
${h.newsletterPanel("hol-hub-email", "holiday_hub")}
</main>
${countdownJs()}`
  });
}

export function holidayBanner(h, holidays) {
  const today = new Date().toISOString().slice(0, 10);
  const next = holidays.map((x) => ({ x, d: nextDate(x.dates) })).filter((o) => o.d >= today).sort((a, b) => a.d.localeCompare(b.d))[0];
  if (!next) return "";
  return `<a class="bl-banner hol-banner" href="/holidays/${next.x.slug}/"><span class="bl-banner-k">Holiday Hub</span> <strong>${h.escapeHtml(next.x.h1)}</strong> <span><span data-countdown='${JSON.stringify(next.x.dates)}'></span> · board ideas, shapes and a countdown plan &rarr;</span></a>`;
}

export { countdownJs };
