"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useApp } from "@/lib/store";
import { treinoDateSummary, isAlunaVencida } from "@/lib/dates";

export function Dashboard() {
  const { state, navTo, openPerfil, openTreino, setAlunaId, syncTriagens } = useApp();

  useEffect(() => {
    syncTriagens();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const vencidas = state.alunas.filter((a) => a.hasTreinos && isAlunaVencida(a.treinos, state.settings.renewalWeeks));

  const recentTreinos = state.alunas
    .flatMap((a) => a.treinos.map((t) => ({ aluna: a, treino: t })))
    .sort((a, b) => new Date(b.treino.createdAt || 0).getTime() - new Date(a.treino.createdAt || 0).getTime())
    .slice(0, 4);

  const totalAlunos = state.alunas.length;

  const generoCount = { feminino: 0, masculino: 0, nao_informado: 0 };
  for (const a of state.alunas) generoCount[a.genero]++;
  const generoSegments = [
    { label: "mulheres", key: "feminino" as const, n: generoCount.feminino, color: "#7C4DBD" },
    { label: "homens", key: "masculino" as const, n: generoCount.masculino, color: "#C9A0E8" },
    { label: "não informado", key: "nao_informado" as const, n: generoCount.nao_informado, color: "#E7DFF5" },
  ].filter((g) => g.n > 0);

  const FAIXAS = [
    { label: "até 20", test: (i: number) => i <= 20 },
    { label: "21–30", test: (i: number) => i >= 21 && i <= 30 },
    { label: "31–40", test: (i: number) => i >= 31 && i <= 40 },
    { label: "41–50", test: (i: number) => i >= 41 && i <= 50 },
    { label: "51+", test: (i: number) => i >= 51 },
  ];
  const faixaCounts = FAIXAS.map((f) => ({
    label: f.label,
    n: state.alunas.filter((a) => a.idade != null && f.test(a.idade)).length,
  }));
  const idadeNaoInformada = state.alunas.filter((a) => a.idade == null).length;
  if (idadeNaoInformada > 0) faixaCounts.push({ label: "Idade não informada", n: idadeNaoInformada });
  const topFaixas = faixaCounts
    .filter((f) => f.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);

  // Objetivo breakdown (item: Dashboard pie/donut) — grouped by the aluno's
  // raw `goal` text since that's the only objetivo field alunas actually
  // carry today (free text, not constrained to the OBJETIVOS option list).
  // A coherent set of purple/violet tints/shades from the brand palette,
  // reused (not reinvented) — same family as the terracotta/sage tokens
  // used everywhere else in the app.
  const OBJETIVO_COLORS = ["#4C3A9E", "#7C4DBD", "#9B7FD4", "#5B4E9E", "#C9A0E8", "#6E5FA8", "#8B6FCB"];
  const NAO_INFORMADO_COLOR = "#E4DAF6"; // matches --color-border, the app's neutral tint
  const objetivoCounts = new Map<string, number>();
  for (const a of state.alunas) {
    const key = a.goal.trim() || "Não informado";
    objetivoCounts.set(key, (objetivoCounts.get(key) ?? 0) + 1);
  }
  const objetivoEntriesSorted = Array.from(objetivoCounts.entries()).sort((a, b) => b[1] - a[1]);
  const objetivoOtherEntries = objetivoEntriesSorted.filter(([label]) => label !== "Não informado");
  const objetivoSegments = objetivoEntriesSorted.map(([label, n]) => {
    const color =
      label === "Não informado"
        ? NAO_INFORMADO_COLOR
        : OBJETIVO_COLORS[objetivoOtherEntries.findIndex(([l]) => l === label) % OBJETIVO_COLORS.length];
    return { label, n, color };
  });
  const objetivoStops = objetivoSegments
    .reduce<{ acc: number; parts: string[] }>(
      (memo, seg, i) => {
        const start = memo.acc;
        const isLast = i === objetivoSegments.length - 1;
        const acc = memo.acc + (seg.n / totalAlunos) * 360;
        const end = isLast ? 360 : acc;
        return { acc, parts: [...memo.parts, `${seg.color} ${start}deg ${end}deg`] };
      },
      { acc: 0, parts: [] }
    )
    .parts.join(", ");

  return (
    <div className="px-5 pt-5.5 pb-24 flex flex-col gap-6.5">
      <div className="flex items-center gap-3.5">
        <div
          className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white"
          style={{ boxShadow: "0 8px 18px -8px rgba(76,58,158,0.45)" }}
        >
          <Image src="/brand/logo.png" alt="Tropa da Lari" width={56} height={56} className="w-full h-full object-cover" priority />
        </div>
        <div>
          <div className="font-serif text-[34px] leading-[1.15] text-ink">Boa tarde, Lari.</div>
          <div className="text-[15px] text-ink-soft mt-1">O que vamos montar hoje?</div>
        </div>
      </div>

      {vencidas.length > 0 && (
        <button
          onClick={() => navTo("acompanhamento")}
          className="text-left rounded-2xl p-3.5 flex items-center gap-2.5 cursor-pointer border-none"
          style={{ background: "#FBF0DC" }}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#836318" }} />
          <span className="text-[13px] font-bold" style={{ color: "#836318" }}>
            {vencidas.length} {vencidas.length === 1 ? "aluno está" : "alunos estão"} com treino vencido
          </span>
        </button>
      )}

      <button
        onClick={() => navTo("alunas")}
        className="w-full text-white border-none rounded-[18px] p-4.5 text-[17px] font-bold flex items-center justify-center gap-2 cursor-pointer"
        style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)", boxShadow: "0 12px 28px -10px rgba(76,58,158,0.5)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Criar treino
      </button>

      <div className="bg-white rounded-[20px] p-4.5 flex items-center gap-4" style={{ boxShadow: "0 10px 26px -14px rgba(58,52,46,0.2)" }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "conic-gradient(#7C4DBD 0deg 288deg, #E7DFF5 288deg 360deg)" }}
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[13px] font-extrabold text-ink">80%</div>
        </div>
        <div>
          <div className="text-[13px] font-bold text-ink">Sua semana</div>
          <div className="text-xs text-ink-soft mt-0.5">
            {recentTreinos.length} treinos montados ·{" "}
            {(() => {
              const n = state.alunas.filter((a) => a.hasTreinos).length;
              return `${n} ${n === 1 ? "aluno atendido" : "alunos atendidos"}`;
            })()}
          </div>
          <div className="flex gap-1 mt-2.5 items-end">
            {[
              { h: 10, c: "#EDE7FA" },
              { h: 16, c: "#8B7BC4" },
              { h: 22, c: "#5B4E9E" },
              { h: 12, c: "#EDE7FA" },
              { h: 18, c: "#8B7BC4" },
              { h: 8, c: "#EDE7FA" },
              { h: 8, c: "#EDE7FA" },
            ].map((b, i) => (
              <div key={i} style={{ width: 8, height: b.h, borderRadius: 3, background: b.c }} />
            ))}
          </div>
        </div>
      </div>

      {totalAlunos > 0 && (
        <div className="bg-white rounded-[20px] p-4.5 flex flex-col gap-3.5" style={{ boxShadow: "0 10px 26px -14px rgba(58,52,46,0.2)" }}>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[32px] leading-none text-ink">{totalAlunos}</span>
            <span className="text-[13px] font-bold text-ink-soft">{totalAlunos === 1 ? "aluno no total" : "alunos no total"}</span>
          </div>

          {generoSegments.length > 0 && (
            <div>
              <div className="text-xs font-bold text-ink-soft mb-1.5">Gênero</div>
              <div className="flex w-full h-2 rounded-full overflow-hidden" style={{ background: "#EDE7FA" }}>
                {generoSegments.map((g) => (
                  <div key={g.key} style={{ width: `${(g.n / totalAlunos) * 100}%`, background: g.color }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                {generoSegments.map((g) => (
                  <div key={g.key} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: g.color }} />
                    {Math.round((g.n / totalAlunos) * 100)}% {g.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {topFaixas.length > 0 && (
            <div>
              <div className="text-xs font-bold text-ink-soft mb-1.5">Faixa etária</div>
              <div className="flex flex-wrap gap-1.5">
                {topFaixas.map((f) => (
                  <div
                    key={f.label}
                    className="text-[11px] font-semibold text-ink px-2.5 py-1 rounded-full"
                    style={{ background: "#F3EEFB" }}
                  >
                    {f.label} · {f.n}
                  </div>
                ))}
              </div>
            </div>
          )}

          {objetivoSegments.length > 0 && (
            <div>
              <div className="text-xs font-bold text-ink-soft mb-2">Objetivo</div>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `conic-gradient(${objetivoStops})` }}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[11px] font-extrabold text-ink">
                    {objetivoSegments.length}
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  {objetivoSegments.map((seg) => (
                    <div key={seg.label} className="flex items-center gap-1.5 text-[11px] text-ink-soft">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
                      <span className="truncate">
                        {Math.round((seg.n / totalAlunos) * 100)}% {seg.label}
                      </span>
                      <span className="text-ink-softer font-semibold shrink-0">({seg.n})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <div className="text-sm font-bold text-ink mb-2.5">Treinos recentes</div>
        <div className="flex flex-col gap-2.5">
          {recentTreinos.map(({ aluna, treino }) => (
            <div key={treino.id} className="bg-white rounded-2xl p-3.5 flex flex-col gap-2" style={{ boxShadow: "0 8px 20px -12px rgba(58,52,46,0.18)" }}>
              <div>
                <div className="text-[15px] font-bold text-ink">{aluna.name}</div>
                <div className="text-[13px] text-ink-soft">
                  {treino.name} • {treino.foco}
                </div>
                <div className="text-[11px] text-ink-softer mt-1">{treinoDateSummary(treino.createdAt, treino.sentAt)}</div>
              </div>
              <button
                onClick={() => {
                  setAlunaId(aluna.id);
                  openTreino(treino);
                }}
                className="self-start bg-white border border-border text-terracotta text-[13px] font-bold px-3.5 py-2 rounded-full cursor-pointer"
              >
                Continuar editando
              </button>
            </div>
          ))}
          {recentTreinos.length === 0 && <div className="text-sm text-ink-soft">Nenhum treino montado ainda.</div>}
        </div>
      </div>

      <div>
        <div className="text-sm font-bold text-ink mb-2.5">Alunos recentes</div>
        <div className="flex gap-3.5 overflow-x-auto pb-1">
          {state.alunas.map((al) => (
            <button
              key={al.id}
              onClick={() => openPerfil(al.id)}
              className="flex flex-col items-center gap-1.5 bg-transparent border-none cursor-pointer shrink-0"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-sage font-bold text-base bg-sage-bg"
                style={{ boxShadow: "0 4px 12px -6px rgba(58,52,46,0.3)" }}
              >
                {al.initials}
              </div>
              <span className="text-xs text-ink font-semibold max-w-16 overflow-hidden text-ellipsis whitespace-nowrap">
                {al.firstName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
