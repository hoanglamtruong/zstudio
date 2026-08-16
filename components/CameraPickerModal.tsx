"use client";

import { useState } from "react";
import { CAMERA_ANGLES, CAMERA_MOVEMENTS } from "@/lib/cameraData";

export default function CameraPickerModal({
  initialAngle,
  initialMovement,
  onConfirm,
  onClose,
}: {
  initialAngle: string;
  initialMovement: string;
  onConfirm: (angle: string, movement: string) => void;
  onClose: () => void;
}) {
  const [angle, setAngle] = useState(initialAngle);
  const [movement, setMovement] = useState(initialMovement);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-dark-green border border-ultra-violet sm:border-0 w-full sm:max-w-2xl min-w-0 max-w-full box-border rounded-t-2xl sm:rounded-xl p-4 sm:p-5 flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="font-semibold text-saffron">Chọn góc máy &amp; chuyển động</h3>
          <button onClick={onClose} aria-label="Đóng" className="text-ultra-violet hover:text-saffron text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid gap-6 min-w-0">
          <div>
            <h4 className="text-sm font-semibold text-ultra-violet mb-2">20 Góc máy</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMERA_ANGLES.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAngle(a.key)}
                  className={`text-left px-3 py-2.5 sm:py-2 rounded-md text-sm min-w-0 ${
                    angle === a.key ? "bg-saffron text-dark-purple" : "bg-dark-purple"
                  }`}
                >
                  <div className="font-medium break-words">
                    {a.vi} <span className="opacity-60">({a.en})</span>
                  </div>
                  <div className="text-xs opacity-70 break-words">{a.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ultra-violet mb-2">6 Chuyển động máy</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMERA_MOVEMENTS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMovement(m.key)}
                  className={`text-left px-3 py-2.5 sm:py-2 rounded-md text-sm min-w-0 ${
                    movement === m.key ? "bg-saffron text-dark-purple" : "bg-dark-purple"
                  }`}
                >
                  <div className="font-medium break-words">
                    {m.vi} <span className="opacity-60">({m.en})</span>
                  </div>
                  <div className="text-xs opacity-70 break-words">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex justify-end gap-2 pt-4 shrink-0"
          style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
        >
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-dark-purple">
            Hủy
          </button>
          <button
            onClick={() => onConfirm(angle, movement)}
            className="px-4 py-2 rounded-md bg-hunter-green font-semibold"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
