import { Audio } from "expo-av";

// Global audio manager to ensure only one sound plays at a time
class AudioManager {
  constructor() {
    this.currentSound = null;
    this.isPlaying = false;
  }

  // Stop and unload any currently playing audio
  async stopAudio() {
    if (this.currentSound) {
      try {
        // Only call stopAsync if the sound is actually playing
        if (this.isPlaying) {
          try {
            // Get current status to confirm sound is still valid
            const status = await this.currentSound.getStatusAsync();
            if (status.isLoaded) {
              await this.currentSound.pauseAsync();
              await this.currentSound.stopAsync();
            }
          } catch (err) {
            // Silently handle stop errors - the sound might already be stopped
            console.log("Audio stop warning (non-critical):", err.message);
          }
        }
        
        // Make sure sound exists and has correct API before unloading
        try {
          const status = await this.currentSound.getStatusAsync();
          if (status.isLoaded) {
            await this.currentSound.unloadAsync();
          }
        } catch (err) {
          // Silently handle unload errors - these are usually non-critical
          console.log("Audio unload warning (non-critical):", err.message);
        }
      } catch (error) {
        console.error("Error managing audio:", error);
      } finally {
        // Always ensure we clean up the state, even if there are errors
        this.currentSound = null;
        this.isPlaying = false;
      }
    }
  }

  // Play a new audio file
  async playAudio(audioSource, initialStatus = {}, onPlaybackStatusUpdate = null) {
    try {
      // First make sure any previous audio is fully stopped
      await this.stopAudio();
      
      // Add a small delay to ensure previous audio is fully released
      await new Promise(resolve => setTimeout(resolve, 50));

      // Create and load the new audio
      const { sound } = await Audio.Sound.createAsync(
        audioSource,
        { ...initialStatus, shouldPlay: initialStatus?.shouldPlay || false },
        onPlaybackStatusUpdate
      );

      this.currentSound = sound;
      
      // Start playing if requested (with a slight delay for stability)
      if (initialStatus?.shouldPlay) {
        await new Promise(resolve => setTimeout(resolve, 50));
        await sound.playAsync();
        this.isPlaying = true;
      }

      return sound;
    } catch (error) {
      console.error("Error playing audio:", error);
      // Reset state in case of error
      this.currentSound = null;
      this.isPlaying = false;
      throw error;
    }
  }
}

// Create a singleton instance
export default new AudioManager(); 