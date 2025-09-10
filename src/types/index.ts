// Main types export file

// Core models
export * from './models';

// Player-specific types
export * from './player';

// API types
export * from './api';

// Re-export commonly used types with aliases for convenience
export type {
  User,
  Track,
  Artist,
  Investment,
  Comment,
  Portfolio,
  ApiResponse,
  PaginatedResponse,
} from './models';

export type {
  PlayerActions,
  QueueItem,
  PlaybackSession,
} from './player';

export type {
  LoginRequest,
  LoginResponse,
  CreateTrackRequest,
  CreateInvestmentRequest,
  SearchRequest,
} from './api';

// Utility types
export type ID = string;
export type Timestamp = Date;
export type Currency = number;
export type Percentage = number;
export type Duration = number;

// Common enums for easy access
export {
  Genre,
  TrackStatus,
  InvestmentStatus,
  PaymentMethod,
  RepeatMode,
  AudioQuality,
  ErrorType,
  ErrorSeverity,
  NotificationType,
} from './models';

export {
  PlayerEventType,
  NetworkQuality,
  PlaybackSource,
  DeviceType,
} from './player';

export {
  HttpStatus,
} from './api';