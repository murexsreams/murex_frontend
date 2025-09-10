// Optimized image component with lazy loading, caching, and performance monitoring

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Image,
  ImageStyle,
  View,
  ViewStyle,
  ActivityIndicator,
  Text,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { performanceMonitor, useIntersectionObserver } from '../../utils/performance';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholder?: string;
  fallbackSource?: { uri: string } | number;
  lazy?: boolean;
  cache?: boolean;
  fadeIn?: boolean;
  fadeDuration?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  quality?: 'low' | 'medium' | 'high';
  onLoad?: () => void;
  onError?: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  showLoadingIndicator?: boolean;
  showErrorFallback?: boolean;
  testID?: string;
}

// Image cache for better performance
class ImageCache {
  private cache = new Map<string, string>();
  private maxSize = 100;

  set(key: string, value: string) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

const imageCache = new ImageCache();

// Image quality optimization
function getOptimizedImageUrl(url: string, quality: 'low' | 'medium' | 'high' = 'medium'): string {
  if (typeof url !== 'string') return url;

  // Add quality parameters for supported services
  const qualityParams = {
    low: 'w_400,q_60',
    medium: 'w_800,q_80',
    high: 'w_1200,q_90',
  };

  // Cloudinary optimization
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/${qualityParams[quality]}/`);
  }

  // Add other CDN optimizations as needed
  return url;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  placeholder,
  fallbackSource,
  lazy = true,
  cache = true,
  fadeIn = true,
  fadeDuration = 300,
  resizeMode = 'cover',
  quality = 'medium',
  onLoad,
  onError,
  onLoadStart,
  onLoadEnd,
  showLoadingIndicator = true,
  showErrorFallback = true,
  testID,
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);
  const loadStartTime = useRef<number>(0);

  // Lazy loading with intersection observer
  const isInView = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Determine if image should load
  const shouldLoad = !lazy || isInView;

  // Get optimized source
  const optimizedSource = useMemo(() => {
    if (typeof source === 'number') return source;
    
    const uri = source.uri;
    const optimizedUri = getOptimizedImageUrl(uri, quality);
    
    // Check cache first
    if (cache && imageCache.has(optimizedUri)) {
      return { uri: imageCache.get(optimizedUri)! };
    }
    
    return { uri: optimizedUri };
  }, [source, quality, cache]);

  // Handle load start
  const handleLoadStart = useCallback(() => {
    loadStartTime.current = performance.now();
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
    
    performanceMonitor.startTiming('Image load');
  }, [onLoadStart]);

  // Handle load success
  const handleLoad = useCallback(() => {
    const loadTime = performance.now() - loadStartTime.current;
    
    performanceMonitor.recordMetrics({
      renderTime: loadTime,
      memoryUsage: 0,
      timestamp: Date.now(),
      operation: 'Image load success',
    });

    setIsLoading(false);
    setIsLoaded(true);
    setHasError(false);

    // Cache the loaded image
    if (cache && typeof optimizedSource !== 'number') {
      imageCache.set(optimizedSource.uri, optimizedSource.uri);
    }

    // Fade in animation
    if (fadeIn) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }

    onLoad?.();
  }, [optimizedSource, cache, fadeIn, fadeDuration, fadeAnim, onLoad]);

  // Handle load error
  const handleError = useCallback((error: any) => {
    const loadTime = performance.now() - loadStartTime.current;
    
    performanceMonitor.recordMetrics({
      renderTime: loadTime,
      memoryUsage: 0,
      timestamp: Date.now(),
      operation: 'Image load error',
    });

    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  }, [onError]);

  // Handle load end
  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  // Render placeholder
  const renderPlaceholder = () => {
    if (placeholder) {
      return (
        <Image
          source={{ uri: placeholder }}
          style={[style, { position: 'absolute' }]}
          resizeMode={resizeMode}
        />
      );
    }

    return (
      <View
        style={[
          style,
          {
            backgroundColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          },
        ]}
      >
        {showLoadingIndicator && isLoading && (
          <ActivityIndicator size="small" color={colors.primary} />
        )}
      </View>
    );
  };

  // Render error fallback
  const renderErrorFallback = () => {
    if (fallbackSource) {
      return (
        <Image
          source={fallbackSource}
          style={style}
          resizeMode={resizeMode}
        />
      );
    }

    if (showErrorFallback) {
      return (
        <View
          style={[
            style,
            {
              backgroundColor: colors.border,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            Failed to load
          </Text>
        </View>
      );
    }

    return null;
  };

  // Don't render anything if lazy loading and not in view
  if (lazy && !shouldLoad) {
    return (
      <View ref={containerRef} style={[containerStyle, style]}>
        {renderPlaceholder()}
      </View>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <View ref={containerRef} style={containerStyle} testID={testID}>
        {renderErrorFallback()}
      </View>
    );
  }

  return (
    <View ref={containerRef} style={containerStyle} testID={testID}>
      {/* Placeholder */}
      {isLoading && renderPlaceholder()}
      
      {/* Main image */}
      <Animated.View style={{ opacity: fadeIn ? fadeAnim : 1 }}>
        <Image
          source={optimizedSource}
          style={style}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          onLoadEnd={handleLoadEnd}
          // Performance optimizations
          progressiveRenderingEnabled={true}
          fadeDuration={0} // We handle fade ourselves
        />
      </Animated.View>
    </View>
  );
};

// Optimized avatar component
export const OptimizedAvatar: React.FC<{
  source: { uri: string } | number;
  size: number;
  style?: ImageStyle;
  fallbackInitials?: string;
  borderRadius?: number;
}> = ({
  source,
  size,
  style,
  fallbackInitials,
  borderRadius,
}) => {
  const { colors } = useTheme();
  
  const avatarStyle: ImageStyle = {
    width: size,
    height: size,
    borderRadius: borderRadius ?? size / 2,
    ...style,
  };

  const fallbackStyle: ViewStyle = {
    ...avatarStyle,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <OptimizedImage
      source={source}
      style={avatarStyle}
      quality="medium"
      fadeIn={true}
      showErrorFallback={!!fallbackInitials}
      fallbackSource={undefined}
      showLoadingIndicator={false}
      renderErrorFallback={() => (
        <View style={fallbackStyle}>
          <Text
            style={{
              color: 'white',
              fontSize: size * 0.4,
              fontWeight: 'bold',
            }}
          >
            {fallbackInitials}
          </Text>
        </View>
      )}
    />
  );
};

// Optimized cover art component for music tracks
export const OptimizedCoverArt: React.FC<{
  source: { uri: string } | number;
  size: number;
  style?: ImageStyle;
  showPlayOverlay?: boolean;
  onPress?: () => void;
}> = ({
  source,
  size,
  style,
  showPlayOverlay = false,
  onPress,
}) => {
  const { colors } = useTheme();
  
  const coverStyle: ImageStyle = {
    width: size,
    height: size,
    borderRadius: 8,
    ...style,
  };

  return (
    <View style={{ position: 'relative' }}>
      <OptimizedImage
        source={source}
        style={coverStyle}
        quality="high"
        fadeIn={true}
        resizeMode="cover"
        placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTJMMTUgOFYxNkw5IDEyWiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K"
      />
      
      {showPlayOverlay && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
          }}
        >
          <View
            style={{
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              backgroundColor: 'rgba(255,255,255,0.9)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: size * 0.15 }}>▶</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// Image preloader utility
export class ImagePreloader {
  private static instance: ImagePreloader;
  private preloadQueue: string[] = [];
  private isPreloading = false;

  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  preload(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => this.preloadSingle(url))
    );
  }

  private preloadSingle(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'web') {
        const img = new Image();
        img.onload = () => {
          imageCache.set(url, url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      } else {
        Image.prefetch(url)
          .then(() => {
            imageCache.set(url, url);
            resolve();
          })
          .catch(reject);
      }
    });
  }

  addToQueue(urls: string[]) {
    this.preloadQueue.push(...urls);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isPreloading || this.preloadQueue.length === 0) return;

    this.isPreloading = true;
    
    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, 5); // Process 5 at a time
      
      try {
        await this.preload(batch);
      } catch (error) {
        console.warn('Image preload failed:', error);
      }
    }
    
    this.isPreloading = false;
  }
}

// Export cache utilities
export const imageCacheUtils = {
  clear: () => imageCache.clear(),
  size: () => imageCache.size(),
  preloader: ImagePreloader.getInstance(),
};