"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Ctx = {
  open: boolean;
  query: string;
  setOpen: (v: boolean) => void;
  setQuery: (v: string) => void;
  toggle: () => void;
};

const SearchCtx = createContext<Ctx | null>(null);

export function useSearch(): Ctx {
  const v = useContext(SearchCtx);
  if (!v) throw new Error("useSearch must be inside <SearchProvider>");
  return v;
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Global keyboard shortcuts: ⌘K / Ctrl-K and `/` open the palette.
  useEffect(() => {
    function isTypingTarget(t: EventTarget | null): boolean {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (t.isContentEditable) return true;
      return false;
    }

    function onKey(e: KeyboardEvent) {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isSlash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (isCmdK) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (isSlash && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const value = useMemo(
    () => ({ open, query, setOpen, setQuery, toggle }),
    [open, query, toggle],
  );
  return <SearchCtx.Provider value={value}>{children}</SearchCtx.Provider>;
}
