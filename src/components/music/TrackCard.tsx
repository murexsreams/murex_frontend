import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

import { 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { ExtendedTrack } from '../../store/tracksStore';
import { Button } from '../ui/Button';

const { width: screenWidth } = Dimensions.get('window');

interface TrackCardProps {
  track: ExtendedTrack;
  onPlay?: () => void;
  onInvest?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  showInvestmentInfo?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  onPlay,
  onInvest,
  onLike,
  onComment,
  showInvestmentInfo = false,
  variant = 'default',
}) => {
  const { colors, borderRadius } = useTheme();
  const { currentTrack, isPlaying } = useAudioPlayer();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  const fundingProgress = (track.currentFunding / track.fundingGoal) * 100;
  const isFullyFunded = fundingProgress >= 100;

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

  const getCardStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.compactCard;
      case 'featured':
        return styles.featuredCard;
      default:
        return styles.defaultCard;
    }
  };

  const getCoverSize = () => {
    switch (variant) {
      case 'compact':
        return 60;
      case 'featured':
        return 120;
      default:
        return 80;
    }
  };

  const coverSize = getCoverSize();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getCardStyle(),
        {
          backgroundColor: colors.surface,
          borderColor: isCurrentTrack ? colors.primary : colors.border,
          borderWidth: isCurrentTrack ? 2 : 1,
        }
      ]}
      onPress={onPlay || (() => {})}
      activeOpacity={0.8}
    >
      {/* Cover Art and Play Button */}
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: track.coverArt }}
          style={[
            styles.coverArt,
            {
              width: coverSize,
              height: coverSize,
              borderRadius: borderRadius.md,
            }
          ]}
        />
        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: colors.primary + '90' }
          ]}
          onPress={onPlay || (() => {})}
          activeOpacity={0.8}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause size={16} color={colors.background} />
          ) : (
            <Play size={16} color={colors.background} />
          )}
        </TouchableOpacity>
      </View>

      {/* Track Info */}
      <View style={styles.trackInfo}>
        <View style={styles.trackHeader}>
          <View style={styles.trackTitleContainer}>
            <Text 
              style={[styles.trackTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {track.title}
            </Text>
            {track.artist.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.verifiedText, { color: colors.background }]}>✓</Text>
              </View>
            )}
          </View>
          <Text 
            style={[styles.artistName, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {track.artist.stageName}
          </Text>
          <Text 
            style={[styles.genre, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {track.genre}
          </Text>
        </View>

        {/* Investment Info */}
        {showInvestmentInfo && (
          <View style={styles.investmentInfo}>
            <View style={styles.fundingProgress}>
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
                      backgroundColor: isFullyFunded ? '#10B981' : colors.primary,
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

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <TrendingUp size={14} color={colors.textSecondary} />
                <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                  {formatNumber(track.streamCount)}
                </Text>
              </View>
              <View style={styles.metric}>
                <DollarSign size={14} color={colors.primary} />
                <Text style={[styles.metricText, { color: colors.primary }]}>
                  {track.estimatedROI}% ROI
                </Text>
              </View>
              <View style={styles.metric}>
                <Users size={14} color={colors.textSecondary} />
                <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                  {formatNumber(track.artist.followerCount)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Social Stats */}
        <View style={styles.socialStats}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={onLike || (() => {})}
            activeOpacity={0.7}
          >
            <Heart 
              size={16} 
              color={track.isLiked ? '#EF4444' : colors.textSecondary}
              fill={track.isLiked ? '#EF4444' : 'none'}
            />
            <Text style={[styles.socialText, { color: colors.textSecondary }]}>
              {formatNumber(track.likeCount)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={onComment || (() => {})}
            activeOpacity={0.7}
          >
            <MessageCircle size={16} color={colors.textSecondary} />
            <Text style={[styles.socialText, { color: colors.textSecondary }]}>
              {formatNumber(track.commentCount)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        {showInvestmentInfo && !isFullyFunded && (
          <Button
            title={`Invest Now`}
            onPress={onInvest || (() => {})}
            variant="primary"
            size="small"
            style={styles.investButton}
          />
        )}
        
        {isFullyFunded && (
          <View style={[styles.fundedBadge, { backgroundColor: '#10B981' + '20' }]}>
            <Text style={[styles.fundedText, { color: '#10B981' }]}>
              Fully Funded ✓
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultCard: {
    padding: 16,
    flexDirection: 'row',
  },
  compactCard: {
    padding: 12,
    flexDirection: 'row',
  },
  featuredCard: {
    padding: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  coverContainer: {
    position: 'relative',
    marginRight: 16,
  },
  coverArt: {
    // Size set dynamically
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  trackInfo: {
    flex: 1,
  },
  trackHeader: {
    marginBottom: 12,
  },
  trackTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  artistName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  genre: {
    fontSize: 12,
    fontWeight: '400',
  },
  investmentInfo: {
    marginBottom: 12,
  },
  fundingProgress: {
    marginBottom: 8,
  },
  fundingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fundingLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  fundingPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  fundingAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fundingAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  fundingGoal: {
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '500',
  },
  socialStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialText: {
    fontSize: 12,
    fontWeight: '500',
  },
  investButton: {
    alignSelf: 'flex-start',
  },
  fundedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  fundedText: {
    fontSize: 12,
    fontWeight: '600',
  },
});