"use client";

import { SAUDE_CONDICOES } from "@/lib/data";
import { useTriagemForm } from "@/lib/triagemForm";

export function StepSaude() {
  const { draft: d, toggleArr } = useTriagemForm();

  return (
    <div className="px-5 pt-3.5 pb-8 flex flex-col gap-4.5">
      <div className="text-[15px] font-bold text-ink">A aluna informou ou já foi avisada sobre alguma destas condições?</div>
      <div className="flex flex-col gap-2">
        {SAUDE_CONDICOES.map((sd) => {
          const sel = d.saude.includes(sd);
          return (
            <button
              key={sd}
              onClick={() => toggleArr("saude", sd)}
              className="flex items-center gap-2.5 text-left rounded-xl px-3.5 py-3 text-[13px] font-semibold cursor-pointer"
              style={{
                border: `1px solid ${sel ? "#B5473A" : "#E8DDD0"}`,
                background: sel ? "#F6DEDA" : "#FFFFFF",
                color: sel ? "#B5473A" : "#3A342E",
              }}
            >
              <span
                className="w-4.5 h-4.5 rounded-[5px] shrink-0"
                style={{ border: `1.5px solid ${sel ? "#B5473A" : "#3A342E"}`, background: sel ? "#B5473A" : "transparent" }}
              />
              {sd}
            </button>
          );
        })}
      </div>
      {d.saude.length > 0 && (
        <div className="rounded-[14px] p-3.5 text-[13px] leading-relaxed" style={{ background: "#F6DEDA", color: "#8A3B2C" }}>
          <b>Atenção antes da prescrição.</b> Esta aluna informou condições que merecem avaliação mais detalhada antes da
          progressão do exercício.
        </div>
      )}
    </div>
  );
}
