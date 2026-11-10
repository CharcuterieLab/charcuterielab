// 9 Nov 2026: Shop page made easy to sift, applied after the build (hub-calm).
// - "How the shop works": five plain boxes (books, $3 plans, printables,
//   bundles, free) with what each is and its price range, read off the page.
// - The section chips become filters: tap one and only that section shows;
//   "Everything" brings the rest back. Without JS they stay jump links.
// - "What are you shopping for?" becomes four tap-to-open tiles instead of a
//   sideways scroll that hid three of the four.
// - Books and bundles show 4 then "Show all"; printables show 4 (the "See all
//   24" link stays); the third action on each card ("Look inside") goes, so
//   every card has one button and one link.
// The top quick-subscribe bar goes via quick-subscribe SKIP; the Free section
// at the bottom keeps the email offer.

const money = (s) => [...s.matchAll(/\$(\d+(?:\.\d\d)?)/g)].map((m) => +m[1]);
const range = (xs) => {
  if (!xs.length) return "";
  const lo = Math.min(...xs), hi = Math.max(...xs);
  const f = (x) => (Number.isInteger(x) ? `$${x}` : `$${x.toFixed(2)}`);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
};
const section = (html, id) => (html.match(new RegExp(`<section class="[^"]*" id="${id}"[\\s\\S]*?<\\/section>`)) || [""])[0];

const FILTER_JS = `<script data-shop-filter-js>(function(){var nav=document.querySelector("[data-shop-filter]");if(!nav)return;var ids=["ebooks","bundles","printables","singles","free"],extra=document.querySelectorAll("[data-shop-hide]");function show(id){ids.forEach(function(x){var s=document.getElementById(x);if(s)s.hidden=!!id&&x!==id});extra.forEach(function(e){e.hidden=!!id});nav.querySelectorAll("a").forEach(function(a){var on=(a.getAttribute("href")==="#"+id)||(!id&&a.getAttribute("href")==="#shop-all");a.classList.toggle("is-on",on);a.setAttribute("aria-current",on?"true":"false")});if(id){var s=document.getElementById(id);if(s)s.querySelectorAll("[data-more]").forEach(function(c){c.hidden=false});s.querySelectorAll("[data-show-all]").forEach(function(b){b.parentNode.hidden=true})}}document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("[data-shop-filter] a, a[data-shop-go]");if(!a)return;var h=a.getAttribute("href").slice(1);e.preventDefault();show(h==="shop-all"?"":h);var t=document.getElementById("shop-filter");if(t)t.scrollIntoView({behavior:"smooth",block:"start"})});document.querySelectorAll("[data-show-all]").forEach(function(b){b.addEventListener("click",function(){var s=b.closest("section");s.querySelectorAll("[data-more]").forEach(function(c){c.hidden=false});b.parentNode.hidden=true})});try{if(matchMedia("(min-width: 821px)").matches)document.querySelectorAll(".shop2-intent-fold details").forEach(function(d){d.open=true})}catch(e){}var h=location.hash.slice(1);if(ids.indexOf(h)>=0)show(h)})();</script>`;

export function upShop(html) {
  let n = 0;
  const books = section(html, "ebooks"), bundles = section(html, "bundles"), prints = section(html, "printables"), singles = section(html, "singles");
  const pBooks = range(money((books.match(/Ebook · \$[\d.]+/g) || []).join(" ")));
  const pBundles = range(money((bundles.match(/<p class="eyebrow">\$[\d.]+/g) || []).join(" ")));
  const pPrints = range(money((prints.match(/<p class="eyebrow">\$[\d.]+/g) || []).join(" ")));
  const nBooks = (books.match(/<article class="shop2-book">/g) || []).length;
  const nBundles = (bundles.match(/<article class="fx-p-card">/g) || []).length;
  const nPlans = ((singles.match(/See all (\d+) single plans/) || [])[1]) || "";
  const nPrints = ((prints.match(/See all (\d+) printables/) || [])[1]) || "";

  const key = `<section class="shop-key" id="shop-filter" aria-labelledby="shop-key-h">
    <h2 id="shop-key-h">How the shop works</h2>
    <div class="shop-key-grid">
      <a class="shop-key-box" href="#ebooks" data-shop-go><strong>Books</strong><span>Many complete boards in one ebook or paperback.</span><em>${nBooks} books · ebooks ${pBooks}</em></a>
      <a class="shop-key-box" href="#singles" data-shop-go><strong>$3 board plans</strong><span>One board, fully planned: shopping list, build steps and swaps.</span><em>${nPlans ? `${nPlans} boards · ` : ""}$3 each</em></a>
      <a class="shop-key-box" href="#printables" data-shop-go><strong>Printables</strong><span>One tool: a pairing chart, a field guide or a party planner.</span><em>${nPrints ? `${nPrints} printables · ` : ""}${pPrints}</em></a>
      <a class="shop-key-box" href="#bundles" data-shop-go><strong>Bundles</strong><span>Several printables for one occasion, cheaper together.</span><em>${nBundles} bundles · ${pBundles}</em></a>
      <a class="shop-key-box shop-key-free" href="#free" data-shop-go><strong>Free</strong><span>The Cheat Sheet, Board 01 from the book and two printable tools.</span><em>Free</em></a>
    </div>
    <p class="shop-key-fine">Every PDF downloads straight away from Gumroad, with a 30-day refund. Paperbacks ship from Amazon.</p>
  </section>`;

  // section chips become filters, with "Everything" first
  html = html.replace(/<nav class="shop-jump" aria-label="Shop sections">([\s\S]*?)<\/nav>/, (m, inner) => {
    n++;
    return `${key}
  <nav class="shop-jump shop-filter" data-shop-filter aria-label="Show one kind of product"><a href="#shop-all" class="is-on" aria-current="true">Everything</a>${inner}</nav>`;
  });

  // "What are you shopping for?" tiles open in place
  html = html.replace(/<section class="shop2-intent"([\s\S]*?)<\/section>/, (all) => {
    n++;
    return all.replace(' class="shop2-intent"', ' class="shop2-intent shop2-intent-fold" data-shop-hide')
      .replace(/<div class="shop2-intent-card"><p class="eyebrow">([\s\S]*?)<\/p>(<ul>[\s\S]*?<\/ul>)<\/div>/g, (m, t, ul) => `<details class="shop2-intent-card"><summary><span class="eyebrow">${t}</span><span class="shop2-n">${(ul.match(/<li>/g) || []).length} picks</span></summary>${ul}</details>`);
  });

  // 4 cards then "Show all" in books and bundles; 4 in printables
  const limit = (id, tag, label) => {
    html = html.replace(new RegExp(`(<section class="[^"]*" id="${id}"[\\s\\S]*?<\\/section>)`), (sec) => {
      let k = 0;
      const total = (sec.match(new RegExp(`<article class="${tag}">`, "g")) || []).length;
      if (total <= 4) return sec;
      sec = sec.replace(new RegExp(`<article class="${tag}">`, "g"), (m) => (++k > 4 ? `<article class="${tag}" data-more hidden>` : m));
      if (label) sec = sec.replace(/(<\/div>\s*)(<\/section>)$/, `$1<p class="shop-more"><button type="button" class="button" data-show-all>${label.replace("N", total)}</button></p>\n  $2`);
      else sec = sec.replace(/(<\/div>\s*)(<p class="bl-more-wrap">)/, `$1$2`);
      n++;
      return sec;
    });
  };
  limit("ebooks", "shop2-book", "Show all N books");
  limit("bundles", "fx-p-card", "Show all N bundles");
  limit("printables", "fx-p-card", "");

  // one button and one link per card
  html = html.replace(/<details class="fx-look">[\s\S]*?<\/details>\s*/g, () => { n++; return ""; });

  if (n) html = html.replace(/<\/main>/, `${FILTER_JS}\n</main>`);
  return { html, n };
}
