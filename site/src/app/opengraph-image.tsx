import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bilal Sabry — I build companies, and the software that runs them.";

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
          background: "#faf8f3",
          backgroundImage:
            "radial-gradient(55% 70% at 88% 0%, rgba(12,107,82,0.16) 0%, transparent 60%)",
          color: "#121212",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#8a8883",
          }}
        >
          <span style={{ color: "#121212" }}>Bilal Sabry</span>
          <span>Princeton, NJ</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1.02 }}>
            I build companies,
          </div>
          <div
            style={{
              fontSize: 92,
              fontStyle: "italic",
              fontFamily: "serif",
              letterSpacing: -3,
              lineHeight: 1.02,
              color: "#0c6b52",
            }}
          >
            and the software that runs them.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#4d4c48" }}>
          Founder, Krux AI · advised Sri Lanka’s Ministry of Finance through a sovereign default · UC Berkeley
        </div>
      </div>
    ),
    { ...size }
  );
}
