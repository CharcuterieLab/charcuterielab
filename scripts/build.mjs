import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const assetVersion = "20260505-compact-card-grids";
const siteRoot = join(root, "charcuterielab");

const paths = {
  blog: [join(root, "content", "blog"), join(siteRoot, "content", "blog")],
  ingredients: [join(root, "content", "ingredients"), join(siteRoot, "content", "ingredients")],
  products: join(siteRoot, "src", "data", "products.json"),
  public: [join(siteRoot, "public"), join(root, "public")],
  styles: join(siteRoot, "src", "styles", "site.css")
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function inlineMarkdown(value = "") {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // images first — ![alt](src) contains [alt](src), so the link rule below
    // would otherwise swallow it and leave a stray "!" in the output
    .replace(
      /!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g,
      (_match, alt, src) =>
        `<img class="body-image" src="${src}" alt="${alt}" loading="lazy" decoding="async">`
    )
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g,
      (_match, label, href) => `<a href="${href}">${label}</a>`
    );
}

const slugFromFile = (file) => file.replace(/\.md$/i, "");

function todayUtcDate() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isPublishedPost(post, today = todayUtcDate()) {
  return /^\d{4}-\d{2}-\d{2}$/.test(post.date) && post.date <= today;
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

function parseMarkdown(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const data = {};
  let body = source;

  if (match) {
    body = match[2];
    for (const line of match[1].split("\n")) {
      const pair = line.match(/^([A-Za-z0-9_-]+):\s*"?(.+?)"?$/);
      if (pair) data[pair[1]] = pair[2];
    }
  }

  return { data, body };
}

function markdownToHtml(markdown) {
  const blocks = markdown.trim().split(/\n{2,}/);

  return blocks
    .map((block) => {
      const trimmed = block.trim();
      const lines = trimmed.split("\n");

      const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = Math.min(6, heading[1].length + 1);
        return `<h${level}>${inlineMarkdown(heading[2])}</h${level}>`;
      }

      if (lines.length >= 2 && lines[0].trim().startsWith("|") && lines[1].includes("---")) {
        const rows = lines
          .filter((line) => line.trim().startsWith("|"))
          .map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
        const [header, _divider, ...bodyRows] = rows;
        return `<table>
  <thead><tr>${header.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead>
  <tbody>
${bodyRows.map((row) => `    <tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("\n")}
  </tbody>
</table>`;
      }

      if (lines.every((line) => /^-\s+/.test(line.trim()))) {
        return `<ul>
${lines.map((line) => `  <li>${inlineMarkdown(line.trim().replace(/^-\s+/, ""))}</li>`).join("\n")}
</ul>`;
      }

      if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
        return `<ol>
${lines.map((line) => `  <li>${inlineMarkdown(line.trim().replace(/^\d+\.\s+/, ""))}</li>`).join("\n")}
</ol>`;
      }

      if (trimmed.startsWith(">")) {
        return `<blockquote>${inlineMarkdown(trimmed.replace(/^>\s?/, ""))}</blockquote>`;
      }

      return `<p>${lines.map((line) => inlineMarkdown(line.trim())).join("<br>")}</p>`;
    })
    .join("\n");
}

async function loadPosts() {
  const sourceByFile = new Map();
  for (const blogPath of paths.blog) {
    const files = (await readdir(blogPath)).filter((file) => file.endsWith(".md"));
    for (const file of files) {
      sourceByFile.set(file, blogPath);
    }
  }

  const posts = await Promise.all(
    [...sourceByFile.entries()].map(async ([file, blogPath]) => {
      const { data, body } = parseMarkdown(await readFile(join(blogPath, file), "utf8"));
      return {
        slug: slugFromFile(file),
        title: data.title ?? "Untitled Post",
        date: data.date ?? "2026-01-01",
        image: data.image ?? "/images/layout-reference.jpg",
        excerpt: data.excerpt ?? "",
        faq: parseFaqField(data.faq),
        html: markdownToHtml(body)
      };
    })
  );

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

// ---------------------------------------------------------------------------
// Ingredients section
// ---------------------------------------------------------------------------

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

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// frontmatter arrays arrive as the literal string '["a", "b"]'
function parseListField(value = "") {
  const cleaned = String(value).trim();
  if (!cleaned) return [];
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    try {
      const parsed = JSON.parse(cleaned.replace(/'/g, '"'));
      if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
    } catch {
      // fall through
    }
    return cleaned
      .slice(1, -1)
      .split(",")
      .map((v) => v.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return cleaned.split(",").map((v) => v.trim()).filter(Boolean);
}

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

async function loadIngredients() {
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
      return {
        slug: slugFromFile(file),
        title: data.title ?? "Untitled",
        category: data.category ?? "Other",
        categorySlug: slugify(data.category ?? "Other"),
        boardRole: data.board_role ?? "",
        roleGroup: data.role_group ?? "",
        excerpt: data.excerpt ?? "",
        priceTier: data.price_tier ?? "",
        serving: data.serving_per_person ?? "",
        prepTime: data.prep_time ?? "",
        allergens,
        freeFrom: freeFromFor(allergens),
        tags: parseListField(data.tags),
        pairsWith: parseListField(data.pairs_with),
        boardPost: data.board_post ?? "",
        image: data.image ?? "",
        faq: parseFaqField(data.faq),
        html: markdownToHtml(body)
      };
    })
  );

  return items.sort((a, b) => a.title.localeCompare(b.title));
}

function layout({ title, description, body, head = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="/assets/site.css?v=${assetVersion}">
${head}
</head>
<body>
  <header class="site-header">
    <nav class="nav" aria-label="Primary navigation">
      <a class="brand" href="/">Charcuterie Lab</a>
      <div class="nav-links">
        <a href="/ingredients/">Ingredients</a>
        <a href="/#blog">Blog</a>
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
        <a href="#" aria-label="Facebook">f</a>
        <a href="#" aria-label="Instagram">ig</a>
        <a href="#" aria-label="YouTube">yt</a>
      </div>
      <div class="copyright">© 2026 Charcuterie Lab. All rights reserved.</div>
    </div>
  </footer>
</body>
</html>`;
}

function homePage(posts, products) {
  const featuredPosts = posts.slice(0, 3);
  return layout({
    title: "Charcuterie Lab | Boards Built by Science",
    description: "Buy the Charcuterie Lab book, shop printable board guides, and read the daily lab report.",
    body: `<main>
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <h1>Charcuterie Lab: 50 Boards, Built by Science</h1>
        <p>The ultimate guide to perfect pairings and board building.</p>
        <div class="actions">
          <a class="button primary" href="https://www.amazon.com/" rel="noopener">Buy on Amazon</a>
          <a class="button" href="#shop">Shop Printables</a>
        </div>
      </div>
      <div class="hero-art" aria-label="Charcuterie Lab book">
        <img class="book" src="/images/book-cover.jpg" alt="Charcuterie Lab book cover">
        <div class="plinth" aria-hidden="true"></div>
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
        <h2>Get the daily lab report</h2>
        <p>Short pairing notes, printable launches, and board-building ideas sent whenever you publish.</p>
      </div>
      <form name="newsletter" method="POST" data-netlify="true">
        <input type="hidden" name="form-name" value="newsletter">
        <label class="sr-only" for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" placeholder="Email address" required>
        <button class="button primary" type="submit">Join</button>
      </form>
    </div>
  </section>
</main>`
  });
}

function articleCard(post) {
  return `<article class="card">
  <a href="/blog/${post.slug}/"><img src="${post.image}" alt=""></a>
  <h3><a href="/blog/${post.slug}/">${escapeHtml(post.title)}</a></h3>
  <p>${escapeHtml(post.excerpt)}</p>
</article>`;
}

function productCard(product) {
  return `<article class="card product">
  <a href="${product.url}"><img src="${product.image}" alt=""></a>
  <h3><a href="${product.url}">${escapeHtml(product.title)}</a></h3>
  <p>${escapeHtml(product.description)}</p>
  <span class="price">${escapeHtml(product.price)}</span>
</article>`;
}

function postPage(post) {
  const date = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${post.date}T00:00:00Z`));

  return layout({
    title: `${post.title} | Charcuterie Lab`,
    description: post.excerpt,
    head: faqSchema(post),
    body: `<main class="post-main">
  <section class="post-hero">
    <div class="post-hero-inner">
      <p class="post-date">${date}</p>
      <h1>${escapeHtml(post.title)}</h1>
    </div>
    <img class="post-image" src="${post.image}" alt="">
  </section>
  <article class="post-body">
    ${post.html}
  </article>
</main>`
  });
}

function ingredientCard(item) {
  return `      <li class="ing-card" data-name="${escapeHtml(item.title.toLowerCase())}" data-cat="${item.categorySlug}" data-role="${escapeHtml(item.roleGroup.toLowerCase())}" data-price="${escapeHtml(item.priceTier)}" data-free="${item.freeFrom.join(" ")}" data-search="${escapeHtml([item.title, item.category, item.boardRole, item.excerpt, ...item.tags, item.roleGroup].join(" ").toLowerCase())}">
        <a href="/ingredients/${item.slug}/">
          <span class="ing-card-cat">${escapeHtml(item.category)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="ing-card-role">${escapeHtml(item.boardRole)}${item.priceTier ? ` &middot; <span class="ing-price">${escapeHtml(item.priceTier)}</span>` : ""}</p>
          <p class="ing-card-note">${escapeHtml(item.excerpt)}</p>
        </a>
      </li>`;
}

function ingredientsFinder(items, { heading, intro, showCategoryFilter = true }) {
  const categories = CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c));
  const roles = [...new Set(items.map((i) => i.roleGroup).filter(Boolean))].sort();
  const prices = [...new Set(items.map((i) => i.priceTier).filter(Boolean))].sort();

  const chip = (group, value, label) =>
    `<button type="button" class="ing-chip" data-group="${group}" data-value="${escapeHtml(value)}">${escapeHtml(label)}</button>`;

  return `<section class="ing-finder">
  <div class="section-inner">
    <h1>${escapeHtml(heading)}</h1>
    <p class="ing-intro">${escapeHtml(intro)}</p>

    <div class="ing-controls">
      <label class="ing-search-label" for="ing-search">Search ingredients</label>
      <input id="ing-search" class="ing-search" type="search" placeholder="Search 130 ingredients — brie, gluten free, blue cheese&hellip;" autocomplete="off">

      <div class="ing-facets">
        ${showCategoryFilter && categories.length > 1 ? `<div class="ing-facet"><span class="ing-facet-label">Category</span><div class="ing-chips">${categories.map((c) => chip("cat", slugify(c), c)).join("")}</div></div>` : ""}
        <div class="ing-facet"><span class="ing-facet-label">Type</span><div class="ing-chips">${roles.map((r) => chip("role", r.toLowerCase(), r)).join("")}</div></div>
        ${prices.length > 1 ? `<div class="ing-facet"><span class="ing-facet-label">Price</span><div class="ing-chips">${prices.map((p) => chip("price", p, p)).join("")}</div></div>` : ""}
        <div class="ing-facet"><span class="ing-facet-label">Free from</span><div class="ing-chips">${FREE_FROM.map((f) => chip("free", f.key, f.label)).join("")}</div></div>
      </div>

      <p class="ing-count" role="status" aria-live="polite"><span id="ing-count">${items.length}</span> ingredients</p>
      <button type="button" id="ing-reset" class="ing-reset" hidden>Clear filters</button>
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
  var active = { cat: [], role: [], price: [], free: [] };

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
    var any = q || active.cat.length || active.role.length || active.price.length || active.free.length;
    resetEl.hidden = !any;
  }

  search.addEventListener("input", apply);

  Array.prototype.forEach.call(document.querySelectorAll(".ing-chip"), function (btn) {
    btn.addEventListener("click", function () {
      var g = btn.dataset.group, v = btn.dataset.value;
      var i = active[g].indexOf(v);
      if (i === -1) { active[g].push(v); btn.classList.add("is-on"); btn.setAttribute("aria-pressed", "true"); }
      else { active[g].splice(i, 1); btn.classList.remove("is-on"); btn.setAttribute("aria-pressed", "false"); }
      apply();
    });
    btn.setAttribute("aria-pressed", "false");
  });

  function reset() {
    search.value = "";
    active = { cat: [], role: [], price: [], free: [] };
    Array.prototype.forEach.call(document.querySelectorAll(".ing-chip"), function (b) {
      b.classList.remove("is-on"); b.setAttribute("aria-pressed", "false");
    });
    apply();
  }
  resetEl.addEventListener("click", reset);
  document.getElementById("ing-empty-reset").addEventListener("click", reset);
})();
</script>`;
}

function ingredientsHub(items) {
  const categories = CATEGORY_ORDER.filter((c) => items.some((i) => i.category === c));
  return layout({
    title: "Ingredients | Charcuterie Lab",
    description:
      "Every charcuterie board ingredient, one page each: what it is, what it pairs with and why, how to prep it, and exactly what to buy.",
    body: `<main class="ing-main">
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
      `        <li><a href="/ingredients/${slugify(c)}/"><strong>${escapeHtml(c)}</strong><span>${items.filter((i) => i.category === c).length} ingredients</span></a></li>`
  )
  .join("\n")}
      </ul>
    </div>
  </section>
</main>`
  });
}

function ingredientCategoryPage(category, items) {
  return layout({
    title: `${category} | Ingredients | Charcuterie Lab`,
    description: `Every ${category.toLowerCase()} ingredient for a charcuterie board — pairings, prep and what to buy, one page each.`,
    body: `<main class="ing-main">
  <p class="ing-crumb"><a href="/ingredients/">Ingredients</a> <span aria-hidden="true">/</span> ${escapeHtml(category)}</p>
${ingredientsFinder(items, {
  heading: category,
  intro: `${items.length} ${category.toLowerCase()} ingredients, each with pairings, prep and what to buy.`,
  showCategoryFilter: false
})}
</main>`
  });
}

function ingredientPage(item, bySlug) {
  const related = item.pairsWith.map((s) => bySlug.get(s)).filter(Boolean);
  const meta = [
    item.boardRole && ["Board role", item.boardRole],
    item.priceTier && ["Price", item.priceTier],
    item.serving && ["Per person", item.serving],
    item.prepTime && ["Prep", item.prepTime],
    item.allergens.length && ["Allergens", item.allergens.join(", ")]
  ].filter(Boolean);

  return layout({
    title: `${item.title} | Ingredients | Charcuterie Lab`,
    description: item.excerpt,
    head: faqSchema(item),
    body: `<main class="ing-main ing-detail">
  <p class="ing-crumb"><a href="/ingredients/">Ingredients</a> <span aria-hidden="true">/</span> <a href="/ingredients/${item.categorySlug}/">${escapeHtml(item.category)}</a> <span aria-hidden="true">/</span> ${escapeHtml(item.title)}</p>
  <article class="ing-article">
    <header class="ing-header">
      <h1>${escapeHtml(item.title)}</h1>
      <p class="ing-lede">${escapeHtml(item.excerpt)}</p>
      ${item.image ? `<img class="ing-hero" src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async">` : ""}
      <dl class="ing-meta">
${meta.map(([k, v]) => `        <div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join("\n")}
      </dl>
    </header>
    <div class="post-body ing-body">
      ${item.html}
    </div>
    ${
      related.length
        ? `<section class="ing-related">
      <h2>Pairs well with</h2>
      <ul class="ing-related-list">
${related.map((r) => `        <li><a href="/ingredients/${r.slug}/"><strong>${escapeHtml(r.title)}</strong><span>${escapeHtml(r.boardRole)}</span></a></li>`).join("\n")}
      </ul>
    </section>`
        : ""
    }
    ${item.boardPost ? `<p class="ing-boardpost">Building a whole board around it? <a href="${escapeHtml(item.boardPost)}">See board ideas &rarr;</a></p>` : ""}
    <p class="ing-back"><a href="/ingredients/${item.categorySlug}/">&larr; All ${escapeHtml(item.category.toLowerCase())}</a></p>
  </article>
</main>`
  });
}

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(join(dist, "assets"), { recursive: true });
  for (const publicPath of paths.public) {
    await cp(publicPath, dist, { recursive: true });
  }
  await cp(paths.styles, join(dist, "assets", "site.css"));

  const [allPosts, products, ingredients] = await Promise.all([
    loadPosts(),
    readFile(paths.products, "utf8").then(JSON.parse),
    loadIngredients()
  ]);
  const posts = allPosts.filter((post) => isPublishedPost(post));

  await writeFile(join(dist, "index.html"), homePage(posts, products));

  await Promise.all(
    posts.map(async (post) => {
      const dir = join(dist, "blog", post.slug);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, "index.html"), postPage(post));
    })
  );

  const feed = posts
    .map((post) => `- ${post.date} ${post.title} /blog/${post.slug}/`)
    .join("\n");
  await writeFile(join(dist, "blog-feed.txt"), `${feed}\n`);

  // Ingredients: a standalone reference section, deliberately kept out of the
  // blog feed and the homepage so 130 pages don't bury the daily posts.
  if (ingredients.length) {
    const bySlug = new Map(ingredients.map((item) => [item.slug, item]));

    await mkdir(join(dist, "ingredients"), { recursive: true });
    await writeFile(join(dist, "ingredients", "index.html"), ingredientsHub(ingredients));

    const categories = [...new Set(ingredients.map((item) => item.category))];
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
        await writeFile(join(dir, "index.html"), ingredientPage(item, bySlug));
      })
    );
  }
}

await build();
console.log("Built Charcuterie Lab into dist/");
