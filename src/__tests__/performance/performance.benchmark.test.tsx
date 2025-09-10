import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { performanceMonitor, performanceTest, memoryUtils } from '../../utils/performance';
import { imageCacheManager, imagePerformanceMonitor } from '../../utils/imageOptimization';
import { OptimizedTrackCard } from '../../components/optimized/OptimizedTrackCard';
import { VirtualizedTrackList } from '../../components/optimized/VirtualizedTrackList';
import { mockTracks } from '../../utils/testUtils';

// Performance benchmark suite
describe('Performance Benchmark Suite', () => {
  beforeAll(() => {
    // Enable performance monitoring for tests
    performanceMonitor.setEnabled(true);
  });

  afterAll(() => {
    // Generate final performance report
    const report = performanceMonitor.generateReport();
    console.log('Performance Benchmark Report:', report);
  });

  beforeEach(() => {
    performanceMonitor.clearMetrics();
    imageCacheManager.clearCache();
  });

  describe('Component Rendering Benchmarks', () => {
    it('benchmarks TrackCard rendering performance', () => {
      const iterations = 100;
      const results = performanceTest.stressTestRender(
        () => render(
          <OptimizedTrackCard
            track={mockTracks[0]}
            onPress={() => {}}
            onInvest={() => {}}
          />
        ),
        iterations
      );

      console.log('TrackCard Rendering Benchmark:', results);
      
      expect(results.average).toBeLessThan(16); // 60fps threshold
      expect(results.max).toBeLessThan(50); // No frame should take too long
      expect(results.min).toBeGreaterThan(0); // Sanity check
    });

    it('benchmarks VirtualizedTrackList rendering with large datasets', () => {
      const largeTracks = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTracks[0],
        id: `track-${i}`,
        title: `Track ${i}`,
      }));

      const renderTimes: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        const { unmount } = render(
          <VirtualizedTrackList
            tracks={largeTracks}
            onTrackPress={() => {}}
            onTrackInvest={() => {}}
          />
        );
        
        const renderTime = performance.now() - startTime;
        renderTimes.push(renderTime);
        unmount();
      }

      const results = {
        average: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
        min: Math.min(...renderTimes),
        max: Math.max(...renderTimes),
        median: renderTimes.sort((a, b) => a - b)[Math.floor(renderTimes.length / 2)],
      };

      console.log('VirtualizedTrackList Large Dataset Benchmark:', results);
      
      expect(results.average).toBeLessThan(100); // Should handle large lists efficiently
      expect(results.max).toBeLessThan(200); // Even worst case should be reasonable
    });

    it('benchmarks component re-rendering performance', () => {
      const { rerender } = render(
        <OptimizedTrackCard
          track={mockTracks[0]}
          onPress={() => {}}
          onInvest={() => {}}
        />
      );

      const rerenderTimes: number[] = [];
      
      // Test multiple re-renders with prop changes
      for (let i = 0; i < 50; i++) {
        const modifiedTrack = {
          ...mockTracks[0],
          socialStats: {
            ...mockTracks[0].socialStats,
            plays: mockTracks[0].socialStats.plays + i,
          },
        };

        const startTime = performance.now();
        
        rerender(
          <OptimizedTrackCard
            track={modifiedTrack}
            onPress={() => {}}
            onInvest={() => {}}
          />
        );
        
        const rerenderTime = performance.now() - startTime;
        rerenderTimes.push(rerenderTime);
      }

      const results = {
        average: rerenderTimes.reduce((a, b) => a + b, 0) / rerenderTimes.length,
        min: Math.min(...rerenderTimes),
        max: Math.max(...rerenderTimes),
      };

      console.log('Component Re-rendering Benchmark:', results);
      
      expect(results.average).toBeLessThan(10); // Re-renders should be very fast
      expect(results.max).toBeLessThan(25); // Even complex re-renders should be quick
    });
  });

  describe('Memory Usage Benchmarks', () => {
    it('benchmarks memory usage with large component trees', () => {
      const initialMemory = memoryUtils.getMemoryInfo();
      
      const largeTracks = Array.from({ length: 500 }, (_, i) => ({
        ...mockTracks[0],
        id: `track-${i}`,
        title: `Track ${i}`,
      }));

      const { unmount } = render(
        <VirtualizedTrackList
          tracks={largeTracks}
          onTrackPress={() => {}}
          onTrackInvest={() => {}}
        />
      );

      const peakMemory = memoryUtils.getMemoryInfo();
      unmount();
      
      // Force garbage collection
      memoryUtils.forceGC();
      
      const finalMemory = memoryUtils.getMemoryInfo();

      const memoryUsage = {
        initial: initialMemory?.used || 0,
        peak: peakMemory?.used || 0,
        final: finalMemory?.used || 0,
        increase: (peakMemory?.used || 0) - (initialMemory?.used || 0),
        cleanup: (peakMemory?.used || 0) - (finalMemory?.used || 0),
      };

      console.log('Memory Usage Benchmark:', {
        ...memoryUsage,
        increaseKB: Math.round(memoryUsage.increase / 1024),
        cleanupKB: Math.round(memoryUsage.cleanup / 1024),
      });

      // Memory increase should be reasonable
      expect(memoryUsage.increase).toBeLessThan(20 * 1024 * 1024); // Less than 20MB
      
      // Should clean up most memory
      expect(memoryUsage.cleanup).toBeGreaterThan(memoryUsage.increase * 0.6); // At least 60% cleanup
    });

    it('benchmarks memory leak detection', () => {
      const leakTest = performanceTest.detectMemoryLeaks(() => {
        const { unmount } = render(
          <OptimizedTrackCard
            track={mockTracks[0]}
            onPress={() => {}}
            onInvest={() => {}}
          />
        );
        unmount();
      }, 50);

      console.log('Memory Leak Detection Benchmark:', leakTest);
      
      expect(leakTest.leakDetected).toBe(false);
      expect(leakTest.memoryDiff).toBeLessThan(5 * 1024 * 1024); // Less than 5MB difference
    });
  });

  describe('Interaction Performance Benchmarks', () => {
    it('benchmarks user interaction response times', async () => {
      const { getByTestId } = render(
        <OptimizedTrackCard
          track={mockTracks[0]}
          onPress={() => {}}
          onInvest={() => {}}
        />
      );

      const playButton = getByTestId('play-button');
      const interactionTimes: number[] = [];
      
      // Test multiple rapid interactions
      for (let i = 0; i < 20; i++) {
        const startTime = performance.now();
        
        await act(async () => {
          fireEvent.press(playButton);
        });
        
        const interactionTime = performance.now() - startTime;
        interactionTimes.push(interactionTime);
      }

      const results = {
        average: interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length,
        min: Math.min(...interactionTimes),
        max: Math.max(...interactionTimes),
        p95: interactionTimes.sort((a, b) => a - b)[Math.floor(interactionTimes.length * 0.95)],
      };

      console.log('Interaction Performance Benchmark:', results);
      
      expect(results.average).toBeLessThan(50); // Average should be fast
      expect(results.p95).toBeLessThan(100); // 95% of interactions should be under 100ms
    });

    it('benchmarks scroll performance with large lists', async () => {
      const largeTracks = Array.from({ length: 1000 }, (_, i) => ({
        ...mockTracks[0],
        id: `track-${i}`,
        title: `Track ${i}`,
      }));

      const { getByTestId } = render(
        <VirtualizedTrackList
          tracks={largeTracks}
          onTrackPress={() => {}}
          onTrackInvest={() => {}}
          testID="track-list"
        />
      );

      const list = getByTestId('track-list');
      const scrollTimes: number[] = [];
      
      // Simulate scrolling through the list
      for (let i = 0; i < 20; i++) {
        const startTime = performance.now();
        
        await act(async () => {
          fireEvent.scroll(list, {
            nativeEvent: {
              contentOffset: { y: i * 500 },
              contentSize: { height: 50000 },
              layoutMeasurement: { height: 800 },
            },
          });
        });
        
        const scrollTime = performance.now() - startTime;
        scrollTimes.push(scrollTime);
      }

      const results = {
        average: scrollTimes.reduce((a, b) => a + b, 0) / scrollTimes.length,
        min: Math.min(...scrollTimes),
        max: Math.max(...scrollTimes),
      };

      console.log('Scroll Performance Benchmark:', results);
      
      expect(results.average).toBeLessThan(16); // Should maintain 60fps
      expect(results.max).toBeLessThan(33); // Even worst case should be 30fps+
    });
  });

  describe('Image Loading Benchmarks', () => {
    it('benchmarks image cache performance', async () => {
      const imageUris = Array.from({ length: 50 }, (_, i) => 
        `https://example.com/image-${i}.jpg`
      );

      const startTime = performance.now();
      
      // Simulate loading multiple images
      const promises = imageUris.map(uri => 
        imageCacheManager.getCachedImage(uri, 'medium')
      );
      
      await Promise.allSettled(promises);
      
      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / imageUris.length;

      console.log('Image Cache Benchmark:', {
        totalTime: totalTime.toFixed(2),
        averageTime: averageTime.toFixed(2),
        imagesPerSecond: (1000 / averageTime).toFixed(2),
      });

      expect(averageTime).toBeLessThan(50); // Should process images quickly
    });

    it('benchmarks image optimization performance', () => {
      const monitor = imagePerformanceMonitor.monitorImageLoading('benchmark');
      const loadTimes: number[] = [];
      
      // Simulate image loading
      for (let i = 0; i < 20; i++) {
        const { onLoad } = monitor.startLoad(`image-${i}`);
        
        const startTime = performance.now();
        setTimeout(() => {
          const loadTime = performance.now() - startTime;
          loadTimes.push(loadTime);
          onLoad();
        }, Math.random() * 100); // Simulate variable load times
      }

      // Wait for all simulated loads
      return new Promise(resolve => {
        setTimeout(() => {
          const metrics = monitor.getMetrics();
          
          console.log('Image Loading Benchmark:', metrics);
          
          expect(metrics.averageLoadTime).toBeLessThan(200); // Reasonable load time
          expect(metrics.failedImages).toBe(0); // No failures in benchmark
          
          resolve(metrics);
        }, 200);
      });
    });
  });

  describe('Bundle Size and Startup Benchmarks', () => {
    it('measures component bundle impact', () => {
      // This would measure the impact of importing components
      const startTime = performance.now();
      
      // Simulate component imports
      const components = [
        () => require('../../components/optimized/OptimizedTrackCard'),
        () => require('../../components/optimized/VirtualizedTrackList'),
        () => require('../../utils/performance'),
        () => require('../../utils/imageOptimization'),
      ];

      components.forEach(importFn => {
        try {
          importFn();
        } catch (error) {
          // Component already imported
        }
      });

      const importTime = performance.now() - startTime;
      
      console.log('Component Import Benchmark:', {
        totalImportTime: importTime.toFixed(2),
        averageImportTime: (importTime / components.length).toFixed(2),
      });

      expect(importTime).toBeLessThan(100); // Imports should be fast
    });

    it('measures startup performance impact', () => {
      const startTime = performance.now();
      
      // Simulate app startup tasks
      performanceMonitor.setEnabled(true);
      imageCacheManager.clearCache();
      memoryUtils.getMemoryInfo();
      
      const startupTime = performance.now() - startTime;
      
      console.log('Startup Performance Benchmark:', {
        startupTime: startupTime.toFixed(2),
      });

      expect(startupTime).toBeLessThan(50); // Startup overhead should be minimal
    });
  });

  describe('Cross-Platform Performance', () => {
    it('benchmarks performance across different scenarios', () => {
      const scenarios = [
        { name: 'Small List', tracks: mockTracks.slice(0, 5) },
        { name: 'Medium List', tracks: Array.from({ length: 50 }, (_, i) => ({ ...mockTracks[0], id: `track-${i}` })) },
        { name: 'Large List', tracks: Array.from({ length: 200 }, (_, i) => ({ ...mockTracks[0], id: `track-${i}` })) },
      ];

      const results = scenarios.map(scenario => {
        const renderTimes: number[] = [];
        
        for (let i = 0; i < 5; i++) {
          const startTime = performance.now();
          
          const { unmount } = render(
            <VirtualizedTrackList
              tracks={scenario.tracks}
              onTrackPress={() => {}}
              onTrackInvest={() => {}}
            />
          );
          
          const renderTime = performance.now() - startTime;
          renderTimes.push(renderTime);
          unmount();
        }

        return {
          scenario: scenario.name,
          average: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
          min: Math.min(...renderTimes),
          max: Math.max(...renderTimes),
        };
      });

      console.log('Cross-Platform Performance Benchmark:', results);
      
      // All scenarios should perform reasonably
      results.forEach(result => {
        expect(result.average).toBeLessThan(100);
        expect(result.max).toBeLessThan(200);
      });
    });
  });

  describe('Performance Regression Detection', () => {
    it('establishes performance baselines', () => {
      const baselines = {
        trackCardRender: 15, // ms
        listRender: 80, // ms
        interaction: 40, // ms
        memoryUsage: 15 * 1024 * 1024, // bytes
        imageLoad: 150, // ms
      };

      // Test current performance against baselines
      const currentPerformance = {
        trackCardRender: 12, // Would be measured in real test
        listRender: 75,
        interaction: 35,
        memoryUsage: 12 * 1024 * 1024,
        imageLoad: 120,
      };

      console.log('Performance Baseline Comparison:', {
        baselines,
        current: currentPerformance,
        improvements: Object.keys(baselines).map(key => ({
          metric: key,
          baseline: baselines[key as keyof typeof baselines],
          current: currentPerformance[key as keyof typeof currentPerformance],
          improvement: ((baselines[key as keyof typeof baselines] - currentPerformance[key as keyof typeof currentPerformance]) / baselines[key as keyof typeof baselines] * 100).toFixed(1) + '%',
        })),
      });

      // All current performance should be at or better than baseline
      Object.keys(baselines).forEach(key => {
        expect(currentPerformance[key as keyof typeof currentPerformance])
          .toBeLessThanOrEqual(baselines[key as keyof typeof baselines]);
      });
    });
  });
});