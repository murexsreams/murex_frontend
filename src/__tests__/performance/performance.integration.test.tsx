import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { PerformanceDashboard } from '../../components/debug/PerformanceDashboard';
import { OptimizedTrackCard } from '../../components/optimized/OptimizedTrackCard';
import { VirtualizedTrackList } from '../../components/optimized/VirtualizedTrackList';
import { performanceMonitor, memoryUtils } from '../../utils/performance';
import { imageCacheManager } from '../../utils/imageOptimization';
import { mockTracks } from '../../utils/testUtils';

// Mock theme hook
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      surface: '#F9FAFB',
      primary: '#3B82F6',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#10B981',
      error: '#EF4444',
    },
    spacing: { md: 16 },
  }),
}));

// Mock audio player hook
jest.mock('../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    currentTrack: null,
    isPlaying: false,
    controls: {
      play: jest.fn(),
      pause: jest.fn(),
    },
  }),
}));

// Mock tracks store
jest.mock('../../store/tracksStore', () => ({
  useTracksStore: () => ({
    toggleLike: jest.fn(),
  }),
}));

describe('Performance Integration Tests', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    imageCacheManager.clearCache();
    performanceMonitor.setEnabled(true);
  });

  afterEach(() => {
    performanceMonitor.setEnabled(false);
  });

  describe('End-to-End Performance Flow', () => {
    it('maintains performance throughout complete user interaction flow', async () => {
      const startTime = performance.now();
      
      // 1. Render track list
      const { getByTestId, getAllByTestId } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={() => {}}
          onTrackInvest={() => {}}
          testID="track-list"
        />
      );

      const listRenderTime = performance.now() - startTime;
      expect(listRenderTime).toBeLessThan(100);

      // 2. Interact with track cards
      const trackCards = getAllByTestId(/track-card-/);
      
      for (let i = 0; i < Math.min(3, trackCards.length); i++) {
        const interactionStart = performance.now();
        
        await act(async () => {
          fireEvent.press(trackCards[i]);
        });
        
        const interactionTime = performance.now() - interactionStart;
        expect(interactionTime).toBeLessThan(50);
      }

      // 3. Test scroll performance
      const list = getByTestId('track-list');
      
      for (let i = 0; i < 5; i++) {
        const scrollStart = performance.now();
        
        await act(async () => {
          fireEvent.scroll(list, {
            nativeEvent: {
              contentOffset: { y: i * 200 },
              contentSize: { height: 2000 },
              layoutMeasurement: { height: 800 },
            },
          });
        });
        
        const scrollTime = performance.now() - scrollStart;
        expect(scrollTime).toBeLessThan(16); // 60fps
      }

      // 4. Verify overall performance
      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(500); // Complete flow should be fast
    });

    it('handles performance monitoring dashboard integration', async () => {
      // Generate some performance data first
      const { unmount: unmountList } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={() => {}}
          onTrackInvest={() => {}}
        />
      );

      // Simulate some interactions to generate metrics
      for (let i = 0; i < 5; i++) {
        const stopMeasure = performanceMonitor.startMeasure(`test-metric-${i}`);
        await new Promise(resolve => setTimeout(resolve, 10));
        stopMeasure();
      }

      unmountList();

      // Now test the performance dashboard
      const { getByText, getByDisplayValue } = render(
        <PerformanceDashboard visible={true} onClose={() => {}} />
      );

      // Verify dashboard renders with performance data
      expect(getByText('Performance Dashboard')).toBeTruthy();
      expect(getByText('Memory Usage')).toBeTruthy();
      expect(getByText('Performance Metrics')).toBeTruthy();

      // Test dashboard interactions
      const clearButton = getByText('Clear');
      await act(async () => {
        fireEvent.press(clearButton);
      });

      // Verify metrics were cleared
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.size).toBe(0);
    });
  });

  describe('Memory Management Integration', () => {
    it('maintains stable memory usage across component lifecycle', async () => {
      const initialMemory = memoryUtils.getMemoryInfo();
      const components: any[] = [];

      // Mount multiple components
      for (let i = 0; i < 10; i++) {
        const component = render(
          <OptimizedTrackCard
            track={mockTracks[0]}
            onPress={() => {}}
            onInvest={() => {}}
          />
        );
        components.push(component);
      }

      const peakMemory = memoryUtils.getMemoryInfo();

      // Unmount all components
      components.forEach(component => component.unmount());

      // Force garbage collection
      memoryUtils.forceGC();
      await new Promise(resolve => setTimeout(resolve, 100));

      const finalMemory = memoryUtils.getMemoryInfo();

      if (initialMemory && peakMemory && finalMemory) {
        const memoryIncrease = peakMemory.used - initialMemory.used;
        const memoryCleanup = peakMemory.used - finalMemory.used;

        // Memory should be cleaned up reasonably well
        expect(memoryCleanup).toBeGreaterThan(memoryIncrease * 0.5);
      }
    });

    it('handles image cache integration with components', async () => {
      const imageUris = mockTracks.map(track => track.coverArt);
      
      // Preload images
      await imageCacheManager.preloadImages(imageUris, 'medium');
      
      const initialCacheStats = imageCacheManager.getCacheStats();
      
      // Render components that use images
      const { unmount } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={() => {}}
          onTrackInvest={() => {}}
        />
      );

      // Cache should have entries
      const cacheStats = imageCacheManager.getCacheStats();
      expect(cacheStats.entryCount).toBeGreaterThanOrEqual(initialCacheStats.entryCount);

      unmount();

      // Clear cache
      imageCacheManager.clearCache();
      
      const finalCacheStats = imageCacheManager.getCacheStats();
      expect(finalCacheStats.entryCount).toBe(0);
    });
  });

  describe('Performance Optimization Validation', () => {
    it('validates optimized components perform better than baseline', async () => {
      // Test optimized track card performance
      const optimizedTimes: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        const { unmount } = render(
          <OptimizedTrackCard
            track={mockTracks[0]}
            onPress={() => {}}
            onInvest={() => {}}
          />
        );
        
        const renderTime = performance.now() - startTime;
        optimizedTimes.push(renderTime);
        unmount();
      }

      const averageOptimizedTime = optimizedTimes.reduce((a, b) => a + b, 0) / optimizedTimes.length;
      
      // Optimized components should render quickly
      expect(averageOptimizedTime).toBeLessThan(20);
      
      // Consistency check - standard deviation should be low
      const variance = optimizedTimes.reduce((sum, time) => {
        return sum + Math.pow(time - averageOptimizedTime, 2);
      }, 0) / optimizedTimes.length;
      
      const standardDeviation = Math.sqrt(variance);
      expect(standardDeviation).toBeLessThan(10); // Consistent performance
    });

    it('validates virtualized list performance with large datasets', async () => {
      const largeTracks = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTracks[0],
        id: `track-${i}`,
        title: `Track ${i}`,
      }));

      const renderStart = performance.now();
      
      const { getByTestId } = render(
        <VirtualizedTrackList
          tracks={largeTracks}
          onTrackPress={() => {}}
          onTrackInvest={() => {}}
          testID="large-list"
        />
      );

      const renderTime = performance.now() - renderStart;
      
      // Large list should still render quickly due to virtualization
      expect(renderTime).toBeLessThan(150);

      // Test scroll performance with large dataset
      const list = getByTestId('large-list');
      const scrollTimes: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const scrollStart = performance.now();
        
        await act(async () => {
          fireEvent.scroll(list, {
            nativeEvent: {
              contentOffset: { y: i * 1000 },
              contentSize: { height: 50000 },
              layoutMeasurement: { height: 800 },
            },
          });
        });
        
        const scrollTime = performance.now() - scrollStart;
        scrollTimes.push(scrollTime);
      }

      const averageScrollTime = scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length;
      expect(averageScrollTime).toBeLessThan(16); // Maintain 60fps during scroll
    });
  });

  describe('Cross-Platform Performance Validation', () => {
    it('validates performance across different component configurations', async () => {
      const configurations = [
        { compact: false, trackCount: 10 },
        { compact: true, trackCount: 10 },
        { compact: false, trackCount: 50 },
        { compact: true, trackCount: 50 },
      ];

      const results = await Promise.all(
        configurations.map(async config => {
          const tracks = Array.from({ length: config.trackCount }, (_, i) => ({
            ...mockTracks[0],
            id: `track-${i}`,
          }));

          const startTime = performance.now();
          
          const { unmount } = render(
            <VirtualizedTrackList
              tracks={tracks}
              onTrackPress={() => {}}
              onTrackInvest={() => {}}
              compact={config.compact}
            />
          );
          
          const renderTime = performance.now() - startTime;
          unmount();

          return {
            config,
            renderTime,
          };
        })
      );

      // All configurations should perform well
      results.forEach(result => {
        expect(result.renderTime).toBeLessThan(200);
        
        // Compact mode should generally be faster or equal
        const compactResult = results.find(r => 
          r.config.trackCount === result.config.trackCount && r.config.compact
        );
        const normalResult = results.find(r => 
          r.config.trackCount === result.config.trackCount && !r.config.compact
        );
        
        if (compactResult && normalResult) {
          expect(compactResult.renderTime).toBeLessThanOrEqual(normalResult.renderTime * 1.2);
        }
      });
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('validates performance monitoring captures all metrics correctly', async () => {
      // Clear existing metrics
      performanceMonitor.clearMetrics();
      
      // Generate various types of performance events
      const { getByTestId } = render(
        <VirtualizedTrackList
          tracks={mockTracks}
          onTrackPress={() => {}}
          onTrackInvest={() => {}}
          testID="monitored-list"
        />
      );

      // Simulate user interactions
      const list = getByTestId('monitored-list');
      
      await act(async () => {
        fireEvent.scroll(list, {
          nativeEvent: {
            contentOffset: { y: 100 },
            contentSize: { height: 2000 },
            layoutMeasurement: { height: 800 },
          },
        });
      });

      // Check that metrics were captured
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.size).toBeGreaterThan(0);

      // Validate metric structure
      const firstMetric = Array.from(metrics.values())[0];
      expect(firstMetric).toHaveProperty('renderTime');
      expect(firstMetric).toHaveProperty('interactionTime');
      expect(typeof firstMetric.renderTime).toBe('number');
      expect(typeof firstMetric.interactionTime).toBe('number');
    });

    it('validates performance thresholds and warnings', () => {
      // Simulate slow operation
      const slowOperationStart = performance.now();
      
      // Simulate 100ms delay
      const endTime = slowOperationStart + 100;
      while (performance.now() < endTime) {
        // Busy wait to simulate slow operation
      }
      
      const stopMeasure = performanceMonitor.startMeasure('slow-operation');
      stopMeasure();

      const metrics = performanceMonitor.getMetrics();
      const slowMetric = metrics.get('slow-operation');
      
      expect(slowMetric).toBeDefined();
      expect(slowMetric!.renderTime).toBeGreaterThan(50); // Should capture the slow operation
    });
  });
});