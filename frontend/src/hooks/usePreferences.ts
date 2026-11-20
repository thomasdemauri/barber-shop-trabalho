import { useCallback, useEffect, useState } from 'react';
import { profileApi } from '../api/endpoints';
import type { Preferences } from '../api/types';

/** The logged user's saved preferences; `null` until loaded. */
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);

  useEffect(() => {
    profileApi.preferences()
      .then(setPreferences)
      .catch(() => setPreferences({ haircut: null, notifications: null, payment: null }));
  }, []);

  const save = useCallback(async (changes: Partial<Preferences>) => {
    setPreferences(await profileApi.updatePreferences(changes));
  }, []);

  return { preferences, save };
}
