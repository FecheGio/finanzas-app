import { formatARS } from "@/lib/utils";

interface BalanceCardProps {
  totalCentavos: number;
  incomeCentavos: number;
  expensesCentavos: number;
  savedCentavos: number;
  month: string; // e.g. "ABRIL 2026"
}

function AmountDisplay({ centavos }: { centavos: number }) {
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(centavos / 100);

  // Split on the decimal separator
  const parts = formatted.split(",");
  return (
    <span className="tabular-nums">
      {parts[0]}
      <span className="text-2xl font-bold opacity-80">,{parts[1]}</span>
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
      {/* Card header */}
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

      {/* Mini stats row */}
      <div className="flex items-center divide-x divide-white/20">
        <div className="flex-1 pr-4">
          <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-0.5">
            Ingresos
          </p>
          <p className="text-sm font-bold text-green-300">
            +{formatARS(incomeCentavos)}
          </p>
        </div>
        <div className="flex-1 px-4">
          <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-0.5">
            Gastos
          </p>
          <p className="text-sm font-bold text-red-300">
            -{formatARS(expensesCentavos)}
          </p>
        </div>
        <div className="flex-1 pl-4">
          <p className="text-[9px] font-bold tracking-widest uppercase text-white/50 mb-0.5">
            Ahorrado
          </p>
          <p className="text-sm font-bold text-white">
            {formatARS(savedCentavos)}
          </p>
        </div>
      </div>
    </div>
  );
}
