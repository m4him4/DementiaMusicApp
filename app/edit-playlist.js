import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { getPlaylist, updatePlaylist, getSongs, logActivity, ACTIVITY_TYPES } from '@/utils/storage';

export default function EditPlaylistScreen() {
  const { playlistId } = useLocalSearchParams();
  const router = useRouter();
  
  const [playlist, setPlaylist] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allSongs, setAllSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playlistId) {
      setError('No playlist ID provided');
      setLoading(false);
      return;
    }
    
    loadPlaylistAndSongs();
  }, [playlistId]);

  const loadPlaylistAndSongs = async () => {
    try {
      setLoading(true);
      
      // Load playlist data
      const playlistData = await getPlaylist(playlistId);
      
      if (!playlistData) {
        setError('Playlist not found');
        return;
      }
      
      setPlaylist(playlistData);
      setName(playlistData.name || '');
      setDescription(playlistData.description || '');
      
      // Store the initial selected songs
      setSelectedSongs(playlistData.songs || []);
      
      // Load all available songs
      const songsData = await getSongs();
      setAllSongs(songsData || []);
      
      setError(null);
    } catch (err) {
      console.error('Error loading playlist:', err);
      setError('Failed to load playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Playlist name is required');
      return;
    }

    try {
      setSaving(true);
      
      const updatedPlaylist = {
        ...playlist,
        name: name.trim(),
        description: description.trim(),
        songs: selectedSongs,
        dateModified: new Date().toISOString()
      };
      
      await updatePlaylist(updatedPlaylist);
      
      // Log the activity
      await logActivity(ACTIVITY_TYPES.PLAYLIST_EDITED, {
        id: playlistId,
        name: name.trim()
      });
      
      Alert.alert(
        'Success',
        'Playlist updated successfully',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Error updating playlist:', error);
      Alert.alert('Error', 'Failed to update playlist. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSongSelection = (songId) => {
    setSelectedSongs(prevSelected => {
      if (prevSelected.includes(songId)) {
        return prevSelected.filter(id => id !== songId);
      } else {
        return [...prevSelected, songId];
      }
    });
  };

  const renderSongItem = ({ item }) => {
    const isSelected = selectedSongs.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.songItem, isSelected && styles.selectedSongItem]}
        onPress={() => toggleSongSelection(item.id)}
      >
        <View style={styles.songInfo}>
          <ThemedText style={styles.songTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.songArtist}>{item.artist}</ThemedText>
        </View>
        <Ionicons 
          name={isSelected ? "checkmark-circle" : "checkmark-circle-outline"} 
          size={24} 
          color={isSelected ? "#4A90E2" : "#999"}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <ThemedText style={styles.loadingText}>Loading playlist...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Error</ThemedText>
          <View style={styles.placeholderRight} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={loadPlaylistAndSongs}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Edit Playlist</ThemedText>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <ThemedText style={styles.saveButtonText}>Save</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentContainer}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Name</ThemedText>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter playlist name"
              placeholderTextColor="#999"
              maxLength={100}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter playlist description"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Songs</ThemedText>
            <ThemedText style={styles.songSelectionHelp}>
              Tap songs to add or remove them from the playlist
            </ThemedText>
            
            <View style={styles.songsContainer}>
              {allSongs.length > 0 ? (
                <FlatList
                  data={allSongs}
                  renderItem={renderSongItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  nestedScrollEnabled={true}
                />
              ) : (
                <ThemedText style={styles.noSongsText}>
                  No songs available in the library
                </ThemedText>
              )}
            </View>
            
            <View style={styles.selectionSummary}>
              <ThemedText style={styles.selectionCount}>
                {selectedSongs.length} song{selectedSongs.length !== 1 ? 's' : ''} selected
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeholderRight: {
    width: 50,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
  },
  songsContainer: {
    marginTop: 8,
  },
  songSelectionHelp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSongItem: {
    backgroundColor: '#E8F1FD',
    borderColor: '#4A90E2',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectionSummary: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  selectionCount: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  noSongsText: {
    padding: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 