"use client";

import { useApp } from "@/lib/store";

export function Toast() {
  const { state } = useApp();
  if (!state.toast) return null;
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-ink text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-full shadow-lg whitespace-nowrap z-50">
      {state.toast}
    </div>
  );
}
