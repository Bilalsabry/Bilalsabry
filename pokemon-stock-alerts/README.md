# Pokémon TCG stock alerts

Watches Pokémon card stores around the clock and pushes an alert to your phone the moment something goes on sale, a pre-order opens, or a new product is listed. Tap the alert to open the product page and check out yourself.

It never buys anything or logs in. It also never tries to get around a store's bot protection. If a store blocks it, you get a "Can't see" warning instead of a silent miss.

```
🟡 PRE-ORDER LIVE: Pokémon TCG Prismatic Evolutions Elite Trainer Box
Pokémon Center US – TCG — PRE-ORDER LIVE · 59.99          [Open store]
```

## What it watches

| Kind | Use it for | Alerts when |
|---|---|---|
| `page` | One product page at any store (Pokémon Center, Target, Walmart, GameStop, Costco, Amazon…) | It becomes buyable: in stock or pre-order |
| `listing` | A store's search or category page | A new product matching your keywords appears |
| `shopify` | Independent card shops on Shopify (most of them) | A new matching listing appears, or a product restocks |
| `bestbuy` | Best Buy, via its official free API | A new listing appears, or a product restocks |

[`config.example.yaml`](config.example.yaml) comes pre-filled with these stores:
- **Pokémon Center** (US, with UK ready to turn on)
- **US:** Walmart, Target, GameStop, Barnes & Noble, Best Buy
- **UK:** Smyths, Argos
- **Your own:** a template for independent Shopify card shops

Disabled entries are templates: paste in a URL and set `enabled: true`.

### How it decides "in stock"

Strongest evidence first:
1. Text you configure for a watch (`in_stock_text` / `out_of_stock_text`).
2. The schema.org product data that most big retailers embed for Google.
3. The buy button (Add to cart / Pre-order / Sold out / Notify me).
4. Out-of-stock wording on the page.

If it can't tell, it keeps the last known status rather than guessing.

## 1. Get alerts on your phone (2 minutes, free)

1. Install **ntfy** ([iPhone](https://apps.apple.com/app/ntfy/id1625396347) / [Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy)).
2. Tap **+** and subscribe to a topic with a long random name, such as `pokealert-8f3k2m9x7q`. Anyone who knows the name can read your alerts, so don't use a guessable one.
3. On Android, open the topic's settings and turn on **"Override Do Not Disturb"**. Alerts are sent at max priority, so they buzz even on silent.

Pushover is also supported if you'd like a second channel (see `notify.pushover` in the config).

## 2. Run it on a cloud server

Any small Linux VPS works. For example: Hetzner CX22, a DigitalOcean $6 droplet, or an Oracle Cloud free-tier VM. Give it **1 GB RAM or more**, because the headless browser some stores need is memory-hungry.

```bash
# On the server (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh

git clone <this repo> && cd <repo>/pokemon-stock-alerts
cp config.example.yaml config.yaml
cp .env.example .env
nano .env              # set NTFY_TOPIC to the topic from step 1
nano config.yaml       # pick stores, keywords, paste product URLs

docker compose build
docker compose run --rm pokealert test-notify   # your phone should buzz
docker compose run --rm pokealert check         # shows what every watch sees right now
docker compose up -d                            # runs 24/7, restarts on reboot
docker compose logs -f                          # watch it work
```

After editing `config.yaml`, run `docker compose restart`.

**Without Docker:** use Python 3.10+, then:

```bash
python -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m pokealert check
```

There is a systemd unit in [`deploy/pokealert.service`](deploy/pokealert.service). For `render: true` watches, also run `pip install playwright && playwright install --with-deps chromium`.

## 3. Tuning

- **Run `check` after every config change.** It prints exactly what each watch sees, such as `preorder 59.99 Pokémon TCG …` or `!! blocked by the store's bot protection`. Fix or disable anything that can't see its store.
- **Paste product pages as soon as a pre-order is announced.** Stores often publish the page ("Coming soon") days before it goes live. A `page` watch on that exact URL is the fastest and most reliable alert.
- **Keywords** match if every word of any one phrase appears in the title. Matching ignores case, accents and word order, so `pokemon elite trainer box` matches "Pokémon TCG: Scarlet & Violet—Prismatic Evolutions Elite Trainer Box". Use `exclude` to drop plush, sleeves, and so on.
- **A wrong status on some site** usually means the "Add to cart" button of a recommended product is being counted. Fix it with `selector` (a CSS selector for the buy box), or with `in_stock_text` / `out_of_stock_text` copied from the page.
- **`max_price`** skips alerts for listings above your limit, which helps against marketplace scalper prices.
- **Polite by design:** at most one check per watch every 30 s (90 s by default), at least 5 s between requests to the same store, random jitter, and automatic slow-down (up to 8×) when a store errors or blocks. Faster polling mostly gets your server's IP blocked.

## Known limits

- **Pokémon Center** has some of the strongest bot protection in retail and often blocks servers, especially cloud IPs. The monitor loads it in a real browser (`render: true`) but does not evade the protection. If it gets blocked, you'll get one low-priority "Can't see Pokémon Center" push and it keeps retrying slowly. Pair it with Pokémon Center's own email/app alerts and its official social announcements, or run the monitor on a home machine instead of a cloud VPS.
- **Walmart and Target** sometimes block server IPs the same way. Best Buy (official API) and Shopify shops are the most dependable.
- **Store URLs change.** Pages that start returning 404 trigger a warning so you can update them.
- **The first scan of a listing or shop records what's already there without alerting.** You're only pinged for what changes after that. A `page` watch alerts straight away if the product is already buyable.

## Development

```bash
pip install -r requirements.txt pytest
python -m pytest
```
