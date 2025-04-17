import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ThemedText } from "./ThemedText"

const PlaylistCard = ({ playlist, onPress, onPlayPress, onEditPress, onDeletePress }) => {
  const [showOptions, setShowOptions] = useState(false);
  
  // Generate a random gradient from playlist name
  const getBackgroundColor = () => {
    const baseColors = [
      '#4a90e2', // blue
      '#5d42f5', // purple
      '#50b154', // green
      '#f59c42', // orange
      '#e94e77'  // pink
    ];
    
    // Use the playlist id or name to pick a consistent color
    const hash = playlist.id?.charCodeAt(0) || playlist.name?.charCodeAt(0) || 0;
    const index = hash % baseColors.length;
    return baseColors[index];
  };

  const backgroundColor = getBackgroundColor();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View
        style={[styles.gradient, { backgroundColor }]}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="musical-notes" size={22} color="#fff" />
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{playlist.name}</Text>
            {playlist.description ? (
              <Text style={styles.description} numberOfLines={1}>{playlist.description}</Text>
            ) : null}
            <View style={styles.songCountContainer}>
              <Ionicons name="musical-note" size={10} color="#fff" />
              <Text style={styles.songCount}>{playlist.songs?.length || 0} songs</Text>
            </View>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onPlayPress}
            >
              <View style={styles.playIconContainer}>
                <Ionicons name="play" size={18} color={backgroundColor} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowOptions(true)}
            >
              <Ionicons name="ellipsis-vertical" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Options Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.optionsContainer}>
            <View style={styles.optionsHeader}>
              <Text style={styles.optionsTitle}>Playlist Options</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setShowOptions(false);
                onEditPress && onEditPress(playlist);
              }}
            >
              <Ionicons name="create-outline" size={22} color="#4A90E2" />
              <Text style={styles.optionText}>Edit Playlist</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => {
                setShowOptions(false);
                onDeletePress && onDeletePress(playlist);
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#E74C3C" />
              <Text style={[styles.optionText, styles.deleteText]}>Delete Playlist</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, styles.cancelOption]}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    maxHeight: 90,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  songCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songCount: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 6,
  },
  playIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    backgroundColor: '#f9f9f9',
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  optionText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  deleteText: {
    color: '#E74C3C',
  },
  cancelOption: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
  },
});

export default PlaylistCard
