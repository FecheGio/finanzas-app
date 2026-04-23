"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { createCard, updateCard } from "@/lib/queries";
import type { Card, CardEntity } from "@/types";

const COLORS = [
  "#7C3AED", "#3B82F6", "#10B981", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#F97316",
  "#8B5CF6", "#64748B",
];

const ENTITIES: { value: CardEntity; label: string }[] = [
  { value: "visa",       label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex",       label: "Amex" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: Card | null;
}

export function AddCardModal({ open, onClose, onSaved, editing }: Props) {
  const [name, setName] = useState("");
  const [entity, setEntity] = useState<CardEntity>("visa");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setEntity(editing?.entity ?? "visa");
      setColor(editing?.color ?? COLORS[0]);
      setError("");
    }
  }, [open, editing]);

  if (!open) return null;

  async function handleSave() {
    if (!name.trim()) { setError("Ingresá un nombre para la tarjeta"); return; }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateCard(editing.id, { name: name.trim(), entity, color });
      } else {
        await createCard({ name: name.trim(), entity, color });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl px-5 pt-4 pb-10">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black uppercase tracking-tight">
            {editing ? "Editar tarjeta" : "Nueva tarjeta"}
          </h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-card-raised flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Preview */}
          <div
            className="rounded-2xl p-5 h-32 flex flex-col justify-between"
            style={{ background: `linear-gradient(135deg, ${color}dd, ${color}88)` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-xs font-bold tracking-widest uppercase">
                {entity === "visa" ? "VISA" : entity === "mastercard" ? "MASTERCARD" : "AMEX"}
              </span>
              <EntityLogo entity={entity} />
            </div>
            <span className="text-white font-black text-base tracking-wide">
              {name || "Nombre de la tarjeta"}
            </span>
          </div>

          {/* Nombre */}
          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Visa Galicia"
              className="w-full bg-card-raised border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Entidad */}
          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-2">
              Entidad
            </label>
            <div className="flex gap-2">
              {ENTITIES.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setEntity(e.value)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all"
                  style={
                    entity === e.value
                      ? { background: `${color}33`, color, border: `1.5px solid ${color}66` }
                      : { background: "hsl(var(--card-raised))", color: "hsl(245 12% 50%)", border: "1.5px solid transparent" }
                  }
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-full transition-all"
                  style={{
                    background: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-2xl text-sm font-black tracking-widest uppercase text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: color, boxShadow: `0 0 16px 2px ${color}44` }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Agregar tarjeta"}
          </button>
        </div>
      </div>
    </>
  );
}

export function EntityLogo({ entity }: { entity: CardEntity }) {
  if (entity === "visa") {
    return <span className="text-white font-black italic text-xl tracking-tighter">VISA</span>;
  }
  if (entity === "mastercard") {
    return (
      <div className="flex items-center">
        <div className="h-6 w-6 rounded-full bg-red-500" />
        <div className="h-6 w-6 rounded-full bg-yellow-400 -ml-3" />
      </div>
    );
  }
  return <span className="text-white font-black text-sm tracking-[0.2em]">AMEX</span>;
}
