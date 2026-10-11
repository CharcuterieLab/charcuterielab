// Gift guide section (11 Oct 2026). Plan: claude/gift-guide-plan-2026-10-11.md
//   /gifts/                         hub: top pick, book matcher, gift sets, guides
//   /gifts/charcuterie-books/       best charcuterie books to give
//   /gifts/under-25/                charcuterie gifts under $25
//   /gifts/hostess-gifts/           hostess gifts for the board-loving host
//   /gifts/cheese-lovers/           gifts for cheese lovers
//
// Sales rule for this section only: the PAPERBACK is the main button and the
// ebook is the secondary "instant digital gift". A gift buyer wants something
// to wrap. Books without a live paperback fall back to the ebook button and
// switch automatically once paperbackUrl is filled in boards.mjs.
//
// Third-party products link to an Amazon search (no invented ASINs). When an
// Associates account exists, set AMAZON_TAG and every Amazon link, including
// our own paperbacks, carries it.
//
// Prices for other people's products are typical ranges, not live prices.
// Recheck them in mid-November (PRICES_CHECKED below).

export const AMAZON_TAG = "";
const PRICES_CHECKED = "October 2026";

export const GIFT_PATHS = ["/gifts/", "/gifts/charcuterie-books/", "/gifts/under-25/", "/gifts/hostess-gifts/", "/gifts/cheese-lovers/"];

// Seasonal: "Gifts" sits in the top menu from Nov 1 to Dec 25 (build date).
export function giftsInNav(d = new Date()) {
  const m = d.getMonth(), day = d.getDate();
  return m === 10 || (m === 11 && day <= 25);
}

const amz = (u) => (AMAZON_TAG && /amazon\.com/.test(u) ? `${u}${u.includes("?") ? "&" : "?"}tag=${AMAZON_TAG}` : u);
const search = (q) => amz(`https://www.amazon.com/s?k=${encodeURIComponent(q)}`);

// ---------------------------------------------------------------- products
// Reusable third-party picks. price = typical range in USD.
const ITEMS = {
  knives3: { name: "A 3-piece cheese knife set", price: [12, 20], q: "3 piece cheese knife set", note: "One soft-cheese knife, one spreader, one pointed knife for hard cheese. That covers every cheese on a board." },
  boska: { name: "Boska Monaco+ cheese knife set", price: [30, 45], q: "Boska Monaco cheese knife set", note: "Dutch cheese-tool maker Boska's best-known set, with stainless blades shaped for soft, semi-hard and hard cheese." },
  plane: { name: "A Norwegian cheese plane", price: [10, 18], q: "cheese plane slicer", note: "Shaves paper-thin slices of Gouda, Jarlsberg or Gruyère. Cheap, useful every day, and most people don't own one." },
  figSpread: { name: "Dalmatia Original Fig Spread", price: [6, 9], q: "Dalmatia fig spread", note: "Our top-ranked fig jam: thick, seedy and not too sweet.", guide: ["Best fig jam, ranked", "/blog/best-fig-jam/"] },
  hotHoney: { name: "A jar of hot honey", price: [9, 13], q: "hot honey", note: "Chili-infused honey for salami, pizza, fried chicken and sharp cheddar.", guide: ["Best hot honey, ranked", "/blog/best-hot-honey/"] },
  honeycomb: { name: "A boxed honeycomb", price: [12, 20], q: "honeycomb comb honey", note: "The single prettiest thing you can put on a board. Pairs with blue cheese and aged cheddar.", guide: ["Best honey for cheese", "/blog/best-honey-for-cheese/"] },
  marcona: { name: "Marcona almonds", price: [8, 14], q: "marcona almonds", note: "Spain's rounder, softer, butterier almond, fried in olive oil and salted.", guide: ["Best Marcona almonds", "/blog/best-marcona-almonds/"] },
  mustard: { name: "A whole-grain mustard", price: [5, 9], q: "whole grain mustard", note: "The condiment hosts forget. It's what makes salami and cheddar taste finished.", guide: ["Best mustard for charcuterie", "/blog/best-mustard-for-charcuterie/"] },
  markers: { name: "Slate cheese markers with a chalk pen", price: [8, 14], q: "slate cheese markers chalk", note: "Little slate flags to label each cheese, so guests stop asking what everything is." },
  picks: { name: "Bamboo cocktail picks", price: [6, 10], q: "bamboo cocktail picks", note: "For olives, salami folds and cheese cubes. A host runs out of these at every party." },
  ramekins: { name: "A set of small dip bowls", price: [14, 22], q: "small ramekins dip bowls set", note: "Jam, mustard, olives and nuts need small bowls, and most kitchens have two at most." },
  storage: { name: "Formaticum cheese storage bags", price: [14, 18], q: "Formaticum cheese storage bags", note: "Two-ply cheese paper bags that let cheese breathe without drying out. Cheese shops use the same paper.", guide: ["How to store cheese", "/blog/cheese-storage/"] },
  acacia: { name: "An acacia wood serving board", price: [20, 35], q: "acacia wood charcuterie board", note: "Dense, affordable hardwood with a warm grain. Look for 16 inches or longer.", guide: ["Wood vs slate vs marble", "/blog/best-charcuterie-boards/"] },
  slate: { name: "A slate cheese board with chalk", price: [20, 30], q: "slate cheese board with chalk", note: "Black slate makes every cheese and meat stand out, and you can write the names right on it.", guide: ["Wood vs slate vs marble", "/blog/best-charcuterie-boards/"] },
  dome: { name: "A glass cheese dome", price: [25, 45], q: "glass cheese dome with board", note: "Keeps a cut wedge covered on the counter while it comes to room temperature." },
  club: { name: "A cheese-of-the-month club", price: null, tier: "$$$$", q: "cheese of the month club gift", note: "Murray's Cheese and several other shops ship a monthly box of cheeses picked by a cheesemonger. Check each club's plans for current prices." },
  kit: { name: "A beginner mozzarella and ricotta kit", price: [25, 40], q: "mozzarella cheese making kit", note: "Fresh mozzarella in about an hour from a gallon of milk. A fun first step for a cheese lover who cooks." }
};

// Other authors' books (no affiliation). Honest one-liners.
const OTHER_BOOKS = {
  mullen: { name: "That Cheese Plate Will Change Your Life", by: "Marissa Mullen", price: [20, 28], q: "That Cheese Plate Will Change Your Life Marissa Mullen", note: "A colourful, step-by-step styling book built on Mullen's \"Cheese by Numbers\" method. Great for someone who loves how boards look." },
  balslev: { name: "Little Book of Charcuterie and Cheese", by: "Lynda Balslev", price: [10, 16], q: "Little Book of Charcuterie and Cheese Balslev", note: "A small hardback with pairing basics and simple board ideas. Fits in a stocking." },
  ruhlman: { name: "Charcuterie: The Craft of Salting, Smoking, and Curing", by: "Michael Ruhlman and Brian Polcyn", price: [22, 35], q: "Charcuterie Craft of Salting Smoking Curing Ruhlman", note: "The classic on making your own bacon, sausage and cured meats. For the person who wants to cure, not just serve." }
};

// ---------------------------------------------------------------- guides
// pick: { book: key, best, why } | { item: key, best, why? } | { other: key, best }
const GUIDES = [
  {
    slug: "charcuterie-books",
    card: "The best charcuterie books to give",
    cardLine: "9 books, from a $10 stocking stuffer to the full reference",
    image: "/images/book-3d-mockup.webp",
    seoTitle: "Best Charcuterie Books to Give as a Gift (2026)",
    h1: "The best charcuterie books to give as a gift",
    kicker: "Gift guide · Books",
    description: "The best charcuterie and cheese board books to give in 2026, matched to the person: the host, the beginner, the adventurous eater, the vegan, the keto friend and the cheese nerd.",
    quick: "For most people, give <strong>50 Boards, Built by Science</strong> (paperback $25.99): 50 complete boards, each with a shopping list, amounts and a build order. For an adventurous eater, <strong>Around the World in 16 Boards</strong> ($16.99). For someone who wants to cure their own meat, Ruhlman and Polcyn's <em>Charcuterie</em>.",
    intro: "A board book is a gift that keeps paying off: the person gets the book, and you get invited to the boards. The best ones tell the reader exactly what to buy and how much, not just what a board looks like in a photo. We wrote six of the books below, and we've put them where they genuinely fit. The other three are the outside books we'd point a friend to.",
    method: "We wrote the Charcuterie Lab books, so take our ranking of them with that in mind. The other books are researched picks; we have no connection to their authors or publishers.",
    picks: [
      { book: "main", best: "Best overall · the host or the beginner", why: "Fifty complete boards for every occasion, from a $25 budget board to a 30-person showstopper. Every board has the shopping list with amounts, the order to build it and a swap for every ingredient, so the person can make a board the night they open it." },
      { book: "world", best: "Best for the adventurous eater", why: "Sixteen international boards, from a Bavarian beer-hall spread to a Korean BBQ board, each with a shopping list and a prep countdown. Under $17, which makes it the easiest add-on to a bottle of wine." },
      { book: "guide", best: "Best for the cheese nerd", why: "325 ingredients in one book: what each tastes like, what it pairs with and why, and how much to buy. The reference a serious board builder reaches for before a party." },
      { book: "plant", best: "Best for the vegan or vegetarian", why: "Fifteen boards with no meat and no dairy that still look like a full charcuterie spread, with the pairing science behind each one." },
      { book: "keto", best: "Best for the keto friend", why: "Twenty boards at 4 to 9 g net carbs per serving, with full macros from USDA data. Good timing for someone starting a January diet." },
      { book: "two", best: "Best for a couple", why: "Twenty-five boards sized for two, from a first date to New Year's Eve, each with a drink to pour. Lands well as a Valentine's gift too." },
      { other: "mullen", best: "Best for styling" },
      { other: "ruhlman", best: "Best for curing your own meat" },
      { other: "balslev", best: "Best stocking stuffer" }
    ],
    set: "starter",
    faq: [
      ["What is the best charcuterie book for a beginner?", "Pick a book that gives exact shopping lists and amounts, not just photos. 50 Boards, Built by Science gives every board a shopping list with quantities, a build order and swaps, which is what a beginner needs to make a first board without guessing."],
      ["Is a charcuterie book a good gift?", "Yes, for anyone who hosts, loves cheese or keeps saving board photos. Pair it with one small item, like a cheese knife set or a jar of fig spread, so they can start the first board right away."],
      ["Paperback or ebook as a gift?", "The paperback, if it can arrive in time: it wraps, it lies open on the counter, and it feels like a present. The ebook is the instant option when you're out of time, since the download link arrives by email in minutes."],
      ["What book should I get someone who wants to make their own salami?", "Charcuterie: The Craft of Salting, Smoking, and Curing by Michael Ruhlman and Brian Polcyn. It covers curing, smoking and sausage-making at home. Board books like ours are about buying and serving, not curing."],
      ["Do you have a charcuterie book for vegans?", "Yes: 15 Show-Stopping Plant-Based Boards has fifteen boards with no meat and no dairy, each with a shopping list and a step-by-step build."]
    ],
    related: [["Gifts for cheese lovers", "/gifts/cheese-lovers/"], ["Charcuterie gifts under $25", "/gifts/under-25/"], ["All our books", "/books/"]]
  },
  {
    slug: "under-25",
    card: "Charcuterie gifts under $25",
    cardLine: "11 gifts that look like you spent more",
    image: "/images/charcuterie-gift-box-25.jpg",
    seoTitle: "Charcuterie Gifts Under $25: 11 Ideas for Board Lovers",
    h1: "Charcuterie gifts under $25 that look like you spent more",
    kicker: "Gift guide · Under $25",
    description: "11 charcuterie and cheese gifts under $25: a board book, cheese knives, fig spread, hot honey, honeycomb, Marcona almonds, slate markers and more, with what each is for.",
    quick: "The best charcuterie gift under $25 is <strong>Around the World in 16 Boards</strong> (paperback $16.99) with a jar of <strong>Dalmatia fig spread</strong>, about $25 together. Other strong picks: a 3-piece cheese knife set, a boxed honeycomb, Marcona almonds and slate cheese markers.",
    intro: "Under $25, the trick is to give one useful thing and one edible thing. A board lover will use a good knife set or a book for years, and a jar of something special gets opened at the next party. Here's what we'd give at this price, and what each piece is actually for.",
    method: "Prices are typical ranges for each kind of product, checked " + PRICES_CHECKED + ". They move around in November, so check the price at checkout. We have no paid relationship with any brand below.",
    picks: [
      { book: "world", best: "Best overall under $25", why: "Sixteen international boards with shopping lists and prep countdowns. At $16.99 it leaves room for a jar of fig spread and still comes in around $25." },
      { book: "plant", best: "Best for a vegan friend", why: "Fifteen boards with no meat and no dairy, each with a shopping list. A thoughtful gift for the friend who usually gets left out of the cheese board." },
      { item: "knives3", best: "Best tool" },
      { item: "honeycomb", best: "Best wow factor" },
      { item: "figSpread", best: "Best add-on under $10" },
      { item: "hotHoney", best: "Best for spice lovers" },
      { item: "marcona", best: "Best edible stocking stuffer" },
      { item: "markers", best: "Best for the party host" },
      { item: "storage", best: "Best for cheese lovers" },
      { item: "plane", best: "Best everyday tool" },
      { other: "balslev", best: "Best small book" }
    ],
    stretch: "Worth stretching a dollar: <a href=\"/ebook/\">50 Boards, Built by Science</a> is $25.99 in paperback, with 50 complete boards.",
    set: "starter",
    faq: [
      ["What is a good charcuterie gift under $25?", "A board book like Around the World in 16 Boards ($16.99) plus a jar of fig spread, or a 3-piece cheese knife set with a box of Marcona almonds. One useful thing plus one edible thing works best at this price."],
      ["What can I put in a small charcuterie gift basket?", "A whole dry salami, crackers, a jar of fig spread, a small bag of nuts and one cheese added right before you hand it over. Everything except the cheese is shelf-stable. Our DIY gift basket guide has full $25, $50 and $100 lists."],
      ["Is honeycomb a good gift?", "Yes. It looks special, keeps for months in the pantry, and it's the easiest way to make a board look expensive. It pairs best with blue cheese and aged cheddar."],
      ["What should I get a cheese lover for under $25?", "Formaticum cheese storage bags, a Norwegian cheese plane or a 3-piece cheese knife set. All three get used constantly and most cheese lovers don't own them."],
      ["Can I give an ebook as a gift?", "Yes. Buy the PDF and forward the download email, or print our free gift card and write the book's name on it. It's the best option if you've missed the shipping deadline."]
    ],
    related: [["DIY charcuterie gift basket ($25, $50, $100)", "/blog/charcuterie-gift-basket/"], ["Hostess gifts", "/gifts/hostess-gifts/"], ["Best charcuterie books", "/gifts/charcuterie-books/"]]
  },
  {
    slug: "hostess-gifts",
    card: "Hostess gifts for a board-loving host",
    cardLine: "10 gifts that won't give the host a job",
    image: "/images/charcuterie-gift-basket.jpg",
    seoTitle: "Hostess Gifts for Foodies: 10 Charcuterie Ideas",
    h1: "Hostess gifts for foodies: 10 charcuterie ideas the host will actually use",
    kicker: "Gift guide · Hostess gifts",
    description: "10 hostess gifts for a host who loves charcuterie: a board book with fig jam, honeycomb, Marcona almonds, a condiment trio, cheese knives and more. Plus what not to bring.",
    quick: "The best hostess gift for a foodie is something they can enjoy <strong>after</strong> the party: <strong>50 Boards, Built by Science</strong> (paperback $25.99) tied up with a jar of fig spread, about $33. Under $20: a boxed honeycomb, Marcona almonds or a trio of fig spread, hot honey and whole-grain mustard.",
    intro: "The rule for hostess gifts is simple: don't give the host a job. Flowers need a vase, and a dish you expect to see served changes their menu. The best gifts keep. A book, a jar of something good or a tool for their next board can all be set aside tonight and enjoyed next week.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below.",
    picks: [
      { book: "main", best: "Best overall", why: "Fifty complete boards for the next party they throw. Tie a jar of fig spread to it with ribbon and you have a $33 gift that looks planned." },
      { item: "honeycomb", best: "Best under $20" },
      { item: "marcona", best: "Best edible gift" },
      { item: "figSpread", best: "Best jar, part 1", why: "Start a condiment trio with the jar every board needs. Our top-ranked fig jam." },
      { item: "hotHoney", best: "Best jar, part 2" },
      { item: "mustard", best: "Best jar, part 3" },
      { item: "knives3", best: "Best tool" },
      { item: "acacia", best: "Best splurge" },
      { book: "world", best: "Best for a host who travels", why: "Sixteen international boards, from Spain to Korea. Under $17, and a natural pairing with a bottle from the same country." },
      { item: "picks", best: "Best tiny add-on" }
    ],
    extra: {
      title: "What not to bring",
      body: "<ul><li><strong>Cut flowers without a vase.</strong> The host has to stop greeting guests to find one.</li><li><strong>A dish you expect to be served.</strong> Bring food only if the host asked for it.</li><li><strong>Soft cheese that needs the fridge.</strong> Brie and burrata need cold storage the host may not have room for. Honey, nuts and jars keep on the counter.</li></ul>"
    },
    set: "host",
    faq: [
      ["What is a good hostess gift for someone who loves charcuterie?", "Something they can enjoy after the party: a board book with a jar of fig spread, a boxed honeycomb, Marcona almonds or a trio of condiments. Avoid anything that needs a vase, the fridge or a place on tonight's menu."],
      ["How much should I spend on a hostess gift?", "Most people spend $15 to $30. A jar trio or honeycomb sits around $20, and a board book with a jar of jam is about $30 to $35."],
      ["Should I bring a charcuterie board as a hostess gift?", "Only if the host asked you to bring food. Otherwise a ready-made board competes with their menu. Bring the makings of a future board instead: a book, a jar of jam or a knife set."],
      ["What jars make a good charcuterie gift set?", "Fig spread, hot honey and a whole-grain mustard. Together they cover sweet, spicy and sharp, which is what most boards are missing."],
      ["Is a book a good hostess gift?", "Yes, if it fits the person. A host who loves boards gets a full year of party ideas from a board book, and it costs about the same as a bottle of wine."]
    ],
    related: [["Charcuterie gifts under $25", "/gifts/under-25/"], ["DIY charcuterie gift basket", "/blog/charcuterie-gift-basket/"], ["How much charcuterie per person", "/party-planner/"]]
  },
  {
    slug: "cheese-lovers",
    card: "Gifts for cheese lovers",
    cardLine: "12 gifts, from a $10 cheese plane to a monthly club",
    image: "/images/50-boards-06-holiday-entertaining.webp",
    seoTitle: "Gifts for Cheese Lovers: 12 Ideas They'll Use (2026)",
    h1: "Gifts for cheese lovers: 12 ideas they'll actually use",
    kicker: "Gift guide · Cheese lovers",
    description: "12 gifts for cheese lovers in 2026: the Ingredient Guide, a Boska knife set, cheese storage bags, a cheese plane, a slate board, a cheese-of-the-month club and more.",
    quick: "For a cheese lover, give something that makes their cheese better: <strong>Formaticum storage bags</strong> ($14 to $18) or a <strong>Boska knife set</strong> ($30 to $45). For the cheese nerd, <strong>The Ingredient Guide</strong> covers 76 cheeses and 249 other board ingredients, and <strong>50 Boards, Built by Science</strong> ($25.99) turns their cheese into full boards.",
    intro: "Cheese lovers usually own a board and a knife. What they don't have is the stuff that makes cheese last longer, taste better and look better: proper storage paper, the right blade for each texture, a way to label a board. Here's what we'd give, from small to splurge.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books.",
    picks: [
      { book: "guide", best: "Best for the cheese nerd", why: "76 cheeses and 249 other board ingredients in one book: how each tastes, what pairs with it and why, and how much to buy per person." },
      { book: "main", best: "Best for turning cheese into boards", why: "Fifty complete boards, including an all-cheese connoisseur board and a wine and cheese pairing board, each with a shopping list and build order." },
      { item: "storage", best: "Best small gift" },
      { item: "boska", best: "Best knife set" },
      { item: "plane", best: "Best under $20" },
      { item: "slate", best: "Best board" },
      { item: "markers", best: "Best add-on" },
      { item: "dome", best: "Best for the counter" },
      { item: "honeycomb", best: "Best edible pairing" },
      { other: "mullen", best: "Best styling book" },
      { item: "kit", best: "Best hands-on gift" },
      { item: "club", best: "Best splurge" }
    ],
    set: "cheese",
    faq: [
      ["What do you get someone who loves cheese?", "Something that makes their cheese better: cheese storage paper or bags, a knife set with a blade for each texture, a cheese plane, a slate board with chalk markers, or a cheese-of-the-month club."],
      ["What is the best cheese storage for a gift?", "Two-ply cheese paper or bags, like Formaticum's. They let the cheese breathe while holding in moisture, so a wedge lasts longer than in plastic wrap."],
      ["Which cheese knives are worth buying?", "A set with three shapes: a holed or thin blade for soft cheese, a spreader, and a pointed knife for hard cheese. Boska's Monaco+ set is a well-known option."],
      ["Is a cheese-of-the-month club a good gift?", "Yes, for a serious cheese lover. It arrives every month and introduces cheeses they wouldn't pick themselves. Check how many months the gift covers and whether it ships to their state."],
      ["What book should I buy a cheese lover?", "The Ingredient Guide for the reference side (what each cheese tastes like and pairs with), or That Cheese Plate Will Change Your Life for styling. 50 Boards, Built by Science if they host."]
    ],
    related: [["Best charcuterie books", "/gifts/charcuterie-books/"], ["How to store cheese", "/blog/cheese-storage/"], ["Cheese ingredient library", "/ingredients/"]]
  }
];

// Ready-made gift sets, each anchored by a paperback.
const SETS = {
  starter: { name: "The starter gift", book: "world", items: ["knives3", "figSpread"], line: "A first set of tools, a jar for the first board and sixteen boards to make with them." },
  host: { name: "The host gift", book: "main", items: ["acacia", "figSpread", "hotHoney"], line: "A board, two jars and fifty boards to put on it." },
  cheese: { name: "The cheese lover's gift", book: "main", book2: "world", items: ["slate", "knives3"], line: "Two books, a slate board and the knives to serve from it." }
};

// ---------------------------------------------------------------- render
export function giftPages(h, books) {
  const esc = h.escapeHtml;
  const T = (u, c) => h.withTracking(u, c);
  const B = books; // key -> { title, short, path, cover, ebookUrl, ebookPrice, paperbackUrl, paperbackPrice, who }
  const num = (p) => Number(String(p).replace(/[^0-9.]/g, ""));
  const range = (r) => (r ? `$${r[0]}–${r[1]}` : "");

  function bookButtons(b, campaign, compact = false) {
    const paper = b.paperbackUrl
      ? `<a class="button primary gf-btn-print" href="${esc(amz(b.paperbackUrl))}" target="_blank" rel="noopener">Paperback · ${esc(b.paperbackPrice)}</a>`
      : "";
    const ebook = `<a class="button${b.paperbackUrl ? " gf-btn-ebook" : " primary"}" href="${esc(T(b.ebookUrl, campaign))}" target="_blank" rel="noopener">${b.paperbackUrl ? "Instant ebook" : "Ebook"} · ${esc(b.ebookPrice)}</a>`;
    const soon = !b.paperbackUrl && !compact ? `<span class="gf-soon">Paperback coming soon</span>` : "";
    return `<div class="gf-buy">${paper}${ebook}${soon}</div>`;
  }

  // Shipping strip: date logic runs in the browser so it changes without a rebuild.
  const shipStrip = `<p class="gf-ship" data-gf-ship>Giving a paperback? Amazon shows the delivery date at checkout. For Christmas, aim to order by mid-December.</p>
  <script>(function(){try{var e=document.querySelector("[data-gf-ship]");if(!e)return;var d=new Date(),m=d.getMonth(),n=d.getDate();if(m===11&&n>=26){e.hidden=true;return}if(m===11&&n>=18){e.classList.add("gf-ship-late");e.innerHTML='Too late to ship a paperback? Give the ebook instead: buy it, then forward the download email or print our <a href="/gifts/#gift-card">free gift card</a>.'}}catch(x){}})();</script>`;

  function matcher(campaign, compact = false) {
    const order = ["main", "world", "guide", "plant", "keto", "two"].filter((k) => B[k]);
    if (compact) {
      return `<section class="gf-matcher gf-matcher-compact" aria-labelledby="gf-m-h-${campaign}">
    <h2 id="gf-m-h-${campaign}">Which Charcuterie Lab book for which person?</h2>
    <div class="gf-mini">${order.map((k) => { const b = B[k]; return `<a href="${b.path}"><img src="${esc(h.thumb(b.cover, "s"))}" alt="" width="96" height="125" loading="lazy" decoding="async"><span class="gf-mini-who">${esc(b.who)}</span><strong>${esc(b.short)}</strong></a>`; }).join("")}</div>
  </section>`;
    }
    return `<section class="gf-matcher" id="matcher" aria-labelledby="gf-m-h">
    <p class="section-kicker">Match the book to the person</p>
    <h2 id="gf-m-h">Which Charcuterie Lab book should you give?</h2>
    <div class="gf-match-grid">${order.map((k) => { const b = B[k]; return `<article class="gf-match">
      <p class="gf-who">${esc(b.who)}</p>
      <a class="gf-match-cover" href="${b.path}"><img src="${esc(h.thumb(b.cover, "m"))}" alt="${esc(b.short)} cover" width="200" height="262" loading="lazy" decoding="async"></a>
      <h3><a href="${b.path}">${esc(b.short)}</a></h3>
      <p>${esc(b.line)}</p>
      ${bookButtons(b, `${campaign}_${k}`)}
    </article>`; }).join("\n    ")}</div>
  </section>`;
  }

  function setCard(key, campaign) {
    const s = SETS[key];
    const bks = [B[s.book], s.book2 ? B[s.book2] : null].filter(Boolean);
    const its = s.items.map((i) => ITEMS[i]);
    const bookPrice = (b) => num(b.paperbackUrl ? b.paperbackPrice : b.ebookPrice);
    const lo = Math.round(bks.reduce((a, b) => a + bookPrice(b), 0) + its.reduce((a, i) => a + i.price[0], 0));
    const hi = Math.round(bks.reduce((a, b) => a + bookPrice(b), 0) + its.reduce((a, i) => a + i.price[1], 0));
    return `<article class="gf-set">
      <p class="gf-set-price">About $${lo}–${hi}</p>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.line)}</p>
      <ul>
        ${bks.map((b) => `<li><a href="${esc(b.paperbackUrl ? amz(b.paperbackUrl) : T(b.ebookUrl, campaign))}" target="_blank" rel="noopener"><strong>${esc(b.short)}</strong></a>, ${b.paperbackUrl ? "paperback" : "ebook"} ${esc(b.paperbackUrl ? b.paperbackPrice : b.ebookPrice)}</li>`).join("\n        ")}
        ${its.map((i) => `<li><a href="${esc(search(i.q))}" target="_blank" rel="noopener nofollow">${esc(i.name)}</a>, ${range(i.price)}</li>`).join("\n        ")}
      </ul>
    </article>`;
  }

  function pickCard(p, i, campaign) {
    const n = i + 1;
    if (p.book) {
      const b = B[p.book];
      if (!b) return "";
      return `<article class="gf-pick gf-pick-book" id="pick-${n}">
      <img class="gf-pick-cover" src="${esc(h.thumb(b.cover, "m"))}" alt="${esc(b.short)} cover" width="150" height="197" loading="lazy" decoding="async">
      <div>
        <p class="gf-tag">${esc(p.best)}</p>
        <h3>${n}. ${esc(b.title.replace(/^Charcuterie Lab: /, ""))}</h3>
        <p class="gf-price">${b.paperbackUrl ? `Paperback ${esc(b.paperbackPrice)} · ebook ${esc(b.ebookPrice)}` : `Ebook ${esc(b.ebookPrice)} · paperback coming soon`}</p>
        <p>${esc(p.why)} <a href="${b.path}">More about the book</a></p>
        ${bookButtons(b, `${campaign}_pick${n}`, true)}
      </div>
    </article>`;
    }
    const it = p.item ? ITEMS[p.item] : OTHER_BOOKS[p.other];
    const price = it.price ? `Typically ${range(it.price)}` : `${it.tier}: price varies by plan`;
    return `<article class="gf-pick" id="pick-${n}">
      <div>
        <p class="gf-tag">${esc(p.best)}</p>
        <h3>${n}. ${esc(it.name)}${it.by ? ` <span class="gf-by">by ${esc(it.by)}</span>` : ""}</h3>
        <p class="gf-price">${esc(price)}</p>
        <p>${esc(p.why || it.note)}${it.guide ? ` <a href="${it.guide[1]}">${esc(it.guide[0])}</a>` : ""}</p>
        <a class="button gf-btn-shop" href="${esc(search(it.q))}" target="_blank" rel="noopener nofollow">See it on Amazon</a>
      </div>
    </article>`;
  }

  function pickName(p) {
    if (p.book) return B[p.book].title.replace(/^Charcuterie Lab: /, "");
    return (p.item ? ITEMS[p.item] : OTHER_BOOKS[p.other]).name;
  }
  function pickPrice(p) {
    if (p.book) { const b = B[p.book]; return b.paperbackUrl ? b.paperbackPrice : `${b.ebookPrice} ebook`; }
    const it = p.item ? ITEMS[p.item] : OTHER_BOOKS[p.other];
    return it.price ? range(it.price) : it.tier;
  }

  const giftCard = `<section class="gf-card" id="gift-card" aria-labelledby="gf-card-h">
    <div class="gf-card-inner">
      <img src="/images/gifts/gift-card-preview.webp" alt="The printable Charcuterie Lab gift card: Your first board is on me" width="560" height="362" loading="lazy" decoding="async">
      <div>
        <p class="section-kicker">Free printable</p>
        <h2 id="gf-card-h">\"Your first board is on me\" gift card</h2>
        <p>Tuck it inside the book. There's a space to write which board you'll make together, so the gift comes with a date on the calendar. Two cards per page, prints on plain paper or card stock.</p>
        ${h.bhForm("gift-card-form", "gifts_card", { label: "Download the gift card (PDF)", pdf: "/downloads/charcuterie-gift-card.pdf" })}
        <p class="gf-fine">Enter your email and the download appears on the next page. You'll also get the Lab Report newsletter; unsubscribe any time.</p>
      </div>
    </div>
  </section>`;

  function schema(list, crumbs, faq) {
    const s = [
      { "@context": "https://schema.org", "@type": "ItemList", itemListOrder: "https://schema.org/ItemListOrderAscending", numberOfItems: list.length, itemListElement: list.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, url: url.startsWith("http") ? url : h.absoluteUrl(url) })) },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: h.absoluteUrl(url) })) }
    ];
    if (faq) s.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) });
    return s.map((x) => `  <script type="application/ld+json">${h.jsonForScript(x)}</script>`).join("\n");
  }

  const faqBlock = (faq, title) => `<section class="ebook-section ebook-faq">
    <div class="ebook-section-inner">
      <h2>${esc(title)}</h2>
      <div class="ebook-faq-list">
        ${faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${a}</p></details>`).join("\n        ")}
      </div>
    </div>
  </section>`;

  const pages = [];

  // --------------------------------------------------------------- spokes
  for (const g of GUIDES) {
    const path = `/gifts/${g.slug}/`;
    const campaign = `gift_${g.slug.replace(/-/g, "_")}`;
    const picks = g.picks.filter((p) => !p.book || B[p.book]);
    const top3 = picks.slice(0, 3);
    pages.push({
      path,
      html: h.layout({
        title: g.seoTitle,
        canonical: path,
        image: g.image,
        description: g.description,
        head: schema(picks.map((p, i) => [pickName(p), `${path}#pick-${i + 1}`]), [["Home", "/"], ["Gift guide", "/gifts/"], [g.card, path]], g.faq),
        body: `<main class="gf-page gf-spoke">
  <section class="gf-hero">
    <div class="gf-inner">
      <p class="ing-crumb"><a href="/gifts/">Gift guide</a> <span aria-hidden="true">/</span> ${esc(g.card)}</p>
      <p class="section-kicker">${esc(g.kicker)}</p>
      <h1>${esc(g.h1)}</h1>
      <div class="quick-answer gf-quick"><p><strong>Quick answer:</strong> ${g.quick}</p></div>
      ${shipStrip}
    </div>
  </section>
  <div class="gf-inner gf-body">
    <p class="gf-intro">${esc(g.intro)}</p>
    <p class="gf-method">${esc(g.method)}</p>
    <h2>Our picks at a glance</h2>
    <div class="bk-table-wrap"><table class="bk-table gf-table">
      <thead><tr><th scope="col">Pick</th><th scope="col">Best for</th><th scope="col">Price</th></tr></thead>
      <tbody>${picks.map((p, i) => `<tr><th scope="row"><a href="#pick-${i + 1}">${esc(pickName(p))}</a></th><td>${esc(p.best)}</td><td>${esc(pickPrice(p))}</td></tr>`).join("\n      ")}</tbody>
    </table></div>
    <h2>The full list</h2>
    <div class="gf-picks">
    ${picks.map((p, i) => pickCard(p, i, campaign)).join("\n    ")}
    </div>
    ${g.stretch ? `<p class="gf-stretch">${g.stretch}</p>` : ""}
    ${g.extra ? `<section class="gf-extra"><h2>${esc(g.extra.title)}</h2>${g.extra.body}</section>` : ""}
    ${matcher(campaign, true)}
    <section class="gf-sets gf-sets-one" aria-labelledby="gf-set-h">
      <h2 id="gf-set-h">Or give it as a set</h2>
      <div class="gf-set-grid">${setCard(g.set, campaign)}</div>
    </section>
  </div>
  ${faqBlock(g.faq, `${g.card}: questions`)}
  <div class="gf-inner gf-body">
    <section class="gf-related">
      <h2>More gift guides</h2>
      <ul>${[...g.related, ["All gift ideas", "/gifts/"]].map(([t, u]) => `<li><a href="${u}">${esc(t)}</a></li>`).join("")}</ul>
    </section>
  </div>
  ${giftCard}
</main>`
      })
    });
  }

  // --------------------------------------------------------------- hub
  {
    const path = "/gifts/";
    const main = B.main;
    const guideCards = [
      ...GUIDES.map((g) => [g.card, `/gifts/${g.slug}/`, g.cardLine, g.image]),
      ["DIY charcuterie gift basket", "/blog/charcuterie-gift-basket/", "What to pack at $25, $50 and $100", "/images/charcuterie-gift-box-50.jpg"],
      ["Which serving board to buy", "/blog/best-charcuterie-boards/", "Wood, slate or marble, and what size", "/images/wine-cheese-board.png"]
    ];
    const chips = [
      ["Budget", [["Under $25", "/gifts/under-25/"], ["Gift sets $35 to $110", "#sets"], ["DIY basket $25 to $100", "/blog/charcuterie-gift-basket/"]]],
      ["Person", [["Cheese lover", "/gifts/cheese-lovers/"], ["Host", "/gifts/hostess-gifts/"], ["Book lover", "/gifts/charcuterie-books/"], ["Vegan", "/books/plant-based-charcuterie-boards/"], ["Keto", "/books/keto-charcuterie-boards/"]]],
      ["Occasion", [["Hostess gift", "/gifts/hostess-gifts/"], ["Stocking stuffer", "/gifts/under-25/"], ["Christmas", "#matcher"]]]
    ];
    const faq = [
      ["What do you get someone who loves charcuterie?", "A board book that tells them exactly what to buy and how much, paired with one tool or one jar: a cheese knife set, fig spread, hot honey or honeycomb. Our top pick is 50 Boards, Built by Science ($25.99 paperback) with a jar of fig spread."],
      ["What goes in a charcuterie gift basket?", "A whole dry salami, crackers, a jar of fig spread, nuts, a small knife and one or two cheeses. The salami, crackers, jam and nuts are shelf-stable; add the cheese right before you hand it over and tell them to refrigerate it. Our DIY gift basket guide has full lists at $25, $50 and $100."],
      ["What is the best charcuterie book for a beginner?", "50 Boards, Built by Science. Every board comes with a shopping list with amounts, a build order and swaps, so a beginner can make a full board without guessing."],
      ["What's a good last-minute charcuterie gift?", "An ebook. Buy the PDF, then forward the download email or print our free \"Your first board is on me\" gift card and write the book's name on it."],
      ["How much should I spend on a charcuterie gift?", "$15 to $35 covers most gifts: a book, a knife set or a jar trio. Our ready-made gift sets run from about $35 to $110."]
    ];
    pages.push({
      path,
      html: h.layout({
        title: "Charcuterie Gift Ideas 2026: For Every Board Lover",
        canonical: path,
        image: "/images/charcuterie-gift-basket.jpg",
        description: "Charcuterie gift ideas for 2026: the best board books, gifts under $25, hostess gifts and gifts for cheese lovers, plus ready-made gift sets and a free printable gift card.",
        head: schema(guideCards.map(([t, u]) => [t, u]), [["Home", "/"], ["Gift guide", path]], faq),
        body: `<main class="gf-page gf-hub">
  <section class="gf-hero">
    <div class="gf-inner">
      <p class="section-kicker">Gift guide 2026</p>
      <h1>Charcuterie gift ideas for every board lover and every budget</h1>
      <div class="quick-answer gf-quick"><p><strong>Quick answer:</strong> Our top gift for anyone who loves a charcuterie board is <strong>50 Boards, Built by Science</strong> (paperback ${esc(main.paperbackPrice)}) with a jar of fig spread. Under $25, give <strong>Around the World in 16 Boards</strong> (${esc(B.world ? B.world.paperbackPrice : "")}) or a 3-piece cheese knife set. Below: gifts by budget, by person and as ready-made sets.</p></div>
      ${shipStrip}
      <nav class="gf-chips" aria-label="Shop gifts by">
        ${chips.map(([label, list]) => `<div class="gf-chip-row"><span>${esc(label)}</span>${list.map(([t, u]) => `<a href="${u}">${esc(t)}</a>`).join("")}</div>`).join("\n        ")}
      </nav>
    </div>
  </section>

  <section class="gf-top" aria-labelledby="gf-top-h">
    <div class="gf-inner gf-top-inner">
      <img src="${esc(h.thumb(main.cover, "m"))}" alt="50 Boards, Built by Science cover" width="260" height="341" loading="lazy" decoding="async">
      <div>
        <p class="section-kicker">Our top pick</p>
        <h2 id="gf-top-h">50 Boards, Built by Science</h2>
        <ul>
          <li>50 complete boards, from a $25 budget board to a 30-person showstopper</li>
          <li>Every board has the shopping list with amounts, a build order and a swap for every ingredient</li>
          <li>259 full-colour pages that lie open on the counter while they build</li>
        </ul>
        ${bookButtons(main, "gift_hub_top")}
        <p class="gf-fine"><a href="/ebook/">Look inside the book</a></p>
      </div>
    </div>
  </section>

  <div class="gf-inner gf-body">
    ${matcher("gift_hub")}

    <section class="gf-sets" id="sets" aria-labelledby="gf-sets-h">
      <p class="section-kicker">Ready-made gift sets</p>
      <h2 id="gf-sets-h">Build the gift: three sets, each with a book at the centre</h2>
      <p>A board and knives are a nice gift. A board, knives and a book that tells them exactly what to put on it is a better one.</p>
      <div class="gf-set-grid">${["starter", "host", "cheese"].map((k) => setCard(k, "gift_hub_set")).join("\n      ")}</div>
      <p class="gf-fine">Book prices are our list prices. Other items are typical ranges, checked ${PRICES_CHECKED}; check the price at checkout.</p>
    </section>

    <section class="gf-guides" aria-labelledby="gf-guides-h">
      <h2 id="gf-guides-h">Every gift guide</h2>
      <div class="gf-guide-grid">${guideCards.map(([t, u, line, img]) => `<a class="gf-guide" href="${u}"><img src="${esc(h.thumb(img, "m"))}" alt="" width="400" height="268" loading="lazy" decoding="async"><strong>${esc(t)}</strong><span>${esc(line)}</span></a>`).join("\n      ")}</div>
    </section>
  </div>
  ${giftCard}
  ${faqBlock(faq, "Charcuterie gift questions")}
</main>`
      })
    });
  }
  return pages;
}

export const giftCardPdf = "/downloads/charcuterie-gift-card.pdf";
