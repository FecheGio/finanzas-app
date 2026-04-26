import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./database.types";

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

// Proxy que bindea `this` al cliente real para que métodos como .from() funcionen
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    return typeof value === "function" ? (value as Function).bind(client) : value;
  },
});

/**
 * Helper para operaciones de escritura (insert/update/upsert).
 * supabase-js v2.39+ cambió los tipos internos del Database genérico,
 * haciendo que los tipos de insert/update no coincidan con el schema manual.
 * Las operaciones de lectura (select) funcionan bien sin este cast.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseWriter = supabase as any;
