import { renderHook, act } from '@testing-library/react-native';
import { useTracksStore } from '../tracksStore';
import { mockTracks } from '../../data/mockData';
import { Genre } from '../../types';

// Mock the mock data
jest.mock('../../data/mockData', () => ({
  mockTracks: [
    {
      id: 'track-1',
      title: 'Test Track 1',
      artist: { stageName: 'Artist 1' },
      genre: 'Electronic',
      tags: ['electronic', 'ambient'],
      expectedROI: 12.5,
      sharePrice: 10,
      currentFunding: 5000,
      fundingGoal: 10000,
      socialStats: { likes: 100, plays: 1000 },
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'track-2',
      title: 'Test Track 2',
      artist: { stageName: 'Artist 2' },
      genre: 'Hip-Hop',
      tags: ['hip-hop', 'beats'],
      expectedROI: 8.5,
      sharePrice: 15,
      currentFunding: 8000,
      fundingGoal: 12000,
      socialStats: { likes: 200, plays: 2000 },
      createdAt: new Date('2024-01-02'),
    },
  ],
}));

describe('TracksStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useTracksStore());
    act(() => {
      result.current.setTracks(mockTracks);
      result.current.clearFilters();
    });
  });

  it('initializes with mock tracks', () => {
    const { result } = renderHook(() => useTracksStore());
    
    expect(result.current.tracks).toHaveLength(2);
    expect(result.current.filteredTracks).toHaveLength(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets search query and filters tracks', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setSearchQuery('Track 1');
    });
    
    expect(result.current.searchQuery).toBe('Track 1');
    expect(result.current.filteredTracks).toHaveLength(1);
    expect(result.current.filteredTracks[0].title).toBe('Test Track 1');
  });

  it('filters by artist name', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setSearchQuery('Artist 2');
    });
    
    expect(result.current.filteredTracks).toHaveLength(1);
    expect(result.current.filteredTracks[0].artist.stageName).toBe('Artist 2');
  });

  it('filters by genre', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setFilters({ genre: [Genre.ELECTRONIC] });
      result.current.applyFilters();
    });
    
    expect(result.current.filteredTracks).toHaveLength(1);
    expect(result.current.filteredTracks[0].genre).toBe('Electronic');
  });

  it('filters by tags', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setSearchQuery('ambient');
    });
    
    expect(result.current.filteredTracks).toHaveLength(1);
    expect(result.current.filteredTracks[0].tags).toContain('ambient');
  });

  it('filters by minimum ROI', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setFilters({ minROI: 10 });
      result.current.applyFilters();
    });
    
    expect(result.current.filteredTracks).toHaveLength(1);
    expect(result.current.filteredTracks[0].expectedROI).toBeGreaterThanOrEqual(10);
  });

  it('filters by maximum ROI', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setFilters({ maxROI: 10 });
      result.current.applyFilters();
    });
    
    expect(result.current.filteredTracks).toHaveLength(1);
    expect(result.current.filteredTracks[0].expectedROI).toBeLessThanOrEqual(10);
  });

  it('filters by price range', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setFilters({ priceRange: [10, 12] });
      result.current.applyFilters();
    });
    
    expect(result.current.filteredTracks).toHaveLength(1);
    expect(result.current.filteredTracks[0].sharePrice).toBe(10);
  });

  it('filters by funding status - active', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setFilters({ fundingStatus: 'active' });
      result.current.applyFilters();
    });
    
    // Both tracks are partially funded (not 100%)
    expect(result.current.filteredTracks).toHaveLength(2);
  });

  it('sorts by most popular', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setFilters({ sortBy: 'most_popular' });
      result.current.applyFilters();
    });
    
    // Should be sorted by likes (descending)
    expect(result.current.filteredTracks[0].socialStats.likes).toBe(200);
    expect(result.current.filteredTracks[1].socialStats.likes).toBe(100);
  });

  it('sorts by highest ROI', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setFilters({ sortBy: 'highest_roi' });
      result.current.applyFilters();
    });
    
    // Should be sorted by ROI (descending)
    expect(result.current.filteredTracks[0].expectedROI).toBe(12.5);
    expect(result.current.filteredTracks[1].expectedROI).toBe(8.5);
  });

  it('sorts by newest', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setFilters({ sortBy: 'newest' });
      result.current.applyFilters();
    });
    
    // Should be sorted by creation date (newest first)
    expect(result.current.filteredTracks[0].createdAt.getTime())
      .toBeGreaterThan(result.current.filteredTracks[1].createdAt.getTime());
  });

  it('toggles like for a track', () => {
    const { result } = renderHook(() => useTracksStore());
    
    const initialLikes = result.current.tracks[0].socialStats.likes;
    
    act(() => {
      result.current.toggleLike('track-1');
    });
    
    const updatedTrack = result.current.tracks.find(t => t.id === 'track-1');
    expect(updatedTrack?.socialStats.likes).toBe(initialLikes - 1);
  });

  it('gets track by ID', () => {
    const { result } = renderHook(() => useTracksStore());
    
    const track = result.current.getTrackById('track-1');
    expect(track).toBeDefined();
    expect(track?.id).toBe('track-1');
    expect(track?.title).toBe('Test Track 1');
  });

  it('returns undefined for non-existent track ID', () => {
    const { result } = renderHook(() => useTracksStore());
    
    const track = result.current.getTrackById('non-existent');
    expect(track).toBeUndefined();
  });

  it('gets trending tracks', () => {
    const { result } = renderHook(() => useTracksStore());
    
    const trendingTracks = result.current.getTrendingTracks();
    expect(trendingTracks).toHaveLength(2);
    // Should be sorted by plays (descending)
    expect(trendingTracks[0].socialStats.plays).toBe(2000);
    expect(trendingTracks[1].socialStats.plays).toBe(1000);
  });

  it('gets tracks by genre', () => {
    const { result } = renderHook(() => useTracksStore());
    
    const electronicTracks = result.current.getTracksByGenre(Genre.ELECTRONIC);
    expect(electronicTracks).toHaveLength(1);
    expect(electronicTracks[0].genre).toBe('Electronic');
  });

  it('clears filters', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setSearchQuery('test');
      result.current.setFilters({ minROI: 10 });
      result.current.clearFilters();
    });
    
    expect(result.current.searchQuery).toBe('');
    expect(result.current.filters.minROI).toBeUndefined();
    expect(result.current.filteredTracks).toHaveLength(2);
  });

  it('loads tracks successfully', async () => {
    const { result } = renderHook(() => useTracksStore());
    
    await act(async () => {
      await result.current.loadTracks();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.tracks).toHaveLength(2);
  });

  it('combines multiple filters', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setSearchQuery('Track');
      result.current.setFilters({ 
        genre: [Genre.ELECTRONIC],
        minROI: 10,
        sortBy: 'highest_roi'
      });
      result.current.applyFilters();
    });
    
    expect(result.current.filteredTracks).toHaveLength(1);
    expect(result.current.filteredTracks[0].genre).toBe('Electronic');
    expect(result.current.filteredTracks[0].expectedROI).toBeGreaterThanOrEqual(10);
  });

  it('handles empty search results', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setSearchQuery('nonexistent');
    });
    
    expect(result.current.filteredTracks).toHaveLength(0);
  });

  it('handles case-insensitive search', () => {
    const { result } = renderHook(() => useTracksStore());
    
    act(() => {
      result.current.setSearchQuery('TRACK 1');
    });
    
    expect(result.current.filteredTracks).toHaveLength(1);
    expect(result.current.filteredTracks[0].title).toBe('Test Track 1');
  });
});