import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, SkipForward, ChevronUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../hooks/useTheme';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { AccessibleButton, useAccessibility } from '../ui/AccessibilityHelpers';
import { RootStackParamList } from '../../navigation/AppNavigator';

interface MiniPlayerProps {
  onExpand?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, spacing, borderRadius } = useTheme();
  const { announceForScreenReader } = useAccessibility();
  const { 
    currentTrack, 
    isPlaying, 
    isLoading, 
    progress, 
    controls 
  } = useAudioPlayer();

  // Animation refs
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;

  // Slide up animation when track changes
  useEffect(() => {
    if (currentTrack) {
      Animated.spring(slideUpAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
      
      announceForScreenReader(`Now playing ${currentTrack.title} by ${currentTrack.artist}`);
    } else {
      Animated.timing(slideUpAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }).start();
    }
  }, [currentTrack, slideUpAnim, announceForScreenReader]);

  // Progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();
  }, [progress, progressAnim]);

  // Loading spinner animation
  useEffect(() => {
    if (isLoading) {
      const spin = Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      loadingRotation.setValue(0);
    }
  }, [isLoading, loadingRotation]);

  // Pulse animation for play button when playing
  useEffect(() => {
    if (isPlaying) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, pulseAnim]);

  if (!currentTrack) {
    return null;
  }

  const handlePlayPause = () => {
    controls.togglePlayPause();
    announceForScreenReader(isPlaying ? 'Paused' : 'Playing');
  };

  const handleNext = () => {
    controls.playNext();
    announceForScreenReader('Next track');
  };

  const handleExpand = () => {
    navigation.navigate('FullPlayer');
    onExpand?.();
    announceForScreenReader('Opened full player');
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.surface,
          transform: [{ translateY: slideUpAnim }],
        }
      ]}
    >
      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.primary,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Track Info */}
        <AccessibleButton
          onPress={handleExpand}
          accessibilityLabel={`Now playing ${currentTrack.title} by ${currentTrack.artist}. Tap to open full player.`}
          accessibilityHint="Opens the full music player with additional controls"
          style={styles.trackInfo}
        >
          <Image
            source={{ uri: currentTrack.coverArt }}
            style={[styles.coverArt, { borderRadius: borderRadius.sm }]}
            accessible={false}
          />
          <View style={styles.textContainer}>
            <Text 
              style={[styles.trackTitle, { color: colors.text }]}
              numberOfLines={1}
              accessible={false}
            >
              {currentTrack.title}
            </Text>
            <Text 
              style={[styles.artistName, { color: colors.textSecondary }]}
              numberOfLines={1}
              accessible={false}
            >
              {currentTrack.artist}
            </Text>
          </View>
        </AccessibleButton>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Play/Pause Button */}
          <AccessibleButton
            onPress={handlePlayPause}
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            accessibilityHint={isPlaying ? 'Pauses the current track' : 'Plays the current track'}
            disabled={isLoading}
            style={[styles.controlButton, { backgroundColor: colors.primary + '20' }]}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              {isLoading ? (
                <Animated.View
                  style={[
                    styles.loadingIndicator,
                    {
                      transform: [{
                        rotate: loadingRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      }],
                    },
                  ]}
                />
              ) : isPlaying ? (
                <Pause size={20} color={colors.primary} />
              ) : (
                <Play size={20} color={colors.primary} />
              )}
            </Animated.View>
          </AccessibleButton>

          {/* Next Button */}
          <AccessibleButton
            onPress={handleNext}
            accessibilityLabel="Next track"
            accessibilityHint="Plays the next track in the queue"
            style={styles.controlButton}
          >
            <SkipForward size={20} color={colors.textSecondary} />
          </AccessibleButton>

          {/* Expand Button */}
          <AccessibleButton
            onPress={handleExpand}
            accessibilityLabel="Open full player"
            accessibilityHint="Opens the full music player interface"
            style={styles.controlButton}
          >
            <ChevronUp size={20} color={colors.textSecondary} />
          </AccessibleButton>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressContainer: {
    height: 2,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 64,
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverArt: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderTopColor: 'transparent',
    // Note: In a real app, you'd use a proper loading animation
  },
});