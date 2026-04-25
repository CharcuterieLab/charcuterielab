# Charcuterie Lab

Static Netlify site for selling the book, printables, and publishing a daily blog.

## Daily Blog Workflow

Add a new Markdown file to `content/blog`:

```md
---
title: "Your Post Title"
date: "2026-04-26"
image: "/images/blog-blue-cheese.jpg"
excerpt: "One sentence summary for the homepage."
---

Post body goes here.
```

Run `npm run build` before publishing. Netlify will run the same command automatically.

## Shop Updates

Edit printable products in `src/data/products.json`. Replace the `url` values with Gumroad, Shopify, Lemon Squeezy, Payhip, or direct checkout links when ready.

## Local Preview

```bash
npm run build
npm run serve
```

Then open `http://localhost:4173`.
