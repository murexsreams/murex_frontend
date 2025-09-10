// Bundle size optimization and code splitting utilities

import React, { Suspense } from 'react';
import { Platform } from 'react-native';
import { performanceMonitor } from './performance';

// Dynamic import wrapper with error handling
export function dynamicImport<T = any>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  const endTiming = performanceMonitor.startTiming('Dynamic import');
  
  return importFn()
    .then(module => {
      endTiming();
      return module;
    })
    .catch(error => {
      endTiming();
      console.error('Dynamic import failed:', error);
      
      if (fallback) {
        return fallback;
      }
      
      throw error;
    });
}

// Lazy component loader with performance monitoring
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: React.ComponentType;
    errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
    preload?: boolean;
    chunkName?: string;
  } = {}
) {
  const { fallback: Fallback, errorBoundary: ErrorBoundary, preload = false, chunkName } = options;
  
  // Create lazy component
  const LazyComponent = React.lazy(() => {
    const endTiming = performanceMonitor.startTiming(`Lazy load: ${chunkName || 'component'}`);
    
    return importFn()
      .then(module => {
        endTiming();
        return module;
      })
      .catch(error => {
        endTiming();
        console.error(`Failed to load lazy component ${chunkName}:`, error);
        throw error;
      });
  });

  // Preload if requested
  if (preload) {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFn().catch(() => {
        // Ignore preload errors
      });
    }, 100);
  }

  // Return wrapped component
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    const [error, setError] = React.useState<Error | null>(null);
    const [retryCount, setRetryCount] = React.useState(0);

    const retry = React.useCallback(() => {
      setError(null);
      setRetryCount(count => count + 1);
    }, []);

    if (error && ErrorBoundary) {
      return <ErrorBoundary error={error} retry={retry} />;
    }

    return (
      <Suspense fallback={Fallback ? <Fallback /> : null}>
        <LazyComponent {...props} ref={ref} key={retryCount} />
      </Suspense>
    );
  });
}

// Code splitting by route
export const createRouteComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  routeName: string
) => {
  return createLazyComponent(importFn, {
    chunkName: `route-${routeName}`,
    fallback: () => (
      <div style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20 
      }}>
        <div>Loading {routeName}...</div>
      </div>
    ),
    errorBoundary: ({ error, retry }) => (
      <div style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20 
      }}>
        <div>Failed to load {routeName}</div>
        <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
          {error.message}
        </div>
        <button onClick={retry} style={{ marginTop: 10 }}>
          Retry
        </button>
      </div>
    ),
  });
};

// Feature-based code splitting
export const createFeatureComponent = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  featureName: string,
  options: {
    preload?: boolean;
    priority?: 'high' | 'medium' | 'low';
  } = {}
) => {
  const { preload = false, priority = 'medium' } = options;
  
  return createLazyComponent(importFn, {
    chunkName: `feature-${featureName}`,
    preload: preload || priority === 'high',
    fallback: () => (
      <div style={{ padding: 16 }}>
        <div>Loading {featureName} feature...</div>
      </div>
    ),
  });
};

// Bundle analyzer for development
export class BundleAnalyzer {
  private loadedChunks = new Set<string>();
  private chunkSizes = new Map<string, number>();
  private loadTimes = new Map<string, number>();

  // Track chunk loading
  trackChunkLoad(chunkName: string, size?: number) {
    const startTime = performance.now();
    
    return {
      onLoad: () => {
        const loadTime = performance.now() - startTime;
        this.loadedChunks.add(chunkName);
        this.loadTimes.set(chunkName, loadTime);
        
        if (size) {
          this.chunkSizes.set(chunkName, size);
        }
        
        console.log(`Chunk loaded: ${chunkName} (${loadTime.toFixed(2)}ms)`);
      },
      
      onError: (error: Error) => {
        const loadTime = performance.now() - startTime;
        console.error(`Chunk failed to load: ${chunkName} (${loadTime.toFixed(2)}ms)`, error);
      },
    };
  }

  // Get bundle statistics
  getStats() {
    const totalChunks = this.loadedChunks.size;
    const totalSize = Array.from(this.chunkSizes.values()).reduce((sum, size) => sum + size, 0);
    const averageLoadTime = Array.from(this.loadTimes.values()).reduce((sum, time) => sum + time, 0) / this.loadTimes.size;
    
    return {
      totalChunks,
      totalSize: totalSize / 1024, // KB
      averageLoadTime: averageLoadTime.toFixed(2),
      chunks: Array.from(this.loadedChunks),
      slowestChunk: this.getSlowestChunk(),
      largestChunk: this.getLargestChunk(),
    };
  }

  private getSlowestChunk() {
    let slowest = { name: '', time: 0 };
    
    for (const [name, time] of this.loadTimes) {
      if (time > slowest.time) {
        slowest = { name, time };
      }
    }
    
    return slowest;
  }

  private getLargestChunk() {
    let largest = { name: '', size: 0 };
    
    for (const [name, size] of this.chunkSizes) {
      if (size > largest.size) {
        largest = { name, size };
      }
    }
    
    return largest;
  }

  // Export analysis report
  exportReport() {
    const stats = this.getStats();
    
    console.group('Bundle Analysis Report');
    console.log('Total chunks loaded:', stats.totalChunks);
    console.log('Total size:', stats.totalSize.toFixed(2), 'KB');
    console.log('Average load time:', stats.averageLoadTime, 'ms');
    
    if (stats.slowestChunk.name) {
      console.log('Slowest chunk:', stats.slowestChunk.name, `(${stats.slowestChunk.time.toFixed(2)}ms)`);
    }
    
    if (stats.largestChunk.name) {
      console.log('Largest chunk:', stats.largestChunk.name, `(${(stats.largestChunk.size / 1024).toFixed(2)}KB)`);
    }
    
    console.groupEnd();
    
    return stats;
  }
}

// Global bundle analyzer instance
export const bundleAnalyzer = new BundleAnalyzer();

// Tree shaking utilities
export const treeShakingUtils = {
  // Import only specific functions from libraries
  importSpecific: <T>(
    modulePath: string,
    imports: string[]
  ): Promise<Record<string, T>> => {
    return dynamicImport(() => import(modulePath))
      .then(module => {
        const result: Record<string, T> = {};
        imports.forEach(importName => {
          if (module[importName]) {
            result[importName] = module[importName];
          }
        });
        return result;
      });
  },

  // Check if feature is used before importing
  conditionalImport: <T>(
    condition: boolean,
    importFn: () => Promise<T>
  ): Promise<T | null> => {
    if (!condition) {
      return Promise.resolve(null);
    }
    return importFn();
  },
};

// Platform-specific imports
export const platformImports = {
  // Import different modules based on platform
  importByPlatform: <T>(imports: {
    web?: () => Promise<T>;
    ios?: () => Promise<T>;
    android?: () => Promise<T>;
    default: () => Promise<T>;
  }): Promise<T> => {
    const platformImport = imports[Platform.OS as keyof typeof imports] || imports.default;
    return dynamicImport(platformImport);
  },

  // Import native modules only when needed
  importNativeModule: <T>(
    moduleName: string,
    fallback?: T
  ): Promise<T> => {
    if (Platform.OS === 'web') {
      return Promise.resolve(fallback as T);
    }
    
    return dynamicImport(() => import(moduleName))
      .catch(() => {
        if (fallback) {
          return fallback;
        }
        throw new Error(`Native module ${moduleName} not available`);
      });
  },
};

// Preloading strategies
export const preloadStrategies = {
  // Preload on user interaction
  preloadOnHover: (importFn: () => Promise<any>) => {
    let preloaded = false;
    
    return {
      onMouseEnter: () => {
        if (!preloaded) {
          preloaded = true;
          importFn().catch(() => {
            preloaded = false; // Allow retry
          });
        }
      },
    };
  },

  // Preload on idle
  preloadOnIdle: (importFn: () => Promise<any>, timeout = 2000) => {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        importFn().catch(() => {
          // Ignore idle preload errors
        });
      }, { timeout });
    } else {
      // Fallback for environments without requestIdleCallback
      setTimeout(() => {
        importFn().catch(() => {
          // Ignore idle preload errors
        });
      }, timeout);
    }
  },

  // Preload based on user behavior
  preloadOnIntent: (
    importFn: () => Promise<any>,
    triggers: {
      scroll?: boolean;
      focus?: boolean;
      visibility?: boolean;
    } = {}
  ) => {
    const { scroll = false, focus = false, visibility = false } = triggers;
    let preloaded = false;

    const preload = () => {
      if (!preloaded) {
        preloaded = true;
        importFn().catch(() => {
          preloaded = false;
        });
      }
    };

    // Set up triggers
    if (scroll && typeof window !== 'undefined') {
      window.addEventListener('scroll', preload, { once: true, passive: true });
    }

    if (focus && typeof window !== 'undefined') {
      window.addEventListener('focus', preload, { once: true });
    }

    if (visibility && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          preload();
        }
      }, { once: true });
    }
  },
};

// Bundle optimization recommendations
export const optimizationRecommendations = {
  // Analyze and suggest optimizations
  analyze: () => {
    const stats = bundleAnalyzer.getStats();
    const recommendations: string[] = [];

    if (stats.totalSize > 1000) { // > 1MB
      recommendations.push('Consider code splitting for large bundles');
    }

    if (stats.averageLoadTime > 1000) { // > 1s
      recommendations.push('Optimize chunk loading performance');
    }

    if (stats.totalChunks > 20) {
      recommendations.push('Consider consolidating small chunks');
    }

    return recommendations;
  },

  // Get optimization tips
  getTips: () => [
    'Use dynamic imports for route-based code splitting',
    'Implement lazy loading for non-critical features',
    'Preload important chunks on user intent',
    'Use tree shaking to eliminate dead code',
    'Optimize images and assets',
    'Consider using a CDN for static assets',
    'Implement proper caching strategies',
    'Monitor bundle size in CI/CD pipeline',
  ],
};

// Export bundle size constants
export const BUNDLE_SIZE_LIMITS = {
  MAIN_BUNDLE: 500, // KB
  CHUNK_SIZE: 100, // KB
  TOTAL_SIZE: 2000, // KB
  LOAD_TIME_WARNING: 1000, // ms
  LOAD_TIME_ERROR: 3000, // ms
};