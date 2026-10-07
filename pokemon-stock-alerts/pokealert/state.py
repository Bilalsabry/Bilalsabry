"""What we've seen so far, saved to disk so restarts don't re-alert."""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path


class State:
    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.items: dict[str, dict] = {}
        self.watches: dict[str, dict] = {}
        if self.path.exists():
            data = json.loads(self.path.read_text(encoding="utf-8") or "{}")
            self.items = data.get("items", {})
            self.watches = data.get("watches", {})

    def watch(self, name: str) -> dict:
        return self.watches.setdefault(name, {"scans": 0, "failures": 0})

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps({"items": self.items, "watches": self.watches}, indent=1, sort_keys=True)
        fd, tmp = tempfile.mkstemp(dir=self.path.parent, prefix=".state-")
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(payload)
        os.replace(tmp, self.path)
