"use client";

import type { Section } from "@/lib/data";

/** A labelled list: title on the left, one quiet line on the right. */
export default function Rows({ section }: { section: Section }) {
  return (
    <section id={section.id} style={{ padding: "clamp(18px, 3vh, 28px) 0" }}>
      <div className="wrap">
          <div
            className="rows-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "140px minmax(0, 1fr)",
              gap: "0 clamp(20px, 4vw, 48px)",
              alignItems: "start",
            }}
          >
            <span className="label" style={{ paddingTop: 22 }}>
              {section.label}
            </span>
            <div>
              {section.rows.map((r) => {
                const inner = (
                  <>
                    <span style={{ fontWeight: 500, fontSize: 17, letterSpacing: "-0.01em" }}>
                      {r.title}
                    </span>
                    <span style={{ color: "var(--fg-2)", fontSize: 15.5, lineHeight: 1.5 }}>
                      {r.note ?? ""}
                    </span>
                    <span
                      className="row-arrow"
                      aria-hidden
                      style={{
                        color: "var(--fg-3)",
                        transition: "transform .3s cubic-bezier(.22,1,.36,1), color .2s",
                        justifySelf: "end",
                      }}
                    >
                      {r.href ? "↗" : ""}
                    </span>
                  </>
                );
                const style: React.CSSProperties = {
                  display: "grid",
                  gridTemplateColumns: "150px minmax(0, 1fr) 20px",
                  gap: "6px clamp(14px, 2vw, 24px)",
                  alignItems: "baseline",
                  padding: "18px 0",
                  borderTop: "1px solid var(--line)",
                };
                return r.href ? (
                  <a
                    key={r.id}
                    href={r.href}
                    target="_blank"
                    rel="noreferrer"
                    className="row"
                    style={style}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={r.id} className="row" style={style}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
      </div>
      <style>{`
        .row:hover .row-arrow{ transform: translate(2px,-2px); color: var(--accent); }
        a.row:hover span:first-child{ color: var(--accent); }
        a.row span:first-child{ transition: color .2s; }
        @media (max-width: 640px){
          .rows-grid{ grid-template-columns: 1fr !important; }
          .rows-grid > .label{ padding-top: 0 !important; margin-bottom: 8px; }
          .row{ grid-template-columns: minmax(0,1fr) 20px !important; }
          .row > span:nth-child(2){ grid-column: 1 / -1; }
          .row > .row-arrow{ grid-row: 1; grid-column: 2; }
        }
      `}</style>
    </section>
  );
}
