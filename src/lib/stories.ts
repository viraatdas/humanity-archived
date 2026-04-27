import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
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

export async function listStories(): Promise<Story[]> {
  await ensureDir();
  const entries = await fs.readdir(STORIES_DIR);
  const files = entries.filter((f) => f.endsWith(".md"));
  const stories = await Promise.all(
    files.map(async (f) => {
      const raw = await fs.readFile(path.join(STORIES_DIR, f), "utf8");
      const { data, content } = matter(raw);
      const fm = StoryFrontmatterSchema.parse(data);
      return { ...fm, body: content };
    }),
  );
  return stories.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getStory(slug: string): Promise<Story | null> {
  await ensureDir();
  const filePath = path.join(STORIES_DIR, `${slug}.md`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const fm = StoryFrontmatterSchema.parse(data);
    return { ...fm, body: content };
  } catch {
    return null;
  }
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
