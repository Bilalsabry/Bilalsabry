"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/data";

const fmt = (tz?: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

/**
 * "9:41 pm here · 7:11 am for you". The second half only appears when the
 * visitor's clock differs from Bilal's, so locals just see one time. Renders
 * empty on the server to avoid a hydration mismatch.
 */
export default function LocalTime({ style }: { style?: React.CSSProperties }) {
  const [here, setHere] = useState("");
  const [you, setYou] = useState<string | null>(null);

  useEffect(() => {
    const mine = fmt(profile.timeZone);
    const theirs = fmt(); // visitor's own zone
    const tick = () => {
      const d = new Date();
      const a = mine.format(d).toLowerCase();
      const b = theirs.format(d).toLowerCase();
      setHere(a);
      setYou(a === b ? null : b);
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="mono"
      suppressHydrationWarning
      style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", ...style }}
      title={`Local time in ${profile.location}`}
    >
      {here ? (
        <>
          {here} here
          {you && (
            <>
              <span style={{ color: "var(--fg-3)", margin: "0 6px" }}>·</span>
              {you} for you
            </>
          )}
        </>
      ) : (
        " "
      )}
    </span>
  );
}
