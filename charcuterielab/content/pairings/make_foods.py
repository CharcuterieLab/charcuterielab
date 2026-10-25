# Source for foods.json: the editorial layer on top of the ingredient data. Run: python3 make_foods.py
import json
def f(slug, top, answer, faq):
    return {"slug": slug, "top": top, "answer": answer, "faq": [{"q": q, "a": a} for q, a in faq]}
F = [
 f("brie", ["fig-jam", "pears", "walnuts"], "Brie goes best with fig jam, pears, honey and walnuts, on a plain baguette or water cracker. Sweet, juicy and crunchy partners give a mild, creamy cheese the contrast it's missing.",
   [("What fruit goes with brie?", "Pears, apples, grapes, figs and apricots. Juicy fruit cuts the butterfat."), ("What wine goes with brie?", "Champagne or sparkling wine first, then oaked Chardonnay or a light red like Pinot Noir or Beaujolais.")]),
 f("camembert", ["baguette", "brie", "smoked-salmon"], "Camembert goes best with baguette, apples, dry cider and other bloomy-rind cheeses. It's stronger and more mushroomy than brie, so pair it with crisp, fresh partners.",
   [("Camembert or brie?", "Camembert is smaller, stronger and earthier. Choose it if brie tastes bland to you."), ("What drink goes with Camembert?", "Dry Normandy cider is the classic; Chardonnay and Beaujolais work too.")]),
 f("aged-cheddar", ["apples", "whole-grain-mustard", "mango-chutney"], "Aged cheddar goes best with crisp apples, chutney, whole-grain mustard, pickles and honey. Sharp, salty cheddar needs sweet or tart partners to balance it.",
   [("What fruit goes with sharp cheddar?", "Apples above all, plus pears, grapes and dried cranberries."), ("What drink goes with aged cheddar?", "Cabernet Sauvignon, dry cider, IPA or stout. Cheddar is one of the most drink-friendly cheeses.")]),
 f("aged-gouda", ["dark-chocolate", "apples", "smoked-almonds"], "Aged Gouda goes best with dark chocolate, apples, smoked almonds and dried fruit. Its caramel, butterscotch flavor and crunchy crystals suit sweet and toasty partners.",
   [("Why is aged Gouda crunchy?", "Those crystals are amino acids that form as the cheese ages. They mean flavor, not a flaw."), ("What wine goes with aged Gouda?", "Cabernet, Merlot or tawny port. Its caramel notes also love stout and Belgian dubbel.")]),
 f("manchego", ["membrillo", "chorizo", "marcona-almonds"], "Manchego goes best with membrillo (quince paste), chorizo, Marcona almonds, olives and jamón. Spain's nutty sheep's cheese loves the salty, sweet and smoky foods it grew up beside.",
   [("What is membrillo?", "A firm, sweet quince paste from Spain, sliced thin and laid on Manchego."), ("What wine goes with Manchego?", "Spanish reds like Rioja or Tempranillo, dry rosé, or fino sherry.")]),
 f("gruyere", ["cornichons", "dijon-mustard", "prosciutto-cotto"], "Gruyère goes best with cornichons, Dijon mustard, ham, hazelnuts and roasted chestnuts. Nutty, sweet-savory Alpine cheese needs sour, sharp or toasty partners.",
   [("What meat goes with Gruyère?", "Cooked ham, speck and dried beef like Bündnerfleisch."), ("What wine goes with Gruyère?", "Pinot Noir, Chardonnay or a dry Alpine white. Lager and dry cider work too.")]),
 f("comte", ["walnuts", "pears", "saucisson-sec"], "Comté goes best with walnuts, pears, hazelnuts, saucisson sec and baguette. Its brown-butter, nutty flavor pairs with more nuts and fresh fruit.",
   [("Comté or Gruyère?", "Very similar mountain cheeses. Comté is a little sweeter and fruitier; Gruyère is a little saltier."), ("What wine goes with Comté?", "Chardonnay, Champagne, Pinot Noir or Beaujolais.")]),
 f("parmigiano-reggiano", ["balsamic-glaze", "pears", "prosciutto-di-parma"], "Parmigiano-Reggiano goes best with balsamic glaze, pears, dried figs, prosciutto and honey. Salty, savory crystals love sweet and tart partners from the same Italian region.",
   [("How do you serve Parmigiano on a board?", "Break it into rough chunks with a short knife rather than slicing. The crystals show better."), ("What wine goes with Parmigiano-Reggiano?", "Chianti, Lambrusco or Champagne.")]),
 f("pecorino-romano", ["honey", "cracked-black-pepper", "cherry-preserves"], "Pecorino Romano goes best with honey, black pepper, cherry preserves, olives and cured pork. It's very salty and sharp, so small pieces with sweet partners work best.",
   [("Is Pecorino Romano too salty for a board?", "Not in small pieces. Serve it with honey or fruit preserves to balance the salt."), ("What wine goes with Pecorino?", "Chianti, Sangiovese or a light Italian white.")]),
 f("gorgonzola", ["pears", "honey", "walnuts"], "Gorgonzola goes best with pears, honey, walnuts, figs and dark chocolate. Sweet, juicy and crunchy partners tame blue cheese's salt and sharpness.",
   [("Dolce or piccante Gorgonzola?", "Dolce is soft and mild, easier for guests; piccante is firmer and sharper."), ("What wine goes with Gorgonzola?", "Port or a sweet dessert wine. Among dry wines, try an Italian red with some fruit.")]),
 f("stilton", ["walnuts", "honey", "oatcakes"], "Stilton goes best with walnuts, honey, oatcakes, dried fruit and port. Its crumbly, salty richness needs sweetness and crunch.",
   [("What drink goes with Stilton?", "Port is the classic. Stout and sweet dessert wine work too."), ("Is Stilton a strong blue?", "Medium. It's creamier and milder than Roquefort, stronger than Cambozola.")]),
 f("fresh-chevre", ["honey", "figs", "pistachios"], "Fresh goat cheese goes best with honey, figs, pistachios, fresh berries and herbs. Sweet and crunchy partners soften its bright tang.",
   [("What wine goes with goat cheese?", "Sauvignon Blanc, especially from the Loire. Dry rosé and sparkling wine work too."), ("How do you serve chèvre on a board?", "Roll a log in herbs, nuts or pepper, or drizzle it with honey.")]),
 f("burrata", ["prosciutto-di-parma", "fresh-basil", "olive-oil"], "Burrata goes best with prosciutto, basil, good olive oil, ripe tomatoes, peaches and flaky salt. Its cool, milky center needs salt, acid and a little crunch.",
   [("How long can burrata sit out?", "Serve it cold and set out no more than about an hour before eating; it's a fresh cheese."), ("What wine goes with burrata?", "Dry rosé, Sauvignon Blanc or Prosecco.")]),
 f("taleggio", ["prosciutto-di-parma", "speck", "crostini"], "Taleggio goes best with prosciutto, speck, crusty bread, pears and Riesling or Belgian ale. Its funky rind and mild, buttery center suit cured ham and fruity drinks.",
   [("Does Taleggio smell strong?", "The rind does; the inside is mild and buttery. Let it breathe on the board."), ("What drink goes with Taleggio?", "Off-dry Riesling, Belgian ale or Pinot Noir.")]),
 f("fresh-mozzarella", ["fresh-basil", "olive-oil", "prosciutto-di-parma"], "Fresh mozzarella goes best with basil, olive oil, tomatoes, prosciutto and balsamic glaze. It's mild and milky, so bright, salty and herbal partners do the talking.",
   [("Mozzarella or burrata?", "Burrata is mozzarella with a creamy center. Use mozzarella for skewers, burrata for a centerpiece."), ("What wine goes with mozzarella?", "Light, crisp whites and dry rosé.")]),
 f("prosciutto-di-parma", ["melon", "fig-jam", "burrata"], "Prosciutto goes best with melon, figs, fig jam, burrata, Parmigiano and pears. Sweet fruit and creamy cheese balance its silky saltiness.",
   [("How do you arrange prosciutto on a board?", "Loose folds or ribbons, never flat sheets. Separate the slices so guests can pick one up."), ("What wine goes with prosciutto?", "Prosecco, dry rosé, Pinot Noir or Chianti.")]),
 f("genoa-salami", ["pepperoni", "soppressata", "pretzel-crisps"], "Genoa salami goes best with provolone, pickles, olives, mustard and crackers. Mild, garlicky salami is a team player that works with nearly every cheese.",
   [("What cheese goes with Genoa salami?", "Provolone, mild cheddar, Gouda and triple-crème."), ("How do you fold salami for a board?", "Fold rounds in half, then in half again, and line them up in a 'river'.")]),
 f("soppressata", ["fresh-mozzarella", "hot-honey", "giardiniera"], "Soppressata goes best with fresh mozzarella, hot honey, giardiniera, provolone and olives. Its coarse, peppery fat loves cool cheese and tangy pickles.",
   [("Is soppressata spicy?", "Calabrese soppressata is; Veneto-style is mild. Check the label."), ("What wine goes with soppressata?", "Chianti, Malbec or Cabernet.")]),
 f("chorizo", ["manchego", "membrillo", "marcona-almonds"], "Spanish chorizo goes best with Manchego, membrillo, Marcona almonds, olives and roasted peppers. Smoky paprika pork belongs with Spanish cheese and salty snacks.",
   [("Spanish or Mexican chorizo for a board?", "Spanish: it's cured and sliceable. Mexican chorizo is raw and must be cooked."), ("What wine goes with chorizo?", "Rioja, Malbec or dry rosé.")]),
 f("mortadella", ["pistachios", "burrata", "focaccia"], "Mortadella goes best with pistachios, burrata, focaccia, giardiniera and Grana Padano. Silky, mild pork needs crunch, creaminess and a tangy pickle.",
   [("How do you serve mortadella on a board?", "Thin slices, folded, or thick cubes on picks with pistachios."), ("What wine goes with mortadella?", "Lambrusco, Prosecco or Chianti.")]),
 f("smoked-salmon", ["cream-cheese", "capers", "pickled-red-onions"], "Smoked salmon goes best with cream cheese, capers, pickled red onions, dill and rye or blini. Creamy and briny partners balance its rich smoke.",
   [("Is smoked salmon safe on a board?", "Keep it cold and set it out last. Serve within about two hours."), ("What wine goes with smoked salmon?", "Champagne, Sauvignon Blanc or unoaked Chardonnay.")]),
 f("fig-jam", ["brie", "manchego", "prosciutto-di-parma"], "Fig jam goes best with brie, Manchego, blue cheese, prosciutto and walnuts. Its dense sweetness balances salty cheese and cured ham.",
   [("What cheese goes with fig jam?", "Brie, Manchego, goat cheese and blue cheese."), ("How much fig jam for a board?", "One small bowl, about 1/4 cup per 6 guests.")]),
 f("honey", ["gorgonzola", "fresh-chevre", "pecorino-romano"], "Honey goes best with blue cheese, goat cheese, Pecorino, aged cheddar and walnuts. Sweetness softens salty and tangy cheeses.",
   [("Which cheeses need honey?", "Salty or sharp ones: blue cheese, Pecorino and fresh goat cheese."), ("Honeycomb or honey?", "Honeycomb looks better and doesn't run; a honey dipper works in a small jar.")]),
 f("apples", ["aged-cheddar", "aged-gouda", "walnuts"], "Apples go best with aged cheddar, aged Gouda, Gruyère, pecans and walnuts. Crisp, tart apple cuts fat and resets your palate between bites.",
   [("How do you stop apples browning on a board?", "Toss slices in a little lemon juice or cut them last."), ("Which apple is best for cheese?", "Crisp, tart apples like Honeycrisp, Pink Lady or Granny Smith.")]),
 f("dark-chocolate", ["aged-gouda", "flaky-sea-salt", "hazelnuts"], "Dark chocolate goes best with aged Gouda, blue cheese, hazelnuts, dried cherries and sea salt. Bitter cacao loves caramel, salt and toasted nuts.",
   [("What cheese goes with dark chocolate?", "Aged Gouda first, then blue cheese and aged cheddar."), ("What drink goes with dark chocolate?", "Port, Cabernet, Malbec or stout.")]),
]
# Oct 25 2026: fuller pages for the four food guides that lost their searches.
# serve = "How to serve" paragraphs; faq = replaces the short FAQ; guide = link to the matching buying guide.
EXTRA = {
 "chorizo": dict(
  serve=["Use Spanish-style cured chorizo, the firm, dry sausage you can slice and eat as is. Fresh Mexican chorizo is raw and needs cooking, so save it for queso fundido. Peel the casing if it's tough or plastic, then slice the sausage thin on a slight angle so every round is one bite.",
         "Take it out of the fridge about 20 minutes before guests arrive so the fat softens and the paprika comes through. Count it toward the 2 to 3 oz of cured meat per guest on an appetizer board, and set it right next to Manchego and a small dish of membrillo so guests stack all three."],
  guide=["Which chorizo to buy: our ranking of Spanish chorizo brands", "/blog/best-spanish-chorizo/"],
  faq=[("Spanish or Mexican chorizo for a board?", "Spanish. It's cured and dried, so you can slice it and eat it as is, which is what a board needs. Mexican chorizo is fresh, raw ground pork that has to be cooked first. Use it in a warm queso fundido or tacos instead."),
       ("What wine goes with chorizo?", "A Spanish red like Rioja or Tempranillo, a Malbec, or a dry rosé, whose acid handles the paprika heat. For something lighter, a dry hard cider works well."),
       ("What cheese goes with chorizo?", "Manchego is the classic: its nutty sheep's milk flavor softens the smoke and paprika. Mahón and Idiazábal are other Spanish matches, and pepper Jack fits a Tex-Mex board."),
       ("Do you eat the casing on chorizo?", "Natural casings on Spanish chorizo are edible but can be chewy. Many packaged chorizos use a plastic or fibrous casing that isn't meant to be eaten. If it peels away easily or feels tough, remove it before slicing.")]),
 "gruyere": dict(
  serve=["Cut Gruyère into thin slices or short batons; it's firm enough to hold its shape. Take it out 30 to 45 minutes before serving, or closer to an hour for an aged (reserve) wedge, so the nutty, brothy flavor opens up.",
         "Build an Alpine corner around it: a few slices of cooked ham or speck, cornichons, a spoon of Dijon mustard, toasted hazelnuts and sliced baguette. With three cheeses on the board, about 1 oz of Gruyère per guest is plenty."],
  guide=["Which Gruyère to buy: our ranking of Gruyère brands", "/blog/best-gruyere-brands/"],
  faq=[("What meat goes with Gruyère?", "Cooked ham is the classic, along with speck and air-dried beef like Bündnerfleisch. The mild, salty meat lets Gruyère's nutty flavor lead."),
       ("What wine goes with Gruyère?", "Pinot Noir is the classic, with Chardonnay or a dry Alpine or Alsatian white like Riesling close behind. A crisp lager or dry hard cider works well too."),
       ("What fruit goes with Gruyère?", "Crisp apples and pears, whose juice and acid cut the richness. Grapes, dried figs and apricots work too, and onion jam is a savory-sweet option worth trying."),
       ("Is Gruyère good for a charcuterie board?", "Yes. It slices cleanly, most guests like it, and its nutty flavor stands up to ham, mustard and pickles. Pick an aged or reserve wedge if you want more depth.")]),
 "fig-jam": dict(
  serve=["Spoon it into a small bowl with its own spreader and set it between the brie and the blue cheese, the two cheeses it helps most. About a quarter cup covers 6 guests. Serve it with plain water crackers or sliced baguette so the jam is the flavor, not the cracker.",
         "To drink, think sweet against salt: a tawny port with blue cheese and fig, or a dry sparkling wine with brie and prosciutto. Walnuts or pecans on the side add the crunch the jam is missing."],
  guide=["Which fig jam to buy: our ranking of fig jams and spreads", "/blog/best-fig-jam/"],
  faq=[("What cheese goes with fig jam?", "Brie and other soft-ripened cheeses first, then Manchego, fresh goat cheese and blue cheeses like Gorgonzola. Fig's dense sweetness balances both creamy and salty cheese."),
       ("How much fig jam for a board?", "One small bowl, about a quarter cup per 6 guests. People use less than you'd think, because a little goes on each cracker."),
       ("What goes with fig jam besides cheese?", "Prosciutto and other cured ham, walnuts and pecans, sliced apples and pears, and baked brie. It also works as a glaze for pork or a layer in a grilled cheese."),
       ("What's the best fig jam for a charcuterie board?", "Our top pick is Dalmatia Original Fig Spread. Bonne Maman Fig Preserves is the best value, and it's easy to find in most supermarkets.")]),
 "burrata": dict(
  serve=["Serve burrata whole in a shallow bowl, not straight on the wood, because the creamy center runs. Take it out 15 to 20 minutes before serving, then tear it open at the table, drizzle with olive oil and finish with flaky salt and torn basil.",
         "Surround it with prosciutto, ripe tomatoes or peaches in season, and something to scoop with, like toasted ciabatta or olive oil crackers. One 4 oz ball serves about 3 to 4 people as part of a board. Eat it within 2 hours of setting it out, or 1 hour above 90°F."],
  guide=["Which burrata to buy: our ranking of grocery store burrata", "/blog/best-burrata/"],
  faq=[("How long can burrata sit out?", "Take it out 15 to 20 minutes before serving so it isn't fridge-cold, and eat it within 2 hours of setting it out, or 1 hour above 90°F. It's a fresh cheese, so don't put leftovers back for later."),
       ("What wine goes with burrata?", "Dry rosé, Sauvignon Blanc or Prosecco: light, cold and high in acid, to cut the cream. A soft wheat beer works too."),
       ("Do you eat the outside of burrata?", "Yes. The outer shell is fresh mozzarella and the center is stracciatella, shreds of mozzarella soaked in cream. Cut or tear through both and eat them together."),
       ("What fruit goes with burrata?", "Ripe peaches, tomatoes and figs in summer, and blood oranges, grapefruit and pears in winter. A drizzle of hot honey or balsamic glaze adds contrast.")]),
}
for x in F:
    e = EXTRA.get(x["slug"])
    if e:
        x["serve"] = e["serve"]; x["guide"] = e["guide"]; x["faq"] = [{"q": q, "a": a} for q, a in e["faq"]]
json.dump(F, open("foods.json", "w"), indent=1, ensure_ascii=False)
print(len(F))
