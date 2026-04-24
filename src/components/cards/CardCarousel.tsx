"use client";

import { Plus, Pencil } from "lucide-react";
import { formatARS } from "@/lib/utils";
import { cardAmountDueInMonth } from "@/lib/queries";
import { EntityLogo } from "./AddCardModal";
import { useDragScroll } from "@/hooks/useDragScroll";
import type { Card, Transaction } from "@/types";

interface CardCarouselProps {
  cards: Card[];
  transactions: Transaction[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (card: Card) => void;
  month: string;
}

export function CardCarousel({
  cards, transactions, selectedId, onSelect, onAdd, onEdit, month,
}: CardCarouselProps) {
  const scrollRef = useDragScroll();

  function monthlySpend(cardId: string) {
    return transactions
      .filter((t) => t.card_id === cardId && t.type === "expense")
      .reduce((s, t) => s + cardAmountDueInMonth(t, month), 0);
  }

  return (
    <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-5 pb-3 pt-1 cursor-grab">
      {cards.map((card) => {
        const spent = monthlySpend(card.id);
        const isSelected = selectedId === card.id;
        return (
          <div
            key={card.id}
            className="shrink-0 w-52 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all"
            style={{
              background: `linear-gradient(135deg, ${card.color}ee, ${card.color}88)`,
              height: "120px",
              border: isSelected ? `2.5px solid rgba(255,255,255,0.8)` : "2.5px solid transparent",
            }}
            onClick={() => onSelect(card.id)}
          >
            <div className="flex items-center justify-between">
              <EntityLogo entity={card.entity} />
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center"
              >
                <Pencil className="h-3 w-3 text-white" />
              </button>
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-wide truncate">{card.name}</p>
              <p className="text-white/60 text-[10px] font-bold mt-0.5">{formatARS(spent)} este mes</p>
            </div>
          </div>
        );
      })}

      {/* Add card button */}
      <button
        onClick={onAdd}
        className="shrink-0 w-36 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors"
        style={{ height: "120px" }}
      >
        <Plus className="h-5 w-5 text-muted-foreground" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
          Agregar
        </span>
      </button>
    </div>
  );
}
