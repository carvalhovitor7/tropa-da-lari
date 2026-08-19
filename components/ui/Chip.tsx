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
      className={`rounded-full font-semibold cursor-pointer border transition-colors ${
        small ? "px-3.5 py-2 text-xs" : "px-3.5 py-2.5 text-[13px]"
      } ${active ? "bg-terracotta-strong border-terracotta-strong text-white" : "bg-white border-border text-ink"}`}
    >
      {label}
    </button>
  );
}
