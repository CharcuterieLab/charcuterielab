// Gumroad-first offers (5 Oct 2026). The site's job is to sell the Gumroad
// printables and ebooks, with the Amazon paperbacks as the second option.
//
// Every content page gets ONE matched offer near the top (after the page's
// header) and the same offer in the mobile sticky bar. The offer is picked by
// OFFER_RULES below from the page's path and title: the first rule that
// matches AND has a live product (a Gumroad URL in src/data/products.json)
// wins. Products without a URL are skipped, so a new product starts showing
// on its pages the moment its URL is added. Book targets:
//   "book:main"  - 50 Boards Built by Science (Gumroad ebook, Amazon paperback)
//   "book:board" - the same book, sold as "Board #N is in the book" when the
//                  page matches one of its 50 boards
//   "book:world" - Around the World in 16 Boards
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { bhForm, CHEAT_IMG } from "./funnel.mjs";

const MEAT = /salami|pepperoni|soppressata|saucisson|prosciutto|coppa|capicola|bresaola|chorizo|nduja|mortadella|finocchiona|speck|pancetta|cured-meat|best-meats|meat-lover|jamon|lomo|fuet|culatello|guanciale|summer-sausage|rosette|landjager|cured meat/;
const CHEESE = /cheese|brie|cheddar|gouda|manchego|parmesan|parmigiano|gorgonzola|stilton|chevre|feta|gruyere|camembert|comte|taleggio|burrata|mozzarella|stracciatella|havarti|roquefort|boursin|halloumi|ricotta|mascarpone|epoisses|fontina|pecorino|asiago|raclette|reblochon|mimolette|jarlsberg|emmental|provolone|blue-cheese|bleu|triple-creme|mahon|idiazabal|morbier|muenster|edam|cotija|labneh|grana/;
const WINE = /wine|champagne|prosecco|pinot|cabernet|chardonnay|riesling|merlot|malbec|wine\/rose|sangiovese|chianti|beaujolais|sauvignon|sommelier|pairings\/drinks|pairings\/beer|pairings\/cocktails|beer|cider|ipa|stout|lager|mocktail|zero-proof/;

// Rules are tested against the page path (plus the ingredient category).
// [test, candidates in order, lead line for the first candidate]. The first
// candidate with a live product wins; a fallback uses its own default lead.
export const OFFER_RULES = [
  [/around-the-world|bavarian|german|korean|thai|indian|moroccan|portuguese|turkish|peruvian|vietnamese|brazilian|argentine|caribbean|dim-sum|swiss-alpine|ploughman|eastern-european/, ["book:world"], "Love a world board?"],
  [/baby-shower|pregnan/, ["baby-shower-board-kit", "book:board", "classic-entertaining-board-blueprint"], "Hosting a baby shower?"],
  [/smoked-salmon|lox|brunch|bagel|breakfast/, ["brunch-lox-board-plan", "new-years-eve-blini-bar", "complete-board-builder-bundle"], "Planning a brunch board?"],
  [/night-before|make-ahead|how-long|store|storage|leftover/, ["make-ahead-board-timeline", "classic-entertaining-board-blueprint"], "Making it ahead?"],
  [/gluten|celiac/, ["gluten-free-board-kit", "book:board", "complete-board-builder-bundle"], "Hosting a gluten-free guest?"],
  [/nut-free|nut-allerg|have-nuts|nuts-safe/, ["nut-free-allergy-board-kit", "complete-board-builder-bundle"], "Hosting a nut-free guest?"],
  [/vegan|vegetarian|plant-based|dairy-free/, ["vegetarian-vegan-board-kit", "book:plant", "complete-board-builder-bundle"], "Feeding vegetarian guests?"],
  [/\/dietary\/|mixed-diet|kosher|halal/, ["mixed-diet-party-planner", "complete-board-builder-bundle"], "Mixed diets at the party?"],
  [/\/pairings\/food\//, ["pairing-card-deck", "wine-cheese-pairing-guide"], "Pairing by hand?"],
  [/stracciatella|burrata/, ["burrata-stracciatella-board-plan", "cheese-board-field-guide"], "Serving burrata?"],
  [/stilton|cream-crackers|bath-olivers|wensleydale|red-leicester|oatcakes|digestive-biscuits|christmas-cheese/, ["british-christmas-cheese-board", "cheese-board-field-guide"], "Hosting Christmas?"],
  [/blini|gravlax|caviar|salmon-roe|new-years/, ["new-years-eve-blini-bar", "book:board"], "Hosting New Year's Eve?"],
  [/salami-vs-pepperoni|soppressata|saucisson/, ["cured-meat-field-guide", "salami-tasting-party-kit"], "Building around cured meats?"],
  [/salami-rose/, ["board-styling-playbook", "salami-tasting-party-kit"], "Want it to look styled?"],
  [/types-of-salami|\/pepperoni\/|best-salami|best-pepperoni|genoa-salami|calabrese|finocchiona|salami/, ["salami-tasting-party-kit", "cured-meat-field-guide"], "Love salami?"],
  [/boquerones|sobrasada|tapas|spanish|chorizo|manchego|membrillo|jamon|serrano|iberico|marcona|piquillo|mahon|idiazabal|lomo|fuet|salchichon/, ["spanish-tapas-board-kit", "book:board"], "Going Spanish?"],
  [/labneh|halloumi|mezze|hummus|za-atar|tzatziki|baba-ganoush|muhammara|dukkah|harissa|feta/, ["mezze-board-plan"], "Building a mezze board?"],
  [/brie|camembert|boursin|triple-creme|humboldt|taleggio|cambozola|soft-cheese|fromager/, ["soft-cheese-field-guide", "cheese-board-field-guide"], "Serving soft cheese?"],
  [/-pairing\/|pairing-by-contrast|salt-sweet|acid-rule|texture-contrast|umami/, ["pairing-card-deck", "wine-cheese-pairing-guide"], "Pairing by hand?"],
  [/build-sequence|rosemary|thyme|garnish|presentation|layout|arrange|salami-river|prosciutto-rose|board-photography|color-and-flavor|edible-flowers|fresh-basil|fresh-mint|board-shapes/, ["board-styling-playbook", "classic-entertaining-board-blueprint"], "Want it to look styled?"],
  [/expensive|budget|cheap|dollar|luxury|splurge|best-charcuterie-brands|board-cost/, ["spend-smart-board-plan", "book:board"], "Spending smart?"],
  [/grazing|large-group|crowd|wedding|for-(20|25|30|40|50|100)-people|charcuterie-cups/, ["grazing-table-planner", "complete-board-builder-bundle"], "Feeding a crowd?"],
  [/date-night|for-two|board-two|valentine|anniversary|galentine|romantic/, ["book:two", "book:board", "complete-board-builder-bundle"], "Planning a night for two?"],
  [/keto|low-carb|carnivore|diabetes/, ["book:keto", "book:board", "complete-board-builder-bundle"], "Keeping it keto?"],
  [WINE, ["wine-cheese-pairing-guide"], "Pouring wine?"],
  [MEAT, ["cured-meat-field-guide", "salami-tasting-party-kit"], "Building around cured meats?"],
  [CHEESE, ["cheese-board-field-guide", "cheese-pairing-science-card"], "Choosing cheeses?"],
  [/thanksgiving|friendsgiving|christmas|holiday|new-years|valentine|st-patrick|easter|halloween|super-bowl|game-day|hanukkah|birthday|graduation|office|cocktail|date-night|board-two|for-two|book-club|movie|camping|picnic|beach|summer|fall-|winter|budget|25-dollar|luxury|expensive|keto|kid|\/boards\//, ["book:board", "complete-board-builder-bundle"], "Want the full plan?"],
  [/how-to|beginner|easy|what-goes-on|presentation|how-much|per-person|quantit|serving|party-planner|board-builder|ideas|appetizer|build-sequence|bread|cracker|shapes|sizes|mistakes|layout|arrange/, ["classic-entertaining-board-blueprint", "complete-board-builder-bundle"], "Building your first board?"],
  [/./, ["classic-entertaining-board-blueprint", "book:main"], "Planning a board?"]
];

// The lead line when a fallback product is used instead of the rule's first pick.
const DEFAULT_LEAD = {
  "complete-board-builder-bundle": "Planning a board?",
  "classic-entertaining-board-blueprint": "Building a board?",
  "cheese-pairing-science-card": "Choosing cheeses?",
  "wine-cheese-pairing-guide": "Pouring wine?",
  "grazing-table-planner": "Feeding a crowd?",
  "book:board": "Want the full plan?",
  "book:main": "Want every board planned?",
  "book:world": "Love a world board?",
  "book:plant": "Going plant-based?",
  "book:keto": "Keeping it keto?",
  "book:two": "Planning a night for two?",
  "cured-meat-field-guide": "Building around cured meats?",
  "salami-tasting-party-kit": "Love salami?",
  "cheese-board-field-guide": "Choosing cheeses?",
  "new-years-eve-blini-bar": "Serving smoked salmon?",
  "soft-cheese-field-guide": "Serving soft cheese?",
  "spanish-tapas-board-kit": "Going Spanish?",
  "board-styling-playbook": "Want it to look styled?",
  "spend-smart-board-plan": "Spending smart?",
  "pairing-card-deck": "Pairing by hand?",
  "mezze-board-plan": "Building a mezze board?",
  "burrata-stracciatella-board-plan": "Serving burrata?",
  "british-christmas-cheese-board": "Hosting Christmas?"
};

// Pages that are already sales pages, or shouldn't carry an offer.
const SKIP = /^\/(printables|shop|books|ebook|around-the-world|thanks|privacy|search|downloads)(\/|$)/;


// FAQ written as paragraphs ("<p><strong>Question?</strong> answer</p>", a
// "post-callout" question followed by its answer, or an <h3> question) becomes
// tap-to-open questions. The text stays in the page, so search engines and the
// FAQ schema see all of it; only the first answer starts open.
export function foldFaq(html) {
  const head = /<h2[^>]*>[^<]*(?:FAQ|Questions|questions|Frequently)[^<]*<\/h2>/.exec(html);
  if (!head) return html;
  const start = head.index + head[0].length;
  const plain = (x) => x.replace(/<[^>]+>/g, "").trim();
  const items = [];
  let pos = start;
  const nextBlock = (at) => {
    const ws = /^\s*/.exec(html.slice(at))[0].length;
    const rest = html.slice(at + ws, at + ws + 20000);
    const m = /^<(p|ul|ol)\b[^>]*>[\s\S]*?<\/\1>/.exec(rest);
    return m ? { at: at + ws, end: at + ws + m[0].length, text: m[0] } : null;
  };
  for (;;) {
    const ws = /^\s*/.exec(html.slice(pos))[0].length;
    const rest = html.slice(pos + ws, pos + ws + 20000);
    let m, q, ans = [], end;
    if ((m = /^<p><strong>([\s\S]*?)<\/strong>\s*([\s\S]*?)<\/p>/.exec(rest)) && /\?\s*$/.test(plain(m[1])) && plain(m[2])) {
      q = m[1]; ans = [`<p>${m[2]}</p>`]; end = pos + ws + m[0].length;
    } else if ((m = /^<p class="post-callout">([\s\S]*?)<\/p>/.exec(rest)) && /\?\s*$/.test(plain(m[1])) || (m = /^<h3[^>]*>([\s\S]*?)<\/h3>/.exec(rest)) && /\?\s*$/.test(plain(m[1]))) {
      q = m[1]; end = pos + ws + m[0].length;
      for (let b = nextBlock(end); b && !/^<p class=|^<p><strong>/.test(b.text); b = nextBlock(end)) { ans.push(b.text); end = b.end; }
      if (!ans.length) break;
    } else break;
    items.push({ q, ans });
    pos = end;
  }
  if (items.length < 2) return html;
  const block = `\n<div class="faq-fold">${items.map((it, i) => `<details class="faq-item"${i === 0 ? " open" : ""}><summary>${it.q}</summary>${it.ans.join("")}</details>`).join("")}</div>`;
  return html.slice(0, start) + block + html.slice(pos);
}

export function makeOffers(h, products, books) {
  const esc = h.escapeHtml;
  const live = new Map(products.filter((p) => p.url).map((p) => [p.slug, p]));
  const thumb = h.thumb || ((x) => x);

  function asOffer(target, ctx) {
    if (target === "book:world" && books.world) return { type: "ebook", ...books.world };
    if (target === "book:main") return { type: "ebook", ...books.main };
    if (target === "book:plant" && books.plant) return { type: "ebook", ...books.plant };
    if (target === "book:keto" && books.keto) return { type: "ebook", ...books.keto };
    if (target === "book:two" && books.two) return { type: "ebook", ...books.two };
    if (target === "book:board") {
      const b = ctx.bookBoard;
      if (!b) return null;
      return { type: "ebook", ...books.main, boardN: b.nn, title: `${b.name}, fully planned`, hook: `It's board #${b.nn} in 50 Boards Built by Science: the exact shopping list with amounts and prices, a timed build and a swap for every ingredient. Plus 49 more boards.` };
    }
    const p = live.get(target);
    return p ? { type: "printable", slug: p.slug, title: p.title, price: p.priceShort || p.price, url: p.url, image: p.image, hook: p.hook, pages: p.pagesLabel } : null;
  }

  function pick(ctx) {
    const o = pickRaw(ctx);
    // Ingredient pages: speak to the ingredient ("Serving Brie?").
    if (/^\/ingredients\/[^/]+\/$/.test(ctx.path) && ctx.category && ctx.title) return { ...o, lead: `Serving ${ctx.title}?` };
    return o;
  }

  function pickRaw(ctx) {
    const hay = `${ctx.path} ${ctx.category || ""}`.toLowerCase();
    for (const [re, cands, lead] of OFFER_RULES) {
      if (!re.test(hay)) continue;
      for (const [i, c] of cands.entries()) {
        const o = asOffer(c, ctx);
        if (o) return { ...o, lead: i === 0 ? lead : DEFAULT_LEAD[c] || "Planning a board?" };
      }
    }
    return { ...asOffer("book:main", ctx), lead: "Planning a board?" };
  }

  // The second option under the main button.
  function alt(o, campaign) {
    if (o.type === "printable") {
      return `<a href="/printables/${esc(o.slug)}/">See what's inside</a> · Instant PDF · 30-day refund`;
    }
    const bundle = live.get("complete-board-builder-bundle");
    if (!o.paperbackUrl) return `<a href="/printables/">Or browse the printables from $3</a>`;
    return `<a href="${esc(o.paperbackUrl)}" target="_blank" rel="noopener">${o.altLabel ? `Prefer ${esc(o.altLabel)}? On Amazon · ${esc(o.paperbackPrice)}` : `Prefer paper? Paperback on Amazon · ${esc(o.paperbackPrice)}`}</a> · <a href="/printables/">Printables from $3</a>`;
  }

  function top(ctx, campaign) {
    const o = pick(ctx);
    const href = h.withTracking(o.url, campaign);
    const eyebrow = o.type === "printable" ? `Printable PDF · ${o.price} · instant download` : `Ebook · ${o.price} · instant PDF`;
    const img = thumb(o.image, "s");
    const page = o.type === "printable" ? `/printables/${o.slug}/` : o.page;
    return `<aside class="fx-top" aria-label="${esc(o.type === "printable" ? "Printable" : "Ebook")} for this page" data-offer="${esc(o.slug || o.key)}">
  <a class="fx-top-img" href="${esc(page)}" tabindex="-1" aria-hidden="true"><img src="${esc(img)}" alt="" width="96" height="96" loading="lazy" decoding="async"></a>
  <div class="fx-top-copy">
    <p class="fx-top-eyebrow">${esc(eyebrow)}</p>
    <p class="fx-top-title"><strong>${esc(o.lead)}</strong> ${esc(o.title)}</p>
    <p class="fx-top-hook">${esc(o.hook)}</p>
    <p class="fx-top-alt">${alt(o, campaign)}</p>
  </div>
  <a class="button primary fx-top-buy" href="${esc(href)}" target="_blank" rel="noopener">${o.type === "printable" ? `Get it · ${esc(o.price)}` : `Get the ebook · ${esc(o.price)}`}</a>
</aside>`;
  }

  // The email ask, high on the page (8 Oct 2026): right after the page's quick
  // answer, before the paid card. Compact, so the article still starts within
  // the first two phone screens.
  function emailHigh(campaign) {
    return `<aside class="fx-hi" aria-label="Free Charcuterie Cheat Sheet" id="cheat">
  <img class="fx-hi-img" src="${esc(thumb(CHEAT_IMG, "s"))}" alt="" width="64" height="83" loading="lazy" decoding="async">
  <div class="fx-hi-copy">
    <p class="fx-hi-eyebrow">Free printable</p>
    <p class="fx-hi-title">The Charcuterie Cheat Sheet</p>
    <p class="fx-hi-line">How much to buy for 4 to 50 guests, the build order and four pairing rules, on two pages. Plus the weekly Lab Report.</p>
  </div>
  ${bhForm("lead-hi", campaign)}
</aside>`;
  }

  // Where the email box and paid card go: after the quick answer.
  //   blog          after the "Quick Answer" blockquote at the top of the post
  //   ingredients,  before the 2nd H2 (after "The short version" / the top
  //   boards,       pairings / "What's on the board")
  //   pairings/food
  //   holidays, dietary (after its intro), other pairing pages: before the 1st H2
  // A section that opens with the H2 is kept whole. Hubs and the Party Planner
  // (its email form is already in its first section) keep the old layout.
  function anchorFor(path, html, mainAt) {
    const parts = path.split("/").filter(Boolean);
    if (parts.length < 2 || parts[0] === "party-planner") return -1;
    const h2s = [];
    for (let i = html.indexOf("<h2", mainAt); i >= 0 && h2s.length < 3; i = html.indexOf("<h2", i + 3)) h2s.push(i);
    const before = (i) => {
      if (i < 0) return -1;
      const sec = Math.max(html.lastIndexOf("<section", i), html.lastIndexOf("<div class=\"ing-section", i));
      if (sec > mainAt) {
        const open = html.indexOf(">", sec);
        if (open < i && html.slice(open + 1, i).trim() === "") return sec;
      }
      return i;
    };
    if (parts[0] === "blog") {
      const art = html.indexOf('<article class="post-body"', mainAt);
      const bq = art >= 0 ? html.indexOf("<blockquote", art) : -1;
      if (bq >= 0 && (h2s[0] === undefined || bq < h2s[0])) {
        const end = html.indexOf("</blockquote>", bq);
        if (end > 0) return end + "</blockquote>".length;
      }
      return before(h2s[0] ?? -1);
    }
    const second = ["ingredients", "boards"].includes(parts[0]) || (parts[0] === "pairings" && parts[1] === "food");
    if (second && h2s.length >= 2) return before(h2s[1]);
    return before(h2s[0] ?? -1);
  }

  function sticky(ctx, campaign, formId) {
    const o = pick(ctx);
    const label = o.type === "printable" ? o.title : o.boardN ? `Board #${o.boardN}, fully planned` : o.title;
    // Pages with an email form: the bar offers the free cheat sheet and jumps
    // to the form; it hides while any email form is on screen.
    const link = formId
      ? `<a href="#${esc(formId)}" data-fx-free><strong>Free cheat sheet: how much to buy</strong><span>Get it free</span></a>`
      : `<a href="${esc(h.withTracking(o.url, campaign))}" target="_blank" rel="noopener"><strong>${esc(label)}</strong><span>${o.type === "printable" ? "PDF" : "Ebook"} ${esc(o.price)}</span></a>`;
    return `<div class="fx-sticky" data-fx-sticky hidden>
    ${link}
    <button type="button" aria-label="Close" data-fx-close>&times;</button>
  </div>
  <script>(function(){var b=document.querySelector("[data-fx-sticky]");if(!b)return;var k="fx-sticky-closed";try{if(sessionStorage.getItem(k))return}catch(e){}var mq=window.matchMedia("(max-width: 760px)");var vis=new Set();if(window.IntersectionObserver&&b.querySelector("[data-fx-free]")){var io=new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?vis.add(e.target):vis.delete(e.target)});on()});document.querySelectorAll(".fx-bh-form").forEach(function(f){io.observe(f)})}function on(){var s=window.scrollY/(document.documentElement.scrollHeight-window.innerHeight||1);b.hidden=!(mq.matches&&s>0.2&&s<0.97&&!vis.size)}window.addEventListener("scroll",on,{passive:true});b.querySelector("[data-fx-close]").addEventListener("click",function(){b.remove();window.removeEventListener("scroll",on);try{sessionStorage.setItem(k,"1")}catch(e){}})})();</script>`;
  }

  // Put the matched offer into every built page. A page can choose its spot
  // with <!--offer-top-->; otherwise it goes right after the page's first
  // <header> inside <main>, or after the paragraph that follows the H1.
  async function inject(dist, ctxFor) {
    let n = 0;
    let hi = 0;
    const counts = {};
    async function walk(dir, rel) {
      for (const e of await readdir(dir, { withFileTypes: true })) {
        if (e.isDirectory()) {
          if (["assets", "images", "downloads"].includes(e.name) && !rel) continue;
          await walk(join(dir, e.name), `${rel}/${e.name}`);
        } else if (e.name === "index.html") {
          const path = `${rel}/`;
          if (SKIP.test(path)) continue;
          const file = join(dir, e.name);
          let html = await readFile(file, "utf8");
          if (/name="robots" content="noindex/.test(html)) continue;
          const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "").replace(/<[^>]+>/g, "").trim();
          const ctx = { path, title: h1, ...ctxFor(path) };
          const campaign = `top_${path.replace(/^\/|\/$/g, "").replace(/\//g, "_") || "home"}`;
          const card = top(ctx, campaign);
          const mainAt = html.indexOf("<main");
          let at = anchorFor(path, html, mainAt);
          if (at > mainAt) {
            // The page's own <!--offer-top--> spot is above the quick answer;
            // the email box and the card both move below the answer now.
            if (html.includes("<!--offer-top-->")) {
              const m = html.indexOf("<!--offer-top-->");
              html = html.replace("<!--offer-top-->", "");
              if (m < at) at -= "<!--offer-top-->".length;
            }
            const inCard = card.replace('<aside class="fx-top"', '<aside class="fx-top fx-in"');
            html = html.slice(0, at) + "\n" + emailHigh(`cheat_hi_${campaign.slice(4)}`) + "\n" + inCard + "\n" + html.slice(at);
            // One email box mid-article is enough: drop the old mid-post lead box.
            html = html.replace(/<aside class="fx-lead"[\s\S]*?<\/aside>\s*/, "");
            hi++;
          } else if (html.includes("<!--offer-top-->")) html = html.replace("<!--offer-top-->", card);
          else {
            const hdr = html.indexOf("</header>", mainAt);
            const h1At = html.indexOf("</h1>", mainAt);
            if (mainAt >= 0 && hdr > mainAt) html = html.slice(0, hdr + 9) + "\n" + card + html.slice(hdr + 9);
            else if (h1At > 0) {
              const p = html.indexOf("</p>", h1At);
              const at = p > 0 ? p + 4 : h1At + 5;
              html = html.slice(0, at) + "\n" + card + html.slice(at);
            } else continue;
          }
          // The mid-page printable card shows the same product as the top card.
          const chosen = pick(ctx);
          if (chosen.type === "printable" && h.printCard) {
            const mid = h.printCard(chosen.slug, `mid_${campaign.slice(4)}`);
            if (mid) html = html.replace(/<aside class="fx-print"[\s\S]*?<\/aside>/, mid);
          }
          // Phones: tables in the article stack into one card per row. Each cell
          // gets its column name as data-label (shown for 3+ columns).
          html = html.replace(/<div class="table-wrap"><table>([\s\S]*?)<\/table><\/div>/g, (all, inner) => {
            const heads = [...((inner.match(/<thead>([\s\S]*?)<\/thead>/) || [])[1] || "").matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").replace(/"/g, "&quot;").trim());
            if (heads.length < 2) return all;
            const body = inner.replace(/<tr>([\s\S]*?)<\/tr>/g, (row, cells) => {
              let k = 0;
              return `<tr>${cells.replace(/<(td|th)(\s[^>]*)?>/g, (t, tag, attrs = "") => (k < heads.length && !/data-label=/.test(attrs) ? `<${tag}${attrs} data-label="${heads[k++]}">` : (k++, t)))}</tr>`;
            });
            return `<div class="table-wrap t-stack${heads.length >= 3 ? " t-stack-labels" : ""}"><table>${body}</table></div>`;
          });
          html = foldFaq(html);
          // The 50-board list: photos become thumbnails beside each board on phones.
          if (path === "/blog/charcuterie-board-ideas/") html = html.replace('<article class="post-body">', '<article class="post-body ideas-list">');
          // One sticky bar per page, always the matched offer.
          html = html.replace(/<div class="fx-sticky"[\s\S]*?<\/script>/, "");
          const formId = (html.match(/class="fx-bh-form" id="([^"]+)"/) || [])[1];
          html = html.replace(/<\/main>/, `${sticky(ctx, `sticky_${campaign.slice(4)}`, formId && (html.includes('id="lead-hi"') ? "cheat" : formId))}\n</main>`);
          await writeFile(file, html);
          n++;
          const key = (card.match(/data-offer="([^"]*)"/) || [])[1] || "?";
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }
    await walk(dist, "");
    return { n, hi, counts };
  }

  return { pick, top, sticky, inject, live };
}
