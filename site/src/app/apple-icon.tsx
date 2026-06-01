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
            "radial-gradient(120% 120% at 70% 10%, #16233f 0%, #07080a 70%)",
          color: "#f2f4f7",
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
