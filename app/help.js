import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";

export default function HelpScreen() {
  const helpItems = [
    {
      title: "Getting Started",
      icon: "rocket-outline",
      content: "Learn how to create your first playlist and start enjoying music therapy for dementia care."
    },
    {
      title: "Creating Playlists",
      icon: "musical-notes-outline",
      content: "Add favorite songs, organize them into playlists, and customize them for different moods and memories."
    },
    {
      title: "Memory Stimulation",
      icon: "flash-outline",
      content: "Associate songs with specific memories, events, or time periods to help stimulate cognitive recall."
    },
    {
      title: "Activity Logs",
      icon: "analytics-outline",
      content: "Track listening sessions and responses to help identify the most effective music for therapeutic benefits."
    },
    {
      title: "Frequently Asked Questions",
      icon: "help-circle-outline",
      content: "Find answers to common questions about using the Music Therapy app."
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedText style={styles.intro}>
          Welcome to the Music Therapy app for dementia care. This app is designed to help caregivers 
          create personalized music experiences that can stimulate memory and improve quality of life.
        </ThemedText>
        
        {helpItems.map((item, index) => (
          <ThemedView key={index} style={styles.helpCard}>
            <View style={styles.helpHeader}>
              <Ionicons name={item.icon} size={24} color="#4A90E2" />
              <ThemedText style={styles.helpTitle}>{item.title}</ThemedText>
            </View>
            <ThemedText style={styles.helpContent}>{item.content}</ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  intro: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    color: '#333',
  },
  helpCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  helpContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
}); 