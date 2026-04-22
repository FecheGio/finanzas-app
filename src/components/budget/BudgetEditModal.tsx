"use client";

import { useState, useEffect } from "react";
import { X, Save, Briefcase, Laptop, TrendingUp, PlusCircle, MinusCircle,
  Home, Utensils, Car, HeartPulse, Cpu, Tv, BookOpen, Music,
  CircleDollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { upsertBudget } from "@/lib/queries";
import type { Category, Budget } from "@/types";

const ICON_MAP: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  laptop: Laptop,
  "trending-up": TrendingUp,
  "plus-circle": PlusCircle,
  "minus-circle": MinusCircle,
  home: Home,
  utensils: Utensils,
  car: Car,
  "heart-pulse": HeartPulse,
  cpu: Cpu,
  tv: Tv,
  "book-open": BookOpen,
  music: Music,
  default: CircleDollarSign,
};

interface Props {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  budgets: Budget[];
  month: string;
  onSaved: () => void;
}

export function BudgetEditModal({ open, onClose, categories, budgets, month, onSaved }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(
        Object.fromEntries(
          categories.map((c) => {
            const b = budgets.find((b) => b.category_id === c.id);
            return [c.id, b ? String(Math.round(b.amount / 100)) : ""];
          })
        )
      );
    }
  }, [open, categories, budgets]);

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all(
        categories
          .filter((c) => values[c.id] && Number(values[c.id]) > 0)
          .map((c) =>
            upsertBudget({
              category_id: c.id,
              amount: Math.round(Number(values[c.id]) * 100),
              month,
            })
          )
      );
      onSaved();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border shrink-0">
        <div>
          <h2 className="text-lg font-black tracking-tight uppercase">Presupuesto</h2>
          <p className="text-xs text-muted-foreground tracking-widest">{month}</p>
        </div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-card-raised flex items-center justify-center"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-3">
          Ingresá el límite mensual por categoría en ARS
        </p>
        {categories.map((c) => {
          const Icon = ICON_MAP[c.icon] ?? ICON_MAP["default"];
          return (
            <div
              key={c.id}
              className="flex items-center gap-3 bg-card-raised rounded-2xl px-4 py-3"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${c.color}22` }}
              >
                <Icon className="h-4 w-4" style={{ color: c.color }} />
              </div>
              <span className="flex-1 text-sm font-bold truncate">{c.name}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground font-bold">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="Sin límite"
                  value={values[c.id] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [c.id]: e.target.value }))
                  }
                  className="w-28 bg-transparent text-right text-sm font-bold outline-none placeholder:text-muted-foreground/40 [color-scheme:dark]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="px-5 py-4 border-t border-border shrink-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-2xl bg-lime text-lime-foreground font-black tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ boxShadow: "0 0 16px 2px rgba(174,234,0,0.25)" }}
        >
          <Save className="h-4 w-4" />
          {saving ? "GUARDANDO..." : "GUARDAR PRESUPUESTO"}
        </button>
      </div>
    </div>
  );
}
