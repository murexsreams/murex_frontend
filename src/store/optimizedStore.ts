// Optimized store implementation with performance monitoring and caching

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { performanceMonitor, debounce, memoize } from '../utils/performance';

// Store performance monitoring middleware
export const withPerformanceMonitoring = <T>(
  storeName: string,
  storeImpl: (set: any, get: any) => T
) => {
  return (set: any, get: any) => {
    const wrappedSet = (partial: any, replace?: boolean) => {
      const endTiming = performanceMonitor.startTiming(`${storeName} state update`);
      
      try {
        set(partial, replace);
      } finally {
        endTiming();
      }
    };

    const wrappedGet = () => {
      const endTiming = performanceMonitor.startTiming(`${storeName} state read`);
      
      try {
        return get();
      } finally {
        endTiming();
      }
    };

    return storeImpl(wrappedSet, wrappedGet);
  };
};

// Optimized selector middleware
export const withOptimizedSelectors = <T>(
  storeImpl: (set: any, get: any) => T
) => {
  const selectorCache = new Map();

  return (set: any, get: any) => {
    const wrappedGet = () => {
      const state = get();
      
      // Add memoized selectors to state
      if (!state._selectors) {
        state._selectors = {
          // Memoized selector for getting items by ID
          getById: memoize((id: string) => {
            return state.items?.find((item: any) => item.id === id);
          }),
          
          // Memoized selector for filtering
          getFiltered: memoize((predicate: (item: any) => boolean) => {
            return state.items?.filter(predicate) || [];
          }),
          
          // Memoized selector for sorting
          getSorted: memoize((compareFn: (a: any, b: any) => number) => {
            return [...(state.items || [])].sort(compareFn);
          }),
        };
      }
      
      return state;
    };

    return storeImpl(set, wrappedGet);
  };
};

// Batch updates middleware
export const withBatchUpdates = <T>(
  storeImpl: (set: any, get: any) => T
) => {
  let batchedUpdates: any[] = [];
  let batchTimeout: NodeJS.Timeout | null = null;

  const flushBatch = (set: any) => {
    if (batchedUpdates.length === 0) return;

    const endTiming = performanceMonitor.startTiming('Batch state update');
    
    try {
      // Merge all updates
      const mergedUpdate = batchedUpdates.reduce((acc, update) => {
        if (typeof update === 'function') {
          return update(acc);
        }
        return { ...acc, ...update };
      }, {});

      set(mergedUpdate);
      batchedUpdates = [];
    } finally {
      endTiming();
    }
  };

  return (set: any, get: any) => {
    const wrappedSet = (partial: any, replace?: boolean) => {
      if (replace) {
        // Immediate update for replace
        set(partial, replace);
        return;
      }

      // Add to batch
      batchedUpdates.push(partial);

      // Schedule flush
      if (batchTimeout) {
        clearTimeout(batchTimeout);
      }
      
      batchTimeout = setTimeout(() => {
        flushBatch(set);
        batchTimeout = null;
      }, 0);
    };

    return storeImpl(wrappedSet, get);
  };
};

// Optimized persistence middleware
export const withOptimizedPersistence = <T>(
  name: string,
  options: {
    whitelist?: string[];
    blacklist?: string[];
    throttleMs?: number;
  } = {}
) => {
  const { whitelist, blacklist, throttleMs = 1000 } = options;

  // Throttled save function
  const throttledSave = debounce(async (state: any) => {
    const endTiming = performanceMonitor.startTiming(`${name} persistence save`);
    
    try {
      let stateToSave = state;
      
      // Apply whitelist/blacklist
      if (whitelist) {
        stateToSave = Object.keys(state)
          .filter(key => whitelist.includes(key))
          .reduce((obj, key) => {
            obj[key] = state[key];
            return obj;
          }, {} as any);
      } else if (blacklist) {
        stateToSave = Object.keys(state)
          .filter(key => !blacklist.includes(key))
          .reduce((obj, key) => {
            obj[key] = state[key];
            return obj;
          }, {} as any);
      }

      await AsyncStorage.setItem(name, JSON.stringify(stateToSave));
    } catch (error) {
      console.error(`Failed to save ${name} to storage:`, error);
    } finally {
      endTiming();
    }
  }, throttleMs);

  return persist(
    (set: any, get: any, api: any) => api,
    {
      name,
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          const endTiming = performanceMonitor.startTiming(`${name} persistence load`);
          
          try {
            return await AsyncStorage.getItem(name);
          } finally {
            endTiming();
          }
        },
        setItem: async (name: string, value: string) => {
          // Use throttled save
          throttledSave(JSON.parse(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      })),
    }
  );
};

// Optimized tracks store with performance monitoring
interface OptimizedTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  coverArt: string;
  // Add other track properties
}

interface OptimizedTracksState {
  tracks: OptimizedTrack[];
  filteredTracks: OptimizedTrack[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  
  // Optimized actions
  setTracks: (tracks: OptimizedTrack[]) => void;
  addTrack: (track: OptimizedTrack) => void;
  updateTrack: (id: string, updates: Partial<OptimizedTrack>) => void;
  removeTrack: (id: string) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  // Memoized selectors
  getTrackById: (id: string) => OptimizedTrack | undefined;
  getTracksByArtist: (artist: string) => OptimizedTrack[];
  getTrendingTracks: () => OptimizedTrack[];
}

export const useOptimizedTracksStore = create<OptimizedTracksState>()(
  subscribeWithSelector(
    withPerformanceMonitoring(
      'OptimizedTracks',
      withOptimizedSelectors(
        withBatchUpdates(
          withOptimizedPersistence('optimized-tracks', {
            whitelist: ['tracks', 'searchQuery'],
            throttleMs: 2000,
          })(
            (set, get) => ({
              tracks: [],
              filteredTracks: [],
              searchQuery: '',
              isLoading: false,
              error: null,

              setTracks: (tracks) => {
                set((state) => ({
                  ...state,
                  tracks,
                  filteredTracks: tracks,
                }));
              },

              addTrack: (track) => {
                set((state) => {
                  const newTracks = [...state.tracks, track];
                  return {
                    ...state,
                    tracks: newTracks,
                    filteredTracks: state.searchQuery 
                      ? newTracks.filter(t => 
                          t.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                          t.artist.toLowerCase().includes(state.searchQuery.toLowerCase())
                        )
                      : newTracks,
                  };
                });
              },

              updateTrack: (id, updates) => {
                set((state) => {
                  const newTracks = state.tracks.map(track =>
                    track.id === id ? { ...track, ...updates } : track
                  );
                  return {
                    ...state,
                    tracks: newTracks,
                    filteredTracks: state.searchQuery
                      ? newTracks.filter(t => 
                          t.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                          t.artist.toLowerCase().includes(state.searchQuery.toLowerCase())
                        )
                      : newTracks,
                  };
                });
              },

              removeTrack: (id) => {
                set((state) => {
                  const newTracks = state.tracks.filter(track => track.id !== id);
                  return {
                    ...state,
                    tracks: newTracks,
                    filteredTracks: newTracks,
                  };
                });
              },

              setSearchQuery: (query) => {
                set((state) => {
                  const filteredTracks = query
                    ? state.tracks.filter(track =>
                        track.title.toLowerCase().includes(query.toLowerCase()) ||
                        track.artist.toLowerCase().includes(query.toLowerCase())
                      )
                    : state.tracks;

                  return {
                    ...state,
                    searchQuery: query,
                    filteredTracks,
                  };
                });
              },

              clearSearch: () => {
                set((state) => ({
                  ...state,
                  searchQuery: '',
                  filteredTracks: state.tracks,
                }));
              },

              // Memoized selectors
              getTrackById: memoize((id: string) => {
                const state = get();
                return state.tracks.find(track => track.id === id);
              }),

              getTracksByArtist: memoize((artist: string) => {
                const state = get();
                return state.tracks.filter(track => track.artist === artist);
              }),

              getTrendingTracks: memoize(() => {
                const state = get();
                // Mock trending logic - in real app would use actual metrics
                return state.tracks.slice(0, 10);
              }),
            })
          )
        )
      )
    )
  )
);

// Performance monitoring for store subscriptions
export const monitorStoreSubscriptions = () => {
  const subscriptions = new Map<string, number>();

  return {
    subscribe: (storeName: string, selector: any, callback: any) => {
      const count = subscriptions.get(storeName) || 0;
      subscriptions.set(storeName, count + 1);

      if (count > 10) {
        console.warn(`High subscription count for ${storeName}: ${count + 1}`);
      }

      return () => {
        const newCount = subscriptions.get(storeName)! - 1;
        subscriptions.set(storeName, newCount);
      };
    },

    getStats: () => {
      return Object.fromEntries(subscriptions);
    },
  };
};

// Store performance analyzer
export const analyzeStorePerformance = () => {
  const storeStats = performanceMonitor.getStats();
  
  console.group('Store Performance Analysis');
  console.log('Total operations:', storeStats.count);
  console.log('Average operation time:', storeStats.avgRenderTime.toFixed(2), 'ms');
  console.log('Slowest operation:', storeStats.maxRenderTime.toFixed(2), 'ms');
  console.log('Fastest operation:', storeStats.minRenderTime.toFixed(2), 'ms');
  
  // Get operation-specific stats
  const operations = ['state update', 'state read', 'persistence save', 'persistence load'];
  operations.forEach(op => {
    const opStats = performanceMonitor.getStats(op);
    if (opStats.count > 0) {
      console.log(`${op}:`, {
        count: opStats.count,
        avg: opStats.avgRenderTime.toFixed(2) + 'ms',
        max: opStats.maxRenderTime.toFixed(2) + 'ms',
      });
    }
  });
  
  console.groupEnd();
};

// Export performance utilities for stores
export const storePerformanceUtils = {
  withPerformanceMonitoring,
  withOptimizedSelectors,
  withBatchUpdates,
  withOptimizedPersistence,
  monitorStoreSubscriptions,
  analyzeStorePerformance,
};