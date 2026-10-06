import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { boardBuilderData, boardBuilderPage } from "./board-builder.mjs";
import { countdownJs, holidayBanner, holidayPage, holidaysHub, loadHolidays } from "./holidays.mjs";
import { holidayPourBlock, ingredientPairingBlock, loadPairings, pairingPages, pairingsClientData, pairingsIndex, pairingUrls, postPairingLinks } from "./pairings.mjs";
import { dietaryClientData, dietaryIndex, dietaryPages, dietaryUrls, ingredientDietBlock, loadDietary } from "./dietary.mjs";
import { COUNTS as PARTY_COUNTS, partyHub, partyPage, urlFor as partyUrl } from "./party.mjs";
import { CHEAT_PDF, CHEAT_THANKS, SAMPLE_PDF, bookBoardFor, ebookSections, loadBookBoards, makeFunnel, makePrintables, printableFor } from "./funnel.mjs";
import { makeOffers } from "./offers.mjs";
import { bookLandingPages } from "./bookpages.mjs";
import { HOLIDAY_BOOK_BOARD } from "./holidays.mjs";
import { KETO_BOOK, PLANT_BOOK, TWO_BOOK, WORLD_BOOK, worldIsLive, BOARD_CATEGORIES, builderLink, boardCategoryPage, boardPage, boardSlugsFor, boardsHub, boardsStrip, loadBoards, placeholderSvg, worldBanner, worldBookPage } from "./boards.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const siteUrl = "https://charcuterielab.com";
const publishTimeZone = "America/Chicago";
// Today in Chicago; the sitemap's lastmod for pages with no content date
// (hubs, tools, category pages), which are rebuilt from live data each deploy.
const BUILD_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
// The book is sold in two editions and every book CTA on the site offers both:
// the ebook (PDF) on Gumroad and the paperback on Amazon. Prices are shown on
// the buttons, so update them here if either listing changes.
// Checked against the live listings 23 Sep 2026.
const bookTitle = "Charcuterie Lab: 50 Boards Built by Science";
const ebookUrl = "https://charcuterieflavor.gumroad.com/l/tabajj";
const ebookPrice = "$14";
const paperbackUrl = "https://www.amazon.com/dp/B0H2Y39R41";
const paperbackPrice = "$25.99";
const ebookPageUrl = "/ebook/";
const newsletterUrl = "https://charcuterie-lab-report.beehiiv.com/subscribe";
// Author of the site and the books. Every post, ingredient page and board
// names him (visible byline + Person schema); /about/ is his page.
const AUTHOR_NAME = "Jimmy Wilson";
const authorRef = { "@type": "Person", "@id": "https://charcuterielab.com/about/#jimmy-wilson", name: "Jimmy Wilson", url: "https://charcuterielab.com/about/" };
const byline = (extra = "") => `<span class="byline">By <a href="/about/">${AUTHOR_NAME}</a>${extra}</span>`;

// Statcounter. Both values come from your project's Install Code page. They
// are not secrets - they appear in the page source of every site that uses
// Statcounter - so they belong in the repo. Leave them blank and no tracking
// code is emitted at all, which keeps local builds and previews clean.
const statcounterProject = "13352476";
const statcounterSecurity = "37c3f389";

const paths = {
  blog: join(root, "content", "blog"),
  ingredients: [join(root, "content", "ingredients"), join(dirname(root), "content", "ingredients")],
  products: join(root, "src", "data", "products.json"),
  public: join(root, "public"),
  styles: join(root, "src", "styles", "site.css")
};

// Small copies of every image, made by scripts/make-thumbs.py. Cards and
// related-post tiles show images at 60-400 px, so they get the 640 px (or
// 240 px) WebP instead of the 150-350 KB original; the hero photo gets a
// srcset so phones download the 1100 px copy. An image with no thumbnail yet
// falls back to the original and is listed at the end of the build.
const imageManifest = await readFile(join(paths.public, "images", "thumbs", "manifest.json"), "utf8")
  .then((t) => JSON.parse(t))
  .catch(() => ({ size: {}, thumbs: {} }));
const missingThumbs = new Set();
function thumb(src = "", size = "m") {
  if (!src || !src.startsWith("/images/") || src.endsWith(".svg")) return src;
  const t = imageManifest.thumbs[src];
  if (!t) {
    const [w] = imageManifest.size[src] || [];
    if (!w || w > 760) missingThumbs.add(src);
    return src;
  }
  return t[size] || t.m || t.s || src;
}
function imageSize(src = "") {
  const d = imageManifest.size[src];
  return d ? ` width="${d[0]}" height="${d[1]}"` : "";
}
function heroImg(src, alt, cls) {
  const t = imageManifest.thumbs[src] || {};
  const [w] = imageManifest.size[src] || [];
  const set = [t.m && `${t.m} 640w`, t.l && `${t.l} 1100w`, w && (t.m || t.l) && `${src} ${w}w`].filter(Boolean);
  const srcset = set.length > 1 ? ` srcset="${set.join(", ")}" sizes="(max-width: 792px) calc(100vw - 32px), 760px"` : "";
  if (!t.m && w > 760) missingThumbs.add(src);
  return `<img class="${cls}" src="${src}"${srcset} alt="${alt}"${imageSize(src)} fetchpriority="high" decoding="async">`;
}

// Cache-buster for the stylesheet. Netlify serves /assets/site.css with a
// one-year immutable cache header, so this query string is the ONLY thing that
// tells a returning browser to fetch a new stylesheet. It used to be a
// hand-edited constant, which meant a redesign could ship to a browser that
// kept using the old CSS. Hashing the file means it can never go stale again.
const assetVersion = createHash("sha1")
  .update(await readFile(paths.styles))
  .digest("hex")
  .slice(0, 12);

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const slugFromFile = (file) => file.replace(/\.md$/i, "");

const absoluteUrl = (path = "/") =>
  /^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

const stripMarkdown = (value = "") =>
  String(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const clampText = (value, limit) =>
  value.length > limit ? `${value.slice(0, limit - 3).trimEnd()}...` : value;

// Search engines and social cards both read this. Priority: the description
// the author actually wrote, then the excerpt (but only when it is not just a
// copy of the title), then the first real paragraph of the post.
function metaDescription(post) {
  const written = stripMarkdown(post.description);
  if (written) return clampText(written, 300);

  const excerpt = stripMarkdown(post.excerpt);
  if (excerpt && excerpt.toLowerCase() !== String(post.title).trim().toLowerCase()) {
    return clampText(excerpt, 300);
  }

  for (const block of String(post.body ?? "").split(/\n\s*\n/)) {
    const clean = stripMarkdown(block.replace(/^#+\s*/, "").replace(/^Quick Answer:\s*/i, ""));
    if (clean.length > 60) return clampText(clean, 300);
  }
  return "Pairing science, board building, and ingredient guides from Charcuterie Lab.";
}

function withTracking(url, campaign) {
  if (!url.startsWith("http")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}utm_source=charcuterielab&utm_medium=site&utm_campaign=${campaign}`;
}

const stopWords = new Set([
  "about", "after", "also", "and", "are", "because", "been", "best", "board", "boards", "build",
  "charcuterie", "cheese", "for", "from", "guide", "have", "into", "that", "the", "this", "what",
  "when", "where", "which", "with", "your"
]);

function todayInPublishZone() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: publishTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isPublishedPost(post, today = todayInPublishZone()) {
  return /^\d{4}-\d{2}-\d{2}$/.test(post.date) && post.date <= today;
}

function parseMarkdown(source) {
  const normalized = source.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const data = {};
  let body = normalized;

  if (match) {
    body = match[2];
    for (const line of match[1].split(/\r?\n/)) {
      const pair = line.trim().match(/^([A-Za-z0-9_-]+):\s*"?(.+?)"?$/);
      if (pair) data[pair[1]] = pair[2];
    }
  }

  return { data, body };
}

function parseListField(value = "") {
  const cleaned = String(value)
    .trim()
    .replace(/^['"]|['"]$/g, "");

  if (!cleaned) return [];

  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    } catch {
      // Fall through to the forgiving splitter for publisher-generated frontmatter.
    }
  }

  return cleaned
    .replace(/^\[|\]$/g, "")
    .split(/[,|]/)
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

function parseFaqField(value = "") {
  const cleaned = String(value).trim().replace(/^['"]|['"]$/g, "");
  if (!cleaned) return [];

  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => ({
            question: String(item.question ?? "").trim(),
            answer: String(item.answer ?? "").trim()
          }))
          .filter((item) => item.question && item.answer);
      }
    } catch {
      // Fall through to the compact "Question => Answer | Question => Answer" format.
    }
  }

  return cleaned
    .split("|")
    .map((item) => item.split(/\s*=>\s*/))
    .map(([question, answer]) => ({
      question: String(question ?? "").trim(),
      answer: String(answer ?? "").trim()
    }))
    .filter((item) => item.question && item.answer);
}

function jsonForScript(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function articleSchema(post, description) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: [absoluteUrl(post.image)],
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: authorRef,
    publisher: {
      "@type": "Organization",
      name: "Charcuterie Lab",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/book-cover.jpg") }
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${post.slug}/`) },
    keywords: post.tags.join(", ")
  };

  return `  <script type="application/ld+json">${jsonForScript(schema)}</script>`;
}

function siteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Charcuterie Lab",
    url: siteUrl,
    logo: absoluteUrl("/images/book-cover.jpg"),
    sameAs: [
      "https://www.facebook.com/profile.php?id=61586809154604",
      "https://www.instagram.com/charcuterielabflavor/",
      "https://www.pinterest.com/charcuterielabflavor/"
    ]
  };

  return `  <script type="application/ld+json">${jsonForScript(schema)}</script>`;
}

// BreadcrumbList for search results: [[name, path], ...] from Home down.
function breadcrumbSchema(items) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: absoluteUrl(path) }))
  };
  return `  <script type="application/ld+json">${jsonForScript(schema)}</script>`;
}

const longDate = (d) => {
  const t = new Date(`${String(d).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(t.getTime()) ? "" : new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(t);
};

// Ingredient pages were FAQ-only in structured data. This gives them an
// author, publish and update dates, like the blog posts.
function ingredientArticleSchema(item) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ingredientSeoTitle(item),
    description: item.excerpt,
    ...(item.image ? { image: [absoluteUrl(item.image)] } : {}),
    ...(item.date ? { datePublished: String(item.date).slice(0, 10) } : {}),
    ...(item.updated || item.date ? { dateModified: String(item.updated || item.date).slice(0, 10) } : {}),
    author: authorRef,
    publisher: { "@type": "Organization", name: "Charcuterie Lab", url: siteUrl, logo: { "@type": "ImageObject", url: absoluteUrl("/images/book-cover.jpg") } },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/ingredients/${item.slug}/`) }
  };
  return `  <script type="application/ld+json">${jsonForScript(schema)}</script>`;
}

function faqSchema(post) {
  if (!post.faq?.length) return "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return `  <script type="application/ld+json">${jsonForScript(schema)}</script>`;
}

function tokenize(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));
}

function topicTerms(post) {
  return new Set([
    ...tokenize(post.slug),
    ...tokenize(post.title),
    ...tokenize(post.excerpt),
    ...post.tags.flatMap((tag) => tokenize(tag))
  ]);
}

// Every post ends with a hand-written "## Related Reading" list. The build
// removes that section and shows generated cards instead, so the author's own
// choices were being thrown away. Read them here and feed them to
// selectRelatedPosts, which already prefers explicit slugs and silently skips
// any that aren't published yet - so a link to a queued post costs nothing
// today and starts working by itself the day that post goes live.
function relatedFromBody(body = "") {
  const section = body.match(/^##\s*Related Reading\s*$([\s\S]*?)(?=^##\s|\Z)/mi);
  if (!section) return [];

  const slugs = [];
  for (const line of section[1].split(/\r?\n/)) {
    if (!line.trim().startsWith("- ")) continue;
    const href = line.match(/\]\(\s*([^)\s]+)/);
    if (!href) continue;
    const path = href[1]
      .replace(/^https?:\/\/charcuterielab\.com/i, "")
      .split(/[#?]/)[0]
      .replace(/^\/?blog\//, "")
      .replace(/^\/+|\/+$/g, "");
    if (path && !slugs.includes(path)) slugs.push(path);
  }
  return slugs;
}

function selectRelatedPosts(post, posts, limit = 3) {
  const related = [];
  const used = new Set([post.slug]);

  for (const slug of post.relatedSlugs) {
    const match = posts.find((candidate) => candidate.slug === slug && !used.has(candidate.slug));
    if (match) {
      related.push(match);
      used.add(match.slug);
    }
    if (related.length >= limit) return related;
  }

  const currentTerms = topicTerms(post);
  const scored = posts
    .filter((candidate) => !used.has(candidate.slug))
    .map((candidate) => {
      const candidateTerms = topicTerms(candidate);
      let score = 0;
      for (const term of currentTerms) {
        if (candidateTerms.has(term)) score += 1;
      }
      const tagOverlap = post.tags.filter((tag) => candidate.tags.includes(tag)).length;
      score += tagOverlap * 5;
      return { candidate, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.date.localeCompare(a.candidate.date));

  for (const { candidate } of scored) {
    related.push(candidate);
    used.add(candidate.slug);
    if (related.length >= limit) break;
  }

  for (const candidate of posts) {
    if (related.length >= limit) break;
    if (!used.has(candidate.slug)) {
      related.push(candidate);
      used.add(candidate.slug);
    }
  }

  return related;
}

// Internal links in post bodies. Posts are written weeks ahead and link to
// each other by bare slug (/rind-science, charcuterielab.com/brie/) or by
// /blog/<slug>/. Resolve those against the posts that are live today: a live
// post gets its /blog/ URL, an old slug with a Netlify redirect keeps it, and
// anything else renders as plain text so readers never hit a 404. The link
// switches on by itself the day its post publishes.
const SITE_SECTIONS = /^(search|thanks|about|ebook|images|ingredients|board-builder|privacy|assets|pairings|dietary|holidays|boards|shop|books|around-the-world|party-planner|printables|downloads|blog-feed\.txt|sitemap\.xml|robots\.txt)(\/|$|[?#])/;
const linkIndex = { live: null, redirects: new Set(), held: new Map(), merged: {} };

function resolveSiteLink(href = "") {
  const m = href.match(/^(?:https?:\/\/(?:www\.)?charcuterielab\.com)?(\/[^?#]*)?([?#].*)?$/i);
  if (!m || (!href.startsWith("/") && !/^https?:\/\/(www\.)?charcuterielab\.com/i.test(href))) return "";
  const pathname = m[1] || "/";
  const tail = m[2] || "";
  const path = pathname.replace(/^\/+|\/+$/g, "");
  if (!path) return "/" + tail;
  if (SITE_SECTIONS.test(path)) return pathname + tail;
  const slug = path.replace(/^blog\//, "");
  // Posts merged into another post (content/merged/redirects.json): link straight to the survivor.
  if (linkIndex.merged[slug]) return `/blog/${linkIndex.merged[slug]}/` + tail;
  if (path === "blog" ) return "/blog/" + tail;
  if (!linkIndex.live) return `/blog/${slug}/` + tail; // index not ready (ingredient pages): old behaviour
  if (linkIndex.live.has(slug)) return `/blog/${slug}/` + tail;
  const bare = "/" + path;
  if (linkIndex.redirects.has(bare) || linkIndex.redirects.has(bare + "/")) return bare + tail;
  linkIndex.held.set(slug, (linkIndex.held.get(slug) || 0) + 1);
  return null;
}

function markdownToHtml(markdown) {
  const lines = markdown.trim().split(/\r?\n/);
  const html = [];
  let i = 0;

  const inline = (value = "") =>
    escapeHtml(value)
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, (_, text, href) => {
        const local = resolveSiteLink(href);
        if (local === null) return text; // a post that isn't live yet: plain text until it is
        if (local) return `<a href="${local}">${text}</a>`;
        // Only other sites open in a new tab.
        return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
      })
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  const orderedItem = /^(\d+)\.\s+(.*)$/;

  const isBlockStart = (line = "") =>
    /^(#{1,3}\s|-\s|>\s|\|.+\||---+$)/.test(line.trim()) ||
    orderedItem.test(line.trim()) ||
    /^!\[.*?\]\(.+?\)$/.test(line.trim());

  const isTableSeparator = (row = "") => {
    const cells = row.slice(1, -1).split("|").map((cell) => cell.trim());
    return cells.length > 1 && cells.every((cell) => /^:?-{1,}:?$/.test(cell));
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (/^---+$/.test(line)) {
      html.push("<hr>");
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      if (level === 2 && /^related reading$/i.test(heading[2].trim())) {
        i += 1;
        while (i < lines.length && !lines[i].trim()) i += 1;
        while (i < lines.length && lines[i].trim().startsWith("- ")) {
          i += 1;
        }
        continue;
      }
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    const image = line.match(/^!\[(.*?)\]\((.+?)\)$/);
    if (image) {
      html.push(`<img class="post-inline-image" src="${escapeHtml(thumb(image[2], "l"))}" alt="${escapeHtml(image[1])}"${imageSize(thumb(image[2], "l"))} loading="lazy" decoding="async">`);
      i += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        let text = lines[i].trim().slice(2);
        i += 1;
        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
          text += ` ${lines[i].trim()}`;
          i += 1;
        }
        items.push(`<li>${inline(text)}</li>`);
      }
      html.push(`<ul>\n${items.join("\n")}\n</ul>`);
      continue;
    }

    if (orderedItem.test(line)) {
      // Numbered steps, with wrapped continuation lines folded back into their
      // own step. Without this the whole list collapses into one paragraph with
      // literal "1." "2." runs through it.
      const items = [];
      while (i < lines.length && orderedItem.test(lines[i].trim())) {
        let text = lines[i].trim().match(orderedItem)[2];
        i += 1;
        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
          text += ` ${lines[i].trim()}`;
          i += 1;
        }
        items.push(`<li>${inline(text)}</li>`);
        // Several posts put a blank line between numbered items. That is still
        // one list - splitting it would restart the numbering at 1 each time.
        let next = i;
        while (next < lines.length && !lines[next].trim()) next += 1;
        if (next < lines.length && orderedItem.test(lines[next].trim())) i = next;
      }
      html.push(`<ol>\n${items.join("\n")}\n</ol>`);
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i += 1;
      }
      const quote = quoteLines.join(" ");
      // Strips hand-written ebook promos that would duplicate the templated
      // CTAs. Newsletter mentions are deliberately NOT stripped - the site has
      // no other beehiiv link, so removing them cost real subscribers.
      const isFooterPromo = /charcuterie lab book|50 boards built by science/i.test(quote) && /https?:\/\//i.test(quote);
      if (!isFooterPromo) {
        html.push(`<blockquote><p>${inline(quote)}</p></blockquote>`);
      }
      continue;
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i += 1;
      }

      if (tableLines.length >= 2 && isTableSeparator(tableLines[1])) {
        const cells = (row) => row.slice(1, -1).split("|").map((cell) => inline(cell.trim()));
        const header = cells(tableLines[0]).map((cell) => `<th>${cell}</th>`).join("");
        const rows = tableLines.slice(2).map((row) => `<tr>${cells(row).map((cell) => `<td>${cell}</td>`).join("")}</tr>`);
        html.push(`<div class="table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${rows.join("\n")}</tbody></table></div>`);
      } else {
        html.push(`<p>${inline(tableLines.join("<br>"))}</p>`);
      }
      continue;
    }

    const paragraph = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    const paragraphText = paragraph.join(" ");
    const callout = paragraphText.match(/^\*\*(.+?)\*\*\s*$/);
    if (callout) {
      html.push(`<p class="post-callout">${inline(callout[1])}</p>`);
    } else {
      html.push(`<p>${inline(paragraphText)}</p>`);
    }
  }

  return html.join("\n");
}

async function loadPosts() {
  const files = (await readdir(paths.blog)).filter((file) => file.endsWith(".md"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const { data, body } = parseMarkdown(await readFile(join(paths.blog, file), "utf8"));
      return {
        slug: slugFromFile(file),
        title: data.title ?? "Untitled Post",
        // Optional: the <title> Google shows, when it should differ from the H1
        seoTitle: data.seo_title ?? "",
        date: data.date ?? "2026-01-01",
        // Optional: when the post was last meaningfully revised
        updated: data.updated ?? "",
        image: data.image ?? "/images/layout-reference.jpg",
        excerpt: data.excerpt ?? "",
        description: data.description ?? "",
        tags: parseListField(data.tags).map((tag) => tag.toLowerCase()),
        relatedSlugs: (() => {
          const declared = parseListField(data.related)
            .map((slug) => slug.replace(/^\/?blog\//, "").replace(/\/$/, ""));
          return declared.length ? declared : relatedFromBody(body);
        })(),
        faq: parseFaqField(data.faq),
        // Optional: the board number in 50 Boards Built by Science this post matches
        bookBoard: data.book_board ?? "",
        body
      };
    })
  );

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

function socialIcon(name) {
  if (name === "facebook") {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.3 8.1h2.1V4.6c-.4-.1-1.7-.2-3.2-.2-3.2 0-5.4 2-5.4 5.6v3.1H4.3V17h3.5v7h4.2v-7h3.5l.6-3.9H12v-2.7c0-1.1.3-2.3 2.3-2.3Z"/></svg>';
  }
  if (name === "instagram") {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm4.2 3.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Zm5.2-2.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.2 2C6.6 2 3 5.7 3 10.5c0 3.4 1.9 5.3 3 5.3.5 0 .8-1.4.8-1.8 0-.5-1.3-1.6-1.3-3.6 0-4.1 3.1-7 7.3-7 3.5 0 6.1 2 6.1 5.7 0 2.8-1.1 8-4.8 8-1.3 0-2.5-1-2.1-2.4.4-1.7 1.3-3.5 1.3-4.7 0-2.7-3.9-2.2-3.9 1.3 0 1.1.4 1.8.4 1.8s-1.4 5.8-1.6 6.8c-.2 1 0 2.3 0 2.4 0 .1.2.1.3 0 .4-.5 1.5-1.8 2-2.9.2-.6.9-3.3.9-3.3.4.8 1.7 1.5 3 1.5 4 0 6.6-3.6 6.6-8.4C21 5.2 17.6 2 12.2 2Z"/></svg>';
}

function statcounterTag() {
  if (!statcounterProject || !statcounterSecurity) return "";

  // sc_invisible=1 keeps the visible hit-counter badge off the page.
  // The noscript pixel matters more than usual here: Pinterest's in-app
  // browser is the channel we care about and it is not always kind to JS.
  return `  <script>
    var sc_project=${statcounterProject};
    var sc_invisible=1;
    var sc_security="${statcounterSecurity}";
  </script>
  <script src="https://www.statcounter.com/counter/counter.js" async></script>
  <noscript><div class="statcounter"><img class="statcounter"
    src="https://c.statcounter.com/${statcounterProject}/0/${statcounterSecurity}/1/"
    alt="Web Analytics" referrerPolicy="no-referrer-when-downgrade"></div></noscript>`;
}

const CATEGORY_ORDER = [
  "Cheese",
  "Cured Meat & Seafood",
  "Crackers & Breads",
  "Fruit",
  "Nuts & Seeds",
  "Spreads, Jams & Honey",
  "Pickles, Olives & Briny",
  "Finishing Touches"
];

// Each category gets an accent colour and a line glyph. The glyph fills the
// card thumbnail until a real photograph exists at /images/ingredients/<slug>.jpg,
// so the grid reads as pictures rather than as a list of links from day one.
const CATEGORY_ART = {
  "Cheese": {
    tint: "#b8862b",
    glyph: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.4 20.3 6.1a.6.6 0 0 1 .9.5v10.8a.6.6 0 0 1-.6.6H3.6a.6.6 0 0 1-.6-.6Z"/><circle cx="16.2" cy="13.4" r="1.25"/><circle cx="11.3" cy="15.3" r=".95"/></svg>`
  },
  "Cured Meat & Seafood": {
    tint: "#a5453c",
    glyph: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.4"/><circle cx="9.3" cy="9.9" r="1.15"/><circle cx="14.7" cy="10.6" r="1"/><circle cx="11.9" cy="14.8" r="1.25"/></svg>`
  },
  "Crackers & Breads": {
    tint: "#9c7440",
    glyph: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.6" y="3.6" width="16.8" height="16.8" rx="3.4"/><circle cx="9" cy="9" r=".7"/><circle cx="15" cy="9" r=".7"/><circle cx="9" cy="15" r=".7"/><circle cx="15" cy="15" r=".7"/><circle cx="12" cy="12" r=".7"/></svg>`
  },
  "Fruit": {
    tint: "#9b3f5c",
    glyph: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.6c-3.3 0-5.9-2.7-5.9-6.3 0-3.7 2.6-6.5 5.9-6.5s5.9 2.8 5.9 6.5c0 3.6-2.6 6.3-5.9 6.3Z"/><path d="M12 7.8V4.4"/><path d="M12.3 6.4c.2-1.8 1.7-3 3.4-2.9.1 1.8-1.2 3.2-3 3.3"/></svg>`
  },
  "Nuts & Seeds": {
    tint: "#7b5233",
    glyph: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.4c3.7 2.7 5.7 5.9 5.7 9.3 0 4.4-2.5 7.9-5.7 7.9s-5.7-3.5-5.7-7.9c0-3.4 2-6.6 5.7-9.3Z"/><path d="M12 7.2v10.4"/></svg>`
  },
  "Spreads, Jams & Honey": {
    tint: "#c2911f",
    glyph: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 4.2h11.2v3.4H6.4z"/><path d="M7.4 7.6h9.2v11a1.8 1.8 0 0 1-1.8 1.8H9.2a1.8 1.8 0 0 1-1.8-1.8Z"/><path d="M10 12.4h4"/></svg>`
  },
  "Pickles, Olives & Briny": {
    tint: "#4e6b33",
    glyph: `<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="13.2" rx="5.7" ry="7.4"/><circle cx="12" cy="11" r="1.7"/><path d="M12 5.9c1.3-1.6 3.2-2.1 4.8-1.8"/></svg>`
  },
  "Finishing Touches": {
    tint: "#3d6a56",
    glyph: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V8.2"/><path d="M12 13.4c0-3.1 1.9-5.2 4.9-5.6.2 3.2-1.7 5.6-4.9 5.6Z"/><path d="M12 13.4c0-3.1-1.9-5.2-4.9-5.6-.2 3.2 1.7 5.6 4.9 5.6Z"/><path d="M12 8.4c0-2.4 1.5-4 3.8-4.3.2 2.4-1.3 4.3-3.8 4.3Z"/></svg>`
  }
};

const DEFAULT_ART = {
  tint: "#8f6d2e",
  glyph: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="2.6"/></svg>`
};

function categoryArt(category) {
  return CATEGORY_ART[category] || DEFAULT_ART;
}

const SPEC_ICONS = {
  role: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="2.9"/></svg>`,
  price: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 12.7 12.6 20.3a1.6 1.6 0 0 1-2.3 0L4 14V4h10l6.2 6.3a1.6 1.6 0 0 1 0 2.4Z"/><circle cx="8.4" cy="8.4" r="1.25"/></svg>`,
  serving: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.4 20.2a6.6 6.6 0 0 1 13.2 0"/></svg>`,
  prep: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.4"/><path d="M12 7.2V12l3.2 2"/></svg>`,
  allergens: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6 21.2 19.8H2.8Z"/><path d="M12 10v4.1"/><path d="M12 17.2h.01"/></svg>`
};

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// frontmatter arrays arrive as the literal string '["a", "b"]'

const FREE_FROM = [
  { key: "dairy-free", label: "Dairy-free", blocks: ["dairy"] },
  { key: "gluten-free", label: "Gluten-free", blocks: ["gluten", "wheat", "rye", "oats"] },
  { key: "nut-free", label: "Nut-free", blocks: ["tree nuts", "peanuts"] },
  { key: "shellfish-free", label: "Shellfish-free", blocks: ["shellfish"] }
];

function freeFromFor(allergens = []) {
  const lower = allergens.map((a) => a.toLowerCase());
  return FREE_FROM.filter((f) => !f.blocks.some((b) => lower.includes(b))).map((f) => f.key);
}

// Drop a photo at public/images/ingredients/<slug>.jpg (or .png/.webp) and the
// card and detail page pick it up on the next build - no frontmatter edit needed.
// An explicit image: in the frontmatter still wins.
async function ingredientPhotos() {
  const byslug = new Map();
  try {
    for (const file of await readdir(join(paths.public, "images", "ingredients"))) {
      const m = file.match(/^(.+)\.(jpe?g|png|webp|avif)$/i);
      if (m && !byslug.has(m[1].toLowerCase())) {
        byslug.set(m[1].toLowerCase(), `/images/ingredients/${file}`);
      }
    }
  } catch {
    // no photo directory yet
  }
  return byslug;
}

async function loadIngredients() {
  const photos = await ingredientPhotos();
  const sourceByFile = new Map();
  for (const dir of paths.ingredients) {
    let files = [];
    try {
      files = (await readdir(dir)).filter((file) => file.endsWith(".md"));
    } catch {
      continue; // directory is optional
    }
    for (const file of files) sourceByFile.set(file, dir);
  }

  const items = await Promise.all(
    [...sourceByFile.entries()].map(async ([file, dir]) => {
      const { data, body } = parseMarkdown(await readFile(join(dir, file), "utf8"));
      const allergens = parseListField(data.allergens);
      const slug = slugFromFile(file);
      return {
        slug,
        title: data.title ?? "Untitled",
        // Optional per-page <title> override, matched to the question people
        // actually search ("Can you eat guanciale raw?"). The H1 stays the name.
        seoTitle: data.seo_title ?? "",
        category: data.category ?? "Other",
        categorySlug: slugify(data.category ?? "Other"),
        boardRole: data.board_role ?? "",
        roleGroup: data.role_group ?? "",
        excerpt: data.excerpt ?? "",
        // Publish / last-revised dates: used for the byline, Article schema,
        // article:modified_time and the sitemap lastmod.
        date: data.date ? String(data.date).slice(0, 10) : "",
        updated: data.updated ? String(data.updated).slice(0, 10) : "",
        priceTier: data.price_tier ?? "",
        serving: data.serving_per_person ?? "",
        prepTime: data.prep_time ?? "",
        allergens,
        freeFrom: freeFromFor(allergens),
        tags: parseListField(data.tags),
        pairsWith: parseListField(data.pairs_with),
        avoidWith: parseListField(data.avoid_with),
        boardPost: data.board_post ?? "",
        image: data.image || photos.get(slug) || "",
        faq: parseFaqField(data.faq),
        body,
        html: sensoryBlock(markdownToHtml(body))
      };
    })
  );

  return items.sort((a, b) => a.title.localeCompare(b.title));
}


function ingredientThumb(item, art) {
  if (item.image) {
    return `<img src="${escapeHtml(thumb(item.image))}" alt="${escapeHtml(item.title)}"${imageSize(thumb(item.image))} loading="lazy" decoding="async">`;
  }
  return `<span class="ing-thumb-art">${art.glyph}</span>`;
}

function ingredientCard(item) {
  const art = categoryArt(item.category);
  const facts = [
    item.priceTier ? `<span><b>${escapeHtml(item.priceTier)}</b></span>` : "",
    item.serving ? `<span>${escapeHtml(item.serving)} per person</span>` : ""
  ].filter(Boolean);

  return `      <li class="ing-card" style="--ing-tint:${art.tint}" data-name="${escapeHtml(item.title.toLowerCase())}" data-cat="${item.categorySlug}" data-role="${escapeHtml(item.roleGroup.toLowerCase())}" data-price="${escapeHtml(item.priceTier)}" data-free="${item.freeFrom.join(" ")}" data-search="${escapeHtml([item.title, item.category, item.boardRole, item.excerpt, ...item.tags, item.roleGroup].join(" ").toLowerCase())}">
        <a href="/ingredients/${item.slug}/">
          <span class="ing-thumb">${ingredientThumb(item, art)}<span class="ing-thumb-cat">${escapeHtml(item.category)}</span></span>
          <div class="ing-card-body">
            <h3>${escapeHtml(item.title)}</h3>
            <span class="ing-card-role">${escapeHtml(item.boardRole)}</span>
            ${facts.length ? `<span class="ing-card-facts">${facts.join("")}</span>` : ""}
          </div>
        </a>
      </li>`;
}

function ingredientsFinder(items, { heading, intro, showCategoryFilter = true }) {
  const categories = CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c));
  const roles = [...new Set(items.map((i) => i.roleGroup).filter(Boolean))].sort();
  const prices = [...new Set(items.map((i) => i.priceTier).filter(Boolean))].sort();

  const chip = (group, value, label) =>
    `<button type="button" class="ing-chip" data-group="${group}" data-value="${escapeHtml(value)}" data-label="${escapeHtml(label)}" aria-pressed="false">${escapeHtml(label)}</button>`;

  return `<section class="ing-finder">
  <div class="section-inner">
    <h1>${escapeHtml(heading)}</h1>
    <p class="ing-intro">${escapeHtml(intro)}</p>

    <div class="ing-controls">
      <label class="ing-search-label" for="ing-search">Search ingredients</label>
      <input id="ing-search" class="ing-search" type="search" placeholder="Search ${items.length} ingredients &mdash; brie, gluten free, blue cheese&hellip;" autocomplete="off">

      <div class="ing-facets">
        ${showCategoryFilter && categories.length > 1 ? `<div class="ing-facet"><span class="ing-facet-label">Category</span><div class="ing-chips">${categories.map((c) => chip("cat", slugify(c), c)).join("")}</div></div>` : ""}
        <details class="ing-facet ing-facet-more"><summary><span class="ing-facet-label">Type</span><span class="ing-facet-hint">${roles.length} options</span><span class="ing-facet-count" hidden></span></summary><div class="ing-chips">${roles.map((r) => chip("role", r.toLowerCase(), r)).join("")}</div></details>
        ${prices.length > 1 ? `<div class="ing-facet"><span class="ing-facet-label">Price</span><div class="ing-chips">${prices.map((p) => chip("price", p, p)).join("")}</div></div>` : ""}
        <div class="ing-facet"><span class="ing-facet-label">Free from</span><div class="ing-chips">${FREE_FROM.map((f) => chip("free", f.key, f.label)).join("")}</div></div>
      </div>

      <div class="ing-active" id="ing-active" hidden>
        <span class="ing-active-label">Filtering by</span>
        <div class="ing-active-pills" id="ing-active-pills"></div>
        <button type="button" id="ing-reset" class="ing-reset">Clear all filters</button>
      </div>

      <p class="ing-count" role="status" aria-live="polite"><span id="ing-count">${items.length}</span> ingredients</p>
    </div>

    <ul class="ing-grid" id="ing-grid">
${items.map(ingredientCard).join("\n")}
    </ul>
    <p class="ing-empty" id="ing-empty" hidden>No ingredients match those filters. <button type="button" class="ing-linkbtn" id="ing-empty-reset">Clear them</button>.</p>
  </div>
</section>

<script>
(function () {
  var grid = document.getElementById("ing-grid");
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.children);
  var search = document.getElementById("ing-search");
  var countEl = document.getElementById("ing-count");
  var emptyEl = document.getElementById("ing-empty");
  var resetEl = document.getElementById("ing-reset");
  var bar = document.getElementById("ing-active");
  var pillbox = document.getElementById("ing-active-pills");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".ing-chip"));
  var groups = ["cat", "role", "price", "free"];
  var active = { cat: [], role: [], price: [], free: [] };

  function paintChips() {
    chips.forEach(function (b) {
      var on = active[b.dataset.group].indexOf(b.dataset.value) !== -1;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    Array.prototype.forEach.call(document.querySelectorAll(".ing-facet-more"), function (d) {
      var n = d.querySelectorAll(".ing-chip.is-on").length;
      var badge = d.querySelector(".ing-facet-count");
      if (badge) {
        badge.textContent = n ? n + " selected" : "";
        badge.hidden = !n;
      }
      d.classList.toggle("has-active", n > 0);
      if (n > 0) d.open = true;
    });
  }

  function paintBar() {
    var list = [];
    groups.forEach(function (g) {
      active[g].forEach(function (v) {
        var match = null;
        for (var i = 0; i < chips.length; i++) {
          if (chips[i].dataset.group === g && chips[i].dataset.value === v) { match = chips[i]; break; }
        }
        list.push({ g: g, v: v, label: match ? match.dataset.label : v });
      });
    });
    pillbox.innerHTML = "";
    list.forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ing-pill";
      b.setAttribute("aria-label", "Remove filter " + f.label);
      var t = document.createElement("span");
      t.textContent = f.label;
      var x = document.createElement("span");
      x.className = "ing-pill-x";
      x.setAttribute("aria-hidden", "true");
      x.textContent = "×";
      b.appendChild(t);
      b.appendChild(x);
      b.addEventListener("click", function () { toggle(f.g, f.v); });
      pillbox.appendChild(b);
    });
    var q = (search.value || "").trim();
    bar.hidden = list.length === 0 && !q;
    pillbox.hidden = list.length === 0;
    document.querySelector(".ing-active-label").hidden = list.length === 0;
  }

  function apply() {
    var q = (search.value || "").trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var ok = true;
      if (q && card.dataset.search.indexOf(q) === -1) ok = false;
      if (ok && active.cat.length && active.cat.indexOf(card.dataset.cat) === -1) ok = false;
      if (ok && active.role.length && active.role.indexOf(card.dataset.role) === -1) ok = false;
      if (ok && active.price.length && active.price.indexOf(card.dataset.price) === -1) ok = false;
      if (ok && active.free.length) {
        var has = (card.dataset.free || "").split(" ");
        for (var i = 0; i < active.free.length; i++) {
          if (has.indexOf(active.free[i]) === -1) { ok = false; break; }
        }
      }
      card.hidden = !ok;
      if (ok) shown++;
    });
    countEl.textContent = shown;
    emptyEl.hidden = shown !== 0;
    paintChips();
    paintBar();
  }

  function toggle(g, v) {
    var i = active[g].indexOf(v);
    if (i === -1) active[g].push(v); else active[g].splice(i, 1);
    apply();
  }

  search.addEventListener("input", apply);

  chips.forEach(function (btn) {
    btn.addEventListener("click", function () { toggle(btn.dataset.group, btn.dataset.value); });
  });

  function reset() {
    search.value = "";
    active = { cat: [], role: [], price: [], free: [] };
    apply();
  }
  resetEl.addEventListener("click", reset);
  document.getElementById("ing-empty-reset").addEventListener("click", reset);

  apply();
})();
</script>`;
}

function ingredientsHub(items) {
  const categories = CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c));
  return layout({
    canonical: "/ingredients/",
    title: `Charcuterie Ingredients: ${items.length} Cheeses, Meats & More`,
    description:
      "Every charcuterie board ingredient, one page each: what it is, what it pairs with and why, how to prep it, and exactly what to buy.",
    body: `<main class="ing-main">
${bookBar("ingredients_hub_top")}
${ingredientsFinder(items, {
  heading: "Ingredients",
  intro:
    "Every ingredient a board can hold, one page each. What it is, what it pairs with and why, how to prep it, and exactly what to buy."
})}
  <section class="section alt">
    <div class="section-inner">
      <p class="section-kicker">Browse by category</p>
      <ul class="ing-catlist">
${categories
  .map(
    (c) =>
      `        <li style="--ing-tint:${categoryArt(c).tint}"><a href="/ingredients/${slugify(c)}/"><span class="ing-catlist-art" aria-hidden="true">${categoryArt(c).glyph}</span><span><strong>${escapeHtml(c)}</strong><span class="ing-catlist-count">${items.filter((i) => i.category === c).length} ingredients</span></span></a></li>`
  )
  .join("\n")}
      </ul>
    </div>
  </section>
${labNext("ingredients_hub", { skip: ["ingredients"] })}
</main>`
  });
}

function ingredientCategoryPage(category, items) {
  return layout({
    canonical: `/ingredients/${slugify(category)}/`,
    title: pageTitle(`${category} for Charcuterie: ${items.length} Types Explained`),
    description: `Every ${category.toLowerCase()} ingredient for a charcuterie board — pairings, prep and what to buy, one page each.`,
    head: breadcrumbSchema([["Home", "/"], ["Ingredients", "/ingredients/"], [category, `/ingredients/${slugify(category)}/`]]),
    body: `<main class="ing-main">
  <p class="ing-crumb"><a href="/ingredients/">Ingredients</a> <span aria-hidden="true">/</span> ${escapeHtml(category)}</p>
${ingredientsFinder(items, {
  heading: category,
  intro: `${items.length} ${category.toLowerCase()} ingredients, each with pairings, prep and what to buy.`,
  showCategoryFilter: false
})}
${labNext(`ingredients_${slugify(category)}`, { skip: ["ingredients"] })}
</main>`
  });
}

// Blog posts were written before the ingredient library existed, so none of them
// link into it. Rather than editing 100+ markdown files by hand - and re-editing
// them every time a post or an ingredient is added - the links are made here, at
// build time, from the ingredient data itself.
//
// Rules: first mention only, longest name first (so "Aged Cheddar" wins over
// "Cheddar"), never inside an existing link, heading or code block, and capped
// per post so a page reads as writing rather than as a link farm.

const AUTOLINK_MAX_PER_POST = 10;

// Names too generic to link safely on their own - they appear constantly in
// prose meaning the everyday item rather than the board ingredient.
const AUTOLINK_SKIP = new Set([
  "honey", "apples", "grapes", "berries", "cherries", "pears", "peaches",
  "plums", "melon", "figs", "olive oil", "sea salt", "cream cheese"
]);

// One combined regex, longest title first, so a single pass over each text
// segment can never re-scan the markup it just inserted. The previous version
// looped over the index mutating the same string, which let a later, shorter
// title match inside an href written by an earlier one - that produced
// <a href="/ingredients/marcona-<a href="/ingredients/almonds/">almonds</a>/">
// on nine live pages.
function buildAutolinkIndex(ingredients) {
  const items = ingredients
    .filter((i) => i.title && !AUTOLINK_SKIP.has(i.title.toLowerCase()))
    .sort((a, b) => b.title.length - a.title.length);
  if (!items.length) return null;

  const bySlug = new Map();
  const alternatives = [];
  for (const item of items) {
    const key = item.title.toLowerCase();
    if (bySlug.has(key)) continue;
    bySlug.set(key, item.slug);
    alternatives.push(item.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }
  return { bySlug, re: new RegExp(`\\b(?:${alternatives.join("|")})\\b`, "gi") };
}

// Which blog posts talk about each ingredient, most relevant first: the post
// title naming it counts most, then how often the body mentions it. Ingredient
// pages list the top few as "Read more", so the 300+ ingredient pages send
// readers (and link equity) into the blog instead of dead-ending.
function ingredientMentions(posts, index) {
  const out = new Map();
  if (!index) return out;
  for (const post of posts) {
    const text = String(post.html || "").replace(/<[^>]+>/g, " ");
    const counts = new Map();
    index.re.lastIndex = 0;
    for (const m of text.matchAll(index.re)) {
      const slug = index.bySlug.get(m[0].toLowerCase());
      if (slug) counts.set(slug, (counts.get(slug) || 0) + 1);
    }
    const title = `${post.title} ${post.slug.replace(/-/g, " ")}`.toLowerCase();
    for (const [slug, n] of counts) {
      const name = [...index.bySlug].find(([, s]) => s === slug)?.[0] || "";
      const inTitle = name && title.includes(name);
      const score = (inTitle ? 100 : 0) + n;
      if (!out.has(slug)) out.set(slug, []);
      out.get(slug).push({ post, score });
    }
  }
  for (const list of out.values()) list.sort((a, b) => b.score - a.score || String(b.post.date).localeCompare(String(a.post.date)));
  return out;
}

// Category guides fill in when an ingredient is rarely mentioned by name.
const CATEGORY_GUIDES = {
  "Cheese": ["best-cheese-charcuterie-board", "what-cheese-goes-on-charcuterie-board"],
  "Cured Meat & Seafood": ["best-meats-charcuterie-board", "what-goes-on-charcuterie-board"],
  "Crackers & Breads": ["what-bread-for-charcuterie-board", "charcuterie-board-crackers"],
  "Fruit": ["charcuterie-board-fruit", "acid-contrast"],
  "Nuts & Seeds": ["charcuterie-board-nuts", "what-goes-on-charcuterie-board"],
  "Pickles, Olives & Briny": ["charcuterie-board-olives", "acid-contrast"],
  "Spreads, Jams & Honey": ["charcuterie-board-condiments", "charcuterie-board-dips"],
  "Finishing Touches": ["charcuterie-board-presentation", "color-and-flavor"]
};
let POSTS_BY_SLUG = new Map();

function ingredientReadMore(item, mentions) {
  const skip = item.boardPost?.replace(/^\/?blog\//, "").replace(/\/$/, "");
  const list = (mentions?.get(item.slug) || []).filter(({ post }) => post.slug !== skip).slice(0, 4);
  for (const slug of CATEGORY_GUIDES[item.category] || []) {
    if (list.length >= 3) break;
    const post = POSTS_BY_SLUG.get(slug);
    if (post && post.slug !== skip && !list.some((x) => x.post.slug === slug)) list.push({ post, score: 0 });
  }
  if (!list.length) return "";
  return `<section class="ing-read">
      <h2>Read more about ${escapeHtml(item.title.toLowerCase())}</h2>
      <div class="ing-read-grid">${list.map(({ post }) => `<a class="ing-read-card" href="/blog/${post.slug}/">
        <img src="${escapeHtml(thumb(post.image, "s"))}" alt="" width="240" height="135" loading="lazy" decoding="async">
        <span>${escapeHtml(post.title)}</span>
      </a>`).join("")}</div>
    </section>`;
}

function autolinkIngredients(html, index, selfSlug) {
  if (!index) return html;
  const used = new Set();
  let linked = 0;

  // Walk the HTML as tags and text so a match can never land inside an
  // attribute, an existing anchor, a heading or code.
  const parts = html.split(/(<[^>]+>)/);
  let skipDepth = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part.startsWith("<")) {
      const m = part.match(/^<(\/?)(a|h1|h2|h3|code|pre)\b/i);
      if (m) skipDepth += m[1] ? -1 : 1;
      if (skipDepth < 0) skipDepth = 0;
      continue;
    }
    if (skipDepth > 0 || !part.trim()) continue;

    index.re.lastIndex = 0;
    parts[i] = part.replace(index.re, (match) => {
      if (linked >= AUTOLINK_MAX_PER_POST) return match;
      const slug = index.bySlug.get(match.toLowerCase());
      if (!slug || slug === selfSlug || used.has(slug)) return match;
      used.add(slug);
      linked += 1;
      return `<a href="/ingredients/${slug}/">${match}</a>`;
    });
  }
  return parts.join("");
}

function sensoryBlock(html) {
  return html.replace(/<p>(<strong>[^<]+:<\/strong>[\s\S]*?)<\/p>/g, (match, inner) => {
    const parts = inner.split(/(?=<strong>[^<]+:<\/strong>)/).filter((part) => part.trim());
    if (parts.length < 2) return match;
    if (!parts.every((part) => /^<strong>[^<]+:<\/strong>/.test(part.trim()))) return match;
    const rows = parts
      .map((part) => {
        const m = part.trim().match(/^<strong>([^<]+):<\/strong>\s*([\s\S]*)$/);
        return `<div><dt>${m[1]}</dt><dd>${m[2].trim()}</dd></div>`;
      })
      .join("");
    return `<dl class="ing-sensory">${rows}</dl>`;
  });
}

// a board_post that points at a post which does not exist yet would ship a 404,
// so the link only renders once the target is actually in the build
function boardPostLink(item, blogSlugs) {
  if (!item.boardPost) return "";
  const slug = item.boardPost.replace(/^\/blog\//, "").replace(/\/$/, "");
  if (blogSlugs && !blogSlugs.has(slug)) return "";
  return `<p class="ing-boardpost">Building a whole board around it? <a href="${escapeHtml(item.boardPost)}">See board ideas &rarr;</a></p>`;
}

// Eleven ingredient files end with an italic "Building a whole board around it?"
// line pointing at /blog/<x>-charcuterie-board/ posts that were never published.
// boardPostLink() below already prints that line, checked against real posts,
// so the markdown copy is dropped; any other link to a missing post is unlinked.
function ingredientBodyHtml(html, blogSlugs) {
  let out = html
    .replace(/<p><em>Building a whole board around it\?[\s\S]*?<\/em><\/p>\s*/gi, "")
    .replace(/\s*<hr[^>]*>\s*$/i, "");
  if (blogSlugs) {
    out = out.replace(/<a href="\/blog\/([^"/]+)\/?"[^>]*>([\s\S]*?)<\/a>/g, (m, slug, text) =>
      blogSlugs.has(slug) ? m : text
    );
  }
  return out;
}

// "What Is Saucisson Sec?" matches how people search for an unfamiliar
// ingredient far better than "Saucisson Sec | Ingredients". Plural titles
// ("Walnuts") read "What Are"; a few singular names end in s.
const SINGULAR_S = new Set(["Cabrales", "Candied Citrus", "Époisses", "Hummus", "Langres", "Physalis", "Speculoos", "Tinned Octopus", "Wensleydale with Cranberries"]);
function ingredientSeoTitle(item) {
  if (item.seoTitle) return item.seoTitle;
  const verb = /s$/.test(item.title) && !SINGULAR_S.has(item.title) ? "Are" : "Is";
  return `What ${verb} ${item.title}? How to Serve & Pair It`;
}

// Cheese and cured-meat pages point at the two buying guides that rank for
// "best cheese for charcuterie board" and "charcuterie meats", so those guides
// get a consistent, keyword-matched internal link from every relevant page.
const SEAFOOD_SLUGS = new Set(["anchovies", "boquerones", "bottarga", "caviar", "gravlax", "sardines", "smoked-salmon", "smoked-trout", "tinned-mackerel", "tinned-octopus"]);
function ingredientGuideLink(item, blogSlugs) {
  let slug = "", text = "";
  if (item.category === "Cheese") {
    slug = "best-cheese-charcuterie-board";
    text = `Choosing cheeses? See <a href="/blog/${slug}/">the best cheese for a charcuterie board</a>: 16 cheeses by type, and how many to buy.`;
  } else if (item.category === "Cured Meat & Seafood" && !SEAFOOD_SLUGS.has(item.slug)) {
    slug = "best-meats-charcuterie-board";
    text = `Building the meat side? See the <a href="/blog/${slug}/">charcuterie meats list</a>: the 20 best meats for a board, and how much of each.`;
  }
  if (!slug || (blogSlugs && !blogSlugs.has(slug))) return "";
  return `<p class="ing-guide">${text}</p>`;
}

function ingredientPage(item, bySlug, blogSlugs = null, boardsUsing = [], pairingBlock = "", mentions = null) {
  const art = categoryArt(item.category);
  const related = item.pairsWith.map((s) => bySlug.get(s)).filter(Boolean);
  const spec = [
    item.boardRole && ["role", "Board role", item.boardRole],
    item.priceTier && ["price", "Price", item.priceTier],
    item.serving && ["serving", "Per person", item.serving],
    item.prepTime && ["prep", "Prep time", item.prepTime],
    item.allergens.length && ["allergens", "Allergens", item.allergens.join(", ")]
  ].filter(Boolean);

  return layout({
    canonical: `/ingredients/${item.slug}/`,
    ...(item.image ? { image: item.image } : {}),
    modified: item.updated || item.date,
    title: pageTitle(ingredientSeoTitle(item)),
    description: item.excerpt,
    head: [faqSchema(item), ingredientArticleSchema(item), breadcrumbSchema([["Home", "/"], ["Ingredients", "/ingredients/"], [item.category, `/ingredients/${item.categorySlug}/`], [item.title, `/ingredients/${item.slug}/`]])].filter(Boolean).join("\n"),
    body: `<main class="ing-main ing-detail">
  <p class="ing-crumb"><a href="/ingredients/">Ingredients</a> <span aria-hidden="true">/</span> <a href="/ingredients/${item.categorySlug}/">${escapeHtml(item.category)}</a> <span aria-hidden="true">/</span> ${escapeHtml(item.title)}</p>
  <article class="ing-article" style="--ing-tint:${art.tint}">
    <header class="ing-header">
      <a class="ing-eyebrow" href="/ingredients/${item.categorySlug}/">${art.glyph}${escapeHtml(item.category)}</a>
      <h1>${escapeHtml(item.title)}</h1>
      <p class="ing-lede">${escapeHtml(item.excerpt)}</p>
      <p class="ing-byline">${byline(longDate(item.updated || item.date) ? ` · Updated ${longDate(item.updated || item.date)}` : "")}</p>
      ${item.image ? heroImg(escapeHtml(item.image), escapeHtml(item.title), "ing-hero") : ""}
      ${
        spec.length
          ? `<div class="ing-spec">
        <span class="ing-spec-rule" aria-hidden="true"></span>
        <div class="ing-spec-grid">
${spec
  .map(
    ([icon, label, value]) =>
      `          <div class="ing-spec-item"><span class="ing-spec-icon" aria-hidden="true">${SPEC_ICONS[icon]}</span><div><span class="ing-spec-label">${escapeHtml(label)}</span><span class="ing-spec-value">${escapeHtml(value)}</span></div></div>`
  )
  .join("\n")}
        </div>
      </div>`
          : ""
      }
    </header>
    <div class="post-body ing-body">
      ${ingredientBodyHtml(item.html, blogSlugs)}
    </div>
    ${ingredientGuideLink(item, blogSlugs)}
    ${FUNNEL.leadBox("ing-lead", `cheat_ing_${item.slug}`, { title: `Serving ${item.title}? Get the free cheat sheet` })}
    ${bookBar(`ingredient_${item.slug}`, `Put ${item.title.toLowerCase()} on a full board`)}
    ${PRINTABLES.card(printableFor({ kind: "ingredient", slug: item.slug, title: item.title, category: item.category }), `ingredient_print_${item.slug}`, { item })}
    ${
      related.length
        ? `<section class="ing-related">
      <h2>Pairs well with</h2>
      <p class="ing-related-note">${related.length} ingredient${related.length === 1 ? "" : "s"} that earn their place next to ${escapeHtml(item.title.toLowerCase())} on the board.</p>
      <ul class="ing-related-list">
${related
  .map((r) => {
    const rart = categoryArt(r.category);
    return `        <li style="--ing-tint:${rart.tint}"><a href="/ingredients/${r.slug}/"><span class="ing-rel-thumb">${ingredientThumb(r, rart)}</span><span class="ing-rel-text"><strong>${escapeHtml(r.title)}</strong><span class="ing-rel-role">${escapeHtml(r.boardRole || r.category)}</span></span></a></li>`;
  })
  .join("\n")}
      </ul>
    </section>`
        : ""
    }
    ${pairingBlock}
    ${
      boardsUsing.length
        ? `<section class="ing-boards">
      <h2>Boards that use ${escapeHtml(item.title.toLowerCase())}</h2>
      <ul>${boardsUsing.slice(0, 6).map((b) => `<li><a href="/boards/${b.slug}/">${escapeHtml(b.h1)}</a></li>`).join("")}</ul>
    </section>`
        : ""
    }
    ${boardPostLink(item, blogSlugs)}
    ${ingredientReadMore(item, mentions)}
    <p class="ing-back"><a href="/ingredients/${item.categorySlug}/">&larr; All ${escapeHtml(item.category.toLowerCase())}</a></p>
  </article>
${labNext(`ingredient_${item.slug}_next`, { skip: ["book"], heading: "Plan the rest of the board" })}
${newsletterPanel("ing-email", `ingredient_${item.slug}`)}
</main>`
  });
}


// Google shows roughly 60 characters of a title. When the headline already
// fills that on its own, the " | Charcuterie Lab" suffix is truncated away
// anyway - dropping it buys back 19 characters of the words that matter.
// Google shows about 60 characters of a title. The brand suffix is added only
// when the whole title still fits; layout() also strips it from any title that
// comes in already suffixed and too long.
const TITLE_MAX = 60;
const TITLE_SUFFIX = " | Charcuterie Lab";
function pageTitle(title) {
  const t = String(title).trim();
  return (t + TITLE_SUFFIX).length <= TITLE_MAX ? t + TITLE_SUFFIX : t;
}
function fitTitle(title) {
  const t = String(title).trim();
  return t.length > TITLE_MAX && t.endsWith(TITLE_SUFFIX) ? t.slice(0, -TITLE_SUFFIX.length) : t;
}

// Search results cut the description at about 160 characters. Trim at the last
// sentence or word boundary before that rather than mid-word.
function metaSnippet(text, limit = 158) {
  const t = String(text).trim();
  if (t.length <= limit) return t;
  const head = t.slice(0, limit);
  const sentence = Math.max(head.lastIndexOf(". "), head.lastIndexOf("? "), head.lastIndexOf("! "));
  if (sentence > limit * 0.55) return head.slice(0, sentence + 1);
  const word = head.lastIndexOf(" ");
  return `${head.slice(0, word > 0 ? word : limit).trimEnd()}...`;
}

function layout({
  title,
  description,
  body,
  head = "",
  canonical = "/",
  image = "/images/book-cover.jpg",
  type = "website",
  published = "",
  modified = ""
}) {
  title = fitTitle(title);
  const pageUrl = absoluteUrl(canonical);
  const imageUrl = absoluteUrl(image);
  const shareTitle = title.replace(/\s*\|\s*Charcuterie Lab\s*$/, "");
  const articleTimes = type === "article"
    ? `  <meta property="article:published_time" content="${escapeHtml(published)}">
  <meta property="article:modified_time" content="${escapeHtml(modified || published)}">
`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(metaSnippet(description))}">
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:site_name" content="Charcuterie Lab">
  <meta property="og:locale" content="en_US">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escapeHtml(shareTitle)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="${escapeHtml(shareTitle)}">
${articleTimes}  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(shareTitle)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/assets/site.css?v=${assetVersion}">
  <style>
    .socials a{width:2.55rem;height:2.55rem;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(55,35,25,.18);background:rgba(255,255,255,.66);color:inherit;text-decoration:none;transition:transform .18s ease,background .18s ease,box-shadow .18s ease;}
    .socials a:hover{transform:translateY(-2px);background:#fff;box-shadow:0 12px 24px rgba(55,35,25,.12);}
    .socials svg{width:1.15rem;height:1.15rem;fill:currentColor;display:block;}
    .post-cta{margin:2.5rem 0;padding:1.6rem;border:1px solid rgba(128,67,46,.22);border-radius:1.4rem;background:linear-gradient(135deg,#fff7ec,#f3dfc4);box-shadow:0 18px 42px rgba(55,35,25,.08);}
    .post-cta p{margin:0 0 1rem;font-weight:700;color:#4f281c;}
    .post-cta-button{display:inline-flex;width:auto;}
  </style>
${head}
</head>
<body>
  <header class="site-header">
    <nav class="nav" aria-label="Primary navigation">
      <a class="brand" href="/">Charcuterie Lab</a>
      <div class="nav-links">
        <a class="nav-book" href="/printables/">Printables</a>
        <a href="/boards/">Boards</a>
        <a href="/holidays/">Holidays</a>
        <a href="/party-planner/">Party Planner</a>
        <a href="/board-builder/">Build a Board</a>
        <a href="/ingredients/">Ingredients</a>
        <a href="/pairings/">Pairings</a>
        <a href="/dietary/">Dietary</a>
        <a href="/blog/">Blog</a>
        <a href="/shop/">Shop</a>
        <a class="nav-search" href="/search/" aria-label="Search the site"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg><span class="nav-search-label">Search</span></a>
      </div>
    </nav>
  </header>
  ${body}
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">Charcuterie Lab</div>
      <div class="socials" aria-label="Social links">
        <a href="https://www.facebook.com/profile.php?id=61586809154604" target="_blank" rel="noopener" aria-label="Facebook">${socialIcon("facebook")}</a>
        <a href="https://www.instagram.com/charcuterielabflavor/" target="_blank" rel="noopener" aria-label="Instagram">${socialIcon("instagram")}</a>
        <a href="https://www.pinterest.com/charcuterielabflavor/" target="_blank" rel="noopener" aria-label="Pinterest">${socialIcon("pinterest")}</a>
      </div>
      <div class="footer-links">
        <a href="/books/">Books</a>
        <a href="/ebook/">The Book</a>
        <a href="${ebookHref("footer")}" target="_blank" rel="noopener">Ebook on Gumroad</a>
        <a href="${paperbackUrl}" target="_blank" rel="noopener">Paperback on Amazon</a>
        <a href="/boards/">Board Library</a>
        <a href="/holidays/">Holiday Hub</a>
        <a href="/party-planner/">Party Planner</a>
        <a href="/board-builder/">Board Builder</a>
        <a href="/ingredients/">Ingredients</a>
        <a href="/pairings/">Pairings Hub</a>
        <a href="/dietary/">Dietary Hub</a>
        <a href="/blog/">Blog</a>
        <a href="/shop/">Shop</a>
        <a href="/#newsletter">Newsletter</a>
        <a href="/about/">About</a>
        <a href="/privacy/">Privacy</a>
      </div>
      <div class="copyright">© 2026 Charcuterie Lab. All rights reserved.</div>
    </div>
  </footer>
${statcounterTag()}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Promotion order, site-wide: 1. the book (ebook on Gumroad, paperback on
// Amazon), 2. the Board Builder, 3. the Ingredients library. Every page uses
// these helpers so the order and the prices can only ever be changed in one
// place.
// ---------------------------------------------------------------------------

const ebookHref = (campaign) => withTracking(ebookUrl, campaign);

function bookButtons(campaign, { size = "" } = {}) {
  const cls = size ? ` book-buy-${size}` : "";
  return `<div class="book-buy${cls}">
      <a class="button primary book-buy-ebook" href="${ebookHref(campaign)}" target="_blank" rel="noopener">Get the ebook · ${ebookPrice}</a>
      <a class="button book-buy-print" href="${paperbackUrl}" target="_blank" rel="noopener">Paperback on Amazon · ${paperbackPrice}</a>
    </div>`;
}

const bookFormatsLine = `Instant PDF download on Gumroad, or a full-colour paperback from Amazon.`;

// Slim banner for the top of a page: the book, both editions, nothing else.
function bookBar(campaign, label = "The Charcuterie Lab book") {
  return `<aside class="book-bar" aria-label="The Charcuterie Lab book">
    <img class="book-bar-cover" src="${thumb("/images/book-cover.jpg", "s")}" alt="" width="64" height="83" loading="lazy" decoding="async">
    <div class="book-bar-copy">
      <p class="eyebrow">${escapeHtml(label)}</p>
      <p>50 complete boards with shopping lists, pairing logic and build order. ${bookFormatsLine}</p>
    </div>
    ${bookButtons(campaign, { size: "sm" })}
  </aside>`;
}

const builderPitch = {
  eyebrow: "Free tool",
  title: "Build your own board",
  text: "Pick what you like, get pairing advice as you go, then a shopping list, prep steps and a layout sized to your guest count.",
  href: "/board-builder/",
  cta: "Open the Board Builder"
};

const ingredientsPitch = {
  eyebrow: "Ingredient library",
  title: "Look up any ingredient",
  text: "Hundreds of cheeses, meats, fruits, spreads and crackers — what each one pairs with and why, how to prep it, and what to buy.",
  href: "/ingredients/",
  cta: "Browse the ingredients"
};

function pitchCard(p, rank) {
  return `<article class="lab-next-card lab-next-${rank}">
      <p class="eyebrow">${p.eyebrow}</p>
      <h3>${p.title}</h3>
      <p>${p.text}</p>
      <a class="button secondary-dark" href="${p.href}">${p.cta}</a>
    </article>`;
}

// The three-step block that closes a page: book, then Board Builder, then
// Ingredients. Pass skip to leave out the page the reader is already on.
function labNext(campaign, { skip = [], heading = "Keep going" } = {}) {
  const cards = [];
  if (!skip.includes("builder")) cards.push(pitchCard(builderPitch, "builder"));
  if (!skip.includes("ingredients")) cards.push(pitchCard(ingredientsPitch, "ingredients"));
  const book = skip.includes("book")
    ? ""
    : `<div class="lab-next-book">
      <img src="${thumb("/images/book-3d-mockup.webp")}" alt="${bookTitle}" width="320" height="320" loading="lazy" decoding="async">
      <div>
        <p class="eyebrow">The Book</p>
        <h2>50 boards, built by science</h2>
        <p>Every board comes with a shopping list, the pairing logic behind it, substitutions and the order to build it in. ${bookFormatsLine}</p>
        ${bookButtons(campaign)}
      </div>
    </div>`;
  return `<section class="lab-next" aria-label="${escapeHtml(heading)}">
    <div class="lab-next-inner">
    ${book}
    ${cards.length ? `<div class="lab-next-cards">${cards.join("\n")}</div>` : ""}
    </div>
  </section>`;
}

// The newsletter box at the foot of most pages. It offers the free Cheat
// Sheet for the email, which converts far better than "subscribe".
function newsletterPanel(id, campaign) {
  return `<section class="lab-news" aria-label="Free cheat sheet and newsletter">
    <div class="lab-news-inner">
      <div class="lab-news-offer">
        <img src="/images/charcuterie-cheat-sheet.webp" alt="" width="480" height="621" loading="lazy" decoding="async">
        <div>
          <p class="eyebrow">Free printable</p>
          <h2>Get the Charcuterie Cheat Sheet</h2>
          <p>How much to buy for any guest count, the build order, fridge timing and pairing rules on two printable pages. Plus the Lab Report: one pairing that works and why, and new printables the day they land.</p>
        </div>
      </div>
      ${FUNNEL.cheatForm(id, `cheat_${campaign}`)}
    </div>
  </section>`;
}

function homePage(posts, products, boardStrip = "") {
  const featuredPosts = posts.slice(0, 3);
  return layout({
    title: "Charcuterie Lab | Boards Built by Science",
    canonical: "/",
    head: siteSchema(),
    description: `Charcuterie Lab: 50 board blueprints built by science. Ebook ${ebookPrice} on Gumroad, paperback ${paperbackPrice} on Amazon. Plus a free Board Builder and ingredient library.`,
    body: `<main>
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <p class="hero-kicker">The Book</p>
        <h1>50 Charcuterie Boards, Built by Science</h1>
        <p>Shopping lists, pairing logic, substitutions and a build order for every board, so you can repeat them, not just admire them.</p>
        <ul class="hero-points" aria-label="What is included">
          <li>50 board plans</li>
          <li>Shopping lists</li>
          <li>Pairing science</li>
        </ul>
        <div class="hero-editions">
          <a class="hero-edition hero-edition-ebook" href="${ebookHref("home_hero")}" target="_blank" rel="noopener">
            <span class="hero-edition-label">Ebook</span>
            <strong>${ebookPrice}</strong>
            <span>Instant PDF download · Gumroad</span>
          </a>
          <a class="hero-edition hero-edition-print" href="${paperbackUrl}" target="_blank" rel="noopener">
            <span class="hero-edition-label">Paperback</span>
            <strong>${paperbackPrice}</strong>
            <span>259 pages, full colour · Amazon</span>
          </a>
        </div>
        <p class="hero-more"><a href="${ebookPageUrl}">See what's inside the book &rarr;</a></p>
      </div>
      <div class="hero-art" aria-label="Charcuterie Lab book">
        <div class="book-tilt">
          <div class="book-object book-mockup">
            <img class="book" src="/images/book-3d-mockup.webp" alt="Charcuterie Lab book mockup" width="640" height="640" fetchpriority="high">
          </div>
        </div>
      </div>
    </div>
  </section>

  <!--offer-top-->

  ${boardStrip}

  <section class="section lab-free" aria-label="Free from the Lab">
    <div class="section-inner">
      <p class="section-kicker">Free from the Lab</p>
      <h2 class="section-title">Plan your next board</h2>
      <div class="lab-next-cards">
        ${pitchCard(builderPitch, "builder")}
        ${pitchCard(ingredientsPitch, "ingredients")}
      </div>
    </div>
  </section>

  <section class="section" id="blog">
    <div class="section-inner">
      <p class="section-kicker">Daily Lab Report</p>
      <h2 class="section-title">Latest from the Lab</h2>
      <div class="grid three blog-preview-grid">
        ${featuredPosts.map((post) => articleCard(post)).join("\n")}
      </div>
      <div class="section-link">
        <a class="text-link" href="/blog/">View all blog posts</a>
      </div>
    </div>
  </section>

  <section class="section alt" id="shop">
    <div class="section-inner">
      <p class="section-kicker">Shop</p>
      <h2 class="section-title">The book and the printables</h2>
      <div class="shop-book">
        <img src="${thumb("/images/book-cover.jpg")}" alt="${bookTitle} cover" width="180" height="233" loading="lazy" decoding="async">
        <div>
          <h3>${bookTitle}</h3>
          <p>All 50 boards with shopping lists, pairing logic, substitutions and build notes. ${bookFormatsLine}</p>
          ${bookButtons("home_shop")}
        </div>
      </div>
      <div class="grid four printables-grid">
        ${products.map((product) => productCard(product)).join("\n")}
      </div>
    </div>
  </section>

  <section class="section newsletter" id="newsletter">
    <div class="newsletter-row">
      <div>
        <h2>Get the Charcuterie Lab Report</h2>
        <p>One pairing that works and why, a board worth stealing, and new printables the day they land. Free, and you can leave any time.</p>
      </div>
      <form class="newsletter-form" action="${newsletterUrl}" method="get" target="_blank" rel="noopener">
        <label class="sr-only" for="email">Email address</label>
        <input id="email" name="email" type="email" autocomplete="email" placeholder="Email address" required>
        <button class="button primary" type="submit">Subscribe</button>
      </form>
    </div>
  </section>
</main>`
  });
}

function bookSchema() {
  const offer = (url, price, format) => ({
    "@type": "Offer",
    url,
    price: price.replace("$", ""),
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    itemOffered: { "@type": "Book", name: bookTitle, bookFormat: format }
  });
  const data = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: bookTitle,
    author: authorRef,
    url: absoluteUrl(ebookPageUrl),
    image: absoluteUrl("/images/book-cover.jpg"),
    numberOfPages: 259,
    offers: [
      offer(ebookUrl, ebookPrice, "https://schema.org/EBook"),
      offer(paperbackUrl, paperbackPrice, "https://schema.org/Paperback")
    ]
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
}

function ebookPage() {
  const buy = (campaign) => bookButtons(`ebook_page_${campaign}`, { size: "lg" });
  const X = ebookSections({ escapeHtml }, BOOK_BOARDS, FUNNEL);

  return layout({
    title: "Charcuterie Lab | 50 Boards Built by Science",
    canonical: "/ebook/",
    image: "/images/book-cover.jpg",
    description: `Charcuterie Lab: 50 board blueprints with shopping lists, pairing logic, substitutions and build notes. Ebook ${ebookPrice} on Gumroad or paperback ${paperbackPrice} on Amazon.`,
    head: bookSchema(),
    body: `<main class="ebook-page">
  <section class="ebook-hero">
    <div class="ebook-hero-inner">
      <p class="ebook-kicker">The Book</p>
      <h1>Build charcuterie boards that look beautiful because they make sense.</h1>
      <p>Charcuterie Lab gives you 50 complete board blueprints with shopping lists, pairing logic, substitutions, and step-by-step build notes so you can host with confidence instead of guessing.</p>
      <div class="ebook-hero-actions">
        ${buy("hero")}
        <span>Ebook: instant PDF download from Gumroad. Paperback: printed and shipped by Amazon. <a href="#sample">Read board 01 free</a> or <a href="#look-inside">look inside</a>.</span>
      </div>
      <div class="ebook-metrics" aria-label="Book highlights">
        <span><strong>50</strong> board plans</span>
        <span><strong>259</strong> pages</span>
        <span><strong>2</strong> editions</span>
        <span><strong>${FUNNEL.perBoard}</strong> a board</span>
      </div>
      <div class="ebook-hero-product">
        <img src="/images/book-3d-mockup.webp" alt="${bookTitle}" width="640" height="640">
      </div>
    </div>
  </section>

  <section class="ebook-section ebook-editions" id="editions">
    <div class="ebook-section-inner">
      <p class="section-kicker">Choose your edition</p>
      <h2>Same 50 boards, two ways to own them</h2>
      <div class="edition-grid">
        <article class="edition-card edition-ebook">
          <p class="edition-tag">Ebook</p>
          <p class="edition-price">${ebookPrice}</p>
          <ul>
            <li>Instant PDF download</li>
            <li>Read it on your phone, tablet or laptop</li>
            <li>Print just the boards you need</li>
          </ul>
          <a class="button primary" href="${ebookHref("ebook_page_editions")}" target="_blank" rel="noopener">Get the ebook on Gumroad</a>
        </article>
        <article class="edition-card edition-print">
          <p class="edition-tag">Paperback</p>
          <p class="edition-price">${paperbackPrice}</p>
          <ul>
            <li>259 pages, full colour, 8.5&Prime; &times; 11&Prime;</li>
            <li>Lies open on the counter while you build</li>
            <li>Printed and shipped by Amazon</li>
          </ul>
          <a class="button primary" href="${paperbackUrl}" target="_blank" rel="noopener">Paperback on Amazon</a>
        </article>
      </div>
    </div>
  </section>

  <section class="ebook-strip" aria-label="Who it is for">
    <span>Dinner parties</span>
    <span>Wine nights</span>
    <span>Holidays</span>
    <span>Game day</span>
    <span>Date nights</span>
  </section>

  <section class="ebook-section">
    <div class="ebook-section-inner ebook-two-col">
      <div>
        <p class="section-kicker">The Problem</p>
        <h2>Pretty boards are easy to admire. They are harder to repeat.</h2>
        <p>Most charcuterie advice gives you a photo and a pile of ingredients. Charcuterie Lab gives you a system: what to buy, why it belongs, where it goes, and how to swap ingredients without breaking the board.</p>
      </div>
      <div class="ebook-checklist">
        <div><strong>No more random grocery runs.</strong><span>Each board includes a focused shopping list.</span></div>
        <div><strong>No more flavor clashes.</strong><span>Pairings are built around contrast, fat, salt, acid, crunch, and sweetness.</span></div>
        <div><strong>No more blank-board panic.</strong><span>Every board has a build plan you can follow.</span></div>
      </div>
    </div>
  </section>

  <section class="ebook-section ebook-contents">
    <div class="ebook-section-inner">
      <p class="section-kicker">What You Get</p>
      <h2>Inside the book</h2>
      <div class="ebook-grid">
        <article>
          <h3>50 Complete Board Blueprints</h3>
          <p>Classic boards, seasonal boards, budget boards, wine-night boards, party boards, and premium entertaining boards.</p>
        </article>
        <article>
          <h3>Shopping Lists</h3>
          <p>Know what to buy before you walk into the store, with enough structure to stay focused and enough flexibility to substitute.</p>
        </article>
        <article>
          <h3>Pairing Logic</h3>
          <p>Understand why cheeses, meats, fruits, spreads, crunch, and briny elements work together.</p>
        </article>
        <article>
          <h3>Substitutions</h3>
          <p>Swap ingredients confidently when something is expensive, unavailable, or not right for your guests.</p>
        </article>
        <article>
          <h3>Step-by-Step Builds</h3>
          <p>Follow a repeatable order that makes boards easier to assemble and better to look at.</p>
        </article>
        <article>
          <h3>Hosting Upgrades</h3>
          <p>Use simple elevation ideas to make boards feel more intentional, premium, and memorable.</p>
        </article>
      </div>
    </div>
  </section>

${X.samples}

${X.look}

${X.sample}

  <section class="ebook-section ebook-preview">
    <div class="ebook-section-inner ebook-two-col">
      <img src="/images/book-3d-mockup.webp" alt="${bookTitle}" width="640" height="640" loading="lazy" decoding="async">
      <div>
        <p class="section-kicker">Which edition?</p>
        <h2>Ebook for tonight, paperback for the kitchen shelf.</h2>
        <p>The ebook lands in your inbox the moment you buy it, so you can shop for a board this afternoon. The paperback is 8.5 by 11 inches and lies open while your hands are busy, with every layout printed large enough to read mid-build.</p>
        ${buy("why")}
      </div>
    </div>
  </section>

${X.list}

  <section class="ebook-section ebook-faq">
    <div class="ebook-section-inner">
      <p class="section-kicker">Questions</p>
      <h2>Before you buy</h2>
      <div class="ebook-faq-list">
        <details open>
          <summary>What's the difference between the ebook and the paperback?</summary>
          <p>Nothing in the content: the same 50 boards, shopping lists, pairing logic and build notes. The ebook (${ebookPrice}) is a PDF you download instantly from Gumroad. The paperback (${paperbackPrice}) is 259 full-colour pages, printed and shipped by Amazon.</p>
        </details>
        <details>
          <summary>Can I see inside before I buy?</summary>
          <p>Yes. <a href="#look-inside">Look inside</a> shows real pages, and <a href="#sample">board 01 is free</a>: the introduction, the contents and the full five-page Classic American Starter Board as an 11-page PDF.</p>
        </details>
        <details>
          <summary>Is it beginner-friendly?</summary>
          <p>Yes. The book is built around repeatable board formulas, shopping lists, substitutions, and clear steps.</p>
        </details>
        <details>
          <summary>Can I use this for parties and holidays?</summary>
          <p>Yes. The 50 board plans cover everyday hosting, seasonal events, wine nights, game day, budget boards, and more polished entertaining.</p>
        </details>
        <details>
          <summary>How do I get the ebook after buying?</summary>
          <p>Gumroad emails you a download link straight away, and the PDF stays in your Gumroad library if you need it again. <a href="${ebookHref("ebook_page_faq")}" target="_blank" rel="noopener">Get the ebook on Gumroad</a>.</p>
        </details>
      </div>
    </div>
  </section>

  <section class="ebook-final-cta">
    <div>
      <p class="ebook-kicker">Charcuterie Lab</p>
      <h2>Start building better boards today.</h2>
      <p>Fifty boards, every one of them explained — so your next board is planned, balanced, and repeatable.</p>
      ${buy("final")}
    </div>
  </section>
${labNext("ebook_page_next", { skip: ["book"], heading: "Free from the Lab" })}
</main>`
  });
}

function articleCard(post) {
  return `<article class="card">
  <a href="/blog/${post.slug}/"><img class="blog-preview-image" src="${thumb(post.image)}" alt=""${imageSize(thumb(post.image))} loading="lazy" decoding="async"></a>
  <h3><a href="/blog/${post.slug}/">${escapeHtml(post.title)}</a></h3>
  <p>${escapeHtml(clampText(metaDescription(post), 155))}</p>
</article>`;
}

// /shop/ : books first, then printables, then the free tools. Few words on
// purpose: covers, titles, prices, buttons.
function shopPage(products) {
  const W = WORLD_BOOK;
  const worldLive = worldIsLive(W);
  const books = [
    {
      cover: "/images/book-cover.jpg", w: 687, h: 1024, tag: "Bestseller", title: "50 Boards Built by Science",
      line: "50 complete board blueprints for every occasion.",
      buttons: [[`Ebook · ${ebookPrice}`, ebookHref("shop_book1"), true], [`Paperback · ${paperbackPrice}`, paperbackUrl, false]],
      more: ["What's inside", ebookPageUrl]
    },
    {
      cover: W.cover, w: 600, h: 787, tag: worldLive ? "New" : `Coming ${W.launch.replace(/, \d{4}$/, "")}`, title: "Around the World in 16 Boards",
      line: "16 international boards, from Bavaria to Korea to Peru.",
      buttons: worldLive
        ? [...(W.ebookUrl ? [[`Ebook${W.ebookPrice ? ` · ${W.ebookPrice}` : ""}`, W.ebookUrl, true]] : []), ...(W.paperbackUrl ? [[`Paperback${W.paperbackPrice ? ` · ${W.paperbackPrice}` : ""}`, W.paperbackUrl, !W.ebookUrl]] : [])]
        : [["Tell me on launch day", withTracking(newsletterUrl, "shop_world_notify"), true]],
      more: ["See the 16 boards", "/around-the-world/"]
    },
    {
      cover: "/images/books/plant-based-cover.webp", w: 600, h: 794, tag: "Plant-based", title: "15 Show-Stopping Plant-Based Boards",
      line: "No meat, no dairy, same pairing science.",
      buttons: [[`Ebook · ${PLANT_BOOK.ebookPrice}`, withTracking(PLANT_BOOK.ebookUrl, "shop_plant"), true], PLANT_BOOK.paperbackUrl ? [`Paperback · ${PLANT_BOOK.paperbackPrice}`, PLANT_BOOK.paperbackUrl, false] : [`Kindle · ${PLANT_BOOK.kindlePrice}`, PLANT_BOOK.kindleUrl, false]],
      more: ["See the 15 boards", "/books/plant-based-charcuterie-boards/"]
    },
    {
      cover: TWO_BOOK.cover, w: 600, h: 787, tag: "New · For two", title: "Boards for Two",
      line: "25 boards for date nights, celebrations and cozy nights in.",
      buttons: [[`Ebook · ${TWO_BOOK.ebookPrice}`, withTracking(TWO_BOOK.ebookUrl, "shop_two"), true], ...(TWO_BOOK.paperbackUrl ? [[`Paperback · ${TWO_BOOK.paperbackPrice}`, TWO_BOOK.paperbackUrl, false]] : [])],
      more: ["See the 25 boards", "/books/boards-for-two/"]
    },
    {
      cover: KETO_BOOK.cover, w: 600, h: 787, tag: "New · Keto", title: "Keto & Low-Carb Boards",
      line: "20 boards at 4–9 g net carbs per serving, with full macros.",
      buttons: [[`Ebook · ${KETO_BOOK.ebookPrice}`, withTracking(KETO_BOOK.ebookUrl, "shop_keto"), true], ...(KETO_BOOK.paperbackUrl ? [[`Paperback · ${KETO_BOOK.paperbackPrice}`, KETO_BOOK.paperbackUrl, false]] : [])],
      more: ["See the 20 boards", "/books/keto-charcuterie-boards/"]
    }
  ];
  const ext = (href) => /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : "";
  const bookCard = (b) => `<article class="shop-book-card">
      <div class="shop-cover"><img src="${thumb(b.cover)}" alt="${escapeHtml(b.title)} cover" width="${b.w}" height="${b.h}" loading="lazy" decoding="async"><span class="shop-tag">${escapeHtml(b.tag)}</span></div>
      <h3>${escapeHtml(b.title)}</h3>
      <p>${escapeHtml(b.line)}</p>
      <div class="shop-buttons">${b.buttons.map(([label, href, primary]) => `<a class="button${primary ? " primary" : ""}" href="${escapeHtml(href)}"${ext(href)}>${escapeHtml(label)}</a>`).join("")}</div>
      <a class="shop-more" href="${b.more[1]}">${escapeHtml(b.more[0])} &rarr;</a>
    </article>`;
  const printCard = (p) => {
    const url = `/printables/${p.slug}/`;
    return `<a class="shop-print" href="${url}">
      <img src="${thumb(p.image)}" alt=""${imageSize(thumb(p.image))} loading="lazy" decoding="async">
      <span class="shop-print-body"><strong>${escapeHtml(p.title)}</strong><span class="shop-price">${escapeHtml(p.priceShort || p.price)} · instant PDF</span></span>
    </a>`;
  };
  return layout({
    title: "Shop: Charcuterie Books & Printables | Charcuterie Lab",
    canonical: "/shop/",
    image: "/images/book-cover.jpg",
    description: `Charcuterie Lab books and printables: 50 Boards Built by Science (ebook ${ebookPrice}, paperback ${paperbackPrice}), the plant-based edition, Around the World in 16 Boards, and printable pairing guides.`,
    head: `  <script type="application/ld+json">${jsonForScript({
      "@context": "https://schema.org", "@type": "ItemList", name: "Charcuterie Lab shop", url: absoluteUrl("/shop/"),
      itemListElement: [...books.map((b) => b.title), ...products.map((p) => p.title)].map((name, i) => ({ "@type": "ListItem", position: i + 1, name }))
    })}</script>`,
    body: `<main class="shop-main">
  <header class="shop-hero">
    <p class="section-kicker">Shop</p>
    <h1>Build better boards</h1>
    <p>Printables and ebooks as instant PDF downloads on Gumroad. Paperbacks on Amazon.</p>
  </header>
  <section class="shop-section" aria-labelledby="shop-printables">
    <h2 id="shop-printables">Printables</h2>
    <p class="shop-sub">Instant PDF downloads. <a href="/printables/">See what's inside each one &rarr;</a></p>
    <div class="shop-prints">
    ${products.map(printCard).join("\n    ")}
    </div>
  </section>
  <section class="shop-section" aria-labelledby="shop-books">
    <h2 id="shop-books">Ebooks and paperbacks</h2>
    <div class="shop-books">
    ${books.map(bookCard).join("\n    ")}
    </div>
  </section>
  <section class="shop-section shop-free" aria-labelledby="shop-free">
    <h2 id="shop-free">Free</h2>
    <div class="shop-free-links">
      <a href="/board-builder/"><strong>Board Builder</strong><span>Shopping list for your guest count</span></a>
      <a href="/boards/"><strong>Board Library</strong><span>Plans for every occasion</span></a>
      <a href="/ingredients/"><strong>Ingredients</strong><span>325 pairing guides</span></a>
    </div>
  </section>
</main>`
  });
}

function productCard(product) {
  const trackedUrl = withTracking(product.url, "home_shop");
  return `<article class="card product">
  <a href="/printables/${product.slug}/"><img src="${thumb(product.image)}" alt=""${imageSize(thumb(product.image))} loading="lazy" decoding="async"></a>
  <h3><a href="/printables/${product.slug}/">${escapeHtml(product.title)}</a></h3>
  <p>${escapeHtml(product.description)}</p>
  <span class="price">${escapeHtml(product.price)}</span>
  <a class="button product-button" href="${trackedUrl}" target="_blank" rel="noopener">Get it on Gumroad</a>
</article>`;
}

// Mid-article promo. The book already leads the page (top banner) and closes
// it (footer), so the middle slot goes to the second priority, the Board
// Builder, instead of a third identical book button.
function postInlinePromo(post) {
  return `<aside class="post-inline-promo" aria-label="Board Builder">
    <p class="eyebrow">Free tool</p>
    <h2>Turn this idea into your own board.</h2>
    <p>Pick the ingredients you like and the Board Builder suggests what pairs with them, then gives you a shopping list, prep steps and a layout for your guest count.</p>
    <a class="button primary" href="/board-builder/?utm_source=charcuterielab&utm_medium=blog&utm_campaign=inline_${post.slug}">Open the Board Builder</a>
  </aside>`;
}

function addInlinePromo(html, post) {
  const promo = postInlinePromo(post);
  if (html.includes("<h2")) {
    return html.replace(/<h2/, `${promo}\n<h2`);
  }
  return `${html}\n${promo}`;
}

function privacyPage() {
  return layout({
    title: "Privacy | Charcuterie Lab",
    canonical: "/privacy/",
    description: "What Charcuterie Lab collects, why, and how to opt out. Analytics, the newsletter, and links to Amazon and Gumroad.",
    body: `<main class="ebook-page">
  <section class="ebook-section">
    <div class="ebook-section-inner">
      <div class="legal-prose">
        <p class="section-kicker">Privacy</p>
        <h1>What this site collects</h1>
        <p>Charcuterie Lab is a food blog run by one person. This page describes, in plain language, what happens to information when you visit.</p>

        <h2>Analytics</h2>
        <p>This site uses Statcounter to count visits and see which pages people read and where they arrived from. It records things like the page you viewed, the time, the site or search that referred you, your browser and device type, your approximate location, and your IP address. It is used to understand which articles are useful — not to identify you personally, and it is never sold or shared.</p>
        <p>Statcounter sets a cookie to tell a returning visit from a new one. You can block it with your browser's cookie settings, with any ad or tracker blocker, or through <a href="https://statcounter.com/about/legal/#optout" target="_blank" rel="noopener">Statcounter's own opt-out</a>. Nothing on this site stops working if you do.</p>
        <p>The site is hosted on Netlify, which keeps its own basic server logs and aggregate traffic counts as part of hosting.</p>

        <h2>The newsletter</h2>
        <p>If you subscribe, your email address goes to beehiiv, which sends the newsletter and records opens and clicks so I can tell which issues were worth reading. Your address is used for the newsletter and nothing else — never sold, never rented, never passed on. Every email has an unsubscribe link, and it works immediately.</p>

        <h2>Links to other places</h2>
        <p>Some links lead to Gumroad, where the ebook and the printables are sold, and to Amazon, where the paperback is sold. Purchases happen entirely on those sites under their own privacy policies and payment handling — no payment details ever reach this site, because there is nothing here to pay for. Links may carry a tracking tag so I can tell which article sent someone; that tag identifies the article, not you.</p>

        <h2>Children</h2>
        <p>This site is meant for adults and is not directed at children under 13.</p>

        <h2>Your choices</h2>
        <p>You can block cookies and trackers in your browser, unsubscribe from the newsletter at any time, or write to me to ask what has been collected about you or to have it deleted. If you are in the EU or UK, GDPR gives you those rights explicitly; I will honour them regardless of where you live.</p>

        <h2>Changes</h2>
        <p>If what the site collects changes, this page changes with it.</p>

        <p><em>Last updated: August 2026.</em></p>
      </div>
    </div>
  </section>
</main>`
  });
}

// About: who writes the site and the books, and how the content is made.
// Kept to facts Chris has confirmed; add personal story lines here.
function aboutPage({ posts = 0, ingredients = 0, boards = 0 } = {}) {
  const person = {
    "@context": "https://schema.org",
    ...authorRef,
    jobTitle: "Author",
    description: "Author of the Charcuterie Lab books and writer of charcuterielab.com. Runs a local charcuterie catering business.",
    worksFor: { "@type": "Organization", name: "Charcuterie Lab", url: siteUrl },
    knowsAbout: ["Charcuterie boards", "Charcuterie catering", "Cheese pairing", "Cured meats", "Entertaining"]
  };
  const page = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Charcuterie Lab",
    url: absoluteUrl("/about/"),
    mainEntity: { "@id": authorRef["@id"] },
    publisher: { "@type": "Organization", name: "Charcuterie Lab", url: siteUrl }
  };
  const round = (n) => (n >= 100 ? `${Math.floor(n / 10) * 10}+` : String(n));
  return layout({
    title: "About Charcuterie Lab and Jimmy Wilson",
    canonical: "/about/",
    description: `Charcuterie Lab is written by Jimmy Wilson, author of the Charcuterie Lab books. How the boards, amounts and pairings on this site are put together.`,
    head: `  <script type="application/ld+json">${jsonForScript(person)}</script>
  <script type="application/ld+json">${jsonForScript(page)}</script>`,
    body: `<main class="ebook-page about-page">
  <section class="ebook-section">
    <div class="ebook-section-inner">
      <div class="legal-prose">
        <p class="section-kicker">About</p>
        <h1>About Charcuterie Lab</h1>
        <p class="about-lede">Charcuterie Lab is about building charcuterie boards on purpose: what to buy, how much of it, the order to put it down in, and why the pairings work. It's written by ${AUTHOR_NAME}, author of the Charcuterie Lab books.</p>

        <h2 id="jimmy-wilson">${AUTHOR_NAME}</h2>
        <blockquote class="about-quote"><p>"I have always had a fondness for charcuterie. I still run my own local charcuterie catering business. Charcuterie Lab was started to dive into all the ingredients, pairings and boards, and take the charcuterie experience to the next level."</p><p class="about-quote-by">${AUTHOR_NAME}</p></blockquote>
        <p>${AUTHOR_NAME} writes this site and the Charcuterie Lab books, alongside running a local charcuterie catering business. Every board he publishes follows the same format: a shopping list with amounts, a build order, and the reason each pairing works, so you can repeat a good board instead of guessing at it.</p>
        <ul class="about-books">
          <li><a href="/ebook/"><strong>${bookTitle}</strong></a>: 50 complete boards, as an ebook and a ${paperbackPrice} paperback.</li>
          <li><a href="${escapeHtml(withTracking(PLANT_BOOK.ebookUrl, "about_plant"))}" target="_blank" rel="noopener"><strong>${escapeHtml(PLANT_BOOK.title)}</strong></a>: 15 plant-based boards.</li>
          <li><a href="/around-the-world/"><strong>${escapeHtml(WORLD_BOOK.title)}</strong></a>: 16 international boards${worldIsLive() ? "" : `, out ${escapeHtml(WORLD_BOOK.launch)}`}.</li>
        </ul>

        <h2>What's on the site</h2>
        <ul>
          <li><a href="/blog/">${round(posts)} articles</a> on pairing science, board ideas and ingredients</li>
          <li><a href="/ingredients/">${round(ingredients)} ingredient guides</a>: what each one is, how much to buy and what it pairs with</li>
          <li><a href="/boards/">${boards} complete boards</a> with shopping lists and build steps</li>
          <li>Free tools: the <a href="/party-planner/">Party Planner</a> for amounts by guest count, the <a href="/board-builder/">Board Builder</a> and the <a href="/pairings/">Pairings Hub</a></li>
        </ul>

        <h2>How the content is made</h2>
        <ul>
          <li><strong>One set of amounts.</strong> Every page uses the same standard: 2 oz each of meat and cheese per guest before a meal, 3 oz when the board is the party food, 4 oz when it's the meal, plus 10% from 20 guests up. The Party Planner, the Board Builder and the articles all agree.</li>
          <li><strong>Food safety from the source.</strong> How long a board can sit out follows <a href="https://ask.fsis.usda.gov/article/What-is-the-2-Hour-Rule-with-leaving-food-out" target="_blank" rel="noopener">USDA guidance</a>: no more than 2 hours, or 1 hour above 90°F.</li>
          <li><strong>Dates you can see.</strong> Articles show when they were published and when they were last updated.</li>
          <li><strong>Our own products only.</strong> Links to books and printables go to Charcuterie Lab's own titles on Gumroad and Amazon.</li>
        </ul>

        <h2>Get in touch</h2>
        <p>Spotted a mistake, or have a board you want worked out? Reply to any issue of the Lab Report newsletter and it reaches ${AUTHOR_NAME}.</p>
      </div>
    </div>
  </section>
${newsletterPanel("about-email", "about")}
</main>`
  });
}

function blogPage(posts) {
  return layout({
    title: "Blog | Charcuterie Lab",
    canonical: "/blog/",
    description: "Read every Charcuterie Lab post about pairing science, board building, ingredients, and printable guides.",
    body: `<main class="archive-main">
  <section class="archive-hero">
    <div class="archive-hero-inner">
      <p class="section-kicker">Daily Lab Report</p>
      <h1>All Blog Posts</h1>
      <p>Pairing science, ingredient deep dives, budget boards, and the little details that make a board work.</p>
      <form class="search-form search-inline" role="search" action="/search/" method="get">
        <label class="sr-only" for="blog-q">Search articles</label>
        <input id="blog-q" name="q" type="search" placeholder="Search articles, ingredients and boards" autocomplete="off">
        <button class="button primary" type="submit">Search</button>
      </form>
    </div>
  </section>
  ${bookBar("blog_index_top")}
  <section class="section">
    <div class="section-inner">
      <div class="grid three blog-preview-grid archive-grid">
        ${posts.map((post) => articleCard(post)).join("\n")}
      </div>
    </div>
  </section>
${labNext("blog_index")}
</main>`
  });
}

// "Pair it, plate it": every post links to the Pairings Hub pages and board
// plans that fit what it talks about (pairings.mjs postPairingLinks, and
// boardsForPost below). Before this, 92% of posts linked to no pairing page
// and 90% to no board.
const BOARD_STOP = new Set(["charcuterie", "board", "boards", "the", "a", "an", "and", "for", "of", "with", "ideas", "idea", "plan", "how", "to", "what", "your", "best", "easy", "make", "guide", "on", "in", "s", "cheese", "meat"]);
const tokens = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !BOARD_STOP.has(w));

function postMentionCounts(post, index) {
  const counts = new Map();
  if (!index) return counts;
  const text = String(post.html || "").replace(/<[^>]+>/g, " ");
  index.re.lastIndex = 0;
  for (const m of text.matchAll(index.re)) {
    const slug = index.bySlug.get(m[0].toLowerCase());
    if (slug) counts.set(slug, (counts.get(slug) || 0) + 1);
  }
  return counts;
}

// Words a post title might use for each board's occasion, beyond the words
// already in the board's own name.
const BOARD_TOPICS = {
  "classic-american-starter-board": "beginner easy simple first basic starter classic american",
  "holiday-entertaining-board": "holiday holidays christmas winter festive december entertaining",
  "game-day-charcuterie-board": "game football super bowl tailgate tailgating sports",
  "25-dollar-budget-charcuterie-board": "budget cheap affordable under dollar save money",
  "luxury-charcuterie-board": "luxury expensive fancy premium splurge upscale",
  "thanksgiving-charcuterie-board": "thanksgiving friendsgiving turkey november",
  "new-years-eve-charcuterie-board": "new year years eve nye champagne",
  "fall-harvest-charcuterie-board": "fall autumn harvest pumpkin apple october halloween",
  "office-party-charcuterie-board": "office work large group crowd corporate party",
  "cocktail-party-charcuterie-board": "cocktail cocktails party appetizer",
  "plant-based-fall-harvest-board": "vegan vegetarian plant based dairy free",
  "plant-based-holiday-board": "vegan vegetarian plant based dairy free",
  "german-bavarian-charcuterie-board": "german bavarian oktoberfest pretzel beer",
  "british-ploughmans-board": "british english ploughman ploughmans pub",
  "swiss-alpine-charcuterie-board": "swiss alpine alps fondue raclette",
  "portuguese-petiscos-board": "portuguese portugal",
  "eastern-european-deli-board": "eastern european polish deli",
  "turkish-meze-board": "turkish meze mezze middle eastern",
  "moroccan-charcuterie-board": "moroccan morocco north african",
  "indian-charcuterie-board": "indian india",
  "thai-charcuterie-board": "thai thailand",
  "vietnamese-charcuterie-board": "vietnamese vietnam",
  "dim-sum-charcuterie-board": "dim sum chinese",
  "korean-bbq-charcuterie-board": "korean korea bbq",
  "brazilian-churrasco-board": "brazilian brazil churrasco",
  "argentine-asado-board": "argentine argentina asado",
  "peruvian-charcuterie-board": "peruvian peru",
  "caribbean-charcuterie-board": "caribbean tropical island"
};
const SEASONAL = /holiday|thanksgiving|new-years|fall|plant-based/;

// Board plans that fit a post: its title naming the board's occasion counts
// most, then shared ingredients (scaled by board size so the 24-item boards
// don't win every post). Occasion boards need a topic match or a strong
// overlap. `used` spreads links across all boards instead of the same two.
function boardsForPost(post, boards, mentions, exclude, used, max = 2) {
  const words = new Set(tokens(`${post.title} ${post.slug}`));
  const picked = boards
    .filter((b) => b !== exclude)
    .map((b) => {
      const topic = new Set(tokens(`${b.slug} ${b.h1} ${BOARD_TOPICS[b.slug] || ""}`).filter((w) => words.has(w))).size;
      const items = boardSlugsFor(b);
      const shared = items.filter((s) => mentions.has(s)).length;
      let fit = items.length ? shared / Math.sqrt(items.length) : 0;
      if (!topic && (SEASONAL.test(b.slug) || b.category === "around-the-world")) fit *= 0.5;
      const spread = 1 / (1 + (used.get(b.slug) || 0) / 12);
      return { b, score: topic * 10 + fit * spread };
    })
    .filter((x) => x.score > 0.25)
    .sort((a, b) => b.score - a.score || a.b.slug.localeCompare(b.b.slug))
    .slice(0, max)
    .map((x) => x.b);
  // No clear fit: the least-linked everyday board, so every post offers a plan.
  if (!picked.length) {
    const everyday = boards.filter((b) => b !== exclude && /classic-budget-luxury|occasions-parties/.test(b.category));
    everyday.sort((a, b) => (used.get(a.slug) || 0) - (used.get(b.slug) || 0) || a.slug.localeCompare(b.slug));
    if (everyday[0]) picked.push(everyday[0]);
  }
  picked.forEach((b) => used.set(b.slug, (used.get(b.slug) || 0) + 1));
  return picked;
}

function pairAndPlate(pairLinks, boardLinks) {
  if (!pairLinks.length && !boardLinks.length) return "";
  const tile = (href, img, kicker, label, sub = "") => `<a class="pp-tile" href="${href}">
        ${img ? `<img src="${escapeHtml(thumb(img, "s"))}" alt="" width="72" height="54" loading="lazy" decoding="async">` : `<span class="pp-tile-art" aria-hidden="true"></span>`}
        <span><small>${escapeHtml(kicker)}</small><strong>${escapeHtml(label)}</strong>${sub ? `<em>${escapeHtml(sub)}</em>` : ""}</span>
      </a>`;
  const col = (title, more, items) => items.length ? `<div class="pp-col">
      <h3>${title}</h3>
      ${items.join("\n      ")}
      ${more}
    </div>` : "";
  return `<aside class="pair-plate" aria-label="Pairings and board plans">
    <p class="eyebrow">Pair it, plate it</p>
    <h2>What to pour and what to build</h2>
    <div class="pp-grid">
    ${col("Pairings", `<a class="pp-more" href="/pairings/">All pairings &rarr;</a>`, pairLinks.map((x) => tile(x.url, x.image, x.kicker, x.label)))}
    ${col("Board plans", `<a class="pp-more" href="/boards/">All board plans &rarr;</a>`, boardLinks.map((b) => tile(`/boards/${b.slug}/`, b.image, "Board plan", b.h1, [b.serves && `Serves ${b.serves}`, b.cost].filter(Boolean).join(" · "))))}
    </div>
  </aside>`;
}

function relatedReading(relatedPosts) {
  if (!relatedPosts.length) return "";

  return `<aside class="related-reading" aria-label="Related reading">
    <p class="eyebrow">Related Reading</p>
    <h2>Keep building the board</h2>
    <div class="related-grid">
      ${relatedPosts.map((related) => `<a class="related-card" href="/blog/${related.slug}/">
        <img src="${escapeHtml(thumb(related.image, "s"))}"${thumb(related.image, "s") !== related.image ? ` srcset="${thumb(related.image, "s")} 240w, ${thumb(related.image, "m")} 640w" sizes="(max-width: 560px) calc(100vw - 64px), 116px"` : ""} alt=""${imageSize(thumb(related.image, "s"))} loading="lazy" decoding="async">
        <span>${escapeHtml(related.title)}</span>
        <strong>Read next</strong>
      </a>`).join("\n")}
    </div>
  </aside>`;
}

// "In this article" list for long posts. Gives every article H2 an id (the
// funnel boxes are <aside>s and are skipped) and inserts a jump list after
// the quick answer. Only for posts with 4+ sections and 900+ words.
function addTableOfContents(html, words) {
  const items = [];
  const used = new Set();
  let asideDepth = 0;
  const parts = html.split(/(<\/?aside\b[^>]*>|<h2\b[^>]*>[\s\S]*?<\/h2>)/i);
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (/^<aside\b/i.test(p)) { asideDepth += 1; continue; }
    if (/^<\/aside>/i.test(p)) { asideDepth = Math.max(0, asideDepth - 1); continue; }
    const m = p.match(/^<h2\b([^>]*)>([\s\S]*?)<\/h2>$/i);
    if (!m || asideDepth > 0) continue;
    const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!text || /^(related reading|faq|frequently asked questions)$/i.test(text)) continue;
    let id = slugify(text).slice(0, 60) || `section-${items.length + 1}`;
    while (used.has(id)) id += "-2";
    used.add(id);
    parts[i] = /\bid=/.test(m[1]) ? p : `<h2 id="${id}"${m[1]}>${m[2]}</h2>`;
    items.push([id, text]);
  }
  const out = parts.join("");
  if (items.length < 4 || words < 900) return out;
  const nav = `<nav class="post-toc" aria-label="In this article">
  <details open><summary>In this article <span>${items.length} sections</span></summary>
  <ol>${items.map(([id, t]) => `<li><a href="#${id}">${escapeHtml(t)}</a></li>`).join("")}</ol>
  </details>
</nav>`;
  // After the quick answer if there is one, otherwise before the first section.
  const qa = out.match(/<blockquote>[\s\S]*?(Quick Answer|short answer)[\s\S]*?<\/blockquote>/i);
  if (qa && qa.index < out.search(/<h2\b/i)) return out.slice(0, qa.index + qa[0].length) + nav + out.slice(qa.index + qa[0].length);
  const h = out.search(/<h2\b/i);
  return h >= 0 ? out.slice(0, h) + nav + out.slice(h) : out;
}

function demoteBodyHeadings(html, title) {
  const plain = (v) => String(v).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  let out = html.replace(/^\s*<h1[^>]*>([\s\S]*?)<\/h1>\s*/i, (match, inner) =>
    plain(inner) === plain(title) ? "" : match
  );
  return out.replace(/<(\/?)h1\b([^>]*)>/gi, "<$1h2$2>");
}

// Set once per build, in build(): the book's 50 boards, the funnel blocks and
// the printables catalogue (scripts/funnel.mjs).
let BOOK_BOARDS = new Map();
let FUNNEL = null;
let PRINTABLES = null;
// Gumroad-first offers (scripts/offers.mjs): set in build(), injected into every page after it.
let OFFERS = null;
let OFFER_CTX = () => ({});

// Blog post body: the matched book card goes after the first section (the
// reader gets the answer first), the Board Builder promo moves to the middle,
// and the matched printable sits before the questions at the end.
function funnelPostBody(html, post, bookBoard) {
  const parts = html.split(/(?=<h2)/);
  const card = FUNNEL.bookCard(bookBoard, `post_card_${post.slug}`);
  // Middle slot: the free Cheat Sheet for an email. The Board Builder is still
  // offered in the "Lab next" block at the end of every post.
  const promo = FUNNEL.leadBox("post-lead", `cheat_post_${post.slug}`);
  const print = PRINTABLES.card(printableFor({ kind: "post", slug: post.slug, title: post.title }), `post_print_${post.slug}`);
  // parts[0] = intro, parts[1] = first section
  if (parts.length >= 3) parts.splice(2, 0, card);
  else parts.push(card);
  const h2s = parts.map((x, i) => (x.startsWith("<h2") ? i : -1)).filter((i) => i >= 0);
  if (h2s.length >= 4) parts.splice(h2s[3], 0, promo);
  else parts.push(promo);
  const faqIdx = parts.findIndex((x) => /^<h2[^>]*>\s*(common questions|faq|frequently asked|questions)/i.test(x));
  if (faqIdx > 0) parts.splice(faqIdx, 0, print);
  else parts.push(print);
  return parts.join("");
}

function postPage(post, relatedPosts = [], autolinkIndex = [], board = null, holiday = null, pairPlate = "") {
  const date = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${post.date}T00:00:00Z`));

  // The hero already prints the title as the page's H1. Markdown posts open
  // with "# Title" too, which put two H1s on 102 pages - visible to readers,
  // not just to crawlers. Drop a leading H1 that repeats the title, and demote
  // any others (50-charcuterie-board-ideas used H1 for all eleven sections).
  const bookBoard = bookBoardFor(post, BOOK_BOARDS, board);
  const postHtml = addTableOfContents(demoteBodyHeadings(
    funnelPostBody(autolinkIngredients(post.html, autolinkIndex, post.slug), post, bookBoard),
    post.title
  ), String(post.body || "").split(/\s+/).length);

  const description = metaDescription(post);

  return layout({
    title: pageTitle(post.seoTitle || post.title),
    description,
    canonical: `/blog/${post.slug}/`,
    image: post.image,
    type: "article",
    published: post.date,
    modified: post.updated || post.date,
    head: `${articleSchema(post, description)}\n${faqSchema(post)}\n${breadcrumbSchema([["Home", "/"], ["Blog", "/blog/"], [post.title, `/blog/${post.slug}/`]])}`,
    body: `<main class="post-main">
  <section class="post-hero">
    <div class="post-hero-inner">
      <p class="ing-crumb post-crumb"><a href="/blog/">Blog</a> <span aria-hidden="true">/</span> ${escapeHtml(post.title)}</p>
      <p class="post-date">${date} · ${byline()}${post.updated && post.updated !== post.date ? ` · Updated ${new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${post.updated}T00:00:00Z`))}` : ""}</p>
      <h1>${escapeHtml(post.title)}</h1>
    </div>
    ${heroImg(post.image, escapeHtml(post.title), "post-image")}
  </section>
  <!--offer-top-->
  ${holiday ? `<a class="bl-banner hol-post-link" href="/holidays/${holiday.slug}/"><span class="bl-banner-k">Planning ${escapeHtml(holiday.name)}?</span> <strong>See the ${escapeHtml(holiday.name)} hub</strong> <span>board ideas, shapes, a countdown plan and how much to buy &rarr;</span></a>` : ""}
  <article class="post-body">
    ${postHtml}
  </article>
  ${board ? `<aside class="post-cta bl-post-link"><p>Want the full plan? See the ${escapeHtml(board.h1)}: what to buy, why it works and a timeline, plus a one-tap shopping list for your guest count.</p><a class="button primary post-cta-button" href="/boards/${board.slug}/">See the board plan</a></aside>` : ""}
  ${pairPlate}
  ${relatedReading(relatedPosts)}
  ${labNext(`footer_${post.slug}`)}
  ${newsletterPanel("post-email", `blog_${post.slug}`)}
  ${FUNNEL.stickyBar(`sticky_${post.slug}`, bookBoard)}
</main>`
  });
}

function sitemap(posts, ingredients = [], boards = [], holidays = [], extra = []) {
  const ingredientCategories = CATEGORY_ORDER.filter((c) =>
    ingredients.some((i) => i.category === c)
  );
  const urls = [
    { loc: "/", priority: "1.0" },
    { loc: "/ebook/", priority: "0.9" },
    { loc: "/blog/", priority: "0.8" },
    ...(ingredients.length ? [{ loc: "/board-builder/", priority: "0.8" }] : []),
    { loc: "/shop/", priority: "0.8" },
    { loc: "/about/", priority: "0.5" },
    { loc: "/privacy/", priority: "0.2" },
    ...(boards.length ? [{ loc: "/boards/", priority: "0.9" }] : []),
    ...(boards.some((b) => b.book === "world") ? [{ loc: "/around-the-world/", priority: "0.9" }] : []),
    ...(holidays.length ? [{ loc: "/holidays/", priority: "0.9" }, ...holidays.map((x) => ({ loc: `/holidays/${x.slug}/`, priority: "0.9" }))] : []),
    ...BOARD_CATEGORIES.filter((c) => boards.some((b) => b.category === c.slug)).map((c) => ({
      loc: `/boards/${c.slug}/`,
      priority: "0.7"
    })),
    ...boards.map((b) => ({ loc: `/boards/${b.slug}/`, lastmod: b.updated, priority: "0.8" })),
    ...(ingredients.length ? [{ loc: "/ingredients/", priority: "0.8" }] : []),
    ...ingredientCategories.map((category) => ({
      loc: `/ingredients/${slugify(category)}/`,
      priority: "0.7"
    })),
    ...ingredients.map((item) => ({
      loc: `/ingredients/${item.slug}/`,
      lastmod: item.updated || item.date,
      priority: "0.6"
    })),
    ...posts.map((post) => ({
      loc: `/blog/${post.slug}/`,
      lastmod: post.updated || post.date,
      priority: "0.7"
    })),
    ...extra
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => `  <url>
    <loc>${siteUrl}${url.loc}</loc>
    <lastmod>${String(url.lastmod || BUILD_DATE).slice(0, 10)}</lastmod>
    <priority>${url.priority}</priority>
  </url>`)
  .join("\n")}
</urlset>
`;
}

async function loadRedirectSources() {
  const set = new Set();
  for (const file of [join(root, "..", "netlify.toml"), join(root, "netlify.toml")]) {
    try {
      const text = await readFile(file, "utf8");
      for (const m of text.matchAll(/^\s*from\s*=\s*"([^"]+)"/gm)) set.add(m[1]);
    } catch {}
  }
  return set;
}

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(join(dist, "assets"), { recursive: true });
  await cp(paths.public, dist, { recursive: true });
  await cp(paths.styles, join(dist, "assets", "site.css"));

  const [allPosts, allProducts, ingredients, boards, holidays, pairingData, dietData] = await Promise.all([
    loadPosts(),
    readFile(paths.products, "utf8").then(JSON.parse),
    loadIngredients(),
    loadBoards(root),
    loadHolidays(root),
    loadPairings(root),
    loadDietary(root)
  ]);
  const posts = allPosts.filter((post) => isPublishedPost(post));
  // A printable goes live on the site once its Gumroad URL is filled in.
  const products = allProducts.filter((p) => p.url);
  linkIndex.live = new Set(posts.map((post) => post.slug));
  linkIndex.redirects = await loadRedirectSources();
  try { linkIndex.merged = JSON.parse(await readFile(join(root, "content", "merged", "redirects.json"), "utf8")); } catch {}
  posts.forEach((post) => {
    post.html = markdownToHtml(post.body);
  });
  if (linkIndex.held.size) {
    const list = [...linkIndex.held].map(([slug, n]) => `${slug}${n > 1 ? ` x${n}` : ""}`).join(", ");
    console.log(`Blog links shown as plain text until their post is live (${linkIndex.held.size}): ${list}`);
  }

  BOOK_BOARDS = await loadBookBoards(root);
  FUNNEL = makeFunnel({ thumb, escapeHtml, ebookHref, ebookPrice, paperbackUrl, paperbackPrice, withTracking, newsletterUrl });
  PRINTABLES = makePrintables({ thumb, layout, escapeHtml, withTracking, absoluteUrl, jsonForScript, bookCard: FUNNEL.bookCard, sampleForm: FUNNEL.sampleForm, ebooks: [{ title: "50 Boards Built by Science", line: "50 complete boards for every occasion, each with a shopping list, a timed build and a swap for every ingredient.", cover: "/images/book-cover.jpg", price: ebookPrice, url: ebookUrl, page: "/ebook/", paperbackUrl, paperbackPrice }, ...(worldIsLive(WORLD_BOOK) && WORLD_BOOK.ebookUrl ? [{ title: "Around the World in 16 Boards", line: "16 international boards, from Bavaria to Korea to Peru, with shopping lists and prep countdowns.", cover: WORLD_BOOK.cover, price: WORLD_BOOK.ebookPrice, url: WORLD_BOOK.ebookUrl, page: "/around-the-world/", paperbackUrl: WORLD_BOOK.paperbackUrl, paperbackPrice: WORLD_BOOK.paperbackPrice }] : []), ...(TWO_BOOK.ebookUrl ? [{ title: "Boards for Two", line: "25 boards sized for two, from a first date to New Year's Eve, with shopping lists and a drink for every board.", cover: TWO_BOOK.cover, price: TWO_BOOK.ebookPrice, url: TWO_BOOK.ebookUrl, page: "/books/boards-for-two/", paperbackUrl: TWO_BOOK.paperbackUrl, paperbackPrice: TWO_BOOK.paperbackPrice }] : []), ...(KETO_BOOK.ebookUrl ? [{ title: "Keto & Low-Carb Boards", line: "20 keto boards at 4–9 g net carbs per serving, with full macros and shopping lists.", cover: KETO_BOOK.cover, price: KETO_BOOK.ebookPrice, url: KETO_BOOK.ebookUrl, page: "/books/keto-charcuterie-boards/", paperbackUrl: KETO_BOOK.paperbackUrl, paperbackPrice: KETO_BOOK.paperbackPrice }] : []), ...(PLANT_BOOK.ebookUrl ? [{ title: "15 Show-Stopping Plant-Based Boards", line: "15 boards with no meat and no dairy, each with a shopping list, a step-by-step build and the pairing science.", cover: PLANT_BOOK.cover, price: PLANT_BOOK.ebookPrice, url: PLANT_BOOK.ebookUrl, page: "/books/plant-based-charcuterie-boards/", paperbackUrl: PLANT_BOOK.paperbackUrl || PLANT_BOOK.kindleUrl, paperbackPrice: PLANT_BOOK.paperbackUrl ? PLANT_BOOK.paperbackPrice : PLANT_BOOK.kindlePrice, altLabel: PLANT_BOOK.paperbackUrl ? "" : "Kindle on Amazon" }] : [])] }, products);
  console.log(`Funnel: ${BOOK_BOARDS.size} book boards, ${products.length} printables`);

  // Board Library helpers: boards.mjs gets the site's shared page parts so
  // every board page promotes in the same order as the rest of the site.
  const boardHelpers = { authorRef, byline, longDate, thumb, imageSize, layout, escapeHtml, jsonForScript, absoluteUrl, bookBar, labNext, bookButtons, newsletterPanel, bookTitle, newsletterHref: (campaign) => withTracking(newsletterUrl, campaign), bookCard: FUNNEL.bookCard, stickyBar: FUNNEL.stickyBar, bookBoards: BOOK_BOARDS, printCard: (slug, campaign, opts) => PRINTABLES.card(slug, campaign, opts) };
  // blog post -> the board plan it overlaps (first board that lists it)
  const holidayForPost = new Map();
  holidays.forEach((x) => (x.blog || []).forEach((s) => holidayForPost.has(s) || holidayForPost.set(s, x)));
  const boardForPost = new Map();
  boards.forEach((b) => (b.blog || []).forEach((s) => boardForPost.has(s) || boardForPost.set(s, b)));
  OFFERS = makeOffers({ escapeHtml, thumb, withTracking }, allProducts, {
    main: { key: "book-main", title: "50 Boards Built by Science", price: ebookPrice, url: ebookUrl, image: "/images/book-cover.jpg", page: "/ebook/", hook: "50 complete boards for every occasion: a shopping list with amounts and prices, a timed build and a swap for every ingredient.", paperbackUrl, paperbackPrice },
    two: TWO_BOOK.ebookUrl ? { key: "book-two", title: "Boards for Two", price: TWO_BOOK.ebookPrice, url: TWO_BOOK.ebookUrl, image: TWO_BOOK.cover, page: "/books/boards-for-two/", hook: "25 boards sized for two, from a first date to New Year's Eve, each with a shopping list, a prep countdown and a drink to pour.", paperbackUrl: TWO_BOOK.paperbackUrl, paperbackPrice: TWO_BOOK.paperbackPrice } : null,
    keto: KETO_BOOK.ebookUrl ? { key: "book-keto", title: "Keto & Low-Carb Boards", price: KETO_BOOK.ebookPrice, url: KETO_BOOK.ebookUrl, image: KETO_BOOK.cover, page: "/books/keto-charcuterie-boards/", hook: "20 keto boards at 4–9 g net carbs per serving, each with full macros, a shopping list with the net carbs of every item and a step-by-step build.", paperbackUrl: KETO_BOOK.paperbackUrl, paperbackPrice: KETO_BOOK.paperbackPrice } : null,
    plant: PLANT_BOOK.ebookUrl ? { key: "book-plant", title: "15 Show-Stopping Plant-Based Boards", price: PLANT_BOOK.ebookPrice, url: PLANT_BOOK.ebookUrl, image: PLANT_BOOK.cover, page: "/books/plant-based-charcuterie-boards/", hook: "15 boards with no meat and no dairy, each with a shopping list, a step-by-step build and the pairing science behind it.", paperbackUrl: PLANT_BOOK.paperbackUrl || PLANT_BOOK.kindleUrl, paperbackPrice: PLANT_BOOK.paperbackUrl ? PLANT_BOOK.paperbackPrice : PLANT_BOOK.kindlePrice, altLabel: PLANT_BOOK.paperbackUrl ? "" : "Kindle" } : null,
    world: worldIsLive(WORLD_BOOK) && WORLD_BOOK.ebookUrl ? { key: "book-world", title: "Around the World in 16 Boards", price: WORLD_BOOK.ebookPrice, url: WORLD_BOOK.ebookUrl, image: WORLD_BOOK.cover, page: "/around-the-world/", hook: "16 international boards, from a Bavarian beer-hall spread to a Korean BBQ board, each with a shopping list, a prep countdown and the pairing science.", paperbackUrl: WORLD_BOOK.paperbackUrl || paperbackUrl, paperbackPrice: WORLD_BOOK.paperbackPrice || paperbackPrice } : null
  });
  {
    const ingCat = new Map(ingredients.map((i) => [i.slug, i.category]));
    const postBy = new Map(posts.map((p) => [p.slug, p]));
    const boardBy = new Map(boards.map((b) => [b.slug, b]));
    const bookOf = (b) => (b && b.book === "main" && /^B1-\d\d$/.test(b.number || "") ? BOOK_BOARDS.get(Number(b.number.slice(3))) || null : null);
    OFFER_CTX = (path) => {
      const [, sec, slug = "", sub = ""] = path.split("/");
      if (sec === "ingredients") return { category: ingCat.get(slug) || "" };
      if (sec === "blog" && postBy.has(slug)) { const p = postBy.get(slug); return { bookBoard: bookBoardFor(p, BOOK_BOARDS, boardForPost.get(slug) || null) }; }
      if (sec === "boards" && boardBy.has(slug)) return { bookBoard: bookOf(boardBy.get(slug)) };
      if (sec === "holidays" && HOLIDAY_BOOK_BOARD[slug]) return { bookBoard: BOOK_BOARDS.get(HOLIDAY_BOOK_BOARD[slug]) || null };
      if (sec === "pairings" && slug === "food" && sub) return { category: ingCat.get(sub) || "" };
      return {};
    };
  }
  // ingredient -> boards that use it
  const boardsUsing = new Map();
  boards.forEach((b) => boardSlugsFor(b).forEach((s) => boardsUsing.set(s, [...(boardsUsing.get(s) || []), b])));

  // Ebook landing pages (/books/...): Gumroad first, Amazon paperback second.
  const BOOK_PAGES = await (async () => {
    const rd = async (f) => JSON.parse(await readFile(join(root, "content", "books", f), "utf8"));
    const list = [
      { key: "main", path: "/ebook/", title: "50 Boards Built by Science", short: "50 Boards Built by Science", line: "50 complete boards for every occasion, each with a shopping list, a timed build and a swap for every ingredient.", cover: "/images/book-cover.jpg", ebookUrl, ebookPrice, paperbackUrl, paperbackPrice },
      ...(worldIsLive(WORLD_BOOK) ? [{ key: "world", path: "/around-the-world/", title: WORLD_BOOK.title, short: "Around the World in 16 Boards", line: "16 international boards, from a Bavarian beer-hall spread to a Korean BBQ board, with shopping lists and prep countdowns.", cover: WORLD_BOOK.cover, ebookUrl: WORLD_BOOK.ebookUrl, ebookPrice: WORLD_BOOK.ebookPrice, paperbackUrl: WORLD_BOOK.paperbackUrl, paperbackPrice: WORLD_BOOK.paperbackPrice }] : []),
      { key: "two", path: "/books/boards-for-two/", title: TWO_BOOK.title, short: "Boards for Two", line: "25 boards sized for two, from a first date to New Year's Eve, each with a drink to pour.", cover: TWO_BOOK.cover, ebookUrl: TWO_BOOK.ebookUrl, ebookPrice: TWO_BOOK.ebookPrice, paperbackUrl: TWO_BOOK.paperbackUrl, paperbackPrice: TWO_BOOK.paperbackPrice, pages: 136 },
      { key: "keto", path: "/books/keto-charcuterie-boards/", title: KETO_BOOK.title, short: "Keto & Low-Carb Boards", line: "20 keto boards at 4–9 g net carbs per serving, with full macros and net-carb shopping lists.", cover: KETO_BOOK.cover, ebookUrl: KETO_BOOK.ebookUrl, ebookPrice: KETO_BOOK.ebookPrice, paperbackUrl: KETO_BOOK.paperbackUrl, paperbackPrice: KETO_BOOK.paperbackPrice, pages: 112 },
      { key: "plant", path: "/books/plant-based-charcuterie-boards/", title: PLANT_BOOK.title, short: "15 Plant-Based Boards", line: "15 vegan boards with no meat and no dairy, each with a shopping list, a blueprint and the pairing science.", cover: PLANT_BOOK.cover, ebookUrl: PLANT_BOOK.ebookUrl, ebookPrice: PLANT_BOOK.ebookPrice, paperbackUrl: PLANT_BOOK.paperbackUrl, paperbackPrice: PLANT_BOOK.paperbackPrice, pages: 77 }
    ];
    const out = bookLandingPages({ layout, escapeHtml, withTracking, jsonForScript, absoluteUrl, authorRef }, { keto: await rd("keto.json"), two: await rd("boards-for-two.json"), plant: (await Promise.all((await readdir(join(root, "content", "boards"))).filter((f) => f.endsWith(".json")).map(async (f) => JSON.parse(await readFile(join(root, "content", "boards", f), "utf8"))))).filter((b) => b.book === "plant"), books: list });
    return out.filter((x) => !["/ebook/", "/around-the-world/"].includes(x.path));
  })();
  await writeFile(join(dist, "index.html"), homePage(posts, products, (holidays.length ? `<div class="bl-inner">${holidayBanner(boardHelpers, holidays)}</div>${countdownJs()}` : "") + (boards.some((b) => b.book === "world") ? worldBanner(boardHelpers) : "") + boardsStrip(boardHelpers, boards)));
  // Pairings Hub index: built before any page so ingredient and holiday pages
  // can link into it. Throws if the pairing data disagrees with itself.
  const pairIdx = pairingData && ingredients.length ? pairingsIndex(pairingData, ingredients, { blogSlugs: new Set(posts.map((p) => p.slug)) }) : null;
  // Dietary Hub index: also sets item.diets, which the Board Builder data
  // reads. Throws if any ingredient is missing a diet verdict.
  const dietIdx = dietData && ingredients.length ? dietaryIndex(dietData, ingredients, boards) : null;
  await writeFile(join(dist, "sitemap.xml"), sitemap(posts, ingredients, boards, holidays, [...pairingUrls(pairIdx), ...dietaryUrls(dietIdx), { loc: "/printables/", priority: "0.8" }, ...BOOK_PAGES.map((x) => ({ loc: x.path, priority: "0.9" })), { loc: "/party-planner/", priority: "0.9" }, ...PARTY_COUNTS.map((n) => ({ loc: partyUrl(n), priority: "0.8" })), ...products.map((p) => ({ loc: `/printables/${p.slug}/`, priority: "0.7" }))]));
  await mkdir(join(dist, "ebook"), { recursive: true });
  await writeFile(join(dist, "ebook", "index.html"), ebookPage());
  for (const bp of BOOK_PAGES) {
    await mkdir(join(dist, bp.path), { recursive: true });
    await writeFile(join(dist, bp.path, "index.html"), bp.html);
  }
  await mkdir(join(dist, "blog"), { recursive: true });
  await writeFile(join(dist, "blog", "index.html"), blogPage(posts));
  await mkdir(join(dist, "shop"), { recursive: true });
  await writeFile(join(dist, "shop", "index.html"), shopPage(products));
  await mkdir(join(dist, "printables"), { recursive: true });
  await writeFile(join(dist, "printables", "index.html"), PRINTABLES.landing(BOOK_BOARDS));
  for (const product of products) {
    await mkdir(join(dist, "printables", product.slug), { recursive: true });
    await writeFile(join(dist, "printables", product.slug, "index.html"), PRINTABLES.productPage(product));
  }
  await mkdir(join(dist, "privacy"), { recursive: true });
  await writeFile(join(dist, "privacy", "index.html"), privacyPage());
  await mkdir(join(dist, "thanks", "cheat-sheet"), { recursive: true });
  await writeFile(join(dist, "thanks", "cheat-sheet", "index.html"), cheatThanksPage());
  await mkdir(join(dist, "about"), { recursive: true });
  await writeFile(join(dist, "about", "index.html"), aboutPage({ posts: posts.length, ingredients: ingredients.length, boards: boards.length }));

  const autolinkIndex = buildAutolinkIndex(ingredients);
  const boardUse = new Map();
  const pairPlateFor = (post) => {
    const mentions = postMentionCounts(post, autolinkIndex);
    const text = String(post.html || "").replace(/<[^>]+>/g, " ");
    return pairAndPlate(
      postPairingLinks(pairIdx, { title: `${post.title} ${post.slug.replace(/-/g, " ")}`, text, mentions }, 4),
      boardsForPost(post, boards, mentions, boardForPost.get(post.slug) || null, boardUse, 2)
    );
  };

  // oldest post first, so the spread of board links doesn't depend on write order
  const plates = new Map([...posts].sort((a, b) => String(a.date).localeCompare(String(b.date)) || a.slug.localeCompare(b.slug)).map((p) => [p.slug, pairPlateFor(p)]));
  // Related Reading for every post. A post that few others list would have
  // almost no links in (grazing-vs-charcuterie had 1 with 830 impressions), so
  // each post is added as an extra card (up to 5 per list) to its closest
  // matches until 3 posts point at it.
  const relatedFor = new Map(posts.map((p) => [p.slug, selectRelatedPosts(p, posts)]));
  const listedBy = new Map(posts.map((p) => [p.slug, 0]));
  for (const list of relatedFor.values()) for (const r of list) listedBy.set(r.slug, (listedBy.get(r.slug) || 0) + 1);
  for (const post of [...posts].sort((a, b) => listedBy.get(a.slug) - listedBy.get(b.slug) || a.slug.localeCompare(b.slug))) {
    if (listedBy.get(post.slug) >= 3) continue;
    const terms = topicTerms(post);
    const hosts = posts
      .filter((h) => h.slug !== post.slug && !relatedFor.get(h.slug).some((r) => r.slug === post.slug) && relatedFor.get(h.slug).length < 5)
      .map((h) => {
        const ht = topicTerms(h);
        let score = 0;
        for (const t of terms) if (ht.has(t)) score += 1;
        score += post.tags.filter((t) => h.tags.includes(t)).length * 5;
        return { h, score };
      })
      .sort((a, b) => b.score - a.score || a.h.slug.localeCompare(b.h.slug));
    for (const { h } of hosts) {
      if (listedBy.get(post.slug) >= 3) break;
      relatedFor.get(h.slug).push(post);
      listedBy.set(post.slug, listedBy.get(post.slug) + 1);
    }
  }
  await Promise.all(
    posts.map(async (post) => {
      const dir = join(dist, "blog", post.slug);
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, "index.html"),
        postPage(post, relatedFor.get(post.slug), autolinkIndex, boardForPost.get(post.slug) || null, holidayForPost.get(post.slug) || null, plates.get(post.slug))
      );
    })
  );

  if (ingredients.length) {
    const bySlug = new Map(ingredients.map((item) => [item.slug, item]));
    const blogSlugs = new Set(posts.map((post) => post.slug));
    const mentions = ingredientMentions(posts, autolinkIndex);
    POSTS_BY_SLUG = new Map(posts.map((p) => [p.slug, p]));
    await mkdir(join(dist, "ingredients"), { recursive: true });
    await writeFile(join(dist, "ingredients", "index.html"), ingredientsHub(ingredients));

    const categories = CATEGORY_ORDER.filter((c) => ingredients.some((i) => i.category === c));
    await Promise.all(
      categories.map(async (category) => {
        const dir = join(dist, "ingredients", slugify(category));
        await mkdir(dir, { recursive: true });
        await writeFile(
          join(dir, "index.html"),
          ingredientCategoryPage(category, ingredients.filter((i) => i.category === category))
        );
      })
    );

    await Promise.all(
      ingredients.map(async (item) => {
        const dir = join(dist, "ingredients", item.slug);
        await mkdir(dir, { recursive: true });
        await writeFile(join(dir, "index.html"), ingredientPage(item, bySlug, blogSlugs, boardsUsing.get(item.slug) || [], ingredientPairingBlock({ escapeHtml }, pairIdx, item) + ingredientDietBlock({ escapeHtml }, dietIdx, item), mentions));
      })
    );

    // Board Builder: data + script + styles are separate files so the page
    // itself stays small and each part caches on its own content hash.
    const builder = boardBuilderData(ingredients, { categoryArt });
    const builderSrc = join(root, "src", "board-builder");
    const builderLogic = await readFile(join(builderSrc, "board-logic.js"), "utf8");
    const builderStyles = await readFile(join(builderSrc, "board-builder.css"), "utf8");
    const hash = (value) => createHash("sha1").update(value).digest("hex").slice(0, 12);
    // /assets/ is cached forever, so the page script imports the logic module
    // by its content hash too
    const builderScript = (await readFile(join(builderSrc, "board-builder.js"), "utf8"))
      .replace('from "./board-logic.js"', `from "./board-logic.js?v=${hash(builderLogic)}"`);
    await writeFile(join(dist, "assets", "board-builder-data.json"), builder.json);
    await writeFile(join(dist, "assets", "board-builder-prep.json"), builder.prepJson);
    await writeFile(join(dist, "assets", "board-logic.js"), builderLogic);
    await writeFile(join(dist, "assets", "board-builder.js"), builderScript);
    await writeFile(join(dist, "assets", "board-builder.css"), builderStyles);
    await mkdir(join(dist, "board-builder"), { recursive: true });
    await writeFile(
      join(dist, "board-builder", "index.html"),
      boardBuilderPage({
        layout,
        escapeHtml,
        bookBar,
        labNext,
        book: { ebookUrl: ebookHref("board_builder_results"), ebookPrice, paperbackUrl, paperbackPrice },
        newsletterUrl,
        itemCount: builder.stats.items,
        dataVersion: builder.version,
        prepVersion: builder.prepVersion,
        scriptVersion: hash(builderScript),
        styleVersion: hash(builderStyles)
      })
    );
    if (boards.length) {
      const { notes } = JSON.parse(builder.json);
      const blogTitles = new Map(posts.map((post) => [post.slug, post.title]));
      await mkdir(join(dist, "boards"), { recursive: true });
      await mkdir(join(dist, "images", "boards"), { recursive: true });
      for (const b of boards.filter((x) => x.placeholder)) {
        await writeFile(join(dist, "images", "boards", `${b.slug}.svg`), placeholderSvg(b));
      }
      await writeFile(join(dist, "boards", "index.html"), boardsHub(boardHelpers, boards));
      if (boards.some((b) => b.book === "world")) {
        await mkdir(join(dist, "around-the-world"), { recursive: true });
        await writeFile(join(dist, "around-the-world", "index.html"), worldBookPage(boardHelpers, boards));
      }
      for (const cat of BOARD_CATEGORIES) {
        const inCat = boards.filter((b) => b.category === cat.slug);
        if (!inCat.length) continue;
        await mkdir(join(dist, "boards", cat.slug), { recursive: true });
        await writeFile(join(dist, "boards", cat.slug, "index.html"), boardCategoryPage(boardHelpers, cat, inCat));
      }
      for (const b of boards) {
        await mkdir(join(dist, "boards", b.slug), { recursive: true });
        await writeFile(join(dist, "boards", b.slug, "index.html"), boardPage(boardHelpers, b, { all: boards, bySlug, notes, blogTitles }));
      }
      console.log(`Board Library: ${boards.length} published boards`);
    }
    {
      // Party Planner: /party-planner/ + one page per guest count
      const libraryByNumber = new Map(boards.filter((b) => b.book === "main" && /^B1-\d\d$/.test(b.number || "")).map((b) => [Number(b.number.slice(3)), b]));
      const partyH = { ...boardHelpers, newsletterUrl };
      await mkdir(join(dist, "party-planner"), { recursive: true });
      await writeFile(join(dist, "party-planner", "index.html"), partyHub(partyH, { bookBoards: BOOK_BOARDS }));
      for (const n of PARTY_COUNTS) {
        await mkdir(join(dist, partyUrl(n).slice(1)), { recursive: true });
        await writeFile(join(dist, partyUrl(n).slice(1), "index.html"), partyPage(partyH, n, { bookBoards: BOOK_BOARDS, libraryByNumber, known: bySlug, builderLink }));
      }
      console.log(`Party Planner: hub + ${PARTY_COUNTS.length} guest-count pages`);
    }
    if (holidays.length) {
      const boardsBySlug = new Map(boards.map((b) => [b.slug, b]));
      const ingTitles = new Map(ingredients.map((i) => [i.slug, i.title]));
      const blogTitles2 = new Map(posts.map((post) => [post.slug, post.title]));
      await mkdir(join(dist, "holidays"), { recursive: true });
      await writeFile(join(dist, "holidays", "index.html"), holidaysHub(boardHelpers, holidays));
      for (const hol of holidays) {
        await mkdir(join(dist, "holidays", hol.slug), { recursive: true });
        const pour = holidayPourBlock(boardHelpers, pairIdx, hol.slug);
        let holHtml = holidayPage(boardHelpers, hol, { boardsBySlug, known: ingTitles, blogTitles: blogTitles2, holidays });
        if (pour) {
          holHtml = holHtml
            .replace('<a href="#faq">Questions</a>', '<a href="#pour">What to pour</a><a href="#faq">Questions</a>')
            .replace('<section class="bl-section" id="faq"', `${pour}\n\n    <section class="bl-section" id="faq"`);
        }
        await writeFile(join(dist, "holidays", hol.slug, "index.html"), holHtml);
      }
      console.log(`Holiday Hub: ${holidays.length} holiday pages`);
    }
    if (pairIdx) {
      const pairSrc = join(root, "src", "pairings", "pairings.js");
      const pairScript = await readFile(pairSrc, "utf8");
      const pairJson = pairingsClientData(pairIdx, categoryArt, CATEGORY_ORDER);
      await writeFile(join(dist, "assets", "pairings.js"), pairScript);
      await writeFile(join(dist, "assets", "pairings-data.json"), pairJson);
      const pages = pairingPages(boardHelpers, pairIdx, {
        categoryArt,
        categories: CATEGORY_ORDER,
        boardsUsing,
        boardsBySlug: new Map(boards.map((b) => [b.slug, b])),
        scriptSrc: `/assets/pairings.js?v=${hash(pairScript)}`,
        dataSrc: `/assets/pairings-data.json?v=${hash(pairJson)}`,
        photos: new Set(await readdir(join(paths.public, "images", "pairings")).catch(() => []))
      });
      for (const pg of pages) {
        await mkdir(join(dist, dirname(pg.path)), { recursive: true });
        await writeFile(join(dist, pg.path), pg.html);
      }
      console.log(`Pairings Hub: ${pages.length} pages, ${pairIdx.drinks.length} drinks, ${pairIdx.foods.length} food guides, ${pairIdx.combos.length} combos, ${pairIdx.reasons.size} reasons`);
    }
    if (dietIdx) {
      const dietSrc = join(root, "src", "dietary", "dietary.js");
      const dietScript = await readFile(dietSrc, "utf8");
      const dietJson = dietaryClientData(dietIdx, CATEGORY_ORDER);
      await writeFile(join(dist, "assets", "dietary.js"), dietScript);
      await writeFile(join(dist, "assets", "dietary-data.json"), dietJson);
      const dietH = { ...boardHelpers, newsletterUrl };
      const pages = dietaryPages(dietH, dietIdx, {
        categories: CATEGORY_ORDER,
        scriptSrc: `/assets/dietary.js?v=${hash(dietScript)}`,
        dataSrc: `/assets/dietary-data.json?v=${hash(dietJson)}`
      });
      for (const pg of pages) {
        await mkdir(join(dist, dirname(pg.path)), { recursive: true });
        await writeFile(join(dist, pg.path), pg.html);
      }
      console.log(`Dietary Hub: ${pages.length} pages, ${dietIdx.total} ingredients x 5 diets`);
    }
    console.log(`Board builder: ${builder.stats.items} ingredients, ${builder.stats.notes} pairing notes, ${builder.stats.prep} prep guides`);
  }

  const feed = posts
    .map((post) => `- ${post.date} ${post.title} /blog/${post.slug}/`)
    .join("\n");
  await writeFile(join(dist, "blog-feed.txt"), `${feed}\n`);
}

// Site search. After everything is written, read every page's title,
// description and section from dist/ into one small JSON file that /search/
// filters in the browser. No server, no third-party search.
async function buildSearch() {
  const pages = [];
  const SECTION = { blog: "Article", ingredients: "Ingredient", boards: "Board", pairings: "Pairing", "party-planner": "Party Planner", holidays: "Holiday", printables: "Printable", "board-builder": "Tool", ebook: "Book", "around-the-world": "Book", shop: "Shop", about: "About" };
  async function walk(dir, rel) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (["assets", "images", "downloads", "search", "privacy", "thanks"].includes(e.name) && !rel) continue;
        await walk(join(dir, e.name), rel ? `${rel}/${e.name}` : e.name);
      } else if (e.name === "index.html" && rel) {
        const html = await readFile(join(dir, e.name), "utf8");
        const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
        const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "").replace(/<[^>]+>/g, "").trim();
        const d = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
        const top = rel.split("/")[0];
        const kind = SECTION[top] || "Page";
        const hub = !rel.includes("/");
        pages.push({ u: `/${rel}/`, t: (h1 || title).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'), d: d.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'), k: hub && top !== "board-builder" && top !== "about" && top !== "ebook" && top !== "shop" ? `${kind} hub` : kind });
      }
    }
  }
  await walk(dist, "");
  await writeFile(join(dist, "assets", "search-index.json"), JSON.stringify(pages));
  await writeFile(join(dist, "llms.txt"), llmsTxt(pages));
  await mkdir(join(dist, "search"), { recursive: true });
  await writeFile(join(dist, "search", "index.html"), searchPage(pages.length));
  return pages.length;
}

// llms.txt (llmstxt.org): a plain-text map of the site for AI assistants,
// with the house standards stated once so answers quote them correctly.
function llmsTxt(pages) {
  const by = (u) => pages.find((p) => p.u === u);
  const line = (u, note = "") => { const p = by(u); return p ? `- [${p.t}](${siteUrl}${u})${note || (p.d ? `: ${p.d}` : "")}` : ""; };
  const guides = ["/blog/how-much-charcuterie-per-person/", "/blog/how-to-make-charcuterie-board/", "/blog/what-goes-on-charcuterie-board/", "/blog/best-cheese-charcuterie-board/", "/blog/wine-and-charcuterie-board/", "/blog/best-meats-charcuterie-board/", "/blog/what-bread-for-charcuterie-board/", "/blog/build-sequence/", "/blog/temperature-guide/", "/blog/how-long-charcuterie-board-last/", "/blog/make-charcuterie-board-night-before/", "/blog/grazing-table/", "/blog/charcuterie-board-for-large-group/", "/blog/salami-vs-pepperoni/", "/blog/pairing-by-contrast/"];
  return [
    "# Charcuterie Lab",
    "",
    `> Charcuterie boards built on purpose: what to buy, how much, the order to build it in, and why the pairings work. Written by ${AUTHOR_NAME}, author of the Charcuterie Lab books, who also runs a local charcuterie catering business.`,
    "",
    "House standards used on every page:",
    "- Amounts per guest, meat and cheese each: 2 oz before a meal, 3 oz when the board is the party food, 4 oz when it is dinner. Add 10% from 20 guests up.",
    "- Take cheese out before serving: aged hard 45-60 min, semi-firm 30-45 min, soft (brie, camembert) 20-30 min, fresh 15-20 min; cured meats about 20 min.",
    "- Food safety: perishable food out no more than 2 hours, 1 hour above 90°F (USDA).",
    "",
    "## Tools",
    line("/party-planner/"), line("/board-builder/"), line("/pairings/"), `- [Site search](${siteUrl}/search/): search every article, ingredient, board and pairing`,
    "",
    "## Core guides",
    ...guides.map((u) => line(u)).filter(Boolean),
    "",
    "## Sections",
    line("/ingredients/"), line("/boards/"), line("/holidays/"), line("/blog/"), line("/printables/"),
    "",
    "## Books",
    line("/books/"), line("/ebook/"), line("/around-the-world/"), line("/books/keto-charcuterie-boards/"), line("/books/boards-for-two/"), line("/books/plant-based-charcuterie-boards/"),
    "",
    "## About",
    line("/about/"),
    ""
  ].filter((x) => x !== undefined).join("\n");
}

// Where beehiiv sends a reader after the cheat sheet signup (set in the
// beehiiv form's Settings > Redirect to an external website). Not indexed.
function cheatThanksPage() {
  return layout({
    title: "Your Cheat Sheet Is Ready | Charcuterie Lab",
    canonical: CHEAT_THANKS,
    description: "Download the free Charcuterie Cheat Sheet: how much to buy for 4 to 50 guests, the build order, fridge timing and four pairing rules.",
    head: `  <meta name="robots" content="noindex, follow">`,
    body: `<main class="ebook-page thanks-page">
  <section class="ebook-section">
    <div class="ebook-section-inner thanks-inner">
      <p class="section-kicker">You're in</p>
      <h1>Your cheat sheet is ready</h1>
      <div class="thanks-download">
        <img src="/images/charcuterie-cheat-sheet.webp" alt="Page 1 of the Charcuterie Cheat Sheet" width="480" height="621" decoding="async">
        <div>
          <p>Two printable pages: how much meat, cheese and crackers for 4 to 50 guests, the 7-step build order, when to take each cheese out of the fridge, and four pairing rules.</p>
          <p><a class="button primary" href="${CHEAT_PDF}" download>Download the cheat sheet (PDF)</a></p>
          <p class="thanks-note">A copy is on its way to your inbox too, with the first Lab Report. If it isn't there in a few minutes, check Promotions or Spam and drag it to your inbox so the next one lands.</p>
        </div>
      </div>
      <h2>Next: one board, fully planned</h2>
      <p>The cheat sheet tells you how much. The book tells you exactly what: 50 boards, each with a shopping list, a timed build, placement steps and a swap for every ingredient. That's 28&cent; a board.</p>
      ${bookButtons("thanks_cheat")}
      <p class="thanks-note">Not sure yet? <a href="${SAMPLE_PDF}">Read board 01 free</a>, or plan your party with the <a href="/party-planner/">Party Planner</a>.</p>
    </div>
  </section>
</main>`
  });
}

function searchPage(count) {
  return layout({
    title: "Search Charcuterie Lab",
    canonical: "/search/",
    description: "Search every Charcuterie Lab article, ingredient, board, pairing and printable.",
    head: `  <meta name="robots" content="noindex, follow">`,
    body: `<main class="search-main">
  <section class="search-hero">
    <p class="section-kicker">Search</p>
    <h1>Find a board, ingredient or answer</h1>
    <form class="search-form" role="search" action="/search/" method="get" data-search-form>
      <label class="sr-only" for="q">Search the site</label>
      <input id="q" name="q" type="search" placeholder="Try brie, 20 people, prosciutto, wine&hellip;" autocomplete="off" autofocus>
      <button class="button primary" type="submit">Search</button>
    </form>
    <p class="search-count" data-search-count>${count} pages: articles, ingredients, boards, pairings and printables.</p>
  </section>
  <ol class="search-results" data-search-results></ol>
</main>
<script>
(function(){
  var input=document.getElementById("q"),list=document.querySelector("[data-search-results]"),count=document.querySelector("[data-search-count]"),data=null;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function norm(s){return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
  function run(){
    var q=norm(input.value.trim());
    if(!data||!q){list.innerHTML="";return}
    var words=q.split(/\\s+/).filter(Boolean),out=[];
    data.forEach(function(p){
      var t=norm(p.t),d=norm(p.d),score=0,ok=true;
      words.forEach(function(w){var wt=t.indexOf(w),wd=d.indexOf(w);if(wt<0&&wd<0){ok=false;return}score+=(wt>=0?10:0)+(wd>=0?2:0)+(wt===0?5:0)});
      if(!ok)return;
      if(/hub$/.test(p.k))score+=4;if(p.k==="Party Planner"||p.k==="Board")score+=2;
      out.push([score,p]);
    });
    out.sort(function(a,b){return b[0]-a[0]});
    count.textContent=out.length?out.length+" result"+(out.length===1?"":"s")+" for \u201c"+input.value.trim()+"\u201d":"No results for \u201c"+input.value.trim()+"\u201d. Try a single ingredient or a guest count.";
    list.innerHTML=out.slice(0,40).map(function(r){var p=r[1];return '<li><a href="'+p.u+'"><span class="search-kind">'+esc(p.k)+'</span><strong>'+esc(p.t)+'</strong><span>'+esc(p.d)+'</span></a></li>'}).join("");
  }
  try{var q0=new URLSearchParams(location.search).get("q");if(q0)input.value=q0}catch(e){}
  fetch("/assets/search-index.json").then(function(r){return r.json()}).then(function(j){data=j;run()});
  input.addEventListener("input",function(){run();try{history.replaceState(null,"","/search/"+(input.value.trim()?"?q="+encodeURIComponent(input.value.trim()):""))}catch(e){}});
  document.querySelector("[data-search-form]").addEventListener("submit",function(e){e.preventDefault();run()});
})();
</script>`
  });
}

await build();
{ const r = await OFFERS.inject(dist, OFFER_CTX); console.log(`Offers: ${r.n} pages, ${Object.entries(r.counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", ")}`); }
console.log(`Search index: ${await buildSearch()} pages`);
if (missingThumbs.size) console.log(`Images with no thumbnail yet (${missingThumbs.size}), run: py scripts/make-thumbs.py -> ${[...missingThumbs].slice(0, 8).join(", ")}${missingThumbs.size > 8 ? " ..." : ""}`);
console.log("Built Charcuterie Lab into dist/");
