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

  return (
    <>
      <div className="relative">
        <textarea
          key={value}
          defaultValue={value}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          onBlur={(e) => e.target.value !== value && onSave(e.target.value)}
          className={`w-full pr-7 ${className}`}
        />
        <button
          type="button"
          onClick={() => {
            setDraft(value);
            setOpen(true);
          }}
          title="Mở rộng để xem/sửa"
          className="absolute top-1 right-1 text-[10px] w-5 h-5 leading-5 rounded bg-ultra-violet text-dark-purple opacity-70 hover:opacity-100"
        >
          ⤢
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-dark-purple border border-ultra-violet rounded-lg p-4 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {title && <div className="text-sm font-semibold text-saffron mb-2">{title}</div>}
            <textarea
              autoFocus
              value={draft}
              disabled={disabled}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value)}
              rows={12}
              className="w-full"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-md text-sm border border-ultra-violet text-ultra-violet"
              >
                Hủy
              </button>
              {!disabled && (
                <button
                  onClick={() => {
                    if (draft !== value) onSave(draft);
                    setOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-md text-sm bg-saffron text-dark-purple font-semibold"
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
