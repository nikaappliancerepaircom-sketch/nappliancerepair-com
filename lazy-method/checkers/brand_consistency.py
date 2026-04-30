"""Brand Consistency — 10 parameters. Reads expected values from config (universal)."""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, gather_styles, text_of


HEX_RE = re.compile(r"#[0-9A-Fa-f]{3,8}")


def _normalize_hex(value: str) -> str:
    v = value.lower()
    if len(v) == 4:  # #abc -> #aabbcc
        v = "#" + "".join(c * 2 for c in v[1:])
    return v


def _all_hex(text: str) -> set[str]:
    return {_normalize_hex(m) for m in HEX_RE.findall(text)}


class Checker(BaseChecker):
    name = "brand"
    category_label = "Brand Consistency"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        body_text = text_of(soup)
        body_lower = body_text.lower()

        site_name = (self.site.get("name") or "").strip()
        primary = _normalize_hex(self.brand.get("primary_color", "")) if self.brand.get("primary_color") else ""
        secondary = _normalize_hex(self.brand.get("secondary_color", "")) if self.brand.get("secondary_color") else ""
        font_family = (self.brand.get("font_family") or "").lower()
        domain = self.site.get("domain", "")
        language = (self.site.get("language") or "").lower()

        result.add(CheckResult(
            "site_name_present",
            site_name.lower() in body_lower if site_name else False,
            f"site name '{site_name}' not in page text",
        ))

        title_tag = soup.find("title")
        title_text = title_tag.get_text(strip=True) if title_tag else ""
        result.add(CheckResult(
            "site_name_in_title",
            site_name.lower() in title_text.lower() if site_name else False,
            f"site name not in title: '{title_text}'",
        ))

        styles = gather_styles(soup, page_path)
        combined = (html + "\n" + styles).lower()
        all_hex = _all_hex(combined)
        result.add(CheckResult(
            "primary_color_used",
            primary in all_hex if primary else False,
            f"primary color {primary} not found in page or linked CSS",
        ))
        result.add(CheckResult(
            "secondary_color_used",
            secondary in all_hex if secondary else False,
            f"secondary color {secondary} not found in page or linked CSS",
        ))

        if font_family:
            font_present = font_family in combined
            result.add(CheckResult(
                "primary_font_referenced",
                font_present,
                f"font family '{font_family}' not referenced",
            ))
        else:
            result.add(CheckResult("primary_font_referenced", True, "n/a (no font configured)"))

        # Logo: <img alt~=site_name> OR brand class
        logo_imgs = [
            img for img in soup.find_all("img")
            if site_name.lower() in (img.get("alt") or "").lower()
        ]
        logo_div = soup.find(class_=re.compile(r"logo|brand", re.I))
        result.add(CheckResult(
            "logo_present",
            bool(logo_imgs or logo_div),
            "no logo image (alt matches site name) and no .logo/.brand element",
        ))

        # html lang attribute
        html_tag = soup.find("html")
        html_lang = (html_tag.get("lang") or "").lower() if html_tag else ""
        result.add(CheckResult(
            "html_lang_matches_config",
            html_lang.startswith(language.split("-")[0]) if language else True,
            f"<html lang='{html_lang}'> does not match configured {language}",
        ))

        # OG / canonical use configured domain
        canonical = soup.find("link", attrs={"rel": "canonical"})
        canonical_href = canonical.get("href", "") if canonical else ""
        result.add(CheckResult(
            "canonical_domain_matches_config",
            domain in canonical_href if canonical_href else False,
            f"canonical '{canonical_href}' does not contain '{domain}'",
        ))

        og_site = soup.find("meta", attrs={"property": "og:site_name"})
        og_site_content = (og_site.get("content", "") if og_site else "").strip()
        result.add(CheckResult(
            "og_site_name_present",
            site_name.lower() == og_site_content.lower() if site_name else False,
            f"og:site_name '{og_site_content}' != configured '{site_name}'",
        ))

        # No cross-links to sibling brands
        forbidden = self.rules.get("no_cross_link_domains", []) or []
        bad_links = [
            a["href"] for a in soup.find_all("a", href=True)
            for fd in forbidden if fd in a["href"]
        ]
        result.add(CheckResult(
            "no_cross_brand_links",
            not bad_links,
            f"found cross-brand links: {bad_links[:3]}",
        ))
