"""Visual Design — 20 parameters. HTML/CSS-level only (no subjective photo checks)."""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, gather_styles


class Checker(BaseChecker):
    name = "visual"
    category_label = "Visual Design"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        styles = gather_styles(soup, page_path)
        combined = (html + "\n" + styles).lower()
        # Layout & Spacing (5)
        sections = soup.find_all(["section", "article"])
        result.add(CheckResult(
            "semantic_sections_used",
            len(sections) >= 4,
            f"{len(sections)} <section>/<article> blocks",
        ))

        css_links = soup.find_all("link", attrs={"rel": "stylesheet"})
        result.add(CheckResult(
            "external_css_present",
            len(css_links) >= 1,
            "no external CSS files (inline-only is harder to maintain)",
        ))

        result.add(CheckResult(
            "container_width_constrained",
            "max-width" in combined or "container" in combined,
            "no max-width / .container constraint detected",
        ))

        result.add(CheckResult(
            "grid_or_flex_layout",
            bool(re.search(r"display:\s*(flex|grid)|class=\"[^\"]*\b(grid|flex)\b", html)),
            "no flex/grid layout detected",
        ))

        result.add(CheckResult(
            "no_inline_pixel_layouts",
            html.count('style="width:') < 5,
            "many inline width: declarations (use classes)",
        ))

        # Typography (5)
        font_imports = bool(re.search(r"@import.*fonts|fonts\.googleapis|<link[^>]*fonts", combined))
        result.add(CheckResult(
            "web_font_referenced",
            font_imports or bool(self.brand.get("font_family")),
            "no web font import / brand font configured",
        ))

        font_family = (self.brand.get("font_family") or "").lower()
        if font_family:
            result.add(CheckResult(
                "configured_font_used",
                font_family in combined,
                f"configured font '{font_family}' not in HTML",
            ))
        else:
            result.add(CheckResult("configured_font_used", True, "n/a"))

        # Heading sizes proportional — heuristic via CSS variables or font-size in CSS
        result.add(CheckResult(
            "heading_size_styling_present",
            bool(re.search(r"h[1-3]\s*{|h[1-3][^}]*font-size|--font", combined)),
            "no obvious heading size styling",
        ))

        result.add(CheckResult(
            "line_height_styled",
            bool(re.search(r"line-height", combined)),
            "no line-height declarations",
        ))

        result.add(CheckResult(
            "text_color_styled",
            bool(re.search(r"color:\s*#|color:\s*rgb|--color", combined)),
            "no color declarations",
        ))

        # Colors & Contrast (4) — full WCAG contrast needs rendered DOM, but we can verify presence
        primary = (self.brand.get("primary_color") or "").lower()
        secondary = (self.brand.get("secondary_color") or "").lower()
        result.add(CheckResult(
            "primary_color_in_css",
            primary in combined if primary else False,
            f"primary {primary} not in HTML/CSS",
        ))
        result.add(CheckResult(
            "secondary_color_in_css",
            secondary in combined if secondary else False,
            f"secondary {secondary} not in HTML/CSS",
        ))

        # Hover/focus states declared
        result.add(CheckResult(
            "hover_or_focus_states_declared",
            bool(re.search(r":hover|:focus|:focus-visible", combined)),
            "no :hover / :focus declarations",
        ))

        # Dark text on light background or vice-versa — heuristic: body styling exists
        result.add(CheckResult(
            "body_background_styled",
            bool(re.search(r"body\s*{[^}]*background|--bg|background:", combined)),
            "no body background styling detected",
        ))

        # Images & Media (3) — HTML-level only
        all_imgs = soup.find_all("img")
        result.add(CheckResult(
            "images_have_alt",
            all(img.get("alt") is not None for img in all_imgs),
            f"{sum(1 for img in all_imgs if img.get('alt') is None)} imgs missing alt",
        ))

        responsive_imgs = sum(
            1 for img in all_imgs
            if img.get("srcset") or img.find_parent("picture")
        )
        result.add(CheckResult(
            "responsive_images_used",
            len(all_imgs) == 0 or responsive_imgs >= 1 or any(img.get("loading") == "lazy" for img in all_imgs),
            f"only {responsive_imgs}/{len(all_imgs)} images use srcset/<picture>",
        ))

        result.add(CheckResult(
            "lazy_loading",
            len(all_imgs) == 0 or any(img.get("loading") == "lazy" for img in all_imgs),
            "no images use loading=lazy",
        ))

        # Interactive (3)
        styled_buttons = sum(
            1 for b in soup.find_all(["a", "button"])
            if b.get("class") and any(re.search(r"\b(btn|button|cta)\b", str(c), re.I) for c in b.get("class"))
        )
        result.add(CheckResult(
            "ctas_styled_consistently",
            styled_buttons >= 3,
            f"only {styled_buttons} buttons with btn/cta class",
        ))

        result.add(CheckResult(
            "links_distinguishable",
            bool(re.search(r"a\s*{[^}]*color|text-decoration", combined)),
            "no link styling rules",
        ))

        result.add(CheckResult(
            "form_inputs_styled",
            len(soup.find_all("form")) == 0 or bool(re.search(r"input\s*{|textarea\s*{|\.form", combined)),
            "no form/input styling rules",
        ))
