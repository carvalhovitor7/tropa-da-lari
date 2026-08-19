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
function IconBook({ c }: { c: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5V5.5z" />
      <line x1="8" y1="8" x2="16" y2="8" />
    </svg>
  );
}

const ITEMS: { key: ScreenKey; label: string; Icon: (p: { c: string }) => React.JSX.Element }[] = [
  { key: "dashboard", label: "Início", Icon: IconHome },
  { key: "alunas", label: "Alunas", Icon: IconUsers },
  { key: "treinos-ph", label: "Treinos", Icon: IconActivity },
  { key: "biblioteca-ph", label: "Biblioteca", Icon: IconBook },
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
        const color = active ? "#A15840" : "#8C7F70";
        return (
          <button
            key={key}
            onClick={() => navTo(key)}
            className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer px-2.5 py-1.5"
            style={{ color }}
          >
            <div
              className="w-10 h-7 rounded-full flex items-center justify-center"
              style={{ background: active ? "#F1DFD5" : "transparent" }}
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
