"use client";

import { MOVIMENTOS_LISTA, QUANDOS, REGIOES } from "@/lib/data";
import { useApp } from "@/lib/store";
import { Chip } from "@/components/ui/Chip";
import { YesNo } from "./YesNo";

export function StepDor() {
  const { state, toggleArr, setDraft, setIntensidade } = useApp();
  const d = state.triagemDraft;
  const dorSel = d.dorRegioes || [];

  return (
    <div className="px-5 pt-3.5 pb-8 flex flex-col gap-5.5">
      <div>
        <div className="text-[15px] font-bold text-ink mb-2.5">Sente alguma dor ou desconforto atualmente?</div>
        <YesNo
          value={d.temDor}
          onYes={() => setDraft("temDor", true)}
          onNo={() => {
            setDraft("temDor", false);
            setDraft("dorRegioes", []);
            setDraft("dorIntensidade", {});
            setDraft("dorQuando", []);
            setDraft("movimentos", []);
          }}
        />
      </div>

      {d.temDor === true && (
        <>
          <div>
            <div className="text-[15px] font-bold text-ink mb-2.5">Onde?</div>
            <div className="flex flex-wrap gap-2">
              {REGIOES.map((r) => (
                <Chip key={r} small label={r} active={dorSel.includes(r)} onClick={() => toggleArr("dorRegioes", r)} />
              ))}
            </div>
          </div>

          {dorSel.map((r) => (
            <div key={r} className="bg-white rounded-[14px] p-3.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.15)" }}>
              <div className="text-[13px] font-bold text-ink mb-2">{r} — intensidade do desconforto</div>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: 11 }, (_, n) => n).map((n) => {
                  const active = (d.dorIntensidade[r] ?? -1) === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setIntensidade(r, n)}
                      className="w-6.5 h-6.5 rounded-[7px] text-[11px] font-bold cursor-pointer"
                      style={{
                        background: active ? "#BC6B52" : "#FFFFFF",
                        color: active ? "#FFFFFF" : "#3A342E",
                        border: `1px solid ${active ? "#BC6B52" : "#E8DDD0"}`,
                      }}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-ink-softer mt-1">
                <span>Nenhum</span>
                <span>Muito intenso</span>
              </div>
            </div>
          ))}

          <div>
            <div className="text-[15px] font-bold text-ink mb-2.5">Quando você percebe esse desconforto?</div>
            <div className="flex flex-wrap gap-2">
              {QUANDOS.map((q) => (
                <Chip key={q} small label={q} active={(d.dorQuando || []).includes(q)} onClick={() => toggleArr("dorQuando", q)} />
              ))}
            </div>
          </div>

          <div>
            <div className="text-[15px] font-bold text-ink mb-2.5">Algum movimento ou exercício costuma causar desconforto?</div>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {MOVIMENTOS_LISTA.map((m) => (
                <Chip key={m} small label={m} active={(d.movimentos || []).includes(m)} onClick={() => toggleArr("movimentos", m)} />
              ))}
            </div>
            <textarea
              value={d.movimentosTexto}
              onChange={(e) => setDraft("movimentosTexto", e.target.value)}
              placeholder="Conte para Lari o que você sente."
              className="w-full min-h-[70px] px-3.5 py-3 rounded-[14px] border border-border bg-white text-[13px] text-ink resize-none"
            />
          </div>
        </>
      )}
    </div>
  );
}
