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

const MEAT = /salami|pepperoni|soppressata|saucisson|prosciutto|coppa|capicola|bresaola|chorizo|nduja|mortadella|finocchiona|speck|pancetta|cured-meat|best-meats|meat-lover|jamon|lomo|fuet|culatello|guanciale|summer-sausage|rosette|landjager|cured meat/;
const CHEESE = /cheese|brie|cheddar|gouda|manchego|parmesan|parmigiano|gorgonzola|stilton|chevre|feta|gruyere|camembert|comte|taleggio|burrata|mozzarella|stracciatella|havarti|roquefort|boursin|halloumi|ricotta|mascarpone|epoisses|fontina|pecorino|asiago|raclette|reblochon|mimolette|jarlsberg|emmental|provolone|blue-cheese|bleu|triple-creme|mahon|idiazabal|morbier|muenster|edam|cotija|labneh|grana/;
const WINE = /wine|champagne|prosecco|pinot|cabernet|chardonnay|riesling|merlot|malbec|wine\/rose|sangiovese|chianti|beaujolais|sauvignon|sommelier|pairings\/drinks|pairings\/beer|pairings\/cocktails|beer|cider|ipa|stout|lager|mocktail|zero-proof/;

// Rules are tested against the page path (plus the ingredient category).
// [test, candidates in order, lead line for the first candidate]. The first
// candidate with a live product wins; a fallback uses its own default lead.
export const OFFER_RULES = [
  [/around-the-world|bavarian|german|korean|thai|indian|moroccan|portuguese|turkish|peruvian|vietnamese|brazilian|argentine|caribbean|dim-sum|swiss-alpine|ploughman|eastern-european/, ["book:world"], "Love a world board?"],
  [/baby-shower/, ["baby-shower-board-kit", "book:board", "classic-entertaining-board-blueprint"], "Hosting a baby shower?"],
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
  [/types-of-salami|\/pepperoni\/|best-salami|best-pepperoni|genoa-salami|calabrese|finocchiona|salami/, ["salami-tasting-party-kit", "cured-meat-field-guide"], "Love salami?"],
  [/boquerones|sobrasada|tapas|spanish|chorizo|manchego|membrillo|jamon|serrano|iberico|marcona|piquillo|mahon|idiazabal|lomo|fuet|salchichon/, ["spanish-tapas-board-kit", "book:board"], "Going Spanish?"],
  [/labneh|halloumi|mezze|hummus|za-atar|tzatziki|baba-ganoush|muhammara|dukkah|harissa|feta/, ["mezze-board-plan"], "Building a mezze board?"],
  [/brie|camembert|boursin|triple-creme|humboldt|taleggio|cambozola|soft-cheese|fromager/, ["soft-cheese-field-guide", "cheese-board-field-guide"], "Serving soft cheese?"],
  [/-pairing\/|pairing-by-contrast|salt-sweet|acid-rule|texture-contrast|umami/, ["pairing-card-deck", "wine-cheese-pairing-guide"], "Pairing by hand?"],
  [/build-sequence|rosemary|thyme|garnish|presentation|layout|arrange|salami-river|prosciutto-rose|board-photography|color-and-flavor|edible-flowers|fresh-basil|fresh-mint|board-shapes/, ["board-styling-playbook", "classic-entertaining-board-blueprint"], "Want it to look styled?"],
  [/expensive|budget|cheap|dollar|luxury|splurge|best-charcuterie-brands/, ["spend-smart-board-plan", "book:board"], "Spending smart?"],
  [/grazing|large-group|crowd|wedding|for-(20|25|30|40|50|100)-people|charcuterie-cups/, ["grazing-table-planner", "complete-board-builder-bundle"], "Feeding a crowd?"],
  [/date-night|for-two|board-two|valentine|anniversary|galentine|romantic/, ["book:two", "book:board", "complete-board-builder-bundle"], "Planning a night for two?"],
  [/keto|low-carb|carnivore|diabetes/, ["book:keto", "book:board", "complete-board-builder-bundle"], "Keeping it keto?"],
  [WINE, ["wine-cheese-pairing-guide"], "Pouring wine?"],
  [MEAT, ["cured-meat-field-guide", "complete-board-builder-bundle"], "Building around cured meats?"],
  [CHEESE, ["cheese-board-field-guide", "cheese-pairing-science-card"], "Choosing cheeses?"],
  [/thanksgiving|friendsgiving|christmas|holiday|new-years|valentine|st-patrick|easter|halloween|super-bowl|game-day|hanukkah|birthday|graduation|office|cocktail|date-night|board-two|for-two|book-club|movie|camping|picnic|beach|summer|fall-|winter|budget|25-dollar|luxury|expensive|keto|kid|\/boards\//, ["book:board", "complete-board-builder-bundle"], "Want the full plan?"],
  [/how-to|beginner|easy|what-goes-on|presentation|how-much|per-person|quantit|serving|party-planner|board-builder|ideas|appetizer|build-sequence|bread|cracker|shapes|sizes|mistakes|layout|arrange/, ["classic-entertaining-board-blueprint", "complete-board-builder-bundle"], "Building your first board?"],
  [/./, ["complete-board-builder-bundle", "book:main"], "Planning a board?"]
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
      const bk = books.main;
      return `Or all 50 boards: <a href="${esc(h.withTracking(bk.url, `${campaign}_alt`))}" target="_blank" rel="noopener">ebook ${esc(bk.price)}</a> · <a href="${esc(bk.paperbackUrl)}" target="_blank" rel="noopener">paperback on Amazon</a>`;
    }
    const bundle = live.get("complete-board-builder-bundle");
    if (!o.paperbackUrl) return `<a href="/printables/">Or browse the printables from $4</a>`;
    return `<a href="${esc(o.paperbackUrl)}" target="_blank" rel="noopener">${o.altLabel ? `Prefer ${esc(o.altLabel)}? On Amazon · ${esc(o.paperbackPrice)}` : `Prefer paper? Paperback on Amazon · ${esc(o.paperbackPrice)}`}</a>${bundle ? ` · <a href="/printables/">Printables from $4</a>` : ""}`;
  }

  function top(ctx, campaign) {
    const o = pick(ctx);
    const href = h.withTracking(o.url, campaign);
    const eyebrow = o.type === "printable" ? `Printable PDF · ${o.price} · instant download` : `Ebook · ${o.price} · instant PDF`;
    const img = thumb(o.image, "s");
    const page = o.type === "printable" ? `/printables/${o.slug}/` : o.page;
    return `<aside class="fx-top" aria-label="${esc(o.type === "printable" ? "Printable" : "Ebook")} for this page" data-offer="${esc(o.slug || o.key)}">
  <a class="fx-top-img" href="${esc(page)}"><img src="${esc(img)}" alt="" width="96" height="96" loading="lazy" decoding="async"></a>
  <div class="fx-top-copy">
    <p class="fx-top-eyebrow">${esc(eyebrow)}</p>
    <p class="fx-top-title"><strong>${esc(o.lead)}</strong> ${esc(o.title)}</p>
    <p class="fx-top-hook">${esc(o.hook)}</p>
    <p class="fx-top-alt">${alt(o, campaign)}</p>
  </div>
  <a class="button primary fx-top-buy" href="${esc(href)}" target="_blank" rel="noopener">${o.type === "printable" ? `Get it · ${esc(o.price)}` : `Get the ebook · ${esc(o.price)}`}</a>
</aside>`;
  }

  function sticky(ctx, campaign) {
    const o = pick(ctx);
    const label = o.type === "printable" ? o.title : o.boardN ? `Board #${o.boardN}, fully planned` : o.title;
    return `<div class="fx-sticky" data-fx-sticky hidden>
    <a href="${esc(h.withTracking(o.url, campaign))}" target="_blank" rel="noopener"><strong>${esc(label)}</strong><span>${o.type === "printable" ? "PDF" : "Ebook"} ${esc(o.price)}</span></a>
    <button type="button" aria-label="Close" data-fx-close>&times;</button>
  </div>
  <script>(function(){var b=document.querySelector("[data-fx-sticky]");if(!b)return;var k="fx-sticky-closed";try{if(sessionStorage.getItem(k))return}catch(e){}var mq=window.matchMedia("(max-width: 760px)");function on(){var s=window.scrollY/(document.documentElement.scrollHeight-window.innerHeight||1);b.hidden=!(mq.matches&&s>0.2&&s<0.97)}window.addEventListener("scroll",on,{passive:true});b.querySelector("[data-fx-close]").addEventListener("click",function(){b.remove();window.removeEventListener("scroll",on);try{sessionStorage.setItem(k,"1")}catch(e){}})})();</script>`;
  }

  // Put the matched offer into every built page. A page can choose its spot
  // with <!--offer-top-->; otherwise it goes right after the page's first
  // <header> inside <main>, or after the paragraph that follows the H1.
  async function inject(dist, ctxFor) {
    let n = 0;
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
          if (html.includes("<!--offer-top-->")) html = html.replace("<!--offer-top-->", card);
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
          // One sticky bar per page, always the matched offer.
          html = html.replace(/<div class="fx-sticky"[\s\S]*?<\/script>/, "");
          html = html.replace(/<\/main>/, `${sticky(ctx, `sticky_${campaign.slice(4)}`)}\n</main>`);
          await writeFile(file, html);
          n++;
          const key = (card.match(/data-offer="([^"]*)"/) || [])[1] || "?";
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }
    await walk(dist, "");
    return { n, counts };
  }

  return { pick, top, sticky, inject, live };
}
