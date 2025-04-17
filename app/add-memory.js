import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { saveMemory, logActivity, ACTIVITY_TYPES, getSongs } from '@/utils/storage';

// Memory tag options
const MEMORY_TAGS = [
  { id: 'wedding', label: 'Wedding Day', icon: 'heart' },
  { id: 'childhood', label: 'Childhood', icon: 'bicycle' },
  { id: 'favorite', label: 'Favorite Song', icon: 'star' },
  { id: 'family', label: 'Family Moments', icon: 'people' },
  { id: 'holiday', label: 'Holiday Memory', icon: 'airplane' },
  { id: 'spiritual', label: 'Spiritual Moment', icon: 'flower' },
  { id: 'achievement', label: 'Achievement', icon: 'trophy' },
  { id: 'travel', label: 'Travel Memory', icon: 'map' },
];

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

export default function AddMemoryScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For memory tagging
  const [songTags, setSongTags] = useState({});
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [currentSongId, setCurrentSongId] = useState(null);

  const toggleSongSelection = (id) => {
    setSelectedSongs(prev => {
      if (prev.includes(id)) {
        // If unselecting a song, remove its tags
        const newSongTags = {...songTags};
        delete newSongTags[id];
        setSongTags(newSongTags);
        
        return prev.filter(songId => songId !== id);
      } else {
        // Initialize empty tags array for this song
        setSongTags(prev => ({...prev, [id]: []}));
        return [...prev, id];
      }
    });
  };

  const openTagModal = (songId) => {
    setCurrentSongId(songId);
    setTagModalVisible(true);
  };

  const toggleTag = (tagId) => {
    setSongTags(prev => {
      const currentTags = prev[currentSongId] || [];
      
      if (currentTags.includes(tagId)) {
        // Remove tag if already selected
        return {
          ...prev, 
          [currentSongId]: currentTags.filter(id => id !== tagId)
        };
      } else {
        // Add tag if not selected
        return {
          ...prev,
          [currentSongId]: [...currentTags, tagId]
        };
      }
    });
  };

  const getTagsForSong = (songId) => {
    const tags = songTags[songId] || [];
    if (tags.length === 0) return "No tags";
    
    return tags.map(tagId => {
      const tag = MEMORY_TAGS.find(t => t.id === tagId);
      return tag ? tag.label : '';
    }).join(", ");
  };

  const handleSave = async () => {
    // Basic validation
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a memory title");
      return;
    }
    
    if (selectedSongs.length === 0) {
      Alert.alert("Error", "Please select at least one song");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get the full song objects for selected song IDs and add their tags
      const songs = realSongs
        .filter(song => selectedSongs.includes(song.id))
        .map(song => {
          // Convert tag IDs to full tag objects with all information
          const songTagIds = songTags[song.id] || [];
          const fullTags = songTagIds.map(tagId => {
            const tagInfo = MEMORY_TAGS.find(t => t.id === tagId);
            return tagInfo || { id: tagId, label: tagId };
          });
          
          return {
            ...song,
            memoryTags: fullTags
          };
        });
      
      // Create the memory object
      const newMemory = {
        title: title.trim(),
        date: date.trim(),
        description: description.trim(),
        songs: songs,
        createdAt: new Date().toISOString(),
        // Add a summary of tags for easier display
        tagsSummary: Object.entries(songTags)
          .filter(([_, tags]) => tags.length > 0)
          .map(([songId, tags]) => {
            const song = realSongs.find(s => s.id === songId);
            return {
              songId,
              songTitle: song ? song.title : 'Unknown Song',
              tags: tags.map(tagId => {
                const tag = MEMORY_TAGS.find(t => t.id === tagId);
                return tag ? tag.label : tagId;
              })
            };
          })
      };
      
      console.log('Saving memory with tags:', JSON.stringify(newMemory.tagsSummary));
      
      // Save to storage
      const savedMemory = await saveMemory(newMemory);
      
      // Log the activity
      await logActivity(ACTIVITY_TYPES.MEMORY_CREATED, {
        id: savedMemory.id,
        title: savedMemory.title,
        songCount: savedMemory.songs.length,
        hasTags: Object.keys(songTags).length > 0,
        tagCount: Object.values(songTags).reduce((count, tags) => count + tags.length, 0)
      });
      
      // Show success message
      Alert.alert(
        "Success", 
        "Memory saved successfully!", 
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error saving memory:", error);
      Alert.alert("Error", "Failed to save memory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.form}>
        <ThemedText style={styles.label}>Memory Title</ThemedText>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Wedding Day, Childhood Home"
          placeholderTextColor="#777"
          color="#222"
        />

        <ThemedText style={styles.label}>Date/Time Period</ThemedText>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="e.g. 1965, 1950s, Summer 1972"
          placeholderTextColor="#777"
          color="#222"
        />

        <ThemedText style={styles.label}>Description</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe this memory..."
          placeholderTextColor="#777"
          color="#222"
          multiline
          numberOfLines={4}
        />

        <ThemedText style={styles.sectionHeader}>Select Songs & Add Memory Tags</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          First select songs, then add memory tags to each song
        </ThemedText>
        
        {realSongs.map(song => (
          <View key={song.id} style={styles.songContainer}>
            <TouchableOpacity 
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
            
            {selectedSongs.includes(song.id) && (
              <View style={styles.tagsContainer}>
                <ThemedText style={styles.tagsLabel}>Memory Tags:</ThemedText>
                <ThemedText style={styles.tagsText}>{getTagsForSong(song.id)}</ThemedText>
                <TouchableOpacity 
                  style={styles.addTagButton}
                  onPress={() => openTagModal(song.id)}
                >
                  <ThemedText style={styles.addTagButtonText}>
                    {songTags[song.id]?.length > 0 ? "Edit Tags" : "Add Tags"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity 
          style={[
            styles.saveButton, 
            (!title || selectedSongs.length === 0 || isSubmitting) ? styles.saveButtonDisabled : null
          ]}
          onPress={handleSave}
          disabled={!title || selectedSongs.length === 0 || isSubmitting}
        >
          <ThemedText style={styles.saveButtonText}>
            {isSubmitting ? "Saving..." : "Save Memory"}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Memory Tags Modal */}
      <Modal
        visible={tagModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTagModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Memory Tags</ThemedText>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setTagModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.tagsList}>
              {MEMORY_TAGS.map(tag => {
                const isSelected = currentSongId && 
                  songTags[currentSongId] && 
                  songTags[currentSongId].includes(tag.id);
                  
                return (
                  <TouchableOpacity 
                    key={tag.id}
                    style={[styles.tagItem, isSelected && styles.selectedTagItem]}
                    onPress={() => toggleTag(tag.id)}
                  >
                    <View style={styles.tagIconContainer}>
                      <Ionicons name={tag.icon} size={20} color={isSelected ? "#FFFFFF" : "#4A90E2"} />
                    </View>
                    <ThemedText style={[styles.tagLabel, isSelected && styles.selectedTagLabel]}>
                      {tag.label}
                    </ThemedText>
                    <Ionicons 
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                      size={22} 
                      color={isSelected ? "#FFFFFF" : "#4A90E2"} 
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => setTagModalVisible(false)}
            >
              <ThemedText style={styles.doneButtonText}>Done</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 10,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
  },
  songContainer: {
    marginBottom: 12,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedSong: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  tagsContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#4A90E2',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 10,
    paddingTop: 5,
  },
  tagsLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  tagsText: {
    fontSize: 13,
    color: '#444',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  addTagButton: {
    backgroundColor: '#E8F1FC',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  addTagButtonText: {
    color: '#4A90E2',
    fontSize: 13,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#A5C8F1',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  closeButton: {
    padding: 5,
  },
  tagsList: {
    padding: 15,
    maxHeight: 400,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#F5F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0ECFF',
  },
  selectedTagItem: {
    backgroundColor: '#4A90E2',
    borderColor: '#3672C0',
  },
  tagIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tagLabel: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
  selectedTagLabel: {
    color: '#FFFFFF',
  },
  doneButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 15,
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 