"use client";

import { TEMPLATES } from "@/lib/data";
import { currentAluna, useApp } from "@/lib/store";

export function Modelos() {
  const { state, applyTemplate } = useApp();
  const aluna = currentAluna(state);

  return (
    <div className="px-5 pt-2 pb-24 flex flex-col gap-3">
      {TEMPLATES.map((t) => (
        <div key={t.id} className="bg-white rounded-2xl p-4 flex flex-col gap-2" style={{ boxShadow: "0 8px 22px -14px rgba(58,52,46,0.2)" }}>
          <div className="text-[15px] font-bold text-ink">{t.name}</div>
          <div className="text-[13px] text-ink-soft">{t.desc}</div>
          <button
            onClick={() => applyTemplate(t)}
            className="self-start bg-white border border-border text-terracotta text-[13px] font-bold px-4 py-2.5 rounded-full cursor-pointer"
          >
            Usar para {aluna.firstName}
          </button>
        </div>
      ))}
    </div>
  );
}
