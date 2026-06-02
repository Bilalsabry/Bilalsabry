"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { profile } from "@/lib/data";

type Item = {
  id: string;
  label: string;
  hint: string;
  group: "Go to" | "Actions" | "Links";
  keywords?: string;
  run: () => void;
};

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.1 });
  else el.scrollIntoView({ behavior: "smooth" });
}

/**
 * ⌘K command palette — jump to any section, copy the email, play the showreel,
 * or open a profile link. Full keyboard control; closes on Esc / backdrop.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const items = useMemo<Item[]>(() => {
    const nav = (id: string) => () => {
      close();
      requestAnimationFrame(() => scrollToId(id));
    };
    const open_ = (url: string) => () => {
      window.open(url, "_blank", "noopener,noreferrer");
      close();
    };
    return [
      { id: "top", label: "Top", hint: "Hero", group: "Go to", keywords: "home start intro", run: nav("top") },
      { id: "manifesto", label: "Manifesto", hint: "The thesis", group: "Go to", keywords: "thesis belief", run: nav("manifesto") },
      { id: "reel", label: "Showreel", hint: "The 18-second version", group: "Go to", keywords: "video reel watch trailer", run: nav("reel") },
      { id: "about", label: "About", hint: "Who I am", group: "Go to", keywords: "bio", run: nav("about") },
      { id: "stats", label: "By the numbers", hint: "Stats", group: "Go to", keywords: "metrics facts", run: nav("stats") },
      { id: "work", label: "Work", hint: "Selected projects", group: "Go to", keywords: "projects portfolio", run: nav("work") },
      { id: "approach", label: "Approach", hint: "How I operate", group: "Go to", keywords: "principles process", run: nav("approach") },
      { id: "path", label: "Path", hint: "Timeline", group: "Go to", keywords: "timeline history career", run: nav("path") },
      { id: "contact", label: "Contact", hint: "Get in touch", group: "Go to", keywords: "email reach hire", run: nav("contact") },
      {
        id: "play",
        label: "Play the showreel",
        hint: "▶  18s",
        group: "Actions",
        keywords: "video watch trailer reel",
        run: () => {
          close();
          requestAnimationFrame(() => {
            scrollToId("reel");
            setTimeout(() => window.dispatchEvent(new Event("bs-play-reel")), 700);
          });
        },
      },
      {
        id: "copy",
        label: "Copy email",
        hint: profile.email,
        group: "Actions",
        keywords: "clipboard mail",
        run: () => {
          navigator.clipboard?.writeText(profile.email).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          });
        },
      },
      { id: "email", label: "Email me", hint: "Compose", group: "Actions", keywords: "mail contact", run: () => { window.location.href = `mailto:${profile.email}`; close(); } },
      { id: "li", label: "LinkedIn", hint: "in/bilal-sabry", group: "Links", keywords: "social", run: open_(profile.links.linkedin) },
      { id: "gh", label: "GitHub", hint: "@Bilalsabry", group: "Links", keywords: "code source", run: open_(profile.links.github) },
      { id: "krux", label: "Krux AI", hint: "krux.bio", group: "Links", keywords: "company startup", run: open_(profile.links.krux) },
    ];
  }, [close]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.hint.toLowerCase().includes(q) ||
        (it.keywords ?? "").includes(q)
    );
  }, [items, query]);

  // global ⌘K / Ctrl+K toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // open the palette from anywhere (the nav hint button)
  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("bs-open-cmdk", h);
    return () => window.removeEventListener("bs-open-cmdk", h);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  // keep active row in view
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  let runningIdx = -1;
  const groups: Item["group"][] = ["Go to", "Actions", "Links"];

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 900,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "12vh 20px 20px",
        background: "rgba(4,5,7,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onKeyDown={onListKey}
        style={{
          width: "min(620px, 100%)",
          background: "rgba(14,17,23,0.96)",
          border: "1px solid var(--line-strong)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 40px 120px -30px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--line)" }}>
          <span style={{ color: "var(--accent)", fontSize: 16 }}>⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a section, copy email, play the reel…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--fg)",
              fontSize: 16,
            }}
          />
          {copied && (
            <span className="mono" style={{ fontSize: 12, color: "var(--accent)" }}>
              copied ✓
            </span>
          )}
        </div>

        <div ref={listRef} style={{ maxHeight: "min(50vh, 420px)", overflowY: "auto", padding: 8 }}>
          {filtered.length === 0 && (
            <div style={{ padding: "24px 14px", color: "var(--fg-dim)", fontSize: 14 }}>
              No matches.
            </div>
          )}
          {groups.map((g) => {
            const rows = filtered.filter((it) => it.group === g);
            if (rows.length === 0) return null;
            return (
              <div key={g}>
                <div
                  className="mono"
                  style={{ padding: "10px 12px 6px", fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--fg-faint)" }}
                >
                  {g}
                </div>
                {rows.map((it) => {
                  runningIdx += 1;
                  const idx = runningIdx;
                  const on = idx === active;
                  return (
                    <button
                      key={it.id}
                      data-idx={idx}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => it.run()}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "11px 12px",
                        borderRadius: 10,
                        border: "none",
                        textAlign: "left",
                        background: on ? "rgba(110,240,200,0.12)" : "transparent",
                        color: on ? "var(--fg)" : "var(--fg-dim)",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span
                          aria-hidden
                          style={{
                            width: 4,
                            height: 16,
                            borderRadius: 4,
                            background: on ? "var(--accent)" : "transparent",
                          }}
                        />
                        <span style={{ fontSize: 14.5, color: on ? "var(--fg)" : "var(--fg)" }}>{it.label}</span>
                      </span>
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-faint)" }}>
                        {it.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div
          className="mono"
          style={{ display: "flex", gap: 16, padding: "10px 16px", borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--fg-faint)" }}
        >
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
