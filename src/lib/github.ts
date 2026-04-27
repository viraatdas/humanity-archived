import "server-only";
import { Octokit } from "@octokit/rest";

export type StoryPRInput = {
  slug: string;
  title: string;
  fileContent: string;
  submitterEmail: string;
  authorLabel: string;
};

export function isGithubConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_TOKEN &&
      process.env.GITHUB_OWNER &&
      process.env.GITHUB_REPO,
  );
}

export async function openStoryPR(input: StoryPRInput): Promise<{
  prUrl: string;
  branch: string;
}> {
  const token = process.env.GITHUB_TOKEN!;
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const baseBranch = process.env.GITHUB_DEFAULT_BRANCH ?? "main";

  const octokit = new Octokit({ auth: token });

  const { data: baseRef } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  });
  const baseSha = baseRef.object.sha;

  const branch = `submission/${input.slug}`;
  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${branch}`,
    sha: baseSha,
  });

  const filePath = `content/stories/${input.slug}.md`;
  const contentB64 = Buffer.from(input.fileContent, "utf8").toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    branch,
    message: `Submission: ${input.title}`,
    content: contentB64,
  });

  const { data: pr } = await octokit.pulls.create({
    owner,
    repo,
    head: branch,
    base: baseBranch,
    title: `Submission: ${input.title}`,
    body: [
      `New story submitted to the archive.`,
      ``,
      `**Author label:** ${input.authorLabel}`,
      `**Submitter email:** ${input.submitterEmail}`,
      ``,
      `Review the file at \`${filePath}\` and merge to publish.`,
    ].join("\n"),
  });

  return { prUrl: pr.html_url, branch };
}
