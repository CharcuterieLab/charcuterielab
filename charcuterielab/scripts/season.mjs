// Season picks (1 Nov 2026, visitor review). The holidays in the next few
// weeks, read from content/holidays/*.json, and the boards for them. Used by
// the Board Library ("For this season" row), the Holiday Hub, the homepage
// board strip and the homepage hero photo. Everything is worked out at build
// time; a small script hides any card whose holiday has passed, so a page
// that isn't rebuilt for a while never shows last month's holiday.
import { card } from "./boards.mjs";

const SHORT = {
  halloween: "Halloween",
  thanksgiving: "Thanksgiving",
  hanukkah: "Hanukkah",
  christmas: "Christmas",
  "new-years-eve": "New Year's Eve",
  "super-bowl": "the Super Bowl",
  "valentines-day": "Valentine's Day",
  "st-patricks-day": "St. Patrick's Day",
  easter: "Easter"
};

// Boards that belong to a holiday but live in another category (showpiece,
// keto, for two). Listed first, before the holiday page's own picks.
const EXTRA = {
  thanksgiving: ["thanksgiving-charcuterie-board", "thanksgiving-turkey-board", "fall-harvest-charcuterie-board", "keto-thanksgiving-charcuterie-board", "plant-based-fall-harvest-board"],
  // No Hanukkah board in the library yet, so Hanukkah stays out of the season rows.
  hanukkah: [],
  christmas: ["holiday-entertaining-board", "santas-sleigh-charcuterie-board", "keto-christmas-charcuterie-board", "plant-based-holiday-board"],
  "new-years-eve": ["new-years-eve-charcuterie-board", "new-years-eve-board-for-two"],
  "super-bowl": ["game-day-charcuterie-board", "football-field-charcuterie-board", "keto-game-day-board"],
  "valentines-day": ["valentines-day-charcuterie-board", "valentines-day-board-for-two"],
  easter: ["easter-charcuterie-board", "easter-egg-charcuterie-board"],
  halloween: []
};

const iso = (d) => d.toISOString().slice(0, 10);

export function upcoming(holidays, { days = 60, today = iso(new Date()) } = {}) {
  const until = iso(new Date(Date.parse(`${today}T00:00:00Z`) + days * 864e5));
  return holidays
    .map((x) => ({ x, d: (x.dates || []).filter((d) => d >= today).sort()[0] }))
    .filter((o) => o.d && o.d <= until)
    .sort((a, b) => a.d.localeCompare(b.d));
}

// Upcoming holidays that have at least one board to show.
export function upcomingWithBoards(holidays, boards, opts) {
  const have = new Set(boards.filter((b) => !b.placeholder).map((b) => b.slug));
  return upcoming(holidays, opts).filter((o) => (EXTRA[o.x.slug] ? EXTRA[o.x.slug] : o.x.boards || []).some((s) => have.has(s)));
}

export function seasonTitle(up, max = 3) {
  const names = up.slice(0, max).map((o) => SHORT[o.x.slug] || o.x.name);
  if (!names.length) return "";
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// Up to `max` boards, one holiday at a time in turn so the first row shows
// every holiday coming up.
export function seasonBoards(up, boards, max = 8) {
  const bySlug = new Map(boards.filter((b) => !b.placeholder).map((b) => [b.slug, b]));
  const lanes = up.map((o) => ({ o, slugs: [...new Set(EXTRA[o.x.slug] ? EXTRA[o.x.slug] : o.x.boards || [])].filter((s) => bySlug.has(s)) }));
  const out = [];
  const seen = new Set();
  for (let i = 0; out.length < max && lanes.some((l) => l.slugs[i]) ; i++) {
    for (const l of lanes) {
      const s = l.slugs[i];
      if (!s || seen.has(s) || out.length >= max) continue;
      seen.add(s);
      out.push({ b: bySlug.get(s), o: l.o });
    }
  }
  return out;
}

const HIDE_PAST = `<script>(function(){var t=new Date();t.setHours(0,0,0,0);document.querySelectorAll("[data-until]").forEach(function(c){if(new Date(c.getAttribute("data-until")+"T23:59:59")<t)c.remove()});document.querySelectorAll("[data-season]").forEach(function(s){if(!s.querySelector("[data-until]"))s.remove()})})();</script>`;

// The "For this season" row of board cards.
export function seasonRow(h, holidays, boards, { max = 8, kicker = "For this season", link = true, id = "season-h" } = {}) {
  const up = upcomingWithBoards(holidays, boards);
  const picks = seasonBoards(up, boards, max);
  if (picks.length < 2) return "";
  const cards = picks.map(({ b, o }) => card(b, h)
    .replace('<li class="bl-card"', `<li class="bl-card" data-until="${o.d}"`)
    .replace(/<span class="bl-card-cat">[\s\S]*?<\/span>/, `<span class="bl-card-cat">For ${h.escapeHtml(SHORT[o.x.slug] || o.x.name)}</span>`)).join("\n");
  return `<section class="season-row" data-season aria-labelledby="${id}">
    <div class="season-head">
      <div><p class="section-kicker">${h.escapeHtml(kicker)}</p>
      <h2 id="${id}">Boards for ${h.escapeHtml(seasonTitle(up))}</h2></div>
      ${link ? `<a class="season-all" href="/holidays/">All holiday boards &rarr;</a>` : ""}
    </div>
    <ul class="bl-grid season-grid">
${cards}
    </ul>
  </section>${HIDE_PAST}`;
}

// The homepage hero: in the six weeks before a holiday, its board photo and a
// countdown replace the year-round photo.
export function seasonHero(holidays, { days = 45 } = {}) {
  const o = upcoming(holidays, { days }).find((u) => u.x.image && u.x.status === "published");
  if (!o) return null;
  const name = SHORT[o.x.slug] || o.x.name;
  return {
    img: o.x.image,
    alt: `A ${name.replace(/^the /, "")} charcuterie board`,
    href: `/holidays/${o.x.slug}/`,
    name,
    dates: o.x.dates,
    until: o.d
  };
}
