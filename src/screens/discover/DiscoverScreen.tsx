import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useTracksStore } from '../../store/tracksStore';
import { TrackCard } from '../../components/music/TrackCard';
import { FilterBar } from '../../components/music/FilterBar';
import { TrendingCarousel } from '../../components/music/TrendingCarousel';
import { Input } from '../../components/ui/Input';
import { LoadingState, SkeletonTrackCard } from '../../components/ui/LoadingState';
import { ErrorState, NetworkStatus } from '../../components/ui/ErrorState';
import { FadeIn, SlideIn, StaggeredList } from '../../components/ui/AnimatedTransitions';
import { AccessibleText, ScreenReaderAnnouncement, useAccessibility } from '../../components/ui/AccessibilityHelpers';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

export const DiscoverScreen: React.FC = () => {
  const { colors } = useTheme();
  const [showFilters, setShowFilters] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const { announceForScreenReader } = useAccessibility();
  
  const filteredTracks = useTracksStore((state) => state.filteredTracks);
  const allTracks = useTracksStore((state) => state.tracks);
  const filters = useTracksStore((state) => state.filters);
  const searchQuery = useTracksStore((state) => state.searchQuery);
  const setFilters = useTracksStore((state) => state.setFilters);
  const setSearchQuery = useTracksStore((state) => state.setSearchQuery);
  const applyFilters = useTracksStore((state) => state.applyFilters);
  const clearFilters = useTracksStore((state) => state.clearFilters);
  const toggleLike = useTracksStore((state) => state.toggleLike);
  const { controls } = useAudioPlayer();

  // Simulate initial loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        announceForScreenReader(`Loaded ${filteredTracks.length} tracks`);
      } catch (err) {
        setError('Failed to load tracks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filteredTracks.length, announceForScreenReader]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      announceForScreenReader('Tracks refreshed');
    } catch (err) {
      setError('Failed to refresh tracks');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Simulate retry
    setTimeout(() => {
      setIsLoading(false);
      announceForScreenReader('Tracks loaded successfully');
    }, 1000);
  };

  const handlePlayTrack = (trackId: string) => {
    const track = filteredTracks.find(t => t.id === trackId);
    if (track) {
      controls.playTrackNow(track);
      announceForScreenReader(`Now playing ${track.title} by ${track.artist.stageName}`);
    }
  };

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    applyFilters();
    announceForScreenReader(`Filters applied. ${filteredTracks.length} tracks found`);
  };

  const handleClearFilters = () => {
    clearFilters();
    announceForScreenReader('Filters cleared');
  };

  const toggleFilterVisibility = () => {
    setShowFilters(!showFilters);
    announceForScreenReader(showFilters ? 'Filters hidden' : 'Filters shown');
  };

  const handleSearchSubmit = () => {
    applyFilters();
    announceForScreenReader(`Search results: ${filteredTracks.length} tracks found`);
  };

  // Get trending tracks (tracks with trending: true)
  const trendingTracks = allTracks.filter(track => track.trending);

  const handleTrendingTrackPress = (track: any) => {
    handlePlayTrack(track.id);
  };

  const handleLikeTrack = (trackId: string) => {
    toggleLike(trackId);
    const track = filteredTracks.find(t => t.id === trackId);
    if (track) {
      announceForScreenReader(track.isLiked ? `Liked ${track.title}` : `Unliked ${track.title}`);
    }
  };

  const handleInvestTrack = (trackId: string) => {
    // TODO: Open investment modal
    console.log('Invest in track:', trackId);
    announceForScreenReader('Opening investment modal');
  };

  const handleCommentTrack = (trackId: string) => {
    // TODO: Open comments modal
    console.log('Comment on track:', trackId);
    announceForScreenReader('Opening comments');
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <AccessibleText
            style={[styles.title, { color: colors.text }]}
            accessibilityRole="header"
          >
            Discover Music
          </AccessibleText>
          <AccessibleText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Loading tracks...
          </AccessibleText>
        </View>
        <LoadingState message="Loading tracks..." size="large" />
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonTrackCard key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <NetworkStatus isOnline={isOnline} onRetry={handleRetry} />
        <ErrorState
          title="Failed to Load Tracks"
          message={error}
          type="network"
          onRetry={handleRetry}
          style={styles.errorContainer}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <NetworkStatus isOnline={isOnline} onRetry={handleRetry} />
      
      <FadeIn duration={400}>
        <View style={styles.header}>
          <AccessibleText
            style={[styles.title, { color: colors.text }]}
            accessibilityRole="header"
          >
            Discover Music
          </AccessibleText>
          <AccessibleText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Find your next investment opportunity
          </AccessibleText>
          
          <SlideIn direction="up" delay={200}>
            <Input
              placeholder="Search tracks, artists, genres..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              style={styles.searchInput}
              accessibilityLabel="Search for tracks, artists, or genres"
              accessibilityHint="Enter search terms and press search to find tracks"
            />
          </SlideIn>
        </View>
      </FadeIn>

      <SlideIn direction="down" delay={300}>
        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          visible={showFilters}
          onToggleVisibility={toggleFilterVisibility}
        />
      </SlideIn>

      {/* Trending Section */}
      {trendingTracks.length > 0 && (
        <SlideIn direction="left" delay={400}>
          <View style={styles.trendingSection}>
            <View style={styles.sectionHeader}>
              <AccessibleText
                style={[styles.sectionTitle, { color: colors.text }]}
                accessibilityRole="header"
              >
                🔥 Trending Now
              </AccessibleText>
              <AccessibleText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Hot tracks everyone's investing in
              </AccessibleText>
            </View>
            <TrendingCarousel
              tracks={trendingTracks}
              onTrackPress={handleTrendingTrackPress}
              autoScroll={true}
            />
          </View>
        </SlideIn>
      )}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* All Tracks Section */}
        <FadeIn delay={500}>
          <View style={styles.sectionHeader}>
            <AccessibleText
              style={[styles.sectionTitle, { color: colors.text }]}
              accessibilityRole="header"
            >
              All Tracks
            </AccessibleText>
            <AccessibleText
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
              accessibilityLabel={`${filteredTracks.length} tracks available for investment`}
            >
              {filteredTracks.length} tracks available
            </AccessibleText>
          </View>
        </FadeIn>

        {filteredTracks.length > 0 ? (
          <StaggeredList staggerDelay={100} animationType="slide">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={() => handlePlayTrack(track.id)}
                onLike={() => handleLikeTrack(track.id)}
                onInvest={() => handleInvestTrack(track.id)}
                onComment={() => handleCommentTrack(track.id)}
                showInvestmentInfo={true}
                variant="default"
              />
            ))}
          </StaggeredList>
        ) : (
          <FadeIn delay={600}>
            <View style={styles.emptyState}>
              <AccessibleText
                style={[styles.emptyText, { color: colors.textSecondary }]}
                accessibilityRole="summary"
              >
                No tracks found matching your filters
              </AccessibleText>
            </View>
          </FadeIn>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 16,
  },
  searchInput: {
    marginTop: 8,
  },
  trendingSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Account for mini player
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonList: {
    paddingHorizontal: 16,
    flex: 1,
  },
});