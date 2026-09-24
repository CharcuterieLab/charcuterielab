# Source for combos.json. Run: python3 make_combos.py
import json
def c(foods, name, why, rule, post="", featured=False):
    return {"foods": foods, "name": name, "why": why, "rule": rule, "post": post, "featured": featured}
P = [
 c(["brie","fig-jam"], "Brie + Fig Jam", "Sweet, dense jam against mild, salty cream. The pairing most people try first, for good reason.", "salt-sweet", "brie-fig-jam-walnut-pairing", True),
 c(["manchego","membrillo"], "Manchego + Membrillo", "Spain's nutty sheep's cheese with its own quince paste. Firm and sweet, salty and floral.", "place", "manchego-membrillo-pairing", True),
 c(["prosciutto-di-parma","melon"], "Prosciutto + Melon", "Salt makes the melon sweeter; the melon's water makes the ham taste silkier.", "salt-sweet", "prosciutto-melon-pairing", True),
 c(["parmigiano-reggiano","balsamic-glaze"], "Parmigiano + Balsamic", "Two products of Emilia-Romagna: salty crystals and sweet-tart glaze.", "place", "", False),
 c(["gorgonzola","fig-jam"], "Gorgonzola + Fig Jam", "Sweet jam rounds off blue cheese's sharp, salty edge.", "salt-sweet", "gorgonzola-fig-jam-pairing", False),
 c(["stilton","walnuts"], "Stilton + Walnuts", "Crunchy, slightly bitter walnuts against rich, crumbly blue.", "texture", "stilton-port-walnut-pairing", False),
 c(["aged-cheddar","apples"], "Aged Cheddar + Apple", "Crisp, tart apple cuts the fat of a sharp cheddar and resets your palate.", "acid", "aged-cheddar-apple-pairing", True),
 c(["burrata","prosciutto-di-parma"], "Burrata + Prosciutto", "Cool, milky cream against salty, silky ham.", "texture", "burrata-prosciutto-pairing", False),
 c(["chorizo","manchego"], "Chorizo + Manchego", "The Spanish tapas pair: smoky paprika pork and nutty sheep's cheese.", "place", "chorizo-manchego-pairing", False),
 c(["fresh-chevre","honey"], "Goat Cheese + Honey", "Honey softens chèvre's tang; the tang keeps honey from tasting cloying.", "salt-sweet", "chevre-honey-pairing", False),
 c(["mortadella","pistachios"], "Mortadella + Pistachios", "Bologna's silky sausage already has pistachios inside. Serve extra on the side.", "place", "", False),
 c(["pecorino-romano","honey"], "Pecorino + Honey", "Sharp, salty sheep's cheese with a drizzle of honey. A Roman after-dinner classic.", "salt-sweet", "pecorino-honey-pairing", False),
]
T = [
 c(["brie","fig-jam","walnuts"], "Brie + Fig Jam + Walnuts", "Creamy, sweet and crunchy in one bite. The walnut adds the texture brie lacks.", "texture", "brie-fig-jam-walnut-pairing", True),
 c(["gorgonzola","pears","walnuts"], "Gorgonzola + Pear + Walnuts", "Juicy pear cools the blue, walnuts add crunch and a bitter edge.", "salt-sweet", "blue-cheese-pear-walnut-pairing", True),
 c(["prosciutto-di-parma","melon","fresh-mint"], "Prosciutto + Melon + Mint", "Mint adds a cool, bright top note to the salt-sweet classic.", "salt-sweet", "prosciutto-melon-pairing", False),
 c(["smoked-salmon","cream-cheese","capers"], "Smoked Salmon + Cream Cheese + Capers", "Smoke, cream and brine: the bagel-shop trio.", "acid", "smoked-salmon-cream-cheese-capers-lemon-pairing", True),
 c(["comte","pears","walnuts"], "Comté + Pear + Walnuts", "Nutty cheese, nutty walnut, and pear to keep it fresh.", "weight", "comte-pear-walnut-pairing", False),
 c(["manchego","chorizo","marcona-almonds"], "Manchego + Chorizo + Marcona Almonds", "A tapas bar in three bites: nutty, smoky and salty-crunchy.", "place", "", True),
 c(["fresh-chevre","honey","pistachios"], "Goat Cheese + Honey + Pistachios", "Tangy, sweet and crunchy, with a green-and-gold look that photographs well.", "texture", "chevre-honey-pairing", False),
 c(["aged-gouda","dark-chocolate","flaky-sea-salt"], "Aged Gouda + Dark Chocolate + Sea Salt", "Caramel crystals, bitter cocoa and a pinch of salt: a dessert board in one bite.", "salt-sweet", "aged-gouda-dark-chocolate-sea-salt-pairing", False),
]
Q = [
 c(["burrata","prosciutto-di-parma","fresh-basil","olive-oil"], "Burrata + Prosciutto + Basil + Olive Oil", "An Italian summer plate: cream, salt, herb and a peppery finish.", "texture", "prosciutto-burrata-basil-olive-oil-pairing", True),
 c(["manchego","chorizo","membrillo","marcona-almonds"], "The Spanish Four", "Nutty cheese, smoky pork, sweet quince and salty almonds. Every Spanish tapas flavor on one cracker.", "place", "", True),
 c(["smoked-salmon","cream-cheese","capers","pickled-red-onions"], "The Bagel Board Four", "Smoke, cream, brine and sharp pickled onion. Put it on a bagel chip.", "acid", "smoked-salmon-cream-cheese-capers-lemon-pairing", False),
 c(["brie","pears","honey","walnuts"], "Brie + Pear + Honey + Walnuts", "Soft, juicy, sweet and crunchy: four textures that make mild brie taste bigger.", "texture", "brie-pear-honey-walnut-pairing", True),
 c(["gruyere","prosciutto-cotto","cornichons","dijon-mustard"], "The French Ham & Cheese", "Nutty Gruyère, sweet ham, sour cornichons and sharp Dijon: a croque-monsieur without the bread.", "acid", "gruyere-ham-cornichon-dijon-pairing", True),
 c(["fresh-chevre","honey","figs","pistachios"], "Goat Cheese + Fig + Honey + Pistachio", "Tangy, jammy, sweet and crunchy. The prettiest bite on a fall board.", "salt-sweet", "", False),
]
json.dump({"pairs": P, "trios": T, "quartets": Q}, open("combos.json", "w"), indent=1, ensure_ascii=False)
print(len(P), len(T), len(Q))
