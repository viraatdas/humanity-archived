"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { genreDotClass, GENRE_LABELS } from "@/lib/genre-colors";
import type { Genre } from "@/lib/schema";
import { useSearch } from "./SearchProvider";

type SearchResult = {
  slug: string;
  title: string;
  region: string;
  timePeriod: string;
  genre: Genre;
  author: string | null;
  snippet: string;
  score: number;
};

type ApiResponse =
  | {
      ok: true;
      query: string;
      results: SearchResult[];
      modes: { exact: boolean; fuzzy: boolean; semantic: boolean };
    }
  | { ok: false; error: string };

export function SearchPalette() {
  const router = useRouter();
  const { open, setOpen, query, setQuery } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modes, setModes] = useState<{
    exact: boolean;
    fuzzy: boolean;
    semantic: boolean;
  } | null>(null);

  // Focus input when palette opens; reset state when closed.
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(id);
    }
    setResults([]);
    setHighlight(0);
    setError(null);
  }, [open]);

  // Debounced fetch.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length === 0) {
      setResults([]);
      setError(null);
      setModes(null);
      return;
    }
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&limit=20`,
          { signal: ctrl.signal },
        );
        const data = (await res.json()) as ApiResponse;
        if (!data.ok) {
          setError(data.error);
          setResults([]);
          setModes(null);
        } else {
          setResults(data.results);
          setHighlight(0);
          setModes(data.modes);
        }
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => {
      ctrl.abort();
      clearTimeout(id);
    };
  }, [query, open]);

  // Close on backdrop click; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      const r = results[highlight];
      if (r) {
        setOpen(false);
        router.push(`/stories/${r.slug}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="ha-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onKeyDown={onKeyDown}
    >
      <div
        className="ha-search-backdrop"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div className="ha-search-panel">
        <div className="ha-search-input-row">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the archive — by title, region, theme, or feeling…"
            autoComplete="off"
            spellCheck={false}
            className="ha-search-input"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ha-search-close"
            aria-label="Close search"
          >
            esc
          </button>
        </div>

        {error && <div className="ha-search-error">{error}</div>}

        {!error && query.trim().length > 0 && results.length === 0 && !loading && (
          <div className="ha-search-empty">
            No matches yet. Try a different word — or pick a genre below the map.
          </div>
        )}

        {results.length > 0 && (
          <ul className="ha-search-results" role="listbox">
            {results.map((r, i) => (
              <li
                key={r.slug}
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  router.push(`/stories/${r.slug}`);
                }}
                className={`ha-search-result${i === highlight ? " ha-search-result-active" : ""}`}
              >
                <span
                  aria-hidden
                  className={genreDotClass(r.genre)}
                  style={{ marginTop: 8 }}
                />
                <div className="ha-search-result-body">
                  <div className="ha-search-result-title">{r.title}</div>
                  <div className="ha-search-result-meta">
                    {r.region} · {r.timePeriod} · {GENRE_LABELS[r.genre]}
                    {r.author ? ` · ${r.author}` : ""}
                  </div>
                  <div
                    className="ha-search-snippet"
                    dangerouslySetInnerHTML={{ __html: r.snippet }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="ha-search-foot">
          <span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span>
            <Kbd>↵</Kbd> open
          </span>
          <span>
            <Kbd>esc</Kbd> close
          </span>
          <span className="ha-search-modes">
            {loading ? "searching…" : modes ? formatModes(modes) : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function formatModes(m: { exact: boolean; fuzzy: boolean; semantic: boolean }) {
  const parts: string[] = [];
  if (m.exact) parts.push("exact");
  if (m.fuzzy) parts.push("fuzzy");
  if (m.semantic) parts.push("semantic");
  return parts.length === 3 ? "exact · fuzzy · semantic" : parts.join(" · ");
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="ha-search-kbd">{children}</kbd>;
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0, color: "var(--color-ink-soft)" }}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
