"use client";

import Reveal from "./Reveal";
import { projects, type Project } from "@/lib/data";

function Row({ p, i }: { p: Project; i: number }) {
  const inner = (
    <>
      <span className="mono row-idx" style={{ fontSize: 12.5, color: "var(--fg-3)" }}>
        0{i + 1}
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "clamp(22px, 2.6vw, 30px)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {p.title}
          </h3>
          <span className="mono" style={{ fontSize: 12.5, color: "var(--fg-3)" }}>
            {p.year}
          </span>
        </div>
        <p
          style={{
            margin: "10px 0 0",
            maxWidth: 560,
            fontSize: 15.5,
            lineHeight: 1.55,
            color: "var(--fg-2)",
            textWrap: "pretty",
          }}
        >
          {p.line}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {p.tags.map((t) => (
            <span
              key={t}
              className="mono"
              style={{
                fontSize: 11.5,
                padding: "4px 9px",
                borderRadius: 6,
                border: "1px solid var(--line)",
                color: "var(--fg-2)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <span
        className="row-arrow"
        aria-hidden
        style={{
          fontSize: 22,
          color: "var(--fg-3)",
          transition: "transform .3s cubic-bezier(.22,1,.36,1), color .2s",
          justifySelf: "end",
        }}
      >
        {p.href ? "↗" : ""}
      </span>
    </>
  );

  const style: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "48px minmax(0, 1fr) 32px",
    gap: "clamp(12px, 3vw, 32px)",
    alignItems: "start",
    padding: "clamp(24px, 3.5vw, 36px) clamp(8px, 1.5vw, 20px)",
    marginInline: "clamp(-8px, -1.5vw, -20px)",
    borderTop: "1px solid var(--line)",
    borderRadius: 14,
    transition: "background .25s",
  };

  return p.href ? (
    <a href={p.href} target="_blank" rel="noreferrer" className="work-row" style={style}>
      {inner}
    </a>
  ) : (
    <div className="work-row" style={style}>
      {inner}
    </div>
  );
}

export default function Work() {
  return (
    <section id="work" style={{ padding: "clamp(48px, 8vh, 96px) 0" }}>
      <div className="wrap">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 20,
          }}
        >
          <span className="label">Selected work</span>
          <span className="mono" style={{ fontSize: 12.5, color: "var(--fg-3)" }}>
            Code · deals · policy
          </span>
        </div>
        <div>
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <Row p={p} i={i} />
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`
        .work-row:hover{ background: var(--bg-2); }
        .work-row:hover .row-arrow{ transform: translate(3px,-3px); color: var(--accent); }
        @media (max-width: 560px){
          .work-row{ grid-template-columns: minmax(0,1fr) 24px !important; }
          .row-idx{ display:none }
        }
      `}</style>
    </section>
  );
}
