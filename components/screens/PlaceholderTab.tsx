export function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2.5 p-10 text-center">
      <div className="font-serif text-2xl text-ink">{title}</div>
      <div className="text-sm text-ink-soft">Em breve por aqui. Por agora, o fluxo completo vive em Alunos.</div>
    </div>
  );
}
