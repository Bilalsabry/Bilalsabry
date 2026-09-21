"use client";

import { useEffect, useState } from "react";
import Magnetic from "./Magnetic";
import { openPalette } from "./CommandPalette";
import { profile } from "@/lib/data";

const items = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState("");
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    const raf = requestAnimationFrame(() => {
      setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
      onScroll();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const els = items
      .map((it) => document.querySelector<HTMLElement>(it.href))
      .filter((x): x is HTMLElement => !!x);
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(`#${best.target.id}`);
        else if (window.scrollY < 200) setActive("");
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: solid ? "color-mix(in oklab, var(--bg) 82%, transparent)" : "transparent",
        backdropFilter: solid ? "blur(14px)" : "none",
        borderBottom: `1px solid ${solid ? "var(--line)" : "transparent"}`,
        transition: "background .3s, border-color .3s",
      }}
    >
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          gap: 16,
        }}
      >
        <Magnetic strength={0.2}>
          <a href="#top" style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>
            {profile.name}
          </a>
        </Magnetic>

        <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 3vw, 32px)" }}>
          <nav className="nav-links" style={{ display: "flex", gap: "clamp(16px, 3vw, 28px)" }}>
            {items.map((it) => (
              <Magnetic key={it.href} strength={0.2}>
                <a
                  href={it.href}
                  className="link"
                  data-active={active === it.href}
                  style={{ fontSize: 14 }}
                >
                  {it.label}
                </a>
              </Magnetic>
            ))}
          </nav>
          <Magnetic strength={0.25}>
            <button
              type="button"
              onClick={openPalette}
              aria-label="Open command palette"
              className="mono kbd-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11.5,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--bg-2)",
                color: "var(--fg-2)",
                cursor: "pointer",
                transition: "border-color .2s, color .2s",
              }}
            >
              <span className="kbd-desktop">Search</span>
              <span className="kbd-mobile">Menu</span>
              <kbd
                style={{
                  fontFamily: "inherit",
                  fontSize: 10.5,
                  padding: "1px 5px",
                  borderRadius: 4,
                  border: "1px solid var(--line-2)",
                  color: "var(--fg)",
                }}
              >
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>
          </Magnetic>
        </div>
      </div>
      <style>{`
        .kbd-btn:hover{ border-color: var(--line-2) !important; color: var(--fg) !important; }
        .kbd-mobile{ display:none }
        @media (max-width: 560px){
          .nav-links{ display:none !important }
          .kbd-desktop, .kbd-btn kbd{ display:none !important }
          .kbd-mobile{ display:inline }
        }
      `}</style>
    </header>
  );
}
