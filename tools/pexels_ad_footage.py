#!/usr/bin/env python3
"""Download portrait ad B-roll from the Pexels Video API.

Usage:
    export PEXELS_API_KEY=...        # never hard-code the key
    python3 tools/pexels_ad_footage.py [--out ~/Downloads/aidmax-ad-footage] [--dry-run]

For each keyword it picks 3 portrait clips (5-15 s, 1080p preferred), saves
them under <out>/<shot>/, saves a preview JPG next to each clip for manual
review, and writes <out>/credits.csv.

The face / logo / bank-UI rule is enforced only roughly (by the words in each
clip's Pexels slug), so look over the preview JPGs before using any clip.
"""

import argparse
import csv
import json
import os
import re
import sys
import urllib.parse
import urllib.request

SHOTS = {
    "01": ["house keys hand close up", "keys keychain"],
    "02": ["suburban house exterior", "for rent sign"],
    "03": ["calculator hand typing"],
    "04": ["phone notification"],
    "05": ["envelope documents", "counting cash hands"],
    "06": ["hand closing keys"],
}
PER_KEYWORD = 3
MIN_SEC, MAX_SEC = 5, 15

# Slug words that usually mean a visible face, a brand, or a real bank/app UI.
REJECT_WORDS = {
    "face", "faces", "smile", "smiling", "laughing", "selfie", "portrait",
    "looking", "talking", "couple", "family", "kid", "kids", "child",
    "children", "girl", "boy", "people", "crowd", "model", "posing",
    "apple", "iphone", "samsung", "logo", "brand", "bank", "banking",
    "app", "paypal", "venmo", "visa", "mastercard", "chase",
}

API = "https://api.pexels.com/videos/search"


def api_get(key, params):
    req = urllib.request.Request(
        f"{API}?{urllib.parse.urlencode(params)}",
        headers={"Authorization": key, "User-Agent": "aidmax-footage/1.0"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def slug_words(page_url):
    slug = page_url.rstrip("/").rsplit("/", 1)[-1]
    return set(re.split(r"[-_]+", slug.lower())) - {""}


def pick_file(video):
    """Prefer an exact portrait 1080x1920 mp4, then the closest to 1080 wide."""
    files = [
        f for f in video["video_files"]
        if f.get("file_type") == "video/mp4" and f.get("width") and f.get("height")
        and f["height"] > f["width"]
    ]
    if not files:
        return None
    return min(files, key=lambda f: (f["width"] != 1080, abs(f["width"] - 1080)))


def candidates(key, query):
    for page in (1, 2):
        data = api_get(key, {
            "query": query, "orientation": "portrait", "size": "medium",
            "per_page": 80, "page": page,
        })
        for v in data.get("videos", []):
            yield v
        if not data.get("next_page"):
            break


def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "aidmax-footage/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp, open(path, "wb") as fh:
        while chunk := resp.read(1 << 20):
            fh.write(chunk)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="~/Downloads/aidmax-ad-footage")
    ap.add_argument("--dry-run", action="store_true", help="list picks, download nothing")
    args = ap.parse_args()

    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        sys.exit("PEXELS_API_KEY is not set")
    out = os.path.expanduser(args.out)

    used_ids = set()
    rows = []
    for shot, keywords in SHOTS.items():
        shot_dir = os.path.join(out, shot)
        os.makedirs(shot_dir, exist_ok=True)
        for kw in keywords:
            picked = []
            for v in candidates(key, kw):
                if v["id"] in used_ids or not MIN_SEC <= v["duration"] <= MAX_SEC:
                    continue
                if slug_words(v["url"]) & REJECT_WORDS:
                    continue
                f = pick_file(v)
                if not f:
                    continue
                picked.append((v, f))
                used_ids.add(v["id"])
                if len(picked) == PER_KEYWORD:
                    break
            if len(picked) < PER_KEYWORD:
                print(f"[{shot}] '{kw}': only {len(picked)} clips passed the filters")

            kw_slug = re.sub(r"[^a-z0-9]+", "-", kw.lower()).strip("-")
            for i, (v, f) in enumerate(picked, 1):
                name = f"{shot}_{kw_slug}_{i}_{v['id']}_{f['width']}x{f['height']}.mp4"
                print(f"[{shot}] {name}  {v['duration']}s  {v['url']}")
                if not args.dry_run:
                    download(f["link"], os.path.join(shot_dir, name))
                    if v.get("image"):
                        download(v["image"], os.path.join(shot_dir, name[:-4] + "_preview.jpg"))
                rows.append({
                    "shot": shot,
                    "filename": name,
                    "pexels_url": v["url"],
                    "author": v["user"]["name"],
                    "author_url": v["user"]["url"],
                    "keyword": kw,
                    "duration_s": v["duration"],
                    "resolution": f"{f['width']}x{f['height']}",
                })

    with open(os.path.join(out, "credits.csv"), "w", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()) if rows else ["shot"])
        w.writeheader()
        w.writerows(rows)
    print(f"\n{len(rows)} clips -> {out}/credits.csv")


if __name__ == "__main__":
    main()
