import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { AccessibleButton, useAccessibility } from './AccessibilityHelpers';

const { width: screenWidth } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onDismiss: (id: string) => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  position?: 'top' | 'bottom';
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onDismiss,
  action,
  position = 'top',
}) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { announceForScreenReader } = useAccessibility();
  
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    // Announce for screen readers
    const announcement = title ? `${title}. ${message}` : message;
    announceForScreenReader(announcement);

    return () => clearTimeout(timer);
  }, [duration, announceForScreenReader]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(id);
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle size={20} color={colors.success || '#10B981'} />,
          backgroundColor: colors.success ? colors.success + '20' : '#10B98120',
          borderColor: colors.success || '#10B981',
        };
      case 'error':
        return {
          icon: <AlertCircle size={20} color={colors.error} />,
          backgroundColor: colors.error + '20',
          borderColor: colors.error,
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={20} color={colors.warning || '#F59E0B'} />,
          backgroundColor: colors.warning ? colors.warning + '20' : '#F59E0B20',
          borderColor: colors.warning || '#F59E0B',
        };
      case 'info':
        return {
          icon: <Info size={20} color={colors.primary} />,
          backgroundColor: colors.primary + '20',
          borderColor: colors.primary,
        };
      default:
        return {
          icon: <Info size={20} color={colors.primary} />,
          backgroundColor: colors.primary + '20',
          borderColor: colors.primary,
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          transform: [{ translateY }],
          opacity,
          top: position === 'top' ? Platform.OS === 'ios' ? 60 : 40 : undefined,
          bottom: position === 'bottom' ? Platform.OS === 'ios' ? 40 : 20 : undefined,
        },
      ]}
    >
      {/* Progress Bar */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: config.borderColor,
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {config.icon}
        </View>

        <View style={styles.textContainer}>
          {title && (
            <Text
              style={[styles.title, { color: colors.text }]}
              numberOfLines={1}
              accessible={false}
            >
              {title}
            </Text>
          )}
          <Text
            style={[styles.message, { color: colors.text }]}
            numberOfLines={2}
            accessible={false}
          >
            {message}
          </Text>
        </View>

        <View style={styles.actions}>
          {action && (
            <AccessibleButton
              onPress={action.onPress}
              accessibilityLabel={action.label}
              style={[styles.actionButton, { borderColor: config.borderColor }]}
            >
              <Text style={[styles.actionText, { color: config.borderColor }]}>
                {action.label}
              </Text>
            </AccessibleButton>
          )}

          <AccessibleButton
            onPress={handleDismiss}
            accessibilityLabel="Dismiss notification"
            accessibilityHint="Closes this notification"
            style={styles.dismissButton}
          >
            <X size={16} color={colors.textSecondary} />
          </AccessibleButton>
        </View>
      </View>
    </Animated.View>
  );
};

// Toast Manager Component
interface ToastManagerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
    action?: {
      label: string;
      onPress: () => void;
    };
    position?: 'top' | 'bottom';
  }>;
  onDismiss: (id: string) => void;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onDismiss }) => {
  return (
    <View style={styles.manager} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={onDismiss}
        />
      ))}
    </View>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
    action?: {
      label: string;
      onPress: () => void;
    };
    position?: 'top' | 'bottom';
  }>>([]);

  const showToast = React.useCallback((
    type: ToastType,
    message: string,
    options?: {
      title?: string;
      duration?: number;
      action?: {
        label: string;
        onPress: () => void;
      };
      position?: 'top' | 'bottom';
    }
  ) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      type,
      message,
      ...options,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    dismissToast,
    dismissAll,
    success: (message: string, options?: any) => showToast('success', message, options),
    error: (message: string, options?: any) => showToast('error', message, options),
    warning: (message: string, options?: any) => showToast('warning', message, options),
    info: (message: string, options?: any) => showToast('info', message, options),
  };
};

const styles = StyleSheet.create({
  manager: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 19, // Account for progress bar
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
  },
});