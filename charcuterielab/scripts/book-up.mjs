// The book page /ebook/ (14 Nov 2026): cover in the first screen, the free
// board 01 sample right after the editions, one "which edition" section not
// two, "Inside the book" as a short checklist, a holiday gift line on the
// paperback, the $3-a-board value line, and a row of the other books.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const INSIDE = [
  ["50 complete board blueprints", "classic, seasonal, budget, wine-night, party and premium boards"],
  ["Shopping lists", "know what to buy before you walk into the store"],
  ["Pairing logic", "why each cheese, meat, fruit and spread belongs"],
  ["Substitutions", "swap anything that's pricey, missing or wrong for a guest"],
  ["Step-by-step builds", "a repeatable order that looks good every time"],
  ["Hosting upgrades", "simple ways to make a board feel special"]
];

function giftSeason(now = new Date()) {
  const m = now.getMonth(), d = now.getDate();
  return (m === 10 && d >= 1) || (m === 11 && d <= 18);
}

function cut(html, re) {
  const m = re.exec(html);
  return m ? { html: html.replace(m[0], ""), part: m[0] } : { html, part: "" };
}

export function upBook(html, path, dist) {
  if (path !== "/ebook/" || html.includes('class="bk-inside"')) return { html, n: 0 };
  let n = 0;

  // 1. Cover right under the buy buttons; the four stats become one compact row (CSS)
  const prod = cut(html, /<div class="ebook-hero-product">[\s\S]*?<\/div>\s*/);
  if (prod.part) {
    html = prod.html.replace(/(<div class="ebook-metrics")/, prod.part.replace('class="ebook-hero-product"', 'class="ebook-hero-product bk-cover"') + "$1");
    n++;
  }

  // 3. Drop the second "Which edition?" section (the edition cards already say it)
  const prev = cut(html, /<section class="ebook-section ebook-preview">[\s\S]*?<\/section>\s*/);
  if (prev.part) { html = prev.html; n++; }

  // 2. Free sample right after the edition cards
  const sample = cut(html, /<section class="ebook-section fx-sample" id="sample">[\s\S]*?<\/section>\s*/);
  if (sample.part) {
    const at = html.indexOf('<section class="ebook-strip"');
    if (at > -1) { html = sample.html.slice(0, sample.html.indexOf('<section class="ebook-strip"')) + sample.part + sample.html.slice(sample.html.indexOf('<section class="ebook-strip"')); n++; }
  }

  // 4. "Inside the book" as a two-column checklist
  html = html.replace(/<div class="ebook-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, () => {
    n++;
    return `<ul class="bk-inside">${INSIDE.map(([t, l]) => `<li><strong>${t}</strong> <span>${l}</span></li>`).join("")}</ul>\n    </div>\n  </section>`;
  });

  // 5. Holiday gift line on the paperback card (shows Nov 1 to Dec 18; gone on the next build after)
  if (giftSeason()) {
    html = html.replace(/(<article class="edition-card edition-print">[\s\S]*?)(<a class="button primary")/, (m, a, b) => {
      n++;
      return `${a}<p class="bk-gift"><strong>Giving it as a gift?</strong> The paperback ships from Amazon. Order by mid-December to have it for Christmas, or send the ebook any time.</p>${b}`;
    });
  }

  // 6. Value line under the sample boards
  const singles = (html.match(/Just this board · \$3/g) || []).length;
  const price = (/Get the ebook · (\$\d+(?:\.\d\d)?)/.exec(html) || [])[1];
  if (singles >= 4 && price) {
    const line = `<p class="bk-value">Bought one at a time, these ${singles} boards would cost $${singles * 3}. <strong>All 50 are in the book for ${price}.</strong></p>`;
    html = html.replace('<div class="ebook-sample-grid fx-sample-grid">', () => line + '<div class="ebook-sample-grid fx-sample-grid">');
    n++;
  }

  // 7. The other books, from the shop page's book cards
  try {
    const shop = readFileSync(join(dist, "shop", "index.html"), "utf8");
    const books = [...shop.matchAll(/<article class="shop2-book">\s*<a href="([^"]+)"><img src="([^"]+)" alt="([^"]*)"[^>]*><\/a>\s*<h3><a href="[^"]+">([\s\S]*?)<\/a><\/h3>/g)]
      .filter((m) => m[1] !== "/ebook/" && !/^https?:/.test(m[1]))
      .slice(0, 6);
    if (books.length) {
      const row = `<section class="ebook-section bk-more" aria-labelledby="bk-more-h"><div class="ebook-section-inner"><p class="section-kicker">More from the Lab</p><h2 id="bk-more-h">The other Charcuterie Lab books</h2><ul class="bk-more-grid">${books.map((b) => `<li><a href="${b[1]}"><img src="${b[2]}" alt="${b[3]}" width="240" height="310" loading="lazy" decoding="async"><span>${b[4]}</span></a></li>`).join("")}</ul><p class="bk-more-all"><a href="/shop/#ebooks">All books and prices in the shop &rarr;</a></p></div></section>\n`;
      html = html.replace('<section class="ebook-section ebook-faq">', row + '<section class="ebook-section ebook-faq">');
      n++;
    }
  } catch {}

  return { html, n };
}
