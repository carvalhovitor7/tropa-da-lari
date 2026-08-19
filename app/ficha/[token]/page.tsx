import Image from "next/image";
import { getTreinoShare } from "@/lib/treinoShareService";
import { Genero } from "@/lib/types";
import { alunoNoun } from "@/lib/gender";

// Public, read-only snapshot of a shared treino (item 8). PIN-exempt like
// /triagem/[token] — the aluna opens this straight from a wa.me message, no
// login. Visual design adapted from components/screens/Pdf.tsx, but driven
// entirely off the persisted treino_shares.treino_json snapshot instead of
// live app state, since this route has no access to (and shouldn't need)
// Larissa's session.
export const dynamic = "force-dynamic";

export default async function FichaTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let share: Awaited<ReturnType<typeof getTreinoShare>> = null;
  let failed = false;
  try {
    share = await getTreinoShare(token);
  } catch (err) {
    console.error("[ficha/:token] failed to load share", err);
    failed = true;
  }

  if (!share) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center px-5">
        <div className="mx-auto w-full max-w-[430px] bg-app rounded-2xl p-8 text-center flex flex-col gap-3">
          <div className="font-serif text-2xl text-ink">Ficha não encontrada</div>
          <div className="text-sm text-ink-soft">
            {failed
              ? "Não foi possível carregar esta ficha agora. Tente novamente em instantes."
              : "Este link de ficha é inválido ou expirou. Peça um novo link para a sua personal."}
          </div>
        </div>
      </div>
    );
  }

  const { treino, alunaName, alunaGenero } = share;
  const noun = alunoNoun(alunaGenero as Genero);
  const foco = (treino.foco || "Treino").toUpperCase();
  const enfase = treino.enfase?.trim();

  return (
    <div className="min-h-dvh w-full flex items-start sm:items-center justify-center" style={{ background: "#EDE7F7" }}>
      <div className="w-full max-w-[430px] px-4 pt-6 pb-10">
        <div className="bg-white rounded-[18px] overflow-hidden flex flex-col" style={{ boxShadow: "0 20px 45px -20px rgba(76,58,158,0.35)" }}>
          <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
            <div
              className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2"
              style={{ borderColor: "#C9A0E8", boxShadow: "0 6px 16px -8px rgba(76,58,158,0.4)" }}
            >
              <Image src="/brand/logo.png" alt="Tropa da Lari" width={64} height={64} className="w-full h-full object-cover" />
            </div>
            <span className="text-white text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full" style={{ background: "#4C3A9E" }}>
              TREINO
            </span>
          </div>
          <div className="px-5 pb-4">
            <div className="font-serif text-[22px] leading-tight text-ink">{foco}</div>
            {!!enfase && <div className="text-[11px] font-bold text-terracotta uppercase tracking-wide">({enfase.toUpperCase()})</div>}
            <div className="text-[13px] text-ink-soft mt-1">
              Ficha d{noun === "aluna" ? "a" : "o"} {noun} <b>{alunaName}</b>
            </div>
          </div>

          <div className="mx-4 mb-4 rounded-2xl overflow-hidden border border-border">
            <div
              className="grid text-white text-[9.5px] font-extrabold uppercase tracking-wide px-3 py-2.5"
              style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)", gridTemplateColumns: "1.6fr 0.6fr 0.7fr 1fr 0.8fr" }}
            >
              <span>Exercício</span>
              <span>Séries</span>
              <span>Reps</span>
              <span>Carga</span>
              <span>Descanso</span>
            </div>
            {treino.exercises.map((ex, i) => (
              <div
                key={ex.id}
                className="px-3 py-2.5 text-[11px] text-ink flex flex-col gap-1.5"
                style={{ background: i % 2 === 0 ? "#FFFFFF" : "#F6F2FC", borderTop: "1px solid #E4DAF6" }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 mt-0.5"
                    style={{ background: "#7C4DBD" }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-bold leading-snug">{ex.name}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 ml-7 text-[10.5px]">
                  <span>
                    <span className="text-ink-softer">Séries </span>
                    <b>{ex.series}</b>
                  </span>
                  <span>
                    <span className="text-ink-softer">Reps </span>
                    <b>{ex.reps}</b>
                  </span>
                  {!!ex.carga && (
                    <span>
                      <span className="text-ink-softer">Carga </span>
                      <b className="text-terracotta">{ex.carga}</b>
                    </span>
                  )}
                  <span>
                    <span className="text-ink-softer">Descanso </span>
                    <b>{ex.descanso}</b>
                  </span>
                </div>
                {ex.obs && <div className="ml-7 text-[10.5px] text-ink-softer italic leading-snug">{ex.obs}</div>}
                {ex.videoUrl && (
                  <a
                    href={ex.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-7 inline-flex items-center gap-1 text-[10.5px] font-bold text-terracotta no-underline w-fit"
                  >
                    ▶ Ver execução
                  </a>
                )}
              </div>
            ))}
            {treino.exercises.length === 0 && (
              <div className="px-3 py-4 text-center text-[12px] text-ink-soft" style={{ borderTop: "1px solid #E4DAF6" }}>
                Nenhum exercício neste treino.
              </div>
            )}
          </div>

          {treino.observacoesTreinadora && (
            <div className="mx-4 mb-4 bg-sage-bg rounded-2xl p-3.5">
              <div className="text-[10px] font-extrabold text-sage-text uppercase tracking-wide mb-1.5">Observação da treinadora</div>
              <div className="text-[12px] text-sage-text leading-relaxed">{treino.observacoesTreinadora}</div>
            </div>
          )}

          <div className="py-2.5 text-center" style={{ background: "#4C3A9E" }}>
            <span className="text-white text-[9.5px] font-bold tracking-wide">✧ DISCIPLINA QUE TRANSFORMA. FOCO QUE GERA RESULTADOS! ♡</span>
          </div>
        </div>
      </div>
    </div>
  );
}
