// Ingredients hub upgrade (23 Nov 2026), a post-build pass on /ingredients/.
// 1. Search and filters stay together: the hub photo moves from between the search
//    box and the filters to below "Start here".
// 2. "Browse by category": 8 tiles to the category pages, which the chips only filter.
// 3. "Ingredient guides": the big reference posts, with photos.
// 4. Answer-first intro, a title for "charcuterie board ingredients", and 5 questions
//    with FAQ schema.
// 5. "On holiday boards right now" becomes a photo strip with a reason for each.

const CATS = [
  ["cheese", "Cheese", "brie"],
  ["cured-meat-and-seafood", "Cured meat & seafood", "genoa-salami"],
  ["crackers-and-breads", "Crackers & breads", "water-crackers"],
  ["fruit", "Fruit", "grapes"],
  ["spreads-jams-and-honey", "Spreads, jams & honey", "fig-jam"],
  ["pickles-olives-and-briny", "Pickles, olives & briny", "castelvetrano-olives"],
  ["nuts-and-seeds", "Nuts & seeds", "marcona-almonds"],
  ["finishing-touches", "Finishing touches", "rosemary-sprigs"]
];
const GUIDES = [
  ["/blog/types-of-cheese/", "/images/thumbs/types-of-cheese-jpg-m.webp", "Types of cheese", "100 kinds explained, with a chart"],
  ["/blog/types-of-cured-meat/", "/images/thumbs/best-meats-charcuterie-board-webp-m.webp", "Types of cured meat", "100 kinds in 8 families"],
  ["/blog/italian-cured-meats/", "/images/thumbs/italian-cured-meats-jpg-m.webp", "Italian cured meats", "25 salumi, region by region"],
  ["/pairings/meat-and-cheese-chart/", "/images/thumbs/meat-and-cheese-chart-png-m.webp", "Meat and cheese chart", "Which meat goes with which cheese"],
  ["/blog/unique-charcuterie-ingredients/", "/images/thumbs/unique-charcuterie-ingredients-jpg-m.webp", "25 unique ingredients", "From Harbison to finger limes"]
];
const WHY = {
  brie: "Bake it with jam for a warm centerpiece",
  stilton: "The Christmas cheese, best with port",
  "cranberry-sauce": "The jewel-red Thanksgiving spread",
  pomegranate: "Red seeds that make any board festive",
  "smoked-salmon": "A Christmas Eve and Hanukkah favorite",
  "candied-pecans": "Sweet crunch for winter boards",
  "dark-chocolate": "For the dessert end of the board",
  "rosemary-sprigs": "The wreath's evergreen",
  "champagne-grapes": "Tiny clusters for New Year's Eve",
  "wensleydale-cranberry": "A festive, fruity cheese"
};
const FAQ = [
  ["What ingredients do you need for a charcuterie board?", "2 or 3 cheeses (a soft one, a firm one and, if you like, a blue), 2 or 3 cured meats, something sweet like fig jam or honey, fresh fruit, something briny like olives or cornichons, a handful of nuts, and crackers or sliced baguette."],
  ["How much cheese and meat do I need per person?", "About 2 oz each of cheese and meat per guest when the board comes before a meal, and about 3 oz each when it is the main food at a party. Every ingredient page lists its own amount per person."],
  ["What should I buy for my first charcuterie board?", "Start with brie, aged cheddar, Genoa salami and prosciutto, then add fig jam, grapes, Castelvetrano olives, Marcona almonds and water crackers. Those cover soft and firm, sweet and salty, and crunch."],
  ["What are the most popular charcuterie cheeses and meats?", "For cheese: brie, aged cheddar, Manchego and Gouda. For meat: prosciutto, Genoa salami and soppressata. They are mild enough for most guests and easy to find."],
  ["What are the cheapest charcuterie ingredients?", "Genoa salami, summer sausage, Gouda, grapes, apples, almonds, cornichons, water crackers and a baguette are all budget picks. Filter the list by $ to see every one."]
];
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const TITLE = "Charcuterie Board Ingredients: List of 375, With Amounts";
const DESC = "Charcuterie board ingredients, all 375: cheeses, cured meats, crackers, fruit, nuts, jams and olives, each with pairings and how much to buy per person.";

export function ingHubTiles(html, path) {
  if (path !== "/ingredients/" || !html.includes('class="ing-finder"') || html.includes("ing-cats-up")) return { html, n: 0 };
  let n = 0;
  const swap = (re, fn) => { const before = html; html = html.replace(re, fn); if (html !== before) n++; };
  // 4. Title, description, H1, intro
  swap(/<title>[^<]*<\/title>/, () => `<title>${esc(TITLE)}</title>`);
  swap(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g, (m, a) => a + esc(TITLE));
  swap(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*/g, (m, a) => a + esc(DESC));
  swap(/(<section class="ing-finder">[\s\S]*?<h1[^>]*>)Charcuterie ingredients, explained(<\/h1>)/, (m, a, b) => `${a}Charcuterie board ingredients, explained${b}`);
  swap(/<p class="ing-intro">[\s\S]*?<\/p>/, () => `<p class="ing-intro">A classic charcuterie board needs 2 or 3 cheeses, 2 or 3 cured meats, something sweet, fresh fruit, something briny, nuts and crackers. Here are all 375 ingredients, one page each: what it is, what it pairs with and why, how much to buy per person, and which one to buy.</p>`);
  // 1. Move the photo below "Start here"
  const fig = (/<figure class="hub-photo">[\s\S]*?<\/figure>/.exec(html) || [])[0];
  if (fig) {
    html = html.replace(fig, "");
    swap(/(<section class="ing-start"[\s\S]*?<\/section>)/, (m) => `${m}\n    ${fig.replace('<figure class="hub-photo">', '<figure class="hub-photo ing-photo-moved">')}`);
  }
  // 2. Category tiles, after the photo (inside data-ing-rows, so filtering hides them)
  const thumb = (slug) => `/images/thumbs/ingredients__${slug}-jpg-m.webp`;
  const counts = {};
  for (const m of html.matchAll(/data-cat="([^"]+)"/g)) counts[m[1]] = (counts[m[1]] || 0) + 1;
  const cats = `<section class="ing-cats-up" aria-labelledby="ing-cats-h">
      <h2 id="ing-cats-h">Browse by category</h2>
      <ul class="ing-tiles">${CATS.map(([slug, name, img]) => `<li><a href="/ingredients/${slug}/"><img src="${thumb(img)}" alt="" width="640" height="429" loading="lazy" decoding="async"><span><strong>${esc(name)}</strong><span>All ${counts[slug] || ""} &rarr;</span></span></a></li>`).join("")}</ul>
    </section>`;
  swap(/(<section class="ing-start"[\s\S]*?<\/section>\s*(?:<figure class="hub-photo ing-photo-moved">[\s\S]*?<\/figure>)?)/, (m) => `${m}\n    ${cats}`);
  // 5. Holiday chips -> photo strip with a reason
  swap(/<p class="ing-hol-chips">([\s\S]*?)<\/p>/, (m, inner) => {
    const items = [...inner.matchAll(/<a href="\/ingredients\/([^/"]+)\/">([^<]*)<\/a>/g)].map(([, slug, name]) => {
      const role = (new RegExp(`<a href="/ingredients/${slug}/">[\\s\\S]*?<span class="ing-card-role">([^<]*)<`).exec(html) || [])[1] || "";
      const img = (new RegExp(`<a href="/ingredients/${slug}/">\\s*<span class="ing-thumb"><img src="([^"]+)"`).exec(html) || [])[1] || thumb(slug);
      return `<li><a href="/ingredients/${slug}/"><img src="${img}" alt="" width="640" height="429" loading="lazy" decoding="async"><span><strong>${name}</strong><span>${esc(WHY[slug] || role)}</span></span></a></li>`;
    });
    return `<ul class="ing-tiles ing-hol-tiles">${items.join("")}</ul>`;
  });
  // 3. Guides row, after the holiday strip, still inside data-ing-rows; the one-line "New: 25 unique" note goes
  const guides = `<section class="ing-guides-up" aria-labelledby="ing-guides-h">
      <h2 id="ing-guides-h">Ingredient guides</h2>
      <ul class="ing-tiles">${GUIDES.map(([href, img, t, s]) => `<li><a href="${href}"><img src="${img}" alt="" width="640" height="427" loading="lazy" decoding="async"><span><strong>${esc(t)}</strong><span>${esc(s)}</span></span></a></li>`).join("")}</ul>
    </section>`;
  swap(/(<section class="ing-holiday"[\s\S]*?<\/section>)/, (m) => `${m}\n    ${guides}`);
  swap(/\s*<p class="ing-intro ing-note">New: <a href="\/blog\/unique-charcuterie-ingredients\/">[\s\S]*?<\/p>/, () => "");
  // 4. Questions + FAQ schema
  const faq = `<section class="bl-section ing-faq-up" id="faq" aria-labelledby="ing-faq-h">
    <div class="section-inner">
      <h2 id="ing-faq-h">Charcuterie ingredient questions</h2>
      <div class="ebook-faq-list">
        ${FAQ.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n        ")}
      </div>
    </div>
  </section>`;
  swap(/<\/main>/, () => `${faq}\n</main>`);
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  swap(/<\/head>/, () => `  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>\n</head>`);
  return { html, n };
}
