import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, ensureAuthenticated } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, writeBatch, orderBy, limit } from 'firebase/firestore';
import { Platform } from 'react-native';

// Key constants for AsyncStorage
const PLAYLISTS_STORAGE_KEY = "@music_therapy_playlists";
const MEMORIES_STORAGE_KEY = "@music_therapy_memories";
const LOGS_STORAGE_KEY = "@music_therapy_logs";
const SONGS_STORAGE_KEY = "@music_therapy_songs";

// Collection names for Firestore
const PLAYLISTS_COLLECTION = "playlists";
const MEMORIES_COLLECTION = "memories";
const LOGS_COLLECTION = "activity_logs";
const SONGS_COLLECTION = "songs";

// Check if we're in a web environment (for preventing Firebase in web preview if needed)
const isWeb = Platform.OS === 'web';

// Activity types for logging
export const ACTIVITY_TYPES = {
  PLAYLIST_CREATED: 'playlist_created',
  PLAYLIST_UPDATED: 'playlist_updated',
  PLAYLIST_DELETED: 'playlist_deleted',
  PLAYLIST_PLAYED: 'playlist_played',
  MEMORY_CREATED: 'memory_created',
  MEMORY_UPDATED: 'memory_updated',
  MEMORY_DELETED: 'memory_deleted',
  MEMORY_PLAYED: 'memory_played',
  SONG_PLAYED: 'song_played',
  // New caregiver activity types
  REACTION_RECORDED: 'reaction_recorded',
  CAREGIVER_NOTE_ADDED: 'caregiver_note_added',
  TAG_UPDATED: 'tag_updated'
};

// Reaction types for patient responses
export const REACTION_TYPES = {
  HAPPY: 'happy',
  CALM: 'calm',
  NOSTALGIC: 'nostalgic',
  NEUTRAL: 'neutral',
  SAD: 'sad',
  AGITATED: 'agitated',
  NO_RESPONSE: 'no_response'
};

// Sample songs data
const DEFAULT_SONGS = [
  {
    id: "1",
    title: "What a Wonderful World",
    artist: "Louis Armstrong",
    album: "Single",
    duration: 136, // in seconds
    uri: require('../assets/sounds/Louis_Armstrong_-_What_A_Wonderful_World_CeeNaija.com_.mp3'),
    genre: "Jazz",
    year: "1967",
    mood: ["happy", "nostalgic", "relaxing"]
  },
  {
    id: "2",
    title: "Somewhere Over the Rainbow",
    artist: "Ronnie Booth",
    album: "Classic Collection",
    duration: 177,
    uri: require('../assets/sounds/Ronnie_Booth_-_Somewhere_Over_the_Rainbow_CeeNaija.com_.mp3'),
    genre: "Classic",
    year: "1939",
    mood: ["nostalgic", "relaxing"]
  },
  {
    id: "3",
    title: "Moon River",
    artist: "JJ Heller",
    album: "Classics Collection",
    duration: 224,
    uri: require('../assets/sounds/JJ-Heller-Moon-River-(CeeNaija.com).mp3'),
    genre: "Vocal",
    year: "2020",
    mood: ["nostalgic", "relaxing"]
  },
  {
    id: "4",
    title: "Calm",
    artist: "Victor Thompson",
    album: "Worship Sessions",
    duration: 189,
    uri: require('../assets/sounds/Victor_Thompson_-_Calm_CeeNaija.com_.mp3'),
    genre: "Gospel",
    year: "2020",
    mood: ["relaxing", "spiritual"]
  },
  {
    id: "5",
    title: "The Calm",
    artist: "7 Hills Worship",
    album: "Worship Experience",
    duration: 183,
    uri: require('../assets/sounds/7-Hills-Worship-The-Calm-(CeeNaija.com).mp3'),
    genre: "Gospel",
    year: "2021",
    mood: ["relaxing", "spiritual"]
  },
  {
    id: "6",
    title: "Happy",
    artist: "Guardian Angel",
    album: "Single",
    duration: 203,
    uri: require('../assets/sounds/Guardian_Angel_-_Happy_CeeNaija.com_.mp3'),
    genre: "Afrobeats",
    year: "2020",
    mood: ["happy", "upbeat"]
  },
  {
    id: "7",
    title: "Happy Place",
    artist: "Esther Oji",
    album: "Single",
    duration: 152,
    uri: require('../assets/sounds/Esther_Oji_-_Happy_Place_CeeNaija.com_.mp3'),
    genre: "Afrobeats",
    year: "2021",
    mood: ["happy", "upbeat"]
  },
  {
    id: "8",
    title: "Happy",
    artist: "Daphne",
    album: "Single",
    duration: 183,
    uri: require('../assets/sounds/Daphne_-_Happy_CeeNaija.com_.mp3'),
    genre: "Afrobeats",
    year: "2019",
    mood: ["happy", "upbeat"]
  },
  {
    id: "9",
    title: "Nostalgic",
    artist: "Alvin Cedric",
    album: "Memories",
    duration: 171,
    uri: require('../assets/sounds/Alvin_Cedric_-_Nostalgic_CeeNaija.com_.mp3'),
    genre: "R&B",
    year: "2020",
    mood: ["nostalgic", "emotional"]
  },
  {
    id: "10",
    title: "Relax",
    artist: "Christina Shusho",
    album: "Peace Sessions",
    duration: 172,
    uri: require('../assets/sounds/Christina_Shusho_-_Relax_CeeNaija.com_.mp3'),
    genre: "Gospel",
    year: "2020",
    mood: ["relaxing", "spiritual"]
  },
  {
    id: "11",
    title: "Relax",
    artist: "Marvin Sapp",
    album: "Single",
    duration: 193,
    uri: require('../assets/sounds/Marvin_Sapp_-_Relax_CeeNaija.com_.mp3'),
    genre: "Gospel",
    year: "2019",
    mood: ["relaxing", "spiritual"]
  },
  {
    id: "12",
    title: "I'm So Sad",
    artist: "Gnash",
    album: "Emotional",
    duration: 120,
    uri: require('../assets/sounds/gnash_-_Im_So_Sad_CeeNaija.com_.mp3'),
    genre: "Pop",
    year: "2018",
    mood: ["sad", "emotional"]
  },
  {
    id: "13",
    title: "Sad",
    artist: "BOBO W",
    album: "Feelings",
    duration: 229,
    uri: require('../assets/sounds/BOBO-W-FEELING-SAD-(CeeNaija.com).mp3'),
    genre: "Afrobeats",
    year: "2020",
    mood: ["sad", "emotional"]
  },
  {
    id: "14",
    title: "Too Sad To Cry",
    artist: "Sasha Sloan",
    album: "Emotions",
    duration: 135,
    uri: require('../assets/sounds/Sasha_Sloan_-_Too_Sad_To_Cry_CeeNaija.com_.mp3'),
    genre: "Pop",
    year: "2019",
    mood: ["sad", "emotional"]
  },
  {
    id: "15",
    title: "Let Me Be Sad",
    artist: "I Prevail",
    album: "Single",
    duration: 139,
    uri: require('../assets/sounds/I_Prevail_-_Let_Me_Be_Sad_CeeNaija.com_.mp3'),
    genre: "Rock",
    year: "2020",
    mood: ["sad", "emotional"]
  }
];

// Mood categories
export const MOOD_CATEGORIES = {
  happy: {
    id: 'happy',
    name: 'Happy',
    description: 'Uplifting songs to boost mood and energy',
    icon: 'happy-outline',
    color: '#4CD964'
  },
  nostalgic: {
    id: 'nostalgic',
    name: 'Nostalgic',
    description: 'Songs that evoke memories from the past',
    icon: 'time-outline',
    color: '#FF9500'
  },
  relaxing: {
    id: 'relaxing',
    name: 'Relaxing',
    description: 'Calm and peaceful music for stress relief',
    icon: 'water-outline',
    color: '#5AC8FA'
  },
  spiritual: {
    id: 'spiritual',
    name: 'Spiritual',
    description: 'Music for spiritual connection and peace',
    icon: 'flower-outline',
    color: '#AF52DE'
  },
  sad: {
    id: 'sad',
    name: 'Sad',
    description: 'Emotional songs that may help process feelings',
    icon: 'rainy-outline',
    color: '#8E8E93'
  },
  upbeat: {
    id: 'upbeat',
    name: 'Upbeat',
    description: 'Energetic songs to stimulate and motivate',
    icon: 'pulse-outline',
    color: '#FF2D55'
  },
  emotional: {
    id: 'emotional',
    name: 'Emotional',
    description: 'Songs that evoke strong feelings',
    icon: 'heart-outline',
    color: '#FF3B30'
  }
};

// Get songs by mood category
export const getSongsByMood = async (moodCategory) => {
  const songs = await getSongs();
  return songs.filter(song => 
    song.mood && song.mood.includes(moodCategory.toLowerCase())
  );
};

// Get all available moods from songs
export const getAvailableMoods = async () => {
  const songs = await getSongs();
  const availableMoodIds = new Set();
  
  songs.forEach(song => {
    if (song.mood && Array.isArray(song.mood)) {
      song.mood.forEach(mood => availableMoodIds.add(mood));
    }
  });
  
  return Array.from(availableMoodIds)
    .filter(moodId => MOOD_CATEGORIES[moodId])
    .map(moodId => MOOD_CATEGORIES[moodId]);
};

// Songs operations
export const getSongs = async () => {
  try {
    // Try to get data from Firebase first
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          const songsRef = collection(db, SONGS_COLLECTION);
          const querySnapshot = await getDocs(songsRef);
          
          const songs = [];
          querySnapshot.forEach((doc) => {
            songs.push(doc.data());
          });
          
          if (songs.length > 0) {
            // Save to AsyncStorage as cache
            await AsyncStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songs));
            
            return songs;
          }
        }
      } catch (firebaseError) {
        console.warn("Firebase songs fetch failed, falling back to local storage:", firebaseError);
      }
    }
    
    // Fallback to AsyncStorage if Firebase fails or we're on web
    const jsonValue = await AsyncStorage.getItem(SONGS_STORAGE_KEY);
    const storedSongs = jsonValue != null ? JSON.parse(jsonValue) : null;
    
    if (storedSongs && storedSongs.length > 0) {
      return storedSongs;
    }
    
    // If no songs found in AsyncStorage or Firebase, use default songs
    await AsyncStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(DEFAULT_SONGS));
    return DEFAULT_SONGS;
  } catch (e) {
    console.error("Error reading songs:", e);
    return DEFAULT_SONGS;
  }
};

// Get a song by ID
export const getSong = async (songId) => {
  const songs = await getSongs();
  return songs.find(song => song.id === songId) || null;
};

// Playlists operations
export const getPlaylists = async () => {
  try {
    // Try to get data from Firebase first
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          const userId = user.uid;
          const playlistsRef = collection(db, PLAYLISTS_COLLECTION);
          const playlistsQuery = query(playlistsRef, where("userId", "==", userId));
          const querySnapshot = await getDocs(playlistsQuery);
          
          const playlists = [];
          querySnapshot.forEach((doc) => {
            playlists.push(doc.data());
          });
          
          // Save to AsyncStorage as cache
          await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
          
          return playlists;
        }
      } catch (firebaseError) {
        console.warn("Firebase fetch failed, falling back to local storage:", firebaseError);
      }
    }
    
    // Fallback to AsyncStorage if Firebase fails or we're on web
    const jsonValue = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading playlists:", e);
    return [];
  }
};

// Get a single playlist by ID
export const getPlaylist = async (playlistId) => {
  try {
    // Try to get the playlist from Firebase first
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          const playlistDoc = await getDoc(doc(db, PLAYLISTS_COLLECTION, playlistId));
          
          if (playlistDoc.exists()) {
            const playlistData = playlistDoc.data();
            return playlistData;
          }
        }
      } catch (firebaseError) {
        console.warn("Firebase fetch failed, falling back to local storage:", firebaseError);
      }
    }
    
    // Fallback to AsyncStorage if Firebase fails or we're on web
    const jsonValue = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    const playlists = jsonValue != null ? JSON.parse(jsonValue) : [];
    return playlists.find(p => p.id === playlistId) || null;
  } catch (e) {
    console.error("Error reading playlist:", e);
    return null;
  }
};

export const savePlaylist = async (playlist) => {
  try {
    // Generate a unique ID if none provided
    const newPlaylist = {
      ...playlist,
      id: playlist.id || Date.now().toString(),
      createdAt: Date.now(),
    };
    
    // Get existing playlists from local storage
    const jsonValue = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    const playlists = jsonValue != null ? JSON.parse(jsonValue) : [];
    
    // Add new playlist (or replace if ID already exists)
    const updatedPlaylists = playlists.filter(p => p.id !== newPlaylist.id);
    updatedPlaylists.push(newPlaylist);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updatedPlaylists));
    
    // Save to Firebase if not on web
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          const userId = user.uid;
          const playlistWithUser = { ...newPlaylist, userId };
          await setDoc(doc(db, PLAYLISTS_COLLECTION, newPlaylist.id), playlistWithUser);
        }
      } catch (firebaseError) {
        console.error("Firebase save failed:", firebaseError);
        // Continue since we've saved to AsyncStorage already
      }
    }
    
    return newPlaylist;
  } catch (e) {
    console.error("Error saving playlist:", e);
    throw e;
  }
};

// Update an existing playlist
export const updatePlaylist = async (playlist) => {
  try {
    if (!playlist || !playlist.id) {
      throw new Error("Playlist ID is required for update");
    }
    
    // Update the modification timestamp
    const updatedPlaylist = {
      ...playlist,
      dateModified: new Date().toISOString()
    };
    
    // Get existing playlists from local storage
    const jsonValue = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    const playlists = jsonValue != null ? JSON.parse(jsonValue) : [];
    
    // Replace the playlist with updated version
    const updatedPlaylists = playlists.filter(p => p.id !== playlist.id);
    updatedPlaylists.push(updatedPlaylist);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updatedPlaylists));
    
    // Save to Firebase if not on web
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          const userId = user.uid;
          const playlistWithUser = { ...updatedPlaylist, userId };
          await setDoc(doc(db, PLAYLISTS_COLLECTION, playlist.id), playlistWithUser);
        }
      } catch (firebaseError) {
        console.error("Firebase update failed:", firebaseError);
        // Continue since we've saved to AsyncStorage already
      }
    }
    
    return updatedPlaylist;
  } catch (e) {
    console.error("Error updating playlist:", e);
    throw e;
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    // Delete from AsyncStorage
    const jsonValue = await AsyncStorage.getItem(PLAYLISTS_STORAGE_KEY);
    const playlists = jsonValue != null ? JSON.parse(jsonValue) : [];
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    await AsyncStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(updatedPlaylists));
    
    // Delete from Firebase if not on web
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          await deleteDoc(doc(db, PLAYLISTS_COLLECTION, playlistId));
        }
      } catch (firebaseError) {
        console.error("Firebase delete failed:", firebaseError);
        // Continue since we've deleted from AsyncStorage already
      }
    }
    
    return true;
  } catch (e) {
    console.error("Error deleting playlist:", e);
    return false;
  }
};

// Memories operations
export const getMemories = async () => {
  try {
    // Try to get data from Firebase first
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          const userId = user.uid;
          const memoriesRef = collection(db, MEMORIES_COLLECTION);
          const memoriesQuery = query(memoriesRef, where("userId", "==", userId));
          const querySnapshot = await getDocs(memoriesQuery);
          
          const memories = [];
          querySnapshot.forEach((doc) => {
            memories.push(doc.data());
          });
          
          // Save to AsyncStorage as cache
          await AsyncStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memories));
          
          return memories;
        }
      } catch (firebaseError) {
        console.warn("Firebase fetch failed, falling back to local storage:", firebaseError);
      }
    }
    
    // Fallback to AsyncStorage if Firebase fails or we're on web
    const jsonValue = await AsyncStorage.getItem(MEMORIES_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Error reading memories:", e);
    return [];
  }
};

// Get a single memory by ID
export const getMemory = async (memoryId) => {
  try {
    // Try to get the memory from Firebase first
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          const memoryDoc = await getDoc(doc(db, MEMORIES_COLLECTION, memoryId));
          
          if (memoryDoc.exists()) {
            const memoryData = memoryDoc.data();
            return memoryData;
          }
        }
      } catch (firebaseError) {
        console.warn("Firebase fetch failed, falling back to local storage:", firebaseError);
      }
    }
    
    // Fallback to AsyncStorage if Firebase fails or we're on web
    const jsonValue = await AsyncStorage.getItem(MEMORIES_STORAGE_KEY);
    const memories = jsonValue != null ? JSON.parse(jsonValue) : [];
    return memories.find(m => m.id === memoryId) || null;
  } catch (e) {
    console.error("Error reading memory:", e);
    return null;
  }
};

export const saveMemory = async (memory) => {
  try {
    // Generate a unique ID if none provided
    const newMemory = {
      ...memory,
      id: memory.id || Date.now().toString(),
      createdAt: Date.now(),
    };
    
    // Get existing memories from local storage
    const jsonValue = await AsyncStorage.getItem(MEMORIES_STORAGE_KEY);
    const memories = jsonValue != null ? JSON.parse(jsonValue) : [];
    
    // Add new memory (or replace if ID already exists)
    const updatedMemories = memories.filter(m => m.id !== newMemory.id);
    updatedMemories.push(newMemory);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(updatedMemories));
    
    // Save to Firebase if not on web
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          const userId = user.uid;
          const memoryWithUser = { ...newMemory, userId };
          await setDoc(doc(db, MEMORIES_COLLECTION, newMemory.id), memoryWithUser);
        }
      } catch (firebaseError) {
        console.error("Firebase save failed:", firebaseError);
        // Continue since we've saved to AsyncStorage already
      }
    }
    
    return newMemory;
  } catch (e) {
    console.error("Error saving memory:", e);
    throw e;
  }
};

export const deleteMemory = async (memoryId) => {
  try {
    // Get existing memories
    const jsonValue = await AsyncStorage.getItem(MEMORIES_STORAGE_KEY);
    const memories = jsonValue != null ? JSON.parse(jsonValue) : [];
    
    // Filter out the memory to delete
    const updatedMemories = memories.filter(memory => memory.id !== memoryId);
    
    // Save updated memories back to AsyncStorage
    await AsyncStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(updatedMemories));
    
    // Delete from Firebase if not on web
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          await deleteDoc(doc(db, MEMORIES_COLLECTION, memoryId));
          console.log("Memory deleted from Firebase:", memoryId);
        }
      } catch (firebaseError) {
        console.error("Firebase memory deletion failed:", firebaseError);
        // Continue since we've updated AsyncStorage already
      }
    }
    
    console.log("Memory successfully deleted:", memoryId);
    return true;
  } catch (e) {
    console.error("Error deleting memory:", e);
    throw e;
  }
};

// Activity Logs operations
export const getActivityLogs = async (maxResults = 50) => {
  try {
    // Try to get data from Firebase first
    if (!isWeb) {
      try {
        const user = await ensureAuthenticated();
        if (user) {
          const userId = user.uid;
          const logsRef = collection(db, LOGS_COLLECTION);
          const logsQuery = query(
            logsRef, 
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(maxResults)
          );
          
          const querySnapshot = await getDocs(logsQuery);
          
          const logs = [];
          querySnapshot.forEach((doc) => {
            logs.push(doc.data());
          });
          
          // Save to AsyncStorage as cache
          await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
          
          return logs;
        }
      } catch (firebaseError) {
        console.warn("Firebase fetch failed, falling back to local storage:", firebaseError);
      }
    }
    
    // Fallback to AsyncStorage if Firebase fails or we're on web
    const jsonValue = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
    const logs = jsonValue != null ? JSON.parse(jsonValue) : [];
    
    // Sort by timestamp (desc) and limit
    return logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxResults);
  } catch (e) {
    console.error("Error reading activity logs:", e);
    return [];
  }
};

export const logActivity = async (activityType, details = {}) => {
  try {
    // Make sure activityType is never undefined
    if (!activityType) {
      console.error("Activity type is required");
      return;
    }
    
    // Ensure activityType is valid
    if (!Object.values(ACTIVITY_TYPES).includes(activityType)) {
      console.error(`Invalid activity type: ${activityType}`);
      activityType = 'unknown_activity'; // Fallback to prevent undefined
    }
    
    // Specific logging for reactions to debug
    if (activityType === ACTIVITY_TYPES.REACTION_RECORDED) {
      console.log("Recording reaction activity:", {activityType, details});
    }
    
    const timestamp = Date.now();
    const logId = `${timestamp}-${Math.random().toString(36).substr(2, 8)}`;
    
    const logEntry = {
      id: logId,
      timestamp,
      activityType,
      details
    };
    
    // Save to local storage
    try {
      const existingLogs = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.unshift(logEntry); // Add new log at beginning
      
      // Limit local storage to 100 logs
      if (logs.length > 100) {
        logs.length = 100;
      }
      
      await AsyncStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
      
      // Extra verification for reactions
      if (activityType === ACTIVITY_TYPES.REACTION_RECORDED) {
        const verifyLogs = await AsyncStorage.getItem(LOGS_STORAGE_KEY);
        const parsedLogs = JSON.parse(verifyLogs);
        const foundLog = parsedLogs.find(log => log.id === logId);
        console.log("Verified reaction was saved:", foundLog ? "Yes" : "No");
      }
    } catch (localError) {
      console.error("Local storage log save failed:", localError);
    }
    
    // Save to Firebase if connected
    try {
      if (!isWeb) {
        const user = await ensureAuthenticated();
        if (user) {
          const logRef = doc(collection(db, LOGS_COLLECTION), logId);
          await setDoc(logRef, {
            ...logEntry,
            userId: user.uid
          });
        }
      }
    } catch (firebaseError) {
      console.error("Firebase log save failed:", firebaseError);
    }
    
    return logEntry;
  } catch (error) {
    console.error("Error logging activity:", error);
    return null;
  }
};

// Clear all data (for testing/debugging)
export const clearAllData = async () => {
  try {
    // Try to clear Firebase data first
    if (Platform.OS !== 'web') {
      try {
        // Clear Firebase collections
        const user = await ensureAuthenticated();
        if (user) {
          const userId = user.uid;
          
          // Only delete data for the current user
          const playlistsRef = collection(db, PLAYLISTS_COLLECTION);
          const playlistsQuery = query(playlistsRef, where("userId", "==", userId));
          const playlistDocs = await getDocs(playlistsQuery);
          
          const memoriesRef = collection(db, MEMORIES_COLLECTION);
          const memoriesQuery = query(memoriesRef, where("userId", "==", userId));
          const memoryDocs = await getDocs(memoriesQuery);
          
          const logsRef = collection(db, LOGS_COLLECTION);
          const logsQuery = query(logsRef, where("userId", "==", userId));
          const logDocs = await getDocs(logsQuery);
          
          const batch = writeBatch(db);
          
          playlistDocs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          
          memoryDocs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          
          logDocs.forEach((doc) => {
            batch.delete(doc.ref);
          });
          
          await batch.commit();
        }
      } catch (error) {
        console.error('Error clearing Firebase data:', error);
      }
    }
    
    // Clear AsyncStorage
    await AsyncStorage.multiRemove([
      PLAYLISTS_STORAGE_KEY,
      MEMORIES_STORAGE_KEY,
      LOGS_STORAGE_KEY,
      SONGS_STORAGE_KEY
    ]);
    
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};