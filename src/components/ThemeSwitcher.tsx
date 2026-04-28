"use client";

import { useEffect, useState } from "react";

const THEMES = ["paper", "white", "ink"] as const;
type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "ha-theme";

const LABELS: Record<Theme, string> = {
  paper: "Paper",
  white: "White",
  ink: "Ink",
};

function readTheme(): Theme {
  if (typeof document === "undefined") return "paper";
  const dom = document.documentElement.dataset.theme as Theme | undefined;
  if (dom && THEMES.includes(dom)) return dom;
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && THEMES.includes(stored)) return stored;
  } catch {}
  return "paper";
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("paper");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }

  return (
    <div className="theme-switch" role="radiogroup" aria-label="Theme">
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={theme === t}
          aria-label={`${LABELS[t]} theme`}
          title={`${LABELS[t]} theme`}
          data-active={theme === t}
          className={`theme-swatch-${t}`}
          onClick={() => apply(t)}
        />
      ))}
    </div>
  );
}
