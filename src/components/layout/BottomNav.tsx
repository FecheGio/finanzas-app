"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, DollarSign, PieChart, Tags, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",             label: "HOME",       icon: Home },
  { href: "/transactions", label: "ACTIVITY",   icon: DollarSign },
  { href: "/budget",       label: "BUDGET",     icon: PieChart },
  { href: "/categories",   label: "CATEGORÍAS", icon: Tags },
  { href: "/settings",     label: "AJUSTES",    icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 flex-1"
            >
              <Icon
                className={cn("h-5 w-5 transition-colors", active ? "text-lime" : "text-muted-foreground")}
              />
              <span
                className={cn(
                  "text-[8px] font-bold tracking-wider transition-colors truncate",
                  active ? "text-lime" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
