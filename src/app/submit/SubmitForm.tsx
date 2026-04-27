"use client";

import { useState, useTransition } from "react";
import { GENRES } from "@/lib/schema";
import { REGIONS } from "@/lib/regions";
import { submitStory, type SubmitResult } from "./actions";

const GENRE_LABELS: Record<(typeof GENRES)[number], string> = {
  mythology: "Mythology",
  folklore: "Folklore",
  "oral-history": "Oral history",
  religious: "Religious narrative",
  historical: "Historical account",
  personal: "Personal & family history",
  epic: "Epic",
};

export function SubmitForm() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [body, setBody] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setResult(null);
    start(async () => {
      const r = await submitStory(fd);
      setResult(r);
      if (r.ok) {
        (e.target as HTMLFormElement).reset();
        setBody("");
      }
    });
  }

  if (result?.ok) {
    return (
      <div className="prose mx-auto max-w-2xl pt-4">
        <h1 className="font-serif text-3xl">Received.</h1>
        <p>{result.message}</p>
        <p>
          <a href="/">Return to the archive</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6 pt-4">
      <header className="pb-2">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Contribute
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
          Share a story.
        </h1>
        <p
          className="mt-4 text-base"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Anything from a creation myth to a tale your grandmother told you.
          Every submission is reviewed before it joins the archive.
          Submissions are licensed under CC BY-SA 4.0.
        </p>
      </header>

      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          className={inputCls}
          placeholder="The story of..."
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Approximate time period"
          htmlFor="timePeriod"
          hint="e.g. c. 800 BCE, medieval, 1920s, ancestral"
        >
          <input
            id="timePeriod"
            name="timePeriod"
            type="text"
            required
            maxLength={100}
            className={inputCls}
          />
        </Field>
        <Field
          label="Approximate year"
          htmlFor="approxYear"
          hint="optional, negative for BCE"
        >
          <input
            id="approxYear"
            name="approxYear"
            type="number"
            step="1"
            className={inputCls}
            placeholder="e.g. -800"
          />
        </Field>
      </div>

      <Field label="Region of origin" htmlFor="regionCode">
        <select
          id="regionCode"
          name="regionCode"
          required
          defaultValue=""
          className={inputCls}
        >
          <option value="" disabled>
            Choose a region
          </option>
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Genre" htmlFor="genre">
        <select
          id="genre"
          name="genre"
          required
          defaultValue=""
          className={inputCls}
        >
          <option value="" disabled>
            Choose a genre
          </option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {GENRE_LABELS[g]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Author or attribution"
          htmlFor="author"
          hint='optional. e.g. "grandmother", "anonymous folk tradition", or a name'
        >
          <input
            id="author"
            name="author"
            type="text"
            maxLength={120}
            className={inputCls}
          />
        </Field>
        <Field
          label="Original language"
          htmlFor="language"
          hint="ISO code, e.g. en, hi, sw"
        >
          <input
            id="language"
            name="language"
            type="text"
            required
            maxLength={10}
            defaultValue="en"
            className={inputCls}
          />
        </Field>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="authorVisible"
          defaultChecked
          className="mt-1"
        />
        <span>
          Show this attribution publicly. Uncheck to keep the contributor
          anonymous on the published page.
        </span>
      </label>

      <Field
        label="The story"
        htmlFor="body"
        hint="Markdown is welcome. Footnotes, citations, and emphasis all work."
      >
        <div className="flex items-center justify-end pb-2">
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="text-xs"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
        </div>
        {showPreview ? (
          <div
            className="prose min-h-[16rem] rounded border p-4"
            style={{ borderColor: "var(--color-rule)" }}
          >
            {body.trim() === "" ? (
              <p style={{ color: "var(--color-ink-soft)" }}>
                Nothing to preview yet.
              </p>
            ) : (
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                {body}
              </pre>
            )}
          </div>
        ) : (
          <textarea
            id="body"
            name="body"
            required
            minLength={20}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className={`${inputCls} font-mono text-sm leading-relaxed`}
            placeholder="Tell the story..."
          />
        )}
        {showPreview && (
          <input type="hidden" name="body" value={body} readOnly />
        )}
      </Field>

      <Field
        label="Your email"
        htmlFor="email"
        hint="So we can let you know once the story is reviewed. We won't publish it."
      >
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputCls}
        />
      </Field>

      {result && !result.ok && (
        <p
          className="rounded border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--color-accent)",
            color: "var(--color-accent)",
          }}
        >
          {result.error}
        </p>
      )}

      <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: "var(--color-rule)" }}>
        <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
          Licensed under CC BY-SA 4.0
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-5 py-2 text-sm"
          style={{
            background: "var(--color-ink)",
            color: "var(--color-paper)",
            opacity: pending ? 0.5 : 1,
          }}
        >
          {pending ? "Sending..." : "Submit for review"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded border bg-transparent px-3 py-2 text-base outline-none focus:border-[var(--color-accent)] border-[var(--color-rule)]";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {hint && (
        <p
          className="mt-1 text-xs"
          style={{ color: "var(--color-ink-soft)" }}
        >
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
    </div>
  );
}
