# Charcuterie Lab — Ingredient Image Prompt Sheet

**295 images, one per ingredient page.** Every prompt was written from that page's own `**Look:**` line and its prep instructions, so the image matches what the page actually describes.

---

## How to use this

**1. Generate the image.** Copy the prompt into whichever tool you use (Midjourney, DALL·E, Firefly, Imagen). The prompts are written as plain descriptive sentences, which all of them handle. For Midjourney, append `--ar 3:2 --style raw`.

**2. Save it under the exact filename in the table.** The filename is always the page's slug plus `.jpg`, so nothing has to be matched up by hand later.

**3. Put the files here:**

```
charcuterielab-site/public/images/ingredients/
```

**4. Add one line to that page's frontmatter.** The site already falls back to `/images/layout-reference.jpg` when `image:` is missing, so pages without an image keep working — you can do these in any order, a few at a time.

```yaml
image: "/images/ingredients/aged-cheddar.jpg"
```

Put it directly under the `excerpt:` line. **Do not** add `image:` with an empty or `null` value — the build's frontmatter parser reads `null` as the literal string and would render a broken image.

### Batch-adding the frontmatter line

Once images are in the folder, this adds the `image:` line to every page that has a matching file and doesn't already have one. Run it from the site root:

```bash
cd charcuterielab-site
for f in public/images/ingredients/*.jpg; do
  slug=$(basename "$f" .jpg)
  md="content/ingredients/$slug.md"
  [ -f "$md" ] || continue
  grep -q "^image:" "$md" && continue
  sed -i "0,/^excerpt:/s|^excerpt:.*|&\nimage: \"/images/ingredients/$slug.jpg\"|" "$md"
done
```

---

## House style

Every prompt ends with the same lighting and framing block so the 295 images read as one series:

> Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.

Surfaces vary by category so the set doesn't look monotonous:

| Category | Surface | Prop |
|---|---|---|
| Cheese | pale grey-veined marble slab | small bone-handled cheese knife |
| Cured Meat & Seafood | dark walnut serving board | folded natural linen cloth |
| Crackers & Breads | light oak board over oatmeal linen | a few loose crumbs |
| Fruit | matte cream ceramic plate | one or two loose pieces off the plate |
| Nuts & Seeds | small unglazed stoneware bowl on linen | a few pieces scattered beside |
| Spreads, Jams & Honey | small footed ceramic bowl on marble | wooden spreader across the rim |
| Pickles, Olives & Briny | shallow glazed dish on weathered grey wood | two or three pieces beside |
| Finishing Touches | pale marble surface | generous negative space |

**No text, no logos** is in every prompt on purpose — an AI-generated cheese label or brand mark is the fastest way to make a page look fake, and it can't be used commercially anyway.

---

## Priority order

If you're not doing all 295 at once, these are the pages worth having images on first — they're the highest-traffic search terms and the ones most likely to be shared:

| # | Filename | Page |
|---|---|---|
| 1 | `brie.jpg` | Brie |
| 2 | `aged-cheddar.jpg` | Aged Cheddar |
| 3 | `manchego.jpg` | Manchego |
| 4 | `gorgonzola.jpg` | Gorgonzola |
| 5 | `burrata.jpg` | Burrata |
| 6 | `prosciutto-di-parma.jpg` | Prosciutto di Parma |
| 7 | `genoa-salami.jpg` | Genoa Salami |
| 8 | `soppressata.jpg` | Soppressata |
| 9 | `water-crackers.jpg` | Water Crackers |
| 10 | `baguette.jpg` | Baguette |
| 11 | `grapes.jpg` | Grapes |
| 12 | `figs.jpg` | Figs |
| 13 | `medjool-dates.jpg` | Medjool Dates |
| 14 | `marcona-almonds.jpg` | Marcona Almonds |
| 15 | `fig-jam.jpg` | Fig Jam |
| 16 | `honey.jpg` | Honey |
| 17 | `hot-honey.jpg` | Hot Honey |
| 18 | `castelvetrano-olives.jpg` | Castelvetrano Olives |
| 19 | `cornichons.jpg` | Cornichons |
| 20 | `flaky-sea-salt.jpg` | Flaky Sea Salt |

---

## The prompts

# Cheese

*74 images*

## Aged & hard

### Aged Cheddar

**File:** `aged-cheddar.jpg`  
**Frontmatter:** `image: "/images/ingredients/aged-cheddar.jpg"`  
**Alt text:** Aged Cheddar styled on a charcuterie board

```
Close-up editorial food photograph of aged cheddar — pale ivory to deep amber, dry-looking, often cloth-bound. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut thick. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Aged Gouda

**File:** `aged-gouda.jpg`  
**Frontmatter:** `image: "/images/ingredients/aged-gouda.jpg"`  
**Alt text:** Aged Gouda styled on a charcuterie board

```
Close-up editorial food photograph of aged gouda — deep amber to brown, dry, glassy at the crystals. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: break it into shards. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Aged Provolone

**File:** `aged-provolone.jpg`  
**Frontmatter:** `image: "/images/ingredients/aged-provolone.jpg"`  
**Alt text:** Aged Provolone styled on a charcuterie board

```
Close-up editorial food photograph of aged provolone — pale gold, smooth waxy rind, often pear-shaped or hung in ropes. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thick batons or chunks. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Asiago

**File:** `asiago.jpg`  
**Frontmatter:** `image: "/images/ingredients/asiago.jpg"`  
**Alt text:** Asiago styled on a charcuterie board

```
Close-up editorial food photograph of asiago — pale ivory with small holes fresh; deep straw and dry aged. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thin slices and small cubes. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Beaufort

**File:** `beaufort.jpg`  
**Frontmatter:** `image: "/images/ingredients/beaufort.jpg"`  
**Alt text:** Beaufort styled on a charcuterie board

```
Close-up editorial food photograph of beaufort — deep golden paste, concave-sided wheel, natural rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut thick batons or rough wedges. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Comté

**File:** `comte.jpg`  
**Frontmatter:** `image: "/images/ingredients/comte.jpg"`  
**Alt text:** Comté styled on a charcuterie board

```
Close-up editorial food photograph of comté — pale gold to deep yellow, natural brown rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut it into thick batons or short wedges. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cotija

**File:** `cotija.jpg`  
**Frontmatter:** `image: "/images/ingredients/cotija.jpg"`  
**Alt text:** Cotija styled on a charcuterie board

```
Close-up editorial food photograph of cotija — stark white, matte, no rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: crumble it into a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cotswold

**File:** `cotswold.jpg`  
**Frontmatter:** `image: "/images/ingredients/cotswold.jpg"`  
**Alt text:** Cotswold styled on a charcuterie board

```
Close-up editorial food photograph of cotswold — vivid orange paste with green flecks throughout. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thick batons or cubes. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Emmental

**File:** `emmental.jpg`  
**Frontmatter:** `image: "/images/ingredients/emmental.jpg"`  
**Alt text:** Emmental styled on a charcuterie board

```
Close-up editorial food photograph of emmental — pale yellow with large round holes, thin natural rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thick batons or triangles. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Grana Padano

**File:** `grana-padano.jpg`  
**Frontmatter:** `image: "/images/ingredients/grana-padano.jpg"`  
**Alt text:** Grana Padano styled on a charcuterie board

```
Close-up editorial food photograph of grana padano — pale straw, dry, thick natural rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: break it into shards. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Gruyère

**File:** `gruyere.jpg`  
**Frontmatter:** `image: "/images/ingredients/gruyere.jpg"`  
**Alt text:** Gruyère styled on a charcuterie board

```
Close-up editorial food photograph of gruyère — pale gold, natural brownish rind, occasional small eyes. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thick batons or rough chunks. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Idiazábal

**File:** `idiazabal.jpg`  
**Frontmatter:** `image: "/images/ingredients/idiazabal.jpg"`  
**Alt text:** Idiazábal styled on a charcuterie board

```
Close-up editorial food photograph of idiazábal — ivory paste, hard amber-brown rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut thin triangular wedges. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Mahón

**File:** `mahon.jpg`  
**Frontmatter:** `image: "/images/ingredients/mahon.jpg"`  
**Alt text:** Mahón styled on a charcuterie board

```
Close-up editorial food photograph of mahón — pale ivory to deep gold paste, orange paprika-rubbed rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thin triangular wedges. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Manchego

**File:** `manchego.jpg`  
**Frontmatter:** `image: "/images/ingredients/manchego.jpg"`  
**Alt text:** Manchego styled on a charcuterie board

```
Close-up editorial food photograph of manchego — ivory to golden paste, dark rind with a zigzag basketweave pattern. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut it into thin triangular wedges. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Mimolette

**File:** `mimolette.jpg`  
**Frontmatter:** `image: "/images/ingredients/mimolette.jpg"`  
**Alt text:** Mimolette styled on a charcuterie board

```
Close-up editorial food photograph of mimolette — vivid orange paste, grey pitted rind like a small moon. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: break it into shards. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Parmigiano-Reggiano

**File:** `parmigiano-reggiano.jpg`  
**Frontmatter:** `image: "/images/ingredients/parmigiano-reggiano.jpg"`  
**Alt text:** Parmigiano-Reggiano styled on a charcuterie board

```
Close-up editorial food photograph of parmigiano-reggiano — pale straw yellow, dry, with a thick natural rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: break it, don't slice it. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pecorino Romano

**File:** `pecorino-romano.jpg`  
**Frontmatter:** `image: "/images/ingredients/pecorino-romano.jpg"`  
**Alt text:** Pecorino Romano styled on a charcuterie board

```
Close-up editorial food photograph of pecorino romano — white to pale straw, much whiter than Parmigiano. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: break it into small shards. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Red Leicester

**File:** `red-leicester.jpg`  
**Frontmatter:** `image: "/images/ingredients/red-leicester.jpg"`  
**Alt text:** Red Leicester styled on a charcuterie board

```
Close-up editorial food photograph of red leicester — deep orange-russet paste, dry natural rind on farmhouse versions. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thick chunks or short batons. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Smoked Gouda

**File:** `smoked-gouda.jpg`  
**Frontmatter:** `image: "/images/ingredients/smoked-gouda.jpg"`  
**Alt text:** Smoked Gouda styled on a charcuterie board

```
Close-up editorial food photograph of smoked gouda — pale yellow paste with a distinct brown outer edge. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into cubes or thin slices. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Blue

### Bleu d'Auvergne

**File:** `bleu-dauvergne.jpg`  
**Frontmatter:** `image: "/images/ingredients/bleu-dauvergne.jpg"`  
**Alt text:** Bleu d'Auvergne styled on a charcuterie board

```
Close-up editorial food photograph of bleu d'auvergne — ivory paste with even blue-green veining, thin natural rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges from the center out. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cabrales

**File:** `cabrales.jpg`  
**Frontmatter:** `image: "/images/ingredients/cabrales.jpg"`  
**Alt text:** Cabrales styled on a charcuterie board

```
Close-up editorial food photograph of cabrales — ivory to grey paste, heavily veined blue-green, no rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: serve half an ounce per person. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cambozola

**File:** `cambozola.jpg`  
**Frontmatter:** `image: "/images/ingredients/cambozola.jpg"`  
**Alt text:** Cambozola styled on a charcuterie board

```
Close-up editorial food photograph of cambozola — ivory paste with faint blue-grey veining, white bloomy rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges from the center out. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Danish Blue

**File:** `danish-blue.jpg`  
**Frontmatter:** `image: "/images/ingredients/danish-blue.jpg"`  
**Alt text:** Danish Blue styled on a charcuterie board

```
Close-up editorial food photograph of danish blue — very white paste with dense blue-green veining. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: crumble it rather than slicing. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Gorgonzola

**File:** `gorgonzola.jpg`  
**Frontmatter:** `image: "/images/ingredients/gorgonzola.jpg"`  
**Alt text:** Gorgonzola styled on a charcuterie board

```
Close-up editorial food photograph of gorgonzola — ivory paste with blue-green veining, thin natural rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: a cut wedge with blue-green veining, softly slumping at the point. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Maytag Blue

**File:** `maytag-blue.jpg`  
**Frontmatter:** `image: "/images/ingredients/maytag-blue.jpg"`  
**Alt text:** Maytag Blue styled on a charcuterie board

```
Close-up editorial food photograph of maytag blue — white paste with dense blue-green veining, no rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: crumble it. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Roquefort

**File:** `roquefort.jpg`  
**Frontmatter:** `image: "/images/ingredients/roquefort.jpg"`  
**Alt text:** Roquefort styled on a charcuterie board

```
Close-up editorial food photograph of roquefort — stark white paste heavily marbled with blue-green, no rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut with a wire or floss. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Stilton

**File:** `stilton.jpg`  
**Frontmatter:** `image: "/images/ingredients/stilton.jpg"`  
**Alt text:** Stilton styled on a charcuterie board

```
Close-up editorial food photograph of stilton — pale ivory paste with blue-green veining, dry brown crusty rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges from the center out. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Goat & sheep

### Bucheron

**File:** `bucheron.jpg`  
**Frontmatter:** `image: "/images/ingredients/bucheron.jpg"`  
**Alt text:** Bucheron styled on a charcuterie board

```
Close-up editorial food photograph of bucheron — white log with a bloomy rind and a visible creamline in cross-section. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut discs with dental floss or a wire. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cranberry Goat Cheese

**File:** `cranberry-goat-cheese.jpg`  
**Frontmatter:** `image: "/images/ingredients/cranberry-goat-cheese.jpg"`  
**Alt text:** Cranberry Goat Cheese styled on a charcuterie board

```
Close-up editorial food photograph of cranberry goat cheese — white log with a deep red and green crust. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: slice with floss or wire. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Crottin de Chavignol

**File:** `crottin-de-chavignol.jpg`  
**Frontmatter:** `image: "/images/ingredients/crottin-de-chavignol.jpg"`  
**Alt text:** Crottin de Chavignol styled on a charcuterie board

```
Close-up editorial food photograph of crottin de chavignol — a small flat-topped cylinder, white to dark brown depending on age. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: serve them whole or halved. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Drunken Goat

**File:** `drunken-goat.jpg`  
**Frontmatter:** `image: "/images/ingredients/drunken-goat.jpg"`  
**Alt text:** Drunken Goat styled on a charcuterie board

```
Close-up editorial food photograph of drunken goat — stark white paste with a vivid purple-violet rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut thin wedges with the purple rind on the outer edge. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Garrotxa

**File:** `garrotxa.jpg`  
**Frontmatter:** `image: "/images/ingredients/garrotxa.jpg"`  
**Alt text:** Garrotxa styled on a charcuterie board

```
Close-up editorial food photograph of garrotxa — bright white paste under a thick velvet grey-blue rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges with the grey rind attached. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Humboldt Fog

**File:** `humboldt-fog.jpg`  
**Frontmatter:** `image: "/images/ingredients/humboldt-fog.jpg"`  
**Alt text:** Humboldt Fog styled on a charcuterie board

```
Close-up editorial food photograph of humboldt fog — white round with a black ash line through the middle and an. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges from the center out. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Ossau-Iraty

**File:** `ossau-iraty.jpg`  
**Frontmatter:** `image: "/images/ingredients/ossau-iraty.jpg"`  
**Alt text:** Ossau-Iraty styled on a charcuterie board

```
Close-up editorial food photograph of ossau-iraty — ivory to pale gold paste, natural grey-brown rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thin wedges or batons. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pecorino Toscano

**File:** `pecorino-toscano.jpg`  
**Frontmatter:** `image: "/images/ingredients/pecorino-toscano.jpg"`  
**Alt text:** Pecorino Toscano styled on a charcuterie board

```
Close-up editorial food photograph of pecorino toscano — ivory to pale straw paste, rind ranging from pale yellow to deep red. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thin wedges. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Roncal

**File:** `roncal.jpg`  
**Frontmatter:** `image: "/images/ingredients/roncal.jpg"`  
**Alt text:** Roncal styled on a charcuterie board

```
Close-up editorial food photograph of roncal — ivory to deep straw paste, hard brown natural rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut thin triangular wedges. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Sainte-Maure de Touraine

**File:** `sainte-maure.jpg`  
**Frontmatter:** `image: "/images/ingredients/sainte-maure.jpg"`  
**Alt text:** Sainte-Maure de Touraine styled on a charcuterie board

```
Close-up editorial food photograph of sainte-maure de touraine — tapered grey-black ash log with a straw protruding from one end. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut discs with floss or a wire. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Valençay

**File:** `valencay.jpg`  
**Frontmatter:** `image: "/images/ingredients/valencay.jpg"`  
**Alt text:** Valençay styled on a charcuterie board

```
Close-up editorial food photograph of valençay — grey-black ash-covered pyramid with the top cut flat. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: serve it whole, or cut one wedge and leave the rest standing. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Plant-based

### Almond Ricotta

**File:** `almond-ricotta.jpg`  
**Frontmatter:** `image: "/images/ingredients/almond-ricotta.jpg"`  
**Alt text:** Almond Ricotta styled on a charcuterie board

```
Close-up editorial food photograph of almond ricotta — white to pale ivory, matte, visibly textured. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: spread it in a shallow bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cashew Cheese

**File:** `cashew-cheese.jpg`  
**Frontmatter:** `image: "/images/ingredients/cashew-cheese.jpg"`  
**Alt text:** Cashew Cheese styled on a charcuterie board

```
Close-up editorial food photograph of cashew cheese — pale ivory, matte, sometimes with a bloomy or ash rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: spread thick in a small bowl, textured with the back of a spoon. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Vegan Brie

**File:** `vegan-brie.jpg`  
**Frontmatter:** `image: "/images/ingredients/vegan-brie.jpg"`  
**Alt text:** Vegan Brie styled on a charcuterie board

```
Close-up editorial food photograph of vegan brie — small white wheel with a genuine bloomy rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges from the center out. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Vegan Cream Cheese

**File:** `vegan-cream-cheese.jpg`  
**Frontmatter:** `image: "/images/ingredients/vegan-cream-cheese.jpg"`  
**Alt text:** Vegan Cream Cheese styled on a charcuterie board

```
Close-up editorial food photograph of vegan cream cheese — white to ivory, matte, holds a swirl. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: spread it in a shallow bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Semi-soft

### Edam

**File:** `edam.jpg`  
**Frontmatter:** `image: "/images/ingredients/edam.jpg"`  
**Alt text:** Edam styled on a charcuterie board

```
Close-up editorial food photograph of edam — pale yellow paste, red or yellow wax coating. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thin wedges or cubes. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Fontina

**File:** `fontina.jpg`  
**Frontmatter:** `image: "/images/ingredients/fontina.jpg"`  
**Alt text:** Fontina styled on a charcuterie board

```
Close-up editorial food photograph of fontina — pale straw paste, thin brownish-orange washed rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thick slices or batons. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Havarti

**File:** `havarti.jpg`  
**Frontmatter:** `image: "/images/ingredients/havarti.jpg"`  
**Alt text:** Havarti styled on a charcuterie board

```
Close-up editorial food photograph of havarti — pale cream with many small irregular holes, no rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thin slices or small cubes. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Monterey Jack

**File:** `monterey-jack.jpg`  
**Frontmatter:** `image: "/images/ingredients/monterey-jack.jpg"`  
**Alt text:** Monterey Jack styled on a charcuterie board

```
Close-up editorial food photograph of monterey jack — pale ivory young; deep gold with a dark rubbed rind aged. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into cubes and thin slices. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Morbier

**File:** `morbier.jpg`  
**Frontmatter:** `image: "/images/ingredients/morbier.jpg"`  
**Alt text:** Morbier styled on a charcuterie board

```
Close-up editorial food photograph of morbier — pale ivory paste split by a distinct black horizontal line, orange. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges that show the ash line clearly. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Muenster

**File:** `muenster.jpg`  
**Frontmatter:** `image: "/images/ingredients/muenster.jpg"`  
**Alt text:** Muenster styled on a charcuterie board

```
Close-up editorial food photograph of muenster — both are pale with orange exteriors, which is where the confusion. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: folded slices and small cubes, orange rind visible. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Port Salut

**File:** `port-salut.jpg`  
**Frontmatter:** `image: "/images/ingredients/port-salut.jpg"`  
**Alt text:** Port Salut styled on a charcuterie board

```
Close-up editorial food photograph of port salut — pale ivory paste, smooth bright orange rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thin wedges or slices. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Raclette

**File:** `raclette.jpg`  
**Frontmatter:** `image: "/images/ingredients/raclette.jpg"`  
**Alt text:** Raclette styled on a charcuterie board

```
Close-up editorial food photograph of raclette — pale gold paste, tan-orange washed rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: thin slices fanned in a row, pale gold with a tan rind. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Taleggio

**File:** `taleggio.jpg`  
**Frontmatter:** `image: "/images/ingredients/taleggio.jpg"`  
**Alt text:** Taleggio styled on a charcuterie board

```
Close-up editorial food photograph of taleggio — square block, pale paste, thin pinkish-orange rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into rectangular slabs. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Tomme de Savoie

**File:** `tomme-de-savoie.jpg`  
**Frontmatter:** `image: "/images/ingredients/tomme-de-savoie.jpg"`  
**Alt text:** Tomme de Savoie styled on a charcuterie board

```
Close-up editorial food photograph of tomme de savoie — pale ivory paste, thick grey-brown mottled rind with visible mold. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges with a generous piece of the grey rind attached. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Wensleydale with Cranberries

**File:** `wensleydale-cranberry.jpg`  
**Frontmatter:** `image: "/images/ingredients/wensleydale-cranberry.jpg"`  
**Alt text:** Wensleydale with Cranberries styled on a charcuterie board

```
Close-up editorial food photograph of wensleydale with cranberries — stark white paste studded with deep red dried cranberries. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: break it, don't slice it. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Soft & fresh

### Boursin

**File:** `boursin.jpg`  
**Frontmatter:** `image: "/images/ingredients/boursin.jpg"`  
**Alt text:** Boursin styled on a charcuterie board

```
Close-up editorial food photograph of boursin — white flecked with green, formed into a round puck. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: break the top open. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Brie

**File:** `brie.jpg`  
**Frontmatter:** `image: "/images/ingredients/brie.jpg"`  
**Alt text:** Brie styled on a charcuterie board

```
Close-up editorial food photograph of brie — pale ivory paste under a fuzzy white rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges from the center out, like a pie. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Burrata

**File:** `burrata.jpg`  
**Frontmatter:** `image: "/images/ingredients/burrata.jpg"`  
**Alt text:** Burrata styled on a charcuterie board

```
Close-up editorial food photograph of burrata — a white ball, often tied at the top, that collapses when cut. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut it open at the table. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Camembert

**File:** `camembert.jpg`  
**Frontmatter:** `image: "/images/ingredients/camembert.jpg"`  
**Alt text:** Camembert styled on a charcuterie board

```
Close-up editorial food photograph of camembert — small ivory round, white rind flecked with rust and grey. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges from the center out. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cream Cheese

**File:** `cream-cheese.jpg`  
**Frontmatter:** `image: "/images/ingredients/cream-cheese.jpg"`  
**Alt text:** Cream Cheese styled on a charcuterie board

```
Close-up editorial food photograph of cream cheese — white, matte, holds its shape. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: spread it in a shallow bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Feta

**File:** `feta.jpg`  
**Frontmatter:** `image: "/images/ingredients/feta.jpg"`  
**Alt text:** Feta styled on a charcuterie board

```
Close-up editorial food photograph of feta — stark white blocks or slabs, no rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: serve it as a slab. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Fresh Chèvre

**File:** `fresh-chevre.jpg`  
**Frontmatter:** `image: "/images/ingredients/fresh-chevre.jpg"`  
**Alt text:** Fresh Chèvre styled on a charcuterie board

```
Close-up editorial food photograph of fresh chèvre — stark white log or puck, sometimes rolled in herbs or ash. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: slice the log with dental floss or a thin wire. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Fresh Mozzarella

**File:** `fresh-mozzarella.jpg`  
**Frontmatter:** `image: "/images/ingredients/fresh-mozzarella.jpg"`  
**Alt text:** Fresh Mozzarella styled on a charcuterie board

```
Close-up editorial food photograph of fresh mozzarella — bright white spheres in cloudy liquid. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: tear it, don't slice it. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Halloumi

**File:** `halloumi.jpg`  
**Frontmatter:** `image: "/images/ingredients/halloumi.jpg"`  
**Alt text:** Halloumi styled on a charcuterie board

```
Close-up editorial food photograph of halloumi — white folded slabs, browning to deep gold when cooked. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: slice about ⅓ inch thick. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Mascarpone

**File:** `mascarpone.jpg`  
**Frontmatter:** `image: "/images/ingredients/mascarpone.jpg"`  
**Alt text:** Mascarpone styled on a charcuterie board

```
Close-up editorial food photograph of mascarpone — pale ivory, thick, glossy. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: spread it in a shallow bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Queso Fresco

**File:** `queso-fresco.jpg`  
**Frontmatter:** `image: "/images/ingredients/queso-fresco.jpg"`  
**Alt text:** Queso Fresco styled on a charcuterie board

```
Close-up editorial food photograph of queso fresco — white rounds or blocks, no rind, often wrapped. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: crumbled into a loose white pile. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Ricotta

**File:** `ricotta.jpg`  
**Frontmatter:** `image: "/images/ingredients/ricotta.jpg"`  
**Alt text:** Ricotta styled on a charcuterie board

```
Close-up editorial food photograph of ricotta — white, slightly lumpy, moist. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: spread it in a shallow bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Stracciatella

**File:** `stracciatella.jpg`  
**Frontmatter:** `image: "/images/ingredients/stracciatella.jpg"`  
**Alt text:** Stracciatella styled on a charcuterie board

```
Close-up editorial food photograph of stracciatella — white, glossy, visibly shredded. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: spooned into a shallow bowl, torn white curds in cream. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Triple-Crème

**File:** `triple-creme.jpg`  
**Frontmatter:** `image: "/images/ingredients/triple-creme.jpg"`  
**Alt text:** Triple-Crème styled on a charcuterie board

```
Close-up editorial food photograph of triple-crème — bright white paste, thick and even, under a white rind. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges from the center out. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Specialty

### Truffle Cheese

**File:** `truffle-cheese.jpg`  
**Frontmatter:** `image: "/images/ingredients/truffle-cheese.jpg"`  
**Alt text:** Truffle Cheese styled on a charcuterie board

```
Close-up editorial food photograph of truffle cheese — pale paste flecked with visible black specks. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut into thin slices or small wedges. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Washed-rind

### Langres

**File:** `langres.jpg`  
**Frontmatter:** `image: "/images/ingredients/langres.jpg"`  
**Alt text:** Langres styled on a charcuterie board

```
Close-up editorial food photograph of langres — small orange cylinder with a distinct hollow in the top. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: a small cylinder with a sunken orange-washed top. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Limburger

**File:** `limburger.jpg`  
**Frontmatter:** `image: "/images/ingredients/limburger.jpg"`  
**Alt text:** Limburger styled on a charcuterie board

```
Close-up editorial food photograph of limburger — pale ivory paste, sticky reddish-brown rind, sold in foil bricks. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut thin slices. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pont-l'Évêque

**File:** `pont-leveque.jpg`  
**Frontmatter:** `image: "/images/ingredients/pont-leveque.jpg"`  
**Alt text:** Pont-l'Évêque styled on a charcuterie board

```
Close-up editorial food photograph of pont-l'évêque — small square, straw-gold washed rind with fine ridges from the mold. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut it into squares or rectangles. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Reblochon

**File:** `reblochon.jpg`  
**Frontmatter:** `image: "/images/ingredients/reblochon.jpg"`  
**Alt text:** Reblochon styled on a charcuterie board

```
Close-up editorial food photograph of reblochon — flat disc, pale ivory paste, thin washed orange-pink rind with a. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges from the center out. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Red Hawk

**File:** `red-hawk.jpg`  
**Frontmatter:** `image: "/images/ingredients/red-hawk.jpg"`  
**Alt text:** Red Hawk styled on a charcuterie board

```
Close-up editorial food photograph of red hawk — small round, sticky orange-pink rind, pale dense paste. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: cut wedges from the center out. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Époisses

**File:** `epoisses.jpg`  
**Frontmatter:** `image: "/images/ingredients/epoisses.jpg"`  
**Alt text:** Époisses styled on a charcuterie board

```
Close-up editorial food photograph of époisses — small round in a wooden box, sticky orange-red rind, pale runny paste. Presented on a pale grey-veined marble slab, with a small bone-handled cheese knife resting alongside. Styled as it would be served on a charcuterie board: in its wooden box, the orange rind glistening, cut open and slumping. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

---

# Cured Meat & Seafood

*45 images*

## Air-dried whole muscle

### Bresaola

**File:** `bresaola.jpg`  
**Frontmatter:** `image: "/images/ingredients/bresaola.jpg"`  
**Alt text:** Bresaola styled on a charcuterie board

```
Close-up editorial food photograph of bresaola — dark burgundy-purple, nearly uniform, a thin pale rim. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice paper-thin and serve within fifteen minutes. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Bündnerfleisch

**File:** `bundnerfleisch.jpg`  
**Frontmatter:** `image: "/images/ingredients/bundnerfleisch.jpg"`  
**Alt text:** Bündnerfleisch styled on a charcuterie board

```
Close-up editorial food photograph of bündnerfleisch — dark red-brown rectangular block, marbled with fine white sinew lines. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: sliced as thinly as possible into near-translucent dark red sheets. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Duck Prosciutto

**File:** `duck-prosciutto.jpg`  
**Frontmatter:** `image: "/images/ingredients/duck-prosciutto.jpg"`  
**Alt text:** Duck Prosciutto styled on a charcuterie board

```
Close-up editorial food photograph of duck prosciutto — deep mahogany-red muscle under a thick pale fat cap. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice very thin, across the grain. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Cooked sausage & deli

### Andouille

**File:** `andouille.jpg`  
**Frontmatter:** `image: "/images/ingredients/andouille.jpg"`  
**Alt text:** Andouille styled on a charcuterie board

```
Close-up editorial food photograph of andouille — thick coins of deep red-brown coarse-textured smoked sausage, cut on the bias. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: thick coins sliced on the bias, seared and glossy. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Kielbasa

**File:** `kielbasa.jpg`  
**Frontmatter:** `image: "/images/ingredients/kielbasa.jpg"`  
**Alt text:** Kielbasa styled on a charcuterie board

```
Close-up editorial food photograph of kielbasa — deep red-brown, smooth or coarse depending on style. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice krakowska thin on the diagonal. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Morcilla

**File:** `morcilla.jpg`  
**Frontmatter:** `image: "/images/ingredients/morcilla.jpg"`  
**Alt text:** Morcilla styled on a charcuterie board

```
Close-up editorial food photograph of morcilla — near-black, sometimes with visible rice grains. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: thick dark coins, seared and crisp at the edges. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Mortadella

**File:** `mortadella.jpg`  
**Frontmatter:** `image: "/images/ingredients/mortadella.jpg"`  
**Alt text:** Mortadella styled on a charcuterie board

```
Close-up editorial food photograph of mortadella — pale pink, pearly, dotted with white fat squares and green pistachios. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: fold thick slices into loose quarters. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pastrami

**File:** `pastrami.jpg`  
**Frontmatter:** `image: "/images/ingredients/pastrami.jpg"`  
**Alt text:** Pastrami styled on a charcuterie board

```
Close-up editorial food photograph of pastrami — deep red-pink meat with a black pepper crust and a smoke ring. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thick — about ¼ inch — against the grain. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Cured fat

### Guanciale

**File:** `guanciale.jpg`  
**Frontmatter:** `image: "/images/ingredients/guanciale.jpg"`  
**Alt text:** Guanciale styled on a charcuterie board

```
Close-up editorial food photograph of guanciale — a mostly-white triangular slab with a thin pink muscle line, edged in. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice it very thin. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Lardo

**File:** `lardo.jpg`  
**Frontmatter:** `image: "/images/ingredients/lardo.jpg"`  
**Alt text:** Lardo styled on a charcuterie board

```
Close-up editorial food photograph of lardo — near-white translucent slices with a faint pink blush and herb flecks. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice it translucent. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pancetta

**File:** `pancetta.jpg`  
**Frontmatter:** `image: "/images/ingredients/pancetta.jpg"`  
**Alt text:** Pancetta styled on a charcuterie board

```
Close-up editorial food photograph of pancetta — rolled spiral of pink meat and white fat, or a flat streaky slab. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Dry-cured ham

### Black Forest Ham

**File:** `black-forest-ham.jpg`  
**Frontmatter:** `image: "/images/ingredients/black-forest-ham.jpg"`  
**Alt text:** Black Forest Ham styled on a charcuterie board

```
Close-up editorial food photograph of black forest ham — deep red muscle, white fat, a distinctly dark to black rind. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Coppa

**File:** `coppa.jpg`  
**Frontmatter:** `image: "/images/ingredients/coppa.jpg"`  
**Alt text:** Coppa styled on a charcuterie board

```
Close-up editorial food photograph of coppa — deep red rounds with a lacework of white fat and a rim of it outside. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin, and keep the rounds whole. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Country Ham

**File:** `country-ham.jpg`  
**Frontmatter:** `image: "/images/ingredients/country-ham.jpg"`  
**Alt text:** Country Ham styled on a charcuterie board

```
Close-up editorial food photograph of country ham — dark mahogany-red, sometimes with a white surface bloom. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice paper-thin. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Culatello

**File:** `culatello.jpg`  
**Frontmatter:** `image: "/images/ingredients/culatello.jpg"`  
**Alt text:** Culatello styled on a charcuterie board

```
Close-up editorial food photograph of culatello — deep rose-red, marbled with fine fat, irregular pear-shaped slices. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice it thin, to order, and serve it immediately. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Jambon de Bayonne

**File:** `jambon-de-bayonne.jpg`  
**Frontmatter:** `image: "/images/ingredients/jambon-de-bayonne.jpg"`  
**Alt text:** Jambon de Bayonne styled on a charcuterie board

```
Close-up editorial food photograph of jambon de bayonne — deep rose-pink, wide white fat cap, sometimes a red pepper-dusted rind. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin and drape in loose folds. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Jamón Ibérico

**File:** `jamon-iberico.jpg`  
**Frontmatter:** `image: "/images/ingredients/jamon-iberico.jpg"`  
**Alt text:** Jamón Ibérico styled on a charcuterie board

```
Close-up editorial food photograph of jamón ibérico — dark red, heavily marbled with glossy yellowish fat. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin and slightly irregular. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Jamón Serrano

**File:** `jamon-serrano.jpg`  
**Frontmatter:** `image: "/images/ingredients/jamon-serrano.jpg"`  
**Alt text:** Jamón Serrano styled on a charcuterie board

```
Close-up editorial food photograph of jamón serrano — deep red muscle, firm white fat, drier surface. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Lomo

**File:** `lomo.jpg`  
**Frontmatter:** `image: "/images/ingredients/lomo.jpg"`  
**Alt text:** Lomo styled on a charcuterie board

```
Close-up editorial food photograph of lomo — deep red-brown rounds with a paprika-stained edge. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Prosciutto di Parma

**File:** `prosciutto-di-parma.jpg`  
**Frontmatter:** `image: "/images/ingredients/prosciutto-di-parma.jpg"`  
**Alt text:** Prosciutto di Parma styled on a charcuterie board

```
Close-up editorial food photograph of prosciutto di parma — deep rose-pink muscle with a clean white fat cap. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: drape, don't stack. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Prosciutto di San Daniele

**File:** `prosciutto-san-daniele.jpg`  
**Frontmatter:** `image: "/images/ingredients/prosciutto-san-daniele.jpg"`  
**Alt text:** Prosciutto di San Daniele styled on a charcuterie board

```
Close-up editorial food photograph of prosciutto di san daniele — darker rose-red, flatter profile, trotter attached on the whole leg. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice paper-thin, to order if possible. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Speck

**File:** `speck.jpg`  
**Frontmatter:** `image: "/images/ingredients/speck.jpg"`  
**Alt text:** Speck styled on a charcuterie board

```
Close-up editorial food photograph of speck — deep red muscle, thick white fat edge, dark smoked exterior. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice it thin but not paper-thin. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Salami

### Chorizo

**File:** `chorizo.jpg`  
**Frontmatter:** `image: "/images/ingredients/chorizo.jpg"`  
**Alt text:** Chorizo styled on a charcuterie board

```
Close-up editorial food photograph of chorizo — brick red to deep orange, coarse fat flecks, often tied in a horseshoe. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin, on a slight diagonal. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Finocchiona

**File:** `finocchiona.jpg`  
**Frontmatter:** `image: "/images/ingredients/finocchiona.jpg"`  
**Alt text:** Finocchiona styled on a charcuterie board

```
Close-up editorial food photograph of finocchiona — dull rose-red with visible fennel seeds and irregular fat. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin and handle gently. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Fuet

**File:** `fuet.jpg`  
**Frontmatter:** `image: "/images/ingredients/fuet.jpg"`  
**Alt text:** Fuet styled on a charcuterie board

```
Close-up editorial food photograph of fuet — pale pink-beige stick, chalky white mould coating. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: snapped into short irregular lengths, white bloom on the casing. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Genoa Salami

**File:** `genoa-salami.jpg`  
**Frontmatter:** `image: "/images/ingredients/genoa-salami.jpg"`  
**Alt text:** Genoa Salami styled on a charcuterie board

```
Close-up editorial food photograph of genoa salami — pale rose-red rounds with fine even white fat flecks. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Landjäger

**File:** `landjager.jpg`  
**Frontmatter:** `image: "/images/ingredients/landjager.jpg"`  
**Alt text:** Landjäger styled on a charcuterie board

```
Close-up editorial food photograph of landjäger — flat dark brown-black rectangles, usually sold in linked pairs. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: serve them whole or snapped in half. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pepperoni

**File:** `pepperoni.jpg`  
**Frontmatter:** `image: "/images/ingredients/pepperoni.jpg"`  
**Alt text:** Pepperoni styled on a charcuterie board

```
Close-up editorial food photograph of pepperoni — deep red-orange, fine white fat flecks, glossy. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin on the diagonal. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Rosette de Lyon

**File:** `rosette-de-lyon.jpg`  
**Frontmatter:** `image: "/images/ingredients/rosette-de-lyon.jpg"`  
**Alt text:** Rosette de Lyon styled on a charcuterie board

```
Close-up editorial food photograph of rosette de lyon — very large rounds, deep red with big white fat pieces, tied with. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: lay slices flat, slightly overlapping, as a single row. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Salchichón

**File:** `salchichon.jpg`  
**Frontmatter:** `image: "/images/ingredients/salchichon.jpg"`  
**Alt text:** Salchichón styled on a charcuterie board

```
Close-up editorial food photograph of salchichón — pale pinkish-red with visible black peppercorns and irregular fat. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin and on the diagonal. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Saucisson Sec

**File:** `saucisson-sec.jpg`  
**Frontmatter:** `image: "/images/ingredients/saucisson-sec.jpg"`  
**Alt text:** Saucisson Sec styled on a charcuterie board

```
Close-up editorial food photograph of saucisson sec — dark red interior with large white fat pieces, chalky white exterior. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice on a steep diagonal. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Soppressata

**File:** `soppressata.jpg`  
**Frontmatter:** `image: "/images/ingredients/soppressata.jpg"`  
**Alt text:** Soppressata styled on a charcuterie board

```
Close-up editorial food photograph of soppressata — flattened oval slices, deep red with large irregular white fat pieces. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice it thin — about ⅛ inch. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Summer Sausage

**File:** `summer-sausage.jpg`  
**Frontmatter:** `image: "/images/ingredients/summer-sausage.jpg"`  
**Alt text:** Summer Sausage styled on a charcuterie board

```
Close-up editorial food photograph of summer sausage — deep red-brown, fine grain, often with visible mustard seeds. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin, on the diagonal. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Smoked & tinned fish

### Anchovies

**File:** `anchovies.jpg`  
**Frontmatter:** `image: "/images/ingredients/anchovies.jpg"`  
**Alt text:** Anchovies styled on a charcuterie board

```
Close-up editorial food photograph of anchovies — brown fillets glossy with oil; or white fillets in oil and parsley. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: serve them in a small dish with their oil. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Bottarga

**File:** `bottarga.jpg`  
**Frontmatter:** `image: "/images/ingredients/bottarga.jpg"`  
**Alt text:** Bottarga styled on a charcuterie board

```
Close-up editorial food photograph of bottarga — amber to deep orange-brown block, sometimes wax-coated. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: shave it, don't slice it. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Gravlax

**File:** `gravlax.jpg`  
**Frontmatter:** `image: "/images/ingredients/gravlax.jpg"`  
**Alt text:** Gravlax styled on a charcuterie board

```
Close-up editorial food photograph of gravlax — bright coral-orange, often with a green dill crust on one edge. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice thin on a shallow angle. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Sardines

**File:** `sardines.jpg`  
**Frontmatter:** `image: "/images/ingredients/sardines.jpg"`  
**Alt text:** Sardines styled on a charcuterie board

```
Close-up editorial food photograph of sardines — silver-blue skin, pale flesh, glossy with oil. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: serve them in the open tin. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Smoked Salmon

**File:** `smoked-salmon.jpg`  
**Frontmatter:** `image: "/images/ingredients/smoked-salmon.jpg"`  
**Alt text:** Smoked Salmon styled on a charcuterie board

```
Close-up editorial food photograph of smoked salmon — deep orange-pink, glossy; hot-smoked is paler and matte. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: draped in loose ribbons, deep coral, faintly glossy. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Smoked Trout

**File:** `smoked-trout.jpg`  
**Frontmatter:** `image: "/images/ingredients/smoked-trout.jpg"`  
**Alt text:** Smoked Trout styled on a charcuterie board

```
Close-up editorial food photograph of smoked trout — pale pink-bronze fillet with golden smoked skin. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: pile the flakes rather than arranging them. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Spreadable

### 'Nduja

**File:** `nduja.jpg`  
**Frontmatter:** `image: "/images/ingredients/nduja.jpg"`  
**Alt text:** 'Nduja styled on a charcuterie board

```
Close-up editorial food photograph of 'nduja — vivid scarlet-orange paste, glossy with rendered fat. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: serve it in a small bowl with its own knife. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Liverwurst

**File:** `liverwurst.jpg`  
**Frontmatter:** `image: "/images/ingredients/liverwurst.jpg"`  
**Alt text:** Liverwurst styled on a charcuterie board

```
Close-up editorial food photograph of liverwurst — pale grey-pink, smooth, often in a chub or ring. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: scatter chives or cracked pepper over the top. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pâté de Campagne

**File:** `pate-de-campagne.jpg`  
**Frontmatter:** `image: "/images/ingredients/pate-de-campagne.jpg"`  
**Alt text:** Pâté de Campagne styled on a charcuterie board

```
Close-up editorial food photograph of pâté de campagne — grey-pink flecked loaf, often with a darker bacon edge or a bay leaf. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: slice about ⅓ inch thick. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Rillettes

**File:** `rillettes.jpg`  
**Frontmatter:** `image: "/images/ingredients/rillettes.jpg"`  
**Alt text:** Rillettes styled on a charcuterie board

```
Close-up editorial food photograph of rillettes — pale beige-grey, visibly shredded, under a white fat seal. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: serve in the pot or a small bowl with its own knife. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Sobrasada

**File:** `sobrasada.jpg`  
**Frontmatter:** `image: "/images/ingredients/sobrasada.jpg"`  
**Alt text:** Sobrasada styled on a charcuterie board

```
Close-up editorial food photograph of sobrasada — vivid orange-red paste, glossy with fat. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: serve it in a small bowl with its own knife. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Teewurst

**File:** `teewurst.jpg`  
**Frontmatter:** `image: "/images/ingredients/teewurst.jpg"`  
**Alt text:** Teewurst styled on a charcuterie board

```
Close-up editorial food photograph of teewurst — pale salmon-pink paste, sometimes in a small cloth-tied casing. Presented on a dark walnut serving board, with a folded natural linen cloth at the edge of frame. Styled as it would be served on a charcuterie board: scatter chives and cracked pepper over the top. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

---

# Crackers & Breads

*62 images*

## Bread

### Baguette

**File:** `baguette.jpg`  
**Frontmatter:** `image: "/images/ingredients/baguette.jpg"`  
**Alt text:** Baguette styled on a charcuterie board

```
Close-up editorial food photograph of baguette — golden, slashed diagonally, irregular holes inside. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: slice on a sharp diagonal, about ⅓ inch thick. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Blini

**File:** `blini.jpg`  
**Frontmatter:** `image: "/images/ingredients/blini.jpg"`  
**Alt text:** Blini styled on a charcuterie board

```
Close-up editorial food photograph of blini — small pale discs, slightly domed, speckled from the buckwheat. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: serve them warm. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Brioche Toast Points

**File:** `brioche-toast-points.jpg`  
**Frontmatter:** `image: "/images/ingredients/brioche-toast-points.jpg"`  
**Alt text:** Brioche Toast Points styled on a charcuterie board

```
Close-up editorial food photograph of brioche toast points — deep gold triangles, fine even crumb, no crust. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: cut the crusts off. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Ciabatta

**File:** `ciabatta.jpg`  
**Frontmatter:** `image: "/images/ingredients/ciabatta.jpg"`  
**Alt text:** Ciabatta styled on a charcuterie board

```
Close-up editorial food photograph of ciabatta — flat and irregular, dusted with flour, wide holes when torn. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: tear it, don't slice it. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cocktail Rye

**File:** `cocktail-rye.jpg`  
**Frontmatter:** `image: "/images/ingredients/cocktail-rye.jpg"`  
**Alt text:** Cocktail Rye styled on a charcuterie board

```
Close-up editorial food photograph of cocktail rye — small brown squares with a thin crust edge. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: a neat stack of small dark square slices, slightly fanned. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Crostini

**File:** `crostini.jpg`  
**Frontmatter:** `image: "/images/ingredients/crostini.jpg"`  
**Alt text:** Crostini styled on a charcuterie board

```
Close-up editorial food photograph of crostini — small golden ovals, blistered and uneven. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: slice a baguette on the diagonal, ¼ to ⅓ inch thick. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Focaccia

**File:** `focaccia.jpg`  
**Frontmatter:** `image: "/images/ingredients/focaccia.jpg"`  
**Alt text:** Focaccia styled on a charcuterie board

```
Close-up editorial food photograph of focaccia — golden and dimpled, often flecked with rosemary or sea salt. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: cut it into 1-inch cubes, not slices. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Friselle

**File:** `friselle.jpg`  
**Frontmatter:** `image: "/images/ingredients/friselle.jpg"`  
**Alt text:** Friselle styled on a charcuterie board

```
Close-up editorial food photograph of friselle — thick pale rings with a rough split face, holes throughout. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: rough golden rings, one rubbed with tomato, arranged in a loose stack. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Gluten-Free Bread

**File:** `gluten-free-bread.jpg`  
**Frontmatter:** `image: "/images/ingredients/gluten-free-bread.jpg"`  
**Alt text:** Gluten-Free Bread styled on a charcuterie board

```
Close-up editorial food photograph of gluten-free bread — tight even crumb, pale, usually smaller slices. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: toasted crostini slices fanned in a row. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Gougères

**File:** `gougeres.jpg`  
**Frontmatter:** `image: "/images/ingredients/gougeres.jpg"`  
**Alt text:** Gougères styled on a charcuterie board

```
Close-up editorial food photograph of gougères — golden domes, irregular, about an inch across. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: serve warm, from the oven, in a bowl or napkin-lined basket. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Grissini

**File:** `grissini.jpg`  
**Frontmatter:** `image: "/images/ingredients/grissini.jpg"`  
**Alt text:** Grissini styled on a charcuterie board

```
Close-up editorial food photograph of grissini — long and pale gold, either knobbly or pencil-straight. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: stand them upright in a heavy glass, small vase or jar. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Lavash

**File:** `lavash.jpg`  
**Frontmatter:** `image: "/images/ingredients/lavash.jpg"`  
**Alt text:** Lavash styled on a charcuterie board

```
Close-up editorial food photograph of lavash — large thin sheets, blistered, often seeded. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: large thin sheets broken into irregular shards, blistered and seeded. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Lefse

**File:** `lefse.jpg`  
**Frontmatter:** `image: "/images/ingredients/lefse.jpg"`  
**Alt text:** Lefse styled on a charcuterie board

```
Close-up editorial food photograph of lefse — large pale rounds, freckled with brown spots. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: cut it into wedges or strips. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Mini Naan

**File:** `mini-naan.jpg`  
**Frontmatter:** `image: "/images/ingredients/mini-naan.jpg"`  
**Alt text:** Mini Naan styled on a charcuterie board

```
Close-up editorial food photograph of mini naan — small teardrop or oval rounds, puffed and charred in spots. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: tear into strips or wedges. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pumpernickel

**File:** `pumpernickel.jpg`  
**Frontmatter:** `image: "/images/ingredients/pumpernickel.jpg"`  
**Alt text:** Pumpernickel styled on a charcuterie board

```
Close-up editorial food photograph of pumpernickel — near-black, tight crumb, no visible holes. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: cut it thin — about ¼ inch — then quarter the slices. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pão de Queijo

**File:** `pao-de-queijo.jpg`  
**Frontmatter:** `image: "/images/ingredients/pao-de-queijo.jpg"`  
**Alt text:** Pão de Queijo styled on a charcuterie board

```
Close-up editorial food photograph of pão de queijo — small pale golden balls, cracked on top, about an inch and a half. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: warm golden puffs heaped in a small basket. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Socca

**File:** `socca.jpg`  
**Frontmatter:** `image: "/images/ingredients/socca.jpg"`  
**Alt text:** Socca styled on a charcuterie board

```
Close-up editorial food photograph of socca — deep gold with dark blistered spots, torn into rough wedges. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: tear it, don't cut it. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Sourdough

**File:** `sourdough.jpg`  
**Frontmatter:** `image: "/images/ingredients/sourdough.jpg"`  
**Alt text:** Sourdough styled on a charcuterie board

```
Close-up editorial food photograph of sourdough — dark burnished crust, blistered surface, irregular open holes. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: tear it, don't slice it. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Walnut Raisin Bread

**File:** `walnut-raisin-bread.jpg`  
**Frontmatter:** `image: "/images/ingredients/walnut-raisin-bread.jpg"`  
**Alt text:** Walnut Raisin Bread styled on a charcuterie board

```
Close-up editorial food photograph of walnut raisin bread — dense tan crumb studded with dark fruit and pale nut halves. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: slice thin, then halve or quarter the slices. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Cheese crisp

### Cheddar Crisps

**File:** `cheddar-crisps.jpg`  
**Frontmatter:** `image: "/images/ingredients/cheddar-crisps.jpg"`  
**Alt text:** Cheddar Crisps styled on a charcuterie board

```
Close-up editorial food photograph of cheddar crisps — deep orange to amber, bubbled and uneven. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: a loose pile of lacy golden crisps in a shallow dish. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Parmesan Crisps

**File:** `parmesan-crisps.jpg`  
**Frontmatter:** `image: "/images/ingredients/parmesan-crisps.jpg"`  
**Alt text:** Parmesan Crisps styled on a charcuterie board

```
Close-up editorial food photograph of parmesan crisps — golden, irregular, full of small holes. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: drape them over a rolling pin while warm. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Dessert base

### Chocolate Wafers

**File:** `chocolate-wafers.jpg`  
**Frontmatter:** `image: "/images/ingredients/chocolate-wafers.jpg"`  
**Alt text:** Chocolate Wafers styled on a charcuterie board

```
Close-up editorial food photograph of chocolate wafers — near-black rounds, matte. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: fan them. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Gingersnaps

**File:** `gingersnaps.jpg`  
**Frontmatter:** `image: "/images/ingredients/gingersnaps.jpg"`  
**Alt text:** Gingersnaps styled on a charcuterie board

```
Close-up editorial food photograph of gingersnaps — dark brown rounds, often sugar-crusted and crackle-topped. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: serve them whole. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Graham Crackers

**File:** `graham-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/graham-crackers.jpg"`  
**Alt text:** Graham Crackers styled on a charcuterie board

```
Close-up editorial food photograph of graham crackers — tan rectangles with docking holes and a scored line. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: break them along the scored lines. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pizzelle

**File:** `pizzelle.jpg`  
**Frontmatter:** `image: "/images/ingredients/pizzelle.jpg"`  
**Alt text:** Pizzelle styled on a charcuterie board

```
Close-up editorial food photograph of pizzelle — thin pale discs with an intricate snowflake pattern. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: break a couple deliberately. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Shortbread

**File:** `shortbread.jpg`  
**Frontmatter:** `image: "/images/ingredients/shortbread.jpg"`  
**Alt text:** Shortbread styled on a charcuterie board

```
Close-up editorial food photograph of shortbread — pale gold, matte, often fork-pricked. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: thick pale fingers fanned in a row, fork-pricked. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Speculoos

**File:** `speculoos.jpg`  
**Frontmatter:** `image: "/images/ingredients/speculoos.jpg"`  
**Alt text:** Speculoos styled on a charcuterie board

```
Close-up editorial food photograph of speculoos — deep caramel brown, often stamped with a pattern. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: serve them whole. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Flavored base

### Almond Flour Crackers

**File:** `almond-flour-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/almond-flour-crackers.jpg"`  
**Alt text:** Almond Flour Crackers styled on a charcuterie board

```
Close-up editorial food photograph of almond flour crackers — pale tan, slightly thick, matte. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: fan them flat and handle them once. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Butter Crackers

**File:** `butter-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/butter-crackers.jpg"`  
**Alt text:** Butter Crackers styled on a charcuterie board

```
Close-up editorial food photograph of butter crackers — golden, round, scalloped edge, docked with tiny holes. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: stack, don't fan. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Charcoal Crackers

**File:** `charcoal-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/charcoal-crackers.jpg"`  
**Alt text:** Charcoal Crackers styled on a charcuterie board

```
Close-up editorial food photograph of charcoal crackers — matte jet black, the highest-contrast item available for a board. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: three or four jet-black crackers fanned against the pale surface. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Chickpea Crackers

**File:** `chickpea-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/chickpea-crackers.jpg"`  
**Alt text:** Chickpea Crackers styled on a charcuterie board

```
Close-up editorial food photograph of chickpea crackers — pale gold to tan, often thicker than a wheat cracker. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: fanned in an overlapping row. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Digestive Biscuits

**File:** `digestive-biscuits.jpg`  
**Frontmatter:** `image: "/images/ingredients/digestive-biscuits.jpg"`  
**Alt text:** Digestive Biscuits styled on a charcuterie board

```
Close-up editorial food photograph of digestive biscuits — pale brown rounds, docked with holes, slightly domed. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: break a few in half. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Everything Crackers

**File:** `everything-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/everything-crackers.jpg"`  
**Alt text:** Everything Crackers styled on a charcuterie board

```
Close-up editorial food photograph of everything crackers — speckled black and white and tan, visibly topped. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: fanned in an overlapping row, seeds clearly visible. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Flaxseed Crackers

**File:** `flaxseed-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/flaxseed-crackers.jpg"`  
**Alt text:** Flaxseed Crackers styled on a charcuterie board

```
Close-up editorial food photograph of flaxseed crackers — dark brown, densely packed with whole seeds. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: break them into rough shards. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Fruit & Nut Crisps

**File:** `fruit-and-nut-crisps.jpg`  
**Frontmatter:** `image: "/images/ingredients/fruit-and-nut-crisps.jpg"`  
**Alt text:** Fruit & Nut Crisps styled on a charcuterie board

```
Close-up editorial food photograph of fruit & nut crisps — thin ovals with visible fruit and nut cross-sections. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: lay them flat and slightly separated. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Oatcakes

**File:** `oatcakes.jpg`  
**Frontmatter:** `image: "/images/ingredients/oatcakes.jpg"`  
**Alt text:** Oatcakes styled on a charcuterie board

```
Close-up editorial food photograph of oatcakes — thick, pale beige, rough-surfaced, usually round. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: stack them slightly offset. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Olive Oil Crackers

**File:** `olive-oil-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/olive-oil-crackers.jpg"`  
**Alt text:** Olive Oil Crackers styled on a charcuterie board

```
Close-up editorial food photograph of olive oil crackers — pale gold, bubbled surface, irregular edges. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: break the large sheets, snap the small ones. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pane Carasau

**File:** `pane-carasau.jpg`  
**Frontmatter:** `image: "/images/ingredients/pane-carasau.jpg"`  
**Alt text:** Pane Carasau styled on a charcuterie board

```
Close-up editorial food photograph of pane carasau — large pale translucent sheets, blistered, irregular. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: large pale translucent sheets broken into irregular shards. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Papadum

**File:** `papadum.jpg`  
**Frontmatter:** `image: "/images/ingredients/papadum.jpg"`  
**Alt text:** Papadum styled on a charcuterie board

```
Close-up editorial food photograph of papadum — large blistered discs, irregular and translucent in places. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: break into large shards. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Prawn Crackers

**File:** `prawn-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/prawn-crackers.jpg"`  
**Alt text:** Prawn Crackers styled on a charcuterie board

```
Close-up editorial food photograph of prawn crackers — pale pink or white, irregular, honeycombed with tiny holes. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: serve them in a bowl, not on the board. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pretzel Crisps

**File:** `pretzel-crisps.jpg`  
**Frontmatter:** `image: "/images/ingredients/pretzel-crisps.jpg"`  
**Alt text:** Pretzel Crisps styled on a charcuterie board

```
Close-up editorial food photograph of pretzel crisps — flat ovals, deep mahogany, visible salt crystals. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: stand them upright in a short jar or glass. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Rosemary Crackers

**File:** `rosemary-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/rosemary-crackers.jpg"`  
**Alt text:** Rosemary Crackers styled on a charcuterie board

```
Close-up editorial food photograph of rosemary crackers — pale gold with green flecks, blistered surface. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: large sheets broken into irregular shards, rosemary visible. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Rye Crispbread

**File:** `rye-crispbread.jpg`  
**Frontmatter:** `image: "/images/ingredients/rye-crispbread.jpg"`  
**Alt text:** Rye Crispbread styled on a charcuterie board

```
Close-up editorial food photograph of rye crispbread — large brown rectangles or rounds, dimpled all over. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: break it, don't serve it whole. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Seeded Crackers

**File:** `seeded-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/seeded-crackers.jpg"`  
**Alt text:** Seeded Crackers styled on a charcuterie board

```
Close-up editorial food photograph of seeded crackers — speckled and bumpy, tan to dark brown. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: fan them, don't stack. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Sesame Crackers

**File:** `sesame-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/sesame-crackers.jpg"`  
**Alt text:** Sesame Crackers styled on a charcuterie board

```
Close-up editorial food photograph of sesame crackers — pale to golden, evenly freckled with seeds. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: large sheets broken into irregular shards, sesame seeds visible. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Taralli

**File:** `taralli.jpg`  
**Frontmatter:** `image: "/images/ingredients/taralli.jpg"`  
**Alt text:** Taralli styled on a charcuterie board

```
Close-up editorial food photograph of taralli — small pale rings, knobbly and irregular, about an inch across. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: pile them in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Whole Wheat Crackers

**File:** `whole-wheat-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/whole-wheat-crackers.jpg"`  
**Alt text:** Whole Wheat Crackers styled on a charcuterie board

```
Close-up editorial food photograph of whole wheat crackers — tan to brown, visibly grainy, often woven or flecked. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: stack in short overlapping rows. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Neutral base

### Bath Olivers

**File:** `bath-olivers.jpg`  
**Frontmatter:** `image: "/images/ingredients/bath-olivers.jpg"`  
**Alt text:** Bath Olivers styled on a charcuterie board

```
Close-up editorial food photograph of bath olivers — pale round, docked with holes, traditionally embossed. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: fanned in an overlapping row, plain side up. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cassava Crackers

**File:** `cassava-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/cassava-crackers.jpg"`  
**Alt text:** Cassava Crackers styled on a charcuterie board

```
Close-up editorial food photograph of cassava crackers — pale, thin, slightly translucent at the edges. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: fanned in an overlapping row. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cream Crackers

**File:** `cream-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/cream-crackers.jpg"`  
**Alt text:** Cream Crackers styled on a charcuterie board

```
Close-up editorial food photograph of cream crackers — pale square, heavily docked, slightly puffed at the edges. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: stack them in short leaning piles. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Matzo

**File:** `matzo.jpg`  
**Frontmatter:** `image: "/images/ingredients/matzo.jpg"`  
**Alt text:** Matzo styled on a charcuterie board

```
Close-up editorial food photograph of matzo — large pale squares, blistered and docked with rows of holes. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: break each sheet into rough quarters or sixths. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Melba Toast

**File:** `melba-toast.jpg`  
**Frontmatter:** `image: "/images/ingredients/melba-toast.jpg"`  
**Alt text:** Melba Toast styled on a charcuterie board

```
Close-up editorial food photograph of melba toast — thin pale rectangles or rounds, often slightly curled. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: very thin curled toasts fanned in a row. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Nut Thins

**File:** `nut-thins.jpg`  
**Frontmatter:** `image: "/images/ingredients/nut-thins.jpg"`  
**Alt text:** Nut Thins styled on a charcuterie board

```
Close-up editorial food photograph of nut thins — small pale rectangles, smooth, slightly glossy. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: fanned in an overlapping row. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Rice Crackers

**File:** `rice-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/rice-crackers.jpg"`  
**Alt text:** Rice Crackers styled on a charcuterie board

```
Close-up editorial food photograph of rice crackers — small and glossy, often amber-glazed, sometimes nori-wrapped. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: a loose pile of small pale crackers in a shallow bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Saltines

**File:** `saltines.jpg`  
**Frontmatter:** `image: "/images/ingredients/saltines.jpg"`  
**Alt text:** Saltines styled on a charcuterie board

```
Close-up editorial food photograph of saltines — pale square, perforated edges, visible salt crystals. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: stand them on edge in a small glass or shallow bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Water Crackers

**File:** `water-crackers.jpg`  
**Frontmatter:** `image: "/images/ingredients/water-crackers.jpg"`  
**Alt text:** Water Crackers styled on a charcuterie board

```
Close-up editorial food photograph of water crackers — pale, dimpled, usually round or rounded-square. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: fan them, don't stack them. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Sturdy scoop

### Bagel Chips

**File:** `bagel-chips.jpg`  
**Frontmatter:** `image: "/images/ingredients/bagel-chips.jpg"`  
**Alt text:** Bagel Chips styled on a charcuterie board

```
Close-up editorial food photograph of bagel chips — small ovals or half-moons, sometimes seeded. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: break the big ones in half. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pita Chips

**File:** `pita-chips.jpg`  
**Frontmatter:** `image: "/images/ingredients/pita-chips.jpg"`  
**Alt text:** Pita Chips styled on a charcuterie board

```
Close-up editorial food photograph of pita chips — triangular, blistered and bubbled, uneven browning. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: stand a few upright in the dip. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Plantain Chips

**File:** `plantain-chips.jpg`  
**Frontmatter:** `image: "/images/ingredients/plantain-chips.jpg"`  
**Alt text:** Plantain Chips styled on a charcuterie board

```
Close-up editorial food photograph of plantain chips — pale gold ovals or long strips, sometimes rippled. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: stand a few upright in the dip. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Root Vegetable Chips

**File:** `root-vegetable-chips.jpg`  
**Frontmatter:** `image: "/images/ingredients/root-vegetable-chips.jpg"`  
**Alt text:** Root Vegetable Chips styled on a charcuterie board

```
Close-up editorial food photograph of root vegetable chips — purple, magenta, orange, ivory — the most colorful thing on the. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: a loose pile of purple, orange and gold chips. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Tostada Rounds

**File:** `tostada-rounds.jpg`  
**Frontmatter:** `image: "/images/ingredients/tostada-rounds.jpg"`  
**Alt text:** Tostada Rounds styled on a charcuterie board

```
Close-up editorial food photograph of tostada rounds — pale gold discs, sometimes blistered, 3–5 inches across. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: break them into quarters or sixths. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Vegetable

### Vegetable Bases

**File:** `vegetable-bases.jpg`  
**Frontmatter:** `image: "/images/ingredients/vegetable-bases.jpg"`  
**Alt text:** Vegetable Bases styled on a charcuterie board

```
Close-up editorial food photograph of vegetable bases — pale endive leaves, cucumber rounds and halved mini sweet peppers arranged as edible scoops. Presented on a light oak board over oatmeal linen, with a few loose crumbs scattered naturally. Styled as it would be served on a charcuterie board: cut cucumber thick — at least ⅓ inch — and cut it last. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

---

# Fruit

*30 images*

## Citrus

### Blood Oranges

**File:** `blood-oranges.jpg`  
**Frontmatter:** `image: "/images/ingredients/blood-oranges.jpg"`  
**Alt text:** Blood Oranges styled on a charcuterie board

```
Close-up editorial food photograph of blood oranges — crimson-streaked wheels, sometimes solid red. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: slice crosswise into wheels. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Grapefruit

**File:** `grapefruit.jpg`  
**Frontmatter:** `image: "/images/ingredients/grapefruit.jpg"`  
**Alt text:** Grapefruit styled on a charcuterie board

```
Close-up editorial food photograph of grapefruit — pink jewel-toned wedges, translucent at the edges. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: pink supremes fanned on a small plate, membranes removed. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Kumquats

**File:** `kumquats.jpg`  
**Frontmatter:** `image: "/images/ingredients/kumquats.jpg"`  
**Alt text:** Kumquats styled on a charcuterie board

```
Close-up editorial food photograph of kumquats — tiny glossy orange ovals, often sold on the branch with leaves. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: slice crosswise into thin wheels. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Mandarins

**File:** `mandarins.jpg`  
**Frontmatter:** `image: "/images/ingredients/mandarins.jpg"`  
**Alt text:** Mandarins styled on a charcuterie board

```
Close-up editorial food photograph of mandarins — small orange crescents, arranged in a loose fan. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: fan the segments. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Dried fruit

### Dried Apricots

**File:** `dried-apricots.jpg`  
**Frontmatter:** `image: "/images/ingredients/dried-apricots.jpg"`  
**Alt text:** Dried Apricots styled on a charcuterie board

```
Close-up editorial food photograph of dried apricots — orange or deep amber discs. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: fan or stack them. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Dried Cherries

**File:** `dried-cherries.jpg`  
**Frontmatter:** `image: "/images/ingredients/dried-cherries.jpg"`  
**Alt text:** Dried Cherries styled on a charcuterie board

```
Close-up editorial food photograph of dried cherries — small dark red wrinkled pieces. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: scatter, don't arrange. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Dried Cranberries

**File:** `dried-cranberries.jpg`  
**Frontmatter:** `image: "/images/ingredients/dried-cranberries.jpg"`  
**Alt text:** Dried Cranberries styled on a charcuterie board

```
Close-up editorial food photograph of dried cranberries — small deep-red pieces, glossy. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: scatter widely. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Dried Figs

**File:** `dried-figs.jpg`  
**Frontmatter:** `image: "/images/ingredients/dried-figs.jpg"`  
**Alt text:** Dried Figs styled on a charcuterie board

```
Close-up editorial food photograph of dried figs — dark or golden halves showing a pale seeded centre. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: slice them in half lengthwise. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Dried Mango

**File:** `dried-mango.jpg`  
**Frontmatter:** `image: "/images/ingredients/dried-mango.jpg"`  
**Alt text:** Dried Mango styled on a charcuterie board

```
Close-up editorial food photograph of dried mango — long strips, pale amber to deep orange. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: cut long strips into 2-inch pieces. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Golden Raisins

**File:** `golden-raisins.jpg`  
**Frontmatter:** `image: "/images/ingredients/golden-raisins.jpg"`  
**Alt text:** Golden Raisins styled on a charcuterie board

```
Close-up editorial food photograph of golden raisins — pale amber, translucent, glossy. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: scatter into gaps. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Medjool Dates

**File:** `medjool-dates.jpg`  
**Frontmatter:** `image: "/images/ingredients/medjool-dates.jpg"`  
**Alt text:** Medjool Dates styled on a charcuterie board

```
Close-up editorial food photograph of medjool dates — deep brown, glossy, wrinkled. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: wrap in half a slice of prosciutto. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Prunes

**File:** `prunes.jpg`  
**Frontmatter:** `image: "/images/ingredients/prunes.jpg"`  
**Alt text:** Prunes styled on a charcuterie board

```
Close-up editorial food photograph of prunes — near-black, glossy, wrinkled. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: halve them. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Fresh fruit

### Apples

**File:** `apples.jpg`  
**Frontmatter:** `image: "/images/ingredients/apples.jpg"`  
**Alt text:** Apples styled on a charcuterie board

```
Close-up editorial food photograph of apples — thin slices with a bright red or green skin edge. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: slice thin — about ⅛ inch — with the skin on. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Berries

**File:** `berries.jpg`  
**Frontmatter:** `image: "/images/ingredients/berries.jpg"`  
**Alt text:** Berries styled on a charcuterie board

```
Close-up editorial food photograph of berries — the strongest reds, purples and blacks available on any board. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: halve strawberries lengthwise. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cherries

**File:** `cherries.jpg`  
**Frontmatter:** `image: "/images/ingredients/cherries.jpg"`  
**Alt text:** Cherries styled on a charcuterie board

```
Close-up editorial food photograph of cherries — deep red-black to gold-blush, glossy, on green stems. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: a small cluster with stems on, a few loose beside them. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Figs

**File:** `figs.jpg`  
**Frontmatter:** `image: "/images/ingredients/figs.jpg"`  
**Alt text:** Figs styled on a charcuterie board

```
Close-up editorial food photograph of figs — teardrop shape; halved, a pink-red centre in a pale ring. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: halve or quarter them lengthwise. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Fresh Apricots

**File:** `fresh-apricots.jpg`  
**Frontmatter:** `image: "/images/ingredients/fresh-apricots.jpg"`  
**Alt text:** Fresh Apricots styled on a charcuterie board

```
Close-up editorial food photograph of fresh apricots — orange-gold halves with a shallow hollow. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: halve along the natural seam. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Grapes

**File:** `grapes.jpg`  
**Frontmatter:** `image: "/images/ingredients/grapes.jpg"`  
**Alt text:** Grapes styled on a charcuterie board

```
Close-up editorial food photograph of grapes — clusters on woody green-brown stems. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: snip into small clusters with scissors. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Melon

**File:** `melon.jpg`  
**Frontmatter:** `image: "/images/ingredients/melon.jpg"`  
**Alt text:** Melon styled on a charcuterie board

```
Close-up editorial food photograph of melon — orange or pale green wedges and cubes. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: cut pieces a ham slice can wrap. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Peaches

**File:** `peaches.jpg`  
**Frontmatter:** `image: "/images/ingredients/peaches.jpg"`  
**Alt text:** Peaches styled on a charcuterie board

```
Close-up editorial food photograph of peaches — blushed gold-and-red, cut into thick crescents. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: cut into eighths. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pears

**File:** `pears.jpg`  
**Frontmatter:** `image: "/images/ingredients/pears.jpg"`  
**Alt text:** Pears styled on a charcuterie board

```
Close-up editorial food photograph of pears — pale cream flesh with a green, brown or red skin edge. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: slice thin lengthwise with the skin on. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Persimmon

**File:** `persimmon.jpg`  
**Frontmatter:** `image: "/images/ingredients/persimmon.jpg"`  
**Alt text:** Persimmon styled on a charcuterie board

```
Close-up editorial food photograph of persimmon — deep orange discs, translucent at the edges. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: slice crosswise, 1/4 inch. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Plums

**File:** `plums.jpg`  
**Frontmatter:** `image: "/images/ingredients/plums.jpg"`  
**Alt text:** Plums styled on a charcuterie board

```
Close-up editorial food photograph of plums — deep purple to near-black wedges with gold-red interiors. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: halve along the seam and twist. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pomegranate

**File:** `pomegranate.jpg`  
**Frontmatter:** `image: "/images/ingredients/pomegranate.jpg"`  
**Alt text:** Pomegranate styled on a charcuterie board

```
Close-up editorial food photograph of pomegranate — translucent ruby beads — the most jewel-like thing available. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: scatter, don't pile. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Preserved fruit

### Brandied Cherries

**File:** `brandied-cherries.jpg`  
**Frontmatter:** `image: "/images/ingredients/brandied-cherries.jpg"`  
**Alt text:** Brandied Cherries styled on a charcuterie board

```
Close-up editorial food photograph of brandied cherries — near-black or deep garnet, glossy. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: serve them in a small dish. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Candied Citrus

**File:** `candied-citrus.jpg`  
**Frontmatter:** `image: "/images/ingredients/candied-citrus.jpg"`  
**Alt text:** Candied Citrus styled on a charcuterie board

```
Close-up editorial food photograph of candied citrus — translucent amber strips or glowing wheels. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: snip into shorter pieces. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Tropical fruit

### Kiwi

**File:** `kiwi.jpg`  
**Frontmatter:** `image: "/images/ingredients/kiwi.jpg"`  
**Alt text:** Kiwi styled on a charcuterie board

```
Close-up editorial food photograph of kiwi — green wheels with a white centre and a black seed ring. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: slice crosswise into 1/4-inch wheels. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Mango

**File:** `mango.jpg`  
**Frontmatter:** `image: "/images/ingredients/mango.jpg"`  
**Alt text:** Mango styled on a charcuterie board

```
Close-up editorial food photograph of mango — deep gold slices or ribbons. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: slice down either side of the flat pit. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Passion Fruit

**File:** `passion-fruit.jpg`  
**Frontmatter:** `image: "/images/ingredients/passion-fruit.jpg"`  
**Alt text:** Passion Fruit styled on a charcuterie board

```
Close-up editorial food photograph of passion fruit — wrinkled purple shells filled with glossy orange. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: halve crosswise with a serrated knife. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pineapple

**File:** `pineapple.jpg`  
**Frontmatter:** `image: "/images/ingredients/pineapple.jpg"`  
**Alt text:** Pineapple styled on a charcuterie board

```
Close-up editorial food photograph of pineapple — gold wedges with a paler firm core. Presented on a matte cream ceramic plate, with one or two loose pieces set just off the plate. Styled as it would be served on a charcuterie board: cut top and bottom flat. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

---

# Nuts & Seeds

*18 images*

## Candied & spiced nuts

### Candied Pecans

**File:** `candied-pecans.jpg`  
**Frontmatter:** `image: "/images/ingredients/candied-pecans.jpg"`  
**Alt text:** Candied Pecans styled on a charcuterie board

```
Close-up editorial food photograph of candied pecans — glossy amber halves, slightly clustered. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: a loose pile of glazed halves, some clustered together. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Honey Roasted Peanuts

**File:** `honey-roasted-peanuts.jpg`  
**Frontmatter:** `image: "/images/ingredients/honey-roasted-peanuts.jpg"`  
**Alt text:** Honey Roasted Peanuts styled on a charcuterie board

```
Close-up editorial food photograph of honey roasted peanuts — tan-brown, matte, slightly dusty. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: serve in a bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Roasted Chestnuts

**File:** `roasted-chestnuts.jpg`  
**Frontmatter:** `image: "/images/ingredients/roasted-chestnuts.jpg"`  
**Alt text:** Roasted Chestnuts styled on a charcuterie board

```
Close-up editorial food photograph of roasted chestnuts — irregular pale golden lobes. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: score an X. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Spiced Nut Mix

**File:** `spiced-nut-mix.jpg`  
**Frontmatter:** `image: "/images/ingredients/spiced-nut-mix.jpg"`  
**Alt text:** Spiced Nut Mix styled on a charcuterie board

```
Close-up editorial food photograph of spiced nut mix — glossy mixed browns flecked with dark green rosemary. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: warm mixed nuts in a small bowl, flecked with rosemary. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Nuts

### Almonds

**File:** `almonds.jpg`  
**Frontmatter:** `image: "/images/ingredients/almonds.jpg"`  
**Alt text:** Almonds styled on a charcuterie board

```
Close-up editorial food photograph of almonds — brown-skinned ovals, or pale ivory if blanched. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: scatter into gaps. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Brazil Nuts

**File:** `brazil-nuts.jpg`  
**Frontmatter:** `image: "/images/ingredients/brazil-nuts.jpg"`  
**Alt text:** Brazil Nuts styled on a charcuterie board

```
Close-up editorial food photograph of brazil nuts — large pale-cream wedges, or thin translucent curls when shaved. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: shave them with a vegetable peeler. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cashews

**File:** `cashews.jpg`  
**Frontmatter:** `image: "/images/ingredients/cashews.jpg"`  
**Alt text:** Cashews styled on a charcuterie board

```
Close-up editorial food photograph of cashews — pale ivory crescents. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: serve in a bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Hazelnuts

**File:** `hazelnuts.jpg`  
**Frontmatter:** `image: "/images/ingredients/hazelnuts.jpg"`  
**Alt text:** Hazelnuts styled on a charcuterie board

```
Close-up editorial food photograph of hazelnuts — round pale-gold kernels once skinned; brown and papery before. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: wrap them in a clean kitchen towel. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Macadamia Nuts

**File:** `macadamia-nuts.jpg`  
**Frontmatter:** `image: "/images/ingredients/macadamia-nuts.jpg"`  
**Alt text:** Macadamia Nuts styled on a charcuterie board

```
Close-up editorial food photograph of macadamia nuts — pale ivory spheres, uniform and glossy. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Marcona Almonds

**File:** `marcona-almonds.jpg`  
**Frontmatter:** `image: "/images/ingredients/marcona-almonds.jpg"`  
**Alt text:** Marcona Almonds styled on a charcuterie board

```
Close-up editorial food photograph of marcona almonds — pale ivory, round and flat, glossy with oil. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pecans

**File:** `pecans.jpg`  
**Frontmatter:** `image: "/images/ingredients/pecans.jpg"`  
**Alt text:** Pecans styled on a charcuterie board

```
Close-up editorial food photograph of pecans — long ridged halves, reddish-brown. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: toasted halves in a loose pile, ridged and glossy. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pine Nuts

**File:** `pine-nuts.jpg`  
**Frontmatter:** `image: "/images/ingredients/pine-nuts.jpg"`  
**Alt text:** Pine Nuts styled on a charcuterie board

```
Close-up editorial food photograph of pine nuts — small ivory teardrops. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: scatter, don't serve loose. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pistachios

**File:** `pistachios.jpg`  
**Frontmatter:** `image: "/images/ingredients/pistachios.jpg"`  
**Alt text:** Pistachios styled on a charcuterie board

```
Close-up editorial food photograph of pistachios — pale green kernels with a purple-tinged skin. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: shelled green kernels in a small bowl, some in-shell scattered beside. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Smoked Almonds

**File:** `smoked-almonds.jpg`  
**Frontmatter:** `image: "/images/ingredients/smoked-almonds.jpg"`  
**Alt text:** Smoked Almonds styled on a charcuterie board

```
Close-up editorial food photograph of smoked almonds — dark brown, matte, slightly dusty. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Walnuts

**File:** `walnuts.jpg`  
**Frontmatter:** `image: "/images/ingredients/walnuts.jpg"`  
**Alt text:** Walnuts styled on a charcuterie board

```
Close-up editorial food photograph of walnuts — pale brown convoluted halves. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: toasted halves in a loose pile, convoluted and pale brown. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Seeds & blends

### Dukkah

**File:** `dukkah.jpg`  
**Frontmatter:** `image: "/images/ingredients/dukkah.jpg"`  
**Alt text:** Dukkah styled on a charcuterie board

```
Close-up editorial food photograph of dukkah — sandy brown rubble flecked with sesame. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: serve in a small bowl beside a bowl of good olive oil. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pumpkin Seeds

**File:** `pumpkin-seeds.jpg`  
**Frontmatter:** `image: "/images/ingredients/pumpkin-seeds.jpg"`  
**Alt text:** Pumpkin Seeds styled on a charcuterie board

```
Close-up editorial food photograph of pumpkin seeds — flat oval seeds, deep green. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: scatter over cheese. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Sunflower Seeds

**File:** `sunflower-seeds.jpg`  
**Frontmatter:** `image: "/images/ingredients/sunflower-seeds.jpg"`  
**Alt text:** Sunflower Seeds styled on a charcuterie board

```
Close-up editorial food photograph of sunflower seeds — small pale grey-green teardrops. Presented on a small unglazed stoneware bowl on oatmeal linen, with a scattering of a few pieces beside the bowl. Styled as it would be served on a charcuterie board: scatter over cheese. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

---

# Spreads, Jams & Honey

*28 images*

## Dips & spreads

### Baba Ganoush

**File:** `baba-ganoush.jpg`  
**Frontmatter:** `image: "/images/ingredients/baba-ganoush.jpg"`  
**Alt text:** Baba Ganoush styled on a charcuterie board

```
Close-up editorial food photograph of baba ganoush — pale grey-beige, glossy with oil, swirled. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spread in a shallow bowl with a swirled hollow, olive oil pooled in the centre. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Hummus

**File:** `hummus.jpg`  
**Frontmatter:** `image: "/images/ingredients/hummus.jpg"`  
**Alt text:** Hummus styled on a charcuterie board

```
Close-up editorial food photograph of hummus — pale beige, swirled, with an oil pool and a topping. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spread it in a shallow bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Muhammara

**File:** `muhammara.jpg`  
**Frontmatter:** `image: "/images/ingredients/muhammara.jpg"`  
**Alt text:** Muhammara styled on a charcuterie board

```
Close-up editorial food photograph of muhammara — deep brick red, matte, coarse. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spread in a shallow bowl with a swirled hollow, walnuts and pomegranate seeds on top. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pimento Cheese

**File:** `pimento-cheese.jpg`  
**Frontmatter:** `image: "/images/ingredients/pimento-cheese.jpg"`  
**Alt text:** Pimento Cheese styled on a charcuterie board

```
Close-up editorial food photograph of pimento cheese — orange-gold, flecked with red pepper. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a bowl, orange and chunky with visible pepper flecks. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Romesco

**File:** `romesco.jpg`  
**Frontmatter:** `image: "/images/ingredients/romesco.jpg"`  
**Alt text:** Romesco styled on a charcuterie board

```
Close-up editorial food photograph of romesco — brick red-orange, matte, coarse. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a bowl, brick red and coarse, olive oil pooled on top. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Tapenade

**File:** `tapenade.jpg`  
**Frontmatter:** `image: "/images/ingredients/tapenade.jpg"`  
**Alt text:** Tapenade styled on a charcuterie board

```
Close-up editorial food photograph of tapenade — near-black or olive-green, glossy. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, near-black and coarse, glossy with oil. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Tzatziki

**File:** `tzatziki.jpg`  
**Frontmatter:** `image: "/images/ingredients/tzatziki.jpg"`  
**Alt text:** Tzatziki styled on a charcuterie board

```
Close-up editorial food photograph of tzatziki — white flecked with green, glossy with oil. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a bowl, white flecked with green, oil pooled on top. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Whipped Feta

**File:** `whipped-feta.jpg`  
**Frontmatter:** `image: "/images/ingredients/whipped-feta.jpg"`  
**Alt text:** Whipped Feta styled on a charcuterie board

```
Close-up editorial food photograph of whipped feta — bright white, swirled, with oil and a topping. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spread in a shallow bowl with a swirled hollow, hot honey drizzled over. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Honey

### Honey

**File:** `honey.jpg`  
**Frontmatter:** `image: "/images/ingredients/honey.jpg"`  
**Alt text:** Honey styled on a charcuterie board

```
Close-up editorial food photograph of honey — pale gold to near-black, in a small pot with a dipper. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: drizzle over the blue cheese. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Honeycomb

**File:** `honeycomb.jpg`  
**Frontmatter:** `image: "/images/ingredients/honeycomb.jpg"`  
**Alt text:** Honeycomb styled on a charcuterie board

```
Close-up editorial food photograph of honeycomb — golden hexagons, dripping — the most striking thing on any board. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: cut a square with a sharp knife. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Hot Honey

**File:** `hot-honey.jpg`  
**Frontmatter:** `image: "/images/ingredients/hot-honey.jpg"`  
**Alt text:** Hot Honey styled on a charcuterie board

```
Close-up editorial food photograph of hot honey — amber, slightly red-tinged, flecked. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: drizzle over the burrata. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Truffle Honey

**File:** `truffle-honey.jpg`  
**Frontmatter:** `image: "/images/ingredients/truffle-honey.jpg"`  
**Alt text:** Truffle Honey styled on a charcuterie board

```
Close-up editorial food photograph of truffle honey — deep amber, flecked with dark truffle shavings in the good jars. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: serve in a very small pot. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Mustard

### Dijon Mustard

**File:** `dijon-mustard.jpg`  
**Frontmatter:** `image: "/images/ingredients/dijon-mustard.jpg"`  
**Alt text:** Dijon Mustard styled on a charcuterie board

```
Close-up editorial food photograph of dijon mustard — pale yellow-beige, matte. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spread it thin. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Honey Mustard

**File:** `honey-mustard.jpg`  
**Frontmatter:** `image: "/images/ingredients/honey-mustard.jpg"`  
**Alt text:** Honey Mustard styled on a charcuterie board

```
Close-up editorial food photograph of honey mustard — golden, thicker than plain mustard. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, glossy and golden. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Whole Grain Mustard

**File:** `whole-grain-mustard.jpg`  
**Frontmatter:** `image: "/images/ingredients/whole-grain-mustard.jpg"`  
**Alt text:** Whole Grain Mustard styled on a charcuterie board

```
Close-up editorial food photograph of whole grain mustard — pale gold-brown, visibly seeded. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, visibly seeded, a tiny spoon alongside. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Savoury condiments

### Bacon Jam

**File:** `bacon-jam.jpg`  
**Frontmatter:** `image: "/images/ingredients/bacon-jam.jpg"`  
**Alt text:** Bacon Jam styled on a charcuterie board

```
Close-up editorial food photograph of bacon jam — very dark brown, glossy, almost black. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: serve it at room temperature. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cranberry Sauce

**File:** `cranberry-sauce.jpg`  
**Frontmatter:** `image: "/images/ingredients/cranberry-sauce.jpg"`  
**Alt text:** Cranberry Sauce styled on a charcuterie board

```
Close-up editorial food photograph of cranberry sauce — bright crimson, glossy. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, crimson and glossy with burst berries. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Mango Chutney

**File:** `mango-chutney.jpg`  
**Frontmatter:** `image: "/images/ingredients/mango-chutney.jpg"`  
**Alt text:** Mango Chutney styled on a charcuterie board

```
Close-up editorial food photograph of mango chutney — amber-brown, glossy, visibly chunked. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, amber and chunky with visible fruit. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Mostarda

**File:** `mostarda.jpg`  
**Frontmatter:** `image: "/images/ingredients/mostarda.jpg"`  
**Alt text:** Mostarda styled on a charcuterie board

```
Close-up editorial food photograph of mostarda — translucent jewel-coloured fruit, glossy. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: cut large pieces. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Onion Jam

**File:** `onion-jam.jpg`  
**Frontmatter:** `image: "/images/ingredients/onion-jam.jpg"`  
**Alt text:** Onion Jam styled on a charcuterie board

```
Close-up editorial food photograph of onion jam — dark mahogany brown, glossy, visibly stranded. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, dark mahogany, visible strands of onion. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pepper Jelly

**File:** `pepper-jelly.jpg`  
**Frontmatter:** `image: "/images/ingredients/pepper-jelly.jpg"`  
**Alt text:** Pepper Jelly styled on a charcuterie board

```
Close-up editorial food photograph of pepper jelly — translucent red or green, flecked with pepper. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: break the set. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Sweet preserves

### Apple Butter

**File:** `apple-butter.jpg`  
**Frontmatter:** `image: "/images/ingredients/apple-butter.jpg"`  
**Alt text:** Apple Butter styled on a charcuterie board

```
Close-up editorial food photograph of apple butter — deep brown, matte, no visible fruit. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, thick and smooth, a spreader alongside. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Apricot Jam

**File:** `apricot-jam.jpg`  
**Frontmatter:** `image: "/images/ingredients/apricot-jam.jpg"`  
**Alt text:** Apricot Jam styled on a charcuterie board

```
Close-up editorial food photograph of apricot jam — glowing orange, translucent. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, glowing and loose, soft fruit pieces visible. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cherry Preserves

**File:** `cherry-preserves.jpg`  
**Frontmatter:** `image: "/images/ingredients/cherry-preserves.jpg"`  
**Alt text:** Cherry Preserves styled on a charcuterie board

```
Close-up editorial food photograph of cherry preserves — dark garnet, glossy, with visible cherries. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, whole dark cherries glistening in syrup. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Fig Jam

**File:** `fig-jam.jpg`  
**Frontmatter:** `image: "/images/ingredients/fig-jam.jpg"`  
**Alt text:** Fig Jam styled on a charcuterie board

```
Close-up editorial food photograph of fig jam — dark purple-brown, glossy, flecked with seeds. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, dark and glossy, seeds visible, a spreader across the rim. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Membrillo

**File:** `membrillo.jpg`  
**Frontmatter:** `image: "/images/ingredients/membrillo.jpg"`  
**Alt text:** Membrillo styled on a charcuterie board

```
Close-up editorial food photograph of membrillo — translucent amber-red batons or slices. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: cut it into batons or thin slices. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Orange Marmalade

**File:** `orange-marmalade.jpg`  
**Frontmatter:** `image: "/images/ingredients/orange-marmalade.jpg"`  
**Alt text:** Orange Marmalade styled on a charcuterie board

```
Close-up editorial food photograph of orange marmalade — amber to deep orange, translucent, shot through with peel. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, translucent amber shot through with peel. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Tomato Jam

**File:** `tomato-jam.jpg`  
**Frontmatter:** `image: "/images/ingredients/tomato-jam.jpg"`  
**Alt text:** Tomato Jam styled on a charcuterie board

```
Close-up editorial food photograph of tomato jam — deep brick red, glossy. Presented on a small footed ceramic bowl on a pale marble surface, with a small wooden spreader resting across the rim. Styled as it would be served on a charcuterie board: spooned into a small bowl, deep brick red and glossy. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

---

# Pickles, Olives & Briny

*22 images*

## Olives

### Castelvetrano Olives

**File:** `castelvetrano-olives.jpg`  
**Frontmatter:** `image: "/images/ingredients/castelvetrano-olives.jpg"`  
**Alt text:** Castelvetrano Olives styled on a charcuterie board

```
Close-up editorial food photograph of castelvetrano olives — bright grass-green, glossy, plump. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cerignola Olives

**File:** `cerignola-olives.jpg`  
**Frontmatter:** `image: "/images/ingredients/cerignola-olives.jpg"`  
**Alt text:** Cerignola Olives styled on a charcuterie board

```
Close-up editorial food photograph of cerignola olives — very large, glossy, in vivid green, black or red. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: serve in a bowl with a pit bowl beside it. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Kalamata Olives

**File:** `kalamata-olives.jpg`  
**Frontmatter:** `image: "/images/ingredients/kalamata-olives.jpg"`  
**Alt text:** Kalamata Olives styled on a charcuterie board

```
Close-up editorial food photograph of kalamata olives — deep purple-black, almond-shaped, glossy. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Manzanilla Olives

**File:** `manzanilla-olives.jpg`  
**Frontmatter:** `image: "/images/ingredients/manzanilla-olives.jpg"`  
**Alt text:** Manzanilla Olives styled on a charcuterie board

```
Close-up editorial food photograph of manzanilla olives — pale green, small, often stuffed with red pimento. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Mixed Marinated Olives

**File:** `mixed-marinated-olives.jpg`  
**Frontmatter:** `image: "/images/ingredients/mixed-marinated-olives.jpg"`  
**Alt text:** Mixed Marinated Olives styled on a charcuterie board

```
Close-up editorial food photograph of mixed marinated olives — green, purple and black together, glossy with oil and flecked with zest. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: dress. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Niçoise Olives

**File:** `nicoise-olives.jpg`  
**Frontmatter:** `image: "/images/ingredients/nicoise-olives.jpg"`  
**Alt text:** Niçoise Olives styled on a charcuterie board

```
Close-up editorial food photograph of niçoise olives — small dark purple-brown ovals, often with herbs clinging. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: a small heap of tiny dark wrinkled olives flecked with herbs. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Oil-Cured Olives

**File:** `oil-cured-olives.jpg`  
**Frontmatter:** `image: "/images/ingredients/oil-cured-olives.jpg"`  
**Alt text:** Oil-Cured Olives styled on a charcuterie board

```
Close-up editorial food photograph of oil-cured olives — matte black, deeply wrinkled, oil-slicked. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Peppers & briny

### Caperberries

**File:** `caperberries.jpg`  
**Frontmatter:** `image: "/images/ingredients/caperberries.jpg"`  
**Alt text:** Caperberries styled on a charcuterie board

```
Close-up editorial food photograph of caperberries — olive-green, grape-sized, with a long stem. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: heaped in a small dish with their long stems pointing outward. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Capers

**File:** `capers.jpg`  
**Frontmatter:** `image: "/images/ingredients/capers.jpg"`  
**Alt text:** Capers styled on a charcuterie board

```
Close-up editorial food photograph of capers — tiny olive-green buds. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: scatter, don't serve. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Marinated Artichokes

**File:** `marinated-artichokes.jpg`  
**Frontmatter:** `image: "/images/ingredients/marinated-artichokes.jpg"`  
**Alt text:** Marinated Artichokes styled on a charcuterie board

```
Close-up editorial food photograph of marinated artichokes — pale green-yellow quarters, glossy with oil, flecked with herbs. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Marinated Mushrooms

**File:** `marinated-mushrooms.jpg`  
**Frontmatter:** `image: "/images/ingredients/marinated-mushrooms.jpg"`  
**Alt text:** Marinated Mushrooms styled on a charcuterie board

```
Close-up editorial food photograph of marinated mushrooms — small pale brown caps, glossy with oil, flecked with herbs. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Peppadew

**File:** `peppadew.jpg`  
**Frontmatter:** `image: "/images/ingredients/peppadew.jpg"`  
**Alt text:** Peppadew styled on a charcuterie board

```
Close-up editorial food photograph of peppadew — small bright red globes, glossy. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: small red peppers, some whole and some stuffed with white cheese. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pepperoncini

**File:** `pepperoncini.jpg`  
**Frontmatter:** `image: "/images/ingredients/pepperoncini.jpg"`  
**Alt text:** Pepperoncini styled on a charcuterie board

```
Close-up editorial food photograph of pepperoncini — pale yellow-green, wrinkled, two to three inches. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: whole pale wrinkled peppers with stems, heaped in a shallow dish. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Roasted Red Peppers

**File:** `roasted-red-peppers.jpg`  
**Frontmatter:** `image: "/images/ingredients/roasted-red-peppers.jpg"`  
**Alt text:** Roasted Red Peppers styled on a charcuterie board

```
Close-up editorial food photograph of roasted red peppers — deep glossy red strips or whole small peppers. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: cut into strips. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Sun-Dried Tomatoes

**File:** `sun-dried-tomatoes.jpg`  
**Frontmatter:** `image: "/images/ingredients/sun-dried-tomatoes.jpg"`  
**Alt text:** Sun-Dried Tomatoes styled on a charcuterie board

```
Close-up editorial food photograph of sun-dried tomatoes — deep brick red, wrinkled, glossy with oil. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: cut large halves into strips. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Pickles

### Bread and Butter Pickles

**File:** `bread-and-butter-pickles.jpg`  
**Frontmatter:** `image: "/images/ingredients/bread-and-butter-pickles.jpg"`  
**Alt text:** Bread and Butter Pickles styled on a charcuterie board

```
Close-up editorial food photograph of bread and butter pickles — golden-green crinkle-cut discs, flecked with seed and onion. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: fan the coins. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cornichons

**File:** `cornichons.jpg`  
**Frontmatter:** `image: "/images/ingredients/cornichons.jpg"`  
**Alt text:** Cornichons styled on a charcuterie board

```
Close-up editorial food photograph of cornichons — small bumpy green pickles, one to two inches, in cloudy brine. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: a small heap of tiny bumpy green pickles in a shallow dish. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Dill Pickles

**File:** `dill-pickles.jpg`  
**Frontmatter:** `image: "/images/ingredients/dill-pickles.jpg"`  
**Alt text:** Dill Pickles styled on a charcuterie board

```
Close-up editorial food photograph of dill pickles — deep green, sometimes cloudy in the jar. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: cut whole pickles into spears or coins. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Giardiniera

**File:** `giardiniera.jpg`  
**Frontmatter:** `image: "/images/ingredients/giardiniera.jpg"`  
**Alt text:** Giardiniera styled on a charcuterie board

```
Close-up editorial food photograph of giardiniera — mixed white, orange, green and red pieces. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pickled Green Beans

**File:** `pickled-green-beans.jpg`  
**Frontmatter:** `image: "/images/ingredients/pickled-green-beans.jpg"`  
**Alt text:** Pickled Green Beans styled on a charcuterie board

```
Close-up editorial food photograph of pickled green beans — long bright green beans, often bundled upright. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: stand them upright. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pickled Okra

**File:** `pickled-okra.jpg`  
**Frontmatter:** `image: "/images/ingredients/pickled-okra.jpg"`  
**Alt text:** Pickled Okra styled on a charcuterie board

```
Close-up editorial food photograph of pickled okra — small ridged green pods with pointed tips. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: fan the pods. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Pickled Red Onions

**File:** `pickled-red-onions.jpg`  
**Frontmatter:** `image: "/images/ingredients/pickled-red-onions.jpg"`  
**Alt text:** Pickled Red Onions styled on a charcuterie board

```
Close-up editorial food photograph of pickled red onions — vivid magenta-pink strands. Presented on a small shallow glazed dish on weathered grey wood, with two or three pieces scattered beside the dish. Styled as it would be served on a charcuterie board: serve in a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

---

# Finishing Touches

*16 images*

## Chocolate & sweets

### Amaretti

**File:** `amaretti.jpg`  
**Frontmatter:** `image: "/images/ingredients/amaretti.jpg"`  
**Alt text:** Amaretti styled on a charcuterie board

```
Close-up editorial food photograph of amaretti — small domed biscuits with a cracked top, often in twisted paper wrappers. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: crumble some over mascarpone or ricotta. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Biscotti

**File:** `biscotti.jpg`  
**Frontmatter:** `image: "/images/ingredients/biscotti.jpg"`  
**Alt text:** Biscotti styled on a charcuterie board

```
Close-up editorial food photograph of biscotti — long angled slices with visible whole nuts. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: stand them in a jar or glass. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Chocolate Covered Almonds

**File:** `chocolate-covered-almonds.jpg`  
**Frontmatter:** `image: "/images/ingredients/chocolate-covered-almonds.jpg"`  
**Alt text:** Chocolate Covered Almonds styled on a charcuterie board

```
Close-up editorial food photograph of chocolate covered almonds — dark round pebbles, matte if cocoa-dusted, glossy if enrobed. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: serve in a bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Dark Chocolate

**File:** `dark-chocolate.jpg`  
**Frontmatter:** `image: "/images/ingredients/dark-chocolate.jpg"`  
**Alt text:** Dark Chocolate styled on a charcuterie board

```
Close-up editorial food photograph of dark chocolate — glossy dark brown shards with a clean break. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: break it into irregular shards. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Sea Salt Caramels

**File:** `sea-salt-caramels.jpg`  
**Frontmatter:** `image: "/images/ingredients/sea-salt-caramels.jpg"`  
**Alt text:** Sea Salt Caramels styled on a charcuterie board

```
Close-up editorial food photograph of sea salt caramels — amber-brown squares topped with visible salt flakes. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: cut large ones in half. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Fresh herbs & garnish

### Edible Flowers

**File:** `edible-flowers.jpg`  
**Frontmatter:** `image: "/images/ingredients/edible-flowers.jpg"`  
**Alt text:** Edible Flowers styled on a charcuterie board

```
Close-up editorial food photograph of edible flowers — vivid purple, yellow, orange and blue against cream and white. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: a few vivid violas and nasturtiums placed deliberately on white cheese. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Fresh Basil

**File:** `fresh-basil.jpg`  
**Frontmatter:** `image: "/images/ingredients/fresh-basil.jpg"`  
**Alt text:** Fresh Basil styled on a charcuterie board

```
Close-up editorial food photograph of fresh basil — large glossy green leaves. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: whole and torn leaves scattered over white cheese. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Fresh Thyme

**File:** `fresh-thyme.jpg`  
**Frontmatter:** `image: "/images/ingredients/fresh-thyme.jpg"`  
**Alt text:** Fresh Thyme styled on a charcuterie board

```
Close-up editorial food photograph of fresh thyme — small grey-green leaves, sometimes with pale flowers. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: scatter the leaves. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Rosemary Sprigs

**File:** `rosemary-sprigs.jpg`  
**Frontmatter:** `image: "/images/ingredients/rosemary-sprigs.jpg"`  
**Alt text:** Rosemary Sprigs styled on a charcuterie board

```
Close-up editorial food photograph of rosemary sprigs — dark blue-green needles, four to six inch sprigs. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: tuck them into gaps. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Oils & drizzles

### Balsamic Glaze

**File:** `balsamic-glaze.jpg`  
**Frontmatter:** `image: "/images/ingredients/balsamic-glaze.jpg"`  
**Alt text:** Balsamic Glaze styled on a charcuterie board

```
Close-up editorial food photograph of balsamic glaze — near-black, glossy. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: drizzle in a zigzag. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Chili Oil

**File:** `chili-oil.jpg`  
**Frontmatter:** `image: "/images/ingredients/chili-oil.jpg"`  
**Alt text:** Chili Oil styled on a charcuterie board

```
Close-up editorial food photograph of chili oil — deep red oil with a dense layer of solids at the bottom. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: spooned over soft white cheese, the fried solids visible in the red oil. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Olive Oil

**File:** `olive-oil.jpg`  
**Frontmatter:** `image: "/images/ingredients/olive-oil.jpg"`  
**Alt text:** Olive Oil styled on a charcuterie board

```
Close-up editorial food photograph of olive oil — green-gold, cloudy if unfiltered. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: pour it into a small bowl. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

## Salt & spice

### Chili Flakes

**File:** `chili-flakes.jpg`  
**Frontmatter:** `image: "/images/ingredients/chili-flakes.jpg"`  
**Alt text:** Chili Flakes styled on a charcuterie board

```
Close-up editorial food photograph of chili flakes — red flecks, dark burgundy for Aleppo, bright red for generic. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: a small dish of burgundy flakes, a scattering across the surface. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Cracked Black Pepper

**File:** `cracked-black-pepper.jpg`  
**Frontmatter:** `image: "/images/ingredients/cracked-black-pepper.jpg"`  
**Alt text:** Cracked Black Pepper styled on a charcuterie board

```
Close-up editorial food photograph of cracked black pepper — black and grey flecks, visible on pale surfaces. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: coarsely cracked pepper scattered over pale cheese. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Flaky Sea Salt

**File:** `flaky-sea-salt.jpg`  
**Frontmatter:** `image: "/images/ingredients/flaky-sea-salt.jpg"`  
**Alt text:** Flaky Sea Salt styled on a charcuterie board

```
Close-up editorial food photograph of flaky sea salt — white pyramid flakes, translucent at the edges. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: finish the burrata yourself. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

### Za'atar

**File:** `za-atar.jpg`  
**Frontmatter:** `image: "/images/ingredients/za-atar.jpg"`  
**Alt text:** Za'atar styled on a charcuterie board

```
Close-up editorial food photograph of za'atar — dusty green-red, flecked with pale sesame. Presented on a pale marble surface, with generous negative space around it. Styled as it would be served on a charcuterie board: a small dish of green-red blend beside a shallow dish of olive oil. Soft diffused natural window light from the upper left, gentle shadows, shallow depth of field, muted warm editorial palette, 3:2 landscape, food-magazine styling, photorealistic. No text, no logos, no hands, no people.
```

---
