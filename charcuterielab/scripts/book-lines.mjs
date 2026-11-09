// Book lines (9 Nov 2026). One short line in the middle of the busiest
// board-planning posts that points to the matching book: the Amazon paperback
// (sales there lift the book in Amazon search) and the ebook page. Runs over
// dist before the Amazon tagging, so the links get the store ID and rel.
// Plan: claude/book-lines-2026-11-09.md
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BOOKS = {
  main: {
    lead: "Want 50 boards planned like this?",
    title: "50 Boards, Built by Science",
    amazon: "https://www.amazon.com/dp/B0HLHVXRXK",
    line: "a shopping list with amounts, a timed build and a swap for every ingredient",
    ebook: "/ebook/"
  },
  impossible: {
    lead: "Want a board that steals the show?",
    title: "Impossible Boards",
    amazon: "https://www.amazon.com/dp/B0HNJJGJTN",
    line: "25 shaped showpiece boards, each with the one trick that makes it work",
    ebook: "/books/impossible-boards/"
  }
};

export const BOOK_POSTS = {
  main: ["what-bread-for-charcuterie-board", "best-cheese-charcuterie-board", "how-much-does-a-charcuterie-board-cost",
    "charcuterie-cups", "noche-buena-charcuterie-board", "make-charcuterie-board-night-before", "charcuterie-skewers",
    "wine-and-charcuterie-board", "meat-and-cheese-tray", "what-to-serve-with-charcuterie-board", "charcuterie-board-sizes",
    "best-meats-charcuterie-board", "costco-charcuterie-board", "smorgasbord-vs-charcuterie-board",
    "grazing-board-vs-charcuterie-board",
    "easy-charcuterie-board", "budget-charcuterie-board", "how-to-make-charcuterie-board", "charcuterie-board-ideas"],
  impossible: ["turkey-charcuterie-board", "christmas-tree-charcuterie-board", "christmas-wreath-charcuterie-board",
    "christmas-cookie-charcuterie-board"]
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function bookLine(key) {
  const b = BOOKS[key];
  return `<p class="fx-line fx-book"><span>${esc(b.lead)}</span> <a href="${b.amazon}" target="_blank" rel="noopener">${esc(b.title)} on Amazon</a> <em>${esc(b.line)}</em> <a href="${b.ebook}">Or get the ebook</a></p>\n`;
}

// Before the 2nd <h2> after the page's email box or product line (so the
// reader has had one section of the article first). Falls back to the 2nd
// <h2> in <main>.
export function insertBookLine(html, key) {
  if (html.includes('class="fx-line fx-book"')) return null;
  const main = html.indexOf("<main");
  if (main < 0) return null;
  const end = html.lastIndexOf("</main>");
  let from = Math.max(html.indexOf('class="fx-hi"', main), html.indexOf('class="fx-line"', main));
  if (from < 0) from = main;
  let at = from;
  for (let k = 0; k < 2; k++) {
    at = html.indexOf("<h2", at + 3);
    if (at < 0 || at > end) return null;
  }
  return html.slice(0, at) + bookLine(key) + html.slice(at);
}

export async function injectBookLines(dist) {
  const done = [], missed = [];
  for (const [key, slugs] of Object.entries(BOOK_POSTS)) {
    for (const slug of slugs) {
      const f = join(dist, "blog", slug, "index.html");
      if (!existsSync(f)) { missed.push(slug); continue; }
      const html = await readFile(f, "utf8");
      const out = insertBookLine(html, key);
      if (!out) { missed.push(slug); continue; }
      await writeFile(f, out);
      done.push(slug);
    }
  }
  return { done, missed };
}
