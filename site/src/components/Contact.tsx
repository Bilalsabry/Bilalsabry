"use client";

import { profile } from "@/lib/data";
import Magnetic from "./Magnetic";

export default function Contact() {
  return (
    <footer
      id="contact"
      style={{
        position: "relative",
        padding: "clamp(100px, 18vh, 200px) 0 56px",
        borderTop: "1px solid var(--line)",
        overflow: "hidden",
      }}
    >
      {/* faint glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80vw",
          height: "60vh",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(110,240,200,0.10), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div className="container-x" style={{ position: "relative" }}>
        <span className="eyebrow" style={{ display: "block", marginBottom: 28 }}>
          ( 07 )&nbsp;&nbsp;Let’s talk
        </span>

        <Magnetic strength={0.18} style={{ maxWidth: "100%" }}>
          <a
            href={`mailto:${profile.email}`}
            data-cursor="email"
            style={{
              display: "inline-block",
              fontSize: "clamp(34px, 8vw, 110px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              transition: "opacity .3s",
            }}
            className="grad-text"
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {profile.email}
          </a>
        </Magnetic>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(14px, 3vw, 32px)",
            marginTop: 56,
          }}
        >
          {[
            { label: "LinkedIn ↗", href: profile.links.linkedin },
            { label: "GitHub ↗", href: profile.links.github },
            { label: "Krux AI ↗", href: profile.links.krux },
          ].map((l) => (
            <Magnetic key={l.label} strength={0.5}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                data-cursor="open"
                className="mono"
                style={{
                  fontSize: 14,
                  color: "var(--fg-dim)",
                  borderBottom: "1px solid var(--line-strong)",
                  paddingBottom: 4,
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-dim)")}
              >
                {l.label}
              </a>
            </Magnetic>
          ))}
        </div>

        <div
          className="mono"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            marginTop: "clamp(64px, 12vh, 130px)",
            fontSize: 11.5,
            color: "var(--fg-faint)",
            letterSpacing: "0.06em",
          }}
        >
          <span>© {new Date().getFullYear()} Bilal Sabry</span>
          <span>{profile.location}</span>
          <span>Built with Next.js · WebGL · Motion</span>
        </div>
      </div>
    </footer>
  );
}
