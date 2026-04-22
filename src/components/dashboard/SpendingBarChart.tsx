"use client";

import { useState } from "react";
import { BarChart, Bar, Cell, XAxis, LabelList, ResponsiveContainer } from "recharts";
import type { SpendingPeriod, SpendingDataPoint, Transaction } from "@/types";

// ── Helpers para computar datos reales ────────────────────────

const MONTH_NAMES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const DAY_NAMES   = ["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"];

function computeWeekly(transactions: Transaction[]): SpendingDataPoint[] {
  const today = new Date();
  const todayIdx = (today.getDay() + 6) % 7; // 0=Lun … 6=Dom

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - todayIdx);
  weekStart.setHours(0, 0, 0, 0);

  const map = new Map<number, number>();
  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    const d = new Date(tx.date + "T12:00:00");
    if (d < weekStart || d > today) continue;
    const idx = (d.getDay() + 6) % 7;
    map.set(idx, (map.get(idx) ?? 0) + tx.amount);
  }

  return DAY_NAMES.map((label, i) => ({
    label,
    amount: map.get(i) ?? 0,
    active: i === todayIdx,
  }));
}

function computeMonthly(transactions: Transaction[]): SpendingDataPoint[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const amount = transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(key))
      .reduce((s, t) => s + t.amount, 0);
    return { label: MONTH_NAMES[d.getMonth()], amount, active: i === 5 };
  });
}

function computeYearly(transactions: Transaction[]): SpendingDataPoint[] {
  const now = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const year = now.getFullYear() - (3 - i);
    const amount = transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(String(year)))
      .reduce((s, t) => s + t.amount, 0);
    return { label: String(year), amount, active: i === 3 };
  });
}

function shortARS(value: number): string {
  if (value === 0) return "";
  if (value >= 100_000_000) return `$${(value / 100_000_000).toFixed(1)}M`;
  if (value >= 100_000)     return `$${(value / 100_000).toFixed(0)}K`;
  return `$${(value / 100).toFixed(0)}`;
}

// ──────────────────────────────────────────────────────────────

interface SpendingBarChartProps {
  transactions: Transaction[];
}

export function SpendingBarChart({ transactions }: SpendingBarChartProps) {
  const [period, setPeriod] = useState<SpendingPeriod>("W");

  const data: SpendingDataPoint[] =
    period === "W" ? computeWeekly(transactions)
    : period === "M" ? computeMonthly(transactions)
    : computeYearly(transactions);

  const hasData = data.some((d) => d.amount > 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <span className="text-sm font-black tracking-widest uppercase">Gastos</span>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {(["W", "M", "Y"] as SpendingPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-bold tracking-widest transition-all ${
                period === p
                  ? "bg-lime text-lime-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Sin gastos en este período</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 0 }} barCategoryGap="25%">
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(245 12% 50%)", fontSize: 11, fontWeight: 600 }}
            />
            <Bar dataKey="amount" radius={[6, 6, 3, 3]} maxBarSize={36}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.active ? "hsl(263 82% 58%)" : "hsl(252 38% 16%)"}
                />
              ))}
              <LabelList
                dataKey="amount"
                position="top"
                formatter={(v: unknown) => shortARS(Number(v))}
                style={{ fill: "hsl(0 0% 70%)", fontSize: 10, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
