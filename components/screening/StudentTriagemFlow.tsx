"use client";

import { useMemo, useState } from "react";
import { Genero, TriagemDraft, emptyDraft } from "@/lib/types";
import { TriagemFormApi, TriagemFormContext } from "@/lib/triagemForm";
import { Chip } from "@/components/ui/Chip";
import { StepPerfil } from "./StepPerfil";
import { StepDor } from "./StepDor";
import { StepLesoes } from "./StepLesoes";
import { StepCirurgias } from "./StepCirurgias";
import { StepAcompanhamento } from "./StepAcompanhamento";
import { StepSaude } from "./StepSaude";
import { StepResumo } from "./StepResumo";

const GENERO_OPTIONS: [Genero, string][] = [
  ["feminino", "Feminino"],
  ["masculino", "Masculino"],
  ["nao_informado", "Prefiro não dizer"],
];

const STEPS: { title: string; Comp: React.ComponentType }[] = [
  { title: "Objetivo e experiência", Comp: StepPerfil },
  { title: "Dores e desconforto", Comp: StepDor },
  { title: "Lesões anteriores", Comp: StepLesoes },
  { title: "Cirurgias", Comp: StepCirurgias },
  { title: "Acompanhamento profissional", Comp: StepAcompanhamento },
  { title: "Saúde geral", Comp: StepSaude },
];

type Stage = "intro" | number | "resumo" | "submitting" | "done" | "error";

// Standalone screening flow for the student's own phone (app/triagem/[token]).
// Reuses the exact same Step* components (and therefore copy, questions and
// design tokens) as Larissa's in-app manual triagem, but drives them off a
// local draft instead of the global store, and ends in "Enviar" -> thank-you
// instead of Larissa's internal "Revisão" step.
export function StudentTriagemFlow({
  token,
  firstName,
  genero: initialGenero,
}: {
  token: string;
  firstName: string;
  genero: Genero;
}) {
  const [draft, setDraftState] = useState<TriagemDraft>(emptyDraft);
  const [stage, setStage] = useState<Stage>("intro");
  const [errorMsg, setErrorMsg] = useState("");
  // Item 8: optional WhatsApp number the student can add herself, sent
  // alongside the screening answers and landed on her profile the same way.
  const [whatsapp, setWhatsapp] = useState("");
  // Lets a student who was invited by link (and so has no idade/genero on
  // file yet) fill both in herself on the intro screen. Seeded from
  // whatever Larissa may already have on file, and drives the
  // gender-aware copy in the rest of this flow too.
  const [idade, setIdade] = useState("");
  const [genero, setGenero] = useState<Genero>(initialGenero);

  const setDraft = (field: keyof TriagemDraft, value: unknown) =>
    setDraftState((d) => ({ ...d, [field]: value }));

  const toggleArr = (field: keyof TriagemDraft, item: string) =>
    setDraftState((d) => {
      const arr = d[field] as unknown as string[];
      const next = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
      return { ...d, [field]: next };
    });

  const setIntensidade = (regiao: string, n: number) =>
    setDraftState((d) => ({ ...d, dorIntensidade: { ...d.dorIntensidade, [regiao]: n } }));

  const formApi: TriagemFormApi = useMemo(
    () => ({ draft, toggleArr, setDraft, setIntensidade, genero }),
    [draft, genero]
  );

  const totalSteps = STEPS.length + 1; // + resumo
  const currentIndex = typeof stage === "number" ? stage : stage === "resumo" ? STEPS.length : 0;
  const progress = stage === "intro" ? 0 : Math.round(((currentIndex + 1) / totalSteps) * 100);

  const goNext = () => {
    if (typeof stage === "number") {
      if (stage + 1 < STEPS.length) setStage(stage + 1);
      else setStage("resumo");
    }
  };

  const goBack = () => {
    if (stage === "resumo") setStage(STEPS.length - 1);
    else if (typeof stage === "number") {
      if (stage === 0) setStage("intro");
      else setStage(stage - 1);
    }
  };

  const submit = async () => {
    setStage("submitting");
    try {
      const n = Number.parseInt(idade, 10);
      const res = await fetch(`/api/triagem/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          completedAt: new Date().toISOString(),
          whatsapp,
          idade: Number.isFinite(n) && n > 0 ? n : undefined,
          genero,
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      setStage("done");
    } catch {
      setErrorMsg("Não foi possível enviar. Verifique sua internet e tente novamente.");
      setStage("error");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[430px] min-h-dvh bg-app flex flex-col relative shadow-2xl">
      {stage === "intro" && (
        <Intro
          firstName={firstName}
          whatsapp={whatsapp}
          onWhatsappChange={setWhatsapp}
          idade={idade}
          onIdadeChange={setIdade}
          genero={genero}
          onGeneroChange={setGenero}
          onStart={() => setStage(0)}
        />
      )}

      {(typeof stage === "number" || stage === "resumo") && (
        <TriagemFormContext.Provider value={formApi}>
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-2.5 px-5 pt-3.5 pb-2.5 sticky top-0 z-10 bg-app">
              <button
                onClick={goBack}
                aria-label="Voltar"
                className="w-11 h-11 rounded-full border border-border bg-white flex items-center justify-center cursor-pointer shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#362F52" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-sage-soft font-bold uppercase tracking-wide">Triagem</span>
                <span className="text-[17px] font-bold text-ink whitespace-nowrap overflow-hidden text-ellipsis">
                  {stage === "resumo" ? "Resumo" : STEPS[stage].title}
                </span>
              </div>
            </div>

            <div className="px-5 pt-1 shrink-0">
              <div className="h-1 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "#7C4DBD" }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {stage === "resumo" ? <StepResumo /> : (() => {
                const { Comp } = STEPS[stage];
                return <Comp />;
              })()}
            </div>

            <div
              className="sticky bottom-0 bg-app border-t border-border px-5 pt-3.5 shrink-0"
              style={{ paddingBottom: "calc(22px + env(safe-area-inset-bottom))" }}
            >
              <button
                onClick={stage === "resumo" ? submit : goNext}
                className="w-full text-white border-none text-base font-bold py-4 rounded-full cursor-pointer"
                style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
              >
                {stage === "resumo" ? "Enviar" : "Continuar"}
              </button>
            </div>
          </div>
        </TriagemFormContext.Provider>
      )}

      {stage === "submitting" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10 text-center">
          <div className="text-sm text-ink-soft">Enviando suas respostas…</div>
        </div>
      )}

      {stage === "error" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="text-sm text-ink">{errorMsg}</div>
          <button
            onClick={submit}
            className="text-white border-none text-[15px] font-bold px-6 py-3.5 rounded-full cursor-pointer"
            style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {stage === "done" && <ThankYou firstName={firstName} />}
    </div>
  );
}

function Intro({
  firstName,
  whatsapp,
  onWhatsappChange,
  idade,
  onIdadeChange,
  genero,
  onGeneroChange,
  onStart,
}: {
  firstName: string;
  whatsapp: string;
  onWhatsappChange: (v: string) => void;
  idade: string;
  onIdadeChange: (v: string) => void;
  genero: Genero;
  onGeneroChange: (v: Genero) => void;
  onStart: () => void;
}) {
  return (
    <div className="px-5 pt-8 pb-10 flex flex-col gap-5 flex-1">
      <div className="w-13 h-13 rounded-2xl bg-sage-bg flex items-center justify-center">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5B4E9E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      </div>
      <div>
        <div className="font-serif text-[26px] leading-[1.2] text-ink">Olá, {firstName}!</div>
        <div className="text-sm text-ink-soft mt-2 leading-relaxed">
          A Lari pediu para você preencher esta triagem antes do primeiro treino. São algumas perguntas rápidas (3–5
          min) sobre seu histórico e objetivos.
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 text-[13px] text-ink-soft leading-relaxed" style={{ boxShadow: "0 8px 20px -14px rgba(58,52,46,0.2)" }}>
        Isto não substitui avaliação médica ou fisioterapêutica. Suas respostas servem apenas de apoio para a Lari
        montar seu treino.
      </div>
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-4" style={{ boxShadow: "0 8px 20px -14px rgba(58,52,46,0.2)" }}>
        <div>
          <label className="text-[13px] font-bold text-ink">Gênero</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {GENERO_OPTIONS.map(([value, label]) => (
              <Chip key={value} small label={label} active={genero === value} onClick={() => onGeneroChange(value)} />
            ))}
          </div>
        </div>
        <div>
          <label className="text-[13px] font-bold text-ink">Idade</label>
          <input
            type="number"
            inputMode="numeric"
            value={idade}
            onChange={(e) => onIdadeChange(e.target.value)}
            placeholder="anos"
            className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 8px 20px -14px rgba(58,52,46,0.2)" }}>
        <label className="text-[13px] font-bold text-ink">Seu WhatsApp (opcional)</label>
        <input
          value={whatsapp}
          onChange={(e) => onWhatsappChange(e.target.value)}
          placeholder="ex: 11 91234-5678"
          inputMode="tel"
          className="mt-1.5 w-full px-4 py-3.5 rounded-[14px] border border-border bg-white text-[15px] text-ink"
        />
        <div className="text-xs text-ink-soft mt-1.5">Assim a Lari pode te enviar o treino direto por lá.</div>
      </div>
      <div className="flex-1" />
      <button
        onClick={onStart}
        className="w-full text-white border-none text-base font-bold py-4 rounded-full cursor-pointer"
        style={{ background: "linear-gradient(135deg,#C9A0E8,#4C3A9E)" }}
      >
        Começar
      </button>
    </div>
  );
}

function ThankYou({ firstName }: { firstName: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5.5 p-10 text-center">
      <div className="w-18 h-18 rounded-full bg-sage-bg flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5B4E9E" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <div>
        <div className="font-serif text-[28px] text-ink">Obrigada, {firstName}!</div>
        <div className="text-sm text-ink-soft mt-1.5">
          Suas respostas foram enviadas para a Lari. Ela vai usar essas informações para montar o seu treino.
        </div>
      </div>
      <div className="text-xs text-ink-softer">Você já pode fechar esta página.</div>
    </div>
  );
}
