"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FILTERS = ["ALL", "INCOME", "EXPENSES", "FOOD", "TRANSPORT", "HEALTH"] as const;
type Filter = (typeof FILTERS)[number];

interface FilterChipsProps {
  onChange?: (filter: Filter) => void;
}

export function FilterChips({ onChange }: FilterChipsProps) {
  const [active, setActive] = useState<Filter>("ALL");

  const handleSelect = (f: Filter) => {
    setActive(f);
    onChange?.(f);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
      {FILTERS.map((f) => {
        const isActive = active === f;
        return (
          <button
            key={f}
            onClick={() => handleSelect(f)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest transition-all",
              isActive
                ? "bg-lime text-lime-foreground"
                : "bg-card-raised text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}
