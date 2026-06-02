"use client";

import { useEffect, useRef, useState } from "react";
import { stats, type Stat } from "@/lib/data";

function useCountUp(target: number, run: boolean, decimals: number) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      setVal(target);
      return;
    }
    const dur = 1500;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, decimals]);
  return val;
}

function StatCard({ stat, run }: { stat: Stat; run: boolean }) {
  const decimals = stat.target % 1 !== 0 ? 1 : 0;
  const v = useCountUp(stat.target, run, decimals);
  const shown =
    decimals > 0
      ? v.toFixed(1)
      : Math.round(v).toLocaleString("en-US");

  return (
    <div
      style={{
        borderTop: "1px solid var(--line-strong)",
        paddingTop: 22,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: "clamp(34px, 4.4vw, 58px)",
          lineHeight: 1,
          fontWeight: 600,
          letterSpacing: "-0.035em",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: "var(--fg-faint)", fontSize: "0.55em" }}>
          {stat.prefix}
        </span>
        {shown}
        <span style={{ color: "var(--accent)" }}>{stat.suffix}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 500 }}>{stat.label}</div>
      <div style={{ fontSize: 13.5, color: "var(--fg-dim)", lineHeight: 1.5 }}>
        {stat.sub}
      </div>
    </div>
  );
}

export default function Stats() {
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
    <section id="stats" style={{ padding: "clamp(60px, 10vh, 120px) 0" }}>
      <div className="container-x">
        <span className="eyebrow" style={{ display: "block", marginBottom: 48 }}>
          ( 03 )&nbsp;&nbsp;Receipts
        </span>
        <div
          ref={ref}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "clamp(24px, 3vw, 44px)",
          }}
        >
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} run={run} />
          ))}
        </div>
      </div>
    </section>
  );
}
