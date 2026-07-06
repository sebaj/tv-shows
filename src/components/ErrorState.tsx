export default function ErrorState({
  title = 'Algo salió mal',
  subtitle = 'No pudimos cargar el contenido. Revisa tu conexión e inténtalo de nuevo.',
  onRetry,
}: {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-base-700 py-16 text-center">
      <span className="text-4xl">😕</span>
      <p className="text-lg font-medium text-slate-200">{title}</p>
      <p className="max-w-sm text-sm text-slate-500">{subtitle}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-lg border border-base-700 px-5 py-2 text-sm font-medium text-slate-200 hover:border-accent-500 hover:text-accent-400"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
