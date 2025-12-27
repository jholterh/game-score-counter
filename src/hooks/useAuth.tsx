import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth initializing...');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', session ? 'User logged in' : 'No session', error);
      if (session) {
        console.log('User details:', session.user.email);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (this handles OAuth callbacks automatically)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? `User: ${session.user.email}` : 'No user');
      console.log('Full event details:', { event, session });
      setUser(session?.user ?? null);
      setLoading(false);

      // Clean up URL after successful sign in to prevent stale token issues
      if (event === 'SIGNED_IN' && session) {
        // Remove OAuth params from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log('Cleaned up OAuth params from URL');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    console.log('Starting Google sign in...');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    console.log('OAuth response:', { data, error });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };
};
