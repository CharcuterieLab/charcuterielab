# FAQ Schema for AEO

Charcuterie Lab is not a Hugo site, so the Hugo partial instructions do not apply here. The site builder now supports FAQ schema directly from blog frontmatter.

Add a `faq` field to any blog post with real, page-specific questions and answers:

```md
---
title: "Taleggio"
date: "2026-05-06"
image: "/images/taleggio.png"
excerpt: "Taleggio on a Charcuterie Board"
faq: [{"question":"What is Taleggio cheese?","answer":"Taleggio is a soft Italian washed-rind cheese with a pungent rind and mild, buttery paste."},{"question":"What pairs well with Taleggio?","answer":"Prosciutto, pear, dark honey, grissini, and lower-tannin red wines work well."}]
---
```

During the build, any post with `faq` gets a Schema.org `FAQPage` JSON-LD block in the HTML `<head>`.

Use this only for questions that the page genuinely answers. It can help search engines and answer engines understand the page, but it is not a ranking guarantee and should not be stuffed onto every post with generic filler.
