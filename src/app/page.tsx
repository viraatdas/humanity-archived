import Link from "next/link";
import { listStories } from "@/lib/stories";
import { GENRES, type Genre } from "@/lib/schema";

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
                    <h3 className="font-serif text-lg">{s.title}</h3>
                    <div
                      className="flex flex-wrap gap-x-3 gap-y-1 text-xs"
                      style={{ color: "var(--color-ink-soft)" }}
                    >
                      <span>{s.timePeriod}</span>
                      <span>·</span>
                      <span>{s.region.name}</span>
                      <span>·</span>
                      <span className="capitalize">{labelFor(s.genre)}</span>
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
                className="rounded-full border px-3 py-1"
                style={{
                  borderColor: "var(--color-rule)",
                  textDecoration: "none",
                  color: "var(--color-ink-soft)",
                }}
              >
                {labelFor(g)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function labelFor(g: Genre): string {
  const map: Record<Genre, string> = {
    mythology: "Mythology",
    folklore: "Folklore",
    "oral-history": "Oral history",
    religious: "Religious narrative",
    historical: "Historical account",
    personal: "Personal & family history",
    epic: "Epic",
  };
  return map[g];
}
