"use client";

import { useEffect, useState } from "react";

/**
 * Tiny global toast. Anywhere in the app: `toast("Copied")`.
 * One message at a time, auto-dismisses, respects reduced motion.
 */
const EVENT = "bs:toast";

export function toast(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: message }));
}

export default function Toast() {
  const [msg, setMsg] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let hide = 0;
    let clear = 0;
    const onToast = (e: Event) => {
      const m = (e as CustomEvent<string>).detail;
      window.clearTimeout(hide);
      window.clearTimeout(clear);
      setMsg(m);
      setShow(true);
      hide = window.setTimeout(() => setShow(false), 1800);
      clear = window.setTimeout(() => setMsg(null), 2200);
    };
    window.addEventListener(EVENT, onToast);
    return () => {
      window.removeEventListener(EVENT, onToast);
      window.clearTimeout(hide);
      window.clearTimeout(clear);
    };
  }, []);

  if (!msg) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mono"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 28,
        zIndex: 120,
        transform: `translateX(-50%) translateY(${show ? 0 : 12}px)`,
        opacity: show ? 1 : 0,
        transition: "opacity .25s ease, transform .25s ease",
        padding: "10px 16px",
        borderRadius: 999,
        fontSize: 12.5,
        letterSpacing: "0.04em",
        color: "var(--fg)",
        background: "rgba(16,19,25,0.85)",
        border: "1px solid var(--line-strong)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 60px -20px rgba(0,0,0,0.8)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "var(--accent)", marginRight: 8 }}>✓</span>
      {msg}
    </div>
  );
}
