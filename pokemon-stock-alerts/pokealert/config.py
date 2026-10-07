"""Load and validate config.yaml."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

KINDS = {"page", "listing", "shopify", "bestbuy"}

# Hard floor so a typo in the config can't hammer a store.
MIN_INTERVAL_SECONDS = 30

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
)

_ENV_PATTERN = re.compile(r"\$\{([A-Za-z_][A-Za-z0-9_]*)\}")


class ConfigError(ValueError):
    pass


@dataclass
class Watch:
    name: str
    kind: str
    url: str | None = None
    keywords: list[str] = field(default_factory=list)
    exclude: list[str] = field(default_factory=list)
    max_price: float | None = None
    interval: int = 90
    render: bool = False
    selector: str | None = None
    in_stock_text: list[str] = field(default_factory=list)
    out_of_stock_text: list[str] = field(default_factory=list)
    skus: list[str] = field(default_factory=list)
    enabled: bool = True


@dataclass
class NtfyConfig:
    topic: str
    server: str = "https://ntfy.sh"
    token: str | None = None


@dataclass
class PushoverConfig:
    app_token: str
    user_key: str


@dataclass
class Settings:
    default_interval: int = 90
    per_host_gap: float = 5.0
    timeout: float = 20.0
    user_agent: str = DEFAULT_USER_AGENT
    state_file: str = "state.json"
    alert_cooldown: int = 600
    failure_alert_after: int = 3
    bestbuy_api_key: str | None = None


@dataclass
class Config:
    settings: Settings
    watches: list[Watch]
    ntfy: NtfyConfig | None = None
    pushover: PushoverConfig | None = None


def _expand_env(value: Any) -> Any:
    """Replace ${VAR} with the environment value, recursively."""
    if isinstance(value, str):
        def sub(match: re.Match) -> str:
            name = match.group(1)
            if name not in os.environ:
                raise ConfigError(f"environment variable {name} is not set")
            return os.environ[name]
        return _ENV_PATTERN.sub(sub, value)
    if isinstance(value, list):
        return [_expand_env(v) for v in value]
    if isinstance(value, dict):
        return {k: _expand_env(v) for k, v in value.items()}
    return value


def _str_list(raw: Any, field_name: str, watch_name: str) -> list[str]:
    if raw is None:
        return []
    if isinstance(raw, str):
        return [raw]
    if isinstance(raw, list) and all(isinstance(x, (str, int)) for x in raw):
        return [str(x) for x in raw]
    raise ConfigError(f"watch {watch_name!r}: {field_name} must be a list of strings")


def _parse_watch(raw: dict, settings: Settings, index: int) -> Watch:
    if not isinstance(raw, dict):
        raise ConfigError(f"watch #{index + 1} must be a mapping")
    name = raw.get("name") or f"watch-{index + 1}"
    kind = raw.get("kind", "page")
    if kind not in KINDS:
        raise ConfigError(f"watch {name!r}: kind must be one of {sorted(KINDS)}")

    url = raw.get("url")
    if kind != "bestbuy" and not url:
        raise ConfigError(f"watch {name!r}: url is required for kind {kind!r}")

    interval = int(raw.get("interval", settings.default_interval))
    interval = max(interval, MIN_INTERVAL_SECONDS)

    max_price = raw.get("max_price")
    watch = Watch(
        name=name,
        kind=kind,
        url=url,
        keywords=_str_list(raw.get("keywords"), "keywords", name),
        exclude=_str_list(raw.get("exclude"), "exclude", name),
        max_price=float(max_price) if max_price is not None else None,
        interval=interval,
        render=bool(raw.get("render", False)),
        selector=raw.get("selector"),
        in_stock_text=_str_list(raw.get("in_stock_text"), "in_stock_text", name),
        out_of_stock_text=_str_list(raw.get("out_of_stock_text"), "out_of_stock_text", name),
        skus=_str_list(raw.get("skus"), "skus", name),
        enabled=bool(raw.get("enabled", True)),
    )
    if kind == "bestbuy" and not (watch.skus or watch.keywords):
        raise ConfigError(f"watch {name!r}: bestbuy watches need skus or keywords")
    return watch


def parse_config(data: dict) -> Config:
    if not isinstance(data, dict):
        raise ConfigError("config must be a mapping")

    settings_raw = data.get("settings") or {}
    settings = Settings(**{k: v for k, v in settings_raw.items() if k in Settings.__dataclass_fields__})
    unknown = set(settings_raw) - set(Settings.__dataclass_fields__)
    if unknown:
        raise ConfigError(f"unknown settings: {sorted(unknown)}")
    settings.default_interval = max(int(settings.default_interval), MIN_INTERVAL_SECONDS)

    notify_raw = data.get("notify") or {}
    ntfy = None
    if notify_raw.get("ntfy"):
        n = notify_raw["ntfy"]
        if not n.get("topic"):
            raise ConfigError("notify.ntfy.topic is required")
        ntfy = NtfyConfig(topic=n["topic"], server=n.get("server", "https://ntfy.sh").rstrip("/"),
                          token=n.get("token") or None)
    pushover = None
    if notify_raw.get("pushover"):
        p = notify_raw["pushover"]
        if not (p.get("app_token") and p.get("user_key")):
            raise ConfigError("notify.pushover needs app_token and user_key")
        pushover = PushoverConfig(app_token=p["app_token"], user_key=p["user_key"])

    watches = [_parse_watch(w, settings, i) for i, w in enumerate(data.get("watches") or [])]
    names = [w.name for w in watches]
    dupes = {n for n in names if names.count(n) > 1}
    if dupes:
        raise ConfigError(f"watch names must be unique, duplicated: {sorted(dupes)}")
    if any(w.kind == "bestbuy" and w.enabled for w in watches) and not settings.bestbuy_api_key:
        raise ConfigError("settings.bestbuy_api_key is required for bestbuy watches")

    return Config(settings=settings, watches=watches, ntfy=ntfy, pushover=pushover)


def load_config(path: str | Path) -> Config:
    with open(path, encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    return parse_config(_expand_env(data))
