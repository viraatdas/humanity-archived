import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = req.headers.get("x-test-token");
  const expected = process.env.SEND_TEST_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "SEND_TEST_TOKEN env var is not set." },
      { status: 503 },
    );
  }
  if (token !== expected) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY env var is not set." },
      { status: 503 },
    );
  }

  let body: { to?: string; from?: string; subject?: string; text?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* body optional */
  }

  const to =
    body.to ?? process.env.NOTIFY_EMAIL ?? "viraat.laldas@gmail.com";
  const from = body.from ?? process.env.RESEND_FROM ?? "Humanity Archived <onboarding@resend.dev>";
  const subject = body.subject ?? "Humanity Archived: test email";
  const text =
    body.text ??
    [
      "Hello from Humanity Archived.",
      "",
      "This is a test email confirming that Resend is wired up correctly for the project.",
      "",
      "If you're reading this, the site at https://humanityarchived.com can send transactional mail.",
    ].join("\n");

  const resend = new Resend(apiKey);
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message ?? String(error) },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, id: data?.id, to, from });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
