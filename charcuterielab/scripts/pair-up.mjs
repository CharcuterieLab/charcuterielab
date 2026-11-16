// Pairings hub /pairings/ (16 Nov 2026): finder higher on phones (CSS), "Build it
// up" trimmed to 1 ladder, 2 plates and 3 pairs, the tannin rule points to the
// wine chart instead of "0 combinations", the seasonal pours move up under the
// drinks, the pairing printables replace the board blueprint, and one quiet
// bookshelf line for the Amazon paperbacks.

const AMAZON = {
  fifty: "https://www.amazon.com/dp/B0HLHVXRXK?tag=charcuteriela-20",
  world: "https://www.amazon.com/dp/B0HLKC56MG?tag=charcuteriela-20"
};

// Keep the first `keep` top-level <li> of the first <ul class="..."> after `from`
function keepItems(html, ulClass, keep, from = 0) {
  const at = html.indexOf(`<ul class="${ulClass}">`, from);
  if (at < 0) return { html, cut: 0, end: -1 };
  const tag = /<(\/?)(ul|ol|li)\b[^>]*>/g;
  tag.lastIndex = at;
  let depth = 0, li = 0, cutFrom = -1, end = -1;
  for (let m; (m = tag.exec(html));) {
    const close = m[1] === "/", name = m[2];
    if (name !== "li") { depth += close ? -1 : 1; if (depth === 0) { end = m.index; break; } continue; }
    if (depth === 1 && !close) { li++; if (li === keep + 1) cutFrom = m.index; }
  }
  if (cutFrom < 0 || end < 0) return { html, cut: 0, end };
  return { html: html.slice(0, cutFrom) + html.slice(end), cut: li - keep, end: cutFrom };
}

export function upPairHub(html, path) {
  if (path !== "/pairings/" || html.includes('class="pr-shelf"')) return { html, n: 0 };
  let n = 0;
  // 2. Build it up: 1 ladder, 2 plates, 3 pairs
  const sec = html.indexOf('<section class="bl-section" aria-labelledby="combos-h">');
  if (sec > -1) {
    let r = keepItems(html, "lab-ladders", 1, sec); html = r.html; n += r.cut ? 1 : 0;
    r = keepItems(html, "pr-combos", 2, sec); html = r.html;
    r = keepItems(html, "pr-combos", 3, r.end > -1 ? r.end : sec); html = r.html;
    html = html.replace(/These are 3 of our (\d+) ladders\./, "Here is one of our $1 ladders; the Lab has every pair, trio and plate.");
  }
  // 3. Tannin comes from the drink, so the Lab (food with food) has no examples
  html = html.replace(/<a class="pr-more" href="\/pairings\/classics\/\?rule=fat-tannin#lab-find">0 combinations &rarr;<\/a>/, () => { n++; return '<a class="pr-more" href="/pairings/wine-and-cheese-chart/">Wine &amp; cheese chart &rarr;</a>'; });
  // 7. Seasonal pours move up under the drinks (pairings.js still picks the next occasion by date)
  const season = /<section class="bl-section pr-season"[\s\S]*?<\/section>\s*/.exec(html);
  const food = html.indexOf('<section class="bl-section" aria-labelledby="food-h">');
  if (season && food > -1 && season.index > food) {
    html = html.replace(season[0], "");
    const f = html.indexOf('<section class="bl-section" aria-labelledby="food-h">');
    html = html.slice(0, f) + season[0] + html.slice(f);
    n++;
  }
  // 5. Pairing printables instead of the board blueprint
  html = html.replace(/<aside class="fx-print" aria-label="Printable: Classic Board Blueprint v2">[\s\S]*?<\/aside>/, () => {
    n++;
    const u = (s) => `${s}?utm_source=charcuterielab&amp;utm_medium=site&amp;utm_campaign=mid_pairings`;
    return `<aside class="fx-print" aria-label="Printable: Pairing Card Deck">
    <a class="fx-print-img" href="/printables/pairing-card-deck/"><img src="/images/thumbs/pairing-card-deck-jpg-m.webp" alt="Pairing Card Deck preview" width="240" height="240" loading="lazy" decoding="async"></a>
    <div>
      <p class="eyebrow">Printable · $5 · 9 pages</p>
      <h2>Pairing Card Deck</h2>
      <p>Pairings are easier when they're in your hand. Print the deck, cut it out, and pull the cards for whatever is in your fridge.</p>
      <div class="fx-print-actions"><a class="button primary" href="${u("https://charcuterieflavor.gumroad.com/l/pairing-card-deck")}" target="_blank" rel="noopener">Get the PDF · $5</a><span class="fx-refund">Instant PDF &middot; 30-day refund</span><a class="fx-more" href="/printables/pairing-card-deck/">What's inside &rarr;</a></div>
      <p class="pr-also">Pouring wine? The <a href="/printables/wine-cheese-pairing-guide/">Wine &amp; Cheese Pairing Guide</a> matches 20 wine styles to their cheeses &middot; $4.</p>
    </div>
  </aside>`;
  });
  // 6. One quiet bookshelf line after the printable charts
  const charts = /(<section class="bl-section" aria-labelledby="chart-h">[\s\S]*?<\/section>)/.exec(html);
  if (charts) {
    const shelf = `<aside class="pr-shelf" aria-label="Charcuterie Lab books"><img src="/images/thumbs/book-cover-jpg-s.webp" alt="" width="60" height="78" loading="lazy" decoding="async"><img src="/images/thumbs/books__around-the-world-cover-webp-s.webp" alt="" width="60" height="78" loading="lazy" decoding="async"><p><strong>From the Lab bookshelf.</strong> Every board in our books comes with its pairing notes: <a href="${AMAZON.fifty}" rel="sponsored noopener" target="_blank">50 Boards Built by Science</a> and <a href="${AMAZON.world}" rel="sponsored noopener" target="_blank">Around the World in 16 Boards</a>, in paperback on Amazon.</p></aside>`;
    html = html.replace(charts[1], charts[1] + shelf);
    n++;
  }
  return { html, n };
}
