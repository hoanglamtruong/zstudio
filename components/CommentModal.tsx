"use client";

import { useEffect, useState } from "react";
import { Comment, CommentTarget } from "@/lib/types";

export default function CommentModal({
  targetType,
  targetId,
  label,
  onClose,
}: {
  targetType: CommentTarget;
  targetId: number;
  label: string;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, [targetType, targetId]);

  async function submit() {
    const t = text.trim();
    if (!t) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, text: t }),
    });
    if (res.ok) {
      setText("");
      load();
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-dark-green border border-ultra-violet sm:border-0 w-full sm:max-w-md min-w-0 max-w-full box-border rounded-t-2xl sm:rounded-xl p-4 sm:p-5 flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="font-semibold text-saffron truncate pr-2">Bình luận · {label}</h3>
          <button onClick={onClose} aria-label="Đóng" className="text-ultra-violet hover:text-saffron text-xl leading-none shrink-0">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 min-h-[80px]">
          {loading && <p className="text-sm opacity-70">Đang tải...</p>}
          {!loading && comments.length === 0 && <p className="text-sm opacity-70">Chưa có bình luận nào.</p>}
          {comments.map((c) => (
            <div key={c.id} className="bg-dark-purple rounded-md p-2 text-sm">
              <div className="flex justify-between text-xs opacity-60 mb-1">
                <span className="font-medium text-saffron">{c.author}</span>
                <span>{new Date(c.createdAt).toLocaleString("vi-VN")}</span>
              </div>
              <p className="whitespace-pre-wrap break-words">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Viết bình luận..."
            className="flex-1 min-w-0 resize-none"
          />
          <button onClick={submit} className="px-3 py-2 sm:py-1 rounded-md bg-saffron text-dark-purple font-semibold sm:self-end">
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
