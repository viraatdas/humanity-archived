import { ImageResponse } from "next/og";
import { loadOgSerif } from "@/lib/og-font";

export const alt = "Humanity Archived. Stories are the currency of humans.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const { regular, semibold } = await loadOgSerif();

  return new ImageResponse(
    (
      <div
        style={{
          background: "#fbf8f3",
          color: "#1a1714",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 88,
          fontFamily: "CrimsonText",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 26,
            fontWeight: 500,
            color: "#534e48",
            letterSpacing: 6,
            textTransform: "uppercase",
            fontFamily: "CrimsonText",
          }}
        >
          <ConstellationMark size={56} />
          Humanity Archived
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 100,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: -2,
              maxWidth: 980,
              fontFamily: "CrimsonText",
            }}
          >
            Stories are the currency of humans.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            color: "#534e48",
            fontSize: 30,
            fontWeight: 400,
            fontFamily: "CrimsonText",
          }}
        >
          <span>An open archive of human story.</span>
          <span style={{ fontSize: 24, letterSpacing: 2 }}>
            humanityarchived.com
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#1a1714",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "CrimsonText", data: regular, style: "normal", weight: 400 },
        { name: "CrimsonText", data: semibold, style: "normal", weight: 600 },
      ],
    },
  );
}

function ConstellationMark({ size }: { size: number }) {
  const dot = size * 0.16;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: "#1a1714",
        position: "relative",
        display: "flex",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: size * 0.22,
          left: size * 0.5 - dot / 2,
          width: dot,
          height: dot,
          borderRadius: dot,
          background: "#fbf8f3",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: size * 0.6,
          left: size * 0.22,
          width: dot,
          height: dot,
          borderRadius: dot,
          background: "#fbf8f3",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: size * 0.6,
          left: size * 0.78 - dot,
          width: dot,
          height: dot,
          borderRadius: dot,
          background: "#fbf8f3",
        }}
      />
    </div>
  );
}
