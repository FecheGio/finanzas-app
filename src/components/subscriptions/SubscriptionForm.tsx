"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getCards, getOrCreateSubscriptionCategory, createTransaction, updateTransaction } from "@/lib/queries";
import { toCentavos, formatAmountInput } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";
import { useDragScroll } from "@/hooks/useDragScroll";
import { EntityLogo } from "@/components/cards/AddCardModal";
import type { Card } from "@/types";

const ACCENT = "#22C55E";

function computeStartMonth(dateStr: string, afterClosing: boolean): string {
  const [y, m] = dateStr.split("-").map(Number);
  if (!afterClosing) return `${y}-${String(m).padStart(2, "0")}`;
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface InitialValues {
  amount: number;
  name: string;
  cardId: string | null;
  afterClosing: boolean;
  date: string;
}

interface SubscriptionFormProps {
  transactionId?: string;
  initialValues?: InitialValues;
}

export function SubscriptionForm({ transactionId, initialValues }: SubscriptionFormProps) {
  const router = useRouter();
  const isEdit = !!transactionId;
  const today = new Date().toISOString().slice(0, 10);

  const [amountStr, setAmountStr] = useState(
    initialValues ? formatAmountInput(initialValues.amount) : ""
  );
  const [name, setName] = useState(initialValues?.name ?? "");
  const [cardId, setCardId] = useState<string | null>(initialValues?.cardId ?? null);
  const [afterClosing, setAfterClosing] = useState(initialValues?.afterClosing ?? false);
  const [date] = useState(initialValues?.date ?? today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const cardScrollRef = useDragScroll();

  useEffect(() => {
    getCards()
      .then((c) => {
        setCards(c);
        if (!initialValues?.cardId && c.length > 0) setCardId(c[0].id);
      })
      .finally(() => setLoadingData(false));
  }, [initialValues?.cardId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const centavos = toCentavos(amountStr);
    if (centavos <= 0) { setError("Ingresá un monto válido"); return; }
    if (!name.trim()) { setError("Ingresá un nombre"); return; }
    if (!cardId) { setError("Seleccioná una tarjeta"); return; }

    setSaving(true);
    try {
      const categoryId = await getOrCreateSubscriptionCategory();
      const startMonth = computeStartMonth(date, afterClosing);

      if (isEdit) {
        showToast("Suscripción actualizada");
        await updateTransaction(transactionId, {
          amount: centavos,
          type: "expense",
          category_id: categoryId,
          description: name.trim(),
          date,
          card_id: cardId,
          installments: 0,
          start_month: startMonth,
          is_subscription: true,
        });
      } else {
        await createTransaction({
          amount: centavos,
          type: "expense",
          category_id: categoryId,
          description: name.trim(),
          date,
          card_id: cardId,
          installments: 0,
          start_month: startMonth,
          is_subscription: true,
        });
        showToast("Suscripción guardada");
      }
      router.push("/subscriptions");
      router.refresh();
    } catch (err) {
      console.error("Error al guardar suscripción:", err);
      setError((err as { message?: string })?.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Monto */}
      <div className="text-center">
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          Monto mensual (ARS)
        </label>
        <div className="flex items-center justify-center gap-1 w-full">
          <span className="text-3xl font-black text-muted-foreground shrink-0">$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="bg-transparent text-5xl font-black tabular-nums w-full max-w-xs text-center focus:outline-none placeholder:text-muted-foreground/40"
            style={{ color: ACCENT }}
          />
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1.5">
          Nombre
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Netflix, Spotify..."
          className="w-full bg-card-raised border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Tarjeta */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          Tarjeta
        </label>
        {cards.length === 0 ? (
          <div className="bg-card-raised rounded-2xl px-5 py-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Sin tarjetas</p>
            <a href="/cards" className="text-xs text-primary font-bold">Crear tarjeta →</a>
          </div>
        ) : (
          <div ref={cardScrollRef} className="flex gap-2 overflow-x-auto pb-1 cursor-grab">
            {cards.map((card) => {
              const selected = cardId === card.id;
              return (
                <button key={card.id} type="button"
                  onClick={() => setCardId(card.id)}
                  className="shrink-0 flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
                  style={{
                    background: selected ? `${card.color}22` : "hsl(var(--card-raised))",
                    border: selected ? `1.5px solid ${card.color}66` : "1.5px solid transparent",
                  }}
                >
                  <div className="scale-75"><EntityLogo entity={card.entity} /></div>
                  <span className="text-xs font-bold" style={{ color: selected ? card.color : undefined }}>{card.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Antes / Después del cierre */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          ¿Cuándo se cobra?
        </label>
        <div className="flex bg-card-raised rounded-2xl p-1 gap-1">
          {([false, true] as const).map((isAfter) => (
            <button key={String(isAfter)} type="button"
              onClick={() => setAfterClosing(isAfter)}
              className="flex-1 py-3 rounded-xl text-xs font-black tracking-wide uppercase transition-all"
              style={afterClosing === isAfter
                ? { background: `${ACCENT}22`, color: ACCENT, border: `1px solid ${ACCENT}44` }
                : { color: "hsl(245 12% 50%)" }
              }
            >
              {isAfter ? "Después del cierre" : "Antes del cierre"}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-1.5 px-1">
          Se contabiliza desde {computeStartMonth(date, afterClosing).replace("-", "/")}
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-400 font-medium bg-red-400/10 rounded-xl px-4 py-2">{error}</p>
      )}

      <button type="submit" disabled={saving}
        className="w-full rounded-xl py-4 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        style={{ background: ACCENT, color: "#fff" }}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isEdit ? "Guardar cambios" : "Guardar suscripción"}
      </button>
    </form>
  );
}
