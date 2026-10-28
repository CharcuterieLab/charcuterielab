// Quick subscribe bar (28 Oct 2026): an email box right under the H1 of every
// page. The reader types an email, presses Subscribe, and a green check
// appears beside the button; they never leave the page. The form posts to
// /api/subscribe (netlify/functions/subscribe.mjs), which adds them to beehiiv
// and sends the welcome email. Without JavaScript it falls back to /newsletter/.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Pages that already open with their own signup, or shouldn't ask.
const SKIP = /^\/(newsletter|thanks|search)\//;

const CHECK = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const NOTE = "Quick subscribe to our free newsletter without leaving this page.";

const BAR = `<form class="qs" data-qs action="/newsletter/" method="get" novalidate>
  <div class="qs-row">
    <label class="sr-only" for="qs-email">Email address</label>
    <input id="qs-email" class="qs-input" type="email" name="email" placeholder="Your email address" autocomplete="email" inputmode="email" required>
    <input class="qs-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
    <button class="qs-btn" type="submit">Subscribe</button>
    <span class="qs-ok" role="img" aria-label="Subscribed">${CHECK}</span>
  </div>
  <p class="qs-note" aria-live="polite">${NOTE}</p>
</form>
<script>(function(){var f=document.querySelector("[data-qs]");if(!f)return;try{if(localStorage.getItem("cl-sub")){f.hidden=true;return}}catch(e){}try{var hc=getComputedStyle(document.querySelector("main h1")||f.parentNode).color.match(/\\d+/g);if(hc&&(.299*hc[0]+.587*hc[1]+.114*hc[2])>160)f.classList.add("qs-dark")}catch(e){}var i=f.querySelector(".qs-input"),b=f.querySelector(".qs-btn"),n=f.querySelector(".qs-note"),busy=false;function say(t,bad){n.innerHTML=t;f.classList.toggle("is-err",!!bad)}f.addEventListener("submit",function(e){e.preventDefault();if(busy||f.classList.contains("is-done"))return;var v=i.value.trim();if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(v)){say("Please enter a full email address, like name@example.com.",1);i.focus();return}busy=true;b.disabled=true;b.textContent="Subscribing\\u2026";say("${NOTE}");fetch("/api/subscribe",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:v,page:location.pathname,website:f.website.value})}).then(function(r){return r.json().catch(function(){return{ok:false}}).then(function(j){j.status=r.status;return j})}).then(function(j){if(!j.ok)throw j;f.classList.add("is-done");i.readOnly=true;b.textContent="Subscribed";say("You\\u2019re in! Watch your inbox for the welcome email.");try{localStorage.setItem("cl-sub","1")}catch(e){}var s=document.querySelector("[data-fx-slide]");if(s)s.remove();document.body.classList.remove("fx-slide-on")}).catch(function(j){busy=false;b.disabled=false;b.textContent="Subscribe";if(j&&j.error==="invalid_email")say("That email address doesn\\u2019t look right. Please check it and try again.",1);else say("That didn\\u2019t go through. Please try again, or use our <a href=\\"/newsletter/\\">signup page</a>.",1)})})})();</script>`;

export async function injectQuickSubscribe(dist) {
  let pages = 0;
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
        if (html.includes("data-qs")) continue;
        const mainAt = html.indexOf("<main");
        const end = html.indexOf("</h1>", mainAt >= 0 ? mainAt : 0);
        if (end < 0) { noH1.push(path); continue; }
        html = html.slice(0, end + 5) + "\n" + BAR + html.slice(end + 5);
        await writeFile(file, html);
        pages++;
      }
    }
  }
  await walk(dist, "");
  return { pages, noH1 };
}
