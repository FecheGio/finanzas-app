import { Card, CardContent } from "@/components/ui/card";
import { cn, formatARS } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  centavos: number;
  icon: LucideIcon;
  variant: "balance" | "income" | "expense";
  trend?: number; // percentage change vs last month
}

const variantStyles = {
  balance: {
    wrapper: "bg-primary/10",
    icon: "text-primary",
    value: "text-foreground",
  },
  income: {
    wrapper: "bg-income-muted",
    icon: "text-income",
    value: "text-income",
  },
  expense: {
    wrapper: "bg-expense-muted",
    icon: "text-expense",
    value: "text-expense",
  },
};

export function SummaryCard({ title, centavos, icon: Icon, variant, trend }: SummaryCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums tracking-tight", styles.value)}>
              {formatARS(centavos)}
            </p>
            {trend !== undefined && (
              <p className={cn("mt-1 text-xs font-medium", trend >= 0 ? "text-income" : "text-expense")}>
                {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% vs mes anterior
              </p>
            )}
          </div>
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", styles.wrapper)}>
            <Icon className={cn("h-5 w-5", styles.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
