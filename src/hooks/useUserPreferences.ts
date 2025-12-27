import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import {
  fetchUserPreferences,
  type UserPreferences,
} from '@/lib/supabase/userRepository';

export interface UseUserPreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for loading user preferences
 * Automatically loads preferences when user logs in
 */
export const useUserPreferences = (user: User | null): UseUserPreferencesReturn => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const prefs = await fetchUserPreferences(user.id);
      setPreferences(prefs);
    } catch (err) {
      console.error('Failed to load user preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  };

  // Load preferences when user changes
  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  return {
    preferences,
    loading,
    error,
    refetch: loadPreferences,
  };
};
