"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyStats } from "@/types";

interface MonthlyBarChartProps {
  data: MonthlyStats[];
}

function currencyTickFormatter(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

const INCOME_COLOR = "hsl(160, 84%, 39%)";
const EXPENSE_COLOR = "hsl(0, 84%, 60%)";

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const chartData = data.map((d) => ({
    month: d.month.slice(5), // MM only
    Ingresos: d.income / 100,
    Gastos: d.expenses / 100,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Ingresos vs Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={currencyTickFormatter}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip
              formatter={(value) =>
                new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value))
              }
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
              }}
            />
            <Legend iconType="circle" iconSize={8} />
            <Bar dataKey="Ingresos" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Gastos" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
