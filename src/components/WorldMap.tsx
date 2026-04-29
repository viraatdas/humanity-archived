"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
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

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 1.6;

export default function WorldMap({ stories }: { stories: Story[] }) {
  const router = useRouter();
  const [year, setYear] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  const placeable = useMemo(
    () => stories.filter(isPlaceable),
    [stories],
  );

  function focusFor(s: Placeable) {
    const d = Math.abs(s.approxYear - year);
    // Scale markers inversely with zoom so they don't grow huge when zoomed in
    const scale = 1 / Math.sqrt(zoom);
    if (d <= FOCUS_WINDOW) return { opacity: 1, r: 6 * scale };
    const t = Math.min(1, (d - FOCUS_WINDOW) / (FOCUS_WINDOW * 4));
    return { opacity: Math.max(0.2, 1 - t), r: 4 * scale };
  }

  function clampZoom(z: number) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  }

  function handleMoveEnd(position: { coordinates: [number, number]; zoom: number }) {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  }

  function zoomIn() {
    setZoom((z) => clampZoom(z * ZOOM_STEP));
  }
  function zoomOut() {
    setZoom((z) => clampZoom(z / ZOOM_STEP));
  }
  function resetZoom() {
    setZoom(1);
    setCenter([0, 20]);
  }

  return (
    <section className="worldmap" aria-label="World map of stories">
      <div className="worldmap-header">
        <span>Across regions and time</span>
        <span>
          {placeable.length} stor{placeable.length === 1 ? "y" : "ies"} on the map
        </span>
      </div>

      <div className="worldmap-frame" style={{ position: "relative" }}>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 165 }}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onMoveEnd={handleMoveEnd}
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
                        strokeWidth: 1.5 / Math.sqrt(zoom),
                        opacity: f.opacity,
                        transition: "opacity 220ms ease, r 220ms ease",
                      }}
                    />
                    <title>{`${s.title} — ${s.region.name} (${yearLabel(s.approxYear)})`}</title>
                  </a>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM - 0.001}
            aria-label="Zoom in"
            style={zoomBtnStyle}
          >
            +
          </button>
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM + 0.001}
            aria-label="Zoom out"
            style={zoomBtnStyle}
          >
            −
          </button>
          <button
            type="button"
            onClick={resetZoom}
            disabled={zoom === 1 && center[0] === 0 && center[1] === 20}
            aria-label="Reset zoom"
            style={{ ...zoomBtnStyle, fontSize: 11 }}
          >
            ⟲
          </button>
        </div>
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

const zoomBtnStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "9999px",
  border: "1px solid var(--color-rule)",
  background: "var(--color-paper)",
  color: "var(--color-ink)",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "inherit",
  padding: 0,
};
