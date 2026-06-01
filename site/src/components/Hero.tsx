"use client";

import ShaderBackground from "./ShaderBackground";
import Scramble from "./Scramble";
import { profile } from "@/lib/data";

export default function Hero() {
  return (
    <section
      id="top"
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
      }}
    >
      <ShaderBackground />

      <div
        className="container-x"
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          paddingBottom: "clamp(56px, 10vh, 120px)",
        }}
      >
        {/* top meta row */}
        <div
          className="mono"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            fontSize: 11.5,
            letterSpacing: "0.14em",
            color: "var(--fg-faint)",
            textTransform: "uppercase",
            marginBottom: "clamp(28px, 6vh, 56px)",
          }}
        >
          <span>{profile.location}</span>
          <span>Builder × Operator × Thinker</span>
          <span>Est. UC Berkeley ’24</span>
        </div>

        <h1
          className="grad-text"
          style={{
            fontSize: "clamp(54px, 12vw, 168px)",
            lineHeight: 0.92,
            fontWeight: 600,
            letterSpacing: "-0.04em",
            margin: 0,
          }}
        >
          Bilal
          <br />
          Sabry
        </h1>

        <div
          style={{
            marginTop: "clamp(20px, 4vh, 36px)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: "clamp(14px, 4vw, 40px)",
            maxWidth: 980,
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: "clamp(15px, 2.4vw, 22px)",
              color: "var(--accent)",
              minWidth: 170,
            }}
          >
            <Scramble words={profile.roles} />
          </span>
          <p
            className="serif"
            style={{
              fontSize: "clamp(18px, 2.5vw, 27px)",
              lineHeight: 1.32,
              color: "var(--fg-dim)",
              margin: 0,
              flex: 1,
              minWidth: 280,
            }}
          >
            {profile.thesis}
          </p>
        </div>
      </div>

      {/* scroll cue */}
      <div
        className="mono"
        style={{
          position: "absolute",
          bottom: 22,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          fontSize: 10.5,
          letterSpacing: "0.3em",
          color: "var(--fg-faint)",
          textTransform: "uppercase",
        }}
      >
        Scroll ↓
      </div>
    </section>
  );
}
