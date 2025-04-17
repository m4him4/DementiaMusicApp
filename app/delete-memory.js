import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { getMemories, deleteMemory, logActivity, ACTIVITY_TYPES } from '@/utils/storage';
import { formatDateString } from '@/utils/helpers';

export default function DeleteMemoryScreen() {
  const router = useRouter();
  const { memoryId } = useLocalSearchParams();
  
  const [memory, setMemory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the memory data
  useEffect(() => {
    const loadMemory = async () => {
      if (!memoryId) {
        setError("No memory ID provided");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const memories = await getMemories();
        const memory = memories.find(m => m.id === memoryId);
        
        if (memory) {
          setMemory(memory);
        } else {
          setError("Memory not found");
        }
      } catch (err) {
        console.error("Error loading memory:", err);
        setError("Could not load memory. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadMemory();
  }, [memoryId]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Delete the memory
      await deleteMemory(memoryId);
      
      // Log the activity
      await logActivity(ACTIVITY_TYPES.MEMORY_DELETED, {
        id: memoryId,
        title: memory?.title || 'Unknown memory'
      });
      
      // Show success message and navigate back
      Alert.alert(
        "Success", 
        "Memory deleted successfully!", 
        [{ text: "OK", onPress: () => router.push("/memories") }]
      );
    } catch (error) {
      console.error("Error deleting memory:", error);
      Alert.alert("Error", "Failed to delete memory. Please try again.");
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete "${memory?.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDelete }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <ThemedText style={styles.loadingText}>Loading memory...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.returnButton} onPress={() => router.push("/memories")}>
            <ThemedText style={styles.returnButtonText}>Return to Memories</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="warning-outline" size={80} color="#f44336" />
        
        <ThemedText style={styles.title}>Delete Memory</ThemedText>
        
        <ThemedText style={styles.message}>
          You are about to delete the memory "{memory?.title}".
          This action cannot be undone.
        </ThemedText>
        
        <ThemedText style={styles.memoryDetails}>
          Memory details:
        </ThemedText>
        
        <View style={styles.detailsContainer}>
          <ThemedText style={styles.detailLabel}>Title:</ThemedText>
          <ThemedText style={styles.detailValue}>{memory?.title}</ThemedText>
          
          <ThemedText style={styles.detailLabel}>Description:</ThemedText>
          <ThemedText style={styles.detailValue}>{memory?.description || 'No description'}</ThemedText>
          
          <ThemedText style={styles.detailLabel}>Date Created:</ThemedText>
          <ThemedText style={styles.detailValue}>
            {memory?.date ? formatDateString(memory.date) : 'Unknown date'}
          </ThemedText>
          
          {memory?.imageUri && (
            <View style={styles.imageContainer}>
              <ThemedText style={styles.detailLabel}>Image:</ThemedText>
              <Image 
                source={{ uri: memory.imageUri }} 
                style={styles.memoryImage} 
                resizeMode="cover"
              />
            </View>
          )}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.deleteButton, isDeleting ? styles.deleteButtonDisabled : null]}
            onPress={confirmDelete}
            disabled={isDeleting}
          >
            <ThemedText style={styles.deleteButtonText}>
              {isDeleting ? "Deleting..." : "Delete Memory"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    color: '#f44336',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  memoryDetails: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  detailsContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
  imageContainer: {
    marginTop: 8,
  },
  memoryImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 2,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#f8a8a3',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  returnButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  returnButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 