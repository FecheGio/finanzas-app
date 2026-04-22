"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCategories, createTransaction } from "@/lib/queries";
import { toCentavos } from "@/lib/utils";
import type { Category, TransactionType } from "@/types";
import * as LucideIcons from "lucide-react";

type AnyIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
type IconLib = Record<string, AnyIcon>;

// Dynamic Lucide icon by name
function DynIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const pascal = name
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  const Icon = (LucideIcons as unknown as IconLib)[pascal];
  if (!Icon) return <LucideIcons.CircleDollarSign className={className} style={style} />;
  return <Icon className={className} style={style} />;
}

export function TransactionForm() {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>("expense");
  const [amountStr, setAmountStr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError("No se pudieron cargar las categorías"))
      .finally(() => setLoadingCats(false));
  }, []);

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const centavos = toCentavos(amountStr);
    if (centavos <= 0) { setError("Ingresá un monto válido"); return; }
    if (!categoryId) { setError("Seleccioná una categoría"); return; }
    if (!description.trim()) { setError("Agregá una descripción"); return; }

    setLoading(true);
    try {
      await createTransaction({ amount: centavos, type, category_id: categoryId, description: description.trim(), date });
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
            onClick={() => { setType(t); setCategoryId(""); }}
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
            style={{ color: accentColor }}
          />
        </div>
      </div>

      {/* ── Category selector ─────────────────────────── */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          Categoría
        </label>
        {loadingCats ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
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
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${cat.color}33` }}
                  >
                    <DynIcon name={cat.icon} className="h-4 w-4" style={{ color: cat.color }} />
                  </div>
                  <span className="text-[10px] font-bold leading-tight" style={{ color: selected ? cat.color : undefined }}>
                    {cat.name}
                  </span>
                  {selected && (
                    <Check className="absolute top-1.5 right-1.5 h-3 w-3" style={{ color: cat.color }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Description ───────────────────────────────── */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1.5">
          Descripción
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

      {/* ── Error ─────────────────────────────────────── */}
      {error && (
        <p className="text-xs text-expense font-medium bg-expense-muted rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      {/* ── Submit ────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-4 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        style={{ background: accentColor, color: "#fff" }}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Guardar {isIncome ? "Ingreso" : "Gasto"}
      </button>
    </form>
  );
}
