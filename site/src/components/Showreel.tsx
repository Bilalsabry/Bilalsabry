"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { PlayerRef } from "@remotion/player";
import { Showreel as ShowreelComp, REEL_FPS, REEL_DURATION } from "@/remotion/Showreel";

const Player = dynamic(() => import("@remotion/player").then((m) => m.Player), {
  ssr: false,
});

export default function Showreel() {
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const ref = useRef<PlayerRef>(null);

  useEffect(() => setMounted(true), []);

  const play = useCallback(() => {
    const p = ref.current;
    if (!p) return;
    p.seekTo(0);
    p.play();
    setStarted(true);
  }, []);

  // let the ⌘K command palette start the reel
  useEffect(() => {
    const handler = () => play();
    window.addEventListener("bs-play-reel", handler);
    return () => window.removeEventListener("bs-play-reel", handler);
  }, [play]);

  return (
    <section id="reel" style={{ padding: "clamp(40px, 8vh, 90px) 0 clamp(60px, 10vh, 120px)" }}>
      <div className="container-x">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span className="eyebrow">▶&nbsp;&nbsp;The 18-second version</span>
          <span className="mono" style={{ fontSize: 12.5, color: "var(--fg-dim)" }}>
            Made with Remotion
          </span>
        </div>

        <div
          style={{
            position: "relative",
            aspectRatio: "16 / 9",
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid var(--line-strong)",
            boxShadow: "0 50px 120px -50px rgba(110,240,200,0.35)",
            background:
              "radial-gradient(120% 95% at 60% 4%, #16233f 0%, #0a0e16 60%, #07080a 100%)",
          }}
        >
          {mounted && (
            <Player
              ref={ref}
              component={ShowreelComp}
              durationInFrames={REEL_DURATION}
              fps={REEL_FPS}
              compositionWidth={1920}
              compositionHeight={1080}
              controls
              clickToPlay
              acknowledgeRemotionLicense
              style={{ width: "100%", height: "100%" }}
            />
          )}

          {/* ▶ poster overlay (hidden once started; native controls take over) */}
          {!started && (
            <button
              onClick={play}
              data-cursor="play"
              aria-label="Play showreel"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
                background:
                  "linear-gradient(180deg, rgba(7,8,10,0.25), rgba(7,8,10,0.55))",
                border: "none",
                color: "var(--fg)",
              }}
            >
              <span
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background: "var(--accent)",
                  color: "#07080a",
                  fontSize: 30,
                  paddingLeft: 6,
                  boxShadow: "0 0 50px rgba(110,240,200,0.6)",
                }}
              >
                ▶
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 13,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                }}
              >
                Play the showreel
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
