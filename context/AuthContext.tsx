import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { supabase, AuthUser } from '../services/authService';
import type { Session } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  profileId: string | null;     // UUID dans public.users (≠ auth UUID)
  refreshProfile: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  profileId: null,
  refreshProfile: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [session, setSession]   = useState<Session | null>(null);
  const [loading, setLoading]   = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Charger le profil public depuis public.users
  const refreshProfile = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return;

    const { data: profile } = await supabase
      .from('users')
      .select('id, nom, email')
      .eq('auth_id', sess.session.user.id)
      .single();

    if (profile) {
      setProfileId(profile.id);
      setUser({
        id: sess.session.user.id,
        email: profile.email || sess.session.user.email || '',
        nom: profile.nom,
      });
    }
  }, []);

  useEffect(() => {
    // Charger la session au démarrage
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          nom: data.session.user.user_metadata?.nom,
        });
        refreshProfile();
      }
      setLoading(false);
    });

    // Écouter les changements d'état auth (login/logout/refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setUser({
            id: newSession.user.id,
            email: newSession.user.email || '',
            nom: newSession.user.user_metadata?.nom,
          });
          await refreshProfile();
        } else {
          setUser(null);
          setProfileId(null);
        }
        setLoading(false);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [refreshProfile]);

  return (
    <AuthContext.Provider value={{ user, session, loading, profileId, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext);
}
