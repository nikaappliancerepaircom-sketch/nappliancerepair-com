"""E-E-A-T Signals — 15 parameters. Experience / Expertise / Authoritativeness / Trustworthiness."""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, text_of


_ORG_SUBTYPES = {
    "Corporation", "EducationalOrganization", "GovernmentOrganization",
    "LocalBusiness", "MedicalOrganization", "NGO", "NewsMediaOrganization",
    "MarketingAgency", "AdvertisingAgency", "ProfessionalService",
    "FinancialService", "LegalService", "MedicalBusiness", "Restaurant",
    "Store", "AutomotiveBusiness", "FoodEstablishment", "HomeAndConstructionBusiness",
    "HealthAndBeautyBusiness", "EmergencyService",
}
_LOCALBIZ_SUBTYPES = _ORG_SUBTYPES - {"Corporation", "EducationalOrganization",
                                      "GovernmentOrganization", "MedicalOrganization",
                                      "NGO", "NewsMediaOrganization"}


def _has_schema_type(blocks: list[dict[str, Any]], wanted: str) -> bool:
    expansion = {wanted}
    if wanted == "Organization":
        expansion |= _ORG_SUBTYPES
    elif wanted == "LocalBusiness":
        expansion |= _LOCALBIZ_SUBTYPES
    for b in blocks:
        t = b.get("@type")
        types = {t} if isinstance(t, str) else set(t) if isinstance(t, list) else set()
        if types & expansion:
            return True
    return False


def _parse_json_ld(soup: BeautifulSoup) -> list[dict[str, Any]]:
    out = []
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"}):
        raw = tag.string or tag.get_text() or ""
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if isinstance(data, list):
            out.extend(d for d in data if isinstance(d, dict))
        elif isinstance(data, dict):
            graph = data.get("@graph")
            if isinstance(graph, list):
                out.extend(g for g in graph if isinstance(g, dict))
            else:
                out.append(data)
    return out


class Checker(BaseChecker):
    name = "eeat"
    category_label = "E-E-A-T Signals"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        body_text = text_of(soup)
        body_lower = body_text.lower()
        blocks = _parse_json_ld(soup)

        # Experience (4)
        author_meta = soup.find("meta", attrs={"name": "author"})
        author_in_schema = _has_schema_type(blocks, "Person") or any(
            b.get("author") for b in blocks
        )
        result.add(CheckResult(
            "author_signal",
            bool(author_meta) or author_in_schema,
            "no author meta tag and no Person schema",
        ))

        result.add(CheckResult(
            "author_bio_or_byline",
            bool(soup.find(class_=re.compile(r"author|byline|by-line", re.I)))
            or bool(soup.find(string=re.compile(r"\bby [A-Z][a-z]+\b"))),
            "no author bio / byline element found",
        ))

        years_old = max(0, date.today().year - (self.business.get("founded_year") or date.today().year))
        years_phrase_present = bool(re.search(
            r"\b(\d{1,2})\s*\+?\s*years\b|\bsince\s+(19|20)\d{2}\b",
            body_lower,
        ))
        result.add(CheckResult(
            "years_in_business_signal",
            years_phrase_present or years_old < 2,
            f"no 'X years' / 'since YYYY' phrase (founded {self.business.get('founded_year')})",
        ))

        first_person = bool(re.search(r"\b(we\s|our\s|we'?ve\s|we'?re\s)", body_lower))
        result.add(CheckResult(
            "first_person_voice_used",
            first_person,
            "no first-person 'we'/'our' (real-experience signal)",
        ))

        # Expertise (4)
        result.add(CheckResult(
            "subject_expertise_terms",
            len(re.findall(r"\b(certified|licensed|accredited|specialist|expert|professional|qualified)\b", body_lower)) >= 1,
            "no expertise terms (certified, licensed, expert, ...)",
        ))

        case_study_or_examples = bool(re.search(
            r"\b(case study|case studies|portfolio|recent work|client story|client stories|results)\b",
            body_lower,
        ))
        result.add(CheckResult(
            "case_studies_or_portfolio_referenced",
            case_study_or_examples,
            "no case studies / portfolio referenced",
        ))

        process_described = bool(soup.find_all(["ol", "ul"])) and bool(re.search(
            r"\b(step|process|how it works|our approach|methodology)\b",
            body_lower,
        ))
        result.add(CheckResult(
            "process_or_methodology_documented",
            process_described,
            "no process / methodology documented",
        ))

        external_authoritative = [
            a["href"] for a in soup.find_all("a", href=True)
            if re.search(
                r"(\.gov|\.edu|wikipedia\.org|forbes\.com|nytimes\.com|hbr\.org|nature\.com|google\.com/search)",
                a["href"],
            )
        ]
        result.add(CheckResult(
            "external_authority_links",
            len(external_authoritative) >= 1,
            "no outbound links to authoritative sources" if not external_authoritative else "ok",
        ))

        # Authoritativeness (4)
        result.add(CheckResult(
            "organization_schema_present",
            _has_schema_type(blocks, "Organization") or _has_schema_type(blocks, "LocalBusiness"),
            "no Organization/LocalBusiness schema",
        ))

        result.add(CheckResult(
            "social_links_in_footer_or_schema",
            any(b.get("sameAs") for b in blocks)
            or bool(soup.find("a", href=re.compile(
                r"linkedin\.com|twitter\.com|x\.com|facebook\.com|instagram\.com",
            ))),
            "no social profile links / no sameAs in schema",
        ))

        result.add(CheckResult(
            "credentials_or_awards_mentioned",
            bool(re.search(
                r"\b(award|recognition|certified|featured in|as seen on|partner of|trusted by|member of)\b",
                body_lower,
            )),
            "no awards / credentials / press mentions",
        ))

        team_signal = bool(soup.find(class_=re.compile(r"team|founder|about-us|leadership", re.I))) or "founder" in body_lower
        result.add(CheckResult(
            "team_or_leadership_visible",
            team_signal,
            "no team / leadership signals",
        ))

        # Trustworthiness (3)
        result.add(CheckResult(
            "https_only_resources",
            "http://" not in html.replace("https://", ""),
            "page references http:// resources",
        ))

        privacy_or_terms_link = bool(soup.find("a", href=re.compile(
            r"privacy|terms|cookie", re.I,
        )))
        result.add(CheckResult(
            "privacy_terms_link_present",
            privacy_or_terms_link,
            "no link to privacy / terms / cookie policy",
        ))

        result.add(CheckResult(
            "trust_badges_or_guarantees",
            bool(re.search(
                r"\b(money-?back|guarantee|warranty|satisfaction|secure|verified|trusted|insured)\b",
                body_lower,
            )),
            "no trust badges / guarantee language",
        ))
