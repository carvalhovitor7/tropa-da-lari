"use client";

import { useEffect, useState } from "react";
import { currentAluna, useApp } from "@/lib/store";
import { computeAlert, computeWarnings } from "@/lib/screening";

export function Perfil() {
  const { state, onFazerTriagem, onVerTriagem, onNovoTreino, onDuplicarAnterior, onUsarModelo, openTreino, syncTriagens, toast } = useApp();
  const aluna = currentAluna(state);
  const triagem = state.triagens[aluna.id];
  const alert = computeAlert(triagem);
  const warnings = computeWarnings(triagem);
  const [copying, setCopying] = useState(false);

  // Pull any triagem submitted from the student's own phone since we last
  // loaded this profile.
  useEffect(() => {
    syncTriagens();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per profile visit
  }, [aluna.id]);

  const copyLink = async () => {
    setCopying(true);
    try {
      const res = await fetch(`/api/alunas/${aluna.id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("not_found");
      const data = (await res.json()) as { aluna: { screeningToken: string } };
      const url = `${window.location.origin}/triagem/${data.aluna.screeningToken}`;
      await navigator.clipboard.writeText(url);
      toast("Link copiado.");
    } catch {
      toast("Não foi possível gerar o link agora.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="px-5 pt-2 pb-24 flex flex-col gap-5.5">
      <div className="flex gap-3.5 items-center">
        <div
          className="w-15 h-15 rounded-full flex items-center justify-center text-sage font-bold text-xl bg-sage-bg shrink-0"
          style={{ boxShadow: "0 6px 16px -8px rgba(58,52,46,0.3)" }}
        >
          {aluna.initials}
        </div>
        <div>
          <div className="font-serif text-2xl text-ink">{aluna.name}</div>
          <div className="text-[13px] text-ink-soft">{aluna.level}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-[14px] p-3.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.18)" }}>
          <div className="text-[11px] text-ink-softer font-bold uppercase tracking-wide">Objetivo</div>
          <div className="text-sm text-ink font-semibold mt-1">{aluna.goal}</div>
        </div>
        <div className="bg-white rounded-[14px] p-3.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.18)" }}>
          <div className="text-[11px] text-ink-softer font-bold uppercase tracking-wide">Frequência</div>
          <div className="text-sm text-ink font-semibold mt-1">{aluna.freq}</div>
        </div>
      </div>

      {aluna.notes && <div className="bg-sage-bg rounded-[14px] p-3.5 text-[13px] text-sage-text">{aluna.notes}</div>}

      {triagem ? (
        <button
          onClick={onVerTriagem}
          className="text-left border-none rounded-2xl p-3.5 flex items-center gap-2.5 cursor-pointer"
          style={{ background: alert.bg }}
        >
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: alert.dot }} />
          <div className="flex-1">
            <div className="text-[13px] font-bold text-ink">Triagem · {alert.title}</div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {warnings.map((w) => (
                <span key={w} className="bg-white text-[#8A3B2C] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  ⚠ {w}
                </span>
              ))}
            </div>
          </div>
          <span className="text-xs font-bold text-terracotta shrink-0">Ver tudo</span>
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={copyLink}
            disabled={copying}
            className="text-left bg-white rounded-2xl p-3.5 flex items-center gap-2.5 cursor-pointer disabled:opacity-60"
            style={{ border: "1.5px dashed #BC6B52" }}
          >
            <div className="w-9 h-9 rounded-full bg-terracotta-pill flex items-center justify-center shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A15840" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" />
                <path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-ink">Copiar link de triagem de {aluna.firstName}</div>
              <div className="text-xs text-ink-soft mt-0.5">Ela preenche pelo próprio celular, 3–5 min.</div>
            </div>
          </button>
          <button
            onClick={onFazerTriagem}
            className="text-left bg-transparent border-none px-3.5 py-1 text-xs font-semibold text-ink-soft cursor-pointer self-start"
          >
            ou preencher com ela agora
          </button>
        </div>
      )}

      <div>
        <div className="text-sm font-bold text-ink mb-2.5">Treinos</div>
        {aluna.hasTreinos ? (
          <div className="flex flex-col gap-2.5">
            {aluna.treinos.map((tr) => (
              <button
                key={tr.id}
                onClick={() => openTreino(tr)}
                className="flex justify-between items-center bg-white border border-border rounded-[14px] px-4 py-3.5 cursor-pointer text-left"
              >
                <div>
                  <div className="text-[15px] font-bold text-ink">{tr.name}</div>
                  <div className="text-[13px] text-ink-soft">{tr.foco}</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BC6B52" strokeWidth={2.2} strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl px-5 py-7 text-center flex flex-col gap-2.5 items-center"
            style={{ boxShadow: "0 8px 20px -12px rgba(58,52,46,0.15)" }}
          >
            <div className="text-sm text-ink font-semibold">Nenhum treino criado ainda.</div>
            <div className="text-[13px] text-ink-soft">Comece montando o primeiro treino de {aluna.firstName}.</div>
            <button
              onClick={onNovoTreino}
              className="mt-1.5 text-white border-none text-sm font-bold px-5 py-3 rounded-full cursor-pointer"
              style={{ background: "linear-gradient(135deg,#CD8468,#A15840)" }}
            >
              Criar primeiro treino
            </button>
          </div>
        )}
      </div>

      {aluna.hasTreinos && (
        <div className="flex flex-col gap-2">
          <button onClick={onNovoTreino} className="bg-ink text-white border-none text-sm font-bold py-3.5 rounded-full cursor-pointer">
            + Novo treino
          </button>
          <button
            onClick={onDuplicarAnterior}
            className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer"
          >
            Duplicar treino anterior
          </button>
          <button onClick={onUsarModelo} className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer">
            Usar modelo
          </button>
        </div>
      )}
    </div>
  );
}
