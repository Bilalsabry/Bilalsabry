"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildActions, fuzzy, type Action } from "@/lib/actions";
import { toast } from "./Toast";

const EVENT = "bs:palette";

/** Open the palette from anywhere: `openPalette()` */
export function openPalette() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * ⌘K / Ctrl+K command palette — the fastest way around the site. Fuzzy
 * search over sections, links, projects and a couple of easter eggs.
 * Fully keyboard driven: ↑↓ to move, ↵ to run, Esc to close. Focus is
 * trapped in the input while open; scroll is locked underneath.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const actions = useMemo(() => buildActions(toast), []);

  const results = useMemo(() => {
    if (!q.trim()) return actions;
    return actions
      .map((a) => ({
        a,
        s: Math.max(
          fuzzy(q, a.label),
          fuzzy(q, a.keywords ?? "") * 0.8,
          fuzzy(q, a.group) * 0.5
        ),
      }))
      .filter((r) => r.s > 0)
      .sort((x, y) => y.s - x.s)
      .map((r) => r.a);
  }, [q, actions]);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setCursor(0);
  }, []);

  const run = useCallback(
    (a: Action) => {
      close();
      // let the overlay unmount before scrolling / opening windows
      requestAnimationFrame(() => a.run());
    },
    [close]
  );

  // global hotkeys + external open events
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const typing =
        (e.target as HTMLElement)?.tagName === "INPUT" ||
        (e.target as HTMLElement)?.tagName === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable;
      if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(EVENT, onOpen);
    };
  }, [open]);

  // focus + scroll lock while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => input.current?.focus(), 10);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open]);

  // keep the highlighted row in view
  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(`[data-i="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  // Reset the highlight whenever the query changes (derived, not an effect).
  const [prevQ, setPrevQ] = useState(q);
  if (prevQ !== q) {
    setPrevQ(q);
    setCursor(0);
  }

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const a = results[cursor];
      if (a) run(a);
    }
  };

  // group rows while preserving ranked order
  const rows = results.map((a, i) => ({
    a,
    i,
    showGroup: i === 0 || results[i - 1].group !== a.group,
  }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "min(18vh, 160px)",
        background: "rgba(4,5,7,0.62)",
        backdropFilter: "blur(10px)",
        animation: "bs-fade .18s ease-out",
      }}
    >
      <div
        onKeyDown={onKeyDown}
        style={{
          width: "min(640px, calc(100vw - 32px))",
          maxHeight: "min(64vh, 560px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 16,
          overflow: "hidden",
          background: "rgba(14,17,22,0.92)",
          border: "1px solid var(--line-strong)",
          boxShadow:
            "0 40px 120px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(110,240,200,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
          animation: "bs-pop .22s cubic-bezier(.22,1,.36,1)",
        }}
      >
        {/* input row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <span className="mono" style={{ color: "var(--accent)", fontSize: 14 }}>
            ›
          </span>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Where to? Try “work”, “email”, “terminal”…"
            aria-label="Search commands"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: "transparent",
              border: 0,
              outline: 0,
              color: "var(--fg)",
              fontSize: 16,
              fontFamily: "inherit",
            }}
          />
          <kbd
            className="mono"
            style={{
              fontSize: 10.5,
              color: "var(--fg-faint)",
              border: "1px solid var(--line)",
              borderRadius: 6,
              padding: "3px 6px",
            }}
          >
            esc
          </kbd>
        </div>

        {/* results */}
        <div
          ref={list}
          role="listbox"
          style={{ overflowY: "auto", padding: "8px 8px 10px" }}
        >
          {results.length === 0 && (
            <div
              className="mono"
              style={{
                padding: "28px 14px",
                textAlign: "center",
                color: "var(--fg-faint)",
                fontSize: 13,
              }}
            >
              Nothing matches “{q}”.
            </div>
          )}
          {rows.map(({ a, i, showGroup }) => {
            const active = i === cursor;
            return (
              <div key={a.id}>
                {showGroup && (
                  <div
                    className="mono"
                    style={{
                      padding: "10px 12px 6px",
                      fontSize: 10.5,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--fg-faint)",
                    }}
                  >
                    {a.group}
                  </div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-i={i}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => run(a)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: 0,
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontSize: 14.5,
                    color: active ? "var(--fg)" : "var(--fg-dim)",
                    background: active
                      ? "linear-gradient(90deg, rgba(110,240,200,0.14), rgba(138,140,255,0.08))"
                      : "transparent",
                    boxShadow: active
                      ? "inset 2px 0 0 var(--accent)"
                      : "none",
                    cursor: "pointer",
                    transition: "background .12s, color .12s",
                  }}
                >
                  <span>{a.label}</span>
                  {a.hint && (
                    <span
                      className="mono"
                      style={{
                        fontSize: 11.5,
                        color: active ? "var(--accent)" : "var(--fg-faint)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "45%",
                      }}
                    >
                      {a.hint}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* footer */}
        <div
          className="mono"
          style={{
            display: "flex",
            gap: 18,
            padding: "10px 18px",
            borderTop: "1px solid var(--line)",
            fontSize: 11,
            color: "var(--fg-faint)",
            letterSpacing: "0.04em",
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span style={{ marginLeft: "auto" }}>
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes bs-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bs-pop {
          from { opacity: 0; transform: translateY(-10px) scale(.98) }
          to   { opacity: 1; transform: none }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="dialog"], [role="dialog"] > div { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
