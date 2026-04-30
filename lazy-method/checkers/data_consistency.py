"""Data Consistency — 15 parameters. Phone, NAP, year, rating, etc must match config."""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, text_of


def _digits(s: str) -> str:
    return re.sub(r"[^\d]", "", s or "")


def _phone_variants(phone_digits: str) -> set[str]:
    """Generate match variants. Handles missing/extra country code (e.g. +1)."""
    variants = {phone_digits}
    if phone_digits.startswith("1") and len(phone_digits) > 10:
        variants.add(phone_digits[1:])  # without leading 1
    elif len(phone_digits) == 10:
        variants.add("1" + phone_digits)
    return variants


class Checker(BaseChecker):
    name = "data_consistency"
    category_label = "Data Consistency"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        body_text = text_of(soup)
        text_digits = _digits(body_text)

        # Phone consistency
        cfg_phone = self.contact.get("phone") or ""
        cfg_phone_digits = _digits(cfg_phone)
        is_local = self.business.get("is_local", False)

        if cfg_phone_digits:
            variants = _phone_variants(cfg_phone_digits)
            count = max((text_digits.count(v) for v in variants), default=0)
            result.add(CheckResult(
                "phone_present",
                count >= 1,
                f"configured phone {cfg_phone} not found on page (variants tried: {variants})",
            ))
            # Multiple mentions desirable on local pages
            if is_local:
                result.add(CheckResult(
                    "phone_mentioned_multiple_times",
                    count >= 2,
                    f"phone appears {count}x (recommend 2+)",
                ))
            else:
                result.add(CheckResult("phone_mentioned_multiple_times", True, "n/a (non-local)"))

            # Find any other phone-like sequences and warn if they don't match
            phone_pattern = re.compile(r"\+?\d[\d\s().-]{8,}\d")
            mentions = phone_pattern.findall(body_text)
            inconsistent = []
            for m in mentions:
                d = _digits(m)
                if len(d) < 7:
                    continue
                if any(v in d or d in v for v in variants):
                    continue
                inconsistent.append(m)
            result.add(CheckResult(
                "no_other_phone_numbers",
                not inconsistent,
                f"found phone-like sequences not matching config: {inconsistent[:3]}",
            ))
        else:
            for p in ("phone_present", "phone_mentioned_multiple_times", "no_other_phone_numbers"):
                result.add(CheckResult(p, True, "n/a (no phone configured)"))

        # Email consistency
        cfg_email = (self.contact.get("email") or "").lower()
        if cfg_email:
            email_re = re.compile(r"[A-Za-z0-9_.+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9-.]+")
            mentions = {m.lower() for m in email_re.findall(html)}
            personal_emails = {e for e in mentions if not e.endswith(self.site.get("domain", ""))}
            domain_email_present = cfg_email in mentions or any(
                cfg_email in m for m in mentions
            )
            result.add(CheckResult(
                "configured_email_present_or_domain",
                domain_email_present or len(mentions) > 0,
                f"configured {cfg_email} not found and no domain email present",
            ))
            other_inconsistent = [
                e for e in mentions
                if e != cfg_email and not e.endswith(self.site.get("domain", ""))
            ]
            result.add(CheckResult(
                "no_third_party_emails",
                not other_inconsistent,
                f"found unrelated emails: {sorted(other_inconsistent)[:3]}",
            ))
        else:
            result.add(CheckResult("configured_email_present_or_domain", True, "n/a"))
            result.add(CheckResult("no_third_party_emails", True, "n/a"))

        # Year / founded — match full 4-digit year, not just leading 2 digits
        founded = self.business.get("founded_year")
        if founded:
            year_pattern = re.compile(r"\b(?:19|20)\d{2}\b")
            years_in_text = {int(y) for y in year_pattern.findall(body_text)}
            result.add(CheckResult(
                "founded_year_consistent",
                founded in years_in_text or not years_in_text,
                f"founded year {founded} not found among page years {sorted(years_in_text)}"
                if years_in_text and founded not in years_in_text else "ok",
            ))
        else:
            result.add(CheckResult("founded_year_consistent", True, "n/a"))

        # Review count consistency
        review_count = self.business.get("review_count") or 0
        if review_count > 0:
            review_re = re.compile(r"\b(\d{1,5})\s*(?:reviews?|ratings?|customers?)\b", re.I)
            mentions = [int(m.group(1)) for m in review_re.finditer(body_text)]
            mismatched = [m for m in mentions if abs(m - review_count) > max(5, review_count * 0.05)]
            result.add(CheckResult(
                "review_count_consistent",
                not mismatched,
                f"review counts in text differ from config {review_count}: {mismatched[:3]}",
            ))
        else:
            result.add(CheckResult("review_count_consistent", True, "n/a"))

        # Rating consistency
        rating = self.business.get("rating") or 0
        if rating > 0:
            rating_re = re.compile(r"\b([1-5](?:\.\d)?)\s*(?:/\s*5|stars?|★)", re.I)
            ratings_in_text = [float(m.group(1)) for m in rating_re.finditer(body_text)]
            mismatched = [r for r in ratings_in_text if abs(r - rating) > 0.15]
            result.add(CheckResult(
                "rating_consistent",
                not mismatched,
                f"ratings in text {ratings_in_text} differ from config {rating}",
            ))
        else:
            result.add(CheckResult("rating_consistent", True, "n/a"))

        # Address / city consistency
        address = self.contact.get("address") or ""
        if address and is_local:
            city = address.split(",")[0].strip()
            result.add(CheckResult(
                "city_in_address_present_on_page",
                city.lower() in body_text.lower(),
                f"city '{city}' not on page",
            ))
        else:
            result.add(CheckResult("city_in_address_present_on_page", True, "n/a"))

        # Domain canonical consistency
        canonical = soup.find("link", attrs={"rel": "canonical"})
        canonical_href = canonical.get("href", "") if canonical else ""
        domain = self.site.get("domain", "")
        result.add(CheckResult(
            "canonical_uses_configured_domain",
            not canonical_href or domain in canonical_href,
            f"canonical {canonical_href} does not contain {domain}",
        ))

        # OG image canonical
        og_url = soup.find("meta", attrs={"property": "og:url"})
        og_url_content = og_url.get("content", "") if og_url else ""
        result.add(CheckResult(
            "og_url_uses_configured_domain",
            not og_url_content or domain in og_url_content,
            f"og:url {og_url_content} does not contain {domain}",
        ))

        # No cross-link to forbidden domains
        forbidden = self.rules.get("no_cross_link_domains", []) or []
        cross_links = []
        for a in soup.find_all("a", href=True):
            for fd in forbidden:
                if fd in a["href"]:
                    cross_links.append(a["href"])
        result.add(CheckResult(
            "no_forbidden_cross_links",
            not cross_links,
            f"found forbidden cross-links: {cross_links[:3]}",
        ))

        # Site name appears
        site_name = self.site.get("name", "")
        result.add(CheckResult(
            "site_name_present",
            site_name.lower() in body_text.lower() if site_name else True,
            f"site name '{site_name}' missing",
        ))

        # Currency consistency (only if currency configured and prices appear)
        currency = self.site.get("currency")
        if currency:
            price_pattern = re.compile(r"[$€£¥]")
            symbols = set(price_pattern.findall(body_text))
            currency_symbol_map = {"USD": "$", "CAD": "$", "GBP": "£", "EUR": "€"}
            expected = currency_symbol_map.get(currency.upper(), "$")
            unexpected = symbols - {expected}
            result.add(CheckResult(
                "currency_symbols_consistent",
                not unexpected or not symbols,
                f"unexpected currency symbols on page: {sorted(unexpected)} (expected {expected})",
            ))
        else:
            result.add(CheckResult("currency_symbols_consistent", True, "n/a"))
