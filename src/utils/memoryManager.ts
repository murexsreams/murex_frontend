// Memory management utilities for React Native performance optimization

import React from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { performanceMonitor } from './performance';

// Memory usage interface
interface MemoryInfo {
  used: number; // MB
  total?: number; // MB
  available?: number; // MB
  timestamp: number;
}

// Memory manager class
class MemoryManager {
  private memoryHistory: MemoryInfo[] = [];
  private maxHistorySize = 100;
  private warningThreshold = 100; // MB
  private criticalThreshold = 200; // MB
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;

  // Start memory monitoring
  startMonitoring(intervalMs = 5000) {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    
    // Monitor memory usage periodically
    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);

    // Monitor app state changes
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange
    );

    console.log('Memory monitoring started');
  }

  // Stop memory monitoring
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    console.log('Memory monitoring stopped');
  }

  // Get current memory usage
  getCurrentMemoryUsage(): MemoryInfo {
    const timestamp = Date.now();

    if (Platform.OS === 'web') {
      // Web platform memory API
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        return {
          used: memory.usedJSHeapSize / 1024 / 1024,
          total: memory.totalJSHeapSize / 1024 / 1024,
          available: (memory.jsHeapSizeLimit - memory.usedJSHeapSize) / 1024 / 1024,
          timestamp,
        };
      }
    }

    // For React Native, we'll estimate based on performance metrics
    // This is approximate since RN doesn't expose direct memory APIs
    return {
      used: this.estimateMemoryUsage(),
      timestamp,
    };
  }

  // Estimate memory usage for React Native
  private estimateMemoryUsage(): number {
    // This is a rough estimation based on various factors
    // In a real app, you might use native modules for accurate memory info
    
    const baseMemory = 50; // Base app memory in MB
    const historyFactor = this.memoryHistory.length * 0.1;
    const performanceFactor = performanceMonitor.getStats().count * 0.01;
    
    return baseMemory + historyFactor + performanceFactor;
  }

  // Check memory usage and trigger warnings
  private checkMemoryUsage() {
    const memoryInfo = this.getCurrentMemoryUsage();
    this.recordMemoryUsage(memoryInfo);

    // Check thresholds
    if (memoryInfo.used > this.criticalThreshold) {
      this.handleCriticalMemoryUsage(memoryInfo);
    } else if (memoryInfo.used > this.warningThreshold) {
      this.handleWarningMemoryUsage(memoryInfo);
    }
  }

  // Record memory usage in history
  private recordMemoryUsage(memoryInfo: MemoryInfo) {
    this.memoryHistory.push(memoryInfo);

    // Limit history size
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory = this.memoryHistory.slice(-this.maxHistorySize);
    }

    // Record in performance monitor
    performanceMonitor.recordMetrics({
      renderTime: 0,
      memoryUsage: memoryInfo.used,
      timestamp: memoryInfo.timestamp,
      operation: 'Memory usage check',
    });
  }

  // Handle warning level memory usage
  private handleWarningMemoryUsage(memoryInfo: MemoryInfo) {
    console.warn(`Memory usage warning: ${memoryInfo.used.toFixed(2)}MB`);
    
    // Trigger garbage collection if available
    this.triggerGarbageCollection();
    
    // Clear caches
    this.clearCaches();
  }

  // Handle critical memory usage
  private handleCriticalMemoryUsage(memoryInfo: MemoryInfo) {
    console.error(`Critical memory usage: ${memoryInfo.used.toFixed(2)}MB`);
    
    // Aggressive cleanup
    this.aggressiveCleanup();
    
    // Notify app about memory pressure
    this.notifyMemoryPressure();
  }

  // Handle app state changes
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background') {
      // App going to background - cleanup memory
      this.backgroundCleanup();
    } else if (nextAppState === 'active') {
      // App becoming active - check memory
      this.checkMemoryUsage();
    }
  };

  // Trigger garbage collection
  private triggerGarbageCollection() {
    if (Platform.OS === 'web' && (global as any).gc) {
      try {
        (global as any).gc();
        console.log('Garbage collection triggered');
      } catch (error) {
        console.warn('Failed to trigger garbage collection:', error);
      }
    }
  }

  // Clear various caches
  private clearCaches() {
    // Clear image cache
    if (typeof require !== 'undefined') {
      try {
        // Clear React Native image cache
        const { Image } = require('react-native');
        if (Image.clearCache) {
          Image.clearCache();
        }
      } catch (error) {
        console.warn('Failed to clear image cache:', error);
      }
    }

    // Clear performance metrics cache
    performanceMonitor.clearMetrics();
    
    console.log('Caches cleared');
  }

  // Aggressive cleanup for critical memory situations
  private aggressiveCleanup() {
    this.clearCaches();
    this.triggerGarbageCollection();
    
    // Clear memory history except recent entries
    this.memoryHistory = this.memoryHistory.slice(-10);
    
    console.log('Aggressive cleanup performed');
  }

  // Background cleanup when app goes to background
  private backgroundCleanup() {
    this.clearCaches();
    
    // Reduce memory history size
    this.memoryHistory = this.memoryHistory.slice(-20);
    
    console.log('Background cleanup performed');
  }

  // Notify app components about memory pressure
  private notifyMemoryPressure() {
    // In a real app, you might emit events or call callbacks
    console.log('Memory pressure notification sent');
  }

  // Get memory statistics
  getMemoryStats() {
    if (this.memoryHistory.length === 0) {
      return {
        current: 0,
        average: 0,
        peak: 0,
        trend: 'stable' as const,
      };
    }

    const current = this.memoryHistory[this.memoryHistory.length - 1].used;
    const values = this.memoryHistory.map(info => info.used);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const peak = Math.max(...values);
    
    // Calculate trend
    const recentValues = values.slice(-10);
    const trend = recentValues.length > 1
      ? recentValues[recentValues.length - 1] > recentValues[0] ? 'increasing' : 'decreasing'
      : 'stable';

    return {
      current: Number(current.toFixed(2)),
      average: Number(average.toFixed(2)),
      peak: Number(peak.toFixed(2)),
      trend,
    };
  }

  // Export memory history
  exportMemoryHistory() {
    return [...this.memoryHistory];
  }

  // Set memory thresholds
  setThresholds(warning: number, critical: number) {
    this.warningThreshold = warning;
    this.criticalThreshold = critical;
  }

  // Clear memory history
  clearHistory() {
    this.memoryHistory = [];
  }
}

// Singleton instance
export const memoryManager = new MemoryManager();

// React hook for memory monitoring
export function useMemoryMonitoring(options: {
  enabled?: boolean;
  interval?: number;
  onWarning?: (usage: number) => void;
  onCritical?: (usage: number) => void;
} = {}) {
  const { enabled = true, interval = 5000, onWarning, onCritical } = options;

  React.useEffect(() => {
    if (!enabled) return;

    memoryManager.startMonitoring(interval);

    // Set up custom handlers
    if (onWarning || onCritical) {
      const checkInterval = setInterval(() => {
        const stats = memoryManager.getMemoryStats();
        
        if (onCritical && stats.current > 200) {
          onCritical(stats.current);
        } else if (onWarning && stats.current > 100) {
          onWarning(stats.current);
        }
      }, interval);

      return () => {
        clearInterval(checkInterval);
        memoryManager.stopMonitoring();
      };
    }

    return () => {
      memoryManager.stopMonitoring();
    };
  }, [enabled, interval, onWarning, onCritical]);

  return memoryManager.getMemoryStats();
}

// Memory optimization utilities
export const memoryUtils = {
  // Weak reference utility for preventing memory leaks
  createWeakRef: <T extends object>(obj: T): WeakRef<T> => {
    return new WeakRef(obj);
  },

  // Cleanup function registry
  cleanupRegistry: new FinalizationRegistry((heldValue: string) => {
    console.log(`Cleanup triggered for: ${heldValue}`);
  }),

  // Register cleanup for objects
  registerCleanup: (obj: object, identifier: string) => {
    memoryUtils.cleanupRegistry.register(obj, identifier);
  },

  // Memory-efficient array operations
  chunkArray: <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  },

  // Memory-efficient object cloning
  shallowClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.slice() as unknown as T;
    return { ...obj };
  },

  // Memory leak detector for React components
  detectLeaks: (componentName: string) => {
    const instances = new Set();
    
    return {
      register: (instance: any) => {
        instances.add(instance);
      },
      
      unregister: (instance: any) => {
        instances.delete(instance);
      },
      
      getCount: () => instances.size,
      
      check: () => {
        if (instances.size > 10) {
          console.warn(`Potential memory leak in ${componentName}: ${instances.size} instances`);
        }
      },
    };
  },
};

// Memory optimization HOC
export function withMemoryOptimization<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    trackInstances?: boolean;
    cleanupOnUnmount?: boolean;
  } = {}
) {
  const { trackInstances = false, cleanupOnUnmount = true } = options;
  const componentName = WrappedComponent.displayName || WrappedComponent.name;
  
  let leakDetector: ReturnType<typeof memoryUtils.detectLeaks> | null = null;
  
  if (trackInstances) {
    leakDetector = memoryUtils.detectLeaks(componentName);
  }

  return React.memo((props: P) => {
    const instanceRef = React.useRef({});

    React.useEffect(() => {
      if (leakDetector) {
        leakDetector.register(instanceRef.current);
        leakDetector.check();
      }

      return () => {
        if (leakDetector) {
          leakDetector.unregister(instanceRef.current);
        }
        
        if (cleanupOnUnmount) {
          // Cleanup any references
          instanceRef.current = {};
        }
      };
    }, []);

    return <WrappedComponent {...props} />;
  });
}

// Export memory constants
export const MEMORY_THRESHOLDS = {
  WARNING: 100, // MB
  CRITICAL: 200, // MB
  CLEANUP_TRIGGER: 150, // MB
  BACKGROUND_LIMIT: 50, // MB
};