import { NextResponse } from "next/server";
import { z } from "zod";
import { isDbConfigured } from "@/lib/db";
import { search } from "@/lib/search";

export const runtime = "nodejs";

const QuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export async function GET(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Search isn't configured yet (DATABASE_URL missing). The hybrid search index lives in Postgres.",
      },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 },
    );
  }

  try {
    const out = await search(parsed.data.q, parsed.data.limit);
    return NextResponse.json(out, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[search] failed", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Search failed",
      },
      { status: 500 },
    );
  }
}
