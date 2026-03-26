# Charcuterie Lab — Site Deployment Guide

## What You Have

A complete Hugo static site with:
- **Homepage** with hero, featured posts, category explorer, science strip, newsletter CTA, and guides/book section
- **Blog** with category filtering, featured post, pagination, sidebar, prev/next navigation
- **Guides & Products** page with free guides, paid ebooks, and book coming-soon section
- **About** page
- **Book coming soon** page (full dark hero with email capture)
- **Newsletter** standalone page
- **Decap CMS** at `/admin` — write blog posts from a browser, no code required
- **7 sample blog posts** to start

---

## Step 1: Push to GitHub

1. Go to **github.com** → New repository
2. Name it `charcuterielab` (or anything you want)
3. Set to **Public** (required for Netlify free tier)
4. Open your terminal, navigate to this folder, and run:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/charcuterielab.git
git push -u origin main
```

---

## Step 2: Deploy to Netlify

1. Go to **netlify.com** → Add new site → Import from Git
2. Connect your GitHub account and select your repository
3. Build settings are already configured in `netlify.toml`:
   - Build command: `hugo --minify`
   - Publish directory: `public`
4. Click **Deploy site**

Your site will be live at a Netlify subdomain (e.g., `amazing-cheese-123.netlify.app`) within 2 minutes.

---

## Step 3: Connect Your Domain (charcuterielab.com)

1. In Netlify: **Site settings → Domain management → Add custom domain**
2. Enter `charcuterielab.com`
3. Netlify will show you nameservers or a DNS record
4. In your domain registrar (Namecheap, etc.), update the DNS:
   - Add a **CNAME** record: `www` → `your-netlify-subdomain.netlify.app`
   - For root domain, add an **A record** to Netlify's load balancer IPs (shown in Netlify dashboard)
5. SSL certificate is provisioned automatically (free, via Let's Encrypt)

DNS propagation takes 15 minutes to 48 hours. Usually under an hour.

---

## Step 4: Enable the CMS (Write Posts from Browser)

This sets up Decap CMS so you can write new posts at `charcuterielab.com/admin` without touching any code.

1. In Netlify: **Site settings → Identity → Enable Identity**
2. Still in Identity settings: scroll to **Registration** → set to **Invite only**
3. Scroll to **Services → Git Gateway** → click **Enable Git Gateway**
4. Go to **Identity tab → Invite users** → invite your own email
5. Click the invite link in your email and set a password
6. Visit `charcuterielab.com/admin` — log in and start writing

To write a new post:
- Click **New Blog Post**
- Fill in title, date, description, category, read time
- Write body in the visual editor
- Set **Featured** to true if it should appear as the hero post
- Click **Publish** → the site rebuilds in ~60 seconds → post is live

---

## Step 5: Connect Beehiiv Newsletter

1. Create account at **beehiiv.com** (free up to 2,500 subscribers)
2. Set up your newsletter as "The Lab Report"
3. Get your embed form code from Beehiiv
4. In the site files, replace the `<div class="nl-form">` blocks in these files with Beehiiv's embed code:
   - `layouts/partials/newsletter.html`
   - `layouts/newsletter/single.html`
   - The sidebar newsletter in `layouts/blog/single.html`

---

## Writing New Blog Posts (Daily Workflow)

### Option A: CMS (recommended, browser-based)
Go to `charcuterielab.com/admin` → New Blog Post → write → publish. Done.

### Option B: Markdown file (for power users)
Create a new file in `content/blog/your-post-slug.md`:

```markdown
---
title: "Your Post Title Here"
date: 2026-03-26
description: "One sentence summary shown on cards and in SEO."
categories: ["Pairing Science"]
tags: ["honey", "blue cheese"]
readtime: "5 min"
featured: false
emoji: "🍯"
---

Your post content here. Use ## for headers, **bold**, *italic*.

> Use blockquote for pull quotes

```

Then: `git add . && git commit -m "New post: title" && git push`
Site rebuilds and goes live in ~60 seconds.

### Available Categories (use exactly as written):
- Pairing Science
- Ingredient Deep Dives
- Board Ideas
- Food History
- Myth Busting
- Tips & Tricks
- Seasonal Boards
- International Boards
- Budget Boards
- Luxury Boards

---

## Adding Gumroad Products

For the ebook buy buttons in `layouts/guides/single.html`, replace the `href="#"` on each `.btn` with your Gumroad product URL:

```html
<a href="https://charcuterielab.gumroad.com/l/your-product" class="btn btn-gold">Buy on Gumroad</a>
```

---

## Adding Free PDF Downloads

1. Place PDF files in `static/downloads/` folder
2. Update `href="#"` on the free guide download buttons to `/downloads/filename.pdf`
3. Push to GitHub — file is live immediately

---

## Updating the Topbar Announcement

Edit `layouts/partials/topbar.html` — change the text and link to your current featured post or announcement.

---

## Social Media Links in Footer

Edit `layouts/partials/footer.html` — update the `href="#"` on each social link:

```html
<a href="https://instagram.com/charcuterielab" title="Instagram">IG</a>
<a href="https://pinterest.com/charcuterielab" title="Pinterest">PT</a>
<a href="https://facebook.com/charcuterielab" title="Facebook">FB</a>
```

---

## Site File Structure

```
charcuterielab/
├── config.toml              ← Site settings (title, URL, pagination)
├── netlify.toml             ← Netlify build settings
├── content/
│   ├── _index.md            ← Homepage
│   ├── blog/                ← All blog posts go here
│   ├── guides/              ← Guides page
│   ├── about/               ← About page
│   ├── book/                ← Book coming soon page
│   └── newsletter/          ← Newsletter page
├── layouts/
│   ├── index.html           ← Homepage template
│   ├── partials/
│   │   ├── nav.html         ← Navigation (edit links here)
│   │   ├── footer.html      ← Footer (edit links/social here)
│   │   ├── topbar.html      ← Top announcement bar
│   │   └── newsletter.html  ← Newsletter section (reused everywhere)
│   ├── blog/
│   │   ├── list.html        ← Blog index page
│   │   └── single.html      ← Individual post template
│   ├── guides/single.html   ← Guides page
│   ├── about/single.html    ← About page
│   ├── book/single.html     ← Book page
│   └── newsletter/single.html
├── static/
│   ├── css/main.css         ← All styles
│   ├── js/main.js           ← All JavaScript
│   └── admin/
│       ├── index.html       ← Decap CMS
│       └── config.yml       ← CMS field configuration
└── archetypes/
    └── blog.md              ← Template for new posts
```

---

## Brand Colors (for reference)

| Name | Hex |
|---|---|
| Bark (dark brown) | `#3E1C00` |
| Saddle brown | `#8B4513` |
| Sienna | `#A0522D` |
| Gold | `#C8960C` |
| Gold light | `#DAA520` |
| Cream | `#FDF6E3` |
| Parchment | `#E8D5A3` |

Fonts: **Playfair Display** (headings) + **Raleway** (body) — loaded from Google Fonts.
