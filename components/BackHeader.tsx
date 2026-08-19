"use client";

import { useApp } from "@/lib/store";

export function BackHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  const { goBack } = useApp();
  return (
    <div className="flex-shrink-0 flex items-center gap-2.5 px-5 pt-3.5 pb-2.5 bg-app sticky top-0 z-10">
      <button
        onClick={goBack}
        aria-label="Voltar"
        className="w-11 h-11 rounded-full border border-border bg-white flex items-center justify-center cursor-pointer shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A342E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-sage-soft font-bold uppercase tracking-wide">{eyebrow}</span>
        <span className="text-[17px] font-bold text-ink whitespace-nowrap overflow-hidden text-ellipsis">{title}</span>
      </div>
    </div>
  );
}
