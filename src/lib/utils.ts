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

/** Convert decimal string input → integer centavos.
 *  Handles both standard ("1000.50") and Argentine format ("1.000,50"). */
export function toCentavos(value: string): number {
  let normalized: string;
  if (value.includes(",")) {
    // Argentine: dots = thousand separators, comma = decimal
    normalized = value.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = value;
  }
  const num = parseFloat(normalized);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/** Format centavos as Argentine input string: "1.000,50" */
export function formatAmountInput(centavos: number): string {
  const num = centavos / 100;
  return num.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
