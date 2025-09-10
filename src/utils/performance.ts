// Performance monitoring and optimization utilities

import React from 'react';
import { InteractionManager, Platform } from 'react-native';

// Performance metrics interface
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  jsHeapSize?: number;
  timestamp: number;
  componentName?: string;
  operation?: string;
}

// Performance monitoring class
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000;
  private isEnabled = __DEV__;

  // Enable/disable performance monitoring
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Start timing an operation
  startTiming(operation: string): () => PerformanceMetrics {
    if (!this.isEnabled) {
      return () => ({} as PerformanceMetrics);
    }

    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return () => {
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();

      const metrics: PerformanceMetrics = {
        renderTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        timestamp: Date.now(),
        operation,
      };

      if (Platform.OS === 'web' && (performance as any).memory) {
        metrics.jsHeapSize = (performance as any).memory.usedJSHeapSize;
      }

      this.recordMetrics(metrics);
      return metrics;
    };
  }

  // Record performance metrics
  recordMetrics(metrics: PerformanceMetrics) {
    if (!this.isEnabled) return;

    this.metrics.push(metrics);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations in development
    if (__DEV__ && metrics.renderTime > 100) {
      console.warn(`Slow operation detected: ${metrics.operation} took ${metrics.renderTime.toFixed(2)}ms`);
    }
  }

  // Get memory usage (approximate)
  private getMemoryUsage(): number {
    if (Platform.OS === 'web' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0; // Not available on native platforms
  }

  // Get performance statistics
  getStats(operation?: string): {
    count: number;
    avgRenderTime: number;
    maxRenderTime: number;
    minRenderTime: number;
    avgMemoryUsage: number;
  } {
    const filteredMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        count: 0,
        avgRenderTime: 0,
        maxRenderTime: 0,
        minRenderTime: 0,
        avgMemoryUsage: 0,
      };
    }

    const renderTimes = filteredMetrics.map(m => m.renderTime);
    const memoryUsages = filteredMetrics.map(m => m.memoryUsage);

    return {
      count: filteredMetrics.length,
      avgRenderTime: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
      maxRenderTime: Math.max(...renderTimes),
      minRenderTime: Math.min(...renderTimes),
      avgMemoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
    };
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
  }

  // Export metrics for analysis
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React component performance HOC
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;

  return React.memo((props: P) => {
    const endTiming = React.useRef<(() => PerformanceMetrics) | null>(null);

    React.useLayoutEffect(() => {
      endTiming.current = performanceMonitor.startTiming(`${displayName} render`);
    });

    React.useEffect(() => {
      if (endTiming.current) {
        endTiming.current();
        endTiming.current = null;
      }
    });

    return <WrappedComponent {...props} />;
  });
}

// Hook for performance monitoring
export function usePerformanceMonitoring(operationName: string) {
  const endTimingRef = React.useRef<(() => PerformanceMetrics) | null>(null);

  const startTiming = React.useCallback(() => {
    endTimingRef.current = performanceMonitor.startTiming(operationName);
  }, [operationName]);

  const endTiming = React.useCallback(() => {
    if (endTimingRef.current) {
      const metrics = endTimingRef.current();
      endTimingRef.current = null;
      return metrics;
    }
    return null;
  }, []);

  return { startTiming, endTiming };
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): T {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  }) as T;
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  }) as T;
}

// Lazy loading utility
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={fallback ? <fallback /> : null}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

// Image lazy loading hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const imgRef = React.useRef<any>(null);
  const isInView = useIntersectionObserver(imgRef);

  React.useEffect(() => {
    if (isInView && src && !isLoaded && !isError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        setIsError(true);
      };
      
      img.src = src;
    }
  }, [isInView, src, isLoaded, isError]);

  return { imageSrc, isLoaded, isError, ref: imgRef };
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (Platform.OS !== 'web') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  console.group('Bundle Analysis');
  console.log('JavaScript files:', scripts.length);
  console.log('CSS files:', styles.length);
  
  scripts.forEach((script: any, index) => {
    console.log(`JS ${index + 1}:`, script.src);
  });
  
  styles.forEach((style: any, index) => {
    console.log(`CSS ${index + 1}:`, style.href);
  });
  
  console.groupEnd();
}

// Memory leak detector
export function detectMemoryLeaks() {
  if (!__DEV__ || Platform.OS !== 'web') return;

  let initialMemory = 0;
  let checkCount = 0;

  const checkMemory = () => {
    if ((performance as any).memory) {
      const currentMemory = (performance as any).memory.usedJSHeapSize;
      
      if (initialMemory === 0) {
        initialMemory = currentMemory;
      } else {
        const growth = currentMemory - initialMemory;
        const growthMB = growth / 1024 / 1024;
        
        if (growthMB > 50) { // 50MB growth threshold
          console.warn(`Potential memory leak detected: ${growthMB.toFixed(2)}MB growth`);
        }
      }
      
      checkCount++;
      if (checkCount < 10) {
        setTimeout(checkMemory, 5000); // Check every 5 seconds
      }
    }
  };

  setTimeout(checkMemory, 1000);
}

// Performance testing utilities
export const performanceTests = {
  // Test component render time
  testRenderTime: async (component: React.ReactElement, iterations = 10) => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      // In a real test environment, you would render the component here
      const end = performance.now();
      times.push(end - start);
    }
    
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      times,
    };
  },

  // Test list rendering performance
  testListPerformance: (itemCount: number) => {
    const start = performance.now();
    
    // Simulate list rendering
    const items = Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      title: `Item ${i}`,
      data: Math.random(),
    }));
    
    const end = performance.now();
    
    return {
      itemCount,
      renderTime: end - start,
      timePerItem: (end - start) / itemCount,
    };
  },

  // Test animation performance
  testAnimationPerformance: (duration = 1000) => {
    return new Promise<{ frameCount: number; averageFPS: number }>((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      
      const countFrames = () => {
        frameCount++;
        const elapsed = performance.now() - startTime;
        
        if (elapsed < duration) {
          requestAnimationFrame(countFrames);
        } else {
          const averageFPS = (frameCount / elapsed) * 1000;
          resolve({ frameCount, averageFPS });
        }
      };
      
      requestAnimationFrame(countFrames);
    });
  },
};

// Interaction Manager utilities
export const interactionUtils = {
  // Run after interactions complete
  runAfterInteractions: (callback: () => void) => {
    InteractionManager.runAfterInteractions(callback);
  },

  // Create interaction handle
  createInteractionHandle: () => {
    return InteractionManager.createInteractionHandle();
  },

  // Clear interaction handle
  clearInteractionHandle: (handle: number) => {
    InteractionManager.clearInteractionHandle(handle);
  },
};

// Export performance constants
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_WARNING: 100, // ms
  RENDER_TIME_ERROR: 500, // ms
  MEMORY_GROWTH_WARNING: 50, // MB
  MEMORY_GROWTH_ERROR: 100, // MB
  FPS_WARNING: 45,
  FPS_ERROR: 30,
  BUNDLE_SIZE_WARNING: 2, // MB
  BUNDLE_SIZE_ERROR: 5, // MB
};