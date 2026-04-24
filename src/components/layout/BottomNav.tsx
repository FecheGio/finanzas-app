"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, DollarSign, CreditCard, RefreshCw, MoreHorizontal, Wallet, Settings, Tags, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mainNavItems = [
  { href: "/",              label: "DASHBOARD",     icon: LayoutDashboard },
  { href: "/transactions",  label: "ACTIVIDAD",     icon: DollarSign },
  { href: "/cards",         label: "TARJETAS",      icon: CreditCard },
  { href: "/subscriptions", label: "SUSCRIPCIONES", icon: RefreshCw },
];

const moreItems = [
  { href: "/budget",     label: "Presupuesto",  icon: Wallet },
  { href: "/categories", label: "Categorías",   icon: Tags },
  { href: "/settings",   label: "Configuración", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMoreActive = moreItems.some((item) => pathname === item.href);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16">
          {mainNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 flex-1"
              >
                <Icon className={cn("h-5 w-5 transition-colors", active ? "text-lime" : "text-muted-foreground")} />
                <span className={cn("text-[8px] font-bold tracking-wider transition-colors truncate", active ? "text-lime" : "text-muted-foreground")}>
                  {label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 flex-1"
          >
            <MoreHorizontal className={cn("h-5 w-5 transition-colors", isMoreActive ? "text-lime" : "text-muted-foreground")} />
            <span className={cn("text-[8px] font-bold tracking-wider transition-colors", isMoreActive ? "text-lime" : "text-muted-foreground")}>
              MÁS
            </span>
          </button>
        </div>
      </nav>

      {drawerOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-[60] bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-2xl border-t border-border pb-safe">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Más opciones</span>
              <button onClick={() => setDrawerOpen(false)} className="text-muted-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-3 pb-6">
              {moreItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all",
                      active ? "bg-primary text-white" : "text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
