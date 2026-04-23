"use client";

import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-x-5 z-[90] top-1/2 -translate-y-1/2 bg-card rounded-3xl p-6 shadow-2xl border border-border">
        <p className="text-base font-black tracking-tight mb-1">{title}</p>
        {message && (
          <p className="text-sm text-muted-foreground mb-6">{message}</p>
        )}
        {!message && <div className="mb-6" />}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-11 rounded-2xl bg-card-raised text-sm font-black tracking-widest uppercase disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-11 rounded-2xl text-sm font-black tracking-widest uppercase text-white flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "#E05252" }}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
