import type { Genre } from "./schema";

export const GENRE_COLORS: Record<Genre, string> = {
  mythology: "#4a4a7a",
  folklore: "#4a6b3e",
  "oral-history": "#8a4b2a",
  religious: "#b08840",
  historical: "#5a6b78",
  personal: "#a86a5e",
  epic: "#7a3a3a",
};

export const GENRE_LABELS: Record<Genre, string> = {
  mythology: "Mythology",
  folklore: "Folklore",
  "oral-history": "Oral history",
  religious: "Religious narrative",
  historical: "Historical account",
  personal: "Personal & family history",
  epic: "Epic",
};
