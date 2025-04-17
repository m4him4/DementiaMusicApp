import React, { useState, useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemedText = ({ children, style, type, lightColor, darkColor, ...props }) => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const checkThemePreference = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@theme_preference');
        setIsDark(storedTheme === 'dark');
      } catch (error) {
        console.error('Error reading theme preference:', error);
      }
    };
    
    checkThemePreference();
    
    // Set up a listener for theme changes
    const intervalId = setInterval(checkThemePreference, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const getTypeStyle = () => {
    switch (type) {
      case "title":
        return isDark ? styles.titleDark : styles.title;
      case "subtitle":
        return isDark ? styles.subtitleDark : styles.subtitle;
      case "body":
        return isDark ? styles.bodyDark : styles.body;
      case "small":
        return isDark ? styles.smallDark : styles.small;
      default:
        return {};
    }
  };

  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text'
  );

  return (
    <Text 
      style={[
        isDark ? styles.darkDefaultText : styles.defaultText, 
        getTypeStyle(), 
        color ? { color } : null,
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    color: "#000000",
    fontSize: 16,
  },
  darkDefaultText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000000",
  },
  titleDark: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  subtitleDark: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#FFFFFF",
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333333",
  },
  bodyDark: {
    fontSize: 16,
    lineHeight: 22,
    color: "#EEEEEE",
  },
  small: {
    fontSize: 14,
    color: "#555555",
  },
  smallDark: {
    fontSize: 14,
    color: "#AAAAAA",
  },
});

export default ThemedText; 