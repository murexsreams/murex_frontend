import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronDown, 
  Heart, 
  Share, 
  MoreHorizontal,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Volume2,
  List
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';

const { width: screenWidth } = Dimensions.get('window');

interface FullPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export const FullPlayer: React.FC<FullPlayerProps> = ({ visible, onClose }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { 
    currentTrack, 
    isPlaying, 
    isLoading,
    currentTime,
    duration,
    volume,
    isShuffled,
    repeatMode,
    hasNext,
    hasPrevious,
    formattedCurrentTime,
    formattedDuration,
    controls 
  } = useAudioPlayer();

  if (!currentTrack) {
    return null;
  }

  const handleClose = () => {
    controls.hideFullPlayer();
    onClose();
  };

  const handleLike = () => {
    // TODO: Implement like functionality
    console.log('Like track:', currentTrack.id);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share track:', currentTrack.id);
  };

  const handleMore = () => {
    // TODO: Implement more options
    console.log('More options for track:', currentTrack.id);
  };

  const handleShowQueue = () => {
    // TODO: Implement queue view
    console.log('Show queue');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <ChevronDown size={24} color={colors.text} />
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>
                  Now Playing
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleMore}
                activeOpacity={0.7}
              >
                <MoreHorizontal size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Cover Art */}
            <View style={styles.coverContainer}>
              <Image
                source={{ uri: currentTrack.coverArt }}
                style={[
                  styles.coverArt,
                  { 
                    borderRadius: borderRadius.lg,
                    shadowColor: colors.primary,
                  }
                ]}
              />
            </View>

            {/* Track Info */}
            <View style={styles.trackInfo}>
              <Text 
                style={[styles.trackTitle, { color: colors.text }]}
                numberOfLines={2}
              >
                {currentTrack.title}
              </Text>
              <Text 
                style={[styles.artistName, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {currentTrack.artist}
              </Text>
            </View>

            {/* Social Actions */}
            <View style={styles.socialActions}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleLike}
                activeOpacity={0.7}
              >
                <Heart size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Share size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={controls.seekTo}
              />
              <View style={styles.timeLabels}>
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                  {formattedCurrentTime}
                </Text>
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                  {formattedDuration}
                </Text>
              </View>
            </View>

            {/* Player Controls */}
            <View style={styles.controlsSection}>
              <PlayerControls
                isPlaying={isPlaying}
                isLoading={isLoading}
                isShuffled={isShuffled}
                repeatMode={repeatMode}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onPlayPause={controls.togglePlayPause}
                onNext={controls.playNext}
                onPrevious={controls.playPrevious}
                onShuffle={controls.toggleShuffle}
                onRepeat={() => {
                  const modes = ['none', 'one', 'all'] as const;
                  const currentIndex = modes.indexOf(repeatMode);
                  const nextMode = modes[(currentIndex + 1) % modes.length];
                  controls.setRepeatMode(nextMode);
                }}
                size="large"
              />
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.bottomButton}
                onPress={handleShowQueue}
                activeOpacity={0.7}
              >
                <List size={20} color={colors.textSecondary} />
                <Text style={[styles.bottomButtonText, { color: colors.textSecondary }]}>
                  Queue
                </Text>
              </TouchableOpacity>
              
              <View style={styles.volumeContainer}>
                <Volume2 size={16} color={colors.textSecondary} />
                <View style={[styles.volumeSlider, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.volumeFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${volume * 100}%`,
                      }
                    ]}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  coverArt: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8,
    maxWidth: 320,
    maxHeight: 320,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  socialActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 32,
  },
  socialButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    marginBottom: 32,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  controlsSection: {
    marginBottom: 32,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    maxWidth: 120,
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  volumeFill: {
    height: '100%',
    borderRadius: 2,
  },
});