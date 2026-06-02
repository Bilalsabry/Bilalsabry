"use client";

import { useEffect, useRef, type ReactNode, type ElementType } from "react";

/**
 * Lightweight scroll-reveal. Children start hidden (CSS [data-reveal]) and
 * transition in once intersecting. `delay` staggers grouped items.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition =
      "opacity .8s cubic-bezier(.22,.61,.36,1), transform .8s cubic-bezier(.22,.61,.36,1), filter .8s cubic-bezier(.22,.61,.36,1)";
    el.style.transitionDelay = `${delay}ms`;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "none";
            el.style.filter = "none";
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const Comp = Tag as ElementType;
  return (
    <Comp ref={ref} data-reveal className={className}>
      {children}
    </Comp>
  );
}
