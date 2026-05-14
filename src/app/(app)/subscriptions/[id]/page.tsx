"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getTransactions } from "@/lib/queries";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import type { Transaction } from "@/types";

function computeAfterClosing(dateStr: string, startMonth: string | null | undefined): boolean {
  if (!startMonth) return false;
  const dateMonth = dateStr.slice(0, 7);
  return startMonth !== dateMonth;
}

export default function EditSubscriptionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      const txs = await getTransactions(500);
      const tx = txs.find((t) => t.id === id) ?? null;
      setTransaction(tx);
      setLoading(false);
    });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 text-center">
        <p className="text-muted-foreground">Suscripción no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-5 pt-6 pb-4 sticky top-0 bg-background z-10 border-b border-border">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 rounded-xl bg-card-raised flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-black uppercase tracking-widest">Editar suscripción</h1>
      </div>

      <div className="px-5 pb-10 pt-6">
        <SubscriptionForm
          transactionId={transaction.id}
          initialValues={{
            amount: transaction.amount,
            name: transaction.description,
            cardId: transaction.card_id ?? null,
            afterClosing: computeAfterClosing(transaction.date, transaction.start_month),
            date: transaction.date,
          }}
        />
      </div>
    </div>
  );
}
