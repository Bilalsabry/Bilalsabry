"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>#*+";

/**
 * Cycles through `words`, decoding each one character-by-character from random
 * glyphs into the final string — a "signal locking in" effect. Used for the
 * rotating role under the hero name.
 */
export default function Scramble({
  words,
  interval = 2400,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(words[0] ?? "");
  const idx = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    let cancelled = false;

    const scrambleTo = (target: string) =>
      new Promise<void>((resolve) => {
        if (reduce) {
          setDisplay(target);
          resolve();
          return;
        }
        const start = performance.now();
        const duration = 620;
        const from = display;
        const len = Math.max(target.length, from.length);

        const tick = (now: number) => {
          if (cancelled) return;
          const p = Math.min(1, (now - start) / duration);
          let out = "";
          for (let i = 0; i < len; i++) {
            const settleAt = (i / len) * 0.7; // earlier chars lock first
            if (p >= settleAt + 0.3 || p >= 1) {
              out += target[i] ?? "";
            } else if (p < settleAt) {
              out += from[i] ?? "";
            } else {
              out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
            }
          }
          setDisplay(out);
          if (p < 1) {
            raf.current = requestAnimationFrame(tick);
          } else {
            setDisplay(target);
            resolve();
          }
        };
        raf.current = requestAnimationFrame(tick);
      });

    const run = async () => {
      while (!cancelled) {
        await new Promise((r) => setTimeout(r, interval));
        if (cancelled) break;
        idx.current = (idx.current + 1) % words.length;
        await scrambleTo(words[idx.current]);
      }
    };
    run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, interval]);

  return (
    <span className={className} aria-label={words.join(", ")}>
      {display}
      <span style={{ color: "var(--accent)" }}>_</span>
    </span>
  );
}
