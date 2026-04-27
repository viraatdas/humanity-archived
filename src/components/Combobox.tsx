"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
};

type Props = {
  id: string;
  name: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  allowCustom?: boolean;
  placeholder?: string;
  required?: boolean;
  customHeader?: string;
};

export function Combobox({
  id,
  name,
  options,
  value,
  onChange,
  allowCustom,
  placeholder,
  required,
  customHeader,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selectedOption = options.find((o) => o.value === value);
  const displayValue =
    selectedOption?.label ??
    (allowCustom && value ? value : "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  const showCustomRow =
    allowCustom &&
    query.trim().length > 0 &&
    !options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());

  function pick(option: ComboboxOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function pickCustom() {
    const trimmed = query.trim();
    if (allowCustom && trimmed) {
      onChange(trimmed);
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        autoComplete="off"
        value={open ? query : displayValue}
        placeholder={placeholder}
        required={required && !value}
        onFocus={() => {
          setOpen(true);
          setQuery("");
          setHighlight(0);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onKeyDown={(e) => {
          const total = filtered.length + (showCustomRow ? 1 : 0);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, Math.max(total - 1, 0)));
            setOpen(true);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlight < filtered.length) pick(filtered[highlight]);
            else if (showCustomRow) pickCustom();
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="ha-input"
      />
      <input type="hidden" name={name} value={value} />
      <span aria-hidden className="ha-combobox-caret">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 5.25l3.5 3.5 3.5-3.5" />
        </svg>
      </span>

      {open && (filtered.length > 0 || showCustomRow) && (
        <div className="ha-combobox-list">
          {customHeader && allowCustom && (
            <div className="ha-combobox-header">{customHeader}</div>
          )}
          {filtered.map((o, i) => (
            <div
              key={o.value}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(o);
              }}
              onMouseEnter={() => setHighlight(i)}
              className={`ha-combobox-item ${
                i === highlight ? "ha-combobox-item-active" : ""
              }`}
            >
              <span>{o.label}</span>
              {o.description && (
                <span className="ha-combobox-item-desc">{o.description}</span>
              )}
            </div>
          ))}
          {showCustomRow && (
            <div
              role="option"
              aria-selected={highlight === filtered.length}
              onMouseDown={(e) => {
                e.preventDefault();
                pickCustom();
              }}
              onMouseEnter={() => setHighlight(filtered.length)}
              className={`ha-combobox-item ha-combobox-item-custom ${
                highlight === filtered.length ? "ha-combobox-item-active" : ""
              }`}
            >
              Use &ldquo;{query.trim()}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
