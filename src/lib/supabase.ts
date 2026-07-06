import { createClient } from '@supabase/supabase-js';

// Sin barra final: con ella, las rutas de auth se construyen con doble barra
// y el gateway de Supabase las rechaza ("No API key found in request").
const url = import.meta.env.VITE_SUPABASE_URL?.trim().replace(/\/+$/, '');
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/** Cliente de Supabase, o `null` si no está configurado (la app funciona solo con localStorage). */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

/** Indica si el login y la sincronización en la nube están disponibles. */
export const HAS_AUTH = supabase !== null;
