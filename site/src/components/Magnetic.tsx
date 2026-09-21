"use client";

import { useRef, type ReactNode } from "react";

/**
 * Wraps an inline element so it is gently pulled toward the pointer while
 * hovered and springs back on leave. Pointer-fine devices only; on touch the
 * transform never fires so it degrades to a plain wrapper.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
  style,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transition = "transform .12s ease-out";
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform .55s cubic-bezier(.22,1,.36,1)";
    el.style.transform = "translate(0, 0)";
  };

  return (
    <span
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ display: "inline-block", willChange: "transform", ...style }}
    >
      {children}
    </span>
  );
}
