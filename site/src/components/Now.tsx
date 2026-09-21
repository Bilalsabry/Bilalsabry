"use client";

import Reveal from "./Reveal";
import { now } from "@/lib/data";
import LocalTime from "./LocalTime";

/**
 * A "now page" — what I'm actually focused on this season. Short, dated,
 * and edited in data.ts. The live clock makes it feel current.
 */
export default function Now() {
  return (
    <section
      id="now"
      style={{
        padding: "clamp(80px, 12vh, 140px) 0",
        borderTop: "1px solid var(--line)",
        background:
          "linear-gradient(180deg, rgba(110,240,200,0.025), transparent 60%)",
      }}
    >
      <div className="container-x">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <span className="eyebrow">( 06 )&nbsp;&nbsp;Now</span>
          <span className="mono" style={{ fontSize: 12.5, color: "var(--fg-dim)" }}>
            Updated {now.updated} · Princeton{" "}
            <LocalTime style={{ color: "var(--fg)" }} />
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "clamp(18px, 2vw, 28px)",
          }}
        >
          {now.items.map((it, i) => (
            <Reveal key={it.title} delay={i * 80}>
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: "clamp(18px, 2vw, 26px)",
                  borderRadius: 16,
                  border: "1px solid var(--line)",
                  background: "rgba(255,255,255,0.015)",
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                  }}
                >
                  {it.kind}
                </span>
                <div
                  style={{
                    fontSize: "clamp(18px, 2vw, 22px)",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {it.title}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "var(--fg-dim)",
                  }}
                >
                  {it.body}
                </p>
                {it.href && (
                  <a
                    href={it.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="open"
                    className="mono"
                    style={{
                      marginTop: "auto",
                      fontSize: 12.5,
                      color: "var(--fg-dim)",
                      transition: "color .2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-dim)")}
                  >
                    {it.linkLabel ?? "Open"} ↗
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
