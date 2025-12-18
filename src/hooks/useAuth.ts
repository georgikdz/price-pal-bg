import { useEffect, useLayoutEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: displayName }
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { user, session, loading, signIn, signUp, signOut };
}

const adminCache = new Map<string, boolean>();

export function useIsAdmin(userId?: string) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  // IMPORTANT: when userId changes from undefined -> real id, we must immediately
  // enter a "loading" state (unless cached), otherwise route guards can redirect
  // before the admin check completes.
  useLayoutEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    if (adminCache.has(userId)) {
      setIsAdmin(adminCache.get(userId) ?? false);
      setLoading(false);
    } else {
      setIsAdmin(false);
      setLoading(true);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      if (!userId) return;
      if (adminCache.has(userId)) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .limit(1);

      if (cancelled) return;

      const nextIsAdmin = !error && Array.isArray(data) && data.length > 0;
      adminCache.set(userId, nextIsAdmin);
      setIsAdmin(nextIsAdmin);
      setLoading(false);
    }

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { isAdmin, loading };
}

