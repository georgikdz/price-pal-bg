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
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (!userId) return false;
    return adminCache.get(userId) ?? false;
  });

  // IMPORTANT: If the cached value is false (or missing), treat it as "needs verification".
  // This prevents stale "not admin" caches from hiding admin UI / causing redirects
  // right after an admin role is granted.
  const [loading, setLoading] = useState<boolean>(() => {
    if (!userId) return false;
    const cached = adminCache.get(userId);
    return cached !== true;
  });

  // IMPORTANT: when userId changes from undefined -> real id, we must immediately
  // enter a "loading" state (unless cached true), otherwise route guards can redirect
  // before the admin check completes.
  useLayoutEffect(() => {
    if (!userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    if (adminCache.has(userId)) {
      const cached = adminCache.get(userId) ?? false;
      setIsAdmin(cached);
      // If cached=false, we still verify before allowing redirects/hiding admin UI.
      setLoading(cached !== true);
    } else {
      setIsAdmin(false);
      setLoading(true);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      if (!userId) return;

      // Prefer the backend role-check function (handles duplicates and avoids RLS edge cases)
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      });

      if (cancelled) return;

      const nextIsAdmin = !error && data === true;
      adminCache.set(userId, nextIsAdmin);
      setIsAdmin(nextIsAdmin);
      setLoading(false);
    }

    // Always verify on mount / user change; it's cheap and avoids stale role caches.
    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { isAdmin, loading };
}



