"use client";

import { currentAluna, useApp } from "@/lib/store";

export function Revisao() {
  const { state, goTo, approve, setTreinoEnfase, setTreinoObsTreinadora } = useApp();
  const aluna = currentAluna(state);

  return (
    <div className="px-5 pt-2 pb-28 flex flex-col gap-4.5">
      <div>
        <div className="font-serif text-[26px] text-ink">{aluna.firstName}</div>
        <div className="text-sm text-ink-soft">
          {state.treinoName} — {state.treinoFoco}
        </div>
      </div>

      <div>
        <div className="text-[13px] font-bold text-ink mb-2">Ênfase deste treino (aparece na ficha)</div>
        <input
          value={state.treinoEnfase}
          onChange={(e) => setTreinoEnfase(e.target.value)}
          placeholder="ex: Glúteos e posteriores"
          className="w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-sm text-ink"
        />
      </div>

      <div>
        <div className="text-[13px] font-bold text-ink mb-2">Observação da treinadora (aparece na ficha)</div>
        <textarea
          value={state.treinoObsTreinadora}
          onChange={(e) => setTreinoObsTreinadora(e.target.value)}
          placeholder="ex: Priorize a execução antes de aumentar a carga."
          className="w-full min-h-[70px] px-4 py-3.5 rounded-[14px] border border-border bg-white text-sm text-ink resize-none"
        />
      </div>

      {!!state.weeklyRepTargets.length && (
        <div className="bg-sage-bg rounded-2xl px-3.5 py-3 flex flex-col gap-1.5">
          <div className="text-[11px] font-bold text-sage-text uppercase tracking-wide">Ênfase semanal</div>
          <div className="flex flex-wrap gap-1.5">
            {state.weeklyRepTargets.map((w) => (
              <span key={w.grupo} className="bg-white text-sage-text text-[11px] font-bold px-2.5 py-1 rounded-full">
                {w.grupo}: {w.reps} reps/semana
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {state.exercises.map((ex, i) => (
          <div key={ex.id} className="flex gap-3">
            <div className="w-6.5 h-6.5 rounded-full bg-sage-bg text-sage text-[13px] font-extrabold flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            <div>
              <div className="text-[15px] font-bold text-ink">{ex.name}</div>
              <div className="text-[13px] font-bold text-sage mt-0.5">
                {ex.series} × {ex.reps}
                {!!ex.carga && <span className="text-terracotta"> • {ex.carga}</span>}
                <span className="text-ink-softer font-semibold"> • {ex.descanso}</span>
              </div>
            </div>
          </div>
        ))}
        {state.exercises.length === 0 && <div className="text-sm text-ink-soft">Nenhum exercício adicionado ainda.</div>}
      </div>

      {!!state.treinoVersions.length && (
        <div>
          <div className="text-sm font-bold text-ink mb-2">Histórico de alterações</div>
          <div className="flex flex-col gap-2">
            {state.treinoVersions.map((v, i) => (
              <div key={i} className="bg-white border border-border rounded-[14px] px-3.5 py-3">
                <div className="text-[11px] font-bold text-ink-softer mb-1">
                  {new Date(v.at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </div>
                <div className="text-[13px] text-ink leading-relaxed">{v.changes.join(" ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-2.5">
        <button
          onClick={() => goTo("montador")}
          className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer"
        >
          Voltar e editar
        </button>
        <button
          onClick={approve}
          className="bg-ink text-white border-none text-base font-bold py-4 rounded-full cursor-pointer flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Está tudo certo
        </button>
      </div>
    </div>
  );
}
