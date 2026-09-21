"use client";

import { profile } from "@/lib/data";

export default function Intro() {
  return (
    <header id="top" style={{ padding: "clamp(40px, 10vh, 112px) 0 clamp(40px, 7vh, 72px)" }}>
      <div className="wrap">
        <figure
          style={{
            margin: "0 0 28px",
            width: 84,
            height: 84,
            borderRadius: 999,
            overflow: "hidden",
            border: "1px solid var(--line)",
            background: "var(--bg-2)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/portrait.jpg"
            alt={profile.name}
            width={84}
            height={84}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
          />
        </figure>

        <h1
          className="serif"
          style={{
            margin: 0,
            fontStyle: "normal",
            fontSize: "clamp(44px, 7vw, 76px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          {profile.name}
        </h1>

        <p
          style={{
            margin: "20px 0 0",
            fontSize: "clamp(18px, 2vw, 22px)",
            lineHeight: 1.45,
            color: "var(--fg-2)",
            maxWidth: 520,
            textWrap: "balance",
          }}
        >
          {profile.intro.lead}{" "}
          <span className="serif" style={{ color: "var(--fg)" }}>
            {profile.intro.italic}
          </span>
        </p>
      </div>
    </header>
  );
}
