import { useState } from 'react';
import type { AgendaStatus } from '@/types';

const STATUS_LABELS: Record<AgendaStatus, string> = {
  pendiente: 'Por ver',
  viendo: 'Viendo ahora',
  vista: 'Ya la vi',
};

export default function ScheduleModal({
  initialStatus,
  initialDate,
  onSave,
  onClose,
}: {
  initialStatus: AgendaStatus;
  initialDate: string | null;
  onSave: (status: AgendaStatus, date: string | null) => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<AgendaStatus>(initialStatus);
  const [date, setDate] = useState(initialDate ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-base-700 bg-base-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-slate-100">Agendar</h3>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">Estado</label>
        <div className="mb-4 flex gap-2">
          {(Object.keys(STATUS_LABELS) as AgendaStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                status === s
                  ? 'border-accent-500 bg-accent-500/10 text-accent-400'
                  : 'border-base-700 text-slate-400 hover:border-base-600'
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
          Fecha planeada (opcional)
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-5 w-full rounded-lg border border-base-700 bg-base-850 px-3 py-2 text-sm text-slate-100 focus:border-accent-500 focus:outline-none"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(status, date || null)}
            className="rounded-lg bg-accent-500 px-4 py-1.5 text-sm font-semibold text-base-950 hover:bg-accent-400"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
