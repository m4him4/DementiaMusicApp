"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import AsyncStorage from "@react-native-async-storage/async-storage"

const SCREEN_WIDTH = Dimensions.get("window").width

export default function HomeScreen() {
  const router = useRouter()
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(30))

  useEffect(() => {
    const initHomeScreen = async () => {
      try {
        // Start animations for home screen
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start()
      } catch (error) {
        console.error("Error initializing home screen:", error)
      }
    }

    initHomeScreen()
  }, [])

  const menuItems = [
    {
      id: "playlists",
      icon: "musical-notes",
      title: "My Playlists",
      description: "Create and manage personalized playlists",
      color: "#4a90e2",
      route: "/playlists",
    },
    {
      id: "memory",
      icon: "heart",
      title: "Memory Stimulation",
      description: "Trigger memories through music",
      color: "#5d42f5",
      route: "/memory",
    },
    {
      id: "logs",
      icon: "analytics",
      title: "Activity Logs",
      description: "Track music therapy progress",
      color: "#50b154",
      route: "/logs",
    },
    {
      id: "settings",
      icon: "settings",
      title: "Settings",
      description: "Customize your experience",
      color: "#f59c42",
      route: "/settings",
    },
    {
      id: "help",
      icon: "help-circle",
      title: "Help & Support",
      description: "Get support and information",
      color: "#e94e77",
      route: "/help",
    },
  ]

  const quickActions = [
    {
      icon: "add-circle",
      label: "New Playlist",
      route: "/create-playlist",
      color: "#4a90e2",
    },
    {
      icon: "play",
      label: "Play Music",
      route: "/player",
      color: "#50b154",
    },
    {
      icon: "heart",
      label: "Add Memory",
      route: "/add-memory",
      color: "#5d42f5",
    },
  ]

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      {quickActions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.quickActionButton}
          onPress={() => router.push(action.route)}
          activeOpacity={0.8}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
            <Ionicons name={action.icon} size={24} color="#fff" />
          </View>
          <Text style={styles.quickActionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero section with logo */}
        <View style={styles.heroSection}>
          <LinearGradient colors={["#4A90E2", "#3672E9", "#2A5CC9"]} style={styles.heroBg}>
            <View style={styles.heroContent}>
              <View style={styles.heroLogoContainer}>
                <Ionicons name="musical-notes" size={48} color="#fff" />
              </View>
              <Text style={styles.heroTitle}>Harmony Notes</Text>
              <Text style={styles.heroSubtitle}>Music Therapy for Dementia Care</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick actions */}
        {renderQuickActions()}

        {/* Menu items */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Main Menu</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { borderLeftColor: item.color }]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="#fff" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#3672E9" />
            <Text style={styles.infoTitle}>Did you know?</Text>
          </View>
          <Text style={styles.infoText}>
            Music therapy can improve cognitive function, reduce agitation, and enhance mood in people with dementia.
          </Text>
          <TouchableOpacity style={styles.learnMoreButton} onPress={() => router.push("/about")}>
            <Text style={styles.learnMoreText}>Learn More</Text>
            <Ionicons name="arrow-forward" size={14} color="#3672E9" />
          </TouchableOpacity>
        </View>

        {/* App version */}
        <Text style={styles.versionText}>Harmony Notes v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    width: SCREEN_WIDTH,
    height: 180,
    marginBottom: 0,
  },
  heroBg: {
    width: "100%",
    height: "100%",
  },
  heroContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  heroLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
    marginTop: 5,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    marginBottom: 16,
  },
  quickActionButton: {
    alignItems: "center",
    width: SCREEN_WIDTH / 3 - 20,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: "#eef6ff",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3672E9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    alignSelf: "flex-end",
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3672E9",
    marginRight: 4,
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginVertical: 20,
  },
})
