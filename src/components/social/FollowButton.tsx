import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { UserPlus, UserCheck } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

interface FollowButtonProps {
  artistId: string;
  initialFollowing?: boolean;
  onFollow?: (artistId: string, following: boolean) => Promise<void>;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'minimal';
  disabled?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  artistId,
  initialFollowing = false,
  onFollow,
  size = 'medium',
  variant = 'default',
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [following, setFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  
  const scaleAnim = new Animated.Value(1);

  const iconSize = size === 'small' ? 14 : size === 'medium' ? 16 : 18;
  const textSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
  const paddingVertical = size === 'small' ? 6 : size === 'medium' ? 8 : 10;
  const paddingHorizontal = size === 'small' ? 12 : size === 'medium' ? 16 : 20;

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  const handlePress = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    const newFollowing = !following;

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Optimistic update
    setFollowing(newFollowing);

    try {
      await onFollow?.(artistId, newFollowing);
    } catch (error) {
      // Revert on error
      setFollowing(!newFollowing);
      console.error('Failed to update follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyle = () => {
    const baseStyle = {
      paddingVertical,
      paddingHorizontal,
      borderRadius: 20,
      borderWidth: variant === 'outline' ? 1 : 0,
    };

    if (variant === 'minimal') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 8,
      };
    }

    if (following) {
      return {
        ...baseStyle,
        backgroundColor: variant === 'outline' ? 'transparent' : colors.surface,
        borderColor: colors.border,
      };
    }

    return {
      ...baseStyle,
      backgroundColor: variant === 'outline' ? 'transparent' : colors.primary,
      borderColor: colors.primary,
    };
  };

  const getTextColor = () => {
    if (variant === 'minimal') {
      return following ? colors.textSecondary : colors.primary;
    }

    if (following) {
      return variant === 'outline' ? colors.text : colors.textSecondary;
    }

    return variant === 'outline' ? colors.primary : colors.background;
  };

  const getIcon = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
        />
      );
    }

    return following ? (
      <UserCheck size={iconSize} color={getTextColor()} />
    ) : (
      <UserPlus size={iconSize} color={getTextColor()} />
    );
  };

  const getText = () => {
    if (isLoading) return 'Loading...';
    return following ? 'Following' : 'Follow';
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.5 : 1,
        }
      ]}
    >
      <TouchableOpacity
        style={[styles.button, getButtonStyle()]}
        onPress={handlePress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
      >
        {getIcon()}
        <Text
          style={[
            styles.buttonText,
            {
              color: getTextColor(),
              fontSize: textSize,
            }
          ]}
        >
          {getText()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});