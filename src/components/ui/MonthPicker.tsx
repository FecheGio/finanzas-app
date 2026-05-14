"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  month: string; // YYYY-MM
  onChange: (month: string) => void;
}

function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function label(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const now = new Date();
  const isCurrentYear = y === now.getFullYear();
  return new Date(y, m - 1, 1)
    .toLocaleDateString("es-AR", {
      month: "long",
      ...(isCurrentYear ? {} : { year: "numeric" }),
    })
    .toUpperCase();
}

export function MonthPicker({ month, onChange }: Props) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const isCurrentMonth = month === currentMonth;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(addMonths(month, -1))}
        className="h-7 w-7 rounded-full bg-card-raised flex items-center justify-center active:opacity-60 transition-opacity"
      >
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </button>

      <button
        onClick={() => !isCurrentMonth && onChange(currentMonth)}
        className="text-[11px] font-black tracking-[0.15em] uppercase min-w-[110px] text-center transition-colors"
        style={{ color: isCurrentMonth ? "hsl(245 12% 50%)" : "hsl(var(--foreground))" }}
        title={isCurrentMonth ? undefined : "Volver al mes actual"}
      >
        {label(month)}
      </button>

      <button
        onClick={() => onChange(addMonths(month, 1))}
        disabled={isCurrentMonth}
        className="h-7 w-7 rounded-full bg-card-raised flex items-center justify-center active:opacity-60 transition-opacity disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
