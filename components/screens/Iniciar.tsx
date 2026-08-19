"use client";

import { DURACAO_OPTIONS, FOCOS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Chip } from "@/components/ui/Chip";
import { useState } from "react";

export function Iniciar() {
  const { state, setIniciarNome, setIniciarFoco, setIniciarWeeklyTarget, onComecarZero, onDuplicarAnterior, onUsarModelo } = useApp();
  const [duracao, setDuracao] = useState<string | null>(null);
  const [emphasisGroups, setEmphasisGroups] = useState<string[]>(() => state.iniciarWeeklyTargets.map((w) => w.grupo));
  const [showEmphasis, setShowEmphasis] = useState(state.iniciarWeeklyTargets.length > 0);

  const toggleEmphasis = (grupo: string) => {
    setEmphasisGroups((prev) => {
      if (prev.includes(grupo)) {
        setIniciarWeeklyTarget(grupo, null);
        return prev.filter((g) => g !== grupo);
      }
      return [...prev, grupo];
    });
  };

  const targetFor = (grupo: string) => state.iniciarWeeklyTargets.find((w) => w.grupo === grupo)?.reps ?? "";

  return (
    <div className="px-5 pt-2 pb-32 flex flex-col gap-5">
      <div>
        <label className="text-[13px] font-bold text-ink">Nome do treino</label>
        <input
          value={state.iniciarNome}
          onChange={(e) => setIniciarNome(e.target.value)}
          className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
        />
      </div>
      <div>
        <label className="text-[13px] font-bold text-ink">Foco</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {FOCOS.map((f) => (
            <Chip key={f} label={f} active={state.iniciarFoco === f} onClick={() => setIniciarFoco(f)} />
          ))}
        </div>
      </div>
      <div>
        <label className="text-[13px] font-bold text-ink">Duração aproximada (opcional)</label>
        <div className="flex gap-2 mt-2">
          {DURACAO_OPTIONS.map((d) => (
            <Chip key={d} label={d} active={duracao === d} onClick={() => setDuracao(duracao === d ? null : d)} />
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowEmphasis((v) => !v)}
          className="text-[13px] font-bold text-terracotta bg-transparent border-none cursor-pointer p-0 flex items-center gap-1.5"
        >
          {showEmphasis ? "− " : "+ "}Ênfase semanal por grupo muscular (opcional)
        </button>
        {showEmphasis && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="text-xs text-ink-soft leading-relaxed">
              Para dar mais volume a um grupo muscular ao longo da semana, defina uma meta de repetições totais — somando todos os treinos.
            </div>
            <div className="flex flex-wrap gap-2">
              {FOCOS.filter((f) => f !== "Corpo inteiro").map((f) => (
                <Chip key={f} label={f} active={emphasisGroups.includes(f)} onClick={() => toggleEmphasis(f)} />
              ))}
            </div>
            {emphasisGroups.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {emphasisGroups.map((g) => (
                  <div key={g} className="flex items-center justify-between gap-3 bg-white rounded-[14px] border border-border px-4 py-3">
                    <span className="text-sm font-semibold text-ink">{g}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        value={targetFor(g)}
                        onChange={(e) => {
                          const n = e.target.value === "" ? null : Number(e.target.value);
                          setIniciarWeeklyTarget(g, n);
                        }}
                        placeholder="0"
                        className="w-20 px-3 py-2 rounded-[10px] border border-border bg-white text-sm text-ink text-right"
                      />
                      <span className="text-xs text-ink-softer">reps/semana</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-border my-1" />

      <div className="flex flex-col gap-2">
        <button
          onClick={onComecarZero}
          className="text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer"
          style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
        >
          Começar do zero
        </button>
        <button onClick={onDuplicarAnterior} className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer">
          Duplicar treino anterior
        </button>
        <button onClick={onUsarModelo} className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer">
          Usar modelo
        </button>
      </div>
    </div>
  );
}
