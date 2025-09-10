import { create } from 'zustand';
import { Track, Artist, Genre, TrackStatus, SortOption } from '../types';

// Extended track type with additional UI properties
export interface ExtendedTrack extends Track {
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
  streamCount?: number;
  estimatedROI?: number;
  followerCount?: number;
}

// Local filters interface
export interface LocalTrackFilters {
  genre?: Genre[];
  minROI?: number;
  maxROI?: number;
  priceRange?: [number, number];
  fundingStatus?: 'all' | 'active' | 'completed';
  sortBy?: SortOption | 'most_popular';
}

interface TracksState {
  tracks: ExtendedTrack[];
  filteredTracks: ExtendedTrack[];
  searchQuery: string;
  filters: LocalTrackFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTracks: (tracks: ExtendedTrack[]) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<LocalTrackFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  toggleLike: (trackId: string) => void;
  loadTracks: () => Promise<void>;
  getTrackById: (id: string) => ExtendedTrack | undefined;
  getTrendingTracks: () => ExtendedTrack[];
  getTracksByGenre: (genre: Genre) => ExtendedTrack[];
}

const defaultFilters: LocalTrackFilters = {
  genre: undefined,
  minROI: undefined,
  maxROI: undefined,
  priceRange: undefined,
  sortBy: 'most_popular',
  fundingStatus: undefined,
};

import { mockTracks } from '../data/mockData';

// Convert mockTracks to ExtendedTrack format
const extendedMockTracks: ExtendedTrack[] = mockTracks.map(track => ({
  ...track,
  isLiked: false,
  likeCount: track.socialStats.likes,
  commentCount: track.socialStats.comments,
  streamCount: track.socialStats.plays,
  estimatedROI: track.expectedROI,
  followerCount: track.artist.followers,
}));

export const useTracksStore = create<TracksState>((set, get) => ({
  tracks: extendedMockTracks,
  filteredTracks: extendedMockTracks,
  searchQuery: '',
  filters: defaultFilters,
  isLoading: false,
  error: null,

  setTracks: (tracks) => set({ tracks, filteredTracks: tracks }),

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().applyFilters();
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  applyFilters: () => {
    const { tracks, searchQuery, filters } = get();
    let filtered = [...tracks];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        track =>
          track.title.toLowerCase().includes(query) ||
          track.artist.stageName.toLowerCase().includes(query) ||
          track.genre.toLowerCase().includes(query) ||
          track.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Apply genre filter
    if (filters.genre && filters.genre.length > 0) {
      filtered = filtered.filter(track => filters.genre!.includes(track.genre));
    }

    // Apply ROI filter
    if (filters.minROI !== undefined) {
      filtered = filtered.filter(track => track.expectedROI >= filters.minROI!);
    }
    if (filters.maxROI !== undefined) {
      filtered = filtered.filter(track => track.expectedROI <= filters.maxROI!);
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(
        track =>
          track.sharePrice >= filters.priceRange![0] &&
          track.sharePrice <= filters.priceRange![1]
      );
    }

    // Apply funding status filter
    if (filters.fundingStatus && filters.fundingStatus !== 'all') {
      filtered = filtered.filter(track => {
        const fundingProgress = (track.currentFunding / track.fundingGoal) * 100;
        switch (filters.fundingStatus) {
          case 'active':
            return fundingProgress < 100;
          case 'completed':
            return fundingProgress >= 100;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'most_popular':
          return (b.likeCount || 0) - (a.likeCount || 0);
        case 'highest_roi':
          return (b.estimatedROI || 0) - (a.estimatedROI || 0);
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'most_funded':
          const aProgress = (a.currentFunding / a.fundingGoal) * 100;
          const bProgress = (b.currentFunding / b.fundingGoal) * 100;
          return bProgress - aProgress;
        default:
          return 0;
      }
    });

    set({ filteredTracks: filtered });
  },

  clearFilters: () => {
    set({ 
      filters: defaultFilters, 
      searchQuery: '',
      filteredTracks: get().tracks 
    });
  },

  toggleLike: (trackId) => {
    const { tracks } = get();
    const updatedTracks = tracks.map(track => {
      if (track.id === trackId) {
        const currentLikes = track.likeCount || 0;
        const isLiked = track.isLiked || false;
        const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;
        
        return {
          ...track,
          isLiked: !isLiked,
          likeCount: newLikes,
          socialStats: {
            ...track.socialStats,
            likes: newLikes,
          },
        };
      }
      return track;
    });
    
    set({ tracks: updatedTracks });
    get().applyFilters();
  },

  loadTracks: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would fetch from an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ 
        tracks: extendedMockTracks, 
        filteredTracks: extendedMockTracks,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load tracks',
        isLoading: false 
      });
    }
  },

  getTrackById: (id: string) => {
    const { tracks } = get();
    return tracks.find(track => track.id === id);
  },

  getTrendingTracks: () => {
    const { tracks } = get();
    return tracks
      .sort((a, b) => (b.streamCount || 0) - (a.streamCount || 0))
      .slice(0, 10);
  },

  getTracksByGenre: (genre: Genre) => {
    const { tracks } = get();
    return tracks.filter(track => track.genre === genre);
  },
}));