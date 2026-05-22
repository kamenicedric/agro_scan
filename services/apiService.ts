import { EDGE_FUNCTIONS } from '../config/supabase';
import { getAccessToken, supabase } from './authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';

const REQUEST_TIMEOUT_MS = 12000;
const RETRY_DELAYS_MS = [900, 1800];
const MAX_UPLOAD_SIZE = 1280;

const CACHE_KEYS = {
  profile: '@agroscan/cache/profile/v1',
  diagnosticPrefix: '@agroscan/cache/diagnostic/v1/',
};

function getDiagnosticCacheKey(userId: string) {
  return `${CACHE_KEYS.diagnosticPrefix}${userId}`;
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(err: unknown) {
  const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return (
    message.includes('network request failed') ||
    message.includes('timed out') ||
    message.includes('timeout') ||
    message.includes('aborted') ||
    message.includes('failed to fetch') ||
    message.includes('erreur serveur (5')
  );
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function requestWithRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err) || attempt === RETRY_DELAYS_MS.length) {
        throw err;
      }
      await wait(RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Erreur réseau');
}

async function optimizePhotoForUpload(photoUri: string, width: number, height: number) {
  if (!width || !height || (width <= MAX_UPLOAD_SIZE && height <= MAX_UPLOAD_SIZE)) {
    return { uri: photoUri, width, height };
  }

  const ratio = Math.min(MAX_UPLOAD_SIZE / width, MAX_UPLOAD_SIZE / height);
  const targetWidth = Math.max(1, Math.round(width * ratio));
  const targetHeight = Math.max(1, Math.round(height * ratio));

  try {
    const optimized = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ resize: { width: targetWidth, height: targetHeight } }],
      {
        compress: 0.62,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return {
      uri: optimized.uri,
      width: optimized.width,
      height: optimized.height,
    };
  } catch {
    return { uri: photoUri, width, height };
  }
}

// ─── Helper: fetch avec JWT auto-injecté ─────────────────────────────────────
async function authFetch(url: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Non authentifié. Veuillez vous reconnecter.');

  return requestWithRetry(async () => {
    const res = await fetchWithTimeout(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await parseJsonSafe(res);
    if (!res.ok) {
      throw new Error(data?.error || `Erreur serveur (${res.status})`);
    }
    return data;
  });
}

// ─── 1. Créer un diagnostic (parcelle + historique) ───────────────────────────
export async function createDiagnostic({
  userId,
  parcelleId,
  lat,
  lng,
  superficie,
  nomParcelle,
  historique,
}: {
  userId     : string;
  parcelleId?: string;
  lat        : number;
  lng        : number;
  superficie?: number;
  nomParcelle?: string;
  historique  : Array<{ annee: number; culture: string; rendement: string; maladies: string }>;
}) {
  return authFetch(EDGE_FUNCTIONS.createDiagnostic, {
    method: 'POST',
    body: JSON.stringify({
      user_id    : userId,
      parcelle_id: parcelleId,
      lat,
      lng,
      superficie,
      nom        : nomParcelle,
      historique,
    }),
  });
}

// ─── 2. Upload photo sol ──────────────────────────────────────────────────────
export async function uploadSoilPhoto({
  photoUri,
  diagnosticId,
  userId,
  width,
  height,
  blurScore,
  luminosite,
}: {
  photoUri    : string;
  diagnosticId: string;
  userId      : string;
  width       : number;
  height      : number;
  blurScore  ?: number;
  luminosite ?: number;
}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Non authentifié.');

  const optimized = await optimizePhotoForUpload(photoUri, width, height);

  const form = new FormData();
  form.append('photo', {
    uri : optimized.uri,
    type: 'image/jpeg',
    name: 'sol.jpg',
  } as any);
  form.append('diagnostic_id', diagnosticId);
  form.append('user_id',       userId);
  form.append('width',         String(optimized.width || width));
  form.append('height',        String(optimized.height || height));
  form.append('blur_score',    String(blurScore ?? 0));
  form.append('luminosite',    String(luminosite ?? 0));

  return requestWithRetry(async () => {
    const res = await fetchWithTimeout(EDGE_FUNCTIONS.uploadPhoto, {
      method : 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body   : form,
    }, 18000);
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data?.error || 'Erreur upload photo');
    return data;
  });
}

// ─── 3. Lancer l'analyse IA (MobileNetV2 cascade) ────────────────────────────
export async function analyzeSoil({
  diagnosticId,
  lat,
  lng,
  imageBase64,
  historique,
}: {
  diagnosticId : string;
  lat          : number;
  lng          : number;
  imageBase64 ?: string;
  historique  ?: Array<{ annee: number; culture: string; rendement: string; maladies: string }>;
}) {
  return authFetch(EDGE_FUNCTIONS.analyzeSoil, {
    method: 'POST',
    body: JSON.stringify({
      diagnostic_id: diagnosticId,
      lat,
      lng,
      image_base64 : imageBase64,
      historique   : historique ?? [],
    }),
  });
}

// ─── 4. Profil utilisateur + stats + historique ───────────────────────────────
export async function fetchProfile() {
  try {
    const profile = await authFetch(EDGE_FUNCTIONS.getProfile);
    await AsyncStorage.setItem(
      CACHE_KEYS.profile,
      JSON.stringify({ savedAt: Date.now(), profile })
    );
    return profile;
  } catch (error) {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.profile);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...parsed.profile, cache_mode: true };
    }
    throw error;
  }
}

// ─── 5. Diagnostics d'une parcelle (Supabase direct) ─────────────────────────
export async function getDiagnosticsByParcelle(parcelleId: string) {
  const { data, error } = await supabase
    .from('v_diagnostics_resume')
    .select('*')
    .eq('parcelle_id', parcelleId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// ─── 6. Détail d'un diagnostic ────────────────────────────────────────────────
export async function getDiagnosticById(diagnosticId: string) {
  const { data, error } = await supabase
    .from('diagnostics')
    .select(`
      *,
      parcelles ( nom, lat, lng, superficie ),
      photos ( public_url, mp, blur_score, created_at )
    `)
    .eq('id', diagnosticId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── 7. Flux complet: create → upload → analyze ───────────────────────────────
export async function runFullDiagnostic({
  userId,
  lat,
  lng,
  superficie,
  nomParcelle,
  historique,
  photo,
  onStep,
}: {
  userId      : string;
  lat         : number;
  lng         : number;
  superficie ?: number;
  nomParcelle?: string;
  historique  : Array<{ annee: number; culture: string; rendement: string; maladies: string }>;
  photo       : { uri: string; width: number; height: number; blurScore?: number };
  onStep     ?: (step: number, label: string) => void;
}) {
  try {
    // Étape 1 - Créer le diagnostic
    onStep?.(1, 'Création du diagnostic...');
    const { diagnostic_id, parcelle_id } = await createDiagnostic({
      userId, lat, lng, superficie, nomParcelle, historique,
    });

    // Étape 2 - Upload photo
    onStep?.(2, 'Upload de la photo...');
    await uploadSoilPhoto({
      photoUri    : photo.uri,
      diagnosticId: diagnostic_id,
      userId,
      width       : photo.width,
      height      : photo.height,
      blurScore   : photo.blurScore,
    });

    // Étape 3 - Analyse IA
    onStep?.(3, 'Analyse IA en cours...');
    const analysisResult = await analyzeSoil({
      diagnosticId: diagnostic_id,
      lat,
      lng,
      historique,
    });

    const payload = {
      diagnostic_id,
      parcelle_id,
      ...analysisResult,
    };

    await AsyncStorage.setItem(
      getDiagnosticCacheKey(userId),
      JSON.stringify({ savedAt: Date.now(), payload })
    );

    onStep?.(4, 'Diagnostic terminé !');
    return payload;
  } catch (error) {
    const cached = await AsyncStorage.getItem(getDiagnosticCacheKey(userId));
    if (cached) {
      const parsed = JSON.parse(cached);
      onStep?.(4, 'Connexion faible: résultat local affiché');
      return {
        ...parsed.payload,
        analysis_method: 'cache_local',
        cache_mode: true,
      };
    }
    throw new Error(
      "Connexion trop faible pour terminer l'analyse. Réessayez près d'un meilleur réseau."
    );
  }
}
