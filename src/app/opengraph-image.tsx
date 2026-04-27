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
          <ObeliskMark size={56} />
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

function ObeliskMark({ size }: { size: number }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
    <rect width="32" height="32" rx="6" fill="#1a1714"/>
    <path d="M16 4 L20 11 L20 24 L22 24 L22 27 L10 27 L10 24 L12 24 L12 11 Z" fill="#fbf8f3"/>
  </svg>`;
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={dataUrl}
      width={size}
      height={size}
      alt=""
      style={{ display: "block" }}
    />
  );
}
