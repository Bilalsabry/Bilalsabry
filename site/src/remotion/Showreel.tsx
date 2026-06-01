"use client";

import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { profile } from "@/lib/data";

export const REEL_FPS = 30;
export const REEL_DURATION = 540; // 18s, plays once

const TAU = Math.PI * 2;
const osc = (f: number, dur: number, ph = 0) =>
  0.5 + 0.5 * Math.sin((f / dur) * TAU + ph);
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/\\<>#*0123456789";

/* ---------- shared animated background ---------- */
const Bg: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = REEL_DURATION;
  const blobs = [
    { c: "rgba(110,240,200,0.5)", s: 70, ph: 0, bx: 62, by: 26 },
    { c: "rgba(138,140,255,0.5)", s: 80, ph: 2.1, bx: 40, by: 64 },
    { c: "rgba(127,209,255,0.36)", s: 64, ph: 4, bx: 78, by: 48 },
  ];
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 95% at 60% 4%, #16233f 0%, #0a0e16 48%, #07080a 100%)",
        }}
      />
      {blobs.map((b, i) => {
        const x = b.bx + (osc(frame, dur, b.ph) - 0.5) * 40;
        const y = b.by + (osc(frame, dur, b.ph + 1.3) - 0.5) * 30;
        return (
          <AbsoluteFill
            key={i}
            style={{
              background: `radial-gradient(${b.s}% ${b.s}% at ${x}% ${y}%, ${b.c}, transparent 60%)`,
              filter: "blur(8px)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 300px 70px rgba(0,0,0,0.7)" }} />
    </>
  );
};

const center: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

/* ---------- Scene 1 — name decode ---------- */
const SceneName: React.FC = () => {
  const frame = useCurrentFrame();
  const target = profile.name.toUpperCase();
  const reveal = Math.floor(interpolate(frame, [10, 60], [0, target.length + 2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  let out = "";
  for (let i = 0; i < target.length; i++) {
    if (target[i] === " ") out += " ";
    else if (i < reveal) out += target[i];
    else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
  }
  const lineW = interpolate(frame, [0, 22], [0, 220], { extrapolateRight: "clamp" });
  const sub = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={center}>
      <div
        style={{
          width: lineW,
          height: 2,
          marginBottom: 44,
          background: "linear-gradient(90deg, transparent, #6ef0c8, transparent)",
        }}
      />
      <div
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: 96,
          letterSpacing: "0.04em",
          color: "#f2f4f7",
          whiteSpace: "pre",
        }}
      >
        {out}
      </div>
      <div
        style={{
          marginTop: 30,
          opacity: sub,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 26,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "#6ef0c8",
        }}
      >
        Builder · Operator · Thinker
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scene 2 — the three modes ---------- */
const Modes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = ["BUILDER.", "OPERATOR.", "THINKER."];
  return (
    <AbsoluteFill style={{ ...center, alignItems: "flex-start", paddingLeft: 140 }}>
      {rows.map((r, i) => {
        const at = i * 26;
        const s = spring({ frame: frame - at, fps, config: { damping: 200 } });
        const y = interpolate(s, [0, 1], [60, 0]);
        const w = interpolate(spring({ frame: frame - at - 8, fps, config: { damping: 200 } }), [0, 1], [0, 100]);
        return (
          <div key={r} style={{ position: "relative", opacity: s }}>
            <div
              style={{
                fontSize: 150,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.04,
                color: i === 1 ? "#aeb7c4" : "#f2f4f7",
                transform: `translateY(${y}px)`,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {r}
            </div>
            <div
              style={{
                height: 4,
                width: `${w}%`,
                background: "#6ef0c8",
                marginTop: -6,
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- Scene 3 — fact cuts ---------- */
const facts = [
  ["01", "$2.9B sovereign bailout", "Modeled the fiscal scenarios for live IMF talks."],
  ["02", "Founder — Krux AI", "AI company brain for pharma contract manufacturing."],
  ["03", "Production AI, in Rust", "Local-first, hybrid retrieval, byte-accurate."],
  ["04", "UN General Assembly, at 21", "Delegate with the Sri Lankan Mission."],
];
const FactCut: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 8, 36, 44], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame, [0, 12], [40, 0], { extrapolateRight: "clamp" });
  const [idx, head, sub] = facts[i];
  return (
    <AbsoluteFill style={{ ...center, alignItems: "flex-start", paddingLeft: 140, opacity: op }}>
      <div style={{ transform: `translateX(${x}px)` }}>
        <div
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 26,
            color: "#6ef0c8",
            letterSpacing: "0.1em",
            marginBottom: 18,
          }}
        >
          {idx} / 04
        </div>
        <div
          style={{
            fontSize: 104,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#f2f4f7",
            maxWidth: 1400,
            lineHeight: 1.02,
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          {head}
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 34,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.7)",
            fontFamily: "var(--font-serif), Georgia, serif",
          }}
        >
          {sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Scene 4 — close ---------- */
const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  const email = interpolate(frame, [24, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={center}>
      <div
        style={{
          fontSize: 128,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: "#f2f4f7",
          opacity: s,
          transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        Let’s build something.
      </div>
      <div
        style={{
          marginTop: 28,
          opacity: email,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 34,
          color: "#6ef0c8",
        }}
      >
        {profile.email}
      </div>
    </AbsoluteFill>
  );
};

export const Showreel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#07080a", overflow: "hidden" }}>
      <Bg />
      <Sequence from={0} durationInFrames={95}>
        <SceneName />
      </Sequence>
      <Sequence from={95} durationInFrames={140}>
        <Modes />
      </Sequence>
      {facts.map((_, i) => (
        <Sequence key={i} from={235 + i * 44} durationInFrames={44}>
          <FactCut i={i} />
        </Sequence>
      ))}
      <Sequence from={411} durationInFrames={129}>
        <Close />
      </Sequence>
    </AbsoluteFill>
  );
};
