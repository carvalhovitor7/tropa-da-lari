"use client";

import { useApp } from "@/lib/store";

export function StepRevisao() {
  const { state, setDraft } = useApp();
  const d = state.triagemDraft;

  return (
    <div className="px-5 pt-3.5 pb-8 flex flex-col gap-4.5">
      <div className="text-sm text-ink-soft leading-relaxed">
        Revise as informações antes de usá-las no treino. Você pode complementar com sua avaliação profissional.
      </div>
      <div>
        <label className="text-[13px] font-bold text-ink">Observações profissionais (opcional)</label>
        <textarea
          value={d.observacaoLarissa}
          onChange={(e) => setDraft("observacaoLarissa", e.target.value)}
          placeholder="ex: Evitar agachamento profundo por enquanto."
          className="mt-1.5 w-full min-h-[90px] px-3.5 py-3 rounded-[14px] border border-border bg-white text-sm text-ink resize-none"
        />
      </div>
    </div>
  );
}
