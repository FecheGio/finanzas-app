"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getTransactions, computeSummary } from "@/lib/queries";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { SpendingBarChart } from "@/components/dashboard/SpendingBarChart";
import type { Transaction, DashboardSummary } from "@/types";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

const EMPTY: DashboardSummary = {
  totalBalance: 0, monthlyIncome: 0, monthlyExpenses: 0, monthlyBalance: 0, saved: 0,
};

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("...");
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      const email = session.user.email ?? "";
      setUserName(email.split("@")[0]);

      getTransactions()
        .then((txs: Transaction[]) => {
          setTransactions(txs);
          setSummary(computeSummary(txs));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [router]);

  // Refrescar al volver de agregar una transacción
  useEffect(() => {
    const handler = () => {
      getTransactions().then((txs) => {
        setTransactions(txs);
        setSummary(computeSummary(txs));
      }).catch(console.error);
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

  const monthLabel = new Date()
    .toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    .toUpperCase();

  return (
    <div className="min-h-screen relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <span className="text-xs font-black tracking-[0.25em] uppercase text-muted-foreground">M—01</span>
        <div className="flex items-center gap-2 bg-card-raised rounded-full px-3 py-1.5">
          <span className="text-xs font-bold">{userName}</span>
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[10px] font-black text-white">{userName[0]?.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="px-5 pt-4 pb-6">
        <p className="text-sm text-muted-foreground mb-1">{greeting()}</p>
        <h1 className="text-4xl font-black uppercase leading-none tracking-tight">
          Tu balance<br />total
        </h1>
      </div>

      {/* Balance card */}
      <div className="px-5 mb-6">
        <BalanceCard
          totalCentavos={summary.totalBalance}
          incomeCentavos={summary.monthlyIncome}
          expensesCentavos={summary.monthlyExpenses}
          savedCentavos={summary.saved}
          month={monthLabel}
        />
      </div>

      {/* Spending chart — datos reales */}
      <div className="bg-card rounded-3xl mx-5 pt-5 pb-4 mb-6">
        <SpendingBarChart transactions={transactions} />
      </div>

      {/* FAB */}
      <Link
        href="/transactions/new"
        className="fixed bottom-20 right-5 z-50 h-14 w-14 rounded-full bg-lime flex items-center justify-center md:bottom-6"
        style={{ boxShadow: "0 0 20px 4px rgba(174,234,0,0.35)" }}
      >
        <Plus className="h-7 w-7 text-lime-foreground" />
      </Link>
    </div>
  );
}
