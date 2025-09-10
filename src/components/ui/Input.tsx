import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { AccessibleButton } from './AccessibilityHelpers';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  secureTextEntry?: boolean;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  loading?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onSubmitEditing,
  secureTextEntry = false,
  error,
  success = false,
  disabled = false,
  loading = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
  maxLength,
  showCharacterCount = false,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  // Shake animation for errors
  React.useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [error, shakeAnim]);

  // Focus animation
  React.useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  const getBorderColor = () => {
    if (error) return colors.error;
    if (success) return colors.success || '#10B981';
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const containerStyle: ViewStyle = {
    marginBottom: spacing.md,
    ...style,
  };

  const labelStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    fontWeight: typography.fontWeight.medium,
    color: error ? colors.error : colors.text,
    marginBottom: spacing.xs,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: getBorderColor(),
    borderRadius: borderRadius.md,
    backgroundColor: disabled ? colors.border + '20' : colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: multiline ? 80 : 48,
    opacity: disabled ? 0.6 : 1,
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.body,
    color: disabled ? colors.textSecondary : colors.text,
    paddingVertical: spacing.sm,
    textAlignVertical: multiline ? 'top' : 'center',
    ...inputStyle,
  };

  const messageStyle: TextStyle = {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.body,
    color: error ? colors.error : success ? (colors.success || '#10B981') : colors.textSecondary,
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  };

  const characterCountStyle: TextStyle = {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  };

  return (
    <Animated.View 
      style={[
        containerStyle,
        { transform: [{ translateX: shakeAnim }] }
      ]}
    >
      {label && (
        <Text style={labelStyle} accessible={false}>
          {label}
        </Text>
      )}
      
      <Animated.View 
        style={[
          inputContainerStyle,
          {
            borderColor: focusAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [getBorderColor(), colors.primary],
            }),
          }
        ]}
      >
        {leftIcon && (
          <View style={{ marginRight: spacing.sm }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={textInputStyle}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={!disabled && !loading}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label || placeholder}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ 
            disabled: disabled || loading,
            selected: isFocused,
          }}
          testID={testID}
          maxLength={maxLength}
        />
        
        {/* Status Icons */}
        {loading && (
          <View style={{ marginLeft: spacing.sm }}>
            <Animated.View
              style={{
                transform: [{
                  rotate: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              }}
            >
              <View style={styles.loadingSpinner} />
            </Animated.View>
          </View>
        )}
        
        {!loading && success && (
          <View style={{ marginLeft: spacing.sm }}>
            <CheckCircle size={20} color={colors.success || '#10B981'} />
          </View>
        )}
        
        {!loading && error && (
          <View style={{ marginLeft: spacing.sm }}>
            <AlertCircle size={20} color={colors.error} />
          </View>
        )}
        
        {secureTextEntry && (
          <AccessibleButton
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityHint="Toggles password visibility"
            style={{ padding: spacing.xs, marginLeft: spacing.sm }}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </AccessibleButton>
        )}
        
        {rightIcon && (
          <View style={{ marginLeft: spacing.sm }}>
            {rightIcon}
          </View>
        )}
      </Animated.View>
      
      {/* Error/Success Message */}
      {(error || success) && (
        <View style={styles.messageContainer}>
          <Text style={messageStyle}>
            {error || (success && 'Valid input')}
          </Text>
        </View>
      )}
      
      {/* Character Count */}
      {showCharacterCount && maxLength && (
        <Text style={characterCountStyle}>
          {value.length}/{maxLength}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderTopColor: 'transparent',
  },
});