"use client";

import { useState } from "react";
import { profile } from "@/lib/data";
import { copyText } from "@/lib/actions";
import { toast } from "./Toast";
import Magnetic from "./Magnetic";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const onEmailClick = async (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) return; // ⌘-click opens the mail client
    e.preventDefault();
    const ok = await copyText(profile.email);
    if (ok) {
      setCopied(true);
      toast("Email copied");
      setTimeout(() => setCopied(false), 1600);
    } else {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const links = [
    { label: "LinkedIn", href: profile.links.linkedin },
    { label: "GitHub", href: profile.links.github },
    { label: "Krux AI", href: profile.links.krux },
  ];

  return (
    <footer id="contact" style={{ padding: "clamp(72px, 14vh, 160px) 0 40px" }}>
      <div className="wrap">
        <span className="label" style={{ display: "block", marginBottom: 20 }}>
          Say hello
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(30px, 5.5vw, 68px)",
            fontWeight: 600,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            maxWidth: 820,
            textWrap: "balance",
          }}
        >
          Interesting problem?{" "}
          <span className="serif" style={{ color: "var(--accent)" }}>
            I’d like to hear it.
          </span>
        </h2>

        <div
          style={{
            marginTop: 32,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
          }}
        >
          <a
            href={`mailto:${profile.email}`}
            onClick={onEmailClick}
            title="Click to copy · ⌘-click to open mail"
            className="btn btn-primary"
            style={{ fontSize: 15 }}
          >
            {profile.email}
            <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>
              {copied ? "copied ✓" : "copy"}
            </span>
          </a>
          {links.map((l) => (
            <Magnetic key={l.label} strength={0.25}>
              <a href={l.href} target="_blank" rel="noreferrer" className="btn">
                {l.label} <span aria-hidden style={{ color: "var(--fg-3)" }}>↗</span>
              </a>
            </Magnetic>
          ))}
        </div>

        <div
          className="mono no-print"
          style={{
            marginTop: "clamp(56px, 10vh, 100px)",
            paddingTop: 20,
            borderTop: "1px solid var(--line)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 10,
            fontSize: 12,
            color: "var(--fg-3)",
          }}
        >
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>
            <kbd style={{ fontFamily: "inherit" }}>⌘K</kbd> to search ·{" "}
            <kbd style={{ fontFamily: "inherit" }}>`</kbd> for the terminal
          </span>
        </div>
      </div>
    </footer>
  );
}
