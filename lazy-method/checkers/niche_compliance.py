"""Niche Compliance — variable parameter count.

Reads the active niche profile and enforces:
  - every required_cta_types entry has an HTML signal
  - every required_trust_signals entry has an HTML signal
  - no forbidden_psychology phrasing or pattern is present

Parameter count = len(required_cta_types) + len(required_trust_signals) + len(forbidden_psychology).
"""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, text_of


CTA_SIGNATURES: dict[str, re.Pattern] = {
    "phone": re.compile(r'href="tel:|tel:\+|\bcall (us|now|today)\b', re.I),
    "contact_form": re.compile(r"<form\b|contact (us|form)|get in touch", re.I),
    "consultation": re.compile(r"\b(consult|consultation|book a (call|consult|discovery))\b", re.I),
    "consultation_book": re.compile(r"\b(book.{0,12}consultation|schedule.{0,12}consultation)\b", re.I),
    "free_trial": re.compile(r"\b(free trial|start (your )?free|14[ -]day trial|30[ -]day trial)\b", re.I),
    "demo_request": re.compile(r"\b(book a demo|request a demo|see a demo|schedule.{0,10}demo)\b", re.I),
    "pricing": re.compile(r"\b(see pricing|view pricing|pricing|/pricing)\b", re.I),
    "add_to_cart": re.compile(r"\b(add to cart|add to bag|add to basket)\b|cart.add", re.I),
    "buy_now": re.compile(r"\b(buy now|order now|purchase now|checkout)\b", re.I),
    "reservation": re.compile(r"\b(book a table|reserve|reservation|opentable|resy)\b", re.I),
    "menu_view": re.compile(r"\b(view menu|see menu|our menu|/menu)\b", re.I),
    "directions": re.compile(r"google\.com/maps|maps\.google|\bget directions\b", re.I),
    "emergency_call": re.compile(r"\b(emergency|24/7|24-hour|same[ -]day|urgent)\b", re.I),
    "newsletter_signup": re.compile(r"\b(newsletter|subscribe|sign up.{0,8}email)\b", re.I),
    "subscribe": re.compile(r"\b(subscribe|follow us)\b", re.I),
    "share": re.compile(r"\b(share|share this|tweet|share on)\b|aria-label=\"share", re.I),
}


TRUST_SIGNATURES: dict[str, re.Pattern] = {
    "client_logos": re.compile(r"\b(client logos?|featured.{0,8}in|trusted by|as seen on)\b|class=\"[^\"]*\b(client|logo|partner)s?\b", re.I),
    "case_studies": re.compile(r"\b(case stud(y|ies)|client (story|stories)|our work|portfolio)\b", re.I),
    "testimonials": re.compile(r"\b(testimonial|review|customer says|client says|quote-)\b", re.I),
    "team": re.compile(r"\b(our team|meet the team|founders?|leadership)\b", re.I),
    "team_bios": re.compile(r"\b(team bios?|leadership bios?|meet the (team|founders))\b", re.I),
    "customer_logos": re.compile(r"\b(customer logos?|trusted by|companies using)\b", re.I),
    "review_aggregator_badge": re.compile(r"\b(g2|capterra|trustpilot|yelp|tripadvisor)\b|review.{0,10}badge", re.I),
    "security_certs": re.compile(r"\b(soc 2|iso 27001|gdpr|pci|hipaa|encrypted|security)\b", re.I),
    "license_number": re.compile(r"\b(license[ #]?\w*\d|licence[ #]?\w*\d|license number|registered.{0,6}\d)\b", re.I),
    "insured_badge": re.compile(r"\b(insured|fully insured|liability insurance)\b", re.I),
    "warranty": re.compile(r"\b(warranty|warranties|guarantee|money[ -]back)\b", re.I),
    "reviews": re.compile(r"\b(reviews?|rating|stars?|★|⭐)\b", re.I),
    "rating": re.compile(r"\b\d\.\d\s*(stars?|★|/\s*5|out of 5)\b", re.I),
    "hours": re.compile(r"\b(hours of operation|opening hours|mon|tue|wed|thu|fri|sat|sun)\b.*\b(am|pm|\d:\d\d)\b", re.I),
    "years_in_business": re.compile(r"\bsince\s+(19|20)\d{2}\b|\b\d{1,2}\+?\s*years\b", re.I),
    "credentials": re.compile(r"\b(certified|licensed|accredited|qualified|registered|chartered)\b", re.I),
    "years_in_practice": re.compile(r"\b(\d{1,2}\+?\s*years?\s*(in (practice|business|industry)|experience))\b", re.I),
    "shipping_policy": re.compile(r"\b(shipping policy|delivery info|free shipping)\b|/shipping", re.I),
    "return_policy": re.compile(r"\b(return policy|easy returns|money back)\b|/returns?", re.I),
    "secure_checkout_badge": re.compile(r"\b(secure checkout|ssl|https checkout|safe payments?)\b|stripe|paypal", re.I),
    "author_bio": re.compile(r"\b(about the author|author bio)\b|class=\"[^\"]*\bauthor\b", re.I),
    "publish_date": re.compile(r"\b(published|posted) on\b|datetime=\"|datePublished", re.I),
    "modified_date": re.compile(r"\b(updated|last reviewed|last modified)\b|dateModified", re.I),
    "sources_cited": re.compile(r"\b(sources?|references?|further reading|footnote)\b", re.I),
}


FORBIDDEN_PSYCH_SIGNATURES: dict[str, re.Pattern] = {
    "fake_scarcity": re.compile(r"\b(only \d+ (left|remaining|spots?)|hurry|limited (time|stock)|while supplies last)\b", re.I),
    "fake_countdown": re.compile(r"\b(countdown|expires in|deal ends|sale ends)\b|data-countdown", re.I),
    "false_urgency": re.compile(r"\b(act now|don't miss out|last chance|today only)\b", re.I),
    "fake_inventory_count": re.compile(r"\b(only \d+ left|stock running low|low stock)\b", re.I),
    "fake_inventory": re.compile(r"\b(only \d+ left|stock running low|low stock)\b", re.I),
    "high_pressure_tactics": re.compile(r"\b(act now|now or never|once-in-a-lifetime|don't wait)\b", re.I),
    "clickbait": re.compile(r"\b(you won't believe|shocking|this one weird trick|doctors hate)\b", re.I),
}


class Checker(BaseChecker):
    name = "niche_compliance"
    category_label = "Niche Compliance"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        profile = self.config.get("niche_overrides") or {}
        body_text = text_of(soup)
        haystack = (html + "\n" + body_text)

        ctas = profile.get("required_cta_types") or []
        for cta in ctas:
            pattern = CTA_SIGNATURES.get(cta)
            if not pattern:
                result.add(CheckResult(
                    f"required_cta_{cta}",
                    True,
                    f"unknown CTA type '{cta}' (no signature configured)",
                ))
                continue
            result.add(CheckResult(
                f"required_cta_{cta}",
                bool(pattern.search(haystack)),
                f"required CTA '{cta}' not detected on page",
            ))

        trust = profile.get("required_trust_signals") or []
        for signal in trust:
            pattern = TRUST_SIGNATURES.get(signal)
            if not pattern:
                result.add(CheckResult(
                    f"required_trust_{signal}",
                    True,
                    f"unknown trust signal '{signal}'",
                ))
                continue
            result.add(CheckResult(
                f"required_trust_{signal}",
                bool(pattern.search(haystack)),
                f"required trust signal '{signal}' not detected on page",
            ))

        forbidden = profile.get("forbidden_psychology") or []
        for forbidden_key in forbidden:
            pattern = FORBIDDEN_PSYCH_SIGNATURES.get(forbidden_key)
            if not pattern:
                result.add(CheckResult(
                    f"forbidden_{forbidden_key}",
                    True,
                    f"unknown psychology key '{forbidden_key}'",
                ))
                continue
            match = pattern.search(haystack)
            result.add(CheckResult(
                f"forbidden_{forbidden_key}",
                not match,
                f"forbidden psychology pattern '{forbidden_key}' detected: {match.group(0) if match else ''}",
            ))

        if not ctas and not trust and not forbidden:
            result.add(CheckResult(
                "niche_profile_loaded",
                False,
                "no niche profile loaded — auto-detect failed or generic.json has no requirements",
            ))
