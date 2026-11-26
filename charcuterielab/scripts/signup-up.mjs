// 15 Nov 2026 (signup check): two changes to the email asks, applied after the
// build in hub-calm.mjs, once the quick-subscribe bar is on the page.
//
// 1. Holiday pages offer the holiday that is coming up, by date. Until
//    Thanksgiving, Thanksgiving pages and the general holiday pages give the
//    Thanksgiving Board shopping list (plus the countdown); Christmas pages
//    give a Christmas-framed countdown plus the Cheese Counter Card; New
//    Year's Eve pages the NYE Board list. The general pages move on to the
//    next holiday by themselves. The page is written for the build date and a
//    small script re-checks the visitor's date, so a page that isn't rebuilt
//    on Nov 27 still switches. After a holiday has passed, its own pages fall
//    back to the year-round holiday countdown plans. Hanukkah pages keep the
//    countdown plans (they cover Hanukkah).
// 2. The home page and /newsletter/ get the site's own instant form in place
//    of the beehiiv iframe (slow loader, tall blank box while loading). The
//    reader stays on the page and gets the PDF on the spot. If our signup ever
//    fails, the error message and the no-JS fallback go to the beehiiv hosted
//    signup page, which is the backup.
import { qsForm, QS_JS, CHEAT } from "./quick-subscribe.mjs";

export const BEEHIIV_PAGE = "https://charcuterie-lab-report.beehiiv.com/subscribe";
const COUNTDOWN = "/downloads/holiday-board-countdown.pdf";

// Shared by the build and the browser (serialised with toString), so plain ES5.
function holOffer(kind, key) {
  var T = ["/downloads/boards/thanksgiving-charcuterie-board-shopping-list.pdf", "Download the Thanksgiving Board shopping list (PDF)", "the Thanksgiving board shopping list"];
  var C = ["/downloads/holiday-board-countdown.pdf", "Download the Holiday Board Countdown (PDF)", "the Holiday Board Countdown"];
  var K = ["/downloads/cheese-counter-card.pdf", "Download the Cheese Counter Card (PDF)", "the Cheese Counter Card"];
  var N = ["/downloads/boards/new-years-eve-charcuterie-board-shopping-list.pdf", "Download the New Year's Eve Board shopping list (PDF)", "the New Year's Eve board shopping list"];
  // Thanksgiving: the fourth Thursday of November. Nothing is offered by date
  // before November 1 (the year-round countdown plans stay).
  var y = key.slice(0, 4), d1 = new Date(+y, 10, 1).getDay(), td = 22 + ((11 - d1) % 7), tday = y + "-11-" + td;
  if (key < y + "-11-01") return null;
  var tg = key <= tday, xm = key <= y + "-12-25", ny = key <= y + "-12-31";
  var k = kind;
  if (k === "G") k = tg ? "T" : xm ? "C" : "N";
  if ((k === "T" && !tg) || (k === "C" && !xm) || (k === "N" && !ny)) return null;
  if (k === "T") return { day: tday, hol: "Thanksgiving", title: "Free Thanksgiving board shopping list", line: "Every item and amount for a Thanksgiving board, plus the countdown: when to shop, prep and build. Plus the weekly Lab Report.", a: T, b: C };
  if (k === "C") return { day: y + "-12-25", hol: "Christmas", title: "Free Christmas board countdown", line: "When to shop, prep and build, how much to buy and a shopping list, plus the Cheese Counter Card for the holiday cheese case. Plus the weekly Lab Report.", a: [C[0], C[1], "the Christmas board countdown"], b: K };
  return { day: y + "-12-31", hol: "New Year's Eve", title: "Free New Year's Eve board shopping list", line: "Every item and amount for a New Year's Eve board, plus the countdown: when to shop, prep and build. Plus the weekly Lab Report.", a: N, b: C };
}
function holWhen(o, key) {
  var p = o.day.split("-"), q = key.split("-");
  var n = Math.round((new Date(+p[0], +p[1] - 1, +p[2]) - new Date(+q[0], +q[1] - 1, +q[2])) / 864e5);
  return n > 1 ? o.hol + " is " + n + " days away" : n === 1 ? o.hol + " is tomorrow" : o.hol + " is today";
}
function holNote(o) {
  return "Quick subscribe: free weekly newsletter w/out leaving page\nYou also get " + o.a[2] + " free.";
}

export function holKind(path) {
  if (/hanukkah/.test(path)) return "";
  if (/thanksgiving|friendsgiving/.test(path)) return "T";
  if (/christmas/.test(path)) return "C";
  if (/new-years/.test(path)) return "N";
  return "G";
}

const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const more = (o) => `Also free: <a href="${esc(o.b[0])}" download>${esc(o.b[2])}</a> and <a href="${CHEAT.pdf}" download>the Cheat Sheet</a>. The weekly Lab Report starts with the next issue.`;

const HOL_JS = (kind) => `<script data-hol-js>(function(){try{${holOffer.toString()}${holWhen.toString()}${holNote.toString()}var t=new Date(),z=function(n){return(n<10?"0":"")+n},key=t.getFullYear()+"-"+z(t.getMonth()+1)+"-"+z(t.getDate()),o=holOffer(${JSON.stringify(kind)},key),m=document.querySelector("main");if(!m||m.getAttribute("data-hol")===(o?o.a[0]:"")&&(!o||m.getAttribute("data-hol-key")===key))return;var e=function(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")};var A=o?o.a:["${COUNTDOWN}","Download the holiday countdown plans (PDF)","the holiday countdown plans"];document.querySelectorAll("[data-hol-box]").forEach(function(x){var q=function(s){return x.querySelector(s)};if(o){q(".fx-hi-eyebrow").textContent=holWhen(o,key);q(".fx-hi-title").textContent=o.title;q(".fx-hi-line").textContent=o.line}else{q(".fx-hi-eyebrow").textContent="Free printable";q(".fx-hi-title").textContent="Holiday board countdown plans";q(".fx-hi-line").textContent="Thanksgiving, Hanukkah, Christmas and New Year's Eve: when to shop, prep and build, how much to buy and a shopping list for each. Plus the weekly Lab Report."}});document.querySelectorAll("form[data-hol-bar] .qs-note").forEach(function(n){n.textContent=o?holNote(o):"Quick subscribe: free weekly newsletter w/out leaving page\\nYou also get the holiday countdown plans free."});document.querySelectorAll("[data-hol-done]").forEach(function(d){var a=d.querySelector(".qs-done-dl"),r=d.querySelector(".qs-done-more");if(a){a.setAttribute("href",A[0]);a.textContent=A[1]}if(r)r.innerHTML=o?'Also free: <a href="'+e(o.b[0])+'" download>'+e(o.b[2])+'</a> and <a href="${CHEAT.pdf}" download>the Cheat Sheet</a>. The weekly Lab Report starts with the next issue.':'Also free: <a href="${CHEAT.pdf}" download>the Cheat Sheet</a> and <a href="/downloads/charcuterie-lab-free-board-01.pdf" download>Board 01 from the book</a>. The weekly Lab Report starts with the next issue.'})}catch(e){}})();</script>`;

// The build date as the visitor in the US sees it (the build runs in UTC).
export function todayKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function holidayOffer(html, path, key = todayKey()) {
  const kind = holKind(path);
  if (!kind || html.includes("data-hol-js")) return { html, n: 0 };
  // Only pages whose matched freebie is the holiday countdown.
  const isHol = (s) => s.includes(`href="${COUNTDOWN}" download>Download the holiday countdown plans (PDF)</a>`);
  const done = [...html.matchAll(/<div class="qs-done[^"]*" data-qs-done hidden>[\s\S]*?<\/div>/g)].filter((m) => isHol(m[0]));
  if (!done.length) return { html, n: 0 };
  const o = holOffer(kind, key);
  let n = 0;
  for (const m of done) {
    let d = m[0].replace("data-qs-done hidden>", "data-qs-done data-hol-done hidden>");
    if (o) {
      d = d.replace(`href="${COUNTDOWN}" download>Download the holiday countdown plans (PDF)</a>`, `href="${esc(o.a[0])}" download>${esc(o.a[1])}</a>`);
      d = d.replace(/<p class="qs-done-more">[\s\S]*?<\/p>/, `<p class="qs-done-more">${more(o)}</p>`);
    }
    html = html.replace(m[0], d);
    n++;
  }
  // The box under the quick answer.
  html = html.replace(/<aside class="fx-hi" aria-label="Holiday board countdown plans" id="cheat">([\s\S]*?)<\/aside>/, (all, inner) => {
    n++;
    if (!o) return all.replace('<aside class="fx-hi"', '<aside class="fx-hi" data-hol-box');
    inner = inner
      .replace(/<p class="fx-hi-eyebrow">[^<]*<\/p>/, `<p class="fx-hi-eyebrow">${esc(holWhen(o, key))}</p>`)
      .replace(/<p class="fx-hi-title">[^<]*<\/p>/, `<p class="fx-hi-title">${esc(o.title)}</p>`)
      .replace(/<p class="fx-hi-line">[^<]*<\/p>/, `<p class="fx-hi-line">${esc(o.line)}</p>`);
    return `<aside class="fx-hi" data-hol-box aria-label="${esc(o.title)}" id="cheat">${inner}</aside>`;
  });
  // The bar under the H1.
  html = html.replace(/<form class="qs" data-qs data-qs-bar([^>]*)>([\s\S]*?)<p class="qs-note" aria-live="polite">[^<]*<\/p>/, (all, attrs, mid) => {
    n++;
    return `<form class="qs" data-qs data-qs-bar data-hol-bar${attrs}>${mid}<p class="qs-note" aria-live="polite">${esc(o ? holNote(o) : "Quick subscribe: free weekly newsletter w/out leaving page\nYou also get the holiday countdown plans free.")}</p>`;
  });
  html = html.replace(/<main([^>]*)>/, (m, a) => `<main${a} data-hol="${o ? esc(o.a[0]) : ""}" data-hol-key="${key}">`);
  html = html.replace(/<\/main>/, `${HOL_JS(kind)}\n</main>`);
  return { html, n };
}

// Home page (hero band and bottom section) and the newsletter page: our own
// instant form in place of the beehiiv embed.
const EMBED = (id) => new RegExp(`<div class="fx-bh-form" id="${id}"[^>]*>\\s*<script async src="https://subscribe-forms\\.beehiiv\\.com/v3/loader\\.js"[^>]*></script>\\s*<noscript>[\\s\\S]*?</noscript>\\s*</div>`);

export function instantForms(html, path, { bookPrice = "" } = {}) {
  const ids = path === "/" ? ["home-hero", "home-email"] : path === "/newsletter/" ? ["nl-form-top"] : [];
  let n = 0;
  for (const id of ids) {
    html = html.replace(EMBED(id), () => {
      n++;
      return `<div class="fx-bh-form fx-qf fx-qf-solo" id="${id}">
  ${qsForm({ id: `qs-${id}`, fb: CHEAT, bookPrice, keep: true, button: "Send it free", note: "Free PDF now, then our weekly newsletter. Leave any time.", alt: BEEHIIV_PAGE })}
  </div>`;
    });
  }
  if (n && !html.includes("data-qs-js")) html = html.replace(/<\/main>/, `${QS_JS}\n</main>`);
  return { html, n };
}
