"use client";

import { DURACAO_OPTIONS, FOCOS } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Chip } from "@/components/ui/Chip";
import { useState } from "react";

export function Iniciar() {
  const { state, setIniciarNome, setIniciarFoco, onComecarZero, onDuplicarAnterior, onUsarModelo } = useApp();
  const [duracao, setDuracao] = useState<string | null>(null);

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

      <div className="h-px bg-border my-1" />

      <div className="flex flex-col gap-2">
        <button
          onClick={onComecarZero}
          className="text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer"
          style={{ background: "linear-gradient(135deg,#CD8468,#A15840)" }}
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
