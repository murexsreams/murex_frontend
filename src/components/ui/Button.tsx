import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'small';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const sizeStyles = {
      sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
      small: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
      md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
      lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size] || sizeStyles.md,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: typography.fontFamily.heading,
      fontWeight: typography.fontWeight.semibold,
      textAlign: 'center',
    };

    const sizeStyles = {
      sm: { fontSize: typography.fontSize.sm },
      small: { fontSize: typography.fontSize.sm },
      md: { fontSize: typography.fontSize.md },
      lg: { fontSize: typography.fontSize.lg },
    };

    const variantStyles = {
      primary: { color: colors.background },
      secondary: { color: colors.primary },
      outline: { color: colors.primary },
      ghost: { color: colors.text },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size] || sizeStyles.md,
      ...variantStyles[variant] || variantStyles.primary,
      ...textStyle,
    };
  };

  const renderButton = () => {
    if (variant === 'primary') {
      return (
        <LinearGradient
          colors={[colors.primary, '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[getButtonStyle(), style]}
        >
          {loading && (
            <ActivityIndicator
              size="small"
              color={colors.background}
              style={{ marginRight: spacing.sm }}
            />
          )}
          {leftIcon && (
            <View style={{ marginRight: spacing.sm }}>
              {leftIcon}
            </View>
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && (
            <View style={{ marginLeft: spacing.sm }}>
              {rightIcon}
            </View>
          )}
        </LinearGradient>
      );
    }

    const variantStyles = {
      secondary: {
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: 'transparent',
      },
      outline: {
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: 'transparent',
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return (
      <TouchableOpacity
        style={[getButtonStyle(), variantStyles[variant], style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.text}
            style={{ marginRight: spacing.sm }}
          />
        )}
        {leftIcon && (
          <View style={{ marginRight: spacing.sm }}>
            {leftIcon}
          </View>
        )}
        <Text style={getTextStyle()}>{title}</Text>
        {rightIcon && (
          <View style={{ marginLeft: spacing.sm }}>
            {rightIcon}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {renderButton()}
      </TouchableOpacity>
    );
  }

  return renderButton();
};