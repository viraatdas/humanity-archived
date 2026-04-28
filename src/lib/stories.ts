import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import { StoryFrontmatterSchema, type Story } from "./schema";

const STORIES_DIR = path.join(process.cwd(), "content", "stories");

async function ensureDir() {
  try {
    await fs.access(STORIES_DIR);
  } catch {
    await fs.mkdir(STORIES_DIR, { recursive: true });
  }
}

async function loadStoryDir(dir: string): Promise<Story | null> {
  const yamlPath = path.join(dir, "index.yaml");
  let yamlRaw: string;
  try {
    yamlRaw = await fs.readFile(yamlPath, "utf8");
  } catch {
    return null;
  }
  // JSON_SCHEMA keeps ISO timestamps as strings (default schema would coerce
  // them to Date). createdAt and importedAt are typed as strings on purpose.
  const data = yaml.load(yamlRaw, { schema: yaml.JSON_SCHEMA });
  const fm = StoryFrontmatterSchema.parse(data);

  const entries = await fs.readdir(dir);
  const bodies: Record<string, string> = {};
  await Promise.all(
    entries
      .filter((f) => f.endsWith(".md"))
      .map(async (f) => {
        const langCode = f.replace(/\.md$/, "");
        const body = await fs.readFile(path.join(dir, f), "utf8");
        bodies[langCode] = body;
      }),
  );

  return { ...fm, bodies };
}

export async function listStories(): Promise<Story[]> {
  await ensureDir();
  const entries = await fs.readdir(STORIES_DIR, { withFileTypes: true });
  const dirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(STORIES_DIR, e.name));
  const loaded = await Promise.all(dirs.map(loadStoryDir));
  const stories = loaded.filter((s): s is Story => s !== null);
  return stories.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getStory(slug: string): Promise<Story | null> {
  await ensureDir();
  return loadStoryDir(path.join(STORIES_DIR, slug));
}

export function pickBody(story: Story, preferredLang = "en"): string {
  if (story.bodies[preferredLang]) return story.bodies[preferredLang];
  if (story.bodies.en) return story.bodies.en;
  const first = Object.values(story.bodies)[0];
  return first ?? "";
}

export async function renderMarkdown(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeStringify)
    .process(md);
  return String(file);
}
