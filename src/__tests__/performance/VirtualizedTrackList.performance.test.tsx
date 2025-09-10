import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { VirtualizedTrackList } from '../../components/optimized/VirtualizedTrackList';
import { mockTracks } from '../../utils/testUtils';
import { performanceMonitor } from '../../utils/performance';

// Mock performance monitoring
jest.mock('../../utils/performance', () => ({
  performanceMonitor: {
    startMeasure: jest.fn(() => jest.fn()),
    recordMetrics: jest.fn(),
  },
  useDebounce: jest.fn((callback) => callback),
  useInteractionPerformance: () => ({
    measureInteraction: jest.fn((name, callback) => callback()),
  }),
}));

// Mock hooks
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      primary: '#3B82F6',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
    },
    spacing: { md: 16, sm: 8 },
  }),
}));

// Mock optimized components
jest.mock('../../components/optimized/OptimizedTrackCard', () => ({
  OptimizedTrackCard: ({ track, onPress, onInvest, testID }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <Pressable testID={testID} onPress={() => onPress(track)}>
        <View>
          <Text>{track.title}</Text>
        </View>
      </Pressable>
    );
  },
}));

describe('VirtualizedTrackList Performance Tests', () => {
  const mockOnTrackPress = jest.fn();
  const mockOnTrackInvest = jest.fn();
  const mockOnRefresh = jest.fn();
  const mockOnLoadMore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    performanceMonitor.startMeasure.mockReturnValue(jest.fn());
  });

  describe('Render Performance', () => {
    it('renders large lists efficiently', () => {
      const largeTracks = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTracks[0],
        id: `track-${i}`,
        title: `Track ${i}`,
      }));

      const startTime = performance.now();
      
      render(
        <VirtualizedTrackList
          tracks={largeTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
        />
      );
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // Should render large lists quickly
    });

    it('maintains performance with frequent updates', () => {
      const { rerender } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
        />
      );

      const renderTimes: number[] = [];
      
      // Simulate frequent updates
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        const updatedTracks = mockTracks.map(track => ({
          ...track,
          socialStats: {
            ...track.socialStats,
            plays: track.socialStats.plays + i,
          },
        }));
        
        rerender(
          <VirtualizedTrackList
            tracks={updatedTracks}
            onTrackPress={mockOnTrackPress}
            onTrackInvest={mockOnTrackInvest}
          />
        );
        
        const renderTime = performance.now() - startTime;
        renderTimes.push(renderTime);
      }
      
      const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      expect(averageRenderTime).toBeLessThan(20); // Should handle updates efficiently
    });

    it('optimizes memory usage with virtualization', () => {
      const largeTracks = Array.from({ length: 10000 }, (_, i) => ({
        ...mockTracks[0],
        id: `track-${i}`,
        title: `Track ${i}`,
      }));

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      const { unmount } = render(
        <VirtualizedTrackList
          tracks={largeTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
        />
      );
      
      const peakMemory = (performance as any).memory?.usedJSHeapSize || 0;
      unmount();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = peakMemory - initialMemory;
      const memoryCleanup = peakMemory - finalMemory;
      
      // Memory increase should be reasonable for large lists (virtualization)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
      
      // Should clean up most memory after unmount
      expect(memoryCleanup).toBeGreaterThan(memoryIncrease * 0.7); // At least 70% cleanup
    });
  });

  describe('Scroll Performance', () => {
    it('handles fast scrolling efficiently', async () => {
      const largeTracks = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTracks[0],
        id: `track-${i}`,
        title: `Track ${i}`,
      }));

      const { getByTestId } = render(
        <VirtualizedTrackList
          tracks={largeTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          testID="track-list"
        />
      );

      const list = getByTestId('track-list');
      const scrollTimes: number[] = [];
      
      // Simulate fast scrolling
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        await act(async () => {
          fireEvent.scroll(list, {
            nativeEvent: {
              contentOffset: { y: i * 1000 },
              contentSize: { height: 50000 },
              layoutMeasurement: { height: 800 },
            },
          });
        });
        
        const scrollTime = performance.now() - startTime;
        scrollTimes.push(scrollTime);
      }
      
      const averageScrollTime = scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;
      expect(averageScrollTime).toBeLessThan(16); // Should maintain 60fps during scroll
    });

    it('debounces load more requests efficiently', async () => {
      const { getByTestId } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          onLoadMore={mockOnLoadMore}
          hasMore={true}
          testID="track-list"
        />
      );

      const list = getByTestId('track-list');
      
      // Trigger multiple end reached events rapidly
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          fireEvent(list, 'onEndReached');
        });
      }
      
      // Should debounce and only call once
      expect(mockOnLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  describe('Refresh Performance', () => {
    it('handles refresh efficiently', async () => {
      const { getByTestId } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          onRefresh={mockOnRefresh}
          testID="track-list"
        />
      );

      const startTime = performance.now();
      
      await act(async () => {
        fireEvent(getByTestId('track-list'), 'onRefresh');
      });
      
      const refreshTime = performance.now() - startTime;
      expect(refreshTime).toBeLessThan(50); // Refresh should be fast
      expect(performanceMonitor.startMeasure).toHaveBeenCalledWith('refresh-tracks');
    });

    it('maintains performance during refresh with large datasets', async () => {
      const largeTracks = Array.from({ length: 5000 }, (_, i) => ({
        ...mockTracks[0],
        id: `track-${i}`,
        title: `Track ${i}`,
      }));

      const { getByTestId, rerender } = render(
        <VirtualizedTrackList
          tracks={largeTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          onRefresh={mockOnRefresh}
          refreshing={false}
          testID="track-list"
        />
      );

      const startTime = performance.now();
      
      // Simulate refresh state change
      rerender(
        <VirtualizedTrackList
          tracks={largeTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          onRefresh={mockOnRefresh}
          refreshing={true}
          testID="track-list"
        />
      );
      
      const refreshRenderTime = performance.now() - startTime;
      expect(refreshRenderTime).toBeLessThan(30); // Should handle refresh state efficiently
    });
  });

  describe('Memory Management', () => {
    it('prevents memory leaks with frequent mount/unmount', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Mount and unmount multiple times
      for (let i = 0; i < 20; i++) {
        const { unmount } = render(
          <VirtualizedTrackList
            tracks={mockTracks}
            onTrackPress={mockOnTrackPress}
            onTrackInvest={mockOnTrackInvest}
          />
        );
        unmount();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryDiff = finalMemory - initialMemory;
      
      // Memory difference should be minimal
      expect(memoryDiff).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
    });

    it('efficiently manages item rendering with virtualization', () => {
      const largeTracks = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTracks[0],
        id: `track-${i}`,
        title: `Track ${i}`,
      }));

      const { getAllByTestId } = render(
        <VirtualizedTrackList
          tracks={largeTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
        />
      );

      // Should only render visible items, not all 1000
      const renderedItems = getAllByTestId(/track-card-/);
      expect(renderedItems.length).toBeLessThan(50); // Should virtualize and render only visible items
    });
  });

  describe('Interaction Performance', () => {
    it('handles item interactions efficiently', async () => {
      const { getAllByTestId } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
        />
      );

      const trackCards = getAllByTestId(/track-card-/);
      const interactionTimes: number[] = [];
      
      // Test multiple interactions
      for (let i = 0; i < Math.min(5, trackCards.length); i++) {
        const startTime = performance.now();
        
        await act(async () => {
          fireEvent.press(trackCards[i]);
        });
        
        const interactionTime = performance.now() - startTime;
        interactionTimes.push(interactionTime);
      }
      
      const averageInteractionTime = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length;
      expect(averageInteractionTime).toBeLessThan(50); // Interactions should be fast
    });

    it('maintains performance with rapid interactions', async () => {
      const { getAllByTestId } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
        />
      );

      const trackCards = getAllByTestId(/track-card-/);
      const startTime = performance.now();
      
      // Rapid fire interactions
      for (let i = 0; i < Math.min(10, trackCards.length); i++) {
        await act(async () => {
          fireEvent.press(trackCards[i % trackCards.length]);
        });
      }
      
      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(200); // All interactions should complete quickly
    });
  });

  describe('Compact Mode Performance', () => {
    it('renders compact mode more efficiently', () => {
      const startTimeNormal = performance.now();
      
      const { unmount: unmountNormal } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          compact={false}
        />
      );
      
      const normalRenderTime = performance.now() - startTimeNormal;
      unmountNormal();
      
      const startTimeCompact = performance.now();
      
      const { unmount: unmountCompact } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          compact={true}
        />
      );
      
      const compactRenderTime = performance.now() - startTimeCompact;
      unmountCompact();
      
      // Compact mode should be faster or equal
      expect(compactRenderTime).toBeLessThanOrEqual(normalRenderTime * 1.1); // Allow 10% variance
    });

    it('uses less memory in compact mode', () => {
      const normalMemoryStart = (performance as any).memory?.usedJSHeapSize || 0;
      
      const { unmount: unmountNormal } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          compact={false}
        />
      );
      
      const normalMemoryEnd = (performance as any).memory?.usedJSHeapSize || 0;
      unmountNormal();
      
      const compactMemoryStart = (performance as any).memory?.usedJSHeapSize || 0;
      
      const { unmount: unmountCompact } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          compact={true}
        />
      );
      
      const compactMemoryEnd = (performance as any).memory?.usedJSHeapSize || 0;
      unmountCompact();
      
      const normalMemoryUsage = normalMemoryEnd - normalMemoryStart;
      const compactMemoryUsage = compactMemoryEnd - compactMemoryStart;
      
      // Compact mode should use less or equal memory
      expect(compactMemoryUsage).toBeLessThanOrEqual(normalMemoryUsage);
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('monitors refresh performance', async () => {
      const { getByTestId } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          onRefresh={mockOnRefresh}
          testID="track-list"
        />
      );

      await act(async () => {
        fireEvent(getByTestId('track-list'), 'onRefresh');
      });

      expect(performanceMonitor.startMeasure).toHaveBeenCalledWith('refresh-tracks');
    });

    it('monitors load more performance', async () => {
      const { getByTestId } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          onLoadMore={mockOnLoadMore}
          hasMore={true}
          testID="track-list"
        />
      );

      await act(async () => {
        fireEvent(getByTestId('track-list'), 'onEndReached');
      });

      expect(performanceMonitor.startMeasure).toHaveBeenCalledWith('load-more-tracks');
    });
  });

  describe('Edge Cases Performance', () => {
    it('handles empty list efficiently', () => {
      const startTime = performance.now();
      
      render(
        <VirtualizedTrackList
          tracks={[]}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
        />
      );
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(10); // Empty list should render very fast
    });

    it('handles single item efficiently', () => {
      const startTime = performance.now();
      
      render(
        <VirtualizedTrackList
          tracks={[mockTracks[0]]}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
        />
      );
      
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(15); // Single item should render fast
    });

    it('maintains performance with loading states', () => {
      const { rerender } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          loading={false}
        />
      );

      const startTime = performance.now();
      
      rerender(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={mockOnTrackPress}
          onTrackInvest={mockOnTrackInvest}
          loading={true}
        />
      );
      
      const rerenderTime = performance.now() - startTime;
      expect(rerenderTime).toBeLessThan(20); // Loading state changes should be fast
    });
  });
});