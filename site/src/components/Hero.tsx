"use client";

import { profile } from "@/lib/data";
import Rotator from "./Rotator";
import LocalTime from "./LocalTime";

export default function Hero() {
  return (
    <section
      id="top"
      style={{
        position: "relative",
        minHeight: "calc(100svh - 64px)",
        display: "flex",
        alignItems: "center",
        padding: "clamp(40px, 8vh, 96px) 0",
        overflow: "hidden",
      }}
    >
      {/* one soft accent glow, nothing else */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "min(70vw, 720px)",
          aspectRatio: "1",
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, var(--accent-soft), transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="wrap hero-grid"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(220px, 0.9fr)",
          gap: "clamp(32px, 6vw, 80px)",
          alignItems: "center",
        }}
      >
        <div>
          <div
            className="mono"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "10px 18px",
              fontSize: 12.5,
              color: "var(--fg-3)",
              marginBottom: "clamp(24px, 4vh, 40px)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--fg-2)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "var(--accent)",
                  boxShadow: "0 0 0 3px var(--accent-soft)",
                }}
              />
              {profile.status}
            </span>
            <span>{profile.location}</span>
            <LocalTime />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(40px, 6.6vw, 84px)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              fontWeight: 600,
              textWrap: "balance",
            }}
          >
            {profile.headline.lead}{" "}
            <span className="serif" style={{ color: "var(--accent)" }}>
              {profile.headline.italic}
            </span>
          </h1>

          <p
            style={{
              margin: "clamp(22px, 3.5vh, 32px) 0 0",
              maxWidth: 600,
              fontSize: "clamp(16px, 1.6vw, 19px)",
              lineHeight: 1.55,
              color: "var(--fg-2)",
              textWrap: "pretty",
            }}
          >
            {profile.intro}
          </p>

          <div
            style={{
              marginTop: "clamp(26px, 4vh, 40px)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 12,
            }}
          >
            <a href="#work" className="btn btn-primary">
              See the work <span aria-hidden>↓</span>
            </a>
            <a href={`mailto:${profile.email}`} className="btn">
              Email me
            </a>
            <span
              className="mono"
              style={{ marginLeft: 6, fontSize: 13, color: "var(--fg-3)" }}
            >
              <Rotator words={profile.roles} />
              <span style={{ color: "var(--accent)" }}>_</span>
            </span>
          </div>
        </div>

        <figure
          className="hero-photo"
          style={{
            margin: 0,
            position: "relative",
            aspectRatio: "4 / 5",
            borderRadius: 20,
            overflow: "hidden",
            background: "var(--bg-2)",
            border: "1px solid var(--line)",
            boxShadow: "0 30px 60px -40px rgba(0,0,0,.35)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/portrait.jpg"
            alt={profile.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 20%",
            }}
          />
        </figure>
      </div>

      <style>{`
        @media (max-width: 760px){
          .hero-grid{ grid-template-columns: 1fr !important; }
          .hero-photo{ order: -1; width: 160px; aspect-ratio: 1 !important; border-radius: 999px !important; }
        }
      `}</style>
    </section>
  );
}
