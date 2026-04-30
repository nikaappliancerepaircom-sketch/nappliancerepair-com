"""Lazy Method master runner.

Usage:
    python lazy-method/lazy-check.py --init --config=site/lazy-config.json
    python lazy-method/lazy-check.py --config=site/lazy-config.json page.html
    python lazy-method/lazy-check.py --config=site/lazy-config.json --site=site/
    python lazy-method/lazy-check.py --config=site/lazy-config.json --categories=seo,schema page.html
"""

from __future__ import annotations

import argparse
import hashlib
import importlib
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from interactive_setup import fill_missing, run_init  # noqa: E402
from niche_detector import detect as detect_niche  # noqa: E402

CHECKER_MODULES: list[tuple[str, str, str]] = [
    ("seo", "checkers.seo_checker", "SEO Optimization"),
    ("seo_advanced", "checkers.seo_advanced_checker", "SEO Advanced (2026)"),
    ("responsive", "checkers.responsive_checker", "Responsive Design"),
    ("cross_browser", "checkers.cross_browser_checker", "Cross-Browser"),
    ("visual", "checkers.visual_checker", "Visual Design"),
    ("accessibility", "checkers.accessibility_checker", "Accessibility"),
    ("content", "checkers.content_checker", "Content Quality"),
    ("cro", "checkers.cro_checker", "CRO"),
    ("psychology", "checkers.psychology_checker", "Psychology"),
    ("data_consistency", "checkers.data_consistency", "Data Consistency"),
    ("conversion_design", "checkers.conversion_design", "Conversion Design"),
    ("eeat", "checkers.eeat_checker", "E-E-A-T Signals"),
    ("geo_ai", "checkers.geo_ai_checker", "GEO / AI Citations"),
    ("schema", "checkers.schema_checker", "Schema.org 2026"),
    ("brand", "checkers.brand_consistency", "Brand Consistency"),
    ("internal_linking", "checkers.internal_linking", "Internal Linking"),
    ("niche_compliance", "checkers.niche_compliance", "Niche Compliance"),
]

REQUIRED_FIELDS = [
    ("site.name", lambda c: c.get("site", {}).get("name")),
    ("site.domain", lambda c: c.get("site", {}).get("domain")),
    ("business.niche", lambda c: c.get("business", {}).get("niche")),
    ("business.schema_type", lambda c: c.get("business", {}).get("schema_type")),
    ("business.founded_year", lambda c: c.get("business", {}).get("founded_year")),
    ("contact.email", lambda c: c.get("contact", {}).get("email")),
    ("brand.primary_color", lambda c: c.get("brand", {}).get("primary_color")),
    ("brand.secondary_color", lambda c: c.get("brand", {}).get("secondary_color")),
]


def load_config(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_config(config: dict[str, Any], path: Path) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


def validate_config(config: dict[str, Any]) -> list[str]:
    missing = []
    for field, getter in REQUIRED_FIELDS:
        value = getter(config)
        if value in (None, "", []):
            missing.append(field)
    if config.get("business", {}).get("is_local") and not config.get("contact", {}).get("phone"):
        missing.append("contact.phone (required for is_local sites)")
    return missing


def discover_pages(site_dir: Path) -> list[Path]:
    pages: list[Path] = []
    for p in site_dir.rglob("*.html"):
        if any(part.startswith(".") for part in p.parts):
            continue
        if "node_modules" in p.parts or "dist" in p.parts and "/dist/" in str(p):
            continue
        pages.append(p)
    return sorted(pages)


def load_checkers(category_filter: list[str] | None) -> list[tuple[str, str, Any]]:
    loaded = []
    for name, module_path, label in CHECKER_MODULES:
        if category_filter and name not in category_filter:
            continue
        try:
            module = importlib.import_module(module_path)
        except ImportError as e:
            print(f"  warn: skip {name} (cannot import: {e})", file=sys.stderr)
            continue
        cls = getattr(module, "Checker", None)
        if cls is None:
            print(f"  warn: skip {name} (no Checker class in {module_path})", file=sys.stderr)
            continue
        loaded.append((name, label, cls))
    return loaded


def _apply_detected_niche(config: dict[str, Any], detection) -> dict[str, Any]:
    """If config niche is generic OR autodetect=true, override with detection result.
    Always returns a (possibly cloned) config with niche_overrides applied."""
    cfg = dict(config)
    cfg["business"] = dict(config.get("business", {}))
    if config.get("autodetect_niche") or cfg["business"].get("niche") in (None, "", "generic", "auto"):
        cfg["business"]["niche"] = detection.niche
        cfg["business"]["_niche_confidence"] = round(detection.confidence, 2)
        # Try to load matching profile
        profile_path = ROOT / "niche-profiles" / f"{detection.niche}.json"
        if profile_path.exists():
            with profile_path.open("r", encoding="utf-8") as f:
                profile = json.load(f)
            cfg["niche_overrides"] = profile
            if profile.get("required_schemas"):
                cfg.setdefault("rules", {})["required_schemas"] = profile["required_schemas"]
            if profile.get("thresholds_override"):
                cfg.setdefault("thresholds", {}).update(profile["thresholds_override"])
            if profile.get("schema_type"):
                cfg["business"]["schema_type"] = profile["schema_type"]
            if profile.get("is_local") is not None and cfg["business"].get("is_local") is None:
                cfg["business"]["is_local"] = profile["is_local"]
    return cfg


def check_page(
    page_path: Path,
    config: dict[str, Any],
    checkers: list[tuple[str, str, Any]],
) -> dict[str, Any]:
    html = page_path.read_text(encoding="utf-8", errors="replace")
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "lxml")

    detection = detect_niche(soup, html, page_path)
    page_config = _apply_detected_niche(config, detection)

    page_result = {
        "page": str(page_path),
        "detected_niche": detection.niche,
        "detection_confidence": round(detection.confidence, 2),
        "detection_signals": detection.signals,
        "categories": [],
        "total_params": 0,
        "passed_params": 0,
        "is_passing": True,
    }
    for name, label, cls in checkers:
        instance = cls(page_config)
        instance.name = name
        instance.category_label = label
        category = instance.run(html, page_path)
        page_result["categories"].append(category.to_dict())
        page_result["total_params"] += category.total
        page_result["passed_params"] += category.passed
        if not category.is_passing:
            page_result["is_passing"] = False
    return page_result


def render_page_report(report: dict[str, Any]) -> str:
    lines = []
    icon = "OK" if report["is_passing"] else "FAIL"
    niche = report.get("detected_niche", "?")
    conf = report.get("detection_confidence", 0)
    lines.append(
        f"{icon}  {report['page']}  ({report['passed_params']}/{report['total_params']})  "
        f"[niche: {niche} @ {conf:.0%}]"
    )
    for cat in report["categories"]:
        cat_icon = "PASS" if cat["is_passing"] else "FAIL"
        lines.append(f"  [{cat_icon}] {cat['category']:<22}  {cat['passed']}/{cat['total']}")
        if not cat["is_passing"]:
            for chk in cat["checks"]:
                if chk["passed"]:
                    continue
                detail = chk["details"] or ""
                loc = f" @ {chk['location']}" if chk["location"] else ""
                lines.append(f"        - {chk['param']}: {detail}{loc}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Lazy Method 313-parameter page audit")
    parser.add_argument("page", nargs="*", help="HTML file(s) to audit")
    parser.add_argument("--config", required=False, help="Path to lazy-config.json")
    parser.add_argument("--site", help="Audit every .html under this directory")
    parser.add_argument("--init", action="store_true", help="Run interactive setup, write config, exit")
    parser.add_argument("--fill-missing", action="store_true", help="Prompt for missing required fields and save")
    parser.add_argument(
        "--categories",
        help="Comma-separated list, e.g. seo,schema,eeat. Default: all 15.",
    )
    parser.add_argument("--ci", action="store_true", help="Quiet output, exit 1 on any failure")
    parser.add_argument("--report", help="Write JSON report to this path")
    args = parser.parse_args(argv)

    if args.init:
        target = Path(args.config or "lazy-config.json")
        run_init(target)
        return 0

    if not args.config:
        print("ERROR: --config is required (or use --init).", file=sys.stderr)
        return 2

    config_path = Path(args.config)
    if not config_path.exists():
        print(f"ERROR: config not found: {config_path}", file=sys.stderr)
        print("Run with --init to create one.", file=sys.stderr)
        return 2

    config = load_config(config_path)

    missing = validate_config(config)
    if missing and args.fill_missing:
        config = fill_missing(config)
        save_config(config, config_path)
        missing = validate_config(config)

    if missing:
        print("ERROR: Missing required config fields:", file=sys.stderr)
        for field in missing:
            print(f"  - {field}", file=sys.stderr)
        print("Re-run with --fill-missing or --init to provide them.", file=sys.stderr)
        return 2

    if args.page:
        targets = [Path(p) for p in args.page]
    elif args.site:
        targets = discover_pages(Path(args.site))
        if not targets:
            print(f"ERROR: no .html under {args.site}", file=sys.stderr)
            return 2
    else:
        print("ERROR: provide a page argument or --site=DIR", file=sys.stderr)
        return 2

    category_filter = [c.strip() for c in args.categories.split(",")] if args.categories else None
    checkers = load_checkers(category_filter)
    if not checkers:
        print("ERROR: no checkers loaded.", file=sys.stderr)
        return 2

    reports = []
    failed_count = 0
    page_text_hashes: dict[str, list[str]] = {}
    sentence_to_pages: dict[str, list[str]] = {}

    def _extract_long_sentences(html_text: str) -> list[str]:
        from bs4 import BeautifulSoup as _BS
        s = _BS(html_text, "lxml")
        body = s.body or s
        for t in body.find_all(["script", "style", "noscript"]):
            t.decompose()
        sentences = re.split(r"(?<=[.!?])\s+", body.get_text(" ", strip=True))
        return [sent for sent in sentences if len(sent.split()) >= 8]

    for page in targets:
        if not page.exists():
            print(f"  skip: {page} (not found)", file=sys.stderr)
            continue
        report = check_page(page, config, checkers)
        reports.append(report)
        if not report["is_passing"]:
            failed_count += 1
        if not args.ci:
            print(render_page_report(report))
            print()

        # Cross-page deduplication tracking (only when --site is used or multiple pages)
        try:
            html_text = page.read_text(encoding="utf-8", errors="replace")
            content_hash = hashlib.sha1(re.sub(r"\s+", " ", html_text).encode()).hexdigest()
            page_text_hashes.setdefault(content_hash, []).append(str(page))
            for sent in _extract_long_sentences(html_text):
                key = sent.lower().strip()
                pages_with = sentence_to_pages.setdefault(key, [])
                if str(page) not in pages_with:
                    pages_with.append(str(page))
        except Exception:
            pass

    # Cross-page duplicate detection: pages with identical content hash, and
    # sentences shared by 3+ pages (template boilerplate likely; >5 = thin content risk).
    duplicate_pages = {h: pages for h, pages in page_text_hashes.items() if len(pages) >= 2}
    cross_page_dup_sentences = {
        sent: pages for sent, pages in sentence_to_pages.items()
        if len(pages) >= max(3, int(len(reports) * 0.4))
    }

    if duplicate_pages and not args.ci:
        print("\n!!  Cross-page duplicate content detected:")
        for h, pages in duplicate_pages.items():
            print(f"  hash {h[:8]} appears in {len(pages)} pages: {pages[:3]}")

    if cross_page_dup_sentences and not args.ci:
        print(f"\n!!  {len(cross_page_dup_sentences)} sentence(s) shared across many pages "
              f"(possible thin content / boilerplate)")

    if duplicate_pages or len(cross_page_dup_sentences) > 50:
        # Mark as failure on the cross-page dimension
        if duplicate_pages:
            failed_count += len(duplicate_pages)

    summary = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "config_path": str(config_path),
        "total_pages": len(reports),
        "passing_pages": len(reports) - failed_count,
        "failing_pages": failed_count,
        "cross_page": {
            "duplicate_page_groups": [
                {"hash": h, "pages": p} for h, p in duplicate_pages.items()
            ],
            "shared_sentences_count": len(cross_page_dup_sentences),
        },
        "reports": reports,
    }

    if args.report:
        Path(args.report).write_text(
            json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8"
        )

    reports_dir = ROOT / "reports"
    reports_dir.mkdir(exist_ok=True)
    auto_report = reports_dir / f"{datetime.utcnow().strftime('%Y-%m-%d-%H%M')}.json"
    auto_report.write_text(
        json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    print(
        f"\nSUMMARY: {summary['passing_pages']}/{summary['total_pages']} pages passing"
        f"  (report: {auto_report})"
    )
    return 1 if failed_count else 0


if __name__ == "__main__":
    sys.exit(main())
