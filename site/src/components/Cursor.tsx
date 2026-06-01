"use client";

import { useEffect, useRef } from "react";

/**
 * Custom cursor: a small dot that tracks instantly + a larger ring that lags
 * behind with spring-like easing. The ring grows and reads a label when
 * hovering anything marked [data-cursor] (e.g. "view", "open"). Pointer-fine
 * devices only; falls back to the native cursor otherwise.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    document.body.classList.add("has-cursor");

    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { x: target.x, y: target.y };
    let raf = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      if (!visible && dot.current && ring.current) {
        visible = true;
        dot.current.style.opacity = "1";
        ring.current.style.opacity = "1";
      }

      const el = (e.target as HTMLElement)?.closest?.(
        "a, button, [data-cursor]"
      ) as HTMLElement | null;
      const ringEl = ring.current;
      if (!ringEl) return;
      if (el) {
        ringEl.dataset.active = "true";
        const text = el.getAttribute("data-cursor");
        if (label.current) label.current.textContent = text ?? "";
      } else {
        ringEl.dataset.active = "false";
        if (label.current) label.current.textContent = "";
      }
    };

    const loop = () => {
      ringPos.x += (target.x - ringPos.x) * 0.18;
      ringPos.y += (target.y - ringPos.y) * 0.18;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      if (dot.current) dot.current.style.opacity = "0";
      if (ring.current) ring.current.style.opacity = "0";
      visible = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "var(--accent)",
          pointerEvents: "none",
          zIndex: 90,
          opacity: 0,
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ring}
        aria-hidden
        data-active="false"
        className="cursor-ring"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.5)",
          pointerEvents: "none",
          zIndex: 89,
          opacity: 0,
          display: "grid",
          placeItems: "center",
          transition:
            "width .25s ease, height .25s ease, background .25s ease, border-color .25s ease",
        }}
      >
        <span
          ref={label}
          className="mono"
          style={{ fontSize: 10, letterSpacing: "0.12em", color: "#07080a" }}
        />
      </div>
      <style>{`
        .cursor-ring[data-active="true"] {
          width: 64px;
          height: 64px;
          background: var(--accent);
          border-color: var(--accent);
        }
      `}</style>
    </>
  );
}
