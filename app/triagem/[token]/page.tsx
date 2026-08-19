import { getAlunaByToken } from "@/lib/triagemService";
import { StudentTriagemFlow } from "@/components/screening/StudentTriagemFlow";
import { Genero } from "@/lib/types";

// This route reads Postgres per-request (which aluna owns this token) so it
// can never be statically generated.
export const dynamic = "force-dynamic";

export default async function TriagemTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let aluna: { firstName: string; genero: Genero } | null = null;
  let failed = false;
  try {
    aluna = await getAlunaByToken(token);
  } catch (err) {
    console.error("[triagem/:token] failed to load aluna", err);
    failed = true;
  }

  if (!aluna) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center px-5">
        <div className="mx-auto w-full max-w-[430px] bg-app rounded-2xl p-8 text-center flex flex-col gap-3">
          <div className="font-serif text-2xl text-ink">Link não encontrado</div>
          <div className="text-sm text-ink-soft">
            {failed
              ? "Não foi possível verificar este link agora. Tente novamente em instantes."
              : "Este link de triagem é inválido ou expirou. Peça um novo link para a sua personal."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center px-0 sm:px-4 py-0 sm:py-6">
      <StudentTriagemFlow token={token} firstName={aluna.firstName} genero={aluna.genero} />
    </div>
  );
}
