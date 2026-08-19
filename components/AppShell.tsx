"use client";

import { useApp } from "@/lib/store";
import { ScreenKey } from "@/lib/types";
import { BackHeader } from "./BackHeader";
import { BottomNav } from "./BottomNav";
import { Toast } from "./Toast";
import { Dashboard } from "./screens/Dashboard";
import { Alunas } from "./screens/Alunas";
import { PlaceholderTab } from "./screens/PlaceholderTab";
import { Perfil } from "./screens/Perfil";
import { Iniciar } from "./screens/Iniciar";
import { Modelos } from "./screens/Modelos";
import { CriarModelo } from "./screens/CriarModelo";
import { Montador } from "./screens/Montador";
import { Busca } from "./screens/Busca";
import { Config } from "./screens/Config";
import { Revisao } from "./screens/Revisao";
import { Finalizado } from "./screens/Finalizado";
import { Pdf } from "./screens/Pdf";
import { Whatsapp } from "./screens/Whatsapp";
import { TriagemIntro } from "./screening/TriagemIntro";
import { TriagemStep } from "./screening/TriagemStep";
import { currentAluna } from "@/lib/store";

const TOP_SCREENS: ScreenKey[] = ["dashboard", "alunas", "treinos-ph", "biblioteca-ph"];
const TRIAGEM_SCREENS: ScreenKey[] = [
  "triagem-perfil",
  "triagem-dor",
  "triagem-lesoes",
  "triagem-cirurgias",
  "triagem-acompanhamento",
  "triagem-saude",
  "triagem-resumo",
  "triagem-revisao",
];

export function AppShell() {
  const { state } = useApp();
  const aluna = currentAluna(state);
  const isTop = TOP_SCREENS.includes(state.screen);
  const isTriagemStep = TRIAGEM_SCREENS.includes(state.screen);

  const headerMap: Partial<Record<ScreenKey, [string, string]>> = {
    perfil: ["ALUNA", aluna.name],
    iniciar: ["NOVO TREINO", "Como começar?"],
    modelos: ["MODELOS", "Meus modelos"],
    "criar-modelo": ["MODELOS", "Salvar modelo"],
    montador: ["MONTADOR", `${aluna.firstName} • ${state.treinoName}`],
    busca: ["ADICIONAR", "Buscar exercício"],
    config: ["CONFIGURAR", state.cfg.exerciseName || "Exercício"],
    revisao: ["REVISÃO", "Prévia do treino"],
    finalizado: ["", ""],
    pdf: ["FICHA", "Prévia do PDF"],
    whatsapp: ["COMPARTILHAR", "WhatsApp"],
    "triagem-intro": ["TRIAGEM", "Antes de começar"],
    "triagem-perfil": ["TRIAGEM", "Objetivo e experiência"],
    "triagem-dor": ["TRIAGEM", "Dores e desconforto"],
    "triagem-lesoes": ["TRIAGEM", "Lesões anteriores"],
    "triagem-cirurgias": ["TRIAGEM", "Cirurgias"],
    "triagem-acompanhamento": ["TRIAGEM", "Acompanhamento profissional"],
    "triagem-saude": ["TRIAGEM", "Saúde geral"],
    "triagem-resumo": ["TRIAGEM", state.triagemViewOnly ? `Resumo de ${aluna.firstName}` : "Resumo"],
    "triagem-revisao": ["TRIAGEM", "Revisão da Larissa"],
  };

  const hm = headerMap[state.screen];
  const showHeader = !isTop && state.screen !== "finalizado" && state.screen !== "triagem-intro";

  return (
    <div className="mx-auto w-full max-w-[430px] min-h-dvh bg-app flex flex-col relative shadow-2xl">
      <div className="flex-1 overflow-y-auto flex flex-col relative">
        {showHeader && hm && <BackHeader eyebrow={hm[0]} title={hm[1]} />}

        {state.screen === "dashboard" && <Dashboard />}
        {state.screen === "alunas" && <Alunas />}
        {(state.screen === "treinos-ph" || state.screen === "biblioteca-ph") && (
          <PlaceholderTab title={state.screen === "treinos-ph" ? "Treinos" : "Biblioteca"} />
        )}
        {state.screen === "perfil" && <Perfil />}
        {state.screen === "iniciar" && <Iniciar />}
        {state.screen === "modelos" && <Modelos />}
        {state.screen === "criar-modelo" && <CriarModelo />}
        {state.screen === "montador" && <Montador />}
        {state.screen === "busca" && <Busca />}
        {state.screen === "config" && <Config />}
        {state.screen === "revisao" && <Revisao />}
        {state.screen === "finalizado" && <Finalizado />}
        {state.screen === "pdf" && <Pdf />}
        {state.screen === "whatsapp" && <Whatsapp />}
        {state.screen === "triagem-intro" && <TriagemIntro />}
        {isTriagemStep && <TriagemStep />}

        <Toast />
      </div>

      {isTop && <BottomNav />}
    </div>
  );
}
