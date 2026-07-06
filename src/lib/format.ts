export function yearOf(dateStr: string | null): string {
  if (!dateStr) return 'S/F';
  const year = dateStr.slice(0, 4);
  return year || 'S/F';
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Fecha desconocida';
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Fecha desconocida';
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Fecha de hoy o posterior (aún no emitido / se emite hoy). */
export function isUpcoming(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return dateStr >= today;
}

export function ratingColor(vote: number): string {
  if (vote >= 7.5) return 'text-emerald-400';
  if (vote >= 6) return 'text-accent-400';
  if (vote > 0) return 'text-orange-400';
  return 'text-slate-500';
}
