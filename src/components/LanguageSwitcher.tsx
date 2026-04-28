"use client";

import { useMemo, useState } from "react";

type Props = {
  bodies: Record<string, string>;
  defaultLang?: string;
  preRendered: Record<string, string>;
  languageNames: Record<string, string>;
};

export default function LanguageSwitcher({
  bodies,
  defaultLang = "en",
  preRendered,
  languageNames,
}: Props) {
  const codes = useMemo(() => {
    const list = Object.keys(bodies).sort((a, b) => {
      if (a === "en") return -1;
      if (b === "en") return 1;
      return a.localeCompare(b);
    });
    return list;
  }, [bodies]);

  const initial = bodies[defaultLang] ? defaultLang : codes[0];
  const [active, setActive] = useState(initial);

  const RTL_LANGS = new Set(["ar", "he", "fa", "ur"]);
  const dir = RTL_LANGS.has(active) ? "rtl" : "ltr";

  if (codes.length <= 1) {
    return (
      <div
        className="prose"
        dir={dir}
        dangerouslySetInnerHTML={{ __html: preRendered[active] ?? "" }}
      />
    );
  }

  return (
    <div>
      <div
        className="mb-6 flex flex-wrap items-center gap-2 text-xs"
        style={{ color: "var(--color-ink-soft)" }}
      >
        <span className="uppercase tracking-widest">Language:</span>
        {codes.map((code) => {
          const isActive = code === active;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setActive(code)}
              className="rounded-full border px-2.5 py-1 transition-colors"
              style={{
                borderColor: "var(--color-rule)",
                background: isActive ? "var(--color-ink)" : "transparent",
                color: isActive ? "var(--color-bg)" : "var(--color-ink-soft)",
              }}
            >
              {languageNames[code] ?? code.toUpperCase()}
            </button>
          );
        })}
      </div>
      <div
        className="prose"
        dir={dir}
        dangerouslySetInnerHTML={{ __html: preRendered[active] ?? "" }}
      />
    </div>
  );
}
