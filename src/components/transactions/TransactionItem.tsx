import { formatARS } from "@/lib/utils";
import type { Transaction } from "@/types";
import {
  ShoppingCart, Coffee, Briefcase, Pill, Car, Tv,
  Music, Home, Utensils, Cpu, BookOpen, CircleDollarSign,
} from "lucide-react";

type IconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const ICON_MAP: Record<string, IconComponent> = {
  "shopping-cart": ShoppingCart,
  coffee: Coffee,
  briefcase: Briefcase,
  pill: Pill,
  car: Car,
  tv: Tv,
  music: Music,
  home: Home,
  utensils: Utensils,
  cpu: Cpu,
  "book-open": BookOpen,
  default: CircleDollarSign,
};

function getInstallmentInfo(startMonth: string, installments: number) {
  const [sy, sm] = startMonth.split("-").map(Number);
  const now = new Date();
  const ty = now.getFullYear();
  const tm = now.getMonth() + 1;
  const num = (ty - sy) * 12 + (tm - sm) + 1;
  return { num: Math.max(1, num), isLast: num === installments, isPast: num > installments };
}

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const { type, amount, description, time, category, installments, start_month } = transaction;
  const isIncome = type === "income";

  const iconKey = category?.icon ?? "default";
  const Icon = ICON_MAP[iconKey] ?? ICON_MAP["default"];
  const color = category?.color ?? (isIncome ? "#22C55E" : "#E05252");

  const hasCuotas = !isIncome && installments && installments > 0 && start_month;
  const cuota = hasCuotas ? getInstallmentInfo(start_month!, installments!) : null;

  return (
    <div
      className="flex items-center gap-3 py-3 cursor-pointer active:opacity-60 transition-opacity"
      onClick={onClick}
    >
      {/* Category icon */}
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}22` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>

      {/* Description + category + cuota */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold tracking-wide truncate">{description}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <p className="text-xs text-muted-foreground truncate">
            {category?.name ?? (isIncome ? "Ingreso" : "Gasto")}
            {cuota && !cuota.isPast && (
              <span className="text-muted-foreground/70">
                {" "}· Cuota {cuota.num} de {installments}
              </span>
            )}
          </p>
          {cuota?.isLast && (
            <span className="text-[9px] font-black tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">
              Última cuota
            </span>
          )}
        </div>
      </div>

      {/* Time + amount */}
      <div className="text-right shrink-0">
        <p
          className="text-sm font-bold tabular-nums"
          style={{ color: isIncome ? "#22C55E" : "#E05252" }}
        >
          {isIncome ? "+" : "-"}{formatARS(amount)}
        </p>
        {time && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
        )}
      </div>
    </div>
  );
}

interface TransactionGroupProps {
  dateLabel: string;
  transactions: Transaction[];
  onTap?: (tx: Transaction) => void;
}

export function TransactionGroup({ dateLabel, transactions, onTap }: TransactionGroupProps) {
  return (
    <div className="mb-2">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground px-4 py-2">
        {dateLabel}
      </p>
      <div className="bg-card-raised rounded-2xl divide-y divide-border px-4">
        {transactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} onClick={() => onTap?.(tx)} />
        ))}
      </div>
    </div>
  );
}
