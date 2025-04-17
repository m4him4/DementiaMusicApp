import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { signInAnonymously } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGgdKwPpNQcsNKqulpu2IZtuaifsCNqPU",
  authDomain: "musictherapydementia-c287e.firebaseapp.com",
  projectId: "musictherapydementia-c287e",
  storageBucket: "musictherapydementia-c287e.firebasestorage.app",
  messagingSenderId: "639000403910",
  appId: "1:639000403910:web:4407b182721eeb2bdb9cc7",
  measurementId: "G-VSP5H9YHFN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize auth with proper persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Check if user is authenticated, if not, sign in anonymously
const ensureAuthenticated = async () => {
  if (!auth.currentUser) {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error("Error signing in anonymously:", error);
    }
  }
  return auth.currentUser;
};

export { db, auth, ensureAuthenticated }; 