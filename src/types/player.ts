// Player-related types and interfaces

import { Track } from './models';

// Audio quality settings
export enum AudioQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  LOSSLESS = 'lossless',
}

// Repeat modes
export enum RepeatMode {
  OFF = 'off',
  ONE = 'one',
  ALL = 'all',
}

// Player state interface
export interface PlayerState {
  // Current track and queue
  currentTrack: Track | null;
  currentIndex: number;
  
  // Queue management
  queue: Track[];
  originalQueue: Track[]; // Before shuffle
  history: Track[];
  
  // Playback state
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  isPaused: boolean;
  
  // Progress and timing
  position: number; // current position in seconds
  duration: number; // total duration in seconds
  buffered: number; // buffered amount in seconds
  
  // Audio settings
  volume: number; // 0-1
  muted: boolean;
  
  // Playback modes
  shuffle: boolean;
  repeat: RepeatMode;
  
  // Quality and performance
  quality: AudioQuality;
  networkQuality: NetworkQuality;
  
  // UI state
  showFullPlayer: boolean;
  showQueue: boolean;
  showLyrics: boolean;
  
  // Error handling
  error: PlayerError | null;
  retryCount: number;
}

export enum NetworkQuality {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent',
}

export interface PlayerError {
  code: PlayerErrorCode;
  message: string;
  recoverable: boolean;
  timestamp: Date;
}

export enum PlayerErrorCode {
  NETWORK_ERROR = 'network_error',
  DECODE_ERROR = 'decode_error',
  SRC_NOT_SUPPORTED = 'src_not_supported',
  ABORTED = 'aborted',
  UNKNOWN = 'unknown',
}

// Player Actions
export interface PlayerActions {
  // Playback control
  play: (track?: Track) => Promise<void>;
  pause: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  
  // Navigation
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  seekTo: (position: number) => void;
  
  // Queue management
  addToQueue: (track: Track, position?: number) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  shuffleQueue: () => void;
  moveInQueue: (fromIndex: number, toIndex: number) => void;
  
  // Playback modes
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  
  // Audio settings
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setQuality: (quality: AudioQuality) => void;
  
  // UI control
  showFullPlayer: () => void;
  hideFullPlayer: () => void;
  toggleQueue: () => void;
  toggleLyrics: () => void;
  
  // Error handling
  retry: () => Promise<void>;
  clearError: () => void;
}

// Queue Management
export interface QueueItem {
  track: Track;
  addedAt: Date;
  addedBy?: string; // userId who added it
  source: QueueSource;
}

export enum QueueSource {
  USER_SELECTION = 'user_selection',
  AUTOPLAY = 'autoplay',
  PLAYLIST = 'playlist',
  ALBUM = 'album',
  RADIO = 'radio',
  RECOMMENDATION = 'recommendation',
}

export interface QueueState {
  items: QueueItem[];
  currentIndex: number;
  autoplay: boolean;
  autoplaySource?: AutoplaySource;
}

export enum AutoplaySource {
  SIMILAR_TRACKS = 'similar_tracks',
  SAME_ARTIST = 'same_artist',
  SAME_GENRE = 'same_genre',
  TRENDING = 'trending',
  PERSONALIZED = 'personalized',
}

// Playback History
export interface PlaybackSession {
  id: string;
  userId: string;
  trackId: string;
  
  // Session data
  startTime: Date;
  endTime?: Date;
  duration: number; // how long they listened
  completion: number; // percentage of track completed
  
  // Context
  source: PlaybackSource;
  device: DeviceInfo;
  
  // Quality metrics
  bufferEvents: number;
  skipCount: number;
  seekCount: number;
  
  // Engagement
  liked: boolean;
  shared: boolean;
  commented: boolean;
}

export enum PlaybackSource {
  DIRECT_PLAY = 'direct_play',
  QUEUE = 'queue',
  AUTOPLAY = 'autoplay',
  SEARCH = 'search',
  DISCOVERY = 'discovery',
  PLAYLIST = 'playlist',
  RECOMMENDATION = 'recommendation',
}

export interface DeviceInfo {
  type: DeviceType;
  os: string;
  browser?: string;
  model?: string;
  screenSize: string;
}

export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  TV = 'tv',
}

// Player Events
export interface PlayerEvent {
  type: PlayerEventType;
  timestamp: Date;
  data?: Record<string, any>;
}

export enum PlayerEventType {
  TRACK_STARTED = 'track_started',
  TRACK_ENDED = 'track_ended',
  TRACK_PAUSED = 'track_paused',
  TRACK_RESUMED = 'track_resumed',
  TRACK_SEEKED = 'track_seeked',
  TRACK_SKIPPED = 'track_skipped',
  QUEUE_UPDATED = 'queue_updated',
  VOLUME_CHANGED = 'volume_changed',
  QUALITY_CHANGED = 'quality_changed',
  ERROR_OCCURRED = 'error_occurred',
  BUFFER_START = 'buffer_start',
  BUFFER_END = 'buffer_end',
}

// Player Configuration
export interface PlayerConfig {
  // Audio settings
  defaultVolume: number;
  defaultQuality: AudioQuality;
  
  // Behavior
  autoplay: boolean;
  gaplessPlayback: boolean;
  
  // UI preferences
  showWaveform: boolean;
  showLyrics: boolean;
  showQueue: boolean;
  
  // Performance
  bufferSize: number; // seconds
  maxRetries: number;
  retryDelay: number; // seconds
  
  // Analytics
  trackPlayback: boolean;
  sendAnalytics: boolean;
}