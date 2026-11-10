// Links into the gift guides (10 Nov 2026, SEO review: gift pages).
// 9 of the 23 gift guides had no links at all from outside the gift section,
// and their average position was 15.4. Each page below is where a reader is
// already thinking about the thing the gift guide sells (a keto board, a
// luxury guide, the Christmas page), so it gets one short line pointing at
// the matching guides, just above its FAQ (or at the end of the main column).
// A page that already links a guide in its body skips that guide.
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const G = {
  books: ["charcuterie-books", "the best charcuterie books to give"],
  u25: ["under-25", "gifts under $25"],
  u50: ["under-50", "gifts under $50"],
  hostess: ["hostess-gifts", "hostess gifts"],
  cheese: ["cheese-lovers", "gifts for cheese lovers"],
  stocking: ["stocking-stuffers", "stocking stuffers"],
  elephant: ["white-elephant", "white elephant gifts"],
  wine: ["wine-and-cheese-lovers", "gifts for wine and cheese lovers"],
  keto: ["keto-gifts", "gifts for keto friends"],
  vegan: ["vegan-foodie-gifts", "gifts for vegan foodies"],
  house: ["housewarming", "housewarming gifts"],
  him: ["for-him", "charcuterie gifts for men"],
  her: ["for-her", "charcuterie gifts for her"],
  client: ["client-gifts", "corporate gifts for clients"],
  luxury: ["luxury", "luxury charcuterie gifts"],
  ship: ["ship-well", "meat and cheese gifts that ship without ice"],
  teacher: ["teacher-coworker", "teacher and coworker gifts"],
  everything: ["has-everything", "gifts for someone who has everything"],
  santa: ["secret-santa", "Secret Santa gifts"],
  hanukkah: ["hanukkah", "Hanukkah gifts for foodies"],
  wineadvent: ["wine-advent-calendars", "wine advent calendars"],
  engraved: ["personalized-boards", "personalized charcuterie boards"],
  lastmin: ["last-minute", "last-minute charcuterie gifts"]
};

// source page -> [lead-in, gift keys]
const MAP = {
  "/holidays/christmas/": ["Christmas shopping too? See our", ["stocking", "santa", "elephant", "lastmin"]],
  "/holidays/thanksgiving/": ["Going as a guest? Bring one of our", ["hostess", "u25"]],
  "/holidays/hanukkah/": ["Shopping for the holiday? See our", ["hanukkah"]],
  "/holidays/valentines-day/": ["Giving a gift too? See our", ["her", "him"]],
  "/holidays/mothers-day/": ["For the gift itself, see our", ["her"]],
  "/boards/keto-low-carb/": ["Shopping for a keto friend? See our", ["keto"]],
  "/boards/keto-charcuterie-board/": ["Shopping for a keto friend? See our", ["keto"]],
  "/blog/best-cheese-crisps/": ["Giving them as a gift? See our", ["keto", "teacher"]],
  "/blog/best-vegan-cheese/": ["Giving it as a gift? See our", ["vegan"]],
  "/dietary/vegan/": ["Shopping for a vegan friend? See our", ["vegan"]],
  "/boards/plant-based/": ["Shopping for a plant-based friend? See our", ["vegan"]],
  "/blog/best-wine-for-charcuterie-board/": ["Giving a bottle? See our", ["wine", "wineadvent"]],
  "/blog/wine-and-charcuterie-board/": ["Giving it as a gift? See our", ["wine"]],
  "/pairings/wine/": ["Shopping for a wine lover? See our", ["wine", "wineadvent"]],
  "/blog/best-port-wine/": ["Giving port as a gift? See our", ["wine", "luxury"]],
  "/blog/cheese-advent-calendar-australia-canada/": ["Want the wine version? See our", ["wineadvent"]],
  "/printables/diy-cheese-advent-calendar-kit/": ["Want the wine version? See our", ["wineadvent"]],
  "/blog/best-caviar/": ["Giving caviar? See our", ["luxury", "everything"]],
  "/blog/best-truffle-honey/": ["Giving it as a gift? See our", ["luxury", "hostess"]],
  "/blog/best-chocolate-gift-boxes/": ["More gift ideas:", ["luxury", "her", "everything"]],
  "/blog/best-tinned-fish/": ["Giving tins as a gift? See our", ["luxury"]],
  "/blog/best-marrons-glaces/": ["More gift ideas:", ["luxury", "everything"]],
  "/boards/luxury-charcuterie-board/": ["Giving it as a gift? See our", ["luxury"]],
  "/blog/best-meat-sticks/": ["Giving them as a gift? See our", ["him"]],
  "/blog/best-beef-jerky/": ["Giving it as a gift? See our", ["him"]],
  "/blog/best-summer-sausage/": ["Mailing it as a gift? See our", ["ship", "him"]],
  "/blog/whiskey-and-cheese-pairing/": ["Giving it as a gift? See our", ["him"]],
  "/boards/meat-lovers-charcuterie-board/": ["Shopping for a meat lover? See our", ["him"]],
  "/blog/best-meat-slicer/": ["Giving a slicer? See our", ["him", "u50"]],
  "/blog/best-hot-honey/": ["Giving it as a gift? See our", ["her", "teacher"]],
  "/blog/best-peppermint-bark/": ["More small gifts:", ["stocking", "teacher"]],
  "/blog/best-toffee/": ["More small gifts:", ["stocking", "teacher"]],
  "/blog/best-shortbread/": ["More small gifts:", ["teacher", "stocking"]],
  "/blog/best-store-bought-christmas-cookies/": ["More small gifts:", ["teacher", "santa"]],
  "/blog/best-hot-cocoa-mix/": ["More small gifts:", ["stocking", "teacher"]],
  "/boards/office-party-charcuterie-board/": ["Office gift exchange too? See our", ["santa", "elephant", "client"]],
  "/blog/best-charcuterie-gift-boxes/": ["Sending to clients? See our", ["client", "ship"]],
  "/printables/charcuterie-business-starter-kit/": ["Selling to companies? See what they buy:", ["client"]],
  "/blog/best-charcuterie-boards/": ["Giving a board? See our", ["house", "engraved", "u50"]],
  "/blog/best-charcuterie-board-accessories/": ["Giving it as a gift? See our", ["house", "elephant", "u50"]],
  "/blog/amazon-charcuterie-board-sets-reviewed/": ["Giving a set? See our", ["house", "u50"]],
  "/blog/best-cheese-knife-sets/": ["Giving a set? See our", ["u50", "elephant", "house"]],
  "/blog/charcuterie-board-sizes/": ["Buying a board as a gift? See our", ["engraved", "house"]],
  "/blog/how-to-transport-charcuterie-board/": ["Mailing food as a gift? See our", ["ship"]],
  "/blog/charcuterie-gift-basket/": ["Mailing it? See our", ["ship", "lastmin"]],
  "/blog/unique-charcuterie-books/": ["Giving a book? See", ["books"]],
  "/blog/charcuterie-board-ideas/": ["Giving a book of boards? See", ["books"]],
  "/blog/best-cheese-of-the-month-clubs/": ["Giving a club? See our", ["luxury", "her"]]
};

export async function injectGiftLinks(dist) {
  let lines = 0;
  const missing = [];
  for (const [src, [lead, keys]] of Object.entries(MAP)) {
    const file = join(dist, src, "index.html");
    if (!existsSync(file)) { missing.push(src); continue; }
    let html = await readFile(file, "utf8");
    const start = html.indexOf("<main"), end = html.lastIndexOf("</main>");
    if (start < 0 || end < 0) { missing.push(src); continue; }
    const main = html.slice(start, end);
    const picks = keys.map((k) => G[k]).filter(([slug]) => !main.includes(`href="/gifts/${slug}/"`) && existsSync(join(dist, "gifts", slug, "index.html")));
    if (!picks.length) continue;
    const links = picks.map(([slug, text]) => `<a href="/gifts/${slug}/">${text}</a>`);
    const list = links.length > 1 ? `${links.slice(0, -1).join(", ")} and ${links[links.length - 1]}` : links[0];
    const line = `<p class="gift-line">${lead} ${list}.</p>\n`;
    // above the FAQ heading if there is one, else at the end of the main column
    const faq = main.search(/<h2[^>]*(id="[^"]*(faq|questions)[^"]*"|>[^<]*(FAQ|[Qq]uestions))/);
    const at = faq >= 0 ? start + faq : end;
    html = html.slice(0, at) + line + html.slice(at);
    await writeFile(file, html);
    lines++;
  }
  return { lines, missing };
}
