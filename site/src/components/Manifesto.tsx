"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { manifesto } from "@/lib/data";

const words = manifesto.join(" ").split(" ");

function Word({
  children,
  range,
  progress,
}: {
  children: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"],
  });

  return (
    <section
      ref={ref}
      id="manifesto"
      style={{ padding: "clamp(120px, 22vh, 240px) 0" }}
    >
      <div className="container-x">
        <span className="eyebrow" style={{ display: "block", marginBottom: 40 }}>
          ( 01 )&nbsp;&nbsp;The shape of it
        </span>
        <p
          style={{
            fontSize: "clamp(26px, 4.6vw, 58px)",
            lineHeight: 1.28,
            fontWeight: 500,
            letterSpacing: "-0.025em",
            maxWidth: 1000,
            margin: 0,
          }}
        >
          {words.map((w, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} range={[start, end]} progress={scrollYProgress}>
                {w}
              </Word>
            );
          })}
        </p>
      </div>
    </section>
  );
}
