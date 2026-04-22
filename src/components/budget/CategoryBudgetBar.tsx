import { formatARS } from "@/lib/utils";
import {
  Utensils, Car, Tv, Music, Home, Coffee,
  Cpu, BookOpen, Heart, CircleDollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  tv: Tv,
  music: Music,
  home: Home,
  coffee: Coffee,
  cpu: Cpu,
  "book-open": BookOpen,
  "heart-pulse": Heart,
  default: CircleDollarSign,
};

interface CategoryBudgetBarProps {
  name: string;
  icon: string;
  color: string;
  spentCentavos: number;
  budgetCentavos: number;
}

export function CategoryBudgetBar({
  name,
  icon,
  color,
  spentCentavos,
  budgetCentavos,
}: CategoryBudgetBarProps) {
  const percentage = Math.min((spentCentavos / budgetCentavos) * 100, 100);
  const remaining = Math.max(budgetCentavos - spentCentavos, 0);
  const Icon = ICON_MAP[icon] ?? ICON_MAP["default"];

  return (
    <div className="flex items-center gap-3 py-3.5">
      {/* Icon */}
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}22` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-xs font-black tracking-widest uppercase">{name}</span>
          <span className="text-xs font-bold text-muted-foreground tabular-nums">
            {formatARS(spentCentavos)} / {formatARS(budgetCentavos)}
          </span>
        </div>

        {/* Progress track */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full progress-lime transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-[10px] text-muted-foreground mt-1">
          {formatARS(remaining)} restante
        </p>
      </div>
    </div>
  );
}
