"use client";

import { useRef } from "react";
import Reveal from "./Reveal";
import { projects, type Project } from "@/lib/data";

function Card({ p }: { p: Project }) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const Inner = (
    <>
      {/* spotlight that follows the cursor, tinted with the project accent */}
      <div
        className="card-spot"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          transition: "opacity .4s",
          background: `radial-gradient(420px 420px at var(--mx) var(--my), ${p.accent}22, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <span
            className="mono"
            style={{ fontSize: 12, color: "var(--fg-faint)" }}
          >
            {p.index}
          </span>
          <span
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: p.accent,
              border: `1px solid ${p.accent}55`,
              borderRadius: 999,
              padding: "4px 11px",
              whiteSpace: "nowrap",
            }}
          >
            {p.status}
          </span>
        </div>

        <h3
          style={{
            fontSize: "clamp(26px, 3.4vw, 40px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          {p.title}
        </h3>
        <p
          className="serif"
          style={{
            fontSize: "clamp(16px, 1.8vw, 20px)",
            color: "var(--fg)",
            margin: 0,
          }}
        >
          {p.tagline}
        </p>
        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.6,
            color: "var(--fg-dim)",
            margin: 0,
            flex: 1,
          }}
        >
          {p.description}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 4,
          }}
        >
          {p.stack.map((s) => (
            <span
              key={s}
              className="mono"
              style={{
                fontSize: 11.5,
                color: "var(--fg-dim)",
                border: "1px solid var(--line)",
                borderRadius: 7,
                padding: "5px 9px",
              }}
            >
              {s}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            borderTop: "1px solid var(--line)",
            paddingTop: 16,
          }}
        >
          <span className="mono" style={{ fontSize: 12, color: "var(--fg-faint)" }}>
            {p.year}
          </span>
          {p.href && (
            <span
              className="mono"
              style={{ fontSize: 12.5, color: p.accent }}
            >
              {p.href.includes("github") ? "View source ↗" : "Visit ↗"}
            </span>
          )}
        </div>
      </div>
    </>
  );

  const baseStyle: React.CSSProperties = {
    position: "relative",
    display: "block",
    overflow: "hidden",
    padding: "clamp(22px, 2.6vw, 34px)",
    borderRadius: 18,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.008))",
    border: "1px solid var(--line)",
    transition: "border-color .35s, transform .35s",
  };

  const hoverOn = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.borderColor = `${p.accent}66`;
    el.style.transform = "translateY(-4px)";
    const spot = el.querySelector<HTMLElement>(".card-spot");
    if (spot) spot.style.opacity = "1";
  };
  const hoverOff = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.borderColor = "var(--line)";
    el.style.transform = "translateY(0)";
    const spot = el.querySelector<HTMLElement>(".card-spot");
    if (spot) spot.style.opacity = "0";
  };

  return p.href ? (
    <a
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={p.href}
      target="_blank"
      rel="noreferrer"
      data-cursor={p.href.includes("github") ? "source" : "open"}
      style={baseStyle}
      onMouseMove={onMove}
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
    >
      {Inner}
    </a>
  ) : (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      style={baseStyle}
      onMouseMove={onMove}
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
    >
      {Inner}
    </div>
  );
}

export default function Work() {
  return (
    <section id="work" style={{ padding: "clamp(60px, 10vh, 120px) 0" }}>
      <div className="container-x">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 48,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span className="eyebrow">( 04 )&nbsp;&nbsp;Selected work</span>
          <span className="mono" style={{ fontSize: 12.5, color: "var(--fg-dim)" }}>
            Code, deals & policy
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: "clamp(18px, 2vw, 26px)",
          }}
        >
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <Card p={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
