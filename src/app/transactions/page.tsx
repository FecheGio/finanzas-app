"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTransactions, groupByDate } from "@/lib/queries";
import { MiniStatCard } from "@/components/transactions/MiniStatCard";
import { FilterChips } from "@/components/transactions/FilterChips";
import { TransactionGroup } from "@/components/transactions/TransactionItem";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      getTransactions()
        .then(setTransactions)
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [router]);

  // Refresh list when tab regains focus (after adding a transaction)
  useEffect(() => {
    const handler = () => {
      getTransactions().then(setTransactions).catch(console.error);
    };
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  const monthlyIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, t) => s + t.amount, 0);

  const groups = groupByDate(transactions);

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
        <FilterChips />
      </div>

      {/* Transaction groups */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-5">
          <p className="text-4xl mb-3">💸</p>
          <p className="text-sm font-bold text-foreground mb-1">Sin transacciones</p>
          <p className="text-xs text-muted-foreground">Tocá el + para agregar la primera</p>
        </div>
      ) : (
        <div className="px-1 pb-6">
          {groups.map((g) => (
            <TransactionGroup key={g.dateLabel} dateLabel={g.dateLabel} transactions={g.transactions} />
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
    </div>
  );
}
