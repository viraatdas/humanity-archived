"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import type { Story } from "@/lib/schema";
import { Timeline } from "./Timeline";

const TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const GENRE_COLOR_VAR: Record<string, string> = {
  mythology: "var(--genre-mythology)",
  folklore: "var(--genre-folklore)",
  "oral-history": "var(--genre-oral-history)",
  religious: "var(--genre-religious)",
  historical: "var(--genre-historical)",
  personal: "var(--genre-personal)",
  epic: "var(--genre-epic)",
};

const FOCUS_WINDOW = 200; // ±200 years considered "in focus"

function yearLabel(y: number): string {
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`;
  if (y === 0) return "1 BCE / 1 CE";
  return `${y.toLocaleString()} CE`;
}

type Placeable = Story & {
  region: Story["region"] & { lat: number; lng: number };
  approxYear: number;
};

function isPlaceable(s: Story): s is Placeable {
  return (
    typeof s.approxYear === "number" &&
    typeof s.region.lat === "number" &&
    typeof s.region.lng === "number"
  );
}

export default function WorldMap({ stories }: { stories: Story[] }) {
  const router = useRouter();
  const [year, setYear] = useState(0);

  const placeable = useMemo(
    () => stories.filter(isPlaceable),
    [stories],
  );

  function focusFor(s: Placeable) {
    const d = Math.abs(s.approxYear - year);
    if (d <= FOCUS_WINDOW) return { opacity: 1, r: 6 };
    const t = Math.min(1, (d - FOCUS_WINDOW) / (FOCUS_WINDOW * 4));
    return { opacity: Math.max(0.2, 1 - t), r: 4 };
  }

  return (
    <section className="worldmap" aria-label="World map of stories">
      <div className="worldmap-header">
        <span>Across regions and time</span>
        <span>
          {placeable.length} stor{placeable.length === 1 ? "y" : "ies"} on the map
        </span>
      </div>

      <div className="worldmap-frame">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 165 }}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <Geographies geography={TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "var(--color-rule)",
                      stroke: "var(--color-paper)",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "var(--color-rule)",
                      stroke: "var(--color-paper)",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    pressed: {
                      fill: "var(--color-rule)",
                      stroke: "var(--color-paper)",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {placeable.map((s) => {
            const f = focusFor(s);
            const href = `/stories/${s.slug}`;
            return (
              <Marker key={s.slug} coordinates={[s.region.lng, s.region.lat]}>
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(href);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    r={f.r}
                    style={{
                      fill: GENRE_COLOR_VAR[s.genre],
                      stroke: "var(--color-paper)",
                      strokeWidth: 1.5,
                      opacity: f.opacity,
                      transition: "opacity 220ms ease, r 220ms ease",
                    }}
                  />
                  <title>{`${s.title} — ${s.region.name} (${yearLabel(s.approxYear)})`}</title>
                </a>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      <Timeline
        minYear={-3000}
        maxYear={2025}
        initialYear={0}
        onYearChange={setYear}
      />
    </section>
  );
}
