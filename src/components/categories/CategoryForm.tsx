"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { createCategory, updateCategory } from "@/lib/queries";
import type { Category, TransactionType } from "@/types";

// ── Íconos disponibles ────────────────────────────────────────
const ICONS: { name: string; label: string }[] = [
  // Ingresos
  { name: "briefcase",      label: "Trabajo" },
  { name: "music",          label: "Royalties" },
  { name: "laptop",         label: "Laptop" },
  { name: "trending-up",    label: "Inversión" },
  { name: "landmark",       label: "Banco" },
  { name: "gift",           label: "Regalo" },
  { name: "building-2",     label: "Empresa" },
  { name: "hand-coins",     label: "Dividendos" },
  // Gastos
  { name: "home",           label: "Vivienda" },
  { name: "utensils",       label: "Comida" },
  { name: "car",            label: "Auto" },
  { name: "heart-pulse",    label: "Salud" },
  { name: "cpu",            label: "Tech" },
  { name: "tv",             label: "Entret." },
  { name: "book-open",      label: "Educación" },
  { name: "plane",          label: "Viajes" },
  { name: "shirt",          label: "Ropa" },
  { name: "dumbbell",       label: "Gym" },
  { name: "zap",            label: "Servicios" },
  { name: "wifi",           label: "Internet" },
  { name: "shopping-bag",   label: "Compras" },
  { name: "shopping-cart",  label: "Super" },
  { name: "coffee",         label: "Café" },
  { name: "pill",           label: "Farmacia" },
  { name: "paw-print",      label: "Mascotas" },
  { name: "baby",           label: "Bebé" },
  { name: "wrench",         label: "Arreglos" },
  { name: "bus",            label: "Transporte" },
  { name: "fuel",           label: "Nafta" },
  { name: "circle-dollar-sign", label: "Otro" },
];

// ── Colores disponibles ───────────────────────────────────────
const COLORS = [
  "#10b981", "#22c55e", "#84cc16",
  "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#06b6d4",
  "#64748b", "#ffffff",
];

// ── DynIcon ───────────────────────────────────────────────────
type AnyIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

function DynIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const pascal = name.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  const Icon = (LucideIcons as unknown as Record<string, AnyIcon>)[pascal];
  if (!Icon) return <LucideIcons.CircleDollarSign className={className} style={style} />;
  return <Icon className={className} style={style} />;
}

// ─────────────────────────────────────────────────────────────

interface CategoryFormProps {
  existing?: Category; // si viene, es edición
}

export function CategoryForm({ existing }: CategoryFormProps) {
  const router = useRouter();
  const [type, setType]     = useState<TransactionType>(existing?.type ?? "expense");
  const [name, setName]     = useState(existing?.name ?? "");
  const [icon, setIcon]     = useState(existing?.icon ?? "circle-dollar-sign");
  const [color, setColor]   = useState(existing?.color ?? "#6366f1");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Ingresá un nombre"); return; }

    setLoading(true);
    try {
      if (existing) {
        await updateCategory(existing.id, { name: name.trim(), icon, color });
      } else {
        await createCategory({ name: name.trim(), type, icon, color });
      }
      router.push("/categories");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">

      {/* ── Tipo (solo al crear) ────────────────────────── */}
      {!existing && (
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-2">
            Tipo
          </label>
          <div className="flex bg-card-raised rounded-2xl p-1 gap-1">
            {(["expense", "income"] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="flex-1 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all"
                style={
                  type === t
                    ? { background: t === "income" ? "#22C55E22" : "#E0525222", color: t === "income" ? "#22C55E" : "#E05252", border: `1.5px solid ${t === "income" ? "#22C55E44" : "#E0525244"}` }
                    : { color: "hsl(245 12% 50%)" }
                }
              >
                {t === "expense" ? "Gasto" : "Ingreso"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Nombre ─────────────────────────────────────── */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-2">
          Nombre
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Alimentación"
          className="w-full bg-card-raised border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* ── Preview ────────────────────────────────────── */}
      <div className="flex items-center gap-3 bg-card-raised rounded-2xl px-4 py-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
          <DynIcon name={icon} className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wide">{name || "Vista previa"}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{type === "income" ? "Ingreso" : "Gasto"}</p>
        </div>
      </div>

      {/* ── Color ──────────────────────────────────────── */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          Color
        </label>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
              style={{ background: c, border: color === c ? `2px solid white` : "2px solid transparent" }}
            >
              {color === c && <Check className="h-3.5 w-3.5 text-black/70" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Ícono ──────────────────────────────────────── */}
      <div>
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-3">
          Ícono
        </label>
        <div className="grid grid-cols-5 gap-2">
          {ICONS.map((ic) => {
            const selected = icon === ic.name;
            return (
              <button
                key={ic.name}
                type="button"
                onClick={() => setIcon(ic.name)}
                className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all"
                style={{
                  background: selected ? `${color}22` : "hsl(var(--card-raised))",
                  border: `1.5px solid ${selected ? color + "66" : "transparent"}`,
                }}
              >
                <DynIcon
                  name={ic.name}
                  className="h-5 w-5"
                  style={{ color: selected ? color : "hsl(245 12% 50%)" }}
                />
                <span className="text-[8px] font-bold text-center leading-tight" style={{ color: selected ? color : "hsl(245 12% 50%)" }}>
                  {ic.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────── */}
      {error && (
        <p className="text-xs text-expense font-medium bg-expense-muted rounded-xl px-4 py-2">{error}</p>
      )}

      {/* ── Submit ─────────────────────────────────────── */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary rounded-xl py-4 text-sm font-black tracking-widest uppercase text-white flex items-center justify-center gap-2 glow-primary disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {existing ? "Guardar cambios" : "Crear categoría"}
      </button>
    </form>
  );
}
