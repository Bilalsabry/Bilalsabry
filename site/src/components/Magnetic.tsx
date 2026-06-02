"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Magnetic hover — the wrapped element drifts toward the cursor while hovered,
 * then springs back on leave. Disabled under reduced-motion.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  style,
}: {
  children: ReactNode;
  strength?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 14, mass: 0.4 });

  const move = (e: React.MouseEvent) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      style={{ display: "inline-flex", x: sx, y: sy, ...style }}
    >
      {children}
    </motion.span>
  );
}
