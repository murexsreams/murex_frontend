// Core data models for the Murex Streams platform

// User Models
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  
  // Profile information
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  
  // Social links
  socialLinks?: SocialLinks;
  
  // Account status
  verified: boolean;
  active: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum UserRole {
  ARTIST = 'artist',
  INVESTOR = 'investor',
  ADMIN = 'admin',
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  spotify?: string;
  soundcloud?: string;
  youtube?: string;
}

// Artist Models
export interface Artist {
  id: string;
  userId: string;
  user?: User;
  
  // Artist information
  stageName: string;
  realName?: string;
  bio?: string;
  avatar?: string;
  
  // Verification and status
  verified: boolean;
  
  // Statistics
  totalTracks: number;
  totalStreams: number;
  totalFunding: number;
  followerCount: number;
  
  // Social links
  socialLinks?: SocialLinks;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Track Models
export interface Track {
  id: string;
  artistId: string;
  artist: Artist;
  
  // Basic information
  title: string;
  description?: string;
  duration: number; // in seconds
  
  // Audio files
  audioUrl: string;
  waveformData: number[];
  
  // Visual assets
  coverArt: string;
  coverArtThumbnail?: string;
  
  // Categorization
  genre: Genre;
  tags: string[];
  
  // Funding information
  fundingGoal: number; // in USDC
  currentFunding: number; // in USDC
  minimumInvestment: number; // in USDC
  expectedROI: number; // percentage
  sharePrice: number; // in USDC
  totalShares: number;
  availableShares: number;
  
  // Investment metrics
  totalInvestors: number;
  
  // Social metrics
  socialStats: SocialStats;
  
  // Status and lifecycle
  status: TrackStatus;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  fundingDeadline?: Date;
  releaseDate?: Date;
}

export interface SocialStats {
  plays: number;
  likes: number;
  comments: number;
  shares: number;
}

export enum TrackStatus {
  DRAFT = 'draft',
  FUNDING = 'funding',
  FUNDED = 'funded',
  RELEASED = 'released',
  ARCHIVED = 'archived',
}

export enum Genre {
  ELECTRONIC = 'electronic',
  HIP_HOP = 'hip-hop',
  POP = 'pop',
  ROCK = 'rock',
  JAZZ = 'jazz',
  CLASSICAL = 'classical',
  COUNTRY = 'country',
  R_AND_B = 'r&b',
  REGGAE = 'reggae',
  FOLK = 'folk',
  INDIE = 'indie',
  ALTERNATIVE = 'alternative',
  OTHER = 'other',
}

// Investment Models
export interface Investment {
  id: string;
  userId: string;
  trackId: string;
  
  // Investment details
  amount: number; // in USDC
  shares: number;
  sharePrice: number; // in USDC at time of investment
  
  // Status
  status: InvestmentStatus;
  
  // Returns
  currentValue: number; // in USDC
  totalReturns: number; // in USDC
  roi: number; // percentage
  
  // Payment information
  paymentMethod: PaymentMethod;
  transactionHash?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

export enum InvestmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  USDC = 'usdc',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
}

// Portfolio Models
export interface Portfolio {
  id: string;
  userId: string;
  totalValue: number; // in USDC
  totalInvested: number; // in USDC
  totalReturns: number; // in USDC
  totalROI: number; // percentage
  
  investments: Investment[];
  
  // Performance tracking
  performanceHistory: PortfolioPerformance[];
  
  // Diversification
  genreDistribution: GenreDistribution[];
  artistDistribution: ArtistDistribution[];
  
  lastUpdated: Date;
}

export interface PortfolioPerformance {
  date: Date;
  totalValue: number;
  totalReturns: number;
  roi: number;
}

export interface GenreDistribution {
  genre: Genre;
  percentage: number;
  value: number;
}

export interface ArtistDistribution {
  artistId: string;
  artistName: string;
  percentage: number;
  value: number;
}

// Social Models
export interface Comment {
  id: string;
  trackId: string;
  userId: string;
  user: User;
  
  content: string;
  timestamp: number; // position in track where comment was made (seconds)
  
  // Social interactions
  likes: number;
  replies: Comment[];
  
  // Moderation
  flagged: boolean;
  hidden: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  id: string;
  userId: string;
  targetId: string; // can be trackId, commentId, etc.
  targetType: LikeTargetType;
  createdAt: Date;
}

export enum LikeTargetType {
  TRACK = 'track',
  COMMENT = 'comment',
  ARTIST = 'artist',
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface Share {
  id: string;
  userId: string;
  trackId: string;
  platform: SharePlatform;
  createdAt: Date;
}

export enum SharePlatform {
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  COPY_LINK = 'copy_link',
  EMAIL = 'email',
}

// Notification Models
export interface Notification {
  id: string;
  userId: string;
  
  type: NotificationType;
  title: string;
  message: string;
  
  // Associated data
  data?: Record<string, any>;
  
  // Status
  read: boolean;
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
}

export enum NotificationType {
  NEW_TRACK = 'new_track',
  INVESTMENT_CONFIRMED = 'investment_confirmed',
  FUNDING_COMPLETED = 'funding_completed',
  TRACK_RELEASED = 'track_released',
  NEW_FOLLOWER = 'new_follower',
  COMMENT_RECEIVED = 'comment_received',
  LIKE_RECEIVED = 'like_received',
  PAYOUT_RECEIVED = 'payout_received',
  SYSTEM_UPDATE = 'system_update',
}

// Error Models
export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
  stack?: string;
  handled: boolean;
}

export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  AUDIO = 'audio',
  UPLOAD = 'upload',
  PAYMENT = 'payment',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// API Response Models
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Player Models (simplified versions for compatibility)
export enum RepeatMode {
  OFF = 'off',
  ONE = 'one',
  ALL = 'all',
}

export enum AudioQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  LOSSLESS = 'lossless',
}

// Utility Types
export type ID = string;
export type Timestamp = Date;
export type Currency = number;
export type Percentage = number;
export type Duration = number;