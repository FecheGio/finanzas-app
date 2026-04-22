"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTransactions, getCategories, groupByDate } from "@/lib/queries";
import { MiniStatCard } from "@/components/transactions/MiniStatCard";
import { FilterChips, type ChipItem } from "@/components/transactions/FilterChips";
import { TransactionGroup } from "@/components/transactions/TransactionItem";
import { TransactionBottomSheet } from "@/components/transactions/TransactionBottomSheet";
import type { Transaction, Category } from "@/types";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const thisMonth = new Date().toISOString().slice(0, 7);

  const load = useCallback(async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) { router.replace("/login"); return; }
    const [txs, cats] = await Promise.all([getTransactions(), getCategories()]);
    setTransactions(txs);
    setCategories(cats);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => { load(); };
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [load]);

  // Chips dinámicos: TODOS + INGRESOS + GASTOS + categorías del usuario
  const chips: ChipItem[] = [
    { label: "TODOS", value: "all" },
    { label: "INGRESOS", value: "income" },
    { label: "GASTOS", value: "expense" },
    ...categories.map((c) => ({ label: c.name.toUpperCase(), value: c.id })),
  ];

  // Filtrado real
  const filtered = transactions.filter((tx) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "income") return tx.type === "income";
    if (activeFilter === "expense") return tx.type === "expense";
    return tx.category_id === activeFilter;
  });

  const monthlyIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(thisMonth))
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(thisMonth))
    .reduce((s, t) => s + t.amount, 0);

  const groups = groupByDate(filtered);

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
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-lime" />
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-muted-foreground">
            Actividad
          </span>
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight leading-none mb-1">
          Transacciones
        </h1>
        <p className="text-sm text-muted-foreground">Cada peso que entra y sale</p>
      </div>

      {/* Mini stat cards */}
      <div className="flex gap-3 px-5 mb-5">
        <MiniStatCard label="INGRESOS" centavos={monthlyIncome}   trend={0} sparkline={[1,2,1,3,2,3,monthlyIncome / 10000]} />
        <MiniStatCard label="GASTOS"   centavos={monthlyExpenses} trend={0} sparkline={[1,2,2,3,2,4,monthlyExpenses / 10000]} />
      </div>

      {/* Filter chips */}
      <div className="px-5 mb-5">
        <FilterChips chips={chips} value={activeFilter} onChange={setActiveFilter} />
      </div>

      {/* Transaction groups */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-5">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-sm font-bold text-foreground mb-1">Sin transacciones</p>
          <p className="text-xs text-muted-foreground">Tocá el + para agregar la primera</p>
        </div>
      ) : (
        <div className="px-1 pb-32">
          {groups.map((g) => (
            <TransactionGroup
              key={g.dateLabel}
              dateLabel={g.dateLabel}
              transactions={g.transactions}
              onTap={setSelectedTx}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/transactions/new"
        className="fixed bottom-20 right-5 z-40 h-14 w-14 rounded-full bg-lime flex items-center justify-center md:bottom-6"
        style={{ boxShadow: "0 0 20px 4px rgba(174,234,0,0.35)" }}
      >
        <Plus className="h-7 w-7 text-lime-foreground" />
      </Link>

      {/* Bottom sheet */}
      <TransactionBottomSheet
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onDeleted={load}
      />
    </div>
  );
}
