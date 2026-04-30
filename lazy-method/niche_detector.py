"""Niche auto-detector.

Analyzes a page (HTML + schema + content patterns) and returns the most likely
niche, a 0.0-1.0 confidence score, and the signals that contributed.

The detector is independent of the niche-profiles/ folder — it knows the
patterns regardless of which profile JSONs exist. If a profile file is missing
for a detected niche, the master runner falls back to generic.json with a
warning so the user can create a custom profile.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup


# Schema.org @type -> niche signal weight
SCHEMA_NICHE_MAP: dict[str, dict[str, float]] = {
    # restaurant
    "Restaurant": {"restaurant": 5.0},
    "FoodEstablishment": {"restaurant": 4.0},
    "Bakery": {"restaurant": 4.5},
    "BarOrPub": {"restaurant": 4.5},
    "CafeOrCoffeeShop": {"restaurant": 4.5},
    "FastFoodRestaurant": {"restaurant": 4.5},
    "Menu": {"restaurant": 3.0},

    # ecommerce
    "Product": {"ecommerce": 4.0},
    "Store": {"ecommerce": 4.0},
    "OnlineStore": {"ecommerce": 5.0},
    "Offer": {"ecommerce": 1.5},

    # saas
    "SoftwareApplication": {"saas": 5.0},
    "WebApplication": {"saas": 5.0},
    "MobileApplication": {"saas": 4.0},

    # publisher
    "NewsArticle": {"publisher": 4.0},
    "Article": {"publisher": 3.0},
    "BlogPosting": {"publisher": 3.0},
    "NewsMediaOrganization": {"publisher": 5.0},

    # professional-service
    "LegalService": {"professional-service": 5.0},
    "Attorney": {"professional-service": 5.0},
    "AccountingService": {"professional-service": 5.0},
    "FinancialService": {"professional-service": 4.0},
    "Physician": {"professional-service": 4.5},
    "Dentist": {"professional-service": 4.5},
    "MedicalBusiness": {"professional-service": 3.0},

    # local-service
    "HomeAndConstructionBusiness": {"local-service": 5.0},
    "Plumber": {"local-service": 5.0},
    "HVACBusiness": {"local-service": 5.0},
    "Electrician": {"local-service": 5.0},
    "MovingCompany": {"local-service": 5.0},
    "RoofingContractor": {"local-service": 5.0},
    "GeneralContractor": {"local-service": 5.0},
    "EmergencyService": {"local-service": 4.0},
    "AutomotiveBusiness": {"local-service": 4.0},
    "AutoRepair": {"local-service": 5.0},

    # marketing-agency / agency-style
    "MarketingAgency": {"marketing-agency": 5.0},
    "AdvertisingAgency": {"marketing-agency": 5.0},
    "WebDesignCompany": {"marketing-agency": 4.0},
    "GraphicDesignCompany": {"marketing-agency": 3.0},
    "SocialMediaMarketingAgency": {"marketing-agency": 5.0},

    # generic fallback
    "Organization": {},
    "LocalBusiness": {},
}


# Content keyword patterns -> niche signal weight (per match, capped)
KEYWORD_PATTERNS: list[tuple[re.Pattern, str, float, int]] = [
    # marketing-agency
    (re.compile(r"\b(SEO|PPC|paid ads|conversion rate|ROAS|growth marketing|content marketing|"
                r"digital marketing agency|marketing agency)\b", re.I), "marketing-agency", 1.0, 4),
    (re.compile(r"\b(case stud(y|ies)|client results|portfolio|campaigns we've run)\b", re.I),
     "marketing-agency", 0.5, 3),

    # saas
    (re.compile(r"\b(start (free )?trial|book a demo|schedule a demo|"
                r"sign up free|14[ -]day trial|free tier|pricing plans)\b", re.I),
     "saas", 1.5, 4),
    (re.compile(r"\b(API|SDK|integration|webhook|dashboard|workflow automation)\b", re.I),
     "saas", 0.5, 4),
    (re.compile(r"\b(per (user|seat|month)/month|/mo|monthly billing)\b", re.I), "saas", 1.0, 3),

    # ecommerce
    (re.compile(r"\b(add to cart|add to bag|buy now|checkout|shopping cart|"
                r"free shipping|order now)\b", re.I), "ecommerce", 1.5, 4),
    (re.compile(r"\$\s?\d+(\.\d{2})?\b"), "ecommerce", 0.3, 6),
    (re.compile(r"\b(in stock|out of stock|low stock|sku|product details|specifications)\b", re.I),
     "ecommerce", 0.7, 3),

    # restaurant
    (re.compile(r"\b(menu|reservation|book a table|order online|takeout|delivery|"
                r"appetizer|entrée|dessert|chef|cuisine|farm to table)\b", re.I),
     "restaurant", 1.0, 4),
    (re.compile(r"\b(open(ing)? hours?|hours of operation|today'?s special|happy hour)\b", re.I),
     "restaurant", 0.5, 2),

    # local-service
    (re.compile(r"\b(emergency service|24/7|same-?day|service area|service call|"
                r"diagnostic fee|warrant(y|ies)|licensed and insured)\b", re.I),
     "local-service", 1.0, 4),
    (re.compile(r"\b(plumber|electrician|hvac|technician|repair|installation|"
                r"appliance|leak|drain|furnace|ac unit)\b", re.I),
     "local-service", 0.7, 4),

    # professional-service
    (re.compile(r"\b(consultation|consultant|attorney|lawyer|law firm|cpa|accountant|"
                r"financial advisor|advisory|practitioner|practice)\b", re.I),
     "professional-service", 1.0, 4),
    (re.compile(r"\b(bar admission|JD|MBA|CFP|licensed in|practice areas|"
                r"areas of expertise|fee structure|retainer)\b", re.I),
     "professional-service", 1.5, 3),

    # publisher
    (re.compile(r"\b(by [A-Z][a-z]+\s+[A-Z]|published on|last updated|"
                r"min read|reading time|table of contents)\b"),
     "publisher", 1.0, 3),
    (re.compile(r"\b(newsletter|subscribe|article|story|reporter|editor)\b", re.I),
     "publisher", 0.5, 4),
]


@dataclass
class DetectionResult:
    niche: str
    confidence: float  # 0.0–1.0
    scores: dict[str, float]
    signals: dict[str, list[str]] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "niche": self.niche,
            "confidence": round(self.confidence, 3),
            "scores": {k: round(v, 2) for k, v in self.scores.items()},
            "signals": self.signals,
        }


def _extract_schema_types(soup: BeautifulSoup) -> set[str]:
    types: set[str] = set()
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = tag.string or tag.get_text() or ""
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        nodes: list[Any] = []
        if isinstance(data, list):
            nodes.extend(data)
        elif isinstance(data, dict):
            graph = data.get("@graph")
            if isinstance(graph, list):
                nodes.extend(graph)
            else:
                nodes.append(data)
        for node in nodes:
            if not isinstance(node, dict):
                continue
            t = node.get("@type")
            if isinstance(t, list):
                types.update(t)
            elif isinstance(t, str):
                types.add(t)
    return types


def _body_text(soup: BeautifulSoup) -> str:
    body = soup.body or soup
    for tag in body.find_all(["script", "style", "noscript"]):
        tag.decompose()
    return body.get_text(" ", strip=True)


def detect(soup: BeautifulSoup, html: str, page_path: Path) -> DetectionResult:
    """Inspect the page and return the most-likely niche."""
    scores: dict[str, float] = {}
    signals: dict[str, list[str]] = {}

    # 1. Schema-type signals
    schema_types = _extract_schema_types(soup)
    for st in schema_types:
        if st not in SCHEMA_NICHE_MAP:
            continue
        for niche, weight in SCHEMA_NICHE_MAP[st].items():
            scores[niche] = scores.get(niche, 0) + weight
            signals.setdefault(niche, []).append(f"schema:{st} (+{weight})")

    # 2. og:type
    og_type_tag = soup.find("meta", attrs={"property": "og:type"})
    og_type = (og_type_tag.get("content") or "").lower() if og_type_tag else ""
    og_map = {
        "article": ("publisher", 2.0),
        "product": ("ecommerce", 2.5),
        "restaurant.restaurant": ("restaurant", 2.5),
        "video.movie": ("publisher", 1.0),
        "music.song": ("publisher", 1.0),
        "book": ("publisher", 1.5),
        "profile": ("publisher", 1.0),
    }
    for prefix, (niche, weight) in og_map.items():
        if og_type.startswith(prefix):
            scores[niche] = scores.get(niche, 0) + weight
            signals.setdefault(niche, []).append(f"og:type={og_type} (+{weight})")
            break

    # 3. Content keyword patterns
    text = _body_text(soup)
    for pattern, niche, weight, cap in KEYWORD_PATTERNS:
        matches = len(pattern.findall(text))
        if matches:
            counted = min(matches, cap)
            score_add = counted * weight
            scores[niche] = scores.get(niche, 0) + score_add
            signals.setdefault(niche, []).append(
                f"keyword:{pattern.pattern[:40]}... ×{counted} (+{score_add})"
            )

    # 4. Structural signals
    has_tel = bool(soup.find("a", href=re.compile(r"^tel:")))
    has_address_schema = any(t in {"PostalAddress", "Place"} for t in schema_types)
    has_form = bool(soup.find("form"))
    has_price = bool(re.search(r"\$\s?\d+(\.\d{2})?\b", text))
    has_author_meta = bool(soup.find("meta", attrs={"name": "author"}))
    has_pricing_table = bool(soup.find(class_=re.compile(r"pricing|plans|tiers", re.I)))

    if has_tel and has_address_schema:
        scores["local-service"] = scores.get("local-service", 0) + 1.5
        signals.setdefault("local-service", []).append("tel: + PostalAddress (+1.5)")

    if has_pricing_table:
        scores["saas"] = scores.get("saas", 0) + 1.5
        signals.setdefault("saas", []).append("pricing/tiers element (+1.5)")

    if has_author_meta:
        scores["publisher"] = scores.get("publisher", 0) + 1.0
        signals.setdefault("publisher", []).append("author meta (+1.0)")

    if has_price and not has_pricing_table:
        scores["ecommerce"] = scores.get("ecommerce", 0) + 0.5
        signals.setdefault("ecommerce", []).append("price-format text (+0.5)")

    # 5. Pick winner + confidence
    if not scores:
        return DetectionResult(niche="generic", confidence=0.0, scores={}, signals={})

    sorted_niches = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_niche, top_score = sorted_niches[0]
    runner_up_score = sorted_niches[1][1] if len(sorted_niches) > 1 else 0.0

    # Confidence: 0..1 — based on absolute score and gap to runner-up
    abs_confidence = min(1.0, top_score / 8.0)  # 8.0 = strong signal threshold
    gap_confidence = (top_score - runner_up_score) / max(top_score, 1.0)
    confidence = (abs_confidence * 0.7) + (gap_confidence * 0.3)
    confidence = min(1.0, max(0.0, confidence))

    if confidence < 0.25:
        return DetectionResult(
            niche="generic",
            confidence=confidence,
            scores=scores,
            signals=signals,
        )

    return DetectionResult(
        niche=top_niche,
        confidence=confidence,
        scores=scores,
        signals=signals,
    )


__all__ = ["detect", "DetectionResult"]
