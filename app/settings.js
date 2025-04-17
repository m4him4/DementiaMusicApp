"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, useColorScheme, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Ionicons } from "@expo/vector-icons"
import { auth } from "@/utils/firebase"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { clearAllData } from "@/utils/storage"

export default function SettingsScreen() {
  const router = useRouter()
  const systemColorScheme = useColorScheme()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [cloudStatus, setCloudStatus] = useState("Loading...")
  const [userId, setUserId] = useState("Not signed in")
  const [caregiverMode, setCaregiverMode] = useState(false)

  useEffect(() => {
    // Check if the user is authenticated
    const user = auth.currentUser
    if (user) {
      setUserId(user.uid)
      setCloudStatus("Connected")
    } else {
      setUserId("Not signed in")
      setCloudStatus("Disconnected")
    }

    // Load caregiver mode setting
    const loadSettings = async () => {
      try {
        // Load caregiver mode
        const caregiverValue = await AsyncStorage.getItem("@caregiver_mode")
        setCaregiverMode(caregiverValue === "true")

        // Load theme preference
        const themeValue = await AsyncStorage.getItem("@theme_preference")
        const savedDarkMode = themeValue === "dark"
        setDarkMode(savedDarkMode)

        // Apply theme
        applyTheme(savedDarkMode)
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadSettings()
  }, [])

  // Function to apply theme changes
  const applyTheme = async (isDark) => {
    try {
      // Save theme preference to AsyncStorage
      await AsyncStorage.setItem("@theme_preference", isDark ? "dark" : "light")

      // React Native doesn't have direct DOM access like web
      // The theme change will be picked up by our useColorScheme hook
      // which updates components using ThemedText and ThemedView

      // Force a re-render if needed
      setDarkMode(isDark)
    } catch (error) {
      console.error("Error applying theme:", error)
    }
  }

  const handleDarkModeToggle = (value) => {
    setDarkMode(value)
    applyTheme(value)
  }

  const handleCaregiverModeChange = async (value) => {
    setCaregiverMode(value)
    try {
      await AsyncStorage.setItem("@caregiver_mode", value ? "true" : "false")

      if (value) {
        Alert.alert(
          "Caregiver Mode Enabled",
          "You now have access to patient reaction tracking, notes, and enhanced activity logs.",
        )
      }
    } catch (error) {
      console.error("Error saving caregiver mode:", error)
    }
  }

  const handleClearData = () => {
    Alert.alert("Clear All Data", "Are you sure you want to clear all playlists and memories? This cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear Data",
        style: "destructive",
        onPress: async () => {
          try {
            await clearAllData()
            Alert.alert("Success", "All data has been cleared.")
          } catch (error) {
            Alert.alert("Error", "Failed to clear data.")
          }
        },
      },
    ])
  }

  const handleResetWelcome = async () => {
    try {
      await AsyncStorage.removeItem("@has_seen_welcome")
      Alert.alert("Welcome Screen Reset", "The welcome screen will appear the next time you restart the app.")
    } catch (error) {
      Alert.alert("Error", "Failed to reset welcome screen.")
    }
  }

  const settingsItems = [
    {
      icon: "moon-outline",
      title: "Dark Mode",
      component: (
        <Switch
          value={darkMode}
          onValueChange={handleDarkModeToggle}
          trackColor={{ false: "#D8D8D8", true: "#4A90E2" }}
          thumbColor={"#FFFFFF"}
        />
      ),
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      component: (
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: "#D8D8D8", true: "#4A90E2" }}
          thumbColor={"#FFFFFF"}
        />
      ),
    },
    {
      icon: "medical-outline",
      title: "Caregiver Mode",
      subtitle: "Enable features for tracking patient responses",
      component: (
        <Switch
          value={caregiverMode}
          onValueChange={handleCaregiverModeChange}
          trackColor={{ false: "#D8D8D8", true: "#4A90E2" }}
          thumbColor={"#FFFFFF"}
        />
      ),
    },
    {
      icon: "cloud-outline",
      title: "Cloud Sync",
      subtitle: cloudStatus,
      component: (
        <ThemedText style={styles.statusText}>{cloudStatus === "Connected" ? "Active" : "Offline"}</ThemedText>
      ),
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      component: <Ionicons name="chevron-forward" size={20} color="#4A90E2" />,
      onPress: () => router.push("/help"),
    },
    {
      icon: "information-circle-outline",
      title: "About",
      component: <Ionicons name="chevron-forward" size={20} color="#4A90E2" />,
      onPress: () => router.push("/about"),
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Settings</ThemedText>
            <View style={styles.backButtonPlaceholder} />
          </View>
        </View>

        {caregiverMode && (
          <View style={styles.caregiverBanner}>
            <Ionicons name="medical" size={18} color="#fff" />
            <ThemedText style={styles.caregiverBannerText}>Caregiver Mode Active</ThemedText>
          </View>
        )}

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
            <ThemedView style={styles.settingsGroup}>
              {settingsItems.slice(0, 3).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.settingItem, index === 2 ? null : styles.borderBottom]}
                  onPress={item.onPress}
                  disabled={!item.onPress}
                >
                  <View style={styles.settingMain}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon} size={22} color="#4A90E2" />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <ThemedText style={styles.settingTitle}>{item.title}</ThemedText>
                      {item.subtitle && <ThemedText style={styles.settingSubtitle}>{item.subtitle}</ThemedText>}
                    </View>
                  </View>
                  {item.component}
                </TouchableOpacity>
              ))}
            </ThemedView>
          </View>

          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionTitle}>Account & Support</ThemedText>
            <ThemedView style={styles.settingsGroup}>
              {settingsItems.slice(3).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.settingItem, index === settingsItems.slice(3).length - 1 ? null : styles.borderBottom]}
                  onPress={item.onPress}
                  disabled={!item.onPress}
                >
                  <View style={styles.settingMain}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon} size={22} color="#4A90E2" />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <ThemedText style={styles.settingTitle}>{item.title}</ThemedText>
                      {item.subtitle && <ThemedText style={styles.settingSubtitle}>{item.subtitle}</ThemedText>}
                    </View>
                  </View>
                  {item.component}
                </TouchableOpacity>
              ))}
            </ThemedView>
          </View>

          {caregiverMode && (
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Caregiver Tools</ThemedText>
              <ThemedView style={styles.caregiverInfoBox}>
                <View style={styles.caregiverInfoHeader}>
                  <Ionicons name="information-circle" size={22} color="#4A90E2" />
                  <ThemedText style={styles.caregiverInfoTitle}>Active Features</ThemedText>
                </View>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4A90E2" />
                    <ThemedText style={styles.featureText}>Record patient reactions to music</ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4A90E2" />
                    <ThemedText style={styles.featureText}>Add caregiver notes about responses</ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4A90E2" />
                    <ThemedText style={styles.featureText}>Track patterns in patient preferences</ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4A90E2" />
                    <ThemedText style={styles.featureText}>View enhanced activity logs</ThemedText>
                  </View>
                </View>
              </ThemedView>
            </View>
          )}

          <View style={styles.sectionContainer}>
            <ThemedText style={[styles.sectionTitle, styles.dangerSectionTitle]}>Danger Zone</ThemedText>
            <ThemedView style={[styles.settingsGroup, styles.dangerZone]}>
              <TouchableOpacity style={[styles.settingItem, styles.dangerButton]} onPress={handleClearData}>
                <View style={styles.settingMain}>
                  <View style={[styles.iconContainer, styles.dangerIconContainer]}>
                    <Ionicons name="trash-outline" size={22} color="#E74C3C" />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <ThemedText style={styles.dangerButtonText}>Clear All Data</ThemedText>
                    <ThemedText style={styles.dangerSubtitle}>Remove all playlists and memories</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.settingItem, styles.dangerButton]} onPress={handleResetWelcome}>
                <View style={styles.settingMain}>
                  <View style={[styles.iconContainer, styles.dangerIconContainer]}>
                    <Ionicons name="refresh-outline" size={22} color="#E74C3C" />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <ThemedText style={styles.dangerButtonText}>Reset Welcome Screen</ThemedText>
                    <ThemedText style={styles.dangerSubtitle}>Show introduction on next launch</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            </ThemedView>
          </View>

          <ThemedView style={styles.deviceInfo}>
            <ThemedText style={styles.deviceInfoText}>Device ID: {userId.substring(0, 8)}...</ThemedText>
            <ThemedText style={styles.deviceInfoText}>Version: 1.0.0</ThemedText>
          </ThemedView>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#4A90E2",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  caregiverBanner: {
    backgroundColor: "#3672E9",
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  caregiverBannerText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
    color: "#555",
  },
  dangerSectionTitle: {
    color: "#E74C3C",
  },
  settingsGroup: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  dangerIconContainer: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
  },
  settingTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  statusText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "bold",
  },
  caregiverInfoBox: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
  },
  caregiverInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  caregiverInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#4A90E2",
  },
  featureList: {
    marginLeft: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#555",
  },
  dangerZone: {
    backgroundColor: "#ffffff",
  },
  dangerButton: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#E74C3C",
  },
  dangerSubtitle: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  deviceInfo: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
    padding: 16,
  },
  deviceInfoText: {
    fontSize: 12,
    color: "#999",
    marginVertical: 2,
  },
})
