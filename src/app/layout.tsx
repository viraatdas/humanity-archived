import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Humanity Archived",
    template: "%s · Humanity Archived",
  },
  description:
    "A living archive of stories from across time and the world — mythology, folklore, oral history, and the small tales that shape us.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Inter:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <SiteHeader />
        <main className="mx-auto px-6 pb-24">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-5xl items-baseline justify-between px-6 pt-8 pb-12">
      <Link
        href="/"
        className="font-serif text-lg tracking-tight no-underline"
        style={{ textDecoration: "none" }}
      >
        Humanity Archived
      </Link>
      <nav className="flex gap-6 text-sm" style={{ color: "var(--color-ink-soft)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>Archive</Link>
        <Link href="/submit" style={{ textDecoration: "none" }}>Contribute</Link>
        <Link href="/about" style={{ textDecoration: "none" }}>About</Link>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer
      className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-sm"
      style={{ color: "var(--color-ink-soft)", borderTop: "1px solid var(--color-rule)" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <span>Humanity Archived</span>
        <span>Stories shared under CC BY-SA 4.0.</span>
      </div>
    </footer>
  );
}
