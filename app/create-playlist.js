import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { savePlaylist, logActivity, ACTIVITY_TYPES, getSongs } from '@/utils/storage';

// Real songs that match the downloaded files
const realSongs = [
  { id: '1', title: 'What a Wonderful World', artist: 'Louis Armstrong' },
  { id: '2', title: 'Somewhere Over the Rainbow', artist: 'Ronnie Booth' },
  { id: '3', title: 'Moon River', artist: 'JJ Heller' },
  { id: '4', title: 'Calm', artist: 'Victor Thompson' },
  { id: '5', title: 'The Calm', artist: '7 Hills Worship' },
  { id: '6', title: 'Happy', artist: 'Guardian Angel' },
  { id: '7', title: 'Happy Place', artist: 'Esther Oji' },
  { id: '8', title: 'Happy', artist: 'Daphne' },
  { id: '9', title: 'Nostalgic', artist: 'Alvin Cedric' },
  { id: '10', title: 'Relax', artist: 'Christina Shusho' },
  { id: '11', title: 'Relax', artist: 'Marvin Sapp' },
  { id: '12', title: "I'm So Sad", artist: 'Gnash' },
  { id: '13', title: 'Sad', artist: 'BOBO W' },
  { id: '14', title: 'Too Sad To Cry', artist: 'Sasha Sloan' },
  { id: '15', title: 'Let Me Be Sad', artist: 'I Prevail' },
];

export default function CreatePlaylistScreen() {
  const router = useRouter();
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSongSelection = (id) => {
    setSelectedSongs(prev => {
      if (prev.includes(id)) {
        return prev.filter(songId => songId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleCreate = async () => {
    // Basic validation
    if (!playlistName.trim()) {
      Alert.alert("Error", "Please enter a playlist name");
      return;
    }
    
    if (selectedSongs.length === 0) {
      Alert.alert("Error", "Please select at least one song");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get the full song objects for selected song IDs
      const songs = realSongs.filter(song => selectedSongs.includes(song.id));
      
      // Create the playlist object
      const newPlaylist = {
        name: playlistName.trim(),
        description: description.trim(),
        songs: songs,
        createdAt: new Date().toISOString(),
      };
      
      // Save to storage
      const savedPlaylist = await savePlaylist(newPlaylist);
      
      // Log the activity
      await logActivity(ACTIVITY_TYPES.PLAYLIST_CREATED, {
        id: savedPlaylist.id,
        name: savedPlaylist.name,
        songCount: savedPlaylist.songs.length
      });
      
      // Show success message
      Alert.alert(
        "Success", 
        "Playlist created successfully!", 
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error creating playlist:", error);
      Alert.alert("Error", "Failed to create playlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.form}>
        <ThemedText style={styles.label}>Playlist Name</ThemedText>
        <TextInput
          style={styles.input}
          value={playlistName}
          onChangeText={setPlaylistName}
          placeholder="Enter playlist name"
          placeholderTextColor="#777"
        />

        <ThemedText style={styles.label}>Description (optional)</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          placeholderTextColor="#777"
          multiline
          numberOfLines={4}
        />

        <ThemedText style={styles.label}>Select Songs</ThemedText>
        {realSongs.map(song => (
          <TouchableOpacity 
            key={song.id}
            style={[
              styles.songItem,
              selectedSongs.includes(song.id) && styles.selectedSong
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
              color={selectedSongs.includes(song.id) ? "#4A90E2" : "#555"} 
            />
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={[
            styles.createButton, 
            (!playlistName || selectedSongs.length === 0 || isSubmitting) ? styles.createButtonDisabled : null
          ]}
          onPress={handleCreate}
          disabled={!playlistName || selectedSongs.length === 0 || isSubmitting}
        >
          <ThemedText style={styles.createButtonText}>
            {isSubmitting ? "Creating..." : "Create Playlist"}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    color: '#222',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedSong: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  artistName: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  createButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  createButtonDisabled: {
    backgroundColor: '#A5C8F1',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 