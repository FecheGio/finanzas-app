"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, DollarSign, CreditCard, RefreshCw, Wallet, Settings, Tags, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",              label: "Dashboard",     icon: LayoutDashboard },
  { href: "/transactions",  label: "Actividad",     icon: DollarSign },
  { href: "/cards",         label: "Tarjetas",      icon: CreditCard },
  { href: "/subscriptions", label: "Suscripciones", icon: RefreshCw },
  { href: "/budget",        label: "Presupuesto",   icon: Wallet },
  { href: "/categories",    label: "Categorías",    icon: Tags },
  { href: "/settings",      label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-border bg-card px-4 py-6 gap-2 shrink-0">
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center glow-primary">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <span className="font-black text-sm tracking-widest uppercase text-foreground">
          FinanzasPro
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold tracking-wide transition-all",
                active
                  ? "bg-primary text-white glow-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
