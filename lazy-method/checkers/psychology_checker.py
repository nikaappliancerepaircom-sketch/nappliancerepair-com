"""Psychology Triggers — 20 parameters. Honest, no fake urgency."""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, text_of


class Checker(BaseChecker):
    name = "psychology"
    category_label = "Psychology"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        body_text = text_of(soup)
        body_lower = body_text.lower()

        # Pain-Solve (3)
        pain_phrases = re.compile(
            r"\b(struggling|frustrated|tired of|wasting|losing|broken|failing|problem|pain point|challenge)\b",
            re.I,
        )
        result.add(CheckResult(
            "pain_points_identified",
            len(pain_phrases.findall(body_text)) >= 1,
            "no pain-point language",
        ))

        solution_words = re.compile(
            r"\b(solve|fix|repair|eliminate|resolve|streamline|simplify|optimize|automate)\b",
            re.I,
        )
        result.add(CheckResult(
            "solutions_offered",
            len(solution_words.findall(body_text)) >= 2,
            "no solution language",
        ))

        before_after = bool(re.search(r"\b(before|previously|used to)\b.*\b(now|today|after)\b", body_lower))
        result.add(CheckResult(
            "before_after_or_outcome_described",
            before_after or "result" in body_lower or "outcome" in body_lower,
            "no before/after framing or outcomes described",
        ))

        # AIDA (4)
        h1 = soup.find("h1")
        h1_text = h1.get_text(strip=True) if h1 else ""
        attention = (
            "?" in h1_text
            or any(c.isdigit() for c in h1_text)
            or len(h1_text.split()) >= 5
        )
        result.add(CheckResult(
            "h1_attention_grabbing",
            attention,
            f"h1 lacks question/number/length: '{h1_text}'",
        ))

        result.add(CheckResult(
            "interest_first_paragraph_substantive",
            bool(soup.find("p") and len(soup.find("p").get_text(strip=True).split()) >= 25),
            "first paragraph too short (interest)",
        ))

        benefits_words = re.compile(
            r"\b(save|grow|increase|reduce|earn|gain|achieve|unlock|deliver|results)\b",
            re.I,
        )
        result.add(CheckResult(
            "desire_benefits_focused",
            len(benefits_words.findall(body_text)) >= 3,
            "few benefit-focused phrases",
        ))

        cta_count = len(soup.find_all(["a", "button"], string=re.compile(
            r"\b(call|book|get|start|contact|sign up|buy|request)\b", re.I,
        )))
        result.add(CheckResult(
            "action_multiple_ctas",
            cta_count >= 3,
            f"{cta_count} action CTAs (min 3)",
        ))

        # Social Proof (4)
        testimonials = soup.find_all(class_=re.compile(r"testimonial|review|quote", re.I))
        result.add(CheckResult(
            "testimonials_present",
            len(testimonials) >= 1
            or bool(re.search(r"\b(testimonial|review|client says|customer says)\b", body_lower)),
            "no testimonial/review block",
        ))

        rating = self.business.get("rating") or 0
        review_count = self.business.get("review_count") or 0
        if rating > 0 and review_count > 0:
            rating_visible = (
                f"{rating}" in body_text
                or "★" in body_text
                or "stars" in body_lower
            )
            result.add(CheckResult(
                "rating_visible",
                rating_visible,
                f"rating {rating} not visible",
            ))
            result.add(CheckResult(
                "review_count_visible",
                str(review_count) in body_text,
                f"review count {review_count} not visible",
            ))
        else:
            result.add(CheckResult("rating_visible", True, "n/a (no rating)"))
            result.add(CheckResult("review_count_visible", True, "n/a (no reviews)"))

        client_logos_or_names = bool(soup.find(class_=re.compile(r"client|logo|brand|featured", re.I)))
        result.add(CheckResult(
            "client_logos_or_named_brands",
            client_logos_or_names,
            "no client logos / featured-in section",
        ))

        # Scarcity & Urgency (3) — must be honest
        urgency_words = re.compile(
            r"\b(today|same-?day|this week|same day|limited|hurry|act now)\b",
            re.I,
        )
        urgency_present = bool(urgency_words.search(body_lower))
        result.add(CheckResult(
            "urgency_or_timeliness_present",
            urgency_present,
            "no urgency / timeliness language",
        ))

        forbidden_phrases = self.rules.get("no_fake_urgency_phrases", [])
        forbidden_lower = [p.lower() for p in forbidden_phrases]
        # 'limited time', 'act now' — match exactly. 'only X spots left' — pattern.
        fake_found = []
        for phrase in forbidden_lower:
            if "x" in phrase:
                pattern = re.escape(phrase).replace(r"\ x", r"\s+\d+")
                if re.search(pattern, body_lower):
                    fake_found.append(phrase)
            elif phrase in body_lower:
                fake_found.append(phrase)
        result.add(CheckResult(
            "no_forbidden_urgency_phrases",
            not fake_found,
            f"forbidden urgency phrases: {fake_found}",
        ))

        countdown = bool(re.search(r"\b(countdown|timer|expires in)\b", body_lower)) or "data-countdown" in html.lower()
        result.add(CheckResult(
            "no_countdown_timers",
            not countdown,
            "page contains countdown / timer / expires-in",
        ))

        # Authority & Trust (6)
        founded = self.business.get("founded_year")
        years_phrase = bool(re.search(r"\bsince\s+(19|20)\d{2}\b|\b\d{1,2}\+?\s*years\b", body_lower))
        result.add(CheckResult(
            "years_in_business_visible",
            years_phrase if founded else True,
            "no 'since YYYY' / 'X years' phrase",
        ))

        result.add(CheckResult(
            "credentials_present",
            bool(re.search(r"\b(certified|licensed|accredited|qualified|registered)\b", body_lower)),
            "no credentials referenced",
        ))

        result.add(CheckResult(
            "guarantee_or_warranty",
            bool(re.search(r"\b(guarantee|warranty|money-back|satisfaction)\b", body_lower)),
            "no guarantee / warranty language",
        ))

        result.add(CheckResult(
            "named_team_or_founder",
            bool(soup.find(class_=re.compile(r"team|founder|leadership|about-us", re.I))),
            "no team/founder/leadership block",
        ))

        # Reciprocity / value
        free_value = bool(re.search(r"\b(free (guide|consultation|audit|estimate|quote))\b", body_lower))
        result.add(CheckResult(
            "free_value_offered",
            free_value,
            "no free guide/consultation/audit offered (reciprocity)",
        ))

        # Specificity = trust signal
        numbers = re.findall(r"\b\d{2,}\b", body_text)
        result.add(CheckResult(
            "specific_numbers_used",
            len(numbers) >= 5,
            f"only {len(numbers)} numeric figures (specificity boosts trust)",
        ))
