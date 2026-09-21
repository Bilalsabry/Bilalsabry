"use client";

import { useEffect, useState } from "react";
import Magnetic from "./Magnetic";
import { openPalette } from "./CommandPalette";

const items = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Approach", href: "#approach" },
  { label: "Now", href: "#now" },
  { label: "Path", href: "#path" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<string>("");
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    // initial read happens in the next frame so it's not a sync setState in the effect body
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

  // Highlight the nav item for the section currently in view.
  useEffect(() => {
    const els = items
      .map((it) => document.querySelector<HTMLElement>(it.href))
      .filter((x): x is HTMLElement => !!x);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        // pick the most visible intersecting section
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(`#${best.target.id}`);
        else if (window.scrollY < 200) setActive("");
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.2, 0.5] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Magnetic>
            <a href="#top" className="mono" style={{ fontSize: 13, letterSpacing: "0.04em" }}>
              BS<span style={{ color: "var(--accent)" }}>.</span>
            </a>
          </Magnetic>
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
          @media (max-width: 720px){ .status-chip{ display: none !important; } }
          @media (max-width: 560px){ .nav-links{ display: none !important; } }
          .nav-link[data-active="true"]{ color: var(--fg) !important; }
          .nav-link[data-active="true"]::after{ transform: scaleX(1); }
          .nav-link::after{
            content:""; position:absolute; left:0; right:0; bottom:-6px; height:1px;
            background: var(--accent); transform: scaleX(0); transform-origin: 0 50%;
            transition: transform .3s cubic-bezier(.22,1,.36,1);
          }
          .nav-link:hover::after{ transform: scaleX(1); }
          .kbd-btn:hover{ border-color: var(--line-strong) !important; color: var(--fg) !important; }
          .kbd-mobile{ display: none; }
          @media (max-width: 560px){
            .kbd-desktop, .kbd-btn kbd{ display: none !important; }
            .kbd-mobile{ display: inline; }
          }
        `}</style>

        <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px, 3vw, 34px)" }}>
          <nav className="nav-links" style={{ display: "flex", gap: "clamp(14px,3vw,34px)" }}>
            {items.map((it) => (
              <Magnetic key={it.href} strength={0.25}>
                <a
                  href={it.href}
                  className="mono nav-link"
                  data-cursor="go"
                  data-active={active === it.href}
                  style={{
                    position: "relative",
                    fontSize: 12.5,
                    letterSpacing: "0.04em",
                    color: "var(--fg-dim)",
                    transition: "color .2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      active === it.href ? "var(--fg)" : "var(--fg-dim)")
                  }
                >
                  {it.label}
                </a>
              </Magnetic>
            ))}
          </nav>

          <Magnetic strength={0.3}>
            <button
              type="button"
              onClick={openPalette}
              className="mono kbd-btn"
              data-cursor="⌘K"
              aria-label="Open command palette"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                letterSpacing: "0.06em",
                color: "var(--fg-dim)",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "6px 9px",
                cursor: "pointer",
                transition: "border-color .2s, color .2s",
              }}
            >
              <span className="kbd-desktop" style={{ opacity: 0.8 }}>Search</span>
              <span className="kbd-mobile" style={{ opacity: 0.9 }}>Menu</span>
              <kbd
                style={{
                  fontFamily: "inherit",
                  fontSize: 10.5,
                  padding: "1px 5px",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--fg)",
                }}
              >
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}
