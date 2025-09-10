import React from 'react';
import {
  Animated,
  View,
  StyleSheet,
  Easing,
  ViewStyle,
} from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 300,
  delay = 0,
  style,
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    });
    animation.start();
    return () => animation.stop();
  }, [opacity, duration, delay]);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'up',
  duration = 300,
  delay = 0,
  distance = 50,
  style,
}) => {
  const translateX = React.useRef(new Animated.Value(
    direction === 'left' ? -distance : direction === 'right' ? distance : 0
  )).current;
  const translateY = React.useRef(new Animated.Value(
    direction === 'up' ? distance : direction === 'down' ? -distance : 0
  )).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.1)),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.1)),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [translateX, translateY, opacity, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX }, { translateY }],
          opacity,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
  style?: ViewStyle;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  duration = 300,
  delay = 0,
  initialScale = 0.8,
  style,
}) => {
  const scale = React.useRef(new Animated.Value(initialScale)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.1)),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [scale, opacity, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale }],
          opacity,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface PulseProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  duration?: number;
  style?: ViewStyle;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  minScale = 0.95,
  maxScale = 1.05,
  duration = 1000,
  style,
}) => {
  const scale = React.useRef(new Animated.Value(minScale)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: maxScale,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scale, {
          toValue: minScale,
          duration: duration / 2,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scale, minScale, maxScale, duration]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface StaggeredListProps {
  children: React.ReactElement[];
  staggerDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale';
  style?: ViewStyle;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 100,
  animationType = 'fade',
  style,
}) => {
  const AnimationComponent = {
    fade: FadeIn,
    slide: SlideIn,
    scale: ScaleIn,
  }[animationType];

  return (
    <View style={style}>
      {children.map((child, index) => (
        <AnimationComponent
          key={child.key || index}
          delay={index * staggerDelay}
        >
          {child}
        </AnimationComponent>
      ))}
    </View>
  );
};

interface ProgressBarProps {
  progress: number;
  duration?: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
}

export const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  duration = 300,
  color = '#FFD700',
  backgroundColor = 'rgba(255, 255, 255, 0.2)',
  height = 4,
  style,
}) => {
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [progress, duration, animatedWidth]);

  return (
    <View
      style={[
        styles.progressContainer,
        { backgroundColor, height },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: color,
            height,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 2,
  },
});