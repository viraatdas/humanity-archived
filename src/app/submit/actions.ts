"use server";

import matter from "gray-matter";
import { GENRES, SubmissionInputSchema } from "@/lib/schema";
import { findRegion } from "@/lib/regions";
import { makeSlug } from "@/lib/slug";
import { isGithubConfigured, openStoryPR } from "@/lib/github";
import { isEmailConfigured, notifyAdmin } from "@/lib/email";

export type SubmitResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function submitStory(formData: FormData): Promise<SubmitResult> {
  const regionCode = String(formData.get("regionCode") ?? "");
  const region = findRegion(regionCode);
  if (!region) return { ok: false, error: "Please choose a region." };

  const authorRaw = String(formData.get("author") ?? "").trim();
  const authorVisible = formData.get("authorVisible") === "on";
  const author = authorRaw.length > 0 ? authorRaw : undefined;

  const approxYearRaw = String(formData.get("approxYear") ?? "").trim();
  const approxYear = approxYearRaw === "" ? undefined : Number(approxYearRaw);

  const parsed = SubmissionInputSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    timePeriod: String(formData.get("timePeriod") ?? "").trim(),
    approxYear: Number.isFinite(approxYear) ? approxYear : undefined,
    region: {
      name: region.name,
      countryCode: region.code,
      lat: region.lat,
      lng: region.lng,
    },
    genre: String(formData.get("genre") ?? ""),
    author,
    authorVisible,
    language: String(formData.get("language") ?? "en").trim(),
    body: String(formData.get("body") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid submission.",
    };
  }

  const data = parsed.data;
  if (!GENRES.includes(data.genre)) {
    return { ok: false, error: "Invalid genre." };
  }

  const slug = makeSlug(data.title);
  const createdAt = new Date().toISOString();

  const frontmatter = {
    title: data.title,
    slug,
    timePeriod: data.timePeriod,
    approxYear: data.approxYear,
    region: data.region,
    genre: data.genre,
    author: data.author,
    authorVisible: data.authorVisible,
    language: data.language,
    translations: [],
    license: "CC-BY-SA-4.0",
    createdAt,
  };

  const fileContent = matter.stringify(data.body + "\n", frontmatter);
  const authorLabel = data.author
    ? data.authorVisible
      ? data.author
      : `${data.author} (anonymous)`
    : "Anonymous";

  if (!isGithubConfigured()) {
    return {
      ok: false,
      error:
        "The submission system is not yet connected (GitHub credentials missing). Your story has not been saved. Please try again once Humanity Archived is fully configured.",
    };
  }

  try {
    const { prUrl } = await openStoryPR({
      slug,
      title: data.title,
      fileContent,
      submitterEmail: data.email,
      authorLabel,
    });

    if (isEmailConfigured()) {
      await notifyAdmin({
        subject: `[Humanity Archived] New submission: ${data.title}`,
        text: [
          `A new story has been submitted to the archive.`,
          ``,
          `Title: ${data.title}`,
          `Time: ${data.timePeriod}`,
          `Region: ${data.region.name}`,
          `Genre: ${data.genre}`,
          `Author: ${authorLabel}`,
          `Submitter: ${data.email}`,
          ``,
          `Review and merge: ${prUrl}`,
        ].join("\n"),
      });
    }

    return {
      ok: true,
      message:
        "Thank you. Your story has been received and is in moderation. You will hear back at the email you provided.",
    };
  } catch (err) {
    console.error("submitStory failed", err);
    return {
      ok: false,
      error:
        "Something went wrong saving your submission. Please try again in a few minutes.",
    };
  }
}
