"use client";

import { useEffect, useRef, useState } from "react";
import { stats, type Stat } from "@/lib/data";

function useCountUp(target: number, run: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setV(target));
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return v;
}

function Item({ s, run }: { s: Stat; run: boolean }) {
  const v = useCountUp(s.target, run);
  const shown = s.decimals ? v.toFixed(s.decimals) : Math.round(v).toString();
  return (
    <div
      style={{
        padding: "22px 0",
        borderTop: "1px solid var(--line-2)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: "clamp(34px, 4vw, 52px)",
          lineHeight: 1,
          fontWeight: 600,
          letterSpacing: "-0.04em",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {s.prefix && <span style={{ color: "var(--fg-3)", fontSize: "0.6em" }}>{s.prefix}</span>}
        {shown}
        {s.suffix && (
          <span className="serif" style={{ color: "var(--accent)", fontSize: "0.6em", marginLeft: 2 }}>
            {s.suffix}
          </span>
        )}
      </div>
      <div style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.45 }}>{s.label}</div>
    </div>
  );
}

export default function Proof() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section style={{ padding: "clamp(24px, 4vh, 48px) 0 clamp(48px, 8vh, 96px)" }}>
      <div
        ref={ref}
        className="wrap"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "0 clamp(20px, 3vw, 40px)",
        }}
      >
        {stats.map((s) => (
          <Item key={s.label} s={s} run={run} />
        ))}
      </div>
    </section>
  );
}
