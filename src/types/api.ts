// API request and response types

import {
  User,
  Track,
  Artist,
  Investment,
  Comment,
  Portfolio,
  Genre,
  TrackStatus,
  InvestmentStatus,
  NotificationType
} from './models';

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string; // For validation errors
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Authentication API
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName: string;
  role: 'artist' | 'investor';
  agreedToTerms: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Track API
export interface CreateTrackRequest {
  title: string;
  genre: Genre;
  tags: string[];
  description?: string;
  fundingGoal: number;
  minimumInvestment: number;
  expectedROI: number;
  releaseDate?: string;
  fundingDeadline?: string;
}

export interface UpdateTrackRequest {
  title?: string;
  genre?: Genre;
  tags?: string[];
  description?: string;
  fundingGoal?: number;
  minimumInvestment?: number;
  expectedROI?: number;
  releaseDate?: string;
  fundingDeadline?: string;
}

export interface GetTracksRequest {
  page?: number;
  pageSize?: number;
  genre?: Genre;
  status?: TrackStatus;
  artistId?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'funded' | 'roi';
  sortOrder?: 'asc' | 'desc';
}

// Investment API
export interface CreateInvestmentRequest {
  trackId: string;
  amount: number;
  paymentMethod: 'usdc' | 'credit_card' | 'bank_transfer';
  paymentDetails?: Record<string, any>;
}

export interface GetInvestmentsRequest {
  page?: number;
  pageSize?: number;
  status?: InvestmentStatus;
  trackId?: string;
  investorId?: string;
  sortBy?: 'newest' | 'oldest' | 'amount' | 'roi';
  sortOrder?: 'asc' | 'desc';
}

// Social API
export interface CreateCommentRequest {
  trackId: string;
  content: string;
  timestamp?: number; // Position in track
  parentId?: string; // For replies
}

export interface GetCommentsRequest {
  trackId: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'newest' | 'oldest' | 'popular';
}

export interface LikeRequest {
  targetId: string;
  targetType: 'track' | 'comment' | 'artist';
}

export interface FollowRequest {
  userId: string;
}

export interface ShareRequest {
  trackId: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'whatsapp' | 'telegram' | 'copy_link' | 'email';
}

// Search API
export interface SearchRequest {
  query: string;
  type?: 'all' | 'tracks' | 'artists' | 'users';
  page?: number;
  pageSize?: number;
}

export interface SearchFilters {
  genre?: Genre[];
  minROI?: number;
  maxROI?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// HTTP Status Codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}