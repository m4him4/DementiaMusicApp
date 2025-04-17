import { useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useColorScheme() {
  const systemColorScheme = useSystemColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme);

  useEffect(() => {
    // Load user's theme preference from AsyncStorage
    const loadThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_preference');
        
        if (storedTheme) {
          // If user has set a preference, validate it's a valid theme value
          if (storedTheme === 'light' || storedTheme === 'dark') {
            setColorScheme(storedTheme);
          } else {
            // Invalid theme value, use system preference
            setColorScheme(systemColorScheme);
          }
        } else {
          // Otherwise use system preference
          setColorScheme(systemColorScheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to system preference
        setColorScheme(systemColorScheme);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  return colorScheme;
}
