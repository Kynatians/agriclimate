#!/usr/bin/env python3
"""
scripts/ingest/fetch_firms.py
Queries NASA FIRMS API for VIIRS 375m active fire & thermal detections in Kurigram.
Requires free FIRMS MAP_KEY.
"""

import os
import sys
import json
import urllib.request

KURIGRAM_BBOX = "89.5,25.6,89.9,26.05"

def main():
    map_key = os.environ.get("FIRMS_MAP_KEY")
    if not map_key or map_key == "your_firms_map_key_here":
        print("Note: FIRMS_MAP_KEY not set in environment. Skipping remote FIRMS fetch.")
        return

    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{map_key}/VIIRS_SNPP_NRT/{KURIGRAM_BBOX}/2"
    print(f"Querying NASA FIRMS for Kurigram bbox [{KURIGRAM_BBOX}]...")

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AgriClimate-Ingest/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                csv_data = resp.read().decode("utf-8")
                root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                out_dir = os.path.join(root_dir, "data", "live")
                os.makedirs(out_dir, exist_ok=True)
                out_file = os.path.join(out_dir, "raw-firms.csv")
                with open(out_file, "w", encoding="utf-8") as f:
                    f.write(csv_data)
                print(f"FIRMS detections saved to {out_file}")
    except Exception as e:
        print(f"FIRMS fetch warning: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
