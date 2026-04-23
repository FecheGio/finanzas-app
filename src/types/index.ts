export type TransactionType = "income" | "expense";
export type CardEntity = "visa" | "mastercard" | "amex";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  created_at: string;
  user_id: string;
}

export interface Card {
  id: string;
  user_id: string;
  name: string;
  color: string;
  entity: CardEntity;
  created_at: string;
}

export interface Transaction {
  id: string;
  amount: number;       // centavos (integer — no floating point)
  description: string;
  date: string;         // ISO date YYYY-MM-DD
  time?: string;        // HH:MM for display
  type: TransactionType;
  category_id: string;
  category?: Category;
  card_id?: string | null;
  card?: Card | null;
  installments?: number;    // 0 = pago único, N > 0 = N cuotas
  start_month?: string | null; // YYYY-MM, cuándo se contabiliza la primera cuota
  created_at: string;
  user_id: string;
}

export interface TransactionFormData {
  amount: string;
  description: string;
  date: string;
  type: TransactionType;
  category_id: string;
  card_id?: string | null;
}

export interface CategoryFormData {
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  category?: Category;
  amount: number;       // centavos — monthly budget limit
  month: string | null; // YYYY-MM or null for recurring default
  created_at: string;
}

export interface BudgetWithSpent extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryStats {
  category_id: string;
  category_name: string;
  color: string;
  total: number;
  percentage: number;
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  saved: number;
}

export type SpendingPeriod = "W" | "M" | "Y";

export interface SpendingDataPoint {
  label: string;
  amount: number;
  active?: boolean;
}
