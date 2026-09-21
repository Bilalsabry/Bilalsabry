"use client";

import { useEffect, useState } from "react";

/**
 * Cycles through words with a quiet vertical crossfade. Sized to the longest
 * word so the layout never shifts. Static under reduced motion.
 */
export default function Rotator({
  words,
  interval = 2200,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      requestAnimationFrame(() => setReduce(true));
      return;
    }
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  if (reduce) return <span className={className}>{words[0]}</span>;

  return (
    <span
      className={className}
      aria-label={words.join(", ")}
      style={{
        display: "inline-grid",
        verticalAlign: "baseline",
        overflow: "hidden",
        height: "1.1em",
        lineHeight: 1.1,
      }}
    >
      {/* invisible sizer keeps width stable */}
      <span style={{ gridArea: "1 / 1", visibility: "hidden", whiteSpace: "nowrap" }} aria-hidden>
        {words.reduce((a, b) => (a.length >= b.length ? a : b))}
      </span>
      {words.map((w, n) => (
        <span
          key={w}
          aria-hidden={n !== i}
          style={{
            gridArea: "1 / 1",
            whiteSpace: "nowrap",
            transform: `translateY(${n === i ? 0 : n < i ? -110 : 110}%)`,
            opacity: n === i ? 1 : 0,
            transition: "transform .6s cubic-bezier(.22,1,.36,1), opacity .4s",
          }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
