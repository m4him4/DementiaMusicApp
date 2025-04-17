"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Ionicons } from "@expo/vector-icons"
import { getActivityLogs, ACTIVITY_TYPES } from "@/utils/storage"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function LogsScreen() {
  const router = useRouter()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all") // 'all', 'playlists', 'memories', 'reactions', 'notes'
  const [isCaregiverMode, setIsCaregiverMode] = useState(false)

  // Load caregiver mode setting
  useEffect(() => {
    const loadCaregiverMode = async () => {
      try {
        const value = await AsyncStorage.getItem("@caregiver_mode")
        setIsCaregiverMode(value === "true")
      } catch (error) {
        console.error("Error loading caregiver mode:", error)
      }
    }

    loadCaregiverMode()
  }, [])

  const loadLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const allLogs = await getActivityLogs(100)
      setLogs(allLogs)
    } catch (err) {
      console.error("Error loading logs:", err)
      setError("Could not load activity logs. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load logs on initial render
  useEffect(() => {
    loadLogs()
  }, [])

  // Reload logs whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadLogs()
    }, []),
  )

  // Add debugging to check for reaction logs
  useEffect(() => {
    // Filter to see if any reaction logs exist
    const reactionLogs = logs.filter((log) => log.activityType === ACTIVITY_TYPES.REACTION_RECORDED)
    console.log(`Found ${reactionLogs.length} reaction logs in total logs`)

    // Check if they're passing through the filter
    if (filter === "all" || filter === "reactions") {
      const filteredReactionLogs = filterLogs(logs).filter(
        (log) => log.activityType === ACTIVITY_TYPES.REACTION_RECORDED,
      )
      console.log(`Found ${filteredReactionLogs.length} reaction logs after filtering`)
    }
  }, [logs, filter])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadLogs()
  }

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case ACTIVITY_TYPES.PLAYLIST_CREATED:
        return { name: "add-circle", color: "#4caf50" }
      case ACTIVITY_TYPES.PLAYLIST_UPDATED:
        return { name: "create", color: "#2196f3" }
      case ACTIVITY_TYPES.PLAYLIST_DELETED:
        return { name: "trash", color: "#f44336" }
      case ACTIVITY_TYPES.PLAYLIST_PLAYED:
        return { name: "play-circle", color: "#4A90E2" }
      case ACTIVITY_TYPES.MEMORY_CREATED:
        return { name: "add-circle", color: "#4caf50" }
      case ACTIVITY_TYPES.MEMORY_UPDATED:
        return { name: "create", color: "#2196f3" }
      case ACTIVITY_TYPES.MEMORY_DELETED:
        return { name: "trash", color: "#f44336" }
      case ACTIVITY_TYPES.MEMORY_PLAYED:
        return { name: "play-circle", color: "#4A90E2" }
      case ACTIVITY_TYPES.SONG_PLAYED:
        return { name: "musical-note", color: "#9c27b0" }
      case ACTIVITY_TYPES.REACTION_RECORDED:
        return { name: "happy", color: "#FF9800" }
      case ACTIVITY_TYPES.CAREGIVER_NOTE_ADDED:
        return { name: "document-text", color: "#009688" }
      case ACTIVITY_TYPES.TAG_UPDATED:
        return { name: "pricetag", color: "#795548" }
      default:
        return { name: "time", color: "#757575" }
    }
  }

  const getActivityText = (log) => {
    const { activityType, details } = log
    switch (activityType) {
      case ACTIVITY_TYPES.PLAYLIST_CREATED:
        return `Created playlist "${details.name}"`
      case ACTIVITY_TYPES.PLAYLIST_UPDATED:
        return `Updated playlist "${details.name}"`
      case ACTIVITY_TYPES.PLAYLIST_DELETED:
        return `Deleted playlist "${details.name}"`
      case ACTIVITY_TYPES.PLAYLIST_PLAYED:
        return `Played playlist "${details.name}"`
      case ACTIVITY_TYPES.MEMORY_CREATED:
        return `Created memory "${details.title}"`
      case ACTIVITY_TYPES.MEMORY_UPDATED:
        return `Updated memory "${details.title}"`
      case ACTIVITY_TYPES.MEMORY_DELETED:
        return `Deleted memory "${details.title}"`
      case ACTIVITY_TYPES.MEMORY_PLAYED:
        return `Recalled memory "${details.title}"`
      case ACTIVITY_TYPES.SONG_PLAYED:
        return `Played song "${details.title}" by ${details.artist}`
      case ACTIVITY_TYPES.REACTION_RECORDED:
        return `Patient reaction to "${details.songTitle}": ${details.reactionLabel}`
      case ACTIVITY_TYPES.CAREGIVER_NOTE_ADDED:
        return `Added note for "${details.songTitle}"`
      case ACTIVITY_TYPES.TAG_UPDATED:
        return `Updated memory tag for "${details.songTitle}"`
      default:
        return "Unknown activity"
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const filterLogs = (logs) => {
    if (filter === "all") return logs
    if (filter === "playlists") {
      return logs.filter((log) => log.activityType.startsWith("playlist_"))
    }
    if (filter === "memories") {
      return logs.filter((log) => log.activityType.startsWith("memory_"))
    }
    if (filter === "songs") {
      return logs.filter((log) => log.activityType === ACTIVITY_TYPES.SONG_PLAYED)
    }
    if (filter === "reactions") {
      return logs.filter((log) => log.activityType === ACTIVITY_TYPES.REACTION_RECORDED)
    }
    if (filter === "notes") {
      return logs.filter((log) => log.activityType === ACTIVITY_TYPES.CAREGIVER_NOTE_ADDED)
    }
    return logs
  }

  const filteredLogs = filterLogs(logs)

  // Add a function to map reaction ID to valid Ionicons
  const getReactionIcon = (reactionId) => {
    const iconMap = {
      happy: "happy-outline",
      calm: "water-outline",
      nostalgic: "hourglass-outline",
      neutral: "remove-outline",
      sad: "sad-outline",
      agitated: "flash-outline",
      no_response: "remove-circle-outline",
    }

    return iconMap[reactionId] || "happy-outline"
  }

  const renderLogItem = ({ item: log }) => {
    const icon = getActivityIcon(log.activityType)
    const isCaregiverLog =
      log.activityType === ACTIVITY_TYPES.REACTION_RECORDED ||
      log.activityType === ACTIVITY_TYPES.CAREGIVER_NOTE_ADDED ||
      log.activityType === ACTIVITY_TYPES.TAG_UPDATED

    return (
      <ThemedView style={[styles.logItem, isCaregiverLog && styles.caregiverLogItem]}>
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>
        <View style={styles.logInfo}>
          <ThemedText style={styles.logText}>{getActivityText(log)}</ThemedText>
          <ThemedText style={styles.logDate}>{formatDate(log.timestamp)}</ThemedText>

          {/* Show additional details for caregiver logs */}
          {isCaregiverMode && log.activityType === ACTIVITY_TYPES.REACTION_RECORDED && (
            <View style={styles.reactionDetails}>
              <Ionicons name={getReactionIcon(log.details.reaction || "neutral")} size={22} color="#FF9800" />
              <ThemedText style={styles.reactionText}>
                Patient showed {log.details.reactionLabel?.toLowerCase() || "neutral"} response
              </ThemedText>
            </View>
          )}

          {isCaregiverMode && log.activityType === ACTIVITY_TYPES.CAREGIVER_NOTE_ADDED && (
            <View style={styles.noteDetails}>
              <ThemedText style={styles.noteTitle}>Caregiver Note:</ThemedText>
              <ThemedText style={styles.noteText}>{log.details.note || "No details provided"}</ThemedText>
            </View>
          )}

          {isCaregiverMode && log.activityType === ACTIVITY_TYPES.SONG_PLAYED && (
            <View style={styles.songDetails}>
              <TouchableOpacity
                style={styles.addReactionButton}
                onPress={() =>
                  router.push({
                    pathname: "/player",
                    params: { songId: log.details.id },
                  })
                }
              >
                <Ionicons name="play-circle" size={18} color="#4A90E2" />
                <ThemedText style={styles.addReactionText}>Play Again</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ThemedView>
    )
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={64} color="#ccc" />
      <ThemedText style={styles.emptyText}>No activity logs yet</ThemedText>
      <ThemedText style={styles.emptySubtext}>Your activity will be recorded as you use the app</ThemedText>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Activity Logs</ThemedText>
            <View style={styles.backButtonPlaceholder} />
          </View>
        </View>

        {isCaregiverMode && (
          <View style={styles.caregiverBanner}>
            <Ionicons name="medical" size={18} color="#fff" />
            <ThemedText style={styles.caregiverBannerText}>Caregiver Insights Mode</ThemedText>
          </View>
        )}

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContentContainer}
          >
            <TouchableOpacity
              style={[styles.filterButton, filter === "all" && styles.activeFilter]}
              onPress={() => setFilter("all")}
            >
              <Ionicons name="apps" size={16} color={filter === "all" ? "#fff" : "#555"} style={styles.filterIcon} />
              <ThemedText style={[styles.filterText, filter === "all" && styles.activeFilterText]}>All</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "playlists" && styles.activeFilter]}
              onPress={() => setFilter("playlists")}
            >
              <Ionicons
                name="list"
                size={16}
                color={filter === "playlists" ? "#fff" : "#555"}
                style={styles.filterIcon}
              />
              <ThemedText style={[styles.filterText, filter === "playlists" && styles.activeFilterText]}>
                Playlists
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "memories" && styles.activeFilter]}
              onPress={() => setFilter("memories")}
            >
              <Ionicons
                name="heart"
                size={16}
                color={filter === "memories" ? "#fff" : "#555"}
                style={styles.filterIcon}
              />
              <ThemedText style={[styles.filterText, filter === "memories" && styles.activeFilterText]}>
                Memories
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "songs" && styles.activeFilter]}
              onPress={() => setFilter("songs")}
            >
              <Ionicons
                name="musical-note"
                size={16}
                color={filter === "songs" ? "#fff" : "#555"}
                style={styles.filterIcon}
              />
              <ThemedText style={[styles.filterText, filter === "songs" && styles.activeFilterText]}>Songs</ThemedText>
            </TouchableOpacity>

            {isCaregiverMode && (
              <>
                <TouchableOpacity
                  style={[styles.filterButton, filter === "reactions" && styles.activeFilter]}
                  onPress={() => setFilter("reactions")}
                >
                  <Ionicons
                    name="happy"
                    size={16}
                    color={filter === "reactions" ? "#fff" : "#555"}
                    style={styles.filterIcon}
                  />
                  <ThemedText style={[styles.filterText, filter === "reactions" && styles.activeFilterText]}>
                    Reactions
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, filter === "notes" && styles.activeFilter]}
                  onPress={() => setFilter("notes")}
                >
                  <Ionicons
                    name="document-text"
                    size={16}
                    color={filter === "notes" ? "#fff" : "#555"}
                    style={styles.filterIcon}
                  />
                  <ThemedText style={[styles.filterText, filter === "notes" && styles.activeFilterText]}>
                    Notes
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>

        <View style={styles.container}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <ThemedText style={styles.loadingText}>Loading activity logs...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#f44336" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <TouchableOpacity style={styles.retryButton} onPress={loadLogs}>
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <Ionicons name="time" size={20} color="#4A90E2" />
                  <ThemedText style={styles.statValue}>{logs.length}</ThemedText>
                  <ThemedText style={styles.statLabel}>Total Activities</ThemedText>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="musical-notes" size={20} color="#9c27b0" />
                  <ThemedText style={styles.statValue}>
                    {logs.filter((log) => log.activityType === ACTIVITY_TYPES.SONG_PLAYED).length}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Songs Played</ThemedText>
                </View>

                {isCaregiverMode && (
                  <View style={styles.statCard}>
                    <Ionicons name="happy" size={20} color="#FF9800" />
                    <ThemedText style={styles.statValue}>
                      {logs.filter((log) => log.activityType === ACTIVITY_TYPES.REACTION_RECORDED).length}
                    </ThemedText>
                    <ThemedText style={styles.statLabel}>Reactions</ThemedText>
                  </View>
                )}
              </View>

              <FlatList
                data={filteredLogs}
                renderItem={renderLogItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyList}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4A90E2"]} />}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#4A90E2",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  caregiverBanner: {
    backgroundColor: "#3672E9",
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  caregiverBannerText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  filterContentContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  activeFilter: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  logItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  caregiverLogItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  logInfo: {
    flex: 1,
  },
  logText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#222222",
    lineHeight: 20,
  },
  logDate: {
    fontSize: 12,
    color: "#777",
    marginBottom: 8,
  },
  reactionDetails: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.2)",
  },
  reactionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginLeft: 10,
  },
  noteDetails: {
    backgroundColor: "rgba(0, 150, 136, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "rgba(0, 150, 136, 0.2)",
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#007A6E",
  },
  noteText: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
    lineHeight: 20,
  },
  songDetails: {
    marginTop: 8,
    flexDirection: "row",
  },
  addReactionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 144, 226, 0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
  },
  addReactionText: {
    fontSize: 13,
    color: "#4A90E2",
    fontWeight: "600",
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#555",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
})
