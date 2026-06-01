import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bilal Sabry — Builder, Operator, Thinker";

// Dynamic social card so the link looks designed when shared.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#07080a",
          backgroundImage:
            "radial-gradient(60% 80% at 78% 0%, rgba(110,240,200,0.22) 0%, transparent 55%), radial-gradient(60% 80% at 10% 100%, rgba(138,140,255,0.20) 0%, transparent 55%)",
          color: "#f2f4f7",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 4,
            color: "#6ef0c8",
            textTransform: "uppercase",
          }}
        >
          <span>Bilal Sabry</span>
          <span style={{ color: "#6b7480" }}>Princeton, NJ</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 132,
              fontWeight: 700,
              letterSpacing: -5,
              lineHeight: 1,
            }}
          >
            Builder.
          </div>
          <div
            style={{
              fontSize: 132,
              fontWeight: 700,
              letterSpacing: -5,
              lineHeight: 1,
              color: "#aeb7c4",
            }}
          >
            Operator. Thinker.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "#aab2bd" }}>
          Founder &amp; engineer building Krux AI · advised a government through a
          sovereign default · Berkeley ’24
        </div>
      </div>
    ),
    { ...size }
  );
}
