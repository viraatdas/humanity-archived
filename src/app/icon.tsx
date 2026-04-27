import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "serif",
          letterSpacing: -1,
          borderRadius: 6,
        }}
      >
        h
      </div>
    ),
    { ...size },
  );
}
