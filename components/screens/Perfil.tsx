"use client";

import { useEffect, useState } from "react";
import { currentAluna, useApp } from "@/lib/store";
import { computeAlert, computeWarnings } from "@/lib/screening";
import { treinoDateSummary } from "@/lib/dates";
import { agree, alunoNoun } from "@/lib/gender";

export function Perfil() {
  const {
    state,
    onFazerTriagem,
    onVerTriagem,
    onNovoTreino,
    onDuplicarAnterior,
    onUsarModelo,
    openTreino,
    syncTriagens,
    updateAlunaInstagram,
    updateAlunaProfile,
    deleteAluna,
    navTo,
    toast,
  } = useApp();
  const aluna = currentAluna(state);
  const triagem = state.triagens[aluna.id];
  const alert = computeAlert(triagem);
  const warnings = computeWarnings(triagem);
  const [copying, setCopying] = useState(false);
  const [editingInsta, setEditingInsta] = useState(false);
  const [instaDraft, setInstaDraft] = useState(aluna.instagram);
  const [openHistoryFor, setOpenHistoryFor] = useState<string | null>(null);
  const [editingIdade, setEditingIdade] = useState(false);
  const [idadeDraft, setIdadeDraft] = useState(aluna.idade ? String(aluna.idade) : "");
  const [editingLocal, setEditingLocal] = useState(false);
  const [localDraft, setLocalDraft] = useState(aluna.local || "");
  const [editingWhatsapp, setEditingWhatsapp] = useState(false);
  const [whatsappDraft, setWhatsappDraft] = useState(aluna.whatsapp || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Pull any triagem submitted from the student's own phone since we last
  // loaded this profile.
  useEffect(() => {
    syncTriagens();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per profile visit
  }, [aluna.id]);

  const copyLink = async () => {
    setCopying(true);
    try {
      const res = await fetch(`/api/alunas/${aluna.id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("not_found");
      const data = (await res.json()) as { aluna: { screeningToken: string } };
      const url = `${window.location.origin}/triagem/${data.aluna.screeningToken}`;
      await navigator.clipboard.writeText(url);
      toast("Link copiado.");
    } catch {
      toast("Não foi possível gerar o link agora.");
    } finally {
      setCopying(false);
    }
  };

  const saveInsta = () => {
    updateAlunaInstagram(aluna.id, instaDraft.replace(/^@/, "").trim());
    setEditingInsta(false);
    toast("Instagram atualizado.");
  };

  const saveIdade = () => {
    const n = Number.parseInt(idadeDraft, 10);
    updateAlunaProfile(aluna.id, { idade: Number.isFinite(n) && n > 0 ? n : undefined });
    setEditingIdade(false);
    toast("Idade atualizada.");
  };

  const saveLocal = () => {
    updateAlunaProfile(aluna.id, { local: localDraft.trim() });
    setEditingLocal(false);
    toast("Local de treino atualizado.");
  };

  const saveWhatsapp = () => {
    updateAlunaProfile(aluna.id, { whatsapp: whatsappDraft.trim() });
    setEditingWhatsapp(false);
    toast("WhatsApp atualizado.");
  };

  const noun = alunoNoun(aluna.genero);

  const confirmDeleteAluno = async () => {
    setDeleting(true);
    const ok = await deleteAluna(aluna.id);
    setDeleting(false);
    if (ok) {
      toast(`${aluna.firstName} ${agree(aluna.genero, "removido", "removida")}.`);
      navTo("alunas");
    } else {
      setConfirmDelete(false);
      toast("Não foi possível excluir agora. Tente novamente.");
    }
  };

  return (
    <div className="px-5 pt-2 pb-24 flex flex-col gap-5.5">
      <div className="flex gap-3.5 items-center">
        <div
          className="w-15 h-15 rounded-full flex items-center justify-center text-sage font-bold text-xl bg-sage-bg shrink-0"
          style={{ boxShadow: "0 6px 16px -8px rgba(58,52,46,0.3)" }}
        >
          {aluna.initials}
        </div>
        <div>
          <div className="font-serif text-2xl text-ink">{aluna.name}</div>
          <div className="text-[13px] text-ink-soft">{aluna.level}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-[14px] p-3.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.18)" }}>
          <div className="text-[11px] text-ink-softer font-bold uppercase tracking-wide">Objetivo</div>
          <div className="text-sm text-ink font-semibold mt-1">{aluna.goal || "—"}</div>
        </div>
        <div className="bg-white rounded-[14px] p-3.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.18)" }}>
          <div className="text-[11px] text-ink-softer font-bold uppercase tracking-wide">Frequência</div>
          <div className="text-sm text-ink font-semibold mt-1">{aluna.freq || "—"}</div>
        </div>
      </div>

      <div className="bg-white rounded-[14px] p-3.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.18)" }}>
        <div className="text-[11px] text-ink-softer font-bold uppercase tracking-wide">Instagram</div>
        {editingInsta ? (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-ink-softer text-sm">@</span>
            <input
              autoFocus
              value={instaDraft}
              onChange={(e) => setInstaDraft(e.target.value.replace(/^@/, ""))}
              className="flex-1 text-sm text-ink outline-none border-b border-border pb-1"
              placeholder="usuario"
            />
            <button onClick={saveInsta} className="text-xs font-bold text-terracotta cursor-pointer bg-transparent border-none">
              Salvar
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setInstaDraft(aluna.instagram);
              setEditingInsta(true);
            }}
            className="mt-1 text-sm text-ink font-semibold bg-transparent border-none cursor-pointer p-0 block"
          >
            {aluna.instagram ? `@${aluna.instagram}` : <span className="text-ink-soft font-normal">+ adicionar @</span>}
          </button>
        )}
      </div>

      <div className="bg-white rounded-[14px] p-3.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.18)" }}>
        <div className="text-[11px] text-ink-softer font-bold uppercase tracking-wide">WhatsApp</div>
        {editingWhatsapp ? (
          <div className="mt-1.5 flex items-center gap-2">
            <input
              autoFocus
              value={whatsappDraft}
              onChange={(e) => setWhatsappDraft(e.target.value)}
              placeholder="ex: 11 91234-5678"
              inputMode="tel"
              className="flex-1 text-sm text-ink outline-none border-b border-border pb-1"
            />
            <button onClick={saveWhatsapp} className="text-xs font-bold text-terracotta cursor-pointer bg-transparent border-none">
              Salvar
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setWhatsappDraft(aluna.whatsapp || "");
              setEditingWhatsapp(true);
            }}
            className="mt-1 text-sm text-ink font-semibold bg-transparent border-none cursor-pointer p-0 block"
          >
            {aluna.whatsapp || <span className="text-ink-soft font-normal">+ adicionar número</span>}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-[14px] p-3.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.18)" }}>
          <div className="text-[11px] text-ink-softer font-bold uppercase tracking-wide">Idade</div>
          {editingIdade ? (
            <div className="mt-1.5 flex items-center gap-2">
              <input
                autoFocus
                type="number"
                inputMode="numeric"
                value={idadeDraft}
                onChange={(e) => setIdadeDraft(e.target.value)}
                className="w-14 text-sm text-ink outline-none border-b border-border pb-1"
                placeholder="anos"
              />
              <button onClick={saveIdade} className="text-xs font-bold text-terracotta cursor-pointer bg-transparent border-none">
                Salvar
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIdadeDraft(aluna.idade ? String(aluna.idade) : "");
                setEditingIdade(true);
              }}
              className="mt-1 text-sm text-ink font-semibold bg-transparent border-none cursor-pointer p-0 block"
            >
              {aluna.idade ? `${aluna.idade} anos` : <span className="text-ink-soft font-normal">+ adicionar</span>}
            </button>
          )}
        </div>
        <div className="bg-white rounded-[14px] p-3.5" style={{ boxShadow: "0 6px 16px -10px rgba(58,52,46,0.18)" }}>
          <div className="text-[11px] text-ink-softer font-bold uppercase tracking-wide">Local de treino</div>
          {editingLocal ? (
            <div className="mt-1.5 flex items-center gap-2">
              <input
                autoFocus
                value={localDraft}
                onChange={(e) => setLocalDraft(e.target.value)}
                className="flex-1 min-w-0 text-sm text-ink outline-none border-b border-border pb-1"
                placeholder="ex: Academia completa"
              />
              <button onClick={saveLocal} className="text-xs font-bold text-terracotta cursor-pointer bg-transparent border-none shrink-0">
                Salvar
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setLocalDraft(aluna.local || "");
                setEditingLocal(true);
              }}
              className="mt-1 text-sm text-ink font-semibold bg-transparent border-none cursor-pointer p-0 block text-left"
            >
              {aluna.local || <span className="text-ink-soft font-normal">+ adicionar</span>}
            </button>
          )}
        </div>
      </div>

      {aluna.notes && <div className="bg-sage-bg rounded-[14px] p-3.5 text-[13px] text-sage-text">{aluna.notes}</div>}

      {triagem ? (
        <button
          onClick={onVerTriagem}
          className="text-left border-none rounded-2xl p-3.5 flex items-center gap-2.5 cursor-pointer"
          style={{ background: alert.bg }}
        >
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: alert.dot }} />
          <div className="flex-1">
            <div className="text-[13px] font-bold text-ink">Triagem · {alert.title}</div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {warnings.map((w) => (
                <span key={w} className="bg-white text-[#8A3B2C] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  ⚠ {w}
                </span>
              ))}
            </div>
          </div>
          <span className="text-xs font-bold text-terracotta shrink-0">Ver tudo</span>
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={copyLink}
            disabled={copying}
            className="text-left bg-white rounded-2xl p-3.5 flex items-center gap-2.5 cursor-pointer disabled:opacity-60"
            style={{ border: "1.5px dashed #7C4DBD" }}
          >
            <div className="w-9 h-9 rounded-full bg-terracotta-pill flex items-center justify-center shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4C3A9E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1" />
                <path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-ink">Copiar link de triagem de {aluna.firstName}</div>
              <div className="text-xs text-ink-soft mt-0.5">{agree(aluna.genero, "Ele", "Ela")} preenche pelo próprio celular, 3–5 min.</div>
            </div>
          </button>
          <button
            onClick={onFazerTriagem}
            className="text-left bg-transparent border-none px-3.5 py-1 text-xs font-semibold text-ink-soft cursor-pointer self-start"
          >
            ou preencher com ela agora
          </button>
        </div>
      )}

      <div>
        <div className="text-sm font-bold text-ink mb-2.5">Treinos</div>
        {aluna.hasTreinos ? (
          <div className="flex flex-col gap-2.5">
            {aluna.treinos.map((tr) => (
              <div key={tr.id} className="bg-white border border-border rounded-[14px] px-4 py-3.5 flex flex-col gap-2">
                <button onClick={() => openTreino(tr)} className="flex justify-between items-center bg-transparent border-none cursor-pointer text-left p-0">
                  <div>
                    <div className="text-[15px] font-bold text-ink">{tr.name}</div>
                    <div className="text-[13px] text-ink-soft">{tr.foco}</div>
                    <div className="text-[11px] text-ink-softer mt-1">{treinoDateSummary(tr.createdAt, tr.sentAt)}</div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C4DBD" strokeWidth={2.2} strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
                {!!tr.versions?.length && (
                  <div>
                    <button
                      onClick={() => setOpenHistoryFor(openHistoryFor === tr.id ? null : tr.id)}
                      className="bg-transparent border-none text-[11px] font-bold text-terracotta cursor-pointer p-0"
                    >
                      {openHistoryFor === tr.id ? "Ocultar histórico de alterações" : "Ver histórico de alterações"}
                    </button>
                    {openHistoryFor === tr.id && (
                      <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-2">
                        {tr.versions.map((v, i) => (
                          <div key={i} className="text-[11px] text-ink-soft leading-relaxed">
                            <span className="font-bold text-ink-softer">{new Date(v.at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}:</span>{" "}
                            {v.changes.join(" ")}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl px-5 py-7 text-center flex flex-col gap-2.5 items-center"
            style={{ boxShadow: "0 8px 20px -12px rgba(58,52,46,0.15)" }}
          >
            <div className="text-sm text-ink font-semibold">Nenhum treino criado ainda.</div>
            <div className="text-[13px] text-ink-soft">Comece montando o primeiro treino de {aluna.firstName}.</div>
            <button
              onClick={onNovoTreino}
              className="mt-1.5 text-white border-none text-sm font-bold px-5 py-3 rounded-full cursor-pointer"
              style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
            >
              Criar primeiro treino
            </button>
          </div>
        )}
      </div>

      {aluna.hasTreinos && (
        <div className="flex flex-col gap-2">
          <button onClick={onNovoTreino} className="bg-ink text-white border-none text-sm font-bold py-3.5 rounded-full cursor-pointer">
            + Novo treino
          </button>
          <button
            onClick={onDuplicarAnterior}
            className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer"
          >
            Duplicar treino anterior
          </button>
          <button onClick={onUsarModelo} className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer">
            Usar modelo
          </button>
        </div>
      )}

      <button
        onClick={() => setConfirmDelete(true)}
        className="mt-2 bg-transparent border-none text-[13px] font-bold cursor-pointer py-2"
        style={{ color: "#B5473A" }}
      >
        Excluir {noun}
      </button>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4"
          onClick={() => !deleting && setConfirmDelete(false)}
        >
          <div
            className="w-full sm:max-w-[400px] bg-app rounded-t-[24px] sm:rounded-[24px] p-5 pb-7 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-serif text-[22px] text-ink">Excluir {noun}?</div>
            <div className="text-[13px] text-ink-soft leading-relaxed">
              Isso vai remover <b>{aluna.name}</b>, {agree(aluna.genero, "seus", "seus")} treinos e {agree(aluna.genero, "sua", "sua")} triagem
              permanentemente. Essa ação não pode ser desfeita.
            </div>
            <button
              onClick={confirmDeleteAluno}
              disabled={deleting}
              className="text-white border-none text-[15px] font-bold py-4 rounded-full cursor-pointer disabled:opacity-60"
              style={{ background: "#B5473A" }}
            >
              {deleting ? "Excluindo…" : `Sim, excluir ${noun}`}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="bg-white text-ink border border-border text-sm font-semibold py-3.5 rounded-full cursor-pointer disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
