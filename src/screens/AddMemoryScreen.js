"use client"

import { useState } from "react"
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedView from "../../components/ThemedView"
import ThemedText from "../../components/ThemedText"
import MemoryTag from "../../components/MemoryTag"

const memoryTypes = [
  { id: "event", label: "Event", icon: "calendar-outline" },
  { id: "person", label: "Person", icon: "person-outline" },
  { id: "place", label: "Place", icon: "location-outline" },
  { id: "era", label: "Time Period", icon: "hourglass-outline" },
  { id: "emotion", label: "Emotion", icon: "heart-outline" },
]

const AddMemoryScreen = ({ route, navigation }) => {
  const { song, onAddMemory } = route.params || {}
  const [memoryLabel, setMemoryLabel] = useState("")
  const [memoryDescription, setMemoryDescription] = useState("")
  const [selectedType, setSelectedType] = useState("event")

  const handleSave = () => {
    if (!memoryLabel.trim()) {
      Alert.alert("Error", "Please enter a memory label")
      return
    }

    const newMemory = {
      id: Date.now().toString(),
      label: memoryLabel,
      description: memoryDescription,
      type: selectedType,
      songId: song?.id,
      createdAt: new Date().toISOString(),
    }

    // Call the callback function to add the memory
    if (onAddMemory) {
      onAddMemory(newMemory)
    }

    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#777" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Add Memory</ThemedText>
          <TouchableOpacity onPress={handleSave}>
            <ThemedText style={styles.saveButton}>Save</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {song && (
            <View style={styles.songInfo}>
              <ThemedText style={styles.songInfoText}>
                Adding memory for: <ThemedText style={styles.songTitle}>{song.title}</ThemedText>
              </ThemedText>
            </View>
          )}

          <View style={styles.formSection}>
            <ThemedText style={styles.sectionTitle}>Memory Type</ThemedText>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeContainer}>
              {memoryTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeButton, selectedType === type.id && styles.selectedTypeButton]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Ionicons name={type.icon} size={24} color={selectedType === type.id ? "#fff" : "#4A90E2"} />
                  <ThemedText style={[styles.typeLabel, selectedType === type.id && styles.selectedTypeLabel]}>
                    {type.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formSection}>
            <ThemedText style={styles.sectionTitle}>Memory Details</ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Memory Label (e.g., 'Wedding Day', 'Childhood Home')"
              placeholderTextColor="#999"
              value={memoryLabel}
              onChangeText={setMemoryLabel}
              maxLength={50}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#999"
              value={memoryDescription}
              onChangeText={setMemoryDescription}
              multiline
              maxLength={200}
            />
          </View>

          <View style={styles.previewSection}>
            <ThemedText style={styles.sectionTitle}>Preview</ThemedText>

            {memoryLabel ? (
              <MemoryTag
                tag={{
                  id: "preview",
                  label: memoryLabel,
                  type: selectedType,
                }}
                onPress={() => {}}
              />
            ) : (
              <ThemedText style={styles.previewPlaceholder}>Enter a label to see a preview</ThemedText>
            )}
          </View>

          <TouchableOpacity style={styles.saveButtonLarge} onPress={handleSave}>
            <ThemedText style={styles.saveButtonLargeText}>Save Memory</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  saveButton: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "600",
  },
  songInfo: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  songInfoText: {
    fontSize: 14,
  },
  songTitle: {
    fontWeight: "bold",
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  typeContainer: {
    paddingBottom: 10,
  },
  typeButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    width: 100,
    height: 100,
  },
  selectedTypeButton: {
    backgroundColor: "#4A90E2",
  },
  typeLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#4A90E2",
  },
  selectedTypeLabel: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  previewSection: {
    marginBottom: 30,
  },
  previewPlaceholder: {
    color: "#999",
    fontStyle: "italic",
  },
  saveButtonLarge: {
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  saveButtonLargeText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default AddMemoryScreen
