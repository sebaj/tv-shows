import { createClient } from '@supabase/supabase-js';

// Sin barra final: con ella, las rutas de auth se construyen con doble barra
// y el gateway de Supabase las rechaza ("No API key found in request").
const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/+$/, '');
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** Cliente de Supabase, o `null` si no está configurado (la app funciona solo con localStorage). */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

/** Indica si el login y la sincronización en la nube están disponibles. */
export const HAS_AUTH = supabase !== null;

/**
 * Comprueba que el servicio de cuentas responda. El login redirige el
 * navegador fuera de la app: sin esta comprobación previa, un servicio caído
 * saca al usuario a una página de error del navegador en vez de avisarle aquí.
 */
export async function isAuthServiceReachable(timeoutMs = 6000): Promise<boolean> {
  if (!url || !anonKey) return false;
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anonKey },
      signal: abort.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
