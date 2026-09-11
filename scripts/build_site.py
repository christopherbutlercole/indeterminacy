from pathlib import Path
import json, shutil
ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
DIST = ROOT / "dist"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
if DIST.exists(): shutil.rmtree(DIST)
DIST.mkdir(parents=True)
for filename in ["index.html", "style.css", "app.js", "config.js"]:
    shutil.copy2(ROOT / filename, DIST / filename)
manifest = {}
if IMAGES.exists():
    for part_dir in sorted(p for p in IMAGES.iterdir() if p.is_dir()):
        groups = {}
        group_dirs = [p for p in part_dir.iterdir() if p.is_dir() and p.name.isdigit()]
        for group_dir in sorted(group_dirs, key=lambda p: int(p.name)):
            image_files = sorted(p for p in group_dir.iterdir() if p.is_file() and p.suffix.lower() in ALLOWED_EXTENSIONS and not p.name.startswith('.'))
            if image_files:
                groups[group_dir.name] = [f"images/{part_dir.name}/{group_dir.name}/{p.name}" for p in image_files]
        if groups: manifest[part_dir.name] = groups
shutil.copytree(IMAGES, DIST / "images")
(DIST / "manifest.js").write_text("window.IMAGE_MANIFEST = " + json.dumps(manifest, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
(DIST / ".nojekyll").write_text("", encoding="utf-8")
print(json.dumps(manifest, indent=2, ensure_ascii=False))
