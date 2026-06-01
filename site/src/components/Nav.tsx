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
        <a href="#top" className="mono" style={{ fontSize: 13, letterSpacing: "0.04em" }}>
          BS<span style={{ color: "var(--accent)" }}>.</span>
        </a>
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
