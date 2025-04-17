import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text, ScrollView, FlatList, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { REACTION_TYPES } from '../utils/storage';

const reactionTypes = [
  {
    id: 'happy',
    label: 'Happy',
    icon: 'happy-outline',
    description: 'Smiled, laughed, or showed joy',
    color: '#4CAF50', // Green
  },
  {
    id: 'calm',
    label: 'Calm',
    icon: 'water-outline',
    description: 'Appeared relaxed or soothed',
    color: '#2196F3', // Blue
  },
  {
    id: 'nostalgic',
    label: 'Nostalgic',
    icon: 'hourglass-outline',
    description: 'Showed recognition or reminisced',
    color: '#9C27B0', // Purple
  },
  {
    id: 'neutral',
    label: 'Neutral',
    icon: 'remove-outline',
    description: 'No significant change in behavior',
    color: '#607D8B', // Blue grey
  },
  {
    id: 'sad',
    label: 'Sad',
    icon: 'sad-outline',
    description: 'Appeared upset or tearful',
    color: '#2196F3', // Blue
  },
  {
    id: 'agitated',
    label: 'Agitated',
    icon: 'flash-outline',
    description: 'Showed signs of distress or irritation',
    color: '#F44336', // Red
  },
  {
    id: 'no_response',
    label: 'No Response',
    icon: 'remove-circle-outline',
    description: 'Did not show any visible reaction',
    color: '#9E9E9E', // Grey
  },
];

const ReactionSelector = ({ isVisible, onClose, onSelect = () => {} }) => {
  const handleSelect = (item) => {
    try {
      if (typeof onSelect === 'function') {
        onSelect(item);
      } else {
        console.warn('ReactionSelector: onSelect is not a function');
        Alert.alert('Error', 'Could not save reaction. Please try again.');
      }
      onClose();
    } catch (error) {
      console.error('Error in ReactionSelector:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>Select Patient Reaction</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={reactionTypes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.reactionButton}
                onPress={() => handleSelect(item)}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={22} color="white" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.reactionLabel}>{item.label}</Text>
                  <Text style={styles.reactionDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '75%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  reactionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  reactionDescription: {
    fontSize: 14,
    color: '#666666',
  },
});

export default ReactionSelector; 