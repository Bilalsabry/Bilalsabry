"use client";

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const HERO_FPS = 30;
export const HERO_DURATION = 360; // 12s, seamless loop

const TAU = Math.PI * 2;

// Smooth periodic oscillation in [0,1] over `dur` frames (loop-safe).
const osc = (frame: number, dur: number, phase = 0) =>
  0.5 + 0.5 * Math.sin((frame / dur) * TAU + phase);

/**
 * Cinematic, seamlessly-looping ANIMATED BACKGROUND rendered with Remotion.
 * It carries the hero's motion; the name/role/tagline sit on top as DOM so
 * they stay crisp, interactive and unclipped. Every value is periodic over
 * HERO_DURATION, so the loop has no visible seam. Heavy bottom scrim keeps
 * the bottom-left foreground text legible.
 */
export const HeroVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames: dur } = useVideoConfig();

  // aurora blobs — drift on independent periodic phases
  const blobs = [
    { color: "rgba(110,240,200,0.60)", size: 72, phase: 0.0, ax: 26, ay: 16, bx: 64, by: 24 },
    { color: "rgba(138,140,255,0.55)", size: 84, phase: 2.1, ax: 30, ay: 18, bx: 44, by: 58 },
    { color: "rgba(127,209,255,0.42)", size: 66, phase: 4.0, ax: 24, ay: 22, bx: 76, by: 44 },
    { color: "rgba(255,206,107,0.22)", size: 58, phase: 5.2, ax: 20, ay: 14, bx: 32, by: 72 },
  ];

  // floating glints
  const glints = Array.from({ length: 7 }, (_, i) => i);

  const sweepX = interpolate(frame % dur, [0, dur], [-30, 130]);

  return (
    <AbsoluteFill style={{ background: "#07080a", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 95% at 68% 6%, #182944 0%, #0a0e16 46%, #07080a 100%)",
        }}
      />

      {blobs.map((b, i) => {
        const x = b.bx + (osc(frame, dur, b.phase) - 0.5) * 2 * b.ax;
        const y = b.by + (osc(frame, dur, b.phase + 1.3) - 0.5) * 2 * b.ay;
        return (
          <AbsoluteFill
            key={i}
            style={{
              background: `radial-gradient(${b.size}% ${b.size}% at ${x}% ${y}%, ${b.color} 0%, transparent 58%)`,
              filter: "blur(6px)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}

      {/* floating glints */}
      {glints.map((i) => {
        const px = (i * 137.5) % 100;
        const baseY = (i * 53) % 100;
        const gx = px + (osc(frame, dur, i) - 0.5) * 8;
        const gy = baseY + (osc(frame, dur, i * 1.7 + 2) - 0.5) * 10;
        const a = 0.15 + 0.25 * osc(frame, dur, i * 2.3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${gx}%`,
              top: `${gy}%`,
              width: 4,
              height: 4,
              borderRadius: 999,
              background: "#bff3e2",
              opacity: a,
              filter: "blur(0.5px)",
              boxShadow: "0 0 14px 3px rgba(110,240,200,0.5)",
            }}
          />
        );
      })}

      {/* moving light sweep */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent ${sweepX - 12}%, rgba(255,255,255,0.09) ${sweepX}%, transparent ${sweepX + 12}%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* faint grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          opacity: 0.4,
          maskImage:
            "radial-gradient(85% 70% at 60% 35%, black 0%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(85% 70% at 60% 35%, black 0%, transparent 78%)",
        }}
      />

      {/* readability scrim — heavier bottom-left for foreground text */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,8,10,0.05) 0%, rgba(7,8,10,0.18) 50%, rgba(7,8,10,0.92) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(75deg, rgba(7,8,10,0.55) 0%, rgba(7,8,10,0.12) 42%, transparent 70%)",
        }}
      />

      {/* vignette */}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 320px 90px rgba(0,0,0,0.72)" }} />
    </AbsoluteFill>
  );
};
