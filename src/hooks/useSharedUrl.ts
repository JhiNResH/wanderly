/**
 * Hook to read URLs shared from iOS Share Extension
 * The Share Extension saves URLs to AsyncStorage under 'sharedUrl'
 * This hook reads and clears it on app foreground
 */
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SHARED_URL_KEY = 'wanderly_shared_url';

export function useSharedUrl(onSharedUrl: (url: string) => void) {
  const [lastChecked, setLastChecked] = useState<number>(0);

  const checkForSharedUrl = async () => {
    try {
      const url = await AsyncStorage.getItem(SHARED_URL_KEY);
      if (url) {
        await AsyncStorage.removeItem(SHARED_URL_KEY);
        onSharedUrl(url);
      }
    } catch (err) {
      console.error('Failed to read shared URL:', err);
    }
  };

  useEffect(() => {
    // Check on mount
    checkForSharedUrl();

    // Check when app comes to foreground
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkForSharedUrl();
        setLastChecked(Date.now());
      }
    });

    return () => subscription.remove();
  }, []);

  return { lastChecked };
}

export { SHARED_URL_KEY };
