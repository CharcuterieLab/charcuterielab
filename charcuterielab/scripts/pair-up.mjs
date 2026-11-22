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
      <p class="pr-also">Pouring wine? The <a href="/printables/wine-cheese-pairing-guide/">Wine &amp; Cheese Pairing Guide</a> matches 20 wine styles to their cheeses &middot; $4. Or get the deck, the wine guide and the Cheese Board Field Guide together in <a href="/printables/pairing-pack/">The Pairing Pack</a> &middot; $9 <span>($14 separately)</span>.</p>
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
  // 22 Nov 2026: phones hide the hero photo, so a short strip of five bites sits under the finder
  if (!html.includes('class="hub-photo pr-strip"')) html = html.replace(/<section class="bl-section hub-tools-sec"/, (m) => {
    n++;
    return `<figure class="hub-photo pr-strip"><img src="/images/pairings-strip.webp" srcset="/images/thumbs/pairings-strip-webp-m.webp 640w, /images/pairings-strip.webp 1024w" sizes="calc(100vw - 32px)" alt="Five pairing bites: brie and fig, prosciutto and melon, parmesan and honey, manchego and quince, blue cheese with walnut and pear" width="1024" height="339" decoding="async"></figure>
    ${m}`;
  });
  // A (17 Nov). Phones: rules 1-3 show, a button opens 4-6 (CSS hides them; a #rule- link opens them)
  html = html.replace(/(<ol class="pr-rules">[\s\S]*?<\/ol>)/, (ol) => {
    n++;
    return `${ol}
      <button type="button" class="button pr-rules-all" onclick="this.previousElementSibling.classList.add('is-open');this.remove()">Show all 6 rules</button>
      <script>if(/^#rule-/.test(location.hash)){var o=document.querySelector('.pr-rules');o&&o.classList.add('is-open');var b=document.querySelector('.pr-rules-all');b&&b.remove()}</script>`;
  });
  // C (17 Nov). One quiet line for the Pairing Pack under the printable charts
  html = html.replace(/(<h2 id="chart-h">Printable pairing charts<\/h2>\s*<ul class="hub-charts">[\s\S]*?<\/ul>)/, (m) => {
    n++;
    return `${m}
      <p class="pr-pack-line">Want them on paper? <a href="/printables/pairing-pack/">The Pairing Pack</a>: the pairing card deck, the wine &amp; cheese guide and the cheese field guide &middot; $9 <span>($14 separately)</span></p>`;
  });
  // D (17 Nov). New Year's pours link the New Year's Eve board plan too (pairings.js already picks the next occasion by date)
  html = html.replace(/(<div class="pr-season-card" data-dates='[^']*' data-name="New Year's Eve" hidden>\s*<ul class="pr-chips">[\s\S]*?<\/ul>)(\s*<\/div>)/, (m, a, b) => {
    n++;
    return `${a}
        <p><a class="pr-more" href="/holidays/new-years-eve/">The full New Year's Eve board plan &rarr;</a></p>${b}`;
  });
  return { html, n };
}
