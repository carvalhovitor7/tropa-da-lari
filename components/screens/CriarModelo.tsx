"use client";

import { useApp } from "@/lib/store";

export function CriarModelo() {
  const { state, setModeloDraft, saveModelo, goBack } = useApp();

  return (
    <div className="px-5 pt-2 pb-28 flex flex-col gap-5">
      <div className="text-sm text-ink-soft">
        {state.exercises.length} exercício{state.exercises.length === 1 ? "" : "s"} nesse modelo.
      </div>
      <div>
        <label className="text-[13px] font-bold text-ink">Nome do modelo</label>
        <input
          autoFocus
          value={state.modeloDraft.name}
          onChange={(e) => setModeloDraft({ name: e.target.value })}
          placeholder="ex: Full body força 4x"
          className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
        />
      </div>
      <div>
        <label className="text-[13px] font-bold text-ink">Descrição (opcional)</label>
        <textarea
          value={state.modeloDraft.desc}
          onChange={(e) => setModeloDraft({ desc: e.target.value })}
          placeholder="ex: Ideal para alunos de nível intermediário, foco em força."
          className="mt-1.5 w-full min-h-[80px] px-4 py-3.5 rounded-[14px] border border-border bg-white text-sm text-ink resize-none"
        />
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
      <div className="flex flex-col gap-2 mt-2">
        <button onClick={goBack} className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer">
          Voltar e editar
        </button>
        <button
          onClick={saveModelo}
          disabled={!state.modeloDraft.name.trim() || state.exercises.length === 0}
          className="text-white border-none text-base font-bold py-4 rounded-full cursor-pointer disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
        >
          Salvar modelo
        </button>
      </div>
    </div>
  );
}
