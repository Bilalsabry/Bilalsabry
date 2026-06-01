"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HeroVideo, HERO_FPS, HERO_DURATION } from "@/remotion/HeroVideo";

// @remotion/player touches the DOM — load it client-only.
const Player = dynamic(
  () => import("@remotion/player").then((m) => m.Player),
  { ssr: false }
);

/**
 * Full-bleed, object-cover Remotion hero. The wrapper is sized to a 16:9 box
 * that always covers the viewport (overflow clipped), so the 1920×1080
 * composition fills the screen on any aspect ratio. Falls back to a static
 * gradient while the player loads, and to a still first frame when the user
 * prefers reduced motion.
 */
export default function HeroVideoPlayer() {
  const [mounted, setMounted] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        // static fallback shown until the player mounts
        background:
          "radial-gradient(120% 90% at 70% 8%, #16233f 0%, #0a0e16 48%, #07080a 100%)",
      }}
    >
      {mounted && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "max(100vw, 177.78svh)",
            height: "max(56.25vw, 100svh)",
          }}
        >
          <Player
            component={HeroVideo}
            durationInFrames={HERO_DURATION}
            fps={HERO_FPS}
            compositionWidth={1920}
            compositionHeight={1080}
            controls={false}
            autoPlay={!reduce}
            loop
            clickToPlay={false}
            doubleClickToFullscreen={false}
            acknowledgeRemotionLicense
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}
    </div>
  );
}
