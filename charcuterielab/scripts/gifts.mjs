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

export { AMAZON_TAG } from "./affiliate.mjs";
import { AMAZON_TAG } from "./affiliate.mjs";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// 9 Nov 2026: a photo at the top of every gift guide. A guide-specific photo
// dropped at public/images/gifts/<slug>.(webp|jpg|png) wins; otherwise the
// guide's hub-card image is used.
const GIFT_IMG_DIR = fileURLToPath(new URL("../public/images/gifts/", import.meta.url));
function guidePhoto(g) {
  for (const ext of ["webp", "jpg", "png"]) if (existsSync(GIFT_IMG_DIR + `${g.slug}.${ext}`)) return `/images/gifts/${g.slug}.${ext}`;
  return g.image;
}
const PRICES_CHECKED = "October 2026";

export const GIFT_PATHS = ["/gifts/", "/gifts/charcuterie-books/", "/gifts/under-25/", "/gifts/hostess-gifts/", "/gifts/cheese-lovers/", "/gifts/stocking-stuffers/", "/gifts/white-elephant/", "/gifts/wine-and-cheese-lovers/", "/gifts/keto-gifts/", "/gifts/vegan-foodie-gifts/", "/gifts/housewarming/", "/gifts/for-him/", "/gifts/client-gifts/", "/gifts/luxury/", "/gifts/for-her/", "/gifts/ship-well/", "/gifts/under-50/", "/gifts/teacher-coworker/", "/gifts/has-everything/", "/gifts/secret-santa/", "/gifts/hanukkah/", "/gifts/wine-advent-calendars/", "/gifts/personalized-boards/", "/gifts/last-minute/"];

// Seasonal: "Gifts" sits in the top menu from Nov 1 to Dec 25 (build date).
export function giftsInNav(d = new Date()) {
  const m = d.getMonth(), day = d.getDate();
  return m === 10 || (m === 11 && day <= 25);
}

const amz = (u) => (AMAZON_TAG && /amazon\.com/.test(u) ? `${u}${u.includes("?") ? "&" : "?"}tag=${AMAZON_TAG}` : u);
const search = (q) => amz(`https://www.amazon.com/s?k=${encodeURIComponent(q).replace(/'/g, "%27")}`);
// Exact product page when the item has an ASIN (Associates only pays on the linked product).
const buyUrl = (it) => (it.asin ? amz(`https://www.amazon.com/dp/${it.asin}`) : search(it.q));

// ---------------------------------------------------------------- products
// Reusable third-party picks. price = typical range in USD.
const ITEMS = {
  knives3: { asin: "B07W6KG3ZV", name: "A 3-piece cheese knife set", price: [9, 15], q: "3 piece cheese knife set", note: "One soft-cheese knife, one spreader, one pointed knife for hard cheese. That covers every cheese on a board.", guide: ["Best cheese knife sets", "/blog/best-cheese-knife-sets/"] },
  boska: { asin: "B07B5JLMT8", name: "Boska Monaco+ cheese knife set", price: [50, 65], q: "Boska Monaco cheese knife set", note: "Dutch cheese-tool maker Boska's step-up set: a brie knife, a cheese knife and a Parmesan knife in satin-finish stainless steel.", guide: ["Best cheese knife sets", "/blog/best-cheese-knife-sets/"] },
  plane: { asin: "B0F38K8RS1", name: "A Norwegian cheese plane", price: [7, 18], q: "cheese plane slicer", note: "Shaves paper-thin slices of Gouda, Jarlsberg or Gruyère. Cheap, useful every day, and most people don't own one." },
  figSpread: { asin: "B00AOP0V82", name: "Dalmatia Original Fig Spread", price: [8, 12], q: "Dalmatia fig spread", note: "Our top-ranked fig jam: thick, seedy and not too sweet.", guide: ["Best fig jam, ranked", "/blog/best-fig-jam/"] },
  hotHoney: { asin: "B085B1YZ8Q", name: "A jar of hot honey", price: [9, 13], q: "hot honey", note: "Chili-infused honey for salami, pizza, fried chicken and sharp cheddar.", guide: ["Best hot honey, ranked", "/blog/best-hot-honey/"] },
  honeycomb: { asin: "B082XK9RQF", name: "A boxed honeycomb", price: [10, 20], q: "honeycomb comb honey", note: "The single prettiest thing you can put on a board. Pairs with blue cheese and aged cheddar.", guide: ["Best honey for cheese", "/blog/best-honey-for-cheese/"] },
  marcona: { asin: "B07VRZ8TK3", name: "Mitica Marcona almonds", price: [8, 12], q: "marcona almonds", note: "Spain's rounder, softer, butterier almond, fried in olive oil and salted.", guide: ["Best Marcona almonds", "/blog/best-marcona-almonds/"] },
  mustard: { asin: "B000SR5VOU", name: "A whole-grain mustard", price: [4, 9], q: "whole grain mustard", note: "The condiment hosts forget. It's what makes salami and cheddar taste finished.", guide: ["Best mustard for charcuterie", "/blog/best-mustard-for-charcuterie/"] },
  markers: { asin: "B0BGPRVXKX", name: "Slate cheese markers with slate pencils", price: [8, 12], q: "slate cheese markers chalk", note: "Little slate flags to label each cheese, so guests stop asking what everything is." },
  picks: { asin: "B08QCDZVCX", name: "Bamboo cocktail picks", price: [6, 10], q: "bamboo cocktail picks", note: "For olives, salami folds and cheese cubes. A host runs out of these at every party." },
  ramekins: { asin: "B0D53YPCWC", name: "A set of small dip cups", price: [8, 14], q: "small ramekins dip bowls set", note: "Jam, mustard, olives and nuts need small bowls, and most kitchens have two at most." },
  storage: { asin: "B00BEDW76W", name: "Formaticum cheese storage bags", price: [15, 20], q: "Formaticum cheese storage bags", note: "Two-ply cheese paper bags that let cheese breathe without drying out. Cheese shops use the same paper.", guide: ["How to store cheese", "/blog/cheese-storage/"] },
  acacia: { asin: "B09TW7151H", name: "An acacia wood serving board", price: [15, 25], q: "acacia wood charcuterie board", note: "Dense, affordable hardwood with a warm grain. Look for 16 inches or longer.", guide: ["Best charcuterie boards to buy", "/blog/best-charcuterie-boards/"] },
  slate: { asin: "B09D77M6SZ", name: "Two slate cheese boards with chalk", price: [25, 32], q: "slate cheese board with chalk", note: "Black slate makes every cheese and meat stand out, and you can write the names right on it.", guide: ["Best charcuterie boards to buy", "/blog/best-charcuterie-boards/"] },
  dome: { asin: "B0DCYL6893", name: "A glass cheese dome", price: [22, 30], q: "glass cheese dome with board", note: "Keeps a cut wedge covered on the counter while it comes to room temperature." },
  club: { name: "A cheese-of-the-month club", price: null, tier: "$$$$", href: "/blog/best-cheese-of-the-month-clubs/", hrefLabel: "See our ranked clubs", note: "Murray's Cheese and several other shops ship a monthly box of cheeses picked by a cheesemonger. Check each club's plans for current prices." },
  kit: { asin: "B07SC4LBZM", name: "A beginner mozzarella and ricotta kit", price: [25, 32], q: "mozzarella cheese making kit", note: "Fresh mozzarella in about an hour from a gallon of milk. A fun first step for a cheese lover who cooks." },
  veganCheese: { asin: "B0DS2VX15C", name: "Boursin Dairy-Free Garlic & Herbs", price: [15, 20], q: "Boursin dairy free garlic herbs", note: "Our top-ranked vegan cheese for a board: spreadable, garlicky and close to the original.", guide: ["Best vegan cheese, ranked", "/blog/best-vegan-cheese/"] },
  olives: { asin: "B07NV7D17M", name: "Mezzetta Castelvetrano olives", price: [12, 16], q: "Mezzetta Castelvetrano olives", note: "Our top-ranked olive: bright green, buttery and mild enough for people who say they don't like olives.", guide: ["Best olives, ranked", "/blog/best-olives-for-charcuterie/"] },
  chocolate: { asin: "B087K17C7Q", name: "Tony's Chocolonely Dark Chocolate 70%", price: [14, 18], q: "Tony's Chocolonely dark chocolate 70", note: "Our top-ranked dark chocolate for a board. Break it into shards next to the blue cheese.", guide: ["Best dark chocolate, ranked", "/blog/best-dark-chocolate/"] },
  cheeseCrisps: { asin: "B0D14Y8TWK", name: "Mrs. Cubbison's Parmesan cheese crisps (4-pack)", price: [10, 14], q: "parmesan cheese crisps", note: "Crunchy crisps made from nothing but baked cheese. The keto stand-in for crackers." },
  porkRinds: { asin: "B08WKZ3MLR", name: "A 6-pack of pork rinds", price: [10, 15], q: "pork rinds", note: "Zero-carb crunch for dips and soft cheese, and better than people expect." },
  salami: { asin: "B01MYXAWVD", name: "A whole dry salami", price: [12, 16], q: "whole dry salami", note: "Whole and unopened, a dry salami keeps about 6 weeks in the pantry (USDA). A gift that waits for the next party.", guide: ["Best salami, ranked", "/blog/best-salami-brands/"] },
  aerator: { asin: "B07DSX9RSP", name: "A handheld wine aerator", price: [12, 18], q: "handheld wine aerator pourer", note: "Pours young red wine through a stream of air, which softens harsh tannins in seconds." },
  glasses: { asin: "B08GKNR1QL", name: "A pair of all-purpose wine glasses", price: [12, 20], q: "all purpose wine glasses set of 2", note: "One good tulip-shaped glass works for red, white and sparkling. Most people own mismatched ones." },
  honeyDipper: { asin: "B0CN2TXGJ7", name: "Wooden honey dippers (set of 4)", price: [5, 8], q: "wooden honey dipper", note: "The tiny tool that keeps honey off the board and on the cheese." },
  coasters: { asin: "B08R84RPYY", name: "Slate coasters", price: [15, 20], q: "slate coasters set", note: "They match a slate board and take a sweating glass without a ring." },
  wineGuide: { name: "Wine & Cheese Pairing Guide (printable)", price: [4, 4], href: "/printables/wine-cheese-pairing-guide/", note: "Our printable chart of which cheeses go with which wines. Print it, fold it into the card, done." },
  styling: { name: "Board Styling Playbook (printable)", price: [4, 4], href: "/printables/board-styling-playbook/", note: "Our printable guide to salami roses, cheese cuts and layout. Prints in minutes for a last-minute add-on." },
  // Added 19 Oct 2026 for /gifts/for-him/ and /gifts/client-gifts/. Sources are on the linked guides.
  wusthofPlane: { asin: "B08XK14FNK", name: "Wüsthof Gourmet cheese plane", price: [40, 50], q: "Wusthof Gourmet cheese plane", note: "Won America's Test Kitchen's test of nine cheese planes for clean, even slices every time. A tool he'll use on every block of cheddar.", guide: ["Best cheese knife sets", "/blog/best-cheese-knife-sets/"] },
  laguiole: { asin: "B01N3P0S37", name: "Laguiole by Jean Dubost 3-piece cheese set", price: [55, 70], q: "Jean Dubost Laguiole 3 piece cheese set", note: "A French cleaver, a fork-tipped knife and a spreader, boxed and ready to give. The set people leave out on the counter.", guide: ["Best cheese knife sets", "/blog/best-cheese-knife-sets/"] },
  glencairn: { asin: "B0747LBSVT", name: "A pair of Glencairn whisky glasses", price: [20, 30], q: "Glencairn whisky glass set of 2", note: "The Scottish tulip-shaped tasting glass, made to concentrate a whisky's aroma. Give it with a block of aged cheddar and our pairing guide.", guide: ["Whiskey and cheese pairing", "/blog/whiskey-and-cheese-pairing/"] },
  giftBox: { name: "A meat and cheese gift box", price: [30, 190], href: "/blog/best-charcuterie-gift-boxes/", hrefLabel: "See our ranked gift boxes", note: "We ranked ten. Our top pick is Harry & David's Ultimate Meat and Cheese box, about 5.5 lb of sausage, salami, cheese and crackers for about $110." },
  ctft: { asin: "B08HFLNS6T", name: "RoyalHouse bamboo cheese board and knife set", price: [20, 30], q: "RoyalHouse bamboo cheese board knife set", note: "A bamboo board with a slide-out drawer of four cheese knives. The same design NBC Select picked from CTFT, whose set now costs about $80.", guide: ["Best charcuterie boards to buy", "/blog/best-charcuterie-boards/"] },
  engraved: { name: "Mark & Graham engraved wood and marble cheese board", price: [45, 70], buy: ["See it at Mark & Graham", "https://www.markandgraham.com/"], note: "Acacia and marble, in two sizes, and it can be engraved with initials or a company name. An NBC Select reviewer said it feels heavy and good quality.", guide: ["Best charcuterie boards to buy", "/blog/best-charcuterie-boards/"] },
  harryDavid: { name: "Harry & David Ultimate Meat and Cheese Gift Box", price: [100, 120], buy: ["See it at Harry & David", "https://www.harryanddavid.com/"], note: "About 5.5 lb of sausage, salami, cheese and crackers from a name clients recognize. Our top-ranked gift box.", guide: ["Best charcuterie gift boxes", "/blog/best-charcuterie-gift-boxes/"] },
  boarderie: { name: "Boarderie ready-to-serve board", price: [129, 139], buy: ["See it at Boarderie", "https://www.boarderie.com/"], note: "Arrives already arranged on a wooden board, with free overnight shipping. Nothing to slice or plate, so it can go straight onto a conference table.", guide: ["Best charcuterie gift boxes", "/blog/best-charcuterie-gift-boxes/"] },
  // Added 9 Nov 2026 for the gap guides: our own printables and the advent calendar roundup (no Amazon links).
  advent: { name: "A cheese advent calendar", price: [30, 90], href: "/blog/cheese-advent-calendars-2026/", hrefLabel: "See this year's calendars", note: "Twelve to twenty-four small cheeses to open one a day in December. The popular ones sell out, so check which are still in stock before you buy." },
  cheesePack: { name: "Cheese Lover's Pack (printables)", price: [10, 10], href: "/printables/cheese-lovers-pack/", note: "Two cheese field guides, a pairing card deck and an all-cheese board plan in one download. Print it and tuck it in a card." },
  cardDeck: { name: "Pairing Card Deck (printable)", price: [5, 5], href: "/printables/pairing-card-deck/", note: "Print it, cut it out, and pull the cards for whatever is in the fridge. A small gift for anyone who builds boards." },
  softGuide: { name: "Soft Cheese Field Guide (printable)", price: [5, 5], href: "/printables/soft-cheese-field-guide/", note: "The ten soft cheeses at the store, from brie to burrata: what to buy, how long to leave each out and what goes with it." },
  diyAdvent: { name: "DIY Cheese Advent Calendar Kit (printable)", price: [4, 4], href: "/printables/diy-cheese-advent-calendar-kit/", note: "A 12- or 24-night plan with the cheese for each night, the shopping list and printable door numbers. Build your own calendar from the cheese counter." },
  // Added 9 Nov 2026 for /gifts/wine-advent-calendars/. Prices from each retailer's 2026 page, checked 9 Nov 2026.
  igtFood: { name: "In Good Taste Food Pairing Wine Advent Calendar", price: [115, 115], buy: ["See it at In Good Taste", "https://ingoodtaste.com/products/wine-advent-calendar"], note: "24 single-glass (187ml) bottles, each with a food to pair it with, so every night becomes a small board. Free shipping; an adult 21+ signs for it, and it doesn't ship to AK, AR, DE, HI, MS, RI or UT." },
  igtMixed: { name: "In Good Taste Wine Advent Calendar (Mixed)", price: [140, 150], buy: ["See it at In Good Taste", "https://ingoodtaste.com/products/wine-advent-calendar"], note: "Taste of Home's best overall: 24 single-glass bottles of red, white and rosé, about $140, or $150 for the all-red, white-and-rosé or cocktail versions. Free shipping, 21+ signature, same state limits as above." },
  totalWineAdvent: { name: "Total Wine Wine Advent Calendar 2026", price: [75, 90], buy: ["See it at Total Wine", "https://www.totalwine.com/wine/gift-baskets-sets/gift-baskets/wine-advent-calendar-2026/p/2126275579"], note: "24 single-glass (187ml) bottles for $74.99 on sale ($89.99 regular). Taste of Home's best value, and you can often pick it up at a store the same day." },
  vinebox: { name: "Vinebox 12 Nights wine advent calendar", price: [139, 229], buy: ["See it at Vinebox", "https://vinebox.com/"], note: "Twelve 100ml glass vials of European wine for $139, or 24 for $229, with $5 shipping. Small pours, so it suits someone who wants to taste, not drink a glass a night." },
  laithwaites: { name: "Laithwaites 2026 wine advent calendar", price: [160, 160], buy: ["See it at Laithwaites", "https://www.laithwaites.com/advent"], note: "24 single-glass bottles in real glass, $159.99 with free shipping. An adult 21+ has to sign for it." },
  // Added 9 Nov 2026 for /gifts/personalized-boards/. Prices as listed 9 Nov 2026.
  mgSleigh: { name: "Mark & Graham wood sleigh cheese board", price: [46, 61], buy: ["See it at Mark & Graham", "https://www.markandgraham.com/shop/personalized-bar-entertaining/personalized-cheeseboards/"], note: "A wood board on little sleigh runners, about $46 plus $15 to laser-engrave a monogram or a short phrase." },
  mgOak: { name: "Mark & Graham oak cheese board and wine decanter set", price: [55, 68], buy: ["See it at Mark & Graham", "https://www.markandgraham.com/shop/personalized-bar-entertaining/personalized-cheeseboards/"], note: "An FSC-certified oak board with a glass decanter, about $43 on sale ($55 regular), plus $12.50 to engrave a monogram on the board." },
  ugRecipe: { name: "Uncommon Goods personalized family recipe board", price: [100, 100], buy: ["See it at Uncommon Goods", "https://www.uncommongoods.com/sets/personalized-charcuterie-board"], note: "A family recipe, in the original handwriting, engraved into the board. Rated 4.7 from 230 reviews. Use it for serving; keep it off cutting duty so the engraving lasts." },
  ugMap: { name: "Uncommon Goods custom map board", price: [55, 75], buy: ["See it at Uncommon Goods", "https://www.uncommongoods.com/sets/personalized-charcuterie-board"], note: "The street map around an address that matters (a first home, a wedding venue) engraved into the wood. Rated 4.9 from 107 reviews." },
  ugSwivel: { name: "Uncommon Goods personalized swivel cheese board", price: [55, 85], buy: ["See it at Uncommon Goods", "https://www.uncommongoods.com/sets/personalized-charcuterie-board"], note: "A compact board whose top swings aside to show a drawer of cheese knives underneath, engraved with a name or date." },
  ugMonogram: { name: "Uncommon Goods monogram cheese and crackers board", price: [43, 85], buy: ["See it at Uncommon Goods", "https://www.uncommongoods.com/sets/personalized-charcuterie-board"], note: "Their initial is carved into the board as a well, and the crackers nest inside it. On sale for $42.99 when we checked ($85 regular)." },
  swissColony: { asin: "B0CT2FX47Z", name: "Farmers Market meat and cheese gift box", price: [20, 25], q: "Swiss Colony sausage and cheese gift", note: "Beef summer sausage, Vermont sharp cheddar, crackers and mustard in one shelf-stable box, about $22: under the $25 limit, so it works for a long client list.", guide: ["Best charcuterie gift boxes", "/blog/best-charcuterie-gift-boxes/"] }
};

// Other authors' books (no affiliation). Honest one-liners.
const OTHER_BOOKS = {
  mullen: { asin: "0593157591", name: "That Cheese Plate Will Change Your Life", by: "Marissa Mullen", price: [14, 20], q: "That Cheese Plate Will Change Your Life Marissa Mullen", note: "A colourful, step-by-step styling book built on Mullen's \"Cheese by Numbers\" method. Great for someone who loves how boards look." },
  balslev: { asin: "1524878049", name: "Little Book of Charcuterie and Cheese", by: "Lynda Balslev", price: [7, 16], q: "Little Book of Charcuterie and Cheese Balslev", note: "A small hardback with pairing basics and simple board ideas. Fits in a stocking." },
  ruhlman: { asin: "0393240053", name: "Charcuterie: The Craft of Salting, Smoking, and Curing", by: "Michael Ruhlman and Brian Polcyn", price: [22, 30], q: "Charcuterie Craft of Salting Smoking Curing Ruhlman", note: "The classic on making your own bacon, sausage and cured meats. For the person who wants to cure, not just serve." }
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
    quick: "Best overall: <strong>50 Boards, Built by Science</strong> ($25.99), 50 boards with shopping lists. Adventurous eater: <strong>Around the World in 16 Boards</strong> ($16.99). Wants to cure meat: <em>Charcuterie</em> by Ruhlman and Polcyn.",
    intro: "A board book is a gift that keeps paying off: the person gets the book, and you get invited to the boards. The best ones tell the reader exactly what to buy and how much, not just what a board looks like in a photo. We wrote seven of the books below, and we've put them where they genuinely fit. The other three are the outside books we'd point a friend to.",
    method: "We wrote the Charcuterie Lab books, so take our ranking of them with that in mind. The other books are researched picks; we have no connection to their authors or publishers.",
    picks: [
      { book: "main", best: "Best overall · the host or the beginner", why: "Fifty complete boards for every occasion, from a $25 budget board to a 30-person showstopper. Every board has the shopping list with amounts, the order to build it and a swap for every ingredient, so the person can make a board the night they open it." },
      { book: "impossible", best: "Best for the host who loves a showpiece", why: "Twenty-five shaped boards built to make guests ask \"How?\": a salami dragon, a giant octopus, a fondue volcano and a cake made of cheese. Each one has the trick that makes it work, a full shopping list for 12 to 15 and eight build steps. The paperback is the showiest book here to unwrap." },
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
    related: [["Gifts for cheese lovers", "/gifts/cheese-lovers/"], ["Charcuterie gifts under $25", "/gifts/under-25/"], ["All our books", "/shop/#ebooks"]]
  },
  {
    slug: "under-25",
    card: "Charcuterie gifts under $25",
    cardLine: "11 gifts that look like you spent more",
    image: "/images/charcuterie-gift-box-25.jpg",
    seoTitle: "Charcuterie Gifts Under $25: 11 Ideas for 2026",
    h1: "Charcuterie gifts under $25 that look like you spent more",
    kicker: "Gift guide · Under $25",
    description: "11 charcuterie and cheese gifts under $25: a board book, cheese knives, fig spread, hot honey, honeycomb, Marcona almonds, slate markers and more, with what each is for.",
    quick: "Best under $25: <strong>Around the World in 16 Boards</strong> ($16.99) plus a jar of <strong>Dalmatia fig spread</strong>, about $25 total. Also good: a cheese knife set, honeycomb or Marcona almonds.",
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
    seoTitle: "Hostess Gifts for Foodies: 10 Charcuterie Ideas (2026)",
    h1: "Hostess gifts for foodies: 10 charcuterie ideas the host will actually use",
    kicker: "Gift guide · Hostess gifts",
    description: "10 hostess gifts for a host who loves charcuterie: a board book with fig jam, honeycomb, Marcona almonds, a condiment trio, cheese knives and more. Plus what not to bring.",
    quick: "Best gift: something for <strong>after</strong> the party, like <strong>50 Boards, Built by Science</strong> ($25.99) with a jar of fig spread, about $33. Under $20: honeycomb, Marcona almonds or hot honey.",
    intro: "The rule for hostess gifts is simple: don't give the host a job. Flowers need a vase, and a dish you expect to see served changes their menu. The best gifts keep. A book, a jar of something good or a tool for their next board can all be set aside tonight and enjoyed next week.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below.",
    picks: [
      { book: "main", best: "Best overall", why: "Fifty complete boards for the next party they throw. Tie a jar of fig spread to it with ribbon and you have a $33 gift that looks planned." },
      { book: "impossible", best: "Best for a host who goes all out", why: "Twenty-five showpiece boards, from a pirate ship to Santa's sleigh, each with the one trick that makes it work and a shopping list for 12 to 15. For the friend whose parties everyone photographs." },
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
    quick: "Makes their cheese better: <strong>Formaticum storage bags</strong> ($14–18) or a <strong>Boska knife set</strong> ($30–45). For a cheese nerd: <strong>The Ingredient Guide</strong> or <strong>50 Boards, Built by Science</strong> ($25.99).",
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
    related: [["Cheese advent calendars 2026", "/blog/cheese-advent-calendars-2026/"], ["Best charcuterie books", "/gifts/charcuterie-books/"], ["How to store cheese", "/blog/cheese-storage/"], ["Cheese ingredient library", "/ingredients/"], ["Hanukkah gifts for a cheese lover", "/gifts/hanukkah/"]]
  },
  {
    slug: "stocking-stuffers",
    card: "Charcuterie stocking stuffers",
    cardLine: "12 small gifts, most under $15",
    image: "/images/christmas-charcuterie-board.png",
    seoTitle: "Charcuterie Stocking Stuffers 2026: 12 Gifts Under $20",
    h1: "Charcuterie stocking stuffers: 12 small gifts for board lovers",
    kicker: "Gift guide · Stocking stuffers",
    description: "12 charcuterie stocking stuffers, most under $15: a cheese plane, fig spread, hot honey, Marcona almonds, slate cheese markers, a small board book and more.",
    quick: "Small, useful and edible: a <strong>cheese plane</strong> ($10–18), <strong>fig spread</strong>, <strong>hot honey</strong> or <strong>Marcona almonds</strong>. A book that fits: <strong>Around the World in 16 Boards</strong> ($16.99).",
    intro: "A good stocking stuffer for a board lover is either a small tool they'll use every week or something good to eat that they wouldn't buy for themselves. Everything below fits in a stocking, and most of it costs less than $15.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books.",
    picks: [
      { item: "plane", best: "Best overall" },
      { item: "figSpread", best: "Best jar" },
      { item: "hotHoney", best: "Best for spice lovers" },
      { item: "marcona", best: "Best snack" },
      { item: "markers", best: "Best for the host" },
      { book: "world", best: "Best book that fits", why: "Sixteen international boards with shopping lists. At 8.5 by 11 inches it fits a big stocking, or tuck the free gift card in instead and wrap the book separately." },
      { other: "balslev", best: "Best small book" },
      { item: "chocolate", best: "Best sweet" },
      { item: "honeyDipper", best: "Best under $10" },
      { item: "picks", best: "Best tiny add-on" },
      { item: "storage", best: "Best for cheese lovers" },
      { item: "mustard", best: "Best jar under $10" }
    ],
    set: "stocking",
    faq: [
      ["What is a good charcuterie stocking stuffer?", "A cheese plane, a jar of fig spread or hot honey, Marcona almonds or slate cheese markers. Small, useful and edible gifts work best."],
      ["Can you put food in a stocking?", "Yes, if it's shelf-stable: sealed jars, nuts, chocolate and a whole unopened dry salami all keep at room temperature. Leave cheese out of the stocking and give it from the fridge."],
      ["What is a cheese plane?", "A flat server with a slot blade that shaves thin, even slices off semi-hard cheese like Gouda, Jarlsberg and Gruyère. It's the most-used cheese tool in Norway, where it was invented."],
      ["What small book makes a good stocking stuffer?", "Little Book of Charcuterie and Cheese by Lynda Balslev is pocket-sized. Around the World in 16 Boards ($16.99) is larger but fits a big stocking."],
      ["What fits in a stocking?", "A cheese plane, a jar of hot honey or fig spread, Marcona almonds, slate cheese markers and a chocolate bar all fit, and none of them need the fridge."]
    ],
    related: [["Charcuterie gifts under $25", "/gifts/under-25/"], ["White elephant gifts", "/gifts/white-elephant/"], ["Best charcuterie books", "/gifts/charcuterie-books/"], ["Secret Santa gifts by budget", "/gifts/secret-santa/"]]
  },
  {
    slug: "white-elephant",
    card: "Charcuterie white elephant gifts",
    cardLine: "10 gifts people will actually steal",
    image: "/images/christmas-wreath-charcuterie-board.jpg",
    seoTitle: "White Elephant Gifts 2026: 10 Charcuterie Ideas People Steal",
    h1: "Charcuterie white elephant gifts people will actually steal",
    kicker: "Gift guide · White elephant",
    description: "10 charcuterie white elephant gift ideas for a $25 to $40 limit: a board book with cheese knives, a slate board, honeycomb, a salami and jam kit and more.",
    quick: "The one that gets stolen: <strong>50 Boards, Built by Science</strong> ($25.99) plus a <strong>cheese knife set</strong>, about $38–46. Under $25: a <strong>slate board with chalk</strong> or a salami, fig spread and almond kit.",
    intro: "White elephant gifts live or die on one test: would half the room want it? Charcuterie gifts pass, because almost everyone eats cheese and nobody minds a party upgrade. Here's what works at the usual $25 to $40 limit.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books.",
    picks: [
      { book: "main", best: "Best overall", why: "Fifty complete boards, each with a shopping list and build order. Add a cheese knife set and it's the gift people steal twice." },
      { item: "slate", best: "Best under $30" },
      { item: "knives3", best: "Best add-on" },
      { item: "salami", best: "Best edible kit, part 1", why: "Build a kit: a whole dry salami, a jar of fig spread and a bag of Marcona almonds, about $25 together. Everything keeps at room temperature." },
      { item: "honeycomb", best: "Best looking" },
      { item: "acacia", best: "Best board" },
      { book: "world", best: "Best under $20", why: "Sixteen international boards for $16.99. Pair it with a jar of fig spread to hit a $25 limit." },
      { item: "ramekins", best: "Best practical" },
      { item: "kit", best: "Best fun one" },
      { item: "dome", best: "Best splurge" }
    ],
    set: "elephant",
    faq: [
      ["Is charcuterie a good white elephant gift?", "Yes. Almost everyone eats cheese, and boards, knives and board books are useful to anyone who hosts. Edible kits also get traded happily."],
      ["What is a good charcuterie gift for a $25 limit?", "Around the World in 16 Boards ($16.99) with a jar of fig spread, a slate cheese board with chalk, or a kit of a whole dry salami, fig spread and Marcona almonds."],
      ["Can I put cheese in a white elephant gift?", "Only if the gift goes straight into a fridge. Gifts sit under a tree for hours, so stick to shelf-stable items: whole dry salami, jars, nuts, crackers and chocolate."],
      ["What white elephant gifts get stolen most?", "Useful, good-looking things everyone wants: a board with knives, a book with a knife set or a well-packed food kit. Gag gifts get laughs but rarely get stolen."],
      ["How do I wrap a charcuterie kit?", "Use a small wooden crate or a box lined with crinkle paper, stand the jars upright and put the salami on top. A board book underneath doubles as the base."]
    ],
    related: [["Stocking stuffers", "/gifts/stocking-stuffers/"], ["DIY charcuterie gift basket", "/blog/charcuterie-gift-basket/"], ["Charcuterie gifts under $25", "/gifts/under-25/"], ["Secret Santa gifts by budget", "/gifts/secret-santa/"]]
  },
  {
    slug: "wine-and-cheese-lovers",
    card: "Gifts for wine and cheese lovers",
    cardLine: "11 gifts for the person who pairs everything",
    image: "/images/wine-cheese-board.png",
    seoTitle: "Gifts for Wine and Cheese Lovers: 11 Ideas (2026)",
    h1: "Gifts for wine and cheese lovers: 11 ideas for the person who pairs everything",
    kicker: "Gift guide · Wine and cheese",
    description: "11 gifts for wine and cheese lovers: a board book with a wine and cheese board, a pairing chart, a slate board, Boska knives, wine glasses, an aerator and more.",
    quick: "To help them pair: <strong>50 Boards, Built by Science</strong> ($25.99) or a <strong>glass cheese dome</strong> ($22–30). For the table: a <strong>slate board</strong> or a <strong>Boska knife set</strong>.",
    intro: "People who love wine and cheese usually have the wine covered. What helps is everything around the glass: knowing which cheese goes with which bottle, something to serve it on, and the small tools that make an evening of it.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books.",
    picks: [
      { book: "main", best: "Best overall", why: "Fifty complete boards, including a wine and cheese pairing board and a beer and charcuterie board, each with a shopping list and the pairing logic behind it." },
      { item: "dome", best: "Best for the cheese side" },
      { item: "slate", best: "Best board" },
      { item: "boska", best: "Best knife set" },
      { item: "glasses", best: "Best for the glass" },
      { item: "aerator", best: "Best for red wine fans" },
      { item: "markers", best: "Best for tastings" },
      { book: "world", best: "Best for wine travelers", why: "Sixteen international boards, from Spain to France to Greece. Pair it with a bottle from one of the countries." },
      { item: "honeycomb", best: "Best edible" },
      { item: "chocolate", best: "Best for dessert wine" },
      { item: "coasters", best: "Best small gift" }
    ],
    set: "wine",
    faq: [
      ["What do you get a wine and cheese lover?", "Something that helps them pair and serve: a board book with pairing boards, a wine and cheese pairing chart, a slate board, a good knife set or a pair of all-purpose wine glasses."],
      ["What cheese goes with red wine?", "Aged, firm cheeses like aged cheddar, Manchego, Gouda and Parmigiano-Reggiano stand up to tannic reds. Soft, creamy cheeses usually do better with white or sparkling wine."],
      ["Is a wine aerator worth it?", "For young, tannic red wines, yes: it softens them in seconds instead of an hour in a decanter. It does little for white wine or older reds."],
      ["What should I put in a wine and cheese gift basket?", "Two or three cheeses of different textures, crackers, fig spread, Marcona almonds, dark chocolate and a bottle. Add the cheese last, right before you hand it over, and tell them to refrigerate it."],
      ["What is a good wine and cheese book?", "50 Boards, Built by Science has a full wine and cheese pairing board and pairing logic on every board. For styling, That Cheese Plate Will Change Your Life is popular."]
    ],
    related: [["Gifts for cheese lovers", "/gifts/cheese-lovers/"], ["Cheese and wine advent calendars 2026", "/blog/cheese-advent-calendars-2026/"], ["Wine pairings for charcuterie", "/pairings/"], ["Hostess gifts", "/gifts/hostess-gifts/"], ["Wine advent calendars 2026", "/gifts/wine-advent-calendars/"]]
  },
  {
    slug: "keto-gifts",
    card: "Gifts for keto friends",
    cardLine: "10 low-carb gifts that aren't diet food",
    image: "/images/books/keto/board-01.webp",
    seoTitle: "Keto Gifts 2026: 10 Low-Carb Gift Ideas (Not Diet Food)",
    h1: "Gifts for keto friends: 10 low-carb ideas that aren't diet food",
    kicker: "Gift guide · Keto",
    description: "10 gifts for someone on keto or low-carb: a keto charcuterie board book, a cheese plane, Parmesan crisps, Marcona almonds, olives, salami and more.",
    quick: "Best gift: <strong>Keto & Low-Carb Boards</strong> (ebook $9.99), 20 boards at 4–9 g net carbs each. Add-ons: a <strong>cheese plane</strong>, <strong>Parmesan crisps</strong> and <strong>Castelvetrano olives</strong>.",
    intro: "Most holiday gifts are sugar. A keto friend gets a lot of things they can't eat. Charcuterie is the exception: cheese, cured meat, olives and nuts are naturally low in carbs. Here are gifts that celebrate what they can have.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Nothing here is medical advice.",
    picks: [
      { book: "keto", best: "Best overall", why: "Twenty charcuterie boards at 4 to 9 g net carbs per serving, each with calories, fat, protein and net carbs from USDA data, and a shopping list with the net carbs of every item." },
      { item: "cheeseCrisps", best: "Best cracker swap" },
      { item: "plane", best: "Best tool" },
      { item: "olives", best: "Best jar" },
      { item: "salami", best: "Best protein" },
      { item: "marcona", best: "Best snack" },
      { item: "porkRinds", best: "Best crunch" },
      { item: "boska", best: "Best splurge tool" },
      { item: "mustard", best: "Best zero-sugar condiment", why: "Most whole-grain mustards have little or no sugar, unlike jams and honey. It's the condiment a keto board can keep." },
      { item: "slate", best: "Best board" }
    ],
    set: "keto",
    faq: [
      ["What do you get someone on keto for Christmas?", "Food they can eat, done well: a keto charcuterie book, good salami, Castelvetrano olives, Marcona almonds, Parmesan crisps or a cheese plane. Skip chocolate boxes and baked goods."],
      ["Is charcuterie keto?", "Mostly. Cured meats, aged cheeses, olives and nuts are low in carbs. The carbs on a normal board come from crackers, bread, honey, jam and dried fruit, so a keto board swaps those out."],
      ["Are Marcona almonds keto?", "In moderation. Almonds have about 2 to 3 g net carbs per ounce, which fits most keto plans."],
      ["What crackers are keto-friendly?", "Crisps made from baked cheese, like Parmesan crisps, have almost no carbs. Pork rinds and cucumber rounds also work."],
      ["Is the keto board book a paperback?", "Yes, Keto & Low-Carb Boards is a full-color paperback on Amazon at $16.99. The ebook is also available as an instant PDF download, which works as a last-minute gift."]
    ],
    related: [["Keto & Low-Carb Boards", "/books/keto-charcuterie-boards/"], ["Keto charcuterie board", "/blog/keto-charcuterie-board/"], ["Gifts for cheese lovers", "/gifts/cheese-lovers/"]]
  },
  {
    slug: "vegan-foodie-gifts",
    card: "Gifts for vegan foodies",
    cardLine: "10 plant-based gifts for the board lover",
    image: "/images/books/plant/board-01.webp",
    seoTitle: "Vegan Gifts for Foodies: 10 Plant-Based Ideas (2026)",
    h1: "Gifts for vegan foodies: 10 plant-based ideas for the board lover",
    kicker: "Gift guide · Vegan",
    description: "10 gifts for a vegan foodie: a plant-based charcuterie board book, vegan cheese, olives, fig spread, Marcona almonds, dark chocolate, a serving board and more.",
    quick: "Best gift: <strong>15 Show-Stopping Plant-Based Boards</strong> ($18.99), 15 boards with no meat or dairy. Add-ons: <strong>Boursin Dairy-Free</strong> and a jar of <strong>Castelvetrano olives</strong>.",
    intro: "Vegans spend a lot of parties eating the grapes off someone else's cheese board. A plant-based board gift says you thought about them specifically. Everything below is vegan; we've left honey off the list on purpose.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Always check labels; recipes change.",
    picks: [
      { book: "plant", best: "Best overall", why: "Fifteen boards with no meat and no dairy, each with a shopping list, a step-by-step build and the pairing science, so the board looks as full as any other." },
      { item: "veganCheese", best: "Best vegan cheese" },
      { item: "olives", best: "Best jar" },
      { item: "figSpread", best: "Best spread" },
      { item: "marcona", best: "Best snack" },
      { item: "chocolate", best: "Best sweet" },
      { item: "markers", best: "Best for the host" },
      { item: "acacia", best: "Best board" },
      { item: "knives3", best: "Best tool" },
      { item: "ramekins", best: "Best practical" }
    ],
    set: "vegan",
    faq: [
      ["What do you get a vegan foodie?", "A plant-based board book, a vegan cheese worth serving, good olives, fig spread, Marcona almonds or dark chocolate. Check labels, since some chocolate and spreads contain milk or honey."],
      ["What is the best vegan cheese for a board?", "In our ranking, Boursin Dairy-Free Garlic & Herbs. Violife Mature Cheddar is the best value, and Rebel Cheese Brie is the splurge."],
      ["Is fig jam vegan?", "Usually. Dalmatia Original Fig Spread is figs, sugar and pectin. Some jams use gelatin or honey, so check the label."],
      ["Is dark chocolate vegan?", "Many dark chocolates are, but not all. Some contain milk fat or are made on shared lines, so check the label before you give it."],
      ["Is there a vegan charcuterie board book?", "Yes: 15 Show-Stopping Plant-Based Boards has fifteen boards with no meat and no dairy, available as a paperback and an instant ebook."]
    ],
    related: [["15 Plant-Based Boards", "/books/plant-based-charcuterie-boards/"], ["Best vegan cheese", "/blog/best-vegan-cheese/"], ["Dietary hub: vegan", "/dietary/"]]
  },
  {
    slug: "housewarming",
    card: "Housewarming gifts for foodies",
    cardLine: "10 gifts for a first party in a new home",
    image: "/images/50-boards-29-book-club-afternoon.webp",
    seoTitle: "Housewarming Gifts for Foodies: 10 Charcuterie Ideas (2026)",
    h1: "Housewarming gifts for foodies: 10 charcuterie ideas for a new kitchen",
    kicker: "Gift guide · Housewarming",
    description: "10 charcuterie housewarming gifts: a board book, an acacia serving board, a slate board, small bowls, a cheese dome, a Boska knife set and more.",
    quick: "For their first party: <strong>50 Boards, Built by Science</strong> ($25.99) and an <strong>acacia serving board</strong>, about $46–61. Smaller: dip bowls, a cheese plane or a knife set.",
    intro: "A new home means a first party, and most people move with whatever serving pieces survived the last apartment. A board, the small bowls that go with it and a book of boards to make is a gift that gets used the first month.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books.",
    picks: [
      { book: "main", best: "Best overall", why: "Fifty complete boards, from a $25 budget board to a 30-person showstopper. Give it with a serving board and their first party is planned." },
      { item: "acacia", best: "Best board" },
      { item: "ramekins", best: "Best practical" },
      { item: "boska", best: "Best knife set" },
      { item: "slate", best: "Best for photos" },
      { item: "dome", best: "Best for the counter" },
      { item: "coasters", best: "Best small gift" },
      { item: "plane", best: "Best under $20" },
      { book: "two", best: "Best for a couple's first place", why: "Twenty-five boards sized for two, each with a drink to pour. Lands well for a couple moving in together." },
      { item: "honeycomb", best: "Best edible" }
    ],
    set: "home",
    faq: [
      ["What is a good housewarming gift for a foodie?", "The kit for a first party: a serving board, small bowls, a cheese knife set and a book of boards to make. 50 Boards, Built by Science with an acacia board is about $46 to $61."],
      ["What size charcuterie board should I give?", "16 inches or longer works for 4 to 8 people. For someone who hosts big groups, go 20 inches or more."],
      ["Wood or slate for a housewarming gift?", "Wood is the safer pick: it's warmer looking, knife-friendly and lasts decades with oiling. Slate photographs beautifully but chips if dropped."],
      ["How much should I spend on a housewarming gift?", "Most people spend $25 to $60. A board book alone is $25.99; with a serving board it's about $50."],
      ["Is food a good housewarming gift?", "Shelf-stable food is: honeycomb, jars, nuts and a whole dry salami keep for weeks. Avoid fresh cheese, since a new fridge may be empty or not yet set up."]
    ],
    related: [["Hostess gifts", "/gifts/hostess-gifts/"], ["Which serving board to buy", "/blog/best-charcuterie-boards/"], ["Gifts for cheese lovers", "/gifts/cheese-lovers/"], ["Personalized and engraved boards", "/gifts/personalized-boards/"]]
  },
  {
    slug: "for-him",
    card: "Charcuterie gifts for him",
    cardLine: "12 gifts for the meat lover, griller or whiskey drinker",
    image: "/images/gifts-for-him.jpg",
    seoTitle: "Charcuterie Gifts for Men 2026: 12 Ideas for Meat Lovers",
    h1: "Charcuterie gifts for men: 12 ideas for the meat lover in your life",
    kicker: "Gift guide · For him",
    description: "12 charcuterie gifts for men: a board book, a whole dry salami, a cheese knife set, the Wüsthof cheese plane, whisky glasses for a cheese pairing, a curing book for the DIY type and a meat and cheese box.",
    quick: "Best gift: <strong>50 Boards, Built by Science</strong> ($25.99) with a <strong>whole dry salami</strong> and grainy mustard, about $38–50. Best tool: the <strong>Wüsthof cheese plane</strong>. To make his own salami: <em>Charcuterie</em> by Ruhlman and Polcyn.",
    intro: "Men who love charcuterie are usually in it for the meat: the salami, the summer sausage, the sharp cheddar and the drink that goes with it. The best gifts lean into that. Something to eat now, a tool he'll use every time he builds a board, or, for the hands-on type, a book that teaches him to cure his own.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { book: "main", best: "Best overall", why: "Fifty complete boards, including a meat lover's carnivore board, a game day board and a beer and charcuterie board, each with the shopping list and amounts. Tie a whole salami to it and the first board is already started." },
      { item: "salami", best: "Best edible gift" },
      { item: "boska", best: "Best knife set" },
      { item: "wusthofPlane", best: "Best tool" },
      { other: "ruhlman", best: "Best for the DIY type" },
      { item: "glencairn", best: "Best for a whiskey drinker" },
      { item: "giftBox", best: "Best ready-made gift" },
      { item: "acacia", best: "Best for the guy who hosts" },
      { book: "world", best: "Best for the adventurous eater", why: "Sixteen international boards, from a Bavarian beer-hall spread to a Korean BBQ board. Under $17, so it pairs easily with a six-pack from the same country." },
      { item: "hotHoney", best: "Best stocking stuffer" },
      { item: "mustard", best: "Best cheap add-on" },
      { item: "club", best: "Best splurge" }
    ],
    extra: {
      title: "Build him a meat lover's gift box",
      body: "<p>Shelf-stable meat and cheese travels well and keeps until he's ready. Pack a <strong>whole dry salami</strong> (unopened, it keeps about 6 weeks in the pantry), a <strong>waxed or vacuum-packed aged cheddar</strong>, a sleeve of crackers, a jar of <strong>whole-grain mustard</strong> and a small knife. Add the book, and it's a full board night in a box. Our <a href=\"/blog/charcuterie-gift-basket/\">DIY gift basket guide</a> has packing lists at $25, $50 and $100, and the <a href=\"/blog/best-salami-brands/\">best salami, ranked</a> tells you which one to buy.</p>"
    },
    set: "him",
    faq: [
      ["What is a good charcuterie gift for a man?", "A board book with a whole dry salami and a jar of whole-grain mustard, about $38 to $50. Or a tool he'll use every time: a good cheese knife set or the Wüsthof cheese plane."],
      ["What do you get a man who loves meat and cheese?", "Something to eat now and something to build with: a whole salami, aged cheddar and mustard, plus a cheese knife set or a board book. A ready-made meat and cheese box from Harry & David is the no-effort option."],
      ["What is a good gift for someone who wants to make their own salami?", "Charcuterie: The Craft of Salting, Smoking, and Curing by Michael Ruhlman and Brian Polcyn. It covers curing, smoking and sausage-making at home."],
      ["What goes well with whiskey on a charcuterie board?", "Aged cheddar, smoked Gouda, blue cheese, salami, dark chocolate and candied pecans. Our whiskey and cheese pairing guide has the full list, by whiskey style."],
      ["Does salami need to be refrigerated as a gift?", "A whole, unopened dry salami doesn't: it keeps about 6 weeks in the pantry. Once sliced, wrap it and refrigerate it."]
    ],
    related: [["Gifts for cheese lovers", "/gifts/cheese-lovers/"], ["Best charcuterie gift boxes", "/blog/best-charcuterie-gift-boxes/"], ["Whiskey and cheese pairing", "/blog/whiskey-and-cheese-pairing/"]]
  },
  {
    slug: "client-gifts",
    card: "Client and corporate charcuterie gifts",
    cardLine: "9 gifts for clients, teams and the office",
    image: "/images/client-charcuterie-gifts.jpg",
    seoTitle: "Corporate Charcuterie Gifts for Clients: 9 Ideas (2026)",
    h1: "Charcuterie gifts for clients and employees: 9 corporate ideas",
    kicker: "Gift guide · Client gifts",
    description: "9 charcuterie gifts for clients, teams and the office: ready-to-serve boards, meat and cheese boxes, engraved cheese boards, board books, and how the $25 business-gift tax rule works.",
    quick: "Top client: a <strong>Boarderie board</strong> ($129–139) or a <strong>Harry & David box</strong> (about $110). Long list: <strong>Around the World in 16 Boards</strong> ($16.99). Tax note: businesses can deduct only $25 per client per year.",
    intro: "A food gift is the safest client gift there is: almost everyone eats it, nobody has to find a shelf for it, and it lands well at an office where it can be shared. The trick is matching the gift to the relationship. A ready-to-serve board for the client who signs the big contract, something shelf-stable and cheap for the long list, and something with your name on it for the people you'll see all year.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links. This isn't tax advice; ask your accountant.",
    picks: [
      { item: "harryDavid", best: "Best overall client gift" },
      { item: "boarderie", best: "Best for a top client" },
      { book: "world", best: "Best under $25", why: "Sixteen international boards, from Spain to Korea, for $16.99: a gift that's personal, keeps for years and comes in under the $25 deduction limit. Easy to mail to a home office." },
      { book: "main", best: "Best book for a team", why: "Fifty complete boards for every occasion, including an office party board. A thank-you that turns into the next team potluck." },
      { item: "swissColony", best: "Best for a long list" },
      { item: "engraved", best: "Best keepsake with your name" },
      { item: "ctft", best: "Best board and knives" },
      { item: "laguiole", best: "Best premium tool" },
      { item: "club", best: "Best for a key account" }
    ],
    extra: {
      title: "How to send charcuterie to a client list",
      body: "<ul><li><strong>Order early.</strong> For Christmas, order in the first week of December. Holiday cut-offs come early, and perishable boxes often ship only Monday to Wednesday so they don't sit in a warehouse over a weekend.</li><li><strong>Ship to where someone will be.</strong> A box with soft cheese needs a person to put it in the fridge. Offices close for the holidays; check before sending perishables there.</li><li><strong>Shelf-stable for long lists.</strong> Whole summer sausage, waxed cheese, crackers, nuts and books can sit in a mailroom. Save the perishable boxes for clients you can call first.</li><li><strong>The $25 rule.</strong> A business can deduct no more than $25 of gifts given to each person in a tax year. Engraving, packing and shipping don't count toward the $25 if they don't add real value (<a href=\"https://www.irs.gov/node/17597\" target=\"_blank\" rel=\"noopener\">IRS</a>). You can spend more; only $25 per person is deductible.</li><li><strong>Add a note that says why.</strong> \"Thanks for a great year\" beats a logo card. For a book, write which board you'd make first.</li></ul><p>Run a charcuterie business? Corporate boxes are one of the biggest orders of the year. See <a href=\"/blog/how-to-start-a-charcuterie-business/\">how to start a charcuterie business</a> for pricing.</p>"
    },
    set: "client",
    faq: [
      ["What is a good charcuterie gift for clients?", "For a top client, a ready-to-serve Boarderie board or a Harry & David meat and cheese box. For a long list, something shelf-stable under $25: a board book, Swiss Colony sausage and cheese, or a jar of fig spread with Marcona almonds."],
      ["How much can a business deduct for client gifts?", "No more than $25 per person per year, according to the IRS. Incidental costs such as engraving, packing and shipping don't count toward the $25 if they don't add substantial value. Ask your accountant about your situation."],
      ["Can I send a charcuterie box to an office?", "Yes, but check that someone will be there. Boxes with soft cheese or sliced meat need refrigerating on arrival, and many offices close over the holidays. Shelf-stable boxes are safer for offices."],
      ["When should I order corporate food gifts for Christmas?", "In the first week of December, and earlier for large orders. Perishable boxes often ship only early in the week, and carriers are slowest in the last two weeks before Christmas."],
      ["What is a good charcuterie gift for employees?", "A board book they can use at home, or a ready-to-serve board for the team to share in the office. For remote teams, a book or a shelf-stable sausage and cheese set mails easily."]
    ],
    related: [["Best charcuterie gift boxes, ranked", "/blog/best-charcuterie-gift-boxes/"], ["Office party charcuterie board", "/boards/office-party-charcuterie-board/"], ["Charcuterie gifts under $25", "/gifts/under-25/"]]
  },
  {
    slug: "luxury",
    card: "Luxury charcuterie gifts",
    cardLine: "10 splurges, from $50 knives to a $139 ready-made board",
    image: "/images/50-boards-44-truffle-and-luxury.webp",
    seoTitle: "Luxury Charcuterie Gifts: 10 Splurges Worth It (2026)",
    h1: "Luxury charcuterie gifts: 10 splurges that are worth the money",
    kicker: "Gift guide · Luxury",
    description: "10 luxury charcuterie gifts for 2026: a Boarderie ready-to-serve board, Harry & David's meat and cheese box, a cheese club, Laguiole and Boska knife sets, an engraved board and the Wüsthof cheese plane.",
    quick: "Best splurge: a <strong>Harry & David meat and cheese box</strong> (about $110) or a <strong>Boarderie board</strong> ($129–139). Best keepsake: an <strong>engraved board</strong> ($45–70) or the <strong>Laguiole cheese set</strong> ($55–70).",
    intro: "A splurge gift should be something the person would never buy for themselves. For a charcuterie lover that means one of three things: a board that arrives finished, a tool good enough to leave out on the counter, or a club that keeps arriving after the holidays. Everything here is chosen for one of those reasons, not just for the price tag.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { item: "harryDavid", best: "Best overall splurge" },
      { item: "boarderie", best: "Best ready-to-serve board" },
      { item: "club", best: "Best gift that keeps arriving" },
      { item: "laguiole", best: "Best knife set to give" },
      { item: "boska", best: "Best modern knife set" },
      { item: "engraved", best: "Best keepsake" },
      { item: "wusthofPlane", best: "Best single tool" },
      { item: "giftBox", best: "Best if you want to compare boxes" },
      { book: "impossible", best: "Best for the host who has everything", why: "Twenty-five showpiece boards, from a salami dragon to a cheese cake, each with the trick that makes it work and a shopping list for 12 to 15. Pair it with the Laguiole set and it's a showpiece gift too." },
      { book: "main", best: "Best book to tuck in", why: "Fifty complete boards with shopping lists and amounts. Slip it into a gift box so the board they love tonight becomes the board they make next month." }
    ],
    extra: {
      title: "Build a grand board kit (about $150–200)",
      body: "<p>For the biggest gift under the tree, put the pieces of a full board in one box:</p><ol><li><strong>The board:</strong> an engraved wood and marble board with their initials.</li><li><strong>The knives:</strong> the Laguiole 3-piece set.</li><li><strong>The jars:</strong> honeycomb, fig spread and Marcona almonds, all shelf-stable.</li><li><strong>The meat:</strong> a whole dry salami, which keeps about 6 weeks unopened.</li><li><strong>The plan:</strong> 50 Boards, Built by Science, so the first board has a shopping list.</li></ol><p>Add the cheese the day you hand it over, and tell them to refrigerate it. Our <a href=\"/blog/charcuterie-gift-basket/\">DIY gift basket guide</a> has packing tips, and <a href=\"/blog/best-cheese-of-the-month-clubs/\">our ranked cheese clubs</a> compares plans if you'd rather give months of cheese.</p>"
    },
    set: "luxury",
    faq: [
      ["What is a luxury gift for a charcuterie lover?", "A ready-to-serve board from Boarderie, Harry & David's Ultimate Meat and Cheese box, a cheese-of-the-month club, or a boxed knife set like the Laguiole 3-piece set. Pick something they'd never buy for themselves."],
      ["How much should I spend on a luxury charcuterie gift?", "Most splurge gifts run $50 to $150. Knife sets and engraved boards sit around $50 to $70; ready-made boards and boxes run about $110 to $140; clubs vary by plan length."],
      ["Is a cheese club a good gift?", "Yes, for a cheese lover who likes to try new things. A 3-month plan is the sweet spot: enough boxes to find a favorite without committing them to a year."],
      ["What is the best ready-made charcuterie board to send?", "Boarderie's boards arrive already arranged on a wooden board with free overnight shipping, so nothing needs slicing or plating. Harry & David's box is the better pick if you want more food for the money."],
      ["Can I engrave a charcuterie board as a gift?", "Yes. Mark & Graham engraves its acacia and marble board with initials or a name. Order early in December, since personalized items take longer to ship."]
    ],
    related: [["Best charcuterie gift boxes, ranked", "/blog/best-charcuterie-gift-boxes/"], ["Best cheese-of-the-month clubs", "/blog/best-cheese-of-the-month-clubs/"], ["Gifts for cheese lovers", "/gifts/cheese-lovers/"], ["Personalized and engraved boards", "/gifts/personalized-boards/"]]
  },
  // ---- Added 9 Nov 2026: five gap guides (for her, ships well, under $50,
  // teacher and coworker, has everything). Same items and books as the
  // other guides; no new Amazon links.
  {
    slug: "for-her",
    card: "Charcuterie gifts for her",
    cardLine: "12 gifts for her, mom or the friend who hosts",
    image: "/images/mothers-day.webp",
    seoTitle: "Charcuterie Gifts for Her 2026: 12 Ideas for Women and Mom",
    h1: "Charcuterie gifts for her: 12 ideas for the cheese-loving woman in your life",
    kicker: "Gift guide · For her",
    description: "12 charcuterie gifts for women and moms in 2026: a cheese advent calendar, a glass cheese dome, a slate board with chalk, honeycomb, Boards for Two, a cheese club and hot honey.",
    quick: "For the cheese lover: a <strong>cheese advent calendar</strong> or a <strong>glass cheese dome</strong> ($22–30). For a night in: <strong>Boards for Two</strong> with a <strong>boxed honeycomb</strong>. For the host: a <strong>slate board with chalk</strong> ($25–32). Splurge: a <strong>cheese-of-the-month club</strong>.",
    intro: "The best charcuterie gift for her depends less on her and more on how she uses a board. Some people build one every Friday for two, some host the whole family, and some just want something lovely on the counter. We've grouped the picks that way, from a few dollars to a club that arrives all year.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { item: "advent", best: "Best for December" },
      { item: "dome", best: "Best for the counter" },
      { book: "two", best: "Best for a night in", why: "25 boards sized for two, from a first date to New Year's Eve, each with a shopping list, a prep countdown and a drink to pour. The gift that comes with a plan for Friday night." },
      { item: "slate", best: "Best for the host" },
      { item: "honeycomb", best: "Best edible gift" },
      { item: "hotHoney", best: "Best jar" },
      { item: "chocolate", best: "Best small treat" },
      { item: "boska", best: "Best knife set" },
      { item: "glasses", best: "Best for wine nights" },
      { book: "main", best: "Best for the board builder", why: "Fifty complete boards, from a book club afternoon to a bridal shower, each with the shopping list, amounts and build order." },
      { item: "markers", best: "Best add-on" },
      { item: "club", best: "Best splurge" }
    ],
    set: "her",
    faq: [
      ["What is a good charcuterie gift for a woman?", "Something that makes her board nicer to use or to look at: a glass cheese dome, a slate board with chalk, a Boska knife set, or a boxed honeycomb. In December, a cheese advent calendar is the gift people talk about."],
      ["What do you get a mom who loves charcuterie?", "A cheese-of-the-month club if she likes to try new cheeses, a board book if she hosts the family, or a slate board and knives if she builds boards often. Add a jar of fig spread or honeycomb so there's something to open and eat."],
      ["What is a romantic charcuterie gift?", "Boards for Two with a bottle of wine and a boxed honeycomb. Every board in the book is sized for two and comes with a drink to pour."],
      ["What charcuterie gift can I give her today?", "Buy a gift that starts later, like a cheese club or a cheese advent calendar, then print our free gift card, write the gift inside and give it in person."]
    ],
    related: [["Cheese advent calendars 2026", "/blog/cheese-advent-calendars-2026/"], ["Gifts for cheese lovers", "/gifts/cheese-lovers/"], ["Charcuterie gifts for him", "/gifts/for-him/"], ["Date night board for two", "/boards/date-night-board-for-two/"], ["Wine advent calendars 2026", "/gifts/wine-advent-calendars/"]]
  },
  {
    slug: "ship-well",
    card: "Charcuterie gifts that ship well",
    cardLine: "11 gifts that need no ice, even in warm weather",
    image: "/images/charcuterie-gift-basket-packing.jpg",
    seoTitle: "Meat and Cheese Gifts That Ship Without Ice (2026)",
    h1: "Charcuterie gifts that ship well: 11 meat and cheese gifts that need no ice",
    kicker: "Gift guide · Ships well",
    description: "11 charcuterie gifts that ship without ice: a whole dry salami, a shelf-stable sausage and cheese box, Marcona almonds, fig spread, honeycomb, cheese crisps, books and tools, plus the USDA rules for mailing food.",
    quick: "Ships without ice: a <strong>whole dry salami</strong> ($12–16), <strong>hard aged cheese</strong>, crackers, nuts and jars (USDA). Ready-made: a <strong>shelf-stable sausage and cheese box</strong> ($20–25). Add-on: a <strong>board book</strong>, so the box turns into a board.",
    intro: "Mailing a food gift goes wrong in one way: something that needed to stay cold sat in a warm truck. The fix is choosing food that never needed the cold in the first place. Whole dry salami, hard aged cheese, crackers, nuts, jars and chocolate all travel for days, which matters if the gift is going somewhere warm or sitting on a porch.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". Food safety guidance is from the USDA's advice on mail-order food. We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { item: "salami", best: "Best meat to mail" },
      { item: "swissColony", best: "Best ready-made box" },
      { item: "marcona", best: "Best nuts" },
      { item: "figSpread", best: "Best jar" },
      { item: "honeycomb", best: "Best for a cheese lover" },
      { item: "cheeseCrisps", best: "Best crunchy add-on" },
      { item: "mustard", best: "Best cheap add-on" },
      { book: "main", best: "Best book to send with it", why: "Fifty complete boards with shopping lists. A salami and a jar are a snack; with the book they're the start of a board." },
      { item: "knives3", best: "Best tool to add" },
      { item: "hotHoney", best: "Best for spice lovers" },
      { item: "giftBox", best: "Best if you want a full box" }
    ],
    extra: {
      title: "What ships without ice, and what doesn't",
      body: "<ul><li><strong>No ice needed:</strong> whole, unopened hard salami and summer sausage, hard aged cheese such as aged cheddar or Parmigiano-Reggiano, country ham, crackers, nuts, honey, jams and chocolate. The USDA names hard salami, hard cheese and country ham as good choices to mail for this reason.</li><li><strong>Needs a cold pack:</strong> soft cheese (brie, burrata, fresh goat cheese), sliced deli meat, and anything labeled \"Keep Refrigerated\", even if it's smoked or vacuum-packed.</li><li><strong>Warm weather:</strong> chocolate can melt and soft cheese spoils. Send salami, hard cheese, nuts and jars, and ship early in the week so the box doesn't sit over a weekend.</li><li><strong>When it arrives:</strong> anything perishable should be below 40°F. If it isn't, don't eat it; ask the company for a replacement.</li></ul><p>Full rules and the USDA hotline are on our <a href=\"/gifts/#food-safety\">gift guide</a>. Packing it yourself? See <a href=\"/blog/charcuterie-gift-basket/\">how to pack a DIY gift basket</a>.</p>"
    },
    set: "ship",
    faq: [
      ["What meat and cheese gifts ship well in warm weather?", "Whole, unopened dry salami or summer sausage, hard aged cheese such as aged cheddar or Parmesan, crackers, nuts and jars. Skip soft cheese and sliced meat, and ship early in the week."],
      ["Does salami need to be refrigerated when shipped?", "A whole, unopened dry salami doesn't. It keeps about 6 weeks in the pantry. Once it's sliced, it needs the fridge."],
      ["Can you mail cheese without ice?", "Hard aged cheese, yes: aged cheddar, Parmigiano-Reggiano, aged Gouda. Soft cheese like brie or fresh goat cheese needs frozen gel packs or dry ice and a Keep Refrigerated label."],
      ["What should I do if a food gift arrives warm?", "Check it with a food thermometer. Perishable food should be below 40°F. If it's warmer, don't eat it or taste it; contact the company for a replacement."]
    ],
    related: [["Best charcuterie gift boxes, ranked", "/blog/best-charcuterie-gift-boxes/"], ["DIY charcuterie gift basket", "/blog/charcuterie-gift-basket/"], ["Why cured meat doesn't spoil", "/blog/why-cured-meat-doesnt-spoil/"], ["Last-minute charcuterie gifts", "/gifts/last-minute/"]]
  },
  {
    slug: "under-50",
    card: "Charcuterie gifts under $50",
    cardLine: "12 gifts between $25 and $50",
    image: "/images/charcuterie-gift-box-50.jpg",
    seoTitle: "Charcuterie Gifts Under $50: 12 Ideas for 2026",
    h1: "Charcuterie gifts under $50: 12 ideas that look like you spent more",
    kicker: "Gift guide · Under $50",
    description: "12 charcuterie gifts under $50: the Wüsthof cheese plane, a slate board with chalk, a bamboo board and knife set, a glass cheese dome, a mozzarella-making kit, Glencairn glasses and our board books.",
    quick: "Best under $50: the <strong>Wüsthof cheese plane</strong> ($40–50) or a <strong>bamboo board with a knife drawer</strong> ($20–30) plus a jar of fig spread. Book lover: <strong>50 Boards, Built by Science</strong> ($25.99) with a <strong>slate board</strong>.",
    intro: "Between $25 and $50 is where a charcuterie gift stops being a stocking stuffer and starts being something they keep for years. That's enough for a real tool, a good board, or a book with something to eat beside it.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { item: "wusthofPlane", best: "Best tool" },
      { item: "ctft", best: "Best board and knives" },
      { book: "main", best: "Best book", why: "Fifty complete boards with the shopping list, amounts and build order for each. At $25.99 it leaves room for a jar of fig spread or a slate board." },
      { item: "slate", best: "Best board" },
      { item: "dome", best: "Best for the counter" },
      { item: "kit", best: "Best hands-on gift" },
      { item: "glencairn", best: "Best for a whiskey drinker" },
      { item: "acacia", best: "Best wood board" },
      { book: "guide", best: "Best for the cheese nerd", why: "76 cheeses and 249 other board ingredients in one book: how each tastes, what pairs with it and why, and how much to buy per person." },
      { item: "storage", best: "Best for the cheese lover" },
      { item: "coasters", best: "Best for the home bar" },
      { item: "honeycomb", best: "Best edible add-on" }
    ],
    set: "u50",
    faq: [
      ["What is a good charcuterie gift under $50?", "A tool they'll use every time, like the Wüsthof cheese plane, or a board with knives, like a bamboo board with a knife drawer. A board book with a slate board also comes in under $50."],
      ["What can I put in a $50 charcuterie gift basket?", "A whole dry salami, an aged cheddar, crackers, a jar of fig spread, Marcona almonds and a small knife. Our DIY gift basket guide has a full $50 list."],
      ["Is a cheese knife set a good gift under $50?", "Yes. A bamboo board with a drawer of four knives runs about $20 to $30, so there's room to add a jar. Boska's Monaco+ set is a step up at about $50 to $65."],
      ["What charcuterie gift looks expensive but isn't?", "A slate board with chalk and a boxed honeycomb. Both look like they came from a cheese shop, and together they run about $35 to $50."]
    ],
    related: [["Charcuterie gifts under $25", "/gifts/under-25/"], ["Luxury charcuterie gifts", "/gifts/luxury/"], ["DIY charcuterie gift basket", "/blog/charcuterie-gift-basket/"]]
  },
  {
    slug: "teacher-coworker",
    card: "Teacher and coworker gifts",
    cardLine: "12 charcuterie gifts under $15",
    image: "/images/charcuterie-gift-box-25.jpg",
    seoTitle: "Teacher and Coworker Gifts Under $15: 12 Ideas (2026)",
    h1: "Teacher and coworker gifts under $15: 12 small charcuterie gifts",
    kicker: "Gift guide · Teacher and coworker",
    description: "12 charcuterie gifts under $15 for teachers, coworkers and Secret Santa: hot honey, fig spread, Marcona almonds, a cheese plane, honey dippers, slate cheese markers and Parmesan crisps.",
    quick: "Under $15 and easy to wrap: a jar of <strong>hot honey</strong> or <strong>fig spread</strong>, <strong>Marcona almonds</strong>, or a <strong>cheese plane</strong> ($7–18). Under $10: a jar of <strong>whole-grain mustard</strong> with a <strong>honey dipper</strong>.",
    intro: "A good small gift is something useful the person wouldn't buy for themselves, that doesn't need a shelf, and that's easy to tuck into a bag. Food does that best. Every pick here costs about $15 or less, and most of them are shelf-stable, so they can sit on a desk until the break.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { item: "hotHoney", best: "Best overall" },
      { item: "figSpread", best: "Best jar" },
      { item: "marcona", best: "Best snack" },
      { item: "plane", best: "Best tool" },
      { item: "knives3", best: "Best for the board builder" },
      { item: "markers", best: "Best for the host" },
      { item: "honeyDipper", best: "Best tiny add-on" },
      { item: "mustard", best: "Best under $10" },
      { item: "picks", best: "Best party add-on" },
      { item: "cheeseCrisps", best: "Best snack" },
      { item: "olives", best: "Best for the cheese lover" },
      { item: "chocolate", best: "Best sweet" }
    ],
    extra: {
      title: "Make it look like more",
      body: "<p>Pair one jar with one tool, like hot honey and a honey dipper, or fig spread and a cheese plane. Tie them together with twine and a tag that says what goes with what (\"hot honey + sharp cheddar\"). Two small things with a reason to go together look like a planned gift. Need a dozen? A jar of hot honey or Marcona almonds per person keeps the cost under $15 each.</p>"
    },
    set: "stocking",
    faq: [
      ["What is a good food gift for a teacher under $15?", "A jar of hot honey or fig spread, Marcona almonds, or a dark chocolate bar. They're shelf-stable, so they can wait on a desk until the break."],
      ["What is a good Secret Santa gift under $15 for a foodie?", "A cheese plane, a jar of hot honey with a honey dipper, or a set of slate cheese markers. All are useful, small and easy to wrap."],
      ["What is a good group gift for coworkers?", "Buy one jar per person (hot honey, fig spread or whole-grain mustard) and tie a honey dipper to each. It looks like more than it costs."],
      ["Are food gifts OK for teachers?", "Usually, but check for allergies and school rules first. Nut-free picks here are hot honey, fig spread, mustard, the cheese plane, the honey dippers and the cheese markers."]
    ],
    related: [["Charcuterie stocking stuffers", "/gifts/stocking-stuffers/"], ["Charcuterie gifts under $25", "/gifts/under-25/"], ["White elephant gifts", "/gifts/white-elephant/"], ["Secret Santa gifts by budget", "/gifts/secret-santa/"]]
  },
  {
    slug: "has-everything",
    card: "For the person who has everything",
    cardLine: "10 gifts they won't already own",
    image: "/images/50-boards-49-showstopper-grand.webp",
    seoTitle: "Gifts for Someone Who Has Everything: 10 Ideas (2026)",
    h1: "Charcuterie gifts for someone who has everything: 10 they won't already own",
    kicker: "Gift guide · Has everything",
    description: "10 charcuterie gifts for the person who has everything: a cheese-of-the-month club, a cheese advent calendar, a mozzarella-making kit, Impossible Boards, a Laguiole set, an engraved board and a Boarderie board.",
    quick: "An experience: a <strong>cheese-of-the-month club</strong>, a <strong>cheese advent calendar</strong> or a <strong>mozzarella-making kit</strong> ($25–32). Has seen every board: <strong>Impossible Boards</strong>, 25 showpiece boards.",
    intro: "The person who has everything already owns a board, a knife set and a cheese plane. What they don't have is something that keeps arriving, something they make themselves, or a board nobody at their party has seen before. That's where these picks come from.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { item: "club", best: "Best gift that keeps arriving" },
      { item: "advent", best: "Best for December" },
      { item: "kit", best: "Best hands-on gift" },
      { book: "impossible", best: "Best for the host who has seen it all", why: "Twenty-five showpiece boards, from a salami dragon to a cheese cake, each with the trick that makes it work and a shopping list for 12 to 15." },
      { item: "boarderie", best: "Best ready-to-serve board" },
      { item: "laguiole", best: "Best knife set" },
      { item: "engraved", best: "Best keepsake" },
      { other: "ruhlman", best: "Best for learning to cure meat" },
      { item: "honeycomb", best: "Best small surprise" },
      { book: "world", best: "Best for the traveler", why: "Sixteen international boards, from Spain to Korea, with the shopping list for each. A trip they can take from the kitchen." }
    ],
    set: "luxury",
    faq: [
      ["What do you get a foodie who has everything?", "Something that keeps arriving, like a cheese-of-the-month club, or something they make themselves, like a mozzarella-making kit. A cheese advent calendar works for December."],
      ["What is a unique charcuterie gift?", "A book of showpiece boards like Impossible Boards, a home cheese-making kit, or a curing book like Ruhlman and Polcyn's Charcuterie for someone who wants to make their own salami."],
      ["Is an experience gift better than a thing?", "For someone who has everything, usually yes. A club or a kit gives them something new to try instead of something to store."]
    ],
    related: [["Luxury charcuterie gifts", "/gifts/luxury/"], ["Best cheese-of-the-month clubs", "/blog/best-cheese-of-the-month-clubs/"], ["Impossible boards", "/books/impossible-boards/"]]
  },
  // ---- Added 9 Nov 2026: four more gap guides (Secret Santa, Hanukkah,
  // wine advent calendars, personalized boards). Retailer links only, no
  // Amazon search links.
  {
    slug: "secret-santa",
    card: "Secret Santa charcuterie gifts",
    cardLine: "10 gifts at $10, $15, $20, $25 and $30",
    image: "/images/charcuterie-gift-box-25.jpg",
    seoTitle: "Secret Santa Gifts for Foodies 2026: 10 Ideas, $5 to $30",
    h1: "Secret Santa gifts for a foodie: 10 charcuterie gifts that fit the budget",
    kicker: "Gift guide · Secret Santa",
    description: "10 Secret Santa gifts for someone who loves cheese and charcuterie, sorted by budget: a cheese plane, hot honey, slate cheese markers, a 3-piece knife set, a board book and a bamboo board with knives.",
    quick: "<strong>$10:</strong> a <strong>cheese plane</strong> or a jar of <strong>hot honey</strong>. <strong>$15:</strong> a <strong>3-piece cheese knife set</strong> with a jar of fig spread. <strong>$20 to $25:</strong> <strong>Around the World in 16 Boards</strong>. <strong>$30:</strong> a <strong>bamboo board with a drawer of knives</strong>.",
    intro: "Secret Santa isn't white elephant. You drew one name, you know who it is, and there's a price everyone agreed to. So the goal is a gift that looks like you thought about them and lands right at the limit, not under it and not over it. Everything here is sorted by what it costs, with combinations that hit $10, $15, $20, $25 and $30.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { item: "plane", best: "Best at $10" },
      { item: "hotHoney", best: "Best jar at $10" },
      { item: "knives3", best: "Best at $15" },
      { item: "markers", best: "Best for the office host" },
      { item: "figSpread", best: "Best add-on to hit the limit" },
      { book: "world", best: "Best at $20 to $25", why: "Sixteen international boards, from Spain to Korea, each with a shopping list and a prep countdown. A gift that turns into a party they throw later." },
      { item: "slate", best: "Best at $25 to $30" },
      { item: "ctft", best: "Best at $30" },
      { item: "chocolate", best: "Best sweet" },
      { item: "honeyDipper", best: "Best add-on to tie on" }
    ],
    extra: {
      title: "Hit the budget exactly",
      body: "<ul><li><strong>$10:</strong> a cheese plane, or a jar of hot honey with a wooden honey dipper.</li><li><strong>$15:</strong> a 3-piece cheese knife set and a jar of whole-grain mustard.</li><li><strong>$20:</strong> a cheese plane, a jar of fig spread and a bar of dark chocolate.</li><li><strong>$25:</strong> the Boards Around the World paperback, or a 3-piece knife set with fig spread and slate cheese markers.</li><li><strong>$30:</strong> a bamboo board with a drawer of knives, or two slate boards with chalk.</li></ul><p><strong>Secret Santa or white elephant?</strong> In Secret Santa you know who's opening it, so pick for them. In <a href=\"/gifts/white-elephant/\">white elephant</a> anyone can end up with it, so pick something everyone wants to steal.</p>"
    },
    set: "stocking",
    faq: [
      ["What is a good Secret Santa gift for someone who loves charcuterie?", "At $10, a cheese plane or a jar of hot honey. At $15, a 3-piece cheese knife set. At $25, a board book with shopping lists, like Boards Around the World. At $30, a bamboo board with a drawer of knives."],
      ["What is the difference between Secret Santa and white elephant?", "In Secret Santa you draw one person's name and buy for them. In white elephant, gifts are anonymous and can be stolen, so the gift has to appeal to everyone."],
      ["What is a good $10 Secret Santa gift for a foodie?", "A cheese plane, a jar of hot honey, slate cheese markers, or a whole-grain mustard with a honey dipper. All are useful and easy to wrap."],
      ["What can I give for Secret Santa if I forgot?", "A grocery-store gift: a jar of hot honey or fig spread, a bar of good dark chocolate and a wedge of aged cheddar, tied together with ribbon."]
    ],
    related: [["White elephant gifts", "/gifts/white-elephant/"], ["Teacher and coworker gifts", "/gifts/teacher-coworker/"], ["Charcuterie gifts under $25", "/gifts/under-25/"], ["Stocking stuffers", "/gifts/stocking-stuffers/"]]
  },
  {
    slug: "hanukkah",
    card: "Hanukkah gifts for a charcuterie lover",
    cardLine: "10 gifts for eight nights, kosher kitchens included",
    image: "/images/hanukkah-charcuterie-board.jpg",
    shipNote: "Hanukkah 2026 starts the evening of Friday, Dec 4. Order by about Nov 30 so gifts arrive before the first night.",
    seoTitle: "Hanukkah Gifts 2026 for Foodies: 10 Cheese and Board Ideas",
    h1: "Hanukkah gifts for a cheese and board lover: 10 ideas for eight nights",
    kicker: "Gift guide · Hanukkah",
    description: "10 Hanukkah gifts for someone who loves cheese and boards, with kosher kitchens in mind: a plant-based board book, a separate dairy knife set, a glass cheese dome, a latke-bar board, dip cups and cheese storage bags. Hanukkah 2026 starts Dec 4.",
    quick: "For a dairy Hanukkah: a <strong>glass cheese dome</strong> or <strong>cheese storage bags</strong>. For a kosher kitchen: a <strong>new knife set kept for dairy</strong>, or <strong>Plant-Based Boards</strong>, whose boards have no meat or dairy. For the latke party: a <strong>wood board</strong> and <strong>small dip cups</strong> for applesauce and sour cream.",
    intro: "Hanukkah 2026 runs eight nights, from the evening of Friday, Dec 4 to Saturday, Dec 12. Cheese has a real place in it: many families eat dairy on Hanukkah, from cheese latkes to blintzes, in memory of Judith. If the person you're shopping for keeps kosher, two things matter. Meat and dairy aren't served together, so a board is either a dairy board or a meat board, with its own knives. And food gifts need a kosher symbol (a hechsher) on the package. Tools, boards and books avoid that question entirely, which is why most picks here aren't food.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". We haven't checked any food below for kosher certification; if they keep kosher, look for a hechsher on the package or choose a tool or book. We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { book: "plant", best: "Best for a kosher kitchen", why: "Fifteen boards with no meat and no dairy, so with certified ingredients they're pareve and can be served alongside either kind of meal. Each comes with a shopping list and a build order." },
      { item: "knives3", best: "Best dairy knife set", why: "In a kosher kitchen, dairy and meat each get their own utensils. A new set of three cheese knives, kept for the dairy board, is a practical gift they'll use every night of Hanukkah." },
      { item: "dome", best: "Best for the dairy board" },
      { item: "acacia", best: "Best board for a latke bar", why: "A long acacia board holds a row of latkes with applesauce, sour cream and smoked salmon down the middle. Give it new, so they can set it aside for dairy or for meat." },
      { item: "ramekins", best: "Best for latke toppings", why: "Applesauce, sour cream, chives and caviar each need a small bowl. Most kitchens own two at most." },
      { item: "storage", best: "Best for the cheese lover" },
      { item: "slate", best: "Best for labeling dairy and meat", why: "Two black slate boards with chalk: write \"dairy\" on one and \"meat\" on the other, or the name of each cheese. Easy to keep apart." },
      { item: "glasses", best: "Best for the last night" },
      { item: "kit", best: "Best hands-on gift", why: "Fresh mozzarella in about an hour, a fun project for a cheese-lover's night of Hanukkah. For a kosher kitchen, use kosher-certified milk and rennet." },
      { book: "main", best: "Best for the family host", why: "Fifty complete boards with shopping lists, amounts and build order, including dairy-only boards like the all-cheese board. Pick the boards that fit their kitchen." }
    ],
    extra: {
      title: "Giving a cheese gift to someone who keeps kosher",
      body: "<ul><li><strong>Look for a hechsher.</strong> Cheese needs kosher certification because of how it's made, so a cheese without the symbol won't work, however good it is.</li><li><strong>Keep dairy and meat apart.</strong> Don't mix cheese and salami in one gift box. Send a dairy gift or a meat gift, not a charcuterie mix.</li><li><strong>New tools are always fine.</strong> A new board or knife set hasn't been used for meat or dairy yet, so they can decide which side of the kitchen it joins.</li><li><strong>When in doubt, give a book or a tool.</strong> No certification needed.</li></ul><p>Building the board yourself? See our <a href=\"/holidays/hanukkah/\">7 kosher-style Hanukkah boards</a>, from a latke and lox board to a dairy dessert board.</p>"
    },
    set: "cheese",
    faq: [
      ["When is Hanukkah 2026?", "Hanukkah 2026 begins at sundown on Friday, Dec 4 and ends at nightfall on Saturday, Dec 12. Order gifts that ship by about Nov 30 so they arrive before the first night."],
      ["What is a good Hanukkah gift for someone who loves cheese?", "A glass cheese dome, a new set of cheese knives for the dairy board, or cheese storage bags. If they keep kosher, give tools or books, or a cheese with a kosher symbol on the package."],
      ["Can I give a charcuterie gift box for Hanukkah?", "Only if they don't keep kosher. Most charcuterie boxes mix meat and cheese and aren't kosher-certified. For a kosher home, send a dairy gift or a meat gift, each with a hechsher, or choose a tool or a book."],
      ["Why do people eat cheese on Hanukkah?", "Many families eat dairy foods on Hanukkah, like cheese latkes and blintzes, to remember Judith, who in the traditional story fed salty cheese to an enemy general."]
    ],
    related: [["Hanukkah charcuterie board ideas", "/holidays/hanukkah/"], ["Gifts for cheese lovers", "/gifts/cheese-lovers/"], ["Vegan foodie gifts", "/gifts/vegan-foodie-gifts/"], ["Charcuterie gifts that ship well", "/gifts/ship-well/"]]
  },
  {
    slug: "wine-advent-calendars",
    card: "Wine advent calendars 2026",
    cardLine: "6 calendars from $75 to $230, plus a cheese pairing",
    image: "/images/wine-cheese-board.png",
    seoTitle: "Best Wine Advent Calendars 2026 (and Cheese to Pair)",
    h1: "The best wine advent calendars for 2026, and the cheese to pair with them",
    kicker: "Gift guide · Wine advent calendars",
    description: "The 2026 wine advent calendars compared: In Good Taste's Food Pairing calendar, Total Wine at $74.99, Vinebox, Laithwaites and more, with what each holds, who it ships to, and a cheese advent calendar to pair with it.",
    quick: "For a charcuterie lover: <strong>In Good Taste's Food Pairing calendar</strong> (about $115), 24 wines each matched with a food. Best value: <strong>Total Wine's 2026 calendar</strong> ($74.99 on sale). Make it a pair: add a <strong>cheese advent calendar</strong> and a <strong>slate board</strong> for the nightly pour.",
    intro: "A wine advent calendar holds 24 single-glass bottles (or 12 small vials) to open one a day through December. For someone who builds boards, it's the easy half of a pair: one glass of wine and one small cheese a night. Most calendars ship from November 1 and the popular ones sell out, so this is the week to order. Every calendar needs an adult 21 or over to sign for it, and some can't ship to every state.",
    method: "Prices are from each retailer's 2026 page, checked 9 November 2026, and calendars sell out, so the price and stock can change. We have no paid relationship with any retailer below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { item: "igtFood", best: "Best for a charcuterie lover" },
      { item: "totalWineAdvent", best: "Best value" },
      { item: "igtMixed", best: "Best overall" },
      { item: "vinebox", best: "Best for tasting" },
      { item: "laithwaites", best: "Best in real glass bottles" },
      { item: "advent", best: "Best cheese calendar to pair" },
      { item: "slate", best: "Best board for a nightly pour" },
      { item: "glasses", best: "Best add-on" },
      { item: "aerator", best: "Best for the red nights" },
      { book: "main", best: "Best for January", why: "Fifty complete boards, including a wine and cheese board, for when the calendar is empty and they want to keep going. Each has a shopping list and build order." }
    ],
    extra: {
      title: "Before you order a wine advent calendar",
      body: "<ul><li><strong>Check the state.</strong> Wine can't ship everywhere. In Good Taste doesn't ship to AK, AR, DE, HI, MS, RI or UT. Check at checkout for any calendar.</li><li><strong>Someone 21+ has to sign.</strong> If nobody's home, the box goes back to the depot, so ship it to a work address or to yourself and hand it over.</li><li><strong>Bottles or vials?</strong> Most calendars hold 187ml bottles, one glass each. Vinebox uses 100ml vials, closer to a tasting pour.</li><li><strong>Others worth knowing:</strong> the WSJ Wine advent calendar ($159 with shipping) sells out most years, and Costco sells a Wine Advent-ure calendar for about $100 in stores only.</li><li><strong>Make it a board a night.</strong> Pair it with a <a href=\"/blog/cheese-advent-calendars-2026/\">cheese advent calendar</a>. Our <a href=\"/blog/best-wine-for-charcuterie-board/\">best wines for a charcuterie board</a> covers what goes with what.</li></ul>"
    },
    set: "wine",
    faq: [
      ["What is the best wine advent calendar for 2026?", "Taste of Home picks In Good Taste's calendar as best overall (about $140 for 24 bottles) and Total Wine's as best value ($74.99 on sale). For someone who loves charcuterie, In Good Taste's Food Pairing calendar (about $115) matches each wine with a food."],
      ["How much wine is in a wine advent calendar?", "Most hold 24 bottles of 187ml, one glass each, about six standard bottles in total. Vinebox uses 100ml vials instead."],
      ["Can wine advent calendars ship to every state?", "No. Wine shipping depends on state law. In Good Taste doesn't ship to Alaska, Arkansas, Delaware, Hawaii, Mississippi, Rhode Island or Utah, and every calendar needs an adult 21+ to sign for it."],
      ["What cheese goes with a wine advent calendar?", "One small piece a night: a cheese advent calendar does it for you, or our DIY Cheese Advent Calendar Kit plans 12 or 24 nights of cheese from the store."],
      ["When should I order a wine advent calendar?", "Now. Most ship from early November and the popular ones sell out before December. It needs to arrive by Dec 1."]
    ],
    related: [["Cheese advent calendars 2026", "/blog/cheese-advent-calendars-2026/"], ["Gifts for wine and cheese lovers", "/gifts/wine-and-cheese-lovers/"], ["Best wine for a charcuterie board", "/blog/best-wine-for-charcuterie-board/"]]
  },
  {
    slug: "personalized-boards",
    card: "Personalized and engraved boards",
    cardLine: "8 boards worth engraving, and when to order",
    image: "/images/best-charcuterie-boards.jpg",
    seoTitle: "Personalized Charcuterie Boards: 8 Engraved Gifts (2026)",
    h1: "Personalized charcuterie boards: 8 engraved boards worth giving",
    kicker: "Gift guide · Personalized",
    description: "8 personalized and engraved charcuterie boards for 2026: a Mark & Graham wood and marble board, a sleigh board, an oak board and decanter set, and Uncommon Goods' family recipe, map and swivel boards, plus how to order one in time.",
    quick: "For a monogram: a <strong>Mark & Graham engraved board</strong> ($45–70). For a story: a <strong>family recipe board</strong> ($100) or a <strong>custom map board</strong> ($55–75) from Uncommon Goods. Order by: <strong>Thanksgiving</strong>, because engraving takes extra days.",
    intro: "A personalized board is the one charcuterie gift that can't be regifted, which is why it works for weddings, a first home and the parent who has everything. It's also the slowest gift to get: every board is made to order, so engraving adds days before it even ships. Order before Thanksgiving for Christmas, check the spelling twice, and choose a board you'll serve on rather than cut on, so the engraving lasts.",
    method: "Prices are as listed by each retailer on 9 November 2026, including engraving where shown. Making and shipping times change in December, so check the delivery date at checkout. We have no paid relationship with any retailer below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { item: "engraved", best: "Best overall" },
      { item: "ugRecipe", best: "Best keepsake" },
      { item: "ugMap", best: "Best for a first home or a wedding" },
      { item: "mgSleigh", best: "Best for Christmas" },
      { item: "ugSwivel", best: "Best with knives built in" },
      { item: "mgOak", best: "Best for a wine lover" },
      { item: "ugMonogram", best: "Best for a cheese-and-crackers person" },
      { item: "markers", best: "Best if you're out of time", why: "Not engraved, but personal: slate cheese markers you can write their name or their favorite cheeses on in chalk. Ships fast, so it works after the engraving deadline." },
      { book: "main", best: "Best to give with it", why: "Fifty complete boards with shopping lists and build order, so the new board gets used at the next party, not just admired on the counter." }
    ],
    extra: {
      title: "How to order a personalized board",
      body: "<ul><li><strong>Order before Thanksgiving.</strong> Engraved boards are made to order. In December, making time and shipping both slow down.</li><li><strong>Check the spelling, then check it again.</strong> Personalized items usually can't be returned. Ask for a proof if the shop offers one.</li><li><strong>Monograms:</strong> a traditional three-letter monogram puts the last-name initial in the middle, larger (first, LAST, middle). For a couple, use their first initials either side of the shared last initial.</li><li><strong>Serve, don't cut.</strong> Knife marks wear down engraving. Engrave the handle or one edge if they'll cut on it, and oil wood boards with food-safe mineral oil.</li><li><strong>Etsy and local makers</strong> often engrave for less. Check the processing time on the listing before you order: it's usually listed separately from shipping.</li></ul>"
    },
    set: "home",
    faq: [
      ["When should I order a personalized charcuterie board for Christmas?", "Before Thanksgiving (Nov 26, 2026). Engraving adds making time before the board ships, and December shipping is slower."],
      ["Can you cut on an engraved charcuterie board?", "You can, but knife marks wear the engraving down. Use the engraved board for serving, or choose one engraved on the handle or edge."],
      ["What should I engrave on a charcuterie board?", "A monogram, a family name and the year, a wedding date, or something only they'd recognize, like a family recipe or the map around their first home."],
      ["How do you write a monogram on a cheese board?", "For one person, a traditional monogram is first initial, LAST initial (larger, in the middle), middle initial. For a couple, put their two first initials either side of the shared last initial."],
      ["Is a personalized board a good wedding gift?", "Yes. It's one gift they won't get twice, and a board with their names and wedding date gets used at every party they host."]
    ],
    related: [["Housewarming gifts", "/gifts/housewarming/"], ["The best charcuterie boards to buy", "/blog/best-charcuterie-boards/"], ["Luxury charcuterie gifts", "/gifts/luxury/"], ["For the person who has everything", "/gifts/has-everything/"]]
  },
  {
    slug: "last-minute",
    calendar: true,
    card: "Last-minute charcuterie gifts",
    cardLine: "10 gifts you can still give tomorrow",
    image: "/images/charcuterie-gift-basket-packing.jpg",
    seoTitle: "Last-Minute Charcuterie Gifts 2026: 10 That Still Arrive",
    h1: "Last-minute charcuterie gifts: 10 ideas you can still give in time",
    kicker: "Gift guide · Last minute",
    description: "10 last-minute charcuterie gifts: instant ebooks, a cheese club, overnight-shipped boards, and a DIY board kit from one grocery run, plus when to order everything.",
    quick: "Tonight: the <strong>50 Boards, Built by Science ebook</strong> with our free printable gift card. Two days left: a <strong>Boarderie board</strong> ships overnight. One evening: build a <strong>DIY board kit</strong> from the grocery store.",
    intro: "A last-minute gift only works if it doesn't look last-minute. The fix is to pick a gift that was never meant to ship: a download, a plan that starts later, or a kit you put together yourself with a handwritten tag. Here's what still works, sorted by how much time you have left.",
    method: "Prices are typical ranges, checked " + PRICES_CHECKED + ". Shipping times change in December, so check the delivery date at checkout. We have no paid relationship with any brand below. We wrote the Charcuterie Lab books. Links to Amazon are affiliate links.",
    picks: [
      { book: "main", best: "Best instant gift", why: "Buy the ebook and the download link arrives by email in minutes. Forward it, or print our free \"Your first board is on me\" gift card and write the book's name inside. Fifty boards with shopping lists means the gift turns into a party." },
      { book: "world", best: "Best instant gift under $20", why: "Sixteen international boards with shopping lists and prep countdowns. The ebook is the easy add-on to a bottle of wine you're bringing anyway." },
      { item: "giftBox", best: "Best with a week left" },
      { item: "mustard", best: "Best grocery-store add-on" },
      { item: "club", best: "Best gift that starts later" },
      { item: "boarderie", best: "Best with two days left" },
      { item: "salami", best: "Best for a DIY kit", why: "Unopened, a whole dry salami keeps about 6 weeks in the pantry (USDA), so it can sit under the tree. Most grocery stores stock one in the deli case." },
      { item: "honeycomb", best: "Best jar to grab" },
      { item: "hotHoney", best: "Best stocking add-on" },
      { item: "knives3", best: "Best tool to tie on" }
    ],
    extra: {
      title: "How much time do you have?",
      body: "<ul><li><strong>Two weeks or more:</strong> anything ships, including engraved boards, which take longest. Order paperbacks by mid-December.</li><li><strong>About a week:</strong> order shelf-stable gifts and books now. Perishable boxes with soft cheese need expedited, insulated shipping and someone home to sign.</li><li><strong>Two or three days:</strong> ready-made boards with overnight shipping, or anything your store sells for pickup.</li><li><strong>Tonight:</strong> an ebook or a club gift, plus our free printable gift card.</li></ul><h3>The one-trip DIY board kit (about $40–60)</h3><p>One grocery run covers it: a wood board, two travel-friendly cheeses such as aged Gouda and Parmigiano-Reggiano, a whole dry salami, one jar of jam or honey, crackers, a bag of nuts and a small cheese knife. Wrap it in cellophane, add a ribbon, and tuck in a printed board plan. Full lists at $25, $50 and $100 are in our <a href=\"/blog/charcuterie-gift-basket/\">DIY gift basket guide</a>.</p>"
    },
    set: "starter",
    faq: [
      ["What is a good last-minute charcuterie gift?", "An ebook. Buy 50 Boards, Built by Science as a PDF, then forward the download email or print our free gift card and write the book's name on it. It arrives in minutes and looks planned."],
      ["What charcuterie gifts can I get the same day?", "A downloadable ebook, a cheese club gift, or a DIY board kit from the grocery store: a board, two hard cheeses, a whole salami, a jar of jam, crackers and nuts."],
      ["How do I give a digital gift in person?", "Print our free \"Your first board is on me\" gift card, write the book's name inside, and put it in an envelope or tie it to a jar of fig spread."],
      ["Can I still ship cheese a few days before Christmas?", "Hard cheeses and whole salami can ship with expedited shipping. Soft cheeses need insulated, overnight shipping and someone home to refrigerate them. When in doubt, give something shelf-stable."],
      ["Is a gift subscription a good last-minute gift?", "Yes. A cheese club needs nothing to ship by the holiday: order it, print or forward the confirmation, and the first box arrives later."]
    ],
    related: [["DIY charcuterie gift basket ($25, $50, $100)", "/blog/charcuterie-gift-basket/"], ["Stocking stuffers", "/gifts/stocking-stuffers/"], ["Charcuterie gifts under $25", "/gifts/under-25/"]]
  }
];

// 9 Nov 2026: other brands lead every guide, the same mix as the gift finder:
// two non-book picks, then one of our books, repeated. The books guide and
// last-minute (whose first pick is the instant ebook) keep their order.
// Done once here so the #pick-N anchors, the finder and the compare table agree.
for (const g of GUIDES) {
  if (g.slug === "charcuterie-books" || g.slug === "last-minute") continue;
  const nb = g.picks.filter((p) => !p.book), bk = g.picks.filter((p) => p.book), mix = [];
  while (nb.length || bk.length) { if (nb.length) mix.push(nb.shift()); if (nb.length) mix.push(nb.shift()); if (bk.length) mix.push(bk.shift()); }
  g.picks = mix;
}

// 9 Nov 2026: quick answers read as a short list (no longer rendered: the quick
// answer box was removed from the hub and guides later the same day; kept for reuse).
// Original note: one line per kind of person
// or budget, instead of one paragraph. "Label: text." becomes a labelled row;
// a sentence with no short label stays a plain row.
function quickList(html) {
  const parts = html.split(/(?<=[.!?])\s+(?=[A-Z<"])/).map((x) => x.trim()).filter(Boolean);
  const rows = parts.map((t) => {
    const m = t.match(/^(?:<strong>)?([^<:()]{2,48}?)(?:<\/strong>)?:\s*(?:<\/strong>)?\s*(.+)$/);
    const label = m && m[1].trim().split(/\s+/).length <= 6 ? m[1].trim() : "";
    if (!label) return `<li class="gf-q-plain">${t}</li>`;
    let rest = m[2].trim();
    if (rest.charAt(0) !== "<") rest = rest.charAt(0).toUpperCase() + rest.slice(1);
    return `<li><span class="gf-qk">${label}</span><span class="gf-qv">${rest}</span></li>`;
  });
  return `<div class="quick-answer gf-quick gf-quick-list"><p class="gf-qh"><strong>Quick answer</strong></p><ul>${rows.join("")}</ul></div>`;
}

// Ready-made gift sets, each anchored by a paperback.
const SETS = {
  starter: { name: "The starter gift", book: "world", items: ["knives3", "figSpread"], line: "A first set of tools, a jar for the first board and sixteen boards to make with them." },
  host: { name: "The host gift", book: "main", items: ["acacia", "figSpread", "hotHoney"], line: "A board, two jars and fifty boards to put on it." },
  cheese: { name: "The cheese lover's gift", book: "main", book2: "world", items: ["slate", "knives3"], line: "Two books, a slate board and the knives to serve from it." },
  stocking: { name: "The stocking", book: "world", items: ["plane", "marcona", "figSpread"], line: "A small book, a cheese plane and two things to eat, all of which fit in a stocking." },
  elephant: { name: "The white elephant winner", book: "main", items: ["knives3"], line: "The gift people steal: fifty boards and the knives to make them." },
  wine: { name: "The wine and cheese gift", book: "main", items: ["slate", "markers", "aerator"], line: "A slate board, cheese labels and a wine aerator, with fifty boards including a wine and cheese board." },
  keto: { name: "The keto gift", book: "keto", items: ["plane", "marcona", "olives"], line: "Twenty keto boards and three things that belong on every one of them." },
  vegan: { name: "The plant-based gift", book: "plant", items: ["acacia", "veganCheese", "olives"], line: "A board, a vegan cheese worth serving and fifteen boards to build around it." },
  home: { name: "The housewarming gift", book: "main", items: ["acacia", "ramekins"], line: "A first board for the new kitchen, the little bowls it needs and fifty boards to fill it." },
  him: { name: "The meat lover's gift", book: "main", items: ["salami", "boska", "mustard"], line: "Fifty boards, a whole salami to start the first one, the knives to cut it and the mustard that finishes it." },
  client: { name: "The client thank-you", book: "world", items: ["marcona", "figSpread"], line: "A book that keeps, plus two shelf-stable jars that can sit in a mailroom. Easy to send down a list." },
  her: { name: "The night-in gift", book: "two", items: ["honeycomb", "chocolate", "glasses"], line: "Twenty-five boards for two, a honeycomb, a bar of dark chocolate and two glasses to pour into." },
  ship: { name: "The no-ice gift box", book: "main", items: ["salami", "figSpread", "marcona"], line: "Fifty boards and three things that ship anywhere without a cold pack." },
  u50: { name: "The under-$50 board kit", book: "world", items: ["ctft"], line: "A bamboo board with a drawer of knives and sixteen boards to build on it." },
  luxury: { name: "The grand board kit", book: "main", items: ["laguiole", "engraved", "honeycomb"], line: "An engraved board, a French knife set, a honeycomb and fifty boards to build on it." }
};

// ---------------------------------------------------------------- render
// Byline and dates (10 Nov 2026, SEO review: gift pages had no author or
// dateModified). Published = the day each guide first went live; UPDATED is
// the last full pass over every guide. Bump it when the guides are rechecked.
const GIFTS_UPDATED = "2026-11-10";
const GIFT_PUBLISHED = { "charcuterie-books": "2026-10-11", "under-25": "2026-10-11", "hostess-gifts": "2026-10-11", "cheese-lovers": "2026-10-11", "stocking-stuffers": "2026-10-11", "white-elephant": "2026-10-11", "wine-and-cheese-lovers": "2026-10-11", "keto-gifts": "2026-10-11", "vegan-foodie-gifts": "2026-10-11", "housewarming": "2026-10-11", "for-him": "2026-10-19", "client-gifts": "2026-10-19", "luxury": "2026-11-08", "last-minute": "2026-11-08", "for-her": "2026-11-09", "ship-well": "2026-11-09", "under-50": "2026-11-09", "teacher-coworker": "2026-11-09", "has-everything": "2026-11-09", "secret-santa": "2026-11-09", "hanukkah": "2026-11-09", "wine-advent-calendars": "2026-11-09", "personalized-boards": "2026-11-09" };
const GIFT_AUTHOR = { "@type": "Person", "@id": "https://charcuterielab.com/about/#jimmy-wilson", name: "Jimmy Wilson", url: "https://charcuterielab.com/about/" };
const giftLongDate = (d) => new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`));
const giftByline = () => `<p class="gf-byline"><span class="byline">By <a href="/about/">Jimmy Wilson</a> · Updated ${giftLongDate(GIFTS_UPDATED)}</span></p>`;

export function giftPages(h, books) {
  const esc = h.escapeHtml;
  const T = (u, c) => h.withTracking(u, c);
  const B = books; // key -> { title, short, path, cover, ebookUrl, ebookPrice, paperbackUrl, paperbackPrice, who }
  const num = (p) => Number(String(p).replace(/[^0-9.]/g, ""));
  const range = (r) => (r ? (r[0] === r[1] ? `$${r[0]}` : `$${r[0]}–${r[1]}`) : "");

  function bookButtons(b, campaign, compact = false) {
    const paper = b.paperbackUrl
      ? `<a class="button primary gf-btn-print" href="${esc(amz(b.paperbackUrl))}" target="_blank" rel="noopener">Paperback · ${esc(b.paperbackPrice)}</a>`
      : "";
    const ebook = `<a class="button${b.paperbackUrl ? " gf-btn-ebook" : " primary"}" href="${esc(T(b.ebookUrl, campaign))}" target="_blank" rel="noopener">${b.paperbackUrl ? "Instant ebook" : "Ebook"} · ${esc(b.ebookPrice)}</a>`;
    const soon = !b.paperbackUrl && !compact ? `<span class="gf-soon">Paperback coming soon</span>` : "";
    return `<div class="gf-buy">${paper}${ebook}${soon}</div>`;
  }

  // shipStrip (the "order now" line under each quick answer) is defined after ORDER_BY below.

  function matcher(campaign, compact = false) {
    const order = ["main", "impossible", "world", "guide", "plant", "keto", "two"].filter((k) => B[k]);
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
        ${its.map((i) => `<li><a href="${esc(i.buy ? i.buy[1] : i.href || buyUrl(i))}"${i.href && !i.buy ? "" : ' target="_blank" rel="noopener nofollow"'}>${esc(i.name)}</a>, ${range(i.price)}</li>`).join("\n        ")}
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
        <dl class="sk-facts sk-facts-2"><div><dt>Price</dt><dd>${b.paperbackUrl ? `Paperback ${esc(b.paperbackPrice)} · ebook ${esc(b.ebookPrice)}` : `Ebook ${esc(b.ebookPrice)}`}</dd></div><div><dt>Get it</dt><dd>${esc(pickWhere(p))}</dd></div></dl>
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
        <dl class="sk-facts sk-facts-2"><div><dt>Price</dt><dd>${esc(price)}</dd></div><div><dt>Get it</dt><dd>${esc(pickWhere(p))}</dd></div></dl>
        <p>${esc(p.why || it.note)}${it.guide ? ` <a href="${it.guide[1]}">${esc(it.guide[0])}</a>` : ""}</p>
        ${it.buy ? `<a class="button gf-btn-shop" href="${esc(it.buy[1])}" target="_blank" rel="noopener">${esc(it.buy[0])}</a>` : it.href ? `<a class="button gf-btn-shop" href="${it.href}">${esc(it.hrefLabel || "See the printable")}</a>` : `<a class="button gf-btn-shop" href="${esc(buyUrl(it))}" target="_blank" rel="noopener nofollow">See it on Amazon</a>`}
      </div>
    </article>`;
  }

  function pickName(p) {
    if (p.book) return B[p.book].title.replace(/^Charcuterie Lab: /, "");
    return (p.item ? ITEMS[p.item] : OTHER_BOOKS[p.other]).name;
  }
  // Scannable format (Oct 20 2026): the first sentence of a pick's copy, its
  // buy link and where it's sold, for the top-picks card and the fact strips.
  const firstSentence = (t = "") => (String(t).match(/^.*?[.!?](?=\s|$)/) || [String(t)])[0];
  function pickLine(p) {
    if (p.book) return firstSentence(p.why);
    const it = p.item ? ITEMS[p.item] : OTHER_BOOKS[p.other];
    return firstSentence(p.why || it.note);
  }
  function pickBuy(p, campaign, cls) {
    if (p.book) {
      const b = B[p.book];
      return b.paperbackUrl
        ? `<a class="${cls}" href="${esc(amz(b.paperbackUrl))}" target="_blank" rel="noopener">Paperback · ${esc(b.paperbackPrice)}</a>`
        : `<a class="${cls}" href="${esc(T(b.ebookUrl, campaign))}" target="_blank" rel="noopener">Ebook · ${esc(b.ebookPrice)}</a>`;
    }
    const it = p.item ? ITEMS[p.item] : OTHER_BOOKS[p.other];
    if (it.buy) return `<a class="${cls}" href="${esc(it.buy[1])}" target="_blank" rel="noopener">${esc(it.buy[0].replace(/^See it at /, "At "))}</a>`;
    if (it.href) return `<a class="${cls}" href="${it.href}">${esc(it.hrefLabel || "See it")}</a>`;
    return `<a class="${cls}" href="${esc(buyUrl(it))}" target="_blank" rel="noopener nofollow">On Amazon</a>`;
  }
  function pickWhere(p) {
    if (p.book) return B[p.book].paperbackUrl ? "Amazon (paperback), instant ebook" : "Instant ebook";
    const it = p.item ? ITEMS[p.item] : OTHER_BOOKS[p.other];
    if (it.buy) return it.buy[0].replace(/^See it at /, "");
    if (it.href) return it.href.startsWith("/printables/") ? "Our shop (instant download)" : "Our guide";
    return "Amazon";
  }
  function topCard(picks, campaign) {
    return `<div class="sk-top"><p class="sk-top-label">Our top gift picks</p>${picks.slice(0, 3).map((p, i) => `<div class="sk-top-row"><div class="sk-top-text"><p class="sk-pill">${esc(p.best)}</p><a class="sk-top-name" href="#pick-${i + 1}">${esc(pickName(p))}</a><p class="sk-top-line">${esc(pickLine(p))}</p></div><div class="sk-top-buy"><span class="sk-price">${esc(pickPrice(p))}</span>${pickBuy(p, `${campaign}_top${i + 1}`, "button sk-buy-sm")}</div></div>`).join("")}</div>`;
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

  function schema(list, crumbs, faq, art = null) {
    const s = [
      ...(art ? [{ "@context": "https://schema.org", "@type": "Article", headline: art.headline, description: art.description, url: h.absoluteUrl(art.url), ...(art.image ? { image: h.absoluteUrl(art.image) } : {}), author: GIFT_AUTHOR, publisher: { "@type": "Organization", name: "Charcuterie Lab", url: "https://charcuterielab.com/" }, datePublished: art.published, dateModified: GIFTS_UPDATED }] : []),
      { "@context": "https://schema.org", "@type": "ItemList", itemListOrder: "https://schema.org/ItemListOrderAscending", numberOfItems: list.length, itemListElement: list.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, url: url.startsWith("http") ? url : h.absoluteUrl(url) })) },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: h.absoluteUrl(url) })) }
    ];
    if (faq) s.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) });
    return s.map((x) => `  <script type="application/ld+json">${h.jsonForScript(x)}</script>`).join("\n");
  }

  const faqBlock = (faq, title) => `<section class="ebook-section ebook-faq" id="gift-faq">
    <div class="ebook-section-inner">
      <h2>${esc(title)}</h2>
      <div class="ebook-faq-list">
        ${faq.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${a}</p></details>`).join("\n        ")}
      </div>
    </div>
  </section>`;


  // ------------------------------------------------------------ hub tools
  // Added 8 Nov 2026: gift finder, every-gift comparison, order-by calendar,
  // food-gift shipping safety. Plan: claude/gift-hub-upgrades-2026-11-08.md

  // Who the finder can shop for -> the guide it draws picks from.
  const FINDER_PEOPLE = [
    ["cheese", "Cheese lover", "cheese-lovers"],
    ["wine", "Wine lover", "wine-and-cheese-lovers"],
    ["host", "The host", "hostess-gifts"],
    ["him", "Meat lover / for him", "for-him"],
    ["her", "For her / mom", "for-her"],
    ["beginner", "Beginner", "charcuterie-books"],
    ["home", "New home", "housewarming"],
    ["keto", "Keto", "keto-gifts"],
    ["vegan", "Vegan", "vegan-foodie-gifts"],
    ["client", "Client or team", "client-gifts"],
    ["everything", "Has everything", "has-everything"],
    ["teacher", "Teacher or coworker", "teacher-coworker"],
    ["santa", "Secret Santa", "secret-santa"],
    ["hanukkah", "Hanukkah", "hanukkah"],
    ["elephant", "White elephant", "white-elephant"],
    ["stocking", "Stocking", "stocking-stuffers"]
  ];
  // Personalized items need extra making time.
  const SLOW = new Set(["engraved", "mgSleigh", "mgOak", "ugRecipe", "ugMap", "ugSwivel", "ugMonogram"]);

  function pickData(p, guide, n) {
    const href = `/gifts/${guide.slug}/#pick-${n}`;
    if (p.book) {
      const b = B[p.book];
      const pp = num(b.paperbackUrl ? b.paperbackPrice : b.ebookPrice);
      return {
        key: `book:${p.book}`, name: pickName(p), best: p.best, line: pickLine(p), href,
        lo: pp, hi: pp, price: b.paperbackUrl ? `${b.paperbackPrice} paperback · ${b.ebookPrice} ebook` : `${b.ebookPrice} ebook`,
        buy: b.paperbackUrl ? [amz(b.paperbackUrl), "Paperback on Amazon", 1] : [T(b.ebookUrl, "gift_finder"), "Get the ebook", 0],
        ibuy: [T(b.ebookUrl, "gift_finder_instant"), `Instant ebook · ${b.ebookPrice}`, 0],
        ilo: num(b.ebookPrice), instant: 1, slow: 0, where: pickWhere(p)
      };
    }
    const key = p.item || p.other;
    const it = p.item ? ITEMS[p.item] : OTHER_BOOKS[p.other];
    const lo = it.price ? it.price[0] : 40, hi = it.price ? it.price[1] : 400;
    const instant = it.href && it.href.startsWith("/printables/") ? 1 : key === "club" ? 1 : 0;
    const buy = it.buy ? [it.buy[1], it.buy[0], 1] : it.href ? [it.href, it.hrefLabel || "See it", 0] : [buyUrl(it), "See it on Amazon", 1];
    return {
      key: `${p.item ? "item" : "other"}:${key}`, name: it.name + (it.by ? ` by ${it.by}` : ""), best: p.best, line: pickLine(p), href,
      lo, hi, price: it.price ? range(it.price) : "Varies by plan", buy, instant, slow: SLOW.has(key) ? 1 : 0, where: pickWhere(p)
    };
  }

  function finderSection() {
    const bySlug = Object.fromEntries(GUIDES.map((g) => [g.slug, g]));
    const data = { people: {}, instant: [] };
    for (const [k, label, slug] of FINDER_PEOPLE) {
      const g = bySlug[slug];
      if (!g) continue;
      const picks = g.picks.filter((p) => !p.book || B[p.book]);
      data.people[k] = { label, guide: `/gifts/${slug}/`, card: g.card, picks: picks.map((p, i) => pickData(p, g, i + 1)) };
    }
    const lm = bySlug["last-minute"];
    if (lm) data.instant = lm.picks.filter((p) => !p.book || B[p.book]).map((p, i) => pickData(p, lm, i + 1)).filter((d) => d.instant);
    const btns = (name, opts, sel) => opts.map(([v, t]) => `<button type="button" class="gf-fd-opt" data-q="${name}" data-v="${v}" aria-pressed="${v === sel ? "true" : "false"}">${esc(t)}</button>`).join("");
    return `<section class="gf-finder" id="finder" aria-labelledby="gf-fd-h">
    <div class="gf-inner">
      <p class="section-kicker">Gift finder</p>
      <h2 id="gf-fd-h">Find the right gift in three taps</h2>
      <div class="gf-fd-q"><p class="gf-fd-label">1. Who is it for?</p><div class="gf-fd-opts" role="group" aria-label="Who is it for">${btns("who", FINDER_PEOPLE.filter(([k]) => data.people[k]).map(([k, t]) => [k, t]), "cheese")}</div></div>
      <div class="gf-fd-q"><p class="gf-fd-label">2. What's your budget?</p><div class="gf-fd-opts" role="group" aria-label="Budget">${btns("budget", [["any", "Any budget"], ["u25", "Under $25"], ["mid", "$25 to $75"], ["high", "$75 and up"]], "any")}</div></div>
      <div class="gf-fd-q"><p class="gf-fd-label">3. When do you need it?</p><div class="gf-fd-opts" role="group" aria-label="When do you need it">${btns("when", [["time", "Two weeks or more"], ["week", "Within a week"], ["today", "Today"]], "time")}</div></div>
      <div class="gf-fd-out" aria-live="polite">
        <p class="gf-fd-head" data-fd-head>Top gifts for a cheese lover</p>
        <div class="gf-fd-results" data-fd-results><p class="gf-fine">Loading the picks. If nothing appears, see <a href="/gifts/cheese-lovers/">gifts for cheese lovers</a>.</p></div>
        <p class="gf-fd-more" data-fd-more></p>
      </div>
    </div>
    <script type="application/json" id="gf-fd-data">${h.jsonForScript(data)}</script>
    <script>(function(){try{
var D=JSON.parse(document.getElementById("gf-fd-data").textContent),S={who:"cheese",budget:"any",when:"time"};
var R=document.querySelector("[data-fd-results]"),H=document.querySelector("[data-fd-head]"),M=document.querySelector("[data-fd-more]");
function e(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function mid(p){var lo=S.when==="today"&&p.ilo?p.ilo:p.lo;return S.when==="today"&&p.ilo?lo:(lo+p.hi)/2}
function fits(p){var m=mid(p);if(S.budget==="u25")return m<=25;if(S.budget==="mid")return m>25&&m<=75;if(S.budget==="high")return m>75;return true}
function a(b,cls){return '<a class="'+cls+'" href="'+e(b[0])+'"'+(b[2]?' target="_blank" rel="sponsored nofollow noopener"':"")+'>'+e(b[1])+"</a>"}
function card(p){var b=S.when==="today"&&p.ibuy?p.ibuy:p.buy;return '<article class="gf-fd-card"><p class="gf-tag">'+e(p.best)+'</p><h3><a href="'+e(p.href)+'">'+e(p.name)+'</a></h3><p class="gf-fd-price">'+e(S.when==="today"&&p.ibuy?p.ibuy[1]:p.price)+'</p><p>'+e(p.line)+'</p><div class="gf-fd-buy">'+a(b,"button sk-buy-sm")+'<a class="gf-fd-why" href="'+e(p.href)+'">Why we picked it</a></div></article>'}
function run(){var P=D.people[S.who];if(!P)return;var list=P.picks.slice(),note="";
if(S.when==="week")list=list.filter(function(p){return!p.slow});
if(S.when==="today")list=list.filter(function(p){return p.instant});
var f=list.filter(fits);if(S.when==="today"&&f.length<3){D.instant.forEach(function(p){if(f.length<4&&fits(p)&&!f.some(function(q){return q.key===p.key}))f.push(p)})}if(!f.length){f=list.slice(0,3);note='Nothing in this guide fits that budget exactly, so here are its top picks.'}
if(S.who!=="beginner"){var nb=f.filter(function(p){return p.key.indexOf("book:")!==0}),bk=f.filter(function(p){return p.key.indexOf("book:")===0}),mix=[];while(nb.length||bk.length){if(nb.length)mix.push(nb.shift());if(nb.length)mix.push(nb.shift());if(bk.length)mix.push(bk.shift())}f=mix}
f=f.slice(0,4);H.textContent=(S.when==="today"?"Gifts you can give today":"Top gifts")+" for: "+(/^(Hanukkah|Secret Santa)$/.test(P.label)?P.label:P.label.toLowerCase());
R.innerHTML=f.map(card).join("")+(note?'<p class="gf-fine">'+note+"</p>":"");
M.innerHTML='See all '+P.picks.length+' picks in <a href="'+e(P.guide)+'">'+e(P.card)+"</a>"+(S.when==="today"?' or <a href="/gifts/last-minute/">every last-minute gift</a>.':".")}
document.querySelectorAll(".gf-fd-opt").forEach(function(b){b.addEventListener("click",function(){S[b.dataset.q]=b.dataset.v;document.querySelectorAll('.gf-fd-opt[data-q="'+b.dataset.q+'"]').forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});run()})});run();
}catch(x){}})();</script>
  </section>`;
  }

  function compareSection() {
    // Every gift across every guide, once, with the guides it appears in.
    const rows = new Map();
    for (const g of GUIDES) {
      g.picks.filter((p) => !p.book || B[p.book]).forEach((p, i) => {
        const d = pickData(p, g, i + 1);
        if (!rows.has(d.key)) rows.set(d.key, { ...d, guides: [] });
        rows.get(d.key).guides.push([g.kicker.replace(/^Gift guide · /, ""), `/gifts/${g.slug}/#pick-${i + 1}`]);
      });
    }
    const list = [...rows.values()].sort((a, b) => (a.lo + a.hi) / 2 - (b.lo + b.hi) / 2);
    const band = (d) => { const m = (d.lo + d.hi) / 2; return m <= 25 ? "u25" : m <= 75 ? "mid" : "high"; };
    // Gift hub, 8 Nov 2026 (visitor review): the cheapest 12 show, the rest wait behind "Show all".
    const SHOW = 12;
    const tr = (d, i) => `<tr data-band="${band(d)}" data-instant="${d.instant}"${i >= SHOW ? " data-more hidden" : ""}>
          <th scope="row"><a href="${d.guides[0][1]}">${esc(d.name)}</a>${d.instant ? ' <span class="gf-cmp-flag">Instant</span>' : ""}${d.slow ? ' <span class="gf-cmp-flag gf-cmp-slow">Order early</span>' : ""}</th>
          <td>${esc(d.price)}</td>
          <td>${d.guides.slice(0, 3).map(([t, u]) => `<a href="${u}">${esc(t)}</a>`).join(", ")}${d.guides.length > 3 ? ` +${d.guides.length - 3} more` : ""}</td>
          <td><a href="${esc(d.buy[0])}"${d.buy[2] ? ' target="_blank" rel="sponsored nofollow noopener"' : ""}>${esc(d.where)}</a></td>
        </tr>`;
    return `<section class="gf-compare" id="compare" aria-labelledby="gf-cmp-h">
      <p class="section-kicker">Every gift, side by side</p>
      <h2 id="gf-cmp-h">All ${list.length} gifts from our guides, compared by price</h2>
      <p>Every gift we recommend across all ${GUIDES.length} guides, cheapest first, with the guides it appears in. Tap a gift for our full write-up.</p>
      <div class="gf-cmp-filter" role="group" aria-label="Filter gifts">
        <button type="button" data-f="all" aria-pressed="true">All</button><button type="button" data-f="u25" aria-pressed="false">Under $25</button><button type="button" data-f="mid" aria-pressed="false">$25 to $75</button><button type="button" data-f="high" aria-pressed="false">$75 and up</button><button type="button" data-f="instant" aria-pressed="false">Instant (no shipping)</button>
      </div>
      <div class="gf-cmp-wrap"><table class="gf-cmp">
        <thead><tr><th scope="col">Gift</th><th scope="col">Typical price</th><th scope="col">Best in</th><th scope="col">Where to get it</th></tr></thead>
        <tbody>
        ${list.map(tr).join("\n        ")}
        </tbody>
      </table></div>
      ${list.length > SHOW ? `<p class="gf-cmp-all"><button type="button" class="button" data-cmp-all>Show all ${list.length} gifts</button></p>` : ""}
      <p class="gf-fine">Book prices are our list prices. Other prices are typical ranges, checked ${PRICES_CHECKED}; check the price at checkout. "Instant" means a download or a gift plan with nothing to ship.</p>
      <script>(function(){try{var bs=document.querySelectorAll(".gf-cmp-filter button"),rs=document.querySelectorAll(".gf-cmp tbody tr");bs.forEach(function(b){b.addEventListener("click",function(){var f=b.dataset.f;bs.forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});var all=document.querySelector("[data-cmp-all]");rs.forEach(function(r){r.hidden=!(f==="all"||(f==="instant"?r.dataset.instant==="1":r.dataset.band===f))});if(all)all.parentNode.hidden=true})});var all=document.querySelector("[data-cmp-all]");if(all)all.addEventListener("click",function(){rs.forEach(function(r){r.hidden=false});all.parentNode.hidden=true})}catch(x){}})();</script>
    </section>`;
  }

  // Christmas 2026. USPS dates: usps.com holiday shipping page, checked 8 Nov 2026.
  const ORDER_BY = [
    ["2026-11-25", "Now through Thanksgiving", "Engraved and personalized boards", "Makers need extra time to engrave, so these go first."],
    ["2026-11-30", "Black Friday (Nov 27) to Cyber Monday (Nov 30)", "Gear: knives, boards, serveware and books", "The biggest sales of the season, with weeks of shipping time left."],
    ["2026-12-11", "By Friday, Dec 11", "Perishable gift boxes and cheese clubs", "Perishable boxes often ship only Monday to Wednesday, so the last safe shipping week is Dec 14."],
    ["2026-12-17", "Thursday, Dec 17", "Last day for USPS Ground Advantage and First-Class Mail", "If you're mailing a gift yourself the cheap way, this is the cutoff."],
    ["2026-12-18", "Friday, Dec 18", "Last day for USPS Priority Mail", "Also the day our shipping note switches to the instant ebook."],
    ["2026-12-19", "Saturday, Dec 19", "Last day for USPS Priority Mail Express", "The final USPS option. UPS and FedEx post their own dates; check before you buy."],
    ["2026-12-25", "Dec 20 to Christmas morning", "Instant gifts only", "Ebooks, a club gift or a DIY board kit from the grocery store, plus our free printable gift card."]
  ];
  // "Order now" line under every gift page's quick answer (9 Nov 2026): the
  // current step of ORDER_BY, worked out on the visitor's clock, so it moves
  // on without a rebuild. After the last shipping day it switches to the
  // instant gifts, and after Christmas it hides.
  const SHIP_LINES = [
    ["2026-11-25", "Engraved and personalized boards need ordering before Thanksgiving."],
    ["2026-11-30", "Black Friday to Cyber Monday (Nov 27 to 30) is the time to buy knives, boards and books."],
    ["2026-12-11", "Order perishable gift boxes and cheese clubs by Friday, Dec 11."],
    ["2026-12-17", "USPS Ground Advantage ships until Thursday, Dec 17, and Priority Mail until Friday, Dec 18."],
    ["2026-12-18", "Last day for USPS Priority Mail: Friday, Dec 18."],
    ["2026-12-19", "Last day for USPS Priority Mail Express: Saturday, Dec 19."]
  ];
  const shipStrip = `<p class="gf-ship" data-gf-ship data-steps="${esc(JSON.stringify(SHIP_LINES))}"><strong>Christmas 2026:</strong> ${esc(SHIP_LINES[0][1])} <a href="/gifts/#order-by">Every deadline</a></p>
  <script>(function(){try{var e=document.querySelector("[data-gf-ship]");if(!e)return;var S=JSON.parse(e.dataset.steps),t=new Date(),d=new Date(t.getFullYear(),t.getMonth(),t.getDate());if(t.getMonth()===11&&t.getDate()>=26||t.getMonth()===0){e.hidden=true;return}var a=' <a href="/gifts/#order-by">Every deadline</a>';for(var i=0;i<S.length;i++){var p=S[i][0].split("-"),b=new Date(+p[0],+p[1]-1,+p[2]);if(d<=b){e.innerHTML="<strong>Christmas 2026:</strong> "+S[i][1]+a;return}}e.classList.add("gf-ship-late");e.innerHTML='<strong>Too late to ship?</strong> Give something instant: an ebook or a club gift, with our <a href="/gifts/#gift-card">free printable gift card</a>.'+a}catch(x){}})();</script>`;

  function calendarSection(id = "order-by") {
    return `<section class="gf-cal" id="${id}" aria-labelledby="${id}-h">
      <p class="section-kicker">Holiday timeline</p>
      <h2 id="${id}-h">When to order charcuterie gifts for Christmas 2026</h2>
      <p class="gf-cal-count" data-cal-count></p>
      <ol class="gf-cal-list">
        ${ORDER_BY.map(([by, when, what, why]) => `<li data-by="${by}"><p class="gf-cal-when">${esc(when)}</p><p class="gf-cal-what">${esc(what)}</p><p class="gf-cal-why">${esc(why)}</p></li>`).join("\n        ")}
      </ol>
      <p class="gf-fine">USPS dates are its recommended send-by dates for delivery in the lower 48 states by Dec 25 (<a href="https://www.usps.com/holiday/holiday-shipping-dates.htm" target="_blank" rel="noopener">USPS</a>, checked Nov 8, 2026). Amazon and other stores show their own delivery date at checkout.</p>
      <script>(function(){try{var t=new Date(),d=new Date(t.getFullYear(),t.getMonth(),t.getDate()),x=new Date(2026,11,25),n=Math.round((x-d)/864e5),c=document.querySelector("#${id} [data-cal-count]");if(c){c.textContent=n>1?n+" days until Christmas. The highlighted step is what to order now.":n===1?"Christmas is tomorrow: instant gifts only.":n===0?"Merry Christmas! Instant gifts still work today.":""}var done=false;document.querySelectorAll("#${id} li[data-by]").forEach(function(li){var p=li.dataset.by.split("-"),b=new Date(+p[0],+p[1]-1,+p[2]);if(d>b){li.classList.add("gf-cal-past")}else if(!done){li.classList.add("gf-cal-now");done=true}})}catch(e){}})();</script>
    </section>`;
  }

  const safetySection = `<section class="gf-safe" id="food-safety" aria-labelledby="gf-safe-h">
      <p class="section-kicker">Sending food as a gift</p>
      <h2 id="gf-safe-h">How to ship and receive cheese and cured meat safely</h2>
      <p>Food gifts are the easiest to get right and the easiest to get wrong. The difference is whether the box needs to stay cold. These rules come from the USDA's guidance on mail-order food.</p>
      <div class="gf-safe-grid">
        <div class="gf-safe-col gf-safe-ok">
          <h3>Ships without ice</h3>
          <ul><li>Whole hard salami and summer sausage (unopened)</li><li>Hard, aged cheese such as aged cheddar or Parmigiano-Reggiano</li><li>Country ham</li><li>Crackers, nuts, honey, honeycomb and jams</li><li>Books, knives and boards</li></ul>
          <p>The USDA names hard salami, hard cheese and country ham as good choices to send, because they don't need a cold source.</p>
        </div>
        <div class="gf-safe-col gf-safe-cold">
          <h3>Needs a cold pack</h3>
          <ul><li>Soft cheese: brie, burrata, fresh goat cheese</li><li>Sliced or pre-cut deli meat</li><li>Anything marked "Keep Refrigerated", even if it's smoked, cured or vacuum-packed</li></ul>
          <p>Pack with frozen gel packs or dry ice, label the box "Keep Refrigerated", and ship early in the week so it doesn't sit over a weekend.</p>
        </div>
      </div>
      <h3>When a food gift arrives</h3>
      <ol class="gf-safe-steps">
        <li><strong>Open it right away</strong> if it says "Keep Refrigerated".</li>
        <li><strong>Check the temperature.</strong> It should arrive frozen, partly frozen with ice crystals, or below 40°F on a food thermometer.</li>
        <li><strong>Above 40°F? Don't eat it or even taste it.</strong> Contact the company and ask for a replacement shipped with a proper cold source.</li>
        <li><strong>Refrigerate it</strong> as soon as it's checked.</li>
      </ol>
      <p class="gf-fine">Source: <a href="https://www.usda.gov/node/17662" target="_blank" rel="noopener">USDA guidance on mail-order and gift food</a>. Questions: USDA Meat and Poultry Hotline, 1-888-674-6854. Also: don't send perishables to an office that may be closed for the holidays.</p>
    </section>`;

  // A long reference section folded on the hub: the heading and a one-line
  // answer stay visible, the detail opens on tap (or from a #link).
  function fold(id, title, line, inner) {
    const body = inner.replace(/<p class="section-kicker">[^<]*<\/p>\s*<h2[^>]*>[\s\S]*?<\/h2>/, "").replace(` id="${id}"`, ` id="${id}-body"`).replace(/ aria-labelledby="[^"]*"/, "");
    return `<details class="gf-fold" id="${id}">
      <summary><h2>${esc(title)}</h2><span>${esc(line)}</span></summary>
      ${body}
    </details>`;
  }

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
        type: "article",
        published: GIFT_PUBLISHED[g.slug] || "2026-10-11",
        modified: GIFTS_UPDATED,
        head: schema(picks.map((p, i) => [pickName(p), `${path}#pick-${i + 1}`]), [["Home", "/"], ["Gift guide", "/gifts/"], [g.card, path]], g.faq, { headline: g.seoTitle, description: g.description, url: path, image: g.image, published: GIFT_PUBLISHED[g.slug] || "2026-10-11" }),
        body: `<main class="gf-page gf-spoke">
  <section class="gf-hero">
    <div class="gf-inner">
      <p class="ing-crumb"><a href="/gifts/">Gift guide</a> <span aria-hidden="true">/</span> ${esc(g.card)}</p>
      <p class="section-kicker">${esc(g.kicker)}</p>
      <h1>${esc(g.h1)}</h1>
      ${giftByline()}
      ${g.shipNote ? `<p class="gf-ship"><strong>Order by:</strong> ${esc(g.shipNote)}</p>` : ""}${g.slug === "hanukkah" ? "" : shipStrip}
      <figure class="gf-spoke-fig"><img class="gf-hero-img" src="${esc(h.thumb ? h.thumb(guidePhoto(g), "m") : guidePhoto(g))}" alt="${esc(g.card)}" width="1024" height="683" fetchpriority="high" decoding="async"><figcaption>${esc(g.cardLine)}</figcaption></figure>
    </div>
  </section>
  <div class="gf-inner gf-body gf-skim">
    ${topCard(picks, campaign)}
    <nav class="sk-jump" aria-label="On this page"><a href="#gifts">All ${picks.length} gifts</a>${g.extra ? `<a href="#gift-extra">${esc(g.extra.title)}</a>` : ""}<a href="#gf-set-h">Gift set</a><a href="#gift-faq">FAQ</a></nav>
    <p class="gf-intro">${esc(g.intro)}</p>
    <h2 id="gifts">All ${picks.length} gifts</h2>
    <p class="sk-lede">${esc(g.method)}</p>
    <div class="gf-picks">
    ${picks.map((p, i) => pickCard(p, i, campaign)).join("\n    ")}
    </div>
    ${g.stretch ? `<p class="gf-stretch">${g.stretch}</p>` : ""}
    ${g.extra ? `<section class="gf-extra" id="gift-extra"><h2>${esc(g.extra.title)}</h2>${g.extra.body}</section>` : ""}
    ${g.calendar ? calendarSection("order-by") : ""}
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
    // 9 Nov 2026: the eight most-shopped guides first, the rest behind "Show all".
    const FIRST = ["cheese-lovers", "under-25", "hostess-gifts", "stocking-stuffers", "secret-santa", "white-elephant", "for-her", "for-him"];
    const rank = (g) => { const i = FIRST.indexOf(g.slug); return i < 0 ? 99 : i; };
    const personCards = [...GUIDES].sort((a, b) => rank(a) - rank(b)).map((g) => [g.card, `/gifts/${g.slug}/`, g.cardLine, g.image]);
    const GSHOW = 8;
    // 9 Nov 2026: the ranked gift posts (where most gift searches land) sit
    // beside the guides by person, so both halves of the gift content meet here.
    const giftCards = [
      ["Cheese advent calendars 2026", "/blog/cheese-advent-calendars-2026/", "Every calendar out this year, and which sell out first", "/images/cheese-advent-calendars-2026.jpg"],
      ["Meat and cheese gift boxes, ranked", "/blog/best-charcuterie-gift-boxes/", "Ten boxes from $25 to $190, with the one we'd send", "/images/charcuterie-gift-basket.jpg"],
      ["Charcuterie gift baskets on Amazon", "/blog/best-charcuterie-gift-baskets-amazon/", "The ones worth it, compared", "/images/best-charcuterie-gift-baskets-amazon.jpg"],
      ["Cheese-of-the-month clubs", "/blog/best-cheese-of-the-month-clubs/", "A gift that arrives all year", "/images/charcuterie-gift-basket-packing.jpg"],
      ["DIY charcuterie gift basket", "/blog/charcuterie-gift-basket/", "What to pack at $25, $50 and $100", "/images/charcuterie-gift-box-50.jpg"],
      ["The best charcuterie boards to buy", "/blog/best-charcuterie-boards/", "8 picks from $20 bamboo to a marble splurge", "/images/best-charcuterie-boards.jpg"],
      ["The best cheese knife sets", "/blog/best-cheese-knife-sets/", "Which knives you need, from $15 to $100", "/images/best-cheese-knife-sets.jpg"],
      ["The best panettone", "/blog/best-panettone/", "The Italian Christmas cake people actually want", "/images/dessert-board.webp"]
    ];
    const guideCards = [...personCards, ...giftCards];
    const chips = [
      ["Budget", [["Under $25", "/gifts/under-25/"], ["Under $50", "/gifts/under-50/"], ["Stocking stuffers", "/gifts/stocking-stuffers/"], ["Gift sets $35 to $95", "#sets"], ["DIY basket", "/blog/charcuterie-gift-basket/"], ["Splurge ($50+)", "/gifts/luxury/"]]],
      ["Person", [["Cheese lover", "/gifts/cheese-lovers/"], ["Wine lover", "/gifts/wine-and-cheese-lovers/"], ["Host", "/gifts/hostess-gifts/"], ["For him", "/gifts/for-him/"], ["For her", "/gifts/for-her/"], ["Has everything", "/gifts/has-everything/"], ["Book lover", "/gifts/charcuterie-books/"], ["Keto", "/gifts/keto-gifts/"], ["Vegan", "/gifts/vegan-foodie-gifts/"]]],
      ["Occasion", [["Hostess gift", "/gifts/hostess-gifts/"], ["Secret Santa", "/gifts/secret-santa/"], ["White elephant", "/gifts/white-elephant/"], ["Hanukkah", "/gifts/hanukkah/"], ["Stocking stuffer", "/gifts/stocking-stuffers/"], ["Housewarming", "/gifts/housewarming/"], ["Client gifts", "/gifts/client-gifts/"], ["Teacher & coworker", "/gifts/teacher-coworker/"], ["Ships well", "/gifts/ship-well/"], ["Last minute", "/gifts/last-minute/"]]],
      ["Popular", [["Cheese advent calendars", "/blog/cheese-advent-calendars-2026/"], ["Wine advent calendars", "/gifts/wine-advent-calendars/"], ["Personalized boards", "/gifts/personalized-boards/"], ["Gift boxes, ranked", "/blog/best-charcuterie-gift-boxes/"], ["Cheese clubs", "/blog/best-cheese-of-the-month-clubs/"], ["Knife sets", "/blog/best-cheese-knife-sets/"]]],
      ["Tools", [["Gift finder", "#finder"], ["Compare every gift", "#compare"], ["When to order", "#order-by"], ["Shipping food safely", "#food-safety"]]]
    ];
    const faq = [
      ["What do you get someone who loves charcuterie?", "A board book that tells them exactly what to buy and how much, paired with one tool or one jar: a cheese knife set, fig spread, hot honey or honeycomb. Our top pick is 50 Boards, Built by Science ($25.99 paperback) with a jar of fig spread."],
      ["What goes in a charcuterie gift basket?", "A whole dry salami, crackers, a jar of fig spread, nuts, a small knife and one or two cheeses. The salami, crackers, jam and nuts are shelf-stable; add the cheese right before you hand it over and tell them to refrigerate it. Our DIY gift basket guide has full lists at $25, $50 and $100."],
      ["What is the best charcuterie book for a beginner?", "50 Boards, Built by Science. Every board comes with a shopping list with amounts, a build order and swaps, so a beginner can make a full board without guessing."],
      ["What's a good last-minute charcuterie gift?", "An ebook. Buy the PDF, then forward the download email or print our free \"Your first board is on me\" gift card and write the book's name on it."],
      ["How much should I spend on a charcuterie gift?", "$15 to $35 covers most gifts: a book, a knife set or a jar trio. Our ready-made gift sets run from about $35 to $95."],
      ["When should I order charcuterie gifts for Christmas 2026?", "Order engraved boards before Thanksgiving and perishable cheese or meat boxes by Dec 11. USPS's last recommended send-by dates for Christmas delivery in the lower 48 are Dec 17 for Ground Advantage, Dec 18 for Priority Mail and Dec 19 for Priority Mail Express. After that, give an ebook or a club gift."],
      ["Can you mail cheese and salami as a gift?", "Yes. Whole hard salami and hard aged cheese ship without ice; the USDA suggests them for that reason. Soft cheese and sliced meat need frozen gel packs or dry ice, a Keep Refrigerated label and shipping early in the week. If a perishable gift arrives above 40°F, don't eat it."],
      ["What is a good charcuterie gift for a man?", "A board book with a whole dry salami and a jar of whole-grain mustard, or a tool he'll use every time, like a cheese knife set or the Wüsthof cheese plane. Our gifts for him guide has 12 ideas."]
    ];
    pages.push({
      path,
      html: h.layout({
        title: "Charcuterie Gift Ideas 2026: For Every Board Lover",
        canonical: path,
        image: "/images/charcuterie-gift-basket.jpg",
        description: "Charcuterie gift ideas for 2026: board books, gifts under $25, stocking stuffers, white elephant, hostess, housewarming and client gifts, gifts for him and for cheese, wine, keto and vegan lovers, plus gift sets.",
        type: "article",
        published: "2026-10-11",
        modified: GIFTS_UPDATED,
        head: schema(guideCards.map(([t, u]) => [t, u]), [["Home", "/"], ["Gift guide", path]], faq, { headline: "Charcuterie Gift Ideas 2026: For Every Board Lover", description: "Charcuterie gift ideas for 2026 for every board lover and every budget.", url: path, image: "/images/charcuterie-gift-basket.jpg", published: "2026-10-11" }),
        body: `<main class="gf-page gf-hub">
  <section class="gf-hero">
    <div class="gf-inner">
      <p class="section-kicker">Gift guide 2026</p>
      <h1>Charcuterie gift ideas for every board lover and every budget</h1>
      ${giftByline()}
      ${shipStrip}
      <img class="gf-hero-img" src="${esc(h.thumb("/images/charcuterie-gift-basket.jpg", "m"))}" alt="A charcuterie gift basket with cheese, salami, crackers and a jar of fig spread" width="1200" height="800" fetchpriority="high" decoding="async">
      <nav class="gf-chips" aria-label="Shop gifts by">
        ${chips.map(([label, list]) => `<div class="gf-chip-row"><span>${esc(label)}</span>${list.map(([t, u]) => `<a href="${u}">${esc(t)}</a>`).join("")}</div>`).join("\n        ")}
      </nav>
    </div>
  </section>

  ${finderSection()}

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
    <section class="gf-guides gf-guides-top" aria-labelledby="gf-guides-h">
      <h2 id="gf-guides-h">Every gift guide</h2>
      <h3 class="gf-guides-sub">By person and occasion</h3>
      <div class="gf-guide-grid">${personCards.map(([t, u, line, img], i) => `<a class="gf-guide" href="${u}"${i >= GSHOW ? " data-gmore hidden" : ""}><img src="${esc(h.thumb(img, "m"))}" alt="" width="400" height="268" loading="lazy" decoding="async"><strong>${esc(t)}</strong><span>${esc(line)}</span></a>`).join("\n      ")}</div>
      ${personCards.length > GSHOW ? `<p class="gf-cmp-all"><button type="button" class="button" data-gall>Show all ${personCards.length} guides</button></p><script>(function(){var b=document.querySelector("[data-gall]");if(b)b.addEventListener("click",function(){b.parentNode.hidden=true;document.querySelectorAll("[data-gmore]").forEach(function(a){a.hidden=false})})})();</script>` : ""}
      <h3 class="gf-guides-sub">Ranked gifts and how-tos</h3>
      <div class="gf-guide-grid">${giftCards.map(([t, u, line, img]) => `<a class="gf-guide" href="${u}"><img src="${esc(h.thumb(img, "m"))}" alt="" width="400" height="268" loading="lazy" decoding="async"><strong>${esc(t)}</strong><span>${esc(line)}</span></a>`).join("\n      ")}</div>
    </section>

    ${matcher("gift_hub", true)}

    ${fold("sets", "Ready-made gift sets, about $35 to $90", "Three sets, each a book with the board, knives or jars to go with it.", `<section class="gf-sets" id="sets" aria-labelledby="gf-sets-h">
      <p class="section-kicker">Ready-made gift sets</p>
      <h2 id="gf-sets-h">Build the gift: three sets, each with a book at the centre</h2>
      <p>A board and knives are a nice gift. A board, knives and a book that tells them exactly what to put on it is a better one.</p>
      <div class="gf-set-grid">${["starter", "host", "cheese"].map((k) => setCard(k, "gift_hub_set")).join("\n      ")}</div>
      <p class="gf-fine">Book prices are our list prices. Other items are typical ranges, checked ${PRICES_CHECKED}; check the price at checkout.</p>
    </section>`)}

    ${fold("compare", "Compare every gift by price", "Every gift from our guides in one table, cheapest first, with a budget filter.", compareSection())}

    ${fold("order-by", "When to order charcuterie gifts for Christmas 2026", "Perishable boxes by Dec 11, USPS Priority Mail by Dec 18, instant gifts after that.", calendarSection("order-by-cal"))}

    ${fold("food-safety", "How to ship and receive cheese and cured meat safely", "Hard salami and aged cheese ship without ice; soft cheese and sliced meat need cold packs.", safetySection)}
    <script>(function(){function o(){var h=location.hash.slice(1);if(!h)return;var d=document.getElementById(h);if(d&&d.tagName==="DETAILS")d.open=true}o();addEventListener("hashchange",o);document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener("click",function(){var d=document.getElementById(a.getAttribute("href").slice(1));if(d&&d.tagName==="DETAILS")d.open=true})})})();</script>
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
