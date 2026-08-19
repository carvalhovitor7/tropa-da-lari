"use client";

import { useApp } from "@/lib/store";
import { ScreenKey } from "@/lib/types";

function IconHome({ c }: { c: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function IconUsers({ c }: { c: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.5 21v-1c0-3.3 3.4-6 7.5-6s7.5 2.7 7.5 6v1" />
    </svg>
  );
}
function IconActivity({ c }: { c: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 8-6-16-3 8H2" />
    </svg>
  );
}
function IconWallet({ c }: { c: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 012-2h13a1 1 0 011 1v3" />
      <path d="M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7" />
      <path d="M16 14h3v3h-3a1.5 1.5 0 010-3z" />
    </svg>
  );
}

const ITEMS: { key: ScreenKey; label: string; Icon: (p: { c: string }) => React.JSX.Element }[] = [
  { key: "dashboard", label: "Início", Icon: IconHome },
  { key: "alunas", label: "Alunos", Icon: IconUsers },
  { key: "acompanhamento", label: "Acompanhamento", Icon: IconActivity },
  { key: "financeiro", label: "Financeiro", Icon: IconWallet },
];

export function BottomNav() {
  const { state, navTo } = useApp();
  return (
    <div
      className="flex-shrink-0 flex justify-around items-center px-2 pt-2.5 border-t border-border bg-app"
      style={{ paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}
    >
      {ITEMS.map(({ key, label, Icon }) => {
        const active = state.screen === key;
        const color = active ? "#4C3A9E" : "#6C6390";
        return (
          <button
            key={key}
            onClick={() => navTo(key)}
            className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer px-2.5 py-1.5"
            style={{ color }}
          >
            <div
              className="w-10 h-7 rounded-full flex items-center justify-center"
              style={{ background: active ? "#ECE1F9" : "transparent" }}
            >
              <Icon c={color} />
            </div>
            <span className="text-[11px] font-bold">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
