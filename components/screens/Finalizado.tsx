"use client";

import { currentAluna, useApp } from "@/lib/store";

export function Finalizado() {
  const { state, goTo, navTo } = useApp();
  const aluna = currentAluna(state);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5.5 p-10 text-center">
      <div className="w-18 h-18 rounded-full bg-sage-bg flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6F7D5E" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <div>
        <div className="font-serif text-[28px] text-ink">Treino pronto!</div>
        <div className="text-sm text-ink-soft mt-1.5">
          {state.treinoName} de {aluna.firstName} está pronto para ser entregue.
        </div>
      </div>
      <div className="w-full flex flex-col gap-2.5 mt-2">
        <button
          onClick={() => goTo("pdf")}
          className="text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer"
          style={{ background: "linear-gradient(135deg,#CD8468,#A15840)" }}
        >
          Gerar PDF
        </button>
        <button
          onClick={() => goTo("whatsapp")}
          className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer"
        >
          Compartilhar pelo WhatsApp
        </button>
        <button onClick={() => navTo("perfil")} className="bg-transparent text-ink-soft border-none text-[13px] font-semibold py-2 cursor-pointer">
          Salvar e finalizar
        </button>
      </div>
    </div>
  );
}
