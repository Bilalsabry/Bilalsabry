"use client";

import LocalTime from "./LocalTime";
import { profile } from "@/lib/data";
import ThemeToggle from "./ThemeToggle";

export default function TopBar() {
  return (
    <div
      className="wrap mono"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 64,
        fontSize: 12.5,
        color: "var(--fg-3)",
      }}
    >
      <a href="#top" style={{ color: "var(--fg-2)" }}>
        BS<span style={{ color: "var(--accent)" }}>.</span>
      </a>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
        <span className="hide-sm">{profile.location}</span>
        <LocalTime />
        <ThemeToggle />
      </span>
      <style>{`@media (max-width: 480px){ .hide-sm{ display:none } }`}</style>
    </div>
  );
}
