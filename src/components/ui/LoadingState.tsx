import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'skeleton' | 'pulse';
  style?: any;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'medium',
  variant = 'spinner',
  style,
}) => {
  const { colors, spacing } = useTheme();
  const pulseAnim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    if (variant === 'pulse') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [variant, pulseAnim]);

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { spinnerSize: 'small' as const, fontSize: 12, padding: spacing.sm };
      case 'large':
        return { spinnerSize: 'large' as const, fontSize: 18, padding: spacing.xl };
      default:
        return { spinnerSize: 'small' as const, fontSize: 14, padding: spacing.md };
    }
  };

  const { spinnerSize, fontSize, padding } = getSizeConfig();

  if (variant === 'skeleton') {
    return (
      <View style={[styles.skeletonContainer, style]}>
        <Animated.View
          style={[
            styles.skeletonLine,
            { backgroundColor: colors.border, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonLine,
            styles.skeletonLineShort,
            { backgroundColor: colors.border, opacity: pulseAnim },
          ]}
        />
      </View>
    );
  }

  if (variant === 'pulse') {
    return (
      <Animated.View
        style={[
          styles.pulseContainer,
          { backgroundColor: colors.surface, opacity: pulseAnim },
          style,
        ]}
      >
        <Text style={[styles.pulseText, { color: colors.textSecondary, fontSize }]}>
          {message}
        </Text>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, { padding }, style]}>
      <ActivityIndicator
        size={spinnerSize}
        color={colors.primary}
        style={styles.spinner}
      />
      <Text style={[styles.message, { color: colors.textSecondary, fontSize }]}>
        {message}
      </Text>
    </View>
  );
};

export const SkeletonTrackCard: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  return (
    <View style={[styles.skeletonCard, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
      <Animated.View
        style={[
          styles.skeletonCover,
          { backgroundColor: colors.border, borderRadius: borderRadius.sm, opacity: shimmerAnim },
        ]}
      />
      <View style={styles.skeletonContent}>
        <Animated.View
          style={[
            styles.skeletonTitle,
            { backgroundColor: colors.border, opacity: shimmerAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonSubtitle,
            { backgroundColor: colors.border, opacity: shimmerAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonProgress,
            { backgroundColor: colors.border, opacity: shimmerAnim },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    fontWeight: '500',
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonLine: {
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonLineShort: {
    width: '60%',
  },
  pulseContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseText: {
    fontWeight: '500',
  },
  skeletonCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
  },
  skeletonCover: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  skeletonTitle: {
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 12,
    borderRadius: 6,
    width: '70%',
    marginBottom: 8,
  },
  skeletonProgress: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
});