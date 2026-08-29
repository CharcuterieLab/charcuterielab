import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const siteUrl = "https://charcuterielab.com";
const publishTimeZone = "America/Chicago";
// The paperback is the promoted product. The Gumroad PDF still exists and is
// still buyable, it just is not advertised on the site any more.
const bookUrl = "https://www.amazon.com/dp/B0H2Y39R41";
const bookTitle = "Charcuterie Lab: 50 Boards Built by Science";
const ebookUrl = "https://charcuterieflavor.gumroad.com/l/tabajj";
const ebookPageUrl = "/ebook/";
const ebookPrice = "$14.99";
const newsletterUrl = "https://charcuterie-lab-report.beehiiv.com/subscribe";
const assetVersion = "20260505-compact-card-grids";

// Statcounter. Both values come from your project's Install Code page. They
// are not secrets - they appear in the page source of every site that uses
// Statcounter - so they belong in the repo. Leave them blank and no tracking
// code is emitted at all, which keeps local builds and previews clean.
const statcounterProject = "13352476";
const statcounterSecurity = "37c3f389";

const paths = {
  blog: join(root, "content", "blog"),
  products: join(root, "src", "data", "products.json"),
  public: join(root, "public"),
  styles: join(root, "src", "styles", "site.css")
};

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
    dateModified: post.date,
    author: { "@type": "Organization", name: "Charcuterie Lab", url: siteUrl },
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

function markdownToHtml(markdown) {
  const lines = markdown.trim().split(/\r?\n/);
  const html = [];
  let i = 0;

  const normalizeLink = (href = "") => {
    const match = href.match(/^https:\/\/charcuterielab\.com\/([^?#]*)/i);
    if (!match) return href;

    const path = match[1].replace(/^\/+|\/+$/g, "");
    if (!path || path.startsWith("blog/") || path.startsWith("ebook") || path.startsWith("images/")) {
      return href;
    }
    return href.replace(/^https:\/\/charcuterielab\.com\/?/i, "https://charcuterielab.com/blog/");
  };

  const inline = (value = "") =>
    escapeHtml(value)
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, (_, text, href) => `<a href="${normalizeLink(href)}" target="_blank" rel="noopener">${text}</a>`)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  const isBlockStart = (line = "") =>
    /^(#{1,3}\s|-\s|>\s|\|.+\||---+$)/.test(line.trim()) || /^!\[.*?\]\(.+?\)$/.test(line.trim());

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
      html.push(`<img class="post-inline-image" src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}">`);
      i += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(`<li>${inline(lines[i].trim().slice(2))}</li>`);
        i += 1;
      }
      html.push(`<ul>\n${items.join("\n")}\n</ul>`);
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
        date: data.date ?? "2026-01-01",
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
  <meta name="description" content="${escapeHtml(description)}">
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
        <a href="/ebook/">The Book</a>
        <a href="/blog/">Blog</a>
        <a href="/#shop">Shop</a>
        <a href="/#newsletter">Newsletter</a>
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
        <a href="/blog/">Blog</a>
        <a href="/ebook/">The Book</a>
        <a href="/privacy/">Privacy</a>
      </div>
      <div class="copyright">© 2026 Charcuterie Lab. All rights reserved.</div>
    </div>
  </footer>
${statcounterTag()}
</body>
</html>`;
}

function homePage(posts, products) {
  const featuredPosts = posts.slice(0, 3);
  const heroBookUrl = `${ebookPageUrl}?utm_source=charcuterielab&utm_medium=site&utm_campaign=home_hero`;
  return layout({
    title: "Charcuterie Lab | Boards Built by Science",
    canonical: "/",
    head: siteSchema(),
    description: "Charcuterie Lab: 50 board blueprints built by science — shopping lists, pairing logic and build order, in a full-colour paperback. Plus daily pairing science on the blog.",
    body: `<main>
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <p class="hero-kicker">The Book</p>
        <h1>50 Charcuterie Boards, Built by Science</h1>
        <p>A full-colour paperback with shopping lists, pairing logic, substitutions, and a build order for every board — so you can repeat them, not just admire them.</p>
        <div class="hero-points" aria-label="What is included">
          <span>50 board plans</span>
          <span>Shopping lists</span>
          <span>Pairing science</span>
        </div>
        <div class="hero-offer">
          <strong>Paperback · 259 pages · full colour</strong>
          <span>On Amazon, printed and shipped by them.</span>
        </div>
        <div class="actions">
          <a class="button primary" href="${heroBookUrl}">See the Book</a>
          <a class="button secondary" href="${bookUrl}" target="_blank" rel="noopener">Buy on Amazon</a>
        </div>
      </div>
      <div class="hero-art" aria-label="Charcuterie Lab book">
        <div class="book-tilt">
          <div class="book-object book-mockup">
            <img class="book" src="/images/book-3d-mockup.png" alt="Charcuterie Lab paperback book mockup">
          </div>
        </div>
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
      <p class="section-kicker">Printables Shop</p>
      <h2 class="section-title">Enhance Your Boards</h2>
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

function ebookPage() {
  const buy = (label) =>
    `<a class="button primary ebook-primary" href="${bookUrl}" target="_blank" rel="noopener">${label}</a>`;

  return layout({
    title: "Charcuterie Lab | 50 Boards Built by Science",
    canonical: "/ebook/",
    image: "/images/book-cover.jpg",
    description: "Charcuterie Lab: 50 complete board blueprints with shopping lists, pairing logic, substitutions and build notes. A full-colour paperback, 259 pages, on Amazon.",
    body: `<main class="ebook-page">
  <section class="ebook-hero">
    <div class="ebook-hero-inner">
      <p class="ebook-kicker">The Book</p>
      <h1>Build charcuterie boards that look beautiful because they make sense.</h1>
      <p>Charcuterie Lab gives you 50 complete board blueprints with shopping lists, pairing logic, substitutions, and step-by-step build notes so you can host with confidence instead of guessing.</p>
      <div class="ebook-hero-actions">
        ${buy("Buy on Amazon")}
        <span>Paperback. Printed and shipped by Amazon.</span>
      </div>
      <div class="ebook-metrics" aria-label="Book highlights">
        <span><strong>50</strong> board plans</span>
        <span><strong>259</strong> pages</span>
        <span><strong>8.5&Prime;&times;11&Prime;</strong> full colour</span>
      </div>
      <div class="ebook-hero-product">
        <img src="/images/book-3d-mockup.webp" alt="${bookTitle} paperback">
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

  <section class="ebook-section ebook-samples">
    <div class="ebook-section-inner">
      <p class="section-kicker">Sample Boards Inside</p>
      <h2>Real boards you can shop for, build, and serve.</h2>
      <p>Each blueprint gives you the ingredients, pairing logic, substitutions, and build notes that turn a grocery list into a board that feels intentional.</p>
      <div class="ebook-sample-grid">
        <article>
          <span>Board 01</span>
          <h3>The Classic American Starter</h3>
          <p>A reliable crowd-pleaser with cheddar, salami, grapes, pickles, crackers, mustard, and honey arranged around salty, sweet, sharp, and crunchy contrasts.</p>
        </article>
        <article>
          <span>Board 13</span>
          <h3>The $25 Budget Board</h3>
          <p>Designed to look generous without overspending, using smart store-bought choices, repeat ingredients, and one or two visual anchors.</p>
        </article>
        <article>
          <span>Board 28</span>
          <h3>The Wine Night Board</h3>
          <p>Built around cheese textures, cured meat salt, fruit acidity, and briny accents so each bite supports the glass instead of fighting it.</p>
        </article>
        <article>
          <span>Board 42</span>
          <h3>The Holiday Hosting Board</h3>
          <p>A fuller, celebration-style board with warm colors, richer cheeses, seasonal fruit, nuts, spreads, and easy substitutions for different guest lists.</p>
        </article>
        <article>
          <span>Board 07</span>
          <h3>The Brunch Board</h3>
          <p>A morning-friendly spread with soft cheese, fruit, pastry crunch, jam, prosciutto, and bright accents that feel special without heavy prep.</p>
        </article>
        <article>
          <span>Board 21</span>
          <h3>The Game Day Board</h3>
          <p>Bold, snackable, and easy to graze from, with spicy salami, sturdy cheeses, pickles, crunchy crackers, and dips that hold up for a crowd.</p>
        </article>
        <article>
          <span>Board 35</span>
          <h3>The Mediterranean Board</h3>
          <p>Feta, olives, hummus, roasted peppers, cucumbers, pita, herbs, and cured meats arranged around salty, creamy, fresh, and acidic balance.</p>
        </article>
        <article>
          <span>Board 48</span>
          <h3>The Dessert Cheese Board</h3>
          <p>A sweeter finish with brie, blue cheese, chocolate, dried fruit, honey, nuts, and crisp cookies that still follows real pairing logic.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="ebook-section ebook-preview">
    <div class="ebook-section-inner ebook-two-col">
      <img src="/images/book-3d-mockup.webp" alt="${bookTitle} paperback">
      <div>
        <p class="section-kicker">Why Print</p>
        <h2>It opens flat on the counter and stays there.</h2>
        <p>At 8.5 by 11 inches it lies open while your hands are busy, and the boards are printed large enough to actually read the layout. No phone locking itself mid-build, no pinching to zoom a PDF with cheese on your fingers.</p>
        ${buy("Buy on Amazon")}
      </div>
    </div>
  </section>

  <section class="ebook-section ebook-faq">
    <div class="ebook-section-inner">
      <p class="section-kicker">Questions</p>
      <h2>Before you buy</h2>
      <div class="ebook-faq-list">
        <details open>
          <summary>Is this a physical book?</summary>
          <p>Yes — a full-colour paperback, 259 pages, printed and shipped by Amazon. Payment, delivery and returns are all handled on their side.</p>
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
          <summary>Is there a digital version?</summary>
          <p>There is a PDF edition on <a href="${ebookUrl}" target="_blank" rel="noopener">Gumroad</a>. The paperback is the edition we recommend.</p>
        </details>
      </div>
    </div>
  </section>

  <section class="ebook-final-cta">
    <div>
      <p class="ebook-kicker">Charcuterie Lab</p>
      <h2>Start building better boards today.</h2>
      <p>Fifty boards, every one of them explained — so your next board is planned, balanced, and repeatable.</p>
      ${buy("Buy on Amazon")}
    </div>
  </section>
</main>`
  });
}

function articleCard(post) {
  return `<article class="card">
  <a href="/blog/${post.slug}/"><img class="blog-preview-image" src="${post.image}" alt=""></a>
  <h3><a href="/blog/${post.slug}/">${escapeHtml(post.title)}</a></h3>
  <p>${escapeHtml(clampText(metaDescription(post), 155))}</p>
</article>`;
}

function productCard(product) {
  const trackedUrl = withTracking(product.url, "home_shop");
  return `<article class="card product">
  <a href="${trackedUrl}" target="_blank" rel="noopener"><img src="${product.image}" alt=""></a>
  <h3><a href="${trackedUrl}" target="_blank" rel="noopener">${escapeHtml(product.title)}</a></h3>
  <p>${escapeHtml(product.description)}</p>
  <span class="price">${escapeHtml(product.price)}</span>
  <a class="button product-button" href="${trackedUrl}" target="_blank" rel="noopener">View on Gumroad</a>
</article>`;
}

function postInlinePromo(post) {
  return `<aside class="post-inline-promo" aria-label="The Charcuterie Lab book">
    <p class="eyebrow">Want the full board plan?</p>
    <h2>Turn this idea into a shopping list and build sequence.</h2>
    <p>The Charcuterie Lab book has 50 complete board blueprints — exact ingredients, pairing logic, substitutions, and the order to build them in.</p>
    <a class="button primary" href="${ebookPageUrl}?utm_source=charcuterielab&utm_medium=blog&utm_campaign=inline_${post.slug}">See the Book</a>
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
        <p>Some links lead to Amazon, where the book is sold, and to Gumroad, where the printables are sold. Purchases happen entirely on those sites under their own privacy policies and payment handling — no payment details ever reach this site, because there is nothing here to pay for. Links may carry a tracking tag so I can tell which article sent someone; that tag identifies the article, not you.</p>

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
    </div>
  </section>
  <section class="section">
    <div class="section-inner">
      <div class="grid three blog-preview-grid archive-grid">
        ${posts.map((post) => articleCard(post)).join("\n")}
      </div>
    </div>
  </section>
</main>`
  });
}

function relatedReading(relatedPosts) {
  if (!relatedPosts.length) return "";

  return `<aside class="related-reading" aria-label="Related reading">
    <p class="eyebrow">Related Reading</p>
    <h2>Keep building the board</h2>
    <div class="related-grid">
      ${relatedPosts.map((related) => `<a class="related-card" href="/blog/${related.slug}/">
        <img src="${escapeHtml(related.image)}" alt="">
        <span>${escapeHtml(related.title)}</span>
        <strong>Read next</strong>
      </a>`).join("\n")}
    </div>
  </aside>`;
}

function postPage(post, relatedPosts = []) {
  const date = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${post.date}T00:00:00Z`));

  const postHtml = addInlinePromo(post.html, post);

  const description = metaDescription(post);

  return layout({
    title: `${post.title} | Charcuterie Lab`,
    description,
    canonical: `/blog/${post.slug}/`,
    image: post.image,
    type: "article",
    published: post.date,
    modified: post.date,
    head: `${articleSchema(post, description)}\n${faqSchema(post)}`,
    body: `<main class="post-main">
  <section class="post-hero">
    <div class="post-hero-inner">
      <p class="post-date">${date}</p>
      <h1>${escapeHtml(post.title)}</h1>
    </div>
    <img class="post-image" src="${post.image}" alt="">
  </section>
  <aside class="post-top-promo" aria-label="The Charcuterie Lab book">
    <div>
      <p class="eyebrow">The Charcuterie Lab Book</p>
      <p>All 50 boards in one full-colour paperback — shopping lists, pairing logic, substitutions and build notes.</p>
    </div>
    <a class="button primary" href="${ebookPageUrl}?utm_source=charcuterielab&utm_medium=blog&utm_campaign=top_${post.slug}">See the Book</a>
  </aside>
  <article class="post-body">
    ${postHtml}
  </article>
  ${relatedReading(relatedPosts)}
  <section class="post-footer-promo" aria-label="Charcuterie Lab book and newsletter">
    <div class="post-promo-panel post-promo-book">
      <p class="eyebrow">The Book</p>
      <h2>Build 50 better boards</h2>
      <p>Charcuterie Lab collects all 50 boards with complete plans, shopping lists, pairing science and substitutions. Paperback, on Amazon.</p>
      <a class="button primary" href="${ebookPageUrl}?utm_source=charcuterielab&utm_medium=blog&utm_campaign=footer_${post.slug}">See the Book</a>
    </div>
    <div class="post-promo-panel post-promo-newsletter">
      <p class="eyebrow">Daily Lab Report</p>
      <h2>Get the next pairing idea in your inbox</h2>
      <p>One pairing that works and why, a board worth stealing, and new printables the day they land.</p>
      <form class="newsletter-form" action="${newsletterUrl}" method="get" target="_blank" rel="noopener">
        <label class="sr-only" for="post-email">Email address</label>
        <input id="post-email" name="email" type="email" autocomplete="email" placeholder="Email address" required>
        <button class="button secondary" type="submit">Subscribe</button>
      </form>
    </div>
  </section>
</main>`
  });
}

function sitemap(posts) {
  const urls = [
    { loc: "/", priority: "1.0" },
    { loc: "/ebook/", priority: "0.9" },
    { loc: "/blog/", priority: "0.8" },
    { loc: "/privacy/", priority: "0.2" },
    ...posts.map((post) => ({
      loc: `/blog/${post.slug}/`,
      lastmod: post.date,
      priority: "0.7"
    }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => `  <url>
    <loc>${siteUrl}${url.loc}</loc>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ""}
    <priority>${url.priority}</priority>
  </url>`)
  .join("\n")}
</urlset>
`;
}

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(join(dist, "assets"), { recursive: true });
  await cp(paths.public, dist, { recursive: true });
  await cp(paths.styles, join(dist, "assets", "site.css"));

  const [allPosts, products] = await Promise.all([
    loadPosts(),
    readFile(paths.products, "utf8").then(JSON.parse)
  ]);
  const posts = allPosts.filter((post) => isPublishedPost(post));
  posts.forEach((post) => {
    post.html = markdownToHtml(post.body);
  });

  await writeFile(join(dist, "index.html"), homePage(posts, products));
  await writeFile(join(dist, "sitemap.xml"), sitemap(posts));
  await mkdir(join(dist, "ebook"), { recursive: true });
  await writeFile(join(dist, "ebook", "index.html"), ebookPage());
  await mkdir(join(dist, "blog"), { recursive: true });
  await writeFile(join(dist, "blog", "index.html"), blogPage(posts));
  await mkdir(join(dist, "privacy"), { recursive: true });
  await writeFile(join(dist, "privacy", "index.html"), privacyPage());

  await Promise.all(
    posts.map(async (post) => {
      const dir = join(dist, "blog", post.slug);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, "index.html"), postPage(post, selectRelatedPosts(post, posts)));
    })
  );

  const feed = posts
    .map((post) => `- ${post.date} ${post.title} /blog/${post.slug}/`)
    .join("\n");
  await writeFile(join(dist, "blog-feed.txt"), `${feed}\n`);
}

await build();
console.log("Built Charcuterie Lab into dist/");
