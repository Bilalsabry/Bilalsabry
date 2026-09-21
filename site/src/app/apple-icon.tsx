import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "#121212",
          color: "#faf8f3",
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: "-4px",
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
