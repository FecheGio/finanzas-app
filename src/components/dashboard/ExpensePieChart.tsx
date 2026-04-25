"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatARS } from "@/lib/utils";
import type { Transaction } from "@/types";
import { cardAmountDueInMonth } from "@/lib/queries";

interface Props {
  transactions: Transaction[];
  mode: "cash" | "card"; // cash = sin tarjeta, card = con tarjeta
  month: string; // YYYY-MM
}

export function ExpensePieChart({ transactions, mode, month }: Props) {
  // Agrupa por categoría y suma los montos del mes
  const map = new Map<string, { name: string; color: string; total: number }>();

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;

    const isCard = !!tx.card_id;
    if (mode === "cash" && isCard) continue;
    if (mode === "card" && !isCard) continue;

    const amount =
      mode === "card"
        ? cardAmountDueInMonth(tx, month)
        : tx.date.startsWith(month)
        ? tx.amount
        : 0;

    if (amount <= 0) continue;

    const key = tx.category_id;
    const entry = map.get(key) ?? {
      name: tx.category?.name ?? "Sin categoría",
      color: tx.category?.color ?? "#64748b",
      total: 0,
    };
    entry.total += amount;
    map.set(key, entry);
  }

  const data = Array.from(map.values()).sort((a, b) => b.total - a.total);
  const grandTotal = data.reduce((s, d) => s + d.total, 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <p className="text-xs text-muted-foreground">Sin gastos{mode === "card" ? " con tarjeta" : ""} este mes</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({ ...d, value: d.total }));

  return (
    <div>
      {/* Donut */}
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatARS(Number(value)), ""]}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                fontSize: "11px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="flex flex-col gap-1.5 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-[10px] text-muted-foreground truncate flex-1">{d.name}</span>
            <span className="text-[10px] font-black tabular-nums" style={{ color: d.color }}>
              {grandTotal > 0 ? Math.round((d.total / grandTotal) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
