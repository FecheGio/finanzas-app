export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "income" | "expense";
          icon: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "income" | "expense";
          icon?: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "income" | "expense";
          icon?: string;
          color?: string;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          type: "income" | "expense";
          amount: number;
          description: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          type: "income" | "expense";
          amount: number;
          description?: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          type?: "income" | "expense";
          amount?: number;
          description?: string;
          date?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      monthly_stats: {
        Row: {
          user_id: string;
          month: string;
          income_centavos: number;
          expense_centavos: number;
          balance_centavos: number;
        };
      };
      category_monthly_stats: {
        Row: {
          user_id: string;
          month: string;
          category_id: string;
          category_name: string;
          color: string;
          type: "income" | "expense";
          total_centavos: number;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
}
