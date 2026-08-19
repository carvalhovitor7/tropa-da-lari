"use client";

import { useEffect, useState } from "react";
import { currentAluna, useApp } from "@/lib/store";

// item 8: builds the real WhatsApp message (with a link to the persisted,
// shareable /ficha/[token] snapshot) and, when the aluna has a saved
// WhatsApp number, opens wa.me/<number> directly instead of a generic
// share sheet — so the button actually sends the message, not just a
// preview of what it would look like.
export function Whatsapp() {
  const { state, navTo, createShareLink } = useApp();
  const aluna = currentAluna(state);
  const [fichaUrl, setFichaUrl] = useState<string | null>(null);
  const [loadingLink, setLoadingLink] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off an async fetch on mount for this screen
    setLoadingLink(true);
    createShareLink().then((url) => {
      if (!cancelled) {
        setFichaUrl(url);
        setLoadingLink(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per visit to this screen
  }, []);

  const linkLine = fichaUrl ? `\n\nConfira aqui: ${fichaUrl}` : "";
  const message = `Oi, ${aluna.firstName}! Seu treino novo está pronto.${linkLine}\n\nQualquer dúvida durante os exercícios, me chama.\n\nBom treino!\nLari`;

  const digits = aluna.whatsapp.replace(/\D/g, "");
  const waUrl = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="flex-1 flex flex-col gap-3.5 p-4" style={{ background: "#EDE7F7" }}>
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-tl-[14px] rounded-tr-[14px] rounded-br-[2px] rounded-bl-[14px] bg-sage-bg p-3.5 flex flex-col gap-2">
          <div className="bg-white rounded-lg p-2.5 flex gap-2 items-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4C3A9E" strokeWidth={2}>
              <path d="M4 4h9a3 3 0 013 3v13H7a3 3 0 01-3-3V4z" />
              <line x1="8" y1="8" x2="14" y2="8" />
              <line x1="8" y1="12" x2="14" y2="12" />
            </svg>
            <div>
              <div className="text-xs font-bold text-ink">{state.treinoName}.pdf</div>
              <div className="text-[10px] text-ink-softer">Ficha de treino</div>
            </div>
          </div>
          <div className="text-[13px] text-ink whitespace-pre-line">{message}</div>
          <div className="text-[10px] text-ink-softer text-right">9:42</div>
        </div>
      </div>
      <div className="flex-1" />
      {digits ? (
        <div className="text-center text-xs text-ink-soft">Enviando direto para {aluna.whatsapp}</div>
      ) : (
        <div className="text-center text-xs text-ink-soft">
          {aluna.firstName} ainda não tem um WhatsApp salvo — escolha o contato no app do WhatsApp.
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
