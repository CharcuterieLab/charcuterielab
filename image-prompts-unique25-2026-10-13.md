# Ingredient photos: 25 unique ingredients (v2, detailed)

Updated 13 Oct 2026. These replace the short v1 prompts. Image tools have rarely seen most of these foods, so each prompt spells out the exact shape, size, color and texture, gives a scale reference, and lists the mistakes to block.

## How to use this sheet

1. **Generate the 3:2 page photo first**, then the 2:3 Pinterest version in the same session so they match. If your tool accepts a reference image, give it a real product photo of the ingredient (a store listing photo is fine as a reference). That is the single best way to get these right.
2. **Paste the "Prompt" block as-is.** It already includes the house style. Paste the "Avoid" line into the negative prompt field if your tool has one; otherwise add it to the end of the prompt as "Do not show: ...".
3. **Check the result against the "Must be visible" list** before saving. If any item fails, regenerate. Don't fix it with alt text.
4. **Save** as `charcuterielab/public/images/ingredients/<slug>.jpg` (and `<slug>-pin.jpg`). Make them at least 1200 px wide if the tool allows.
5. Run `python3 scripts/make-thumbs.py` in `charcuterielab/`, then add alt text for each photo to `src/data/ingredient-alt.json`, written from the finished image.

**House style (already in every prompt):** soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, food-magazine styling, photorealistic. No text, no logos, no labels, no packaging, no hands, no people.

**Shared avoid list (add to every negative prompt):** text, letters, logos, brand labels, printed packaging, hands, fingers, people, cartoon, illustration, oversaturated colors, plastic-looking food, duplicate objects fused together.

---

## Cheese

### 1. Harbison
**File:** `harbison.jpg` · **Pin:** `harbison-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of a single small Harbison cheese from Vermont, a soft bloomy-rind cow's milk cheese about 4 inches across and 1.5 inches tall. A thin, flexible band of pale tan spruce bark (the soft inner bark, smooth and slightly fibrous, about 1.5 inches wide) wraps around the side of the round like a belt. The top rind has been sliced off like a lid and set leaning against the side, showing the inside: a glossy, ivory-cream paste so soft it is spoonable, slumping slightly, with one spoonful scooped out. The remaining rind is white and finely wrinkled, with a faint ivory blush. A small silver teaspoon rests beside the cheese with a little paste on it. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife nearby and a few slices of crusty baguette at the edge of frame. Three-quarter overhead angle so both the bark band and the open top are visible. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Same cheese and setup, shot from a steeper overhead angle in a vertical frame, the open cheese in the lower two-thirds and the spoon of paste in the foreground; baguette slices and a pear half fill the top.

**Must be visible:** bark band around the side (not a log, not wood chips); open top with soft, spoonable paste; white wrinkled rind.
**Avoid:** brie wedge, cut triangle, hard cheese, wooden box, birch bark (white with black marks), tree log, melted puddle, yellow paste.

### 2. Rogue River Blue
**File:** `rogue-river-blue.jpg` · **Pin:** `rogue-river-blue-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of a wedge of Rogue River Blue cheese from Oregon, cut from a wheel about 7 inches across, so the wedge is about 3 inches tall and 4 inches long with a curved outer edge. The cut face shows a dense, fudgy ivory to pale butter-yellow paste with blue-green and slate-blue veins and small pockets of mold, irregular rather than evenly marbled. The curved outer edge of the wedge is still wrapped in soft, dark, macerated grape leaves: deep olive-green to brown, limp and slightly glossy from being soaked in pear spirits, with visible leaf veins. Behind the wedge, more of the same dark leaves are peeled back and lying flat on the marble. Beside it, a ripe green-gold pear cut in half lengthwise, and a small drizzle of honey on the marble. Presented on a pale grey-veined marble slab with a small bone-handled cheese knife. Eye-level three-quarter angle so the cut face and the leaf wrap are both clear. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, the wedge standing on peeled-back leaves in the center, the pear half above it and a honey dipper resting at the bottom edge.

**Must be visible:** dark, soft, soaked-looking leaves on the rind side; blue-green veining in a creamy paste.
**Avoid:** bright green fresh vine leaves, crumbled blue cheese, white crumbly paste, bunches of grapes, wine bottle, tall Stilton-style cylinder.

### 3. Brunost
**File:** `brunost.jpg` · **Pin:** `brunost-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Norwegian brown cheese (brunost, also called gjetost): a smooth, rindless rectangular block about 3 inches long, 2.5 inches wide and 1.5 inches tall, the color of light caramel or milky fudge, with a matte, slightly satiny surface and perfectly smooth sides with no holes. A Norwegian cheese plane (a flat stainless-steel spatula with a slot blade and a short wooden handle) rests across the top of the block with one paper-thin shaving lifting through the slot. In front, a loose pile of thin caramel-colored shavings, curled and slightly translucent at the edges, plus two thin slices of crisp red apple and a rectangle of rye crispbread. Presented on a pale grey-veined marble slab. Three-quarter overhead angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no packaging, no hands, no people.

**Pin (2:3):** Vertical frame, the block in the upper half with the plane mid-shave, a tall loose stack of shavings on crispbread in the lower half.

**Must be visible:** the cheese plane (the defining tool); uniform tan-brown color all the way through; paper-thin shavings.
**Avoid:** orange or yellow cheese, a rind, holes or eyes, chocolate, peanut butter, fudge squares, red-and-white packaging.

### 4. Tête de Moine
**File:** `tete-de-moine.jpg` · **Pin:** `tete-de-moine-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Tête de Moine cheese rosettes. In the foreground, eight to ten pale golden-yellow rosettes, each about 2 inches across, made of a single very thin ribbon of cheese gathered into tight ruffles like a carnation or a peony, with frilly, slightly translucent edges. Behind them, a girolle: a round light-wood base about 8 inches across with a thin vertical steel spike through the center, holding a squat cylinder of cheese about 4 inches across and 3 inches tall with a brownish, slightly rough washed rind on the sides. A metal crank arm with a flat blade sits on top of the cylinder, and the top surface of the cheese is pale yellow and slightly scraped. Presented on a pale grey-veined marble slab with a few green grapes and walnut halves. Three-quarter angle from slightly above. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, the girolle in the top third, a cascade of rosettes arranged in a curving line down the lower two-thirds.

**Must be visible:** frilly ruffled rosettes (not rolls); the girolle with the spike and blade.
**Avoid:** rolled cheese slices, cheese cubes, rose-shaped salami, pink color, a box grater, butter curls.

### 5. Midnight Moon
**File:** `midnight-moon.jpg` · **Pin:** `midnight-moon-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of a wedge of Midnight Moon, an aged goat's milk gouda. The wedge is about 4 inches long and 2 inches tall, cut from a large wheel, with a thin black wax coating along the curved back edge. The paste is a striking bright ivory-white, not yellow, dense and smooth with tiny scattered white crunchy crystals that catch the light. In front of the wedge, three or four rough, broken shards of the same cheese with jagged crystalline edges, plus four dried apricots and a small pile of Marcona almonds. Presented on a pale grey-veined marble slab with a small bone-handled cheese knife. Low three-quarter angle so the ivory cut face and black rind contrast. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, the wedge standing upright on its back edge with the ivory face toward camera, broken shards and apricots below.

**Must be visible:** ivory-white paste; thin black rind; visible crystals.
**Avoid:** yellow or orange gouda, red wax, holes, soft fresh goat cheese, a log of chèvre, moon imagery.

### 6. Juustoleipä (Bread Cheese)
**File:** `juustoleipa.jpg` · **Pin:** `juustoleipa-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Finnish bread cheese (juustoleipä), warmed. Six fingers of cheese, each about 3 inches long and 3/4 inch wide, cut from a flat slab about 3/4 inch thick. The top surface of each finger is creamy white with irregular toasted golden-brown and darker brown scorched spots, like the top of a toasted marshmallow or a leopard pattern; the cut sides are smooth, dense and pale cream with no holes. The fingers glisten slightly from being warmed in a pan and sit on a small stoneware plate. Beside the plate, a small bowl of dark red cherry preserves with a spoon, and a cup of black coffee at the edge of frame. Presented on a pale grey-veined marble slab. Three-quarter angle from above. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, the cheese fingers fanned on the plate in the center, one finger dipped in the cherry preserves, coffee cup at the top.

**Must be visible:** toasty brown spots on the top surface only; smooth pale sides; cheese holding its shape, not melted.
**Avoid:** bread, toast, grill stripes, melted or stringy cheese, halloumi grill marks, French toast, fried coating, crumbs.

---

## Cured Meat and Seafood

### 7. Cecina
**File:** `cecina.jpg` · **Pin:** `cecina-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Spanish cecina, cured and smoked beef. Twelve paper-thin slices, each about 4 inches long, laid flat and slightly overlapping in a loose fan. The meat is a deep, even burgundy-ruby red, very lean with almost no white fat marbling, and the slices are so thin they are slightly translucent at the edges where light passes through. Each slice has a narrow darker mahogany-brown edge from the smoked exterior. A thin drizzle of golden-green olive oil glistens across the slices, and a pinch of red smoked paprika is dusted on one corner. Beside the fan, a small wedge of Manchego with its basket-weave rind and a few Marcona almonds. Presented on a dark walnut serving board with a folded natural linen cloth at the edge of frame. Overhead three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, the slices in a long overlapping ribbon running top to bottom, olive oil drizzle visible, Manchego and almonds at the bottom.

**Must be visible:** very lean deep-red slices; darker edge; translucent thinness.
**Avoid:** prosciutto (pink with a white fat band), pepperoni, salami rounds, roast beef, raw steak, jerky strips, bright pink color.

### 8. Lap Cheong
**File:** `lap-cheong.jpg` · **Pin:** `lap-cheong-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Chinese lap cheong sausage. In the background, two whole uncooked links lying side by side, each about 6 inches long and only 3/4 inch thick, firm and slightly wrinkled, a deep reddish-brown with small white flecks of fat visible through the thin casing, tied together at one end with a short loop of cotton string. In the foreground, about fifteen diagonal oval slices of cooked lap cheong, each about 1/4 inch thick, glossy and lacquered-looking, with caramelized dark edges, a rosy red interior and translucent white fat cubes, slightly curled from pan-searing. A few toothpicks rest beside them, plus a small dish of kimchi and three plain round rice crackers. Presented on a dark walnut serving board with a folded natural linen cloth at the edge of frame. Three-quarter angle from above. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no packaging, no hands, no people.

**Pin (2:3):** Vertical frame, the seared slices piled on a small plate in the center, the two tied raw links laid diagonally across the top.

**Must be visible:** thin links (not fat sausages); white fat flecks; caramelized glossy slice edges.
**Avoid:** hot dogs, bratwurst, kielbasa, pepperoni rounds, grill marks, chopsticks, round slices (must be diagonal ovals), artificial red color.

### 9. Biltong
**File:** `biltong.jpg` · **Pin:** `biltong-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of South African biltong. A loose pile of thin, irregular slices, each about 1.5 to 2 inches across, in a small ceramic ramekin and spilling onto the board. Each slice has a dark brown, almost black, dry outer edge crusted with cracked coriander seeds (small tan round seed halves) and coarse black pepper, and a deep maroon interior that turns rosy pink at the center of the thicker slices. In front of the ramekin, one whole biltong stick about 6 inches long and 1 inch thick, with a dark, rough, spice-crusted exterior; one end is cut to show the deep red to pink center. Beside it, a small bowl of amber mango chutney and a few smoked almonds. Presented on a dark walnut serving board with a folded natural linen cloth at the edge of frame. Three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no packaging, no hands, no people.

**Pin (2:3):** Vertical frame, the whole stick lying diagonally across the top with its cut end toward camera, the ramekin of slices below.

**Must be visible:** dark crusted edges with coriander seeds; pink-red center; one whole thick stick.
**Avoid:** shiny glazed jerky strips, uniform thin jerky, plastic bags, meat sticks in wrappers, cooked steak, sesame seeds.

### 10. Mojama
**File:** `mojama.jpg` · **Pin:** `mojama-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Spanish mojama, salt-cured and air-dried tuna loin. At the back, a small solid rectangular block of mojama about 4 inches long and 1.5 inches thick, with a very dark, almost black, maroon-brown exterior and a cut end showing a dense, deep garnet-red interior with no visible fat. In front, ten paper-thin slices laid flat in a single overlapping row, a translucent, glowing ruby-garnet color where the light passes through, glistening with golden olive oil. A small pile of pale, round, skinless Marcona almonds sits beside the slices, plus three green Manzanilla olives. Presented on a dark walnut serving board with a folded natural linen cloth at the edge of frame. Low three-quarter angle so light comes through the thin slices. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, the slices fanned in a curve down the center, the dark block at the top, almonds at the bottom.

**Must be visible:** the dark block plus translucent ruby slices; olive oil sheen.
**Avoid:** raw sashimi tuna (bright pink-red and wet), seared tuna steak, canned tuna flakes, smoked salmon (orange), prosciutto with fat.

### 11. Pastirma
**File:** `pastirma.jpg` · **Pin:** `pastirma-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Armenian and Turkish pastirma (basturma), spiced cured beef. Ten very thin oval slices, about 4 inches long, folded loosely in half and arranged in a row. The meat is a deep, lean, dark red. Around the outer edge of every slice is a distinct band, about 1/8 inch thick, of brick-red to rusty orange spice paste (ground fenugreek, garlic and paprika), slightly grainy and matte, clearly different from the meat. Behind the slices, a small piece of the uncut pastirma, flat and rectangular, completely coated in the thick rusty-red spice crust. Beside them, a small bowl of thick white labneh swirled with a spoon and finished with a pool of olive oil, plus a few black Kalamata olives and a folded piece of pita. Presented on a dark walnut serving board with a folded natural linen cloth at the edge of frame. Three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, the labneh bowl in the lower half with slices draped beside it, the crusted uncut piece at the top.

**Must be visible:** the rusty spice crust as an edge band on every slice; lean dark-red meat.
**Avoid:** pastrami (pink with a black pepper crust), corned beef, salami rounds, bacon, paprika dust everywhere.

---

## Fruit

### 12. Finger Limes
**File:** `finger-limes.jpg` · **Pin:** `finger-limes-pin.jpg`

**Prompt (3:2):**
Macro editorial food photograph of Australian finger limes. Five whole finger limes, each about 3 inches long and 3/4 inch thick, cylindrical and slightly curved like a small gherkin or a finger, with thin, smooth skin in dark green, purplish-black and reddish-brown. Two limes are cut in half crosswise, and from their open ends spill hundreds of tiny separate round pearls, each 1 to 3 millimeters across, glistening and translucent like caviar: one in pale pink-rose pearls, one in pale lime-green pearls. A small mound of loose pearls sits in a tiny spoon in front, each bead individually visible. Presented on a matte cream ceramic plate, with one whole finger lime lying off the plate. Close macro angle so the round pearls are sharp. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, a single halved finger lime standing upright with pink pearls overflowing onto a spoonful of white burrata below.

**Must be visible:** finger-shaped (long and thin) fruit; round, separate pearls (not wedge segments).
**Avoid:** round limes, lemons, lime wedges, citrus segments, orange fish roe, kiwi, cucumbers, pomegranate seeds.

### 13. Hoshigaki
**File:** `hoshigaki.jpg` · **Pin:** `hoshigaki-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Japanese hoshigaki, hand-dried whole persimmons. Three whole dried persimmons, each about 2.5 inches across, slightly flattened and squat, with deeply wrinkled, leathery skin in deep amber to chestnut brown, dusted all over with a fine, powdery, frost-like white natural sugar bloom. Each still has its dried four-leaf calyx and a short woody stem on top, and one has a short loop of natural twine tied to the stem. A fourth persimmon is sliced crosswise into four rounds, about 1/4 inch thick, showing a soft, glossy, jelly-like interior in translucent amber-orange, darker at the edge. A small wedge of blue cheese and three walnut halves sit beside it. Presented on a matte cream ceramic plate. Three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, three whole hoshigaki hanging from twine at the top of the frame, the sliced rounds and blue cheese on the plate below.

**Must be visible:** whole fruit with calyx; white sugar bloom; jammy amber cut face.
**Avoid:** fresh orange persimmons, dried fruit chips or rings, dates, figs, prunes, fuzzy mold, tomatoes, dried apricots.

---

## Nuts and Seeds

### 14. Pili Nuts
**File:** `pili-nuts.jpg` · **Pin:** `pili-nuts-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Philippine pili nuts. About thirty shelled kernels in a small unglazed stoneware bowl. Each kernel is about 1 inch long and narrow, a slender elongated teardrop that is rounded at one end and tapers to a point at the other, with a smooth, matte, pale ivory-cream surface; a few kernels still have small flakes of thin brown skin. A dozen more lie scattered on natural linen in front, along with a light sprinkle of pink salt crystals and two squares of dark chocolate. Close three-quarter angle so the long teardrop shape is obvious. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no packaging, no hands, no people.

**Pin (2:3):** Vertical frame, the bowl in the lower half, a few nuts arranged in a line running up the frame toward the chocolate.

**Must be visible:** long, slender, pointed ivory kernels.
**Avoid:** almonds (flat with brown skin), cashews (curved), macadamias (round), pine nuts (tiny), nuts in shells.

### 15. Baru Nuts
**File:** `baru-nuts.jpg` · **Pin:** `baru-nuts-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of dry-roasted Brazilian baru nuts. About forty nuts in a small unglazed stoneware bowl. Each nut is a smooth oval about 3/4 inch long, plumper and rounder than an almond, covered in a thin, papery, chocolate-brown skin with a matte finish. On several nuts the skin has cracked and is flaking away, showing a toasted golden-tan kernel underneath, and loose curls of brown skin lie on the linen around the bowl. A dozen nuts are scattered on natural linen in front, plus a small square of dark chocolate. Close three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no packaging, no hands, no people.

**Pin (2:3):** Vertical frame, overhead view of the bowl in the center, scattered nuts and skin flakes forming a loose trail toward the bottom.

**Must be visible:** smooth oval shape; papery brown skin flaking to show golden kernels.
**Avoid:** peanuts in shells, Spanish peanuts with red skins, almonds with pointed tips, coffee beans, round hazelnuts, chocolate-coated nuts.

---

## Spreads and Condiments

### 16. Pistachio Cream
**File:** `pistachio-cream.jpg` · **Pin:** `pistachio-cream-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Sicilian pistachio cream (crema di pistacchio). A small footed ceramic bowl filled with a smooth, glossy, silky spread the color of pale olive and sage green, with a soft swirl on top like frosting. A sprinkle of roughly chopped pistachios on top shows the natural nut colors: bright green kernels with flecks of purple-red skin. A wooden spreader rests across the rim with a ribbon of cream on it. Beside the bowl, two almond biscotti and a small bowl of white ricotta with a swirl of the green cream through it. Presented on marble. Three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no jar, no hands, no people.

**Pin (2:3):** Vertical frame, a biscotto dipped into the bowl with a thick ribbon of green cream, ricotta bowl below.

**Must be visible:** muted pale green (not bright); glossy smooth texture; real chopped pistachios.
**Avoid:** neon or mint green, guacamole, pesto with basil flecks, matcha powder, green ice cream, avocado.

### 17. Yuzu Kosho
**File:** `yuzu-kosho.jpg` · **Pin:** `yuzu-kosho-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Japanese green yuzu kosho. A very small shallow ceramic dish, about 2 inches across, holding about one teaspoon of a moist, coarse paste in khaki to olive-green, with visible tiny flecks of grated citrus zest and minced green chili, slightly glistening. A tiny wooden spoon rests in the dish. Beside it, one whole yuzu fruit, about the size of a mandarin, with thick, bumpy, uneven yellow-green rind, and one yuzu half cut crosswise showing pale flesh and several large seeds. One small, slender fresh green chili lies next to it. In the foreground, a round of white burrata with a tiny dab of the green paste on top. Presented on marble. Three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no jar, no hands, no people.

**Pin (2:3):** Vertical frame, the tiny dish in the center, the whole yuzu above, burrata with its dab of paste below.

**Must be visible:** a tiny amount of coarse green paste; a bumpy yuzu with seeds.
**Avoid:** wasabi (smooth bright green), pesto, a large bowl of paste, smooth lemons, limes, green curry, a jar label.

### 18. Cajeta
**File:** `cajeta.jpg` · **Pin:** `cajeta-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Mexican cajeta, goat's milk caramel. A small footed ceramic bowl full of thick, glossy caramel in a deep mahogany to dark amber color, with a mirror-like surface. A wooden spreader rests across the rim, and a slow, thick ribbon of cajeta is falling from it back into the bowl. Beside the bowl, six thin slices of crisp green apple fanned out, one dipped with caramel clinging to it, and a small crumbly wedge of white Cotija cheese. A few flakes of sea salt sparkle on the caramel surface. Presented on marble. Three-quarter angle from slightly above. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no jar, no hands, no people.

**Pin (2:3):** Vertical frame, a tall shot of the caramel ribbon falling from the spreader, apples and cheese at the bottom.

**Must be visible:** deep mahogany color (darker than ordinary caramel sauce); thick ribbon.
**Avoid:** pale yellow caramel, chocolate sauce, thin maple syrup, caramel candies, ice cream, a squeeze bottle.

### 19. Black Garlic
**File:** `black-garlic.jpg` · **Pin:** `black-garlic-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of black garlic. One whole head of black garlic, about 2 inches across, with its outer papery skin intact but slightly darkened to a dusty tan-brown, broken open at the top to show the cloves inside. In front, about eight peeled cloves in a small footed ceramic bowl: each clove is jet black all the way through, soft, glossy and slightly sticky, with the texture of a soft date or a gummy candy. One clove is cut in half, showing a uniformly black, smooth, jelly-like interior. A wooden spreader rests across the bowl rim with a little black garlic mashed on it. Beside the bowl, a small round of fresh white goat cheese with one black clove pressed on top. Presented on marble. Close three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, the whole head at the top, peeled cloves in the bowl in the middle, goat cheese at the bottom.

**Must be visible:** cloves black all the way through (the cut clove shows it); the familiar garlic-head shape.
**Avoid:** burnt or charred garlic, roasted golden garlic, white raw garlic cloves, black olives, prunes, coffee beans, ash.

---

## Pickles and Briny

### 20. Lupini Beans
**File:** `lupini-beans.jpg` · **Pin:** `lupini-beans-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of brined lupini beans. A shallow glazed ceramic dish full of about forty lupini beans, each a flat round disc about 1/2 inch across and about 1/4 inch thick, a bright, glossy golden-yellow, with a thin, slightly translucent skin and a tiny notch or eye on one edge. They glisten with brine and olive oil and are flecked with red chili flakes and thin strips of lemon zest. Beside the dish, three beans popped out of their skins (the bean inside is a paler yellow), with the empty, wrinkled, translucent skins next to them, and a small empty dish for skins. Two green Castelvetrano olives sit nearby for scale. Presented on weathered grey wood. Close three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no jar, no hands, no people.

**Pin (2:3):** Vertical frame, the dish in the lower two-thirds, the popped beans and skins arranged in a short row across the top.

**Must be visible:** flat round yellow discs; at least one empty skin.
**Avoid:** chickpeas (round, beige), corn kernels, green fava beans, white kidney-shaped butter beans, lentils, pills.

### 21. Pickled Quail Eggs
**File:** `pickled-quail-eggs.jpg` · **Pin:** `pickled-quail-eggs-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of pickled quail eggs. A shallow glazed ceramic dish holding about ten small peeled hard-boiled quail eggs, each only about 1.25 inches long (about the size of a large olive), smooth and oval. Half are a pale creamy ivory tinged gold from the brine, and half are a vivid magenta-pink from beet brine. Three eggs are cut in half lengthwise, showing a firm white ring around a pale yellow yolk (on the pink eggs, a thin pink outer rim, then white, then yellow), sprinkled with flaky salt and cracked black pepper. Next to the dish, for scale and identity, two whole raw quail eggs in their shells: small, cream-colored with dark brown speckles and blotches. A few rings of pickled jalapeño and some toothpicks complete the scene. Presented on weathered grey wood. Close three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no jar, no hands, no people.

**Pin (2:3):** Vertical frame, halved pink and ivory eggs in a neat row down the center, the two speckled shells at the top.

**Must be visible:** small size (olive-sized); the speckled shells for identity; halved yolks.
**Avoid:** chicken eggs, piped deviled-egg filling, runny yolks, chocolate eggs, Easter eggs, a large jar.

### 22. Pickled Watermelon Rind
**File:** `pickled-watermelon-rind.jpg` · **Pin:** `pickled-watermelon-rind-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Southern sweet pickled watermelon rind. A shallow glazed ceramic dish of about twenty cubes, each about 3/4 inch, glassy and translucent like candied fruit, in pale green-gold to light amber, glistening with a light syrup. A few cubes keep a thin band of rosy pink flesh along one edge. None of the cubes has dark green skin. A cinnamon stick, three whole cloves and a thin slice of lemon sit in the syrup. Beside the dish, a few thin slices of country ham and two saltine crackers, with toothpicks. Presented on weathered grey wood. Close three-quarter angle so light shines through the translucent cubes. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no jar, no hands, no people.

**Pin (2:3):** Vertical frame, overhead view of the dish with a single cube on a toothpick lifted at the top, ham and crackers at the bottom.

**Must be visible:** translucent glassy cubes; a pink edge on a few; no green skin.
**Avoid:** fresh watermelon slices, red watermelon cubes, cucumber pickles with seeds, gummy candy, gelatin cubes, pineapple chunks.

---

## Finishing Touches and Bases

### 23. Saba
**File:** `saba.jpg` · **Pin:** `saba-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Italian saba, cooked grape must syrup. Three rough chunks of Parmigiano-Reggiano, broken not cut, pale straw-yellow and granular with tiny white crystals, sit on a pale marble surface. A thin, glossy stream of thick syrup, very dark brown with a purple-black depth that turns ruby at its thin edges, drizzles over the cheese and pools slightly beside it. Behind, a small clear glass cruet, about 4 inches tall, half filled with the same dark syrup. Two fresh purple figs, one halved, sit nearby, with generous negative space. Low three-quarter angle with light catching the ruby edge of the syrup. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, a tall shot of the syrup stream falling from a spoon onto the cheese, the cruet and figs at the bottom.

**Must be visible:** thick, dark, glossy syrup with ruby edges; granular Parmigiano.
**Avoid:** thin black vinegar in a big bottle, chocolate sauce, soy sauce, red wine, maple-colored syrup.

### 24. Cured Egg Yolks
**File:** `cured-egg-yolks.jpg` · **Pin:** `cured-egg-yolks-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of salt-cured egg yolks. Two whole cured yolks, each about 1.25 inches across, slightly flattened domes that are firm, smooth and translucent like amber glass or a hard candy, in a deep orange-gold. One yolk is partly grated: a microplane grater rests beside it, and a small, fluffy mound of very fine orange-gold shreds sits on a round of white burrata. A few more golden shreds are scattered on a slice of toasted crostini. A shallow dish of coarse white salt-and-sugar cure sits in the background with one empty hollow where a yolk was. Presented on a pale marble surface with generous negative space. Close three-quarter angle, light passing through the translucent yolks. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Vertical frame, the whole yolks at the top, the burrata with its golden mound in the center, crostini at the bottom.

**Must be visible:** firm, translucent amber yolks; fluffy grated shreds.
**Avoid:** raw runny yolks, fried eggs, boiled eggs, shredded cheddar, orange zest, saffron threads, carrots.

### 25. Tortas de Aceite
**File:** `tortas-de-aceite.jpg` · **Pin:** `tortas-de-aceite-pin.jpg`

**Prompt (3:2):**
Close-up editorial food photograph of Spanish tortas de aceite, olive oil crisps from Seville. Four round crisps, each about 4.5 inches across and only about 1/8 inch thick, with irregular, hand-pressed edges. The surface is pale golden with darker caramelized blisters and bubbles, sparkling with coarse sugar crystals and dotted with white sesame seeds and a few anise seeds. One crisp is stacked on another, one is broken into large irregular shards showing a flaky, layered break, and one is half-wrapped in a plain, translucent, unprinted waxed paper wrapper. Beside them, a small wedge of Manchego with its basket-weave rind and two squares of dark chocolate. Presented on a light oak board over oatmeal linen, with a few loose crumbs. Three-quarter angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no printed wrapper, no hands, no people.

**Pin (2:3):** Vertical frame, shards of torta standing upright behind the Manchego, a whole torta in its plain wrapper at the bottom.

**Must be visible:** very thin, blistered, irregular rounds; sugar and sesame on top; a plain wrapper.
**Avoid:** tortillas, pita, naan, pizza, uniform round water crackers, cookies, printed brand wrappers, thick flatbread.

---

## Post hero (optional)

**File:** `/images/unique-charcuterie-ingredients.jpg` (then set `image:` in the post's frontmatter)

**Prompt (3:2):** Overhead editorial food photograph of a dark walnut charcuterie board styled around a few unusual ingredients, each in its own small dish or zone with space around it: a Harbison cheese with its pale tan spruce-bark band and open, spoonable ivory top; Tête de Moine rosettes like pale yellow carnations; a halved finger lime spilling pink caviar-like pearls onto white burrata; a fan of translucent ruby mojama slices glistening with olive oil; a small dish of glossy jet-black garlic cloves; and three whole hoshigaki persimmons dusted with a white sugar bloom. Plain crackers, green grapes and walnuts fill the gaps. Soft diffused natural window light from the upper left, gentle shadows, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no labels, no hands, no people.

**Pin (2:3):** Same board shot vertically, with clean space at the top for a text overlay added later. Don't generate text in the image.
