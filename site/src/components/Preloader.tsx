"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/\\<>#*0123456789";
const TARGET = "BILAL SABRY";

/**
 * First-load title card: the name decodes from random glyphs while a counter
 * races 0→100 and a progress line fills; then the panel lifts away like a
 * curtain into the hero. Shows once per session; skipped under reduced motion.
 */
export default function Preloader() {
  const [done, setDone] = useState(false);
  const [lifting, setLifting] = useState(false);
  const [pct, setPct] = useState(0);
  const [text, setText] = useState(" ".repeat(TARGET.length));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("bs-intro");
    if (reduce || seen) {
      setDone(true);
      return;
    }
    sessionStorage.setItem("bs-intro", "1");
    document.body.style.overflow = "hidden";

    const DURATION = 1700;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 2);
      setPct(Math.round(eased * 100));

      // decode the name progressively
      const reveal = Math.floor(p * (TARGET.length + 2));
      let out = "";
      for (let i = 0; i < TARGET.length; i++) {
        if (TARGET[i] === " ") out += " ";
        else if (i < reveal) out += TARGET[i];
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setText(out);

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setText(TARGET);
        setLifting(true);
        setTimeout(() => {
          document.body.style.overflow = "";
          setDone(true);
        }, 750);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#07080a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        transform: lifting ? "translateY(-100%)" : "translateY(0)",
        transition: "transform .75s cubic-bezier(.76,0,.24,1)",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: "clamp(28px, 7vw, 64px)",
          letterSpacing: "0.06em",
          color: "#f2f4f7",
          whiteSpace: "pre",
        }}
      >
        {text}
        <span style={{ color: "var(--accent)" }}>_</span>
      </div>

      {/* progress line */}
      <div
        style={{
          marginTop: 34,
          width: "min(360px, 60vw)",
          height: 1,
          background: "rgba(255,255,255,0.12)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "0 50%",
            transform: `scaleX(${pct / 100})`,
            background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
          }}
        />
      </div>

      <div
        className="mono"
        style={{
          position: "absolute",
          bottom: 28,
          right: 32,
          fontSize: 12,
          letterSpacing: "0.1em",
          color: "var(--fg-faint)",
        }}
      >
        {String(pct).padStart(3, "0")}
      </div>
    </div>
  );
}
