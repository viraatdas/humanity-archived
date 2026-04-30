import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStory, renderMarkdown } from "@/lib/stories";
import { genreDotClass, GENRE_LABELS } from "@/lib/genre-colors";
import { LANGUAGES } from "@/lib/languages";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return { title: "Not found" };
  return { title: story.title };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) notFound();

  const codes = Object.keys(story.bodies);
  const preRendered: Record<string, string> = {};
  await Promise.all(
    codes.map(async (code) => {
      preRendered[code] = await renderMarkdown(story.bodies[code]);
    }),
  );
  const languageNames: Record<string, string> = {};
  for (const code of codes) {
    if (code === "oral") {
      languageNames[code] = "As recorded";
    } else {
      const known = LANGUAGES.find((l) => l.code === code);
      languageNames[code] = known ? known.name : code.toUpperCase();
    }
  }

  return (
    <article className="mx-auto max-w-2xl pt-4">
      <Link
        href="/"
        className="text-xs"
        style={{ color: "var(--color-ink-soft)" }}
      >
        &larr; Back to archive
      </Link>

      <header className="pt-6 pb-8">
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest"
          style={{ color: "var(--color-ink-soft)" }}
        >
          <span aria-hidden className={genreDotClass(story.genre)} />
          <span>{story.timePeriod}</span>
          <span>·</span>
          <span>{story.region.name}</span>
          <span>·</span>
          <span>{GENRE_LABELS[story.genre]}</span>
        </div>
        <h1 className="mt-4 break-words font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
          {story.title}
        </h1>
        {story.author && story.authorVisible && (
          <p
            className="mt-4 text-sm"
            style={{ color: "var(--color-ink-soft)" }}
          >
            As told by {story.author}
          </p>
        )}
      </header>

      <LanguageSwitcher
        bodies={story.bodies}
        defaultLang="en"
        preRendered={preRendered}
        languageNames={languageNames}
      />

      <footer
        className="mt-16 border-t pt-6 text-xs"
        style={{
          borderColor: "var(--color-rule)",
          color: "var(--color-ink-soft)",
        }}
      >
        <p>
          Original language: {story.language.toUpperCase()}.
          Shared under {story.license}.
        </p>
      </footer>
    </article>
  );
}
