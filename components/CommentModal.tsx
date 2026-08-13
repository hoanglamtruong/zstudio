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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-dark-green rounded-xl p-5 w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-saffron">Bình luận · {label}</h3>
          <button onClick={onClose} className="text-ultra-violet hover:text-saffron">
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
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Viết bình luận..."
            className="flex-1 resize-none"
          />
          <button onClick={submit} className="px-3 py-1 rounded-md bg-saffron text-dark-purple font-semibold self-end">
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
