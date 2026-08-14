"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOSDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferredPrompt(null);
      setInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const standalone = installed || isStandaloneDisplay();
  const isIOS = isIOSDevice();

  if (standalone) return null;
  if (!deferredPrompt && !isIOS) return null;

  async function install() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSHint((v) => !v);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={install}
        className="text-sm px-3 py-1.5 rounded-md border border-ultra-violet text-ultra-violet hover:bg-ultra-violet hover:text-dark-purple transition-colors"
      >
        Cài đặt ứng dụng
      </button>
      {showIOSHint && (
        <div className="absolute right-0 top-full mt-1 w-64 rounded-md bg-dark-purple border border-ultra-violet shadow-lg z-50 p-3 text-xs text-saffron">
          Trên iOS: chạm biểu tượng Chia sẻ (⎋) trên Safari, rồi chọn &quot;Thêm vào MH chính&quot; (➕).
        </div>
      )}
    </div>
  );
}
