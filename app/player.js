"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Ionicons } from "@expo/vector-icons"
import MusicPlayer from "@/components/MusicPlayer"
import { getPlaylists, getMemories, logActivity, ACTIVITY_TYPES } from "@/utils/storage"

// Define the actual songs with their local file paths
const realSongs = [
  {
    id: "1",
    title: "What a Wonderful World",
    artist: "Louis Armstrong",
    duration: 180,
    localFile: require("../assets/sounds/Louis_Armstrong_-_What_A_Wonderful_World_CeeNaija.com_.mp3"),
  },
  {
    id: "2",
    title: "Somewhere Over the Rainbow",
    artist: "Ronnie Booth",
    duration: 240,
    localFile: require("../assets/sounds/Ronnie_Booth_-_Somewhere_Over_the_Rainbow_CeeNaija.com_.mp3"),
  },
  {
    id: "3",
    title: "Moon River",
    artist: "JJ Heller",
    duration: 210,
    localFile: require("../assets/sounds/JJ-Heller-Moon-River-(CeeNaija.com).mp3"),
  },
  {
    id: "4",
    title: "Calm",
    artist: "Victor Thompson",
    duration: 300,
    localFile: require("../assets/sounds/Victor_Thompson_-_Calm_CeeNaija.com_.mp3"),
  },
  {
    id: "5",
    title: "The Calm",
    artist: "7 Hills Worship",
    duration: 240,
    localFile: require("../assets/sounds/7-Hills-Worship-The-Calm-(CeeNaija.com).mp3"),
  },
  {
    id: "6",
    title: "Redeemed",
    artist: "Gaither Vocal Band",
    duration: 360,
    localFile: require("../assets/sounds/Gaither_Vocal_Band_-_Redeemed_CeeNaija.com_.mp3"),
  },
  {
    id: "7",
    title: "Feelin' Like Christmas",
    artist: "Sarah Reeves",
    duration: 240,
    localFile: require("../assets/sounds/Sarah_Reeves_-_Feelin_Like_Christmas_CeeNaija.com_.mp3"),
  },
  {
    id: "8",
    title: "Come Jesus Come",
    artist: "Brooklyn Tabernacle Choir",
    duration: 300,
    localFile: require("../assets/sounds/The-Brooklyn-Tabernacle-Choir-Come-Jesus-Come-featuring-Stephen-McWhirter-with-the-Brooklyn-Tabernacle-Choir-(CeeNaija.com).mp3"),
  },
  {
    id: "9",
    title: "Fidele",
    artist: "Lord Lombo",
    duration: 240,
    localFile: require("../assets/sounds/LORD-LOMBO-FIDELE-Remix-Official-Lyrics-Video-(CeeNaija.com).mp3"),
  },
  {
    id: "10",
    title: "Nostalgic",
    artist: "Alvin Cedric",
    duration: 240,
    localFile: require("../assets/sounds/Alvin_Cedric_-_Nostalgic_CeeNaija.com_.mp3"),
  },
  {
    id: "11",
    title: "Sad",
    artist: "BOBO W",
    duration: 240,
    localFile: require("../assets/sounds/BOBO-W-FEELING-SAD-(CeeNaija.com).mp3"),
  },
  {
    id: "12",
    title: "Fan First",
    artist: "Cas Metah",
    duration: 240,
    localFile: require("../assets/sounds/Cas_Metah_-_Fan_First_CeeNaija.com_.mp3"),
  },
  {
    id: "13",
    title: "Relax",
    artist: "Christina Shusho",
    duration: 240,
    localFile: require("../assets/sounds/Christina_Shusho_-_Relax_CeeNaija.com_.mp3"),
  },
  {
    id: "14",
    title: "Happy",
    artist: "Daphne",
    duration: 240,
    localFile: require("../assets/sounds/Daphne_-_Happy_CeeNaija.com_.mp3"),
  },
  {
    id: "15",
    title: "Happy Place",
    artist: "Esther Oji",
    duration: 240,
    localFile: require("../assets/sounds/Esther_Oji_-_Happy_Place_CeeNaija.com_.mp3"),
  },
  {
    id: "16",
    title: "I'm So Sad",
    artist: "Gnash",
    duration: 180,
    localFile: require("../assets/sounds/gnash_-_Im_So_Sad_CeeNaija.com_.mp3"),
  },
  {
    id: "17",
    title: "Happy",
    artist: "Guardian Angel",
    duration: 240,
    localFile: require("../assets/sounds/Guardian_Angel_-_Happy_CeeNaija.com_.mp3"),
  },
  {
    id: "18",
    title: "Let Me Be Sad",
    artist: "I Prevail",
    duration: 210,
    localFile: require("../assets/sounds/I_Prevail_-_Let_Me_Be_Sad_CeeNaija.com_.mp3"),
  },
  {
    id: "19",
    title: "Happy Without You",
    artist: "Jessia",
    duration: 240,
    localFile: require("../assets/sounds/Jessia_-_Happy_Without_You_CeeNaija.com_.mp3"),
  },
  {
    id: "20",
    title: "Relax",
    artist: "Marvin Sapp",
    duration: 240,
    localFile: require("../assets/sounds/Marvin_Sapp_-_Relax_CeeNaija.com_.mp3"),
  },
  {
    id: "21",
    title: "Too Sad To Cry",
    artist: "Sasha Sloan",
    duration: 240,
    localFile: require("../assets/sounds/Sasha_Sloan_-_Too_Sad_To_Cry_CeeNaija.com_.mp3"),
  },
]

export default function PlayerScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const { playlistId, memoryId, autoplay } = params

  const [currentPlaylist, setCurrentPlaylist] = useState(null)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoplay === "true")
  const [loading, setLoading] = useState(true)
  const [isMemory, setIsMemory] = useState(false)

  // Load the playlist or memory
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true)

        if (playlistId) {
          const playlists = await getPlaylists()
          const playlist = playlists.find((p) => p.id === playlistId)

          if (playlist) {
            // Log that we're playing this playlist
            logActivity(ACTIVITY_TYPES.PLAYLIST_PLAYED, {
              id: playlist.id,
              name: playlist.name,
            })

            // Match playlist songs with real song data including audio files
            const songsWithAudio =
              playlist.songs.length > 0
                ? playlist.songs.map((song, index) => {
                    // Find the matching real song using both title and artist to ensure uniqueness
                    const realSong =
                      realSongs.find((rs) => rs.title === song.title && rs.artist === song.artist) ||
                      realSongs[index % realSongs.length]
                    // Create a unique ID that includes the original song ID to ensure uniqueness
                    const uniqueId = `${song.id || realSong.id}-${index}`
                    return {
                      ...realSong,
                      ...song, // Preserve original song data (title, artist)
                      id: uniqueId,
                      title: song.title,
                      artist: song.artist,
                    }
                  })
                : realSongs.slice(0, 3).map((song, index) => ({
                    ...song,
                    id: `default-${song.id}-${index}`,
                  })) // Default songs if playlist is empty

            setCurrentPlaylist({
              ...playlist,
              songs: songsWithAudio,
            })
            setIsMemory(false)
          } else {
            // Fallback to default playlist
            setCurrentPlaylist({
              id: "default",
              name: "Sample Playlist",
              songs: realSongs.slice(0, 3).map((song, index) => ({
                ...song,
                id: `default-${song.id}-${index}`,
              })),
            })
            setIsMemory(false)
          }
        } else if (memoryId) {
          const memories = await getMemories()
          const memory = memories.find((m) => m.id === memoryId)

          if (memory) {
            // Log that we're playing this memory
            logActivity(ACTIVITY_TYPES.MEMORY_PLAYED, {
              id: memory.id,
              title: memory.title,
            })

            // Match memory songs with real song data including audio files
            const songsWithAudio =
              memory.songs.length > 0
                ? memory.songs.map((song, index) => {
                    // Find the matching real song using both title and artist
                    const realSong =
                      realSongs.find((rs) => rs.title === song.title && rs.artist === song.artist) ||
                      realSongs[index % realSongs.length]
                    // Create a unique ID
                    const uniqueId = `${song.id || realSong.id}-${index}`
                    return {
                      ...realSong,
                      ...song, // Preserve original song data
                      id: uniqueId,
                      title: song.title,
                      artist: song.artist,
                    }
                  })
                : realSongs.slice(0, 3).map((song, index) => ({
                    ...song,
                    id: `default-${song.id}-${index}`,
                  })) // Default songs if memory is empty

            setCurrentPlaylist({
              ...memory,
              name: memory.title,
              songs: songsWithAudio,
            })
            setIsMemory(true)
          } else {
            // Fallback to default playlist
            setCurrentPlaylist({
              id: "default",
              name: "Sample Memory Collection",
              songs: realSongs.slice(5, 8).map((song, index) => ({
                ...song,
                id: `default-${song.id}-${index}`,
              })),
            })
            setIsMemory(false)
          }
        } else {
          // No playlist or memory ID - show some default songs
          setCurrentPlaylist({
            id: "default",
            name: "Featured Songs",
            songs: realSongs.map((song, index) => ({
              ...song,
              id: `featured-${song.id}-${index}`,
            })),
          })
          setIsMemory(false)
        }
      } catch (error) {
        console.error("Error loading content:", error)
        // Fallback to a sample playlist
        setCurrentPlaylist({
          id: "default",
          name: "Sample Playlist",
          songs: realSongs.slice(0, 4).map((song, index) => ({
            ...song,
            id: `error-${song.id}-${index}`,
          })),
        })
        setIsMemory(false)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [playlistId, memoryId])

  const handleNext = () => {
    if (!currentPlaylist) return

    if (currentSongIndex < currentPlaylist.songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1)
    } else {
      setCurrentSongIndex(0) // Loop back to the first song
    }
  }

  const handlePrevious = () => {
    if (!currentPlaylist) return

    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1)
    } else {
      setCurrentSongIndex(currentPlaylist.songs.length - 1) // Go to the last song
    }
  }

  const handlePlayPauseToggle = (playState) => {
    setIsPlaying(playState)

    // Log the song play if it's starting to play
    if (playState && currentPlaylist && currentPlaylist.songs[currentSongIndex]) {
      const song = currentPlaylist.songs[currentSongIndex]
      logActivity(ACTIVITY_TYPES.SONG_PLAYED, {
        id: song.id,
        title: song.title,
        artist: song.artist,
      })
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle} numberOfLines={1}>
              {isMemory ? "Memory Player" : "Music Player"}
            </ThemedText>
          </View>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <Ionicons name="musical-notes" size={40} color="#4A90E2" style={styles.loadingIcon} />
            <ThemedText style={styles.loadingText}>Loading audio...</ThemedText>
          </ThemedView>
        ) : currentPlaylist ? (
          <>
            <ThemedView style={styles.playlistHeader}>
              <View style={styles.albumArt}>
                <Ionicons name={isMemory ? "heart" : "musical-notes"} size={40} color="#fff" style={styles.albumIcon} />
              </View>
              <ThemedText style={styles.playlistName}>{currentPlaylist.name}</ThemedText>
              <ThemedText style={styles.songCount}>
                {currentPlaylist.songs.length} {currentPlaylist.songs.length === 1 ? "song" : "songs"}
              </ThemedText>
              {isMemory && currentPlaylist.description && (
                <ThemedText style={styles.memoryDescription}>{currentPlaylist.description}</ThemedText>
              )}
            </ThemedView>

            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <MusicPlayer
                song={currentPlaylist.songs[currentSongIndex]}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onPlayPauseToggle={handlePlayPauseToggle}
                isPlaying={isPlaying}
                playlistSongs={currentPlaylist.songs}
                onSongSelect={(index) => setCurrentSongIndex(index)}
                currentSongIndex={currentSongIndex}
              />

              <ThemedView style={styles.songList}>
                <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>Songs</ThemedText>
                  <ThemedText style={styles.nowPlaying}>
                    Now Playing: {currentSongIndex + 1}/{currentPlaylist.songs.length}
                  </ThemedText>
                </View>

                {currentPlaylist.songs.map((song, index) => (
                  <TouchableOpacity
                    key={`${song.id}-${index}`}
                    style={[styles.songItem, currentSongIndex === index && styles.currentSong]}
                    onPress={() => {
                      setCurrentSongIndex(index)
                      setIsPlaying(true)
                    }}
                  >
                    <View style={styles.songNumber}>
                      <ThemedText
                        style={[styles.songNumberText, currentSongIndex === index && styles.currentSongNumberText]}
                      >
                        {index + 1}
                      </ThemedText>
                    </View>
                    <View style={styles.songInfo}>
                      <ThemedText
                        style={[styles.songTitle, currentSongIndex === index && styles.currentSongText]}
                        numberOfLines={1}
                      >
                        {song.title}
                      </ThemedText>
                      <ThemedText
                        style={[styles.artistName, currentSongIndex === index && styles.currentSongText]}
                        numberOfLines={1}
                      >
                        {song.artist}
                      </ThemedText>
                    </View>
                    {currentSongIndex === index && isPlaying ? (
                      <View style={styles.playingIndicator}>
                        <Ionicons name="musical-note" size={16} color="#4A90E2" />
                        <ThemedText style={styles.playingText}>Playing</ThemedText>
                      </View>
                    ) : (
                      <Ionicons name="play-circle" size={24} color="#4A90E2" />
                    )}
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ScrollView>
          </>
        ) : (
          <ThemedView style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={80} color="#ccc" />
            <ThemedText style={styles.emptyStateText}>No playlist or memory selected</ThemedText>
            <TouchableOpacity style={styles.browseButton} onPress={() => router.push("/playlists")}>
              <ThemedText style={styles.browseButtonText}>Browse Playlists</ThemedText>
            </TouchableOpacity>
          </ThemedView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  playlistHeader: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  albumArt: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  albumIcon: {
    opacity: 0.9,
  },
  playlistName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  songCount: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  memoryDescription: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  songList: {
    padding: 16,
    marginTop: 8,
    backgroundColor: "transparent",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  nowPlaying: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "500",
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  songNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  songNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  currentSongNumberText: {
    color: "#4A90E2",
  },
  currentSong: {
    backgroundColor: "rgba(74, 144, 226, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: "#4A90E2",
  },
  songInfo: {
    flex: 1,
    marginRight: 10,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  artistName: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  currentSongText: {
    color: "#4A90E2",
  },
  playingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  playingText: {
    fontSize: 12,
    color: "#4A90E2",
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
})
