"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { treinoDateSummary } from "@/lib/dates";

export function Dashboard() {
  const { state, navTo, openPerfil, openTreino, setAlunaId, syncTriagens } = useApp();

  useEffect(() => {
    syncTriagens();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const recentTreinos = state.alunas
    .flatMap((a) => a.treinos.map((t) => ({ aluna: a, treino: t })))
    .sort((a, b) => new Date(b.treino.createdAt || 0).getTime() - new Date(a.treino.createdAt || 0).getTime())
    .slice(0, 4);

  return (
    <div className="px-5 pt-5.5 pb-24 flex flex-col gap-6.5">
      <div>
        <div className="font-serif text-[34px] leading-[1.15] text-ink">Boa tarde, Lari.</div>
        <div className="text-[15px] text-ink-soft mt-1">O que vamos montar hoje?</div>
      </div>

      <button
        onClick={() => navTo("alunas")}
        className="w-full text-white border-none rounded-[18px] p-4.5 text-[17px] font-bold flex items-center justify-center gap-2 cursor-pointer"
        style={{ background: "linear-gradient(135deg,#CD8468,#A15840)", boxShadow: "0 12px 28px -10px rgba(161,88,64,0.5)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Criar treino
      </button>

      <div className="bg-white rounded-[20px] p-4.5 flex items-center gap-4" style={{ boxShadow: "0 10px 26px -14px rgba(58,52,46,0.2)" }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "conic-gradient(#BC6B52 0deg 288deg, #F1E4DA 288deg 360deg)" }}
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[13px] font-extrabold text-ink">80%</div>
        </div>
        <div>
          <div className="text-[13px] font-bold text-ink">Sua semana</div>
          <div className="text-xs text-ink-soft mt-0.5">
            {recentTreinos.length} treinos montados ·{" "}
            {(() => {
              const n = state.alunas.filter((a) => a.hasTreinos).length;
              return `${n} ${n === 1 ? "aluno atendido" : "alunos atendidos"}`;
            })()}
          </div>
          <div className="flex gap-1 mt-2.5 items-end">
            {[
              { h: 10, c: "#E8ECE1" },
              { h: 16, c: "#8C9A7B" },
              { h: 22, c: "#6F7D5E" },
              { h: 12, c: "#E8ECE1" },
              { h: 18, c: "#8C9A7B" },
              { h: 8, c: "#E8ECE1" },
              { h: 8, c: "#E8ECE1" },
            ].map((b, i) => (
              <div key={i} style={{ width: 8, height: b.h, borderRadius: 3, background: b.c }} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-bold text-ink mb-2.5">Treinos recentes</div>
        <div className="flex flex-col gap-2.5">
          {recentTreinos.map(({ aluna, treino }) => (
            <div key={treino.id} className="bg-white rounded-2xl p-3.5 flex flex-col gap-2" style={{ boxShadow: "0 8px 20px -12px rgba(58,52,46,0.18)" }}>
              <div>
                <div className="text-[15px] font-bold text-ink">{aluna.name}</div>
                <div className="text-[13px] text-ink-soft">
                  {treino.name} • {treino.foco}
                </div>
                <div className="text-[11px] text-ink-softer mt-1">{treinoDateSummary(treino.createdAt, treino.sentAt)}</div>
              </div>
              <button
                onClick={() => {
                  setAlunaId(aluna.id);
                  openTreino(treino);
                }}
                className="self-start bg-white border border-border text-terracotta text-[13px] font-bold px-3.5 py-2 rounded-full cursor-pointer"
              >
                Continuar editando
              </button>
            </div>
          ))}
          {recentTreinos.length === 0 && <div className="text-sm text-ink-soft">Nenhum treino montado ainda.</div>}
        </div>
      </div>

      <div>
        <div className="text-sm font-bold text-ink mb-2.5">Alunos recentes</div>
        <div className="flex gap-3.5 overflow-x-auto pb-1">
          {state.alunas.map((al) => (
            <button
              key={al.id}
              onClick={() => openPerfil(al.id)}
              className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer shrink-0"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-sage font-bold text-base bg-sage-bg"
                style={{ boxShadow: "0 4px 12px -6px rgba(58,52,46,0.3)" }}
              >
                {al.initials}
              </div>
              <span className="text-xs text-ink font-semibold max-w-16 overflow-hidden text-ellipsis whitespace-nowrap">
                {al.firstName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
