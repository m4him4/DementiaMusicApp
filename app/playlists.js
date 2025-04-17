"use client"

import { useState, useEffect, useCallback } from "react"
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useFocusEffect } from "@react-navigation/native"
import { ThemedView } from "@/components/ThemedView"
import { ThemedText } from "@/components/ThemedText"
import PlaylistCard from "@/components/PlaylistCard"
import { getPlaylists, deletePlaylist, logActivity, ACTIVITY_TYPES } from "@/utils/storage"
import { Ionicons } from "@expo/vector-icons"

export default function PlaylistsScreen() {
  const router = useRouter()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load playlists function
  const loadPlaylists = async () => {
    try {
      setLoading(true)
      setError(null)
      const storedPlaylists = await getPlaylists()
      setPlaylists(storedPlaylists)
    } catch (err) {
      console.error("Error loading playlists:", err)
      setError("Could not load playlists. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Load playlists on initial render
  useEffect(() => {
    loadPlaylists()
  }, [])

  // Reload playlists whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPlaylists()
    }, []),
  )

  // Handle playlist deletion
  const handleDeletePlaylist = async (playlist) => {
    Alert.alert("Delete Playlist", `Are you sure you want to delete "${playlist.name}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true)
            await deletePlaylist(playlist.id)

            // Log the activity
            await logActivity(ACTIVITY_TYPES.PLAYLIST_DELETED, {
              id: playlist.id,
              name: playlist.name,
            })

            // Reload playlists
            await loadPlaylists()

            // Show success message
            Alert.alert("Success", "Playlist deleted successfully")
          } catch (error) {
            console.error("Error deleting playlist:", error)
            Alert.alert("Error", "Failed to delete playlist. Please try again.")
            setLoading(false)
          }
        },
      },
    ])
  }

  // Handle playlist edit
  const handleEditPlaylist = (playlist) => {
    router.push({
      pathname: "/edit-playlist",
      params: { playlistId: playlist.id },
    })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>My Playlists</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
          </ThemedText>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <ThemedText style={styles.loadingText}>Loading playlists...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={loadPlaylists}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : playlists.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="musical-notes-outline" size={80} color="#ccc" />
            <ThemedText style={styles.emptyText}>You don't have any playlists yet.</ThemedText>
            <ThemedText style={styles.emptySubtext}>Create your first playlist to get started!</ThemedText>
            <TouchableOpacity style={styles.createEmptyButton} onPress={() => router.push("/create-playlist")}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <ThemedText style={styles.createEmptyButtonText}>Create Playlist</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.playlistScrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.playlistContentContainer}
          >
            <View style={styles.playlistContainer}>
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onPress={() =>
                    router.push({
                      pathname: "/player",
                      params: { playlistId: playlist.id },
                    })
                  }
                  onPlayPress={() =>
                    router.push({
                      pathname: "/player",
                      params: { playlistId: playlist.id, autoplay: true },
                    })
                  }
                  onEditPress={handleEditPlaylist}
                  onDeletePress={handleDeletePlaylist}
                />
              ))}
            </View>
          </ScrollView>
        )}

        {!loading && playlists.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.moodButton} onPress={() => router.push("/mood-playlist")}>
              <Ionicons name="happy-outline" size={22} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Create by Mood</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create-playlist")}>
              <Ionicons name="add" size={22} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Create Playlist</ThemedText>
            </TouchableOpacity>
          </View>
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
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
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
    backgroundColor: "#4a90e2",
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
  playlistScrollContainer: {
    flex: 1,
  },
  playlistContentContainer: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  playlistContainer: {
    gap: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#4a90e2",
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  moodButton: {
    flex: 1,
    backgroundColor: "#FF9500",
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})
