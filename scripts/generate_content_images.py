import argparse
import base64
import json
import os
import re
import sys
import textwrap
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

try:
    import winreg
except ImportError:
    winreg = None


MAIN_FOLDER = Path(r"C:\Users\thill\OneDrive\Desktop\Charcuterie Lab")
LOGO_PATH = MAIN_FOLDER / "Logo.png"
IMAGE_MODEL = "gpt-image-1"
SUPPORTED_TEXT_EXTS = {".md", ".markdown", ".txt"}


PLATFORM_SETTINGS = {
    "blog": {"size": "1536x1024", "output": "Image_{stem}.png", "overlay": False},
    "pinterest": {"size": "1024x1536", "output": "Image_{topic}{number}.png", "overlay": True},
    "instagram": {"size": "1024x1024", "output": "Image_{stem}.png", "overlay": False},
    "facebook": {"size": "1536x1024", "output": "Image_{stem}.png", "overlay": False},
    "twitter": {"size": "1536x1024", "output": "Image_{stem}.png", "overlay": False},
}


def get_user_env(name):
    value = os.environ.get(name)
    if value and value != "PASTE_TOKEN_HERE":
        return value

    if winreg is None:
        return None

    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as key:
            value, _ = winreg.QueryValueEx(key, name)
            if value and value != "PASTE_TOKEN_HERE":
                return value
    except OSError:
        return None

    return None


def clean_text(value):
    value = value.replace("\ufeff", "")
    value = value.replace("â€”", "-").replace("â€“", "-").replace("â†’", "->")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def folder_choices():
    folders = []
    for folder in sorted(MAIN_FOLDER.iterdir()):
        if not folder.is_dir():
            continue
        if folder.name.startswith(("AAA", "ZZZ", "_")):
            continue
        if any(child.is_file() and child.suffix.lower() in SUPPORTED_TEXT_EXTS for child in folder.iterdir()):
            folders.append(folder)
    return folders


def choose_folder():
    folders = folder_choices()
    if not folders:
        raise RuntimeError(f"No content folders found in {MAIN_FOLDER}")

    print("\nContent folders:\n")
    for index, folder in enumerate(folders, start=1):
        print(f"{index:2}. {folder.name}")

    selection = input("\nChoose a folder number or paste a folder path/name: ").strip().strip('"')
    if selection.isdigit():
        index = int(selection)
        if 1 <= index <= len(folders):
            return folders[index - 1]
        raise RuntimeError("Folder number is out of range.")

    path = Path(selection)
    if not path.is_absolute():
        path = MAIN_FOLDER / selection
    if path.exists() and path.is_dir():
        return path

    matches = [folder for folder in folders if folder.name.lower() == selection.lower()]
    if matches:
        return matches[0]

    raise RuntimeError(f"Could not find folder: {selection}")


def parse_platform(stem):
    lower = stem.lower()
    pinterest = re.match(r"^pinterest(\d+)_(.+)$", lower)
    if pinterest:
        return "pinterest", pinterest.group(1), pinterest.group(2)

    for platform in PLATFORM_SETTINGS:
        if lower.startswith(f"{platform}_"):
            return platform, "", lower[len(platform) + 1 :]

    return "blog", "", lower


def read_sections(text):
    sections = {}
    current = None
    for line in text.splitlines():
        if line.strip() == "---":
            current = None
            continue

        heading = re.match(r"^#{1,3}\s*(.+?)\s*$", line.strip())
        if heading:
            current = clean_text(heading.group(1)).lower()
            sections[current] = []
            continue
        if current:
            sections[current].append(line)

    return {key: clean_text("\n".join(value)) for key, value in sections.items()}


def extract_frontmatter(text):
    match = re.match(r"^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$", text)
    data = {}
    body = text
    if match:
        body = match.group(2)
        for line in match.group(1).splitlines():
            pair = re.match(r"^([A-Za-z0-9_-]+):\s*\"?(.*?)\"?\s*$", line)
            if pair:
                data[pair.group(1).lower()] = pair.group(2)
    return data, body


def brief_from_file(path):
    text = path.read_text(encoding="utf-8-sig")
    frontmatter, body = extract_frontmatter(text)
    sections = read_sections(body)
    platform, pin_number, topic = parse_platform(path.stem)

    title = (
        sections.get("pin title")
        or frontmatter.get("title")
        or title_from_stem(path.stem)
    )
    description = (
        sections.get("pin description")
        or frontmatter.get("description")
        or first_paragraph(body)
    )
    image_direction = extract_image_direction(text)
    overlay = extract_text_overlay(text)

    return {
        "path": path,
        "platform": platform,
        "pin_number": pin_number,
        "topic": topic,
        "title": clean_text(title),
        "description": clean_text(description),
        "image_direction": clean_text(image_direction),
        "overlay": clean_text(overlay),
    }


def title_from_stem(stem):
    platform, pin_number, topic = parse_platform(stem)
    label = topic or stem
    title = " ".join(part.capitalize() for part in re.split(r"[-_\s]+", label) if part)
    if platform == "pinterest" and pin_number:
        return f"Pinterest Pin {pin_number}: {title}"
    return title


def first_paragraph(text):
    text = re.sub(r"^---[\s\S]*?---", "", text).strip()
    for block in re.split(r"\n\s*\n", text):
        clean = clean_text(re.sub(r"[*_`>#-]", "", block))
        if len(clean) > 40:
            return clean[:500]
    return ""


def extract_image_direction(text):
    match = re.search(r"\*\*Image direction:\*\*\s*(.+)", text, re.I)
    if match:
        return match.group(1)
    return ""


def extract_text_overlay(text):
    match = re.search(r'Text overlay:\s*"([^"]+)"', text, re.I)
    if match:
        return match.group(1)
    match = re.search(r"Text overlay:\s*([^.\n]+)", text, re.I)
    if match:
        return match.group(1)
    return ""


def output_name(brief):
    settings = PLATFORM_SETTINGS.get(brief["platform"], PLATFORM_SETTINGS["blog"])
    if brief["platform"] == "pinterest" and brief["pin_number"]:
        topic = "".join(part.capitalize() for part in re.split(r"[-_\s]+", brief["topic"]) if part)
        return settings["output"].format(
            stem=brief["path"].stem,
            topic=topic,
            number=brief["pin_number"],
        )
    return settings["output"].format(stem=brief["path"].stem)


def build_prompt(brief):
    size_note = {
        "blog": "wide editorial blog hero image",
        "pinterest": "vertical Pinterest pin image, premium food magazine styling",
        "instagram": "square social media image",
        "facebook": "wide social post image",
        "twitter": "wide social post image",
    }.get(brief["platform"], "editorial food image")

    direction = brief["image_direction"] or brief["description"] or brief["title"]
    no_text = "Do not include readable text, typography, logos, watermarks, or labels in the generated image."
    if brief["overlay"]:
        no_text = "Leave clean negative space for a later text banner. Do not render readable text yourself."

    return textwrap.dedent(
        f"""
        Create a polished Charcuterie Lab image for: {brief['title']}.

        Format: {size_note}.
        Visual direction: {direction}

        Style: realistic premium food photography, science-meets-flavor editorial feel,
        deep forest green, warm wood, cream, brass/gold accents where natural,
        appetizing texture, crisp details, natural shadows, composed for a high-end
        charcuterie education brand.

        {no_text}
        Avoid hands, people, distorted food, extra utensils clutter, fake labels,
        misspelled text, and messy backgrounds.
        """
    ).strip()


def generate_image(prompt, size, api_key):
    payload = {
        "model": IMAGE_MODEL,
        "prompt": prompt,
        "size": size,
        "quality": "high",
        "n": 1,
    }
    request = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Image API error {exc.code}: {details}") from exc

    item = result["data"][0]
    if "b64_json" in item:
        return base64.b64decode(item["b64_json"])

    if "url" in item:
        with urllib.request.urlopen(item["url"], timeout=180) as response:
            return response.read()

    raise RuntimeError("Image API response did not include image data.")


def load_font(size, bold=False):
    candidates = [
        r"C:\Windows\Fonts\playfairdisplay-bold.ttf" if bold else r"C:\Windows\Fonts\playfairdisplay-regular.ttf",
        r"C:\Windows\Fonts\georgiab.ttf" if bold else r"C:\Windows\Fonts\georgia.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def add_overlay(image, text):
    if not text:
        return image

    image = image.convert("RGBA")
    draw = ImageDraw.Draw(image)
    width, height = image.size
    banner_height = int(height * 0.17)
    y0 = height - banner_height
    banner = Image.new("RGBA", (width, banner_height), (14, 45, 30, 222))
    image.alpha_composite(banner, (0, y0))

    font = load_font(max(38, int(width * 0.055)), bold=True)
    max_width = int(width * 0.86)
    words = text.split()
    lines = []
    line = ""
    for word in words:
        test = f"{line} {word}".strip()
        box = draw.textbbox((0, 0), test, font=font)
        if box[2] - box[0] <= max_width or not line:
            line = test
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    lines = lines[:2]

    line_height = int((draw.textbbox((0, 0), "Ag", font=font)[3] + 8) * 1.05)
    total_height = line_height * len(lines)
    y = y0 + (banner_height - total_height) // 2
    for line in lines:
        box = draw.textbbox((0, 0), line, font=font)
        x = (width - (box[2] - box[0])) // 2
        draw.text((x, y), line, fill=(250, 244, 228, 255), font=font)
        y += line_height

    return image


def stamp_logo(image):
    if not LOGO_PATH.exists():
        return image

    image = image.convert("RGBA")
    logo = Image.open(LOGO_PATH).convert("RGBA")
    width, height = image.size
    logo_width = max(90, int(width * 0.16))
    ratio = logo_width / logo.width
    logo = logo.resize((logo_width, int(logo.height * ratio)), Image.LANCZOS)

    padding = int(width * 0.035)
    backdrop_padding = max(12, int(logo_width * 0.10))
    x = width - logo.width - padding
    y = height - logo.height - padding

    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(
        (
            x - backdrop_padding,
            y - backdrop_padding,
            x + logo.width + backdrop_padding,
            y + logo.height + backdrop_padding,
        ),
        radius=backdrop_padding,
        fill=(250, 244, 228, 205),
    )
    image.alpha_composite(logo, (x, y))
    return image


def process_file(path, overwrite=False, dry_run=False):
    if path.name.lower().startswith("readme"):
        return "Skipped README."
    if path.suffix.lower() not in SUPPORTED_TEXT_EXTS:
        return f"Skipped unsupported file: {path.name}"

    brief = brief_from_file(path)
    settings = PLATFORM_SETTINGS.get(brief["platform"], PLATFORM_SETTINGS["blog"])
    target = path.parent / output_name(brief)
    if target.exists() and not overwrite:
        return f"Skipped existing image: {target.name}"

    prompt = build_prompt(brief)
    if dry_run:
        return f"Would create {target.name} from {path.name}\nPrompt: {prompt[:500]}..."

    api_key = get_user_env("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set.")

    image_bytes = generate_image(prompt, settings["size"], api_key)
    raw_target = target.with_name(f"{target.stem}_raw_{datetime.now().strftime('%Y%m%d%H%M%S')}.png")
    raw_target.write_bytes(image_bytes)

    image = Image.open(raw_target)
    if settings.get("overlay") and brief["overlay"]:
        image = add_overlay(image, brief["overlay"])
    image = stamp_logo(image)
    image.convert("RGB").save(target, "PNG", optimize=True)
    raw_target.unlink(missing_ok=True)

    return f"Created {target.name}"


def main():
    parser = argparse.ArgumentParser(description="Generate branded images for Charcuterie Lab content folders.")
    parser.add_argument("--folder", help="Folder path or name under the Charcuterie Lab main folder.")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated without calling the image API.")
    parser.add_argument("--overwrite", action="store_true", help="Replace existing generated images.")
    parser.add_argument("--limit", type=int, default=None, help="Maximum files to process.")
    args = parser.parse_args()

    if args.folder:
        folder = Path(args.folder.strip('"'))
        if not folder.is_absolute():
            folder = MAIN_FOLDER / args.folder
    else:
        folder = choose_folder()

    if not folder.exists() or not folder.is_dir():
        raise RuntimeError(f"Folder does not exist: {folder}")

    files = [
        file for file in sorted(folder.iterdir())
        if file.is_file()
        and file.suffix.lower() in SUPPORTED_TEXT_EXTS
        and not file.name.lower().startswith("readme")
    ]
    if args.limit:
        files = files[:args.limit]

    if not files:
        print(f"No content files found in {folder}")
        return

    print(f"Selected folder: {folder}")
    print(f"Processing {len(files)} file(s).\n")

    messages = []
    for file in files:
        try:
            messages.append(process_file(file, overwrite=args.overwrite, dry_run=args.dry_run))
        except Exception as exc:
            messages.append(f"ERROR {file.name}: {exc}")

    print("\n".join(messages))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
