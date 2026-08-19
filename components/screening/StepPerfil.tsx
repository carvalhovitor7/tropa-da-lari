"use client";

import { EXPERIENCIAS, FREQUENCIAS, OBJETIVOS, TEMPOS } from "@/lib/data";
import { useTriagemForm } from "@/lib/triagemForm";
import { Chip } from "@/components/ui/Chip";

export function StepPerfil() {
  const { draft: d, toggleArr, setDraft } = useTriagemForm();

  return (
    <div className="px-5 pt-3.5 pb-8 flex flex-col gap-5.5">
      <div>
        <div className="text-[15px] font-bold text-ink mb-2.5">Qual é o principal objetivo?</div>
        <div className="flex flex-wrap gap-2">
          {OBJETIVOS.map((o) => (
            <Chip key={o} label={o} active={d.objetivos.includes(o)} onClick={() => toggleArr("objetivos", o)} />
          ))}
        </div>
      </div>
      <div>
        <div className="text-[15px] font-bold text-ink mb-2.5">Pratica musculação atualmente?</div>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCIAS.map((e) => (
            <Chip key={e} label={e} active={d.experiencia === e} onClick={() => setDraft("experiencia", e)} />
          ))}
        </div>
      </div>
      <div>
        <div className="text-[15px] font-bold text-ink mb-2.5">Quantas vezes por semana?</div>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIAS.map((f) => (
            <Chip key={f} label={f} active={d.frequencia === f} onClick={() => setDraft("frequencia", f)} />
          ))}
        </div>
      </div>
      <div>
        <div className="text-[15px] font-bold text-ink mb-2.5">Tempo disponível por treino?</div>
        <div className="flex flex-wrap gap-2">
          {TEMPOS.map((t) => (
            <Chip key={t} label={t} active={d.duracao === t} onClick={() => setDraft("duracao", t)} />
          ))}
        </div>
      </div>
    </div>
  );
}
