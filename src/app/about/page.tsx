import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl pt-4">
      <header className="pb-8">
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--color-ink-soft)" }}
        >
          A Note from the Creator
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
          Stories are the currency of humans.
        </h1>
      </header>

      <div className="prose">
        <p>
          The fundamental belief behind this project is simple: humans bond
          over stories. Whether it&rsquo;s gossip whispered between friends
          or a tale told over a fire, stories are how we&rsquo;ve always met
          each other.
        </p>

        <p>
          So much so, in fact, that until a very old age our perception of
          the world comes from stories. Our parents teach us through them.
          The shape of right and wrong, the names of fears, the texture of
          places we&rsquo;ve never been; we receive almost all of it as
          story before we receive it as anything else.
        </p>

        <p>
          As a young kid I ventured out and found more stories, and I fell
          in love with them. Stories can be as huge as the <em>Iliad</em>{" "}
          or as small as one moment plucked from inside it. The grand epics
          and the grandmother&rsquo;s tales belong to the same family. They
          all need to be preserved, and they all deserve to be brought
          together.
        </p>

        <p>
          That&rsquo;s what this is. An open archive of human story, from
          mythology to folklore, from oral history to personal memory, from
          creation myths to a single afternoon someone doesn&rsquo;t want
          to forget. While anyone can contribute, every story is moderated
          before it joins the archive, so quality is ensured. The author
          can be a name, or simply &ldquo;grandmother.&rdquo; Everything
          shared here is shared freely, under a Creative Commons license,
          so the stories can keep moving the way stories always have.
        </p>
      </div>
    </article>
  );
}
