"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Mail, User, Lock, LogOut, Check, Loader2, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [alias, setAlias] = useState("");
  const [newAlias, setNewAlias] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingAlias, setSavingAlias] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [aliasOk, setAliasOk] = useState(false);
  const [passOk, setPassOk] = useState(false);
  const [aliasError, setAliasError] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setEmail(session.user.email ?? "");
      const saved = session.user.user_metadata?.alias ?? session.user.email?.split("@")[0] ?? "";
      setAlias(saved);
      setNewAlias(saved);
    });
  }, [router]);

  async function handleSaveAlias() {
    if (!newAlias.trim()) { setAliasError("El alias no puede estar vacío"); return; }
    setSavingAlias(true);
    setAliasError("");
    try {
      const { error } = await supabase.auth.updateUser({ data: { alias: newAlias.trim() } });
      if (error) throw error;
      setAlias(newAlias.trim());
      setAliasOk(true);
      setTimeout(() => setAliasOk(false), 2500);
    } catch (e) {
      setAliasError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSavingAlias(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) { setPassError("Mínimo 6 caracteres"); return; }
    if (newPassword !== confirmPassword) { setPassError("Las contraseñas no coinciden"); return; }
    setSavingPass(true);
    setPassError("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      setPassOk(true);
      setTimeout(() => setPassOk(false), 2500);
    } catch (e) {
      setPassError(e instanceof Error ? e.message : "Error al cambiar contraseña");
    } finally {
      setSavingPass(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen px-5 pt-6 pb-28">
      <h1 className="text-4xl font-black uppercase leading-none tracking-tight mb-8">
        <span className="text-muted-foreground">Tu</span>
        <br />Cuenta
      </h1>

      {/* ── Perfil ────────────────────────────────── */}
      <section className="mb-6">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Perfil
        </p>

        {/* Email — solo lectura */}
        <div className="bg-card-raised rounded-2xl px-4 py-3 flex items-center gap-3 mb-2">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-0.5">
              Email
            </p>
            <p className="text-sm font-bold truncate">{email}</p>
          </div>
          <span className="text-[9px] text-muted-foreground font-bold bg-muted px-2 py-0.5 rounded-full tracking-wide shrink-0">
            Solo lectura
          </span>
        </div>

        {/* Alias — editable */}
        <div className="bg-card-raised rounded-2xl px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              Alias
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAlias}
              onChange={(e) => { setNewAlias(e.target.value); setAliasError(""); }}
              placeholder="Tu alias"
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSaveAlias}
              disabled={savingAlias || newAlias.trim() === alias}
              className="h-10 px-4 rounded-xl bg-primary text-white text-xs font-black tracking-widest uppercase flex items-center gap-1.5 disabled:opacity-40 transition-all"
            >
              {savingAlias ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : aliasOk ? (
                <Check className="h-3.5 w-3.5" />
              ) : null}
              {aliasOk ? "Guardado" : "Guardar"}
            </button>
          </div>
          {aliasError && (
            <p className="text-xs text-red-400 mt-2">{aliasError}</p>
          )}
        </div>
      </section>

      {/* ── Seguridad ─────────────────────────────── */}
      <section className="mb-6">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Seguridad
        </p>
        <div className="bg-card-raised rounded-2xl px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              Cambiar contraseña
            </p>
          </div>

          <div className="relative">
            <input
              type={showNewPass ? "text" : "password"}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPassError(""); }}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowNewPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPass ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPassError(""); }}
              placeholder="Confirmá la contraseña"
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {passError && <p className="text-xs text-red-400">{passError}</p>}
          {passOk && <p className="text-xs text-green-400 font-bold">Contraseña actualizada correctamente</p>}

          <button
            onClick={handleChangePassword}
            disabled={savingPass || !newPassword || !confirmPassword}
            className="w-full h-10 rounded-xl bg-primary text-white text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1.5 disabled:opacity-40 transition-all"
          >
            {savingPass ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : passOk ? (
              <Check className="h-3.5 w-3.5" />
            ) : null}
            {passOk ? "Actualizada" : "Cambiar contraseña"}
          </button>
        </div>
      </section>

      {/* ── Sesión ────────────────────────────────── */}
      <section>
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Sesión
        </p>
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase text-red-400"
          style={{ background: "rgba(224,82,82,0.12)" }}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}
