"use client";

export function Chip({
  label,
  active,
  onClick,
  small,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full font-semibold cursor-pointer border transition-colors min-h-11 ${
        small ? "px-3.5 text-xs" : "px-3.5 text-[13px]"
      } ${active ? "bg-terracotta-strong border-terracotta-strong text-white" : "bg-white border-border text-ink"}`}
    >
      {label}
    </button>
  );
}
