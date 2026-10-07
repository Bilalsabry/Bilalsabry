"""Command line: python -m pokealert {run,check,test-notify}"""

from __future__ import annotations

import argparse
import logging
import os
import signal
import sys

from .config import ConfigError, load_config
from .fetch import Fetcher
from .monitor import CheckFailed, Monitor, fetch_items
from .notify import Alert, Notifier
from .state import State


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="pokealert", description="Pokémon TCG stock alerts to your phone")
    parser.add_argument("-c", "--config", default=os.environ.get("POKEALERT_CONFIG", "config.yaml"))
    parser.add_argument("-v", "--verbose", action="store_true")
    sub = parser.add_subparsers(dest="command")
    sub.add_parser("run", help="monitor forever (default)")
    sub.add_parser("check", help="check every watch once and print what it sees; sends no alerts")
    sub.add_parser("test-notify", help="send a test push to your phone")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)-7s %(message)s",
    )
    logging.getLogger("urllib3").setLevel(logging.WARNING)

    try:
        config = load_config(args.config)
    except (OSError, ConfigError) as exc:
        print(f"config error: {exc}", file=sys.stderr)
        return 2

    notifier = Notifier.from_config(config)
    command = args.command or "run"

    if command == "test-notify":
        ok = notifier.send(Alert(title="🟢 Pokémon alert test",
                                 message="If you can read this on your phone, alerts work.",
                                 url="https://www.pokemoncenter.com/", tags=["tada"]))
        return 0 if ok and notifier.channels else 1

    fetcher = Fetcher(config.settings)
    try:
        if command == "check":
            return _check_once(config, fetcher)
        state = State(config.settings.state_file)
        monitor = Monitor(config, fetcher, notifier, state)
        stopping = []
        signal.signal(signal.SIGTERM, lambda *_: stopping.append(True))
        try:
            monitor.run_forever(should_stop=lambda: bool(stopping))
        except KeyboardInterrupt:
            pass
        logging.info("stopped")
        return 0
    finally:
        fetcher.close()


def _check_once(config, fetcher: Fetcher) -> int:
    failures = 0
    for watch in (w for w in config.watches if w.enabled):
        print(f"\n== {watch.name} [{watch.kind}]")
        try:
            items = fetch_items(watch, fetcher, config.settings.bestbuy_api_key)
        except CheckFailed as exc:
            failures += 1
            print(f"   !! {exc}")
            continue
        except Exception as exc:  # noqa: BLE001
            failures += 1
            print(f"   !! {type(exc).__name__}: {exc}")
            continue
        if not items:
            print("   (nothing matched your keywords)")
        for item in items[:25]:
            price = f"  {item.price:.2f}" if item.price is not None else ""
            print(f"   {item.status.value:<13}{price}  {item.title}\n      {item.url}")
        if len(items) > 25:
            print(f"   ... and {len(items) - 25} more")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
