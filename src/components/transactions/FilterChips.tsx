"use client";

import { cn } from "@/lib/utils";
import { useDragScroll } from "@/hooks/useDragScroll";

export interface ChipItem {
  label: string;
  value: string;
}

interface FilterChipsProps {
  chips: ChipItem[];
  value: string;
  onChange: (value: string) => void;
}

export function FilterChips({ chips, value, onChange }: FilterChipsProps) {
  const scrollRef = useDragScroll();
  return (
    <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 cursor-grab">
      {chips.map((chip) => {
        const isActive = value === chip.value;
        return (
          <button
            key={chip.value}
            onClick={() => onChange(chip.value)}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest transition-all",
              isActive
                ? "bg-lime text-lime-foreground"
                : "bg-card-raised text-muted-foreground hover:text-foreground"
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
