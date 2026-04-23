import { useMemo } from "react";
import type { Transaction, MonthlyStats, CategoryStats, DashboardSummary } from "@/types";
import { currentMonth } from "@/lib/utils";

/**
 * Derives dashboard stats from raw transactions.
 * All amounts operate on integer centavos to avoid floating-point errors.
 */
export function useFinancials(transactions: Transaction[]) {
  const thisMonth = currentMonth();

  const summary = useMemo<DashboardSummary>(() => {
    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let cardDebt = 0;

    for (const tx of transactions) {
      const amount = tx.amount;
      if (tx.type === "income") {
        totalBalance += amount;
        if (tx.date.startsWith(thisMonth)) monthlyIncome += amount;
      } else if (tx.card_id) {
        cardDebt += amount;
      } else {
        totalBalance -= amount;
        if (tx.date.startsWith(thisMonth)) monthlyExpenses += amount;
      }
    }

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance: monthlyIncome - monthlyExpenses,
      saved: Math.max(monthlyIncome - monthlyExpenses, 0),
      cardDebt,
    };
  }, [transactions, thisMonth]);

  const monthlyStats = useMemo<MonthlyStats[]>(() => {
    const map = new Map<string, { income: number; expenses: number }>();
    for (const tx of transactions) {
      const month = tx.date.slice(0, 7);
      const entry = map.get(month) ?? { income: 0, expenses: 0 };
      if (tx.type === "income") entry.income += tx.amount;
      else entry.expenses += tx.amount;
      map.set(month, entry);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, { income, expenses }]) => ({
        month,
        income,
        expenses,
        balance: income - expenses,
      }));
  }, [transactions]);

  const categoryStats = useMemo<CategoryStats[]>(() => {
    const map = new Map<string, { name: string; color: string; total: number }>();
    let grandTotal = 0;
    for (const tx of transactions) {
      if (tx.type !== "expense" || !tx.date.startsWith(thisMonth)) continue;
      const key = tx.category_id;
      const entry = map.get(key) ?? {
        name: tx.category?.name ?? key,
        color: tx.category?.color ?? "#64748b",
        total: 0,
      };
      entry.total += tx.amount;
      grandTotal += tx.amount;
      map.set(key, entry);
    }
    return Array.from(map.entries()).map(([id, { name, color, total }]) => ({
      category_id: id,
      category_name: name,
      color,
      total,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }));
  }, [transactions, thisMonth]);

  return { summary, monthlyStats, categoryStats };
}
