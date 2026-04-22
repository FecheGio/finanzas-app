"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Revisá tu email para confirmar la cuenta, luego iniciá sesión.");
        setMode("login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center glow-primary">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-black tracking-widest uppercase">FinanzasPro</span>
      </div>

      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-1">
          {mode === "login" ? "Bienvenido" : "Crear cuenta"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {mode === "login" ? "Ingresá tus datos para continuar" : "Completá el formulario"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="vos@ejemplo.com"
              className="w-full bg-card-raised border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full bg-card-raised border border-border rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error / info */}
          {error && (
            <p className="text-xs text-expense font-medium bg-expense-muted rounded-xl px-4 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-xs text-income font-medium bg-income-muted rounded-xl px-4 py-2">
              {info}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-xl py-3.5 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 glow-primary disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Iniciar sesión" : "Registrarme"}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "login" ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setInfo(""); }}
            className="text-primary font-bold hover:underline"
          >
            {mode === "login" ? "Registrate" : "Iniciá sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
