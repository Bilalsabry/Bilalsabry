"use client";

import { useEffect, useState } from "react";

const TZ = "America/New_York";

/**
 * Live clock in Bilal's timezone, with the UTC offset so a visitor anywhere
 * can tell at a glance whether it's a sane hour to reach out. Renders empty
 * on the server to avoid a hydration mismatch, then ticks every second.
 */
export default function LocalTime({ style }: { style?: React.CSSProperties }) {
  const [now, setNow] = useState<string>("");
  const [offset, setOffset] = useState<string>("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const off = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      timeZoneName: "shortOffset",
    });
    const tick = () => {
      const d = new Date();
      setNow(fmt.format(d));
      const part = off.formatToParts(d).find((p) => p.type === "timeZoneName");
      setOffset(part?.value.replace("GMT", "UTC") ?? "");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="mono"
      suppressHydrationWarning
      style={{ fontVariantNumeric: "tabular-nums", ...style }}
      title={`Local time in Princeton, NJ (${TZ})`}
    >
      {now ? (
        <>
          {now} <span style={{ color: "var(--fg-faint)" }}>{offset}</span>
        </>
      ) : (
        " "
      )}
    </span>
  );
}
