"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import { deleteTransaction } from "@/lib/queries";
import { formatARS } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";
import { EntityLogo } from "@/components/cards/AddCardModal";
import type { Transaction } from "@/types";

interface Props {
  subscription: Transaction | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function SubscriptionBottomSheet({ subscription, onClose, onDeleted }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (subscription) {
      setConfirming(false);
      setDeleting(false);
    }
  }, [subscription]);

  if (!subscription) return null;

  const { id, amount, description, card } = subscription;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTransaction(id);
      showToast("Suscripción eliminada");
      onDeleted();
      onClose();
    } catch (e) {
      console.error(e);
      showToast("Error al eliminar", "error");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl px-5 pt-4 pb-10 shadow-2xl">
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-5" />

        {/* Preview */}
        <div className="flex items-center gap-3 mb-6 bg-card-raised rounded-2xl p-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{description}</p>
            {card && (
              <div className="flex items-center gap-1 mt-0.5">
                <div className="scale-[0.6] origin-left">
                  <EntityLogo entity={card.entity} />
                </div>
                <span className="text-xs text-muted-foreground font-semibold">{card.name}</span>
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="font-black tabular-nums text-lg text-primary">{formatARS(amount)}</p>
            <p className="text-[10px] text-muted-foreground">/mes</p>
          </div>
        </div>

        {!confirming ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { onClose(); router.push(`/subscriptions/${id}`); }}
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
            <p className="text-center text-sm font-bold mb-1">¿Eliminar esta suscripción?</p>
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
