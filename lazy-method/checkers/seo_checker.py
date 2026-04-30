"""SEO Optimization — 30 parameters."""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, text_of


class Checker(BaseChecker):
    name = "seo"
    category_label = "SEO Optimization"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        body_text = text_of(soup)
        word_count = len(body_text.split())
        wc_min, wc_max = self.thresholds.get("word_count", [800, 3000])

        # Content (9)
        result.add(CheckResult(
            "word_count_in_range",
            wc_min <= word_count <= wc_max,
            f"{word_count} words (target {wc_min}-{wc_max})",
        ))

        h1_tags = soup.find_all("h1")
        result.add(CheckResult(
            "h1_exactly_one",
            len(h1_tags) == 1,
            f"found {len(h1_tags)} h1 tags",
        ))

        h2_tags = soup.find_all("h2")
        h2_min, h2_max = self.thresholds.get("h2_count", [5, 12])
        result.add(CheckResult(
            "h2_count_in_range",
            h2_min <= len(h2_tags) <= h2_max,
            f"{len(h2_tags)} h2 tags (target {h2_min}-{h2_max})",
        ))

        h3_tags = soup.find_all("h3")
        h3_min = self.thresholds.get("h3_count_min", 3)
        result.add(CheckResult(
            "h3_count_min",
            len(h3_tags) >= h3_min,
            f"{len(h3_tags)} h3 tags (min {h3_min})",
        ))

        # Heading hierarchy (no skipped levels)
        levels = [int(t.name[1]) for t in soup.find_all(re.compile(r"^h[1-6]$"))]
        skipped = any(b - a > 1 for a, b in zip(levels, levels[1:]))
        result.add(CheckResult(
            "heading_hierarchy_logical",
            not skipped,
            "skipped heading levels found" if skipped else "ok",
        ))

        internal_min = self.thresholds.get("internal_links_min", 5)
        domain = self.site.get("domain", "")
        a_tags = soup.find_all("a", href=True)
        internal_links = [
            a for a in a_tags
            if a["href"].startswith("/") or domain in a["href"]
        ]
        result.add(CheckResult(
            "internal_links_min",
            len(internal_links) >= internal_min,
            f"{len(internal_links)} internal links (min {internal_min})",
        ))

        external_max = self.thresholds.get("external_links_max", 10)
        external_links = [
            a for a in a_tags
            if a["href"].startswith("http") and domain not in a["href"]
        ]
        result.add(CheckResult(
            "external_links_under_max",
            len(external_links) <= external_max,
            f"{len(external_links)} external links (max {external_max})",
        ))

        images = soup.find_all("img")
        img_min = self.thresholds.get("images_min", 1)
        result.add(CheckResult(
            "images_min",
            len(images) >= img_min,
            f"{len(images)} images (min {img_min})",
        ))

        missing_alt = [img for img in images if not img.get("alt")]
        result.add(CheckResult(
            "all_images_have_alt",
            not missing_alt,
            f"{len(missing_alt)} images missing alt text",
        ))

        # Technical (7)
        title_tag = soup.find("title")
        title_text = title_tag.get_text(strip=True) if title_tag else ""
        title_min, title_max = self.thresholds.get("title_length", [40, 60])
        result.add(CheckResult(
            "title_present",
            bool(title_text),
            "" if title_text else "missing <title>",
        ))
        result.add(CheckResult(
            "title_length_in_range",
            title_min <= len(title_text) <= title_max,
            f"{len(title_text)} chars (target {title_min}-{title_max})",
        ))

        meta_desc = soup.find("meta", attrs={"name": "description"})
        meta_desc_text = meta_desc.get("content", "").strip() if meta_desc else ""
        md_min, md_max = self.thresholds.get("meta_desc_length", [140, 160])
        result.add(CheckResult(
            "meta_description_present",
            bool(meta_desc_text),
            "" if meta_desc_text else "missing meta description",
        ))
        result.add(CheckResult(
            "meta_description_length_in_range",
            md_min <= len(meta_desc_text) <= md_max,
            f"{len(meta_desc_text)} chars (target {md_min}-{md_max})",
        ))

        viewport = soup.find("meta", attrs={"name": "viewport"})
        result.add(CheckResult(
            "viewport_meta",
            viewport is not None and "width=device-width" in viewport.get("content", ""),
            "" if viewport else "missing viewport meta tag",
        ))

        canonical = soup.find("link", attrs={"rel": "canonical"})
        canonical_href = canonical.get("href", "") if canonical else ""
        result.add(CheckResult(
            "canonical_present",
            bool(canonical_href),
            "" if canonical_href else "missing canonical link",
        ))
        result.add(CheckResult(
            "canonical_uses_https",
            canonical_href.startswith("https://"),
            f"canonical: {canonical_href}",
        ))

        robots = soup.find("meta", attrs={"name": "robots"})
        robots_content = robots.get("content", "").lower() if robots else ""
        result.add(CheckResult(
            "robots_meta_not_noindex",
            "noindex" not in robots_content,
            f"robots: {robots_content}" if robots_content else "no robots meta (default index)",
        ))

        # AI Optimization (5)
        result.add(CheckResult(
            "faq_section_present",
            bool(soup.find_all(string=re.compile(r"\bFAQ\b|frequently asked", re.I))),
            "no FAQ section detected",
        ))

        question_h3 = [
            h3 for h3 in h3_tags
            if h3.get_text(strip=True).endswith("?")
        ]
        result.add(CheckResult(
            "question_format_h3",
            len(question_h3) >= self.thresholds.get("faq_count_min", 3),
            f"{len(question_h3)} question-format h3 tags",
        ))

        lists = soup.find_all(["ul", "ol"])
        result.add(CheckResult(
            "lists_present_for_snippets",
            len(lists) >= 2,
            f"{len(lists)} lists",
        ))

        tables = soup.find_all("table")
        result.add(CheckResult(
            "structured_content_lists_or_tables",
            len(lists) >= 2 or len(tables) >= 1,
            f"{len(lists)} lists, {len(tables)} tables",
        ))

        result.add(CheckResult(
            "voice_friendly_questions",
            len(question_h3) >= 3,
            f"{len(question_h3)} natural-language Q&A headings (need >= 3)",
        ))

        # Local SEO (5) — applied if business is_local
        is_local = self.business.get("is_local", False)
        if is_local:
            phone = self.contact.get("phone", "")
            phone_digits = re.sub(r"[^\d]", "", phone)
            phone_in_text = phone_digits in re.sub(r"[^\d]", "", body_text)
            result.add(CheckResult(
                "phone_present_on_page",
                phone_in_text,
                f"phone {phone} not found in page text" if not phone_in_text else "ok",
            ))

            tel_links = [a for a in a_tags if a["href"].startswith("tel:")]
            result.add(CheckResult(
                "phone_clickable_tel_link",
                len(tel_links) >= 1,
                f"{len(tel_links)} tel: links",
            ))

            address = self.contact.get("address", "")
            city = address.split(",")[0].strip() if address else ""
            result.add(CheckResult(
                "address_or_city_mentioned",
                bool(city) and city.lower() in body_text.lower(),
                f"city '{city}' not found" if city and city.lower() not in body_text.lower() else "ok",
            ))

            schema_blocks = soup.find_all("script", attrs={"type": "application/ld+json"})
            has_local_business_schema = any(
                "LocalBusiness" in (s.string or "") or "Restaurant" in (s.string or "")
                or "ProfessionalService" in (s.string or "")
                for s in schema_blocks
            )
            result.add(CheckResult(
                "local_business_schema_present",
                has_local_business_schema,
                "no LocalBusiness/related schema" if not has_local_business_schema else "ok",
            ))

            map_or_directions = bool(
                soup.find("a", href=re.compile(r"google\.com/maps|maps\.google", re.I))
                or soup.find("iframe", src=re.compile(r"maps\.google|google\.com/maps", re.I))
            )
            result.add(CheckResult(
                "directions_or_map_link",
                map_or_directions,
                "no map/directions link found" if not map_or_directions else "ok",
            ))
        else:
            for stub in (
                "phone_present_on_page",
                "phone_clickable_tel_link",
                "address_or_city_mentioned",
                "local_business_schema_present",
                "directions_or_map_link",
            ):
                result.add(CheckResult(stub, True, "n/a (non-local business)"))

        # User Experience (4)
        cta_keywords = re.compile(
            r"\b(call|contact|book|get|start|sign up|subscribe|buy|order|request)\b",
            re.I,
        )
        cta_buttons = [
            el for el in soup.find_all(["a", "button"])
            if cta_keywords.search(el.get_text(" ", strip=True))
        ]
        result.add(CheckResult(
            "ctas_present",
            len(cta_buttons) >= 3,
            f"{len(cta_buttons)} CTA-like elements (min 3)",
        ))

        forms = soup.find_all("form")
        result.add(CheckResult(
            "contact_or_lead_form_present",
            len(forms) >= 1,
            f"{len(forms)} forms",
        ))

        nav = soup.find("nav")
        result.add(CheckResult(
            "navigation_present",
            nav is not None,
            "no <nav> element found" if not nav else "ok",
        ))

        nav_links = nav.find_all("a") if nav else []
        result.add(CheckResult(
            "navigation_max_seven_top_level",
            len(nav_links) <= 7 or nav is None,
            f"{len(nav_links)} top-level nav links (max 7)" if len(nav_links) > 7 else "ok",
        ))
