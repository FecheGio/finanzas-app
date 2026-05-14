"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

let _setToast: ((t: ToastMessage | null) => void) | null = null;
let _counter = 0;

export function showToast(message: string, type: ToastType = "success") {
  _setToast?.({ id: ++_counter, message, type });
}

export function ToastProvider() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    _setToast = setToast;
    return () => { _setToast = null; };
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismiss, 3000);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-sm font-bold max-w-[90vw] animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        background: isSuccess ? "rgba(34,197,94,0.15)" : "rgba(224,82,82,0.15)",
        border: `1px solid ${isSuccess ? "rgba(34,197,94,0.4)" : "rgba(224,82,82,0.4)"}`,
        color: isSuccess ? "#22C55E" : "#E05252",
        backdropFilter: "blur(12px)",
      }}
    >
      {isSuccess
        ? <CheckCircle className="h-4 w-4 shrink-0" />
        : <XCircle className="h-4 w-4 shrink-0" />}
      <span>{toast.message}</span>
      <button onClick={dismiss} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
