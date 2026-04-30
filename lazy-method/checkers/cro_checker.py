"""CRO — 20 parameters."""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, text_of


CTA_KEYWORDS = re.compile(
    r"\b(call|book|contact|get|start|sign up|subscribe|buy|order|request|"
    r"schedule|consult|demo|trial|quote)\b",
    re.I,
)


class Checker(BaseChecker):
    name = "cro"
    category_label = "CRO"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        body_text = text_of(soup)
        body_lower = body_text.lower()
        is_local = self.business.get("is_local", False)

        # Above the fold (5)
        h1 = soup.find("h1")
        h1_text = h1.get_text(strip=True) if h1 else ""
        result.add(CheckResult(
            "h1_value_proposition",
            len(h1_text.split()) >= 4,
            f"h1 too short: '{h1_text}'",
        ))

        first_section_text = ""
        for el in soup.find_all(["section", "header", "div"]):
            text = el.get_text(" ", strip=True)
            if len(text.split()) > 20:
                first_section_text = text[:600]
                break

        result.add(CheckResult(
            "intro_paragraph_under_hero",
            len(first_section_text.split()) >= 20,
            "no substantive intro section near top",
        ))

        cta_buttons = [
            el for el in soup.find_all(["a", "button"])
            if CTA_KEYWORDS.search(el.get_text(" ", strip=True))
        ]
        result.add(CheckResult(
            "primary_cta_present",
            len(cta_buttons) >= 1,
            "no CTA button found",
        ))

        if is_local:
            result.add(CheckResult(
                "phone_visible_in_header",
                bool(soup.find("a", href=re.compile(r"^tel:"))),
                "no tel: link (mobile click-to-call)",
            ))
            trust_signal = bool(re.search(
                r"\b(rated|reviews|stars|guarantee|warranty|certified|insured)\b",
                body_lower,
            ))
            result.add(CheckResult(
                "trust_signal_above_fold",
                trust_signal,
                "no trust signal phrasing",
            ))
        else:
            trial_or_demo = bool(re.search(r"\b(free trial|demo|get started|try free)\b", body_lower))
            result.add(CheckResult(
                "trial_or_demo_cta",
                trial_or_demo,
                "no free-trial/demo language",
            ))
            result.add(CheckResult(
                "trust_signal_above_fold",
                bool(re.search(r"\b(trusted by|rated|reviews|certified|secure|verified)\b", body_lower)),
                "no trust signals",
            ))

        # CTAs (5)
        result.add(CheckResult(
            "cta_count_at_least_5",
            len(cta_buttons) >= 5,
            f"{len(cta_buttons)} CTAs (min 5)",
        ))

        # CTA type diversity
        cta_types = set()
        for cta in cta_buttons:
            href = cta.get("href", "") if cta.name == "a" else ""
            text = cta.get_text(" ", strip=True).lower()
            if href.startswith("tel:"):
                cta_types.add("phone")
            elif href.startswith("mailto:"):
                cta_types.add("email")
            elif "form" in text or any(p.find("form") for p in cta.parents):
                cta_types.add("form")
            elif re.search(r"\b(book|schedule|consult|demo)\b", text):
                cta_types.add("booking")
            elif re.search(r"\b(buy|order|cart|checkout)\b", text):
                cta_types.add("purchase")
            else:
                cta_types.add("link")
        result.add(CheckResult(
            "cta_type_diversity",
            len(cta_types) >= 2,
            f"only {len(cta_types)} CTA types: {sorted(cta_types)}",
        ))

        action_verbs = re.compile(r"\b(call|book|get|start|claim|grab|join)\b", re.I)
        action_oriented = sum(
            1 for c in cta_buttons if action_verbs.search(c.get_text(" ", strip=True))
        )
        result.add(CheckResult(
            "action_oriented_cta_copy",
            action_oriented >= max(1, len(cta_buttons) // 2),
            f"only {action_oriented}/{len(cta_buttons)} CTAs use action verbs",
        ))

        learn_more_only = sum(
            1 for c in cta_buttons
            if c.get_text(strip=True).lower() in ("learn more", "read more", "click here")
        )
        result.add(CheckResult(
            "no_weak_cta_copy",
            learn_more_only <= max(1, len(cta_buttons) // 4),
            f"{learn_more_only} weak 'learn more' CTAs",
        ))

        sticky_cta = bool(soup.find(class_=re.compile(r"sticky|fixed|floating", re.I)))
        result.add(CheckResult(
            "mobile_sticky_or_floating_cta",
            sticky_cta,
            "no sticky/fixed/floating CTA element",
        ))

        # Forms (5)
        forms = soup.find_all("form")
        result.add(CheckResult(
            "form_present",
            len(forms) >= 1,
            "no form on page",
        ))

        small_forms = []
        for form in forms:
            input_count = len([
                i for i in form.find_all(["input", "textarea", "select"])
                if i.get("type") not in ("hidden", "submit", "button")
            ])
            small_forms.append(input_count)
        result.add(CheckResult(
            "form_minimal_fields",
            all(c <= 6 for c in small_forms) if small_forms else True,
            f"forms have {small_forms} input fields (max 6 each)",
        ))

        submit_buttons = soup.find_all(["button", "input"], attrs={"type": "submit"})
        result.add(CheckResult(
            "submit_button_present",
            len(submit_buttons) >= 1 if forms else True,
            "no submit button in forms",
        ))

        privacy_near_form = "privacy" in body_lower or "won't spam" in body_lower or "your data" in body_lower
        result.add(CheckResult(
            "privacy_assurance_near_form",
            privacy_near_form if forms else True,
            "no privacy assurance language",
        ))

        result.add(CheckResult(
            "form_validation_attributes",
            any(
                inp.get("required") is not None or inp.get("pattern") or inp.get("type") == "email"
                for f in forms for inp in f.find_all(["input", "textarea"])
            ) if forms else True,
            "forms lack validation attributes (required/pattern/type=email)",
        ))

        # Friction (5)
        result.add(CheckResult(
            "no_modal_on_load",
            'data-show-on-load' not in html.lower() and 'modal--open' not in html.lower(),
            "page seems to open a modal on load",
        ))

        result.add(CheckResult(
            "click_to_call_direct",
            bool(soup.find("a", href=re.compile(r"^tel:"))) if is_local else True,
            "no tel: link" if is_local else "n/a",
        ))

        # Login wall? Look for login forms blocking content (heuristic)
        login_form = bool(soup.find("input", attrs={"type": "password"}))
        result.add(CheckResult(
            "no_login_wall",
            not login_form,
            "page contains password field (potential login wall)",
        ))

        nav = soup.find("nav")
        nav_links = nav.find_all("a") if nav else []
        result.add(CheckResult(
            "navigation_max_seven_items",
            len(nav_links) <= 7 or nav is None,
            f"{len(nav_links)} top-level nav links",
        ))

        result.add(CheckResult(
            "secondary_cta_below_fold",
            len(cta_buttons) >= 3,
            f"{len(cta_buttons)} CTAs (need 3+ for full-page coverage)",
        ))
