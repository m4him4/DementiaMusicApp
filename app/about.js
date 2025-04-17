"use client"

import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking, Animated } from "react-native"
import { useState, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { Ionicons } from "@expo/vector-icons"

export default function AboutScreen() {
  const router = useRouter()
  const [fadeAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't open link", err))
  }

  const features = [
    {
      icon: "musical-notes",
      title: "Personalized Playlists",
      description: "Create custom music collections tailored to patient preferences and emotional needs.",
    },
    {
      icon: "heart",
      title: "Memory Association",
      description: "Link songs to specific memories, helping to stimulate cognitive recall and emotional connection.",
    },
    {
      icon: "happy",
      title: "Mood Enhancement",
      description: "Use music to improve mood, reduce anxiety, and create moments of joy and connection.",
    },
    {
      icon: "medical",
      title: "Caregiver Tools",
      description: "Track patient responses, add notes, and monitor patterns to improve care quality.",
    },
    {
      icon: "analytics",
      title: "Activity Tracking",
      description: "Monitor usage patterns and responses to better understand what works best.",
    },
  ]

  const researchItems = [
    {
      title: "Cognitive Benefits",
      description:
        "Research shows music therapy can help maintain cognitive function and slow decline in dementia patients.",
    },
    {
      title: "Emotional Regulation",
      description:
        "Familiar music can reduce agitation and improve mood in patients with Alzheimer's and related conditions.",
    },
    {
      title: "Memory Stimulation",
      description:
        "Music from a patient's formative years (ages 15-25) can trigger deep memories and emotional responses.",
    },
  ]

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />

      {/* ONLY ONE HEADER - Completely simplified */}
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>About</ThemedText>
            <View style={styles.backButtonPlaceholder} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Ionicons name="musical-notes" size={40} color="#4A90E2" />
            </View>
            <ThemedText style={styles.appName}>Harmony Notes</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Our Mission</ThemedText>
            <View style={styles.card}>
              <ThemedText style={styles.missionText}>
                Harmony Notes helps dementia patients access personalized music therapy. Create playlists, record
                memories, and help improve quality of life through the power of music.
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Key Features</ThemedText>
            <View style={styles.featuresCard}>
              {features.map((feature, index) => (
                <View key={index} style={[styles.featureItem, index < features.length - 1 && styles.featureDivider]}>
                  <View style={[styles.featureIconContainer, { backgroundColor: `rgba(74, 144, 226, 0.1)` }]}>
                    <Ionicons name={feature.icon} size={24} color="#4A90E2" />
                  </View>
                  <View style={styles.featureContent}>
                    <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                    <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Research & Benefits</ThemedText>
            <View style={styles.researchCard}>
              {researchItems.map((item, index) => (
                <View
                  key={index}
                  style={[styles.researchItem, index < researchItems.length - 1 && styles.researchDivider]}
                >
                  <ThemedText style={styles.researchTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.researchDescription}>{item.description}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>How To Use</ThemedText>
            <View style={styles.howToCard}>
              <View style={styles.howToStep}>
                <View style={styles.stepNumberContainer}>
                  <ThemedText style={styles.stepNumber}>1</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>Create Playlists</ThemedText>
                  <ThemedText style={styles.stepDescription}>
                    Build personalized music collections based on patient preferences and era.
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.howToStep, styles.stepDivider]}>
                <View style={styles.stepNumberContainer}>
                  <ThemedText style={styles.stepNumber}>2</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>Record Memories</ThemedText>
                  <ThemedText style={styles.stepDescription}>
                    Associate songs with specific memories or life events.
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.howToStep, styles.stepDivider]}>
                <View style={styles.stepNumberContainer}>
                  <ThemedText style={styles.stepNumber}>3</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>Track Responses</ThemedText>
                  <ThemedText style={styles.stepDescription}>
                    Monitor reactions and adjust playlists based on what works best.
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Contact & Support</ThemedText>
            <View style={styles.contactCard}>
              <TouchableOpacity style={styles.contactItem} onPress={() => openLink("mailto:support@harmonynotes.com")}>
                <Ionicons name="mail" size={22} color="#4A90E2" />
                <ThemedText style={styles.contactText}>support@harmonynotes.com</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactItem} onPress={() => openLink("https://harmonynotes.com")}>
                <Ionicons name="globe" size={22} color="#4A90E2" />
                <ThemedText style={styles.contactText}>www.harmonynotes.com</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactItem} onPress={() => openLink("tel:+18005551234")}>
                <Ionicons name="call" size={22} color="#4A90E2" />
                <ThemedText style={styles.contactText}>1-800-555-1234</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.copyright}>© 2025 Harmony Notes</ThemedText>
            <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    backgroundColor: "#4A90E2",
    width: "100%",
  },
  safeArea: {
    backgroundColor: "transparent",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 16,
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
    borderRadius: 20,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
  },
  missionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  featuresCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureItem: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  featureDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  researchCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  researchItem: {
    paddingVertical: 12,
  },
  researchDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  researchTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  researchDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  howToCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  howToStep: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  stepDivider: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contactText: {
    fontSize: 15,
    color: "#444",
    marginLeft: 12,
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  copyright: {
    fontSize: 14,
    color: "#777",
    marginBottom: 4,
  },
  version: {
    fontSize: 12,
    color: "#999",
  },
})
