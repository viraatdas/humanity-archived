import "server-only";
import { Resend } from "resend";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL);
}

export async function notifyAdmin(opts: {
  subject: string;
  text: string;
}): Promise<void> {
  if (!isEmailConfigured()) return;
  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({
    from: "Humanity Archived <noreply@humanityarchived.com>",
    to: process.env.NOTIFY_EMAIL!,
    subject: opts.subject,
    text: opts.text,
  });
}
