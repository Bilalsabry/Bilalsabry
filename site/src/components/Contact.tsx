"use client";

import { useState } from "react";
import { profile } from "@/lib/data";
import { copyText } from "@/lib/actions";
import { toast } from "./Toast";
import Magnetic from "./Magnetic";
import LocalTime from "./LocalTime";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  // Click copies the address (a mailto on a machine with no mail client is a
  // dead end); ⌘/Ctrl-click or middle-click still opens the mail client.
  const onEmailClick = async (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    const ok = await copyText(profile.email);
    if (ok) {
      setCopied(true);
      toast("Email copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    } else {
      window.location.href = `mailto:${profile.email}`;
    }
  };

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
          ( 08 )&nbsp;&nbsp;Let’s talk
        </span>

        <a
          href={`mailto:${profile.email}`}
          data-cursor={copied ? "copied ✓" : "copy"}
          onClick={onEmailClick}
          title="Click to copy · ⌘-click to open mail"
          style={{
            display: "inline-block",
            fontSize: "clamp(34px, 8vw, 110px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            transition: "color .3s",
          }}
          className="grad-text"
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {profile.email}
        </a>
        <div
          className="mono"
          style={{
            marginTop: 18,
            fontSize: 12.5,
            color: "var(--fg-faint)",
            letterSpacing: "0.04em",
          }}
        >
          Click to copy · It’s <LocalTime style={{ color: "var(--fg-dim)" }} /> in
          Princeton right now.
        </div>

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
            <Magnetic key={l.label} strength={0.3}>
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
          <span>
            Press <kbd style={{ fontFamily: "inherit", color: "var(--fg-dim)" }}>⌘K</kbd>{" "}
            to search · <kbd style={{ fontFamily: "inherit", color: "var(--fg-dim)" }}>`</kbd>{" "}
            for a surprise
          </span>
        </div>
      </div>
    </footer>
  );
}
