"""Interactive setup — asks user for site config fields, saves to lazy-config.json."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

PROFILES_DIR = Path(__file__).parent / "niche-profiles"
TEMPLATE_PATH = Path(__file__).parent / "config-template.json"


def _discover_niches() -> dict[str, str]:
    """Read every .json in niche-profiles/ and return numbered menu mapping."""
    files = sorted(
        f for f in PROFILES_DIR.glob("*.json")
        if not f.name.startswith("_")
    )
    # generic.json always last
    files.sort(key=lambda f: (f.stem == "generic", f.stem))
    return {str(i + 1): f.stem for i, f in enumerate(files)}


def _ask(prompt: str, *, default: str | None = None, validate=None) -> str:
    suffix = f" [{default}]" if default else ""
    while True:
        answer = input(f"{prompt}{suffix}: ").strip()
        if not answer and default is not None:
            answer = default
        if not answer:
            print("  -> required, try again")
            continue
        if validate:
            error = validate(answer)
            if error:
                print(f"  -> {error}")
                continue
        return answer


def _ask_int(prompt: str, *, default: int | None = None, min_val: int | None = None) -> int:
    while True:
        raw = _ask(prompt, default=str(default) if default is not None else None)
        try:
            value = int(raw)
        except ValueError:
            print("  -> must be an integer")
            continue
        if min_val is not None and value < min_val:
            print(f"  -> must be >= {min_val}")
            continue
        return value


def _ask_float(prompt: str, *, default: float | None = None) -> float:
    while True:
        raw = _ask(prompt, default=str(default) if default is not None else None)
        try:
            return float(raw)
        except ValueError:
            print("  -> must be a number")


def _ask_yesno(prompt: str, *, default: bool = False) -> bool:
    default_str = "y" if default else "n"
    while True:
        raw = _ask(prompt + " (y/n)", default=default_str).lower()
        if raw in ("y", "yes"):
            return True
        if raw in ("n", "no"):
            return False
        print("  -> answer y or n")


def _validate_hex(value: str) -> str | None:
    if not re.fullmatch(r"#[0-9A-Fa-f]{3,8}", value):
        return "must be a hex color like #RRGGBB"
    return None


def _validate_phone(value: str) -> str | None:
    digits = re.sub(r"[^\d]", "", value)
    if len(digits) < 7:
        return "must include at least 7 digits"
    return None


def _validate_email(value: str) -> str | None:
    if "@" not in value or "." not in value.split("@")[-1]:
        return "must be a valid email"
    return None


def _validate_domain(value: str) -> str | None:
    if value.startswith("http"):
        return "domain only, no https://"
    if "." not in value:
        return "must include a TLD"
    return None


def _validate_year(value: str) -> str | None:
    try:
        year = int(value)
    except ValueError:
        return "must be a year"
    if not 1800 <= year <= 2099:
        return "year out of range"
    return None


def _print_niche_menu(niches: dict[str, str]) -> None:
    print("\nWhich niche is this site?")
    for key, niche in niches.items():
        print(f"  {key}) {niche}")
    print(f"  {len(niches) + 1}) other (custom — enter a slug)")


def _ask_niche() -> str:
    niches = _discover_niches()
    _print_niche_menu(niches)
    custom_key = str(len(niches) + 1)
    while True:
        raw = _ask(f"Choose 1-{custom_key}", default="1")
        if raw in niches:
            return niches[raw]
        if raw == custom_key:
            slug = _ask("Enter niche slug (lowercase-with-dashes)")
            print(f"  -> create niche-profiles/{slug}.json before re-running.")
            return slug
        print("  -> pick a number from the menu")


def _load_profile(niche: str) -> dict[str, Any]:
    path = PROFILES_DIR / f"{niche}.json"
    if not path.exists():
        path = PROFILES_DIR / "generic.json"
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _load_template() -> dict[str, Any]:
    with TEMPLATE_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def run_init(target_path: Path) -> dict[str, Any]:
    """Interactive prompt; writes the resulting config to target_path."""
    print("\nLazy Method — Initial Setup")
    print("=" * 60)
    print("Answer the questions below. Required fields cannot be skipped.")
    print()

    config = _load_template()

    niche = _ask_niche()
    profile = _load_profile(niche)

    site_name = _ask("Site name (e.g. 'Acme Marketing')")
    domain = _ask("Domain (no https://)", validate=_validate_domain)
    language = _ask("Language code (en-US, en-GB, en-CA, ...)", default="en-US")
    country = _ask("Country (ISO 2-letter)", default="US").upper()
    currency = _ask("Currency (USD, CAD, GBP, EUR, ...)", default="USD").upper()

    is_local = profile.get("is_local")
    if is_local is None:
        is_local = _ask_yesno("Is this a local business (has physical location / service area)?", default=True)

    email = _ask("Contact email", validate=_validate_email)
    phone = None
    address = None
    service_area = None
    if is_local:
        phone = _ask("Phone (e.g. +1-416-555-0100)", validate=_validate_phone)
        address = _ask("Address (City, Region, Country)")
        if profile.get("niche") in ("local-service", "marketing-agency"):
            service_area = _ask("Service area (e.g. 'Greater Toronto Area')", default=address)
    else:
        if _ask_yesno("Add a phone anyway?", default=False):
            phone = _ask("Phone", validate=_validate_phone)

    founded_year = _ask_int("Founded year", default=2024, min_val=1800)

    has_reviews = _ask_yesno("Do you have public reviews to display?", default=True)
    review_count = _ask_int("Review count (integer)", default=0, min_val=0) if has_reviews else 0
    rating = _ask_float("Rating 1.0-5.0", default=4.8) if has_reviews else 0

    primary_color = _ask("Primary brand color (hex)", validate=_validate_hex)
    secondary_color = _ask("Secondary brand color (hex)", validate=_validate_hex)
    font_family = _ask("Primary font family", default="Inter")

    config["site"].update({
        "name": site_name,
        "domain": domain,
        "language": language,
        "country": country,
        "currency": currency,
    })
    config["business"].update({
        "niche": niche,
        "is_local": is_local,
        "schema_type": profile.get("schema_type", "Organization"),
        "founded_year": founded_year,
        "review_count": review_count,
        "rating": rating,
    })
    config["contact"].update({
        "email": email,
        "phone": phone,
        "address": address,
        "service_area": service_area,
    })
    config["brand"].update({
        "primary_color": primary_color,
        "secondary_color": secondary_color,
        "font_family": font_family,
    })
    config["rules"]["required_schemas"] = profile.get("required_schemas", [])
    if profile.get("thresholds_override"):
        config["thresholds"].update(profile["thresholds_override"])
    config["niche_overrides"] = profile

    target_path.parent.mkdir(parents=True, exist_ok=True)
    with target_path.open("w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

    print()
    print(f"Configuration saved to {target_path}")
    print(f"Run: python lazy-method/lazy-check.py --config={target_path} <page.html>")
    return config


def fill_missing(config: dict[str, Any]) -> dict[str, Any]:
    """Top up nullable required fields without redoing the whole init."""
    updated = False

    site = config.setdefault("site", {})
    business = config.setdefault("business", {})
    contact = config.setdefault("contact", {})
    brand = config.setdefault("brand", {})

    print("\nLazy Method — Filling Missing Fields")
    print("=" * 60)

    if not site.get("name"):
        site["name"] = _ask("Site name")
        updated = True
    if not site.get("domain"):
        site["domain"] = _ask("Domain (no https://)", validate=_validate_domain)
        updated = True
    if not business.get("niche"):
        business["niche"] = _ask_niche()
        profile = _load_profile(business["niche"])
        business.setdefault("schema_type", profile.get("schema_type", "Organization"))
        config["niche_overrides"] = profile
        config.setdefault("rules", {})["required_schemas"] = profile.get("required_schemas", [])
        updated = True
    if not contact.get("email"):
        contact["email"] = _ask("Contact email", validate=_validate_email)
        updated = True
    if business.get("is_local") and not contact.get("phone"):
        contact["phone"] = _ask("Phone", validate=_validate_phone)
        updated = True
    if not brand.get("primary_color"):
        brand["primary_color"] = _ask("Primary brand color (hex)", validate=_validate_hex)
        updated = True
    if not brand.get("secondary_color"):
        brand["secondary_color"] = _ask("Secondary brand color (hex)", validate=_validate_hex)
        updated = True

    if updated:
        print("Done. Re-run lazy-check.")
    return config


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("lazy-config.json")
    run_init(target)
