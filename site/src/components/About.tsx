"use client";

import Reveal from "./Reveal";
import { path, profile } from "@/lib/data";

export default function About() {
  return (
    <section
      id="about"
      style={{
        padding: "clamp(48px, 8vh, 96px) 0",
        background: "var(--bg-2)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div
        className="wrap about-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
          gap: "clamp(32px, 6vw, 96px)",
          alignItems: "start",
        }}
      >
        <Reveal>
          <span className="label" style={{ display: "block", marginBottom: 20 }}>
            In short
          </span>
          <p
            style={{
              margin: 0,
              fontSize: "clamp(22px, 2.6vw, 32px)",
              lineHeight: 1.3,
              letterSpacing: "-0.025em",
              fontWeight: 500,
              textWrap: "pretty",
            }}
          >
            I never picked a lane. I write the software, I model the deal, and
            I sit in the room where the strategy gets set.{" "}
            <span className="serif" style={{ color: "var(--accent)" }}>
              The overlap is where I’m most useful.
            </span>
          </p>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 24px",
              fontSize: 14,
              color: "var(--fg-2)",
            }}
          >
            <span>Based in {profile.location}</span>
            <span>CFA Level I candidate</span>
            <span>English · Sinhala</span>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <span className="label" style={{ display: "block", marginBottom: 12 }}>
            Path
          </span>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {path.map((s) => (
              <li
                key={s.org}
                style={{
                  display: "grid",
                  gridTemplateColumns: "84px minmax(0, 1fr)",
                  gap: 16,
                  padding: "14px 0",
                  borderTop: "1px solid var(--line)",
                  alignItems: "baseline",
                }}
              >
                <span className="mono" style={{ fontSize: 12.5, color: "var(--fg-3)" }}>
                  {s.when}
                </span>
                <span>
                  <span style={{ fontWeight: 500 }}>{s.org}</span>
                  <span style={{ color: "var(--fg-2)" }}> — {s.role}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
      <style>{`
        @media (max-width: 760px){ .about-grid{ grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
