import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1714",
          color: "#fbf8f3",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 130,
          fontWeight: 600,
          fontFamily: "serif",
          letterSpacing: -4,
          borderRadius: 36,
        }}
      >
        h
      </div>
    ),
    { ...size },
  );
}
