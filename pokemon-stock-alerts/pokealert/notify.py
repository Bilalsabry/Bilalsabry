"""Phone push notifications: ntfy (free, no account) and Pushover."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

import requests

from .config import Config, NtfyConfig, PushoverConfig

log = logging.getLogger(__name__)


@dataclass
class Alert:
    title: str
    message: str
    url: str | None = None
    urgent: bool = True
    tags: list[str] = field(default_factory=list)


class NtfyNotifier:
    def __init__(self, cfg: NtfyConfig, session: requests.Session | None = None):
        self.cfg = cfg
        self.session = session or requests.Session()

    def send(self, alert: Alert) -> None:
        body = {
            "topic": self.cfg.topic,
            "title": alert.title,
            "message": alert.message,
            # 5 = max: breaks through and makes a long buzz; 2 = quiet.
            "priority": 5 if alert.urgent else 2,
            "tags": alert.tags,
        }
        if alert.url:
            body["click"] = alert.url
            body["actions"] = [{"action": "view", "label": "Open store", "url": alert.url}]
        headers = {"Authorization": f"Bearer {self.cfg.token}"} if self.cfg.token else {}
        resp = self.session.post(self.cfg.server, json=body, headers=headers, timeout=15)
        resp.raise_for_status()


class PushoverNotifier:
    API = "https://api.pushover.net/1/messages.json"

    def __init__(self, cfg: PushoverConfig, session: requests.Session | None = None):
        self.cfg = cfg
        self.session = session or requests.Session()

    def send(self, alert: Alert) -> None:
        data = {
            "token": self.cfg.app_token,
            "user": self.cfg.user_key,
            "title": alert.title[:250],
            "message": alert.message[:1024],
            "priority": 1 if alert.urgent else -1,
        }
        if alert.url:
            data["url"] = alert.url
            data["url_title"] = "Open store"
        resp = self.session.post(self.API, data=data, timeout=15)
        resp.raise_for_status()


class Notifier:
    """Sends to every configured channel; one failing channel doesn't stop the others."""

    def __init__(self, channels: list):
        self.channels = channels

    @classmethod
    def from_config(cls, config: Config) -> "Notifier":
        channels = []
        if config.ntfy:
            channels.append(NtfyNotifier(config.ntfy))
        if config.pushover:
            channels.append(PushoverNotifier(config.pushover))
        if not channels:
            log.warning("no notification channel configured; alerts will only be logged")
        return cls(channels)

    def send(self, alert: Alert) -> bool:
        log.info("ALERT %s | %s | %s", alert.title, alert.message, alert.url or "")
        ok = True
        for channel in self.channels:
            try:
                channel.send(alert)
            except Exception as exc:  # noqa: BLE001 - keep monitoring whatever happens
                ok = False
                log.error("%s failed: %s", type(channel).__name__, exc)
        return ok
