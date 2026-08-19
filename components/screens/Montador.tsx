"use client";

import { currentAluna, useApp } from "@/lib/store";
import { computeWarnings } from "@/lib/screening";
import { alunoNoun, artigoDef } from "@/lib/gender";

export function Montador() {
  const { state, onVerTriagem, editExercise, duplicateExercise, deleteExercise, openBusca, goTo } = useApp();
  const aluna = currentAluna(state);
  const triagem = state.triagens[aluna.id];
  const warnings = computeWarnings(triagem);
  const summaryLine = triagem ? `${triagem.frequencia} • ${triagem.experiencia} • ${triagem.duracao}` : "";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-1 pb-32 flex flex-col gap-3.5 flex-1">
        {!!state.weeklyRepTargets.length && (
          <div className="bg-sage-bg rounded-2xl px-3.5 py-3 flex flex-col gap-1">
            <div className="text-[11px] font-bold text-sage-text uppercase tracking-wide">Ênfase semanal</div>
            <div className="flex flex-wrap gap-1.5">
              {state.weeklyRepTargets.map((w) => (
                <span key={w.grupo} className="bg-white text-sage-text text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {w.grupo}: {w.reps} reps/semana
                </span>
              ))}
            </div>
          </div>
        )}
        {triagem && !state.modeloBuilding && (
          <button
            onClick={onVerTriagem}
            className="text-left bg-white border-none rounded-2xl px-3.5 py-3 flex items-center gap-2.5 cursor-pointer"
            style={{ boxShadow: "0 8px 20px -14px rgba(58,52,46,0.2)" }}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs text-ink-softer font-bold uppercase tracking-wide">
                Perfil d{artigoDef(aluna.genero)} {alunoNoun(aluna.genero)}
              </div>
              <div className="text-[13px] text-ink font-bold mt-0.5">
                {aluna.firstName} · {summaryLine}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {warnings.map((w) => (
                  <span key={w} className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#F6DEDA", color: "#8A3B2C" }}>
                    ⚠ {w}
                  </span>
                ))}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BC6B52" strokeWidth={2.2} strokeLinecap="round" className="shrink-0">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        <div className="flex flex-col gap-2.5">
          {state.exercises.map((ex) => (
            <div key={ex.id} className="bg-white rounded-2xl p-3.5 flex gap-2.5" style={{ boxShadow: "0 8px 20px -14px rgba(58,52,46,0.2)" }}>
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-sage-bg flex items-center justify-center text-sage-text text-[10px] font-bold">
                {ex.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="pt-0.5 text-[#C8BEB1] cursor-grab shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-ink">{ex.name}</div>
                <div className="flex gap-3.5 mt-1.5 text-[13px] font-bold text-sage">
                  <span>
                    {ex.series} × {ex.reps}
                  </span>
                  {!!ex.carga && <span className="text-terracotta">{ex.carga} kg</span>}
                  <span className="text-ink-softer font-semibold">{ex.descanso}</span>
                </div>
                {ex.obs && <div className="text-xs text-ink-softer mt-1 italic">{ex.obs}</div>}
                <div className="flex gap-1.5 mt-1 -ml-2">
                  <button onClick={() => editExercise(ex)} className="bg-transparent border-none px-2 py-3 min-h-11 text-xs font-bold text-ink cursor-pointer">
                    Editar
                  </button>
                  <button
                    onClick={() => duplicateExercise(ex)}
                    className="bg-transparent border-none px-2 py-3 min-h-11 text-xs font-bold text-ink cursor-pointer"
                  >
                    Duplicar
                  </button>
                  <button
                    onClick={() => deleteExercise(ex.id)}
                    className="bg-transparent border-none px-2 py-3 min-h-11 text-xs font-bold text-terracotta cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}

          {state.exercises.length === 0 && (
            <div className="bg-white rounded-2xl px-5 py-8 text-center flex flex-col gap-1.5" style={{ boxShadow: "0 8px 20px -14px rgba(58,52,46,0.15)" }}>
              <div className="text-sm text-ink font-semibold">Ainda sem exercícios.</div>
              <div className="text-[13px] text-ink-soft">Toque em &quot;Adicionar exercício&quot; para começar.</div>
            </div>
          )}
        </div>

        <button
          onClick={openBusca}
          className="w-full bg-white text-terracotta text-[15px] font-bold py-4 rounded-2xl cursor-pointer flex items-center justify-center gap-2"
          style={{ border: "1.5px dashed #BC6B52" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A15840" strokeWidth={2.4} strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar exercício
        </button>
      </div>

      <div className="sticky bottom-0 bg-app border-t border-border px-5 pt-3.5 pb-5.5 flex flex-col gap-2.5">
        <div className="text-xs text-ink-softer font-bold">
          {state.exercises.length} exercício{state.exercises.length === 1 ? "" : "s"}
        </div>
        {state.modeloBuilding ? (
          <button
            onClick={() => goTo("criar-modelo")}
            disabled={state.exercises.length === 0}
            className="w-full bg-ink text-white border-none text-base font-bold py-4 rounded-full cursor-pointer disabled:opacity-50"
          >
            Salvar modelo
          </button>
        ) : (
          <button onClick={() => goTo("revisao")} className="w-full bg-ink text-white border-none text-base font-bold py-4 rounded-full cursor-pointer">
            Revisar treino
          </button>
        )}
      </div>
    </div>
  );
}
