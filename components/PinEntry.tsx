"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const LEN = 4;

// On-brand 4-digit PIN entry (item 1). Posts to /api/auth/login; on success
// navigates to whatever page the visitor was originally headed to (proxy.ts
// passes it as ?next=). Wrong PIN shows an inline error — no lockout logic,
// per the task scope.
export function PinEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(""));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusAt = (i: number) => inputs.current[i]?.focus();

  const submit = async (pin: string) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        setError("PIN incorreto. Tente novamente.");
        setDigits(Array(LEN).fill(""));
        focusAt(0);
        return;
      }
      const next = searchParams.get("next") || "/";
      router.replace(next);
      router.refresh();
    } catch {
      setError("Não foi possível verificar agora. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (i: number, raw: string) => {
    const value = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    if (value && i < LEN - 1) focusAt(i + 1);
    if (next.every((d) => d !== "") && next.join("").length === LEN) {
      submit(next.join(""));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) focusAt(i - 1);
  };

  return (
    <div className="mx-auto w-full max-w-[430px] min-h-dvh bg-app flex flex-col items-center justify-center gap-7 px-8 text-center">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white" style={{ boxShadow: "0 10px 24px -10px rgba(76,58,158,0.45)" }}>
        <Image src="/brand/logo.png" alt="Tropa da Lari" width={80} height={80} className="w-full h-full object-cover" priority />
      </div>
      <div>
        <div className="font-serif text-[28px] text-ink">Tropa da Lari</div>
        <div className="text-sm text-ink-soft mt-1.5">Digite o PIN para entrar</div>
      </div>

      <div className="flex gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={busy}
            inputMode="numeric"
            autoComplete="off"
            maxLength={1}
            autoFocus={i === 0}
            className="w-14 h-16 text-center text-2xl font-bold rounded-[14px] border border-border bg-white text-ink disabled:opacity-60"
          />
        ))}
      </div>

      {error && <div className="text-[13px] font-semibold" style={{ color: "#B5473A" }}>{error}</div>}
      {busy && <div className="text-[13px] text-ink-soft">Verificando…</div>}
    </div>
  );
}
