import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

interface LikeButtonProps {
  trackId: string;
  initialLiked?: boolean;
  initialCount?: number;
  onLike?: (trackId: string, liked: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  disabled?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  trackId,
  initialLiked = false,
  initialCount = 0,
  onLike,
  size = 'medium',
  showCount = true,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const scaleAnim = new Animated.Value(1);
  const heartAnim = new Animated.Value(liked ? 1 : 0);

  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const textSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount]);

  const handlePress = async () => {
    if (disabled || isAnimating) return;

    setIsAnimating(true);
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : Math.max(0, count - 1);

    // Optimistic update
    setLiked(newLiked);
    setCount(newCount);

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate heart fill
    Animated.timing(heartAnim, {
      toValue: newLiked ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Call callback
    try {
      await onLike?.(trackId, newLiked);
    } catch (error) {
      // Revert on error
      setLiked(!newLiked);
      setCount(newLiked ? count : count + 1);
      console.error('Failed to update like status:', error);
    } finally {
      setIsAnimating(false);
    }
  };

  const heartColor = heartAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textSecondary, colors.error],
  });

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          opacity: disabled ? 0.5 : 1,
        }
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <Animated.View style={{ opacity: heartAnim }}>
          <Heart
            size={iconSize}
            color={colors.error}
            fill={liked ? colors.error : 'transparent'}
          />
        </Animated.View>
        {!liked && (
          <View style={StyleSheet.absoluteFill}>
            <Heart
              size={iconSize}
              color={colors.textSecondary}
              fill="transparent"
            />
          </View>
        )}
      </Animated.View>
      
      {showCount && (
        <Text
          style={[
            styles.countText,
            {
              color: liked ? colors.error : colors.textSecondary,
              fontSize: textSize,
            }
          ]}
        >
          {count > 999 ? `${(count / 1000).toFixed(1)}K` : count.toString()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconContainer: {
    position: 'relative',
  },
  countText: {
    fontWeight: '500',
  },
});