"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { ThemedText } from "@/components/ThemedText"
import { Ionicons } from "@expo/vector-icons"
import { getMemories, deleteMemory, logActivity, ACTIVITY_TYPES, MEMORY_TAGS } from "@/utils/storage"

export default function MemoryScreen() {
  const router = useRouter()
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedMemories = await getMemories()
      setMemories(fetchedMemories)
    } catch (err) {
      console.error("Error loading memories:", err)
      setError("Failed to load memories. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMemory = async (memory) => {
    Alert.alert("Delete Memory", `Are you sure you want to delete "${memory.title}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMemory(memory.id)

            // Log the activity
            await logActivity(ACTIVITY_TYPES.MEMORY_DELETED, {
              id: memory.id,
              title: memory.title,
            })

            // Refresh memories list
            loadMemories()
          } catch (error) {
            console.error("Error deleting memory:", error)
            Alert.alert("Error", "Failed to delete memory")
          }
        },
      },
    ])
  }

  const handleEditMemory = (memory) => {
    router.push({
      pathname: "/edit-memory",
      params: { memoryId: memory.id },
    })
  }

  const handlePlayMemory = (memory) => {
    router.push({
      pathname: "/player",
      params: { memoryId: memory.id },
    })
  }

  // Function to render memory tags for a song
  const renderTags = (song) => {
    if (!song.memoryTags || song.memoryTags.length === 0) {
      return null
    }

    return (
      <View style={styles.tagsList}>
        {song.memoryTags.map((tag, index) => (
          <View key={index} style={styles.tagItem}>
            <Ionicons name={tag.icon || "pricetag-outline"} size={14} color="#4A90E2" style={styles.tagIcon} />
            <ThemedText style={styles.tagText}>{tag.label || tag.id || "Tag"}</ThemedText>
          </View>
        ))}
      </View>
    )
  }

  const renderMemoryItem = ({ item }) => (
    <View style={styles.memoryCard}>
      <View style={styles.memoryHeader}>
        <View style={styles.memoryInfo}>
          <ThemedText style={styles.memoryTitle}>{item.title}</ThemedText>
          {item.date && <ThemedText style={styles.memoryDate}>{item.date}</ThemedText>}
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEditMemory(item)}>
            <Ionicons name="pencil" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteMemory(item)}>
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      {item.description && (
        <View style={styles.descriptionContainer}>
          <ThemedText style={styles.descriptionText}>{item.description}</ThemedText>
        </View>
      )}

      <View style={styles.songsList}>
        <View style={styles.songsHeader}>
          <ThemedText style={styles.songsTitle}>Songs</ThemedText>
          <ThemedText style={styles.songCount}>{item.songs.length} songs</ThemedText>
        </View>
        {item.songs.map((song, index) => (
          <View key={index} style={styles.songItem}>
            <View style={styles.songIconContainer}>
              <Ionicons name="musical-note" size={18} color="#4A90E2" />
            </View>
            <View style={styles.songInfo}>
              <ThemedText style={styles.songTitle}>{song.title}</ThemedText>
              <ThemedText style={styles.artistName}>{song.artist}</ThemedText>
              {renderTags(song)}
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.playButton} onPress={() => handlePlayMemory(item)}>
        <Ionicons name="play" size={20} color="#FFFFFF" />
        <ThemedText style={styles.playButtonText}>Play Memory</ThemedText>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Memories</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {memories.length} {memories.length === 1 ? "memory" : "memories"}
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <ThemedText style={styles.loadingText}>Loading memories...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#E74C3C" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={loadMemories}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : memories.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="images-outline" size={80} color="#CCC" />
            <ThemedText style={styles.emptyText}>No memories yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Create a memory to help stimulate recall through music</ThemedText>
            <TouchableOpacity style={styles.createEmptyButton} onPress={() => router.push("/add-memory")}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <ThemedText style={styles.createEmptyButtonText}>Create Memory</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={memories}
            renderItem={renderMemoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {!loading && memories.length > 0 && (
          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add-memory")}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
    marginTop: 24,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createEmptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  createEmptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  memoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  memoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  memoryInfo: {
    flex: 1,
  },
  memoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  memoryDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  descriptionContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#4A90E2",
  },
  descriptionText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  songsList: {
    marginBottom: 16,
  },
  songsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  songsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  songCount: {
    fontSize: 14,
    color: "#666",
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    marginBottom: 8,
  },
  songIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  artistName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F1FC",
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagIcon: {
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#4A90E2",
    fontWeight: "500",
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
})
