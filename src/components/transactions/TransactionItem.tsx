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

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const { type, amount, description, time, category } = transaction;
  const isIncome = type === "income";

  const iconKey = category?.icon ?? "default";
  const Icon = ICON_MAP[iconKey] ?? ICON_MAP["default"];
  const color = category?.color ?? (isIncome ? "#22C55E" : "#E05252");

  return (
    <div className="flex items-center gap-3 py-3">
      {/* Category icon */}
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}22` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>

      {/* Description + category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold tracking-wide truncate">{description}</p>
        <p className="text-xs text-muted-foreground truncate">
          {category?.name ?? (isIncome ? "Ingreso" : "Gasto")}
        </p>
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
}

export function TransactionGroup({ dateLabel, transactions }: TransactionGroupProps) {
  return (
    <div className="mb-2">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground px-4 py-2">
        {dateLabel}
      </p>
      <div className="bg-card-raised rounded-2xl divide-y divide-border px-4">
        {transactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </div>
  );
}
