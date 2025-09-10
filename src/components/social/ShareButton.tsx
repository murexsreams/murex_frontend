import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Share,
  Platform,
  Animated,
} from 'react-native';
import { Share as ShareIcon, Copy, ExternalLink } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../hooks/useTheme';

interface ShareButtonProps {
  trackId: string;
  trackTitle: string;
  artistName: string;
  shareUrl?: string;
  onShare?: (trackId: string, platform: string) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'text' | 'full';
  disabled?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  trackId,
  trackTitle,
  artistName,
  shareUrl,
  onShare,
  size = 'medium',
  variant = 'icon',
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [isSharing, setIsSharing] = useState(false);
  
  const scaleAnim = new Animated.Value(1);

  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const textSize = size === 'small' ? 12 : size === 'medium' ? 14 : 16;

  const defaultShareUrl = shareUrl || `https://murex-streams.com/track/${trackId}`;
  const shareMessage = `Check out "${trackTitle}" by ${artistName} on Murex Streams! ${defaultShareUrl}`;

  const handlePress = async () => {
    if (disabled || isSharing) return;

    setIsSharing(true);

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (Platform.OS === 'web') {
        // Web sharing options
        showWebShareOptions();
      } else {
        // Native sharing
        const result = await Share.share({
          message: shareMessage,
          url: defaultShareUrl,
          title: `${trackTitle} by ${artistName}`,
        });

        if (result.action === Share.sharedAction) {
          onShare?.(trackId, result.activityType || 'native');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const showWebShareOptions = () => {
    Alert.alert(
      'Share Track',
      `Share "${trackTitle}" by ${artistName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy Link',
          onPress: () => copyToClipboard(),
        },
        {
          text: 'Twitter',
          onPress: () => shareToTwitter(),
        },
        {
          text: 'Facebook',
          onPress: () => shareToFacebook(),
        },
      ]
    );
  };

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(defaultShareUrl);
      Alert.alert('Copied!', 'Link copied to clipboard');
      onShare?.(trackId, 'clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    if (Platform.OS === 'web') {
      window.open(twitterUrl, '_blank');
    }
    onShare?.(trackId, 'twitter');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(defaultShareUrl)}`;
    if (Platform.OS === 'web') {
      window.open(facebookUrl, '_blank');
    }
    onShare?.(trackId, 'facebook');
  };

  const renderIcon = () => (
    <ShareIcon
      size={iconSize}
      color={colors.textSecondary}
    />
  );

  const renderText = () => (
    <Text
      style={[
        styles.shareText,
        {
          color: colors.textSecondary,
          fontSize: textSize,
        }
      ]}
    >
      Share
    </Text>
  );

  const renderContent = () => {
    switch (variant) {
      case 'icon':
        return renderIcon();
      case 'text':
        return renderText();
      case 'full':
        return (
          <>
            {renderIcon()}
            {renderText()}
          </>
        );
      default:
        return renderIcon();
    }
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
        style={[
          styles.container,
          variant === 'full' && styles.fullContainer,
        ]}
        onPress={handlePress}
        disabled={disabled || isSharing}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  fullContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shareText: {
    fontWeight: '500',
  },
});