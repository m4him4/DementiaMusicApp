import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DebugScreen() {
  const [welcomeStatus, setWelcomeStatus] = useState('Loading...');

  // Check the current welcome screen status
  const checkWelcomeStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('@has_seen_welcome');
      setWelcomeStatus(value === 'true' ? 'Seen' : 'Not seen');
    } catch (error) {
      console.error('Error checking welcome status:', error);
      setWelcomeStatus('Error checking');
    }
  };

  // Reset the welcome screen status
  const resetWelcome = async () => {
    try {
      await AsyncStorage.removeItem('@has_seen_welcome');
      Alert.alert('Success', 'Welcome screen has been reset. Restart the app to see it.');
      checkWelcomeStatus();
    } catch (error) {
      console.error('Error resetting welcome status:', error);
      Alert.alert('Error', 'Failed to reset welcome screen.');
    }
  };

  // Force set the welcome as seen
  const markWelcomeSeen = async () => {
    try {
      await AsyncStorage.setItem('@has_seen_welcome', 'true');
      Alert.alert('Success', 'Welcome screen has been marked as seen.');
      checkWelcomeStatus();
    } catch (error) {
      console.error('Error setting welcome status:', error);
      Alert.alert('Error', 'Failed to mark welcome as seen.');
    }
  };

  // Go to welcome screen directly
  const goToWelcome = () => {
    router.push('/welcome');
  };

  // Check status when component mounts
  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const navigateToWelcome = () => {
    router.push('/welcome');
  };

  const resetWelcomeFlag = async () => {
    try {
      await AsyncStorage.removeItem('@has_seen_welcome');
      console.log('Welcome flag removed successfully');
      alert('Welcome flag removed. Restart the app to see the welcome screen.');
    } catch (error) {
      console.error('Error removing welcome flag:', error);
      alert('Failed to remove welcome flag');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Debug Tools</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={navigateToWelcome}>
          <Ionicons name="arrow-forward-circle" size={24} color="#fff" />
          <Text style={styles.buttonText}>Navigate to Welcome Screen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={resetWelcomeFlag}>
          <Ionicons name="refresh" size={24} color="#fff" />
          <Text style={styles.buttonText}>Reset Welcome Flag</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Debug Information</Text>
          <Text style={styles.infoText}>
            If the welcome screen is not appearing on startup, try using these
            buttons to navigate directly to it or reset the welcome flag and restart
            the app.
          </Text>
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
  header: {
    backgroundColor: '#3672E9',
    padding: 16,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    padding: 16,
    flex: 1,
  },
  button: {
    backgroundColor: '#3672E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3672E9',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
}); 