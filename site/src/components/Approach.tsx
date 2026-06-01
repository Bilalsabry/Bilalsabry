"use client";

import Reveal from "./Reveal";
import { pillars } from "@/lib/data";

export default function Approach() {
  return (
    <section
      id="approach"
      style={{
        padding: "clamp(80px, 14vh, 160px) 0",
        background:
          "linear-gradient(180deg, transparent, rgba(138,140,255,0.03) 50%, transparent)",
      }}
    >
      <div className="container-x">
        <span className="eyebrow" style={{ display: "block", marginBottom: 18 }}>
          ( 05 )&nbsp;&nbsp;How I operate
        </span>
        <h2
          style={{
            fontSize: "clamp(28px, 5vw, 58px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            maxWidth: 820,
            margin: "0 0 64px",
            lineHeight: 1.08,
          }}
        >
          Three things most people keep{" "}
          <span className="serif" style={{ color: "var(--accent)" }}>
            in separate rooms.
          </span>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "clamp(20px, 3vw, 40px)",
          }}
        >
          {pillars.map((p, i) => (
            <Reveal key={p.k} delay={i * 100}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  height: "100%",
                }}
              >
                <div
                  className="mono"
                  style={{
                    fontSize: 12,
                    color: "var(--fg-faint)",
                    letterSpacing: "0.1em",
                  }}
                >
                  0{i + 1} / {p.k}
                </div>
                <h3
                  className="grad-text"
                  style={{
                    fontSize: "clamp(34px, 5vw, 56px)",
                    fontWeight: 600,
                    letterSpacing: "-0.03em",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: 15.5,
                    lineHeight: 1.6,
                    color: "var(--fg-dim)",
                    margin: 0,
                  }}
                >
                  {p.body}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                    marginTop: "auto",
                    paddingTop: 12,
                  }}
                >
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="mono"
                      style={{
                        fontSize: 11.5,
                        color: "var(--fg-dim)",
                        borderBottom: "1px solid var(--line-strong)",
                        paddingBottom: 2,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
