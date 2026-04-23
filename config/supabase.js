// ─── Configuration Supabase AgroScan IA ──────────────────────────────────────
// Projet: agroscan-ia | Région: eu-west-3 (Paris)

export const SUPABASE_URL = "https://bhpolnbltziqejaudykz.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJocG9sbmJsdHppcWVqYXVkeWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODIwNjMsImV4cCI6MjA5MjI1ODA2M30.2Mtx1WgCAsGYHbVA_o0n7CsFtHt7zgOz2L2Z-TJXOgc";

// Edge Functions endpoints
export const EDGE_FUNCTIONS = {
  createDiagnostic: `${SUPABASE_URL}/functions/v1/create-diagnostic`,
  uploadPhoto:      `${SUPABASE_URL}/functions/v1/upload-photo`,
  analyzeSoil:      `${SUPABASE_URL}/functions/v1/analyze-soil`,
  getProfile:       `${SUPABASE_URL}/functions/v1/get-profile`,
};
