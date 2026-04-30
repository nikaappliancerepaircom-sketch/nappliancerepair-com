"""Internal Linking — 10 parameters."""

from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult


WEAK_ANCHORS = {"click here", "here", "read more", "learn more", "this page", "link"}


class Checker(BaseChecker):
    name = "internal_linking"
    category_label = "Internal Linking"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        domain = self.site.get("domain", "")
        all_links = soup.find_all("a", href=True)

        internal = []
        external = []
        for a in all_links:
            href = a["href"].strip()
            if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
                continue
            parsed = urlparse(href)
            if not parsed.netloc or domain in parsed.netloc:
                internal.append(a)
            else:
                external.append(a)

        min_internal = self.thresholds.get("internal_links_min", 5)
        result.add(CheckResult(
            "internal_links_min",
            len(internal) >= min_internal,
            f"{len(internal)} internal links (min {min_internal})",
        ))

        max_external = self.thresholds.get("external_links_max", 10)
        result.add(CheckResult(
            "external_links_under_max",
            len(external) <= max_external,
            f"{len(external)} external links (max {max_external})",
        ))

        weak_anchors = []
        for a in internal:
            text = a.get_text(" ", strip=True).lower()
            if text in WEAK_ANCHORS:
                weak_anchors.append(text)
        result.add(CheckResult(
            "no_weak_anchor_text",
            not weak_anchors,
            f"weak anchors: {weak_anchors[:3]}",
        ))

        # Anchor text diversity
        anchor_texts = [a.get_text(" ", strip=True) for a in internal]
        unique_anchors = len(set(anchor_texts))
        result.add(CheckResult(
            "anchor_text_diversity",
            unique_anchors >= max(1, int(len(anchor_texts) * 0.5)),
            f"only {unique_anchors}/{len(anchor_texts)} unique anchor texts",
        ))

        # Contextual links — links inside <p>
        contextual = [a for a in internal if a.find_parent("p")]
        result.add(CheckResult(
            "contextual_links_in_paragraphs",
            len(contextual) >= 2,
            f"only {len(contextual)} links inside <p> tags",
        ))

        # Links to pillar/cornerstone pages — heuristic: links to top-level paths
        top_level = [
            a for a in internal
            if urlparse(a["href"]).path.count("/") <= 2
        ]
        result.add(CheckResult(
            "links_to_pillar_pages",
            len(top_level) >= 2,
            f"only {len(top_level)} links to top-level/pillar pages",
        ))

        # Breadcrumbs visible in HTML
        breadcrumb = bool(soup.find(class_=re.compile(r"breadcrumb", re.I)))
        breadcrumb = breadcrumb or any(
            "breadcrumb" in str(b.get("aria-label", "")).lower()
            for b in soup.find_all(["nav", "ol"])
        )
        result.add(CheckResult(
            "breadcrumb_navigation_present",
            breadcrumb,
            "no breadcrumb element / aria-label",
        ))

        # Footer links to legal pages
        footer = soup.find("footer")
        legal_links = []
        if footer:
            legal_links = [
                a for a in footer.find_all("a", href=True)
                if re.search(r"privacy|terms|cookie|legal", a["href"], re.I)
            ]
        result.add(CheckResult(
            "footer_legal_links",
            len(legal_links) >= 2,
            f"{len(legal_links)} legal links in footer",
        ))

        # Related content / "see also" / next-step
        related = bool(soup.find(class_=re.compile(r"related|next-step|see-also|read-next|recommended", re.I)))
        related = related or bool(re.search(r"\b(related|see also|next step|read next|recommended)\b", soup.get_text().lower()))
        result.add(CheckResult(
            "related_or_next_step_section",
            related,
            "no related content / next-step block",
        ))

        # All internal links resolve (relative paths) — basic check that hrefs are not broken patterns
        broken_patterns = [
            a["href"] for a in internal
            if "{{" in a["href"] or "${" in a["href"] or a["href"].startswith("undefined")
        ]
        result.add(CheckResult(
            "no_broken_template_placeholders_in_links",
            not broken_patterns,
            f"broken template placeholders: {broken_patterns[:3]}",
        ))
