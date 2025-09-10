import {
  performanceMonitor,
  debounce,
  throttle,
  memoize,
  performanceTests,
  PERFORMANCE_THRESHOLDS,
} from '../performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    performanceMonitor.setEnabled(true);
  });

  describe('PerformanceMonitor', () => {
    it('records timing metrics correctly', () => {
      const endTiming = performanceMonitor.startTiming('test operation');
      
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Busy wait for 10ms
      }
      
      const metrics = endTiming();
      
      expect(metrics.operation).toBe('test operation');
      expect(metrics.renderTime).toBeGreaterThan(5);
      expect(metrics.timestamp).toBeDefined();
    });

    it('calculates statistics correctly', () => {
      // Record multiple metrics
      for (let i = 0; i < 5; i++) {
        performanceMonitor.recordMetrics({
          renderTime: i * 10,
          memoryUsage: i * 5,
          timestamp: Date.now(),
          operation: 'test',
        });
      }

      const stats = performanceMonitor.getStats('test');
      
      expect(stats.count).toBe(5);
      expect(stats.avgRenderTime).toBe(20); // (0+10+20+30+40)/5
      expect(stats.maxRenderTime).toBe(40);
      expect(stats.minRenderTime).toBe(0);
    });

    it('limits metrics storage', () => {
      // Record more than max metrics
      for (let i = 0; i < 1100; i++) {
        performanceMonitor.recordMetrics({
          renderTime: i,
          memoryUsage: 0,
          timestamp: Date.now(),
          operation: 'test',
        });
      }

      const stats = performanceMonitor.getStats();
      expect(stats.count).toBeLessThanOrEqual(1000);
    });

    it('can be disabled', () => {
      performanceMonitor.setEnabled(false);
      
      const endTiming = performanceMonitor.startTiming('test');
      const metrics = endTiming();
      
      expect(Object.keys(metrics)).toHaveLength(0);
    });
  });

  describe('Debounce', () => {
    it('delays function execution', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 50);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callCount).toBe(0);

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 60);
    });

    it('executes immediately when immediate flag is set', () => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 50, true);

      debouncedFn();
      expect(callCount).toBe(1);

      debouncedFn();
      expect(callCount).toBe(1); // Should not call again
    });
  });

  describe('Throttle', () => {
    it('limits function calls', (done) => {
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, 50);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(callCount).toBe(1);

      setTimeout(() => {
        throttledFn();
        expect(callCount).toBe(2);
        done();
      }, 60);
    });
  });

  describe('Memoize', () => {
    it('caches function results', () => {
      let callCount = 0;
      const expensiveFn = memoize((x: number) => {
        callCount++;
        return x * 2;
      });

      expect(expensiveFn(5)).toBe(10);
      expect(expensiveFn(5)).toBe(10);
      expect(callCount).toBe(1); // Should only call once
    });

    it('uses custom key function', () => {
      let callCount = 0;
      const fn = memoize(
        (obj: { id: number; name: string }) => {
          callCount++;
          return obj.name.toUpperCase();
        },
        (obj) => obj.id.toString()
      );

      const obj1 = { id: 1, name: 'test' };
      const obj2 = { id: 1, name: 'different' }; // Same id, different name

      expect(fn(obj1)).toBe('TEST');
      expect(fn(obj2)).toBe('TEST'); // Should return cached result
      expect(callCount).toBe(1);
    });

    it('limits cache size', () => {
      const fn = memoize((x: number) => x * 2);

      // Fill cache beyond limit
      for (let i = 0; i < 150; i++) {
        fn(i);
      }

      // First item should be evicted
      let callCount = 0;
      const testFn = memoize((x: number) => {
        callCount++;
        return x;
      });

      // Fill cache
      for (let i = 0; i < 101; i++) {
        testFn(i);
      }

      expect(callCount).toBe(101);

      // Call first item again - should be evicted and recalculated
      testFn(0);
      expect(callCount).toBe(102);
    });
  });

  describe('Performance Tests', () => {
    it('measures render time correctly', async () => {
      const result = await performanceTests.testRenderTime(
        React.createElement('div'),
        3
      );

      expect(result.times).toHaveLength(3);
      expect(result.average).toBeGreaterThanOrEqual(0);
      expect(result.min).toBeLessThanOrEqual(result.average);
      expect(result.max).toBeGreaterThanOrEqual(result.average);
    });

    it('measures list performance', () => {
      const result = performanceTests.testListPerformance(1000);

      expect(result.itemCount).toBe(1000);
      expect(result.renderTime).toBeGreaterThan(0);
      expect(result.timePerItem).toBe(result.renderTime / 1000);
    });

    it('measures animation performance', async () => {
      const result = await performanceTests.testAnimationPerformance(100);

      expect(result.frameCount).toBeGreaterThan(0);
      expect(result.averageFPS).toBeGreaterThan(0);
    });
  });

  describe('Performance Thresholds', () => {
    it('has reasonable threshold values', () => {
      expect(PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING).toBe(100);
      expect(PERFORMANCE_THRESHOLDS.RENDER_TIME_ERROR).toBe(500);
      expect(PERFORMANCE_THRESHOLDS.FPS_WARNING).toBe(45);
      expect(PERFORMANCE_THRESHOLDS.FPS_ERROR).toBe(30);
    });
  });

  describe('Memory Monitoring', () => {
    it('tracks memory usage when available', () => {
      // Mock performance.memory for web environment
      const originalMemory = (performance as any).memory;
      (performance as any).memory = {
        usedJSHeapSize: 1024 * 1024 * 10, // 10MB
      };

      const endTiming = performanceMonitor.startTiming('memory test');
      const metrics = endTiming();

      expect(metrics.jsHeapSize).toBeDefined();

      // Restore original
      (performance as any).memory = originalMemory;
    });
  });

  describe('Performance Warnings', () => {
    it('logs warnings for slow operations in development', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      performanceMonitor.recordMetrics({
        renderTime: 200, // Above warning threshold
        memoryUsage: 0,
        timestamp: Date.now(),
        operation: 'slow operation',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation detected')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Metrics Export', () => {
    it('exports metrics correctly', () => {
      performanceMonitor.recordMetrics({
        renderTime: 50,
        memoryUsage: 5,
        timestamp: Date.now(),
        operation: 'export test',
      });

      const exported = performanceMonitor.exportMetrics();
      expect(exported).toHaveLength(1);
      expect(exported[0].operation).toBe('export test');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero metrics gracefully', () => {
      const stats = performanceMonitor.getStats('nonexistent');
      
      expect(stats.count).toBe(0);
      expect(stats.avgRenderTime).toBe(0);
      expect(stats.maxRenderTime).toBe(0);
      expect(stats.minRenderTime).toBe(0);
    });

    it('handles negative timing values', () => {
      performanceMonitor.recordMetrics({
        renderTime: -10,
        memoryUsage: 0,
        timestamp: Date.now(),
        operation: 'negative test',
      });

      const stats = performanceMonitor.getStats('negative test');
      expect(stats.minRenderTime).toBe(-10);
    });
  });
});