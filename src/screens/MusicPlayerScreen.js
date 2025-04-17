"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedView from "../../components/ThemedView"
import ThemedText from "../../components/ThemedText"
import MusicPlayer from "../../components/MusicPlayer"
import PlaylistItem from "../../components/PlaylistItem"
import MemoryTag from "../../components/MemoryTag"

const MusicPlayerScreen = ({ route, navigation }) => {
  const { playlist, initialSongIndex = 0 } = route.params || {}
  const [currentSongIndex, setCurrentSongIndex] = useState(initialSongIndex)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [showMemories, setShowMemories] = useState(false)

  const currentSong = playlist?.songs?.[currentSongIndex]

  // Mock memory tags for the current song
  const [memoryTags, setMemoryTags] = useState([
    { id: "1", label: "Wedding Day", type: "event" },
    { id: "2", label: "Summer 1965", type: "era" },
    { id: "3", label: "Childhood Home", type: "place" },
  ])

  useEffect(() => {
    // Reset playing state when song changes
    setIsPlaying(true)
  }, [currentSongIndex])

  const handleNext = () => {
    if (playlist?.songs && currentSongIndex < playlist.songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1)
    }
  }

  const handlePlaySong = (index) => {
    setCurrentSongIndex(index)
    setIsPlaying(true)
  }

  const handleAddMemory = () => {
    // Navigate to add memory screen
    navigation.navigate("AddMemory", {
      song: currentSong,
      onAddMemory: (newTag) => {
        setMemoryTags([...memoryTags, newTag])
      },
    })
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color="#4A90E2" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {playlist?.name || "Now Playing"}
          </ThemedText>
        </View>

        <TouchableOpacity onPress={() => setShowPlaylist(!showPlaylist)}>
          <Ionicons name="list" size={24} color={showPlaylist ? "#4A90E2" : "#777"} />
        </TouchableOpacity>
      </View>

      {!showPlaylist && !showMemories && (
        <View style={styles.albumArtContainer}>
          <View style={styles.albumArt}>
            <Ionicons name="musical-notes" size={80} color="#4A90E2" />
          </View>
        </View>
      )}

      {!showPlaylist && !showMemories && (
        <View style={styles.memoryTagsContainer}>
          <View style={styles.memoryTagsHeader}>
            <ThemedText style={styles.memoryTagsTitle}>Memory Tags</ThemedText>
            <TouchableOpacity onPress={() => setShowMemories(true)}>
              <ThemedText style={styles.viewAllText}>View All</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memoryTagsScroll}>
            {memoryTags.map((tag) => (
              <MemoryTag key={tag.id} tag={tag} onPress={() => {}} />
            ))}

            <TouchableOpacity style={styles.addMemoryButton} onPress={handleAddMemory}>
              <Ionicons name="add" size={20} color="#4A90E2" />
              <ThemedText style={styles.addMemoryText}>Add Memory</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {showPlaylist && (
        <View style={styles.playlistContainer}>
          <ThemedText style={styles.playlistTitle}>
            {playlist?.name || "Playlist"} ({playlist?.songs?.length || 0} songs)
          </ThemedText>

          <ScrollView showsVerticalScrollIndicator={false}>
            {playlist?.songs?.map((song, index) => (
              <PlaylistItem
                key={song.id}
                item={song}
                onPress={() => handlePlaySong(index)}
                isPlaying={currentSongIndex === index && isPlaying}
                onPlayPress={() => handlePlaySong(index)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {showMemories && (
        <View style={styles.memoriesContainer}>
          <View style={styles.memoriesHeader}>
            <ThemedText style={styles.memoriesTitle}>Memories for "{currentSong?.title}"</ThemedText>
            <TouchableOpacity style={styles.addButton} onPress={handleAddMemory}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {memoryTags.map((tag) => (
              <View key={tag.id} style={styles.memoryItem}>
                <MemoryTag tag={tag} onPress={() => {}} />
                <ThemedText style={styles.memoryDescription}>Tap to add a description for this memory...</ThemedText>
              </View>
            ))}

            {memoryTags.length === 0 && (
              <ThemedText style={styles.noMemoriesText}>
                No memories added yet. Tap the + button to add a memory.
              </ThemedText>
            )}
          </ScrollView>
        </View>
      )}

      <View style={styles.playerContainer}>
        <MusicPlayer
          song={currentSong}
          isPlaying={isPlaying}
          onPlayPauseToggle={setIsPlaying}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, showMemories && styles.activeFooterButton]}
          onPress={() => {
            setShowMemories(true)
            setShowPlaylist(false)
          }}
        >
          <Ionicons name="bookmark-outline" size={24} color={showMemories ? "#4A90E2" : "#777"} />
          <ThemedText style={[styles.footerButtonText, showMemories && styles.activeFooterButtonText]}>
            Memories
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, !showPlaylist && !showMemories && styles.activeFooterButton]}
          onPress={() => {
            setShowMemories(false)
            setShowPlaylist(false)
          }}
        >
          <Ionicons name="musical-note-outline" size={24} color={!showPlaylist && !showMemories ? "#4A90E2" : "#777"} />
          <ThemedText
            style={[styles.footerButtonText, !showPlaylist && !showMemories && styles.activeFooterButtonText]}
          >
            Now Playing
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, showPlaylist && styles.activeFooterButton]}
          onPress={() => {
            setShowPlaylist(true)
            setShowMemories(false)
          }}
        >
          <Ionicons name="list-outline" size={24} color={showPlaylist ? "#4A90E2" : "#777"} />
          <ThemedText style={[styles.footerButtonText, showPlaylist && styles.activeFooterButtonText]}>
            Playlist
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  albumArtContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  memoryTagsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  memoryTagsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  memoryTagsTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  viewAllText: {
    fontSize: 14,
    color: "#4A90E2",
  },
  memoryTagsScroll: {
    paddingRight: 20,
    paddingVertical: 5,
  },
  addMemoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
    borderStyle: "dashed",
  },
  addMemoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A90E2",
    marginLeft: 5,
  },
  playlistContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  playlistTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  memoriesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  memoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  memoriesTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  memoryItem: {
    marginBottom: 15,
  },
  memoryDescription: {
    marginTop: 5,
    marginLeft: 10,
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  noMemoriesText: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
    fontSize: 16,
  },
  playerContainer: {
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  footerButton: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  activeFooterButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#4A90E2",
  },
  footerButtonText: {
    marginTop: 5,
    fontSize: 12,
    color: "#777",
  },
  activeFooterButtonText: {
    color: "#4A90E2",
    fontWeight: "500",
  },
})

export default MusicPlayerScreen
