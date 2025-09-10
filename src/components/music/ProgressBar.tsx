import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ProgressBarProps {
  currentTime: number; // in milliseconds
  duration: number; // in milliseconds
  onSeek?: (position: number) => void;
  height?: number;
  thumbSize?: number;
  showThumb?: boolean;
  disabled?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  height = 4,
  thumbSize = 16,
  showThumb = true,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragPosition, setDragPosition] = useState(0);
  
  const progress = duration > 0 ? currentTime / duration : 0;
  const displayProgress = isDragging ? dragPosition : progress;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    
    onPanResponderGrant: (event) => {
      setIsDragging(true);
      const { locationX } = event.nativeEvent;
      const newProgress = Math.max(0, Math.min(1, locationX / trackWidth));
      setDragPosition(newProgress);
    },
    
    onPanResponderMove: (event) => {
      const { locationX } = event.nativeEvent;
      const newProgress = Math.max(0, Math.min(1, locationX / trackWidth));
      setDragPosition(newProgress);
    },
    
    onPanResponderRelease: () => {
      setIsDragging(false);
      if (onSeek && duration > 0) {
        const seekPosition = dragPosition * duration;
        onSeek(seekPosition);
      }
    },
  });

  const handleTrackPress = useCallback((event: any) => {
    if (disabled || !onSeek || duration === 0) return;
    
    const { locationX } = event.nativeEvent;
    const newProgress = Math.max(0, Math.min(1, locationX / trackWidth));
    const seekPosition = newProgress * duration;
    onSeek(seekPosition);
  }, [disabled, onSeek, duration, trackWidth]);

  const handleTrackLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(width);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.track,
          {
            height: Math.max(height, 20), // Minimum touch target
            backgroundColor: colors.border,
            borderRadius: height / 2,
          }
        ]}
        onLayout={handleTrackLayout}
        onPress={handleTrackPress}
        disabled={disabled}
        activeOpacity={1}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.trackInner,
            {
              height,
              backgroundColor: colors.border,
              borderRadius: height / 2,
            }
          ]}
        >
          <View
            style={[
              styles.progress,
              {
                height,
                backgroundColor: colors.primary,
                borderRadius: height / 2,
                width: `${displayProgress * 100}%`,
              },
            ]}
          />
          
          {showThumb && !disabled && (
            <View
              style={[
                styles.thumbContainer,
                {
                  left: `${displayProgress * 100}%`,
                  marginLeft: -thumbSize / 2,
                }
              ]}
            >
              <View
                style={[
                  styles.thumb,
                  {
                    width: thumbSize,
                    height: thumbSize,
                    borderRadius: thumbSize / 2,
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    opacity: isDragging ? 1 : 0.8,
                    transform: [{ scale: isDragging ? 1.2 : 1 }],
                  }
                ]}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  track: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInner: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  progress: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  thumbContainer: {
    position: 'absolute',
    top: -6, // Center the thumb on the track
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});