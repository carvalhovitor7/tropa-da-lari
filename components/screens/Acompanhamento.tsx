"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { EvolucaoEntry, EvolucaoMedidas } from "@/lib/types";
import { isAlunaVencida, formatDatePt } from "@/lib/dates";
import { alunoNoun } from "@/lib/gender";

const MEDIDA_FIELDS: { key: keyof EvolucaoMedidas; label: string }[] = [
  { key: "cintura", label: "Cintura (cm)" },
  { key: "quadril", label: "Quadril (cm)" },
  { key: "braco", label: "Braço (cm)" },
  { key: "coxa", label: "Coxa (cm)" },
];

// Uploads a photo to Vercel Blob via /api/upload; if that's unavailable
// (network error, or the Blob store isn't configured in this environment),
// falls back to a base64 data URL read client-side, so logging an evolução
// entry with photos never hard-fails (item 5 photo storage fallback).
async function uploadOrEncode(file: File): Promise<string> {
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (res.ok) {
      const data = (await res.json()) as { url: string };
      if (data.url) return data.url;
    }
  } catch {
    // fall through to base64
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function Acompanhamento() {
  const { state, setAlunaId, toast, updateSettings } = useApp();
  const [renewalDraft, setRenewalDraft] = useState(String(state.settings.renewalWeeks));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors an external prop (settings fetched async elsewhere) into local editable draft state
    setRenewalDraft(String(state.settings.renewalWeeks));
  }, [state.settings.renewalWeeks]);
  const aluna = state.alunas.find((a) => a.id === state.alunaId) || state.alunas[0];
  const [entries, setEntries] = useState<EvolucaoEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form draft for logging a new entry.
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [peso, setPeso] = useState("");
  const [medidas, setMedidas] = useState<EvolucaoMedidas>({});
  const [fotos, setFotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = (alunaId: string) => {
    setLoading(true);
    fetch(`/api/evolucao?alunaId=${encodeURIComponent(alunaId)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((d: { entries: EvolucaoEntry[] }) => setEntries(d.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches from the server whenever the selected aluna changes
    if (aluna) load(aluna.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aluna?.id]);

  const vencidas = useMemo(
    () => state.alunas.filter((a) => a.hasTreinos && isAlunaVencida(a.treinos, state.settings.renewalWeeks)),
    [state.alunas, state.settings.renewalWeeks]
  );

  const pesoTrend = useMemo(() => {
    const withPeso = entries.filter((e) => typeof e.peso === "number");
    if (withPeso.length < 2) return null;
    const first = withPeso[0].peso as number;
    const last = withPeso[withPeso.length - 1].peso as number;
    return { first, last, delta: last - first };
  }, [entries]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadOrEncode));
      setFotos((prev) => [...prev, ...urls]);
    } catch {
      toast("Não foi possível anexar a foto agora.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!aluna) return;
    setSaving(true);
    try {
      const res = await fetch("/api/evolucao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alunaId: aluna.id,
          data,
          peso: peso.trim() ? Number(peso.replace(",", ".")) : null,
          medidas,
          fotos,
        }),
      });
      if (!res.ok) throw new Error("failed");
      toast("Evolução registrada.");
      setPeso("");
      setMedidas({});
      setFotos([]);
      load(aluna.id);
    } catch {
      toast("Não foi possível salvar agora. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (id: string) => {
    if (!aluna) return;
    try {
      const res = await fetch(`/api/evolucao/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast("Entrada removida.");
    } catch {
      toast("Não foi possível remover agora.");
    }
  };

  if (!aluna) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2.5 p-10 text-center">
        <div className="font-serif text-2xl text-ink">Acompanhamento</div>
        <div className="text-sm text-ink-soft">Adicione um aluno para começar a registrar a evolução.</div>
      </div>
    );
  }

  const noun = alunoNoun(aluna.genero);

  return (
    <div className="px-5 pt-5.5 pb-24 flex flex-col gap-5">
      <div className="font-serif text-[28px] text-ink">Acompanhamento</div>

      <div className="bg-white rounded-2xl p-3.5 flex items-center gap-2.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.15)" }}>
        <span className="text-[13px] text-ink flex-1">Avisar quando um treino ficar sem atualização por</span>
        <input
          value={renewalDraft}
          onChange={(e) => setRenewalDraft(e.target.value.replace(/\D/g, ""))}
          onBlur={() => {
            const n = Number.parseInt(renewalDraft, 10);
            if (Number.isFinite(n) && n > 0) updateSettings({ renewalWeeks: n });
            else setRenewalDraft(String(state.settings.renewalWeeks));
          }}
          inputMode="numeric"
          className="w-12 text-center px-2 py-1.5 rounded-[10px] border border-border text-[14px] font-bold text-ink"
        />
        <span className="text-[13px] text-ink">semanas</span>
      </div>

      {vencidas.length > 0 && (
        <div className="rounded-2xl p-3.5" style={{ background: "#FBF0DC" }}>
          <div className="text-[13px] font-bold" style={{ color: "#B08628" }}>
            ⚠ {vencidas.length} {vencidas.length === 1 ? "aluno está" : "alunos estão"} com treino vencido (sem
            atualização há mais de {state.settings.renewalWeeks} semanas)
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {vencidas.map((a) => (
              <button
                key={a.id}
                onClick={() => setAlunaId(a.id)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white cursor-pointer border-none"
                style={{ color: "#B08628" }}
              >
                {a.firstName}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {state.alunas.map((a) => (
          <button
            key={a.id}
            onClick={() => setAlunaId(a.id)}
            className="shrink-0 flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: a.id === aluna.id ? "linear-gradient(135deg,#C9A0E8,#4C3A9E)" : "#EDE7FA",
                color: a.id === aluna.id ? "#FFFFFF" : "#5B4E9E",
              }}
            >
              {a.initials}
            </div>
            <span className="text-[11px] text-ink font-semibold max-w-14 overflow-hidden text-ellipsis whitespace-nowrap">
              {a.firstName}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 flex flex-col gap-3.5" style={{ boxShadow: "0 10px 24px -14px rgba(58,52,46,0.22)" }}>
        <div className="text-sm font-bold text-ink">Nova entrada · {aluna.firstName}</div>
        <div>
          <label className="text-[13px] font-bold text-ink">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="mt-1.5 w-full px-4 py-3 rounded-[14px] border border-border bg-white text-[15px] text-ink"
          />
        </div>
        <div>
          <label className="text-[13px] font-bold text-ink">Peso (kg)</label>
          <input
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            inputMode="decimal"
            placeholder="ex: 62.5"
            className="mt-1.5 w-full px-4 py-3 rounded-[14px] border border-border bg-white text-[15px] text-ink"
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {MEDIDA_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="text-[13px] font-bold text-ink">{label}</label>
              <input
                value={medidas[key] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setMedidas((m) => ({ ...m, [key]: v === "" ? undefined : Number(v.replace(",", ".")) }));
                }}
                inputMode="decimal"
                className="mt-1.5 w-full px-4 py-3 rounded-[14px] border border-border bg-white text-[15px] text-ink"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="text-[13px] font-bold text-ink">Fotos</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {fotos.map((f, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- data: URLs (base64 fallback) aren't supported by next/image
              <img key={i} src={f} alt="" className="w-14 h-14 rounded-[10px] object-cover border border-border" />
            ))}
            <label className="w-14 h-14 rounded-[10px] border border-dashed border-border flex items-center justify-center cursor-pointer text-ink-soft text-xl">
              {uploading ? "…" : "+"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
            </label>
          </div>
        </div>
        <button
          onClick={submit}
          disabled={saving}
          className="text-white border-none text-[15px] font-bold py-3.5 rounded-full cursor-pointer disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
        >
          {saving ? "Salvando…" : "Registrar evolução"}
        </button>
      </div>

      {pesoTrend && (
        <div className="bg-sage-bg rounded-2xl p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wide text-sage-text">Peso — primeiro vs. mais recente</div>
          <div className="text-sm text-sage-text font-semibold mt-1">
            {pesoTrend.first} kg → {pesoTrend.last} kg ({pesoTrend.delta > 0 ? "+" : ""}
            {pesoTrend.delta.toFixed(1)} kg)
          </div>
        </div>
      )}

      <div>
        <div className="text-sm font-bold text-ink mb-2.5">Histórico</div>
        {loading ? (
          <div className="text-sm text-ink-soft">Carregando…</div>
        ) : entries.length === 0 ? (
          <div className="text-sm text-ink-soft">
            Nenhuma entrada registrada para {agree(noun)} ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {[...entries].reverse().map((e) => (
              <div key={e.id} className="bg-white border border-border rounded-[14px] p-3.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  {/* e.data is a bare YYYY-MM-DD date; appending a midday time avoids
                      the calendar day shifting when parsed as UTC in timezones behind it. */}
                  <div className="text-[13px] font-bold text-ink">{formatDatePt(`${e.data}T12:00:00`)}</div>
                  <button onClick={() => removeEntry(e.id)} className="text-[11px] font-bold cursor-pointer bg-transparent border-none" style={{ color: "#B5473A" }}>
                    Remover
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-soft">
                  {typeof e.peso === "number" && (
                    <span>
                      Peso <b className="text-ink">{e.peso} kg</b>
                    </span>
                  )}
                  {MEDIDA_FIELDS.filter(({ key }) => typeof e.medidas?.[key] === "number").map(({ key, label }) => (
                    <span key={key}>
                      {label.split(" ")[0]} <b className="text-ink">{e.medidas[key]}</b>
                    </span>
                  ))}
                </div>
                {e.fotos.length > 0 && (
                  <div className="flex gap-2 mt-1">
                    {e.fotos.map((f, i) => (
                      // eslint-disable-next-line @next/next/no-img-element -- data: URLs (base64 fallback) aren't supported by next/image
                      <img key={i} src={f} alt="" className="w-12 h-12 rounded-[8px] object-cover border border-border" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function agree(noun: "aluno" | "aluna") {
  return noun === "aluna" ? "ela" : "ele";
}
