"use client"

import { useState } from "react"
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedView from "../../components/ThemedView"
import ThemedText from "../../components/ThemedText"
import PlaylistItem from "../../components/PlaylistItem"
import EmotionSelector from "../../components/EmotionSelector"

// Mock data for song search results
const mockSongs = [
  {
    id: "1",
    title: "What a Wonderful World",
    artist: "Louis Armstrong",
    duration: "2:21",
    uri: "https://example.com/song1.mp3",
  },
  {
    id: "2",
    title: "Somewhere Over The Rainbow",
    artist: "Israel Kamakawiwo'ole",
    duration: "3:47",
    uri: "https://example.com/song2.mp3",
  },
  {
    id: "3",
    title: "Moon River",
    artist: "Andy Williams",
    duration: "2:43",
    uri: "https://example.com/song3.mp3",
  },
  {
    id: "4",
    title: "Fly Me To The Moon",
    artist: "Frank Sinatra",
    duration: "2:31",
    uri: "https://example.com/song4.mp3",
  },
  {
    id: "5",
    title: "The Way You Look Tonight",
    artist: "Fred Astaire",
    duration: "3:22",
    uri: "https://example.com/song5.mp3",
  },
]

const CreatePlaylistScreen = ({ navigation }) => {
  const [playlistName, setPlaylistName] = useState("")
  const [playlistDescription, setPlaylistDescription] = useState("")
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSongs, setSelectedSongs] = useState([])

  const filteredSongs = searchQuery
    ? mockSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : mockSongs

  const handleAddSong = (song) => {
    if (!selectedSongs.some((s) => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song])
    } else {
      // Remove song if already selected
      setSelectedSongs(selectedSongs.filter((s) => s.id !== song.id))
    }
  }

  const handleRemoveSong = (songId) => {
    setSelectedSongs(selectedSongs.filter((song) => song.id !== songId))
  }

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name")
      return
    }

    if (selectedSongs.length === 0) {
      Alert.alert("Error", "Please add at least one song to the playlist")
      return
    }

    // Create the playlist object
    const newPlaylist = {
      id: Date.now().toString(),
      name: playlistName,
      description: playlistDescription,
      emotion: selectedEmotion,
      songs: selectedSongs,
      createdAt: new Date().toISOString(),
    }

    // Here you would typically save the playlist to your storage
    // For now, we'll just navigate back
    Alert.alert("Success", "Playlist created successfully!", [
      {
        text: "OK",
        onPress: () => navigation.navigate("Playlists", { newPlaylist }),
      },
    ])
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <ThemedText style={styles.sectionTitle}>Playlist Details</ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Playlist Name"
              placeholderTextColor="#999"
              value={playlistName}
              onChangeText={setPlaylistName}
              maxLength={50}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#999"
              value={playlistDescription}
              onChangeText={setPlaylistDescription}
              multiline
              maxLength={200}
            />
          </View>

          <EmotionSelector selectedEmotion={selectedEmotion} onSelectEmotion={setSelectedEmotion} />

          <View style={styles.formSection}>
            <ThemedText style={styles.sectionTitle}>Add Songs</ThemedText>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for songs..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.songsContainer}>
              {filteredSongs.map((song) => (
                <PlaylistItem
                  key={song.id}
                  item={song}
                  onPress={() => handleAddSong(song)}
                  showPlayButton={false}
                  isSelected={selectedSongs.some((s) => s.id === song.id)}
                />
              ))}
            </View>
          </View>

          {selectedSongs.length > 0 && (
            <View style={styles.formSection}>
              <ThemedText style={styles.sectionTitle}>Selected Songs ({selectedSongs.length})</ThemedText>

              <View style={styles.selectedSongsContainer}>
                {selectedSongs.map((song) => (
                  <PlaylistItem
                    key={song.id}
                    item={song}
                    onPress={() => {}}
                    showPlayButton={false}
                    onOptionsPress={() => handleRemoveSong(song.id)}
                  />
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.createButton} onPress={handleCreatePlaylist}>
            <ThemedText style={styles.createButtonText}>Create Playlist</ThemedText>
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
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  songsContainer: {
    marginBottom: 16,
  },
  selectedSongsContainer: {
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default CreatePlaylistScreen
