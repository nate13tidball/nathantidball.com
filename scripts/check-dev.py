#!/usr/bin/env python3
"""Check development page links; optionally smoke-test the public DZI tiles."""
import argparse
import math
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import urlsplit
from urllib.request import urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.links = []
        self.ids = set()
        self.robots = ""
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ("href", "src"):
            if key in attrs:
                self.links.append(attrs[key])
        if "id" in attrs:
            assert attrs["id"] not in self.ids, f"Duplicate ID: {attrs['id']}"
            self.ids.add(attrs["id"])
        if tag == "meta" and attrs.get("name") == "robots":
            self.robots = attrs.get("content", "")


def local_target(link, page):
    parsed = urlsplit(link)
    if parsed.scheme or parsed.netloc:
        return None
    target = (ROOT / parsed.path.lstrip("/")) if parsed.path.startswith("/") else page.parent / parsed.path
    if target.is_dir():
        target /= "index.html"
    return target.resolve()


def check_pages():
    pages = list((ROOT / "dev").rglob("*.html"))
    for path in pages:
        page = Page(path)
        assert "noindex" in page.robots and "nofollow" in page.robots, path
        for link in page.links:
            target = local_target(link, path)
            if target is not None:
                assert target.is_file(), f"Broken link in {path}: {link}"
                fragment = urlsplit(link).fragment
                if fragment and target.suffix == ".html":
                    assert fragment in Page(target).ids, f"Missing anchor: {link}"
    directory = ROOT / "dev/index.html"
    listed = {local_target(link, directory) for link in Page(directory).links}
    experiments = set(pages) | set((ROOT / "ui").rglob("*.html")) | set((ROOT / "web-templates").rglob("*.html"))
    assert experiments - {directory} <= listed, "A development page is missing from /dev/"
    for public_file in ("index.html", "sitemap.xml"):
        assert "/dev/" not in (ROOT / public_file).read_text(), "Dev link leaked into public navigation/sitemap"
    print(f"PASS: {len(pages)} dev pages, all local assets/anchors, {len(experiments) - 1} directory entries")


def fetch(url):
    with urlopen(url, timeout=20) as response:
        assert response.status == 200, url
        assert response.headers.get("Access-Control-Allow-Origin") == "*", f"Demo CORS missing: {url}"
        data = response.read(2_000_001)
        assert len(data) <= 2_000_000, f"Unexpectedly large tile/descriptor: {url}"
        return data


def check_remote():
    script = (ROOT / "dev/artwork/viewer.js").read_text()
    source = re.search(r'const tileSource = "([^"]+)";', script).group(1)
    image = ET.fromstring(fetch(source))
    size = image.find("{http://schemas.microsoft.com/deepzoom/2008}Size")
    width, height = int(size.attrib["Width"]), int(size.attrib["Height"])
    assert (width, height) == (13920, 10200), "Update demo labels for changed source dimensions"
    tile_size = int(image.attrib["TileSize"])
    top = math.ceil(math.log2(max(width, height)))
    samples = [(9, 0, 0), (top, width // tile_size // 2, height // tile_size // 2),
               (top, (width - 1) // tile_size, (height - 1) // tile_size)]
    total = 0
    for level, x, y in samples:
        url = source.removesuffix(".dzi") + f"_files/{level}/{x}_{y}.{image.attrib['Format']}"
        data = fetch(url)
        assert data.startswith(b"\xff\xd8") and data.endswith(b"\xff\xd9"), f"Not a complete JPEG: {url}"
        total += len(data)
    print(f"PASS: {width:,} × {height:,} DZI; overview, center, edge JPEGs; CORS; {total:,} sampled tile bytes")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--remote", action="store_true", help="Also fetch sample metadata and three tiles")
    args = parser.parse_args()
    check_pages()
    if args.remote:
        check_remote()
