import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const MemoryStimulationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Stimulation</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.memoryCard}>
          <Text style={styles.memoryTitle}>Wedding Day</Text>
          <Text style={styles.songCount}>3 songs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.memoryCard}>
          <Text style={styles.memoryTitle}>Childhood Home</Text>
          <Text style={styles.songCount}>5 songs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.memoryCard}>
          <Text style={styles.memoryTitle}>Family Gatherings</Text>
          <Text style={styles.songCount}>4 songs</Text>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add New Memory</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 15,
    paddingBottom: 10,
  },
  memoryCard: {
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
  memoryTitle: {
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

export default MemoryStimulationScreen; 