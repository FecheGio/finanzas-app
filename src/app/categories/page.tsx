"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCategories, deleteCategory } from "@/lib/queries";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Category } from "@/types";

type AnyIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
function DynIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const pascal = name.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  const Icon = (LucideIcons as unknown as Record<string, AnyIcon>)[pascal];
  if (!Icon) return <LucideIcons.CircleDollarSign className={className} style={style} />;
  return <Icon className={className} style={style} />;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const load = () =>
    getCategories().then(setCategories).catch(console.error).finally(() => setLoading(false));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      load();
    });
  }, [router]);

  async function handleConfirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setErrorMsg("");
    try {
      await deleteCategory(toDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== toDelete.id));
      setToDelete(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "No se pudo eliminar");
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const income  = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-4xl font-black uppercase leading-none tracking-tight mb-1">
          Categorías
        </h1>
        <p className="text-sm text-muted-foreground">
          {categories.length} {categories.length === 1 ? "categoría" : "categorías"}
        </p>
      </div>

      <div className="px-5 space-y-6">
        {categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-3">🏷️</p>
            <p className="text-sm font-bold mb-1">Sin categorías</p>
            <p className="text-xs text-muted-foreground">Tocá el + para crear la primera</p>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-red-400 bg-red-400/10 rounded-xl px-4 py-2">{errorMsg}</p>
        )}

        {income.length > 0 && (
          <Section title="Ingresos" color="#22C55E" categories={income} onDelete={setToDelete} />
        )}

        {expense.length > 0 && (
          <Section title="Gastos" color="#E05252" categories={expense} onDelete={setToDelete} />
        )}
      </div>

      {/* FAB */}
      <Link
        href="/categories/new"
        className="fixed bottom-20 right-5 z-40 h-14 w-14 rounded-full bg-lime flex items-center justify-center md:bottom-6"
        style={{ boxShadow: "0 0 20px 4px rgba(174,234,0,0.35)" }}
      >
        <Plus className="h-7 w-7 text-lime-foreground" />
      </Link>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!toDelete}
        title={`¿Eliminar "${toDelete?.name}"?`}
        message="Las transacciones con esta categoría no podrán eliminarse si están asociadas."
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function Section({
  title, color, categories, onDelete,
}: {
  title: string;
  color: string;
  categories: Category[];
  onDelete: (c: Category) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="bg-card-raised rounded-2xl divide-y divide-border">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 px-4 py-3.5">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${cat.color}22` }}
            >
              <DynIcon name={cat.icon} className="h-5 w-5" style={{ color: cat.color }} />
            </div>
            <span className="flex-1 text-sm font-bold">{cat.name}</span>
            <Link
              href={`/categories/${cat.id}`}
              className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <button
              onClick={() => onDelete(cat)}
              className="h-8 w-8 rounded-xl bg-expense-muted flex items-center justify-center shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5 text-expense" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
