import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { getMemory, saveMemory, logActivity, ACTIVITY_TYPES, getSongs } from '@/utils/storage';

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

export default function EditMemoryScreen() {
  const { memoryId } = useLocalSearchParams();
  const router = useRouter();
  
  const [memory, setMemory] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For memory tagging
  const [songTags, setSongTags] = useState({});
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [currentSongId, setCurrentSongId] = useState(null);

  useEffect(() => {
    if (!memoryId) {
      Alert.alert("Error", "Memory ID is missing");
      router.back();
      return;
    }
    
    loadMemory();
  }, [memoryId, router]);

  const loadMemory = async () => {
    try {
      setIsSubmitting(true);
      const memoryData = await getMemory(memoryId);
      
      if (!memoryData) {
        Alert.alert("Error", "Memory not found");
        router.back();
        return;
      }
      
      setMemory(memoryData);
      setTitle(memoryData.title || '');
      setDate(memoryData.date || '');
      setDescription(memoryData.description || '');
      
      // Set selected songs
      const songIds = memoryData.songs.map(song => song.id);
      setSelectedSongs(songIds);
      
      // Initialize song tags from memory data
      const initialTags = {};
      memoryData.songs.forEach(song => {
        if (song.memoryTags && song.memoryTags.length > 0) {
          initialTags[song.id] = song.memoryTags.map(tag => tag.id || tag);
        } else {
          initialTags[song.id] = [];
        }
      });
      setSongTags(initialTags);
      
    } catch (error) {
      console.error("Error loading memory:", error);
      Alert.alert("Error", "Failed to load memory data");
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

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
      
      // Create the updated memory object
      const updatedMemory = {
        ...memory, // Keep original data like ID and creation date
        id: memory.id, // Ensure ID is preserved
        title: title.trim(),
        date: date.trim(),
        description: description.trim(),
        songs: songs,
        updatedAt: new Date().toISOString(),
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
      
      console.log('Updating memory with tags:', JSON.stringify(updatedMemory.tagsSummary));
      
      // Save to storage
      const savedMemory = await saveMemory(updatedMemory);
      
      // Log the activity
      await logActivity(ACTIVITY_TYPES.MEMORY_UPDATED, {
        id: savedMemory.id,
        title: savedMemory.title,
        songCount: savedMemory.songs.length,
        hasTags: Object.keys(songTags).length > 0,
        tagCount: Object.values(songTags).reduce((count, tags) => count + tags.length, 0)
      });
      
      // Show success message
      Alert.alert(
        "Success", 
        "Memory updated successfully!", 
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error updating memory:", error);
      Alert.alert("Error", "Failed to update memory. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <ThemedText style={styles.loadingText}>Saving memory...</ThemedText>
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
          <ThemedText style={styles.title}>Edit Memory</ThemedText>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.saveButtonText}>
              {isSubmitting ? "Saving..." : "Update Memory"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentContainer}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Title</ThemedText>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter memory title"
              placeholderTextColor="#999"
              maxLength={100}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Date/Time Period</ThemedText>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="Enter date or time period"
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
              placeholder="Enter memory description"
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          <ThemedText style={styles.sectionHeader}>Edit Songs & Memory Tags</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Select songs and add memory tags to each song
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

          {memory?.audioUri ? (
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Audio Recording</ThemedText>
              <View style={styles.audioContainer}>
                <Ionicons name="musical-note" size={24} color="#4A90E2" />
                <ThemedText style={styles.audioText}>Audio recording attached</ThemedText>
                <ThemedText style={styles.audioNote}>(Audio cannot be modified)</ThemedText>
              </View>
            </View>
          ) : null}

          {memory?.images && memory.images.length > 0 ? (
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Images</ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.imagesContainer}
              >
                {memory.images.map((imageUri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                  </View>
                ))}
              </ScrollView>
              <ThemedText style={styles.imageNote}>(Images cannot be modified)</ThemedText>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

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
    color: '#000',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
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
    color: '#000',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    minHeight: 120,
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
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  audioText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  audioNote: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  imageContainer: {
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: 100,
    height: 100,
  },
  imageNote: {
    fontSize: 12,
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
    color: '#333',
  },
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