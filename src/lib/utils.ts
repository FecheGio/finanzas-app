import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert centavos integer to ARS display string */
export function formatARS(centavos: number): string {
  const amount = centavos / 100;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Convert decimal string input → integer centavos */
export function toCentavos(value: string): number {
  const num = parseFloat(value.replace(",", "."));
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/** Format ISO date to es-AR locale */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate + "T00:00:00"));
}

/** Current month as YYYY-MM */
export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}
