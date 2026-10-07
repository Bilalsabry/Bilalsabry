"""HTTP fetching with a per-store politeness gap.

Every request to the same host waits at least `per_host_gap` seconds after the
previous one, so many watches on one store never burst it.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from urllib.parse import urlsplit

import requests

from .config import Settings

log = logging.getLogger(__name__)


@dataclass
class Page:
    status_code: int
    text: str
    url: str


class Fetcher:
    def __init__(self, settings: Settings, sleep=time.sleep, clock=time.monotonic):
        self.settings = settings
        self._sleep = sleep
        self._clock = clock
        self._last_hit: dict[str, float] = {}
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": settings.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        })
        self._browser = None
        self._playwright = None

    def _wait_for_host(self, url: str) -> None:
        host = urlsplit(url).netloc.lower()
        last = self._last_hit.get(host)
        if last is not None:
            wait = self.settings.per_host_gap - (self._clock() - last)
            if wait > 0:
                self._sleep(wait)
        self._last_hit[host] = self._clock()

    def get(self, url: str, render: bool = False, params: dict | None = None) -> Page:
        self._wait_for_host(url)
        if render:
            return self._render(url)
        resp = self.session.get(url, params=params, timeout=self.settings.timeout)
        if "charset" not in resp.headers.get("Content-Type", "").lower():
            # requests would assume Latin-1 and turn "Pokémon" into "PokÃ©mon".
            resp.encoding = "utf-8"
        return Page(resp.status_code, resp.text, resp.url)

    def _render(self, url: str) -> Page:
        """Load the page in headless Chromium for sites that build the page with JavaScript."""
        if self._browser is None:
            try:
                from playwright.sync_api import sync_playwright
            except ImportError as exc:
                raise RuntimeError(
                    "render: true needs Playwright. Install with "
                    "`pip install playwright && playwright install chromium`, "
                    "or build the Docker image with WITH_BROWSER=1."
                ) from exc
            self._playwright = sync_playwright().start()
            self._browser = self._playwright.chromium.launch()
        context = self._browser.new_context(user_agent=self.settings.user_agent)
        try:
            page = context.new_page()
            resp = page.goto(url, wait_until="domcontentloaded",
                             timeout=self.settings.timeout * 1000)
            page.wait_for_timeout(3000)  # let client-side rendering finish
            return Page(resp.status if resp else 0, page.content(), page.url)
        finally:
            context.close()

    def close(self) -> None:
        self.session.close()
        if self._browser is not None:
            self._browser.close()
            self._playwright.stop()
