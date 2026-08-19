"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Financeiro as FinanceiroRecord, PLANO_LABELS, PlanoTipo } from "@/lib/types";
import { computeFinanceiroStatus, proximoVencimento, STATUS_COLORS, STATUS_LABELS, STATUS_ORDER } from "@/lib/financeiro";
import { exportAlunosCsv, exportEvolucaoCsv, exportFinanceiroCsv } from "@/lib/export";
import { EvolucaoEntry } from "@/lib/types";

const PLANOS: PlanoTipo[] = ["diario", "semanal", "mensal", "trimestral"];

export function Financeiro() {
  const { state, updateSettings, toast } = useApp();
  const [entries, setEntries] = useState<Record<string, FinanceiroRecord>>({});
  const [loading, setLoading] = useState(true);
  const [pixDraft, setPixDraft] = useState(state.settings.pixKey);
  const [copied, setCopied] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors an external prop (settings fetched async elsewhere) into local editable draft state
    setPixDraft(state.settings.pixKey);
  }, [state.settings.pixKey]);

  const load = () => {
    setLoading(true);
    fetch("/api/financeiro", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((d: { entries: FinanceiroRecord[] }) => {
        const map: Record<string, FinanceiroRecord> = {};
        for (const e of d.entries ?? []) map[e.alunaId] = e;
        setEntries(map);
      })
      .catch(() => setEntries({}))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetches once on mount
    load();
  }, []);

  const rows = useMemo(() => {
    return state.alunas
      .map((a) => {
        const f = entries[a.id];
        const status = computeFinanceiroStatus(f);
        return { aluna: a, financeiro: f, status };
      })
      .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.aluna.name.localeCompare(b.aluna.name));
  }, [state.alunas, entries]);

  const receitaPrevista = useMemo(() => {
    return Object.values(entries).reduce((sum, f) => sum + (f.valor ?? 0), 0);
  }, [entries]);

  const save = async (alunaId: string, patch: Partial<FinanceiroRecord>) => {
    const current = entries[alunaId] ?? { alunaId, plano: "" as PlanoTipo | "", valor: null, dataPagamento: null };
    const next = { ...current, ...patch };
    setEntries((prev) => ({ ...prev, [alunaId]: next as FinanceiroRecord }));
    try {
      const res = await fetch("/api/financeiro", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunaId, plano: next.plano, valor: next.valor, dataPagamento: next.dataPagamento }),
      });
      if (res.ok) {
        const data = (await res.json()) as { entry: FinanceiroRecord };
        setEntries((prev) => ({ ...prev, [alunaId]: data.entry }));
      }
    } catch {
      toast("Não foi possível salvar agora.");
    }
  };

  const copyPix = async () => {
    if (!state.settings.pixKey) return;
    try {
      await navigator.clipboard.writeText(state.settings.pixKey);
      setCopied(true);
      toast("PIX copiado.");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast("Não foi possível copiar.");
    }
  };

  const savePix = () => {
    updateSettings({ pixKey: pixDraft.trim() });
    toast("Chave PIX salva.");
  };

  const cobrarWhatsapp = (row: (typeof rows)[number]) => {
    const { aluna, financeiro } = row;
    const digits = aluna.whatsapp.replace(/\D/g, "");
    const valor = financeiro?.valor ? `R$ ${financeiro.valor.toFixed(2)}` : "o valor combinado";
    const pix = state.settings.pixKey ? `\n\nChave PIX: ${state.settings.pixKey}` : "";
    const msg = `Oi, ${aluna.firstName}! Passando para lembrar do pagamento (${valor}) do seu plano.${pix}\n\nQualquer dúvida me chama!\nLari`;
    const url = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const doExportEvolucao = async () => {
    try {
      const res = await fetch("/api/evolucao", { cache: "no-store" });
      const data = (await res.json()) as { entries: EvolucaoEntry[] };
      exportEvolucaoCsv(state.alunas, data.entries ?? []);
    } catch {
      toast("Não foi possível exportar agora.");
    }
  };

  return (
    <div className="px-5 pt-5.5 pb-24 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="font-serif text-[28px] text-ink">Financeiro</div>
        <div className="relative">
          <button
            onClick={() => setExportOpen((v) => !v)}
            className="text-xs font-bold text-terracotta bg-white border border-border rounded-full px-3.5 py-2 cursor-pointer"
          >
            Exportar dados
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-20 bg-white rounded-[14px] border border-border shadow-lg flex flex-col p-1.5 w-52">
              <button
                onClick={() => {
                  exportAlunosCsv(state.alunas);
                  setExportOpen(false);
                }}
                className="text-left text-[13px] px-3 py-2.5 rounded-[10px] hover:bg-app cursor-pointer bg-transparent border-none text-ink"
              >
                CSV — Alunos
              </button>
              <button
                onClick={() => {
                  exportFinanceiroCsv(state.alunas, Object.values(entries));
                  setExportOpen(false);
                }}
                className="text-left text-[13px] px-3 py-2.5 rounded-[10px] hover:bg-app cursor-pointer bg-transparent border-none text-ink"
              >
                CSV — Financeiro
              </button>
              <button
                onClick={() => {
                  void doExportEvolucao();
                  setExportOpen(false);
                }}
                className="text-left text-[13px] px-3 py-2.5 rounded-[10px] hover:bg-app cursor-pointer bg-transparent border-none text-ink"
              >
                CSV — Evolução
              </button>
              <a
                href="/backup"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setExportOpen(false)}
                className="text-left text-[13px] px-3 py-2.5 rounded-[10px] hover:bg-app cursor-pointer text-ink no-underline"
              >
                Backup para impressão / PDF
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 flex flex-col gap-2.5" style={{ boxShadow: "0 10px 24px -14px rgba(58,52,46,0.22)" }}>
        <div className="text-[11px] font-bold uppercase tracking-wide text-ink-softer">Chave / link PIX</div>
        <div className="flex items-center gap-2">
          <input
            value={pixDraft}
            onChange={(e) => setPixDraft(e.target.value)}
            placeholder="ex: chave aleatória, e-mail ou telefone"
            className="flex-1 px-4 py-3 rounded-[14px] border border-border bg-white text-[14px] text-ink"
          />
          <button onClick={savePix} className="text-xs font-bold text-terracotta bg-transparent border-none cursor-pointer shrink-0">
            Salvar
          </button>
        </div>
        {state.settings.pixKey && (
          <button
            onClick={copyPix}
            className="self-start bg-sage-bg text-sage-text text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer border-none"
          >
            {copied ? "Copiado!" : "Copiar chave PIX"}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 10px 24px -14px rgba(58,52,46,0.22)" }}>
        <div className="text-[11px] font-bold uppercase tracking-wide text-ink-softer">Receita prevista (soma dos planos)</div>
        <div className="font-serif text-2xl text-ink mt-1">R$ {receitaPrevista.toFixed(2)}</div>
      </div>

      <div className="flex flex-col gap-2.5">
        {loading && <div className="text-sm text-ink-soft">Carregando…</div>}
        {!loading &&
          rows.map((row) => {
            const colors = STATUS_COLORS[row.status];
            const due = row.financeiro ? proximoVencimento(row.financeiro) : null;
            return (
              <div key={row.aluna.id} className="bg-white rounded-[18px] p-4 flex flex-col gap-2.5" style={{ boxShadow: "0 10px 24px -14px rgba(58,52,46,0.22)" }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold text-ink truncate">{row.aluna.name}</div>
                    {due && <div className="text-[11px] text-ink-softer">Vence {due.toLocaleDateString("pt-BR")}</div>}
                  </div>
                  <span
                    className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.dot }} />
                    {STATUS_LABELS[row.status]}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={row.financeiro?.plano ?? ""}
                    onChange={(e) => save(row.aluna.id, { plano: e.target.value as PlanoTipo | "" })}
                    className="px-2.5 py-2.5 rounded-[10px] border border-border bg-white text-[12px] text-ink"
                  >
                    <option value="">Plano</option>
                    {PLANOS.map((p) => (
                      <option key={p} value={p}>
                        {PLANO_LABELS[p]}
                      </option>
                    ))}
                  </select>
                  <input
                    defaultValue={row.financeiro?.valor ?? ""}
                    onBlur={(e) => save(row.aluna.id, { valor: e.target.value ? Number(e.target.value.replace(",", ".")) : null })}
                    inputMode="decimal"
                    placeholder="R$"
                    className="px-2.5 py-2.5 rounded-[10px] border border-border bg-white text-[12px] text-ink"
                  />
                  <input
                    type="date"
                    defaultValue={row.financeiro?.dataPagamento ?? ""}
                    onChange={(e) => save(row.aluna.id, { dataPagamento: e.target.value || null })}
                    className="px-2.5 py-2.5 rounded-[10px] border border-border bg-white text-[12px] text-ink"
                  />
                </div>
                <button
                  onClick={() => cobrarWhatsapp(row)}
                  className="self-start text-white border-none text-[12px] font-bold px-3.5 py-2 rounded-full cursor-pointer flex items-center gap-1.5"
                  style={{ background: "#25D366" }}
                >
                  Cobrar via WhatsApp
                </button>
              </div>
            );
          })}
        {!loading && rows.length === 0 && <div className="text-sm text-ink-soft">Nenhum aluno cadastrado ainda.</div>}
      </div>
    </div>
  );
}
