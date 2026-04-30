"""Adaptive word count calibrator.

Pulls top-10 SERP results for one or more target keywords, filters out
aggregator domains (Reddit, Wikipedia, Forbes, etc.), measures average body
word count of the remaining (non-aggregator, real competitor) pages, and
writes `thresholds.word_count = [avg * 0.9, avg * 1.2]` into the site config.

This script does NOT call SERP APIs directly. It reads a JSON file produced
by the user's DataForSEO (or other SERP) tooling. The expected shape is:

    {
      "keyword": "seo agency toronto",
      "results": [
        {"url": "...", "domain": "...", "title": "...", "word_count": 1234},
        ...
      ]
    }

If `word_count` is missing, the script will try to fetch the page over HTTP
and count its body text.

Usage:
    python lazy-method/tune_word_count.py \\
        --config=boomy/lazy-config.json \\
        --serp-data=reports/serp/seo-agency-toronto.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup

DEFAULT_AGGREGATOR_DOMAINS: list[str] = [
    # generic Q&A / discussion
    "reddit.com", "quora.com", "stackoverflow.com", "stackexchange.com",
    "answers.yahoo.com", "answers.com",
    # encyclopedias / dictionaries
    "wikipedia.org", "wiktionary.org", "britannica.com", "merriam-webster.com",
    "dictionary.com",
    # video / social
    "youtube.com", "youtu.be", "tiktok.com", "twitter.com", "x.com",
    "facebook.com", "instagram.com", "linkedin.com", "pinterest.com",
    # major editorial that ranks like aggregators
    "forbes.com", "businessinsider.com", "huffpost.com", "medium.com",
    "techradar.com", "tomshardware.com", "cnet.com", "lifehacker.com",
    "msn.com", "yahoo.com", "buzzfeed.com",
    # listing / directory
    "yelp.com", "tripadvisor.com", "yellowpages.com", "angi.com",
    "homeadvisor.com", "houzz.com", "thumbtack.com", "bark.com",
    "zillow.com", "realtor.com", "trulia.com",
    "indeed.com", "glassdoor.com", "monster.com", "ziprecruiter.com",
    # shopping
    "amazon.com", "ebay.com", "etsy.com", "walmart.com",
    # AI / search engines
    "google.com", "bing.com", "duckduckgo.com",
]


def _domain_of(url: str) -> str:
    try:
        return urlparse(url).netloc.lower().lstrip("www.")
    except Exception:
        return ""


def _is_aggregator(domain: str, blacklist: set[str]) -> bool:
    return any(domain.endswith(b) for b in blacklist)


def _word_count_from_url(url: str) -> int | None:
    try:
        import urllib.request
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (LazyMethod tuner)"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  could not fetch {url}: {e}", file=sys.stderr)
        return None
    soup = BeautifulSoup(html, "lxml")
    body = soup.body or soup
    for tag in body.find_all(["script", "style", "noscript", "header", "footer", "nav"]):
        tag.decompose()
    text = re.sub(r"\s+", " ", body.get_text(" ").strip())
    return len(text.split())


def calibrate(
    serp_data_paths: list[Path],
    config: dict,
    aggregator_blacklist: set[str],
    fetch_missing: bool,
) -> tuple[int | None, dict]:
    counts: list[int] = []
    used_keywords: list[str] = []
    excluded: list[str] = []
    for serp_path in serp_data_paths:
        with serp_path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        keyword = data.get("keyword", str(serp_path))
        used_keywords.append(keyword)
        for entry in data.get("results", [])[:15]:
            url = entry.get("url") or ""
            domain = entry.get("domain") or _domain_of(url)
            if _is_aggregator(domain, aggregator_blacklist):
                excluded.append(domain)
                continue
            wc = entry.get("word_count")
            if wc is None and fetch_missing and url:
                wc = _word_count_from_url(url)
            if isinstance(wc, int) and wc > 0:
                counts.append(wc)
            if len(counts) >= 10:
                break
    if not counts:
        return None, {
            "keywords": used_keywords,
            "excluded_aggregators": excluded,
            "counted_pages": 0,
            "avg_word_count": None,
        }

    avg = int(sum(counts) / len(counts))
    config.setdefault("thresholds", {})["word_count"] = [int(avg * 0.9), int(avg * 1.2)]
    return avg, {
        "keywords": used_keywords,
        "excluded_aggregators": excluded,
        "counted_pages": len(counts),
        "individual_word_counts": counts,
        "avg_word_count": avg,
        "applied_thresholds": config["thresholds"]["word_count"],
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Calibrate Lazy Method word_count threshold from SERP data")
    parser.add_argument("--config", required=True, help="Path to lazy-config.json (will be modified in place)")
    parser.add_argument("--serp-data", action="append", required=True,
                        help="Path to SERP JSON file (can be given multiple times)")
    parser.add_argument("--fetch-missing", action="store_true",
                        help="If a SERP entry lacks word_count, fetch the URL")
    parser.add_argument("--extra-aggregators", default="",
                        help="Comma-separated list of extra domains to treat as aggregators")
    args = parser.parse_args(argv)

    config_path = Path(args.config)
    with config_path.open("r", encoding="utf-8") as f:
        config = json.load(f)

    blacklist = set(DEFAULT_AGGREGATOR_DOMAINS)
    if args.extra_aggregators:
        blacklist.update(d.strip().lower() for d in args.extra_aggregators.split(",") if d.strip())

    if "aggregator_blacklist" in config:
        blacklist.update(d.lower() for d in config["aggregator_blacklist"])

    serp_paths = [Path(p) for p in args.serp_data]
    avg, report = calibrate(serp_paths, config, blacklist, args.fetch_missing)

    if avg is None:
        print("ERROR: no usable competitor pages — every SERP result was filtered as aggregator or had no word count.")
        print(json.dumps(report, indent=2, ensure_ascii=False))
        return 2

    config["aggregator_blacklist"] = sorted(blacklist)
    with config_path.open("w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

    print("Calibrated word_count threshold from SERP data")
    print(json.dumps(report, indent=2, ensure_ascii=False))
    print(f"\nUpdated {config_path} -> thresholds.word_count = {config['thresholds']['word_count']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
