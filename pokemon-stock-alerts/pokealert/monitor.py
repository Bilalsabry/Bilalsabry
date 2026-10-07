"""The polling loop: check each watch on its own schedule and alert on changes."""

from __future__ import annotations

import json
import logging
import random
import time
from dataclasses import dataclass
from urllib.parse import quote

from .config import Config, Watch
from .detect import BUYABLE, Status, detect_page, find_listings, looks_blocked, matches_keywords
from .fetch import Fetcher
from .notify import Alert, Notifier
from .state import State

log = logging.getLogger(__name__)

LISTING_KINDS = {"listing", "shopify", "bestbuy"}
MAX_BACKOFF = 8


@dataclass
class Item:
    id: str
    title: str
    url: str
    status: Status
    price: float | None = None


class CheckFailed(Exception):
    """We couldn't see the store this time (blocked, error page, network)."""


# --- per-kind checks ------------------------------------------------------

def check_page(watch: Watch, fetcher: Fetcher) -> list[Item]:
    page = fetcher.get(watch.url, render=watch.render)
    if looks_blocked(page.status_code, page.text):
        raise CheckFailed(f"blocked by the store's bot protection (HTTP {page.status_code})")
    if page.status_code == 404:
        raise CheckFailed("page not found (404) - has the product URL changed?")
    if page.status_code >= 400:
        raise CheckFailed(f"HTTP {page.status_code}")
    d = detect_page(page.text, selector=watch.selector,
                    in_stock_text=watch.in_stock_text, out_of_stock_text=watch.out_of_stock_text)
    log.debug("%s: %s (%s)", watch.name, d.status.value, d.reason)
    return [Item(id=watch.url, title=d.title or watch.name, url=watch.url, status=d.status, price=d.price)]


def check_listing(watch: Watch, fetcher: Fetcher) -> list[Item]:
    page = fetcher.get(watch.url, render=watch.render)
    if looks_blocked(page.status_code, page.text):
        raise CheckFailed(f"blocked by the store's bot protection (HTTP {page.status_code})")
    if page.status_code >= 400:
        raise CheckFailed(f"HTTP {page.status_code}")
    links = find_listings(page.text, page.url, watch.keywords, watch.exclude, watch.selector)
    return [Item(id=url, title=title, url=url, status=Status.LISTED) for url, title in links.items()]


def check_shopify(watch: Watch, fetcher: Fetcher, max_pages: int = 3) -> list[Item]:
    """Shopify stores publish their catalogue at /products.json - fast and exact."""
    base = watch.url.rstrip("/")
    items: list[Item] = []
    for page_no in range(1, max_pages + 1):
        page = fetcher.get(f"{base}/products.json", params={"limit": 250, "page": page_no})
        if looks_blocked(page.status_code, page.text) or page.status_code >= 400:
            raise CheckFailed(f"products.json returned HTTP {page.status_code} - is this a Shopify store?")
        try:
            products = json.loads(page.text).get("products", [])
        except ValueError as exc:
            raise CheckFailed("products.json was not JSON - is this a Shopify store?") from exc
        for p in products:
            title = p.get("title", "")
            if not matches_keywords(title, watch.keywords, watch.exclude):
                continue
            variants = p.get("variants") or []
            available = [v for v in variants if v.get("available")]
            prices = [float(v["price"]) for v in (available or variants) if v.get("price")]
            items.append(Item(
                id=str(p.get("id") or p.get("handle")),
                title=title,
                url=f"{base}/products/{p.get('handle')}",
                status=Status.IN_STOCK if available else Status.OUT_OF_STOCK,
                price=min(prices) if prices else None,
            ))
        if len(products) < 250:
            break
    return items


_BESTBUY_ORDERABLE = {
    "available": Status.IN_STOCK,
    "preorder": Status.PREORDER,
    "backorder": Status.PREORDER,
    "comingsoon": Status.COMING_SOON,
    "soldout": Status.OUT_OF_STOCK,
}


def check_bestbuy(watch: Watch, fetcher: Fetcher, api_key: str) -> list[Item]:
    """Best Buy's official Products API (free key from developer.bestbuy.com)."""
    if watch.skus:
        queries = ["sku in(" + ",".join(quote(s) for s in watch.skus) + ")"]
    else:
        queries = ["&".join(f"search={quote(word)}" for word in kw.split()) for kw in watch.keywords]
    items: dict[str, Item] = {}
    for q in queries:
        url = f"https://api.bestbuy.com/v1/products({q})"
        page = fetcher.get(url, params={
            "apiKey": api_key, "format": "json", "pageSize": 100,
            "show": "sku,name,url,salePrice,onlineAvailability,orderable",
        })
        if page.status_code >= 400:
            raise CheckFailed(f"Best Buy API returned HTTP {page.status_code}")
        for p in json.loads(page.text).get("products", []):
            name = p.get("name", "")
            if not watch.skus and not matches_keywords(name, watch.keywords, watch.exclude):
                continue
            orderable = str(p.get("orderable", "")).replace(" ", "").lower()
            status = _BESTBUY_ORDERABLE.get(orderable) or (
                Status.IN_STOCK if p.get("onlineAvailability") else Status.OUT_OF_STOCK)
            items[str(p["sku"])] = Item(id=str(p["sku"]), title=name, url=p.get("url", ""),
                                        status=status, price=p.get("salePrice"))
    return list(items.values())


def fetch_items(watch: Watch, fetcher: Fetcher, bestbuy_api_key: str | None = None) -> list[Item]:
    if watch.kind == "page":
        return check_page(watch, fetcher)
    if watch.kind == "listing":
        return check_listing(watch, fetcher)
    if watch.kind == "shopify":
        return check_shopify(watch, fetcher)
    if watch.kind == "bestbuy":
        return check_bestbuy(watch, fetcher, bestbuy_api_key)
    raise ValueError(watch.kind)


# --- monitor --------------------------------------------------------------

_LABEL = {
    Status.IN_STOCK: "IN STOCK",
    Status.PREORDER: "PRE-ORDER LIVE",
    Status.COMING_SOON: "coming soon",
    Status.OUT_OF_STOCK: "out of stock",
    Status.LISTED: "just listed",
    Status.UNKNOWN: "status unknown",
}


class Monitor:
    def __init__(self, config: Config, fetcher: Fetcher, notifier: Notifier, state: State,
                 clock=time.time, rng: random.Random | None = None):
        self.config = config
        self.fetcher = fetcher
        self.notifier = notifier
        self.state = state
        self.clock = clock
        self.rng = rng or random.Random()
        self.watches = [w for w in config.watches if w.enabled]

    def fetch_items(self, watch: Watch) -> list[Item]:
        return fetch_items(watch, self.fetcher, self.config.settings.bestbuy_api_key)

    def check(self, watch: Watch) -> float:
        """Check one watch, send any alerts, return seconds until it should run again."""
        ws = self.state.watch(watch.name)
        try:
            items = self.fetch_items(watch)
        except Exception as exc:  # noqa: BLE001 - one bad store must not stop the rest
            reason = str(exc) if isinstance(exc, CheckFailed) else f"{type(exc).__name__}: {exc}"
            self._on_failure(watch, ws, reason)
        else:
            self._on_success(watch, ws)
            for alert in self.process(watch, items):
                self.notifier.send(alert)
        self.state.save()

        backoff = min(2 ** ws["failures"], MAX_BACKOFF) if ws["failures"] else 1
        return watch.interval * backoff * self.rng.uniform(0.85, 1.15)

    def _on_failure(self, watch: Watch, ws: dict, reason: str) -> None:
        ws["failures"] += 1
        ws["last_error"] = reason
        log.warning("%s: %s (failure %d)", watch.name, reason, ws["failures"])
        if ws["failures"] == self.config.settings.failure_alert_after:
            ws["failure_alerted"] = True
            self.notifier.send(Alert(
                title=f"⚠️ Can't see {watch.name}",
                message=f"{reason}. Still retrying, more slowly. You're not covered for this store until it recovers.",
                url=watch.url, urgent=False, tags=["warning"],
            ))

    def _on_success(self, watch: Watch, ws: dict) -> None:
        if ws.get("failure_alerted"):
            self.notifier.send(Alert(title=f"✅ {watch.name} is being watched again",
                                     message="Checks are working again.", url=watch.url, urgent=False))
        ws["failures"] = 0
        ws.pop("failure_alerted", None)
        ws.pop("last_error", None)

    def process(self, watch: Watch, items: list[Item]) -> list[Alert]:
        ws = self.state.watch(watch.name)
        first_scan = ws["scans"] == 0
        ws["scans"] += 1
        now = self.clock()
        alerts: list[Alert] = []

        for item in items:
            key = f"{watch.name}|{item.id}"
            prev = self.state.items.get(key)
            record = prev or {}

            if item.status == Status.UNKNOWN and prev:
                continue  # don't let one unreadable check erase what we knew

            reason = None
            if prev is None:
                if watch.kind in LISTING_KINDS and first_scan:
                    reason = None  # seeding: only alert on what changes from here
                elif watch.kind in LISTING_KINDS:
                    reason = "new"
                elif item.status in BUYABLE:
                    reason = "buyable"
            elif item.status in BUYABLE and Status(prev["status"]) not in BUYABLE:
                reason = "buyable"

            too_pricey = watch.max_price is not None and item.price is not None and item.price > watch.max_price
            recently = (record.get("alerted_status") == item.status.value
                        and now - record.get("alerted_at", 0) < self.config.settings.alert_cooldown)

            if reason and not too_pricey and not recently:
                alerts.append(self._make_alert(watch, item, reason))
                record["alerted_at"] = now
                record["alerted_status"] = item.status.value
            elif reason and too_pricey:
                log.info("%s: %s is %.2f, above max_price %.2f - not alerting",
                         watch.name, item.title, item.price, watch.max_price)

            record.update(status=item.status.value, title=item.title, url=item.url,
                          price=item.price, seen_at=now)
            self.state.items[key] = record
        return alerts

    def _make_alert(self, watch: Watch, item: Item, reason: str) -> Alert:
        price = f" · {item.price:.2f}" if item.price is not None else ""
        if reason == "new" and item.status not in BUYABLE:
            title = f"🆕 New listing: {item.title}"
        elif item.status == Status.PREORDER:
            title = f"🟡 PRE-ORDER LIVE: {item.title}"
        else:
            title = f"🟢 IN STOCK: {item.title}"
        return Alert(
            title=title[:200],
            message=f"{watch.name} — {_LABEL[item.status]}{price}",
            url=item.url,
            urgent=True,
            tags=["rotating_light"] if item.status in BUYABLE else ["new"],
        )

    def run_forever(self, should_stop=lambda: False, sleep=time.sleep) -> None:
        if not self.watches:
            log.error("no enabled watches in config - nothing to do")
            return
        log.info("watching %d targets", len(self.watches))
        # Stagger the first round so we don't hit every store at once.
        start = self.clock()
        due = {w.name: start + i * 2 for i, w in enumerate(self.watches)}
        by_name = {w.name: w for w in self.watches}
        while not should_stop():
            name = min(due, key=due.get)
            wait = due[name] - self.clock()
            if wait > 0:
                sleep(min(wait, 1.0))
                continue
            delay = self.check(by_name[name])
            due[name] = self.clock() + delay
