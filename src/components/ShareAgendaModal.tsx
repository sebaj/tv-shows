import { useEffect, useState } from 'react';
import type { SharePermission } from '@/types';
import { fetchSharesGiven, removeShare, saveShare } from '@/lib/agendaSync';
import { useAsync } from '@/hooks/useAsync';
import { useAuthStore } from '@/store/authStore';
import Spinner from '@/components/Spinner';

const PERMISSION_LABELS: Record<SharePermission, string> = {
  read: 'Solo lectura',
  write: 'Puede editar',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ShareAgendaModal({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const { data: shares, loading, reload } = useAsync(fetchSharesGiven, []);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<SharePermission>('read');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const target = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(target)) {
      setFormError('Ingresa un email válido.');
      return;
    }
    if (target === user?.email.toLowerCase()) {
      setFormError('Ese es tu propio email.');
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await saveShare(target, permission);
      setEmail('');
      reload();
    } catch (err) {
      console.error('No se pudo guardar el permiso:', err);
      setFormError('No se pudo guardar el permiso. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(target: string) {
    setBusy(true);
    try {
      await removeShare(target);
      reload();
    } catch (err) {
      console.error('No se pudo quitar el permiso:', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compartir mi agenda"
        className="w-full max-w-md rounded-2xl border border-base-700 bg-base-900 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-lg font-semibold text-slate-100">Compartir mi agenda</h3>
        <p className="mb-4 text-sm text-slate-400">
          La otra persona verá tu agenda al iniciar sesión con su cuenta de Google. Con "Puede editar" también podrá
          cambiar estados, fechas y quitar títulos.
        </p>

        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="min-w-0 flex-1 rounded-lg border border-base-700 bg-base-850 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent-500 focus:outline-none"
            />
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as SharePermission)}
              className="rounded-lg border border-base-700 bg-base-850 px-2 py-2 text-sm text-slate-200 focus:border-accent-500 focus:outline-none"
            >
              <option value="read">{PERMISSION_LABELS.read}</option>
              <option value="write">{PERMISSION_LABELS.write}</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-base-950 hover:bg-accent-400 disabled:opacity-50"
          >
            Compartir
          </button>
          {formError && <p className="text-sm text-red-400">{formError}</p>}
        </form>

        {loading ? (
          <Spinner label="Cargando permisos..." />
        ) : shares && shares.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {shares.map((s) => (
              <li
                key={s.sharedWithEmail}
                className="flex items-center justify-between gap-2 rounded-lg border border-base-800 bg-base-950 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">{s.sharedWithEmail}</p>
                  <span className="text-xs text-slate-500">{PERMISSION_LABELS[s.permission]}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRemove(s.sharedWithEmail)}
                  disabled={busy}
                  className="shrink-0 rounded-lg border border-base-700 px-3 py-1 text-xs font-medium text-slate-400 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Todavía no compartiste tu agenda con nadie.</p>
        )}

        <p className="mt-4 text-xs text-slate-500">
          💡 La otra persona también necesita tener acceso permitido a esta app para poder iniciar sesión.
        </p>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
