"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Settings2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getTransactions, getBudgets, getCategories } from "@/lib/queries";
import { BudgetCircle } from "@/components/budget/BudgetCircle";
import { CategoryBudgetBar } from "@/components/budget/CategoryBudgetBar";
import { BudgetEditModal } from "@/components/budget/BudgetEditModal";
import { cn } from "@/lib/utils";
import type { Transaction, Budget, Category } from "@/types";

type Tab = "MONTHLY" | "YEARLY";

export default function BudgetPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("MONTHLY");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const thisMonth = new Date().toISOString().slice(0, 7);

  const load = useCallback(async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) { router.replace("/login"); return; }
    const [txs, bdgts, cats] = await Promise.all([
      getTransactions(500),
      getBudgets(thisMonth),
      getCategories(),
    ]);
    setTransactions(txs);
    setBudgets(bdgts);
    setExpenseCategories(cats.filter((c) => c.type === "expense"));
    setLoading(false);
  }, [router, thisMonth]);

  useEffect(() => { load(); }, [load]);

  const monthlyExpenses = transactions.filter(
    (t) => t.type === "expense" && t.date.startsWith(thisMonth)
  );

  // Spent per category this month
  const spentByCategory = new Map<string, number>();
  for (const tx of monthlyExpenses) {
    spentByCategory.set(tx.category_id, (spentByCategory.get(tx.category_id) ?? 0) + tx.amount);
  }

  // Category rows: only categories with a budget set
  const categoryRows = budgets
    .map((b) => ({
      id: b.id,
      categoryId: b.category_id,
      name: b.category?.name ?? "",
      icon: b.category?.icon ?? "circle-dollar-sign",
      color: b.category?.color ?? "#64748b",
      budgetCentavos: b.amount,
      spentCentavos: spentByCategory.get(b.category_id) ?? 0,
    }))
    .sort((a, b) => b.spentCentavos - a.spentCentavos);

  const budgetTotal = budgets.reduce((s, b) => s + b.amount, 0);
  const spentTotal = monthlyExpenses.reduce((s, t) => s + t.amount, 0);
  const leftTotal = Math.max(budgetTotal - spentTotal, 0);
  const pct = budgetTotal > 0 ? Math.round((spentTotal / budgetTotal) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="px-5 pt-6 pb-6 flex items-start justify-between">
        <h1 className="text-4xl font-black uppercase leading-none tracking-tight">
          <span className="text-muted-foreground">Your M—{new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1}</span>
          <br />Budget
        </h1>
        <button
          onClick={() => setEditOpen(true)}
          className="h-9 w-9 rounded-full bg-card-raised flex items-center justify-center mt-1"
          title="Configurar presupuesto"
        >
          <Settings2 className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex mx-5 mb-6 bg-card-raised rounded-full p-1">
        {(["MONTHLY", "YEARLY"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-full text-xs font-black tracking-widest transition-all",
              tab === t ? "bg-lime text-lime-foreground shadow" : "text-muted-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "MONTHLY" ? (
        <>
          {/* Budget circle */}
          <div className="px-5 mb-6">
            {budgetTotal === 0 ? (
              <div className="card-purple-gradient rounded-3xl p-8 text-white text-center">
                <p className="text-sm font-bold text-white/70 mb-2">Sin presupuesto configurado</p>
                <p className="text-xs text-white/50 mb-5">
                  Definí límites por categoría para ver tu progreso
                </p>
                <button
                  onClick={() => setEditOpen(true)}
                  className="px-6 py-2.5 rounded-full bg-lime text-lime-foreground text-xs font-black tracking-widest"
                >
                  CONFIGURAR
                </button>
              </div>
            ) : (
              <BudgetCircle
                percentage={pct}
                spentCentavos={spentTotal}
                budgetCentavos={budgetTotal}
                leftCentavos={leftTotal}
              />
            )}
          </div>

          {/* Categories */}
          <div className="px-5 pb-28">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black tracking-[0.2em] uppercase">Por categoría</span>
            </div>

            {categoryRows.length === 0 ? (
              <div className="bg-card-raised rounded-2xl px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground mb-1">Sin categorías con presupuesto</p>
                <button
                  onClick={() => setEditOpen(true)}
                  className="text-xs text-lime font-bold mt-2"
                >
                  Configurar límites →
                </button>
              </div>
            ) : (
              <div className="bg-card-raised rounded-2xl divide-y divide-border px-4">
                {categoryRows.map((cat) => (
                  <CategoryBudgetBar
                    key={cat.id}
                    name={cat.name}
                    icon={cat.icon}
                    color={cat.color}
                    spentCentavos={cat.spentCentavos}
                    budgetCentavos={cat.budgetCentavos}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="px-5 pb-28 flex items-center justify-center min-h-[40vh]">
          <p className="text-sm text-muted-foreground">Resumen anual próximamente</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => router.push("/transactions/new")}
        className="fixed bottom-20 right-5 z-40 h-14 w-14 rounded-full bg-lime flex items-center justify-center md:bottom-6"
        style={{ boxShadow: "0 0 20px 4px rgba(174,234,0,0.35)" }}
      >
        <Plus className="h-7 w-7 text-lime-foreground" />
      </button>

      {/* Budget edit modal */}
      <BudgetEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        categories={expenseCategories}
        budgets={budgets}
        month={thisMonth}
        onSaved={load}
      />
    </div>
  );
}
