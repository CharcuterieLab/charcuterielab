// Board page extras (3 Nov 2026), added to the built board pages after the
// build so boards.mjs stays untouched:
//   1. Holiday countdown: holiday boards get a banner under the hero that
//      counts down to the holiday (worked out on the visitor's clock, so it
//      moves on without a rebuild) and links to that holiday's page.
//   2. "Make it your own": Keto and For Two boards get 2-3 free swaps
//      (cheaper, nut-free, no pork, milder, lower carb) built from the
//      board's own ingredient list. The $3 plan keeps a swap for every item.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const HOLIDAY_OF = [
  [/thanksgiving|fall-harvest/, "thanksgiving"],
  [/christmas|santas-sleigh|holiday-entertaining|plant-based-holiday/, "christmas"],
  [/new-years-eve|champagne-bottle/, "new-years-eve"],
  [/valentine|heart-shaped/, "valentines-day"],
  [/football-field|game-day/, "super-bowl"],
  [/(^|-)easter(-|$)/, "easter"],
  [/st-patricks/, "st-patricks-day"],
  [/jack-o-lantern/, "halloween"]
];

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const PROPER = /^(Marcona|Genoa|Italian|Spanish|French|Greek|Manchego|Gruy|Parm|Comt|Castelvetrano|Kalamata|Medjool|Gouda|Swiss|Brie|Gorgonzola|Stilton|Jarlsberg|Dijon)/;
const lc = (s) => (PROPER.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1)).replace(/,.*$/, "");

function holidayBanner(b, hol) {
  const name = esc(hol.name);
  return `<a class="bl-banner hol-banner bx-count" href="/holidays/${hol.slug}/" data-dates='${JSON.stringify(hol.dates || [])}' data-name="${name}">
      <span class="bl-banner-k">${name}</span>
      <strong class="bx-count-h">Planning for ${name}?</strong>
      <span class="bx-count-s">See the ${name} page: more board ideas, a countdown plan and how much to buy &rarr;</span>
    </a>
    <script>(function(){var a=document.currentScript.previousElementSibling;if(!a)return;var t=new Date();t.setHours(0,0,0,0);try{var q=new URLSearchParams(location.search).get("today");if(q)t=new Date(q+"T00:00:00")}catch(e){}var d=JSON.parse(a.dataset.dates).map(function(x){return new Date(x+"T00:00:00")}).filter(function(x){return x>=t})[0];if(!d)return;var n=Math.round((d-t)/864e5),nm=a.dataset.name,h=a.querySelector(".bx-count-h"),s=a.querySelector(".bx-count-s");if(n>60)return;if(n===0){h.textContent=nm+" is today.";s.innerHTML="The quickest boards and a last-minute plan are on the "+nm+" page &rarr;";return}h.textContent=nm+" is in "+n+(n===1?" day.":" days.");s.innerHTML=n<=5?"Short on time? The last-minute plan is on the "+nm+" page &rarr;":"Start the make-ahead steps a few days out. The "+nm+" page has the countdown plan &rarr;"})();</script>`;
}

// ---- Swaps ----
const NUT = /\b(almonds?|walnuts?|pecans?|pistachios?|hazelnuts?|cashews?|peanuts?|pine nuts|mixed nuts|marcona)\b/i;
const PORK = /prosciutto|salami|soppressata|pepperoni|coppa|capicola|speck|bacon|chorizo|jam[oó]n|jambon|saucisson|\bham\b|mortadella|'nduja|nduja/i;
const NOT_FOOD_ITEM = /bread|cracker|butter(?! cups)|spread|jam\b|\boil\b|\bhoney\b(?!-)|cheese|beef/i;
const CHEAPER = [
  [/prosciutto di parma|jam[oó]n/i, (i) => `Use a domestic prosciutto in place of the ${i}. It costs about half as much and folds the same way.`],
  [/caviar/i, (i) => `Use salmon roe or lumpfish roe in place of the ${lc(i)}. You keep the pop of salty pearls for a fraction of the price.`],
  [/oyster/i, () => `Swap the fresh oysters for a good tin of smoked oysters. No shucking, and it costs far less.`],
  [/black truffle|truffle pecorino|truffle cheese/i, (i) => `Skip the ${i} and drizzle truffle honey over an aged cheddar or Parmesan. You still get the truffle aroma for much less.`],
  [/smoked salmon/i, () => `Buy smoked salmon trimmings or hot-smoked trout instead of sliced lox. They taste the same on a cracker and cost less.`],
  [/bresaola/i, () => `Swap the bresaola for thin-sliced deli roast beef. It is just as lean and folds the same way.`],
  [/triple-cr[eè]me/i, (i) => `A regular brie costs less than ${lc(i)} and still gives you the soft, creamy spot.`],
  [/manchego/i, () => `Swap the Manchego for an aged white cheddar. It has a similar firm, nutty bite at a lower price.`],
  [/parmigiano/i, () => `Use Grana Padano or a domestic Parmesan in place of Parmigiano-Reggiano.`],
  [/gruy[eè]re|comt[eé]/i, (i) => `Use Jarlsberg or another Swiss-style cheese in place of the ${i.replace(/,.*$/, "")}. It melts and slices the same way for less.`],
  [/burrata/i, () => `Use a ball of fresh mozzarella in place of the burrata.`],
  [/marcona/i, () => `Use regular roasted salted almonds in place of Marcona almonds.`],
  [/pistachio/i, () => `Use roasted salted almonds in place of shelled pistachios.`],
  [/fresh figs/i, () => `Out of fig season, use dried figs. They are cheaper and keep for weeks.`]
];
const MILD = [
  [/gorgonzola|stilton|blue cheese/i, (i) => `For guests who don't like strong cheese, swap the ${(i.match(/gorgonzola|stilton|blue cheese/i)[0]).replace(/^blue/i, "blue")} for a creamy Havarti.`],
  [/pepper jack/i, () => `For guests who don't like heat, use Monterey Jack instead of pepper jack.`],
  [/hot honey/i, () => `Use plain honey instead of hot honey for anyone who doesn't like heat.`],
  [/chorizo/i, (i) => `Swap the ${lc(i)} for a mild Genoa salami for guests who don't like heat.`],
  [/kimchi/i, () => `Use quick-pickled cucumbers in place of kimchi for guests who don't like heat.`]
];
const FRUIT = /strawberr|raspberr|blackberr|blueberr|berries/i;

function itemsOf(b) { return b.groups.flatMap((g) => g.items.map((i) => i.name)); }

export function swapsFor(b) {
  const items = itemsOf(b);
  const out = [];
  for (const [re, fn] of CHEAPER) { const i = items.find((x) => re.test(x)); if (i) { out.push(["Cheaper", fn(i)]); break; } }
  const nuts = items.filter((x) => NUT.test(x) && !NOT_FOOD_ITEM.test(x) && !/peanut butter cups/i.test(x));
  const cups = items.some((x) => /peanut butter cups/i.test(x));
  const pesto = items.some((x) => /pesto/i.test(x));
  const nf = [];
  if (nuts.length) nf.push(`Swap the ${nuts.slice(0, 2).map(lc).join(" and ")} for roasted pumpkin seeds (pepitas) or sunflower seeds. Same crunch, no nuts.`);
  if (cups) nf.push(`Use plain chocolate squares instead of peanut butter cups.`);
  if (pesto) nf.push(`Most pesto has pine nuts or cashews, so use a nut-free pesto or basil in olive oil.`);
  if (nf.length) out.push(["Nut-free", nf.join(" ")]);
  const pork = items.filter((x) => PORK.test(x) && !/jam\b|spread/i.test(x));
  if (pork.length && out.length < 3) {
    const cured = pork.filter((x) => !/bacon/i.test(x));
    const parts = [];
    if (cured.length) parts.push(`Swap the ${cured.slice(0, 2).map(lc).join(" and ")} for beef salami, bresaola or turkey pepperoni. They slice and fold the same way.`);
    if (pork.some((x) => /bacon/i.test(x))) parts.push(`Use turkey bacon in place of the bacon.`);
    out.push(["No pork", parts.join(" ")]);
  }
  const shell = items.find((x) => /shrimp|oyster|crab|lobster|scallop/i.test(x) && !(out[0] && out[0][0] === "Cheaper" && /oyster/i.test(x) && /oyster/i.test(out[0][1])));
  if (shell && out.length < 3) out.push(["No shellfish", `Leave out the ${lc(shell).replace(/, .*$/, "")} and add more of the other proteins on the board, or a few hard-boiled eggs.`]);
  if (out.length < 3) for (const [re, fn] of MILD) { const i = items.find((x) => re.test(x)); if (i) { out.push(["Milder", fn(i)]); break; } }
  const dairy = items.find((x) => /cream cheese|cr[eè]me fra[iî]che|sour cream/i.test(x));
  if (dairy && out.length < 3) out.push(["Dairy-free", `Use a plant-based ${/fra[iî]che|sour/i.test(dairy) ? "sour cream" : "cream cheese"} in place of the ${lc(dairy)}.`]);
  if (out.length < 3 && b.book === "keto") { const f = items.find((x) => FRUIT.test(x)); if (f) out.push(["Even lower carb", `Keep the ${lc(f)} to a small handful and add more cucumber or celery.`]); }
  return out.slice(0, 3);
}

function swapsHtml(b) {
  const s = swapsFor(b);
  if (s.length < 2) return "";
  return `<section class="bl-section bl-swaps" aria-labelledby="bl-swaps">
      <h2 id="bl-swaps">Make it your own</h2>
      <p>${s.length === 3 ? "Three" : "Two"} easy swaps that keep the board working:</p>
      <ul class="bl-swap-list">
        ${s.map(([k, t]) => `<li><strong>${k}:</strong> ${esc(t)}</li>`).join("\n        ")}
      </ul>
      <p class="bl-swap-more">${b.book === "keto" ? "The full plan has the exact amounts and the net carbs for every item." : "The full plan has a swap for anything your store is out of."}</p>
    </section>

    `;
}

const wantsSwaps = (b) => ["keto", "two"].includes(b.book) || ["keto-low-carb", "for-two"].includes(b.category);

export async function injectBoardExtras(dist, root) {
  const boardsDir = join(root, "content", "boards");
  const holDir = join(root, "content", "holidays");
  const hols = new Map();
  for (const f of await readdir(holDir)) if (f.endsWith(".json")) { const x = JSON.parse(await readFile(join(holDir, f), "utf8")); hols.set(x.slug, x); }
  let nh = 0, ns = 0;
  for (const f of await readdir(boardsDir)) {
    if (!f.endsWith(".json")) continue;
    const b = JSON.parse(await readFile(join(boardsDir, f), "utf8"));
    const file = join(dist, "boards", b.slug, "index.html");
    let html;
    try { html = await readFile(file, "utf8"); } catch { continue; }
    const hk = (HOLIDAY_OF.find(([re]) => re.test(b.slug)) || [])[1];
    const hol = hk && hols.get(hk);
    let changed = false;
    if (hol && html.includes("<!--no-offers-->") && !html.includes("bx-count")) {
      html = html.replace("<!--no-offers-->", `<!--no-offers-->\n    ${holidayBanner(b, hol)}`);
      nh++; changed = true;
    }
    const faqAt = html.indexOf('<section class="bl-section" aria-labelledby="bl-faq">');
    if (wantsSwaps(b) && faqAt > 0 && !html.includes("bl-swaps")) {
      const box = swapsHtml(b);
      if (box) { html = html.slice(0, faqAt) + box + html.slice(faqAt); ns++; changed = true; }
    }
    if (changed) await writeFile(file, html);
  }
  return { holiday: nh, swaps: ns };
}
