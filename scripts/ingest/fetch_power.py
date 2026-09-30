#!/usr/bin/env python3
"""
scripts/ingest/fetch_power.py
Queries NASA POWER Agroclimatology REST API for the 12 Kurigram pilot block centroids.
Zero credentials required.
"""

import json
import math
import os
import sys
import time
from datetime import datetime, timedelta
from urllib.request import Request, urlopen
from urllib.error import URLError

POWER_BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

def to_power_date(dt: datetime) -> str:
    return dt.strftime("%Y%m%d")

def fetch_point(lon: float, lat: float, days_back: int = 30):
    now = datetime.utcnow()
    end_dt = now - timedelta(days=1)
    start_dt = end_dt - timedelta(days=days_back)

    params = {
        "parameters": "T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN,RH2M,WS2M",
        "community": "AG",
        "longitude": f"{lon:.4f}",
        "latitude": f"{lat:.4f}",
        "start": to_power_date(start_dt),
        "end": to_power_date(end_dt),
        "format": "JSON",
    }
    query_str = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"{POWER_BASE_URL}?{query_str}"

    req = Request(url, headers={"User-Agent": "AgriClimate-Ingest/1.0"})
    try:
        with urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                return json.loads(resp.read().decode("utf-8"))
    except URLError as e:
        print(f"Error fetching POWER data for [{lon}, {lat}]: {e}", file=sys.stderr)
    return None

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    blocks_path = os.path.join(root_dir, "data", "generated", "blocks.json")

    if not os.path.exists(blocks_path):
        print(f"Blocks file not found at {blocks_path}", file=sys.stderr)
        sys.exit(1)

    with open(blocks_path, "r", encoding="utf-8") as f:
        blocks = json.load(f)

    print(f"Starting NASA POWER ingestion for {len(blocks)} Kurigram monitoring blocks...")
    results = {}

    for blk in blocks:
        blk_id = blk["id"]
        lon, lat = blk["centroid"]
        print(f"Fetching {blk['name']} ({blk_id}) at [{lon}, {lat}]...")
        data = fetch_point(lon, lat, days_back=30)
        if data:
            results[blk_id] = data
        time.sleep(0.5) # Courtesy backoff for NASA POWER servers

    out_dir = os.path.join(root_dir, "data", "live")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "raw-power.json")

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"NASA POWER raw data saved to {out_file} ({len(results)}/{len(blocks)} blocks successfully retrieved)")

if __name__ == "__main__":
    main()
