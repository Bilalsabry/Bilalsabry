"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis-powered smooth scrolling. Respects prefers-reduced-motion by simply
 * not mounting (native scroll takes over). Exposes a top progress bar.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    // expose for the command palette / programmatic jumps
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    const bar = document.getElementById("scroll-progress");
    let raf = 0;
    function loop(time: number) {
      lenis.raf(time);
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        bar.style.transform = `scaleX(${p})`;
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 70,
          transformOrigin: "0 50%",
          transform: "scaleX(0)",
          background:
            "linear-gradient(90deg, var(--accent), var(--accent-2))",
        }}
        id="scroll-progress"
      />
      {children}
    </>
  );
}
