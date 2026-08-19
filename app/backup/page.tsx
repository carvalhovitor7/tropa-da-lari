"use client";

// Print-optimized backup/export view (item 7). Not a server-side PDF
// pipeline — Larissa opens this page and uses the browser's native
// "Print -> Save as PDF" to get a document listing every aluna with her key
// data. Protected like the rest of the app (proxy.ts doesn't exempt
// /backup), so it requires the PIN session cookie just like everything
// else that isn't the student-facing triagem/ficha routes.
import { useEffect, useState } from "react";
import { Aluna, TriagemDraft } from "@/lib/types";

export default function BackupPage() {
  const [alunas, setAlunas] = useState<(Aluna & { triagem: TriagemDraft | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alunas", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { alunas: { aluna: Aluna; triagem: TriagemDraft | null }[] }) => {
        setAlunas((d.alunas ?? []).map((e) => ({ ...e.aluna, triagem: e.triagem })));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-dvh bg-white text-black px-6 py-8 print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <div className="no-print flex items-center justify-between mb-6 max-w-3xl mx-auto">
        <div className="font-serif text-2xl" style={{ color: "#362F52" }}>
          Backup de alunos — Tropa da Lari
        </div>
        <button
          onClick={() => window.print()}
          className="text-white border-none text-sm font-bold px-5 py-3 rounded-full cursor-pointer"
          style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
        >
          Imprimir / Salvar PDF
        </button>
      </div>

      {loading && <div className="max-w-3xl mx-auto text-sm text-gray-500">Carregando…</div>}

      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {alunas.map((a) => (
          <div key={a.id} className="border border-gray-300 rounded-lg p-4 break-inside-avoid">
            <div className="text-lg font-bold" style={{ color: "#362F52" }}>
              {a.name}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mt-2 text-gray-800">
              <div>
                <b>Objetivo:</b> {a.goal || "—"}
              </div>
              <div>
                <b>Frequência:</b> {a.freq || "—"}
              </div>
              <div>
                <b>Nível:</b> {a.level || "—"}
              </div>
              <div>
                <b>Idade:</b> {a.idade ?? "—"}
              </div>
              <div>
                <b>Local:</b> {a.local || "—"}
              </div>
              <div>
                <b>WhatsApp:</b> {a.whatsapp || "—"}
              </div>
              <div>
                <b>Instagram:</b> {a.instagram ? `@${a.instagram}` : "—"}
              </div>
              <div>
                <b>Notas:</b> {a.notes || "—"}
              </div>
            </div>
            {a.triagem && (
              <div className="mt-2 text-sm text-gray-800">
                <b>Triagem:</b> objetivos {a.triagem.objetivos.join(", ") || "—"}; dor{" "}
                {a.triagem.temDor ? a.triagem.dorRegioes.join(", ") || "sim" : "não"}; lesão prévia{" "}
                {a.triagem.temLesao ? "sim" : "não"}; observação: {a.triagem.observacaoLarissa || "—"}
              </div>
            )}
          </div>
        ))}
        {!loading && alunas.length === 0 && <div className="text-sm text-gray-500">Nenhum aluno cadastrado.</div>}
      </div>
    </div>
  );
}
