import requests

from pokealert.config import Settings
from pokealert.fetch import Fetcher


def fake_response(body: bytes, content_type: str) -> requests.Response:
    resp = requests.Response()
    resp.status_code = 200
    resp._content = body
    resp.headers["Content-Type"] = content_type
    resp.encoding = requests.utils.get_encoding_from_headers(resp.headers)
    resp.url = "https://shop.example/p"
    return resp


def test_utf8_assumed_when_no_charset(monkeypatch):
    f = Fetcher(Settings(per_host_gap=0))
    monkeypatch.setattr(f.session, "get", lambda *a, **k: fake_response("Pokémon".encode(), "text/html"))
    assert f.get("https://shop.example/p").text == "Pokémon"


def test_declared_charset_respected(monkeypatch):
    f = Fetcher(Settings(per_host_gap=0))
    body = "Pokémon".encode("latin-1")
    monkeypatch.setattr(f.session, "get", lambda *a, **k: fake_response(body, "text/html; charset=ISO-8859-1"))
    assert f.get("https://shop.example/p").text == "Pokémon"


def test_same_host_requests_are_spaced():
    slept = []
    now = [0.0]
    f = Fetcher(Settings(per_host_gap=5), sleep=slept.append, clock=lambda: now[0])
    f._wait_for_host("https://a.example/1")
    now[0] = 1.0
    f._wait_for_host("https://a.example/2")
    f._wait_for_host("https://b.example/1")
    assert slept == [4.0]
