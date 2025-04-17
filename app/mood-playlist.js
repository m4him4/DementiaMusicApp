import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { 
  MOOD_CATEGORIES, 
  getAvailableMoods, 
  getSongsByMood, 
  savePlaylist, 
  logActivity, 
  ACTIVITY_TYPES 
} from '@/utils/storage';

export default function MoodPlaylistScreen() {
  const router = useRouter();
  const [availableMoods, setAvailableMoods] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSongs, setMoodSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);
  const [songsLoading, setSongsLoading] = useState(false);

  // Load available moods
  useEffect(() => {
    const loadMoods = async () => {
      try {
        setLoading(true);
        const moods = await getAvailableMoods();
        setAvailableMoods(moods);
      } catch (error) {
        console.error("Error loading moods:", error);
        Alert.alert("Error", "Failed to load mood categories");
      } finally {
        setLoading(false);
      }
    };

    loadMoods();
  }, []);

  // Load songs when a mood is selected
  const handleMoodSelect = async (mood) => {
    try {
      setSelectedMood(mood);
      setSongsLoading(true);
      setMoodSongs([]);
      setSelectedSongs([]);
      setPlaylistName(`${mood.name} Music`); // Default playlist name based on mood
      
      const songs = await getSongsByMood(mood.id);
      setMoodSongs(songs);
    } catch (error) {
      console.error("Error loading songs for mood:", error);
      Alert.alert("Error", "Failed to load songs for this mood");
    } finally {
      setSongsLoading(false);
    }
  };

  // Toggle song selection
  const toggleSongSelection = (songId) => {
    setSelectedSongs(prev => {
      if (prev.includes(songId)) {
        return prev.filter(id => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  // Create playlist with selected songs
  const handleCreatePlaylist = async () => {
    if (selectedSongs.length === 0) {
      Alert.alert("Error", "Please select at least one song");
      return;
    }

    try {
      // Get full song objects for selected IDs
      const playlistSongs = moodSongs.filter(song => selectedSongs.includes(song.id));
      
      // Create playlist object
      const newPlaylist = {
        name: playlistName,
        description: `A playlist with ${selectedMood.name.toLowerCase()} music for mood enhancement.`,
        songs: playlistSongs,
        mood: selectedMood.id,
        createdAt: new Date().toISOString(),
      };
      
      // Save playlist
      const savedPlaylist = await savePlaylist(newPlaylist);
      
      // Log activity
      await logActivity(ACTIVITY_TYPES.PLAYLIST_CREATED, {
        id: savedPlaylist.id,
        name: savedPlaylist.name,
        songCount: savedPlaylist.songs.length,
        mood: selectedMood.id
      });
      
      // Show success message and navigate back
      Alert.alert(
        "Success", 
        `"${playlistName}" playlist created successfully!`, 
        [{ text: "OK", onPress: () => router.push("/playlists") }]
      );
    } catch (error) {
      console.error("Error creating mood playlist:", error);
      Alert.alert("Error", "Failed to create playlist. Please try again.");
    }
  };

  // Render a mood category item
  const renderMoodItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.moodItem,
        selectedMood?.id === item.id && styles.selectedMoodItem
      ]}
      onPress={() => handleMoodSelect(item)}
    >
      <View style={[styles.moodIconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={30} color="#FFFFFF" />
      </View>
      <ThemedText style={styles.moodName}>{item.name}</ThemedText>
      <ThemedText style={styles.moodDescription}>{item.description}</ThemedText>
    </TouchableOpacity>
  );

  // Render a song item
  const renderSongItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.songItem,
        selectedSongs.includes(item.id) && styles.selectedSongItem
      ]}
      onPress={() => toggleSongSelection(item.id)}
    >
      <View style={styles.songInfo}>
        <ThemedText style={styles.songTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.artistName}>{item.artist}</ThemedText>
      </View>
      <Ionicons 
        name={selectedSongs.includes(item.id) ? "checkmark-circle" : "ellipse-outline"} 
        size={24} 
        color={selectedSongs.includes(item.id) ? "#4A90E2" : "#999"} 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Choose a Mood</ThemedText>
        <ThemedText style={styles.subtitle}>
          Select a mood to find songs that match that emotional state
        </ThemedText>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <ThemedText style={styles.loadingText}>Loading moods...</ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {/* Mood Selection */}
          <View style={styles.moodsContainer}>
            <FlatList
              data={availableMoods}
              renderItem={renderMoodItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodsList}
            />
          </View>

          {/* Songs List (when mood is selected) */}
          {selectedMood && (
            <View style={styles.songsSection}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>
                  {selectedMood.name} Songs
                </ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  Select songs to add to your playlist
                </ThemedText>
              </View>

              {songsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4A90E2" />
                  <ThemedText style={styles.loadingText}>Loading songs...</ThemedText>
                </View>
              ) : moodSongs.length === 0 ? (
                <View style={styles.emptySongs}>
                  <Ionicons name="musical-notes-outline" size={48} color="#CCCCCC" />
                  <ThemedText style={styles.emptyText}>
                    No songs available for this mood
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.songsList}>
                  {moodSongs.map(song => (
                    <TouchableOpacity 
                      key={`song-${song.id}`}
                      style={[
                        styles.songItem,
                        selectedSongs.includes(song.id) && styles.selectedSongItem
                      ]}
                      onPress={() => toggleSongSelection(song.id)}
                    >
                      <View style={styles.songInfo}>
                        <ThemedText style={styles.songTitle}>{song.title}</ThemedText>
                        <ThemedText style={styles.artistName}>{song.artist}</ThemedText>
                      </View>
                      <Ionicons 
                        name={selectedSongs.includes(song.id) ? "checkmark-circle" : "ellipse-outline"} 
                        size={24} 
                        color={selectedSongs.includes(song.id) ? "#4A90E2" : "#999"} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {moodSongs.length > 0 && (
                <TouchableOpacity 
                  style={[
                    styles.createButton,
                    selectedSongs.length === 0 && styles.disabledButton
                  ]}
                  onPress={handleCreatePlaylist}
                  disabled={selectedSongs.length === 0}
                >
                  <ThemedText style={styles.createButtonText}>
                    Create {selectedMood.name} Playlist ({selectedSongs.length} songs)
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  moodsContainer: {
    padding: 20,
  },
  moodsList: {
    paddingRight: 20,
  },
  moodItem: {
    width: 160,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedMoodItem: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  moodIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  moodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  moodDescription: {
    fontSize: 12,
    color: '#666666',
  },
  songsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  emptySongs: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 10,
  },
  songsList: {
    marginTop: 10,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  selectedSongItem: {
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
    borderColor: '#4A90E2',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  artistName: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#A5C8F1',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 