import Link from "next/link";
import { listStories } from "@/lib/stories";
import { GENRES } from "@/lib/schema";
import { genreDotClass, GENRE_LABELS } from "@/lib/genre-colors";
import type { Genre, Story } from "@/lib/schema";
import WorldMap from "@/components/WorldMap";

type RegionBrowseOption = {
  label: string;
  value: string;
  count: number;
};

function normalizeRegionValue(value: string) {
  return value.trim().toLowerCase();
}

function storyMatchesRegion(story: Story, regionValue: string) {
  return (
    normalizeRegionValue(story.region.name) === normalizeRegionValue(regionValue)
  );
}

function getRegionBrowseOptions(stories: Story[]): RegionBrowseOption[] {
  const options = new Map<string, RegionBrowseOption>();

  for (const story of stories) {
    const value = story.region.name;
    const key = normalizeRegionValue(value);
    const existing = options.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      options.set(key, {
        label: story.region.name,
        value,
        count: 1,
      });
    }
  }

  return Array.from(options.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

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
  const regionOptions = getRegionBrowseOptions(allStories);
  const activeRegionOption = regionParam
    ? regionOptions.find((region) =>
        normalizeRegionValue(region.value) === normalizeRegionValue(regionParam),
      )
    : null;
  const activeRegionValue = activeRegionOption?.value ?? null;
  const stories = allStories.filter((story) => {
    if (activeGenre && story.genre !== activeGenre) return false;
    if (activeRegionValue && !storyMatchesRegion(story, activeRegionValue)) {
      return false;
    }
    return true;
  });

  function archiveHref({
    genre = activeGenre,
    region = activeRegionValue,
  }: {
    genre?: Genre | null;
    region?: string | null;
  } = {}) {
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    if (region) params.set("region", region);
    const query = params.toString();
    return query ? `/?${query}` : "/";
  }

  const activeFilterLabel = [
    activeGenre ? GENRE_LABELS[activeGenre] : null,
    activeRegionOption?.label ?? null,
  ].filter(Boolean).join(" from ");

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
        <h2 className="font-serif text-xl">Browse by genre</h2>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          {GENRES.map((g) => {
            const isActive = activeGenre === g;
            return (
              <li key={g}>
                <Link
                  href={archiveHref({ genre: isActive ? null : g })}
                  scroll={false}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: isActive
                      ? "var(--color-ink)"
                      : "var(--color-rule)",
                    backgroundColor: isActive
                      ? "var(--color-ink)"
                      : "transparent",
                    textDecoration: "none",
                    color: isActive
                      ? "var(--color-paper)"
                      : "var(--color-ink-soft)",
                  }}
                >
                  <GenreDot genre={g} />
                  {GENRE_LABELS[g]}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 border-t pt-8" style={{ borderColor: "var(--color-rule)" }}>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-serif text-xl">Browse by region</h2>
          {activeRegionOption && (
            <Link
              href={archiveHref({ region: null })}
              scroll={false}
              className="text-sm"
            >
              Clear region
            </Link>
          )}
        </div>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          {regionOptions.map((region) => {
            const isActive = activeRegionValue === region.value;
            return (
              <li key={region.value}>
                <Link
                  href={archiveHref({ region: isActive ? null : region.value })}
                  scroll={false}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: isActive
                      ? "var(--color-ink)"
                      : "var(--color-rule)",
                    backgroundColor: isActive
                      ? "var(--color-ink)"
                      : "transparent",
                    textDecoration: "none",
                    color: isActive
                      ? "var(--color-paper)"
                      : "var(--color-ink-soft)",
                  }}
                >
                  <span>{region.label}</span>
                  <span
                    className="text-xs"
                    style={{ color: isActive ? "inherit" : "var(--color-ink-soft)" }}
                  >
                    {region.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12 border-t pt-8" style={{ borderColor: "var(--color-rule)" }}>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-serif text-xl">
            {activeFilterLabel
              ? `Recently archived in ${activeFilterLabel}`
              : "Recently archived"}
          </h2>
          <Link href="/submit" className="text-sm">Contribute a story &rarr;</Link>
        </div>

        {stories.length === 0 ? (
          <p
            className="mt-8 text-base"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {activeFilterLabel ? (
              <>
                No stories in {activeFilterLabel} yet.{" "}
                <Link href="/" scroll={false}>See all stories</Link>.
              </>
            ) : (
              <>
                The archive is just opening. Be the first to{" "}
                <Link href="/submit">contribute a story</Link>.
              </>
            )}
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
    </div>
  );
}

function GenreDot({ genre }: { genre: Genre }) {
  return <span aria-hidden className={genreDotClass(genre)} />;
}
