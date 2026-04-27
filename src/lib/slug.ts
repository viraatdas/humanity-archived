import slugify from "slugify";

export function makeSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true, trim: true });
  const trimmed = base.slice(0, 60).replace(/-+$/, "");
  const stamp = Math.random().toString(36).slice(2, 6);
  return `${trimmed || "story"}-${stamp}`;
}
