# Pinterest Queue

Put scheduled Pinterest pins in this folder:

```text
C:\Users\thill\OneDrive\Desktop\Charcuterie Lab\AAAPinterestPosts
```

Each pin can be a folder named with the publish date:

```text
28042026_manchego-pairing
  pin.json
  manchego-pairing.jpg
```

Use this `pin.json` format:

```json
{
  "title": "Why Manchego Belongs on Your Board",
  "description": "A nutty, salty cheese that loves quince paste, almonds, and crisp white wine.",
  "link": "https://charcuterielab.com/blog/manchego/",
  "alt_text": "A charcuterie board with Manchego cheese, almonds, and quince paste"
}
```

The script also supports simple `.txt` files. The first option is more reliable because Pinterest needs a title, description, image, board, and optional link.

It also supports Markdown files like this, so generated Pinterest briefs can be dropped in directly:

```text
27042026pinterest1_manchego.md
Image_Manchego1.png
```

The Markdown can use these headings:

```markdown
## PIN TITLE
Manchego Cheese on a Charcuterie Board

## PIN DESCRIPTION
Manchego is one of the most versatile cheeses for a charcuterie board...

## LINK
https://charcuterielab.com/blog/manchego/
```

For multiple pins from the same content, use `pinterest1_manchego`, `pinterest2_manchego`, etc. Matching images can be named `Image_Manchego1.png`, `Image_Manchego2.png`, and so on.

Required computer settings:

```powershell
setx PINTEREST_ACCESS_TOKEN "your_pinterest_access_token"
setx PINTEREST_BOARD_ID "your_board_id"
setx PINTEREST_DAILY_LIMIT "10"
```

To see your boards after the token is set:

```powershell
python scripts\publish_pinterest_queue.py --list-boards
```

To test without posting:

```powershell
python scripts\publish_pinterest_queue.py --dry-run
```

Successful pins move into `_posted` so they do not publish twice.
