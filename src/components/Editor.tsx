"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
};

export function Editor({ value, onChange, placeholder }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      Image.configure({
        HTMLAttributes: { class: "ha-editor-img" },
        allowBase64: false,
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
      handlePaste: (_view, event) => {
        const files = imagesFromDataTransfer(event.clipboardData);
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((f) => uploadAndInsert(f));
        return true;
      },
      handleDrop: (_view, event) => {
        if (!(event instanceof DragEvent)) return false;
        const files = imagesFromDataTransfer(event.dataTransfer);
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((f) => uploadAndInsert(f));
        return true;
      },
    },
    immediatelyRender: false,
  });

  async function uploadAndInsert(file: File) {
    if (!editor) return;
    setUploadError(null);
    setUploadingCount((n) => n + 1);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data: { ok: boolean; url?: string; error?: string } = await res.json();
      if (!data.ok || !data.url) {
        throw new Error(data.error ?? `Upload failed (${res.status})`);
      }
      editor
        .chain()
        .focus()
        .setImage({ src: data.url, alt: file.name.replace(/\.[^/.]+$/, "") })
        .run();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingCount((n) => Math.max(0, n - 1));
    }
  }

  function pickFromDisk() {
    fileInputRef.current?.click();
  }

  async function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    files.forEach((f) => uploadAndInsert(f));
    e.target.value = "";
  }

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
              <BubbleButton
                active={false}
                onClick={pickFromDisk}
                label="Insert image"
              >
                <ImageIcon />
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFilePicked}
        style={{ display: "none" }}
      />

      <div className="ha-prose-foot">
        <p className="ha-prose-hint">
          Select text to format. Paste or drop an image to insert it.
          Markdown shortcuts work too — <code>**bold**</code>,{" "}
          <code>*italic*</code>, <code>## heading</code>,{" "}
          <code>&gt; quote</code>.
        </p>
        <button
          type="button"
          onClick={pickFromDisk}
          className="ha-prose-imgbtn"
        >
          <ImageIcon /> Add image
        </button>
      </div>

      {uploadingCount > 0 && (
        <p className="ha-prose-status">
          Uploading {uploadingCount} image{uploadingCount > 1 ? "s" : ""}…
        </p>
      )}
      {uploadError && (
        <p className="ha-prose-error" role="alert">
          {uploadError}
        </p>
      )}
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

function imagesFromDataTransfer(
  dt: DataTransfer | null,
): File[] {
  if (!dt) return [];
  const files: File[] = [];
  if (dt.files && dt.files.length > 0) {
    for (const f of Array.from(dt.files)) {
      if (f.type.startsWith("image/")) files.push(f);
    }
  }
  if (files.length === 0 && dt.items) {
    for (const item of Array.from(dt.items)) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const f = item.getAsFile();
        if (f) files.push(f);
      }
    }
  }
  return files;
}

function ImageIcon() {
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
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.6" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
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
