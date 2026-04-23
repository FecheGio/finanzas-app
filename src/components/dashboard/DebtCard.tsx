"use client";

import { formatARS } from "@/lib/utils";
import { CreditCard, AlertCircle } from "lucide-react";

interface DebtCardProps {
  totalDebtCentavos: number;
  dueThisMonthCentavos: number;
  month: string;
}

export function DebtCard({ totalDebtCentavos, dueThisMonthCentavos, month }: DebtCardProps) {
  return (
    <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #2d1060 100%)", border: "1px solid rgba(220,80,80,0.25)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-3.5 w-3.5 text-red-400/70" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">
            Deuda tarjetas
          </span>
        </div>
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40">
          {month}
        </span>
      </div>

      <div className="flex items-start justify-between gap-4">
        {/* Total debt */}
        <div className="flex-1">
          <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-1">
            Deuda total
          </p>
          <p className="text-2xl font-black tracking-tight text-red-300">
            {formatARS(totalDebtCentavos)}
          </p>
        </div>

        {/* Due this month */}
        <div className="text-right flex-1">
          <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-1 flex items-center justify-end gap-1">
            <AlertCircle className="h-2.5 w-2.5 text-orange-400/70" />
            Vence este mes
          </p>
          <p className="text-2xl font-black tracking-tight text-orange-300">
            {formatARS(dueThisMonthCentavos)}
          </p>
        </div>
      </div>
    </div>
  );
}
