import json
import random

import pytest

from pokealert.config import Config, Settings, Watch
from pokealert.detect import Status
from pokealert.fetch import Page
from pokealert.monitor import Item, Monitor, check_bestbuy, check_shopify
from pokealert.state import State


class FakeFetcher:
    def __init__(self, pages):
        self.pages = list(pages)
        self.calls = []

    def get(self, url, render=False, params=None):
        self.calls.append((url, params))
        page = self.pages.pop(0)
        if isinstance(page, Exception):
            raise page
        return page


class FakeNotifier:
    def __init__(self):
        self.sent = []

    def send(self, alert):
        self.sent.append(alert)
        return True


class Clock:
    def __init__(self):
        self.now = 1_000_000.0

    def __call__(self):
        return self.now


def make(tmp_path, watch, pages=(), **settings):
    cfg = Config(settings=Settings(state_file=str(tmp_path / "state.json"), **settings), watches=[watch])
    notifier = FakeNotifier()
    clock = Clock()
    mon = Monitor(cfg, FakeFetcher(pages), notifier, State(cfg.settings.state_file),
                  clock=clock, rng=random.Random(0))
    return mon, notifier, clock


def page_watch(**kw):
    return Watch(name="PC ETB", kind="page", url="https://store.example/etb", **kw)


def item(status, price=None, id="https://store.example/etb"):
    return Item(id=id, title="Elite Trainer Box", url=id, status=status, price=price)


def test_page_alerts_when_first_seen_buyable(tmp_path):
    mon, _, _ = make(tmp_path, page_watch())
    alerts = mon.process(mon.watches[0], [item(Status.PREORDER, 59.99)])
    assert len(alerts) == 1
    assert alerts[0].title.startswith("🟡 PRE-ORDER LIVE")
    assert "59.99" in alerts[0].message
    assert alerts[0].url == "https://store.example/etb"


def test_page_alerts_only_on_change_to_buyable(tmp_path):
    mon, _, clock = make(tmp_path, page_watch())
    w = mon.watches[0]
    assert mon.process(w, [item(Status.OUT_OF_STOCK)]) == []
    clock.now += 60
    assert len(mon.process(w, [item(Status.IN_STOCK)])) == 1
    clock.now += 60
    assert mon.process(w, [item(Status.IN_STOCK)]) == []  # still in stock: no repeat


def test_unknown_reading_does_not_reset_status(tmp_path):
    mon, _, clock = make(tmp_path, page_watch())
    w = mon.watches[0]
    mon.process(w, [item(Status.IN_STOCK)])
    clock.now += 3600
    assert mon.process(w, [item(Status.UNKNOWN)]) == []
    assert mon.process(w, [item(Status.IN_STOCK)]) == []


def test_cooldown_suppresses_flapping(tmp_path):
    mon, _, clock = make(tmp_path, page_watch(), alert_cooldown=600)
    w = mon.watches[0]
    assert len(mon.process(w, [item(Status.IN_STOCK)])) == 1
    clock.now += 30
    mon.process(w, [item(Status.OUT_OF_STOCK)])
    clock.now += 30
    assert mon.process(w, [item(Status.IN_STOCK)]) == []
    clock.now += 600
    mon.process(w, [item(Status.OUT_OF_STOCK)])
    assert len(mon.process(w, [item(Status.IN_STOCK)])) == 1


def test_max_price(tmp_path):
    mon, _, _ = make(tmp_path, page_watch(max_price=60))
    assert mon.process(mon.watches[0], [item(Status.IN_STOCK, 199.99)]) == []


def test_listing_seeds_silently_then_alerts_new(tmp_path):
    w = Watch(name="Shop", kind="listing", url="https://shop.example/tcg")
    mon, _, _ = make(tmp_path, w)
    old = Item(id="a", title="Old ETB", url="https://shop.example/a", status=Status.LISTED)
    assert mon.process(w, [old]) == []
    new = Item(id="b", title="New Booster Bundle", url="https://shop.example/b", status=Status.LISTED)
    alerts = mon.process(w, [old, new])
    assert [a.title for a in alerts] == ["🆕 New listing: New Booster Bundle"]


def test_state_survives_restart(tmp_path):
    mon, _, _ = make(tmp_path, page_watch())
    mon.process(mon.watches[0], [item(Status.IN_STOCK)])
    mon.state.save()
    mon2, _, _ = make(tmp_path, page_watch())
    assert mon2.process(mon2.watches[0], [item(Status.IN_STOCK)]) == []


def shopify_page(*products):
    return Page(200, json.dumps({"products": list(products)}), "https://shop.example/products.json")


def product(pid, title, available, price="54.99"):
    return {"id": pid, "title": title, "handle": f"h{pid}",
            "variants": [{"available": available, "price": price}]}


def test_shopify_restock_and_new_listing(tmp_path):
    w = Watch(name="LGS", kind="shopify", url="https://shop.example/",
              keywords=["elite trainer box"], exclude=["sleeves"])
    pages = [
        shopify_page(product(1, "Surging Sparks Elite Trainer Box", False),
                     product(2, "Elite Trainer Box Sleeves", True)),
        shopify_page(product(1, "Surging Sparks Elite Trainer Box", True),
                     product(3, "Prismatic Evolutions Elite Trainer Box", False)),
    ]
    mon, notifier, clock = make(tmp_path, w, pages)
    mon.check(w)
    assert notifier.sent == []
    clock.now += 100
    mon.check(w)
    titles = sorted(a.title for a in notifier.sent)
    assert titles == ["🆕 New listing: Prismatic Evolutions Elite Trainer Box",
                      "🟢 IN STOCK: Surging Sparks Elite Trainer Box"]
    restock = next(a for a in notifier.sent if "IN STOCK" in a.title)
    assert restock.url == "https://shop.example/products/h1"


def test_check_shopify_paginates():
    w = Watch(name="LGS", kind="shopify", url="https://shop.example")
    full = shopify_page(*[product(i, f"Booster {i}", True) for i in range(250)])
    fetcher = FakeFetcher([full, shopify_page(product(999, "Last", False))])
    items = check_shopify(w, fetcher)
    assert len(items) == 251
    assert [c[1]["page"] for c in fetcher.calls] == [1, 2]


def test_bestbuy_parsing():
    w = Watch(name="BB", kind="bestbuy", skus=["6606082"])
    body = {"products": [{"sku": 6606082, "name": "Pokémon TCG: ETB", "url": "https://bestbuy.com/x",
                          "salePrice": 49.99, "onlineAvailability": False, "orderable": "PreOrder"}]}
    fetcher = FakeFetcher([Page(200, json.dumps(body), "")])
    [it] = check_bestbuy(w, fetcher, "KEY")
    assert it.status == Status.PREORDER and it.price == 49.99
    assert fetcher.calls[0][0] == "https://api.bestbuy.com/v1/products(sku in(6606082))"
    assert fetcher.calls[0][1]["apiKey"] == "KEY"


def test_failures_back_off_and_warn_once_then_recover(tmp_path):
    blocked = Page(403, "Access Denied", "")
    ok = Page(200, "<button>Add to cart</button>", "")
    w = page_watch(interval=100)
    mon, notifier, _ = make(tmp_path, w, [blocked] * 4 + [ok], failure_alert_after=3)
    delays = [mon.check(w) for _ in range(4)]
    assert delays[0] == pytest.approx(200, rel=0.16)
    assert delays[3] == pytest.approx(800, rel=0.16)  # capped at 8x
    warnings = [a for a in notifier.sent if "Can't see" in a.title]
    assert len(warnings) == 1 and not warnings[0].urgent
    mon.check(w)
    assert [a.title for a in notifier.sent[1:]] == ["✅ PC ETB is being watched again",
                                                    "🟢 IN STOCK: PC ETB"]


def test_network_error_does_not_crash(tmp_path):
    w = page_watch()
    mon, _, _ = make(tmp_path, w, [ConnectionError("boom")])
    mon.check(w)
    assert mon.state.watch(w.name)["failures"] == 1
