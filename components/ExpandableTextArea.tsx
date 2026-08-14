"use client";

import { useState } from "react";

export default function ExpandableTextArea({
  value,
  disabled,
  placeholder,
  rows = 2,
  className = "",
  onSave,
  title,
}: {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
  onSave: (v: string) => void;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  function openModal() {
    if (disabled) return;
    setDraft(value);
    setOpen(true);
  }

  function save() {
    if (draft !== value) onSave(draft);
    setOpen(false);
  }

  return (
    <>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openModal}
        onKeyDown={(e) => {
          if (e.key === "Enter") openModal();
        }}
        className={`w-full rounded-md border border-ultra-violet bg-dark-green px-3 py-2 text-sm whitespace-pre-wrap break-words ${
          disabled ? "opacity-50" : "cursor-pointer active:bg-ultra-violet/20"
        } ${className}`}
        style={{ minHeight: `${rows * 1.4 + 1}rem` }}
      >
        {value ? value : <span className="opacity-50">{placeholder}</span>}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-dark-purple border border-ultra-violet w-full sm:max-w-2xl rounded-t-2xl sm:rounded-lg flex flex-col max-h-[92vh] sm:max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-ultra-violet flex items-center justify-between shrink-0">
              <div className="text-sm font-semibold text-saffron truncate pr-2">{title}</div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="text-ultra-violet text-xl leading-none px-2 shrink-0"
              >
                ✕
              </button>
            </div>

            <textarea
              autoFocus
              value={draft}
              disabled={disabled}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 w-full resize-none px-4 py-3 text-base leading-relaxed"
              style={{ minHeight: "40vh" }}
            />

            <div
              className="flex justify-end gap-2 px-4 py-3 border-t border-ultra-violet shrink-0"
              style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            >
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md text-sm border border-ultra-violet text-ultra-violet"
              >
                Hủy
              </button>
              {!disabled && (
                <button
                  onClick={save}
                  className="px-4 py-2 rounded-md text-sm bg-saffron text-dark-purple font-semibold"
                >
                  Lưu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
