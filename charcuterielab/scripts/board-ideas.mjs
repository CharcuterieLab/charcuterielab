// Charcuterie board ideas: the feature page (23 Nov 2026).
//
// /blog/charcuterie-board-ideas/ owns the search "charcuterie board ideas".
// The post's markdown holds the words (quick answer, how-to, FAQ); this module
// fills four mounts in it at build time from the Board Library data, so the
// page never goes stale when a board is added or changed:
//   <div data-board-ideas></div>     quick picks, the finder and every idea card
//   <div data-board-stats></div>     the "by the numbers" table
//   <div data-board-holidays></div>  the holiday calendar strip
// Every board page is a card; a few blog posts that are board ideas with no
// board page (bagel board, butter board, hot cocoa board...) are cards too.
// Cards render on the server, grouped in sections, so the whole list is in
// the HTML for readers without JavaScript and for search engines. The script
// only filters, collapses long sections and remembers nothing.

export const IDEAS_PATH = "/blog/charcuterie-board-ideas/";

// Sections, in page order. The holiday section always comes first, sorted by
// the next holiday on the calendar.
const SECTIONS = [
  { id: "holiday", chip: "Holiday", h2: "Christmas and holiday charcuterie board ideas", lead: "Every holiday board in one place, in calendar order from today, so the next one on the calendar is always first.", hub: ["/holidays/", "All holiday board pages"] },
  { id: "easy", chip: "Easy & cheap", h2: "Easy and cheap charcuterie board ideas", lead: "Supermarket boards that take 15 to 20 minutes, starting at about $13 for four people.", hub: ["/boards/by-price/", "Every board by price"] },
  { id: "party", chip: "Party", h2: "Charcuterie board ideas for a party", lead: "Boards sized for a crowd, from a book club of 8 to a grazing board for 30.", hub: ["/party-planner/", "Party Planner: how much to buy for any number"] },
  { id: "two", chip: "For two", h2: "Small charcuterie boards for one or two", lead: "Date nights, anniversaries and nights in, sized so nothing goes to waste.", hub: ["/boards/for-two/", "All boards for two"] },
  { id: "fancy", chip: "Fancy", h2: "Fancy charcuterie board ideas", lead: "The splurge boards: truffle, caviar, aged cheese flights and a gold-leaf showpiece.", hub: ["/boards/classic-budget-luxury/", "Classic, budget and luxury boards"] },
  { id: "world", chip: "Around the world", h2: "International charcuterie board ideas", lead: "Boards from Spain to Korea to Peru, plus four American regional boards.", hub: ["/boards/around-the-world/", "All international boards"] },
  { id: "shape", chip: "Shaped", h2: "Unique shaped charcuterie boards", lead: "The showpieces: a salami dragon, an octopus, a fondue volcano. Each one comes down to one trick.", hub: ["/boards/showpiece/", "All showpiece boards"] },
  { id: "vegan", chip: "Vegan", h2: "Vegan and plant-based board ideas", lead: "No meat and no dairy, and still a full board: nut cheeses, marinated vegetables, bean dips and fruit.", hub: ["/boards/plant-based/", "All plant-based boards"] },
  { id: "keto", chip: "Keto", h2: "Keto and low-carb board ideas", lead: "Boards at a few grams of net carbs a serving, from a 15-minute weeknight board to a keto Christmas board.", hub: ["/boards/keto-low-carb/", "All keto boards"] },
  { id: "diet", chip: "Kids & diets", h2: "Kid-friendly, gluten-free and other boards", lead: "Boards for kids, gluten-free and dairy-free guests, halal tables and pregnancy, where a few swaps make the whole board safe for everyone.", hub: ["/dietary/", "Dietary swaps for any board"] },
  { id: "beyond", chip: "Sweet & more", h2: "Dessert, candy, butter and bagel boards", lead: "Board ideas that go beyond meat and cheese: dessert, candy, a butter board and a brunch bagel board.", hub: ["/boards/pairings-sweet/", "Wine, beer and dessert boards"] },
  { id: "drinks", chip: "Wine & beer", h2: "Wine, beer and whiskey board ideas", lead: "Boards built around the bottle, with the pairing reasons on each page.", hub: ["/pairings/", "Pairings: what goes with what"] }
];

const CATEGORY_SECTION = {
  "classic-budget-luxury": "easy",
  "occasions-parties": "party",
  "for-two": "two",
  "around-the-world": "world",
  showpiece: "shape",
  "keto-low-carb": "keto",
  "plant-based": "vegan",
  "seasonal-holiday": "holiday",
  "pairings-sweet": "beyond",
  "dietary-kids": "diet"
};

// Boards whose main section isn't their library category.
const PRIMARY = {
  "santas-sleigh-charcuterie-board": "holiday",
  "giant-jack-o-lantern-board": "holiday",
  "thanksgiving-turkey-board": "holiday",
  "easter-egg-charcuterie-board": "holiday",
  "keto-christmas-charcuterie-board": "holiday",
  "keto-thanksgiving-charcuterie-board": "holiday",
  "plant-based-holiday-board": "holiday",
  "plant-based-fall-harvest-board": "holiday",
  "new-years-eve-board-for-two": "holiday",
  "valentines-day-board-for-two": "holiday",
  "luxury-charcuterie-board": "fancy",
  "truffle-charcuterie-board": "fancy",
  "gold-charcuterie-board": "fancy",
  "all-cheese-board": "fancy",
  "american-cheese-board": "fancy",
  "italian-salumeria-board": "fancy",
  "seafood-charcuterie-board": "fancy",
  "farm-to-table-charcuterie-board": "fancy",
  "meat-lovers-charcuterie-board": "party",
  "wine-and-cheese-pairing-board": "drinks",
  "beer-and-charcuterie-board": "drinks",
  "whiskey-and-smoke-board": "drinks",
  "oysters-and-champagne-board": "drinks",
  "vegan-charcuterie-board": "vegan",
  "camping-charcuterie-board": "easy",
  "movie-night-charcuterie-board": "easy",
  "dairy-free-keto-board": "keto"
};

// Extra sections a card also shows up under when that chip is picked.
const ALSO = {
  "santas-sleigh-charcuterie-board": ["shape"], "giant-jack-o-lantern-board": ["shape"], "thanksgiving-turkey-board": ["shape"], "easter-egg-charcuterie-board": ["shape"],
  "heart-shaped-charcuterie-board": ["holiday"], "football-field-charcuterie-board": ["holiday", "party"], "game-day-charcuterie-board": ["holiday"],
  "keto-christmas-charcuterie-board": ["keto"], "keto-thanksgiving-charcuterie-board": ["keto"], "keto-game-day-board": ["party"], "keto-date-night-board": ["two"], "keto-snack-plate-for-two": ["two"], "keto-wine-night-board": ["drinks"], "keto-dessert-board": ["beyond"], "keto-brunch-board": ["party"], "dairy-free-keto-board": ["diet"], "budget-keto-charcuterie-board": ["easy"], "15-minute-keto-board": ["easy"],
  "plant-based-holiday-board": ["vegan"], "plant-based-fall-harvest-board": ["vegan"], "plant-based-dessert-board": ["beyond"], "plant-based-date-night-board": ["two"], "plant-based-starter-board": ["easy"],
  "new-years-eve-board-for-two": ["two"], "valentines-day-board-for-two": ["two"], "new-years-eve-charcuterie-board": ["party"],
  "whiskey-and-smoke-board": ["two"], "oysters-and-champagne-board": ["two", "fancy"], "caviar-and-creme-fraiche-board": ["fancy"], "truffle-and-aged-cheese-board": ["fancy"], "proposal-night-charcuterie-board": ["fancy"],
  "wine-night-board-for-four": ["drinks"], "cocktail-party-charcuterie-board": ["drinks"], "wine-and-cheese-pairing-board": ["party"],
  "15-dollar-charcuterie-board": ["two"], "just-because-charcuterie-board": ["easy"], "game-night-board-for-two": ["easy"], "midnight-snack-charcuterie-board": ["easy"],
  "kid-friendly-charcuterie-board": ["party"], "gluten-free-charcuterie-board": ["party"], "vegan-charcuterie-board": ["diet"],
  "grand-charcuterie-board": ["fancy"], "50th-birthday-charcuterie-board": ["fancy"], "wedding-shower-charcuterie-board": ["fancy"],
  "gold-charcuterie-board": ["shape"], "champagne-bottle-charcuterie-board": ["holiday", "drinks"], "charcuterie-cake": ["party"],
  "dessert-charcuterie-board": ["party"], "sweet-and-savory-dessert-board": ["party"], "brunch-charcuterie-board": ["beyond"],
  "classic-american-starter-board": ["party"], "25-dollar-budget-charcuterie-board": ["party"]
};

// Which holiday a holiday-section card belongs to (for calendar order and the
// little holiday label). Keys are content/holidays slugs.
const HOLIDAY_OF = {
  "holiday-entertaining-board": "christmas", "santas-sleigh-charcuterie-board": "christmas", "keto-christmas-charcuterie-board": "christmas", "plant-based-holiday-board": "christmas",
  "christmas-cookie-charcuterie-board": "christmas", "christmas-morning-charcuterie-board": "christmas", "christmas-tree-charcuterie-board": "christmas", "christmas-wreath-charcuterie-board": "christmas", "hot-cocoa-board": "christmas", "feast-of-the-seven-fishes-board": "christmas", "noche-buena-charcuterie-board": "christmas", "winter-charcuterie-board": "christmas",
  "new-years-eve-charcuterie-board": "new-years-eve", "new-years-eve-board-for-two": "new-years-eve", "champagne-bottle-charcuterie-board": "new-years-eve",
  "game-day-charcuterie-board": "super-bowl", "football-field-charcuterie-board": "super-bowl",
  "valentines-day-charcuterie-board": "valentines-day", "valentines-day-board-for-two": "valentines-day", "heart-shaped-charcuterie-board": "valentines-day",
  "st-patricks-day-charcuterie-board": "st-patricks-day",
  "easter-charcuterie-board": "easter", "easter-egg-charcuterie-board": "easter",
  "summer-backyard-board": "fourth-of-july", "beach-picnic-charcuterie-board": "fourth-of-july",
  "giant-jack-o-lantern-board": "halloween",
  "thanksgiving-charcuterie-board": "thanksgiving", "thanksgiving-turkey-board": "thanksgiving", "keto-thanksgiving-charcuterie-board": "thanksgiving", "fall-harvest-charcuterie-board": "thanksgiving", "plant-based-fall-harvest-board": "thanksgiving",
  "thanksgiving-pie-board": "thanksgiving", "turkey-charcuterie-board": "thanksgiving", "friendsgiving-charcuterie-board": "thanksgiving"
};
const HOLIDAY_LABEL = { christmas: "Christmas", "new-years-eve": "New Year's Eve", "super-bowl": "Super Bowl", "valentines-day": "Valentine's Day", "st-patricks-day": "St. Patrick's Day", easter: "Easter", "fourth-of-july": "Summer", halloween: "Halloween", thanksgiving: "Thanksgiving and fall", hanukkah: "Hanukkah", "mothers-day": "Mother's Day", "memorial-day": "Memorial Day" };

// Board ideas that are blog posts with no board page. Numbers come from each
// post's own quick answer; cost is left out where the post doesn't give one.
const EXTRAS = [
  { slug: "christmas-wreath-charcuterie-board", section: "holiday", also: ["shape"], name: "Christmas Wreath Charcuterie Board", g: [8, 20], m: 30, hook: "A ring of cheese, folded salami, green grapes and olives around a center bowl, with rosemary for the greenery and red berries for the color.", on: ["Rosemary", "Folded salami", "Green grapes", "Red berries or tomatoes"] },
  { slug: "christmas-tree-charcuterie-board", section: "holiday", also: ["shape"], name: "Christmas Tree Charcuterie Board", g: [8, 20], m: 30, hook: "Rows of cheese, salami, grapes and olives stacked into a triangle, with a cheese star on top and pretzel rods for the trunk.", on: ["Cheese star", "Salami", "Grapes", "Rosemary garland"] },
  { slug: "christmas-cookie-charcuterie-board", section: "holiday", also: ["beyond"], name: "Christmas Cookie Board", g: [8, 30], m: 20, hook: "Five or six kinds of cookies with chocolate, candy, fruit and one dip in the gaps. Plan 3 to 4 cookies a guest.", on: ["5–6 kinds of cookies", "Chocolate", "Candy", "One dip"] },
  { slug: "hot-cocoa-board", section: "holiday", also: ["beyond"], name: "Hot Cocoa Board", g: [8, 20], m: 20, hook: "A slow cooker of cocoa with a board of toppings and dippers around it. Plan 12 oz of cocoa a guest.", on: ["Marshmallows", "Whipped cream", "Crushed peppermint", "Pretzel rods"] },
  { slug: "christmas-morning-charcuterie-board", section: "holiday", also: ["beyond"], name: "Christmas Morning Breakfast Board", g: [4, 12], m: 20, hook: "Breakfast everyone picks at during presents: something warm, red and green fruit and something creamy. Prep it on Christmas Eve.", on: ["Mini pancakes", "Bacon", "Red and green fruit", "Cinnamon rolls"] },
  { slug: "feast-of-the-seven-fishes-board", section: "holiday", also: ["fancy"], name: "Feast of the Seven Fishes Board", g: [4, 12], m: 30, hook: "Christmas Eve's seven fishes on one no-cook board, all bought ready to eat. Plan 3 to 4 oz of seafood a person.", on: ["Smoked salmon", "White anchovies", "Shrimp", "Marinated octopus"] },
  { slug: "noche-buena-charcuterie-board", section: "holiday", also: ["world"], name: "Noche Buena Board", g: [10, 10], m: 40, hook: "The Filipino Christmas Eve feast on a board: queso de bola, sweet glazed ham and warm pan de sal in the middle.", on: ["Queso de bola", "Glazed ham", "Pan de sal", "Dried mango"] },
  { slug: "winter-charcuterie-board", section: "holiday", name: "Winter Charcuterie Board", g: [8, 12], hook: "Bold aged cheeses and rich cured meats with dark honey, dried cranberries and spiced walnuts.", on: ["Stilton", "Aged Gouda", "Coppa", "Spiced walnuts"] },
  { slug: "turkey-charcuterie-board", section: "holiday", also: ["shape"], name: "Turkey Charcuterie Board", g: [8, 20], m: 30, hook: "The easy Thanksgiving turkey: a pear or mini brie for the body, with food fanned behind it in arcs for the tail feathers.", on: ["Mini brie", "Salami", "Cheddar beak", "Grapes"] },
  { slug: "friendsgiving-charcuterie-board", section: "holiday", also: ["party"], name: "Friendsgiving Charcuterie Board", g: [8, 20], m: 30, hook: "A board that comes before the big meal: fall cheeses, salami, apples, pecans and fig jam, about 1 lb each of meat and cheese for 8.", on: ["Fall cheeses", "Salami", "Apples", "Fig jam"] },
  { slug: "thanksgiving-pie-board", section: "holiday", also: ["beyond"], name: "Thanksgiving Pie Board", g: [8, 30], m: 20, hook: "Three or four pies cut into slim wedges so everyone tries two or three. Plan 3 pies for 12.", on: ["3–4 pies", "Whipped cream", "Caramel", "Toasted pecans"] },
  { slug: "20-dollar-charcuterie-board-challenge", section: "easy", also: ["two"], name: "The $20 Board Challenge", g: [4, 4], c: 20, m: 20, hook: "A full board for four for about $20: 8 oz of cheese, 8 oz of salami, a box of crackers, fruit, pickles and a few nuts.", on: ["Block cheese", "Salami", "Crackers", "Pickles"] },
  { slug: "trader-joes-charcuterie-board", section: "easy", also: ["party"], name: "Trader Joe's Charcuterie Board", g: [10, 10], c: 90, m: 25, hook: "One store, 10 guests, about $90 to $110: Unexpected Cheddar, Manchego, brie and Toscano with salame and prosciutto.", on: ["Unexpected Cheddar", "Manchego", "Salame", "Prosciutto"] },
  { slug: "costco-charcuterie-board", section: "party", also: ["easy"], name: "Costco Charcuterie Board for 20", g: [20, 20], c: 190, m: 45, hook: "About 4 lb each of meat and cheese from one Costco run, for about $190 to $230 all in.", on: ["Manchego", "Aged Gouda", "Dubliner", "Prosciutto"] },
  { slug: "bagel-board", section: "beyond", also: ["party"], name: "Bagel Board", g: [6, 20], m: 30, hook: "A brunch bagel bar: 1 to 1½ bagels, 2 oz cream cheese and 1½ to 2 oz lox a guest, with capers, red onion, tomato and dill.", on: ["Bagels", "Cream cheese", "Lox", "Capers"] },
  { slug: "butter-board", section: "beyond", also: ["easy"], name: "Butter Board", g: [4, 12], m: 15, hook: "Softened butter spread across a board with flaky salt, honey, herbs or chili crisp, and warm bread to drag through it.", on: ["Softened butter", "Flaky salt", "Honey", "Warm bread"] },
  { slug: "candy-charcuterie-board", section: "beyond", also: ["party", "holiday"], name: "Candy Charcuterie Board", g: [8, 20], m: 20, hook: "Candy laid out like a cheese board: bowls first, big pieces next, then fill the gaps by color.", on: ["Chocolate", "Chewy candy", "Something crunchy", "Something salty"] },
  { slug: "mini-charcuterie-board", section: "two", also: ["easy"], name: "Mini Charcuterie Board", g: [1, 2], m: 15, hook: "The same board on a dinner plate: two cheeses, one or two meats, 6 to 8 crackers and something sweet and sour.", on: ["2 cheeses", "1–2 meats", "Crackers", "A sweet extra"] },
  { slug: "charcuterie-board-for-kids", section: "diet", also: ["party"], name: "Charcuterie Board for Kids", g: [4, 12], m: 20, hook: "Mild cheese, familiar meat, fruit and dips, with cheese cut into shapes so the kids build their own.", on: ["Cheddar", "Pepperoni", "Halved grapes", "Ranch or hummus"] },
  { slug: "dairy-free-charcuterie-board", section: "diet", name: "Dairy-Free Charcuterie Board", g: [6, 10], hook: "Most of a board is already dairy-free. Swap the cheese for cashew cheese, hummus or avocado and lean on the meat and produce.", on: ["Cashew cheese", "Cured meat", "Hummus", "Olives"] },
  { slug: "halal-charcuterie-board", section: "diet", also: ["world"], name: "Halal Charcuterie Board", g: [8, 8], hook: "Halal-certified beef, turkey and chicken (bresaola, beef salami, sujuk, basturma) with cheeses made from microbial rennet.", on: ["Beef bresaola", "Sujuk", "Basturma", "Microbial-rennet cheese"] },
  { slug: "pregnancy-safe-charcuterie-board", section: "diet", name: "Pregnancy-Safe Charcuterie Board", g: [8, 8], hook: "Cold cured meat is on the CDC's list, so this board heats it: prosciutto crisps, pepperoni chips and baked brie, with pasteurized cheese.", on: ["Prosciutto crisps", "Pepperoni chips", "Baked brie", "Pasteurized cheese"] }
];

// The quick picks row: one answer per common need.
const PICKS = [
  ["Never made one?", "classic-american-starter-board"],
  ["Under $15", "15-dollar-charcuterie-board"],
  ["Just the two of you", "date-night-board-for-two"],
  ["Feeding 20 or more", "grand-charcuterie-board"],
  ["Want a wow", "dragon-charcuterie-board"],
  ["No meat, no dairy", "plant-based-starter-board"]
];

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function range(s = "") {
  const n = String(s).replace(/,/g, "").match(/\d+(?:\.\d+)?/g) || [];
  if (!n.length) return [0, 0];
  return [Number(n[0]), Number(n[n.length - 1])];
}
function minutes(s = "") {
  const t = String(s).replace("½", ".5");
  const n = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (!n.length) return 0;
  const top = n[n.length - 1];
  return /hour/i.test(t) ? Math.round(top * 60) : top;
}
function firstWords(text = "", min = 14, max = 42) {
  const parts = String(text).trim().split(/(?<=[.!?])\s+/);
  let out = "";
  for (const p of parts) {
    const next = out ? `${out} ${p}` : p;
    if (next.split(/\s+/).length > max && out) break;
    out = next;
    if (out.split(/\s+/).length >= min) break;
  }
  return out;
}
function onBoard(b, max = 5) {
  const items = [];
  for (const g of b.groups || []) {
    for (const it of (g.items || []).slice(0, 2)) {
      const n = String(it.name || "")
        .replace(/\s*[(\u00b7\u2013\u2014].*$/, "")
        .replace(/\s+\bor\b\s+.*$/i, "")
        .replace(/,\s*.*$/, "")
        .replace(/\s+\b(plus|mixed with)\b\s+.*$/i, "")
        .trim();
      if (n && n.length < 34 && !items.some((x) => x.toLowerCase() === n.toLowerCase())) items.push(n);
    }
    if (items.length >= max) break;
  }
  return items.slice(0, max);
}

export function sectionOf(b) {
  return PRIMARY[b.slug] || CATEGORY_SECTION[b.category] || "party";
}

function toIdeas(boards, posts) {
  const live = boards.filter((b) => !b.placeholder && (b.status || "published") === "published");
  const ideas = live.map((b) => {
    const [g0, g1] = range(b.serves);
    const [c0, c1] = range(b.cost);
    return {
      slug: b.slug, url: `/boards/${b.slug}/`, name: b.h1 || b.title, image: b.image, alt: b.image_alt || `${b.h1 || b.title}: ${onBoard(b, 3).join(", ")}`,
      section: sectionOf(b), also: ALSO[b.slug] || [], g: [g0, g1 || g0], c: [c0, c1 || c0], m: minutes(b.prep_time),
      serves: b.serves, cost: b.cost, time: b.prep_time, level: b.difficulty, hook: firstWords(b.hook), on: onBoard(b),
      diet: [b.book === "plant" || b.slug === "vegan-charcuterie-board" ? "vegan" : "", b.book === "keto" || b.slug === "keto-charcuterie-board" ? "keto" : ""].filter(Boolean),
      holiday: HOLIDAY_OF[b.slug] || "", kind: b.book === "impossible" ? "Showpiece" : ""
    };
  });
  const postBy = new Map(posts.map((p) => [p.slug, p]));
  for (const x of EXTRAS) {
    const p = postBy.get(x.slug);
    if (!p) continue;
    ideas.push({
      slug: x.slug, url: `/blog/${x.slug}/`, name: x.name, image: p.image, alt: `${x.name}: ${x.on.slice(0, 3).join(", ")}`,
      section: x.section, also: x.also || [], g: x.g, c: x.c ? [x.c, x.c] : [0, 0], m: x.m || 0,
      serves: x.g[0] === x.g[1] ? String(x.g[0]) : `${x.g[0]}–${x.g[1]}`, cost: x.c ? `From $${x.c}` : "", time: x.m ? `${x.m} min` : "", level: "",
      hook: x.hook, on: x.on, diet: [], holiday: HOLIDAY_OF[x.slug] || "", kind: "Guide"
    });
  }
  return ideas;
}

function nextDate(holidays, today) {
  const m = new Map();
  for (const x of holidays) {
    const d = (x.dates || []).filter((v) => v >= today).sort()[0];
    if (d) m.set(x.slug, d);
  }
  return m;
}

function cardHtml(x, h) {
  const t = (src, size) => (h.thumb ? h.thumb(src, size) : src);
  const s = t(x.image, "s");
  const m = t(x.image, "m");
  const srcset = s !== m ? ` srcset="${esc(s)} 240w, ${esc(m)} 640w" sizes="(max-width: 560px) 46vw, 280px"` : "";
  const facts = [x.serves ? `Serves ${x.serves}` : "", x.cost, x.time].filter(Boolean);
  const tags = [x.section, ...x.also].filter((v, i, a) => a.indexOf(v) === i).join(" ");
  const q = [x.name, x.hook, x.on.join(" "), x.diet.join(" "), x.holiday ? HOLIDAY_LABEL[x.holiday] : ""].join(" ").toLowerCase().replace(/[^a-z0-9$ ]+/g, " ").replace(/\s+/g, " ").trim();
  const label = x.holiday && x.section === "holiday" ? HOLIDAY_LABEL[x.holiday] : x.kind;
  return `<li class="bi-card" data-s="${tags}" data-g="${x.g[0]}-${x.g[1]}" data-c="${x.c[0]}" data-m="${x.m}" data-q="${esc(q)}">
  <a class="bi-card-img" href="${x.url}" tabindex="-1" aria-hidden="true"><img src="${esc(m)}"${srcset} alt="${esc(x.alt)}" width="640" height="427" loading="lazy" decoding="async"></a>
  <div class="bi-card-body">
    ${label ? `<p class="bi-label">${esc(label)}</p>` : ""}
    <h3><a href="${x.url}">${esc(x.name)}</a></h3>
    ${facts.length ? `<p class="bi-facts">${facts.map((f) => `<span>${esc(f)}</span>`).join("")}</p>` : ""}
    <p class="bi-hook">${esc(x.hook)}</p>
    ${x.on.length ? `<p class="bi-on"><b>On it:</b> ${esc(x.on.join(", "))}</p>` : ""}
  </div>
</li>`;
}

const SHOW = 8;

export function boardIdeasParts(h, { boards, posts, holidays, today = new Date().toISOString().slice(0, 10) }) {
  const ideas = toIdeas(boards, posts);
  const bySlug = new Map(ideas.map((x) => [x.slug, x]));
  const next = nextDate(holidays, today);
  const far = "9999-12-31";
  const order = (x) => next.get(x.holiday) || far;
  const sections = SECTIONS.map((S) => {
    let list = ideas.filter((x) => x.section === S.id);
    if (S.id === "holiday") list = list.sort((a, b) => order(a).localeCompare(order(b)) || (a.kind === "Guide") - (b.kind === "Guide"));
    else list = list.sort((a, b) => (a.kind === "Guide") - (b.kind === "Guide") || a.c[0] - b.c[0]);
    return { S, list };
  }).filter((x) => x.list.length);
  const total = ideas.length;

  const picks = `<div class="bi-picks" aria-label="Quick picks">
  ${PICKS.map(([need, slug]) => bySlug.get(slug)).map((x, i) => x && `<a class="bi-pick" href="${x.url}"><img src="${esc(h.thumb ? h.thumb(x.image, "s") : x.image)}" alt="" width="240" height="160" loading="lazy" decoding="async"><span><b>${esc(PICKS[i][0])}</b>${esc(x.name)}</span></a>`).filter(Boolean).join("\n  ")}
</div>`;

  const chips = `<div class="bi-chips" role="group" aria-label="What's it for">
      <button type="button" class="bi-chip is-on" data-chip="" aria-pressed="true">All ${total}</button>
      ${sections.map(({ S, list }) => `<button type="button" class="bi-chip" data-chip="${S.id}" aria-pressed="false">${esc(S.chip)} <span>${list.length + ideas.filter((x) => x.section !== S.id && x.also.includes(S.id)).length}</span></button>`).join("\n      ")}
    </div>`;
  const selects = `<div class="bi-selects">
      <label><span>Guests</span><select data-f="g"><option value="">Any</option><option value="1-2">1–2</option><option value="3-6">3–6</option><option value="7-12">7–12</option><option value="13-999">13+</option></select></label>
      <label><span>Budget</span><select data-f="c"><option value="">Any</option><option value="0-39">Under $40</option><option value="40-79">$40–80</option><option value="80-149">$80–150</option><option value="150-9999">$150+</option></select></label>
      <label><span>Time</span><select data-f="m"><option value="">Any</option><option value="0-20">20 min max</option><option value="0-45">Under 45 min</option><option value="60-999">1 hour+</option></select></label>
      <label class="bi-search"><span>Search</span><input type="search" data-f="q" placeholder="brie, Italian, kids…" autocomplete="off"></label>
    </div>`;

  const body = sections.map(({ S, list }) => {
    let lis;
    if (S.id === "holiday") {
      // Folded view: the next three holidays, four ideas each.
      let last = null, rank = -1, inGroup = 0;
      lis = list.map((x, i) => {
        const hk = x.holiday || "";
        if (hk !== last) { rank++; inGroup = 0; }
        inGroup++;
        const fold = rank > 2 || inGroup > 4;
        const subFold = rank > 2;
        const sub = hk !== last ? `<li class="bi-sub${subFold ? " bi-x" : ""}" data-sub="${hk}"><span>${esc(HOLIDAY_LABEL[hk] || "Seasonal")}${next.get(hk) ? ` <time datetime="${next.get(hk)}">${new Date(`${next.get(hk)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time>` : ""}</span>${hk && holidays.some((y) => y.slug === hk) ? ` <a href="/holidays/${hk}/">${esc(HOLIDAY_LABEL[hk] || "")} page &rarr;</a>` : ""}</li>` : "";
        last = hk;
        const c = cardHtml(x, h);
        return sub + (fold ? c.replace('<li class="bi-card"', '<li class="bi-card bi-x"') : c);
      });
    } else {
      // Past the first SHOW cards, cards are folded until "Show all" is
      // pressed or a filter is on.
      lis = list.map((x, i) => {
        const c = cardHtml(x, h);
        return i >= SHOW ? c.replace('<li class="bi-card"', '<li class="bi-card bi-x"') : c;
      });
    }
    const capped = lis.some((li) => li.includes("bi-x"));
    const more = capped ? `<button type="button" class="bi-more" data-more aria-expanded="false">Show all ${list.length} ${esc(S.chip.toLowerCase())} ideas</button>` : "";
    return `<section class="bi-sec${capped ? " is-capped" : ""}" id="${S.id}" aria-labelledby="bi-${S.id}-h" data-sec="${S.id}">
    <h2 id="bi-${S.id}-h">${esc(S.h2)} <span class="bi-n">${list.length}</span></h2>
    <p class="bi-lead">${esc(S.lead)} <a href="${S.hub[0]}">${esc(S.hub[1])} &rarr;</a></p>
    <ul class="bi-grid">
${lis.join("\n")}
    </ul>
    ${more}
  </section>`;
  }).join("\n  ");

  const finder = `<div class="bi-wide bi-finder" id="finder">
  <div class="bi-bar" data-bar>
    ${chips}
    ${selects}
    <p class="bi-count" aria-live="polite"><span data-count>${total} ideas</span> <button type="button" class="bi-clear" data-clear hidden>Clear filters</button></p>
  </div>
  <p class="bi-none" data-none hidden>No board matches all of those. Try a wider budget or guest count, or <button type="button" data-clear>clear the filters</button>.</p>
  ${body}
</div>`;

  // By the numbers: medians per section from the plans' own estimates.
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0; };
  const priced = ideas.filter((x) => x.url.startsWith("/boards/") && x.c[0] && x.g[0]);
  const perGuest = (x) => ((x.c[0] + x.c[1]) / 2) / ((x.g[0] + x.g[1]) / 2);
  const money = (n) => (n >= 10 ? `$${Math.round(n)}` : `$${n.toFixed(2)}`);
  const rows = sections.map(({ S }) => {
    const L = priced.filter((x) => x.section === S.id);
    if (L.length < 3) return "";
    return `<tr><th scope="row"><a href="#${S.id}">${esc(S.chip)}</a></th><td>${L.length}</td><td>${money(med(L.map((x) => (x.c[0] + x.c[1]) / 2)))}</td><td>${money(med(L.map(perGuest)))}</td><td>${Math.round(med(L.map((x) => x.m)))} min</td></tr>`;
  }).join("");
  const cheapest = [...priced].sort((a, b) => perGuest(a) - perGuest(b))[0];
  const stats = `<div class="bi-stats">
  <div class="bi-stat-row">
    <p><b>${priced.length}</b> boards priced</p>
    <p><b>${money(med(priced.map(perGuest)))}</b> typical cost a guest</p>
    <p><b>${Math.round(med(priced.map((x) => x.m)))} min</b> typical build</p>
    <p><b>${priced.filter((x) => x.m && x.m <= 20).length}</b> boards in 20 min or less</p>
  </div>
  <div class="bi-table-wrap"><table class="bi-table">
    <caption>Typical board by type (medians)</caption>
    <thead><tr><th scope="col">Type</th><th scope="col">Boards</th><th scope="col">Total</th><th scope="col">A guest</th><th scope="col">Build</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <p class="bi-note">Medians of the cost and time estimates on our board plans, at 2026 US supermarket prices. The cheapest per guest is the <a href="${cheapest.url}">${esc(cheapest.name)}</a> at about ${money(perGuest(cheapest))} a guest. Shaped showpieces take longest because of the build, not the shopping.</p>
</div>`;

  const hols = holidays.filter((x) => (x.status || "published") === "published" && next.get(x.slug)).sort((a, b) => next.get(a.slug).localeCompare(next.get(b.slug)));
  const holidayStrip = `<ul class="bi-hols">
  ${hols.map((x) => `<li><a href="/holidays/${x.slug}/"><time datetime="${next.get(x.slug)}">${new Date(`${next.get(x.slug)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time><span>${esc(x.h1 || x.name)}</span></a></li>`).join("\n  ")}
</ul>`;

  const schema = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Charcuterie board ideas",
    url: `https://charcuterielab.com${IDEAS_PATH}`,
    numberOfItems: total,
    itemListElement: sections.flatMap(({ list }) => list).map((x, i) => ({ "@type": "ListItem", position: i + 1, url: `https://charcuterielab.com${x.url}`, name: x.name, image: `https://charcuterielab.com${x.image}` }))
  }).replace(/</g, "\\u003c")}</script>`;

  return { total, picks, finder, stats, holidayStrip, schema, js: FINDER_JS };
}

export function boardIdeasHtml(html, h, data) {
  const P = boardIdeasParts(h, data);
  const mount = (name, inner) => { html = html.replace(new RegExp(`<div data-${name}></div>`), inner); };
  mount("board-picks", P.picks);
  mount("board-ideas", P.finder);
  mount("board-stats", P.stats);
  mount("board-holidays", P.holidayStrip);
  return html.replace("</body>", `${P.schema}\n${P.js}\n</body>`);
}

const FINDER_JS = `<script>(function(){
var root=document.getElementById("finder");if(!root)return;root.classList.add("is-live");
var cards=[].slice.call(root.querySelectorAll(".bi-card")),secs=[].slice.call(root.querySelectorAll(".bi-sec"));
var chips=[].slice.call(root.querySelectorAll("[data-chip]")),sel=[].slice.call(root.querySelectorAll("[data-f]"));
var count=root.querySelector("[data-count]"),none=root.querySelector("[data-none]"),clr=root.querySelector(".bi-clear");
var chip="";
function rng(v){if(!v)return null;var p=v.split("-");return[+p[0],+p[1]]}
function run(scroll){
 var f={};sel.forEach(function(s){f[s.getAttribute("data-f")]=s.value.trim().toLowerCase()});
 var g=rng(f.g),c=rng(f.c),m=rng(f.m),q=(f.q||"").split(/\\s+/).filter(Boolean);
 var active=!!(chip||g||c||m||q.length),n=0;
 cards.forEach(function(el){
  var ok=true,cg=el.getAttribute("data-g").split("-").map(Number),cc=+el.getAttribute("data-c"),cm=+el.getAttribute("data-m");
  if(chip&&(" "+el.getAttribute("data-s")+" ").indexOf(" "+chip+" ")<0)ok=false;
  if(ok&&g&&!(cg[0]<=g[1]&&cg[1]>=g[0]))ok=false;
  if(ok&&c&&!(cc&&cc>=c[0]&&cc<=c[1]))ok=false;
  if(ok&&m&&!(cm&&cm>=m[0]&&cm<=m[1]))ok=false;
  if(ok&&q.length){var t=el.getAttribute("data-q");for(var i=0;i<q.length;i++)if(t.indexOf(q[i])<0){ok=false;break}}
  el.hidden=!ok;if(ok)n++;
 });
 secs.forEach(function(s){
  var vis=s.querySelectorAll(".bi-card:not([hidden])").length;
  s.hidden=vis===0;s.classList.toggle("is-filtered",active);
  [].forEach.call(s.querySelectorAll(".bi-sub"),function(sub){var x=sub.nextElementSibling,any=false;while(x&&!x.classList.contains("bi-sub")){if(!x.hidden){any=true;break}x=x.nextElementSibling}sub.hidden=!any});
 });
 count.textContent=n+(n===1?" idea":" ideas");none.hidden=n>0;clr.hidden=!active;
 if(scroll){var top=root.getBoundingClientRect().top+window.pageYOffset-72;if(window.pageYOffset>top)window.scrollTo(0,top)}
}
chips.forEach(function(b){b.addEventListener("click",function(){
 chip=b.getAttribute("data-chip");chips.forEach(function(x){var on=x===b;x.classList.toggle("is-on",on);x.setAttribute("aria-pressed",on?"true":"false")});
 try{history.replaceState(null,"",chip?"#"+chip:location.pathname+location.search)}catch(e){}
 run(true);
})});
sel.forEach(function(s){s.addEventListener(s.tagName==="INPUT"?"input":"change",function(){run(false)})});
[].forEach.call(root.querySelectorAll("[data-clear]"),function(b){b.addEventListener("click",function(){sel.forEach(function(s){s.value=""});chips[0].click()})});
[].forEach.call(root.querySelectorAll("[data-more]"),function(b){b.addEventListener("click",function(){var s=b.closest(".bi-sec");var open=s.classList.toggle("is-open");b.setAttribute("aria-expanded",open?"true":"false");b.textContent=open?"Show fewer":b.getAttribute("data-label");if(!open){var t=s.getBoundingClientRect().top+window.pageYOffset-(window.innerWidth>760?230:76);window.scrollTo(0,t)}});b.setAttribute("data-label",b.textContent)});
var h=(location.hash||"").slice(1);
if(h){var hit=chips.filter(function(x){return x.getAttribute("data-chip")===h})[0];if(hit){hit.click();setTimeout(function(){root.scrollIntoView()},50)}}
})();</script>`;
