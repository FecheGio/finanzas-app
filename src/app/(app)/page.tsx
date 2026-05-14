"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTransactions, computeSummary, computeMonthlyStats } from "@/lib/queries";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { DebtCard } from "@/components/dashboard/DebtCard";
import { SpendingBarChart } from "@/components/dashboard/SpendingBarChart";
import { MonthlyBarChart } from "@/components/dashboard/MonthlyBarChart";
import { ExpensePieChart } from "@/components/dashboard/ExpensePieChart";
import { MonthPicker } from "@/components/ui/MonthPicker";
import type { Transaction, DashboardSummary } from "@/types";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

const EMPTY: DashboardSummary = {
  totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0, monthlyBalance: 0, saved: 0, cardTotalDebt: 0, cardDueThisMonth: 0,
};

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("...");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      const alias = session.user.user_metadata?.alias ?? session.user.email?.split("@")[0] ?? "Usuario";
      setUserName(alias);
      getTransactions()
        .then((txs: Transaction[]) => setTransactions(txs))
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [router]);

  useEffect(() => {
    const handler = () => {
      getTransactions().then(setTransactions).catch(console.error);
    };
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const summary = transactions.length > 0 ? computeSummary(transactions, selectedMonth) : EMPTY;
  const currentMonthISO = new Date().toISOString().slice(0, 7);
  const isCurrentMonth = selectedMonth === currentMonthISO;
  const monthLabel = new Date(selectedMonth + "-01T12:00:00")
    .toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    .toUpperCase();

  // Para meses pasados, el número principal es el balance neto del mes.
  // Para el mes actual, es el acumulado histórico (fondos disponibles reales).
  const mainBalance = isCurrentMonth ? summary.totalBalance : summary.monthlyBalance;
  const mainLabel = isCurrentMonth ? "Fondos disponibles" : "Balance del mes";

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <span className="text-xs font-black tracking-[0.25em] uppercase text-muted-foreground">M—01</span>
        <Link href="/settings" className="flex items-center gap-2 bg-card-raised rounded-full px-3 py-1.5 active:opacity-70 transition-opacity">
          <span className="text-xs font-bold">{userName}</span>
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[10px] font-black text-white">{userName[0]?.toUpperCase()}</span>
          </div>
        </Link>
      </div>

      <div className="px-5 pt-4 pb-4">
        <p className="text-sm text-muted-foreground mb-1">{greeting()}</p>
        <div className="flex items-end justify-between">
          <h1 className="text-4xl font-black uppercase leading-none tracking-tight">Tu balance<br />total</h1>
          <MonthPicker month={selectedMonth} onChange={setSelectedMonth} />
        </div>
      </div>

      <div className="px-5 mb-6">
        <BalanceCard totalCentavos={mainBalance} incomeCentavos={summary.monthlyIncome} expensesCentavos={summary.monthlyExpenses} savedCentavos={summary.saved} month={monthLabel} mainLabel={mainLabel} />
      </div>

      {summary.cardTotalDebt > 0 && (
        <div className="px-5 mb-6">
          <DebtCard totalDebtCentavos={summary.cardTotalDebt} dueThisMonthCentavos={summary.cardDueThisMonth} month={monthLabel} />
        </div>
      )}

      <div className="bg-card rounded-3xl mx-5 pt-5 pb-4 mb-6">
        <SpendingBarChart transactions={transactions} month={selectedMonth} />
      </div>

      <div className="bg-card rounded-3xl mx-5 pt-5 pb-4 mb-6">
        <MonthlyBarChart stats={computeMonthlyStats(transactions)} />
      </div>

      <div className="px-5 mb-6">
        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-muted-foreground mb-3">
          Gastos por categoría — {monthLabel}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4">
            <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground mb-3">
              Efectivo / débito
            </p>
            <ExpensePieChart transactions={transactions} mode="cash" month={selectedMonth} />
          </div>
          <div className="bg-card rounded-2xl p-4">
            <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground mb-3">
              Tarjetas
            </p>
            <ExpensePieChart transactions={transactions} mode="card" month={selectedMonth} />
          </div>
        </div>
      </div>

      <Link href="/transactions/new" className="fixed bottom-20 right-5 z-50 h-14 w-14 rounded-full bg-lime flex items-center justify-center md:bottom-6" style={{ boxShadow: "0 0 20px 4px rgba(174,234,0,0.35)" }}>
        <Plus className="h-7 w-7 text-lime-foreground" />
      </Link>
    </div>
  );
}
