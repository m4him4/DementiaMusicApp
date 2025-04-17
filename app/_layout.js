"use client"

import React, { useEffect, useState } from "react"
import { StyleSheet, View, Text } from "react-native"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ensureAuthenticated } from "../utils/firebase"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { ThemeProvider, DefaultTheme } from "@react-navigation/native"
import { useFonts } from "expo-font"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

// Define a default theme
const defaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#3672E9",
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#000000",
    border: "#E8E8E8",
    notification: "#FF3B30",
  },
}

// Custom components for header with logo
const LogoTitle = () => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoIcon}>
        <Ionicons name="musical-notes" size={24} color="#fff" />
      </View>
      <Text style={styles.logoText}>Harmony Notes</Text>
    </View>
  )
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  })

  const [authInitialized, setAuthInitialized] = useState(false)
  // Always use welcome as the initial route - no state needed
  // const [initialRoute, setInitialRoute] = useState("welcome")

  // Initialize Firebase Authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        await ensureAuthenticated()
        setAuthInitialized(true)
      } catch (error) {
        console.error("Error initializing auth:", error)
        setAuthInitialized(true) // Still mark as initialized to prevent hanging
      }
    }

    initAuth()
  }, [])

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded && authInitialized) {
      SplashScreen.hideAsync()
      console.log("DEBUG: Splash screen hidden, app is now visible with initial route:", "welcome")
    }
  }, [loaded, authInitialized])

  if (!loaded || !authInitialized) {
    return null
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={defaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#3672E9",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
          initialRouteName="welcome"
        >
          <Stack.Screen name="index" options={{ title: "Harmony Notes" }} />
          <Stack.Screen
            name="welcome"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="playlists"
            options={{
              title: "My Playlists",
            }}
          />
          <Stack.Screen
            name="memory"
            options={{
              title: "Memory Stimulation",
            }}
          />
          <Stack.Screen
            name="logs"
            options={{
              title: "Activity Logs",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="player"
            options={{
              title: "Music Player",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="create-playlist"
            options={{
              title: "Create Playlist",
            }}
          />
          <Stack.Screen
            name="mood-playlist"
            options={{
              title: "Create by Mood",
            }}
          />
          <Stack.Screen
            name="edit-playlist"
            options={{
              title: "Edit Playlist",
            }}
          />
          <Stack.Screen
            name="delete-playlist"
            options={{
              title: "Delete Playlist",
            }}
          />
          <Stack.Screen
            name="add-memory"
            options={{
              title: "Add Memory",
            }}
          />
          <Stack.Screen
            name="edit-memory"
            options={{
              title: "Edit Memory",
            }}
          />
          <Stack.Screen
            name="delete-memory"
            options={{
              title: "Delete Memory",
            }}
          />
          <Stack.Screen
            name="memories-management"
            options={{
              title: "Manage Memories",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "Settings",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="help"
            options={{
              title: "Help",
            }}
          />
          <Stack.Screen
            name="debug"
            options={{
              title: "Debug Screen",
            }}
          />
          <Stack.Screen
            name="about"
            options={{
              title: "About",
            }}
          />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
})
