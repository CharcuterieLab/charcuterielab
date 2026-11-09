// Quick subscribe bar (28 Oct 2026): an email box right under the H1 of every
// page. The reader types an email, presses Subscribe, and a green check
// appears beside the button; they never leave the page. The form posts to
// /api/subscribe (netlify/functions/subscribe.mjs), which adds them to beehiiv
// and sends the welcome email. Without JavaScript it falls back to /newsletter/.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Pages that already open with their own signup, or shouldn't ask.
// Board Builder and the 151 board plan pages (1 Nov 2026, visitor review):
// a tool and a sales page, so nothing sits between the H1 and the work.
const SKIP = /^\/(newsletter|thanks|search|board-builder)\//;

const CHECK = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const NOTE = "Quick subscribe to our free newsletter without leaving this page.";

// 8 Nov 2026 (visitor review: will subscribe / will buy, calmly): a signup
// now gets its freebie right where it happened. Every form with data-qs has
// a [data-qs-done] panel beside it: on success the form folds away and the
// panel shows the PDF download, the two other free downloads and one quiet
// line about the book. The page-matched box under the quick answer
// (offers.mjs emailHigh) uses the same form, so content pages no longer get
// this bar as well; hubs keep the bar, offering their own freebie when
// offers.mjs left one in a <!--qs-fb:...--> note.
export const CHEAT = { title: "The Charcuterie Cheat Sheet", label: "Download the Cheat Sheet (PDF)", pdf: "/downloads/charcuterie-cheat-sheet.pdf" };
const SAMPLE = "/downloads/charcuterie-lab-free-board-01.pdf";
const escA = (x) => String(x).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const nameOf = (fb) => String(fb.title || "").replace(/^Free /, "");

export function qsDone(fb = CHEAT, { bookPrice = "", keep = false } = {}) {
  const others = [fb.pdf !== CHEAT.pdf && `<a href="${CHEAT.pdf}" download>the Cheat Sheet</a>`, `<a href="${SAMPLE}" download>Board 01 from the book</a>`].filter(Boolean);
  return `<div class="qs-done${keep ? " qs-done-keep" : ""}" data-qs-done hidden>
    <p class="qs-done-h"><span class="qs-done-new">You&rsquo;re in. Here it is:</span><span class="qs-done-sub">You&rsquo;re subscribed. Your free download:</span></p>
    <a class="button primary qs-done-dl" href="${escA(fb.pdf)}" download>${escA(fb.label || `Download ${nameOf(fb)} (PDF)`)}</a>
    <p class="qs-done-more">Also free: ${others.join(" and ")}. The weekly Lab Report starts with the next issue.</p>
    ${bookPrice ? `<p class="qs-done-next">Want every board planned for you? <a href="/ebook/">50 boards in the book &middot; ${escA(bookPrice)}</a></p>` : ""}
  </div>`;
}

export function qsForm({ id = "qs-email", fb = CHEAT, bookPrice = "", keep = false, bar = false, button = "Subscribe", note = NOTE } = {}) {
  return `<form class="qs${keep ? " qs-in" : ""}" data-qs${keep ? " data-qs-keep" : ""}${bar ? " data-qs-bar" : ""} action="/newsletter/" method="get" novalidate>
  <div class="qs-row">
    <label class="sr-only" for="${id}">Email address</label>
    <input id="${id}" class="qs-input" type="email" name="email" placeholder="Your email address" autocomplete="email" inputmode="email" required>
    <input class="qs-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="qs-btn" type="submit">${escA(button)}</button>
    <span class="qs-ok" role="img" aria-label="Subscribed">${CHECK}</span>
  </div>
  <p class="qs-note" aria-live="polite">${escA(note)}</p>
</form>
${qsDone(fb, { bookPrice, keep })}`;
}

// One script per page drives every data-qs form on it.
export const QS_JS = `<script data-qs-js>(function(){var sub=false;try{sub=!!localStorage.getItem("cl-sub")}catch(e){}document.querySelectorAll("[data-qs]").forEach(function(f){var d=f.nextElementSibling&&f.nextElementSibling.hasAttribute("data-qs-done")?f.nextElementSibling:null,w=f.closest("[data-qs-wrap]");if(sub){f.hidden=true;if(d&&f.hasAttribute("data-qs-keep")){d.hidden=false;d.classList.add("is-sub")}else if(w)w.hidden=true;return}if(f.hasAttribute("data-qs-bar"))try{var hc=getComputedStyle(document.querySelector("main h1")||f.parentNode).color.match(/\\d+/g);if(hc&&(.299*hc[0]+.587*hc[1]+.114*hc[2])>160)f.classList.add("qs-dark")}catch(e){}var i=f.querySelector(".qs-input"),b=f.querySelector(".qs-btn"),n=f.querySelector(".qs-note"),n0=n.innerHTML,b0=b.textContent,busy=false;function say(t,bad){n.innerHTML=t;f.classList.toggle("is-err",!!bad)}f.addEventListener("submit",function(e){e.preventDefault();if(busy||f.classList.contains("is-done"))return;var v=i.value.trim();if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(v)){say("Please enter a full email address, like name@example.com.",1);i.focus();return}busy=true;b.disabled=true;b.textContent="Sending\\u2026";say(n0);fetch("/api/subscribe",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:v,page:location.pathname,website:f.website.value})}).then(function(r){return r.json().catch(function(){return{ok:false}}).then(function(j){j.status=r.status;return j})}).then(function(j){if(!j.ok)throw j;f.classList.add("is-done");i.readOnly=true;b.textContent="Subscribed";try{localStorage.setItem("cl-sub","1")}catch(e){}var s=document.querySelector("[data-fx-slide]");if(s)s.remove();document.body.classList.remove("fx-slide-on");if(d){setTimeout(function(){f.hidden=true;d.hidden=false;var a=d.querySelector("a");if(a)a.focus({preventScroll:true})},700)}else say("You\\u2019re in! Watch your inbox for the next newsletter issue.")}).catch(function(j){busy=false;b.disabled=false;b.textContent=b0;if(j&&j.error==="invalid_email")say("That email address doesn\\u2019t look right. Please check it and try again.",1);else say("That didn\\u2019t go through. Please try again, or use our <a href=\\"/newsletter/\\">signup page</a>.",1)})})})})();</script>`;

const BOOK_PRICE_RE = /Get the ebook · (\$\d+(?:\.\d\d)?)/;

export async function injectQuickSubscribe(dist) {
  let pages = 0;
  let bookPrice = "";
  try { bookPrice = ((await readFile(join(dist, "thanks", "cheat-sheet", "index.html"), "utf8")).match(BOOK_PRICE_RE) || [])[1] || ""; } catch {}
  const noH1 = [];
  async function walk(dir, rel) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (!rel && ["assets", "images", "downloads"].includes(e.name)) continue;
        await walk(join(dir, e.name), `${rel}/${e.name}`);
      } else if (e.name === "index.html") {
        const path = `${rel}/`;
        if (path === "/" || SKIP.test(path)) continue;
        const file = join(dir, e.name);
        let html = await readFile(file, "utf8");
        if (html.includes("data-qs") || html.includes("<!--no-offers-->")) continue;
        const mainAt = html.indexOf("<main");
        const end = html.indexOf("</h1>", mainAt >= 0 ? mainAt : 0);
        if (end < 0) { noH1.push(path); continue; }
        let fb = CHEAT;
        const m = html.match(/<!--qs-fb:([^>]*?)-->/);
        if (m) { try { fb = JSON.parse(decodeURIComponent(m[1])); } catch {} }
        const note = fb === CHEAT || !fb.short ? NOTE : `${fb.short}, plus one board idea a week.`;
        const bar = `<div class="qs-wrap" data-qs-wrap>${qsForm({ fb, bookPrice, bar: true, note })}</div>` + (html.includes("data-qs-js") ? "" : QS_JS);
        html = html.slice(0, end + 5) + "\n" + bar + html.slice(end + 5);
        await writeFile(file, html);
        pages++;
      }
    }
  }
  await walk(dist, "");
  return { pages, noH1 };
}
