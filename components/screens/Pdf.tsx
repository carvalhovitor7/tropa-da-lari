"use client";

import { currentAluna, useApp } from "@/lib/store";
import { alunoNoun } from "@/lib/gender";

export function Pdf() {
  const { state, goTo } = useApp();
  const aluna = currentAluna(state);

  return (
    <div className="px-4 pt-4 pb-28" style={{ background: "#E9E1D6" }}>
      <div className="bg-white rounded px-5 py-6.5 flex flex-col gap-4.5" style={{ boxShadow: "0 4px 14px rgba(58,52,46,0.12)" }}>
        <div className="flex flex-col gap-0.5 pb-3.5" style={{ borderBottom: "2px solid #BC6B52" }}>
          <div className="font-serif text-[22px] text-terracotta">Tropa da Lari</div>
          <div className="text-xs text-ink-softer">Ficha de treino personalizada</div>
        </div>
        <div className="flex justify-between text-xs">
          <div>
            <div className="text-ink-softer">{alunoNoun(aluna.genero) === "aluna" ? "Aluna" : "Aluno"}</div>
            <div className="font-bold text-ink">{aluna.name}</div>
          </div>
          <div>
            <div className="text-ink-softer">Treino</div>
            <div className="font-bold text-ink">
              {state.treinoName} • {state.treinoFoco}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-[10px] font-extrabold text-ink-softer uppercase pb-2 border-b border-border">Exercícios</div>
          {state.exercises.map((ex, i) => (
            <div key={ex.id} className="py-3 border-b" style={{ borderColor: "#F1EAE0" }}>
              <div className="flex gap-2 items-baseline">
                <span className="text-[11px] font-extrabold text-terracotta-strong shrink-0">{i + 1}.</span>
                <span className="text-[13px] font-bold text-ink">{ex.name}</span>
              </div>
              <div className="flex flex-wrap gap-2.5 mt-1.5 ml-5 text-[11px] text-ink">
                <span>
                  <span className="text-ink-softer">Séries </span>
                  <b>{ex.series}</b>
                </span>
                <span>
                  <span className="text-ink-softer">Reps </span>
                  <b>{ex.reps}</b>
                </span>
                {!!ex.carga && (
                  <span>
                    <span className="text-ink-softer">Carga </span>
                    <b>{ex.carga} kg</b>
                  </span>
                )}
                <span>
                  <span className="text-ink-softer">Descanso </span>
                  <b>{ex.descanso}</b>
                </span>
              </div>
              {ex.obs && <div className="text-[11px] text-ink-softer italic mt-1.5 ml-5">{ex.obs}</div>}
            </div>
          ))}
        </div>
        <div className="text-[11px] text-ink-softer pt-1.5 border-t border-border">Profissional responsável: Larissa · CREF em dia</div>
      </div>
      <button
        onClick={() => goTo("whatsapp")}
        className="w-full mt-4.5 text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer"
        style={{ background: "#6F7D5E" }}
      >
        Enviar pelo WhatsApp
      </button>
    </div>
  );
}
