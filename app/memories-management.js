"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { ThemedText } from "@/components/ThemedText"
import { getMemories, deleteMemory, logActivity, ACTIVITY_TYPES } from "@/utils/storage"
import { formatDate } from "@/utils/helpers"

export default function MemoriesManagementScreen() {
  const router = useRouter()
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    try {
      setLoading(true)
      const memoriesData = await getMemories()
      setMemories(memoriesData)
      setError(null)
    } catch (err) {
      console.error("Error loading memories:", err)
      setError("Failed to load memories. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditMemory = (memory) => {
    router.push({
      pathname: "/edit-memory",
      params: { memoryId: memory.id },
    })
  }

  const handleDeleteMemory = async (memory) => {
    try {
      await deleteMemory(memory.id)

      // Log the activity
      await logActivity(ACTIVITY_TYPES.MEMORY_DELETED, {
        id: memory.id,
        title: memory.title,
      })

      // Update the memories list
      setMemories(memories.filter((m) => m.id !== memory.id))

      Alert.alert("Success", "Memory deleted successfully")
    } catch (error) {
      console.error("Error deleting memory:", error)
      Alert.alert("Error", "Failed to delete memory. Please try again.")
    }
  }

  const confirmDelete = (memory) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete the memory "${memory.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDeleteMemory(memory) },
      ],
    )
  }

  const renderMemoryItem = ({ item }) => (
    <View style={styles.memoryItem}>
      <View style={styles.memoryContent}>
        <View style={styles.memoryHeader}>
          <ThemedText style={styles.memoryTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.memoryDate}>{formatDate(item.dateCreated)}</ThemedText>
        </View>

        {item.description ? (
          <ThemedText style={styles.memoryDescription} numberOfLines={2}>
            {item.description}
          </ThemedText>
        ) : null}

        <View style={styles.memoryStats}>
          <View style={styles.statItem}>
            <Ionicons name="musical-notes" size={16} color="#4A90E2" />
            <ThemedText style={styles.statText}>{item.songs?.length || 0} songs</ThemedText>
          </View>
          {item.date && (
            <View style={styles.statItem}>
              <Ionicons name="calendar" size={16} color="#4A90E2" />
              <ThemedText style={styles.statText}>{item.date}</ThemedText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditMemory(item)}>
          <Ionicons name="pencil" size={22} color="#4A90E2" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => confirmDelete(item)}
        >
          <Ionicons name="trash-outline" size={22} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Manage Memories</ThemedText>
          <TouchableOpacity style={styles.refreshButton} onPress={loadMemories}>
            <Ionicons name="refresh" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <ThemedText style={styles.loadingText}>Loading memories...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={loadMemories}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : memories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <ThemedText style={styles.emptyText}>No memories found</ThemedText>
            <TouchableOpacity style={styles.createButton} onPress={() => router.push('/add-memory')}>
              <ThemedText style={styles.createButtonText}>Create New Memory</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={memories}
            renderItem={renderMemoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            style={styles.flatListStyle}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30, 
    flexGrow: 1,
  },
  flatListStyle: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  memoryItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  memoryContent: {
    flex: 1,
  },
  memoryHeader: {
    marginBottom: 6,
  },
  memoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memoryDate: {
    fontSize: 14,
    color: '#666',
  },
  memoryDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  memoryStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statText: {
    fontSize: 13,
    color: '#4A90E2',
    marginLeft: 4,
  },
  actionsContainer: {
    justifyContent: 'center',
    marginLeft: 12,
  },
  actionButton: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
    borderRadius: 10,
    alignItems: 'center',
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
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
    marginTop: 16,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
