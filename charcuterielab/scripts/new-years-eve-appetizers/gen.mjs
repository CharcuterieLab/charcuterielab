// Builds content/blog/new-years-eve-appetizers.md (Nov 8, 2026).
// Run from the charcuterielab folder:  node scripts/new-years-eve-appetizers/gen.mjs
// New photos are used once they exist in public/images/ (and make-thumbs.py has run);
// until then the post uses existing New Year's photos or skips that picture.
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = JSON.parse(fs.readFileSync(join(SITE, "public/images/thumbs/manifest.json"), "utf8"));
const has = (p) => fs.existsSync(join(SITE, "public", p)) && fs.statSync(join(SITE, "public", p)).size > 0;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const md2html = (s) => s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

const TAGS = {
  nocook: "No-cook", ahead: "Make-ahead", freezes: "Freezes", veg: "Vegetarian", gf: "Gluten-free",
  fancy: "Fancy", budget: "Budget", kid: "Kid-friendly",
};
const GROUPS = [
  { key: "cold", name: "Cold bites", range: "1–10", lede: "No oven needed. Make these while the oven is busy with the warm round." },
  { key: "warm", name: "Warm bites", range: "11–20", lede: "Most of these freeze, so you can bake them straight from the freezer on the night." },
  { key: "dips", name: "Dips and spreads", range: "21–27", lede: "The easiest wins: most taste better made a day ahead." },
  { key: "boards", name: "Boards and showstoppers", range: "28–34", lede: "One big centerpiece does the work of five small appetizers." },
  { key: "midnight", name: "Midnight snacks", range: "35–40", lede: "Hold these back for 11:30. A second wind needs something warm and salty." },
];

// [group, name, how, make-ahead, tags, extra link line (optional)]
const ITEMS = [
  // Cold bites 1–10
  ["cold", "Smoked Salmon Cucumber Bites", "Top thick slices of English cucumber with herbed cream cheese, a curl of [smoked salmon](/blog/best-smoked-salmon/), a few capers and a sprig of dill.", "Mix the cream cheese the day before. Assemble within 2 hours of serving, or the cucumber weeps.", "nocook gf fancy"],
  ["cold", "Caviar Potato Chip Bites", "Spoon a dab of crème fraîche onto sturdy [kettle chips](/blog/best-kettle-chips/), add a little caviar or trout roe and snip chives on top. It's the most famous high-low pairing with Champagne.", "Set out the parts and assemble as guests arrive. Chips go soft in about 20 minutes.", "nocook fancy", "Budget to splurge: [the best caviar to buy](/blog/best-caviar/)."],
  ["cold", "Prosciutto-Wrapped Breadsticks", "Wrap a thin slice of [prosciutto](/ingredients/prosciutto-di-parma/) in a spiral around the top half of each [grissini](/ingredients/grissini/). Stand them up in a glass.", "Up to 2 hours ahead. Longer and the breadsticks soften.", "nocook budget kid"],
  ["cold", "Goat Cheese Stuffed Peppadews", "Pipe or spoon soft [goat cheese](/ingredients/fresh-chevre/) into sweet-hot [Peppadew peppers](/ingredients/peppadew/). Finish with chopped chives.", "The day before. Keep covered in the fridge.", "nocook ahead veg gf budget"],
  ["cold", "Cheese and Grape Skewers", "Thread a cube of [Manchego](/ingredients/manchego/) or cheddar, a green grape and a folded slice of salami onto a short pick.", "The day before, covered.", "nocook ahead gf kid budget"],
  ["cold", "Shrimp Cocktail Cups", "Spoon cocktail sauce into small clear cups and hang 2 or 3 cooked, chilled shrimp over each rim with a lemon wedge. Easier to eat than a shared ring.", "Make the sauce up to 2 days ahead. Fill the cups within 2 hours and keep them on ice.", "nocook gf fancy"],
  ["cold", "Endive Boats with Blue Cheese and Pear", "Fill endive leaves with crumbled blue cheese, finely diced pear and toasted walnuts. Drizzle with honey.", "Dice the pear in lemon juice and toast the nuts the day before. Fill within 2 hours.", "nocook veg gf fancy"],
  ["cold", "Deviled Eggs, Three Ways", "Make one batch of filling and top a third each with paprika, everything seasoning and a little salmon roe.", "Boil the eggs and make the filling the day before. Pipe the filling on the day.", "ahead veg gf budget"],
  ["cold", "Smoked Salmon Blini", "Top store-bought [blini](/ingredients/blini/) with crème fraîche, a fold of smoked salmon and dill. Warm the blini for 5 minutes first if you have room in the oven.", "Assemble within 1 hour of serving.", "nocook fancy", "Want a whole station? See the [New Year's Eve blini bar plan](/printables/new-years-eve-blini-bar/)."],
  ["cold", "Marinated Feta and Olive Cups", "Toss cubes of [feta](/ingredients/feta/) and mixed olives with olive oil, lemon zest, chili flakes and oregano. Serve in small cups with picks.", "Up to 3 days ahead. It gets better as it sits.", "nocook ahead veg gf budget"],
  // Warm bites 11–20
  ["warm", "Mini Crab Cakes", "Bind lump crab with a little mayo, mustard, egg and panko, shape into 1½-inch cakes and bake at 425°F for about 12 minutes. Top with a dot of rémoulade.", "Shape and freeze up to a month ahead. Bake from frozen, adding a few minutes.", "freezes fancy"],
  ["warm", "Bacon-Wrapped Dates", "Stuff [Medjool dates](/ingredients/medjool-dates/) with a little blue cheese or an almond, wrap in half a slice of bacon and bake at 400°F for 15 to 20 minutes, until crisp.", "Stuff and wrap the day before. Bake on the night.", "ahead gf budget"],
  ["warm", "Brie Bites with Fig Jam", "Press squares of puff pastry into a mini muffin tin, add a cube of Brie and a little [fig jam](/ingredients/fig-jam/), and bake at 375°F for 15 minutes.", "Freeze unbaked in the tin, then pop them out into a bag. Bake from frozen.", "freezes veg"],
  ["warm", "Gougères (Cheese Puffs)", "Little French choux puffs made with Gruyère. They're the classic Champagne bite in Burgundy, where they started.", "Pipe and freeze unbaked for up to a month, or bake and reheat for 5 minutes.", "freezes veg fancy", "Or buy them frozen: see [gougères](/ingredients/gougeres/)."],
  ["warm", "Broiled Oysters with Garlic-Parmesan Butter", "Top oysters on the half shell with garlic butter and Parmesan, and broil about 3 inches from the heat until the edges curl and the butter bubbles, at least 3 minutes. Cooking them is the CDC's advice for oysters.", "Make the butter up to 3 days ahead. Have the oysters shucked the day you buy them and keep them on ice.", "gf fancy"],
  ["warm", "Sausage-Stuffed Mushrooms", "Fill cremini caps with cooked Italian sausage, cream cheese and Parmesan. Bake at 375°F for 20 minutes.", "Fill the day before and refrigerate. Bake on the night.", "ahead gf"],
  ["warm", "Cocktail Meatballs", "Simmer frozen meatballs in grape jelly and chili sauce, or a Swedish-style cream gravy, in a slow cooker on low. Serve with picks.", "Cooked meatballs freeze for a month. Keep them warm on low all night.", "freezes budget kid"],
  ["warm", "Everything Pigs in a Blanket", "Wrap cocktail sausages in strips of crescent dough, brush with egg and sprinkle with everything bagel seasoning. Bake at 375°F for 12 to 15 minutes. Serve with mustard.", "Freeze unbaked on a tray, then bag them. Bake from frozen.", "freezes budget kid"],
  ["warm", "Spinach and Gruyère Mini Quiches", "Fill mini tart shells with egg, cream, wilted spinach and Gruyère. Bake at 350°F for about 20 minutes.", "Bake, cool and freeze. Reheat at 350°F for 8 to 10 minutes.", "freezes veg"],
  ["warm", "Beef Tenderloin Crostini", "Toast baguette slices, spread with horseradish cream and top with thin slices of rare roast beef tenderloin and arugula.", "Roast the beef and toast the crostini the day before. Slice the beef cold and assemble within 2 hours.", "ahead fancy"],
  // Dips 21–27
  ["dips", "Hot Crab Dip", "Mix crab, cream cheese, sour cream, Old Bay and cheddar. Bake at 375°F until bubbling, about 25 minutes. Serve with crackers or celery.", "Mix the day before and bake on the night.", "ahead gf fancy"],
  ["dips", "Baked Brie with Honey and Pecans", "Score the top of a whole Brie, bake at 350°F for 12 to 15 minutes, then pour over warm honey and toasted pecans. Serve with apple slices and crackers.", "Toast the pecans ahead. Bake right before serving so it's gooey.", "veg gf"],
  ["dips", "Whipped Feta with Pomegranate", "Blend [feta](/ingredients/feta/) with Greek yogurt and olive oil until smooth. Top with [pomegranate](/ingredients/pomegranate/) seeds, honey and mint.", "Whip it up to 2 days ahead. Add the toppings before serving.", "nocook ahead veg gf"],
  ["dips", "Spinach Artichoke Dip", "Bake spinach, artichokes, cream cheese, sour cream, mozzarella and Parmesan until bubbling.", "Assemble the day before and bake on the night.", "ahead veg gf budget", "Short on time? Here's [the best store-bought spinach dip](/blog/best-spinach-dip/)."],
  ["dips", "Caramelized French Onion Dip", "Slowly caramelize 3 onions, cool, and stir into sour cream with a little garlic and Worcestershire. Serve with ridged chips.", "Make it 1 to 2 days ahead. It tastes better the next day.", "ahead veg gf budget", "Or [the best store-bought French onion dip](/blog/best-french-onion-dip/)."],
  ["dips", "Smoked Salmon Spread", "Blend hot-smoked salmon with cream cheese, lemon, dill and capers. Serve with bagel chips or cucumber.", "Up to 2 days ahead.", "nocook ahead gf", "Pairing notes: [smoked salmon and cream cheese](/blog/smoked-salmon-cream-cheese-pairing/)."],
  ["dips", "Black-Eyed Pea Dip (Texas Caviar)", "Toss black-eyed peas with corn, peppers, red onion, cilantro and a lime vinaigrette. Serve with tortilla chips. Black-eyed peas are the lucky New Year's food of the American South.", "Up to 2 days ahead.", "nocook ahead veg gf budget"],
  // Boards 28–34
  ["boards", "The New Year's Eve Charcuterie Board", "A big board of hard and soft cheeses, cured meats, fruit and crackers, built to pair with bubbly and to last until midnight.", "Prep the parts the day before. Build it 1 hour before guests arrive.", "ahead fancy", "Full shopping list and build order: [the New Year's Eve board](/boards/new-years-eve-charcuterie-board/)."],
  ["boards", "The Champagne Board", "Chunks of [Parmigiano-Reggiano](/ingredients/parmigiano-reggiano/), a [triple-crème](/ingredients/triple-creme/), prosciutto, [Marcona almonds](/ingredients/marcona-almonds/), kettle chips and strawberries. Salt and fat make Champagne taste its best.", "Build it 1 hour ahead and cover it.", "ahead fancy gf", "More board ideas for the night: [New Year's Eve hub](/holidays/new-years-eve/)."],
  ["boards", "Blini and Caviar Bar", "Warm blini, crème fraîche, caviar or trout roe, smoked salmon, chopped egg, red onion and chives. Guests build their own.", "Chop everything the morning of and keep it cold. Set out over ice.", "fancy", "Get the plan: [New Year's Eve blini bar](/printables/new-years-eve-blini-bar/)."],
  ["boards", "Midnight Clock Board", "Arrange 12 small stacks of crackers and cheese in a circle like a clock face, with breadstick \"hands\" pointing to 12. Kids love counting down with it.", "Slice the cheese the day before. Build it within 1 hour.", "ahead kid budget"],
  ["boards", "Shrimp and Crab Platter on Ice", "Cooked shrimp, crab claws and cooked mussels on crushed ice with cocktail sauce, rémoulade and lemon.", "Buy everything cooked. Set it out on ice and swap the ice halfway through the night.", "gf fancy"],
  ["boards", "Raclette or Fondue Station", "Melt [raclette](/ingredients/raclette/) or a Gruyère fondue at the table and serve with small potatoes, cornichons, bread cubes and cured meats.", "Boil the potatoes and cut everything the day before.", "veg fancy"],
  ["boards", "Charcuterie Skewers", "A grazing board on a stick: salami, mozzarella, olives, tomatoes and basil. No crowding around one board.", "The day before, covered.", "ahead gf kid", "10 combinations: [charcuterie skewers](/blog/charcuterie-skewers/)."],
  // Midnight 35–40
  ["midnight", "Ham and Swiss Sliders", "Layer Hawaiian rolls with ham and Swiss, brush with butter, Dijon and poppy seeds, and bake covered at 350°F for 15 minutes.", "Assemble the morning of and refrigerate. Bake at 11:15.", "ahead kid budget"],
  ["midnight", "Mini Grilled Cheese and Tomato Soup Shots", "Cut grilled cheese sandwiches into strips and serve each in a small cup of tomato soup.", "Make the soup ahead and keep it warm. Grill the sandwiches at 11:30.", "veg kid budget"],
  ["midnight", "Popcorn Bar", "Big bowls of popcorn with shakers: Parmesan and black pepper, truffle salt, cinnamon sugar and ranch powder.", "Pop up to a day ahead and keep it in a sealed bag.", "ahead veg gf budget kid"],
  ["midnight", "Twelve Grapes at Midnight", "Small cups of 12 green grapes, one for each chime at midnight. It's Spain's New Year's tradition, and finishing them all is said to bring 12 lucky months.", "Wash and portion them the morning of.", "nocook ahead veg gf budget kid"],
  ["midnight", "Chocolate-Dipped Strawberries", "Dip strawberries in melted dark chocolate, then drizzle with white chocolate or roll in gold sprinkles.", "Make them the morning of. They weep if they sit overnight.", "ahead veg gf"],
  ["midnight", "Sheet-Pan Nachos", "Tortilla chips, cheese, black beans and pickled jalapeños baked on a sheet pan until melted, then topped with salsa and sour cream.", "Cook the toppings ahead. Bake for 8 minutes when the crowd gets hungry.", "veg gf budget kid"],
];
if (ITEMS.length !== 40) throw new Error(`expected 40, got ${ITEMS.length}`);
const items = ITEMS.map(([g, name, how, ahead, tags, more], i) => ({ n: i + 1, g, name, how, ahead, tags: tags.split(" "), more }));
for (const it of items) for (const t of it.tags) if (!TAGS[t]) throw new Error(`bad tag ${t}`);
const tagPills = (it) => it.tags.map((t) => `<span class="ny-tag ny-t-${t}">${TAGS[t]}</span>`).join("");

// Pictures: new ones when they exist, else an existing stand-in or nothing.
const pic = (path, alt, fallback) => {
  if (has(path)) return `![${alt}](${path})`;
  if (fallback) return `![${fallback[1]}](${fallback[0]})`;
  return "";
};
const PICS = {
  cold: pic("/images/new-years-eve-appetizers-cold.jpg", "Cold New Year's Eve appetizers on a marble counter: smoked salmon cucumber bites, caviar potato chips, stuffed Peppadew peppers and shrimp cocktail cups"),
  warm: pic("/images/new-years-eve-appetizers-warm.jpg", "A sheet pan of warm New Year's Eve appetizers: Brie bites with fig jam, gougères, bacon-wrapped dates and pigs in a blanket"),
  dips: pic("/images/new-years-eve-appetizers-dips.jpg", "New Year's Eve dips: baked Brie with honey and pecans, whipped feta with pomegranate and black-eyed pea dip with tortilla chips"),
  boards: pic("/images/new-years-eve-appetizers-boards.jpg", "A New Year's Eve charcuterie board with Champagne glasses, cheese, cured meats and strawberries", ["/images/50-boards-22-new-years-eve.webp", "A New Year's Eve charcuterie board with cheese, cured meats and fruit, built to pair with Champagne"]),
  midnight: pic("/images/new-years-eve-appetizers-midnight.jpg", "Midnight snacks for New Year's Eve: ham and Swiss sliders, cups of twelve green grapes and chocolate-dipped strawberries next to a clock"),
  lucky: pic("/images/new-years-eve-lucky-foods.jpg", "Lucky New Year's foods on a table: cups of green grapes, black-eyed pea dip, lentils with sausage, pickled herring and ham sliders"),
};
const hero = has("/images/new-years-eve-appetizers.jpg") ? "/images/new-years-eve-appetizers.jpg" : "/images/50-boards-22-new-years-eve.webp";

// ---- top picks + jump ----
const top = [[2, "Fancy", "The high-low bite everyone talks about. Five minutes, no oven."], [13, "Warm", "Bake them straight from the freezer."], [27, "Lucky", "The South's good-luck food, as a scoopable dip."], [38, "Midnight", "Spain's tradition: one grape for each chime."]];
const topHtml = `<div class="sk-top"><p class="sk-top-label">If you only make four</p>
${top.map(([n, pill, line]) => `<div class="sk-top-row"><div class="sk-top-text"><p class="sk-pill">${pill}</p><span class="sk-top-name">${esc(items[n - 1].name)}</span><p class="sk-top-line">${line}</p></div><div class="sk-top-buy"><a class="sk-price" href="#ny-${n}">#${n} below</a></div></div>`).join("\n")}
</div>`;
const jump = `<p class="tc-jump-label">Jump to a section</p>
<nav class="sk-jump" data-tc-jump aria-label="Jump to a section"><a href="#picker">Pick your appetizers</a><a href="#how-many">How many to make</a>${GROUPS.map((g) => `<a href="#${g.key}">${g.name}</a>`).join("")}<a href="#lucky">Lucky foods</a><a href="#bubbly">What goes with Champagne</a><a href="#menus">3 ready menus</a><a href="#countdown">Countdown to midnight</a><a href="#safety">Keeping it safe</a><a href="#faq">FAQ</a></nav>`;

// ---- picker ----
const picker = `<h2 id="picker">Pick your appetizers: all 40 at a glance</h2>
<p class="sk-lede">Tap a filter to see only what fits your night, then tap a name to jump to it. Gluten-free picks assume gluten-free crackers and chips, so check labels.</p>
<div class="tc-chart ny-picker" data-ny-picker>
<div class="tc-controls"><div class="tc-chips" role="group" aria-label="Filter appetizers"><button type="button" class="on" data-tag="">All 40</button>${Object.entries(TAGS).map(([k, v]) => `<button type="button" data-tag="${k}">${v}</button>`).join("")}</div>
<p class="tc-count" aria-live="polite" data-ny-count>Showing all 40</p></div>
<div class="tc-tablewrap"><table class="tc-table ny-table"><thead><tr><th>#</th><th>Appetizer</th><th>Type</th><th>Good to know</th></tr></thead><tbody>
${items.map((it) => `<tr data-tags="${it.tags.join(" ")}"><td class="ny-n">${it.n}</td><td class="ny-name"><a href="#ny-${it.n}">${esc(it.name)}</a></td><td class="ny-type">${GROUPS.find((g) => g.key === it.g).name}</td><td class="ny-tags">${tagPills(it)}</td></tr>`).join("\n")}
</tbody></table></div>
<button type="button" class="button tc-more-btn" data-ny-more hidden>Show all 40 appetizers</button></div>
<script>
(function(){var c=document.querySelector('[data-ny-picker]');if(!c)return;var rows=[].slice.call(c.querySelectorAll('tbody tr')),ct=c.querySelector('[data-ny-count]'),mb=c.querySelector('[data-ny-more]'),chips=[].slice.call(c.querySelectorAll('.tc-chips button')),tag='',open=false,LIM=12;
function run(label){var n=0,shown=0;rows.forEach(function(r){var ok=!tag||(' '+r.getAttribute('data-tags')+' ').indexOf(' '+tag+' ')>-1;if(ok)n++;var vis=ok&&(tag||open||n<=LIM);r.hidden=!vis;if(vis)shown++});
ct.textContent=tag?('Showing '+n+' of 40: '+label):('Showing '+shown+' of 40');mb.hidden=!!tag||open}
chips.forEach(function(b){b.addEventListener('click',function(){tag=b.getAttribute('data-tag');chips.forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});run(b.textContent)})});
mb.addEventListener('click',function(){open=true;run()});run();
c.classList.add('js');})();
</script>`;

// ---- item sections ----
function groupSection(g) {
  const list = items.filter((it) => it.g === g.key);
  const body = list.map((it) => `<div class="ny-item" id="ny-${it.n}">
<h3><span class="ny-num">${it.n}</span> ${esc(it.name)}</h3>
<p class="ny-pills">${tagPills(it)}</p>
<p>${md2html(it.how)}</p>
<p class="ny-ahead"><strong>Make ahead:</strong> ${md2html(it.ahead)}</p>
${it.more ? `<p class="ny-more">${md2html(it.more)}</p>` : ""}
</div>`).join("\n");
  return `:::html
<h2 id="${g.key}">${g.name} (${g.range})</h2>
<p class="sk-lede">${g.lede}</p>
:::

${PICS[g.key] ? PICS[g.key] + "\n\n" : ""}:::html
<div class="ny-items">
${body}
</div>
:::`;
}

const faq = [
  ["How many appetizers do I need for a New Year's Eve party?", "If appetizers are dinner and the party runs to midnight, plan 15 to 20 pieces per guest over the night, from 8 to 10 different appetizers, including at least two filling ones like sliders or meatballs. For drinks before going out, 6 to 8 pieces per guest is enough. Serve them in waves rather than all at once."],
  ["What are the best make-ahead New Year's Eve appetizers?", "Dips like French onion, whipped feta and black-eyed pea dip can be made 1 to 2 days ahead. Brie bites, gougères, pigs in a blanket, crab cakes, mini quiches and meatballs freeze for up to a month and bake from frozen. Skewers, stuffed Peppadews and deviled egg filling can be made the day before."],
  ["What appetizers go best with Champagne?", "Salty, fatty and fried foods. The acidity and bubbles cut through richness, so potato chips with crème fraîche and caviar, gougères, Parmigiano-Reggiano, prosciutto, fried bites and buttery cheeses all taste better with Champagne. Very sweet desserts make dry Champagne taste sour."],
  ["What foods are lucky to eat on New Year's Eve?", "Twelve grapes at midnight in Spain, black-eyed peas and greens in the American South, lentils with sausage in Italy, pickled herring in Germany, Poland and Scandinavia, and pork in many places because pigs root forward. All of them are easy to turn into appetizers."],
  ["What can I serve at midnight on New Year's Eve?", "Something warm and salty, like ham and Swiss sliders, mini grilled cheese with tomato soup or sheet-pan nachos, plus a sweet bite like chocolate-dipped strawberries. Put them out around 11:30 so they're ready for the countdown."],
  ["How long can appetizers sit out at a New Year's Eve party?", "No more than 2 hours at room temperature, according to the USDA. A party that runs until midnight is longer than that, so put out smaller platters and replace them, keep hot food at 140°F or above, and keep seafood and dips over ice."],
];

const fmText = `---
title: "40 New Year's Eve Appetizers (Easy, Fancy + Make-Ahead)"
seo_title: "40 Easy New Year's Eve Appetizers (Make-Ahead + Fancy Ideas)"
date: "2026-11-08"
image: "${hero}"
excerpt: "40 New Year's Eve appetizers sorted the way hosts plan: cold bites, warm bites from the freezer, dips, boards and midnight snacks. Each has a make-ahead note, plus how many to make, lucky foods, what goes with Champagne, three menus and a countdown to midnight."
description: "40 easy New Year's Eve appetizers, from fancy caviar chips to make-ahead freezer bites, dips, boards and midnight snacks, with how many to make per guest, lucky New Year's foods, Champagne pairings, menus and a countdown."
faq: "${JSON.stringify(faq.map(([question, answer]) => ({ question, answer })))}"
slug: "new-years-eve-appetizers"
tags: "${JSON.stringify(["new years eve appetizers", "new years eve appetizers easy", "make ahead new years eve appetizers", "new years eve party food", "new years eve finger food", "fancy appetizers for new years eve", "new years eve snacks", "lucky new years foods"])}"
---`;

const md = `${fmText}

# 40 New Year's Eve Appetizers (Easy, Fancy + Make-Ahead)

> **Quick Answer:** Mix five kinds: **cold bites** (caviar chips, stuffed Peppadews), **warm bites** you bake from the freezer (Brie bites, gougères), **a dip**, **one showstopper board** and **midnight snacks** held back for 11:30. If appetizers are dinner, plan **15–20 pieces per guest** over the night and serve them in **three waves**.

:::html
${topHtml}
${jump}
:::

Every appetizer below has a **make-ahead** note and tags like *Freezes* or *Gluten-free*, so you can do most of the work the week before and spend the night with your guests.

:::html
${picker}
:::

:::html
<h2 id="how-many">How many appetizers to make</h2>
<p class="sk-lede">New Year's Eve is a long night, so it depends on one question: <strong>are appetizers the dinner?</strong></p>
:::

| Your party | Pieces per guest | How many kinds | Include |
|---|---|---|---|
| Drinks and bites before going out (2 hours) | 6 to 8 | 4 or 5 | Cold bites and one dip |
| Appetizers, then a sit-down dinner | 4 to 6 | 3 or 4 | Light, elegant bites |
| Party until midnight, appetizers are dinner | 15 to 20 | 8 to 10 | Two filling ones (sliders, meatballs) and midnight snacks |

**Quick math:** 12 guests × 16 pieces = about 190 pieces. With 8 kinds, that's about 24 of each. Serve them in waves: about **half when guests arrive**, a **second round around 10 pm** and the **midnight snacks at 11:30**. For the cheese and meat on a board, plan **about 3 oz of each per guest** when it has to last until midnight, or let the [Party Planner](/party-planner/) do the math for your guest count.

${GROUPS.map(groupSection).join("\n\n")}

:::html
<h2 id="lucky">Lucky New Year's foods (and how to serve them as appetizers)</h2>
<p class="sk-lede">Many countries eat something at midnight for luck in the new year. Here's what they mean and the easiest way to put them on your table.</p>
:::

${PICS.lucky ? PICS.lucky + "\n\n" : ""}| Lucky food | Where | What it means | Serve it as |
|---|---|---|---|
| **12 grapes** | Spain | One for each chime at midnight, for 12 lucky months | [Twelve grapes cups (#38)](#ny-38) |
| **Black-eyed peas** (with greens) | American South | The peas stand for coins, the greens for money | [Black-eyed pea dip (#27)](#ny-27) |
| **Pork** | Germany, Austria, the US and more | Pigs root forward, so pork means moving ahead | [Ham and Swiss sliders (#35)](#ny-35) or [pigs in a blanket (#18)](#ny-18) |
| **Lentils** (with sausage) | Italy | Small, round and coin-like, for money | Warm lentils with sliced cooked sausage on spoons |
| **Pickled herring** | Germany, Poland, Scandinavia | Silvery fish for wealth and plenty | Herring on rye crackers with sour cream and dill |

:::html
<h2 id="bubbly">What goes with Champagne (and Prosecco, Cava and cider)</h2>
<p class="sk-lede">Bubbles and acidity cut through salt and fat, which is why the best Champagne snacks are salty, crunchy, creamy or fried. Very sweet desserts do the opposite and make dry sparkling wine taste sour.</p>
:::

| What you're pouring | Best appetizers from this list | Why |
|---|---|---|
| **Brut Champagne** | [Caviar chips (#2)](#ny-2), [gougères (#14)](#ny-14), [the Champagne board (#29)](#ny-29) | Salt and crunch make it taste fruitier and creamier |
| **Prosecco** | [Prosciutto breadsticks (#3)](#ny-3), [stuffed Peppadews (#4)](#ny-4), [shrimp cups (#6)](#ny-6) | Lighter and fruitier, so lighter, salty bites |
| **Cava** | [Cheese and grape skewers (#5)](#ny-5) with Manchego, [marinated feta and olives (#10)](#ny-10) | Spanish wine with Spanish cheese and olives |
| **Sparkling rosé** | [Smoked salmon blini (#9)](#ny-9), [chocolate strawberries (#39)](#ny-39) | Red-fruit flavors match salmon and berries |
| **Sparkling cider** (zero-proof) | [Pigs in a blanket (#18)](#ny-18), [baked Brie (#22)](#ny-22), [popcorn bar (#37)](#ny-37) | Apple sweetness loves pork, Brie and salty snacks |

Shopping for bottles? See [the best Champagne under $30](/blog/best-champagne-under-30/), [the best Prosecco](/blog/best-prosecco/) and [the best sparkling cider](/blog/best-sparkling-cider/), or read [why Champagne loves salty food](/pairings/wine/champagne-prosecco/).

:::html
<h2 id="menus">3 ready-made New Year's Eve menus</h2>
:::

| Menu | Pick these | Pour |
|---|---|---|
| **Party until midnight for 12** (appetizers are dinner) | [#1](#ny-1), [#4](#ny-4), [#13](#ny-13), [#17](#ny-17), [#25](#ny-25), [#28](#ny-28), [#35](#ny-35), [#38](#ny-38) | Prosecco and sparkling cider |
| **Fancy night for 6** | [#2](#ny-2), [#9](#ny-9), [#14](#ny-14), [#15](#ny-15), [#20](#ny-20), [#29](#ny-29), [#39](#ny-39) | Brut Champagne |
| **Family countdown** (kids up late) | [#5](#ny-5), [#18](#ny-18), [#24](#ny-24), [#31](#ny-31), [#36](#ny-36), [#37](#ny-37), [#38](#ny-38) | Sparkling cider |

**Kids can't stay up?** Do a "midnight" countdown at 9 pm with the clock board and the grape cups, then let the grown-ups keep going.

:::html
<h2 id="countdown">Countdown to midnight: a make-ahead timeline</h2>
:::

| When | What to do |
|---|---|
| **1 week before** | Pick your menu. Order caviar, seafood and any special cheese. Make and freeze the warm bites (#11, #13, #14, #17, #18, #19). |
| **Dec 29–30** | Shop for cheese, produce and drinks. Make the dips (#23, #25, #26, #27), the marinated feta (#10) and the oyster butter (#15). |
| **Dec 31, morning** | Make the skewers, stuffed Peppadews and egg filling. Wash the grapes into cups. Chill the bubbly in the fridge. |
| **1 hour before guests** | Take the cheese out of the fridge. Build the board. Bake the first warm round. |
| **About 10 pm** | Second wave: swap in fresh platters, bake the next warm bites and refill the board. |
| **11:30 pm** | Midnight snacks into the oven. Hand out grape cups and pour the glasses. |
| **12:01 am** | Chocolate strawberries, then put leftovers in the fridge within 2 hours. |

:::html
<h2 id="safety">Keeping it safe on a long night</h2>
:::

- **The 2-hour rule:** perishable food shouldn't sit out longer than 2 hours, according to the USDA. A party until midnight is longer than that, so put out smaller platters and replace them rather than refilling the same one.
- **Hot food at 140°F or above:** use a slow cooker on low or a warm oven for meatballs and dips.
- **Cold food over ice:** shrimp, crab, smoked salmon and creamy dips go on a tray of crushed ice.
- **Oysters:** the CDC advises against eating raw or undercooked oysters, so this list cooks them (#15).
- **Pregnant guests:** skip cold-smoked salmon and anything with raw fish or unpasteurized soft cheese. See [which cheeses are safe during pregnancy](/blog/cheese-safe-during-pregnancy/).
- **Driving home:** keep sparkling cider and a zero-proof option on the table all night. See [zero-proof pairings](/pairings/zero-proof/).

## Related Reading

- [New Year's Eve Charcuterie Board Ideas](/holidays/new-years-eve/)
- [The New Year's Eve Board: Shopping List and Build](/boards/new-years-eve-charcuterie-board/)
- [The Best Champagne Under $30](/blog/best-champagne-under-30/)
- [The Best Caviar to Buy](/blog/best-caviar/)
- [40 Christmas Appetizers You Can Make Ahead](/blog/christmas-appetizers/)
- [Charcuterie Skewers](/blog/charcuterie-skewers/)

## Sources

- [USDA FSIS: Why food safety should be at the top of your holiday list](https://www.fsis.usda.gov/news-events/news-press-releases/usda-explains-why-food-safety-should-be-top-all-our-holiday-lists)
- [CDC: Preventing Vibrio infection (oysters)](https://www.cdc.gov/vibrio/prevention/index.html)
- [CDC: Preventing Listeria infection](https://www.cdc.gov/listeria/prevention/index.html)

:::html
<h2 id="faq">FAQ</h2>
:::

${faq.map(([q, a]) => `**${q}**\n\n${a}`).join("\n\n")}
`;

fs.writeFileSync(join(SITE, "content", "blog", "new-years-eve-appetizers.md"), md);
console.log("written", md.length, "chars;", items.length, "items");
