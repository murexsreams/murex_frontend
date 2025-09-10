// Image optimization and caching utilities

import React from 'react';
import { Image, Platform } from 'react-native';
import { performanceMonitor } from './performance';

// Image cache interface
interface CachedImage {
  uri: string;
  timestamp: number;
  size: number;
  dimensions?: { width: number; height: number };
}

// Image optimization configuration
export const IMAGE_CONFIG = {
  CACHE_SIZE_LIMIT: 50 * 1024 * 1024, // 50MB cache limit
  CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  MAX_CONCURRENT_DOWNLOADS: 3,
  QUALITY_SETTINGS: {
    thumbnail: 0.6,
    medium: 0.8,
    high: 0.9,
  },
  SIZE_LIMITS: {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 400, height: 400 },
    high: { width: 800, height: 800 },
  },
};

// Image cache manager
class ImageCacheManager {
  private cache = new Map<string, CachedImage>();
  private downloadQueue = new Set<string>();
  private activeDownloads = 0;

  // Get cached image or initiate download
  async getCachedImage(uri: string, quality: keyof typeof IMAGE_CONFIG.QUALITY_SETTINGS = 'medium'): Promise<string> {
    const cacheKey = `${uri}-${quality}`;
    const cached = this.cache.get(cacheKey);

    // Return cached image if valid
    if (cached && this.isCacheValid(cached)) {
      return cached.uri;
    }

    // Remove expired cache entry
    if (cached && !this.isCacheValid(cached)) {
      this.cache.delete(cacheKey);
    }

    // Return original URI if already downloading
    if (this.downloadQueue.has(cacheKey)) {
      return uri;
    }

    // Queue for optimization if not already processing
    this.queueImageOptimization(uri, quality, cacheKey);
    return uri; // Return original while processing
  }

  // Check if cached image is still valid
  private isCacheValid(cached: CachedImage): boolean {
    return Date.now() - cached.timestamp < IMAGE_CONFIG.CACHE_EXPIRY;
  }

  // Queue image for optimization
  private async queueImageOptimization(uri: string, quality: keyof typeof IMAGE_CONFIG.QUALITY_SETTINGS, cacheKey: string) {
    this.downloadQueue.add(cacheKey);

    // Wait if too many concurrent downloads
    while (this.activeDownloads >= IMAGE_CONFIG.MAX_CONCURRENT_DOWNLOADS) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeDownloads++;
    
    try {
      const optimizedUri = await this.optimizeImage(uri, quality);
      
      // Cache the optimized image
      this.cache.set(cacheKey, {
        uri: optimizedUri,
        timestamp: Date.now(),
        size: await this.getImageSize(optimizedUri),
      });

      // Clean cache if needed
      this.cleanCache();
    } catch (error) {
      console.warn('Image optimization failed:', error);
    } finally {
      this.activeDownloads--;
      this.downloadQueue.delete(cacheKey);
    }
  }

  // Optimize image based on quality settings
  private async optimizeImage(uri: string, quality: keyof typeof IMAGE_CONFIG.QUALITY_SETTINGS): Promise<string> {
    const stopMeasure = performanceMonitor.startMeasure(`image-optimization-${quality}`);
    
    try {
      // For web platform, we can use canvas for optimization
      if (Platform.OS === 'web') {
        return await this.optimizeImageWeb(uri, quality);
      }
      
      // For native platforms, return original URI
      // In a real implementation, you'd use libraries like react-native-image-resizer
      return uri;
    } finally {
      stopMeasure();
    }
  }

  // Web-specific image optimization
  private async optimizeImageWeb(uri: string, quality: keyof typeof IMAGE_CONFIG.QUALITY_SETTINGS): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(uri);
            return;
          }

          const sizeLimit = IMAGE_CONFIG.SIZE_LIMITS[quality];
          const scale = Math.min(
            sizeLimit.width / img.width,
            sizeLimit.height / img.height,
            1
          );

          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const optimizedUri = canvas.toDataURL('image/jpeg', IMAGE_CONFIG.QUALITY_SETTINGS[quality]);
          resolve(optimizedUri);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => resolve(uri); // Fallback to original
      img.src = uri;
    });
  }

  // Get approximate image size
  private async getImageSize(uri: string): Promise<number> {
    if (uri.startsWith('data:')) {
      // Estimate size for data URIs
      return Math.round(uri.length * 0.75); // Base64 overhead
    }
    
    // For network images, estimate based on dimensions
    return 100 * 1024; // Default estimate: 100KB
  }

  // Clean cache when size limit exceeded
  private cleanCache() {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, cached) => sum + cached.size, 0);

    if (totalSize > IMAGE_CONFIG.CACHE_SIZE_LIMIT) {
      // Remove oldest entries first
      const entries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      let removedSize = 0;
      const targetRemoval = totalSize - (IMAGE_CONFIG.CACHE_SIZE_LIMIT * 0.8); // Remove to 80% capacity

      for (const [key, cached] of entries) {
        this.cache.delete(key);
        removedSize += cached.size;
        
        if (removedSize >= targetRemoval) break;
      }
    }
  }

  // Get cache statistics
  getCacheStats() {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, cached) => sum + cached.size, 0);
    
    return {
      entryCount: entries.length,
      totalSize,
      averageSize: entries.length > 0 ? totalSize / entries.length : 0,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
    };
  }

  // Clear all cache
  clearCache() {
    this.cache.clear();
  }

  // Preload images
  async preloadImages(uris: string[], quality: keyof typeof IMAGE_CONFIG.QUALITY_SETTINGS = 'medium') {
    const stopMeasure = performanceMonitor.startMeasure('image-preload');
    
    try {
      const promises = uris.map(uri => this.getCachedImage(uri, quality));
      await Promise.allSettled(promises);
    } finally {
      stopMeasure();
    }
  }
}

// Global image cache instance
export const imageCacheManager = new ImageCacheManager();

// React Native Image component with optimization
export const OptimizedImage = React.memo<{
  source: { uri: string };
  style?: any;
  quality?: keyof typeof IMAGE_CONFIG.QUALITY_SETTINGS;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  testID?: string;
}>(({ source, style, quality = 'medium', placeholder, onLoad, onError, testID }) => {
  const [optimizedUri, setOptimizedUri] = React.useState<string>(source.uri);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    
    const loadOptimizedImage = async () => {
      try {
        const uri = await imageCacheManager.getCachedImage(source.uri, quality);
        if (isMounted) {
          setOptimizedUri(uri);
        }
      } catch (error) {
        console.warn('Failed to load optimized image:', error);
        if (isMounted) {
          setHasError(true);
        }
      }
    };

    loadOptimizedImage();
    
    return () => {
      isMounted = false;
    };
  }, [source.uri, quality]);

  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = React.useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // Show placeholder while loading or on error
  if ((isLoading || hasError) && placeholder) {
    return (
      <Image
        source={{ uri: placeholder }}
        style={style}
        testID={testID}
      />
    );
  }

  return (
    <Image
      source={{ uri: optimizedUri }}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
      testID={testID}
      // Performance optimizations
      resizeMode="cover"
      fadeDuration={200}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Lazy image loading hook
export const useLazyImage = (uri: string, quality: keyof typeof IMAGE_CONFIG.QUALITY_SETTINGS = 'medium') => {
  const [optimizedUri, setOptimizedUri] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadImage = React.useCallback(async () => {
    if (isLoading || optimizedUri) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const uri = await imageCacheManager.getCachedImage(uri, quality);
      setOptimizedUri(uri);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [uri, quality, isLoading, optimizedUri]);

  return {
    optimizedUri,
    isLoading,
    error,
    loadImage,
  };
};

// Image preloader utility
export const imagePreloader = {
  // Preload images for a screen
  preloadScreenImages: async (imageUris: string[]) => {
    const stopMeasure = performanceMonitor.startMeasure('screen-image-preload');
    
    try {
      // Preload thumbnails first for quick display
      await imageCacheManager.preloadImages(imageUris, 'thumbnail');
      
      // Then preload medium quality in background
      setTimeout(() => {
        imageCacheManager.preloadImages(imageUris, 'medium');
      }, 1000);
    } finally {
      stopMeasure();
    }
  },

  // Preload images based on user behavior
  preloadPredictiveImages: async (currentIndex: number, imageUris: string[], lookahead: number = 3) => {
    const startIndex = Math.max(0, currentIndex - 1);
    const endIndex = Math.min(imageUris.length - 1, currentIndex + lookahead);
    
    const urisToPreload = imageUris.slice(startIndex, endIndex + 1);
    await imageCacheManager.preloadImages(urisToPreload, 'medium');
  },

  // Get cache statistics
  getCacheStats: () => imageCacheManager.getCacheStats(),
  
  // Clear cache
  clearCache: () => imageCacheManager.clearCache(),
};

// Performance monitoring for images
export const imagePerformanceMonitor = {
  // Monitor image loading performance
  monitorImageLoading: (componentName: string) => {
    const metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      averageLoadTime: 0,
      loadTimes: [] as number[],
    };

    const startLoad = (uri: string) => {
      metrics.totalImages++;
      const startTime = performance.now();
      
      return {
        onLoad: () => {
          const loadTime = performance.now() - startTime;
          metrics.loadedImages++;
          metrics.loadTimes.push(loadTime);
          metrics.averageLoadTime = metrics.loadTimes.reduce((a, b) => a + b, 0) / metrics.loadTimes.length;
          
          performanceMonitor.recordMetrics(`${componentName}-image-load`, {
            renderTime: loadTime,
            interactionTime: 0,
          });
        },
        onError: () => {
          metrics.failedImages++;
          
          performanceMonitor.recordMetrics(`${componentName}-image-error`, {
            renderTime: performance.now() - startTime,
            interactionTime: 0,
          });
        },
      };
    };

    return {
      startLoad,
      getMetrics: () => ({ ...metrics }),
    };
  },

  // Generate image performance report
  generateImageReport: () => {
    const cacheStats = imageCacheManager.getCacheStats();
    
    return {
      cache: cacheStats,
      recommendations: [
        cacheStats.entryCount > 100 && 'Consider reducing image cache size',
        cacheStats.averageSize > 500 * 1024 && 'Images are large, consider better compression',
        cacheStats.totalSize > IMAGE_CONFIG.CACHE_SIZE_LIMIT * 0.9 && 'Cache is nearly full, cleanup recommended',
      ].filter(Boolean),
    };
  },
};