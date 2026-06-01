import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Monogram favicon — "BS" with the accent dot, on ink.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07080a",
          color: "#f2f4f7",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "-2px",
          fontFamily: "sans-serif",
        }}
      >
        BS
        <span style={{ color: "#6ef0c8" }}>.</span>
      </div>
    ),
    { ...size }
  );
}
