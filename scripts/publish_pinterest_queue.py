import argparse
import base64
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import date, datetime, time as datetime_time
from pathlib import Path
from zoneinfo import ZoneInfo
try:
    import winreg
except ImportError:
    winreg = None


INBOX = Path(r"C:\Users\thill\OneDrive\Desktop\Charcuterie Lab\AAAPinterestPosts")
REPO = Path(__file__).resolve().parents[1]
SITE = REPO / "charcuterielab"
SOCIAL_IMAGE_DIR = SITE / "public" / "images" / "social"
POSTED_DIR = INBOX / "_posted"
FAILED_DIR = INBOX / "_failed"
API_BASE = "https://api.pinterest.com/v5"
BUFFER_API_BASE = "https://api.buffer.com"
SITE_URL = "https://charcuterielab.com"
DEFAULT_BUFFER_PINTEREST_CHANNEL_ID = "69b884027be9f8b171626461"
DEFAULT_BUFFER_PINTEREST_BOARD_SERVICE_ID = "1083538060288692914"
DEFAULT_TIMEZONE = "America/Chicago"
DEFAULT_BUFFER_TIME_SLOTS = [
    "08:00",
    "10:00",
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
    "09:00",
    "11:00",
    "13:00",
]
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
DEFAULT_DAILY_LIMIT = 10


def run(args, *, cwd=REPO, check=True):
    result = subprocess.run(
        args,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    if check and result.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(args)}\n{result.stdout}")
    return result.stdout or ""


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
        heading = re.match(r"^#{1,3}\s*(PIN TITLE|PIN DESCRIPTION|LINK|ALT TEXT)\b.*$", clean, re.I)
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


def load_pin_data(item, default_board_id="", require_board=True):
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
    link = normalize_charcuterie_link(str(data.get("link") or "").strip())
    alt_text = str(data.get("alt_text") or "").strip()
    image_url = str(data.get("image_url") or "").strip()

    if require_board and not board_id:
        raise RuntimeError(f"{item['path'].name}: missing board_id and PINTEREST_BOARD_ID is not set.")
    if not image_url and item["image"] is None:
        raise RuntimeError(f"{item['path'].name}: missing image file or image_url.")

    return {
        "title": title,
        "description": description,
        "board_id": board_id,
        "link": link,
        "alt_text": alt_text,
        "image_url": image_url,
    }


def normalize_charcuterie_link(link):
    if not link:
        return link
    if not re.match(r"^https://charcuterielab\.com/?", link, re.I):
        return link

    match = re.match(r"^(https://charcuterielab\.com)(/.*)?$", link, re.I)
    if not match:
        return link

    base, path = match.groups()
    path = path or "/"
    if path == "/" or path.lower().startswith("/blog/"):
        return link
    return f"{base}/blog{path}"


def find_image(paths, raw_name, content_stem=None):
    image_paths = [path for path in paths if path.suffix.lower() in IMAGE_EXTS]
    if not image_paths:
        return None

    if content_stem:
        exact_slugs = {slugify(f"Image_{content_stem}")}
        exact_slugs.add(slugify(f"Image_{re.sub(r'^(\d{8})_', r'\1', content_stem)}"))
        for image in sorted(image_paths):
            if slugify(image.stem) in exact_slugs:
                return image

    target_slug = slugify(raw_name)
    candidate_slugs = {target_slug, slugify(f"Image_{raw_name}")}
    pin_match = re.match(r"^pinterest(\d+)_(.+)$", raw_name, re.I)
    if pin_match:
        pin_number, topic = pin_match.groups()
        topic_first = re.split(r"[-_\s]+", topic)[0]
        candidate_slugs.add(slugify(f"{topic}{pin_number}"))
        candidate_slugs.add(slugify(f"Image_{topic}{pin_number}"))
        candidate_slugs.add(slugify(f"Pinterest{pin_number}_{topic}"))
        candidate_slugs.add(slugify(f"Image_Pinterest{pin_number}_{topic}"))
        candidate_slugs.add(slugify(f"Pinterest{pin_number}_{topic_first}"))
        candidate_slugs.add(slugify(f"Image_Pinterest{pin_number}_{topic_first}"))

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
            image = find_image(files, raw_name, path.name)
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
        image = find_image(siblings, raw_name, path.stem)
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
    data = load_pin_data(item, default_board_id, require_board=True)

    pin = {
        "board_id": data["board_id"],
        "title": data["title"][:100],
        "description": data["description"][:800],
        "media_source": media_source_from_image(item["image"], data["image_url"]),
    }
    if data["link"]:
        pin["link"] = data["link"]
    if data["alt_text"]:
        pin["alt_text"] = data["alt_text"][:500]

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


def graphql_request(query, token, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    request = urllib.request.Request(
        BUFFER_API_BASE,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "CharcuterieLabBufferAutomation/1.0",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            result = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Buffer API error {exc.code}: {details}") from exc

    if result.get("errors"):
        raise RuntimeError(f"Buffer API error: {json.dumps(result['errors'])}")
    return result.get("data") or {}


def public_image_name(item):
    source = item["image"]
    if not source:
        return ""
    stem = slugify(item["path"].stem)
    return f"{stem}{source.suffix.lower()}"


def stage_public_images(items):
    SOCIAL_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    staged = []
    for item in items:
        if not item["image"]:
            continue
        destination = SOCIAL_IMAGE_DIR / public_image_name(item)
        shutil.copy2(item["image"], destination)
        staged.append(destination)

    if not staged:
        return "No local images needed public hosting."

    run(["git", "pull", "--ff-only", "origin", "main"])
    run(["git", "add", "charcuterielab/public/images/social"])
    status = run(["git", "status", "--short", "--", "charcuterielab/public/images/social"]).strip()
    if not status:
        return "Public social images already up to date."

    run(["git", "commit", "-m", "Publish social images for Buffer"])
    run(["git", "push", "origin", "main"])
    return f"Published {len(staged)} social image(s) to GitHub."


def buffer_text(data):
    limit = 500
    description = data["description"].strip()
    if len(description) > limit:
        description = description[: limit - 3].rstrip() + "..."
    return description


def buffer_image_url(item, data):
    if data["image_url"]:
        return data["image_url"]
    return f"{SITE_URL}/images/social/{public_image_name(item)}"


def public_image_ready(url):
    request = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": "CharcuterieLabBufferPlanner/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return 200 <= response.status < 300
    except Exception:
        return False


def wait_for_public_images(items, messages, timeout_seconds=180):
    pending = {}
    for item in items:
        data = load_pin_data(item, require_board=False)
        if data["image_url"]:
            continue
        pending[item["path"].name] = buffer_image_url(item, data)

    if not pending:
        return

    deadline = time.time() + timeout_seconds
    while pending and time.time() < deadline:
        for name, url in list(pending.items()):
            if public_image_ready(url):
                messages.append(f"Image is live for {name}: {url}")
                del pending[name]
        if pending:
            time.sleep(10)

    if pending:
        missing = ", ".join(f"{name} ({url})" for name, url in pending.items())
        raise RuntimeError(f"Timed out waiting for public image URL(s): {missing}")


def buffer_time_slots():
    raw = get_user_env("BUFFER_PINTEREST_TIME_SLOTS")
    if not raw:
        return DEFAULT_BUFFER_TIME_SLOTS

    slots = []
    for value in raw.split(","):
        value = value.strip()
        if re.match(r"^\d{1,2}:\d{2}$", value):
            slots.append(value)
    return slots or DEFAULT_BUFFER_TIME_SLOTS


def buffer_due_at(item, index_for_date):
    slots = buffer_time_slots()
    slot = slots[index_for_date % len(slots)]
    hour, minute = [int(part) for part in slot.split(":", 1)]
    tz = ZoneInfo(get_user_env("BUFFER_PINTEREST_TIMEZONE") or DEFAULT_TIMEZONE)
    local_dt = datetime.combine(item["date"], datetime_time(hour, minute), tzinfo=tz)
    return local_dt.astimezone(ZoneInfo("UTC")).isoformat().replace("+00:00", "Z")


def create_buffer_post(item, channel_id, token, due_at=None):
    data = load_pin_data(item, require_board=False)
    image_url = buffer_image_url(item, data)
    text = buffer_text(data)
    mutation = """
    mutation CreatePinterestPost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
            text
            dueAt
          }
        }
        ... on MutationError {
          message
        }
      }
    }
    """
    variables = {
        "input": {
            "text": text,
            "channelId": channel_id,
            "schedulingType": "automatic",
            "mode": "customScheduled" if due_at else "addToQueue",
            "assets": {
                "images": [
                    {"url": image_url}
                ]
            },
            "metadata": {
                "pinterest": {
                    "title": data["title"][:100],
                    "url": data["link"] or SITE_URL,
                    "boardServiceId": (
                        get_user_env("BUFFER_PINTEREST_BOARD_SERVICE_ID")
                        or data["board_id"]
                        or DEFAULT_BUFFER_PINTEREST_BOARD_SERVICE_ID
                    ),
                }
            },
        }
    }
    if due_at:
        variables["input"]["dueAt"] = due_at

    result = graphql_request(mutation, token, variables)
    response = result.get("createPost") or {}
    if response.get("message"):
        raise RuntimeError(response["message"])
    post = response.get("post") or {}
    return post.get("id", "created")


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
    parser = argparse.ArgumentParser(description="Publish or schedule Pinterest pins from a local queue folder.")
    parser.add_argument("--dry-run", action="store_true", help="Show due pins without publishing.")
    parser.add_argument("--list-boards", action="store_true", help="Print Pinterest board IDs for the token.")
    parser.add_argument("--buffer", action="store_true", help="Send due pins to the Buffer Pinterest queue.")
    parser.add_argument(
        "--schedule-all",
        action="store_true",
        help="With --buffer, schedule every queued file for the date in its filename, including future dates.",
    )
    parser.add_argument("--limit", type=int, default=None, help="Maximum pins to publish in this run.")
    args = parser.parse_args()

    token = get_user_env("PINTEREST_ACCESS_TOKEN")
    default_board_id = get_user_env("PINTEREST_BOARD_ID")
    buffer_token = get_user_env("BUFFER_API_KEY")
    buffer_channel_id = get_user_env("BUFFER_PINTEREST_CHANNEL_ID") or DEFAULT_BUFFER_PINTEREST_CHANNEL_ID
    daily_limit = args.limit or int(get_user_env("PINTEREST_DAILY_LIMIT") or DEFAULT_DAILY_LIMIT)

    if args.list_boards:
        if not token:
            raise RuntimeError("PINTEREST_ACCESS_TOKEN is not set.")
        list_boards(token)
        return

    queue = []
    messages = []
    for item in discover_queue_items():
        if not args.schedule_all and item["date"] > date.today():
            messages.append(f"Waiting {item['path'].name}: publish date is {item['date'].isoformat()}")
            continue
        queue.append(item)

    if not queue:
        messages.append("No Pinterest pins found to process.")
        print("\n".join(messages))
        return

    if args.buffer and not buffer_token and not args.dry_run:
        raise RuntimeError("BUFFER_API_KEY is not set.")

    if not args.buffer and not token and not args.dry_run:
        raise RuntimeError("PINTEREST_ACCESS_TOKEN is not set.")

    to_publish = queue[: args.limit] if args.limit else queue
    if not args.schedule_all and args.limit is None:
        to_publish = queue[:daily_limit]

    if args.buffer and not args.dry_run:
        messages.append(stage_public_images(to_publish))
        wait_for_public_images(to_publish, messages)

    published = 0
    scheduled_counts = {}
    for item in to_publish:
        if args.buffer:
            data = load_pin_data(item, require_board=False)
            due_at = None
            if args.schedule_all:
                index_for_date = scheduled_counts.get(item["date"], 0)
                scheduled_counts[item["date"]] = index_for_date + 1
                due_at = buffer_due_at(item, index_for_date)

            if args.dry_run:
                schedule_note = f" for {due_at}" if due_at else ""
                messages.append(
                    f"Buffer{schedule_note}: {item['path'].name}: {data['title']} -> channel {buffer_channel_id}"
                )
                continue

            post_id = create_buffer_post(item, buffer_channel_id, buffer_token, due_at)
            published += 1
            schedule_note = f" for {due_at}" if due_at else ""
            messages.append(f"Queued {item['path'].name} in Buffer{schedule_note}: post {post_id}")
            move_completed(item)
            time.sleep(2)
            continue

        pin = normalize_pin(item, default_board_id)
        if args.dry_run:
            messages.append(f"Due {item['path'].name}: {pin['title']} -> board {pin['board_id']}")
            continue

        result = pinterest_request("POST", "/pins", token, pin)
        published += 1
        messages.append(f"Published {item['path'].name}: pin {result.get('id', 'created')}")
        move_completed(item)
        time.sleep(2)

    skipped = max(0, len(queue) - len(to_publish))
    if skipped:
        messages.append(f"Skipped {skipped} due pin(s) because daily limit is {daily_limit}.")

    if published:
        target = "Buffer Pinterest post(s)" if args.buffer else "Pinterest pin(s)"
        messages.append(f"Published {published} {target}.")

    print("\n".join(messages))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
