"use client";

import { allTemplates, currentAluna, useApp } from "@/lib/store";
import { Modelo } from "@/lib/types";

export function Modelos() {
  const { state, applyTemplate, onCriarModelo } = useApp();
  const aluna = currentAluna(state);
  const templates = allTemplates(state);

  // "Recomendado" means this template suits an aluna with a similar profile
  // — matching both her objetivo and her nível, not just one or the other,
  // so the highlight stays meaningful instead of lighting up on almost
  // every template.
  const isRecommended = (t: Modelo) => {
    const goalMatch = t.objetivos.length === 0 || t.objetivos.some((o) => aluna.goal.toLowerCase().includes(o.toLowerCase()));
    const levelMatch = t.niveis.length === 0 || t.niveis.includes(aluna.level);
    return t.objetivos.length + t.niveis.length > 0 && goalMatch && levelMatch;
  };

  const sorted = [...templates].sort((a, b) => Number(isRecommended(b)) - Number(isRecommended(a)));

  return (
    <div className="px-5 pt-2 pb-24 flex flex-col gap-3">
      <button
        onClick={onCriarModelo}
        className="w-full bg-white text-terracotta text-[15px] font-bold py-4 rounded-2xl cursor-pointer flex items-center justify-center gap-2"
        style={{ border: "1.5px dashed #BC6B52" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A15840" strokeWidth={2.4} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Criar modelo
      </button>

      {sorted.map((t) => {
        const recommended = isRecommended(t);
        return (
          <div
            key={t.id}
            className="bg-white rounded-2xl p-4 flex flex-col gap-2"
            style={{
              boxShadow: "0 8px 22px -14px rgba(58,52,46,0.2)",
              border: recommended ? "1.5px solid #BC6B52" : undefined,
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[15px] font-bold text-ink">{t.name}</div>
              {t.isCustom && (
                <span className="bg-sage-bg text-sage-text text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-full">Seu modelo</span>
              )}
              {recommended && (
                <span className="bg-terracotta-pill text-[#8A3B2C] text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-full">
                  Recomendado para {aluna.firstName}
                </span>
              )}
            </div>
            <div className="text-[13px] text-ink-soft">{t.desc || `${t.exercises.length} exercícios`}</div>
            <button
              onClick={() => applyTemplate(t)}
              className="self-start bg-white border border-border text-terracotta text-[13px] font-bold px-4 py-2.5 rounded-full cursor-pointer"
            >
              Usar para {aluna.firstName}
            </button>
          </div>
        );
      })}
    </div>
  );
}
