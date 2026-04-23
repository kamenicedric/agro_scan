import { EDGE_FUNCTIONS } from '../config/supabase';
import { getAccessToken, supabase } from './authService';

// ─── Helper: fetch avec JWT auto-injecté ─────────────────────────────────────
async function authFetch(url: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Non authentifié. Veuillez vous reconnecter.');

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Erreur serveur (${res.status})`);
  }
  return data;
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

  const form = new FormData();
  form.append('photo', {
    uri : photoUri,
    type: 'image/jpeg',
    name: 'sol.jpg',
  } as any);
  form.append('diagnostic_id', diagnosticId);
  form.append('user_id',       userId);
  form.append('width',         String(width));
  form.append('height',        String(height));
  form.append('blur_score',    String(blurScore ?? 0));
  form.append('luminosite',    String(luminosite ?? 0));

  const res = await fetch(EDGE_FUNCTIONS.uploadPhoto, {
    method : 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body   : form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur upload photo');
  return data;
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
  return authFetch(EDGE_FUNCTIONS.getProfile);
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

  onStep?.(4, 'Diagnostic terminé !');

  return {
    diagnostic_id,
    parcelle_id,
    ...analysisResult,
  };
}
