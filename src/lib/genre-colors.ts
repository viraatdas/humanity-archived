import type { Genre } from "./schema";

/**
 * Genre dot CSS classes. The actual colors live in globals.css under
 * `.genre-dot-*` and adapt to the active theme (paper/white/ink).
 */
export function genreDotClass(genre: Genre): string {
  return `genre-dot genre-dot-${genre}`;
}

export const GENRE_LABELS: Record<Genre, string> = {
  mythology: "Mythology",
  folklore: "Folklore",
  "oral-history": "Oral history",
  religious: "Religious narrative",
  historical: "Historical account",
  personal: "Personal & family history",
  epic: "Epic",
};
