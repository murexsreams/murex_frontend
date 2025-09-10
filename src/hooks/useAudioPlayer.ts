import { useEffect, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { audioService, Track, PlaybackStatus } from '../services/audioService';

export const useAudioPlayer = () => {
  const {
    // State
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    queue,
    currentIndex,
    isShuffled,
    repeatMode,
    isPlayerVisible,
    isFullPlayerVisible,
    error,
    
    // Actions
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    playTrack,
    setQueue,
    addToQueue,
    clearQueue,
    playNext,
    playPrevious,
    toggleShuffle,
    setRepeatMode,
    showPlayer,
    hidePlayer,
    showFullPlayer,
    hideFullPlayer,
    updatePlaybackStatus,
    setLoading,
    setError,
    cleanup,
  } = usePlayerStore();

  // Initialize audio service
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await audioService.initialize();
        
        // Set up audio service callbacks
        audioService.setCallbacks({
          onPlaybackStatusUpdate: (status: PlaybackStatus) => {
            updatePlaybackStatus(status.positionMillis || 0, status.durationMillis || 0);
            
            // Handle track end
            if (status.didJustFinish) {
              handleTrackEnd();
            }
          },
          onTrackEnd: handleTrackEnd,
          onError: (errorMessage: string) => {
            setError(errorMessage);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error('Failed to initialize audio player:', error);
        setError('Failed to initialize audio player');
      }
    };

    initializeAudio();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, []);

  // Handle track end based on repeat mode
  const handleTrackEnd = useCallback(async () => {
    if (repeatMode === 'one') {
      // Repeat current track
      await seekTo(0);
      await play();
    } else {
      // Play next track or stop if at end
      await playNext();
    }
  }, [repeatMode, seekTo, play, playNext]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  // Format time for display
  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Get progress percentage
  const getProgress = useCallback((): number => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  // Seek to percentage
  const seekToPercentage = useCallback(async (percentage: number) => {
    if (duration === 0) return;
    const position = (percentage / 100) * duration;
    await seekTo(position);
  }, [duration, seekTo]);

  // Check if there's a next track
  const hasNext = useCallback((): boolean => {
    if (queue.length === 0) return false;
    if (repeatMode === 'all') return true;
    return currentIndex < queue.length - 1;
  }, [queue.length, currentIndex, repeatMode]);

  // Check if there's a previous track
  const hasPrevious = useCallback((): boolean => {
    return queue.length > 0 && currentIndex > 0;
  }, [queue.length, currentIndex]);

  // Play track from queue by index
  const playTrackAtIndex = useCallback(async (index: number) => {
    if (index < 0 || index >= queue.length) return;
    
    const track = queue[index];
    if (track) {
      usePlayerStore.setState({ currentIndex: index });
      await playTrack(track);
    }
  }, [queue, playTrack]);

  // Add track and play immediately
  const playTrackNow = useCallback(async (track: Track, newQueue?: Track[]) => {
    await playTrack(track, newQueue);
  }, [playTrack]);

  // Add track to end of queue
  const addTrackToQueue = useCallback((track: Track) => {
    addToQueue(track);
  }, [addToQueue]);

  // Play all tracks starting from a specific track
  const playAllFrom = useCallback(async (tracks: Track[], startTrack: Track) => {
    const startIndex = tracks.findIndex(t => t.id === startTrack.id);
    setQueue(tracks, startIndex >= 0 ? startIndex : 0);
    await playTrack(startTrack);
  }, [setQueue, playTrack]);

  // Get current track info with additional computed properties
  const getCurrentTrackInfo = useCallback(() => {
    if (!currentTrack) return null;

    return {
      ...currentTrack,
      formattedCurrentTime: formatTime(currentTime),
      formattedDuration: formatTime(duration),
      progress: getProgress(),
      hasNext: hasNext(),
      hasPrevious: hasPrevious(),
    };
  }, [currentTrack, currentTime, duration, formatTime, getProgress, hasNext, hasPrevious]);

  // Get queue info
  const getQueueInfo = useCallback(() => {
    return {
      tracks: queue,
      currentIndex,
      totalTracks: queue.length,
      isShuffled,
      repeatMode,
    };
  }, [queue, currentIndex, isShuffled, repeatMode]);

  // Player controls object
  const controls = {
    play,
    pause,
    stop,
    togglePlayPause,
    seekTo,
    seekToPercentage,
    setVolume,
    playNext,
    playPrevious,
    playTrackAtIndex,
    playTrackNow,
    addTrackToQueue,
    playAllFrom,
    toggleShuffle,
    setRepeatMode,
    showPlayer,
    hidePlayer,
    showFullPlayer,
    hideFullPlayer,
    clearQueue,
  };

  // Player state object
  const state = {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    queue,
    currentIndex,
    isShuffled,
    repeatMode,
    isPlayerVisible,
    isFullPlayerVisible,
    error,
    progress: getProgress(),
    hasNext: hasNext(),
    hasPrevious: hasPrevious(),
    formattedCurrentTime: formatTime(currentTime),
    formattedDuration: formatTime(duration),
  };

  // Utility functions
  const utils = {
    formatTime,
    getProgress,
    getCurrentTrackInfo,
    getQueueInfo,
  };

  return {
    ...state,
    controls,
    utils,
  };
};