"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { deleteTransaction } from "@/lib/queries";
import { formatARS } from "@/lib/utils";
import type { Transaction } from "@/types";

type AnyIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
type IconLib = Record<string, AnyIcon>;

function DynIcon({ name, ...props }: { name: string; className?: string; style?: React.CSSProperties }) {
  const pascal = name.split(/[-_]/).map((s) => s[0].toUpperCase() + s.slice(1)).join("");
  const Icon = (LucideIcons as unknown as IconLib)[pascal] ?? LucideIcons.CircleDollarSign;
  return <Icon {...props} />;
}

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function TransactionBottomSheet({ transaction, onClose, onDeleted }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setConfirming(false);
      setDeleting(false);
    }
  }, [transaction]);

  if (!transaction) return null;

  const { id, type, amount, description, date, category, is_subscription } = transaction;
  const editPath = is_subscription ? `/subscriptions/${id}` : `/transactions/${id}`;
  const isIncome = type === "income";
  const color = category?.color ?? (isIncome ? "#22C55E" : "#E05252");

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTransaction(id);
      onDeleted();
      onClose();
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl px-5 pt-4 pb-10 shadow-2xl">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-5" />

        {/* Transaction preview */}
        <div className="flex items-center gap-3 mb-6 bg-card-raised rounded-2xl p-4">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${color}22` }}
          >
            <DynIcon
              name={category?.icon ?? "circle-dollar-sign"}
              className="h-5 w-5"
              style={{ color }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{description}</p>
            <p className="text-xs text-muted-foreground">
              {category?.name} · {date}
            </p>
          </div>
          <p
            className="font-black tabular-nums text-lg shrink-0"
            style={{ color: isIncome ? "#22C55E" : "#E05252" }}
          >
            {isIncome ? "+" : "-"}{formatARS(amount)}
          </p>
        </div>

        {!confirming ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { onClose(); router.push(editPath); }}
              className="w-full h-12 rounded-2xl bg-card-raised flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase text-red-400"
              style={{ background: "rgba(224,82,82,0.12)" }}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        ) : (
          <div>
            <p className="text-center text-sm font-bold mb-1">¿Eliminar esta transacción?</p>
            <p className="text-center text-xs text-muted-foreground mb-5">Esta acción no se puede deshacer</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 h-12 rounded-2xl bg-card-raised text-sm font-black tracking-widest uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-12 rounded-2xl text-sm font-black tracking-widest uppercase text-white disabled:opacity-60"
                style={{ background: "#E05252" }}
              >
                {deleting ? "Eliminando…" : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
