import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "./ThemedText"

const emotions = [
  { id: "calm", label: "Calm", icon: "water-outline", color: "#4A90E2" },
  { id: "happy", label: "Happy", icon: "sunny-outline", color: "#F5A623" },
  { id: "nostalgic", label: "Nostalgic", icon: "hourglass-outline", color: "#9B59B6" },
  { id: "energetic", label: "Energetic", icon: "flash-outline", color: "#E74C3C" },
  { id: "relaxed", label: "Relaxed", icon: "leaf-outline", color: "#2ECC71" },
  { id: "focused", label: "Focused", icon: "bulb-outline", color: "#F39C12" },
  { id: "sleepy", label: "Sleepy", icon: "moon-outline", color: "#8E44AD" },
]

const EmotionSelector = ({ selectedEmotion, onSelectEmotion }) => {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>How are you feeling today?</ThemedText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emotionsContainer}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[
              styles.emotionButton,
              selectedEmotion === emotion.id && styles.selectedEmotion,
              { borderColor: emotion.color },
            ]}
            onPress={() => onSelectEmotion(emotion.id)}
          >
            <Ionicons name={emotion.icon} size={28} color={selectedEmotion === emotion.id ? emotion.color : "#777"} />
            <ThemedText style={[styles.emotionLabel, selectedEmotion === emotion.id && { color: emotion.color }]}>
              {emotion.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    marginLeft: 15,
  },
  emotionsContainer: {
    paddingHorizontal: 10,
  },
  emotionButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginHorizontal: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: 100,
    height: 100,
  },
  selectedEmotion: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emotionLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
})

export default EmotionSelector
