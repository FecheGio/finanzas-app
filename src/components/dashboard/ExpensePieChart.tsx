"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryStats } from "@/types";

interface ExpensePieChartProps {
  data: CategoryStats[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const chartData = data.map((d) => ({
    name: d.category_name,
    value: d.total / 100,
    color: d.color,
    percentage: d.percentage,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Gastos por Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value)),
                String(name),
              ]}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
              }}
            />
            <Legend iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
