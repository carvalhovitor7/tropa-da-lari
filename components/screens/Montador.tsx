"use client";

import { useRef, useState } from "react";
import { currentAluna, useApp } from "@/lib/store";
import { computeWarnings } from "@/lib/screening";
import { alunoNoun, artigoDef } from "@/lib/gender";
import { Exercise } from "@/lib/types";
import { buildExerciseBlocks, restLabelFor } from "@/lib/conjugado";

export function Montador() {
  const {
    state,
    onVerTriagem,
    editExercise,
    duplicateExercise,
    deleteExercise,
    moveExercise,
    groupExercises,
    ungroupExercise,
    dissolveGroup,
    openBusca,
    goTo,
  } = useApp();
  const aluna = currentAluna(state);
  const triagem = state.triagens[aluna.id];
  const warnings = computeWarnings(triagem);
  const summaryLine = triagem ? `${triagem.frequencia} • ${triagem.experiencia} • ${triagem.duracao}` : "";

  // --- "Agrupar em conjugado" selection mode -------------------------
  // Transient, component-local UI state — the only thing that survives
  // into the actual treino is the conjugadoGroupId stamped by
  // groupExercises() in lib/store.tsx once the selection is confirmed.
  const [groupMode, setGroupMode] = useState(false);
  const [selectedForGroup, setSelectedForGroup] = useState<string[]>([]);

  const startGroupMode = () => {
    setGroupMode(true);
    setSelectedForGroup([]);
  };
  const cancelGroupMode = () => {
    setGroupMode(false);
    setSelectedForGroup([]);
  };
  const toggleSelected = (id: string) => {
    setSelectedForGroup((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));
  };
  const confirmGroup = () => {
    if (selectedForGroup.length >= 2) groupExercises(selectedForGroup);
    setGroupMode(false);
    setSelectedForGroup([]);
  };

  const blocks = buildExerciseBlocks(state.exercises);

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
    if (groupMode) return;
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

  // Renders a single exercise row — used both standalone and nested inside
  // a conjugado group's bracket wrapper. `label` is the "1"/"3a"/"3b"
  // display numbering from lib/conjugado.ts; `inGroup`/`isLast` drive the
  // "no rest between grouped exercises" display rule and the per-row
  // "Remover do grupo" action.
  const renderRow = (ex: Exercise, opts: { label: string; inGroup: boolean; isFirst: boolean; isLast: boolean }) => {
    const isDragging = ex.id === dragId;
    const isSelected = selectedForGroup.includes(ex.id);
    const alreadyGrouped = !!ex.conjugadoGroupId;
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
            : opts.inGroup
              ? "p-3.5 flex gap-2.5"
              : "bg-white rounded-2xl p-3.5 flex gap-2.5"
        }
        style={
          isDragging
            ? { height: dragHeight, border: "1.5px dashed #7C4DBD", background: "rgba(124,77,189,0.06)" }
            : opts.inGroup
              ? { borderTop: opts.isFirst ? "none" : "1px solid #E4DAF6" }
              : { boxShadow: "0 8px 20px -14px rgba(58,52,46,0.2)" }
        }
      >
        {!isDragging && (
          <>
            <div
              className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[12px] font-extrabold"
              style={{ background: opts.inGroup ? "#EDE1FA" : "#EFE9E3", color: opts.inGroup ? "#7C4DBD" : "#8A7F72" }}
            >
              {opts.label}
            </div>
            {groupMode ? (
              <button
                onClick={() => !alreadyGrouped && toggleSelected(ex.id)}
                disabled={alreadyGrouped}
                className="w-11 h-11 -m-1.5 shrink-0 flex items-center justify-center touch-none select-none bg-transparent border-none cursor-pointer disabled:cursor-not-allowed"
                aria-label={isSelected ? "Remover da seleção para agrupar" : "Selecionar para agrupar"}
              >
                <span
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: alreadyGrouped ? "#DDD5E8" : isSelected ? "#7C4DBD" : "#C9BEDD",
                    background: isSelected ? "#7C4DBD" : "transparent",
                  }}
                >
                  {isSelected && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </span>
              </button>
            ) : (
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
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold text-ink">{ex.name}</div>
              <div className="flex gap-3.5 mt-1.5 text-[13px] font-bold text-sage flex-wrap items-center">
                <span>
                  {ex.series} × {ex.reps}
                </span>
                {!!ex.carga && <span className="text-terracotta">{ex.carga}</span>}
                <span className={opts.inGroup && !opts.isLast ? "font-semibold" : "text-ink-softer font-semibold"} style={opts.inGroup && !opts.isLast ? { color: "#7C4DBD" } : undefined}>
                  {restLabelFor(ex, opts.isLast)}
                </span>
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
              <div className="flex gap-1.5 mt-1 -ml-2 flex-wrap">
                <button onClick={() => editExercise(ex)} className="bg-transparent border-none px-2 py-3 min-h-11 text-xs font-bold text-ink cursor-pointer">
                  Editar
                </button>
                <button
                  onClick={() => duplicateExercise(ex)}
                  className="bg-transparent border-none px-2 py-3 min-h-11 text-xs font-bold text-ink cursor-pointer"
                >
                  Duplicar
                </button>
                {opts.inGroup && (
                  <button
                    onClick={() => ungroupExercise(ex.id)}
                    className="bg-transparent border-none px-2 py-3 min-h-11 text-xs font-bold text-terracotta cursor-pointer"
                  >
                    Remover do grupo
                  </button>
                )}
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
  };

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

        {state.exercises.length >= 2 && (
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs text-ink-softer font-bold">
              {groupMode ? `${selectedForGroup.length} selecionado${selectedForGroup.length === 1 ? "" : "s"}` : "Exercícios"}
            </span>
            {groupMode ? (
              <button onClick={cancelGroupMode} className="bg-transparent border-none text-xs font-bold text-ink-softer cursor-pointer py-1">
                Cancelar
              </button>
            ) : (
              <button onClick={startGroupMode} className="bg-transparent border-none text-xs font-bold text-terracotta cursor-pointer py-1">
                Agrupar em conjugado
              </button>
            )}
          </div>
        )}

        <div
          className="flex flex-col gap-2.5"
          ref={listRef}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={dragId ? { touchAction: "none" } : undefined}
        >
          {blocks.map((block) => {
            if (block.groupId === null) {
              const { exercise, label, isFirst, isLast } = block.items[0];
              return renderRow(exercise, { label, inGroup: false, isFirst, isLast });
            }
            return (
              <div
                key={block.groupId}
                className="rounded-2xl overflow-hidden"
                style={{ border: "1.5px solid #C9A0E8", boxShadow: "0 8px 20px -14px rgba(58,52,46,0.2)" }}
              >
                <div className="flex items-center justify-between px-3.5 pt-2.5 pb-1.5" style={{ background: "#F6F2FC" }}>
                  <span className="text-[10px] font-extrabold text-terracotta uppercase tracking-wide">⚡ Conjugado</span>
                  <button
                    onClick={() => dissolveGroup(block.groupId as string)}
                    className="bg-transparent border-none text-[11px] font-bold text-ink-softer cursor-pointer py-1"
                  >
                    Desfazer grupo
                  </button>
                </div>
                <div className="bg-white flex flex-col">
                  {block.items.map(({ exercise, label, isFirst, isLast }) => renderRow(exercise, { label, inGroup: true, isFirst, isLast }))}
                </div>
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

        {groupMode ? (
          <button
            onClick={confirmGroup}
            disabled={selectedForGroup.length < 2}
            className="w-full text-white text-[15px] font-bold py-4 rounded-2xl cursor-pointer flex items-center justify-center gap-2 border-none disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
          >
            ⚡ Agrupar como conjugado{selectedForGroup.length >= 2 ? ` (${selectedForGroup.length})` : ""}
          </button>
        ) : (
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
        )}
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
