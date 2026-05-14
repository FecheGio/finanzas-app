"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, CreditCard, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCategories, getCards, createTransaction, updateTransaction } from "@/lib/queries";
import { toCentavos } from "@/lib/utils";
import { showToast } from "@/components/ui/Toast";
import type { Category, Card, TransactionType } from "@/types";
import * as LucideIcons from "lucide-react";
import { EntityLogo } from "@/components/cards/AddCardModal";
import { useDragScroll } from "@/hooks/useDragScroll";

type AnyIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
type IconLib = Record<string, AnyIcon>;

function DynIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const pascal = name.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  const Icon = (LucideIcons as unknown as IconLib)[pascal];
  if (!Icon) return <LucideIcons.CircleDollarSign className={className} style={style} />;
  return <Icon className={className} style={style} />;
}

interface InitialValues {
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  cardId?: string | null;
  installments?: number;
  startMonth?: string | null;
}

interface TransactionFormProps {
  transactionId?: string;
  initialValues?: InitialValues;
}

export function TransactionForm({ transactionId, initialValues }: TransactionFormProps) {
  const router = useRouter();
  const isEditing = Boolean(transactionId);
  const cardScrollRef = useDragScroll();

  const [type, setType] = useState<TransactionType>(initialValues?.type ?? "expense");
  const [amountStr, setAmountStr] = useState(initialValues ? (initialValues.amount / 100).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [date, setDate] = useState(initialValues?.date ?? new Date().toISOString().slice(0, 10));
  const [cardId, setCardId] = useState<string | null>(initialValues?.cardId ?? null);
  const [installments, setInstallments] = useState<number>(initialValues?.installments ?? 0);
  const [afterClosing, setAfterClosing] = useState<boolean>(() => {
    if (!initialValues?.startMonth || !initialValues?.date) return false;
    return initialValues.startMonth !== initialValues.date.slice(0, 7);
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getCategories(),
      getCards(),
    ]).then(([cats, cds]) => {
      setCategories(cats);
      setCards(cds);
    }).catch(() => setError("No se pudieron cargar los datos"))
      .finally(() => setLoadingCats(false));
  }, []);

  const filteredCategories = categories.filter((c) => c.type === type);

  function computeStartMonth(dateStr: string, isAfterClosing: boolean): string {
    const [y, m] = dateStr.split("-").map(Number);
    if (!isAfterClosing) return `${y}-${String(m).padStart(2, "0")}`;
    const d = new Date(y, m, 1); // month is 0-indexed so m = next month
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const centavos = toCentavos(amountStr);
    if (centavos <= 0) { setError("Ingresá un monto válido"); return; }
    if (!categoryId) { setError("Seleccioná una categoría"); return; }
    if (!description.trim()) { setError("Agregá una descripción"); return; }

    setLoading(true);
    try {
      const hasCard = type === "expense" && cardId;
      const payload = {
        amount: centavos,
        type,
        category_id: categoryId,
        description: description.trim(),
        date,
        card_id: type === "expense" ? cardId : null,
        installments: hasCard ? installments : 0,
        start_month: hasCard ? computeStartMonth(date, afterClosing) : null,
      };
      if (isEditing && transactionId) {
        await updateTransaction(transactionId, payload);
        showToast("Transacción actualizada");
      } else {
        await createTransaction(payload);
        showToast("Transacción guardada");
      }
      router.push("/transactions");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  const isIncome = type === "income";
  const accentColor = isIncome ? "#22C55E" : "#E05252";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* ── Type toggle ───────────────────────────────── */}
      <div className="flex bg-card-raised rounded-2xl p-1 gap-1">
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategoryId(""); if (t === "income") setCardId(null); }}
            className="flex-1 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all"
            style={
              type === t
                ? { background: t === "income" ? "#22C55E22" : "#E0525222", color: t === "income" ? "#22C55E" : "#E05252", border: `1px solid ${t === "income" ? "#22C55E44" : "#E0525244"}` }
                : { color: "hsl(245 12% 50%)" }
            }
          >
            {t === "expense" ? "Gasto" : "Ingreso"}
          </button>
        ))}
      </div>

      {/* ── Amount input ──────────────────────────────── */}
      <div className="text-center">
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          Monto (ARS)
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
            style={{ color: accentColor }}
          />
        </div>
      </div>

      {/* ── Category selector ─────────────────────────── */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          Categoria
        </label>
        {loadingCats ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-card-raised rounded-2xl px-5 py-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Sin categorías de {type === "expense" ? "gastos" : "ingresos"}
            </p>
            <a href="/categories/new" className="text-xs text-primary font-bold">
              Crear categoría →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filteredCategories.map((cat) => {
              const selected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
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

      {/* ── Card selector (solo gastos) ───────────────── */}
      {type === "expense" && cards.length > 0 && (
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
            Tarjeta <span className="text-muted-foreground/50">(opcional)</span>
          </label>
          <div ref={cardScrollRef} className="flex gap-2 overflow-x-auto pb-1 cursor-grab">
            {cards.map((card) => {
              const selected = cardId === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setCardId(selected ? null : card.id)}
                  className="shrink-0 flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
                  style={{
                    background: selected ? `${card.color}22` : "hsl(var(--card-raised))",
                    border: selected ? `1.5px solid ${card.color}66` : "1.5px solid transparent",
                  }}
                >
                  <div className="scale-75">
                    <EntityLogo entity={card.entity} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: selected ? card.color : undefined }}>
                    {card.name}
                  </span>
                  {selected && <X className="h-3 w-3" style={{ color: card.color }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Cuotas (solo cuando hay tarjeta seleccionada) ─ */}
      {type === "expense" && cardId && (
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
            Cuotas
          </label>
          <div className="flex gap-2 flex-wrap">
            {[0, 2, 3, 4, 6, 9, 12].map((n) => {
              const sel = installments === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setInstallments(n)}
                  className="px-3 py-2 rounded-xl text-xs font-black tracking-wide transition-all"
                  style={
                    sel
                      ? { background: `${accentColor}22`, color: accentColor, border: `1.5px solid ${accentColor}66` }
                      : { background: "hsl(var(--card-raised))", color: "hsl(245 12% 50%)", border: "1.5px solid transparent" }
                  }
                >
                  {n === 0 ? "Pago único" : `${n}x`}
                </button>
              );
            })}
          </div>

          <div className="mt-3">
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">
                ¿Cuándo fue la compra?
              </p>
              <div className="flex bg-card-raised rounded-xl p-1 gap-1">
                {([false, true] as const).map((isAfter) => (
                  <button
                    key={String(isAfter)}
                    type="button"
                    onClick={() => setAfterClosing(isAfter)}
                    className="flex-1 py-2 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all"
                    style={
                      afterClosing === isAfter
                        ? { background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44` }
                        : { color: "hsl(245 12% 50%)" }
                    }
                  >
                    {isAfter ? "Después del cierre" : "Antes del cierre"}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1.5 px-1">
                {afterClosing
                  ? `Se contabiliza desde ${computeStartMonth(date, true).replace("-", "/")}`
                  : `Se contabiliza desde ${computeStartMonth(date, false).replace("-", "/")}`}
              </p>
            </div>
        </div>
      )}

      {/* ── Description ───────────────────────────────── */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1.5">
          Descripcion
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Supermercado Jumbo"
          className="w-full bg-card-raised border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* ── Date ──────────────────────────────────────── */}
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

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-4 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        style={{ background: accentColor, color: "#fff" }}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isEditing ? "Guardar cambios" : `Guardar ${isIncome ? "Ingreso" : "Gasto"}`}
      </button>
    </form>
  );
}
