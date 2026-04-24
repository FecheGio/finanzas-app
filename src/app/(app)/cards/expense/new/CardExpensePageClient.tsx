"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CardExpenseForm } from "@/components/cards/CardExpenseForm";

interface Props {
  defaultCardId: string | null;
  defaultSubscription?: boolean;
}

export default function CardExpensePageClient({ defaultCardId, defaultSubscription }: Props) {
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
        <h1 className="text-lg font-black uppercase tracking-widest">
          {defaultSubscription ? "Nueva suscripción" : "Gasto con tarjeta"}
        </h1>
      </div>

      <div className="px-5 pb-10 pt-6">
        <CardExpenseForm
          defaultCardId={defaultCardId}
          defaultSubscription={defaultSubscription}
          redirectTo={defaultSubscription ? "/subscriptions" : "/cards"}
        />
      </div>
    </div>
  );
}
