"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { FOCOS, FREQUENCIAS, OBJETIVOS } from "@/lib/data";
import { Chip } from "@/components/ui/Chip";
import { Genero } from "@/lib/types";
import { isAlunaVencida } from "@/lib/dates";

export function Alunas() {
  const {
    state,
    setAlunaSearch,
    openPerfil,
    openAddAluna,
    closeAddAluna,
    chooseAddAlunaMode,
    setAddAlunaDraft,
    submitAddAlunaLink,
    submitAddAlunaManual,
    toast,
    setAlunaFilterObjetivo,
    setAlunaFilterNivel,
    setAlunaFilterVencido,
    setAlunaFilterFoco,
  } = useApp();

  const objetivosPresentes = useMemo(
    () => Array.from(new Set(state.alunas.map((a) => a.goal).filter(Boolean))),
    [state.alunas]
  );
  const niveisPresentes = useMemo(() => Array.from(new Set(state.alunas.map((a) => a.level).filter(Boolean))), [state.alunas]);
  // "Tipo de treino": the set of `foco` values actually used across any
  // treino of any aluna, ordered to match the FOCOS list used in
  // Iniciar.tsx so the chip order stays predictable rather than
  // alphabetical/insertion-order.
  const focosPresentes = useMemo(() => {
    const present = new Set(state.alunas.flatMap((a) => a.treinos.map((t) => t.foco).filter(Boolean)));
    return FOCOS.filter((f) => present.has(f));
  }, [state.alunas]);

  const filtered = state.alunas.filter((a) => {
    if (!a.name.toLowerCase().includes(state.alunaSearch.toLowerCase())) return false;
    if (state.alunaFilterObjetivo && a.goal !== state.alunaFilterObjetivo) return false;
    if (state.alunaFilterNivel && a.level !== state.alunaFilterNivel) return false;
    if (state.alunaFilterVencido && !isAlunaVencida(a.treinos, state.settings.renewalWeeks)) return false;
    if (state.alunaFilterFoco && !a.treinos.some((t) => t.foco === state.alunaFilterFoco)) return false;
    return true;
  });
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (!state.addAlunaLinkUrl) return;
    try {
      await navigator.clipboard.writeText(state.addAlunaLinkUrl);
      setCopied(true);
      toast("Link copiado.");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast("Não foi possível copiar o link.");
    }
  };

  return (
    <div className="px-5 pt-5.5 pb-24 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-serif text-[28px] text-ink">Alunos</div>
        <button
          onClick={openAddAluna}
          className="shrink-0 text-white border-none text-[13px] font-bold px-4 py-2.5 rounded-full cursor-pointer flex items-center gap-1.5"
          style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar aluno
        </button>
      </div>
      <input
        value={state.alunaSearch}
        onChange={(e) => setAlunaSearch(e.target.value)}
        placeholder="Buscar aluno…"
        className="w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
      />

      {(objetivosPresentes.length > 0 || niveisPresentes.length > 0 || focosPresentes.length > 0) && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-bold text-ink-softer uppercase tracking-wide">Status</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Chip label="Treino vencido" small active={state.alunaFilterVencido} onClick={() => setAlunaFilterVencido(!state.alunaFilterVencido)} />
            </div>
          </div>
          {niveisPresentes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-ink-softer uppercase tracking-wide">Nível</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {niveisPresentes.map((n) => (
                  <Chip key={n} label={n} small active={state.alunaFilterNivel === n} onClick={() => setAlunaFilterNivel(state.alunaFilterNivel === n ? null : n)} />
                ))}
              </div>
            </div>
          )}
          {objetivosPresentes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-ink-softer uppercase tracking-wide">Objetivo</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {objetivosPresentes.map((o) => (
                  <Chip
                    key={o}
                    label={o}
                    small
                    active={state.alunaFilterObjetivo === o}
                    onClick={() => setAlunaFilterObjetivo(state.alunaFilterObjetivo === o ? null : o)}
                  />
                ))}
              </div>
            </div>
          )}
          {focosPresentes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-ink-softer uppercase tracking-wide">Tipo de treino</div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {focosPresentes.map((f) => (
                  <Chip
                    key={f}
                    label={f}
                    small
                    active={state.alunaFilterFoco === f}
                    onClick={() => setAlunaFilterFoco(state.alunaFilterFoco === f ? null : f)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((al) => (
          <div key={al.id} className="bg-white rounded-[18px] p-4 flex flex-col gap-2.5" style={{ boxShadow: "0 10px 24px -14px rgba(58,52,46,0.22)" }}>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sage font-bold bg-sage-bg shrink-0">{al.initials}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="text-base font-bold text-ink">{al.name}</div>
                  {isAlunaVencida(al.treinos, state.settings.renewalWeeks) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FBF0DC", color: "#836318" }}>
                      Treino vencido
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-ink-soft">{al.goal || "Perfil ainda incompleto"}</div>
              </div>
            </div>
            <div className="flex gap-3.5 text-xs text-ink-softer pl-[60px]">
              <span>{al.freq}</span>
              {al.last && <span>Atualizado {al.last}</span>}
            </div>
            <button
              onClick={() => openPerfil(al.id)}
              className="self-start ml-[60px] bg-terracotta-strong text-white border-none text-[13px] font-bold px-4 py-2.5 rounded-full cursor-pointer"
            >
              Montar treino
            </button>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-6 text-sm text-ink-soft">Nenhum aluno encontrado.</div>}
      </div>

      {state.addAlunaMode !== "closed" && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4" onClick={closeAddAluna}>
          <div
            className="w-full sm:max-w-[420px] bg-app rounded-t-[24px] sm:rounded-[24px] p-5 pb-7 flex flex-col gap-4 max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {state.addAlunaMode === "choose" && (
              <>
                <div className="font-serif text-[22px] text-ink">Adicionar aluno</div>
                <button
                  onClick={() => chooseAddAlunaMode("link")}
                  className="text-left bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                  style={{ border: "1.5px dashed #7C4DBD" }}
                >
                  <div className="w-9 h-9 rounded-full bg-terracotta-pill flex items-center justify-center shrink-0">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4C3A9E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" />
                      <path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink">Convidar por link</div>
                    <div className="text-xs text-ink-soft mt-0.5">Digite só o nome e envie o link de triagem.</div>
                  </div>
                </button>
                <button
                  onClick={() => chooseAddAlunaMode("manual")}
                  className="text-left bg-white rounded-2xl p-4 flex items-center gap-3 cursor-pointer border border-border"
                >
                  <div className="w-9 h-9 rounded-full bg-sage-bg flex items-center justify-center shrink-0">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5B4E9E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink">Cadastro manual</div>
                    <div className="text-xs text-ink-soft mt-0.5">Preencha os dados do aluno você mesma.</div>
                  </div>
                </button>
                <button onClick={closeAddAluna} className="bg-transparent border-none text-[13px] font-semibold text-ink-soft cursor-pointer min-h-11">
                  Cancelar
                </button>
              </>
            )}

            {state.addAlunaMode === "link" && !state.addAlunaLinkUrl && (
              <>
                <div className="font-serif text-[22px] text-ink">Convidar por link</div>
                <div>
                  <label className="text-[13px] font-bold text-ink">Nome do aluno</label>
                  <input
                    autoFocus
                    value={state.addAlunaDraft.name}
                    onChange={(e) => setAddAlunaDraft({ name: e.target.value })}
                    placeholder="ex: Mariana Costa"
                    className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
                  />
                </div>
                <button
                  onClick={submitAddAlunaLink}
                  disabled={state.addAlunaBusy || !state.addAlunaDraft.name.trim()}
                  className="text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
                >
                  {state.addAlunaBusy ? "Gerando link…" : "Gerar link de triagem"}
                </button>
                <button onClick={closeAddAluna} className="bg-transparent border-none text-[13px] font-semibold text-ink-soft cursor-pointer min-h-11">
                  Cancelar
                </button>
              </>
            )}

            {state.addAlunaMode === "link" && state.addAlunaLinkUrl && (
              <>
                <div className="font-serif text-[22px] text-ink">Link pronto!</div>
                <div className="text-[13px] text-ink-soft">
                  {state.addAlunaDraft.name.split(" ")[0]} preenche a triagem pelo próprio celular, 3–5 min.
                </div>
                <div className="bg-white border border-border rounded-[14px] px-4 py-3.5 text-[13px] text-ink break-all">{state.addAlunaLinkUrl}</div>
                <button
                  onClick={copyLink}
                  className="text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer"
                  style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
                >
                  {copied ? "Copiado!" : "Copiar link"}
                </button>
                <button onClick={closeAddAluna} className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer">
                  Concluir
                </button>
              </>
            )}

            {state.addAlunaMode === "manual" && (
              <>
                <div className="font-serif text-[22px] text-ink">Cadastro manual</div>
                <div>
                  <label className="text-[13px] font-bold text-ink">Nome</label>
                  <input
                    autoFocus
                    value={state.addAlunaDraft.name}
                    onChange={(e) => setAddAlunaDraft({ name: e.target.value })}
                    placeholder="ex: Mariana Costa"
                    className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-ink">Gênero</label>
                  <div className="mt-1.5 flex gap-2">
                    {(
                      [
                        ["feminino", "Feminino"],
                        ["masculino", "Masculino"],
                        ["nao_informado", "Prefiro não dizer"],
                      ] as [Genero, string][]
                    ).map(([value, label]) => (
                      <Chip
                        key={value}
                        small
                        label={label}
                        active={state.addAlunaDraft.genero === value}
                        onClick={() => setAddAlunaDraft({ genero: value })}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-ink">Objetivo</label>
                  <select
                    value={state.addAlunaDraft.goal}
                    onChange={(e) => setAddAlunaDraft({ goal: e.target.value })}
                    className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
                  >
                    <option value="">Selecionar…</option>
                    {OBJETIVOS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[13px] font-bold text-ink">Frequência</label>
                    <select
                      value={state.addAlunaDraft.freq}
                      onChange={(e) => setAddAlunaDraft({ freq: e.target.value })}
                      className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
                    >
                      <option value="">—</option>
                      {FREQUENCIAS.map((f) => (
                        <option key={f} value={`${f} por semana`}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-ink">Nível</label>
                    <select
                      value={state.addAlunaDraft.level}
                      onChange={(e) => setAddAlunaDraft({ level: e.target.value })}
                      className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
                    >
                      <option value="">—</option>
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediária">Intermediária</option>
                      <option value="Avançada">Avançada</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[13px] font-bold text-ink">Idade (opcional)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={state.addAlunaDraft.idade}
                      onChange={(e) => setAddAlunaDraft({ idade: e.target.value })}
                      placeholder="anos"
                      className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-ink">Local de treino</label>
                    <input
                      value={state.addAlunaDraft.local}
                      onChange={(e) => setAddAlunaDraft({ local: e.target.value })}
                      placeholder="ex: Academia"
                      className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-ink">WhatsApp (opcional)</label>
                  <input
                    value={state.addAlunaDraft.whatsapp}
                    onChange={(e) => setAddAlunaDraft({ whatsapp: e.target.value })}
                    placeholder="ex: 11 91234-5678"
                    inputMode="tel"
                    className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-bold text-ink">Instagram (opcional)</label>
                  <div className="mt-1.5 flex items-center gap-2 px-4 py-3.5 rounded-[14px] border border-border bg-white">
                    <span className="text-ink-softer text-[15px]">@</span>
                    <input
                      value={state.addAlunaDraft.instagram}
                      onChange={(e) => setAddAlunaDraft({ instagram: e.target.value.replace(/^@/, "") })}
                      placeholder="usuario"
                      className="flex-1 text-[15px] text-ink outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={submitAddAlunaManual}
                  disabled={state.addAlunaBusy || !state.addAlunaDraft.name.trim()}
                  className="text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
                >
                  {state.addAlunaBusy ? "Salvando…" : "Salvar aluno"}
                </button>
                <button onClick={closeAddAluna} className="bg-transparent border-none text-[13px] font-semibold text-ink-soft cursor-pointer min-h-11">
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
