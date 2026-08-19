"use client";

import { useState } from "react";
import { CATEGORIES, FAVORITOS, QUICK_FILTERS, RECENTES } from "@/lib/data";
import { currentAluna, useApp } from "@/lib/store";
import { computeSuggestions } from "@/lib/screening";
import { Chip } from "@/components/ui/Chip";

export function Busca() {
  const { state, setSearchQuery, selectExercise } = useApp();
  const aluna = currentAluna(state);
  const triagem = state.triagens[aluna.id];
  const suggestions = computeSuggestions(triagem);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const q = state.searchQuery.trim().toLowerCase();
  const results: { name: string; group: string }[] = [];
  if (q) {
    CATEGORIES.forEach((c) => c.items.forEach((name) => {
      if (name.toLowerCase().includes(q)) results.push({ name, group: c.name });
    }));
  }

  return (
    <div className="px-5 pt-1 pb-10 flex flex-col gap-4.5">
      <div className="relative">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6C6390" strokeWidth={2.2} className="absolute left-3.5 top-3.5">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={state.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar exercício…"
          className="w-full pl-10 pr-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
        />
      </div>

      {!q && (
        <div className="flex flex-col gap-5">
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {QUICK_FILTERS.map((f) => (
              <div key={f} className="shrink-0">
                <Chip small label={f} active={activeFilter === f} onClick={() => setActiveFilter(activeFilter === f ? null : f)} />
              </div>
            ))}
          </div>

          {suggestions && (
            <div>
              <div className="text-sm font-bold text-ink mb-1">Sugestões para {aluna.firstName}</div>
              <div className="text-xs text-ink-soft mb-2.5 leading-relaxed">Com base na triagem — a escolha final é sempre sua.</div>

              <div className="text-[11px] text-sage font-extrabold uppercase tracking-wide mb-1.5">Opções para avaliar</div>
              <div className="flex flex-col gap-2 mb-4">
                {suggestions.avaliar.map((sa) => (
                  <button
                    key={sa.name}
                    onClick={() => selectExercise(sa.name)}
                    className="text-left bg-white rounded-[14px] px-3.5 py-3 cursor-pointer"
                    style={{ border: "1px solid #EDE7FA" }}
                  >
                    <div className="text-sm font-bold text-ink">{sa.name}</div>
                    <div className="text-xs text-sage mt-1 leading-relaxed">{sa.reason}</div>
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-terracotta font-extrabold uppercase tracking-wide mb-1.5">Merece atenção</div>
              <div className="flex flex-col gap-2">
                {suggestions.atencao.map((se) => (
                  <button
                    key={se.name}
                    onClick={() => selectExercise(se.name)}
                    className="text-left rounded-[14px] px-3.5 py-3 cursor-pointer"
                    style={{ background: "#F6F0FC", border: "1px solid #DCC6EF" }}
                  >
                    <div className="text-sm font-bold text-ink">{se.name}</div>
                    <div className="text-xs text-terracotta mt-1 leading-relaxed">{se.reason}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[13px] font-bold text-ink mb-2">Recentes</div>
            <div className="flex flex-wrap gap-2">
              {RECENTES.map((r) => (
                <button
                  key={r}
                  onClick={() => selectExercise(r)}
                  className="inline-flex items-center bg-tan border-none rounded-full px-3.5 min-h-11 text-[13px] font-semibold text-ink cursor-pointer"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-ink mb-2">Favoritos</div>
            <div className="flex flex-wrap gap-2">
              {FAVORITOS.map((f) => (
                <button
                  key={f}
                  onClick={() => selectExercise(f)}
                  className="inline-flex items-center bg-sage-bg border-none rounded-full px-3.5 min-h-11 text-[13px] font-semibold text-sage-text cursor-pointer"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[13px] font-bold text-ink mb-2.5">Categorias</div>
            <div className="flex flex-col gap-2.5">
              {CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <div className="text-xs text-ink-softer font-bold uppercase tracking-wide mb-1.5">{cat.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((it) => (
                      <button
                        key={it}
                        onClick={() => selectExercise(it)}
                        className="inline-flex items-center bg-white border border-border rounded-full px-3.5 min-h-11 text-[13px] font-semibold text-ink cursor-pointer"
                      >
                        {it}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!!q && (
        <div className="flex flex-col gap-2">
          {results.map((sr) => (
            <button
              key={sr.name}
              onClick={() => selectExercise(sr.name)}
              className="flex justify-between items-center bg-white border border-border rounded-[14px] px-4 py-3.5 cursor-pointer text-left"
            >
              <span className="text-[15px] font-semibold text-ink">{sr.name}</span>
              <span className="text-xs text-ink-softer">{sr.group}</span>
            </button>
          ))}
          {results.length === 0 && <div className="text-center py-5 text-sm text-ink-soft">Nenhum exercício encontrado.</div>}
        </div>
      )}

      <button
        onClick={() => selectExercise("Exercício personalizado")}
        className="w-full bg-transparent text-[13px] font-semibold text-ink-soft py-3.5 rounded-[14px] cursor-pointer"
        style={{ border: "1px dashed #C9A0E8" }}
      >
        + Criar exercício personalizado
      </button>
    </div>
  );
}
