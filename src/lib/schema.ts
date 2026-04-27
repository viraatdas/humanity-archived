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

export const RegionSchema = z.object({
  name: z.string().min(1),
  countryCode: z.string().length(2).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export type Region = z.infer<typeof RegionSchema>;

export const TranslationSchema = z.object({
  language: z.string().min(2),
  body: z.string().min(1),
  auto: z.boolean().default(false),
});

export type Translation = z.infer<typeof TranslationSchema>;

export const StoryFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  timePeriod: z.string().min(1),
  approxYear: z.number().int().optional(),
  region: RegionSchema,
  genre: z.enum(GENRES),
  author: z.string().optional(),
  authorVisible: z.boolean().default(true),
  language: z.string().min(2),
  translations: z.array(TranslationSchema).default([]),
  license: z.string().default("CC-BY-SA-4.0"),
  submittedByHash: z.string().optional(),
  createdAt: z.string(),
});

export type StoryFrontmatter = z.infer<typeof StoryFrontmatterSchema>;

export type Story = StoryFrontmatter & {
  body: string;
};

export const SubmissionInputSchema = z.object({
  title: z.string().min(1).max(200),
  timePeriod: z.string().min(1).max(100),
  approxYear: z.number().int().optional(),
  region: RegionSchema,
  genre: z.enum(GENRES),
  author: z.string().max(120).optional(),
  authorVisible: z.boolean(),
  language: z.string().min(2).max(10),
  body: z.string().min(20),
  email: z.string().email(),
});

export type SubmissionInput = z.infer<typeof SubmissionInputSchema>;
