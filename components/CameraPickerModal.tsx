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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-dark-green rounded-xl p-5 w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-saffron">Chọn góc máy &amp; chuyển động</h3>
          <button onClick={onClose} className="text-ultra-violet hover:text-saffron">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid gap-6">
          <div>
            <h4 className="text-sm font-semibold text-ultra-violet mb-2">20 Góc máy</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMERA_ANGLES.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setAngle(a.key)}
                  className={`text-left px-3 py-2 rounded-md text-sm ${
                    angle === a.key ? "bg-saffron text-dark-purple" : "bg-dark-purple"
                  }`}
                >
                  <div className="font-medium">
                    {a.vi} <span className="opacity-60">({a.en})</span>
                  </div>
                  <div className="text-xs opacity-70">{a.desc}</div>
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
                  className={`text-left px-3 py-2 rounded-md text-sm ${
                    movement === m.key ? "bg-saffron text-dark-purple" : "bg-dark-purple"
                  }`}
                >
                  <div className="font-medium">
                    {m.vi} <span className="opacity-60">({m.en})</span>
                  </div>
                  <div className="text-xs opacity-70">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
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
