import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="180" height="180">
  <rect width="32" height="32" rx="6" fill="#1a1714"/>
  <path d="M16 4 L20 11 L20 24 L22 24 L22 27 L10 27 L10 24 L12 24 L12 11 Z" fill="#fbf8f3"/>
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
