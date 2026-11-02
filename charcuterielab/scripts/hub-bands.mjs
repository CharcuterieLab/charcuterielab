// Hub photo bands (1 Nov 2026, visitor review). Hubs that opened on text and
// forms get a short row of photos right under their intro, so a visitor sees
// food and knows where they are before reading. Each tile links somewhere
// useful. Runs after the quick-subscribe bar is in place.
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BANDS = {
  "/dietary/": {
    label: "Boards for every diet",
    after: "</header>",
    tiles: [
      ["/images/50-boards-17-gluten-free.webp", "Gluten-free", "/boards/gluten-free-charcuterie-board/"],
      ["/images/50-boards-16-vegan-plant-based.webp", "Vegan", "/boards/vegan-charcuterie-board/"],
      ["/images/50-boards-46-low-carb-keto.webp", "Keto", "/boards/keto-charcuterie-board/"],
      ["/images/50-boards-15-kid-friendly.webp", "Kid-friendly", "/boards/kid-friendly-charcuterie-board/"]
    ]
  },
  "/party-planner/": {
    label: "Plans by party size",
    beforeH2: 2,
    tiles: [
      ["/images/50-boards-33-cocktail-party.webp", "8 people", "/party-planner/charcuterie-board-for-8-people/"],
      ["/images/50-boards-30-office-party.webp", "20 people", "/party-planner/charcuterie-board-for-20-people/"],
      ["/images/grazing-table.png", "50 people", "/party-planner/charcuterie-board-for-50-people/"],
      ["/images/charcuterie-board-for-large-group.png", "100 people", "/party-planner/charcuterie-board-for-100-people/"]
    ]
  },
  "/about/": {
    label: "Boards from the Charcuterie Lab books",
    afterQsP: true,
    tiles: [
      ["/images/50-boards-01-classic-american-starter.webp", "50 Boards Built by Science", "/ebook/"],
      ["/images/boards/world-01.webp", "Around the World in 16 Boards", "/around-the-world/"],
      ["/images/boards/impossible-01.webp", "Impossible Boards", "/books/impossible-boards/"],
      ["/images/boards/two-01.webp", "Boards for Two", "/books/boards-for-two/"]
    ]
  }
};

export async function injectBands(dist, { thumb = (s) => s, covers = [] } = {}) {
  const done = [];
  const bands = { ...BANDS };
  // Shop: the book covers, one tap to each book's page.
  if (covers.length) bands["/shop/"] = { label: "The Charcuterie Lab books", before: '<nav class="shop-jump"', covers };
  for (const [path, band] of Object.entries(bands)) {
    const file = join(dist, path, "index.html");
    if (!existsSync(file)) continue;
    let html = await readFile(file, "utf8");
    if (html.includes('class="hub-band')) continue;
    let markup;
    if (band.covers) {
      markup = `<nav class="hub-band hub-covers" aria-label="${band.label}">${band.covers.map((c) => `<a href="${c.page}"><img src="${thumb(c.cover, "s")}" alt="${c.title.replace(/"/g, "&quot;")}" width="120" height="155" loading="eager" decoding="async"><span>${c.price ? `From ${c.price}` : ""}</span></a>`).join("")}</nav>`;
    } else {
      const tiles = band.tiles.filter(([src]) => existsSync(join(dist, src)));
      if (tiles.length < 3) continue;
      markup = `<nav class="hub-band" aria-label="${band.label}">${tiles.map(([src, label, href]) => `<a class="hub-band-tile" href="${href}"><img src="${thumb(src, "m")}" alt="" width="640" height="427" decoding="async"><span>${label}</span></a>`).join("")}</nav>`;
    }
    const mainAt = html.indexOf("<main");
    let at = -1;
    if (band.before) at = html.indexOf(band.before, mainAt);
    else if (band.beforeH2) {
      // After the page's tool: just before its Nth section heading.
      let h2 = mainAt;
      for (let k = 0; k < band.beforeH2 && h2 >= 0; k++) h2 = html.indexOf("<h2", h2 + 3);
      const sec = h2 > 0 ? html.lastIndexOf("<section", h2) : -1;
      at = sec > html.lastIndexOf("</section>", h2) ? sec : h2;
    }
    else if (band.after) { const i = html.indexOf(band.after, mainAt); at = i >= 0 ? i + band.after.length : -1; }
    if (band.afterQsP || at < 0) {
      const qs = html.indexOf('<form class="qs"', mainAt);
      const from = qs >= 0 ? html.indexOf("</script>", qs) : html.indexOf("</h1>", mainAt);
      const p = from >= 0 ? html.indexOf("</p>", from) : -1;
      at = p >= 0 ? p + 4 : -1;
    }
    if (at < 0) continue;
    html = html.slice(0, at) + "\n" + markup + "\n" + html.slice(at);
    await writeFile(file, html);
    done.push(path);
  }
  return done;
}
