// Landing pages for the ebooks that don't have one yet (5 Oct 2026):
//   /books/keto-charcuterie-boards/       Keto & Low-Carb Boards
//   /books/boards-for-two/                Boards for Two
//   /books/plant-based-charcuterie-boards/  15 Show-Stopping Plant-Based Boards
//   /books/                               all five books
// Built for search and AI answers (answer-first lead, quick facts, every board
// listed, one complete sample board, FAQ + Book/FAQ/Breadcrumb schema) and for
// sales: the Gumroad ebook is the main button everywhere, the Amazon paperback
// the second option. Board data comes from content/books/*.json (the same data
// the books were built from), so numbers can't drift from the PDFs.

const money = (lo, hi) => (lo === hi ? `$${lo}` : `$${lo}–${hi}`);

export function bookLandingPages(h, { keto, two, plant, books }) {
  const esc = h.escapeHtml;
  const T = (u, c) => h.withTracking(u, c);
  const pages = [];

  function buyRow(b, campaign, big = true) {
    return `<div class="bk-buy">
      <a class="button primary${big ? " bk-buy-main" : ""}" href="${esc(T(b.ebookUrl, campaign))}" target="_blank" rel="noopener">Get the ebook · ${esc(b.ebookPrice)}</a>
      ${b.paperbackUrl ? `<a class="button bk-buy-print" href="${esc(b.paperbackUrl)}" target="_blank" rel="noopener">Paperback on Amazon · ${esc(b.paperbackPrice)}</a>` : `<span class="bk-soon">Paperback coming soon to Amazon</span>`}
    </div>`;
  }

  function schema(b) {
    const offers = [{ "@type": "Offer", price: b.ebookPrice.replace("$", ""), priceCurrency: "USD", availability: "https://schema.org/InStock", url: b.ebookUrl, name: "PDF ebook" }];
    if (b.paperbackUrl) offers.push({ "@type": "Offer", price: b.paperbackPrice.replace("$", ""), priceCurrency: "USD", availability: "https://schema.org/InStock", url: b.paperbackUrl, name: "Paperback" });
    return [
      { "@context": "https://schema.org", "@type": "Book", name: b.title, alternateName: b.short, url: h.absoluteUrl(b.path), image: h.absoluteUrl(b.cover), description: b.description, numberOfPages: b.pages, bookFormat: "https://schema.org/EBook", inLanguage: "en", genre: "Cookbook", ...(h.authorRef ? { author: h.authorRef } : {}), publisher: { "@type": "Organization", name: "Charcuterie Lab", url: h.absoluteUrl("/") }, offers },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: b.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Books", "/books/"], [b.short, b.path]].map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: h.absoluteUrl(url) })) }
    ].map((s) => `  <script type="application/ld+json">${h.jsonForScript(s)}</script>`).join("\n");
  }

  function page(b) {
    const c = (x) => `${b.key}_${x}`;
    const gallery = b.gallery.map(([src, alt]) => `<figure><img src="${esc(src)}" alt="${esc(alt)}" width="800" height="537" loading="lazy" decoding="async"><figcaption>${esc(alt)}</figcaption></figure>`).join("\n        ");
    const looks = b.looks.map(([src, cap]) => `<figure><a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="${esc(cap)}" width="700" height="906" loading="lazy" decoding="async"></a><figcaption>${esc(cap)}</figcaption></figure>`).join("\n        ");
    const others = books.filter((x) => x.key !== b.key);
    return h.layout({
      title: `${b.seoTitle} | Charcuterie Lab`,
      canonical: b.path,
      image: b.cover,
      description: b.description,
      head: schema(b),
      body: `<main class="ebook-page bk-page bk-${b.key}">
  <section class="ebook-hero bk-hero">
    <div class="ebook-hero-inner bk-hero-inner">
      <div class="bk-hero-copy">
        <p class="ing-crumb"><a href="/books/">Books</a> <span aria-hidden="true">/</span> ${esc(b.short)}</p>
        <p class="ebook-kicker">${esc(b.kicker)}</p>
        <h1>${esc(b.h1)}</h1>
        <p class="bk-lead">${b.lead}</p>
        ${buyRow(b, c("hero"))}
        <p class="bk-fine">Instant PDF download from Gumroad. The link arrives by email and the PDF stays in your Gumroad library.</p>
        <div class="ebook-metrics" aria-label="Book highlights">${b.metrics.map(([n, l]) => `<span><strong>${esc(n)}</strong> ${esc(l)}</span>`).join("")}</div>
      </div>
      <img class="bk-cover" src="${esc(b.cover)}" alt="${esc(b.title)} cover" width="600" height="787" fetchpriority="high">
    </div>
  </section>

  <section class="ebook-section bk-facts-sec" aria-labelledby="bk-facts-h">
    <div class="ebook-section-inner">
      <h2 id="bk-facts-h">${esc(b.short)} at a glance</h2>
      <dl class="bk-facts">${b.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join("")}</dl>
    </div>
  </section>

  <section class="ebook-section" aria-labelledby="bk-gal-h">
    <div class="ebook-section-inner">
      <p class="section-kicker">From the book</p>
      <h2 id="bk-gal-h">${esc(b.galleryTitle)}</h2>
      <div class="bk-gallery">
        ${gallery}
      </div>
    </div>
  </section>

  <section class="ebook-section ebook-contents">
    <div class="ebook-section-inner">
      <p class="section-kicker">What you get</p>
      <h2>Every board includes</h2>
      <div class="ebook-grid">${b.includes.map(([t, d]) => `<article><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join("")}</div>
      ${buyRow(b, c("includes"), false)}
    </div>
  </section>

  <section class="ebook-section" id="boards" aria-labelledby="bk-list-h">
    <div class="ebook-section-inner">
      <p class="section-kicker">All ${b.count} boards</p>
      <h2 id="bk-list-h">${esc(b.listTitle)}</h2>
      <div class="bk-table-wrap"><table class="bk-table">
        <thead><tr>${b.listHead.map((x) => `<th scope="col">${esc(x)}</th>`).join("")}</tr></thead>
        <tbody>${b.rows.map((r) => `<tr>${r.map((x, i) => (i === 1 ? `<th scope="row">${x}</th>` : `<td>${x}</td>`)).join("")}</tr>`).join("\n        ")}</tbody>
      </table></div>
      ${b.listNote ? `<p class="bk-fine">${b.listNote}</p>` : ""}
    </div>
  </section>

  <section class="ebook-section bk-sample" id="sample" aria-labelledby="bk-sample-h">
    <div class="ebook-section-inner">
      <p class="section-kicker">Free sample</p>
      <h2 id="bk-sample-h">${esc(b.sample.title)}: the full shopping list</h2>
      <p>${b.sample.intro}</p>
      ${b.sample.groups.map((g) => `<h3>${esc(g.name)}</h3>
      <div class="bk-table-wrap"><table class="bk-table bk-shop"><thead><tr>${b.sample.cols.map((x) => `<th scope="col">${esc(x)}</th>`).join("")}</tr></thead><tbody>${g.items.map((it) => `<tr>${it.map((x, i) => (i === 0 ? `<th scope="row">${esc(x)}</th>` : `<td>${esc(x)}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`).join("\n      ")}
      ${b.sample.after ? `<p>${b.sample.after}</p>` : ""}
      <aside class="bk-cta-inline"><p><strong>That's one board.</strong> ${esc(b.sample.upsell)}</p>${buyRow(b, c("sample"), false)}</aside>
    </div>
  </section>

  <section class="ebook-section fx-look" id="look-inside">
    <div class="ebook-section-inner">
      <p class="section-kicker">Look inside</p>
      <h2>Real pages from the book</h2>
      <div class="fx-look-grid bk-looks">
        ${looks}
      </div>
    </div>
  </section>

  <section class="ebook-section ebook-editions" id="editions">
    <div class="ebook-section-inner">
      <p class="section-kicker">Choose your edition</p>
      <h2>Same ${b.count} boards, two ways to own them</h2>
      <div class="edition-grid">
        <article class="edition-card edition-ebook">
          <p class="edition-tag">Ebook · best value</p>
          <p class="edition-price">${esc(b.ebookPrice)}</p>
          <ul><li>Instant PDF download</li><li>${esc(b.pages)} full-colour pages on your phone, tablet or laptop</li><li>Print just the board you're making</li></ul>
          <a class="button primary" href="${esc(T(b.ebookUrl, c("editions")))}" target="_blank" rel="noopener">Get the ebook on Gumroad</a>
        </article>
        <article class="edition-card edition-print">
          <p class="edition-tag">Paperback</p>
          <p class="edition-price">${esc(b.paperbackPrice)}</p>
          <ul><li>${esc(b.pages)} pages, full colour, 8.5&Prime; &times; 11&Prime;</li><li>Lies open on the counter while you build</li><li>Printed and shipped by Amazon</li></ul>
          ${b.paperbackUrl ? `<a class="button" href="${esc(b.paperbackUrl)}" target="_blank" rel="noopener">Paperback on Amazon</a>` : `<p class="bk-soon">Coming soon to Amazon</p>`}
        </article>
      </div>
    </div>
  </section>

  <section class="ebook-section ebook-faq">
    <div class="ebook-section-inner">
      <p class="section-kicker">Questions</p>
      <h2>${esc(b.short)}: questions before you buy</h2>
      <div class="ebook-faq-list">
        ${b.faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${a}</p></details>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section class="ebook-final-cta">
    <div>
      <p class="ebook-kicker">Charcuterie Lab</p>
      <h2>${esc(b.finalLine)}</h2>
      ${buyRow(b, c("final"))}
    </div>
  </section>

  <section class="ebook-section" aria-labelledby="bk-more-h">
    <div class="ebook-section-inner">
      <h2 id="bk-more-h">More Charcuterie Lab books</h2>
      <div class="bk-others">${others.map((o) => `<a href="${o.path}"><img src="${esc(o.cover)}" alt="" width="160" height="210" loading="lazy" decoding="async"><strong>${esc(o.short)}</strong><span>Ebook ${esc(o.ebookPrice)}</span></a>`).join("")}</div>
      ${b.related ? `<p class="bk-fine">On the site: ${b.related.map(([t, u]) => `<a href="${u}">${esc(t)}</a>`).join(" · ")}</p>` : ""}
    </div>
  </section>
</main>`
    });
  }

  // ------------------------------------------------------------ Keto
  {
    const k = keto;
    const net = k.map((x) => x.per.net);
    const lo = Math.round(Math.min(...net)), hi = Math.round(Math.max(...net));
    const s = k[0];
    const b = {
      ...books.find((x) => x.key === "keto"),
      seoTitle: "Keto Charcuterie Board Book: 20 Low-Carb Boards with Macros",
      kicker: "Ebook · 20 boards · full macros",
      h1: "Keto & Low-Carb Boards: 20 charcuterie boards with full macros",
      description: `A 112-page keto charcuterie board book: 20 complete boards at ${lo}–${hi} g net carbs per serving, each with full macros, a shopping list with the net carbs of every item and a step-by-step build. Instant PDF on Gumroad.`,
      lead: `<strong>Keto & Low-Carb Boards</strong> is a 112-page ebook of 20 charcuterie boards that come in at <strong>${lo}–${hi} g net carbs per serving</strong>. Every board has its calories, fat, protein, total carbs, fiber and net carbs worked out, a shopping list with the net carbs of each item, and the swaps that keep crackers, honey and grapes off the board.`,
      metrics: [["20", "boards"], [`${lo}–${hi} g`, "net carbs"], ["112", "pages"], ["USDA", "nutrition data"]],
      facts: [["Format", "PDF ebook, 112 pages, US Letter, full colour"], ["Boards", "20, from a $30 budget board to a Christmas board for 12"], ["Net carbs", `${lo}–${hi} g per serving on every board`], ["Macros", "Calories, fat, protein, total carbs, fiber and net carbs per serving"], ["Nutrition source", "USDA FoodData Central figures, checked twice"], ["Price", `${books.find((x) => x.key === "keto").ebookPrice} on Gumroad, instant download`]],
      galleryTitle: "Boards that don't need crackers",
      gallery: [1, 7, 11, 13, 5, 20].map((n) => [`/images/books/keto/board-${String(n).padStart(2, "0")}.webp`, k[n - 1].title]),
      includes: [["Full macros", "Calories, fat, protein, total carbs, fiber and net carbs per serving, from USDA data."], ["Net-carb shopping list", "Every item with its amount, estimated price and net carbs, so you can see where the carbs are."], ["Prep countdown", "When to take each cheese out of the fridge and what to do while it warms."], ["Seven placement steps", "Where everything goes on the board, and why it works there."], ["Carb traps and swaps", "The foods that quietly add carbs to an ordinary board, and the keto swap for each."], ["Swaps and upgrades", "Five substitutions and five optional upgrades for every board."]],
      count: 20,
      listTitle: "The 20 keto boards, with net carbs per serving",
      listHead: ["#", "Board", "Type", "Serves", "Net carbs", "Protein", "Cost"],
      rows: k.map((x) => [x.num, esc(x.title), esc(x.section), String(x.serves), `${Math.round(x.per.net)} g`, `${Math.round(x.per.protein)} g`, esc(x.stats["Total cost"] || "")]),
      listNote: "Calories, protein and net carbs are per serving, food on the board only.",
      sample: {
        title: s.title,
        intro: `Board 01 serves ${s.serves} as the party food and comes in at <strong>${Math.round(s.per.net)} g net carbs</strong>, ${Math.round(s.per.protein)} g protein and ${Math.round(s.per.kcal)} calories per serving. Here's its complete shopping list, exactly as it appears in the book.`,
        cols: ["Item", "Amount", "Net carbs", "Price"],
        groups: s.shopping.map((g) => ({ name: g.name, items: g.items.map((it) => [it.name, it.qty, `${(Math.round(it.net * 10) / 10).toFixed(1)} g`, it.price]) })),
        upsell: "The book has 19 more, each with the same shopping list, a timed build, the placement steps and the carb traps to avoid."
      },
      looks: [["/images/books/keto/look-1.webp", "The 20 boards at a glance"], ["/images/books/keto/look-2.webp", "Board 01 with its macros"], ["/images/books/keto/look-3.webp", "Carb traps and smart swaps"]],
      faq: [
        ["Can you eat charcuterie on keto?", "Yes. Cheese, cured meat, olives and nuts are naturally low in carbs. The carbs on an ordinary board come from crackers, bread, honey, jam and grapes, and every board in this book replaces those with low-carb options."],
        ["How many net carbs are in each board?", `Every board comes in at ${lo}–${hi} g net carbs per serving. Net carbs are total carbs minus fiber, and the figures cover the food on the board, not drinks.`],
        ["Where do the nutrition numbers come from?", "From USDA nutrition data for each ingredient at the amount on the shopping list, added up per serving and checked twice. Packaged foods vary by brand, so read the label on cured meats and anything pre-made."],
        ["What do you use instead of crackers?", "Parmesan crisps, cheese crisps, cucumber rounds, celery, endive leaves, bell pepper strips and pork rinds. Each board says which ones it uses."],
        ["Is there a paperback?", books.find((x) => x.key === "keto").paperbackUrl ? `Yes, the paperback is on Amazon at ${esc(books.find((x) => x.key === "keto").paperbackPrice)}. The ebook is an instant PDF download from Gumroad.` : `The paperback is coming soon to Amazon at ${esc(books.find((x) => x.key === "keto").paperbackPrice)}. The ebook is available now as an instant PDF download.`],
        ["How do I get the ebook?", "Checkout is on Gumroad. You get a download link by email straight away, and the PDF stays in your Gumroad library."]
      ],
      finalLine: "Build a board everyone at the table can eat.",
      related: [["Keto charcuterie board guide", "/blog/keto-charcuterie-board/"], ["How much charcuterie per person", "/blog/how-much-charcuterie-per-person/"], ["Dietary guides", "/dietary/"]]
    };
    pages.push({ path: b.path, html: page(b) });
  }

  // ------------------------------------------------------------ For two
  {
    const t = two;
    const s = t[0];
    const sections = [...new Set(t.map((x) => x.section))];
    const b = {
      ...books.find((x) => x.key === "two"),
      seoTitle: "Charcuterie Boards for Two: 25 Date Night Boards (Ebook)",
      kicker: "Ebook · 25 boards · sized for two",
      h1: "Boards for Two: 25 charcuterie boards for date nights and nights in",
      description: "A 136-page ebook of 25 charcuterie boards sized for two people: first dates, anniversaries, Valentine's Day, movie nights and more, each with an exact shopping list, a prep countdown and a drink to pour. Instant PDF on Gumroad.",
      lead: "<strong>Boards for Two</strong> is a 136-page ebook of 25 charcuterie boards sized for exactly two people, so the board is generous without half of it going back in the fridge. Each one has an exact shopping list with amounts and prices, a countdown so it's ready when they arrive, seven placement steps, and what to pour with an alcohol-free option.",
      metrics: [["25", "boards"], ["2", "people each"], ["136", "pages"], ["25", "drink pairings"]],
      facts: [["Format", "PDF ebook, 136 pages, US Letter, full colour"], ["Boards", `25 in ${sections.length} sections: ${sections.join(", ")}`], ["Amounts", "2 oz of meat and cheese per person for a light bite, 3 oz as the main food, 4 oz as dinner"], ["Drinks", "A pairing for every board, plus an alcohol-free option"], ["Occasions", "First date, anniversary, Valentine's Day, proposal night, movie night, New Year's Eve"], ["Price", `${books.find((x) => x.key === "two").ebookPrice} on Gumroad, instant download`]],
      galleryTitle: "Boards made for two",
      gallery: [1, 2, 16, 21, 9, 25].map((n) => [`/images/books/two/board-${String(n).padStart(2, "0")}.webp`, t[n - 1].title]),
      includes: [["Exact shopping list", "Amounts and estimated prices for two, so nothing goes to waste."], ["Prep countdown", "A timed plan so the board is ready when they arrive."], ["Seven placement steps", "Where each item goes, and the reason it works there."], ["Set the mood", "What to pour, why it works, and an alcohol-free option."], ["A fact to share", "A \"Did You Know?\" note about the board to talk about at the table."], ["Swaps and upgrades", "Five substitutions and five optional upgrades for every board."]],
      count: 25,
      listTitle: "The 25 boards for two",
      listHead: ["#", "Board", "Section", "Built as", "Prep", "Cost"],
      rows: t.map((x) => [x.num, esc(x.title), esc(x.section), esc(x.use === "before a meal" ? "Light bite" : x.use === "party food" ? "Main food" : x.use === "dinner" ? "Dinner" : "Seafood tasting"), esc(x.prep || x.stats["Prep time"] || ""), esc(x.cost || x.stats["Total cost"] || "")]),
      listNote: "Costs are typical US grocery estimates for the whole board.",
      sample: {
        title: s.title,
        intro: `Board 01 is built as the main food for the evening: 3 oz each of meat and cheese per person. It costs about ${esc(s.cost)} in total and takes ${esc(s.prep)} to build. Here's its full shopping list, exactly as it appears in the book.`,
        cols: ["Item", "Amount", "Price"],
        groups: s.shopping.map((g) => ({ name: g.name, items: g.items.map((it) => [it.name, it.qty, it.price]) })),
        after: `<strong>What to pour:</strong> ${esc(s.drink[0])}. ${esc(s.drink[1])} Alcohol-free: ${esc(s.drink[2])}.`,
        upsell: "The book has 24 more, from Valentine's Day to a caviar night, each with the same shopping list, a countdown, the placement steps and a drink to pour."
      },
      looks: [["/images/books/two/look-1.webp", "The 25 boards at a glance"], ["/images/books/two/look-2.webp", "A board overview page"], ["/images/books/two/look-3.webp", "A full shopping list and countdown"]],
      faq: [
        ["How much charcuterie do you need for two people?", "About 2 oz each of meat and cheese per person for a light bite before dinner, 3 oz each if the board is the main food for the evening, and 4 oz each if it's dinner. Every board in the book says which one it's built as."],
        ["What's on a charcuterie board for two?", "Usually two cheeses, two cured meats, a fruit, something sweet like honey or jam, nuts, crackers or bread, and something briny like olives or cornichons. The book adds a drink pairing for each board."],
        ["What are the best occasions for these boards?", "First dates, anniversaries, Valentine's Day, birthdays, proposal nights, movie nights, lazy Sundays, breakfast in bed and New Year's Eve. There are also luxe boards like oysters and Champagne, and four boards from other cuisines."],
        ["Do the boards include drinks?", "Yes. Each board has a \"Set the Mood\" pairing that explains why the drink works, plus an alcohol-free option."],
        ["Is there a paperback?", books.find((x) => x.key === "two").paperbackUrl ? `Yes, the paperback is on Amazon at ${esc(books.find((x) => x.key === "two").paperbackPrice)}. The ebook is an instant PDF download from Gumroad.` : `The paperback is coming soon to Amazon at ${esc(books.find((x) => x.key === "two").paperbackPrice)}. The ebook is available now as an instant PDF download.`],
        ["How do I get the ebook?", "Checkout is on Gumroad. You get a download link by email straight away, and the PDF stays in your Gumroad library."]
      ],
      finalLine: "Pick a night, make the list, and put something special on the table.",
      related: [["Charcuterie board for two", "/blog/charcuterie-board-two/"], ["Date night board", "/blog/date-night-charcuterie-board/"], ["Valentine's Day board ideas", "/holidays/valentines-day/"]]
    };
    pages.push({ path: b.path, html: page(b) });
  }

  // ------------------------------------------------------------ Plant-based
  {
    const p = [...plant].sort((a, b) => a.number.localeCompare(b.number));
    const pick = (x) => (x.groups || []).flatMap((g) => g.items.map((i) => i.name)).slice(0, 4).join(", ");
    const b = {
      ...books.find((x) => x.key === "plant"),
      seoTitle: "Vegan Charcuterie Board Book: 15 Plant-Based Boards (Ebook)",
      kicker: "Ebook · 15 boards · no meat, no dairy",
      h1: "15 Show-Stopping Plant-Based Boards: vegan charcuterie, fully planned",
      description: "A 77-page ebook of 15 vegan charcuterie boards with no meat and no dairy: Mediterranean, Italian, French bistro, mezze, brunch, dessert and holiday boards, each with a shopping list, a step-by-step blueprint, swaps and the pairing science. Instant PDF on Gumroad.",
      lead: "<strong>15 Show-Stopping Plant-Based Boards</strong> is a 77-page ebook of vegan charcuterie boards with no meat and no dairy. Each board is five pages: a cover, an exact shopping list with amounts and prices, a step-by-step blueprint, substitutions and upgrades, and the science notes on why the pairings work.",
      metrics: [["15", "boards"], ["0", "meat or dairy"], ["77", "pages"], ["5", "pages per board"]],
      facts: [["Format", "PDF ebook, 77 pages, US Letter, full colour"], ["Boards", "15, from a classic starter board to a holiday board"], ["Diet", "Vegan: no meat and no dairy"], ["Each board", "Cover, shopping list, blueprint, substitutions and elevations, science notes"], ["Allergies", "Many boards use nut cheeses, so check each list for tree nuts"], ["Price", `${books.find((x) => x.key === "plant").ebookPrice} on Gumroad, instant download`]],
      galleryTitle: "Boards with no meat and no dairy",
      gallery: [2, 3, 5, 10, 11, 15].map((n) => [`/images/books/plant/board-${String(n).padStart(2, "0")}.webp`, (p[n - 1] || {}).title || `Board ${n}`]),
      includes: [["Exact shopping list", "Every item with its amount and estimated price, sorted by section of the store."], ["Step-by-step blueprint", "The build order and where each item goes on the board."], ["Plant-based swaps", "Nut cheeses, dips and plant proteins that give the board the richness meat and cheese usually bring."], ["Substitutions", "Easy swaps when something is hard to find or a guest has an allergy."], ["Elevations", "Optional upgrades to make the board feel special."], ["Science notes", "Why the flavors and textures work together."]],
      count: 15,
      listTitle: "The 15 plant-based boards",
      listHead: ["#", "Board", "Some of what's on it"],
      rows: p.map((x) => [x.number.replace("PB-", ""), x.status === "published" ? `<a href="/boards/${x.slug}/">${esc(x.title)}</a>` : esc(x.title), esc(pick(x))]),
      sample: {
        title: "The Mediterranean Plant-Based Board",
        intro: "Board 02 serves 6 to 8 people on a 14 to 18 inch board, takes 20 to 25 minutes and costs about $30–45. Here's its full shopping list, exactly as it appears in the book.",
        cols: ["Item", "Amount", "Price"],
        groups: [
          { name: "Dips", items: [["Hummus, classic", "4 oz", "$2–3"], ["Baba ghanoush", "4 oz", "$3–4"], ["Vegan tzatziki (coconut yogurt)", "3 oz", "$3–4"]] },
          { name: "Plant proteins", items: [["Falafel bites (store-bought or frozen)", "8–10 pieces", "$3–5"], ["Stuffed grape leaves (canned)", "6–8 pieces", "$3–4"]] },
          { name: "Fresh produce", items: [["Cherry tomatoes, halved", "10–12 pieces", "$2–3"], ["Persian cucumber, sliced", "1 medium", "$1–2"], ["Fresh mint sprigs", "Small bunch", "$1"]] },
          { name: "Crackers and bread", items: [["Pita triangles, lightly toasted", "8–10 pieces", "$2–3"], ["Pita chips (store-bought)", "1 oz", "$2"]] },
          { name: "Olives and nuts", items: [["Kalamata olives", "2 oz", "$3–4"], ["Pistachios, shelled", "2 oz", "$4–5"]] },
          { name: "Condiments and extras", items: [["Za'atar olive oil (olive oil + za'atar)", "2 tbsp", "$2"], ["Lemon wedges", "2 wedges", "$0.50"], ["Tabbouleh (store-bought)", "3 oz", "$2–3"]] }
        ],
        after: "<strong>Pairs with:</strong> mint lemonade or an Assyrtiko white wine.",
        upsell: "The book has 14 more, each with the same shopping list, the blueprint, swaps, upgrades and the science notes."
      },
      looks: [["/images/books/plant/look-1.webp", "The 15 boards"], ["/images/books/plant/look-2.webp", "A board's shopping list page"]],
      faq: [
        ["Can a charcuterie board be vegan?", "Yes. A vegan board swaps cured meat and dairy cheese for nut cheeses, dips like hummus and baba ghanoush, marinated vegetables, plant proteins like falafel, and the usual fruit, nuts, olives and crackers."],
        ["Are all 15 boards vegan?", "Yes. Every board has no meat and no dairy. Check labels on store-bought items like crackers, breads and dips, since some contain honey, egg or milk."],
        ["What replaces cheese on a plant-based board?", "Cashew and almond cheeses, hummus, white bean dip, vegan tzatziki and marinated tofu or tempeh. The book says which ones each board uses and where to put them."],
        ["Are the boards nut-free?", "Not all of them. Many use nut cheeses, pistachios or almonds. The substitutions page for each board helps you swap them out for a guest with a tree nut allergy."],
        ["Is there a paperback?", `Yes, the paperback is on Amazon at ${esc(books.find((x) => x.key === "plant").paperbackPrice)}. The ebook is an instant PDF download from Gumroad.`],
        ["How do I get the ebook?", "Checkout is on Gumroad. You get a download link by email straight away, and the PDF stays in your Gumroad library."]
      ],
      finalLine: "Build a board everyone at the table can eat, vegan guests included.",
      related: [["Vegan charcuterie guide", "/dietary/vegan/"], ["Vegetarian charcuterie board", "/blog/vegetarian-charcuterie-board/"], ["Plant-based boards", "/boards/plant-based/"]]
    };
    pages.push({ path: b.path, html: page(b) });
  }

  // ------------------------------------------------------------ Hub
  pages.push({
    path: "/books/",
    html: h.layout({
      title: "Charcuterie Board Books: 5 Ebooks with Shopping Lists | Charcuterie Lab",
      canonical: "/books/",
      image: books[0].cover,
      description: "Charcuterie Lab books: 50 Boards Built by Science, Around the World in 16 Boards, Keto & Low-Carb Boards, Boards for Two and 15 Plant-Based Boards. Instant PDF ebooks on Gumroad, paperbacks on Amazon.",
      head: `  <script type="application/ld+json">${h.jsonForScript({ "@context": "https://schema.org", "@type": "ItemList", name: "Charcuterie Lab books", itemListElement: books.map((b, i) => ({ "@type": "ListItem", position: i + 1, url: h.absoluteUrl(b.path), name: b.title })) })}</script>`,
      body: `<main class="ebook-page bk-page">
  <section class="ebook-section">
    <div class="ebook-section-inner">
      <p class="section-kicker">Books</p>
      <h1>Charcuterie board books</h1>
      <p class="bk-lead">Five books of complete charcuterie boards, each with an exact shopping list, a timed build and the pairing logic behind it. Every one is an instant PDF download on Gumroad, and the paperbacks are on Amazon.</p>
      <div class="bk-hub">${books.map((b) => `<article>
        <a href="${b.path}"><img src="${esc(b.cover)}" alt="${esc(b.title)} cover" width="300" height="394" loading="lazy" decoding="async"></a>
        <h2><a href="${b.path}">${esc(b.short)}</a></h2>
        <p>${esc(b.line)}</p>
        ${buyRow(b, `books_hub_${b.key}`, false)}
        <a class="fx-more" href="${b.path}">See inside &rarr;</a>
      </article>`).join("\n      ")}</div>
    </div>
  </section>
</main>`
    })
  });
  return pages;
}
