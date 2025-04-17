"use client"

import React, { useEffect, useState, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Alert, Image, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

// Quotes about music therapy
const quotes = [
  "Music gives a soul to the universe, wings to the mind, flight to the imagination, and life to everything.",
  "Music can heal the wounds which medicine cannot touch.",
  "Music is the shorthand of emotion.",
  "Where words fail, music speaks.",
]

export default function WelcomeScreen() {
  // Animation values
  const [fadeAnim] = React.useState(new Animated.Value(0))
  const [slideAnim] = React.useState(new Animated.Value(50))
  const [scaleAnim] = React.useState(new Animated.Value(0.9))
  
  // For quotes rotation
  const [quoteIndex, setQuoteIndex] = useState(0)
  const flatlistRef = useRef(null)
  
  // Dots pagination state
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollX = useRef(new Animated.Value(0)).current
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 })

  // Benefits carousel data
  const benefits = [
    {
      id: '1',
      title: 'Enhanced Memory Recall',
      description: 'Music activates areas of the brain associated with memory, language, attention, and mood.',
      icon: 'psychology',
      color: '#4a90e2'
    },
    {
      id: '2',
      title: 'Reduced Anxiety',
      description: 'Familiar music can bring comfort and reduce stress and anxiety in dementia patients.',
      icon: 'mood',
      color: '#5d42f5'
    },
    {
      id: '3',
      title: 'Improved Communication',
      description: 'Music can help patients engage socially when other forms of communication become difficult.',
      icon: 'groups',
      color: '#50b154'
    },
  ]

  // Check on mount if we already have seen welcome
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
    
    // Rotate quotes every 5 seconds
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length)
    }, 5000)
    
    return () => clearInterval(quoteInterval)
  }, [])
  
  // Handle flatlist view changes
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index)
    }
  }).current

  const goToHome = async () => {
    try {
      // Set the flag that user has seen welcome screen
      // This is not needed anymore since we always show welcome screen
      // await AsyncStorage.setItem("hasClickedGetStarted", "true")
      
      // Navigate to home screen - use push instead of replace for better animation
      router.push("/")
    } catch (error) {
      Alert.alert("Error", "There was a problem navigating to the home screen. Please try again.", [{ text: "OK" }])
    }
  }

  // Render a single benefit card
  const renderBenefitItem = ({ item }) => {
    return (
      <View style={styles.benefitCard}>
        <View style={[styles.benefitIconContainer, { backgroundColor: item.color }]}>
          <MaterialIcons name={item.icon} size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.benefitTitle}>{item.title}</Text>
        <Text style={styles.benefitDescription}>{item.description}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient 
        colors={["#4A90E2", "#3672E9", "#2A5CC9"]} 
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.ScrollView 
            style={[styles.scrollView, { opacity: fadeAnim }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="musical-notes" size={80} color="#FFFFFF" />
              </View>

              <Text style={styles.title}>Harmony Notes</Text>
              <Text style={styles.subtitle}>Music Therapy for Dementia</Text>
              
              {/* Rotating quotes */}
              <View style={styles.quoteContainer}>
                <Animated.Text style={styles.quoteText}>
                  "{quotes[quoteIndex]}"
                </Animated.Text>
              </View>

              {/* Benefits carousel */}
              <Text style={styles.carouselTitle}>Benefits of Music Therapy</Text>
              <FlatList
                ref={flatlistRef}
                data={benefits}
                renderItem={renderBenefitItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={true}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewConfigRef.current}
                style={styles.carousel}
                contentContainerStyle={styles.carouselContent}
              />
              
              {/* Dots indicator */}
              <View style={styles.dotsContainer}>
                {benefits.map((_, index) => {
                  const inputRange = [
                    (index - 1) * width * 0.86,
                    index * width * 0.86,
                    (index + 1) * width * 0.86
                  ]
                  
                  const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 16, 8],
                    extrapolate: 'clamp'
                  })
                  
                  const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp'
                  })
                  
                  const backgroundColor = scrollX.interpolate({
                    inputRange,
                    outputRange: ['rgba(255, 255, 255, 0.4)', '#FFFFFF', 'rgba(255, 255, 255, 0.4)'],
                    extrapolate: 'clamp'
                  })
                  
                  return (
                    <Animated.View
                      key={`dot-${index}`}
                      style={[
                        styles.dot,
                        { width: dotWidth, opacity, backgroundColor }
                      ]}
                    />
                  )
                })}
              </View>

              <TouchableOpacity style={styles.button} onPress={goToHome} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
              
              {/* Student info */}
              <View style={styles.studentInfoContainer}>
                <Text style={styles.createdByText}>Developed by</Text>
                <Text style={styles.studentName}>Mahima Bhuiyan Begum</Text>
                <Text style={styles.universityInfo}>University of Sunderland</Text>
                <Text style={styles.programInfo}>Computer Science</Text>
              </View>

              <Text style={styles.versionText}>Version 1.0.0</Text>
            </Animated.View>
          </Animated.ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 24,
  },
  quoteContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: 'white',
    textAlign: 'center',
    lineHeight: 26,
  },
  carouselTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  carousel: {
    width: width,
    maxHeight: 200,
  },
  carouselContent: {
    paddingHorizontal: width * 0.07,
  },
  benefitCard: {
    width: width * 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginRight: width * 0.03,
    height: 180,
    justifyContent: 'center',
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
  },
  benefitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  studentInfoContainer: {
    marginTop: 40,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '90%',
  },
  createdByText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  studentName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  universityInfo: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginTop: 4,
  },
  programInfo: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  versionText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    marginTop: 24,
  },
});
