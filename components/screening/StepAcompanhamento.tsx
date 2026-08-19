"use client";

import { ACOMPANHAMENTOS, ORIENTACOES } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Chip } from "@/components/ui/Chip";
import { YesNo } from "./YesNo";

export function StepAcompanhamento() {
  const { state, setDraft } = useApp();
  const d = state.triagemDraft;
  const showOrientacao = !!d.acompanhamento && d.acompanhamento !== "Não";

  return (
    <div className="px-5 pt-3.5 pb-8 flex flex-col gap-5.5">
      <div>
        <div className="text-[15px] font-bold text-ink mb-2.5">Algum profissional acompanha essa condição atualmente?</div>
        <div className="flex flex-wrap gap-2">
          {ACOMPANHAMENTOS.map((a) => (
            <Chip key={a} label={a} active={d.acompanhamento === a} onClick={() => setDraft("acompanhamento", a)} />
          ))}
        </div>
      </div>

      {showOrientacao && (
        <div>
          <div className="text-[15px] font-bold text-ink mb-2.5">Foi orientada alguma restrição para atividade física?</div>
          <div className="flex flex-wrap gap-2">
            {ORIENTACOES.map((o) => (
              <Chip key={o} label={o} active={d.orientacao === o} onClick={() => setDraft("orientacao", o)} />
            ))}
          </div>
          {d.orientacao === "Sim" && (
            <div className="mt-3">
              <label className="text-[13px] font-bold text-ink">Qual orientação foi recebida?</label>
              <textarea
                value={d.orientacaoTexto}
                onChange={(e) => setDraft("orientacaoTexto", e.target.value)}
                className="mt-1.5 w-full min-h-[70px] px-3.5 py-3 rounded-[14px] border border-border bg-white text-sm text-ink resize-none"
              />
            </div>
          )}
        </div>
      )}

      <div>
        <div className="text-[15px] font-bold text-ink mb-2.5">Algum profissional pediu para evitar determinado exercício ou movimento?</div>
        <YesNo
          value={d.restricaoProfissional}
          onYes={() => setDraft("restricaoProfissional", true)}
          onNo={() => setDraft("restricaoProfissional", false)}
        />
        {d.restricaoProfissional === true && (
          <textarea
            value={d.restricaoTexto}
            onChange={(e) => setDraft("restricaoTexto", e.target.value)}
            placeholder="Quais movimentos ou exercícios?"
            className="mt-2.5 w-full min-h-[60px] px-3.5 py-3 rounded-[14px] border border-border bg-white text-sm text-ink resize-none"
          />
        )}
      </div>
    </div>
  );
}
