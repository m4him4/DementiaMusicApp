import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ActivityLogScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Log</Text>
      <ScrollView style={styles.logContainer}>
        <View style={styles.logEntry}>
          <Text style={styles.date}>Today, 2:30 PM</Text>
          <Text style={styles.activity}>Listened to "Moon River"</Text>
          <Text style={styles.mood}>Mood: Calm and relaxed</Text>
          <Text style={styles.notes}>Notes: Smiled and hummed along</Text>
        </View>
        <View style={styles.logEntry}>
          <Text style={styles.date}>Today, 11:15 AM</Text>
          <Text style={styles.activity}>Memory Session: Wedding Songs</Text>
          <Text style={styles.mood}>Mood: Happy, engaged</Text>
          <Text style={styles.notes}>Notes: Shared stories about wedding day</Text>
        </View>
        <View style={styles.logEntry}>
          <Text style={styles.date}>Yesterday, 4:45 PM</Text>
          <Text style={styles.activity}>Listened to "What a Wonderful World"</Text>
          <Text style={styles.mood}>Mood: Peaceful</Text>
          <Text style={styles.notes}>Notes: Dozed off peacefully</Text>
        </View>
      </ScrollView>
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
  logContainer: {
    flex: 1,
  },
  logEntry: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  activity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  mood: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 5,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ActivityLogScreen; 