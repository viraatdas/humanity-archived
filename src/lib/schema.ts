import { z } from "zod";

export const GENRES = [
  "mythology",
  "folklore",
  "oral-history",
  "religious",
  "historical",
  "personal",
  "epic",
] as const;

export type Genre = (typeof GENRES)[number];

export const FORMS = ["prose", "verse", "song"] as const;
export type Form = (typeof FORMS)[number];

export const RegionSchema = z.object({
  name: z.string().min(1),
  countryCode: z.string().length(2).nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
});
export type Region = z.infer<typeof RegionSchema>;

export const ProvenanceSchema = z.object({
  kind: z.enum(["canon", "submission"]),
  source: z.string().min(1),
  sourceUrl: z.string().url().nullable().optional(),
  importedAt: z.string(),
});
export type Provenance = z.infer<typeof ProvenanceSchema>;

export const MediaItemSchema = z.object({
  kind: z.enum(["image", "audio", "video"]),
  url: z.string().url(),
  caption: z.string().nullable().optional(),
});
export type MediaItem = z.infer<typeof MediaItemSchema>;

export const StoryFrontmatterSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  form: z.enum(FORMS).default("prose"),

  genre: z.enum(GENRES),

  timePeriod: z.string().min(1),
  approxYear: z.number().int().nullable().optional(),

  language: z.string().min(2),
  isOralTradition: z.boolean().default(false),

  region: RegionSchema,

  cycle: z.string().nullable().optional(),
  episode: z.string().nullable().optional(),
  variantLabel: z.string().nullable().optional(),
  taleType: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),

  author: z.string().nullable().optional(),
  authorVisible: z.boolean().default(true),
  collector: z.string().nullable().optional(),
  translator: z.string().nullable().optional(),
  sourceTranslator: z.string().nullable().optional(),

  provenance: ProvenanceSchema,

  media: z.array(MediaItemSchema).default([]),

  license: z.string().default("CC-BY-SA-4.0"),

  submittedByHash: z.string().nullable().optional(),

  createdAt: z.string(),
});
export type StoryFrontmatter = z.infer<typeof StoryFrontmatterSchema>;

export type Story = StoryFrontmatter & {
  bodies: Record<string, string>;
};

export const SubmissionInputSchema = z.object({
  title: z.string().min(1).max(200),
  form: z.enum(FORMS).default("prose"),
  timePeriod: z.string().min(1).max(100),
  approxYear: z.number().int().nullable().optional(),
  region: RegionSchema,
  genre: z.enum(GENRES),
  author: z.string().max(120).nullable().optional(),
  authorVisible: z.boolean(),
  language: z.string().min(2).max(10),
  isOralTradition: z.boolean().default(false),
  body: z.string().min(20),
  email: z.string().email(),
});
export type SubmissionInput = z.infer<typeof SubmissionInputSchema>;
