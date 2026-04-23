import { formatARS } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface BalanceCardProps {
  totalCentavos: number;
  incomeCentavos: number;
  expensesCentavos: number;
  savedCentavos: number;
  month: string;
}

function AmountDisplay({ centavos }: { centavos: number }) {
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(centavos / 100);

  const parts = formatted.split(",");
  return (
    <span className="tabular-nums inline-flex items-start gap-0.5">
      <span>{parts[0]},</span>
      <span className="text-xl font-bold opacity-70 mt-1">{parts[1]}</span>
    </span>
  );
}

export function BalanceCard({
  totalCentavos,
  incomeCentavos,
  expensesCentavos,
  savedCentavos,
  month,
}: BalanceCardProps) {
  return (
    <div className="card-purple-gradient rounded-2xl p-5 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">
          Fondos disponibles
        </span>
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/60">
          {month}
        </span>
      </div>

      {/* Main amount */}
      <div className="text-4xl font-black tracking-tight mb-5">
        <AmountDisplay centavos={totalCentavos} />
      </div>

      {/* Ingresos / Gastos */}
      <div className="flex items-center divide-x divide-white/20 mb-3">
        <div className="flex-1 pr-4">
          <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-0.5">
            Ingresos
          </p>
          <p className="text-sm font-bold text-green-300 flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            {formatARS(incomeCentavos)}
          </p>
        </div>
        <div className="flex-1 pl-4">
          <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-0.5">
            Gastos
          </p>
          <p className="text-sm font-bold text-red-300 flex items-center gap-1">
            <ArrowDown className="h-3 w-3" />
            {formatARS(expensesCentavos)}
          </p>
        </div>
      </div>

      {/* Ahorrado */}
      <div className="border-t border-white/10 pt-3">
        <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-0.5">
          Ahorrado este mes
        </p>
        <p className="text-sm font-bold text-lime">{formatARS(savedCentavos)}</p>
      </div>
    </div>
  );
}
