import Link from "next/link";
import {
  REGION_BUCKETS,
  ERA_BANDS,
  computeConstellationPosition,
} from "@/lib/timeline";
import { genreDotClass, GENRE_LABELS } from "@/lib/genre-colors";
import type { Story } from "@/lib/schema";

type Placed = {
  story: Story;
  pos: { x: number; y: number };
};

export function Constellation({ stories }: { stories: Story[] }) {
  const placed: Placed[] = [];
  let unplaceable = 0;
  for (const s of stories) {
    const pos = computeConstellationPosition(s);
    if (pos) placed.push({ story: s, pos });
    else unplaceable += 1;
  }

  if (placed.length === 0) return null;

  return (
    <section
      className="constellation"
      aria-label="Stories across regions and time"
    >
      <div className="constellation-header">
        <span>Across regions and time</span>
        <span>
          {placed.length} stor{placed.length === 1 ? "y" : "ies"}
          {unplaceable > 0 && ` · ${unplaceable} undated`}
        </span>
      </div>

      <div className="constellation-frame">
        <div className="constellation-rows">
          {REGION_BUCKETS.map((r) => (
            <div key={r.id} className="constellation-row">
              <span>{r.label}</span>
            </div>
          ))}
        </div>

        <div className="constellation-canvas">
          {REGION_BUCKETS.slice(0, -1).map((r, i) => (
            <div
              key={r.id}
              className="constellation-row-rule"
              style={{ top: `${((i + 1) * 100) / REGION_BUCKETS.length}%` }}
            />
          ))}
          {ERA_BANDS.slice(0, -1).map((e, i) => (
            <div
              key={e.id}
              className="constellation-era-rule"
              style={{ left: `${((i + 1) * 100) / ERA_BANDS.length}%` }}
            />
          ))}

          {placed.map(({ story, pos }) => (
            <Link
              key={story.slug}
              href={`/stories/${story.slug}`}
              className={`constellation-dot ${genreDotClass(story.genre)}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              aria-label={`${story.title}, ${story.region.name}, ${story.timePeriod}`}
            >
              <span className="constellation-tooltip">
                <strong>{story.title}</strong>
                <span>
                  {story.region.name} &middot; {story.timePeriod} &middot;{" "}
                  {GENRE_LABELS[story.genre]}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="constellation-eras">
        <div />
        <div className="constellation-eras-bands">
          {ERA_BANDS.map((era) => (
            <div key={era.id} className="constellation-era-label">
              {era.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
