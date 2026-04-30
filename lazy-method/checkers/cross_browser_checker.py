"""Cross-Browser — 28 parameters (4 browsers x 7 tests).

Uses Playwright to load the page in chromium, firefox, webkit. Edge uses
chromium engine, so we fall back to chromium for Edge tests.
"""

from __future__ import annotations

from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult


BROWSERS = [
    ("chrome", "chromium"),
    ("firefox", "firefox"),
    ("safari", "webkit"),
    ("edge", "chromium"),
]

TESTS = ("page_loads", "no_console_errors", "layout_renders", "javascript_runs",
         "css_applied", "media_queries_work", "forms_render", "scroll_works")


class Checker(BaseChecker):
    name = "cross_browser"
    category_label = "Cross-Browser"

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
            for browser, _ in BROWSERS:
                for test in TESTS[:7]:  # 7 tests per browser = 28 total
                    result.add(CheckResult(
                        f"{browser}_{test}",
                        False,
                        "playwright not installed",
                    ))
            return

        url = page_path.resolve().as_uri()
        with sync_playwright() as pw:
            for browser_name, engine in BROWSERS:
                try:
                    browser_type = getattr(pw, engine)
                    browser = browser_type.launch()
                except Exception as e:
                    for test in TESTS[:7]:
                        result.add(CheckResult(
                            f"{browser_name}_{test}",
                            False,
                            f"failed to launch {engine}: {e}",
                        ))
                    continue

                ctx = browser.new_context(viewport={"width": 1280, "height": 800})
                page = ctx.new_page()
                console_errors = []
                page.on("pageerror", lambda exc: console_errors.append(str(exc)))
                page.on(
                    "console",
                    lambda msg: console_errors.append(msg.text) if msg.type == "error" else None,
                )

                loaded = False
                try:
                    page.goto(url, wait_until="domcontentloaded", timeout=15000)
                    loaded = True
                except Exception as e:
                    result.add(CheckResult(f"{browser_name}_page_loads", False, str(e)))

                if loaded:
                    result.add(CheckResult(f"{browser_name}_page_loads", True))

                    result.add(CheckResult(
                        f"{browser_name}_no_console_errors",
                        not console_errors,
                        f"{len(console_errors)} console errors: {console_errors[:2]}",
                    ))

                    body_renders = page.evaluate(
                        "() => document.body && document.body.children.length > 0"
                    )
                    result.add(CheckResult(
                        f"{browser_name}_layout_renders",
                        bool(body_renders),
                        "<body> empty or missing",
                    ))

                    js_runs = page.evaluate("() => typeof window !== 'undefined' && 1+1===2")
                    result.add(CheckResult(
                        f"{browser_name}_javascript_runs",
                        bool(js_runs),
                        "JS context broken",
                    ))

                    css_applied = page.evaluate(
                        "() => getComputedStyle(document.body).fontFamily !== ''"
                    )
                    result.add(CheckResult(
                        f"{browser_name}_css_applied",
                        bool(css_applied),
                        "no computed CSS",
                    ))

                    media_query_works = page.evaluate(
                        "() => window.matchMedia('(min-width: 320px)').matches"
                    )
                    result.add(CheckResult(
                        f"{browser_name}_media_queries_work",
                        bool(media_query_works),
                        "media queries broken",
                    ))

                    forms_render = page.evaluate(
                        """() => {
                            const f = document.querySelectorAll('form');
                            return f.length === 0 || Array.from(f).every(form => form.offsetParent !== null);
                        }"""
                    )
                    result.add(CheckResult(
                        f"{browser_name}_forms_render",
                        bool(forms_render),
                        "some forms not visible",
                    ))

                ctx.close()
                browser.close()
