"use client";

import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { GENRES, type Genre, type Story } from "@/lib/schema";
import { genreDotClass, GENRE_LABELS } from "@/lib/genre-colors";

type RegionBrowseOption = {
  label: string;
  value: string;
  count: number;
};

type ArchiveBrowserProps = {
  stories: Story[];
  initialGenre: Genre | null;
  initialRegion: string | null;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

function normalizeRegionValue(value: string) {
  return value.trim().toLowerCase();
}

function storyMatchesRegion(story: Story, regionValue: string) {
  return (
    normalizeRegionValue(story.region.name) === normalizeRegionValue(regionValue)
  );
}

function getRegionBrowseOptions(
  stories: Story[],
  activeGenre: Genre | null,
): RegionBrowseOption[] {
  const options = new Map<string, RegionBrowseOption>();

  for (const story of stories) {
    if (activeGenre && story.genre !== activeGenre) continue;

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

function archiveHref({
  genre,
  region,
}: {
  genre?: Genre | null;
  region?: string | null;
}) {
  const params = new URLSearchParams();
  if (genre) params.set("genre", genre);
  if (region) params.set("region", region);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function updateArchiveUrl({
  genre,
  region,
}: {
  genre: Genre | null;
  region: string | null;
}) {
  window.history.pushState(null, "", archiveHref({ genre, region }));
}

function runFilterUpdate(update: () => void) {
  const startViewTransition =
    (document as ViewTransitionDocument).startViewTransition;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!startViewTransition || reduceMotion) {
    update();
    return;
  }

  startViewTransition(() => {
    flushSync(update);
  });
}

export function ArchiveBrowser({
  stories,
  initialGenre,
  initialRegion,
}: ArchiveBrowserProps) {
  const allRegionOptions = useMemo(
    () => getRegionBrowseOptions(stories, null),
    [stories],
  );
  const initialRegionOption = initialRegion
    ? allRegionOptions.find(
        (region) =>
          normalizeRegionValue(region.value) ===
          normalizeRegionValue(initialRegion),
      )
    : null;

  const [activeGenre, setActiveGenre] = useState<Genre | null>(initialGenre);
  const [activeRegionValue, setActiveRegionValue] = useState<string | null>(
    initialRegionOption?.value ?? null,
  );

  const regionOptions = useMemo(
    () => getRegionBrowseOptions(stories, activeGenre),
    [activeGenre, stories],
  );

  const storiesInActiveRegion = useMemo(
    () =>
      activeRegionValue
        ? stories.filter((story) => storyMatchesRegion(story, activeRegionValue))
        : stories,
    [activeRegionValue, stories],
  );

  const filteredStories = useMemo(
    () =>
      stories.filter((story) => {
        if (activeGenre && story.genre !== activeGenre) return false;
        if (activeRegionValue && !storyMatchesRegion(story, activeRegionValue)) {
          return false;
        }
        return true;
      }),
    [activeGenre, activeRegionValue, stories],
  );

  const activeRegionOption = allRegionOptions.find(
    (region) => region.value === activeRegionValue,
  );
  const activeFilterLabel = [
    activeGenre ? GENRE_LABELS[activeGenre] : null,
    activeRegionOption?.label ?? null,
  ].filter(Boolean).join(" from ");

  function setFilters(genre: Genre | null, region: string | null) {
    runFilterUpdate(() => {
      setActiveGenre(genre);
      setActiveRegionValue(region);
      updateArchiveUrl({ genre, region });
    });
  }

  return (
    <>
      <section className="border-t pt-8" style={{ borderColor: "var(--color-rule)" }}>
        <h2 className="font-serif text-xl">Browse by genre</h2>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          {GENRES.map((g) => {
            const isActive = activeGenre === g;
            const count = storiesInActiveRegion.filter(
              (story) => story.genre === g,
            ).length;
            if (count === 0 && !isActive) return null;

            const nextGenre = isActive ? null : g;
            return (
              <li key={g}>
                <a
                  href={archiveHref({ genre: nextGenre, region: activeRegionValue })}
                  onClick={(event) => {
                    event.preventDefault();
                    setFilters(nextGenre, activeRegionValue);
                  }}
                  className="archive-filter-chip inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
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
                  <span>{GENRE_LABELS[g]}</span>
                  <span
                    className="text-xs"
                    style={{ color: isActive ? "inherit" : "var(--color-ink-soft)" }}
                  >
                    {count}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8 border-t pt-8" style={{ borderColor: "var(--color-rule)" }}>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-serif text-xl">Browse by region</h2>
          {activeRegionOption && (
            <a
              href={archiveHref({ genre: activeGenre, region: null })}
              onClick={(event) => {
                event.preventDefault();
                setFilters(activeGenre, null);
              }}
              className="text-sm"
            >
              Clear region
            </a>
          )}
        </div>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          {regionOptions.map((region) => {
            const isActive = activeRegionValue === region.value;
            const nextRegion = isActive ? null : region.value;
            return (
              <li key={region.value}>
                <a
                  href={archiveHref({ genre: activeGenre, region: nextRegion })}
                  onClick={(event) => {
                    event.preventDefault();
                    setFilters(activeGenre, nextRegion);
                  }}
                  className="archive-filter-chip inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
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
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="archive-results mt-12 border-t pt-8" style={{ borderColor: "var(--color-rule)" }}>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-serif text-xl">
            {activeFilterLabel
              ? `Recently archived in ${activeFilterLabel}`
              : "Recently archived"}
          </h2>
          <Link href="/submit" className="text-sm">Contribute a story &rarr;</Link>
        </div>

        {filteredStories.length === 0 ? (
          <p
            className="mt-8 text-base"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {activeFilterLabel ? (
              <>
                No stories in {activeFilterLabel} yet.{" "}
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    setFilters(null, null);
                  }}
                >
                  See all stories
                </a>.
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
            {filteredStories.map((s, index) => (
              <li
                key={s.slug}
                className="archive-story-item py-5"
                style={{ animationDelay: `${Math.min(index, 8) * 18}ms` }}
              >
                <Link
                  href={`/stories/${s.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <article className="flex flex-col gap-1">
                    <h3 className="flex items-start gap-2.5 font-serif text-lg">
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
    </>
  );
}

function GenreDot({ genre }: { genre: Genre }) {
  return <span aria-hidden className={genreDotClass(genre)} />;
}
