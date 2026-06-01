"use client";

import { useEffect, useState } from "react";

const items = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Approach", href: "#approach" },
  { label: "Path", href: "#path" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "background .3s ease, border-color .3s ease, backdrop-filter .3s",
        background: solid ? "rgba(7,8,10,0.6)" : "transparent",
        backdropFilter: solid ? "blur(12px)" : "none",
        borderBottom: solid ? "1px solid var(--line)" : "1px solid transparent",
      }}
    >
      <div
        className="container-x"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="#top" className="mono" style={{ fontSize: 13, letterSpacing: "0.04em" }}>
            BS<span style={{ color: "var(--accent)" }}>.</span>
          </a>
          <span
            className="mono status-chip"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "var(--fg-dim)",
              border: "1px solid var(--line)",
              borderRadius: 999,
              padding: "4px 10px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "var(--accent)",
                boxShadow: "0 0 0 0 var(--accent)",
                animation: "bs-pulse 2s infinite",
              }}
            />
            Building Krux AI
          </span>
        </div>
        <style>{`
          @keyframes bs-pulse {
            0% { box-shadow: 0 0 0 0 rgba(110,240,200,0.55); }
            70% { box-shadow: 0 0 0 7px rgba(110,240,200,0); }
            100% { box-shadow: 0 0 0 0 rgba(110,240,200,0); }
          }
          @media (max-width: 560px){ .status-chip{ display: none !important; } }
        `}</style>
        <nav style={{ display: "flex", gap: "clamp(14px,3vw,34px)" }}>
          {items.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className="mono"
              data-cursor="go"
              style={{
                fontSize: 12.5,
                letterSpacing: "0.04em",
                color: "var(--fg-dim)",
                transition: "color .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--fg-dim)")
              }
            >
              {it.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
