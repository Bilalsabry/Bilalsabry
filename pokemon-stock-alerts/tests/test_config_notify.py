from pathlib import Path

import pytest
import yaml

from pokealert.config import MIN_INTERVAL_SECONDS, ConfigError, load_config, parse_config
from pokealert.notify import Alert, Notifier, NtfyNotifier

EXAMPLE = Path(__file__).resolve().parent.parent / "config.example.yaml"


def test_example_config_loads(monkeypatch):
    monkeypatch.setenv("NTFY_TOPIC", "test-topic")
    cfg = load_config(EXAMPLE)
    assert cfg.ntfy.topic == "test-topic"
    assert any(w.enabled for w in cfg.watches)
    assert all(w.interval >= MIN_INTERVAL_SECONDS for w in cfg.watches)


def test_missing_env_var_is_a_clear_error(monkeypatch, tmp_path):
    monkeypatch.delenv("NTFY_TOPIC", raising=False)
    path = tmp_path / "c.yaml"
    path.write_text(yaml.safe_dump({"notify": {"ntfy": {"topic": "${NTFY_TOPIC}"}}}))
    with pytest.raises(ConfigError, match="NTFY_TOPIC"):
        load_config(path)


def test_interval_floor():
    cfg = parse_config({"watches": [{"name": "x", "url": "https://a.b", "interval": 1}]})
    assert cfg.watches[0].interval == MIN_INTERVAL_SECONDS


@pytest.mark.parametrize("data, msg", [
    ({"watches": [{"name": "x", "kind": "nope", "url": "u"}]}, "kind"),
    ({"watches": [{"name": "x", "kind": "page"}]}, "url"),
    ({"watches": [{"name": "x", "url": "u"}, {"name": "x", "url": "v"}]}, "unique"),
    ({"watches": [{"name": "b", "kind": "bestbuy", "skus": ["1"]}]}, "bestbuy_api_key"),
    ({"settings": {"intervall": 5}}, "unknown settings"),
])
def test_config_errors(data, msg):
    with pytest.raises(ConfigError, match=msg):
        parse_config(data)


class FakeSession:
    def __init__(self):
        self.posts = []

    def post(self, url, **kw):
        self.posts.append((url, kw))

        class R:
            def raise_for_status(self):
                pass
        return R()


def test_ntfy_payload():
    cfg = parse_config({"notify": {"ntfy": {"topic": "t", "token": "tk"}}})
    session = FakeSession()
    NtfyNotifier(cfg.ntfy, session).send(Alert("🟢 IN STOCK: Pokémon ETB", "PC", url="https://x"))
    url, kw = session.posts[0]
    assert url == "https://ntfy.sh"
    assert kw["json"]["topic"] == "t" and kw["json"]["priority"] == 5
    assert kw["json"]["click"] == "https://x"
    assert kw["headers"]["Authorization"] == "Bearer tk"


def test_one_failing_channel_does_not_block_others():
    class Broken:
        def send(self, alert):
            raise RuntimeError("down")

    class Good:
        sent = 0

        def send(self, alert):
            Good.sent += 1

    assert Notifier([Broken(), Good()]).send(Alert("t", "m")) is False
    assert Good.sent == 1
