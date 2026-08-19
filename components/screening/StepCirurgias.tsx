"use client";

import { QUANDO_TEMPO } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Chip } from "@/components/ui/Chip";
import { YesNo } from "./YesNo";

export function StepCirurgias() {
  const { state, setDraft } = useApp();
  const d = state.triagemDraft;

  return (
    <div className="px-5 pt-3.5 pb-8 flex flex-col gap-5.5">
      <div>
        <div className="text-[15px] font-bold text-ink mb-2.5">Já realizou alguma cirurgia que possa influenciar os exercícios?</div>
        <YesNo value={d.temCirurgia} onYes={() => setDraft("temCirurgia", true)} onNo={() => setDraft("temCirurgia", false)} />
      </div>

      {d.temCirurgia === true && (
        <>
          <div>
            <label className="text-[13px] font-bold text-ink">Região / cirurgia realizada</label>
            <input
              value={d.cirurgiaRegiao}
              onChange={(e) => setDraft("cirurgiaRegiao", e.target.value)}
              placeholder="ex: joelho — artroscopia"
              className="mt-1.5 w-full px-3.5 py-3 rounded-[14px] border border-border bg-white text-sm text-ink"
            />
          </div>
          <div>
            <div className="text-[13px] font-bold text-ink mb-2">Quando?</div>
            <div className="flex flex-wrap gap-2">
              {QUANDO_TEMPO.map((cq) => (
                <Chip key={cq} small label={cq} active={d.cirurgiaQuando === cq} onClick={() => setDraft("cirurgiaQuando", cq)} />
              ))}
            </div>
          </div>
          <div>
            <label className="text-[13px] font-bold text-ink">Possui alguma restrição atualmente? (opcional)</label>
            <input
              value={d.cirurgiaRestricao}
              onChange={(e) => setDraft("cirurgiaRestricao", e.target.value)}
              className="mt-1.5 w-full px-3.5 py-3 rounded-[14px] border border-border bg-white text-sm text-ink"
            />
          </div>
        </>
      )}
    </div>
  );
}
