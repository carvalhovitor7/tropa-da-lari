"use client";

import { currentAluna, useApp } from "@/lib/store";

export function Whatsapp() {
  const { state, navTo } = useApp();
  const aluna = currentAluna(state);
  const message = `Oi, ${aluna.firstName}! Seu treino novo está pronto.\n\nQualquer dúvida durante os exercícios, me chama.\n\nBom treino!\nLari`;

  return (
    <div className="flex-1 flex flex-col gap-3.5 p-4" style={{ background: "#E9E1D6" }}>
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-tl-[14px] rounded-tr-[14px] rounded-br-[2px] rounded-bl-[14px] bg-sage-bg p-3.5 flex flex-col gap-2">
          <div className="bg-white rounded-lg p-2.5 flex gap-2 items-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A15840" strokeWidth={2}>
              <path d="M4 4h9a3 3 0 013 3v13H7a3 3 0 01-3-3V4z" />
              <line x1="8" y1="8" x2="14" y2="8" />
              <line x1="8" y1="12" x2="14" y2="12" />
            </svg>
            <div>
              <div className="text-xs font-bold text-ink">{state.treinoName}.pdf</div>
              <div className="text-[10px] text-ink-softer">Ficha de treino</div>
            </div>
          </div>
          <div className="text-[13px] text-ink whitespace-pre-line">{message}</div>
          <div className="text-[10px] text-ink-softer text-right">9:42</div>
        </div>
      </div>
      <div className="flex-1" />
      <button onClick={() => navTo("dashboard")} className="w-full bg-ink text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer">
        Concluir
      </button>
    </div>
  );
}
