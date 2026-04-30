"""Schema.org 2026 — 10 parameters."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult


def _parse_json_ld(soup: BeautifulSoup) -> list[dict[str, Any]]:
    blocks = soup.find_all("script", attrs={"type": "application/ld+json"})
    parsed: list[dict[str, Any]] = []
    for b in blocks:
        raw = b.string or b.get_text() or ""
        if not raw.strip():
            continue
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if isinstance(data, list):
            parsed.extend(d for d in data if isinstance(d, dict))
        elif isinstance(data, dict):
            graph = data.get("@graph")
            if isinstance(graph, list):
                parsed.extend(g for g in graph if isinstance(g, dict))
            else:
                parsed.append(data)
    return parsed


def _types(blocks: list[dict[str, Any]]) -> set[str]:
    out: set[str] = set()
    for b in blocks:
        t = b.get("@type")
        if isinstance(t, list):
            out.update(t)
        elif isinstance(t, str):
            out.add(t)
    return out


# Schema.org subtype expansions: if any of the listed subtypes is present,
# treat the parent type as also present.
SUBTYPE_OF: dict[str, set[str]] = {
    "Organization": {
        "Corporation", "EducationalOrganization", "GovernmentOrganization",
        "LocalBusiness", "MedicalOrganization", "NGO", "NewsMediaOrganization",
        "PerformingGroup", "SportsOrganization", "Airline", "Consortium",
        "FundingScheme", "LibrarySystem", "OnlineBusiness", "Project",
        "ResearchOrganization", "WorkersUnion",
        "MarketingAgency", "AdvertisingAgency", "WebDesignCompany",
        "ProfessionalService", "FinancialService", "LegalService",
        "MedicalBusiness", "Restaurant", "Store", "AutomotiveBusiness",
        "ChildCare", "Dentist", "DryCleaningOrLaundry", "EmploymentAgency",
        "EntertainmentBusiness", "FoodEstablishment", "GovernmentOffice",
        "HealthAndBeautyBusiness", "HomeAndConstructionBusiness", "InternetCafe",
        "Library", "LodgingBusiness", "MedicalClinic", "RadioStation",
        "RealEstateAgent", "RecyclingCenter", "SelfStorage", "ShoppingCenter",
        "SportsActivityLocation", "TelevisionStation", "TouristInformationCenter",
        "TravelAgency",
    },
    "LocalBusiness": {
        "AnimalShelter", "ArchiveOrganization", "AutomotiveBusiness", "ChildCare",
        "Dentist", "DryCleaningOrLaundry", "EmergencyService", "EmploymentAgency",
        "EntertainmentBusiness", "FinancialService", "FoodEstablishment",
        "GovernmentOffice", "HealthAndBeautyBusiness", "HomeAndConstructionBusiness",
        "InternetCafe", "LegalService", "Library", "LodgingBusiness",
        "MedicalBusiness", "ProfessionalService", "RadioStation", "RealEstateAgent",
        "RecyclingCenter", "SelfStorage", "ShoppingCenter", "SportsActivityLocation",
        "Store", "TelevisionStation", "TouristInformationCenter", "TravelAgency",
        "Restaurant", "MarketingAgency",
    },
}


def _expand_with_subtypes(types: set[str]) -> set[str]:
    expanded = set(types)
    for parent, children in SUBTYPE_OF.items():
        if types & children:
            expanded.add(parent)
    return expanded


class Checker(BaseChecker):
    name = "schema"
    category_label = "Schema.org 2026"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        blocks = _parse_json_ld(soup)
        types = _expand_with_subtypes(_types(blocks))
        required = set(self.rules.get("required_schemas", []))

        result.add(CheckResult(
            "json_ld_present",
            len(blocks) >= 1,
            f"{len(blocks)} JSON-LD blocks parsed",
        ))

        result.add(CheckResult(
            "json_ld_valid",
            all(isinstance(b, dict) and b.get("@type") for b in blocks) if blocks else False,
            "every block must be a valid object with @type",
        ))

        for required_type in required:
            result.add(CheckResult(
                f"required_schema_{required_type.lower()}",
                required_type in types,
                f"missing {required_type} schema (found: {sorted(types)})",
            ))

        # Always-required: BreadcrumbList
        if "BreadcrumbList" not in required:
            result.add(CheckResult(
                "breadcrumb_list_schema",
                "BreadcrumbList" in types,
                "BreadcrumbList not present",
            ))

        # FAQPage strongly recommended
        result.add(CheckResult(
            "faq_page_schema",
            "FAQPage" in types,
            "FAQPage schema not present (helps AI Overviews)",
        ))

        # @context check
        bad_ctx = [
            b for b in blocks
            if b.get("@context") and "schema.org" not in str(b["@context"])
        ]
        result.add(CheckResult(
            "schema_context_correct",
            not bad_ctx,
            f"{len(bad_ctx)} blocks with bad @context" if bad_ctx else "ok",
        ))

        # Aggregate rating if business has reviews
        review_count = self.business.get("review_count") or 0
        if review_count > 0:
            has_rating = any(b.get("aggregateRating") for b in blocks)
            result.add(CheckResult(
                "aggregate_rating_schema",
                has_rating,
                "business has reviews but no aggregateRating in schema",
            ))
            has_review_objects = any(
                "Review" in (str(b.get("@type")) + str(b.get("review", "")))
                for b in blocks
            )
            result.add(CheckResult(
                "review_objects_present",
                has_review_objects,
                "no Review objects in JSON-LD" if not has_review_objects else "ok",
            ))
        else:
            result.add(CheckResult("aggregate_rating_schema", True, "n/a (no reviews configured)"))
            result.add(CheckResult("review_objects_present", True, "n/a (no reviews configured)"))

        # Organization or LocalBusiness with sameAs (social profiles)
        org_blocks = [
            b for b in blocks
            if (b.get("@type") in ("Organization", "LocalBusiness", "Restaurant",
                                   "ProfessionalService", "Store", "NewsMediaOrganization")
                or (isinstance(b.get("@type"), list)
                    and any(t in b["@type"] for t in ("Organization", "LocalBusiness"))))
        ]
        has_sameas = any(b.get("sameAs") for b in org_blocks)
        result.add(CheckResult(
            "org_schema_with_same_as",
            has_sameas,
            "Organization/LocalBusiness lacks sameAs (social profiles)",
        ))

        # No invalid duplicates of @type Organization vs site name
        site_name = self.site.get("name", "")
        org_names_match = (
            not org_blocks
            or any(site_name.lower() in str(b.get("name", "")).lower() for b in org_blocks)
        )
        result.add(CheckResult(
            "org_name_matches_site",
            org_names_match,
            f"organization schema name does not match site '{site_name}'",
        ))

        # JSON-LD parses without errors (count vs raw blocks)
        raw_blocks = soup.find_all("script", attrs={"type": "application/ld+json"})
        result.add(CheckResult(
            "all_json_ld_parse_clean",
            len(blocks) >= len(raw_blocks),
            f"{len(raw_blocks) - len(blocks)} JSON-LD blocks failed to parse",
        ))
