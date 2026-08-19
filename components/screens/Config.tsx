"use client";

import { DESCANSO_OPTIONS, REPS_PRESETS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Chip } from "@/components/ui/Chip";

export function Config() {
  const { state, setCfg, addToTreino } = useApp();
  const cfg = state.cfg;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-1 pb-28 flex flex-col gap-5.5 flex-1">
        <div className="font-serif text-2xl text-ink">{cfg.exerciseName}</div>

        <div>
          <div className="text-[13px] font-bold text-ink mb-2">Séries</div>
          <div className="flex items-center gap-4.5">
            <button
              onClick={() => setCfg({ series: Math.max(1, cfg.series - 1) })}
              className="w-11 h-11 rounded-full border border-border bg-white text-xl font-bold text-ink cursor-pointer"
            >
              −
            </button>
            <span className="text-[22px] font-extrabold text-ink min-w-6 text-center">{cfg.series}</span>
            <button
              onClick={() => setCfg({ series: cfg.series + 1 })}
              className="w-11 h-11 rounded-full border border-border bg-white text-xl font-bold text-ink cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <div className="text-[13px] font-bold text-ink mb-2">Repetições</div>
          <input
            value={cfg.reps}
            onChange={(e) => setCfg({ reps: e.target.value })}
            className="w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-base text-ink mb-2"
          />
          <div className="flex flex-wrap gap-2">
            {REPS_PRESETS.map((rp) => (
              <button
                key={rp}
                onClick={() => setCfg({ reps: rp })}
                className="bg-tan border-none rounded-full px-3 py-1.5 text-xs font-semibold text-ink cursor-pointer"
              >
                {rp}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[13px] font-bold text-ink mb-2">Carga sugerida (opcional)</div>
          <input
            value={cfg.carga}
            onChange={(e) => setCfg({ carga: e.target.value })}
            placeholder="ex: 40kg, 60–70% 1RM ou carga moderada"
            className="w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-base text-ink"
          />
        </div>

        <div>
          <div className="text-[13px] font-bold text-ink mb-2">Descanso</div>
          <div className="flex flex-wrap gap-2">
            {DESCANSO_OPTIONS.map((d) => (
              <Chip key={d} label={d} active={cfg.descanso === d} onClick={() => setCfg({ descanso: d })} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-[13px] font-bold text-ink mb-2">Observação técnica (opcional)</div>
          <textarea
            value={cfg.obs}
            onChange={(e) => setCfg({ obs: e.target.value })}
            placeholder="ex: Descer controlando o movimento."
            className="w-full min-h-[70px] px-4 py-3.5 rounded-[14px] border border-border bg-white text-sm text-ink resize-none"
          />
        </div>

        <div>
          <div className="text-[13px] font-bold text-ink mb-2">Link do vídeo (opcional)</div>
          <input
            value={cfg.videoUrl}
            onChange={(e) => setCfg({ videoUrl: e.target.value })}
            placeholder="https://youtube.com/..."
            className="w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-sm text-ink"
          />
          <div className="text-xs text-ink-soft mt-1.5">Aparece como &quot;▶ Ver execução&quot; para {cfg.exerciseName || "este exercício"}.</div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-app border-t border-border px-5 pt-3.5 pb-5.5">
        <button
          onClick={addToTreino}
          className="w-full text-white border-none text-base font-bold py-4 rounded-full cursor-pointer"
          style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
        >
          {cfg.editingId ? "Salvar alterações" : "Adicionar ao treino"}
        </button>
      </div>
    </div>
  );
}
