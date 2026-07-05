export default function Spinner({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-accent-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
