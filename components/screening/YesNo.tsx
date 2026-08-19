"use client";

export function YesNo({ value, onYes, onNo }: { value: boolean | null; onYes: () => void; onNo: () => void }) {
  const style = (active: boolean) => ({
    background: active ? "#7C4DBD" : "#FFFFFF",
    color: active ? "#FFFFFF" : "#362F52",
    border: `1px solid ${active ? "#7C4DBD" : "#E4DAF6"}`,
  });
  return (
    <div className="flex gap-2">
      <button onClick={onYes} style={style(value === true)} className="flex-1 rounded-full py-3 text-sm font-bold cursor-pointer">
        Sim
      </button>
      <button onClick={onNo} style={style(value === false)} className="flex-1 rounded-full py-3 text-sm font-bold cursor-pointer">
        Não
      </button>
    </div>
  );
}
