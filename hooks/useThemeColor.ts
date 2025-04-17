/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const systemTheme = useColorScheme() ?? 'light';
  const [theme, setTheme] = useState<'light' | 'dark'>(systemTheme as 'light' | 'dark');
  
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_preference');
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setTheme(storedTheme as 'light' | 'dark');
        } else {
          setTheme(systemTheme as 'light' | 'dark');
        }
      } catch (error) {
        console.error('Error loading theme in useThemeColor:', error);
        setTheme(systemTheme as 'light' | 'dark');
      }
    };
    
    loadTheme();
  }, [systemTheme]);
  
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
