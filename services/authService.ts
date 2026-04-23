import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

// ─── Client Supabase (persistance session via AsyncStorage) ───────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  nom?: string;
}

export interface AuthResult {
  user?: AuthUser | null;
  error?: string | null;
}

// ─── Inscription ──────────────────────────────────────────────────────────────
export async function signUp(
  email: string,
  password: string,
  nom: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { nom }, // stocké dans raw_user_meta_data → trigger crée le profil
    },
  });

  if (error) return { error: translateAuthError(error.message) };
  if (!data.user) return { error: 'Inscription échouée. Réessayez.' };

  return { user: { id: data.user.id, email: data.user.email!, nom } };
}

// ─── Connexion ────────────────────────────────────────────────────────────────
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) return { error: translateAuthError(error.message) };
  if (!data.user) return { error: 'Connexion échouée.' };

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      nom: data.user.user_metadata?.nom,
    },
  };
}

// ─── Déconnexion ──────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Récupération mot de passe ────────────────────────────────────────────────
export async function resetPassword(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: 'agroscan://reset-password' }
  );
  if (error) return { error: translateAuthError(error.message) };
  return { user: null };
}

// ─── Récupérer la session actuelle ───────────────────────────────────────────
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Récupérer le token JWT actuel ────────────────────────────────────────────
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token ?? null;
}

// ─── Traduction des erreurs Supabase → français ───────────────────────────────
function translateAuthError(msg: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials':          'Email ou mot de passe incorrect.',
    'Email not confirmed':                 'Veuillez confirmer votre email avant de vous connecter.',
    'User already registered':            'Un compte existe déjà avec cet email.',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
    'Unable to validate email address':   'Adresse email invalide.',
    'Email rate limit exceeded':          'Trop de tentatives. Réessayez dans quelques minutes.',
    'For security purposes':              'Trop de tentatives. Patientez avant de réessayer.',
  };
  for (const [key, val] of Object.entries(map)) {
    if (msg.includes(key)) return val;
  }
  return msg;
}
