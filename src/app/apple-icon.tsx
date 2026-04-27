import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="36" fill="#1a1714"/>
  <circle cx="90" cy="58" r="13" fill="#fbf8f3"/>
  <circle cx="52" cy="124" r="13" fill="#fbf8f3"/>
  <circle cx="128" cy="124" r="13" fill="#fbf8f3"/>
</svg>`;

export default function AppleIcon() {
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgMarkup).toString("base64")}`;
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={dataUrl} width={180} height={180} alt="" />
    ),
    { ...size },
  );
}
