import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemedView = ({ children, style, type, lightColor, darkColor, ...props }) => {
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
      case "card":
        return isDark ? styles.cardDark : styles.card;
      case "section":
        return styles.section;
      default:
        return {};
    }
  };

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );

  return (
    <View 
      style={[
        isDark ? styles.darkDefaultView : styles.defaultView, 
        getTypeStyle(), 
        backgroundColor ? { backgroundColor } : null,
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  defaultView: {
    backgroundColor: "#ffffff",
  },
  darkDefaultView: {
    backgroundColor: "#121212",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardDark: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
    marginBottom: 20,
  },
});

export default ThemedView; 