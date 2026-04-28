"use client";

import { useSearch } from "./SearchProvider";

export function SearchBar() {
  const { setOpen, setQuery } = useSearch();

  function open() {
    setQuery("");
    setOpen(true);
  }

  return (
    <button
      type="button"
      onClick={open}
      className="ha-searchbar"
      aria-label="Open search (⌘K)"
    >
      <SearchIcon />
      <span className="ha-searchbar-placeholder">Search the archive…</span>
      <kbd className="ha-searchbar-kbd" aria-hidden>
        ⌘K
      </kbd>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
