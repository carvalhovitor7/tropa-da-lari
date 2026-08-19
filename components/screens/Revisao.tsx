"use client";

import { currentAluna, useApp } from "@/lib/store";

export function Revisao() {
  const { state, goTo, approve } = useApp();
  const aluna = currentAluna(state);

  return (
    <div className="px-5 pt-2 pb-28 flex flex-col gap-4.5">
      <div>
        <div className="font-serif text-[26px] text-ink">{aluna.firstName}</div>
        <div className="text-sm text-ink-soft">
          {state.treinoName} — {state.treinoFoco}
        </div>
      </div>
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
                {!!ex.carga && <span className="text-terracotta"> • {ex.carga} kg</span>}
                <span className="text-ink-softer font-semibold"> • {ex.descanso}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
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
