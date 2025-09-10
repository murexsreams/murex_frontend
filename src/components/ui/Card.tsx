import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  shadow = true,
}) => {
  const { colors, spacing, borderRadius, shadows } = useTheme();

  const paddingStyles = {
    none: {},
    sm: { padding: spacing.sm },
    md: { padding: spacing.md },
    lg: { padding: spacing.lg },
  };

  const cardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    ...paddingStyles[padding],
    ...(shadow ? shadows.md : {}),
    ...style,
  };

  return <View style={cardStyle}>{children}</View>;
};