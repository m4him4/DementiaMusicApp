import { StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "./ThemedText"

const MemoryTag = ({ tag, onPress, onDelete, selected = false, editable = false }) => {
  const getIconName = () => {
    switch (tag.type) {
      case "event":
        return "calendar-outline"
      case "person":
        return "person-outline"
      case "place":
        return "location-outline"
      case "era":
        return "hourglass-outline"
      case "emotion":
        return "heart-outline"
      default:
        return "bookmark-outline"
    }
  }

  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(tag)}
      style={[styles.container, selected && styles.selectedContainer]}
      activeOpacity={0.7}
    >
      <Ionicons name={getIconName()} size={18} color={selected ? "#fff" : "#4A90E2"} style={styles.icon} />

      <ThemedText style={[styles.label, selected && styles.selectedLabel]}>{tag.label}</ThemedText>

      {editable && onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(tag)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="close-circle" size={18} color={selected ? "#fff" : "#777"} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
  },
  selectedContainer: {
    backgroundColor: "#4A90E2",
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A90E2",
  },
  selectedLabel: {
    color: "#fff",
  },
  deleteButton: {
    marginLeft: 6,
  },
})

export default MemoryTag
