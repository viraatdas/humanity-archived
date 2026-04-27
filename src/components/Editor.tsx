"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
};

export function Editor({ value, onChange, placeholder }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "ha-editor-link" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Begin the story…",
        emptyEditorClass: "is-editor-empty",
      }),
      Markdown.configure({ html: false, breaks: true, transformPastedText: true }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const storage = editor.storage as { markdown?: { getMarkdown: () => string } };
      const md = storage.markdown?.getMarkdown() ?? editor.getHTML();
      onChange(md);
    },
    editorProps: {
      attributes: {
        class: "ha-prose focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (value && editor.isEmpty) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="ha-prose-shell">
        <div className="ha-prose" style={{ color: "#b6ad9d" }}>
          {placeholder ?? "Begin the story…"}
        </div>
      </div>
    );
  }

  function applyLink() {
    if (!editor) return;
    if (linkUrl.trim() === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = /^https?:\/\//i.test(linkUrl)
        ? linkUrl
        : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkOpen(false);
    setLinkUrl("");
  }

  return (
    <div className="ha-prose-shell">
      <BubbleMenu editor={editor} options={{ placement: "top" }}>
        <div className="ha-bubble">
          {!linkOpen ? (
            <>
              <BubbleButton
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
                label="Bold"
              >
                <strong>B</strong>
              </BubbleButton>
              <BubbleButton
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                label="Italic"
              >
                <em>I</em>
              </BubbleButton>
              <span className="ha-bubble-sep" aria-hidden />
              <BubbleButton
                active={editor.isActive("heading", { level: 2 })}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                label="Heading"
              >
                H
              </BubbleButton>
              <BubbleButton
                active={editor.isActive("blockquote")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                label="Quote"
              >
                &ldquo;
              </BubbleButton>
              <BubbleButton
                active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                label="Bullet list"
              >
                •
              </BubbleButton>
              <span className="ha-bubble-sep" aria-hidden />
              <BubbleButton
                active={editor.isActive("link")}
                onClick={() => {
                  const prev = editor.getAttributes("link").href ?? "";
                  setLinkUrl(prev);
                  setLinkOpen(true);
                }}
                label="Link"
              >
                <LinkIcon />
              </BubbleButton>
            </>
          ) : (
            <div className="ha-bubble-link">
              <input
                type="text"
                value={linkUrl}
                autoFocus
                placeholder="paste a link"
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  } else if (e.key === "Escape") {
                    setLinkOpen(false);
                    setLinkUrl("");
                  }
                }}
              />
              <button type="button" onClick={applyLink}>
                Apply
              </button>
            </div>
          )}
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />

      <p className="ha-prose-hint">
        Select any text to format it. Markdown shortcuts work too —
        <code>**bold**</code>, <code>*italic*</code>,{" "}
        <code>## heading</code>, <code>&gt; quote</code>.
      </p>
    </div>
  );
}

function BubbleButton({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`ha-bubble-btn${active ? " ha-bubble-btn-active" : ""}`}
    >
      {children}
    </button>
  );
}

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
