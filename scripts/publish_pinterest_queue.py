import argparse
import base64
import json
import mimetypes
import os
import re
import shutil
import sys
import time
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path
try:
    import winreg
except ImportError:
    winreg = None


INBOX = Path(r"C:\Users\thill\OneDrive\Desktop\Charcuterie Lab\AAAPinterestPosts")
POSTED_DIR = INBOX / "_posted"
FAILED_DIR = INBOX / "_failed"
API_BASE = "https://api.pinterest.com/v5"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
DEFAULT_DAILY_LIMIT = 10


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


def parse_date_prefix(name):
    match = re.match(r"^(\d{2})(\d{2})(\d{4})_?(.+)$", name)
    if not match:
        return None

    day, month, year, raw_title = match.groups()
    try:
        publish_date = date(int(year), int(month), int(day))
    except ValueError:
        return None

    return publish_date, raw_title


def slugify(value):
    value = value.lower()
    value = re.sub(r"[_\s]+", "-", value)
    value = re.sub(r"[^a-z0-9-]", "", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "pin"


def title_from_name(value):
    return " ".join(part.capitalize() for part in re.split(r"[-_\s]+", value) if part)


def load_json(path):
    with path.open("r", encoding="utf-8-sig") as handle:
        return json.load(handle)


def load_text(path, fallback_title):
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    data = {"title": fallback_title, "description": ""}
    body = []
    section = None
    section_lines = {"title": [], "description": [], "link": [], "alt_text": []}

    for line in lines:
        clean = line.strip()
        heading = re.match(r"^#{1,3}\s*(PIN TITLE|PIN DESCRIPTION|LINK|ALT TEXT)\s*$", clean, re.I)
        if heading:
            label = heading.group(1).lower().replace("pin ", "").replace(" ", "_")
            section = label
            continue

        if clean == "---":
            section = None
            continue

        if section:
            section_lines[section].append(line)
            continue

        if not clean:
            body.append("")
            continue

        pair = re.match(r"^(title|description|link|board_id|alt_text):\s*(.+)$", clean, re.I)
        if pair:
            data[pair.group(1).lower()] = pair.group(2).strip()
        else:
            body.append(line)

    if body and not data.get("description"):
        data["description"] = "\n".join(body).strip()

    for key, values in section_lines.items():
        value = "\n".join(values).strip()
        if value:
            data[key] = value

    return data


def find_image(paths, raw_name):
    image_paths = [path for path in paths if path.suffix.lower() in IMAGE_EXTS]
    if not image_paths:
        return None

    target_slug = slugify(raw_name)
    candidate_slugs = {target_slug, slugify(f"Image_{raw_name}")}
    pin_match = re.match(r"^pinterest(\d+)_(.+)$", raw_name, re.I)
    if pin_match:
        pin_number, topic = pin_match.groups()
        candidate_slugs.add(slugify(f"{topic}{pin_number}"))
        candidate_slugs.add(slugify(f"Image_{topic}{pin_number}"))

    for image in sorted(image_paths):
        image_slug = slugify(image.stem)
        if image_slug in candidate_slugs:
            return image

    return sorted(image_paths)[0]


def media_source_from_image(image_path, image_url=None):
    if image_url:
        return {
            "source_type": "image_url",
            "url": image_url,
        }

    content_type = mimetypes.guess_type(str(image_path))[0] or "image/jpeg"
    if content_type == "image/jpg":
        content_type = "image/jpeg"

    data = base64.b64encode(image_path.read_bytes()).decode("ascii")
    return {
        "source_type": "image_base64",
        "content_type": content_type,
        "data": data,
    }


def discover_queue_items():
    items = []
    if not INBOX.exists():
        raise RuntimeError(f"Pinterest inbox does not exist: {INBOX}")

    for path in sorted(INBOX.iterdir()):
        if path.name.startswith("_"):
            continue

        if path.is_dir():
            parsed = parse_date_prefix(path.name)
            if not parsed:
                continue
            publish_date, raw_name = parsed
            files = [child for child in path.iterdir() if child.is_file()]
            content_file = next((file for file in files if file.name.lower() == "pin.json"), None)
            content_file = content_file or next((file for file in files if file.suffix.lower() == ".json"), None)
            content_file = content_file or next((file for file in files if file.suffix.lower() in {".md", ".markdown", ".txt"}), None)
            image = find_image(files, raw_name)
            items.append({
                "kind": "folder",
                "path": path,
                "date": publish_date,
                "raw_name": raw_name,
                "content_file": content_file,
                "image": image,
            })
            continue

        if path.suffix.lower() not in {".json", ".md", ".markdown", ".txt"}:
            continue

        parsed = parse_date_prefix(path.stem)
        if not parsed:
            continue
        publish_date, raw_name = parsed
        siblings = [child for child in INBOX.iterdir() if child.is_file() and child != path]
        image = find_image(siblings, raw_name)
        items.append({
            "kind": "file",
            "path": path,
            "date": publish_date,
            "raw_name": raw_name,
            "content_file": path,
            "image": image,
        })

    return items


def normalize_pin(item, default_board_id):
    fallback_title = title_from_name(item["raw_name"])
    content_file = item["content_file"]
    if content_file is None:
        data = {"title": fallback_title, "description": fallback_title}
    elif content_file.suffix.lower() == ".json":
        data = load_json(content_file)
    else:
        data = load_text(content_file, fallback_title)

    title = str(data.get("title") or fallback_title).strip()
    description = str(data.get("description") or data.get("caption") or title).strip()
    board_id = str(data.get("board_id") or default_board_id or "").strip()
    link = str(data.get("link") or "").strip()
    alt_text = str(data.get("alt_text") or "").strip()
    image_url = str(data.get("image_url") or "").strip()

    if not board_id:
        raise RuntimeError(f"{item['path'].name}: missing board_id and PINTEREST_BOARD_ID is not set.")
    if not image_url and item["image"] is None:
        raise RuntimeError(f"{item['path'].name}: missing image file or image_url.")

    pin = {
        "board_id": board_id,
        "title": title[:100],
        "description": description[:800],
        "media_source": media_source_from_image(item["image"], image_url),
    }
    if link:
        pin["link"] = link
    if alt_text:
        pin["alt_text"] = alt_text[:500]

    return pin


def pinterest_request(method, endpoint, token, payload=None):
    body = None
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")

    request = urllib.request.Request(
        f"{API_BASE}{endpoint}",
        data=body,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            text = response.read().decode("utf-8")
            return json.loads(text) if text else {}
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Pinterest API error {exc.code}: {details}") from exc


def list_boards(token):
    result = pinterest_request("GET", "/boards?page_size=100", token)
    boards = result.get("items", [])
    if not boards:
        print("No boards returned.")
        return
    for board in boards:
        print(f"{board.get('id')}\t{board.get('name')}")


def move_completed(item):
    POSTED_DIR.mkdir(parents=True, exist_ok=True)
    destination = POSTED_DIR / item["path"].name
    if destination.exists():
        suffix = time.strftime("%Y%m%d%H%M%S")
        destination = POSTED_DIR / f"{item['path'].stem}-{suffix}{item['path'].suffix}"

    shutil.move(str(item["path"]), str(destination))

    if item["kind"] == "file" and item["image"] and item["image"].exists():
        image_destination = POSTED_DIR / item["image"].name
        if image_destination.exists():
            suffix = time.strftime("%Y%m%d%H%M%S")
            image_destination = POSTED_DIR / f"{item['image'].stem}-{suffix}{item['image'].suffix}"
        shutil.move(str(item["image"]), str(image_destination))


def main():
    parser = argparse.ArgumentParser(description="Publish due Pinterest pins from a local queue folder.")
    parser.add_argument("--dry-run", action="store_true", help="Show due pins without publishing.")
    parser.add_argument("--list-boards", action="store_true", help="Print Pinterest board IDs for the token.")
    parser.add_argument("--limit", type=int, default=None, help="Maximum pins to publish in this run.")
    args = parser.parse_args()

    token = get_user_env("PINTEREST_ACCESS_TOKEN")
    default_board_id = get_user_env("PINTEREST_BOARD_ID")
    daily_limit = args.limit or int(get_user_env("PINTEREST_DAILY_LIMIT") or DEFAULT_DAILY_LIMIT)

    if args.list_boards:
        if not token:
            raise RuntimeError("PINTEREST_ACCESS_TOKEN is not set.")
        list_boards(token)
        return

    due = []
    messages = []
    for item in discover_queue_items():
        if item["date"] > date.today():
            messages.append(f"Waiting {item['path'].name}: publish date is {item['date'].isoformat()}")
            continue
        due.append(item)

    if not due:
        messages.append("No due Pinterest pins found.")
        print("\n".join(messages))
        return

    if not token and not args.dry_run:
        raise RuntimeError("PINTEREST_ACCESS_TOKEN is not set.")

    published = 0
    for item in due[:daily_limit]:
        pin = normalize_pin(item, default_board_id)
        if args.dry_run:
            messages.append(f"Due {item['path'].name}: {pin['title']} -> board {pin['board_id']}")
            continue

        result = pinterest_request("POST", "/pins", token, pin)
        published += 1
        messages.append(f"Published {item['path'].name}: pin {result.get('id', 'created')}")
        move_completed(item)
        time.sleep(2)

    skipped = max(0, len(due) - daily_limit)
    if skipped:
        messages.append(f"Skipped {skipped} due pin(s) because daily limit is {daily_limit}.")

    if published:
        messages.append(f"Published {published} Pinterest pin(s).")

    print("\n".join(messages))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
