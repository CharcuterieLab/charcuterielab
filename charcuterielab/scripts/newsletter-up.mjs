// 9 Nov 2026: newsletter page upgrades, applied after the build (hub-calm).
// 1. A holiday offer under the intro that changes with the date: Thanksgiving,
//    then Christmas, then New Year's Eve, hidden from Jan 1. Its PDFs are
//    handed to the thank-you page (sessionStorage cl-extra / cl-extra2), so
//    joiners get them next to the Cheat Sheet.
// 2. A row of the other free printables that go out in the Lab Report.
// 3. Phone tidy: "every Wednesday", smaller hero image on phones, and the
//    bottom form becomes a button back to the top form (the second embed left
//    a tall blank box while it loaded).

const STAGES = [
  // [last day (inclusive), holiday, holiday date, extra 1, extra 2]
  ["2026-11-26", "Thanksgiving", "2026-11-26",
    ["/downloads/boards/thanksgiving-charcuterie-board-shopping-list.pdf", "Download the Thanksgiving Board shopping list (PDF)", "the Thanksgiving Board shopping list"],
    ["/downloads/holiday-board-countdown.pdf", "Download the Holiday Board Countdown (PDF)", "the Holiday Board Countdown"]],
  ["2026-12-25", "Christmas", "2026-12-25",
    ["/downloads/holiday-board-countdown.pdf", "Download the Holiday Board Countdown (PDF)", "the Holiday Board Countdown"],
    ["/downloads/cheese-counter-card.pdf", "Download the Cheese Counter Card (PDF)", "the Cheese Counter Card for the holiday cheese case"]],
  ["2026-12-31", "New Year's Eve", "2026-12-31",
    ["/downloads/boards/new-years-eve-charcuterie-board-shopping-list.pdf", "Download the New Year's Eve Board shopping list (PDF)", "the New Year's Eve Board shopping list"],
    ["/downloads/holiday-board-countdown.pdf", "Download the Holiday Board Countdown (PDF)", "the Holiday Board Countdown"]]
];

const MORE = [
  ["/images/leads/holiday-board-countdown.webp", "Holiday Board Countdown", "What to buy and prep, day by day"],
  ["/images/leads/cheese-counter-card.webp", "Cheese Counter Card", "How much to buy and what to ask for"],
  ["/images/leads/cheese-chart.webp", "The Cheese Chart", "All 100 cheeses on one page"],
  ["/images/leads/pairing-cheat-sheet.webp", "Pairing Cheat Sheet", "What goes with what, and why"],
  ["/images/leads/best-buys-top-picks.webp", "Best Buys Top Picks", "Our #1 brand for every board staple"],
  ["/images/leads/board-shopping-list.webp", "Board shopping lists", "Every item and amount for a board"]
];

const SEASON_JS = `<script data-nl-season-js>(function(){try{var S=${JSON.stringify(STAGES)},t=new Date(),d=new Date(t.getFullYear(),t.getMonth(),t.getDate()),pad=function(n){return(n<10?"0":"")+n},k=t.getFullYear()+"-"+pad(t.getMonth()+1)+"-"+pad(t.getDate()),s=null;for(var i=0;i<S.length;i++){if(k<=S[i][0]){s=S[i];break}}var box=document.querySelector("[data-nl-season]");if(!s||!box)return;var p=s[2].split("-"),h=new Date(+p[0],+p[1]-1,+p[2]),n=Math.round((h-d)/864e5),when=n>1?s[1]+" is "+n+" days away.":n===1?s[1]+" is tomorrow.":"It's "+s[1]+".";box.querySelector("[data-nl-when]").textContent=when;box.querySelector("[data-nl-what]").textContent=s[3][2]+" and "+s[4][2];box.hidden=false;sessionStorage.setItem("cl-extra",JSON.stringify({u:s[3][0],l:s[3][1]}));sessionStorage.setItem("cl-extra2",JSON.stringify({u:s[4][0],l:s[4][1]}))}catch(e){}})();</script>`;

export function upNewsletter(html) {
  let n = 0;
  const r = (a, b) => { if (html.includes(a)) { html = html.replace(a, b); n++; } };
  r('<p class="section-kicker">Free · weekly · leave any time</p>', '<p class="section-kicker">Free · every Wednesday · leave any time</p>');
  // seasonal offer, between the intro and the form
  html = html.replace(/(<p class="nl-lede">[\s\S]*?<\/p>)/, (m) => { n++; return `${m}
        <p class="nl-season" data-nl-season hidden><strong data-nl-when></strong> Join this week and the thank-you page also gives you <span data-nl-what></span>, free.</p>`; });
  // the other printables
  r('      <ul class="nl-free">', '      <ul class="nl-free">');
  html = html.replace(/(<h2>What you get when you sign up<\/h2>[\s\S]*?<\/ul>)/, (m) => { n++; return `${m}
      <h3 class="nl-more-h">Then, in the Lab Report</h3>
      <p class="nl-more-p">Many issues come with one of these free printables:</p>
      <ul class="nl-more">${MORE.map(([img, t, line]) => `<li><img src="${img}" alt="" width="96" height="124" loading="lazy" decoding="async"><strong>${t}</strong><span>${line}</span></li>`).join("")}</ul>`; });
  // bottom: button back to the top form instead of a second embed
  html = html.replace(/<h2>Get the cheat sheet now<\/h2>\s*<div class="nl-form"><div class="fx-bh-form" id="nl-form-bottom"[\s\S]*?<\/div><\/div>/, () => { n++; return `<h2>Get the cheat sheet now</h2>
      <p><a class="button primary" href="#nl-top">Sign up at the top of the page</a></p>`; });
  r("<summary>How often will you email me?</summary><p>Once a week, plus the odd note when a new printable or book lands.</p>", "<summary>How often will you email me?</summary><p>Once a week, on Wednesday, plus the odd note when a new printable or book lands.</p>");
  if (n) html = html.replace(/<\/main>/, `${SEASON_JS}\n</main>`);
  return { html, n };
}

// Thank-you page: a second extra download slot (cl-extra2), next to the first.
export function upThanks(html) {
  if (html.includes("data-thanks-extra2")) return { html, n: 0 };
  const slot = '<p class="thanks-extra" data-thanks-extra hidden><a class="button" href="#" download></a></p>';
  if (!html.includes(slot)) return { html, n: 0 };
  html = html.replace(slot, `${slot}
          <p class="thanks-extra" data-thanks-extra2 hidden><a class="button" href="#" download></a></p>
          <script>(function(){try{var x=JSON.parse(sessionStorage.getItem("cl-extra2")||"null");if(!x||!x.u||x.u.charAt(0)!=="/")return;var p=document.querySelector("[data-thanks-extra2]"),a=p.querySelector("a");a.href=x.u;a.textContent=x.l;p.hidden=false;sessionStorage.removeItem("cl-extra2")}catch(e){}})();</script>`);
  return { html, n: 1 };
}
