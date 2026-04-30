"""Conversion Design — 10 parameters."""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult


class Checker(BaseChecker):
    name = "conversion_design"
    category_label = "Conversion Design"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        # Visual hierarchy (5)
        h1 = soup.find("h1")
        result.add(CheckResult(
            "single_focal_h1",
            h1 is not None and len(soup.find_all("h1")) == 1,
            f"{len(soup.find_all('h1'))} h1 tags",
        ))

        # Buttons styled (have class or inline style)
        buttons_styled = sum(
            1 for b in soup.find_all(["button", "a"])
            if b.get("class") and any("btn" in str(c).lower() or "button" in str(c).lower() for c in b.get("class"))
        )
        result.add(CheckResult(
            "ctas_styled_as_buttons",
            buttons_styled >= 3,
            f"only {buttons_styled} buttons with btn/button class",
        ))

        # White space — heuristic via section count vs body length
        sections = soup.find_all(["section", "article"])
        result.add(CheckResult(
            "content_sectioned",
            len(sections) >= 4,
            f"only {len(sections)} <section>/<article> blocks (use semantic HTML)",
        ))

        # Icons used (proxy for visual interest)
        svgs = soup.find_all("svg")
        icon_imgs = soup.find_all("img", src=re.compile(r"icon|svg", re.I))
        result.add(CheckResult(
            "icons_used_for_scanning",
            (len(svgs) + len(icon_imgs)) >= 3,
            f"{len(svgs)} SVGs + {len(icon_imgs)} icon imgs (min 3 combined)",
        ))

        # Color psychology — primary brand color used in CTAs/buttons
        primary = (self.brand.get("primary_color") or "").lower()
        if primary:
            primary_used_in_styles = primary in html.lower()
            result.add(CheckResult(
                "primary_color_drives_attention",
                primary_used_in_styles,
                f"primary color {primary} not in page styles",
            ))
        else:
            result.add(CheckResult("primary_color_drives_attention", True, "n/a"))

        # Mobile (5)
        viewport = soup.find("meta", attrs={"name": "viewport"})
        result.add(CheckResult(
            "viewport_meta_set",
            viewport is not None and "device-width" in (viewport.get("content") or ""),
            "viewport meta missing or wrong",
        ))

        # Mobile-friendly tap targets — heuristic via inline styles or classes (best checked via Playwright)
        result.add(CheckResult(
            "mobile_tap_targets_styled",
            "min-height" in html.lower() or "padding" in html.lower(),
            "no min-height/padding suggesting tap-target sizing",
        ))

        # Click-to-call exists for local
        if self.business.get("is_local"):
            result.add(CheckResult(
                "tel_link_for_mobile",
                bool(soup.find("a", href=re.compile(r"^tel:"))),
                "no tel: link",
            ))
        else:
            result.add(CheckResult("tel_link_for_mobile", True, "n/a (non-local)"))

        # Lazy loading — at least one img with loading=lazy or native lazy
        lazy_imgs = [img for img in soup.find_all("img") if img.get("loading") == "lazy"]
        all_imgs = soup.find_all("img")
        result.add(CheckResult(
            "lazy_loading_images",
            len(lazy_imgs) >= max(1, len(all_imgs) // 2) if all_imgs else True,
            f"{len(lazy_imgs)}/{len(all_imgs)} images use loading=lazy",
        ))

        # Mobile menu visible — check for hamburger pattern
        hamburger = bool(soup.find(class_=re.compile(r"hamburger|menu-toggle|nav-toggle|mobile-menu", re.I)))
        result.add(CheckResult(
            "mobile_menu_pattern",
            hamburger or bool(soup.find("nav")),
            "no hamburger menu pattern detected",
        ))
