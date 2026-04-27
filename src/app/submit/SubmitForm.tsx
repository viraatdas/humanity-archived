"use client";

import { useState, useTransition } from "react";
import { GENRES } from "@/lib/schema";
import { REGIONS } from "@/lib/regions";
import { LANGUAGES } from "@/lib/languages";
import { Combobox, type ComboboxOption } from "@/components/Combobox";
import { Editor } from "@/components/Editor";
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

const GENRE_OPTIONS: ComboboxOption[] = GENRES.map((g) => ({
  value: g,
  label: GENRE_LABELS[g],
}));

const REGION_OPTIONS: ComboboxOption[] = REGIONS.map((r) => ({
  value: r.code,
  label: r.name,
}));

const LANGUAGE_OPTIONS: ComboboxOption[] = LANGUAGES.map((l) => ({
  value: l.code,
  label: l.name,
  description: l.code,
}));

type Era = "BCE" | "CE";

export function SubmitForm() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<SubmitResult | null>(null);

  const [region, setRegion] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("en");
  const [year, setYear] = useState("");
  const [era, setEra] = useState<Era>("CE");
  const [body, setBody] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("body", body);
    fd.set("region", region);
    fd.set("genre", genre);
    fd.set("language", language);
    fd.set("year", year);
    fd.set("era", era);
    setResult(null);
    start(async () => {
      const r = await submitStory(fd);
      setResult(r);
      if (r.ok) {
        (e.target as HTMLFormElement).reset();
        setRegion("");
        setGenre("");
        setLanguage("en");
        setYear("");
        setEra("CE");
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
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-7 pt-2 pb-12">
      <header className="pb-2">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Contribute
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
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

      <Field
        label="Your email"
        htmlFor="email"
        hint="We'll let you know once your story has been reviewed, and again when it's approved and live. Not shown publicly."
      >
        <input
          id="email"
          name="email"
          type="email"
          required
          className="ha-input"
          placeholder="you@example.com"
        />
      </Field>

      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          className="ha-input"
          placeholder="The story of..."
        />
      </Field>

      <Field
        label="In a few words, when?"
        htmlFor="timePeriod"
        hint='Free-form, e.g. "medieval", "1920s", "ancestral", "early Heian period"'
      >
        <input
          id="timePeriod"
          name="timePeriod"
          type="text"
          required
          maxLength={100}
          className="ha-input"
          placeholder="medieval, ancestral, 1920s..."
        />
      </Field>

      <Field
        label="Approximate year (optional)"
        htmlFor="year"
        hint="Helps place the story on a timeline"
      >
        <div className="flex gap-3">
          <input
            id="year"
            type="number"
            min={0}
            step={1}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="ha-input"
            placeholder="e.g. 800"
          />
          <div className="ha-era-toggle" role="group" aria-label="Era">
            <button
              type="button"
              aria-pressed={era === "BCE"}
              onClick={() => setEra("BCE")}
            >
              BCE
            </button>
            <button
              type="button"
              aria-pressed={era === "CE"}
              onClick={() => setEra("CE")}
            >
              CE
            </button>
          </div>
        </div>
      </Field>

      <Field
        label="Region of origin"
        htmlFor="region"
        hint="Pick a country, or type a region — e.g. Mesopotamia, Andes"
      >
        <Combobox
          id="region"
          name="region"
          options={REGION_OPTIONS}
          value={region}
          onChange={setRegion}
          allowCustom
          required
          placeholder="Choose or type..."
        />
      </Field>

      <Field label="Genre" htmlFor="genre">
        <Combobox
          id="genre"
          name="genre"
          options={GENRE_OPTIONS}
          value={genre}
          onChange={setGenre}
          required
          placeholder="Choose a genre"
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Author or attribution"
          htmlFor="author"
          hint='Optional. e.g. "grandmother", "anonymous folk tradition", or a name'
        >
          <input
            id="author"
            name="author"
            type="text"
            maxLength={120}
            className="ha-input"
          />
        </Field>
        <Field
          label="Original language"
          htmlFor="language"
          hint="Pick from the list or type any language"
        >
          <Combobox
            id="language"
            name="language"
            options={LANGUAGE_OPTIONS}
            value={language}
            onChange={setLanguage}
            allowCustom
            required
            placeholder="English, Hindi, Yoruba..."
          />
        </Field>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="authorVisible"
          defaultChecked
          className="mt-1 h-4 w-4"
        />
        <span>
          Show this attribution publicly. Uncheck to keep the contributor
          anonymous on the published page.
        </span>
      </label>

      <Field
        label="The story"
        htmlFor="body"
        hint="Write naturally. Select text to format. Press Enter for a new paragraph."
      >
        <Editor
          value={body}
          onChange={setBody}
          placeholder="Tell the story..."
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

      <div
        className="flex flex-col-reverse items-start gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--color-rule)" }}
      >
        <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
          Licensed under CC BY-SA 4.0
        </span>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full px-6 py-3 text-sm sm:w-auto"
          style={{
            background: "var(--color-ink)",
            color: "var(--color-paper)",
            opacity: pending ? 0.5 : 1,
            minHeight: 48,
          }}
        >
          {pending ? "Sending..." : "Submit for review"}
        </button>
      </div>
    </form>
  );
}

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
