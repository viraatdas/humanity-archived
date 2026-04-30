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
type Step = "write" | "details";

export function SubmitForm() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [step, setStep] = useState<Step>("write");
  const [stepError, setStepError] = useState<string | null>(null);

  // Step 1: write
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Step 2: details
  const [email, setEmail] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  const [year, setYear] = useState("");
  const [era, setEra] = useState<Era>("CE");
  const [region, setRegion] = useState("");
  const [genre, setGenre] = useState("");
  const [author, setAuthor] = useState("");
  const [authorVisible, setAuthorVisible] = useState(true);
  const [language, setLanguage] = useState("en");

  function continueToDetails() {
    setStepError(null);
    if (title.trim().length === 0) {
      setStepError("Please give the story a title.");
      return;
    }
    if (body.trim().length < 20) {
      setStepError("The story is a bit short. Tell us a few more sentences.");
      return;
    }
    setStep("details");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function backToWriting() {
    setStepError(null);
    setStep("write");
  }

  async function onFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("title", title);
    fd.set("body", body);
    fd.set("email", email);
    fd.set("timePeriod", timePeriod);
    fd.set("year", year);
    fd.set("era", era);
    fd.set("region", region);
    fd.set("genre", genre);
    fd.set("author", author);
    if (authorVisible) fd.set("authorVisible", "on");
    fd.set("language", language);

    setResult(null);
    start(async () => {
      const r = await submitStory(fd);
      setResult(r);
      if (r.ok) {
        setTitle("");
        setBody("");
        setEmail("");
        setTimePeriod("");
        setYear("");
        setEra("CE");
        setRegion("");
        setGenre("");
        setAuthor("");
        setAuthorVisible(true);
        setLanguage("en");
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

  if (step === "write") {
    return (
      <div className="mx-auto max-w-2xl pt-2 pb-12">
        <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-widest" style={{ color: "var(--color-ink-soft)" }}>
          <span>Contribute</span>
          <span>1 of 2 · write</span>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          maxLength={200}
          className="ha-title-input mt-6 w-full"
          autoFocus
        />

        <div className="mt-6">
          <Editor
            value={body}
            onChange={setBody}
            placeholder="Begin the story…"
          />
        </div>

        {stepError && (
          <p
            className="mt-6 rounded border px-4 py-3 text-sm"
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--color-accent)",
            }}
          >
            {stepError}
          </p>
        )}

        <div className="mt-10 flex flex-col-reverse items-start gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--color-rule)" }}>
          <span className="text-xs" style={{ color: "var(--color-ink-soft)" }}>
            Submissions are reviewed before they join the archive.
          </span>
          <button
            type="button"
            onClick={continueToDetails}
            className="w-full rounded-full px-6 py-3 text-sm sm:w-auto"
            style={{
              background: "var(--color-ink)",
              color: "var(--color-paper)",
              minHeight: 48,
            }}
          >
            Continue &rarr;
          </button>
        </div>
      </div>
    );
  }

  // step === "details"
  return (
    <form onSubmit={onFinalSubmit} className="mx-auto max-w-2xl space-y-7 pt-2 pb-12">
      <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-widest" style={{ color: "var(--color-ink-soft)" }}>
        <span>Contribute</span>
        <span>2 of 2 · details</span>
      </div>

      <header className="pb-2">
        <h1 className="mt-3 break-words font-serif text-3xl leading-tight sm:text-4xl">
          Tell us about &ldquo;{title || "this story"}.&rdquo;
        </h1>
        <p
          className="mt-3 text-base"
          style={{ color: "var(--color-ink-soft)" }}
        >
          A few notes so we can place it in time, geography, and tradition.
          Every submission is licensed under CC BY-SA 4.0.
        </p>
      </header>

      <Field
        label="Your email"
        htmlFor="email"
        hint="We'll let you know once your story has been reviewed, and again when it's approved and live. Not shown publicly."
      >
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="ha-input"
          placeholder="you@example.com"
        />
      </Field>

      <Field
        label="In a few words, when?"
        htmlFor="timePeriod"
        hint='Free-form, e.g. "medieval", "1920s", "ancestral", "early Heian period"'
      >
        <input
          id="timePeriod"
          type="text"
          required
          maxLength={100}
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="ha-input"
          placeholder="medieval, ancestral, 1920s..."
        />
      </Field>

      <Field
        label="Approximate year (optional)"
        htmlFor="year"
        hint="Helps place the story on a timeline"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
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
        hint="Type any country, region, kingdom, or place, even one not in the list. Try Mesopotamia, the Andes, Yorubaland, or anywhere else."
      >
        <Combobox
          id="region"
          name="region"
          options={REGION_OPTIONS}
          value={region}
          onChange={setRegion}
          allowCustom
          required
          placeholder="Type any place..."
          customHeader="Type any place. Or pick from the list."
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
            type="text"
            maxLength={120}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
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
          checked={authorVisible}
          onChange={(e) => setAuthorVisible(e.target.checked)}
          className="mt-1 h-4 w-4"
        />
        <span>
          Show this attribution publicly. Uncheck to keep the contributor
          anonymous on the published page.
        </span>
      </label>

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
        className="flex flex-col-reverse items-stretch gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--color-rule)" }}
      >
        <button
          type="button"
          onClick={backToWriting}
          className="text-sm"
          style={{ color: "var(--color-ink-soft)", textDecoration: "underline", textDecorationColor: "var(--color-rule)", textUnderlineOffset: 4, background: "transparent", border: "none", padding: "0.5rem 0", textAlign: "left" }}
        >
          &larr; Back to writing
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-6 py-3 text-sm"
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
