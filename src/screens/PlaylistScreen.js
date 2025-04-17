import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PlaylistScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Playlists</Text>
      <View style={styles.playlistContainer}>
        <TouchableOpacity style={styles.playlistItem}>
          <Text style={styles.playlistName}>Favorite Songs</Text>
          <Text style={styles.songCount}>12 songs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playlistItem}>
          <Text style={styles.playlistName}>Calming Music</Text>
          <Text style={styles.songCount}>8 songs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playlistItem}>
          <Text style={styles.playlistName}>Childhood Memories</Text>
          <Text style={styles.songCount}>15 songs</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Create New Playlist</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  playlistContainer: {
    flex: 1,
    gap: 15,
  },
  playlistItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  songCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlaylistScreen; 