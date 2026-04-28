import type { Story } from "./schema";

export type RegionBucket = { id: string; label: string };

export const REGION_BUCKETS: RegionBucket[] = [
  { id: "africa", label: "Africa" },
  { id: "europe", label: "Europe" },
  { id: "wasia", label: "W. Asia & Med." },
  { id: "sasia", label: "South Asia" },
  { id: "easia", label: "East & SE Asia" },
  { id: "oceania", label: "Oceania" },
  { id: "americas", label: "Americas" },
];

const COUNTRY_TO_BUCKET: Record<string, string> = {
  EG: "africa", ET: "africa", GH: "africa", KE: "africa", ML: "africa",
  MA: "africa", NG: "africa", SN: "africa", ZA: "africa", TZ: "africa",
  UG: "africa", ZW: "africa",

  AT: "europe", FR: "europe", DE: "europe", GR: "europe", IE: "europe",
  IT: "europe", NL: "europe", NO: "europe", PL: "europe", PT: "europe",
  RU: "europe", ES: "europe", SE: "europe", CH: "europe", UA: "europe",
  GB: "europe",

  IR: "wasia", IQ: "wasia", IL: "wasia", JO: "wasia", SA: "wasia",
  SY: "wasia", TR: "wasia", YE: "wasia",

  AF: "sasia", BD: "sasia", IN: "sasia", NP: "sasia", PK: "sasia",
  LK: "sasia",

  KH: "easia", CN: "easia", ID: "easia", JP: "easia", KR: "easia",
  MN: "easia", PH: "easia", TH: "easia", VN: "easia",

  AU: "oceania", NZ: "oceania",

  AR: "americas", BR: "americas", CA: "americas", CO: "americas",
  MX: "americas", PE: "americas", US: "americas",
};

const NAME_HINTS: Array<[RegExp, string]> = [
  [/mesopotam|babyl|akkad|sumer|assyr|urartu/i, "wasia"],
  [/persia|arab|levant|canaan|phoenic|hebrew|anatolia/i, "wasia"],
  [/andes|inca|maya|aztec|olmec|amazon|patagon|chibcha|moche/i, "americas"],
  [/yoruba|igbo|hausa|zulu|xhosa|bantu|akan|ashanti|nubia|kush|sahel/i, "africa"],
  [/gaul|celt|nordic|norse|viking|iceland|baltic|slav/i, "europe"],
  [/tibet|himalaya|gangetic|dravid|deccan|punjab|bengal/i, "sasia"],
  [/khmer|java|sumatra|borneo|tagal|mekong|annam/i, "easia"],
  [/maori|polyne|melanesi|micron|aborig|hawai|samoa|tonga|fiji/i, "oceania"],
];

export function bucketStoryRegion(story: Story): string | null {
  const cc = story.region.countryCode;
  if (cc && COUNTRY_TO_BUCKET[cc]) return COUNTRY_TO_BUCKET[cc];
  const name = story.region.name ?? "";
  for (const [re, bucket] of NAME_HINTS) {
    if (re.test(name)) return bucket;
  }
  return null;
}

export type EraBand = {
  id: string;
  label: string;
  start: number;
  end: number;
};

export const ERA_BANDS: EraBand[] = [
  { id: "prehistory", label: "Pre-3000 BCE", start: -200000, end: -3000 },
  { id: "ancient", label: "3000 BCE to 500 CE", start: -3000, end: 500 },
  { id: "medieval", label: "500 to 1500", start: 500, end: 1500 },
  { id: "modern", label: "1500 to 1900", start: 1500, end: 1900 },
  { id: "contemporary", label: "1900 to now", start: 1900, end: 2100 },
];

export function bucketStoryEra(story: Story): EraBand | null {
  const y = story.approxYear;
  if (y === null || y === undefined) return null;
  for (const era of ERA_BANDS) {
    if (y >= era.start && y < era.end) return era;
  }
  if (y >= ERA_BANDS[ERA_BANDS.length - 1].end) {
    return ERA_BANDS[ERA_BANDS.length - 1];
  }
  if (y < ERA_BANDS[0].start) return ERA_BANDS[0];
  return null;
}

export type ConstellationPosition = { x: number; y: number };

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function computeConstellationPosition(
  story: Story,
): ConstellationPosition | null {
  const bucket = bucketStoryRegion(story);
  if (!bucket) return null;
  const era = bucketStoryEra(story);
  if (!era) return null;

  const regionIndex = REGION_BUCKETS.findIndex((r) => r.id === bucket);
  const eraIndex = ERA_BANDS.findIndex((e) => e.id === era.id);
  if (regionIndex < 0 || eraIndex < 0) return null;

  const eraWidth = 100 / ERA_BANDS.length;
  const progress = Math.max(
    0,
    Math.min(1, (story.approxYear! - era.start) / (era.end - era.start)),
  );
  const x = eraIndex * eraWidth + (0.08 + 0.84 * progress) * eraWidth;

  const rowHeight = 100 / REGION_BUCKETS.length;
  const jitter = (hashString(story.slug) % 100) / 100;
  const y = regionIndex * rowHeight + (0.25 + 0.5 * jitter) * rowHeight;

  return { x, y };
}
