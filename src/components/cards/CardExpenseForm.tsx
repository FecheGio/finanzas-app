"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, RefreshCw } from "lucide-react";
import { getCards, getCategories, createTransaction } from "@/lib/queries";
import { toCentavos } from "@/lib/utils";
import { useDragScroll } from "@/hooks/useDragScroll";
import { EntityLogo } from "./AddCardModal";
import * as LucideIcons from "lucide-react";
import type { Card, Category } from "@/types";

type AnyIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
type IconLib = Record<string, AnyIcon>;

function DynIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const pascal = name.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  const Icon = (LucideIcons as unknown as IconLib)[pascal];
  if (!Icon) return <LucideIcons.CircleDollarSign className={className} style={style} />;
  return <Icon className={className} style={style} />;
}

const CUOTA_OPTIONS = [2, 3, 4, 6, 9, 12];
const ACCENT = "#E05252";

function computeStartMonth(dateStr: string, afterClosing: boolean): string {
  const [y, m] = dateStr.split("-").map(Number);
  if (!afterClosing) return `${y}-${String(m).padStart(2, "0")}`;
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

interface Props {
  defaultCardId?: string | null;
}

export function CardExpenseForm({ defaultCardId }: Props) {
  const router = useRouter();
  const [amountStr, setAmountStr] = useState("");
  const [cardId, setCardId] = useState<string | null>(defaultCardId ?? null);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSubscription, setIsSubscription] = useState(false);
  const [installments, setInstallments] = useState(0);
  const [afterClosing, setAfterClosing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const cardScrollRef = useDragScroll();

  useEffect(() => {
    Promise.all([getCards(), getCategories()])
      .then(([c, cats]) => {
        setCards(c);
        setCategories(cats.filter((cat) => cat.type === "expense"));
        if (!cardId && c.length > 0) setCardId(c[0].id);
      })
      .finally(() => setLoadingData(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const centavos = toCentavos(amountStr);
    if (centavos <= 0) { setError("Ingresá un monto válido"); return; }
    if (!cardId) { setError("Seleccioná una tarjeta"); return; }
    if (!categoryId) { setError("Seleccioná una categoría"); return; }
    if (!description.trim()) { setError("Agregá una descripción"); return; }

    setSaving(true);
    try {
      await createTransaction({
        amount: centavos,
        type: "expense",
        category_id: categoryId,
        description: description.trim(),
        date,
        card_id: cardId,
        installments: isSubscription ? 0 : installments,
        start_month: computeStartMonth(date, afterClosing),
        is_subscription: isSubscription,
      });
      router.push("/cards");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
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
          Monto (ARS)
        </label>
        <div className="relative inline-flex items-center">
          <span className="text-3xl font-black text-muted-foreground mr-1">$</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className="bg-transparent text-5xl font-black tabular-nums w-48 text-center focus:outline-none placeholder:text-muted-foreground/40"
            style={{ color: ACCENT }}
          />
        </div>
      </div>

      {/* Tarjeta */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          Tarjeta
        </label>
        <div ref={cardScrollRef} className="flex gap-2 overflow-x-auto pb-1 cursor-grab">
          {cards.map((card) => {
            const selected = cardId === card.id;
            return (
              <button key={card.id} type="button"
                onClick={() => setCardId(selected ? null : card.id)}
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
      </div>

      {/* Suscripción */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          Suscripción
        </label>
        <button type="button"
          onClick={() => { setIsSubscription(!isSubscription); setInstallments(0); }}
          className="w-full flex items-center justify-between rounded-2xl px-4 py-3 transition-all"
          style={{
            background: isSubscription ? "#22C55E22" : "hsl(var(--card-raised))",
            border: isSubscription ? "1.5px solid #22C55E66" : "1.5px solid transparent",
          }}
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="h-4 w-4" style={{ color: isSubscription ? "#22C55E" : "hsl(245 12% 50%)" }} />
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: isSubscription ? "#22C55E" : undefined }}>
                {isSubscription ? "Suscripción activa" : "No es suscripción"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isSubscription ? "Se cobra cada mes automáticamente" : "Pago único o en cuotas"}
              </p>
            </div>
          </div>
          <div className="h-6 w-11 rounded-full relative shrink-0"
            style={{ background: isSubscription ? "#22C55E" : "hsl(var(--border))" }}
          >
            <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
              style={{ left: isSubscription ? "calc(100% - 18px)" : "2px" }} />
          </div>
        </button>
      </div>

      {/* Cuotas (solo si no es suscripción) */}
      {!isSubscription && (
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
            Cuotas
          </label>
          <div className="flex gap-2 flex-wrap">
            {[0, ...CUOTA_OPTIONS].map((n) => {
              const sel = installments === n;
              return (
                <button key={n} type="button" onClick={() => setInstallments(n)}
                  className="px-3 py-2 rounded-xl text-xs font-black tracking-wide transition-all"
                  style={sel
                    ? { background: `${ACCENT}22`, color: ACCENT, border: `1.5px solid ${ACCENT}66` }
                    : { background: "hsl(var(--card-raised))", color: "hsl(245 12% 50%)", border: "1.5px solid transparent" }
                  }
                >
                  {n === 0 ? "Pago único" : `${n}x`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Antes / Después del cierre */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          ¿Cuándo fue la compra?
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

      {/* Categoría */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          Categoría
        </label>
        {categories.length === 0 ? (
          <div className="bg-card-raised rounded-2xl px-5 py-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Sin categorías de gastos</p>
            <a href="/categories/new" className="text-xs text-primary font-bold">Crear categoría →</a>
          </div>
        ) : (
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => {
            const selected = categoryId === cat.id;
            return (
              <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                className="relative flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition-all"
                style={{
                  background: selected ? `${cat.color}22` : "hsl(var(--card-raised))",
                  border: selected ? `1.5px solid ${cat.color}66` : "1.5px solid transparent",
                }}
              >
                <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: `${cat.color}33` }}>
                  <DynIcon name={cat.icon} className="h-4 w-4" style={{ color: cat.color }} />
                </div>
                <span className="text-[10px] font-bold leading-tight" style={{ color: selected ? cat.color : undefined }}>
                  {cat.name}
                </span>
                {selected && <Check className="absolute top-1.5 right-1.5 h-3 w-3" style={{ color: cat.color }} />}
              </button>
            );
          })}
        </div>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1.5">
          Descripción
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Netflix, Supermercado..."
          className="w-full bg-card-raised border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Fecha */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1.5">
          Fecha
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-card-raised border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 font-medium bg-red-400/10 rounded-xl px-4 py-2">{error}</p>
      )}

      <button type="submit" disabled={saving}
        className="w-full rounded-xl py-4 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        style={{ background: ACCENT, color: "#fff" }}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Guardar gasto
      </button>
    </form>
  );
}
