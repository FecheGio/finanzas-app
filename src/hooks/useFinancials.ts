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
    const [cy, cm] = thisMonth.split("-").map(Number);
    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    let cardTotalDebt = 0;
    let cardDueThisMonth = 0;

    for (const tx of transactions) {
      const amount = tx.amount;
      if (tx.type === "income") {
        totalBalance += amount;
        if (tx.date.startsWith(thisMonth)) monthlyIncome += amount;
      } else if (tx.card_id) {
        const inst = tx.installments ?? 0;
        const sm = tx.start_month;
        const isSub = tx.category?.name === "Suscripción";
        if (isSub) {
          // Suscripción recurrente: se cuenta todos los meses desde start_month
          if (!sm) {
            cardDueThisMonth += amount; cardTotalDebt += amount;
          } else {
            const [sy, smm] = sm.split("-").map(Number);
            if ((cy - sy) * 12 + (cm - smm) >= 0) {
              cardDueThisMonth += amount; cardTotalDebt += amount;
            }
          }
        } else if (inst === 0) {
          if (sm) {
            const [sy, smm] = sm.split("-").map(Number);
            const diff = (cy - sy) * 12 + (cm - smm);
            if (diff === 0) { cardDueThisMonth += amount; cardTotalDebt += amount; }
            else if (diff < 0) { cardTotalDebt += amount; }
          } else { cardTotalDebt += amount; }
        } else {
          const cuotaValue = amount / inst;
          if (sm) {
            const [sy, smm] = sm.split("-").map(Number);
            const cuotaNum = (cy - sy) * 12 + (cm - smm) + 1;
            if (cuotaNum >= 1 && cuotaNum <= inst) {
              cardDueThisMonth += cuotaValue;
              cardTotalDebt += cuotaValue * (inst - cuotaNum + 1);
            } else if (cuotaNum < 1) { cardTotalDebt += amount; }
          } else { cardTotalDebt += amount; }
        }
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
      cardTotalDebt,
      cardDueThisMonth,
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
