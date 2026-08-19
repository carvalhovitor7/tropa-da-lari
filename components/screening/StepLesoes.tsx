"use client";

import { LESAO_TIPOS, QUANDO_TEMPO, SINTOMAS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Chip } from "@/components/ui/Chip";
import { YesNo } from "./YesNo";

export function StepLesoes() {
  const { state, setDraft } = useApp();
  const d = state.triagemDraft;

  return (
    <div className="px-5 pt-3.5 pb-8 flex flex-col gap-5.5">
      <div>
        <div className="text-[15px] font-bold text-ink mb-2.5">Já teve alguma lesão importante?</div>
        <YesNo value={d.temLesao} onYes={() => setDraft("temLesao", true)} onNo={() => setDraft("temLesao", false)} />
      </div>

      {d.temLesao === true && (
        <>
          <div>
            <label className="text-[13px] font-bold text-ink">Região</label>
            <input
              value={d.lesaoRegiao}
              onChange={(e) => setDraft("lesaoRegiao", e.target.value)}
              placeholder="ex: joelho direito"
              className="mt-1.5 w-full px-3.5 py-3 rounded-[14px] border border-border bg-white text-sm text-ink"
            />
          </div>
          <div>
            <div className="text-[13px] font-bold text-ink mb-2">Tipo</div>
            <div className="flex flex-wrap gap-2">
              {LESAO_TIPOS.map((lt) => (
                <Chip key={lt} small label={lt} active={d.lesaoTipo === lt} onClick={() => setDraft("lesaoTipo", lt)} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-ink mb-2">Quando ocorreu?</div>
            <div className="flex flex-wrap gap-2">
              {QUANDO_TEMPO.map((lq) => (
                <Chip key={lq} small label={lq} active={d.lesaoQuando === lq} onClick={() => setDraft("lesaoQuando", lq)} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-ink mb-2">Ainda sente algum sintoma?</div>
            <div className="flex flex-wrap gap-2">
              {SINTOMAS.map((ls) => (
                <Chip key={ls} small label={ls} active={d.lesaoSintoma === ls} onClick={() => setDraft("lesaoSintoma", ls)} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-[13px] font-bold text-ink">Diagnóstico informado (opcional)</label>
            <input
              value={d.lesaoDiagnostico}
              onChange={(e) => setDraft("lesaoDiagnostico", e.target.value)}
              className="mt-1.5 w-full px-3.5 py-3 rounded-[14px] border border-border bg-white text-sm text-ink"
            />
          </div>
        </>
      )}
    </div>
  );
}
