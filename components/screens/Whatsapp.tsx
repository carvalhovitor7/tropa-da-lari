"use client";

import { useEffect, useState } from "react";
import { currentAluna, useApp } from "@/lib/store";
import { downloadFichaPdf, fichaPdfFilename } from "@/lib/pdf";

// item 8: builds the real WhatsApp message (with a link to the persisted,
// shareable /ficha/[token] snapshot) and, when the aluna has a saved
// WhatsApp number, opens wa.me/<number> directly instead of a generic
// share sheet — so the button actually sends the message, not just a
// preview of what it would look like.
//
// wa.me links can only pre-fill text, never attach a file — WhatsApp's
// platform gives no way to auto-attach anything through a link (only the
// paid Business API can), so the PDF can't be "sent" together with the
// message automatically. Instead the flow here is: download the real PDF,
// then open WhatsApp with an editable message, and Larissa attaches the
// downloaded file herself before hitting send.
export function Whatsapp() {
  const { state, navTo, createShareLink } = useApp();
  const aluna = currentAluna(state);
  const triagem = state.triagens[aluna.id];
  const [fichaUrl, setFichaUrl] = useState<string | null>(null);
  const [loadingLink, setLoadingLink] = useState(true);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [message, setMessage] = useState(
    `Oi, ${aluna.firstName}! Seu treino novo está pronto.\n\nVou te mandar a ficha em PDF aqui em seguida (é só abrir o anexo 😉).\n\nQualquer dúvida durante os exercícios, me chama.\n\nBom treino!\nLari`
  );

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off an async fetch on mount for this screen
    setLoadingLink(true);
    createShareLink().then((url) => {
      if (!cancelled) {
        setFichaUrl(url);
        setLoadingLink(false);
        setMessage((m) => (url ? `${m}\n\nSe preferir ver pelo celular: ${url}` : m));
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per visit to this screen
  }, []);

  const digits = aluna.whatsapp.replace(/\D/g, "");
  const waUrl = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  const handleDownload = () => {
    downloadFichaPdf(aluna, triagem);
    setPdfDownloaded(true);
  };

  return (
    <div className="flex-1 flex flex-col gap-3.5 p-4" style={{ background: "#EDE7F7" }}>
      <div className="bg-white rounded-2xl border border-border p-3.5 flex flex-col gap-2.5">
        <div className="text-[10px] font-extrabold text-ink-softer uppercase tracking-wide">Passo 1 · Baixe o PDF completo</div>
        <button
          onClick={handleDownload}
          className="w-full text-white border-none text-[14px] font-bold py-3.5 rounded-full cursor-pointer flex items-center justify-center gap-2"
          style={{ background: pdfDownloaded ? "#6F7D5E" : "#4C3A9E" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v13 M7 11l5 5 5-5 M4 21h16" />
          </svg>
          {pdfDownloaded ? `Baixado: ${fichaPdfFilename(aluna)}` : "Baixar ficha completa (PDF)"}
        </button>
        {!pdfDownloaded && <div className="text-[11px] text-ink-soft">Baixe antes de abrir o WhatsApp para poder anexar o arquivo na conversa.</div>}
      </div>

      <div className="bg-white rounded-2xl border border-border p-3.5 flex flex-col gap-2">
        <div className="text-[10px] font-extrabold text-ink-softer uppercase tracking-wide">Passo 2 · Edite a mensagem (opcional)</div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={7}
          className="w-full text-[13px] text-ink bg-app rounded-lg border border-border p-2.5 resize-none"
        />
      </div>

      {digits ? (
        <div className="text-center text-xs text-ink-soft">Passo 3 · Vai abrir o WhatsApp de {aluna.whatsapp} — anexe o PDF baixado e envie.</div>
      ) : (
        <div className="text-center text-xs text-ink-soft">
          Passo 3 · {aluna.firstName} ainda não tem um WhatsApp salvo — escolha o contato no app, anexe o PDF baixado e envie.
        </div>
      )}

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={loadingLink}
        className="w-full text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer flex items-center justify-center gap-2 no-underline"
        style={{ background: "#25D366", opacity: loadingLink ? 0.7 : 1 }}
      >
        {loadingLink ? "Preparando link…" : "Abrir WhatsApp"}
      </a>
      <button onClick={() => navTo("dashboard")} className="w-full bg-ink text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer">
        Concluir
      </button>
    </div>
  );
}
