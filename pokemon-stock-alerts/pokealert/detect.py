"""Work out whether a page says a product can be bought.

Order of evidence, strongest first:
  1. Text you configured for this watch (in_stock_text / out_of_stock_text)
  2. schema.org structured data (JSON-LD or microdata) most big retailers embed
  3. The buy button: "Add to cart", "Pre-order", "Sold out", ...
  4. Out-of-stock wording anywhere on the page
"""

from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from enum import Enum
from urllib.parse import urljoin, urlsplit, urlunsplit

from bs4 import BeautifulSoup, Tag


class Status(str, Enum):
    IN_STOCK = "in_stock"
    PREORDER = "preorder"
    COMING_SOON = "coming_soon"
    OUT_OF_STOCK = "out_of_stock"
    LISTED = "listed"  # seen on a listing page; availability not known
    UNKNOWN = "unknown"


BUYABLE = {Status.IN_STOCK, Status.PREORDER}


@dataclass
class Detection:
    status: Status
    price: float | None = None
    title: str | None = None
    reason: str = ""


# --- text helpers ---------------------------------------------------------

def normalize(text: str) -> str:
    """Lowercase, strip accents (Pokémon -> pokemon), collapse punctuation."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-z0-9$£€.]+", " ", text.lower())
    return " ".join(text.split())


def matches_keywords(title: str, keywords: list[str], exclude: list[str]) -> bool:
    """True if any keyword phrase has all its words in the title and no exclude phrase does."""
    words = set(normalize(title).split())

    def phrase_hits(phrase: str) -> bool:
        parts = normalize(phrase).split()
        return bool(parts) and all(p in words for p in parts)

    if any(phrase_hits(x) for x in exclude):
        return False
    return not keywords or any(phrase_hits(k) for k in keywords)


def _contains_any(text: str, phrases: list[str] | tuple[str, ...]) -> str | None:
    for phrase in phrases:
        if normalize(phrase) and normalize(phrase) in text:
            return phrase
    return None


# --- blocked pages --------------------------------------------------------

_BLOCK_MARKERS = (
    "_incapsula_resource",
    "request unsuccessful. incapsula",
    "pardon our interruption",
    "px-captcha",
    "captcha-delivery.com",
    "robot or human?",
    "<title>access denied</title>",
)


def looks_blocked(status_code: int, html: str) -> bool:
    """Bot-protection pages: we can't see the product, so we must not guess."""
    if status_code in (401, 403, 429):
        return True
    lower = html[:200_000].lower()
    return any(marker in lower for marker in _BLOCK_MARKERS)


# --- structured data ------------------------------------------------------

_SCHEMA_STATUS = {
    "instock": Status.IN_STOCK,
    "onlineonly": Status.IN_STOCK,
    "limitedavailability": Status.IN_STOCK,
    "preorder": Status.PREORDER,
    "presale": Status.PREORDER,
    "backorder": Status.PREORDER,
    "outofstock": Status.OUT_OF_STOCK,
    "soldout": Status.OUT_OF_STOCK,
    "discontinued": Status.OUT_OF_STOCK,
    "instoreonly": Status.OUT_OF_STOCK,  # we care about buying online
}


def _schema_status(value: str) -> Status | None:
    key = value.rstrip("/").rsplit("/", 1)[-1].lower()
    return _SCHEMA_STATUS.get(key)


def _to_price(value) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    match = re.search(r"\d+(?:[.,]\d{3})*(?:[.,]\d{1,2})?", str(value))
    if not match:
        return None
    num = match.group(0)
    if "," in num and "." not in num and len(num.rsplit(",", 1)[1]) == 2:
        num = num.replace(",", ".")  # 12,99 (EU)
    return float(num.replace(",", ""))


def _walk(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from _walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from _walk(v)


def _from_json_ld(soup: BeautifulSoup) -> Detection | None:
    offers: list[tuple[Status, float | None]] = []
    title = None
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
        except (json.JSONDecodeError, TypeError):
            continue
        for obj in _walk(data):
            types = obj.get("@type")
            types = types if isinstance(types, list) else [types]
            if "Product" in types and not title and isinstance(obj.get("name"), str):
                title = obj["name"]
            availability = obj.get("availability")
            if isinstance(availability, str):
                status = _schema_status(availability)
                if status:
                    offers.append((status, _to_price(obj.get("price") or obj.get("lowPrice"))))
    if not offers:
        return None
    # Any buyable offer (one variant in stock) wins.
    for wanted in (Status.IN_STOCK, Status.PREORDER):
        for status, price in offers:
            if status == wanted:
                return Detection(status, price, title, "structured data")
    status, price = offers[0]
    return Detection(status, price, title, "structured data")


def _from_microdata(scope: Tag) -> Detection | None:
    for el in scope.select('[itemprop="availability"]'):
        value = el.get("href") or el.get("content") or el.get_text()
        status = _schema_status(str(value).strip())
        if status:
            price_el = scope.select_one('[itemprop="price"]')
            price = _to_price(price_el.get("content") or price_el.get_text()) if price_el else None
            return Detection(status, price, None, "microdata")
    return None


# --- buttons and wording --------------------------------------------------

PREORDER_TEXT = ("pre-order", "preorder", "pre order")
IN_STOCK_TEXT = ("add to cart", "add to bag", "add to basket", "add to trolley", "buy now")
COMING_SOON_TEXT = ("coming soon", "notify me", "email me when available", "available soon")
OUT_OF_STOCK_TEXT = ("sold out", "out of stock", "currently unavailable", "unavailable online",
                     "no longer available")

_BUTTON_SELECTOR = "button, input[type=submit], input[type=button], a[role=button]"


def _button_text(el: Tag) -> str:
    return normalize(el.get("value") or el.get("aria-label") or el.get_text(" "))


def _is_enabled(el: Tag) -> bool:
    return el.get("disabled") is None and el.get("aria-disabled") != "true"


def _from_buttons(scope: Tag) -> Detection | None:
    buttons = scope.select(_BUTTON_SELECTOR)
    for status, phrases in ((Status.PREORDER, PREORDER_TEXT), (Status.IN_STOCK, IN_STOCK_TEXT)):
        for b in buttons:
            if _is_enabled(b):
                hit = _contains_any(_button_text(b), phrases)
                if hit:
                    return Detection(status, reason=f"button: {hit!r}")
    for status, phrases in ((Status.OUT_OF_STOCK, OUT_OF_STOCK_TEXT), (Status.COMING_SOON, COMING_SOON_TEXT)):
        for b in buttons:
            hit = _contains_any(_button_text(b), phrases)
            if hit:
                return Detection(status, reason=f"button: {hit!r}")
    return None


def _page_title(soup: BeautifulSoup) -> str | None:
    og = soup.find("meta", property="og:title")
    if og and og.get("content"):
        return og["content"].strip()
    if soup.title and soup.title.string:
        return soup.title.string.strip()
    return None


def detect_page(
    html: str,
    *,
    selector: str | None = None,
    in_stock_text: list[str] | None = None,
    out_of_stock_text: list[str] | None = None,
) -> Detection:
    soup = BeautifulSoup(html, "html.parser")
    title = _page_title(soup)
    scope: Tag = (soup.select_one(selector) if selector else None) or soup

    for script in scope.find_all(["script", "style", "noscript"]):
        if script.get("type") != "application/ld+json":
            script.decompose()
    text = normalize(scope.get_text(" "))

    # 1. Your own wording wins. Out-of-stock first, so "Sold out" beats a stray "Add to cart".
    if out_of_stock_text and (hit := _contains_any(text, out_of_stock_text)):
        return Detection(Status.OUT_OF_STOCK, title=title, reason=f"custom text: {hit!r}")
    if in_stock_text and (hit := _contains_any(text, in_stock_text)):
        return Detection(Status.IN_STOCK, title=title, reason=f"custom text: {hit!r}")

    # 2. Structured data.
    found = _from_json_ld(soup) or _from_microdata(scope)
    # 3. Buy button.
    found = found or _from_buttons(scope)
    if found:
        found.title = found.title or title
        return found

    # 4. Wording anywhere in scope.
    for status, phrases in ((Status.OUT_OF_STOCK, OUT_OF_STOCK_TEXT), (Status.COMING_SOON, COMING_SOON_TEXT)):
        if hit := _contains_any(text, phrases):
            return Detection(status, title=title, reason=f"text: {hit!r}")
    return Detection(Status.UNKNOWN, title=title, reason="no availability signal found")


# --- listing pages --------------------------------------------------------

def _canonical(url: str) -> str:
    parts = urlsplit(url)
    return urlunsplit((parts.scheme, parts.netloc.lower(), parts.path.rstrip("/"), "", ""))


def find_listings(html: str, base_url: str, keywords: list[str], exclude: list[str],
                  selector: str | None = None) -> dict[str, str]:
    """Product links on a search/category page whose text matches the keywords. {url: title}"""
    soup = BeautifulSoup(html, "html.parser")
    scope: Tag = (soup.select_one(selector) if selector else None) or soup
    base_host = urlsplit(base_url).netloc.lower()
    found: dict[str, str] = {}
    for a in scope.find_all("a", href=True):
        title = " ".join((a.get("title") or a.get("aria-label") or a.get_text(" ")).split())
        if len(title) < 8:
            continue
        url = urljoin(base_url, a["href"])
        if urlsplit(url).netloc.lower() != base_host:
            continue
        if matches_keywords(title, keywords, exclude):
            key = _canonical(url)
            if key not in found or len(title) > len(found[key]):
                found[key] = title
    return found
