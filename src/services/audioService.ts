import { Audio } from 'expo-audio';
import { Platform } from 'react-native';
import { isWeb, supportsAudio, safeCall } from '../utils/platformUtils';

export interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  duration: number;
  coverArt: string;
}

export interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number;
  volume: number;
  didJustFinish: boolean;
}

export interface AudioServiceCallbacks {
  onPlaybackStatusUpdate?: (status: PlaybackStatus) => void;
  onTrackEnd?: () => void;
  onError?: (error: string) => void;
}

class AudioService {
  private currentTrack: Track | null = null;
  private callbacks: AudioServiceCallbacks = {};
  private isInitialized = false;
  private sound: Audio.Sound | null = null;
  private statusUpdateInterval: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (!supportsAudio) {
      console.log('Audio service initialized in web/mock mode');
      this.isInitialized = true;
      return;
    }

    const success = await safeCall(
      async () => {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
        });
        return true;
      },
      false,
      'Failed to initialize audio service'
    );

    if (success) {
      console.log('Audio service initialized with expo-audio');
    } else {
      console.log('Audio service initialized in fallback mode');
      this.callbacks.onError?.('Audio initialization failed, using fallback mode');
    }
    
    this.isInitialized = true;
  }

  setCallbacks(callbacks: AudioServiceCallbacks): void {
    this.callbacks = callbacks;
  }

  async loadTrack(track: Track): Promise<void> {
    try {
      // Unload previous track
      await this.unloadTrack();
      
      console.log('Loading track:', track.title);
      this.currentTrack = track;
      
      if (Platform.OS === 'web') {
        // Web fallback - use mock implementation
        this.startStatusUpdates();
        this.callbacks.onPlaybackStatusUpdate?.({
          isLoaded: true,
          isPlaying: false,
          positionMillis: 0,
          durationMillis: track.duration,
          volume: 1,
          didJustFinish: false,
        });
        return;
      }

      // Load audio file
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: false, volume: 1.0 },
        this.onPlaybackStatusUpdate.bind(this)
      );
      
      this.sound = sound;
      console.log('Track loaded successfully:', track.title);
    } catch (error) {
      console.error('Failed to load track:', error);
      this.callbacks.onError?.('Failed to load track');
      // Fallback to mock mode
      this.startStatusUpdates();
    }
  }

  private onPlaybackStatusUpdate(status: any): void {
    if (!this.currentTrack) return;

    const playbackStatus: PlaybackStatus = {
      isLoaded: status.isLoaded || false,
      isPlaying: status.isPlaying || false,
      positionMillis: status.positionMillis || 0,
      durationMillis: status.durationMillis || this.currentTrack.duration,
      volume: status.volume || 1,
      didJustFinish: status.didJustFinish || false,
    };

    this.callbacks.onPlaybackStatusUpdate?.(playbackStatus);

    if (status.didJustFinish) {
      this.callbacks.onTrackEnd?.();
    }
  }

  private startStatusUpdates(): void {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
    }

    // Mock status updates for web/fallback
    let currentTime = 0;
    let isPlaying = false;

    this.statusUpdateInterval = setInterval(() => {
      if (this.currentTrack && isPlaying) {
        currentTime += 500;
        
        if (currentTime >= this.currentTrack.duration) {
          currentTime = this.currentTrack.duration;
          isPlaying = false;
          this.callbacks.onTrackEnd?.();
        }
        
        this.callbacks.onPlaybackStatusUpdate?.({
          isLoaded: true,
          isPlaying,
          positionMillis: currentTime,
          durationMillis: this.currentTrack.duration,
          volume: 1,
          didJustFinish: currentTime >= this.currentTrack.duration,
        });
      }
    }, 500);
  }

  private stopStatusUpdates(): void {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }

  async play(): Promise<void> {
    if (!this.currentTrack) {
      this.callbacks.onError?.('No track loaded');
      return;
    }

    try {
      console.log('Playing track:', this.currentTrack.title);
      
      if (this.sound && Platform.OS !== 'web') {
        await this.sound.playAsync();
      } else {
        // Web fallback - mock play
        console.log('Mock playing track (web fallback)');
      }
    } catch (error) {
      console.error('Failed to play track:', error);
      this.callbacks.onError?.('Failed to play track');
    }
  }

  async pause(): Promise<void> {
    if (!this.currentTrack) return;

    try {
      console.log('Pausing track');
      
      if (this.sound && Platform.OS !== 'web') {
        await this.sound.pauseAsync();
      } else {
        // Web fallback - mock pause
        console.log('Mock pausing track (web fallback)');
      }
    } catch (error) {
      console.error('Failed to pause track:', error);
      this.callbacks.onError?.('Failed to pause track');
    }
  }

  async stop(): Promise<void> {
    if (!this.currentTrack) return;

    try {
      console.log('Stopping track');
      
      if (this.sound && Platform.OS !== 'web') {
        await this.sound.stopAsync();
      } else {
        // Web fallback - mock stop
        console.log('Mock stopping track (web fallback)');
      }
    } catch (error) {
      console.error('Failed to stop track:', error);
      this.callbacks.onError?.('Failed to stop track');
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    if (!this.currentTrack) return;

    try {
      console.log('Seeking to:', positionMillis);
      
      if (this.sound && Platform.OS !== 'web') {
        await this.sound.setPositionAsync(positionMillis);
      } else {
        // Web fallback - mock seek
        console.log('Mock seeking (web fallback)');
      }
    } catch (error) {
      console.error('Failed to seek:', error);
      this.callbacks.onError?.('Failed to seek');
    }
  }

  async setVolume(volume: number): Promise<void> {
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      console.log('Setting volume to:', clampedVolume);
      
      if (this.sound && Platform.OS !== 'web') {
        await this.sound.setVolumeAsync(clampedVolume);
      } else {
        // Web fallback - mock volume
        console.log('Mock setting volume (web fallback)');
      }
    } catch (error) {
      console.error('Failed to set volume:', error);
      this.callbacks.onError?.('Failed to set volume');
    }
  }

  async getStatus(): Promise<PlaybackStatus | null> {
    if (!this.currentTrack) return null;

    try {
      if (this.sound && Platform.OS !== 'web') {
        const status = await this.sound.getStatusAsync();
        return {
          isLoaded: status.isLoaded || false,
          isPlaying: status.isLoaded && status.isPlaying || false,
          positionMillis: status.isLoaded ? status.positionMillis || 0 : 0,
          durationMillis: status.isLoaded ? status.durationMillis || this.currentTrack.duration : this.currentTrack.duration,
          volume: status.isLoaded ? status.volume || 1 : 1,
          didJustFinish: status.isLoaded ? status.didJustFinish || false : false,
        };
      } else {
        // Web fallback
        return {
          isLoaded: true,
          isPlaying: false,
          positionMillis: 0,
          durationMillis: this.currentTrack.duration,
          volume: 1,
          didJustFinish: false,
        };
      }
    } catch (error) {
      console.error('Failed to get status:', error);
      return null;
    }
  }

  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  async unloadTrack(): Promise<void> {
    try {
      console.log('Unloading track');
      this.stopStatusUpdates();
      
      if (this.sound && Platform.OS !== 'web') {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      this.currentTrack = null;
    } catch (error) {
      console.error('Failed to unload track:', error);
    }
  }

  async cleanup(): Promise<void> {
    this.stopStatusUpdates();
    await this.unloadTrack();
    this.callbacks = {};
    this.isInitialized = false;
  }
}

// Export singleton instance
export const audioService = new AudioService();