// Dietary hub book box (3 Nov 2026): the two diet books (Plant-Based, Keto),
// added to the built /dietary/ page before the swap chart, so dietary.mjs is
// left alone. Buttons go to the Gumroad ebook and the Amazon paperback.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { KETO_BOOK, PLANT_BOOK } from "./boards.mjs";

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tag = (url, c) => (/gumroad\.com/.test(url) ? `${url}${url.includes("?") ? "&" : "?"}utm_source=charcuterielab&utm_medium=site&utm_campaign=${c}` : url);

export async function injectDietaryBooks(dist, { keto = 0, plant = 0 } = {}) {
  const file = join(dist, "dietary", "index.html");
  let html;
  try { html = await readFile(file, "utf8"); } catch { return 0; }
  if (html.includes("dt-books")) return 0;
  const books = [
    PLANT_BOOK.ebookUrl && { b: PLANT_BOOK, name: "15 Show-Stopping Plant-Based Boards", line: `15 fully plant-based boards, from cashew brie and smoked tempeh to hummus and falafel spreads, each with a shopping list and build steps.`, c: "dietary_hub_plant" },
    KETO_BOOK.ebookUrl && { b: KETO_BOOK, name: "Keto & Low-Carb Boards", line: `Keto boards at 4 to 9 g net carbs per serving, with low-carb dippers in place of crackers, the net carbs of every item and full macros per serving.`, c: "dietary_hub_keto" }
  ].filter(Boolean);
  if (!books.length) return 0;
  const box = `<section class="bl-section dt-books" aria-labelledby="dt-books-h">
      <h2 id="dt-books-h">The diet books</h2>
      <div class="dt-books-grid">
        ${books.map(({ b, name, line, c }) => `<article class="dt-book">
          <img src="${esc(b.cover)}" alt="${esc(b.title)} cover" width="240" height="310" loading="lazy" decoding="async">
          <div>
            <h3>${esc(name)}</h3>
            <p>${esc(line)}</p>
            <p class="dt-book-buy"><a class="button primary" href="${esc(tag(b.ebookUrl, c))}" target="_blank" rel="noopener">Ebook · ${esc(b.ebookPrice)}</a>${b.paperbackUrl ? `<a class="button" href="${esc(b.paperbackUrl)}" target="_blank" rel="noopener sponsored">Paperback · ${esc(b.paperbackPrice || "")}</a>` : ""}</p>
          </div>
        </article>`).join("\n        ")}
      </div>
    </section>

    `;
  const at = html.indexOf('<section class="bl-section" aria-labelledby="swaps-h">');
  if (at < 0) return 0;
  await writeFile(file, html.slice(0, at) + box + html.slice(at));
  return books.length;
}
