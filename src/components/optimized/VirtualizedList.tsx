// Optimized virtualized list component for large datasets

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  FlatList,
  VirtualizedList,
  Dimensions,
  ViewStyle,
  ListRenderItem,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { performanceMonitor } from '../../utils/performance';

interface OptimizedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  itemHeight?: number;
  estimatedItemSize?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  horizontal?: boolean;
  numColumns?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  initialNumToRender?: number;
  removeClippedSubviews?: boolean;
  getItemLayout?: (data: T[] | null | undefined, index: number) => {
    length: number;
    offset: number;
    index: number;
  };
}

export function OptimizedList<T>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  estimatedItemSize = 100,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  onRefresh,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  style,
  contentContainerStyle,
  horizontal = false,
  numColumns = 1,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  initialNumToRender = 10,
  removeClippedSubviews = true,
  getItemLayout,
}: OptimizedListProps<T>) {
  const { colors } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(refreshing);
  const listRef = useRef<FlatList<T>>(null);
  const renderCountRef = useRef(0);

  // Performance monitoring
  const endTiming = useRef<(() => void) | null>(null);

  useEffect(() => {
    endTiming.current = performanceMonitor.startTiming('OptimizedList render');
    return () => {
      if (endTiming.current) {
        endTiming.current();
      }
    };
  });

  // Memoized item layout calculation
  const memoizedGetItemLayout = useMemo(() => {
    if (getItemLayout) return getItemLayout;
    
    if (itemHeight) {
      return (data: T[] | null | undefined, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      });
    }
    
    return undefined;
  }, [getItemLayout, itemHeight]);

  // Optimized render item with performance tracking
  const optimizedRenderItem = useCallback<ListRenderItem<T>>(
    (info) => {
      renderCountRef.current++;
      
      // Track render performance for first few items
      if (renderCountRef.current <= 5) {
        const endItemTiming = performanceMonitor.startTiming(`List item ${info.index} render`);
        
        // Schedule timing end after render
        setTimeout(() => {
          endItemTiming();
        }, 0);
      }

      return renderItem(info);
    },
    [renderItem]
  );

  // Optimized refresh handler
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    const endRefreshTiming = performanceMonitor.startTiming('List refresh');
    
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      endRefreshTiming();
    }
  }, [onRefresh]);

  // Optimized end reached handler
  const handleEndReached = useCallback(() => {
    if (onEndReached) {
      const endLoadTiming = performanceMonitor.startTiming('List load more');
      onEndReached();
      setTimeout(() => {
        endLoadTiming();
      }, 100);
    }
  }, [onEndReached]);

  // Calculate optimal window size based on screen dimensions
  const screenHeight = Dimensions.get('window').height;
  const optimalWindowSize = useMemo(() => {
    if (itemHeight) {
      const itemsPerScreen = Math.ceil(screenHeight / itemHeight);
      return Math.max(windowSize, itemsPerScreen * 2);
    }
    return windowSize;
  }, [windowSize, itemHeight, screenHeight]);

  // Calculate optimal initial render count
  const optimalInitialNumToRender = useMemo(() => {
    if (itemHeight) {
      const itemsPerScreen = Math.ceil(screenHeight / itemHeight);
      return Math.max(initialNumToRender, itemsPerScreen + 5);
    }
    return initialNumToRender;
  }, [initialNumToRender, itemHeight, screenHeight]);

  // Refresh control
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
    />
  ) : undefined;

  return (
    <FlatList
      ref={listRef}
      data={data}
      renderItem={optimizedRenderItem}
      keyExtractor={keyExtractor}
      getItemLayout={memoizedGetItemLayout}
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshControl={refreshControl}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      style={style}
      contentContainerStyle={contentContainerStyle}
      horizontal={horizontal}
      numColumns={numColumns}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={optimalWindowSize}
      initialNumToRender={optimalInitialNumToRender}
      removeClippedSubviews={removeClippedSubviews}
      // Performance optimizations
      disableVirtualization={false}
      legacyImplementation={false}
      // Reduce re-renders
      extraData={data.length}
      // Improve scroll performance
      scrollEventThrottle={16}
      // Memory optimization
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
    />
  );
}

// Memoized list item wrapper for better performance
export const MemoizedListItem = React.memo(
  <T extends any>({ 
    item, 
    index, 
    renderContent 
  }: { 
    item: T; 
    index: number; 
    renderContent: (item: T, index: number) => React.ReactElement;
  }) => {
    return renderContent(item, index);
  },
  (prevProps, nextProps) => {
    // Custom comparison for better memoization
    return (
      prevProps.item === nextProps.item &&
      prevProps.index === nextProps.index
    );
  }
);

// Grid list optimization
export function OptimizedGrid<T>({
  data,
  renderItem,
  keyExtractor,
  numColumns = 2,
  itemHeight,
  spacing = 8,
  ...otherProps
}: OptimizedListProps<T> & {
  spacing?: number;
}) {
  const screenWidth = Dimensions.get('window').width;
  
  // Calculate item width for grid
  const itemWidth = useMemo(() => {
    const totalSpacing = spacing * (numColumns + 1);
    return (screenWidth - totalSpacing) / numColumns;
  }, [screenWidth, numColumns, spacing]);

  // Optimized grid item renderer
  const gridRenderItem = useCallback<ListRenderItem<T>>(
    (info) => {
      const itemStyle = {
        width: itemWidth,
        marginLeft: spacing,
        marginBottom: spacing,
      };

      return (
        <div style={itemStyle}>
          {renderItem(info)}
        </div>
      );
    },
    [renderItem, itemWidth, spacing]
  );

  return (
    <OptimizedList
      {...otherProps}
      data={data}
      renderItem={gridRenderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      itemHeight={itemHeight}
      contentContainerStyle={{
        paddingTop: spacing,
        paddingRight: spacing,
      }}
    />
  );
}

// Infinite scroll list with automatic loading
export function InfiniteScrollList<T>({
  data,
  loadMore,
  hasMore = true,
  loading = false,
  ...otherProps
}: OptimizedListProps<T> & {
  loadMore: () => Promise<void>;
  hasMore?: boolean;
  loading?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(loading);

  const handleEndReached = useCallback(async () => {
    if (hasMore && !isLoading) {
      setIsLoading(true);
      const endLoadTiming = performanceMonitor.startTiming('Infinite scroll load');
      
      try {
        await loadMore();
      } finally {
        setIsLoading(false);
        endLoadTiming();
      }
    }
  }, [hasMore, isLoading, loadMore]);

  const LoadingFooter = useMemo(() => {
    if (!isLoading) return null;
    
    return (
      <div style={{ padding: 16, alignItems: 'center' }}>
        <div>Loading more...</div>
      </div>
    );
  }, [isLoading]);

  return (
    <OptimizedList
      {...otherProps}
      data={data}
      onEndReached={handleEndReached}
      ListFooterComponent={LoadingFooter}
    />
  );
}

// Section list optimization
export interface SectionData<T> {
  title: string;
  data: T[];
}

export function OptimizedSectionList<T>({
  sections,
  renderItem,
  renderSectionHeader,
  keyExtractor,
  ...otherProps
}: {
  sections: SectionData<T>[];
  renderItem: ListRenderItem<T>;
  renderSectionHeader: (info: { section: SectionData<T> }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
} & Omit<OptimizedListProps<T>, 'data'>) {
  
  // Flatten sections for FlatList
  const flatData = useMemo(() => {
    const result: (T | { isHeader: true; section: SectionData<T> })[] = [];
    
    sections.forEach(section => {
      result.push({ isHeader: true, section });
      result.push(...section.data);
    });
    
    return result;
  }, [sections]);

  // Custom render item for sections
  const sectionRenderItem = useCallback<ListRenderItem<any>>(
    (info) => {
      const item = info.item;
      
      if (item.isHeader) {
        return renderSectionHeader({ section: item.section });
      }
      
      return renderItem({ ...info, item });
    },
    [renderItem, renderSectionHeader]
  );

  // Custom key extractor for sections
  const sectionKeyExtractor = useCallback(
    (item: any, index: number) => {
      if (item.isHeader) {
        return `header-${item.section.title}`;
      }
      return keyExtractor(item, index);
    },
    [keyExtractor]
  );

  return (
    <OptimizedList
      {...otherProps}
      data={flatData}
      renderItem={sectionRenderItem}
      keyExtractor={sectionKeyExtractor}
    />
  );
}