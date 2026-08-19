"use client";

import { useApp } from "@/lib/store";
import { ScreenKey, TRIAGEM_STEPS } from "@/lib/types";
import { StepPerfil } from "./StepPerfil";
import { StepDor } from "./StepDor";
import { StepLesoes } from "./StepLesoes";
import { StepCirurgias } from "./StepCirurgias";
import { StepAcompanhamento } from "./StepAcompanhamento";
import { StepSaude } from "./StepSaude";
import { StepResumo } from "./StepResumo";
import { StepRevisao } from "./StepRevisao";

export function TriagemStep() {
  const { state, onTriagemAvancar } = useApp();
  const idx = TRIAGEM_STEPS.indexOf(state.screen);
  const progress = idx >= 0 ? Math.round(((idx + 1) / TRIAGEM_STEPS.length) * 100) : 0;

  const label =
    state.screen === "triagem-revisao"
      ? "Usar essas informações no treino"
      : state.screen === "triagem-resumo" && state.triagemViewOnly
      ? "Voltar"
      : "Continuar";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-1 shrink-0">
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "#7C4DBD" }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.screen === ("triagem-perfil" as ScreenKey) && <StepPerfil />}
        {state.screen === ("triagem-dor" as ScreenKey) && <StepDor />}
        {state.screen === ("triagem-lesoes" as ScreenKey) && <StepLesoes />}
        {state.screen === ("triagem-cirurgias" as ScreenKey) && <StepCirurgias />}
        {state.screen === ("triagem-acompanhamento" as ScreenKey) && <StepAcompanhamento />}
        {state.screen === ("triagem-saude" as ScreenKey) && <StepSaude />}
        {state.screen === ("triagem-resumo" as ScreenKey) && <StepResumo />}
        {state.screen === ("triagem-revisao" as ScreenKey) && <StepRevisao />}
      </div>

      <div className="sticky bottom-0 bg-app border-t border-border px-5 pt-3.5 pb-5.5 shrink-0">
        <button
          onClick={onTriagemAvancar}
          className="w-full text-white border-none text-base font-bold py-4 rounded-full cursor-pointer"
          style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
