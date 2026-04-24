"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCards, getTransactions, getCategories, deleteCard, groupByDate, cardAmountDueInMonth } from "@/lib/queries";
import { formatARS } from "@/lib/utils";
import { useDragScroll } from "@/hooks/useDragScroll";
import { CardCarousel } from "@/components/cards/CardCarousel";
import { AddCardModal } from "@/components/cards/AddCardModal";
import { TransactionGroup } from "@/components/transactions/TransactionItem";
import { TransactionBottomSheet } from "@/components/transactions/TransactionBottomSheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Card, Category, Transaction } from "@/types";

export default function CardsPage() {
  const router = useRouter();
  const summaryScrollRef = useDragScroll();
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [toDeleteCard, setToDeleteCard] = useState<Card | null>(null);
  const [deletingCard, setDeletingCard] = useState(false);

  const thisMonth = new Date().toISOString().slice(0, 7);

  const load = useCallback(async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) { router.replace("/login"); return; }
    const [c, t, cats] = await Promise.all([getCards(), getTransactions(500), getCategories()]);
    setCards(c);
    setTransactions(t);
    setCategories(cats);
    if (c.length > 0 && !selectedCardId) setSelectedCardId(c[0].id);
    setLoading(false);
  }, [router, selectedCardId]);

  useEffect(() => { load(); }, [load]);

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;

  const cardTxs = transactions.filter(
    (t) => t.card_id === selectedCardId && t.type === "expense"
  );

  const totalCardExpenses = transactions
    .filter((t) => t.card_id != null && t.type === "expense")
    .reduce((s, t) => s + cardAmountDueInMonth(t, thisMonth), 0);

  const groups = groupByDate(cardTxs);

  async function handleDeleteCard() {
    if (!toDeleteCard) return;
    setDeletingCard(true);
    try {
      await deleteCard(toDeleteCard.id);
      if (selectedCardId === toDeleteCard.id) setSelectedCardId(null);
      setToDeleteCard(null);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingCard(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-4xl font-black uppercase leading-none tracking-tight mb-1">
          <span className="text-muted-foreground">Tus</span>
          <br />Tarjetas
        </h1>
      </div>

      {/* Summary card */}
      <div className="px-5 mb-3">
        <div className="card-purple-gradient rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">
              Gastos con tarjeta
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">
              {new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" }).toUpperCase()}
            </span>
          </div>
          <p className="text-3xl font-black tracking-tight mb-4">{formatARS(totalCardExpenses)}</p>
          <div ref={summaryScrollRef} className="flex gap-4 overflow-x-auto pb-0.5 cursor-grab">
            {cards.map((card) => {
              const spent = transactions
                .filter((t) => t.card_id === card.id && t.type === "expense")
                .reduce((s, t) => s + cardAmountDueInMonth(t, thisMonth), 0);
              return (
                <div key={card.id} className="flex items-center gap-1.5 shrink-0">
                  <div className="h-2 w-2 rounded-full" style={{ background: card.color }} />
                  <span className="text-[10px] text-white/60 font-bold">{card.name}</span>
                  <span className="text-[10px] text-white font-black">{formatARS(spent)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {cards.length === 0 ? (
        <div className="px-5 flex flex-col items-center justify-center py-16 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-bold mb-1">Sin tarjetas</p>
          <p className="text-xs text-muted-foreground mb-6">Agregá tu primera tarjeta para registrar gastos</p>
          <button
            onClick={() => { setEditingCard(null); setModalOpen(true); }}
            className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-black tracking-widest uppercase glow-primary"
          >
            Agregar tarjeta
          </button>
        </div>
      ) : (
        <>
          {/* Carousel */}
          <div className="mb-6">
            <CardCarousel
              cards={cards}
              transactions={transactions}
              selectedId={selectedCardId}
              onSelect={setSelectedCardId}
              onAdd={() => { setEditingCard(null); setModalOpen(true); }}
              onEdit={(card) => { setEditingCard(card); setModalOpen(true); }}
              month={thisMonth}
            />
          </div>

          {/* Selected card transactions */}
          {selectedCard && (
            <div className="px-5 pb-28">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full" style={{ background: selectedCard.color }} />
                <span className="text-xs font-black tracking-[0.2em] uppercase">
                  {selectedCard.name}
                </span>
              </div>

              {groups.length === 0 ? (
                <div className="bg-card-raised rounded-2xl px-5 py-10 text-center">
                  <p className="text-sm text-muted-foreground">Sin gastos registrados con esta tarjeta</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Usá el botón + para agregar un gasto con tarjeta
                  </p>
                </div>
              ) : (
                <div>
                  {groups.map((g) => (
                    <TransactionGroup
                      key={g.dateLabel}
                      dateLabel={g.dateLabel}
                      transactions={g.transactions}
                      onTap={setSelectedTx}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* FAB */}
      {cards.length > 0 && (
        <Link
          href={`/cards/expense/new${selectedCardId ? `?cardId=${selectedCardId}` : ""}`}
          className="fixed bottom-20 right-5 z-50 h-14 w-14 rounded-full bg-lime flex items-center justify-center md:bottom-6"
          style={{ boxShadow: "0 0 20px 4px rgba(174,234,0,0.35)" }}
        >
          <Plus className="h-7 w-7 text-lime-foreground" />
        </Link>
      )}

      {/* Modals */}
      <AddCardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { load(); }}
        onDelete={editingCard ? () => { setModalOpen(false); setToDeleteCard(editingCard); } : undefined}
        editing={editingCard}
      />

      <TransactionBottomSheet
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        onDeleted={load}
      />

      <ConfirmDialog
        open={!!toDeleteCard}
        title={`Eliminar "${toDeleteCard?.name}"`}
        message="Los gastos asociados quedarán sin tarjeta asignada."
        confirmLabel="Eliminar"
        loading={deletingCard}
        onConfirm={handleDeleteCard}
        onCancel={() => setToDeleteCard(null)}
      />
    </div>
  );
}
