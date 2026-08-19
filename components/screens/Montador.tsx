"use client";

import { useRef, useState } from "react";
import { currentAluna, useApp } from "@/lib/store";
import { computeWarnings } from "@/lib/screening";
import { alunoNoun, artigoDef } from "@/lib/gender";
import { Exercise } from "@/lib/types";

export function Montador() {
  const { state, onVerTriagem, editExercise, duplicateExercise, deleteExercise, moveExercise, openBusca, goTo } = useApp();
  const aluna = currentAluna(state);
  const triagem = state.triagens[aluna.id];
  const warnings = computeWarnings(triagem);
  const summaryLine = triagem ? `${triagem.frequencia} • ${triagem.experiencia} • ${triagem.duracao}` : "";

  // --- Kanban-style drag reordering ---------------------------------
  // Hand-rolled with Pointer Events (unifies mouse + touch, no extra
  // dependency) rather than HTML5 drag-and-drop, which doesn't support
  // touch at all — this is a mobile-only app. The dragged row is rendered
  // as a "lifted" ghost that follows the pointer via position:fixed while
  // its original slot in the list collapses to a dashed placeholder (the
  // drop-target indicator); the underlying order is reordered live in
  // lib/store.tsx's moveExercise as the pointer crosses a neighbor's
  // midpoint, so the visible order is always the real order — no separate
  // "commit on drop" step that could disagree with what's saved.
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // Pointer capture + the move/up listeners live on this stable list
  // container (not on the handle) precisely because the dragged row's own
  // handle gets swapped out for a placeholder mid-drag — if the listeners
  // lived there, unmounting it would silently kill the gesture partway
  // through, before a drop is ever registered.
  const listRef = useRef<HTMLDivElement | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragTop, setDragTop] = useState(0);
  const [dragLeft, setDragLeft] = useState(0);
  const [dragWidth, setDragWidth] = useState(0);
  const [dragHeight, setDragHeight] = useState(0);
  const pointerOffsetY = useRef(0);

  const getIndexForY = (centerY: number, excludeId: string) => {
    let idx = state.exercises.length - 1;
    for (let i = 0; i < state.exercises.length; i++) {
      const ex = state.exercises[i];
      if (ex.id === excludeId) continue;
      const el = rowRefs.current.get(ex.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (centerY < mid) {
        idx = i;
        break;
      }
    }
    return idx;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, ex: Exercise) => {
    const row = rowRefs.current.get(ex.id);
    if (!row) return;
    const rect = row.getBoundingClientRect();
    pointerOffsetY.current = e.clientY - rect.top;
    setDragId(ex.id);
    setDragTop(rect.top);
    setDragLeft(rect.left);
    setDragWidth(rect.width);
    setDragHeight(rect.height);
    // Capture on the stable list container, not the handle — see note by
    // listRef above. Wrapped defensively: capture is a safety net (keeps
    // move/up events firing even if the finger slides off the container),
    // not load-bearing for the reorder logic itself, which tracks the
    // pointer purely via clientY + rowRefs — so a capture failure (e.g. an
    // already-released pointerId) shouldn't abort the drag.
    try {
      listRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // no-op
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragId) return;
    const newTop = e.clientY - pointerOffsetY.current;
    setDragTop(newTop);
    const centerY = newTop + dragHeight / 2;
    const targetIdx = getIndexForY(centerY, dragId);
    const currentIdx = state.exercises.findIndex((ex) => ex.id === dragId);
    if (currentIdx !== -1 && targetIdx !== currentIdx) moveExercise(currentIdx, targetIdx);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (listRef.current?.hasPointerCapture(e.pointerId)) listRef.current.releasePointerCapture(e.pointerId);
    setDragId(null);
  };

  const draggingExercise = dragId ? state.exercises.find((ex) => ex.id === dragId) : null;

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C4DBD" strokeWidth={2.2} strokeLinecap="round" className="shrink-0">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        <div
          className="flex flex-col gap-2.5"
          ref={listRef}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={dragId ? { touchAction: "none" } : undefined}
        >
          {state.exercises.map((ex) => {
            const isDragging = ex.id === dragId;
            return (
              <div
                key={ex.id}
                ref={(el) => {
                  if (el) rowRefs.current.set(ex.id, el);
                  else rowRefs.current.delete(ex.id);
                }}
                className={
                  isDragging
                    ? "rounded-2xl p-3.5"
                    : "bg-white rounded-2xl p-3.5 flex gap-2.5"
                }
                style={
                  isDragging
                    ? { height: dragHeight, border: "1.5px dashed #7C4DBD", background: "rgba(124,77,189,0.06)" }
                    : { boxShadow: "0 8px 20px -14px rgba(58,52,46,0.2)" }
                }
              >
                {!isDragging && (
                  <>
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-sage-bg flex items-center justify-center text-sage-text text-[10px] font-bold">
                      {ex.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div
                      className="w-11 h-11 -m-1.5 text-ink-softer cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center touch-none select-none"
                      onPointerDown={(e) => handlePointerDown(e, ex)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <line x1="4" y1="7" x2="20" y2="7" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="17" x2="20" y2="17" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-ink">{ex.name}</div>
                      <div className="flex gap-3.5 mt-1.5 text-[13px] font-bold text-sage flex-wrap">
                        <span>
                          {ex.series} × {ex.reps}
                        </span>
                        {!!ex.carga && <span className="text-terracotta">{ex.carga}</span>}
                        <span className="text-ink-softer font-semibold">{ex.descanso}</span>
                      </div>
                      {ex.obs && <div className="text-xs text-ink-softer mt-1 italic">{ex.obs}</div>}
                      {ex.videoUrl && (
                        <a
                          href={ex.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-terracotta no-underline"
                        >
                          ▶ Ver execução
                        </a>
                      )}
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
                  </>
                )}
              </div>
            );
          })}

          {draggingExercise && (
            <div
              className="bg-white rounded-2xl p-3.5 flex gap-2.5 pointer-events-none"
              style={{
                position: "fixed",
                top: dragTop,
                left: dragLeft,
                width: dragWidth,
                zIndex: 50,
                boxShadow: "0 20px 40px -12px rgba(76,58,158,0.45)",
                transform: "scale(1.03)",
              }}
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-sage-bg flex items-center justify-center text-sage-text text-[10px] font-bold">
                {draggingExercise.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="w-11 h-11 -m-1.5 text-terracotta shrink-0 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-ink">{draggingExercise.name}</div>
                <div className="flex gap-3.5 mt-1.5 text-[13px] font-bold text-sage flex-wrap">
                  <span>
                    {draggingExercise.series} × {draggingExercise.reps}
                  </span>
                  {!!draggingExercise.carga && <span className="text-terracotta">{draggingExercise.carga}</span>}
                  <span className="text-ink-softer font-semibold">{draggingExercise.descanso}</span>
                </div>
              </div>
            </div>
          )}

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
          style={{ border: "1.5px dashed #7C4DBD" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4C3A9E" strokeWidth={2.4} strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar exercício
        </button>
      </div>

      <div
        className="sticky bottom-0 bg-app border-t border-border px-5 pt-3.5 flex flex-col gap-2.5"
        style={{ paddingBottom: "calc(22px + env(safe-area-inset-bottom))" }}
      >
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
