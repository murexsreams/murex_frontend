import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { audioService, Track } from '../services/audioService';

export type RepeatMode = 'none' | 'one' | 'all';

export interface PlayerState {
  // Current playback state
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  
  // Queue management
  queue: Track[];
  currentIndex: number;
  originalQueue: Track[]; // For shuffle mode
  
  // Player modes
  isShuffled: boolean;
  repeatMode: RepeatMode;
  
  // UI state
  isPlayerVisible: boolean;
  isFullPlayerVisible: boolean;
  
  // Error handling
  error: string | null;
}

interface PlayerActions {
  // Playback controls
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  
  // Track management
  loadTrack: (track: Track) => Promise<void>;
  playTrack: (track: Track, queue?: Track[]) => Promise<void>;
  
  // Queue management
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  
  // Navigation
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  
  // Player modes
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  
  // UI controls
  showPlayer: () => void;
  hidePlayer: () => void;
  showFullPlayer: () => void;
  hideFullPlayer: () => void;
  
  // State updates
  updatePlaybackStatus: (currentTime: number, duration: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Cleanup
  cleanup: () => Promise<void>;
}

type PlayerStore = PlayerState & PlayerActions;

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  volume: 1.0,
  queue: [],
  currentIndex: -1,
  originalQueue: [],
  isShuffled: false,
  repeatMode: 'none',
  isPlayerVisible: false,
  isFullPlayerVisible: false,
  error: null,
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Playback controls
      play: async () => {
        try {
          set({ isLoading: true, error: null });
          await audioService.play();
          set({ isPlaying: true, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to play';
          set({ error: errorMessage, isLoading: false });
        }
      },

      pause: async () => {
        try {
          await audioService.pause();
          set({ isPlaying: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to pause';
          set({ error: errorMessage });
        }
      },

      stop: async () => {
        try {
          await audioService.stop();
          set({ isPlaying: false, currentTime: 0 });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to stop';
          set({ error: errorMessage });
        }
      },

      seekTo: async (position: number) => {
        try {
          await audioService.seekTo(position);
          set({ currentTime: position });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to seek';
          set({ error: errorMessage });
        }
      },

      setVolume: async (volume: number) => {
        try {
          const clampedVolume = Math.max(0, Math.min(1, volume));
          await audioService.setVolume(clampedVolume);
          set({ volume: clampedVolume });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to set volume';
          set({ error: errorMessage });
        }
      },

      // Track management
      loadTrack: async (track: Track) => {
        try {
          set({ isLoading: true, error: null });
          await audioService.loadTrack(track);
          set({ 
            currentTrack: track, 
            isLoading: false, 
            currentTime: 0,
            duration: track.duration,
            isPlayerVisible: true 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load track';
          set({ error: errorMessage, isLoading: false });
        }
      },

      playTrack: async (track: Track, queue?: Track[]) => {
        const { loadTrack, play, setQueue } = get();
        
        if (queue) {
          const trackIndex = queue.findIndex(t => t.id === track.id);
          setQueue(queue, trackIndex >= 0 ? trackIndex : 0);
        }
        
        await loadTrack(track);
        await play();
      },

      // Queue management
      setQueue: (tracks: Track[], startIndex: number = 0) => {
        set({ 
          queue: [...tracks], 
          originalQueue: [...tracks],
          currentIndex: startIndex 
        });
      },

      addToQueue: (track: Track) => {
        const { queue } = get();
        set({ queue: [...queue, track] });
      },

      removeFromQueue: (index: number) => {
        const { queue, currentIndex } = get();
        const newQueue = queue.filter((_, i) => i !== index);
        const newCurrentIndex = index < currentIndex ? currentIndex - 1 : currentIndex;
        set({ queue: newQueue, currentIndex: newCurrentIndex });
      },

      clearQueue: () => {
        set({ queue: [], originalQueue: [], currentIndex: -1 });
      },

      // Navigation
      playNext: async () => {
        const { queue, currentIndex, repeatMode, playTrack } = get();
        
        if (queue.length === 0) return;
        
        let nextIndex = currentIndex + 1;
        
        if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            return; // End of queue
          }
        }
        
        const nextTrack = queue[nextIndex];
        if (nextTrack) {
          set({ currentIndex: nextIndex });
          await playTrack(nextTrack);
        }
      },

      playPrevious: async () => {
        const { queue, currentIndex, playTrack } = get();
        
        if (queue.length === 0) return;
        
        let prevIndex = currentIndex - 1;
        
        if (prevIndex < 0) {
          prevIndex = queue.length - 1;
        }
        
        const prevTrack = queue[prevIndex];
        if (prevTrack) {
          set({ currentIndex: prevIndex });
          await playTrack(prevTrack);
        }
      },

      // Player modes
      toggleShuffle: () => {
        const { isShuffled, queue, originalQueue, currentTrack } = get();
        
        if (isShuffled) {
          // Turn off shuffle - restore original order
          const currentTrackIndex = originalQueue.findIndex(t => t.id === currentTrack?.id);
          set({ 
            isShuffled: false, 
            queue: [...originalQueue],
            currentIndex: currentTrackIndex >= 0 ? currentTrackIndex : 0
          });
        } else {
          // Turn on shuffle
          const shuffledQueue = [...queue];
          
          // Keep current track at the beginning
          if (currentTrack) {
            const currentTrackIndex = shuffledQueue.findIndex(t => t.id === currentTrack.id);
            if (currentTrackIndex > 0) {
              shuffledQueue.splice(currentTrackIndex, 1);
              shuffledQueue.unshift(currentTrack);
            }
          }
          
          // Shuffle the rest
          for (let i = shuffledQueue.length - 1; i > 1; i--) {
            const j = Math.floor(Math.random() * (i - 1)) + 1;
            [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
          }
          
          set({ 
            isShuffled: true, 
            queue: shuffledQueue,
            currentIndex: 0
          });
        }
      },

      setRepeatMode: (mode: RepeatMode) => {
        set({ repeatMode: mode });
      },

      // UI controls
      showPlayer: () => {
        set({ isPlayerVisible: true });
      },

      hidePlayer: () => {
        set({ isPlayerVisible: false, isFullPlayerVisible: false });
      },

      showFullPlayer: () => {
        set({ isFullPlayerVisible: true });
      },

      hideFullPlayer: () => {
        set({ isFullPlayerVisible: false });
      },

      // State updates
      updatePlaybackStatus: (currentTime: number, duration: number) => {
        set({ currentTime, duration });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // Cleanup
      cleanup: async () => {
        try {
          await audioService.cleanup();
          set(initialState);
        } catch (error) {
          console.error('Failed to cleanup player:', error);
        }
      },
    }),
    {
      name: 'murex-player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain state, not the playback status
      partialize: (state) => ({
        volume: state.volume,
        isShuffled: state.isShuffled,
        repeatMode: state.repeatMode,
        queue: state.queue,
        originalQueue: state.originalQueue,
        currentIndex: state.currentIndex,
      }),
    }
  )
);