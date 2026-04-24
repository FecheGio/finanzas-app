import { supabase } from "./supabase";
import type { Category, Transaction, Budget, Card, DashboardSummary, MonthlyStats } from "@/types";
import { currentMonth } from "./utils";

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("type")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getTransactions(limit = 100): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, category:categories(*), card:cards(*)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as Transaction[]).map((tx) => ({
    ...tx,
    time: new Date(tx.created_at).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
}

export async function createTransaction(payload: {
  amount: number;
  type: "income" | "expense";
  category_id: string;
  description: string;
  date: string;
  card_id?: string | null;
  installments?: number;
  start_month?: string | null;
  is_subscription?: boolean;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("transactions").insert({
    ...payload,
    user_id: session.user.id,
  });
  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function updateTransaction(
  id: string,
  payload: {
    amount: number;
    type: "income" | "expense";
    category_id: string;
    description: string;
    date: string;
    card_id?: string | null;
    installments?: number;
    start_month?: string | null;
    is_subscription?: boolean;
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("transactions").update(payload).eq("id", id);
  if (error) throw error;
}

// ── Category CRUD ─────────────────────────────────────────────

export async function createCategory(payload: {
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("categories").insert({
    ...payload,
    user_id: session.user.id,
  });
  if (error) throw error;
}

export async function updateCategory(
  id: string,
  payload: { name: string; icon: string; color: string }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("categories")
    .update(payload)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ── Budget CRUD ───────────────────────────────────────────────

export async function getBudgets(month: string): Promise<Budget[]> {
  const { data, error } = await supabase
    .from("budgets")
    .select("*, category:categories(*)")
    .or(`month.eq.${month},month.is.null`);
  if (error) throw error;
  const map = new Map<string, Budget>();
  for (const b of (data ?? []) as Budget[]) {
    const existing = map.get(b.category_id);
    if (!existing || b.month !== null) map.set(b.category_id, b as Budget);
  }
  return Array.from(map.values());
}

export async function upsertBudget(payload: {
  category_id: string;
  amount: number;
  month: string;
}): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("budgets").upsert(
    { ...payload, user_id: session.user.id },
    { onConflict: "user_id,category_id,month" }
  );
  if (error) throw error;
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from("budgets").delete().eq("id", id);
  if (error) throw error;
}

// ── Cards CRUD ────────────────────────────────────────────────

export async function getCards(): Promise<Card[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Card[];
}

export async function createCard(payload: {
  name: string;
  color: string;
  entity: "visa" | "mastercard" | "amex";
}): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("cards").insert({
    ...payload,
    user_id: session.user.id,
  });
  if (error) throw error;
}

export async function updateCard(
  id: string,
  payload: { name: string; color: string; entity: "visa" | "mastercard" | "amex" }
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("cards").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw error;
}

export async function getSubscriptions(): Promise<Transaction[]> {
  const all = await getTransactions(500);
  return all.filter((tx) => tx.category?.name === "Suscripción");
}

export async function getOrCreateSubscriptionCategory(): Promise<string> {
  const categories = await getCategories();
  const existing = categories.find((c) => c.name === "Suscripción" && c.type === "expense");
  if (existing) return existing.id;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No autenticado");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("categories")
    .insert({ name: "Suscripción", type: "expense", icon: "refresh-cw", color: "#22C55E", user_id: session.user.id })
    .select()
    .single();
  if (error) throw error;
  return data.id;
}

// ── Computed helpers ──────────────────────────────────────────

/**
 * Devuelve el monto que vence en `month` (YYYY-MM) para una transacción con tarjeta.
 * Misma lógica que computeSummary pero para un mes y transacción específicos.
 */
export function cardAmountDueInMonth(tx: Transaction, month: string): number {
  if (!tx.card_id || tx.type !== "expense") return 0;
  const [cy, cm] = month.split("-").map(Number);
  const inst = tx.installments ?? 0;
  const sm = tx.start_month;
  const isSub = tx.category?.name === "Suscripción";

  if (isSub) {
    if (!sm) return tx.amount;
    const [sy, smm] = sm.split("-").map(Number);
    return (cy - sy) * 12 + (cm - smm) >= 0 ? tx.amount : 0;
  } else if (inst === 0) {
    // Pago único: vence en start_month
    if (!sm) return tx.amount;
    const [sy, smm] = sm.split("-").map(Number);
    return (cy - sy) * 12 + (cm - smm) === 0 ? tx.amount : 0;
  } else {
    // Cuotas
    if (!sm) return tx.amount / inst;
    const [sy, smm] = sm.split("-").map(Number);
    const cuotaNum = (cy - sy) * 12 + (cm - smm) + 1;
    return cuotaNum >= 1 && cuotaNum <= inst ? tx.amount / inst : 0;
  }
}

export function computeSummary(transactions: Transaction[]): DashboardSummary {
  const month = currentMonth();
  const [cy, cm] = month.split("-").map(Number);
  let totalBalance = 0;
  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  let cardTotalDebt = 0;
  let cardDueThisMonth = 0;

  for (const tx of transactions) {
    if (tx.type === "income") {
      totalBalance += tx.amount;
      if (tx.date.startsWith(month)) monthlyIncome += tx.amount;
    } else if (tx.card_id) {
      const inst = tx.installments ?? 0;
      const sm = tx.start_month;

      const isSub = tx.category?.name === "Suscripción";
      if (isSub) {
        // Suscripción recurrente: se cuenta todos los meses desde start_month
        if (!sm) {
          cardDueThisMonth += tx.amount; cardTotalDebt += tx.amount;
        } else {
          const [sy, smm] = sm.split("-").map(Number);
          if ((cy - sy) * 12 + (cm - smm) >= 0) {
            cardDueThisMonth += tx.amount; cardTotalDebt += tx.amount;
          }
        }
      } else if (inst === 0) {
        // Pago único: amount = total, due in start_month
        if (sm) {
          const [sy, smm] = sm.split("-").map(Number);
          const diff = (cy - sy) * 12 + (cm - smm);
          if (diff === 0) { cardDueThisMonth += tx.amount; cardTotalDebt += tx.amount; }
          else if (diff < 0) { cardTotalDebt += tx.amount; }
          // diff > 0: already paid
        } else {
          cardTotalDebt += tx.amount;
        }
      } else {
        // Installments: amount = total purchase, cuota = amount / inst
        const cuotaValue = tx.amount / inst;
        if (sm) {
          const [sy, smm] = sm.split("-").map(Number);
          const cuotaNum = (cy - sy) * 12 + (cm - smm) + 1;
          if (cuotaNum >= 1 && cuotaNum <= inst) {
            cardDueThisMonth += cuotaValue;
            cardTotalDebt += cuotaValue * (inst - cuotaNum + 1);
          } else if (cuotaNum < 1) {
            cardTotalDebt += tx.amount; // not started, full amount remaining
          }
          // cuotaNum > inst: fully paid
        } else {
          cardTotalDebt += tx.amount;
        }
      }
    } else {
      totalBalance -= tx.amount;
      if (tx.date.startsWith(month)) monthlyExpenses += tx.amount;
    }
  }
  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlyBalance: monthlyIncome - monthlyExpenses,
    saved: Math.max(monthlyIncome - monthlyExpenses, 0),
    cardTotalDebt,
    cardDueThisMonth,
  };
}

export function groupByDate(
  transactions: Transaction[]
): { dateLabel: string; transactions: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  for (const tx of transactions) {
    let label: string;
    if (tx.date === today) {
      label = `HOY — ${formatShortDate(tx.date)}`;
    } else if (tx.date === yesterday) {
      label = `AYER — ${formatShortDate(tx.date)}`;
    } else {
      label = formatShortDate(tx.date);
    }
    const group = map.get(label) ?? [];
    group.push(tx);
    map.set(label, group);
  }

  return Array.from(map.entries()).map(([dateLabel, txs]) => ({
    dateLabel,
    transactions: txs,
  }));
}

function formatShortDate(isoDate: string): string {
  const currentYear = new Date().getFullYear();
  const txYear = Number(isoDate.slice(0, 4));
  const opts: Intl.DateTimeFormatOptions = txYear !== currentYear
    ? { day: "2-digit", month: "short", year: "numeric" }
    : { day: "2-digit", month: "short" };
  return new Date(isoDate + "T12:00:00").toLocaleDateString("es-AR", opts).toUpperCase();
}

export function computeMonthlyStats(transactions: Transaction[]): MonthlyStats[] {
  const map = new Map<string, { income: number; expenses: number }>();
  for (const tx of transactions) {
    const m = tx.date.slice(0, 7);
    const entry = map.get(m) ?? { income: 0, expenses: 0 };
    if (tx.type === "income") entry.income += tx.amount;
    else entry.expenses += tx.amount;
    map.set(m, entry);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, { income, expenses }]) => ({
      month,
      income,
      expenses,
      balance: income - expenses,
    }));
}
