"""Accessibility — 15 parameters. Static HTML checks (axe-core via Playwright optional)."""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult


class Checker(BaseChecker):
    name = "accessibility"
    category_label = "Accessibility"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        # Keyboard (4)
        html_tag = soup.find("html")
        result.add(CheckResult(
            "html_lang_attribute",
            bool(html_tag and html_tag.get("lang")),
            "<html> missing lang attribute",
        ))

        skip_link = bool(soup.find("a", href=re.compile(r"#main|#content|#skip", re.I)))
        result.add(CheckResult(
            "skip_to_content_link",
            skip_link,
            "no 'skip to content' link",
        ))

        focusable_with_tabindex_neg = [
            el for el in soup.find_all(attrs={"tabindex": "-1"})
            if el.name in ("a", "button", "input", "textarea", "select")
        ]
        result.add(CheckResult(
            "no_critical_elements_with_tabindex_neg1",
            not focusable_with_tabindex_neg,
            f"{len(focusable_with_tabindex_neg)} interactive elements with tabindex=-1",
        ))

        result.add(CheckResult(
            "main_landmark_present",
            bool(soup.find("main")) or bool(soup.find(attrs={"role": "main"})),
            "no <main> or role=main landmark",
        ))

        # Screen Reader (4)
        all_imgs = soup.find_all("img")
        missing_alt = [img for img in all_imgs if img.get("alt") is None]
        result.add(CheckResult(
            "all_images_have_alt_attribute",
            not missing_alt,
            f"{len(missing_alt)} images missing alt attribute",
        ))

        # Form labels
        inputs = [
            i for i in soup.find_all(["input", "select", "textarea"])
            if i.get("type") not in ("hidden", "submit", "button")
        ]
        unlabeled = []
        for inp in inputs:
            if inp.get("aria-label") or inp.get("aria-labelledby") or inp.get("title"):
                continue
            input_id = inp.get("id")
            if input_id and soup.find("label", attrs={"for": input_id}):
                continue
            if inp.find_parent("label"):
                continue
            unlabeled.append(inp)
        result.add(CheckResult(
            "all_inputs_labeled",
            not unlabeled,
            f"{len(unlabeled)} inputs without label",
        ))

        # Buttons have accessible names
        unnamed_buttons = []
        for btn in soup.find_all("button"):
            if not btn.get_text(strip=True) and not btn.get("aria-label") and not btn.get("title"):
                unnamed_buttons.append(btn)
        result.add(CheckResult(
            "all_buttons_have_accessible_name",
            not unnamed_buttons,
            f"{len(unnamed_buttons)} buttons without accessible name",
        ))

        # Links accessible names
        unnamed_links = []
        for a in soup.find_all("a", href=True):
            text = a.get_text(strip=True)
            if not text and not a.get("aria-label") and not a.get("title"):
                if not any(child.name == "img" and child.get("alt") for child in a.find_all()):
                    unnamed_links.append(a)
        result.add(CheckResult(
            "all_links_have_accessible_name",
            not unnamed_links,
            f"{len(unnamed_links)} links without accessible name",
        ))

        # Color & contrast (3) — full check needs rendering, partial here
        result.add(CheckResult(
            "color_not_only_indicator",
            bool(re.search(r":hover|:focus|underline|aria-current", html)),
            "no non-color state indicators (hover/focus/underline)",
        ))

        result.add(CheckResult(
            "focus_visible_styles",
            ":focus" in html or ":focus-visible" in html,
            "no :focus / :focus-visible styles",
        ))

        # Suggest aria-live for dynamic regions if forms present
        forms = soup.find_all("form")
        if forms:
            has_aria_live = bool(soup.find(attrs={"aria-live": True}))
            result.add(CheckResult(
                "aria_live_for_form_feedback",
                has_aria_live or all(
                    not f.get("data-validate") and not f.get("data-async")
                    for f in forms
                ),
                "form present but no aria-live region for feedback",
            ))
        else:
            result.add(CheckResult("aria_live_for_form_feedback", True, "n/a (no forms)"))

        # Content (4)
        # Heading order
        levels = [int(t.name[1]) for t in soup.find_all(re.compile(r"^h[1-6]$"))]
        skipped_levels = any(b - a > 1 for a, b in zip(levels, levels[1:]))
        result.add(CheckResult(
            "heading_levels_logical_order",
            not skipped_levels,
            "heading levels skip (e.g. h2 -> h4)",
        ))

        # Descriptive page title
        title_tag = soup.find("title")
        title_text = title_tag.get_text(strip=True) if title_tag else ""
        result.add(CheckResult(
            "title_descriptive",
            len(title_text) >= 10,
            f"title too short: '{title_text}'",
        ))

        # No autoplay video/audio without controls
        autoplay_no_controls = [
            el for el in soup.find_all(["video", "audio"])
            if el.get("autoplay") is not None and el.get("controls") is None
        ]
        result.add(CheckResult(
            "no_autoplay_without_controls",
            not autoplay_no_controls,
            f"{len(autoplay_no_controls)} autoplay media without controls",
        ))

        # ARIA roles only where needed (no role=button on <button>)
        redundant = [
            el for el in soup.find_all(attrs={"role": True})
            if el.name == "button" and el.get("role") == "button"
            or el.name == "a" and el.get("role") == "link"
            or el.name == "nav" and el.get("role") == "navigation"
        ]
        result.add(CheckResult(
            "no_redundant_aria_roles",
            len(redundant) <= 2,
            f"{len(redundant)} redundant ARIA roles",
        ))
