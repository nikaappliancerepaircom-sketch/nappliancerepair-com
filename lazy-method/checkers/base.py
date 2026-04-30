"""Base classes for Lazy Method checkers.

Every category checker subclasses BaseChecker and implements run().
Each individual parameter check returns a CheckResult; the checker
aggregates them into a CategoryResult.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup


@dataclass
class CheckResult:
    """Single parameter result."""
    param: str
    passed: bool
    details: str = ""
    location: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "param": self.param,
            "passed": self.passed,
            "details": self.details,
            "location": self.location,
        }


@dataclass
class CategoryResult:
    """Aggregated result for a category."""
    category: str
    total: int = 0
    passed: int = 0
    checks: list[CheckResult] = field(default_factory=list)

    @property
    def failed(self) -> list[CheckResult]:
        return [c for c in self.checks if not c.passed]

    @property
    def is_passing(self) -> bool:
        return self.total == self.passed and self.total > 0

    def add(self, result: CheckResult) -> None:
        self.checks.append(result)
        self.total += 1
        if result.passed:
            self.passed += 1

    def to_dict(self) -> dict[str, Any]:
        return {
            "category": self.category,
            "total": self.total,
            "passed": self.passed,
            "is_passing": self.is_passing,
            "checks": [c.to_dict() for c in self.checks],
        }


class BaseChecker:
    """Subclass per category."""

    name: str = "base"
    category_label: str = "Base"

    def __init__(self, config: dict[str, Any]) -> None:
        self.config = config
        self.thresholds = config.get("thresholds", {})
        self.rules = config.get("rules", {})
        self.business = config.get("business", {})
        self.contact = config.get("contact", {})
        self.brand = config.get("brand", {})
        self.site = config.get("site", {})
        self.niche = config.get("niche_overrides", {}) or {}

    def run(self, html: str, page_path: Path) -> CategoryResult:
        soup = BeautifulSoup(html, "lxml")
        result = CategoryResult(category=self.name)
        self.check(soup, html, page_path, result)
        return result

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        """Override in subclasses. Append CheckResults via result.add()."""
        raise NotImplementedError


def text_of(soup: BeautifulSoup) -> str:
    """Visible text of body, scripts/styles stripped, whitespace normalized."""
    body = soup.body or soup
    for tag in body.find_all(["script", "style", "noscript"]):
        tag.decompose()
    return " ".join(body.get_text(" ").split())


def gather_styles(soup: BeautifulSoup, page_path: Path) -> str:
    """Concatenate inline <style> and contents of linked stylesheets that resolve
    to a local file relative to the page or its site root."""
    chunks: list[str] = [tag.get_text() for tag in soup.find_all("style")]
    site_root = page_path.parent
    while site_root != site_root.parent:
        if (site_root / "assets").is_dir() or (site_root / "index.html").exists():
            break
        site_root = site_root.parent
    for link in soup.find_all("link", attrs={"rel": "stylesheet"}):
        href = link.get("href") or ""
        if not href or href.startswith(("http:", "https:", "//")):
            continue
        candidate_paths: list[Path] = []
        if href.startswith("/"):
            candidate_paths.append(site_root / href.lstrip("/"))
        else:
            candidate_paths.append(page_path.parent / href)
        for candidate in candidate_paths:
            try:
                if candidate.is_file():
                    chunks.append(candidate.read_text(encoding="utf-8", errors="replace"))
                    break
            except OSError:
                continue
    return "\n".join(chunks)
