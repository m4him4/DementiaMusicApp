import { View, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "./ThemedText"
import ThemedView from "./ThemedView"

const PlaylistItem = ({ item, onPress, isPlaying = false, showPlayButton = true, onPlayPress, onOptionsPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.container}>
        {item.artwork ? (
          <Image source={{ uri: item.artwork }} style={styles.artwork} />
        ) : (
          <View style={styles.defaultArtwork}>
            <Ionicons name="musical-note" size={30} color="#4A90E2" />
          </View>
        )}

        <View style={styles.infoContainer}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {item.title || "Unknown Title"}
          </ThemedText>
          <ThemedText style={styles.subtitle} numberOfLines={1}>
            {item.artist || "Unknown Artist"}
          </ThemedText>
          {item.duration && <ThemedText style={styles.duration}>{item.duration}</ThemedText>}
        </View>

        <View style={styles.buttonsContainer}>
          {showPlayButton && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={(e) => {
                e.stopPropagation()
                onPlayPress && onPlayPress(item)
              }}
            >
              <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={36} color="#4A90E2" />
            </TouchableOpacity>
          )}

          {onOptionsPress && (
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={(e) => {
                e.stopPropagation()
                onOptionsPress(item)
              }}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#777" />
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  defaultArtwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
  duration: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    marginRight: 8,
  },
  optionsButton: {
    padding: 4,
  },
})

export default PlaylistItem
