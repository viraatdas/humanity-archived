import Link from "next/link";
import { listStories } from "@/lib/stories";
import { GENRES } from "@/lib/schema";
import type { Genre } from "@/lib/schema";
import { ArchiveBrowser } from "@/components/ArchiveBrowser";
import WorldMap from "@/components/WorldMap";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; region?: string }>;
}) {
  const { genre: genreParam, region: regionParam } = await searchParams;
  const activeGenre = (GENRES as readonly string[]).includes(genreParam ?? "")
    ? (genreParam as Genre)
    : null;
  const allStories = await listStories();

  return (
    <div className="mx-auto max-w-5xl">
      <section className="pb-10 sm:pb-12">
        <h1 className="break-words font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
          The stories of being human,
          <br className="hidden sm:inline" />
          {" "}gathered in one place.
        </h1>
        <p
          className="mt-6 max-w-xl text-base"
          style={{ color: "var(--color-ink-soft)" }}
        >
          From creation myths to a grandmother&rsquo;s tale, from epics
          carried across centuries to a story told once over a fire, this
          is an open archive of what we&rsquo;ve passed down.{" "}
          <Link href="/about">Read the note &rarr;</Link>
        </p>
      </section>

      {allStories.length > 0 && <WorldMap stories={allStories} />}

      <ArchiveBrowser
        stories={allStories}
        initialGenre={activeGenre}
        initialRegion={regionParam ?? null}
      />
    </div>
  );
}
