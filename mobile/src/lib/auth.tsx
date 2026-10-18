import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { prefs } from '@/lib/prefs';
import { supabase } from '@/lib/supabase';

interface AuthState {
  /** False until the stored session has been read, so screens don't flash. */
  ready: boolean;
  session: Session | null;
  /** Finished onboarding: signed in, or chose "Skip for now". */
  onboarded: boolean;
  finishOnboarding: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [onboardedFlag, setOnboardedFlag] = useState(prefs.onboarded());

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    ready,
    session,
    onboarded: onboardedFlag || !!session,
    finishOnboarding: () => {
      prefs.setOnboarded(true);
      setOnboardedFlag(true);
    },
    signOut: async () => {
      await supabase?.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
