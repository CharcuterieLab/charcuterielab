"""
make-thumbs.py - small WebP copies of every site image, for cards and lists
============================================================================
Cards, related-post tiles and product thumbnails show images at 60-400 px, but
the originals are 1,000-2,000 px photos of 150-350 KB each. The build swaps in
these copies wherever an image is shown small, and uses the original only for
the big hero photo.

    py scripts/make-thumbs.py          (run from the charcuterielab folder)

Writes public/images/thumbs/<name>-<ext>-l.webp (1100 px wide, for hero photos on
phones), -m.webp (640 px) and -s.webp (240 px), plus manifest.json with the pixel size of every image, which
the build uses for width/height attributes. Only new or changed images are
processed, so re-running it is quick. Needs Pillow:  py -m pip install pillow

If you add an image and forget to run this, nothing breaks: the build falls
back to the original and prints which images have no thumbnail yet.
"""
import json
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is not installed. Run:  py -m pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "public" / "images"
THUMBS = IMAGES / "thumbs"
MANIFEST = THUMBS / "manifest.json"
EXTS = {".jpg", ".jpeg", ".png", ".webp"}
SIZES = {"l": (1100, 74), "m": (640, 72), "s": (240, 76)}
SKIP_DIRS = {"thumbs", "social"}


def url_for(p):
    return "/" + p.relative_to(ROOT / "public").as_posix()


def main():
    THUMBS.mkdir(parents=True, exist_ok=True)
    try:
        old = json.loads(MANIFEST.read_text(encoding="utf-8"))
    except Exception:
        old = {"size": {}, "thumbs": {}}
    manifest = {"size": {}, "thumbs": {}}
    made = kept = 0
    for src in sorted(IMAGES.rglob("*")):
        if not src.is_file() or src.suffix.lower() not in EXTS:
            continue
        rel = src.relative_to(IMAGES)
        if rel.parts[0] in SKIP_DIRS:
            continue
        url = url_for(src)
        mtime = src.stat().st_mtime
        variants = {}
        try:
            with Image.open(src) as im:
                w, h = im.size
                manifest["size"][url] = [w, h]
                for key, (width, quality) in SIZES.items():
                    if w <= width * 1.15:
                        continue
                    stem = rel.with_suffix("").as_posix().replace("/", "__")
                    out = THUMBS / f"{stem}-{src.suffix.lower().lstrip('.')}-{key}.webp"
                    turl = url_for(out)
                    if out.exists() and out.stat().st_mtime >= mtime:
                        kept += 1
                    else:
                        th = round(h * width / w)
                        frame = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
                        frame.resize((width, th), Image.LANCZOS).save(out, "WEBP", quality=quality, method=6)
                        made += 1
                    variants[key] = turl
                    manifest["size"][turl] = [width, round(h * width / w)]
        except Exception as e:
            print(f"  skipped {url}: {e}")
            continue
        if variants:
            manifest["thumbs"][url] = variants
    MANIFEST.write_text(json.dumps(manifest, indent=0, sort_keys=True), encoding="utf-8")
    total = sum(f.stat().st_size for f in THUMBS.glob("*.webp"))
    print(f"{made} thumbnails made, {kept} already up to date, "
          f"{len(manifest['size'])} images measured, thumbs folder {total / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
