"""Content Quality — 15 parameters."""

from __future__ import annotations

import hashlib
import re
from collections import Counter
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, text_of


def _flesch_kincaid_grade(text: str) -> float:
    """Approximate Flesch-Kincaid Grade Level. Pure-python (no textstat dep)."""
    words = re.findall(r"[A-Za-z]+", text)
    if not words:
        return 0.0
    sentences = max(1, len(re.findall(r"[.!?]+", text)))
    syllables = sum(_count_syllables(w) for w in words)
    return 0.39 * (len(words) / sentences) + 11.8 * (syllables / len(words)) - 15.59


def _count_syllables(word: str) -> int:
    word = word.lower()
    if len(word) <= 3:
        return 1
    word = re.sub(r"(?:e|es|ed)$", "", word)
    syllables = re.findall(r"[aeiouy]+", word)
    return max(1, len(syllables))


class Checker(BaseChecker):
    name = "content"
    category_label = "Content Quality"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        body_text = text_of(soup)
        words = body_text.split()
        word_count = len(words)
        sentences = re.split(r"[.!?]+\s+", body_text)
        sentences = [s.strip() for s in sentences if s.strip()]

        # Uniqueness & Value (5)
        result.add(CheckResult(
            "content_not_empty",
            word_count > 0,
            "no body text found",
        ))

        text_hash = hashlib.sha1(re.sub(r"\s+", " ", body_text).encode()).hexdigest()
        result.add(CheckResult(
            "content_hash_recorded",
            len(text_hash) == 40,
            f"hash {text_hash[:12]}",
        ))

        # Duplicate sentences within page
        sentence_counts = Counter(s.strip() for s in sentences if len(s.split()) >= 4)
        dup_max = self.thresholds.get("duplicate_sentence_max", 3)
        max_dup = max(sentence_counts.values()) if sentence_counts else 0
        result.add(CheckResult(
            "duplicate_sentences_under_threshold",
            max_dup <= dup_max,
            f"longest sentence repeats {max_dup} times (max {dup_max})",
        ))

        result.add(CheckResult(
            "current_year_referenced",
            "2026" in body_text or "2027" in body_text,
            "no 2026/2027 reference (freshness signal)",
        ))

        # Topical depth — number of unique meaningful words
        unique_words = {w.lower() for w in words if len(w) > 4}
        result.add(CheckResult(
            "lexical_diversity_min",
            len(unique_words) >= 200,
            f"only {len(unique_words)} unique meaningful words (min 200)",
        ))

        # Readability & Structure (5)
        avg_words = word_count / max(1, len(sentences))
        result.add(CheckResult(
            "avg_sentence_length_reasonable",
            10 <= avg_words <= 25,
            f"avg sentence: {avg_words:.1f} words (target 10-25)",
        ))

        long_sentences = [s for s in sentences if len(s.split()) > 35]
        result.add(CheckResult(
            "no_overly_long_sentences",
            len(long_sentences) <= max(2, len(sentences) * 0.05),
            f"{len(long_sentences)} sentences > 35 words",
        ))

        max_para_sentences = self.thresholds.get("paragraph_max_sentences", 5)
        long_paras = []
        for p in soup.find_all("p"):
            p_sents = re.split(r"[.!?]+\s+", p.get_text(" ", strip=True))
            if len([s for s in p_sents if s]) > max_para_sentences:
                long_paras.append(p)
        result.add(CheckResult(
            "paragraphs_under_max_sentences",
            not long_paras,
            f"{len(long_paras)} paragraphs > {max_para_sentences} sentences",
        ))

        lists = soup.find_all(["ul", "ol"])
        result.add(CheckResult(
            "lists_present_for_scannability",
            len(lists) >= 3,
            f"{len(lists)} lists (min 3)",
        ))

        grade = _flesch_kincaid_grade(body_text)
        rl_min, rl_max = self.thresholds.get("reading_level", [7, 11])
        result.add(CheckResult(
            "reading_level_in_range",
            rl_min <= grade <= rl_max,
            f"Flesch-Kincaid grade {grade:.1f} (target {rl_min}-{rl_max})",
        ))

        # Content Structure (5)
        h2_count = len(soup.find_all("h2"))
        h2_min, h2_max = self.thresholds.get("h2_count", [5, 12])
        result.add(CheckResult(
            "section_count_reasonable",
            h2_min <= h2_count <= h2_max,
            f"{h2_count} H2 sections (target {h2_min}-{h2_max})",
        ))

        # Required sections — search for any of the typical labels
        required_signals = {
            "hero_or_intro": re.compile(r"\b(hero|intro|introduction)\b", re.I),
            "services_or_offerings": re.compile(r"\b(services|offerings|what we do|solutions)\b", re.I),
            "faq": re.compile(r"\b(faq|frequently asked)\b", re.I),
            "contact": re.compile(r"\b(contact|get in touch|reach us)\b", re.I),
            "social_proof": re.compile(r"\b(reviews|testimonials|clients|case studies)\b", re.I),
        }
        for key, pattern in required_signals.items():
            present = bool(pattern.search(body_text))
            result.add(CheckResult(
                f"section_{key}",
                present,
                f"no '{key}' section detected",
            ))
