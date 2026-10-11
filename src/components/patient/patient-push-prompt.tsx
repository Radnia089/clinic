"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { cn } from "@/lib/utils";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type Status = "loading" | "unsupported" | "need_https" | "ready" | "on" | "denied";

export function PatientPushPrompt({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("tandis_push_dismissed") === "1") {
        setDismissed(true);
      }
    } catch {
      // ignore
    }

    async function init() {
      if (typeof window === "undefined") return;
      const secure =
        window.isSecureContext ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";
      if (!secure) {
        setStatus("need_https");
        return;
      }
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setStatus("denied");
        return;
      }

      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setStatus(sub ? "on" : "ready");
      } catch {
        setStatus("unsupported");
      }
    }

    void init();
  }, []);

  async function enable() {
    setBusy(true);
    setHint("");
    try {
      const cfgRes = await fetch("/api/patient-auth/push", { cache: "no-store" });
      if (cfgRes.status === 401) {
        setHint("برای فعال‌سازی ابتدا وارد شوید.");
        return;
      }
      const cfg = await cfgRes.json();
      if (!cfg.configured || !cfg.publicKey) {
        setHint("نوتیفیکیشن روی سرور هنوز پیکربندی نشده است.");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        setHint("اجازه نوتیفیکیشن داده نشد.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(cfg.publicKey),
      });
      const serialized = JSON.parse(JSON.stringify(sub)) as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      const saveRes = await fetch("/api/patient-auth/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serialized),
      });
      if (!saveRes.ok) {
        setHint("ذخیره اشتراک ناموفق بود. دوباره تلاش کنید.");
        return;
      }
      setStatus("on");
      setHint("نوتیفیکیشن فعال شد.");
    } catch {
      setHint("فعال‌سازی انجام نشد. مرورگر را بررسی کنید.");
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem("tandis_push_dismissed", "1");
    } catch {
      // ignore
    }
  }

  if (dismissed || status === "loading" || status === "on") return null;
  if (status === "unsupported") return null;

  return (
    <div
      className={cn(
        "rounded-2xl bg-[#E8F2EA] px-3 py-3 text-sm text-[#14352A] shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-brand">
          <BellRing className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold">نوتیفیکیشن صندوق پیام</p>
          <p className="mt-1 text-xs leading-6 text-[#1A2E26]/70">
            {status === "need_https"
              ? "برای نوتیف روی گوشی، سایت باید با HTTPS باز شود."
              : status === "denied"
                ? "اجازه نوتیفیکیشن در تنظیمات مرورگر بسته است."
                : "حتی وقتی اپ بسته است، پیام‌های کلینیک روی گوشی برایتان می‌آید."}
          </p>
          {hint ? (
            <p className="mt-1 text-xs font-bold text-brand">{hint}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {status === "ready" || status === "denied" ? (
              <button
                type="button"
                disabled={busy || status === "denied"}
                onClick={() => void enable()}
                className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
              >
                {busy ? "در حال فعال‌سازی…" : "فعال کردن"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full px-3 py-1.5 text-xs font-bold text-[#14352A]/55"
            >
              بعداً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
