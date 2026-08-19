"use client";

import { useTriagemForm } from "@/lib/triagemForm";
import { computeAlert } from "@/lib/screening";

export function StepResumo() {
  const { draft: d } = useTriagemForm();
  const alert = computeAlert(d);
  const dorSel = d.dorRegioes || [];
  const hasAtencoes = dorSel.length > 0;
  const hasMovimentos = (d.movimentos || []).length > 0;
  const resumoRestricoes = d.restricaoProfissional ? d.restricaoTexto || "Restrição informada, sem detalhe." : "Nenhuma informada.";

  return (
    <div className="px-5 pt-3.5 pb-8 flex flex-col gap-5">
      <div className="rounded-2xl p-4 flex gap-3 items-start" style={{ background: alert.bg }}>
        <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: alert.dot }} />
        <div>
          <div className="text-[13px] font-extrabold" style={{ color: alert.dot }}>
            {alert.title}
          </div>
          <div className="text-[13px] text-ink mt-0.5 leading-snug">{alert.text}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-[14px] p-3.5">
          <div className="text-[11px] text-ink-softer font-bold uppercase">Objetivo</div>
          <div className="text-[13px] text-ink font-semibold mt-1">{d.objetivos.join(", ") || "—"}</div>
        </div>
        <div className="bg-white rounded-[14px] p-3.5">
          <div className="text-[11px] text-ink-softer font-bold uppercase">Experiência</div>
          <div className="text-[13px] text-ink font-semibold mt-1">{d.experiencia || "—"}</div>
        </div>
        <div className="bg-white rounded-[14px] p-3.5">
          <div className="text-[11px] text-ink-softer font-bold uppercase">Frequência</div>
          <div className="text-[13px] text-ink font-semibold mt-1">{d.frequencia ? `${d.frequencia} por semana` : "—"}</div>
        </div>
        <div className="bg-white rounded-[14px] p-3.5">
          <div className="text-[11px] text-ink-softer font-bold uppercase">Tempo disponível</div>
          <div className="text-[13px] text-ink font-semibold mt-1">{d.duracao || "—"}</div>
        </div>
      </div>

      {hasAtencoes && (
        <div>
          <div className="text-sm font-bold text-ink mb-2.5">Atenções</div>
          <div className="flex flex-col gap-2.5">
            {dorSel.map((r) => (
              <div key={r} className="bg-white rounded-[14px] p-3.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.15)" }}>
                <div className="text-[13px] font-bold text-ink">{r}</div>
                <div className="text-xs font-bold text-terracotta mt-0.5">Dor: {d.dorIntensidade[r] ?? "—"}/10</div>
                <div className="text-xs text-ink-soft mt-1 leading-snug">{(d.dorQuando || []).join(", ") || "Sem detalhes adicionais."}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasMovimentos && (
        <div>
          <div className="text-sm font-bold text-ink mb-2">Movimentos relatados com desconforto</div>
          <div className="flex flex-wrap gap-2">
            {(d.movimentos || []).map((mv) => (
              <span key={mv} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#F6DEDA", color: "#8A3B2C" }}>
                {mv}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-sm font-bold text-ink mb-1.5">Restrições profissionais</div>
        <div className="text-[13px] text-ink-soft">{resumoRestricoes}</div>
      </div>
    </div>
  );
}
