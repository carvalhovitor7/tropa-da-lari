"use client";

import Image from "next/image";
import { currentAluna, useApp } from "@/lib/store";
import { alunoNoun } from "@/lib/gender";
import { treinoLetterFor } from "@/lib/dates";
import { summarizeRestricoes } from "@/lib/screening";

function FieldIcon({ path }: { path: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C4DBD" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  nome: "M20 21a8 8 0 10-16 0 M12 11a4 4 0 100-8 4 4 0 000 8z",
  genero: "M12 15a5 5 0 100-10 5 5 0 000 10z M12 15v7 M9 19h6",
  idade: "M12 8v5l3 2 M12 22a10 10 0 100-20 10 10 0 000 20z",
  objetivo: "M12 22a10 10 0 100-20 10 10 0 000 20z M12 16a4 4 0 100-8 4 4 0 000 8z M12 13a1 1 0 100-2 1 1 0 000 2z",
  nivel: "M4 20V10 M12 20V4 M20 20v-7",
  frequencia: "M3 10h18 M7 3v4 M17 3v4 M4 6h16a1 1 0 011 1v13a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z",
  local: "M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z M12 13a3 3 0 100-6 3 3 0 000 6z",
  restricoes: "M12 9v4 M12 16.5h.01 M10.3 3.9L2.9 17a1.7 1.7 0 001.5 2.5h15.2a1.7 1.7 0 001.5-2.5L13.7 3.9a1.7 1.7 0 00-3.4 0z",
};

function ExerciseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C4DBD" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5l11 11 M4 9l3-3 3 3-3 3-3-3z M18 18l-3-3-3 3 3 3 3-3z M2.5 2.5l3 3 M18.5 18.5l3 3" />
    </svg>
  );
}

export function Pdf() {
  const { state, goTo } = useApp();
  const aluna = currentAluna(state);
  const triagem = state.triagens[aluna.id];
  const noun = alunoNoun(aluna.genero);
  const letter = treinoLetterFor(
    aluna.treinos.length ? aluna.treinos : [{ id: state.treinoId || "novo", createdAt: state.treinoCreatedAt }],
    state.treinoId
  );
  const foco = (state.treinoFoco || "Treino").toUpperCase();
  const enfase = state.treinoEnfase?.trim();
  const restricoes = summarizeRestricoes(triagem);

  const fields: [string, string, keyof typeof ICONS][] = [
    ["Nome", aluna.name, "nome"],
    ["Gênero", aluna.genero === "feminino" ? "Feminino" : aluna.genero === "masculino" ? "Masculino" : "—", "genero"],
    ["Idade", aluna.idade ? `${aluna.idade} anos` : "—", "idade"],
    ["Objetivo", aluna.goal || "—", "objetivo"],
  ];
  const fields2: [string, string, keyof typeof ICONS][] = [
    ["Nível", aluna.level || "—", "nivel"],
    ["Frequência", aluna.freq || "—", "frequencia"],
    ["Local", aluna.local || "—", "local"],
    ["Restrições", restricoes, "restricoes"],
  ];

  return (
    <div className="px-4 pt-4 pb-28" style={{ background: "#EDE7F7" }}>
      <div
        className="bg-white rounded-[18px] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 20px 45px -20px rgba(76,58,158,0.35)" }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
          <div
            className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2"
            style={{ borderColor: "#C9A0E8", boxShadow: "0 6px 16px -8px rgba(76,58,158,0.4)" }}
          >
            <Image src="/brand/logo.png" alt="Tropa da Lari" width={64} height={64} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className="text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full"
              style={{ background: "#4C3A9E" }}
            >
              TREINO
            </span>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold"
              style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)", boxShadow: "0 8px 18px -8px rgba(76,58,158,0.5)" }}
            >
              {letter}
            </div>
          </div>
        </div>
        <div className="px-5 pb-4 flex items-center gap-2">
          <ExerciseIcon />
          <div>
            <div className="font-serif text-[22px] leading-tight text-ink">{foco}</div>
            {!!enfase && <div className="text-[11px] font-bold text-terracotta uppercase tracking-wide">({enfase.toUpperCase()})</div>}
          </div>
        </div>

        {/* Dados do aluno */}
        <div className="mx-4 mb-4 relative">
          <div
            className="absolute -top-3 left-3 text-white text-[10px] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-full z-10"
            style={{ background: "#4C3A9E" }}
          >
            Dados d{noun === "aluna" ? "a" : "o"} {noun}
          </div>
          <div className="bg-white rounded-2xl border border-border pt-6 pb-4 px-4 grid grid-cols-2 gap-x-3 gap-y-3.5">
            {[...fields, ...fields2].map(([label, value, icon]) => (
              <div key={label} className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <FieldIcon path={ICONS[icon]} />
                  <span className="text-[10px] font-bold text-ink-softer uppercase tracking-wide">{label}</span>
                </div>
                <div className="text-[12.5px] font-semibold text-ink mt-0.5 leading-snug break-words">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise table */}
        <div className="mx-4 mb-4 rounded-2xl overflow-hidden border border-border">
          <div
            className="grid text-white text-[9.5px] font-extrabold uppercase tracking-wide px-3 py-2.5"
            style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)", gridTemplateColumns: "1.6fr 0.6fr 0.7fr 1fr 0.8fr 1.2fr" }}
          >
            <span>Exercício</span>
            <span>Séries</span>
            <span>Reps</span>
            <span>Carga</span>
            <span>Descanso</span>
            <span>Obs. técnica</span>
          </div>
          {state.exercises.map((ex, i) => (
            <div
              key={ex.id}
              className="px-3 py-2.5 text-[11px] text-ink flex flex-col gap-1.5"
              style={{ background: i % 2 === 0 ? "#FFFFFF" : "#F6F2FC", borderTop: "1px solid #E4DAF6" }}
            >
              <div className="flex items-start gap-2">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 mt-0.5"
                  style={{ background: "#7C4DBD" }}
                >
                  {i + 1}
                </span>
                <span className="font-bold leading-snug">{ex.name}</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 ml-7 text-[10.5px]">
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
                    <b className="text-terracotta">{ex.carga}</b>
                  </span>
                )}
                <span>
                  <span className="text-ink-softer">Descanso </span>
                  <b>{ex.descanso}</b>
                </span>
              </div>
              {ex.obs && <div className="ml-7 text-[10.5px] text-ink-softer italic leading-snug">{ex.obs}</div>}
              {ex.videoUrl && (
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-7 inline-flex items-center gap-1 text-[10.5px] font-bold text-terracotta no-underline w-fit"
                >
                  ▶ Ver execução
                </a>
              )}
            </div>
          ))}
          {state.exercises.length === 0 && (
            <div className="px-3 py-4 text-center text-[12px] text-ink-soft" style={{ borderTop: "1px solid #E4DAF6" }}>
              Nenhum exercício adicionado ainda.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mx-4 mb-4 bg-sage-bg rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A3D82" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a4.9 4.9 0 00-6.9 0L12 6.5l-1.9-1.9a4.9 4.9 0 10-6.9 6.9L12 20l8.8-8.5a4.9 4.9 0 000-6.9z" />
            </svg>
            <span className="text-[10px] font-extrabold text-sage-text uppercase tracking-wide">Observação da treinadora</span>
          </div>
          <div className="text-[12px] text-sage-text leading-relaxed">
            {state.treinoObsTreinadora?.trim() || "Sem observações adicionais para este treino."}
          </div>
        </div>

        <div className="px-5 pb-3 flex items-center justify-end gap-1.5">
          <span
            className="font-serif italic text-[15px]"
            style={{
              background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Disciplina que transforma!
          </span>
          <span className="text-terracotta">♡</span>
        </div>

        <div className="py-2.5 text-center" style={{ background: "#4C3A9E" }}>
          <span className="text-white text-[9.5px] font-bold tracking-wide">
            ✧ DISCIPLINA QUE TRANSFORMA. FOCO QUE GERA RESULTADOS! ♡
          </span>
        </div>
      </div>

      <button
        onClick={() => goTo("whatsapp")}
        className="w-full mt-4.5 text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer"
        style={{ background: "#5B4E9E" }}
      >
        Enviar pelo WhatsApp
      </button>
    </div>
  );
}
