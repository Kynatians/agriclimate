#!/usr/bin/env python3
"""
scripts/ingest/fetch_landsat_stac.py
Queries Microsoft Planetary Computer STAC API for Landsat 8/9 Collection 2 Level 2 scenes.
Zero authentication required.
"""

import json
import os
import sys
import urllib.request

STAC_ENDPOINT = "https://planetarycomputer.microsoft.com/api/stac/v1/search"
KURIGRAM_BBOX = [89.5, 25.6, 89.9, 26.05]

def search_landsat():
    payload = {
        "collections": ["landsat-c2-l2"],
        "bbox": KURIGRAM_BBOX,
        "limit": 5,
        "query": {
            "eo:cloud_cover": {"lt": 25}
        }
    }

    req = urllib.request.Request(
        STAC_ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "AgriClimate-Ingest/1.0"}
    )

    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                return data
    except Exception as e:
        print(f"STAC search warning: {e}", file=sys.stderr)
    return None

def main():
    print(f"Searching Landsat 8/9 scenes covering Kurigram District...")
    data = search_landsat()

    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    out_dir = os.path.join(root_dir, "data", "live")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "raw-landsat-stac.json")

    if data:
        items = data.get("features", [])
        print(f"Found {len(items)} recent low-cloud Landsat scenes for Kurigram.")
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"Scene metadata saved to {out_file}")
    else:
        print("No STAC scenes returned or connection timed out.")

if __name__ == "__main__":
    main()
