"""Responsive Design — 80 parameters (10 devices x 8 checks).

Uses Playwright to load the page in different viewports. If Playwright is not
installed, the checker reports an installation hint and marks all checks as
failed (so deploys are blocked until the dependency is available — strict mode).
"""

from __future__ import annotations

from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult


DEVICES: list[tuple[str, int, int, str]] = [
    ("iphone_se", 375, 667, "mobile"),
    ("iphone_12_pro", 390, 844, "mobile"),
    ("samsung_galaxy_s21", 360, 800, "mobile"),
    ("iphone_14_pro_max", 430, 932, "mobile"),
    ("ipad_mini", 768, 1024, "tablet"),
    ("ipad_air", 820, 1180, "tablet"),
    ("ipad_pro", 1024, 1366, "tablet"),
    ("laptop", 1366, 768, "desktop"),
    ("desktop_hd", 1920, 1080, "desktop"),
    ("desktop_4k", 2560, 1440, "desktop"),
]


class Checker(BaseChecker):
    name = "responsive"
    category_label = "Responsive Design"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            for device, w, h, _ in DEVICES:
                for check in (
                    "no_horizontal_overflow",
                    "scroll_width_le_viewport",
                    "body_width_correct",
                    "no_horizontal_scrollbar",
                    "tap_targets_44px_min",
                    "text_readable_no_zoom",
                    "images_fit_viewport",
                    "forms_usable",
                ):
                    result.add(CheckResult(
                        f"{device}_{check}",
                        False,
                        "playwright not installed — run `pip install playwright && playwright install chromium`",
                    ))
            return

        url = page_path.resolve().as_uri()
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            for device_name, vw, vh, kind in DEVICES:
                ctx = browser.new_context(viewport={"width": vw, "height": vh})
                page = ctx.new_page()
                try:
                    page.goto(url, wait_until="domcontentloaded", timeout=15000)
                except Exception as e:
                    for check in (
                        "no_horizontal_overflow",
                        "scroll_width_le_viewport",
                        "body_width_correct",
                        "no_horizontal_scrollbar",
                        "tap_targets_44px_min",
                        "text_readable_no_zoom",
                        "images_fit_viewport",
                        "forms_usable",
                    ):
                        result.add(CheckResult(
                            f"{device_name}_{check}",
                            False,
                            f"navigation error: {e}",
                        ))
                    ctx.close()
                    continue

                metrics = page.evaluate(
                    """() => ({
                        scrollWidth: document.documentElement.scrollWidth,
                        clientWidth: document.documentElement.clientWidth,
                        bodyWidth: document.body.scrollWidth,
                        innerWidth: window.innerWidth,
                    })"""
                )
                no_overflow = metrics["scrollWidth"] <= metrics["innerWidth"] + 1
                result.add(CheckResult(
                    f"{device_name}_no_horizontal_overflow",
                    no_overflow,
                    f"scrollWidth={metrics['scrollWidth']} > innerWidth={metrics['innerWidth']}"
                    if not no_overflow else "ok",
                ))
                result.add(CheckResult(
                    f"{device_name}_scroll_width_le_viewport",
                    metrics["scrollWidth"] <= metrics["innerWidth"] + 1,
                    f"scrollWidth {metrics['scrollWidth']}",
                ))
                result.add(CheckResult(
                    f"{device_name}_body_width_correct",
                    metrics["bodyWidth"] <= metrics["innerWidth"] + 5,
                    f"bodyWidth={metrics['bodyWidth']}, innerWidth={metrics['innerWidth']}",
                ))
                result.add(CheckResult(
                    f"{device_name}_no_horizontal_scrollbar",
                    metrics["scrollWidth"] - metrics["clientWidth"] < 5,
                    "horizontal scrollbar present" if metrics["scrollWidth"] - metrics["clientWidth"] >= 5 else "ok",
                ))

                # Tap targets — only meaningful on mobile
                if kind == "mobile":
                    small_targets = page.evaluate(
                        """() => {
                            const els = document.querySelectorAll('a, button, input, [role="button"]');
                            let small = 0;
                            els.forEach(el => {
                                const r = el.getBoundingClientRect();
                                if ((r.width > 0 && r.width < 44) || (r.height > 0 && r.height < 44)) small++;
                            });
                            return small;
                        }"""
                    )
                    result.add(CheckResult(
                        f"{device_name}_tap_targets_44px_min",
                        small_targets <= 2,
                        f"{small_targets} interactive elements smaller than 44x44",
                    ))
                else:
                    result.add(CheckResult(
                        f"{device_name}_tap_targets_44px_min",
                        True,
                        "n/a (non-mobile)",
                    ))

                # Text readable — base font >= 14px on mobile
                base_font = page.evaluate(
                    """() => parseFloat(getComputedStyle(document.body).fontSize)"""
                )
                min_font = 14 if kind == "mobile" else 13
                result.add(CheckResult(
                    f"{device_name}_text_readable_no_zoom",
                    base_font >= min_font,
                    f"body font-size {base_font}px (min {min_font})",
                ))

                # Images fit viewport
                overflowing_imgs = page.evaluate(
                    """() => {
                        const imgs = document.querySelectorAll('img');
                        let bad = 0;
                        imgs.forEach(img => {
                            const r = img.getBoundingClientRect();
                            if (r.width > window.innerWidth + 5) bad++;
                        });
                        return bad;
                    }"""
                )
                result.add(CheckResult(
                    f"{device_name}_images_fit_viewport",
                    overflowing_imgs == 0,
                    f"{overflowing_imgs} images wider than viewport",
                ))

                # Forms usable — labels + inputs are visible
                form_ok = page.evaluate(
                    """() => {
                        const inputs = document.querySelectorAll('input:not([type=hidden]), textarea, select');
                        let visible = 0;
                        inputs.forEach(i => {
                            const r = i.getBoundingClientRect();
                            if (r.width > 0 && r.height > 0) visible++;
                        });
                        return inputs.length === 0 || visible === inputs.length;
                    }"""
                )
                result.add(CheckResult(
                    f"{device_name}_forms_usable",
                    bool(form_ok),
                    "some form inputs not visible at this viewport",
                ))

                ctx.close()
            browser.close()
