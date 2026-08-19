"use client";

import { currentAluna, useApp } from "@/lib/store";
import { agree } from "@/lib/gender";

export function TriagemIntro() {
  const { state, onTriagemIniciar, onTriagemPular } = useApp();
  const aluna = currentAluna(state);

  return (
    <div className="px-5 pt-2 pb-10 flex flex-col gap-5 flex-1">
      <div className="w-13 h-13 rounded-2xl bg-sage-bg flex items-center justify-center">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5B4E9E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      </div>
      <div>
        <div className="font-serif text-[26px] leading-[1.2] text-ink">Triagem de {aluna.firstName}</div>
        <div className="text-sm text-ink-soft mt-2 leading-relaxed">
          Algumas perguntas rápidas (3–5 min) para você conhecer melhor {agree(aluna.genero, "o histórico dele", "o histórico dela")} antes de montar o treino.
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 text-[13px] text-ink-soft leading-relaxed" style={{ boxShadow: "0 8px 20px -14px rgba(58,52,46,0.2)" }}>
        Isto não substitui avaliação médica ou fisioterapêutica. As respostas servem apenas de apoio para você decidir o
        treino — a decisão final é sempre sua.
      </div>
      <div className="flex-1" />
      <button
        onClick={onTriagemIniciar}
        className="w-full text-white border-none text-base font-bold py-4 rounded-full cursor-pointer"
        style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
      >
        Começar triagem
      </button>
      <button onClick={onTriagemPular} className="w-full bg-transparent text-ink-soft border-none text-[13px] font-semibold py-1 cursor-pointer">
        Pular por enquanto
      </button>
    </div>
  );
}
