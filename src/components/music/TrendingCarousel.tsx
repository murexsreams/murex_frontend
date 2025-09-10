import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, TrendingUp, DollarSign } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { ExtendedTrack } from '../../store/tracksStore';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.7;
const cardHeight = 200;

interface TrendingCarouselProps {
  tracks: ExtendedTrack[];
  onTrackPress: (track: ExtendedTrack) => void;
  autoScroll?: boolean;
}

export const TrendingCarousel: React.FC<TrendingCarouselProps> = ({
  tracks,
  onTrackPress,
  autoScroll = false,
}) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { currentTrack, isPlaying } = useAudioPlayer();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  const formatNumber = (num: number): string => {
    if (!num || typeof num !== 'number') return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`;
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScroll && tracks.length > 1) {
      autoScrollInterval.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % tracks.length;
          scrollViewRef.current?.scrollTo({
            x: nextIndex * (cardWidth + 16),
            animated: true,
          });
          return nextIndex;
        });
      }, 4000); // Auto-scroll every 4 seconds

      return () => {
        if (autoScrollInterval.current) {
          clearInterval(autoScrollInterval.current);
        }
      };
    }
  }, [autoScroll, tracks.length]);

  // Handle manual scroll
  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (cardWidth + 16));
    setCurrentIndex(index);
    
    // Pause auto-scroll when user manually scrolls
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      // Resume auto-scroll after 6 seconds of inactivity
      setTimeout(() => {
        if (autoScroll && tracks.length > 1) {
          autoScrollInterval.current = setInterval(() => {
            setCurrentIndex((prevIndex) => {
              const nextIndex = (prevIndex + 1) % tracks.length;
              scrollViewRef.current?.scrollTo({
                x: nextIndex * (cardWidth + 16),
                animated: true,
              });
              return nextIndex;
            });
          }, 4000);
        }
      }, 6000);
    }
  };

  const renderTrackCard = (track: ExtendedTrack, index: number) => {
    const isCurrentTrack = currentTrack?.id === track.id;
    const fundingProgress = (track.currentFunding / track.fundingGoal) * 100;

    return (
      <TouchableOpacity
        key={track.id}
        style={[
          styles.card,
          {
            width: cardWidth,
            marginLeft: index === 0 ? 16 : 8,
            marginRight: index === tracks.length - 1 ? 16 : 8,
          }
        ]}
        onPress={() => onTrackPress(track)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[
            colors.surface,
            colors.background + '90',
          ]}
          style={[
            styles.cardGradient,
            {
              borderColor: isCurrentTrack ? colors.primary : colors.border,
              borderWidth: isCurrentTrack ? 2 : 1,
            }
          ]}
        >
          {/* Background Image */}
          <Image
            source={{ uri: track.coverArt }}
            style={styles.backgroundImage}
            blurRadius={20}
          />
          
          {/* Overlay */}
          <LinearGradient
            colors={[
              'transparent',
              colors.background + '60',
              colors.background + '90',
            ]}
            style={styles.overlay}
          />

          {/* Content */}
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.trendingBadge}>
                <TrendingUp size={12} color={colors.primary} />
                <Text style={[styles.trendingText, { color: colors.primary }]}>
                  #{index + 1} Trending
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.playButton,
                  { backgroundColor: colors.primary + '90' }
                ]}
                onPress={() => onTrackPress(track)}
                activeOpacity={0.8}
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause size={20} color={colors.background} />
                ) : (
                  <Play size={20} color={colors.background} />
                )}
              </TouchableOpacity>
            </View>

            {/* Track Info */}
            <View style={styles.trackInfo}>
              <Text 
                style={[styles.trackTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {track.title}
              </Text>
              <View style={styles.artistRow}>
                <Text 
                  style={[styles.artistName, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {track.artist.stageName}
                </Text>
                {track.artist.verified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.verifiedText, { color: colors.background }]}>✓</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <TrendingUp size={14} color={colors.textSecondary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  {formatNumber(track.streamCount)}
                </Text>
              </View>
              
              <View style={styles.stat}>
                <DollarSign size={14} color={colors.primary} />
                <Text style={[styles.statText, { color: colors.primary }]}>
                  {track.estimatedROI}% ROI
                </Text>
              </View>
            </View>

            {/* Funding Progress */}
            <View style={styles.fundingSection}>
              <View style={styles.fundingHeader}>
                <Text style={[styles.fundingLabel, { color: colors.textSecondary }]}>
                  Funding Progress
                </Text>
                <Text style={[styles.fundingPercentage, { color: colors.primary }]}>
                  {fundingProgress.toFixed(0)}%
                </Text>
              </View>
              
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: fundingProgress >= 100 ? '#10B981' : colors.primary,
                      width: `${Math.min(fundingProgress, 100)}%`,
                    }
                  ]}
                />
              </View>
              
              <View style={styles.fundingAmounts}>
                <Text style={[styles.fundingAmount, { color: colors.text }]}>
                  {formatCurrency(track.currentFunding)}
                </Text>
                <Text style={[styles.fundingGoal, { color: colors.textSecondary }]}>
                  of {formatCurrency(track.fundingGoal)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (tracks.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No trending tracks available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth + 16}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {tracks.map((track, index) => renderTrackCard(track, index))}
      </ScrollView>
      
      {/* Indicators */}
      <View style={styles.indicators}>
        {tracks.slice(0, Math.min(tracks.length, 5)).map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentIndex ? colors.primary : colors.border,
                transform: [{ scale: index === currentIndex ? 1.2 : 1 }],
              }
            ]}
            onPress={() => {
              setCurrentIndex(index);
              scrollViewRef.current?.scrollTo({
                x: index * (cardWidth + 16),
                animated: true,
              });
            }}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  card: {
    height: cardHeight,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '600',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 8,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fundingSection: {
    gap: 4,
  },
  fundingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fundingLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  fundingPercentage: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  fundingAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fundingAmount: {
    fontSize: 10,
    fontWeight: '600',
  },
  fundingGoal: {
    fontSize: 10,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});