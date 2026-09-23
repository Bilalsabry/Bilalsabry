"use client";

import { useEffect, useState } from "react";
import { resolvedTheme, toggleTheme, THEME_EVENT } from "@/lib/theme";

/**
 * Sun / moon button. Reads the live theme after mount (so server and client
 * markup match), then follows changes from the palette, the terminal, or the
 * OS setting.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setDark(resolvedTheme() === "dark");
    const raf = requestAnimationFrame(sync);
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    window.addEventListener(THEME_EVENT, sync);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", sync);
      window.removeEventListener(THEME_EVENT, sync);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="theme-btn"
      style={{
        width: 30,
        height: 30,
        display: "inline-grid",
        placeItems: "center",
        borderRadius: 999,
        border: "1px solid transparent",
        background: "transparent",
        color: "var(--fg-2)",
        cursor: "pointer",
        transition: "color .2s, border-color .2s, background .2s",
        // reserve space before we know the theme; avoids layout shift
        visibility: dark === null ? "hidden" : "visible",
      }}
    >
      {dark ? (
        // sun
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // moon
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
      <style>{`.theme-btn:hover{ color: var(--fg); border-color: var(--line); background: var(--bg-2); }`}</style>
    </button>
  );
}
