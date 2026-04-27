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
        placeholder: placeholder ?? "Tell the story...",
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
        class: "ha-editor focus:outline-none",
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
      <div className="ha-editor-shell">
        <div
          className="ha-editor"
          style={{ color: "#a8a39a", minHeight: "20rem" }}
        >
          {placeholder ?? "Tell the story..."}
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
    <div className="ha-editor-shell">
      <BubbleMenu editor={editor} options={{ placement: "top" }}>
        <div className="ha-bubble">
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
            active={editor.isActive("link") || linkOpen}
            onClick={() => {
              const prev = editor.getAttributes("link").href ?? "";
              setLinkUrl(prev);
              setLinkOpen((v) => !v);
            }}
            label="Link"
          >
            ↗
          </BubbleButton>
        </div>
        {linkOpen && (
          <div className="ha-bubble-link">
            <input
              type="text"
              value={linkUrl}
              autoFocus
              placeholder="https://"
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                } else if (e.key === "Escape") {
                  setLinkOpen(false);
                }
              }}
            />
            <button type="button" onClick={applyLink}>
              Apply
            </button>
          </div>
        )}
      </BubbleMenu>

      <EditorContent editor={editor} />
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
