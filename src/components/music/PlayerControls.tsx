import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Shuffle, 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Repeat, 
  Repeat1 
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { RepeatMode } from '../../store/playerStore';

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading?: boolean;
  isShuffled?: boolean;
  repeatMode?: RepeatMode;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onShuffle?: () => void;
  onRepeat?: () => void;
  size?: 'small' | 'medium' | 'large';
  showSecondaryControls?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isLoading = false,
  isShuffled = false,
  repeatMode = 'none',
  hasNext = true,
  hasPrevious = true,
  onPlayPause,
  onNext,
  onPrevious,
  onShuffle,
  onRepeat,
  size = 'medium',
  showSecondaryControls = true,
}) => {
  const { colors, spacing } = useTheme();

  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          playButton: 40,
          playIcon: 20,
          skipButton: 32,
          skipIcon: 16,
          secondaryButton: 28,
          secondaryIcon: 14,
        };
      case 'large':
        return {
          playButton: 72,
          playIcon: 32,
          skipButton: 56,
          skipIcon: 24,
          secondaryButton: 44,
          secondaryIcon: 20,
        };
      default: // medium
        return {
          playButton: 56,
          playIcon: 24,
          skipButton: 44,
          skipIcon: 20,
          secondaryButton: 36,
          secondaryIcon: 16,
        };
    }
  };

  const sizes = getSizes();

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return Repeat1;
      case 'all':
        return Repeat;
      default:
        return Repeat;
    }
  };

  const getRepeatColor = () => {
    return repeatMode !== 'none' ? colors.primary : colors.textSecondary;
  };

  const RepeatIcon = getRepeatIcon();

  return (
    <View style={styles.container}>
      {/* Secondary Controls Row */}
      {showSecondaryControls && (
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                width: sizes.secondaryButton,
                height: sizes.secondaryButton,
              }
            ]}
            onPress={onShuffle}
            activeOpacity={0.7}
          >
            <Shuffle 
              size={sizes.secondaryIcon} 
              color={isShuffled ? colors.primary : colors.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                width: sizes.secondaryButton,
                height: sizes.secondaryButton,
              }
            ]}
            onPress={onRepeat}
            activeOpacity={0.7}
          >
            <RepeatIcon 
              size={sizes.secondaryIcon} 
              color={getRepeatColor()} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Controls */}
      <View style={styles.mainControls}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[
            styles.skipButton,
            {
              width: sizes.skipButton,
              height: sizes.skipButton,
              opacity: hasPrevious ? 1 : 0.5,
            }
          ]}
          onPress={onPrevious}
          disabled={!hasPrevious}
          activeOpacity={0.7}
        >
          <SkipBack size={sizes.skipIcon} color={colors.text} />
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <TouchableOpacity
          onPress={onPlayPause}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.playButton,
              {
                width: sizes.playButton,
                height: sizes.playButton,
                borderRadius: sizes.playButton / 2,
              }
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : isPlaying ? (
              <Pause size={sizes.playIcon} color={colors.background} />
            ) : (
              <Play 
                size={sizes.playIcon} 
                color={colors.background}
                style={{ marginLeft: 2 }} // Slight offset for visual balance
              />
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.skipButton,
            {
              width: sizes.skipButton,
              height: sizes.skipButton,
              opacity: hasNext ? 1 : 0.5,
            }
          ]}
          onPress={onNext}
          disabled={!hasNext}
          activeOpacity={0.7}
        >
          <SkipForward size={sizes.skipIcon} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 200,
    marginBottom: 24,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});