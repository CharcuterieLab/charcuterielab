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

## Manual Buffer Planner

The preferred workflow is now the manual Buffer planner app:

```powershell
.\scripts\run_pinterest_buffer_planner.ps1
```

It previews every queued Pinterest file in:

```text
C:\Users\thill\OneDrive\Desktop\Charcuterie Lab\AAAPinterestPosts
```

Then, after you type `YES`, it sends them to Buffer and schedules each post for the date in the filename. Files can be future-dated.

Example:

```text
02052026_pinterest1_salami.md
Image_02052026_pinterest1_salami.png
```

That file will be scheduled in Buffer for May 2, 2026. If multiple pins have the same date, the app spaces them into daily slots.

The preferred image naming format is an exact mirror of the Markdown filename with `Image_` in front:

```text
02052026_pinterest1_salami.md
Image_02052026_pinterest1_salami.png
```

This is the first match the app looks for. Older image names like `Image_Salami1.png` are still supported as a fallback.

Default daily time slots are:

```text
8:00 AM, 10:00 AM, 12:00 PM, 2:00 PM, 4:00 PM, 6:00 PM, 8:00 PM, 9:00 AM, 11:00 AM, 1:00 PM
```

To customize the slots:

```powershell
setx BUFFER_PINTEREST_TIME_SLOTS "08:00,10:00,12:00,14:00,16:00,18:00,20:00"
```

Successful Buffer-scheduled files move into `_posted`.
