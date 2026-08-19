"use client";

import { ALUNAS, useApp } from "@/lib/store";

export function Alunas() {
  const { state, setAlunaSearch, openPerfil } = useApp();
  const filtered = ALUNAS.filter((a) => a.name.toLowerCase().includes(state.alunaSearch.toLowerCase()));

  return (
    <div className="px-5 pt-5.5 pb-24 flex flex-col gap-4">
      <div className="font-serif text-[28px] text-ink">Alunas</div>
      <input
        value={state.alunaSearch}
        onChange={(e) => setAlunaSearch(e.target.value)}
        placeholder="Buscar aluna…"
        className="w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
      />
      <div className="flex flex-col gap-3">
        {filtered.map((al) => (
          <div key={al.id} className="bg-white rounded-[18px] p-4 flex flex-col gap-2.5" style={{ boxShadow: "0 10px 24px -14px rgba(58,52,46,0.22)" }}>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sage font-bold bg-sage-bg shrink-0">{al.initials}</div>
              <div className="min-w-0">
                <div className="text-base font-bold text-ink">{al.name}</div>
                <div className="text-[13px] text-ink-soft">{al.goal}</div>
              </div>
            </div>
            <div className="flex gap-3.5 text-xs text-ink-softer pl-[60px]">
              <span>{al.freq}</span>
              <span>Atualizado {al.last}</span>
            </div>
            <button
              onClick={() => openPerfil(al.id)}
              className="self-start ml-[60px] bg-terracotta-strong text-white border-none text-[13px] font-bold px-4 py-2.5 rounded-full cursor-pointer"
            >
              Montar treino
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
