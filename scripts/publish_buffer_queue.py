import argparse
import json
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


REPO = Path(__file__).resolve().parents[1]
SITE = REPO / "charcuterielab"
DESKTOP_ROOT = Path(r"C:\Users\thill\OneDrive\Desktop\Charcuterie Lab")
SOCIAL_IMAGE_DIR = SITE / "public" / "images" / "social"
ROOT_SOCIAL_IMAGE_DIR = REPO / "public" / "images" / "social"
BUFFER_API_BASE = "https://api.buffer.com"
SITE_URL = "https://charcuterielab.com"
DEFAULT_TIMEZONE = "America/Chicago"
DEFAULT_TIME_SLOTS = ["08:30", "11:30", "14:30", "17:30", "20:30"]
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

PLATFORMS = {
    "instagram": {
        "inbox": DESKTOP_ROOT / "AAAInstagramPosts",
        "channel_env": "BUFFER_INSTAGRAM_CHANNEL_ID",
        "slots_env": "BUFFER_INSTAGRAM_TIME_SLOTS",
        "timezone_env": "BUFFER_INSTAGRAM_TIMEZONE",
        "label": "Instagram",
    },
    "facebook": {
        "inbox": DESKTOP_ROOT / "AAAFacebookPosts",
        "channel_env": "BUFFER_FACEBOOK_CHANNEL_ID",
        "slots_env": "BUFFER_FACEBOOK_TIME_SLOTS",
        "timezone_env": "BUFFER_FACEBOOK_TIMEZONE",
        "label": "Facebook",
    },
}


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
    return value or "post"


def title_from_name(value):
    return " ".join(part.capitalize() for part in re.split(r"[-_\s]+", value) if part)


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


def load_json(path):
    with path.open("r", encoding="utf-8-sig") as handle:
        return json.load(handle)


def load_text(path, fallback_title):
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    data = {"title": fallback_title, "description": ""}
    body = []
    section = None
    section_lines = {"title": [], "description": [], "caption": [], "link": [], "alt_text": []}

    for line in lines:
        clean = line.strip()
        heading = re.match(r"^#{1,3}\s*(TITLE|POST TITLE|CAPTION|DESCRIPTION|POST DESCRIPTION|LINK|ALT TEXT)\b.*$", clean, re.I)
        if heading:
            label = heading.group(1).lower().replace("post ", "").replace(" ", "_")
            section = "description" if label == "caption" else label
            continue

        if clean == "---":
            section = None
            continue

        pair = re.match(r"^(title|description|caption|link|alt_text|image_url):\s*(.+)$", clean, re.I)
        if pair:
            key = pair.group(1).lower()
            data["description" if key == "caption" else key] = pair.group(2).strip()
            continue

        if section:
            section_lines[section].append(line)
            continue

        body.append(line)

    if body and not data.get("description"):
        data["description"] = "\n".join(body).strip()

    for key, values in section_lines.items():
        value = "\n".join(values).strip()
        if value:
            data["description" if key == "caption" else key] = value

    return data


def find_image(paths, raw_name, content_stem=None):
    image_paths = [path for path in paths if path.suffix.lower() in IMAGE_EXTS]
    if not image_paths:
        return None

    if content_stem:
        exact_slugs = {slugify(f"Image_{content_stem}")}
        for image in sorted(image_paths):
            if slugify(image.stem) in exact_slugs:
                return image

    target_slug = slugify(raw_name)
    candidate_slugs = {target_slug, slugify(f"Image_{raw_name}")}
    for image in sorted(image_paths):
        if slugify(image.stem) in candidate_slugs:
            return image

    return sorted(image_paths)[0]


def discover_queue_items(inbox):
    items = []
    if not inbox.exists():
        inbox.mkdir(parents=True, exist_ok=True)

    for path in sorted(inbox.iterdir()):
        if path.name.startswith("_"):
            continue

        if path.is_dir():
            parsed = parse_date_prefix(path.name)
            if not parsed:
                continue
            publish_date, raw_name = parsed
            files = [child for child in path.iterdir() if child.is_file()]
            content_file = next((file for file in files if file.suffix.lower() in {".json", ".md", ".markdown", ".txt"}), None)
            image = find_image(files, raw_name, path.name)
            items.append({"kind": "folder", "path": path, "date": publish_date, "raw_name": raw_name, "content_file": content_file, "image": image})
            continue

        if path.suffix.lower() not in {".json", ".md", ".markdown", ".txt"}:
            continue

        parsed = parse_date_prefix(path.stem)
        if not parsed:
            continue
        publish_date, raw_name = parsed
        siblings = [child for child in inbox.iterdir() if child.is_file() and child != path]
        image = find_image(siblings, raw_name, path.stem)
        items.append({"kind": "file", "path": path, "date": publish_date, "raw_name": raw_name, "content_file": path, "image": image})

    return items


def load_post_data(item):
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
    link = normalize_charcuterie_link(str(data.get("link") or "").strip())
    image_url = str(data.get("image_url") or "").strip()

    if not image_url and item["image"] is None:
        raise RuntimeError(f"{item['path'].name}: missing image file or image_url.")

    return {"title": title, "description": description, "link": link, "image_url": image_url}


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


def buffer_image_url(item, data):
    if data["image_url"]:
        return data["image_url"]
    return f"https://raw.githubusercontent.com/CharcuterieLab/charcuterielab/main/public/images/social/{public_image_name(item)}"


def stage_public_images(items):
    SOCIAL_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    ROOT_SOCIAL_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    staged = []
    for item in items:
        if not item["image"]:
            continue
        for directory in (SOCIAL_IMAGE_DIR, ROOT_SOCIAL_IMAGE_DIR):
            destination = directory / public_image_name(item)
            shutil.copy2(item["image"], destination)
            staged.append(destination)

    if not staged:
        return "No local images needed public hosting."

    run(["git", "pull", "--ff-only", "origin", "main"])
    run(["git", "add", "charcuterielab/public/images/social", "public/images/social"])
    status = run(["git", "status", "--short", "--", "charcuterielab/public/images/social", "public/images/social"]).strip()
    if not status:
        return "Public social images already up to date."

    run(["git", "commit", "-m", "Publish social images for Buffer"])
    run(["git", "push", "origin", "main"])
    return f"Published {len(staged)} social image(s) to GitHub."


def public_image_ready(url):
    request = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "CharcuterieLabBufferPlanner/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return 200 <= response.status < 300
    except Exception:
        return False


def wait_for_public_images(items, messages, timeout_seconds=180):
    pending = {}
    for item in items:
        data = load_post_data(item)
        if data["image_url"]:
            continue
        pending[item["path"].name] = buffer_image_url(item, data)

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


def time_slots(config):
    raw = get_user_env(config["slots_env"])
    if not raw:
        return DEFAULT_TIME_SLOTS

    slots = [value.strip() for value in raw.split(",") if re.match(r"^\d{1,2}:\d{2}$", value.strip())]
    return slots or DEFAULT_TIME_SLOTS


def due_at(item, index_for_date, config):
    slot = time_slots(config)[index_for_date % len(time_slots(config))]
    hour, minute = [int(part) for part in slot.split(":", 1)]
    tz = ZoneInfo(get_user_env(config["timezone_env"]) or DEFAULT_TIMEZONE)
    local_dt = datetime.combine(item["date"], datetime_time(hour, minute), tzinfo=tz)
    return local_dt.astimezone(ZoneInfo("UTC")).isoformat().replace("+00:00", "Z")


def buffer_text(data, platform):
    text = data["description"].strip()
    if data["link"] and platform == "facebook":
        text = f"{text}\n\n{data['link']}".strip()
    limit = 2200 if platform == "instagram" else 5000
    if len(text) > limit:
        text = text[: limit - 3].rstrip() + "..."
    return text


def create_buffer_post(item, channel_id, token, platform, due=None):
    data = load_post_data(item)
    mutation = """
    mutation CreatePost($input: CreatePostInput!) {
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
            "text": buffer_text(data, platform),
            "channelId": channel_id,
            "schedulingType": "automatic",
            "mode": "customScheduled" if due else "addToQueue",
            "assets": {"images": [{"url": buffer_image_url(item, data)}]},
        }
    }
    if due:
        variables["input"]["dueAt"] = due

    result = graphql_request(mutation, token, variables)
    response = result.get("createPost") or {}
    if response.get("message"):
        raise RuntimeError(response["message"])
    post = response.get("post") or {}
    return post.get("id", "created")


def move_completed(item, inbox):
    posted_dir = inbox / "_posted"
    posted_dir.mkdir(parents=True, exist_ok=True)
    destination = posted_dir / item["path"].name
    if destination.exists():
        suffix = time.strftime("%Y%m%d%H%M%S")
        destination = posted_dir / f"{item['path'].stem}-{suffix}{item['path'].suffix}"

    shutil.move(str(item["path"]), str(destination))
    if item["kind"] == "file" and item["image"] and item["image"].exists():
        image_destination = posted_dir / item["image"].name
        if image_destination.exists():
            suffix = time.strftime("%Y%m%d%H%M%S")
            image_destination = posted_dir / f"{item['image'].stem}-{suffix}{item['image'].suffix}"
        shutil.move(str(item["image"]), str(image_destination))


def main():
    parser = argparse.ArgumentParser(description="Schedule Charcuterie Lab social posts in Buffer.")
    parser.add_argument("--platform", choices=sorted(PLATFORMS), required=True)
    parser.add_argument("--dry-run", action="store_true", help="Preview posts without scheduling.")
    parser.add_argument("--schedule-all", action="store_true", help="Schedule every queued file by filename date, including future dates.")
    parser.add_argument("--limit", "-limit", type=int, default=None)
    args = parser.parse_args()

    config = PLATFORMS[args.platform]
    inbox = config["inbox"]
    token = get_user_env("BUFFER_API_KEY")
    channel_id = get_user_env(config["channel_env"])
    messages = []

    queue = []
    for item in discover_queue_items(inbox):
        if not args.schedule_all and item["date"] > date.today():
            messages.append(f"Waiting {item['path'].name}: publish date is {item['date'].isoformat()}")
            continue
        queue.append(item)

    if not queue:
        messages.append(f"No {config['label']} posts found to process in {inbox}.")
        print("\n".join(messages))
        return

    if not token and not args.dry_run:
        raise RuntimeError("BUFFER_API_KEY is not set.")
    if not channel_id and not args.dry_run:
        raise RuntimeError(f"{config['channel_env']} is not set.")

    to_publish = queue[: args.limit] if args.limit else queue
    if not args.dry_run:
        messages.append(stage_public_images(to_publish))
        wait_for_public_images(to_publish, messages)

    scheduled_counts = {}
    published = 0
    for item in to_publish:
        data = load_post_data(item)
        item_due_at = None
        if args.schedule_all:
            index_for_date = scheduled_counts.get(item["date"], 0)
            scheduled_counts[item["date"]] = index_for_date + 1
            item_due_at = due_at(item, index_for_date, config)

        schedule_note = f" for {item_due_at}" if item_due_at else ""
        if args.dry_run:
            channel = channel_id or f"<set {config['channel_env']}>"
            messages.append(f"Buffer {config['label']}{schedule_note}: {item['path'].name}: {data['title']} -> channel {channel}")
            continue

        post_id = create_buffer_post(item, channel_id, token, args.platform, item_due_at)
        published += 1
        messages.append(f"Queued {item['path'].name} in Buffer {config['label']}{schedule_note}: post {post_id}")
        move_completed(item, inbox)

    if not args.dry_run:
        messages.append(f"Scheduled {published} {config['label']} post(s) in Buffer.")
    print("\n".join(messages))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
