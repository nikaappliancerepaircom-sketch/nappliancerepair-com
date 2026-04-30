"""SEO Advanced — 30 parameters for 2026-2027 top-rank optimization.

Covers: search intent matching, topical depth, featured snippets, voice answers,
advanced schema (HowTo/Video/Image), hreflang, CTR-optimized meta, deep image SEO.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, text_of


INTENT_PATTERNS = {
    "informational": re.compile(
        r"\b(how to|what is|why|guide|tutorial|learn|tips|steps|examples|definition|meaning)\b",
        re.I,
    ),
    "commercial": re.compile(
        r"\b(best|top \d+|review|compare|vs\.?|alternative|alternatives|"
        r"comparison|features|pricing|cheapest)\b",
        re.I,
    ),
    "transactional": re.compile(
        r"\b(buy|order|book|get a quote|hire|sign up|subscribe|free trial|"
        r"call now|schedule|reserve)\b",
        re.I,
    ),
    "navigational": re.compile(r"\b(login|sign in|contact|about us|home|dashboard)\b", re.I),
}


POWER_WORDS = re.compile(
    r"\b(best|ultimate|proven|guaranteed|essential|complete|definitive|"
    r"powerful|expert|professional|exclusive|advanced|2026|2027)\b",
    re.I,
)


def _parse_json_ld(soup: BeautifulSoup) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
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


def _detect_intent(h1_text: str, title: str, body_lower: str) -> str:
    """Return the strongest intent based on H1 + title text."""
    text = (h1_text + " " + title).lower()
    scores = {intent: len(p.findall(text)) for intent, p in INTENT_PATTERNS.items()}
    # If nothing matches in title/H1, look in body
    if not any(scores.values()):
        scores = {
            intent: min(3, len(p.findall(body_lower)))
            for intent, p in INTENT_PATTERNS.items()
        }
    return max(scores, key=scores.get) if any(scores.values()) else "unknown"


class Checker(BaseChecker):
    name = "seo_advanced"
    category_label = "SEO Advanced (2026)"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        body_text = text_of(soup)
        body_lower = body_text.lower()

        title_tag = soup.find("title")
        title_text = title_tag.get_text(strip=True) if title_tag else ""
        h1 = soup.find("h1")
        h1_text = h1.get_text(strip=True) if h1 else ""

        meta_desc = soup.find("meta", attrs={"name": "description"})
        meta_desc_text = meta_desc.get("content", "").strip() if meta_desc else ""

        blocks = _parse_json_ld(soup)

        # 1. Search Intent Matching (5)
        detected_intent = _detect_intent(h1_text, title_text, body_lower)
        result.add(CheckResult(
            "search_intent_detectable",
            detected_intent != "unknown",
            f"could not detect intent from title/h1: '{title_text}' / '{h1_text}'",
        ))

        intent_signals_in_h1 = (
            INTENT_PATTERNS.get(detected_intent, re.compile("$.")).search(h1_text)
            if detected_intent != "unknown" else None
        )
        result.add(CheckResult(
            "h1_signals_intent",
            bool(intent_signals_in_h1) or detected_intent == "navigational",
            f"detected intent={detected_intent} but H1 lacks intent words",
        ))

        # CTAs match intent type
        ctas = [
            el.get_text(" ", strip=True).lower()
            for el in soup.find_all(["a", "button"])
            if el.get_text(strip=True)
        ]
        cta_text = " ".join(ctas)

        intent_cta_alignment = {
            "informational": ["learn", "read", "guide", "discover", "explore"],
            "commercial": ["compare", "see plans", "pricing", "review", "vs"],
            "transactional": ["buy", "book", "order", "call", "get", "start", "sign up"],
            "navigational": ["login", "contact", "about"],
            "unknown": [],
        }
        expected_cta_words = intent_cta_alignment.get(detected_intent, [])
        cta_aligned = any(w in cta_text for w in expected_cta_words)
        result.add(CheckResult(
            "ctas_aligned_with_intent",
            cta_aligned or detected_intent == "unknown",
            f"intent={detected_intent} but no matching CTAs ({expected_cta_words})",
        ))

        # Page structure matches intent
        if detected_intent == "informational":
            structure_ok = len(soup.find_all(["h2", "h3"])) >= 5 and len(soup.find_all(["ul", "ol"])) >= 2
        elif detected_intent == "commercial":
            structure_ok = bool(soup.find("table")) or len(soup.find_all(["ul", "ol"])) >= 3
        elif detected_intent == "transactional":
            structure_ok = bool(soup.find("form")) or bool(soup.find("a", href=re.compile(r"^tel:|^mailto:")))
        else:
            structure_ok = True
        result.add(CheckResult(
            "structure_matches_intent",
            structure_ok,
            f"intent={detected_intent} but structure missing expected elements",
        ))

        result.add(CheckResult(
            "title_contains_intent_signal",
            bool(intent_signals_in_h1) or any(
                p.search(title_text) for p in INTENT_PATTERNS.values()
            ),
            f"title lacks intent words: '{title_text}'",
        ))

        # 2. Topical Depth (5)
        h2_h3_text = " ".join(h.get_text(" ", strip=True) for h in soup.find_all(["h2", "h3"]))
        unique_subtopic_words = {
            w.lower() for w in re.findall(r"[A-Za-z]{4,}", h2_h3_text)
            if w.lower() not in {"with", "this", "that", "your", "from", "what", "have", "been"}
        }
        result.add(CheckResult(
            "subtopic_breadth",
            len(unique_subtopic_words) >= 12,
            f"only {len(unique_subtopic_words)} unique sub-topic words across H2/H3 (min 12)",
        ))

        external_authority = sum(
            1 for a in soup.find_all("a", href=True)
            if re.search(r"\.(gov|edu)|wikipedia\.org|nature\.com|hbr\.org|forbes\.com|nytimes\.com|reuters\.com|who\.int", a["href"])
        )
        result.add(CheckResult(
            "external_entity_links",
            external_authority >= 1,
            f"{external_authority} authority outbound links (need 1+)",
        ))

        related_internal = len([
            a for a in soup.find_all("a", href=True)
            if a["href"].startswith("/") and a["href"].count("/") >= 2
        ])
        result.add(CheckResult(
            "related_internal_links",
            related_internal >= 3,
            f"{related_internal} deep internal links (need 3+ to sub-pages)",
        ))

        glossary_or_definitions = bool(soup.find("dl")) or bool(re.search(
            r"\b(glossary|definition|key terms|what is|defined as)\b",
            body_lower,
        ))
        result.add(CheckResult(
            "definitions_or_glossary",
            glossary_or_definitions,
            "no glossary / definition list / 'what is' block",
        ))

        h_levels = [int(h.name[1]) for h in soup.find_all(re.compile(r"^h[1-6]$"))]
        result.add(CheckResult(
            "topical_hierarchy_three_levels",
            len(set(h_levels)) >= 3,
            f"only {len(set(h_levels))} heading levels used (need 3+ for topical depth)",
        ))

        # 3. Featured Snippet & Voice (5)
        # 40-50 word definition block (after a "what is X?" pattern)
        snippet_block_found = False
        for h in soup.find_all(["h2", "h3"]):
            ht = h.get_text(strip=True).lower()
            if ht.startswith(("what is", "what are", "how to", "how do", "why")):
                sib = h.find_next_sibling()
                if sib:
                    word_count = len(sib.get_text(" ", strip=True).split())
                    if 35 <= word_count <= 60:
                        snippet_block_found = True
                        break
        result.add(CheckResult(
            "featured_snippet_block",
            snippet_block_found,
            "no 35-60 word answer block after a 'what is' / 'how to' heading",
        ))

        # Voice answer: 25-30 words, Grade 7-8
        voice_answer_found = False
        for h in soup.find_all(["h2", "h3"]):
            if not h.get_text(strip=True).endswith("?"):
                continue
            sib = h.find_next_sibling()
            if sib:
                t = sib.get_text(" ", strip=True)
                words = t.split()
                if 20 <= len(words) <= 35:
                    voice_answer_found = True
                    break
        result.add(CheckResult(
            "voice_search_answer_block",
            voice_answer_found,
            "no 20-35 word answer paragraph after a question heading",
        ))

        # Numbered list (HowTo snippet)
        numbered_list = bool(soup.find("ol")) and any(
            len(ol.find_all("li")) >= 3 for ol in soup.find_all("ol")
        )
        result.add(CheckResult(
            "howto_numbered_list",
            numbered_list,
            "no <ol> with 3+ steps (HowTo snippet potential)",
        ))

        # Comparison table for commercial intent
        if detected_intent == "commercial":
            has_table = bool(soup.find("table"))
            result.add(CheckResult(
                "comparison_table_for_commercial_intent",
                has_table,
                "commercial intent but no <table> for comparison",
            ))
        else:
            result.add(CheckResult(
                "comparison_table_for_commercial_intent",
                True,
                "n/a (intent is not commercial)",
            ))

        # Definition list
        result.add(CheckResult(
            "definition_list_present",
            bool(soup.find("dl")),
            "no <dl> definition list (helps featured snippets)",
        ))

        # 4. Schema Advanced (5)
        types_in_schema: set[str] = set()
        for b in blocks:
            t = b.get("@type")
            if isinstance(t, list):
                types_in_schema.update(t)
            elif isinstance(t, str):
                types_in_schema.add(t)

        # HowTo if numbered list present
        if numbered_list:
            result.add(CheckResult(
                "howto_schema_when_steps_present",
                "HowTo" in types_in_schema,
                "numbered steps detected but no HowTo schema",
            ))
        else:
            result.add(CheckResult("howto_schema_when_steps_present", True, "n/a"))

        # VideoObject if video present
        if soup.find(["video", "iframe"], src=re.compile(r"youtube|vimeo|wistia", re.I)) or soup.find("video"):
            result.add(CheckResult(
                "video_schema_when_video_present",
                "VideoObject" in types_in_schema,
                "video element present but no VideoObject schema",
            ))
        else:
            result.add(CheckResult("video_schema_when_video_present", True, "n/a (no video)"))

        # dateModified or datePublished in schema (for any schema with main entity)
        has_dates = any(
            b.get("dateModified") or b.get("datePublished")
            for b in blocks
        )
        result.add(CheckResult(
            "schema_has_date_modified_or_published",
            has_dates,
            "no dateModified / datePublished anywhere in JSON-LD",
        ))

        # ImageObject schema for hero/og image
        og_image = soup.find("meta", attrs={"property": "og:image"})
        if og_image:
            has_image_schema = "ImageObject" in types_in_schema or any(
                isinstance(b.get("image"), (dict, list))
                for b in blocks
            )
            result.add(CheckResult(
                "image_schema_present",
                has_image_schema,
                "og:image present but no ImageObject in schema",
            ))
        else:
            result.add(CheckResult("image_schema_present", True, "n/a (no og:image)"))

        # sameAs for author or brand
        has_same_as = any(b.get("sameAs") for b in blocks)
        result.add(CheckResult(
            "schema_sameAs_for_entity_graph",
            has_same_as,
            "no sameAs in any JSON-LD block (entity graph signal)",
        ))

        # 5. Multi-language / Pagination (3)
        lang = (self.site.get("language") or "en").lower()
        hreflang_tags = soup.find_all("link", attrs={"rel": "alternate", "hreflang": True})
        # If multilingual, hreflang must include x-default. If single language, no hreflang is fine.
        if hreflang_tags:
            has_x_default = any(t.get("hreflang", "").lower() == "x-default" for t in hreflang_tags)
            result.add(CheckResult(
                "hreflang_includes_x_default",
                has_x_default,
                "hreflang tags present but no x-default",
            ))
        else:
            result.add(CheckResult(
                "hreflang_includes_x_default",
                True,
                "n/a (single language site)",
            ))

        canonical = soup.find("link", attrs={"rel": "canonical"})
        canonical_href = canonical.get("href", "") if canonical else ""
        og_url_tag = soup.find("meta", attrs={"property": "og:url"})
        og_url = og_url_tag.get("content", "") if og_url_tag else ""
        result.add(CheckResult(
            "canonical_matches_og_url",
            canonical_href == og_url or not og_url,
            f"canonical='{canonical_href}' vs og:url='{og_url}'",
        ))

        # rel=next/prev for paginated content
        paginated_signal = "page=" in canonical_href or "/page/" in canonical_href
        if paginated_signal:
            has_pagination = bool(soup.find("link", attrs={"rel": ("next", "prev")}))
            result.add(CheckResult(
                "pagination_rel_next_prev",
                has_pagination,
                "page seems paginated but no rel=next/prev",
            ))
        else:
            result.add(CheckResult("pagination_rel_next_prev", True, "n/a (not paginated)"))

        # 6. CTR Optimization (4)
        result.add(CheckResult(
            "title_has_power_word_or_number",
            bool(POWER_WORDS.search(title_text) or re.search(r"\d", title_text)),
            f"title lacks power words / numbers: '{title_text}'",
        ))

        result.add(CheckResult(
            "meta_desc_has_action_verb",
            bool(re.search(r"\b(get|learn|discover|find|see|read|start|book|call|claim)\b", meta_desc_text, re.I)),
            f"meta desc lacks action verb: '{meta_desc_text}'",
        ))

        result.add(CheckResult(
            "title_no_all_caps_clickbait",
            not (title_text.isupper() and len(title_text) > 5),
            f"title is ALL CAPS: '{title_text}'",
        ))

        result.add(CheckResult(
            "meta_desc_or_title_includes_year",
            "2026" in title_text or "2026" in meta_desc_text or "2027" in title_text,
            "neither title nor meta desc include current year (freshness CTR)",
        ))

        # 7. Image SEO Deep (3)
        all_imgs = soup.find_all("img")
        if all_imgs:
            with_dims = sum(1 for img in all_imgs if img.get("width") and img.get("height"))
            result.add(CheckResult(
                "all_images_have_width_height",
                with_dims == len(all_imgs),
                f"{len(all_imgs) - with_dims}/{len(all_imgs)} images missing width/height (CLS risk)",
            ))

            with_modern_format = sum(
                1 for img in all_imgs
                if (img.get("src") or "").lower().endswith((".webp", ".avif"))
                or img.find_parent("picture")
            )
            result.add(CheckResult(
                "images_use_modern_format",
                with_modern_format >= len(all_imgs) * 0.5,
                f"only {with_modern_format}/{len(all_imgs)} images use webp/avif/<picture>",
            ))

            descriptive_alt = sum(
                1 for img in all_imgs
                if (img.get("alt") or "") and len((img.get("alt") or "").split()) >= 3
            )
            result.add(CheckResult(
                "alt_text_descriptive",
                descriptive_alt >= len(all_imgs) * 0.7,
                f"only {descriptive_alt}/{len(all_imgs)} images have ≥3-word alt text",
            ))
        else:
            for stub in (
                "all_images_have_width_height",
                "images_use_modern_format",
                "alt_text_descriptive",
            ):
                result.add(CheckResult(stub, True, "n/a (no images)"))
