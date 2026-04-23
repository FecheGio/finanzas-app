"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CardExpenseForm } from "@/components/cards/CardExpenseForm";

export default function CardExpensePageClient({ defaultCardId }: { defaultCardId: string | null }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-5 pt-6 pb-4 sticky top-0 bg-background z-10 border-b border-border">
        <button
          onClick={() => router.back()}
          className="h-9 w-9 rounded-xl bg-card-raised flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-black uppercase tracking-widest">Gasto con tarjeta</h1>
      </div>

      <div className="px-5 pb-10 pt-6">
        <CardExpenseForm defaultCardId={defaultCardId} />
      </div>
    </div>
  );
}
