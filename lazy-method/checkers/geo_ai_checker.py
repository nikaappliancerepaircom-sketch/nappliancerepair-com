"""GEO / AI Citations — 15 parameters. Optimization for AI Overviews, ChatGPT, Perplexity."""

from __future__ import annotations

import re
from pathlib import Path

from bs4 import BeautifulSoup

from .base import BaseChecker, CategoryResult, CheckResult, text_of


class Checker(BaseChecker):
    name = "geo_ai"
    category_label = "GEO / AI Citations"

    def check(
        self,
        soup: BeautifulSoup,
        html: str,
        page_path: Path,
        result: CategoryResult,
    ) -> None:
        body_text = text_of(soup)
        body_lower = body_text.lower()
        domain = self.site.get("domain", "")

        # llms.txt at site root
        site_root = page_path
        for parent in (page_path, *page_path.parents):
            if (parent / "llms.txt").exists():
                site_root = parent
                break
        result.add(CheckResult(
            "llms_txt_present",
            (site_root / "llms.txt").exists(),
            "no llms.txt at site root",
        ))

        # robots.txt allows AI crawlers
        robots_txt = None
        for parent in (page_path, *page_path.parents):
            if (parent / "robots.txt").exists():
                robots_txt = (parent / "robots.txt").read_text(encoding="utf-8", errors="ignore")
                break
        ai_bots = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]
        if robots_txt:
            disallowed_bots = [
                bot for bot in ai_bots
                if re.search(rf"User-agent:\s*{bot}.*?Disallow:\s*/", robots_txt, re.I | re.S)
            ]
            result.add(CheckResult(
                "ai_crawlers_allowed",
                not disallowed_bots,
                f"robots.txt blocks: {disallowed_bots}",
            ))
        else:
            result.add(CheckResult(
                "ai_crawlers_allowed",
                False,
                "no robots.txt (AI bots may not know rules)",
            ))

        # Brand mention in first 100 words (LLM citation anchor)
        site_name = self.site.get("name", "")
        first_words = " ".join(body_text.split()[:100]).lower()
        result.add(CheckResult(
            "brand_in_first_100_words",
            site_name.lower() in first_words if site_name else False,
            f"brand '{site_name}' not in first 100 words",
        ))

        # TL;DR / summary block
        has_summary = bool(soup.find(class_=re.compile(r"summary|tldr|key-takeaway|highlights", re.I)))
        has_summary = has_summary or bool(re.search(r"\b(tl;?dr|in short|summary|key takeaways)\b", body_lower))
        result.add(CheckResult(
            "summary_or_tldr_block",
            has_summary,
            "no TL;DR / summary / key takeaways block",
        ))

        # Question-format H2/H3 (LLMs cite Q&A)
        questions = [
            h.get_text(strip=True) for h in soup.find_all(["h2", "h3"])
            if h.get_text(strip=True).endswith("?")
        ]
        result.add(CheckResult(
            "question_format_headings",
            len(questions) >= 3,
            f"{len(questions)} question-format headings (min 3)",
        ))

        # FAQ schema or section
        faq_in_text = bool(re.search(r"\bfaq\b|frequently asked", body_lower))
        result.add(CheckResult(
            "faq_section_present",
            faq_in_text,
            "no FAQ section in content",
        ))

        # Short answer paragraphs after questions (citable passages)
        passages = []
        h2s_h3s = soup.find_all(["h2", "h3"])
        for h in h2s_h3s:
            if not h.get_text(strip=True).endswith("?"):
                continue
            sib = h.find_next_sibling()
            if sib is None:
                continue
            sib_text = sib.get_text(" ", strip=True)
            words = sib_text.split()
            if 20 <= len(words) <= 80:
                passages.append(sib_text)
        result.add(CheckResult(
            "citable_short_answer_passages",
            len(passages) >= 2,
            f"{len(passages)} answer passages of citable length (need 2+)",
        ))

        # Author/source signals (LLMs prefer attributable content)
        author_meta = soup.find("meta", attrs={"name": "author"})
        result.add(CheckResult(
            "author_meta_or_byline",
            author_meta is not None or bool(soup.find(string=re.compile(r"\bby [A-Z]"))),
            "no author meta tag or byline",
        ))

        # Structured data with @id (LLMs use @id to connect entities)
        json_ld_blocks = soup.find_all("script", attrs={"type": "application/ld+json"})
        has_id = any('"@id"' in (b.string or "") for b in json_ld_blocks)
        result.add(CheckResult(
            "schema_uses_at_id_for_entities",
            has_id,
            "JSON-LD missing @id properties (helps entity disambiguation)",
        ))

        # Lists / definitions / facts (snippet-ready)
        lists = soup.find_all(["ul", "ol"])
        dl = soup.find_all("dl")
        result.add(CheckResult(
            "structured_facts_lists_or_dl",
            len(lists) >= 3 or len(dl) >= 1,
            f"{len(lists)} lists, {len(dl)} <dl>",
        ))

        # Citation-friendly: numerical claims
        numerical_claims = len(re.findall(r"\b\d+(\.\d+)?\s*(%|x|years|customers|reviews)\b", body_lower))
        result.add(CheckResult(
            "numerical_claims_present",
            numerical_claims >= 3,
            f"{numerical_claims} numerical claims",
        ))

        # External authoritative outbound links
        ext_authoritative = sum(
            1 for a in soup.find_all("a", href=True)
            if re.search(r"(\.gov|\.edu|wikipedia\.org|hbr\.org|forbes\.com|nature\.com)", a["href"])
        )
        result.add(CheckResult(
            "outbound_authority_links",
            ext_authoritative >= 1,
            "no outbound links to authoritative sources",
        ))

        # Date markers (LLMs prefer fresh content)
        date_present = (
            bool(soup.find("meta", attrs={"property": "article:published_time"}))
            or bool(soup.find("meta", attrs={"property": "article:modified_time"}))
            or bool(soup.find("time"))
            or bool(re.search(r"\b(published|updated|last reviewed)\s*(on)?\s*[A-Z][a-z]+\s+\d", body_text))
        )
        result.add(CheckResult(
            "publish_or_update_date_visible",
            date_present,
            "no published / updated / last reviewed date",
        ))

        # OG / Twitter card for AI parsing
        og_image = soup.find("meta", attrs={"property": "og:image"})
        result.add(CheckResult(
            "og_image_present",
            og_image is not None and og_image.get("content"),
            "no og:image",
        ))

        twitter_card = soup.find("meta", attrs={"name": "twitter:card"})
        result.add(CheckResult(
            "twitter_card_meta",
            twitter_card is not None,
            "no twitter:card meta",
        ))
