"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RefreshCw, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getSubscriptions } from "@/lib/queries";
import { formatARS } from "@/lib/utils";
import { EntityLogo } from "@/components/cards/AddCardModal";
import * as LucideIcons from "lucide-react";
import type { Transaction } from "@/types";

type AnyIcon = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
type IconLib = Record<string, AnyIcon>;

function DynIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const pascal = name.split(/[-_]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  const Icon = (LucideIcons as unknown as IconLib)[pascal];
  if (!Icon) return <LucideIcons.CircleDollarSign className={className} style={style} />;
  return <Icon className={className} style={style} />;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) { router.replace("/login"); return; }
      const subs = await getSubscriptions();
      setSubscriptions(subs);
    } catch (e) {
      console.error("Error cargando suscripciones:", e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [load]);

  const totalMonthly = subscriptions.reduce((s, tx) => s + tx.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-32">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">Suscripciones</h1>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl p-5 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #7C3AED22 0%, #5B21B622 100%)", border: "1px solid #7C3AED44" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Suscripciones activas</p>
            <p className="text-2xl font-black text-foreground">{subscriptions.length}</p>
          </div>
        </div>
        <div className="border-t border-border/50 pt-4">
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-1">Total mensual</p>
          <p className="text-3xl font-black text-primary">{formatARS(totalMonthly)}</p>
        </div>
      </div>

      {/* List */}
      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-16 w-16 rounded-2xl bg-card-raised flex items-center justify-center">
            <RefreshCw className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">No tenés suscripciones activas</p>
          <Link
            href="/cards/expense/new?subscription=true"
            className="text-xs font-bold text-primary"
          >
            Agregar suscripción →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {subscriptions.map((tx) => {
            const cat = tx.category;
            const card = tx.card;
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 bg-card"
                style={{ border: "1px solid hsl(var(--border))" }}
              >
                {/* Category icon */}
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: cat ? `${cat.color}22` : "hsl(var(--card-raised))" }}
                >
                  {cat ? (
                    <DynIcon name={cat.icon} className="h-5 w-5" style={{ color: cat.color }} />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{tx.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {cat && (
                      <span className="text-[10px] font-semibold" style={{ color: cat.color }}>
                        {cat.name}
                      </span>
                    )}
                    {cat && card && <span className="text-muted-foreground text-[10px]">·</span>}
                    {card && (
                      <div className="flex items-center gap-1">
                        <div className="scale-[0.6] origin-left">
                          <EntityLogo entity={card.entity} />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">{card.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-foreground">{formatARS(tx.amount)}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">/mes</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/cards/expense/new?subscription=true"
        className="fixed bottom-24 right-5 md:bottom-6 h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 z-40"
        style={{ background: "#AEEA00" }}
      >
        <Plus className="h-6 w-6 text-black" strokeWidth={2.5} />
      </Link>
    </div>
  );
}
