"""Diet verdicts for every ingredient page -> content/dietary/ingredient-diets.json

Run from charcuterielab/:  python3 scripts/make_ingredient_diets.py

Each ingredient gets a verdict per diet: "safe", "check" (varies by brand or
recipe - read the label) or "skip", plus a one-line reason. Defaults come
from the ingredient frontmatter (category, role_group, allergens); OVERRIDES
below are the hand-checked exceptions. Edit this file, re-run it, then build:
the build fails if any ingredient is missing a verdict.

How we classify (shown on /dietary/how-we-classify/):
- safe  = nothing in the usual recipe breaks the diet
- check = some brands or recipes break it; the label tells you which
- skip  = the usual recipe breaks it
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)                       # charcuterielab/
REPO = os.path.dirname(SITE)
SRC = [os.path.join(REPO, "content", "ingredients"), os.path.join(SITE, "content", "ingredients")]
OUT = os.path.join(SITE, "content", "dietary", "ingredient-diets.json")

DIETS = ["gluten-free", "nut-free", "vegetarian", "vegan", "dairy-free"]

def front(path):
    t = open(path, encoding="utf8").read()
    fm = t.split("---")[1]
    def g(k):
        m = re.search(r"^" + k + r":\s*(.*)$", fm, re.M)
        return m.group(1).strip().strip('"') if m else ""
    al = [a.strip().strip('"').lower() for a in g("allergens").strip("[]").split(",") if a.strip()]
    tags = [a.strip().strip('"').lower() for a in g("tags").strip("[]").split(",") if a.strip()]
    return dict(title=g("title"), cat=g("category"), role=g("role_group"), al=al, tags=tags)

# Cheeses whose traditional rules call for animal rennet. Sources: Vegetarian
# Society "usually not vegetarian" list (vegsoc.org/news/vegetarian-cheese/)
# and the Parmigiano-Reggiano specification (calf rennet).
ANIMAL_RENNET = {
    "parmigiano-reggiano": "The official recipe requires calf rennet.",
    "grana-padano": "Made like Parmigiano-Reggiano, with animal rennet.",
    "pecorino-romano": "Traditionally made with lamb rennet.",
    "gorgonzola": "Usually made with animal rennet (Vegetarian Society).",
    "gruyere": "Usually made with animal rennet. Look for a gruyère-style cheese labeled vegetarian.",
    "roquefort": "Usually made with animal rennet (Vegetarian Society).",
    "emmental": "Usually made with animal rennet. Some supermarket Swiss is vegetarian; check the label.",
    "raclette": "Usually made with animal rennet (Vegetarian Society).",
    "camembert": "Usually made with animal rennet. Some supermarket camembert is vegetarian; check the label.",
    "manchego": "Usually made with animal rennet. A few brands use vegetable rennet; check the label.",
    "parmesan-crisps": "Made from Parmigiano-Reggiano or parmesan, usually with animal rennet.",
}
# acid- or culture-set fresh cheeses (Vegetarian Society "usually vegetarian")
ACID_SET = {"ricotta", "mascarpone", "cream-cheese"}

SAFE_BASES = {"rice-crackers", "cassava-crackers", "chickpea-crackers", "plantain-chips", "tortilla-chips",
              "tostada-rounds", "root-vegetable-chips", "vegetable-bases", "socca", "matzo", "water-crackers",
              "flaxseed-crackers", "papadum", "baguette", "sourdough", "ciabatta", "pita-chips", "grissini",
              "lavash", "pane-carasau", "friselle", "taralli", "melba-toast", "saltines", "crostini",
              "olive-oil-crackers", "rosemary-crackers", "seeded-crackers", "sesame-crackers", "rye-crispbread",
              "everything-crackers", "whole-wheat-crackers", "pretzel-crisps", "focaccia"}
HONEY = re.compile(r"honey")

def verdicts(slug, f):
    al, cat, role = f["al"], f["cat"], f["role"]
    has = lambda *xs: any(x in al for x in xs)
    plant_cheese = role == "Plant-based"
    meat = cat == "Cured Meat & Seafood"
    fish = has("fish", "shellfish") or (meat and role == "Smoked & tinned fish")
    v = {}

    # ---------------- gluten-free
    if has("gluten", "wheat", "rye", "oats"):
        v["gluten-free"] = ("skip", "Contains " + ", ".join(a for a in al if a in ("wheat", "rye", "oats", "gluten")) + ".")
    elif cat == "Crackers & Breads":
        v["gluten-free"] = ("check", "Naturally free of wheat, but buy a box labeled gluten-free: some share lines with wheat.")
    elif meat and role in ("Dry-cured ham", "Air-dried whole muscle", "Cured fat"):
        v["gluten-free"] = ("safe", "Whole-muscle cured meat: meat, salt and time.")
    elif meat and role == "Smoked & tinned fish":
        v["gluten-free"] = ("safe", "Plain cured or smoked fish has no gluten. Check tins packed in sauce.")
    elif meat:
        v["gluten-free"] = ("check", "Most are gluten-free, but some brands add wheat-based binders or seasonings. Read the label.")
    elif cat == "Cheese" and plant_cheese:
        v["gluten-free"] = ("check", "Plant cheeses vary; some use wheat-based thickeners.")
    elif cat == "Cheese":
        v["gluten-free"] = ("safe", "Plain cheese is naturally gluten-free.")
    elif role == "Candied & spiced nuts":
        v["gluten-free"] = ("check", "Coatings and seasonings can contain wheat. Read the label.")
    else:
        v["gluten-free"] = ("safe", "No gluten in the usual recipe.")

    # ---------------- nut-free
    if has("tree nuts", "peanuts"):
        v["nut-free"] = ("skip", "Contains " + " and ".join(a for a in al if a in ("tree nuts", "peanuts")) + ".")
    elif cat == "Nuts & Seeds":
        v["nut-free"] = ("check", "Seeds are nut-free, but many are packed with nuts. Look for a nut-free facility statement.")
    elif role in ("Chocolate & sweets", "Dessert base"):
        v["nut-free"] = ("check", "Often made on lines shared with nuts. Check the 'may contain' line.")
    else:
        v["nut-free"] = ("safe", "No nuts in the usual recipe.")

    # ---------------- vegetarian
    if meat and fish:
        v["vegetarian"] = ("skip", "Fish or seafood.")
    elif meat:
        v["vegetarian"] = ("skip", "Meat.")
    elif has("fish", "shellfish"):
        v["vegetarian"] = ("skip", "Contains fish or seafood.")
    elif slug in ANIMAL_RENNET:
        v["vegetarian"] = ("skip", ANIMAL_RENNET[slug])
    elif cat == "Cheese" and (plant_cheese or slug in ACID_SET):
        v["vegetarian"] = ("safe", "No rennet: set with acid or cultures." if not plant_cheese else "Plant-based, no animal ingredients.")
    elif cat == "Cheese":
        v["vegetarian"] = ("check", "Rennet varies by brand. Look for 'vegetarian', 'microbial' or 'vegetable rennet' on the label.")
    else:
        v["vegetarian"] = ("safe", "No meat or fish in the usual recipe.")

    # ---------------- dairy-free
    if cat == "Cheese" and not plant_cheese:
        v["dairy-free"] = ("skip", "Made from milk.")
    elif has("dairy"):
        v["dairy-free"] = ("skip", "Contains milk.")
    elif cat == "Crackers & Breads" and slug not in SAFE_BASES:
        v["dairy-free"] = ("check", "Some recipes add butter, whey or milk powder.")
    elif meat and role in ("Salami", "Cooked sausage & deli", "Spreadable"):
        v["dairy-free"] = ("check", "Some brands add milk powder or lactose as a binder.")
    else:
        v["dairy-free"] = ("safe", "No milk in the usual recipe.")

    # ---------------- vegan
    if v["vegetarian"][0] == "skip":
        v["vegan"] = ("skip", v["vegetarian"][1])
    elif cat == "Cheese" and not plant_cheese:
        v["vegan"] = ("skip", "Made from milk.")
    elif has("dairy"):
        v["vegan"] = ("skip", "Contains milk.")
    elif has("egg", "eggs"):
        v["vegan"] = ("skip", "Contains egg.")
    elif HONEY.search(slug) or role == "Honey":
        v["vegan"] = ("skip", "Honey isn't vegan.")
    elif v["dairy-free"][0] == "check":
        v["vegan"] = ("check", v["dairy-free"][1])
    else:
        v["vegan"] = ("safe", "Plant-based in the usual recipe.")
    return v

# Hand-checked exceptions: {slug: {diet: (verdict, reason)}}
OVERRIDES = {
    # gluten
    "vegetable-bases": {"gluten-free": ("safe", "Sliced vegetables: no gluten.")},
    "cheddar-crisps": {"gluten-free": ("safe", "100% baked cheese in most brands."),
                       "vegetarian": ("check", "Cheese rennet varies by brand. Look for 'vegetarian' on the label.")},
    "parmesan-crisps": {"gluten-free": ("safe", "100% baked cheese in most brands.")},
    "socca": {"gluten-free": ("safe", "Made at home from chickpea flour, water and oil.")},
    "pao-de-queijo": {"gluten-free": ("safe", "Made with tapioca flour, not wheat."),
                      "vegetarian": ("check", "Often made with parmesan, usually animal rennet. Use a vegetarian hard cheese.")},
    "muhammara": {"gluten-free": ("check", "Traditional recipes thicken it with breadcrumbs.")},
    "romesco": {"gluten-free": ("check", "Traditional recipes thicken it with toasted bread.")},
    "chili-oil": {"gluten-free": ("check", "Some chili crisps contain soy sauce made with wheat."),
                  "vegetarian": ("check", "Some chili crisps contain dried shrimp."),
                  "vegan": ("check", "Some chili crisps contain dried shrimp.")},
    "dark-chocolate": {"gluten-free": ("check", "Some bars contain barley malt or cookie pieces."),
                       "vegan": ("check", "Many dark chocolates contain milk. Look for one with no milk listed."),
                       "dairy-free": ("check", "Many dark chocolates contain milk. Look for one with no milk listed.")},
    "amaretti": {"gluten-free": ("check", "Traditional amaretti are flourless. Some brands add wheat.")},
    "mango-chutney": {"gluten-free": ("check", "Some brands use malt vinegar, made from barley.")},
    "whole-grain-mustard": {"gluten-free": ("check", "Some brands use beer or malt vinegar.")},
    "dijon-mustard": {"gluten-free": ("check", "Most are gluten-free; a few use malt vinegar.")},
    "honey-mustard": {"gluten-free": ("check", "Most are gluten-free; a few use malt vinegar.")},
    "pimento-cheese": {"gluten-free": ("check", "Store-bought tubs can contain thickeners. Read the label."),
                       "vegetarian": ("check", "Cheese rennet varies by brand. Look for 'vegetarian' on the label.")},
    "bacon-jam": {"gluten-free": ("check", "Some recipes use beer or soy sauce.")},
    "kimchi": {"gluten-free": ("check", "Some brands use wheat flour paste or soy sauce.")},
    "medjool-dates": {"gluten-free": ("safe", "Whole dates are gluten-free. Chopped dates are sometimes dusted with oat flour.")},
    "sea-salt-caramels": {"gluten-free": ("check", "Most are gluten-free; check for malt or wheat.")},
    "chocolate-hazelnut-spread": {"gluten-free": ("check", "Usually gluten-free; check the label.")},
    "everything-bagel-seasoning": {"gluten-free": ("check", "Usually gluten-free; some blends are packed in shared facilities.")},
    "black-forest-ham": {"gluten-free": ("safe", "Whole-muscle ham. Check pre-sliced packs for added glazes.")},
    "prosciutto-cotto": {"gluten-free": ("check", "Cooked ham can have added binders. Read the label.")},
    "tinned-octopus": {"gluten-free": ("check", "Plain octopus is gluten-free; check tins packed in sauce.")},
    "sardines": {"gluten-free": ("check", "Plain sardines are gluten-free; check tins packed in sauce.")},
    "tinned-mackerel": {"gluten-free": ("check", "Plain mackerel is gluten-free; check tins packed in sauce.")},
    "truffle-cheese": {"gluten-free": ("check", "Flavored cheese: check the added ingredients.")},
    # nuts
    "pink-peppercorns": {"nut-free": ("check", "Pink peppercorns are in the cashew family. Guests allergic to cashews or pistachios can react.")},
    "pumpkin-seeds": {"nut-free": ("check", "A good nut swap. Buy a bag made in a nut-free facility.")},
    "sunflower-seeds": {"nut-free": ("check", "A good nut swap. Buy a bag made in a nut-free facility.")},
    "pesto": {"vegetarian": ("check", "Classic pesto uses Parmigiano-Reggiano, made with animal rennet. Some jars use vegetarian cheese.")},
    "gougeres": {"vegetarian": ("check", "Usually made with gruyère or parmesan, often animal rennet. Use a vegetarian hard cheese.")},
    "whipped-feta": {"vegetarian": ("check", "Feta rennet varies by brand. Look for 'vegetarian' on the label.")},
    "tapenade": {"vegetarian": ("check", "Many recipes add anchovies; others are just olives and capers. Check the label."),
                 "vegan": ("check", "Many recipes add anchovies; others are just olives and capers. Check the label.")},
    "mortadella": {"nut-free": ("check", "Many brands add pistachios; plain mortadella exists. Check the label.")},
    "graham-crackers": {"vegan": ("check", "Many graham crackers contain honey.")},
    "candied-pecans": {"vegan": ("check", "Often coated with butter or egg white."), "dairy-free": ("check", "Often coated with butter.")},
    "spiced-nut-mix": {"vegan": ("check", "Some mixes use butter or egg white."), "dairy-free": ("check", "Some mixes use butter.")},
    "nut-brittle": {"vegan": ("check", "Most brittle uses butter."), "dairy-free": ("check", "Most brittle uses butter.")},
    "baba-ganoush": {"vegan": ("check", "Usually vegan; some versions add yogurt."), "dairy-free": ("check", "Usually dairy-free; some versions add yogurt.")},
}

def main():
    files = {}
    for d in SRC:
        if os.path.isdir(d):
            for f in os.listdir(d):
                if f.endswith(".md"):
                    files[f[:-3]] = os.path.join(d, f)
    out, unknown = {}, []
    for slug in sorted(files):
        f = front(files[slug])
        v = verdicts(slug, f)
        for k, val in OVERRIDES.get(slug, {}).items():
            v[k] = val
        out[slug] = {d: {"v": v[d][0], "why": v[d][1]} for d in DIETS}
    for key in OVERRIDES:
        base = key
        if base not in files:
            unknown.append(key)
    if unknown:
        sys.exit("Unknown slugs in OVERRIDES: " + ", ".join(unknown))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf8", newline="\n") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    from collections import Counter
    for d in DIETS:
        c = Counter(out[s][d]["v"] for s in out)
        print(f"{d:12} safe {c['safe']:3}  check {c['check']:3}  skip {c['skip']:3}")
    print(f"{len(out)} ingredients -> {os.path.relpath(OUT, REPO)}")

if __name__ == "__main__":
    main()
