import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStory, renderMarkdown } from "@/lib/stories";

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

  const html = await renderMarkdown(story.body);

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
          className="flex flex-wrap gap-x-3 gap-y-1 text-xs uppercase tracking-widest"
          style={{ color: "var(--color-ink-soft)" }}
        >
          <span>{story.timePeriod}</span>
          <span>·</span>
          <span>{story.region.name}</span>
          <span>·</span>
          <span>{story.genre}</span>
        </div>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
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

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
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
