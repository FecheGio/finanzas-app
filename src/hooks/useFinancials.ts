import { useMemo } from "react";
import type { Transaction, MonthlyStats, CategoryStats, DashboardSummary } from "@/types";
import { currentMonth } from "@/lib/utils";
import { computeSummary, computeMonthlyStats } from "@/lib/queries";

/**
 * Derives dashboard stats from raw transactions.
 * Uses computeSummary and computeMonthlyStats from queries.ts as single source of truth.
 */
export function useFinancials(transactions: Transaction[]) {
  const thisMonth = currentMonth();

  const summary = useMemo<DashboardSummary>(
    () => computeSummary(transactions),
    [transactions]
  );

  const monthlyStats = useMemo<MonthlyStats[]>(
    () => computeMonthlyStats(transactions),
    [transactions]
  );

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
