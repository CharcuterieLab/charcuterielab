// A real board photo near the top of the hubs that had none. Each goes right
// after the hub's intro (never above the H1 or the email bar) and is lazy-free
// but small: phones get the 640 px copy.
import { readFileSync } from "node:fs";
import { join } from "node:path";

let man = null;
function manifest(dist) {
  if (man) return man;
  try { man = JSON.parse(readFileSync(join(dist, "images", "thumbs", "manifest.json"), "utf8")); }
  catch { man = { size: {}, thumbs: {} }; }
  return man;
}

const HUBS = {
  "/blog/": { src: "/images/50-boards-09-wine-and-cheese-pairing.webp", alt: "Wine and cheese charcuterie board with brie, aged cheddar, grapes, crackers and white wine",
    at: (h) => afterClose(h, '<section class="archive-hero"', "</section>") },
  "/dietary/": { src: "/images/boards/pb-01.webp", alt: "Round plant-based board with hummus, vegetables, nuts, olives and crackers",
    at: (h) => afterClose(h, '<header class="pr-hero dt-hero"', "</header>") },
  "/ingredients/": { src: "/images/50-boards-04-french-brasserie.webp", alt: "French brasserie board with a brie wheel, prosciutto, pâté, cornichons and baguette",
    at: (h) => h.indexOf('<div class="ing-controls"') },
  "/party-planner/": { src: "/images/how-much-charcuterie-per-person.webp", alt: "A long party spread of cured meats, cheeses, crackers, figs and olives",
    at: (h) => afterClose(h, '<header class="pp-hero"', "</header>") },
  "/newsletter/": { src: "/images/50-boards-42-all-cheese-connoisseur.webp", alt: "All-cheese board", cls: "hub-photo-phone",
    at: (h) => afterClose(h, '<section class="nl-hero"', "</section>") },
};

function afterClose(h, open, close) {
  const i = h.indexOf(open);
  if (i < 0) return -1;
  const j = h.indexOf(close, i);
  return j < 0 ? -1 : j + close.length;
}

export function hubPhoto(html, path, dist) {
  const hub = HUBS[path];
  if (!hub || html.includes('class="hub-photo')) return { html, n: 0 };
  const at = hub.at(html);
  if (at < 0) return { html, n: 0 };
  const m = manifest(dist);
  const t = m.thumbs[hub.src] || {};
  const [w, hgt] = m.size[hub.src] || [];
  const srcset = t.m && w ? ` srcset="${t.m} 640w, ${hub.src} ${w}w" sizes="(max-width: 1132px) calc(100vw - 32px), 1100px"` : "";
  const dims = w ? ` width="${w}" height="${hgt}"` : "";
  const fig = `<figure class="hub-photo${hub.cls ? " " + hub.cls : ""}"><img src="${hub.src}"${srcset} alt="${hub.alt}"${dims} decoding="async"></figure>`;
  return { html: html.slice(0, at) + fig + html.slice(at), n: 1 };
}
