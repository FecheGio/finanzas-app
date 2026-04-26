"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonthlyStats } from "@/types";
import { formatARS } from "@/lib/utils";

const MONTH_NAMES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const INCOME_COLOR  = "#22C55E";
const EXPENSE_COLOR = "#E05252";

interface Props {
  stats: MonthlyStats[];
}

export function MonthlyBarChart({ stats }: Props) {
  const chartData = stats.map((d) => {
    const [, mm] = d.month.split("-").map(Number);
    return {
      month: MONTH_NAMES[mm - 1],
      Ingresos: d.income,
      Gastos: d.expenses,
    };
  });

  const hasData = chartData.some((d) => d.Ingresos > 0 || d.Gastos > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-4">
        <span className="text-sm font-black tracking-widest uppercase">Ingresos vs Gastos</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
            <span className="h-2 w-2 rounded-full inline-block" style={{ background: INCOME_COLOR }} />
            Ingresos
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
            <span className="h-2 w-2 rounded-full inline-block" style={{ background: EXPENSE_COLOR }} />
            Gastos
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Sin datos en este período</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barCategoryGap="20%">
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(245 12% 50%)", fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip
              formatter={(value, name) => [formatARS(Number(value)), String(name)]}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                fontSize: "11px",
              }}
              cursor={{ fill: "hsl(252 38% 16% / 0.5)" }}
            />
            <Bar dataKey="Ingresos"  fill={INCOME_COLOR}  radius={[4, 4, 2, 2]} maxBarSize={20} />
            <Bar dataKey="Gastos"    fill={EXPENSE_COLOR} radius={[4, 4, 2, 2]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
