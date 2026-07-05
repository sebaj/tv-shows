export default function EmptyState({ icon = '🎬', title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-base-700 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-lg font-medium text-slate-200">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
