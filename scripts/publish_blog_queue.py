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
try:
    import winreg
except ImportError:
    winreg = None

INBOX = Path(r"C:\Users\thill\OneDrive\Desktop\Charcuterie Lab\AAABlogPosts")
REPO = Path(__file__).resolve().parents[1]
SITE = REPO / "charcuterielab"
BLOG_DIR = SITE / "content" / "blog"
IMAGE_DIR = SITE / "public" / "images"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def is_post_file(path):
    name = path.name.lower()
    return (
        path.suffix.lower() in {".md", ".markdown", ".docx"}
        or name.endswith(".md.txt")
        or name.endswith(".md.md")
    )


def no_git_mode():
    return os.environ.get("CHARCUTERIE_NO_GIT", "").strip().lower() in {"1", "true", "yes", "on"}


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
    raw_name = re.sub(r"(\.md|\.markdown|\.docx|\.txt)$", "", raw_name, flags=re.IGNORECASE)
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


def normalize_body(body):
    lines = [line.rstrip() for line in body.splitlines()]
    if not lines:
        return body.strip()

    has_markdown = any(
        line.lstrip().startswith(("#", "-", "*", "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9."))
        for line in lines
    )
    if has_markdown:
        return body.strip()

    normalized = []
    first_title_done = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            normalized.append("")
            continue
        if not first_title_done:
            normalized.append(f"# {stripped}")
            first_title_done = True
            continue
        if stripped.endswith(":") and len(stripped) < 80:
            normalized.append(f"## {stripped[:-1]}")
            continue
        if stripped.startswith("///"):
            normalized.append("")
            continue
        bullet_match = re.match(r"^[â€¢●•-]\s*(.+)$", stripped)
        if bullet_match:
            normalized.append(f"- {bullet_match.group(1)}")
            continue
        normalized.append(stripped)

    return "\n\n".join(part for part in normalized if part is not None).strip()


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
    raw_slug = slugify(raw_name)
    image_prefix_slug = slugify(f"Image_{raw_name}")
    candidates = []
    for file in files:
        if file.suffix.lower() not in IMAGE_EXTS:
            continue

        file_slug = slugify(file.stem)
        if file_slug == image_prefix_slug:
            candidates.append(file)
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
        try:
            markdown = docx_to_markdown(post_path)
        except (KeyError, zipfile.BadZipFile) as exc:
            return None, f"Skipped {post_path.name}: could not read DOCX content ({exc})"
    else:
        markdown = post_path.read_text(encoding="utf-8-sig")

    data, body = frontmatter(markdown)
    body = normalize_body(body)
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
    if no_git_mode():
        return "Skipped Git publish steps because CHARCUTERIE_NO_GIT is enabled."

    branch_status = run(["git", "status", "--short", "--branch"]).strip().splitlines()
    if branch_status and "[ahead " in branch_status[0]:
        token = get_github_token()
        if not token:
            return "Skipped Git push: CHARCUTERIE_GITHUB_TOKEN is not set."
        auth = base64.b64encode(f"x-access-token:{token}".encode("ascii")).decode("ascii")
        run(["git", "-c", f"http.extraheader=AUTHORIZATION: Basic {auth}", "push", "origin", "main"])
        return "Pushed existing local Git commit to GitHub."

    run(["git", "add", "charcuterielab/content/blog", "charcuterielab/public/images"])
    status = run(["git", "status", "--short"]).strip()
    if not status:
        return "No Git changes to publish."

    run(["git", "commit", "-m", "Publish queued blog posts"])
    token = get_github_token()
    if not token:
        raise RuntimeError(
            "CHARCUTERIE_GITHUB_TOKEN is not set to a real GitHub token. "
            "Create a fine-grained token with Contents read/write and store it with setx."
        )

    auth = base64.b64encode(f"x-access-token:{token}".encode("ascii")).decode("ascii")
    run(["git", "-c", f"http.extraheader=AUTHORIZATION: Basic {auth}", "push", "origin", "main"])
    return "Pushed queued blog posts to GitHub."


def get_github_token():
    token = os.environ.get("CHARCUTERIE_GITHUB_TOKEN")
    if token and token != "PASTE_TOKEN_HERE":
        return token

    if winreg is None:
        return None

    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as key:
            value, _ = winreg.QueryValueEx(key, "CHARCUTERIE_GITHUB_TOKEN")
            if value and value != "PASTE_TOKEN_HERE":
                return value
            return None
    except OSError:
        return None


def main():
    if not INBOX.exists():
        raise RuntimeError(f"Blog inbox does not exist: {INBOX}")

    BLOG_DIR.mkdir(parents=True, exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    messages = []
    if no_git_mode():
        messages.append("Local mode enabled: skipping git pull, commit, and push.")
    else:
        try:
            run(["git", "pull", "--ff-only", "origin", "main"])
        except RuntimeError as exc:
            message = str(exc)
            if ".git/FETCH_HEAD" in message and "Permission denied" in message:
                messages.append(
                    "Warning: skipped git pull because .git/FETCH_HEAD is not writable; continuing with local queue files."
                )
            else:
                raise

    files = [path for path in INBOX.iterdir() if path.is_file()]
    post_files = [path for path in files if is_post_file(path)]

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
