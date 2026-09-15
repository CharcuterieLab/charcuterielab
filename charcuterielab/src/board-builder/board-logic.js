// Charcuterie Lab - Board Builder logic.
// Pure functions with no DOM access: scoring, advice, amounts, prep and
// presentation. The page imports it; anything server-side (an email, a PDF)
// can import it too and get exactly the same list.

export const DIETS = [
  { key: "vegetarian", label: "Vegetarian" },
  { key: "dairy-free", label: "Dairy-free" },
  { key: "gluten-free", label: "Gluten-free" },
  { key: "nut-free", label: "Nut-free" }
];

// avoid_with values on the ingredient pages are either an ingredient slug or
// one of these broader groups.
const GROUPS = {
  "delicate-fresh-cheese": (i) => i.c === 0 && i.r === "Soft & fresh",
  "delicate-bloomy-cheese": (i) => i.c === 0 && /brie|camembert|triple|coulommiers/.test(i.s),
  "mild-brie": (i) => i.c === 0 && /brie/.test(i.s),
  "blue-cheese": (i) => i.c === 0 && i.r === "Blue",
  "smoked-cheese": (i) => i.c === 0 && (/smoked/.test(i.s) || i.g.indexOf("smoked") !== -1),
  "aged-hard-cheese": (i) => i.c === 0 && i.r === "Aged & hard",
  "dry-aged-cheese": (i) => i.c === 0 && i.r === "Aged & hard",
  "strong-aged-cheese": (i) => i.c === 0 && i.r === "Aged & hard",
  "delicate-aged-cheese": (i) => i.c === 0 && i.r === "Aged & hard",
  "cured-meat": (i) => i.c === 1 && i.r !== "Smoked & tinned fish",
  "strong-cured-meat": (i) => i.c === 1 && (i.r === "Salami" || i.r === "Spreadable"),
  "smoked-fish": (i) => i.c === 1 && i.r === "Smoked & tinned fish"
};

const MEATY = /bacon|lardo|anchov|prawn|caviar|bottarga|shrimp/;

const isSweet = (i) => i.c === 3 || /Sweet preserves|Honey|Chocolate/.test(i.r) || /honey|jam|chocolate|caramel|curd|marmalade/.test(i.s);
const isAcid = (i) => i.c === 6 || /Fresh fruit|Citrus/.test(i.r) || /mustard|balsamic/.test(i.s);
const isCrunch = (i) => i.c === 2 || i.c === 5;

export function list(arr) {
  if (arr.length <= 1) return arr.join("");
  return arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1];
}

export function createBoard(data) {
  const bySlug = new Map(data.items.map((i) => [i.s, i]));
  const cats = data.categories;
  const catOf = (item) => cats[item.c];

  const get = (slugs) => slugs.map((s) => bySlug.get(s)).filter(Boolean);
  const inCat = (picks, idx) => picks.filter((p) => p.c === idx);

  function pairs(a, b) {
    return a.s !== b.s && (a.w.indexOf(b.s) !== -1 || b.w.indexOf(a.s) !== -1);
  }

  function note(a, b) {
    const key = a.s < b.s ? a.s + "|" + b.s : b.s + "|" + a.s;
    return data.notes[key] || "";
  }

  function allowed(item, diets) {
    const has = (words) => words.some((w) => item.a.indexOf(w) !== -1);
    if (diets.indexOf("vegetarian") !== -1 && (item.c === 1 || MEATY.test(item.s) || has(["fish", "shellfish"]))) return false;
    if (diets.indexOf("dairy-free") !== -1 && has(["dairy"])) return false;
    if (diets.indexOf("gluten-free") !== -1 && has(["gluten", "wheat", "rye", "oats"])) return false;
    if (diets.indexOf("nut-free") !== -1 && has(["tree nuts", "peanuts"])) return false;
    return true;
  }

  const hits = (groups, item) => groups.some((g) => g === item.s || (GROUPS[g] && GROUPS[g](item)));

  // ------------------------------------------------------------ scoring

  function score(item, picks) {
    let s = 0;
    const mates = picks.filter((p) => pairs(item, p));
    s += mates.length * 3;
    if (mates.some((m) => note(item, m))) s += 1;

    const same = inCat(picks, item.c);
    const [, max] = catOf(item).target;
    if (!picks.length && data.starters.indexOf(item.s) !== -1) s += 4;
    if (!same.length && picks.length) s += item.c <= 4 ? 3 : item.c <= 6 ? 2 : 0.5;
    if (same.length >= max) s -= 4 * (same.length - max + 1);

    if (picks.length) {
      if (!picks.some(isSweet) && isSweet(item)) s += 2;
      if (!picks.some(isAcid) && isAcid(item)) s += 2;
      if (!picks.some(isCrunch) && isCrunch(item)) s += 2;
    }
    if (item.c === 0) {
      const others = inCat(picks, 0);
      const sameRole = others.filter((p) => p.r === item.r).length;
      s -= sameRole * 5;
      if (others.length && !sameRole) s += 2;
    }
    // dessert crackers and sweets only rank high once the board leans sweet
    const dessert = (i) => i.r === "Dessert base" || i.g.indexOf("dessert") !== -1;
    if (dessert(item) && !picks.some(dessert)) s -= 3;
    if (item.g.indexOf("crowd-pleaser") !== -1 || item.g.indexOf("beginner") !== -1) s += 0.5;
    return s;
  }

  function rank(picks, { category = null, diets = [] } = {}) {
    const taken = new Set(picks.map((p) => p.s));
    return data.items
      .filter((i) => !taken.has(i.s) && (category === null || i.c === category) && allowed(i, diets))
      .map((i) => ({ i, s: score(i, picks) }))
      .sort((a, b) => b.s - a.s || a.i.t.localeCompare(b.i.t))
      .map((x) => x.i);
  }

  // Board-wide ideas, at most two per category in each batch of `size`.
  function recommendations(picks, { diets = [], size = 6 } = {}) {
    const ranked = rank(picks, { diets });
    const out = [];
    let pool = ranked.slice(0, 80);
    while (pool.length && out.length < 60) {
      const counts = {};
      const next = [];
      const batch = [];
      pool.forEach((i) => {
        // two per category at most, and not two of the same style (grapes and champagne grapes)
        const twin = batch.some((o) => o.c === i.c && o.r === i.r);
        if (batch.length < size && (counts[i.c] || 0) < 2 && !twin) {
          counts[i.c] = (counts[i.c] || 0) + 1;
          batch.push(i);
        } else next.push(i);
      });
      if (!batch.length) {
        out.push(...pool.slice(0, size));
        pool = pool.slice(size);
        continue;
      }
      out.push(...batch);
      pool = next;
    }
    return out;
  }

  // Why an ingredient is being suggested, from the board's point of view.
  function reason(item, picks) {
    const mates = picks.filter((p) => pairs(item, p));
    const chips = [];
    if (mates.length) {
      chips.push({ kind: "pair", text: "Goes with " + mates.slice(0, 2).map((m) => m.t).join(", ") + (mates.length > 2 ? " +" + (mates.length - 2) : "") });
    }
    if (picks.length) {
      const cat = catOf(item);
      if (!inCat(picks, item.c).length && item.c <= 6) chips.push({ kind: "gap", text: "Your board has no " + cat.label.toLowerCase() + " yet" });
      else if (!picks.some(isSweet) && isSweet(item)) chips.push({ kind: "gap", text: "Adds something sweet" });
      else if (!picks.some(isAcid) && isAcid(item)) chips.push({ kind: "gap", text: "Adds acidity" });
      else if (!picks.some(isCrunch) && isCrunch(item)) chips.push({ kind: "gap", text: "Adds crunch" });
      if (item.c === 0) {
        const roles = inCat(picks, 0).map((p) => p.r);
        if (roles.length && roles.indexOf(item.r) === -1) chips.push({ kind: "gap", text: "A new cheese texture" });
      }
    } else if (data.starters.indexOf(item.s) !== -1) {
      chips.push({ kind: "gap", text: "An easy place to start" });
    }
    const why = mates.map((m) => note(item, m)).find(Boolean) || "";
    const mate = mates.find((m) => note(item, m)) || null;
    return { chips: chips.slice(0, 2), why, mate: mate ? mate.t : "" };
  }

  // ------------------------------------------------------------ advice

  function spacingTips(picks) {
    const placed = picks.filter((p) => p.c === 0 || p.c === 1);
    const crowd = new Map();
    placed.forEach((a) => {
      placed.forEach((b) => {
        if (a.s === b.s || !hits(a.x, b)) return;
        if (!crowd.has(b)) crowd.set(b, []);
        crowd.get(b).push(a.t);
      });
    });
    // group the delicate items that need space from the same strong ones
    const byStrong = new Map();
    const covered = new Set();
    [...crowd.entries()]
      .sort((x, y) => y[1].length - x[1].length)
      .forEach(([mild, strong]) => {
        if (covered.has(mild.t)) return;
        const key = strong.slice().sort().join("|");
        if (!byStrong.has(key)) byStrong.set(key, { mild: [], strong });
        byStrong.get(key).mild.push(mild.t);
        covered.add(mild.t);
        strong.forEach((t) => covered.add(t));
      });
    return [...byStrong.values()].slice(0, 2);
  }

  const spacingText = (t) =>
    t.mild.length > 1
      ? `Give ${list(t.mild)} their own corners, away from ${list(t.strong)}`
      : `Give ${t.mild[0]} its own corner, away from ${list(t.strong)}`;

  // Each tip: { level: "good" | "todo" | "tip", text, category? }
  function advice(picks, { diets = [] } = {}) {
    const out = [];
    const count = (idx) => inCat(picks, idx).length;
    if (!picks.length) {
      out.push({ level: "todo", text: "Start with a cheese or two. Everything else gets matched to what you pick.", category: 0 });
      return out;
    }
    const cheeses = inCat(picks, 0);
    if (!cheeses.length) out.push({ level: "todo", text: "Add a cheese. It anchors the board, and most pairings are built around it.", category: 0 });
    else if (cheeses.length === 1) out.push({ level: "tip", text: "Most boards have 2–3 cheeses in different textures: one firm, one soft, one bold.", category: 0 });
    else {
      const roles = new Set(cheeses.map((c) => c.r));
      if (roles.size === 1) out.push({ level: "todo", text: `Your cheeses are all ${cheeses[0].r.toLowerCase()}. Swap one for a different texture so each bite feels different.`, category: 0 });
      else out.push({ level: "good", text: "Your cheeses have different textures." });
      if (cheeses.length > 4) out.push({ level: "tip", text: "That's a lot of cheese. Three or four is plenty unless it's an all-cheese board." });
    }
    if (diets.indexOf("vegetarian") === -1 && cheeses.length && !count(1)) {
      out.push({ level: "tip", text: "Add a cured meat. Its salt and fat play off the cheese.", category: 1 });
    }
    const salty = picks.some((p) => p.c === 0 || p.c === 1);
    if (salty) out.push({ level: "good", text: "Salt and fat: the base every board needs." });
    if (picks.some(isSweet)) out.push({ level: "good", text: "Something sweet to balance the salt." });
    else out.push({ level: "todo", text: "Nothing sweet yet. Fruit, honey or jam balance the salt.", category: 3 });
    if (picks.some(isAcid)) out.push({ level: "good", text: "Acidity to cut through the richness." });
    else out.push({ level: "todo", text: "Nothing acidic yet. Pickles, olives or fresh fruit cut through the richness.", category: 6 });
    if (picks.some(isCrunch)) out.push({ level: "good", text: "Crunch from crackers or nuts." });
    else out.push({ level: "todo", text: "No crunch yet. Crackers or nuts give people something to build bites on.", category: 2 });

    spacingTips(picks).forEach((t) => {
      out.push({ level: "tip", text: `${spacingText(t)}, so the flavors don't run together.` });
    });
    const notDiet = diets.length ? picks.filter((p) => !allowed(p, diets)) : [];
    if (notDiet.length) out.push({ level: "todo", text: `${list(notDiet.map((p) => p.t))} ${notDiet.length > 1 ? "don't" : "doesn't"} fit the dietary needs you set.` });
    if (picks.length > 16) out.push({ level: "tip", text: "That's a big board, best for a crowd of 15 or more." });

    const order = { todo: 0, tip: 1, good: 2 };
    return out.sort((a, b) => order[a.level] - order[b.level]);
  }

  // The note shown right after something is added.
  function addedNote(item, picks) {
    const others = picks.filter((p) => p.s !== item.s);
    const mate = others.filter((p) => pairs(item, p)).find((p) => note(item, p));
    if (mate) return { title: `${item.t} + ${mate.t}`, text: note(item, mate) };
    const any = others.find((p) => pairs(item, p));
    if (any) return { title: `${item.t} + ${any.t}`, text: "A pairing our ingredient pages recommend." };
    return { title: `${item.t} added`, text: item.b ? `${item.b}.` : "" };
  }

  // ------------------------------------------------------------ amounts

  function parseServe(v) {
    const m = String(v || "").match(/([\d.]+)(?:\s*[–-]\s*([\d.]+))?\s*([a-z]+)?/i);
    if (!m) return null;
    const lo = parseFloat(m[1]);
    return { lo, hi: m[2] ? parseFloat(m[2]) : lo, unit: (m[3] || "").toLowerCase() };
  }

  function fmtOz(oz) {
    if (oz < 16) return Math.max(1, Math.round(oz * 2) / 2) + " oz";
    return Math.round((oz / 16) * 4) / 4 + " lb";
  }

  const plural = (k, one, many) => k + " " + (k === 1 ? one : many);

  const GENERIC = [
    [/pinch|grind/, "1 small jar or tin"],
    [/sprig|garnish/, "1 small bunch or pack"],
    [/drizzle/, "1 small bottle"],
    [/spoon/, "1 small jar"]
  ];

  // Returns { amount, note } for one item.
  function amount(item, picks, guests, mode) {
    const g = guests;
    const main = mode === "main";
    const key = catOf(item).key;
    const n = Math.max(1, inCat(picks, item.c).length);
    const serve = parseServe(item.v);
    const per = serve ? (main ? serve.hi : serve.lo) : 0;

    if (key === "cheese" || key === "meat") {
      let total = g * (main ? 3.5 : 2.5);
      if (g > 12) total *= key === "cheese" ? 1.15 : 1.1;
      const oz = total / n;
      let extra = "";
      if (key === "meat" && /Dry-cured ham|Salami|Air-dried/.test(item.r)) {
        extra = "about " + plural(Math.max(1, Math.ceil(oz / 3)), "pack", "packs") + " of 3 oz";
      }
      return { amount: fmtOz(oz), note: extra };
    }
    if (key === "crackers") {
      const pieces = Math.ceil((g * (main ? 11 : 7)) / n);
      if (/baguette|ciabatta|sourdough|focaccia|bread|pumpernickel/.test(item.s)) {
        return { amount: "about " + pieces + " slices", note: plural(Math.max(1, Math.ceil(pieces / 24)), "loaf", "loaves") };
      }
      return { amount: "about " + pieces + " pieces", note: plural(Math.max(1, Math.ceil(pieces / 35)), "box or bag", "boxes or bags") };
    }
    if (key === "fruit") {
      if (!serve || serve.unit === "oz") return { amount: fmtOz(Math.max(4, (g * (main ? 3 : 2)) / n)), note: "" };
      return { amount: "about " + Math.ceil(g * per) + " " + serve.unit, note: "" };
    }
    if (serve && serve.unit === "oz") {
      const min = key === "finish" ? 1 : key === "nuts" ? 3 : 4;
      const oz = Math.max(min, g * per);
      return { amount: fmtOz(oz), note: key === "spreads" && oz <= 12 ? "one small jar covers it" : "" };
    }
    const v = String(item.v || "").toLowerCase();
    const hit = GENERIC.find((x) => x[0].test(v));
    return { amount: hit ? hit[1] : item.v || "to taste", note: "" };
  }

  function totals(picks, guests, mode) {
    const main = mode === "main";
    const out = {};
    ["cheese", "meat"].forEach((key, idx) => {
      if (!inCat(picks, idx).length) return;
      let total = guests * (main ? 3.5 : 2.5);
      if (guests > 12) total *= key === "cheese" ? 1.15 : 1.1;
      out[key] = fmtOz(total);
    });
    return out;
  }

  function shoppingList(picks, guests, mode) {
    return cats
      .map((cat, idx) => ({
        section: cat.section,
        items: inCat(picks, idx).map((p) => ({ slug: p.s, name: p.t, role: p.b, ...amount(p, picks, guests, mode) }))
      }))
      .filter((group) => group.items.length);
  }

  // Build order, from the site's build-sequence post. Returns [{ label, text }].
  // ------------------------------------------------------------ presentation
  // From the site's build-sequence, presentation and board-size posts.

  function boardSize(guests) {
    if (guests <= 3) return "An 8–10 inch board is plenty. A bigger one will look empty.";
    if (guests <= 7) return "Use a 12–14 inch board, or a 12 x 16 inch rectangle.";
    if (guests <= 11) return "Use a 16–18 inch board, or two 12-inch boards side by side (one mild, one bold).";
    if (guests <= 20) return "Split it across three or four medium boards set out as stations, so people can reach from every side and you can refill one at a time.";
    return "Think in stations, not one board: one board for every 8–10 people, each with its own cheese knife and spoons.";
  }

  function cheeseHow(p) {
    if (p.r === "Blue") return `crumble ${p.t} loosely into a rough pile`;
    if (/brie|camembert|triple|coulommiers|humboldt|red-hawk|cambozola|vegan-brie/.test(p.s)) return `score the top of ${p.t} in a crosshatch and leave it whole`;
    if (p.r === "Washed-rind") return `leave ${p.t} whole with a knife beside it`;
    if (p.r === "Soft & fresh" || p.r === "Plant-based") return `set ${p.t} in a small dish with a spoon or spreader`;
    if (p.r === "Aged & hard") return `cut two or three pieces of ${p.t} and lean them against the block`;
    return `slice ${p.t} into thin triangles and fan them`;
  }

  function meatHow(p) {
    if (/prosciutto|jamon|serrano|bayonne|speck|culatello|ham|bundnerfleisch/.test(p.s)) return `drape ${p.t} in loose folds (not tight rolls)`;
    if (/coppa|lomo|capicola/.test(p.s)) return `roll ${p.t} into loose rosettes`;
    if (/bresaola/.test(p.s)) return `drape ${p.t} in rough quarter-folds so the deep red shows`;
    if (/mortadella/.test(p.s)) return `fold ${p.t} into quarters or half-moons`;
    if (p.r === "Smoked & tinned fish") return `lay ${p.t} in overlapping pieces, or serve it in its tin on a small plate`;
    if (p.r === "Spreadable") return `serve ${p.t} in a small dish with a knife`;
    if (p.r === "Salami" || p.r === "Cooked sausage & deli") return `fold ${p.t} slices into quarters and fan them, or shingle them in a row`;
    return `fold ${p.t} loosely and keep each meat in its own cluster`;
  }

  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  // Returns { board, steps: [{ label, text }], tips: [text] }
  function presentation(picks, guests) {
    const of = (idx) => inCat(picks, idx);
    const names = (arr) => list(arr.map((p) => p.t));
    const steps = [];
    const temper = picks.filter((p) => /temper/.test(p.m || ""));
    if (temper.length) {
      const mins = Math.max(...temper.map((p) => parseInt(p.m, 10) || 30));
      steps.push({ label: `${mins} minutes before`, text: `Take ${names(temper)} out of the fridge. Cold dulls flavor, and soft cheeses need time to loosen.` });
    }
    const bowls = of(4).concat(of(6));
    if (bowls.length) {
      const many = bowls.length > 1;
      steps.push({ label: "Bowls first", text: `Put ${names(bowls)} in ${many ? "small bowls" : "a small bowl"}. Set ${many ? "them" : "it"} next to the cheese ${many ? "they go" : "it goes"} with. Bowls anchor the layout and add height.` });
    }
    if (of(0).length) {
      const spread = of(0).length > 1 ? "Space the cheeses apart so people spread out around the board. " : "";
      const tips = spacingTips(picks).map((t) => ` ${spacingText(t)}.`).join("");
      steps.push({ label: of(0).length > 1 ? "Cheeses" : "Cheese", text: `${spread}${cap(of(0).map(cheeseHow).join("; "))}.${tips}` });
    }
    if (of(1).length) {
      steps.push({ label: of(1).length > 1 ? "Meats" : "Meat", text: `${cap(of(1).map(meatHow).join("; "))}. Set ${of(1).length > 1 ? "them" : "it"} between and around the cheese.` });
    }
    const fillers = of(3).concat(of(5));
    if (fillers.length) steps.push({ label: "Fill the gaps", text: `Tuck ${names(fillers)} into every empty space. Put dark pieces next to pale ones so both stand out.` });
    if (of(7).length) steps.push({ label: "Garnish", text: `Finish with ${names(of(7))}.` });
    if (of(2).length) steps.push({ label: "Right before serving", text: `Add ${names(of(2))}. Stand crackers upright in small clusters for height; they go soft if they sit out early.` });

    const tips = [
      "Aim to cover about 80% of the board. Some small gaps look inviting; big empty patches look sparse.",
      "Repeat colors in a few spots instead of grouping them in one corner.",
      of(0).length ? `Give each cheese its own knife${of(0).length > 1 ? `, ${of(0).length} in all,` : ""} so flavors don't mix. A small label helps people choose.` : "",
      guests > 12 ? "Keep half of everything in the fridge and restock after the first hour." : "",
      "Don't leave meat and cheese out for more than 2 hours."
    ].filter(Boolean);

    return { board: boardSize(guests), steps, tips };
  }

  // Per-item prep from the ingredient pages (loaded separately).
  function prepFor(picks, prep) {
    return picks
      .slice()
      .sort((a, b) => a.c - b.c)
      .map((p) => ({ slug: p.s, name: p.t, steps: (prep && prep[p.s]) || [] }))
      .filter((x) => x.steps.length);
  }

  function whyItWorks(picks, limit = 8) {
    const out = [];
    for (let a = 0; a < picks.length; a += 1) {
      for (let b = a + 1; b < picks.length; b += 1) {
        if (pairs(picks[a], picks[b])) out.push({ a: picks[a].t, b: picks[b].t, text: note(picks[a], picks[b]) });
      }
    }
    out.sort((x, y) => (y.text ? 1 : 0) - (x.text ? 1 : 0));
    return out.slice(0, limit);
  }

  return {
    bySlug, get, cats, catOf, allowed, pairs, note, rank, recommendations, reason,
    advice, addedNote, amount, totals, shoppingList, presentation, prepFor, whyItWorks
  };
}
