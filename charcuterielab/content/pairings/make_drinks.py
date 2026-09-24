# Source for drinks.json. Run: python3 make_drinks.py  (writes drinks.json)
# m(slug, why, rule) = one match. Rules: fat-tannin, acid, salt-sweet, weight, place, texture
import json

def m(s, why, rule):
    return {"s": s, "why": why, "rule": rule}

def a(s, why):
    return {"s": s, "why": why}

W = []  # wines

W.append(dict(
    slug="pinot-noir", family="wine", name="Pinot Noir", color="#8e2c3a",
    profile=dict(body=2, tannin=2, acid=4, sweet=1), serve="55–60°F, slightly cool",
    answer="Pinot Noir goes best with Gruyère, Comté, aged Gouda and prosciutto. Its light tannin and bright acid lift nutty, mild cheeses and silky cured meats without flattening them.",
    intro="The most cheese-friendly red there is. Light body and soft tannin mean it won't bully delicate flavors, and its earthy, red-cherry fruit loves anything nutty or mushroomy.",
    matches=[
        m("gruyere", "Nutty, sweet-savory crystals meet Pinot's red cherry and earth. The classic.", "weight"),
        m("comte", "Brown-butter and hazelnut notes echo the wine's forest-floor side.", "weight"),
        m("aged-gouda", "Caramel and crunch against red fruit; the wine keeps the richness in check.", "acid"),
        m("brie", "Mushroomy rind meets an earthy red. Serve the brie at room temperature.", "weight"),
        m("taleggio", "Washed-rind funk is tamed by bright acid instead of fought by tannin.", "acid"),
        m("prosciutto-di-parma", "Silky, salty ham and soft tannin: nothing to clash.", "fat-tannin"),
        m("duck-prosciutto", "Rich, gamey duck is Pinot's favorite meat in any form.", "weight"),
        m("pate-de-campagne", "Country pâté's herbs and pork fat are made for a Burgundy-style red.", "place"),
        m("marinated-mushrooms", "Earth meets earth; the wine's acid handles the marinade.", "weight"),
        m("dried-cherries", "Mirrors the wine's own fruit and bridges it to the cheese.", "salt-sweet"),
        m("walnuts", "Gentle bitterness and oil soften the wine's acid.", "texture"),
    ],
    avoid=[a("roquefort", "Pungent blue overwhelms a light red; the wine tastes thin and sour."),
           a("pepper-jack", "Chili heat makes the alcohol burn and strips the fruit."),
           a("bread-and-butter-pickles", "Sweet vinegar turns the wine sharp.")],
    swap="Can't find one you like under $20? Try Beaujolais-Villages or an Oregon or Chilean Pinot. Same light body, often cheaper.",
    holidays=["thanksgiving", "christmas"],
    faq=[("What cheese goes best with Pinot Noir?", "Gruyère, Comté and aged Gouda: nutty, firm cheeses with some sweetness. Brie and other bloomy rinds work too if they're at room temperature."),
         ("Does Pinot Noir go with charcuterie?", "Yes. Its soft tannin suits prosciutto, duck prosciutto and pâté. Skip very spicy salami, which makes it taste hot."),
         ("Should Pinot Noir be chilled?", "Slightly. 55–60°F, about 20 minutes in the fridge, keeps the fruit fresh and the alcohol in check.")]
))

W.append(dict(
    slug="cabernet-sauvignon", family="wine", name="Cabernet Sauvignon", color="#5b1a2b",
    profile=dict(body=5, tannin=5, acid=3, sweet=1), serve="60–65°F",
    answer="Cabernet Sauvignon pairs best with aged cheddar, aged Gouda, Parmigiano-Reggiano and fatty salami. Firm tannin needs fat and protein, and these give it plenty to grab.",
    intro="Big, dark and grippy. Cabernet needs food with fat, salt and some age on it; soft or fresh cheeses make it taste harsh.",
    matches=[
        m("aged-cheddar", "Sharp, crumbly cheddar softens tannin and stands up to blackcurrant fruit.", "fat-tannin"),
        m("aged-gouda", "Caramel crystals and a firm paste match the wine's weight.", "weight"),
        m("parmigiano-reggiano", "Salty, savory crystals make the fruit taste riper.", "fat-tannin"),
        m("manchego", "Aged sheep's milk has the fat and firmness Cabernet wants.", "fat-tannin"),
        m("mimolette", "Nutty, hard and dense enough for a heavy red.", "weight"),
        m("genoa-salami", "Pork fat coats the tongue so tannin feels smoother.", "fat-tannin"),
        m("soppressata", "Coarse, fatty and peppery: a match for dark fruit and oak.", "fat-tannin"),
        m("bresaola", "Lean beef with a savory edge; add a drizzle of olive oil for fat.", "weight"),
        m("dark-chocolate", "Bitter cacao echoes oak and dark fruit. Keep it 70% or darker.", "weight"),
        m("walnuts", "Tannic skins and oil line up with the wine's grip.", "texture"),
        m("dried-figs", "Jammy sweetness plays off black fruit.", "salt-sweet"),
    ],
    avoid=[a("fresh-chevre", "Tangy, fresh goat cheese makes the tannin taste metallic."),
           a("brie", "Too mild; the wine erases it."),
           a("smoked-salmon", "Oily fish plus heavy tannin tastes fishy and bitter.")],
    swap="Want the same weight for less? Look for a Chilean or Washington Cabernet, or a Spanish Monastrell.",
    holidays=["christmas"],
    faq=[("What cheese goes with Cabernet Sauvignon?", "Aged, firm cheeses: aged cheddar, aged Gouda, Parmigiano-Reggiano and Manchego. Their fat and protein soften the wine's tannin."),
         ("What cheese should you avoid with Cabernet?", "Fresh and soft cheeses like chèvre, mozzarella and young brie. The tannin tastes bitter and the cheese disappears."),
         ("Does Cabernet go with dark chocolate?", "Yes, if the chocolate is 70% cacao or darker. Milk chocolate is too sweet and makes the wine taste sour.")]
))

W.append(dict(
    slug="champagne-prosecco", family="wine", name="Champagne & Prosecco", color="#e8d27a",
    profile=dict(body=2, tannin=1, acid=5, sweet=1), serve="42–46°F, well chilled",
    answer="Champagne and Prosecco go best with brie, triple-crème, Parmigiano-Reggiano and salty snacks like prosciutto and potato-crisp crackers. Bubbles and acid scrub rich, salty food off your palate.",
    intro="The most versatile bottle on the table. Acid and bubbles cut through butterfat and salt, which is exactly what a charcuterie board is made of.",
    matches=[
        m("triple-creme", "Pure butterfat, lifted by bubbles. The best pairing in this hub.", "texture"),
        m("brie", "Creamy against crisp; the acid resets your palate every sip.", "acid"),
        m("parmigiano-reggiano", "Salty, nutty crystals make the wine taste richer.", "salt-sweet"),
        m("comte", "Nutty and savory, a classic with Champagne's toasty notes.", "place"),
        m("gougeres", "Cheese puffs and Champagne: Burgundy's own aperitif.", "place"),
        m("prosciutto-di-parma", "Salt and fat, rinsed clean by bubbles.", "acid"),
        m("smoked-salmon", "Oily fish and crisp acid, the brunch classic.", "acid"),
        m("caviar", "The famous splurge: brine and bubbles.", "salt-sweet"),
        m("marcona-almonds", "Fried, salty almonds and a cold glass. Simple and perfect.", "texture"),
        m("berries", "Fresh berries echo Prosecco's fruit.", "weight"),
        m("parmesan-crisps", "Salty crunch against fizz.", "texture"),
    ],
    avoid=[a("roquefort", "Strong blue makes dry sparkling wine taste bitter."),
           a("dark-chocolate", "Sweet and bitter chocolate makes a dry brut taste sour."),
           a("hot-honey", "Chili heat and bubbles both prickle; together they sting.")],
    swap="Cava from Spain and Crémant from France are made the same way as Champagne and cost a third as much.",
    holidays=["new-years-eve", "christmas"],
    faq=[("What cheese goes with Champagne?", "Creamy bloomy rinds like brie and triple-crème, plus salty aged cheeses like Parmigiano-Reggiano and Comté."),
         ("What charcuterie goes with Prosecco?", "Prosciutto, mortadella and salami. The bubbles cut the fat and salt; Prosecco's slight fruit loves melon and berries alongside."),
         ("Is Prosecco sweeter than Champagne?", "Usually a little fruitier. Look for 'Brut' on either label for the driest style.")]
))

W.append(dict(
    slug="sauvignon-blanc", family="wine", name="Sauvignon Blanc", color="#dfe6a0",
    profile=dict(body=2, tannin=1, acid=5, sweet=1), serve="45–50°F",
    answer="Sauvignon Blanc is the goat cheese wine: fresh chèvre, Crottin de Chavignol and feta. Its sharp acid and herbal notes match tangy cheese, briny olives and fresh vegetables.",
    intro="Zippy, grassy and citrusy. It shines with tangy, fresh and herbal foods, and it's the best white for a vegetable-heavy board.",
    matches=[
        m("fresh-chevre", "Tang meets tang; acid on acid makes both taste creamier.", "place"),
        m("crottin-de-chavignol", "From Sancerre's own village. The textbook regional match.", "place"),
        m("sainte-maure", "Loire goat cheese with a Loire wine.", "place"),
        m("feta", "Salty brine and bright citrus.", "acid"),
        m("whipped-feta", "Creamy and salty, cut by crisp acid.", "acid"),
        m("burrata", "Fresh cream and a squeeze-of-lemon wine.", "acid"),
        m("prosciutto-di-parma", "Salty ham against grassy acid, especially with melon.", "salt-sweet"),
        m("smoked-trout", "Light smoke and a citrus lift.", "acid"),
        m("castelvetrano-olives", "Buttery green olives and a green, herbal wine.", "weight"),
        m("marinated-artichokes", "One of the few wines that doesn't turn sweet next to artichoke.", "weight"),
        m("pesto", "Basil and garlic with an herbal white.", "weight"),
    ],
    avoid=[a("stilton", "Heavy blue flattens a light, lean white."),
           a("chocolate-hazelnut-spread", "Sweet spreads make it taste sour."),
           a("smoked-gouda", "Heavy smoke buries the wine's freshness.")],
    swap="Try a Loire Touraine Sauvignon, or Vinho Verde for an even lighter, cheaper option.",
    holidays=[],
    faq=[("What cheese goes with Sauvignon Blanc?", "Goat cheese first: fresh chèvre, Crottin de Chavignol, Sainte-Maure. Feta and burrata work too."),
         ("Does Sauvignon Blanc go with charcuterie?", "With lighter meats: prosciutto, smoked trout, smoked salmon. It's too lean for fatty salami."),
         ("Is Sauvignon Blanc good with vegetables?", "It's the best wine for them, including hard ones like artichokes and asparagus.")]
))

W.append(dict(
    slug="chardonnay", family="wine", name="Chardonnay", color="#e9c46a",
    profile=dict(body=4, tannin=1, acid=3, sweet=1), serve="50–55°F",
    answer="Chardonnay pairs best with brie, Camembert, Gruyère and mild aged cheddar. Oaked, buttery styles love creamy cheese; crisp unoaked styles suit goat cheese and seafood.",
    intro="Two wines in one grape. Oaked Chardonnay is rich and buttery; unoaked (Chablis, most French white Burgundy) is crisp and mineral. Both like creamy textures.",
    matches=[
        m("brie", "Butter meets butter. Oaked Chardonnay is brie's natural partner.", "weight"),
        m("camembert", "Mushroomy rind and toasty oak.", "weight"),
        m("gruyere", "Nutty cheese with a round, rich white.", "weight"),
        m("comte", "Nutty and savory with a toasty Burgundy.", "place"),
        m("aged-cheddar", "Mild-to-medium cheddar suits a creamy Chardonnay; very sharp ones need red.", "weight"),
        m("havarti", "Buttery and mild, so it won't fight the oak.", "weight"),
        m("prosciutto-cotto", "Sweet cooked ham and a round white.", "salt-sweet"),
        m("smoked-salmon", "Unoaked Chardonnay and smoked fish is a brunch standard.", "acid"),
        m("apples", "Crisp apple echoes the grape's own fruit.", "weight"),
        m("pears", "Soft, juicy pear matches the texture.", "weight"),
        m("marcona-almonds", "Toasty nuts, toasty oak.", "texture"),
    ],
    avoid=[a("roquefort", "Salty blue plus oak tastes bitter."),
           a("pickled-jalapenos", "Vinegar and heat strip the fruit."),
           a("soppressata", "Spicy, fatty salami needs acid or tannin that Chardonnay lacks.")],
    swap="For the buttery style, try a Chilean or Australian Chardonnay; for the crisp style, a Mâcon-Villages.",
    holidays=["thanksgiving"],
    faq=[("What cheese goes with Chardonnay?", "Creamy and nutty cheeses: brie, Camembert, Gruyère, Comté and Havarti."),
         ("Oaked or unoaked Chardonnay with cheese?", "Oaked for creamy, buttery cheeses. Unoaked for goat cheese, seafood and lighter boards."),
         ("Does Chardonnay go with cheddar?", "Mild and medium cheddar, yes. Very sharp aged cheddar is better with a red.")]
))

W.append(dict(
    slug="rose", family="wine", name="Rosé", color="#f2a7a0",
    profile=dict(body=2, tannin=1, acid=4, sweet=2), serve="45–50°F",
    answer="Dry rosé goes with almost everything on a summer board: feta, fresh chèvre, Manchego, prosciutto, chorizo and fresh fruit. It has a white wine's acid with a red wine's fruit.",
    intro="The safest bottle for a mixed board. Dry Provence-style rosé has enough acid for creamy cheese and enough fruit for cured meat.",
    matches=[
        m("feta", "Salty and tangy with a crisp, fruity pink.", "acid"),
        m("fresh-chevre", "Fresh goat cheese and dry rosé: a Provence lunch.", "place"),
        m("manchego", "Nutty sheep's cheese with strawberry-scented acid.", "weight"),
        m("burrata", "Fresh cream, ripe tomato and a cold glass.", "acid"),
        m("prosciutto-di-parma", "Salty ham and red-berry fruit.", "salt-sweet"),
        m("chorizo", "Paprika and pork fat; rosé's acid handles the spice.", "acid"),
        m("jamon-serrano", "Spanish ham with a Spanish rosado.", "place"),
        m("melon", "Juicy melon mirrors the wine's fruit.", "weight"),
        m("berries", "Strawberries and raspberries echo the glass.", "weight"),
        m("kalamata-olives", "Briny olives and a Mediterranean pink.", "place"),
        m("hummus", "Creamy, garlicky dips pair easily with dry rosé.", "weight"),
    ],
    avoid=[a("stilton", "Heavy blue buries a delicate wine."),
           a("dark-chocolate", "Bitter chocolate makes dry rosé taste thin."),
           a("smoked-gouda", "Heavy smoke flattens the fruit.")],
    swap="Any dry rosé labeled Provence, Côtes de Provence or Spanish rosado. Avoid 'blush' or 'white zinfandel' if you want dry.",
    holidays=[],
    faq=[("What cheese goes with rosé?", "Fresh and salty cheeses: feta, chèvre and burrata, plus nutty Manchego."),
         ("Does rosé go with charcuterie?", "Very well. Its acid handles fat and spice, so prosciutto, serrano ham and chorizo all work."),
         ("Sweet or dry rosé for a cheese board?", "Dry. Sweet pink wines taste sugary next to salty food.")]
))

W.append(dict(
    slug="riesling", family="wine", name="Riesling", color="#f1e3a1",
    profile=dict(body=2, tannin=1, acid=5, sweet=3), serve="45–50°F",
    answer="Riesling pairs best with washed-rind and pungent cheeses like Munster, Taleggio and Époisses, plus smoked meats and spicy salami. A touch of sweetness tames salt, smoke and heat.",
    intro="The secret weapon for difficult food. High acid and a little sweetness handle funk, smoke, salt and spice that knock other wines over.",
    matches=[
        m("muenster", "Alsace's washed-rind cheese with Alsace's grape.", "place"),
        m("taleggio", "Funky and creamy, balanced by sweet-tart fruit.", "salt-sweet"),
        m("epoisses", "One of the few wines Époisses can't overpower.", "salt-sweet"),
        m("limburger", "Pungent rind, tamed by acid and sweetness.", "salt-sweet"),
        m("smoked-gouda", "Smoke softens next to off-dry fruit.", "salt-sweet"),
        m("black-forest-ham", "Smoked German ham with a German Riesling.", "place"),
        m("speck", "Smoky, juniper-scented ham and sweet-tart wine.", "salt-sweet"),
        m("nduja", "Spicy, spreadable salami cooled by sugar and acid.", "salt-sweet"),
        m("pickled-red-onions", "One of the few wines that loves pickles.", "acid"),
        m("apples", "Tart apple mirrors the grape.", "weight"),
        m("mango-chutney", "Sweet-spicy chutney with an off-dry white.", "weight"),
    ],
    avoid=[a("dark-chocolate", "Bitter chocolate turns the wine sour."),
           a("bresaola", "Lean, dry beef wants red, not sugar."),
           a("gorgonzola", "Only with sweet dessert Riesling; a dry one tastes thin next to it.")],
    swap="Look for 'Kabinett' on German labels for a light, off-dry style; Washington and Finger Lakes Rieslings are great value.",
    holidays=["thanksgiving"],
    faq=[("What cheese goes with Riesling?", "Washed-rind cheeses (Munster, Taleggio, Époisses) and smoked cheeses. The sweetness and acid calm their funk and smoke."),
         ("Does Riesling go with spicy charcuterie?", "Yes, it's the best wine for it. A little sweetness cools 'nduja, chorizo and pepper salami."),
         ("Is Riesling always sweet?", "No. It ranges from bone dry to dessert-sweet. 'Trocken' means dry; 'Kabinett' is lightly sweet.")]
))

W.append(dict(
    slug="merlot", family="wine", name="Merlot", color="#6d1f33",
    profile=dict(body=4, tannin=3, acid=3, sweet=1), serve="60–65°F",
    answer="Merlot goes best with Gouda, mild-to-medium cheddar, Gruyère, Havarti and salami. Plush plum fruit and softer tannin suit medium-aged cheeses and everyday charcuterie.",
    intro="The easygoing red. Softer than Cabernet and fuller than Pinot, it suits a crowd-pleasing board with medium cheeses and familiar salami.",
    matches=[
        m("aged-gouda", "Caramel and plum: a warm, round pairing.", "weight"),
        m("aged-cheddar", "Medium-sharp cheddar suits Merlot's softer tannin.", "fat-tannin"),
        m("gruyere", "Nutty cheese and plummy red.", "weight"),
        m("havarti", "Mild and buttery; lets the fruit lead.", "weight"),
        m("fontina", "Earthy, melting Italian cheese and a round red.", "weight"),
        m("genoa-salami", "Classic salami's fat softens tannin.", "fat-tannin"),
        m("coppa", "Marbled, lightly spiced pork and plush fruit.", "fat-tannin"),
        m("pate-de-campagne", "Country pâté with a Bordeaux-style red.", "place"),
        m("dried-figs", "Jammy fig mirrors plum and cherry.", "salt-sweet"),
        m("dark-chocolate", "Dark chocolate and Merlot is a dessert-board favorite.", "weight"),
        m("candied-pecans", "Sweet crunch plays off the fruit.", "salt-sweet"),
    ],
    avoid=[a("fresh-chevre", "Tangy goat cheese makes it taste bitter."),
           a("smoked-salmon", "Fish and red tannin taste metallic."),
           a("pickled-jalapenos", "Vinegar and heat clash with soft fruit.")],
    swap="Right Bank Bordeaux (Saint-Émilion satellites) or a Washington Merlot often beats California at the same price.",
    holidays=["thanksgiving", "christmas"],
    faq=[("What cheese goes with Merlot?", "Medium-aged cheeses: Gouda, Gruyère, mild-to-medium cheddar, Havarti and Fontina."),
         ("What charcuterie goes with Merlot?", "Genoa salami, coppa and country pâté. Their fat softens the wine's tannin."),
         ("Merlot or Cabernet for a cheese board?", "Merlot for a mixed board of medium cheeses; Cabernet only if the cheeses are hard and well aged.")]
))

W.append(dict(
    slug="malbec", family="wine", name="Malbec", color="#4a1030",
    profile=dict(body=5, tannin=4, acid=3, sweet=1), serve="60–65°F",
    answer="Malbec pairs best with smoked and aged cheeses, chorizo, soppressata and grilled-meat flavors. Dark fruit and firm tannin need fat, smoke and spice to stand up to it.",
    intro="Argentina's big, inky red. Plum, blackberry and a little cocoa; it's the wine for a meaty, smoky board.",
    matches=[
        m("smoked-gouda", "Smoke meets dark fruit and cocoa.", "weight"),
        m("aged-cheddar", "Sharp, fatty cheddar softens firm tannin.", "fat-tannin"),
        m("manchego", "Aged sheep's cheese with a South American red.", "fat-tannin"),
        m("chorizo", "Paprika, garlic and pork fat: the asado match.", "fat-tannin"),
        m("soppressata", "Spicy, coarse salami and a heavy red.", "fat-tannin"),
        m("pepperoni", "Smoky, peppery and fatty enough for Malbec.", "fat-tannin"),
        m("bresaola", "Lean cured beef and black fruit; add olive oil.", "weight"),
        m("romesco", "Smoky pepper-almond sauce echoes grilled flavors.", "weight"),
        m("dark-chocolate", "Cocoa notes in the wine meet real cocoa.", "weight"),
        m("medjool-dates", "Sticky sweetness against dark fruit and grip.", "salt-sweet"),
        m("smoked-almonds", "Smoke and crunch for a smoky wine.", "texture"),
    ],
    avoid=[a("brie", "Delicate cheese disappears."),
           a("fresh-mozzarella", "Milky and fresh; the tannin turns bitter."),
           a("smoked-salmon", "Fish and big tannin clash.")],
    swap="Most Argentine Malbec is good value; Cahors from France is the original, earthier style.",
    holidays=["halloween"],
    faq=[("What cheese goes with Malbec?", "Aged and smoked cheeses: smoked Gouda, aged cheddar, Manchego."),
         ("What charcuterie goes with Malbec?", "Spicy, fatty meats like chorizo, soppressata and pepperoni."),
         ("Is Malbec good with a charcuterie board?", "With a meat-heavy, smoky board, yes. For soft cheeses, choose Pinot Noir instead.")]
))

W.append(dict(
    slug="chianti-sangiovese", family="wine", name="Chianti & Sangiovese", color="#7a2432",
    profile=dict(body=3, tannin=4, acid=5, sweet=1), serve="60–65°F",
    answer="Chianti and other Sangiovese wines go best with Parmigiano-Reggiano, Pecorino Toscano, finocchiona and prosciutto. High acid and savory cherry fruit are made for Italian cheese and salumi.",
    intro="Tuscany's grape: tart cherry, dried herbs and bright acid. It's built for salty, savory Italian food, so an antipasto board is its home turf.",
    matches=[
        m("pecorino-toscano", "Tuscan sheep's cheese with a Tuscan red.", "place"),
        m("parmigiano-reggiano", "Salty crystals and bright acid make each other taste better.", "acid"),
        m("pecorino-romano", "Salty and sharp; Sangiovese's acid keeps up.", "acid"),
        m("finocchiona", "Tuscany's fennel salami. The local match.", "place"),
        m("prosciutto-di-parma", "Salty ham and tart cherry.", "salt-sweet"),
        m("soppressata", "Fatty, peppery salami meets firm tannin.", "fat-tannin"),
        m("mortadella", "Rich, silky pork cut by high acid.", "acid"),
        m("fontina", "Mild, melting Italian cheese.", "place"),
        m("sun-dried-tomatoes", "Tomato and Sangiovese: both high-acid.", "acid"),
        m("kalamata-olives", "Briny and savory with a savory red.", "weight"),
        m("balsamic-glaze", "Sweet-tart glaze on Parmigiano with Chianti.", "place"),
    ],
    avoid=[a("brie", "Too mild for the acid and tannin."),
           a("lemon-curd", "Sweet citrus makes the wine sour."),
           a("smoked-salmon", "Fish and firm tannin taste metallic.")],
    swap="Chianti Classico is the step up; Montepulciano d'Abruzzo is a softer, cheaper cousin for pizza-night boards.",
    holidays=["christmas"],
    faq=[("What cheese goes with Chianti?", "Italian hard cheeses: Parmigiano-Reggiano, Pecorino Toscano and Pecorino Romano."),
         ("What meat goes with Chianti?", "Finocchiona, prosciutto, soppressata and mortadella. Chianti's acid cuts pork fat."),
         ("Is Chianti good for an antipasto board?", "It's the best choice: acid for the olives and tomatoes, tannin for the salami.")]
))

W.append(dict(
    slug="port", family="wine", name="Port", color="#3c0d1e",
    profile=dict(body=5, tannin=3, acid=2, sweet=5), serve="60–65°F (tawny slightly cooler)",
    answer="Port is made for blue cheese: Stilton first, then Roquefort, Gorgonzola and aged cheddar, with walnuts and dried figs. Sweet, rich wine balances salty, sharp cheese.",
    intro="A fortified dessert wine, sweet and strong. Serve small pours at the end of the night with the strongest cheese on the board.",
    matches=[
        m("stilton", "The most famous cheese-and-wine pairing in Britain.", "salt-sweet"),
        m("roquefort", "Salty sheep's-milk blue with sweet, rich wine.", "salt-sweet"),
        m("gorgonzola", "Creamy blue softened by sweetness.", "salt-sweet"),
        m("cabrales", "Spain's fierce blue needs a sweet, strong wine.", "salt-sweet"),
        m("aged-cheddar", "Sharp cheddar and ruby port: a British classic.", "salt-sweet"),
        m("aged-gouda", "Caramel and toffee with tawny port.", "weight"),
        m("walnuts", "The third member of the Stilton-port trio.", "texture"),
        m("dried-figs", "Fig, raisin and port share the same flavors.", "weight"),
        m("dark-chocolate", "Port is one of chocolate's best partners.", "weight"),
        m("pears", "Fresh pear lightens the richness.", "acid"),
        m("medjool-dates", "Caramel sweetness with tawny port.", "weight"),
    ],
    avoid=[a("fresh-mozzarella", "Delicate cheese vanishes."),
           a("smoked-salmon", "Sweet fortified wine and fish clash."),
           a("dill-pickles", "Sour brine and sweet wine fight.")],
    swap="Ruby port for blue cheese and chocolate; tawny port for aged Gouda and nuts. Both are affordable.",
    holidays=["christmas", "thanksgiving"],
    faq=[("Why do Stilton and port go together?", "Salt and sweetness balance each other: the cheese makes the wine taste less sweet and the wine softens the cheese's sharpness."),
         ("Ruby or tawny port with cheese?", "Ruby for blue cheese and chocolate. Tawny's caramel and nut notes suit aged Gouda and walnuts."),
         ("When should you serve port?", "At the end, with the blue cheese and dessert items. Small pours, 2–3 oz.")]
))

W.append(dict(
    slug="beaujolais", family="wine", name="Beaujolais", color="#9b2d4a",
    profile=dict(body=2, tannin=1, acid=4, sweet=1), serve="55°F, lightly chilled",
    answer="Beaujolais goes best with pâté, saucisson sec, Comté, brie and roast-turkey flavors. Juicy fruit, low tannin and a light chill make it the easiest red for Thanksgiving boards.",
    intro="Gamay from southern Burgundy: fresh, juicy and low in tannin. Serve it cool. It works with almost every cheese and every cured meat.",
    matches=[
        m("pate-de-campagne", "The Lyon bistro pairing.", "place"),
        m("saucisson-sec", "French dry sausage and a French picnic red.", "place"),
        m("rosette-de-lyon", "Lyon's own salami with the Lyon region's wine.", "place"),
        m("comte", "Nutty cheese and bright fruit.", "weight"),
        m("brie", "Low tannin means no bitterness with soft cheese.", "weight"),
        m("morbier", "Mild, earthy French cheese.", "place"),
        m("cranberry-sauce", "Tart berry sauce and berry-bright wine: the Thanksgiving match.", "acid"),
        m("prosciutto-di-parma", "Silky ham and a soft red.", "fat-tannin"),
        m("cornichons", "One of the few reds that can take a pickle.", "acid"),
        m("whole-grain-mustard", "Mustard's bite with juicy fruit.", "acid"),
        m("roasted-chestnuts", "Autumn flavors for an autumn wine.", "weight"),
    ],
    avoid=[a("stilton", "Strong blue buries a light red."),
           a("smoked-gouda", "Heavy smoke flattens the fruit."),
           a("dark-chocolate", "Too bitter for a light, fruity wine.")],
    swap="Beaujolais-Villages is the sweet spot; Morgon and Fleurie are fuller for a little more.",
    holidays=["thanksgiving"],
    faq=[("Is Beaujolais good for Thanksgiving?", "It's the classic choice: light, juicy, low tannin and friendly with turkey, cranberry and a big cheese board."),
         ("Should Beaujolais be chilled?", "Yes, lightly. About 55°F, 20–30 minutes in the fridge."),
         ("What charcuterie goes with Beaujolais?", "Pâté, saucisson sec and rosette de Lyon, all from the same corner of France.")]
))

B = []  # beers
B.append(dict(
    slug="ipa", family="beer", name="IPA", color="#d98e2b",
    profile=dict(body=3, bitter=5, carb=4, sweet=1), serve="45–50°F",
    answer="IPA goes best with sharp aged cheddar, pepper jack, blue cheese and spicy salami. Hop bitterness cuts fat and stands up to strong, salty and spicy flavors.",
    intro="Bitter, citrusy and piney. IPAs need bold food; mild cheese just makes them taste harsher.",
    matches=[
        m("aged-cheddar", "Sharp cheddar and hops: the best-known beer-cheese pairing.", "weight"),
        m("pepper-jack", "Chili heat and citrus hops.", "weight"),
        m("gorgonzola", "Bitterness cuts creamy blue.", "fat-tannin"),
        m("maytag-blue", "American blue with an American IPA.", "place"),
        m("soppressata", "Spicy, fatty salami against crisp bitterness.", "fat-tannin"),
        m("nduja", "Spreadable heat and hops. Bold but balanced.", "weight"),
        m("pepperoni", "Pizza-shop flavors with a pizza-shop beer.", "weight"),
        m("pickled-jalapenos", "Heat and hops for a game-day board.", "weight"),
        m("mango-chutney", "Tropical fruit mirrors citrusy hops.", "weight"),
        m("pretzel-crisps", "Salt and crunch with bitterness.", "texture"),
        m("spiced-nut-mix", "Salty, spiced nuts. The bar snack pairing.", "texture"),
    ],
    avoid=[a("brie", "Delicate cheese gets flattened by hops."),
           a("fresh-mozzarella", "Too mild; the beer tastes harsh."),
           a("lemon-curd", "Sweet and bitter clash.")],
    swap="Hazy IPAs are softer and fruitier; West Coast IPAs are drier and more bitter. Softer styles suit milder cheeses.",
    holidays=["super-bowl"],
    faq=[("What cheese goes with IPA?", "Sharp and bold cheeses: aged cheddar, pepper jack and blue cheese."),
         ("Does IPA go with spicy food?", "Yes, if you like heat. Hops can make chili taste hotter, so pair with fatty meats to soften it."),
         ("What charcuterie goes with IPA?", "Spicy salami, pepperoni and 'nduja.")]
))
B.append(dict(
    slug="lager-pilsner", family="beer", name="Lager & Pilsner", color="#f2d16b",
    profile=dict(body=2, bitter=2, carb=5, sweet=1), serve="38–45°F",
    answer="Lager and pilsner pair best with mild and nutty cheeses, bratwurst-style sausage, pretzels and mustard: Havarti, Swiss, Gruyère, landjäger and whole-grain mustard. Crisp bubbles clean up salt and fat.",
    intro="Clean, crisp and light. The most flexible beer on a board: it refreshes rather than competes.",
    matches=[
        m("havarti", "Mild and buttery with a clean, crisp beer.", "texture"),
        m("emmental", "Swiss cheese with a German-style lager.", "place"),
        m("gruyere", "Nutty Alpine cheese and a bready pilsner.", "place"),
        m("muenster", "Mild, soft and a little tangy.", "weight"),
        m("landjager", "Smoked German sausage with German beer.", "place"),
        m("black-forest-ham", "Smoky ham and crisp bubbles.", "texture"),
        m("kielbasa", "Garlicky sausage and a cold lager.", "fat-tannin"),
        m("whole-grain-mustard", "Mustard's bite, rinsed by carbonation.", "acid"),
        m("pretzel-crisps", "Beer hall classic.", "place"),
        m("dill-pickles", "Salt, sour and crisp.", "acid"),
        m("honey-roasted-peanuts", "Bar-snack sweet and salty.", "salt-sweet"),
    ],
    avoid=[a("stilton", "Strong blue overwhelms a light beer."),
           a("dark-chocolate", "Too bitter and rich."),
           a("epoisses", "Pungent rind buries a delicate lager.")],
    swap="Any good Czech or German pilsner, or a Mexican lager for Tex-Mex boards.",
    holidays=["super-bowl"],
    faq=[("What cheese goes with lager?", "Mild and nutty cheeses: Havarti, Swiss, Gruyère and Muenster."),
         ("What snacks go with pilsner?", "Pretzels, mustard, pickles and smoked sausage: the beer hall board."),
         ("Is lager good with charcuterie?", "Yes, especially smoked and garlicky sausages. The bubbles cut the fat.")]
))
B.append(dict(
    slug="stout-porter", family="beer", name="Stout & Porter", color="#2b1a12",
    profile=dict(body=5, bitter=3, carb=2, sweet=3), serve="50–55°F",
    answer="Stout and porter go best with aged cheddar, smoked Gouda, blue cheese and dark chocolate. Roasty, coffee-like malt matches rich, sharp and smoky flavors.",
    intro="Dark, roasty and creamy, with coffee and chocolate notes. Serve it a little warmer than lager so those flavors come through.",
    matches=[
        m("aged-cheddar", "Irish cheddar and Irish stout: sharp against roast.", "place"),
        m("smoked-gouda", "Smoke and roast in one bite.", "weight"),
        m("stilton", "Creamy blue and roasty, sweet malt.", "salt-sweet"),
        m("gorgonzola", "Blue cheese with a chocolatey stout.", "salt-sweet"),
        m("aged-gouda", "Caramel meets coffee.", "weight"),
        m("country-ham", "Salty, smoky ham and sweet malt.", "salt-sweet"),
        m("dark-chocolate", "Chocolate notes meet real chocolate.", "weight"),
        m("pretzel-crisps", "Salt against sweet-roasty malt.", "salt-sweet"),
        m("candied-pecans", "Sweet, toasty nuts.", "weight"),
        m("medjool-dates", "Sticky caramel with roast.", "weight"),
        m("oatcakes", "Oaty base for an oatmeal stout.", "weight"),
    ],
    avoid=[a("fresh-chevre", "Light, tangy goat cheese tastes sour next to roast."),
           a("smoked-salmon", "Delicate fish and heavy malt clash."),
           a("fresh-mozzarella", "Disappears completely.")],
    swap="Dry Irish stout is light and roasty; milk and oatmeal stouts are sweeter and richer for dessert boards.",
    holidays=["st-patricks-day", "christmas", "halloween"],
    faq=[("What cheese goes with stout?", "Aged cheddar, smoked Gouda and blue cheeses."),
         ("Does stout go with chocolate?", "Yes. Stout's roasted malt tastes like coffee and cocoa, so dark chocolate is a natural match."),
         ("What's the best St. Patrick's Day pairing?", "Irish cheddar and dry Irish stout.")]
))
B.append(dict(
    slug="wheat-beer", family="beer", name="Wheat Beer", color="#f3d98b",
    profile=dict(body=3, bitter=1, carb=4, sweet=2), serve="40–45°F",
    answer="Wheat beer (hefeweizen and witbier) pairs best with fresh goat cheese, feta, mild Havarti, smoked salmon and fresh fruit. Its light spice and citrus suit fresh, tangy and lighter foods.",
    intro="Hazy, soft and lightly fruity, with banana-clove (German) or orange-coriander (Belgian) notes. Low bitterness makes it gentle with fresh cheese.",
    matches=[
        m("fresh-chevre", "Tangy goat cheese and citrusy witbier.", "acid"),
        m("feta", "Salty and bright against soft, spicy wheat.", "salt-sweet"),
        m("havarti", "Mild and creamy.", "weight"),
        m("burrata", "Fresh cream and a soft, fruity beer.", "weight"),
        m("smoked-salmon", "Witbier with lemon and smoked fish.", "acid"),
        m("prosciutto-di-parma", "Salty ham with soft fruitiness.", "salt-sweet"),
        m("mandarins", "Orange notes echo a witbier's orange peel.", "weight"),
        m("berries", "Fresh fruit and a fruity beer.", "weight"),
        m("pretzel-crisps", "Bavarian hefeweizen and a pretzel.", "place"),
        m("honey-mustard", "Sweet mustard and banana-clove wheat.", "salt-sweet"),
        m("pickled-beets", "Earthy-sweet pickles and a soft beer.", "acid"),
    ],
    avoid=[a("stilton", "Heavy blue overwhelms a light beer."),
           a("dark-chocolate", "Bitter chocolate flattens soft fruit."),
           a("smoked-gouda", "Heavy smoke buries the spice.")],
    swap="Hefeweizen for banana-clove, witbier for orange and coriander. Both are easy to find.",
    holidays=[],
    faq=[("What cheese goes with wheat beer?", "Fresh and mild cheeses: goat cheese, feta, Havarti and burrata."),
         ("Is hefeweizen good with charcuterie?", "With lighter meats like prosciutto and smoked salmon. Heavy salami suits darker beers better."),
         ("Wheat beer for brunch boards?", "Yes. It's the beer version of a mimosa: citrusy, soft and light.")]
))
B.append(dict(
    slug="belgian-ale", family="beer", name="Belgian Ale", color="#c9772b",
    profile=dict(body=4, bitter=2, carb=4, sweet=3), serve="45–50°F",
    answer="Belgian ales (dubbel, tripel, saison) pair best with washed-rind and Trappist-style cheeses like Port-Salut, Taleggio and Époisses, plus pâté and aged Gouda. Fruity, spicy yeast meets funky, creamy cheese.",
    intro="Monks have made beer and cheese side by side for centuries. Fruity, spicy and strong Belgian ales are the beer world's best cheese partners.",
    matches=[
        m("port-salut", "Monastery-style cheese with monastery-style beer.", "place"),
        m("taleggio", "Washed-rind funk and fruity yeast.", "weight"),
        m("epoisses", "Big funk needs a big, strong beer.", "weight"),
        m("reblochon", "Creamy washed rind with a saison.", "weight"),
        m("aged-gouda", "Caramel meets a malty dubbel.", "weight"),
        m("mimolette", "Nutty, fruity cheese from just over the border.", "place"),
        m("pate-de-campagne", "Rich pâté and a strong, fruity ale.", "fat-tannin"),
        m("saucisson-sec", "Dry sausage with a dry saison.", "texture"),
        m("whole-grain-mustard", "Belgian-style mustard bite.", "acid"),
        m("dried-apricots", "Fruity tripel and dried fruit.", "weight"),
        m("speculoos", "Belgian spice cookies with a Belgian dubbel.", "place"),
    ],
    avoid=[a("fresh-mozzarella", "Too delicate."),
           a("pickled-jalapenos", "High-alcohol beer makes heat burn."),
           a("lemon-curd", "Sweet citrus clashes with spicy yeast.")],
    swap="Saison for lighter boards; dubbel for richer, nuttier ones; tripel when you want bubbles and strength.",
    holidays=["christmas"],
    faq=[("What cheese goes with Belgian beer?", "Washed-rind and monastery-style cheeses: Port-Salut, Taleggio, Reblochon and Époisses."),
         ("Dubbel or tripel with cheese?", "Dubbel for nutty, caramel cheeses like aged Gouda; tripel for creamy, funky rinds."),
         ("Is Belgian beer strong?", "Often, 6–10% alcohol. Pour small glasses.")]
))
B.append(dict(
    slug="hard-cider", family="beer", name="Hard Cider", color="#e3b04b",
    profile=dict(body=2, bitter=1, carb=4, sweet=2), serve="40–45°F",
    answer="Dry hard cider pairs best with aged cheddar, Camembert, brie, Gruyère, pork pâté and ham. Apple acidity cuts rich cheese and pork the way a slice of apple does.",
    intro="Gluten-free, crisp and fruity. Cider does what a fresh apple does on a board, which makes it one of the most cheese-friendly drinks there is.",
    matches=[
        m("aged-cheddar", "Apple and cheddar in a glass. English farmhouse classic.", "place"),
        m("camembert", "Normandy cheese with Normandy cider.", "place"),
        m("brie", "Crisp apple cuts through butterfat.", "acid"),
        m("gruyere", "Nutty Alpine cheese and dry cider.", "weight"),
        m("red-leicester", "Mild, nutty English cheese.", "place"),
        m("country-ham", "Salty ham and apple: sweet against salt.", "salt-sweet"),
        m("pate-de-campagne", "Pork and apple, rinsed by acid.", "acid"),
        m("rillettes", "Rich potted pork needs cider's acid.", "acid"),
        m("apple-butter", "Apple with apple.", "weight"),
        m("walnuts", "Earthy crunch with fruit.", "texture"),
        m("oatcakes", "Plain, oaty base for cheddar and cider.", "weight"),
    ],
    avoid=[a("dark-chocolate", "Bitter chocolate makes cider taste sour."),
           a("smoked-salmon", "Sweet cider and fish clash."),
           a("roquefort", "Only with sweet ice cider; dry cider tastes thin.")],
    swap="French cidre brut or an English dry cider. Avoid very sweet mass-market ciders for cheese.",
    holidays=["thanksgiving", "halloween"],
    faq=[("What cheese goes with hard cider?", "Aged cheddar, Camembert, brie and Gruyère."),
         ("Is hard cider gluten-free?", "Cider made from apples is naturally gluten-free. Check the label for added malt."),
         ("Cider or wine for Thanksgiving?", "Both work. Dry cider is a great choice if your guests prefer beer.")]
))

COCKTAILS = dict(
    slug="cocktails", family="cocktails", name="Cocktails & Spirits", color="#b5651d",
    answer="The best cocktails for a charcuterie board are a dry martini, Aperol spritz, Negroni, old fashioned and gin and tonic. Bitter and citrusy drinks cut fat; brown spirits match aged cheese and smoky meat.",
    intro="Cocktails are stronger than wine, so pair by flavor and keep pours small. Bitter aperitifs and citrusy drinks are the easiest; save brown spirits for the aged cheese and chocolate.",
    items=[
        dict(name="Dry martini", pairs=["castelvetrano-olives", "manzanilla-olives", "marcona-almonds", "parmigiano-reggiano", "smoked-salmon"], why="Cold, dry and briny. Olives are the garnish for a reason; salty almonds and Parmigiano stay in the same lane."),
        dict(name="Aperol spritz", pairs=["prosciutto-di-parma", "mortadella", "fresh-mozzarella", "castelvetrano-olives", "grissini"], why="Bitter orange and bubbles: Italy's aperitivo drink with Italy's aperitivo board."),
        dict(name="Negroni", pairs=["parmigiano-reggiano", "finocchiona", "kalamata-olives", "blood-oranges", "taralli"], why="Bitter, sweet and strong, it needs salty, savory Italian bites."),
        dict(name="Old fashioned (bourbon or rye)", pairs=["aged-cheddar", "smoked-gouda", "country-ham", "candied-pecans", "dark-chocolate"], why="Caramel, vanilla and oak meet sharp cheese, smoke and sweet nuts."),
        dict(name="Gin and tonic", pairs=["smoked-trout", "dill-pickles", "fresh-chevre", "cornichons", "pistachios"], why="Botanical and bitter-bright; it treats briny and fresh foods like a crisp white would."),
        dict(name="Margarita / tequila", pairs=["cotija", "chorizo", "pepper-jack", "mango", "pickled-jalapenos"], why="Lime and agave cut spicy, salty Mexican flavors."),
        dict(name="Scotch (neat or with a splash)", pairs=["aged-cheddar", "stilton", "oatcakes", "smoked-salmon", "dark-chocolate"], why="Smoke and malt with Britain's big cheeses. Smoky Islay whisky loves smoked salmon."),
        dict(name="Sherry (fino or amontillado)", pairs=["manchego", "jamon-iberico", "marcona-almonds", "manzanilla-olives", "boquerones"], why="Dry, nutty and salty: the tapas-bar drink with tapas-bar food."),
    ],
    faq=[("What cocktail goes with a charcuterie board?", "An Aperol spritz or dry martini for most boards; an old fashioned for aged cheese and smoked meat."),
         ("What liquor goes with cheese?", "Bourbon and Scotch with aged cheddar and blue; dry sherry with Manchego; gin with fresh goat cheese."),
         ("How strong should board cocktails be?", "Lighter than usual. Spritzes and highballs keep the palate fresh across a long board.")]
)

ZERO = dict(
    slug="zero-proof", family="zero", name="Zero-Proof Pairings", color="#6aa37a",
    answer="The best non-alcoholic drinks for a charcuterie board are sparkling apple cider, black or green iced tea, kombucha, tart cherry spritz and sparkling water with citrus. Bubbles, acid and tannin do what wine does.",
    intro="Wine works with cheese because of acid, bubbles and tannin. Plenty of alcohol-free drinks have the same three things, so the same pairing rules apply.",
    items=[
        dict(name="Sparkling apple cider (non-alcoholic)", pairs=["aged-cheddar", "brie", "camembert", "gruyere", "prosciutto-di-parma"], why="Acid and bubbles, like Champagne or cider, with apple fruit that loves cheddar."),
        dict(name="Black iced tea, unsweetened", pairs=["aged-gouda", "genoa-salami", "soppressata", "manchego", "dark-chocolate"], why="Tea has tannin, just like red wine, so it softens with fat and aged cheese."),
        dict(name="Green tea or jasmine tea", pairs=["fresh-chevre", "burrata", "smoked-salmon", "rice-crackers", "pears"], why="Light, grassy and gently bitter, like a Sauvignon Blanc."),
        dict(name="Kombucha (ginger or plain)", pairs=["taleggio", "smoked-gouda", "chorizo", "kimchi", "pickled-red-onions"], why="Tangy and fizzy; it handles funk, smoke and pickles the way Riesling does."),
        dict(name="Tart cherry or pomegranate spritz", pairs=["stilton", "gorgonzola", "duck-prosciutto", "walnuts", "dark-chocolate"], why="Sweet-tart fruit balances salty blue cheese, like port."),
        dict(name="Sparkling water with lemon or lime", pairs=["feta", "castelvetrano-olives", "prosciutto-di-parma", "marcona-almonds", "cornichons"], why="Pure bubbles and acid reset your palate between salty bites."),
        dict(name="Cold brew coffee", pairs=["aged-gouda", "mascarpone", "biscotti", "dark-chocolate", "candied-pecans"], why="Roasty and bitter like a stout, for dessert boards."),
    ],
    faq=[("What non-alcoholic drink goes with charcuterie?", "Sparkling apple cider for most boards; unsweetened black iced tea for salami and aged cheese."),
         ("Why does iced tea go with cheese?", "Black tea has tannin, the same drying compound in red wine, so it pairs the same way: fat and protein soften it."),
         ("What's a good mocktail for a cheese board?", "A tart cherry or pomegranate spritz with blue cheese, or sparkling cider with cheddar and brie.")]
)

out = {"wines": W, "beers": B, "cocktails": COCKTAILS, "zero": ZERO}
for d in W + B:
    d["faq"] = [{"q": q, "a": x} for q, x in d["faq"]]
for d in (COCKTAILS, ZERO):
    d["faq"] = [{"q": q, "a": x} for q, x in d["faq"]]
json.dump(out, open("drinks.json", "w"), indent=1, ensure_ascii=False)
print(len(W), len(B))
