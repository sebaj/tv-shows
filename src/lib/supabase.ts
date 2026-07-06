import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Cliente de Supabase, o `null` si no está configurado (la app funciona solo con localStorage). */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

/** Indica si el login y la sincronización en la nube están disponibles. */
export const HAS_AUTH = supabase !== null;
