"use client";

import Reveal from "./Reveal";
import { profile } from "@/lib/data";

/** A framed photo that grades into the dark theme, with a graceful
 *  placeholder if the file isn't present yet. */
function Photo({
  src,
  label,
  ratio = "4 / 5",
  accent = "#6ef0c8",
}: {
  src: string;
  label: string;
  ratio?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: ratio,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid var(--line-strong)",
        background:
          "linear-gradient(160deg, #12161d 0%, #0b0e13 100%)",
        boxShadow: `0 30px 80px -40px ${accent}40`,
      }}
    >
      {/* placeholder (revealed if the image is missing) */}
      <div
        className="mono"
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: "var(--fg-faint)",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${profile.name} — ${label}`}
        loading="lazy"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          // grade daylight photos toward the cinematic palette
          filter: "contrast(1.04) saturate(0.92) brightness(0.97)",
        }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      {/* vignette + bottom darkening so it sits in the dark UI */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(7,8,10,0) 55%, rgba(7,8,10,0.55) 100%)",
          boxShadow: "inset 0 0 120px 20px rgba(0,0,0,0.45)",
        }}
      />
      {/* corner tick */}
      <span
        className="mono"
        style={{
          position: "absolute",
          left: 12,
          bottom: 10,
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.7)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

const facts = [
  ["Based in", "Princeton, NJ"],
  ["School", "UC Berkeley ’24 — Economics × Data Science"],
  ["Currently", "Building Krux AI"],
  ["Also", "CFA Level I candidate · English / Sinhala"],
];

export default function About() {
  return (
    <section id="about" style={{ padding: "clamp(80px, 13vh, 150px) 0" }}>
      <div className="container-x">
        <span className="eyebrow" style={{ display: "block", marginBottom: 18 }}>
          ( 02 )&nbsp;&nbsp;Who I am
        </span>
        <h2
          style={{
            fontSize: "clamp(28px, 4.6vw, 56px)",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            maxWidth: 900,
            margin: "0 0 64px",
            lineHeight: 1.1,
          }}
        >
          I work across code, capital, and policy —{" "}
          <span className="serif" style={{ color: "var(--accent)" }}>
            and I’m most useful where they meet.
          </span>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 0.95fr) 1.35fr",
            gap: "clamp(28px, 5vw, 72px)",
            alignItems: "start",
          }}
          className="about-grid"
        >
          {/* portrait */}
          <Reveal>
            <Photo src="/portrait.jpg" label="Berkeley ’24" ratio="4 / 5" />
          </Reveal>

          {/* bio + facts + candids */}
          <Reveal delay={120}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <p
                style={{
                  fontSize: "clamp(17px, 1.7vw, 20px)",
                  lineHeight: 1.6,
                  color: "var(--fg-dim)",
                  margin: 0,
                }}
              >
                I’m Bilal — a founder, engineer, and trained economist. I
                finished a double degree at Berkeley in two and a half years,
                then went straight to where the stakes were real: advising a
                finance ministry through a sovereign default, running strategy
                and finance for a pharmaceutical manufacturer, and now building{" "}
                <a
                  href={profile.links.krux}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="open"
                  style={{ color: "var(--accent)" }}
                >
                  Krux&nbsp;AI
                </a>
                .
              </p>
              <p
                style={{
                  fontSize: "clamp(17px, 1.7vw, 20px)",
                  lineHeight: 1.6,
                  color: "var(--fg-dim)",
                  margin: 0,
                }}
              >
                I’m drawn to problems that sit between disciplines — where you
                have to write the code <em>and</em> model the deal <em>and</em>{" "}
                understand the policy. That overlap is where I do my best work,
                and it’s the reason I never picked a single lane.
              </p>

              {/* fact list */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "12px 28px",
                  marginTop: 6,
                }}
              >
                {facts.map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      borderTop: "1px solid var(--line)",
                      paddingTop: 10,
                    }}
                  >
                    <div
                      className="mono"
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--fg-faint)",
                        marginBottom: 4,
                      }}
                    >
                      {k}
                    </div>
                    <div style={{ fontSize: 14.5, color: "var(--fg)" }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* candids */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginTop: 10,
                }}
              >
                <Photo
                  src="/candid-1.jpg"
                  label="Off the clock"
                  ratio="16 / 10"
                  accent="#8a8cff"
                />
                <Photo
                  src="/candid-2.jpg"
                  label="Sonoma"
                  ratio="16 / 10"
                  accent="#ffce6b"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px){
          .about-grid{ grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
