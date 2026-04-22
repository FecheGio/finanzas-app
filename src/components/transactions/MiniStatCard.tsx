"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { formatARS } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MiniStatCardProps {
  label: "INGRESOS" | "GASTOS";
  centavos: number;
  trend: number;
  sparkline: number[];
}

export function MiniStatCard({ label, centavos, trend, sparkline }: MiniStatCardProps) {
  const isIncome = label === "INGRESOS";
  const color = isIncome ? "#22C55E" : "#E05252";
  const positive = trend >= 0;

  const chartData = sparkline.map((v, i) => ({ i, v }));

  return (
    <div className="bg-card-raised rounded-2xl p-4 flex-1 min-w-0 overflow-hidden">
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">
        {label}
      </p>

      {/* Trend badge */}
      <div className="flex items-center gap-1.5 mb-3">
        <span
          className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: `${color}22`, color }}
        >
          {positive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
          {positive ? "+" : ""}{trend}%
        </span>
      </div>

      {/* Amount */}
      <p className="text-xl font-black tabular-nums tracking-tight" style={{ color }}>
        {formatARS(centavos)}
      </p>

      {/* Sparkline */}
      <div className="mt-2 -mx-1 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#spark-${label})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
