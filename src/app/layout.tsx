import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://humanity-archived.vercel.app";
const description =
  "A living archive of stories from across time and the world: mythology, folklore, oral history, and the small tales that shape us.";

export const metadata: Metadata = {
  title: {
    default: "Humanity Archived",
    template: "%s · Humanity Archived",
  },
  description,
  metadataBase: new URL(siteUrl),
  applicationName: "Humanity Archived",
  keywords: [
    "stories",
    "archive",
    "mythology",
    "folklore",
    "oral history",
    "epic",
    "preservation",
  ],
  openGraph: {
    type: "website",
    siteName: "Humanity Archived",
    title: "Humanity Archived",
    description,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Humanity Archived",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#fbf8f3",
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
        <main className="mx-auto px-5 pb-20 sm:px-6 sm:pb-24">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-3 px-5 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-12">
      <Link
        href="/"
        className="font-serif text-base tracking-tight no-underline sm:text-lg"
        style={{ textDecoration: "none" }}
      >
        Humanity Archived
      </Link>
      <nav
        className="flex gap-4 text-sm sm:gap-6"
        style={{ color: "var(--color-ink-soft)" }}
      >
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
      className="mx-auto max-w-5xl px-5 pt-12 pb-10 text-sm sm:px-6 sm:pt-16 sm:pb-12"
      style={{ color: "var(--color-ink-soft)", borderTop: "1px solid var(--color-rule)" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <span>Humanity Archived</span>
        <a
          href="mailto:viraat@humanityarchived.com"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          viraat@humanityarchived.com
        </a>
        <span>Stories shared under CC BY-SA 4.0.</span>
      </div>
    </footer>
  );
}
