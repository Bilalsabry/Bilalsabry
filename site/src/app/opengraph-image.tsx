import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bilal Sabry";

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
          padding: "80px 88px",
          background: "#faf8f3",
          color: "#121212",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 2, color: "#8a8883" }}>
          bilalsabry.com
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 120, fontFamily: "serif", letterSpacing: -3, lineHeight: 1 }}>
            Bilal Sabry
          </div>
          <div style={{ display: "flex", fontSize: 36, color: "#4d4c48" }}>
            I solve problems&nbsp;
            <span style={{ fontFamily: "serif", fontStyle: "italic", color: "#121212" }}>
              by building things.
            </span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#8a8883" }}>
          New York, NY
        </div>
      </div>
    ),
    { ...size }
  );
}
