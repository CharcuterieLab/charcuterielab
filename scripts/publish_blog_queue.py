import base64
import html
import os
import re
import shutil
import subprocess
import sys
import zipfile
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET

INBOX = Path(r"C:\Users\thill\OneDrive\Desktop\Charcuterie Lab\AAABlogPosts")
REPO = Path(__file__).resolve().parents[1]
SITE = REPO / "charcuterielab"
BLOG_DIR = SITE / "content" / "blog"
IMAGE_DIR = SITE / "public" / "images"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def run(args, *, cwd=REPO, check=True, capture=True):
    result = subprocess.run(
        args,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.STDOUT if capture else None,
    )
    if check and result.returncode != 0:
        output = result.stdout or ""
        raise RuntimeError(f"Command failed: {' '.join(args)}\n{output}")
    return result.stdout or ""


def slugify(value):
    value = value.lower()
    value = re.sub(r"[_\s]+", "-", value)
    value = re.sub(r"[^a-z0-9-]", "", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "post"


def title_from_slug(value):
    return " ".join(part.capitalize() for part in re.split(r"[-_\s]+", value) if part)


def parse_queue_name(path):
    match = re.match(r"^(\d{2})(\d{2})(\d{4})_(.+)$", path.stem)
    if not match:
        return None

    day, month, year, raw_name = match.groups()
    try:
      publish_date = date(int(year), int(month), int(day))
    except ValueError:
      return None

    return publish_date, raw_name


def frontmatter(markdown):
    match = re.match(r"^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$", markdown)
    data = {}
    body = markdown
    if match:
        body = match.group(2)
        for line in match.group(1).splitlines():
            pair = re.match(r"^([A-Za-z0-9_-]+):\s*\"?(.*?)\"?\s*$", line)
            if pair:
                data[pair.group(1)] = pair.group(2)
    return data, body


def write_frontmatter(data, body):
    order = ["title", "date", "image", "excerpt"]
    lines = ["---"]
    for key in order:
        value = data.get(key)
        if value is not None and value != "":
            lines.append(f'{key}: "{value}"')
    for key in sorted(k for k in data if k not in order):
        lines.append(f'{key}: "{data[key]}"')
    lines.append("---")
    lines.append("")
    lines.append(body.strip())
    lines.append("")
    return "\n".join(lines)


def excerpt_from_body(body):
    for block in re.split(r"\n\s*\n", body):
        clean = re.sub(r"^#+\s*", "", block.strip())
        clean = re.sub(r"!\[.*?\]\(.*?\)", "", clean)
        clean = re.sub(r"[*_`#>|-]", "", clean)
        clean = re.sub(r"\s+", " ", clean).strip()
        if clean:
            return clean[:157].rstrip() + ("..." if len(clean) > 157 else "")
    return "Fresh from the Charcuterie Lab."


def docx_to_markdown(path):
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    with zipfile.ZipFile(path) as docx:
        xml = docx.read("word/document.xml")
    root = ET.fromstring(xml)
    body = root.find("w:body", ns)
    blocks = []

    for child in list(body):
        tag = child.tag.rsplit("}", 1)[-1]
        if tag == "p":
            texts = [node.text for node in child.findall(".//w:t", ns) if node.text]
            text = "".join(texts).strip()
            if text:
                blocks.append(text)
        elif tag == "tbl":
            rows = []
            for tr in child.findall(".//w:tr", ns):
                cells = []
                for tc in tr.findall("w:tc", ns):
                    cell_text = " ".join(
                        node.text for node in tc.findall(".//w:t", ns) if node.text
                    ).strip()
                    cells.append(cell_text)
                if cells:
                    rows.append(cells)
            if rows:
                width = max(len(row) for row in rows)
                rows = [row + [""] * (width - len(row)) for row in rows]
                blocks.append("| " + " | ".join(rows[0]) + " |")
                blocks.append("| " + " | ".join("---" for _ in rows[0]) + " |")
                for row in rows[1:]:
                    blocks.append("| " + " | ".join(row) + " |")

    return "\n\n".join(blocks).strip()


def matching_image(files, publish_date, raw_name):
    prefix = publish_date.strftime("%d%m%Y") + "_"
    raw_slug = slugify(raw_name)
    candidates = []
    for file in files:
        if file.suffix.lower() not in IMAGE_EXTS:
            continue
        parsed = parse_queue_name(file)
        if not parsed:
            continue
        image_date, image_raw_name = parsed
        if image_date == publish_date and slugify(image_raw_name) == raw_slug:
            candidates.append(file)
    return sorted(candidates)[0] if candidates else None


def stage_post(post_path, all_files):
    parsed = parse_queue_name(post_path)
    if not parsed:
        return None, f"Skipped {post_path.name}: filename must start DDMMYYYY_"

    publish_date, raw_name = parsed
    if publish_date > date.today():
        return None, f"Waiting {post_path.name}: publish date is {publish_date.isoformat()}"

    slug = slugify(raw_name)
    if post_path.suffix.lower() == ".docx":
        markdown = docx_to_markdown(post_path)
    else:
        markdown = post_path.read_text(encoding="utf-8-sig")

    data, body = frontmatter(markdown)
    data.setdefault("title", title_from_slug(raw_name))
    data["date"] = publish_date.isoformat()
    data.setdefault("excerpt", excerpt_from_body(body))

    image = matching_image(all_files, publish_date, raw_name)
    if image:
        target_image_name = f"{slug}{image.suffix.lower()}"
        shutil.copy2(image, IMAGE_DIR / target_image_name)
        data["image"] = f"/images/{target_image_name}"

    target = BLOG_DIR / f"{slug}.md"
    target.write_text(write_frontmatter(data, body), encoding="utf-8")
    return target, f"Staged {target.relative_to(REPO)}"


def push_changes():
    run(["git", "add", "charcuterielab/content/blog", "charcuterielab/public/images"])
    status = run(["git", "status", "--short"]).strip()
    if not status:
        return "No Git changes to publish."

    run(["git", "commit", "-m", "Publish queued blog posts"])
    token = os.environ.get("CHARCUTERIE_GITHUB_TOKEN")
    if not token:
        raise RuntimeError("CHARCUTERIE_GITHUB_TOKEN is not set.")

    auth = base64.b64encode(f"x-access-token:{token}".encode("ascii")).decode("ascii")
    run(["git", "-c", f"http.extraheader=AUTHORIZATION: Basic {auth}", "push", "origin", "main"])
    return "Pushed queued blog posts to GitHub."


def main():
    if not INBOX.exists():
        raise RuntimeError(f"Blog inbox does not exist: {INBOX}")

    BLOG_DIR.mkdir(parents=True, exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    run(["git", "pull", "--ff-only", "origin", "main"])

    files = [path for path in INBOX.iterdir() if path.is_file()]
    post_files = [path for path in files if path.suffix.lower() in {".md", ".markdown", ".docx"}]

    messages = []
    staged = []
    for post in sorted(post_files):
        target, message = stage_post(post, files)
        messages.append(message)
        if target:
            staged.append(target)

    if staged:
        messages.append(push_changes())
    else:
        messages.append("No due posts found.")

    print("\n".join(messages))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {html.escape(str(exc))}", file=sys.stderr)
        sys.exit(1)
