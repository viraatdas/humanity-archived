import Link from "next/link";
import { listStories } from "@/lib/stories";
import { GENRES } from "@/lib/schema";
import { genreDotClass, GENRE_LABELS } from "@/lib/genre-colors";
import type { Genre } from "@/lib/schema";
import WorldMap from "@/components/WorldMap";

export default async function Home() {
  const stories = await listStories();

  return (
    <div className="mx-auto max-w-5xl">
      <section className="pb-10 sm:pb-12">
        <h1 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
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

      {stories.length > 0 && <WorldMap stories={stories} />}

      <section className="border-t pt-8" style={{ borderColor: "var(--color-rule)" }}>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-serif text-xl">Recently archived</h2>
          <Link href="/submit" className="text-sm">Contribute a story &rarr;</Link>
        </div>

        {stories.length === 0 ? (
          <p
            className="mt-8 text-base"
            style={{ color: "var(--color-ink-soft)" }}
          >
            The archive is just opening. Be the first to{" "}
            <Link href="/submit">contribute a story</Link>.
          </p>
        ) : (
          <ul className="mt-8 divide-y" style={{ borderColor: "var(--color-rule)" }}>
            {stories.map((s) => (
              <li key={s.slug} className="py-5">
                <Link
                  href={`/stories/${s.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <article className="flex flex-col gap-1">
                    <h3 className="font-serif text-lg flex items-center gap-2.5">
                      <GenreDot genre={s.genre} />
                      <span>{s.title}</span>
                    </h3>
                    <div
                      className="flex flex-wrap gap-x-3 gap-y-1 text-xs pl-[18px]"
                      style={{ color: "var(--color-ink-soft)" }}
                    >
                      <span>{s.timePeriod}</span>
                      <span>·</span>
                      <span>{s.region.name}</span>
                      <span>·</span>
                      <span>{GENRE_LABELS[s.genre]}</span>
                      {s.author && (
                        <>
                          <span>·</span>
                          <span>{s.author}</span>
                        </>
                      )}
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-xl">Browse by genre</h2>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          {GENRES.map((g) => (
            <li key={g}>
              <Link
                href={`/?genre=${g}`}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                style={{
                  borderColor: "var(--color-rule)",
                  textDecoration: "none",
                  color: "var(--color-ink-soft)",
                }}
              >
                <GenreDot genre={g} />
                {GENRE_LABELS[g]}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function GenreDot({ genre }: { genre: Genre }) {
  return <span aria-hidden className={genreDotClass(genre)} />;
}
