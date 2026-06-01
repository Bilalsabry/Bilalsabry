"use client";

import Reveal from "./Reveal";
import { timeline } from "@/lib/data";

export default function Timeline() {
  return (
    <section id="path" style={{ padding: "clamp(80px, 12vh, 140px) 0" }}>
      <div className="container-x">
        <span className="eyebrow" style={{ display: "block", marginBottom: 48 }}>
          ( 06 )&nbsp;&nbsp;The path
        </span>

        <div>
          {timeline.map((t, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                className="tl-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(80px, 0.7fr) 2.4fr minmax(120px, 1fr)",
                  gap: "clamp(14px, 3vw, 40px)",
                  alignItems: "baseline",
                  padding: "26px 0",
                  borderTop: "1px solid var(--line)",
                  transition: "background .3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "rgba(255,255,255,0.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span
                  className="mono"
                  style={{ fontSize: 13, color: "var(--accent)" }}
                >
                  {t.when}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: "clamp(18px, 2.3vw, 26px)",
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {t.org}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "var(--fg-dim)",
                      marginTop: 4,
                    }}
                  >
                    {t.role}
                  </div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "var(--fg-faint)",
                      marginTop: 8,
                      maxWidth: 520,
                      lineHeight: 1.5,
                    }}
                  >
                    {t.note}
                  </div>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: 12.5,
                    color: "var(--fg-faint)",
                    textAlign: "right",
                  }}
                >
                  {t.where}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px){
          .tl-row{ grid-template-columns: 1fr !important; }
          .tl-row span:last-child{ text-align: left !important; }
        }
      `}</style>
    </section>
  );
}
