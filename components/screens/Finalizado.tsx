"use client";

import { useState } from "react";
import { currentAluna, useApp } from "@/lib/store";
import { shareStoryCard } from "@/lib/storyImage";

export function Finalizado() {
  const { state, goTo, navTo, markSent, toast } = useApp();
  const aluna = currentAluna(state);
  const [sharingStory, setSharingStory] = useState(false);

  const goPdf = () => goTo("pdf");

  const goWhatsapp = () => {
    markSent();
    goTo("whatsapp");
  };

  const shareInstagram = async () => {
    setSharingStory(true);
    try {
      const result = await shareStoryCard({
        alunaName: aluna.name,
        instagram: aluna.instagram,
        treinoName: state.treinoName,
        foco: state.treinoFoco,
        exerciseCount: state.exercises.length,
      });
      markSent();
      if (result.via === "share") {
        toast("Compartilhado! Escolha o Instagram no menu para postar no Story.");
      } else {
        toast("Imagem baixada. Abra o Instagram e poste no Story.");
      }
    } catch {
      toast("Não foi possível gerar a imagem do Story agora.");
    } finally {
      setSharingStory(false);
    }
  };

  const salvarFinalizar = () => {
    markSent();
    navTo("perfil");
  };

  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5.5 p-10 text-center">
      <div className="w-18 h-18 rounded-full bg-sage-bg flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5B4E9E" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
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
          onClick={goPdf}
          className="text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer"
          style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
        >
          Gerar PDF
        </button>
        <button onClick={goWhatsapp} className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer">
          Compartilhar pelo WhatsApp
        </button>
        <button
          onClick={shareInstagram}
          disabled={sharingStory}
          className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4C3A9E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="#4C3A9E" />
          </svg>
          {sharingStory ? "Gerando imagem…" : canNativeShare ? "Compartilhar no Instagram" : "Baixar imagem para o Story"}
        </button>
        <button onClick={salvarFinalizar} className="bg-transparent text-ink-soft border-none text-[13px] font-semibold py-2 cursor-pointer">
          Salvar e finalizar
        </button>
      </div>
    </div>
  );
}
