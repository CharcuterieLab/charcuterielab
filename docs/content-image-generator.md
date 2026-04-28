# Content Image Generator

Run this shell app to create branded images for one content folder at a time:

```powershell
.\scripts\run_content_image_generator.ps1
```

It lists folders under:

```text
C:\Users\thill\OneDrive\Desktop\Charcuterie Lab
```

Pick a folder like `ingredient_salami`. The app processes every `.md`, `.markdown`, and `.txt` file except README files.

Output examples:

```text
blog_salami.md          -> Image_blog_salami.png
pinterest1_salami.md    -> Image_Salami1.png
pinterest3_salami.md    -> Image_Salami3.png
instagram_salami.md     -> Image_instagram_salami.png
```

The app stamps this logo in the lower-right corner of every finished image:

```text
C:\Users\thill\OneDrive\Desktop\Charcuterie Lab\Logo.png
```

Before first real use, set your image API key:

```powershell
setx OPENAI_API_KEY "your_openai_api_key"
```

Useful test command:

```powershell
.\scripts\run_content_image_generator.ps1 --folder ingredient_salami --dry-run
```

Useful real command:

```powershell
.\scripts\run_content_image_generator.ps1 --folder ingredient_salami
```

Use `--overwrite` if you want to regenerate existing images.
