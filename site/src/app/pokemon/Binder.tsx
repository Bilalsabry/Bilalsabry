"use client";
/* eslint-disable @next/next/no-img-element -- plain <img> keeps the page static; photos are small and lazy-loaded */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Wild from "./Wild";
import type { Estimate, ViewCard as Card } from "./types";

const BASE = "/pokemon/";
const OUTLOOK: Record<string, [string, string]> = {
  best: ["best", "Best bet"],
  steady: ["steady", "Steady"],
  low: ["low", "Unlikely to grow"],
};
const FILTERS = [
  ["all", "All"],
  ["graded", "Graded"],
  ["raw", "Raw"],
  ["best", "Best long-term bets"],
] as const;
type Filter = (typeof FILTERS)[number][0];
type Sort = "value" | "name" | "recent";

/* ---------------------------------------------------------------- helpers */
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) =>
  "$" + (n < 10 ? n.toFixed(2).replace(/\.00$/, "") : Math.round(n).toLocaleString("en-US"));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Formatted by hand so server and browser always agree, whatever the time zone.
const fmtDate = (d?: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d ?? "");
  return m ? `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}` : d || "—";
};
const qtyOf = (c: Card) => +c.qty || 1;
const isGraded = (c: Card) => !!c.grade && !/^raw$/i.test(c.grade);
const mid = (c: Card) => (((+c.low || 0) + (+c.high || 0)) / 2) * qtyOf(c);
const matches = (c: Card, f: Filter) =>
  f === "all" ? true : f === "graded" ? isGraded(c) : f === "raw" ? !isGraded(c) : c.outlook === "best";
const cssVars = (v: Record<string, string | number>) => v as React.CSSProperties;

/** Pointer-driven tilt + glare. Writes CSS variables straight onto the element
 *  so nothing re-renders. Mouse and pen only; touch scrolls as normal. */
const tilt = (max: number) => ({
  onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType === "touch") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--px", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--py", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--rx", `${((0.5 - py) * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * max).toFixed(2)}deg`);
    el.style.setProperty("--on", "1");
  },
  onPointerLeave(e: React.PointerEvent<HTMLElement>) {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--on", "0");
  },
});
const TILT_TILE = tilt(10);
const TILT_STAGE = tilt(16);

/** Settles onto the final number instead of counting from zero, so the
 *  server-rendered value never flashes away. */
function useSettle(target: number) {
  const [v, setV] = useState(target);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setV(target * (0.86 + 0.14 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

function Spark({ history }: { history: Estimate[] }) {
  if (history.length < 2) return null;
  const pts = history.map((x) => ((+x.low || 0) + (+x.high || 0)) / 2);
  const mx = Math.max(...pts);
  const mn = Math.min(...pts);
  const W = 300;
  const H = 60;
  const p = 6;
  const xy = pts.map((v, i) => [
    p + (i * (W - 2 * p)) / (pts.length - 1),
    H - p - (mx === mn ? 0.5 : (v - mn) / (mx - mn)) * (H - 2 * p),
  ]);
  const d = xy.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join(" ");
  const last = xy[xy.length - 1];
  return (
    <svg className="pk-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Estimate trend">
      <path d={`${d} L${last[0]} ${H} L${xy[0][0]} ${H} Z`} fill="var(--accent)" opacity=".12" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--accent)" />
    </svg>
  );
}

const SLEEVE = 3 / 4; // the pocket every grid photo is fitted into
const FALLBACK_AR = 0.72;

/** The photo, wrapped tightly so glare and foil sit exactly on the card.
 *  Sizes are plain percentages worked out from the image's own proportions,
 *  which lays out identically in every browser. */
function CardImage({
  src,
  alt,
  ar,
  variant,
  eager,
}: {
  src: string;
  alt: string;
  ar: number | null;
  variant: "thumb" | "fan" | "big";
  eager?: boolean;
}) {
  const a = ar || FALLBACK_AR;
  let style: React.CSSProperties = cssVars({ "--ar": a.toFixed(4) });
  if (variant === "thumb") {
    // fit inside a 3:4 box, centred
    const w = a <= SLEEVE ? (a / SLEEVE) * 100 : 100;
    const h = a <= SLEEVE ? 100 : (SLEEVE / a) * 100;
    style = {
      ...style,
      width: `${w.toFixed(2)}%`,
      height: `${h.toFixed(2)}%`,
      left: `${((100 - w) / 2).toFixed(2)}%`,
      top: `${((100 - h) / 2).toFixed(2)}%`,
    };
  }
  return (
    <span className={`pk-cardimg ${variant}`} style={style}>
      <img
        src={BASE + src}
        alt={alt}
        width={Math.round(600 * a)}
        height={600}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
      />
    </span>
  );
}

/* ------------------------------------------------------------------ page */
export default function Binder({ cards }: { cards: Card[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("value");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  // Wild Pokémon wander the page unless switched off (remembered per browser).
  const [wild, setWild] = useState(true);
  useEffect(() => {
    let off = false;
    try {
      off = localStorage.getItem("pk-wild") === "off";
    } catch {}
    if (!off) return;
    const raf = requestAnimationFrame(() => setWild(false));
    return () => cancelAnimationFrame(raf);
  }, []);
  const toggleWild = () =>
    setWild((w) => {
      try {
        localStorage.setItem("pk-wild", w ? "off" : "on");
      } catch {}
      return !w;
    });
  const closeBtn = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  const summary = useMemo(() => {
    let lo = 0, hi = 0, n = 0, latest = "";
    const g = [0, 0, 0];
    const r = [0, 0, 0];
    for (const c of cards) {
      const k = qtyOf(c);
      n += k;
      lo += (+c.low || 0) * k;
      hi += (+c.high || 0) * k;
      const b = isGraded(c) ? g : r;
      b[0] += (+c.low || 0) * k;
      b[1] += (+c.high || 0) * k;
      b[2] += k;
      if ((c.asOf || "") > latest) latest = c.asOf;
    }
    return { lo, hi, n, latest, g, r };
  }, [cards]);

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map(([f]) => [f, cards.filter((c) => matches(c, f)).length])) as Record<Filter, number>,
    [cards]
  );

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = cards.filter((c) => matches(c, filter));
    if (needle)
      out = out.filter((c) => `${c.name} ${c.set || ""} ${c.num || ""} ${c.grade || ""}`.toLowerCase().includes(needle));
    return out.slice().sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "recent"
        ? (b.asOf || "").localeCompare(a.asOf || "") || mid(b) - mid(a)
        : mid(b) - mid(a)
    );
  }, [cards, filter, sort, q]);

  // The three most valuable cards that have a photo, for the hero fan.
  const top = useMemo(() => cards.filter((c) => c.img).slice().sort((a, b) => mid(b) - mid(a)).slice(0, 3), [cards]);

  const open = cards.find((c) => c.id === openId) ?? null;
  const idx = open ? list.findIndex((c) => c.id === open.id) : -1;
  const total = useSettle((summary.lo + summary.hi) / 2);

  const show = useCallback((id: string, from?: HTMLElement | null) => {
    if (from) returnTo.current = from;
    setOpenId(id);
  }, []);
  const close = useCallback(() => {
    setOpenId(null);
    history.replaceState(null, "", location.pathname + location.search);
    returnTo.current?.focus?.();
    returnTo.current = null;
  }, []);
  const step = useCallback(
    (dir: 1 | -1) => {
      if (idx < 0 || list.length < 2) return;
      setOpenId(list[(idx + dir + list.length) % list.length].id);
    },
    [idx, list]
  );
  const randomPull = (e: React.MouseEvent<HTMLElement>) => {
    const pool = list.length ? list : cards;
    if (!pool.length) return;
    show(pool[Math.floor(Math.random() * pool.length)].id, e.currentTarget);
  };

  // Deep link: /pokemon#card-id opens that card, on load and when the hash changes.
  useEffect(() => {
    const read = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      return id && cards.some((c) => c.id === id) ? id : null;
    };
    const fromHash = () => {
      const id = read();
      if (id) setOpenId(id);
    };
    const initial = read();
    const raf = requestAnimationFrame(() => initial && setOpenId(initial));
    window.addEventListener("hashchange", fromHash);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [cards]);

  // While a card is open: keep the URL shareable, lock the page, handle keys.
  useEffect(() => {
    if (!openId) return;
    history.replaceState(null, "", `#${encodeURIComponent(openId)}`);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openId]);

  // Focus the close button when the sheet opens (not on every prev/next step).
  const isOpen = openId !== null;
  useEffect(() => {
    if (isOpen) closeBtn.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, close, step]);

  const outlook = open ? OUTLOOK[open.outlook] : undefined;
  const estimates = open ? (open.history || []).slice().sort((a, b) => (a.d || "").localeCompare(b.d || "")) : [];

  return (
    <>
      <div className="pk-aurora" aria-hidden />

      <header className="pk-top pk-wrap">
        <Link href="/" className="pk-back">
          <span aria-hidden>←</span> bilalsabry.com
        </Link>
        <span className="pk-top-tools">
          <button
            type="button"
            className="pk-wild-btn"
            onClick={toggleWild}
            aria-pressed={wild}
            aria-label={wild ? "Turn wild Pokémon off" : "Turn wild Pokémon on"}
            title={wild ? "Wild Pokémon: on" : "Wild Pokémon: off"}
          >
            {/* poké ball */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h6M15 12h6" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <ThemeToggle />
        </span>
      </header>

      <section className="pk-hero pk-wrap">
        <div className="pk-hero-copy">
          <p className="pk-eyebrow">Pokémon TCG · personal collection</p>
          <h1>
            Binder <span>Ledger</span>
          </h1>
          <p className="pk-sub">Every card in the collection, with its latest market estimate.</p>
        </div>

        {top.length === 3 && (
          <div className="pk-fan" aria-label="Most valuable cards">
            {[top[1], top[0], top[2]].map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={`pk-fan-card pk-fan-${i}`}
                onClick={(e) => show(c.id, e.currentTarget)}
                aria-label={`Open ${c.name}, ${money2(c.low)} to ${money2(c.high)}`}
                {...TILT_TILE}
              >
                <CardImage src={c.hero?.src ?? c.img} alt={c.name} ar={c.hero?.ar ?? c.ar} variant="fan" eager />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="pk-ledger pk-wrap" aria-label="Collection summary">
        <div>
          <div className="pk-lbl">Collection value</div>
          <div className="pk-big">{money(total)}</div>
          <div className="pk-small">
            Range {money(summary.lo)}–{money(summary.hi)} · last priced {fmtDate(summary.latest)}
          </div>
        </div>
        <div>
          <div className="pk-lbl">Cards</div>
          <div className="pk-mid">{summary.n}</div>
          <div className="pk-small">{cards.length} entries</div>
        </div>
        <div>
          <div className="pk-lbl">Graded</div>
          <div className="pk-mid">
            {money(summary.g[0])}–{money(summary.g[1])}
          </div>
          <div className="pk-small">{summary.g[2]} slabs</div>
        </div>
        <div>
          <div className="pk-lbl">Raw</div>
          <div className="pk-mid">
            {money(summary.r[0])}–{money(summary.r[1])}
          </div>
          <div className="pk-small">{summary.r[2]} raw cards</div>
        </div>
      </section>

      <div className="pk-bar">
        <div className="pk-wrap pk-bar-in">
          <div className="pk-seg" role="group" aria-label="Filter">
            {FILTERS.map(([f, label]) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {label} <span className="pk-count">{counts[f]}</span>
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
            <option value="value">Highest value</option>
            <option value="name">Name A–Z</option>
            <option value="recent">Recently priced</option>
          </select>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, set, or grade"
            aria-label="Search"
          />
          <button type="button" className="pk-pull" onClick={randomPull} title="Open a random card">
            <span aria-hidden>✦</span> Random pull
          </button>
        </div>
      </div>

      <p className="pk-sr" role="status" aria-live="polite">
        {list.length} of {cards.length} entries shown
      </p>

      <main className="pk-grid pk-wrap">
        {list.map((c, i) => {
          const o = OUTLOOK[c.outlook];
          return (
            <button
              key={c.id}
              type="button"
              className="pk-card"
              style={cssVars({ "--i": Math.min(i, 24) })}
              onClick={(e) => show(c.id, e.currentTarget)}
              {...TILT_TILE}
            >
              <span className="pk-thumb">
                {c.img ? (
                  <span className="pk-thumb-in">
                    <CardImage src={c.img} alt={c.name} ar={c.ar} variant="thumb" eager={i < 6} />
                  </span>
                ) : (
                  <span className="pk-ph">
                    {c.name}
                    <small>No photo yet</small>
                  </span>
                )}
                {qtyOf(c) > 1 && <span className="pk-qty">×{qtyOf(c)}</span>}
              </span>
              <span className="pk-name">{c.name}</span>
              <span className="pk-meta">{[c.set, c.num].filter(Boolean).join(" · ")}</span>
              <span className="pk-row">
                <span className="pk-chip grade">{c.grade || "Raw"}</span>
                {o && <span className={`pk-chip ${o[0]}`}>{o[1]}</span>}
              </span>
              <span className="pk-row">
                <span className="pk-val">
                  {money2(c.low)}–{money2(c.high)}
                </span>
                <span className="pk-asof">{fmtDate(c.asOf)}</span>
              </span>
            </button>
          );
        })}
      </main>
      {list.length === 0 && (
        <div className="pk-wrap">
          <div className="pk-empty">No cards match that. Try a different filter or search.</div>
        </div>
      )}

      <Wild enabled={wild} paused={openId !== null} />

      <footer className="pk-foot pk-wrap">
        Estimates are ranges from recent sold listings and price guides, before selling fees.
      </footer>

      {open && (
        <>
          <div className="pk-scrim" onClick={close} />
          <aside className="pk-sheet" role="dialog" aria-modal="true" aria-labelledby="pk-sheet-title">
            <div className="pk-sheet-head">
              <span className="pk-pos">{idx >= 0 ? `${idx + 1} / ${list.length}` : ""}</span>
              <span className="pk-sheet-nav">
                {idx >= 0 && list.length > 1 && (
                  <>
                    <button type="button" onClick={() => step(-1)} aria-label="Previous card" title="Previous (←)">
                      ←
                    </button>
                    <button type="button" onClick={() => step(1)} aria-label="Next card" title="Next (→)">
                      →
                    </button>
                  </>
                )}
                <button ref={closeBtn} type="button" onClick={close} aria-label="Close" title="Close (Esc)">
                  ×
                </button>
              </span>
            </div>

            <div className="pk-sheet-body" key={open.id}>
              <div className="pk-stage" {...TILT_STAGE}>
                {open.img ? (
                  <CardImage src={open.img} alt={open.name} ar={open.ar} variant="big" eager />
                ) : (
                  <span className="pk-ph big">No photo yet</span>
                )}
              </div>

              <div>
                <h2 id="pk-sheet-title">{open.name}</h2>
                <div className="pk-meta">{[open.set, open.num].filter(Boolean).join(" · ")}</div>
              </div>

              <div className="pk-est">
                <div className="pk-est-val">
                  {money2(open.low)}–{money2(open.high)}
                  {qtyOf(open) > 1 && <small> each</small>}
                </div>
                <div className="pk-row start">
                  <span className="pk-chip grade">{open.grade || "Raw"}</span>
                  {outlook && <span className={`pk-chip ${outlook[0]}`}>{outlook[1]}</span>}
                </div>
              </div>

              <dl>
                <dt>Quantity</dt>
                <dd>
                  {qtyOf(open)}
                  {qtyOf(open) > 1 &&
                    ` · ${money2(open.low * qtyOf(open))}–${money2(open.high * qtyOf(open))} total`}
                </dd>
                <dt>Priced</dt>
                <dd>{fmtDate(open.asOf)}</dd>
                <dt>Basis</dt>
                <dd>
                  {open.basis || "—"}
                  {open.src && (
                    <>
                      {" · "}
                      <a href={open.src} target="_blank" rel="noopener noreferrer">
                        source ↗
                      </a>
                    </>
                  )}
                </dd>
              </dl>

              <div>
                <div className="pk-lbl" style={{ marginBottom: 6 }}>
                  Estimate history
                </div>
                <Spark history={estimates} />
                <div className="pk-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th className="n">Low</th>
                        <th className="n">High</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estimates.length ? (
                        estimates
                          .slice()
                          .reverse()
                          .map((h, i) => (
                            <tr key={i}>
                              <td>{fmtDate(h.d)}</td>
                              <td className="n">{money2(+h.low)}</td>
                              <td className="n">{money2(+h.high)}</td>
                              <td>{h.note || ""}</td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={4}>No history yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
