import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

function isS3Configured(): boolean {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION &&
      process.env.S3_MEDIA_BUCKET,
  );
}

function publicUrlFor(key: string): string {
  const cdn = process.env.CLOUDFRONT_DOMAIN;
  if (cdn) return `https://${cdn}/${key}`;
  const region = process.env.AWS_REGION!;
  const bucket = process.env.S3_MEDIA_BUCKET!;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function buildKey(filename: string, contentType: string): string {
  const ext =
    contentType === "image/jpeg"
      ? "jpg"
      : contentType === "image/svg+xml"
        ? "svg"
        : contentType.split("/")[1] ?? "bin";
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const baseName =
    (filename || "image")
      .toLowerCase()
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";
  return `submissions/${stamp}-${rand}-${baseName}.${ext}`;
}

/**
 * GET /api/upload?filename=...&contentType=...&size=...
 *   Returns a presigned PUT URL the browser uses to upload directly to S3.
 *   { ok: true, uploadUrl, publicUrl, key }
 */
export async function GET(req: Request) {
  if (!isS3Configured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Image uploads aren't configured yet (AWS S3 credentials missing).",
      },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const filename = url.searchParams.get("filename") ?? "image";
  const contentType = url.searchParams.get("contentType") ?? "";
  const sizeStr = url.searchParams.get("size") ?? "0";
  const size = Number.parseInt(sizeStr, 10);

  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json(
      { ok: false, error: `Unsupported image type: ${contentType || "unknown"}.` },
      { status: 400 },
    );
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: `Image size must be between 1 byte and ${Math.round(MAX_BYTES / (1024 * 1024))} MB.`,
      },
      { status: 400 },
    );
  }

  const client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const key = buildKey(filename, contentType);
  const command = new PutObjectCommand({
    Bucket: process.env.S3_MEDIA_BUCKET!,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
    CacheControl: "public, max-age=31536000, immutable",
  });

  try {
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
    return NextResponse.json({
      ok: true,
      uploadUrl,
      publicUrl: publicUrlFor(key),
      key,
      contentType,
    });
  } catch (err) {
    console.error("presign failed", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Could not prepare upload.",
      },
      { status: 500 },
    );
  }
}
