import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from "react-native"
import Slider from "@react-native-community/slider"
import { Ionicons } from "@expo/vector-icons"
import { ThemedView } from "./ThemedView"
import { ThemedText } from "./ThemedText"
import { Audio } from "expo-av"
import audioManager from "../utils/audioManager"
import ReactionSelector from "./ReactionSelector"
import CaregiverNoteInput from "./CaregiverNoteInput"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { logActivity, ACTIVITY_TYPES } from "../utils/storage"

// This is a placeholder version of the MusicPlayer component
// It simulates the UI without actually playing audio
// To enable actual audio playback, install expo-av: npm install expo-av
const MusicPlayer = ({ song, onNext, onPrevious, isPlaying = false, onPlayPauseToggle, showControls = true }) => {
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(100) // Default duration
  const [sound, setSound] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const positionMillis = useRef(0)
  const isDragging = useRef(false)
  
  // Caregiver functionality
  const [showReactionSelector, setShowReactionSelector] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isCaregiverMode, setIsCaregiverMode] = useState(false);
  const [reactionHistory, setReactionHistory] = useState([]);
  const [notes, setNotes] = useState([]);
  
  // Load caregiver mode setting
  useEffect(() => {
    const loadCaregiverMode = async () => {
      try {
        const value = await AsyncStorage.getItem('@caregiver_mode');
        setIsCaregiverMode(value === 'true');
      } catch (error) {
        console.error('Error loading caregiver mode:', error);
      }
    };
    
    loadCaregiverMode();
  }, []);
  
  // Load sound when song changes
  useEffect(() => {
    if (!song) return;
    let isMounted = true;
    
    // First cleanup any existing audio properly
    if (sound) {
      setIsLoaded(false);
      setIsBuffering(true);
      // We'll let audioManager handle the cleanup instead of doing it here
    }
    
    const loadSound = async () => {
      try {
        // Reset state for the new song
        setIsLoaded(false);
        setIsBuffering(true);
        setPosition(0);
        positionMillis.current = 0;
        
        let audioSource = null;
        
        // Determine audio source
        if (song.localFile) {
          audioSource = song.localFile;
        } else if (song.audioUrl) {
          audioSource = { uri: song.audioUrl };
        } else {
          console.warn("No audio source found for song:", song.title);
          setIsBuffering(false);
          return;
        }
        
        // Wait a short delay before loading new audio to ensure previous cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!isMounted) return;
        
        // Use the audioManager to manage playback
        const newSound = await audioManager.playAudio(
          audioSource,
          { shouldPlay: false }, // Don't auto-play until we're sure everything is ready
          onPlaybackStatusUpdate
        );
        
        if (!isMounted) return;
        
        // Wait a short time to ensure sound is properly initialized
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (!isMounted) return;
        
        setSound(newSound);
        setIsBuffering(false);
        setIsLoaded(true);
        
        // Start playback if needed (but with a slight delay to ensure loading is complete)
        if (isPlaying) {
          setTimeout(async () => {
            try {
              if (!isMounted || !newSound) return;
              
              const status = await newSound.getStatusAsync();
              if (status.isLoaded && isMounted) {
                await newSound.playAsync();
                audioManager.isPlaying = true;
              }
            } catch (err) {
              console.error("Error starting playback after load:", err);
            }
          }, 300);
        }
      } catch (error) {
        console.error("Error loading sound", error);
        if (isMounted) {
          setIsBuffering(false);
          setIsLoaded(false);
        }
      }
    };
    
    loadSound();
    
    // Cleanup function to stop audio when component unmounts or song changes
    return () => {
      isMounted = false;
      // We delegate audio cleanup to audioManager
      // This prevents issues when quickly changing songs
      setTimeout(() => {
        if (sound) {
          audioManager.stopAudio().catch(err => {
            console.log("Cleanup warning (non-critical):", err.message);
          });
        }
      }, 50);
    };
  }, [song]);
  
  // Handle playback status updates
  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;
    
    if (status.isPlaying && !isDragging.current) {
      setPosition(status.positionMillis / 1000);
      positionMillis.current = status.positionMillis;
    }
    
    if (status.didJustFinish) {
      // Auto-advance to next track when finished
      onNext && onNext();
    }
    
    if (status.isLoaded && duration === 100) {
      setDuration(status.durationMillis / 1000);
    }
  }
  
  // Play/pause the sound (separate from loading)
  useEffect(() => {
    if (!sound || !isLoaded) return;
    
    const updatePlayback = async () => {
      try {
        // Only proceed if sound is fully loaded
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) {
          console.log("Sound is not fully loaded yet, skipping playback control");
          return;
        }
        
        if (isPlaying) {
          await sound.playAsync();
          audioManager.isPlaying = true;
        } else {
          await sound.pauseAsync();
          audioManager.isPlaying = false;
        }
      } catch (error) {
        console.error("Error controlling playback", error);
        // Don't set isPlaying to false if it was supposed to play but failed
        if (isPlaying && onPlayPauseToggle) {
          onPlayPauseToggle(false);
        }
      }
    };
    
    updatePlayback();
  }, [isPlaying, sound, isLoaded]);
  
  // Handle play/pause button press
  const handlePlayPause = () => {
    if (!isLoaded) {
      console.log("Cannot toggle play/pause - sound not loaded yet");
      return;
    }
    onPlayPauseToggle && onPlayPauseToggle(!isPlaying);
  }
  
  // Handle slider change
  const handleSliderChange = (value) => {
    isDragging.current = true;
    setPosition(value);
  }
  
  // When slider touch ends, seek to the position
  const handleSlidingComplete = async (value) => {
    if (!sound || !isLoaded) {
      isDragging.current = false;
      return;
    }
    
    try {
      // Make sure the sound is still valid before seeking
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        isDragging.current = false;
        return;
      }
      
      const milliseconds = Math.floor(value * 1000);
      
      // Only seek if it's a valid position within the song
      if (milliseconds >= 0 && milliseconds <= status.durationMillis) {
        await sound.setPositionAsync(milliseconds);
        positionMillis.current = milliseconds;
      }
    } catch (error) {
      console.error("Error seeking:", error.message);
      // Don't throw the error higher, just log it and continue
    } finally {
      isDragging.current = false;
    }
  }
  
  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }
  
  // Record patient reaction to the music
  const handleRecordReaction = (reaction) => {
    if (!song) return;
    
    try {
      console.log('Recording reaction:', reaction);
      
      const newReaction = {
        songId: song.id,
        songTitle: song.title,
        reaction: reaction.id,
        reactionLabel: reaction.label,
        timestamp: Date.now()
      };
      
      // Store reaction in history
      setReactionHistory(prev => [...prev, newReaction]);
      
      // Log the reaction activity with proper details
      logActivity(ACTIVITY_TYPES.REACTION_RECORDED, {
        songId: song.id,
        songTitle: song.title,
        artist: song.artist,
        reaction: reaction.id,
        reactionLabel: reaction.label,
        icon: reaction.icon
      })
      .then(result => {
        console.log('Reaction logged successfully:', result);
        // Hide the reaction selector
        setShowReactionSelector(false);
        
        // Show a visual confirmation
        alert(`Reaction "${reaction.label}" recorded for "${song.title}"`);
      })
      .catch(error => {
        console.error('Error logging reaction:', error);
        alert('Failed to record reaction. Please try again.');
      });
    } catch (err) {
      console.error('Error in handleRecordReaction:', err);
    }
  };
  
  // Save caregiver note about patient's response
  const handleSaveNote = (noteText) => {
    if (!song || !noteText) return;
    
    const newNote = {
      songId: song.id,
      songTitle: song.title,
      note: noteText,
      timestamp: Date.now()
    };
    
    // Store note in history
    setNotes(prev => [...prev, newNote]);
    
    // Log the note activity
    logActivity(ACTIVITY_TYPES.CAREGIVER_NOTE_ADDED, {
      songId: song.id,
      songTitle: song.title,
      artist: song.artist,
      note: noteText
    });
  };
  
  if (!song) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.noSongText}>No song selected</ThemedText>
      </ThemedView>
    )
  }
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.songInfo}>
        {song.artwork ? (
          <Image source={{ uri: song.artwork }} style={styles.artwork} />
        ) : (
          <View style={styles.defaultArtwork}>
            <Ionicons name="musical-note" size={40} color="#4A90E2" />
          </View>
        )}
        <View style={styles.textContainer}>
          <ThemedText style={styles.songTitle} numberOfLines={1}>
            {song.title || "Unknown Title"}
          </ThemedText>
          <ThemedText style={styles.artistName} numberOfLines={1}>
            {song.artist || "Unknown Artist"}
          </ThemedText>
          {isBuffering && <ThemedText style={styles.buffering}>Loading audio...</ThemedText>}
        </View>
      </View>
      
      {showControls && (
        <>
          <View style={styles.sliderContainer}>
            <ThemedText style={styles.timeText}>{formatTime(position)}</ThemedText>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onValueChange={handleSliderChange}
              onSlidingComplete={handleSlidingComplete}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="#D8D8D8"
              thumbTintColor="#4A90E2"
              disabled={!isLoaded}
            />
            <ThemedText style={styles.timeText}>{formatTime(duration)}</ThemedText>
          </View>
          
          <View style={styles.controls}>
            <TouchableOpacity onPress={onPrevious} disabled={!onPrevious || isBuffering}>
              <Ionicons 
                name="play-skip-back" 
                size={40} 
                color={(onPrevious && !isBuffering) ? "#4A90E2" : "#D8D8D8"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handlePlayPause} 
              style={styles.playButton}
              disabled={!isLoaded || isBuffering}
            >
              <Ionicons 
                name={isPlaying ? "pause-circle" : "play-circle"} 
                size={70} 
                color={(!isLoaded || isBuffering) ? "#D8D8D8" : "#4A90E2"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onNext} disabled={!onNext || isBuffering}>
              <Ionicons 
                name="play-skip-forward" 
                size={40} 
                color={(onNext && !isBuffering) ? "#4A90E2" : "#D8D8D8"} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Caregiver controls */}
          {isCaregiverMode && (
            <View style={styles.caregiverContainer}>
              <ThemedText style={styles.caregiverTitle}>Caregiver Controls</ThemedText>
              <View style={styles.caregiverButtons}>
                <TouchableOpacity 
                  style={styles.caregiverButton}
                  onPress={() => setShowReactionSelector(true)}
                >
                  <Ionicons name="happy-outline" size={24} color="#4A90E2" />
                  <ThemedText style={styles.caregiverButtonText}>Record Reaction</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.caregiverButton}
                  onPress={() => setShowNoteInput(true)}
                >
                  <Ionicons name="create-outline" size={24} color="#4A90E2" />
                  <ThemedText style={styles.caregiverButtonText}>Add Note</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
      
      {/* Reaction selector modal */}
      <ReactionSelector 
        isVisible={showReactionSelector}
        onClose={() => setShowReactionSelector(false)}
        onSelect={handleRecordReaction}
      />
      
      {/* Note input modal */}
      <CaregiverNoteInput 
        isVisible={showNoteInput}
        onClose={() => setShowNoteInput(false)}
        onSaveNote={handleSaveNote}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  songInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  artwork: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  defaultArtwork: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  artistName: {
    fontSize: 16,
    opacity: 0.8,
  },
  buffering: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    fontStyle: "italic",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 14,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  playButton: {
    marginHorizontal: 20,
  },
  noSongText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 30,
  },
  caregiverContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 15,
  },
  caregiverTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  caregiverButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  caregiverButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    width: 140,
  },
  caregiverButtonText: {
    fontSize: 14,
    marginTop: 5,
    color: "#4A90E2",
  },
})

export default MusicPlayer
