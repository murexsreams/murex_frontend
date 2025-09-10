import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  XCircle,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: 'network' | 'server' | 'validation' | 'generic';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  style?: any;
  showIcon?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  type = 'generic',
  onRetry,
  onDismiss,
  retryLabel = 'Try Again',
  style,
  showIcon = true,
}) => {
  const { colors, spacing, borderRadius } = useTheme();

  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <WifiOff size={48} color={colors.error} />,
          defaultTitle: 'Connection Error',
          defaultMessage: 'Please check your internet connection and try again.',
          color: colors.error,
        };
      case 'server':
        return {
          icon: <AlertTriangle size={48} color={colors.warning} />,
          defaultTitle: 'Server Error',
          defaultMessage: 'Something went wrong on our end. Please try again later.',
          color: colors.warning,
        };
      case 'validation':
        return {
          icon: <AlertCircle size={48} color={colors.error} />,
          defaultTitle: 'Invalid Input',
          defaultMessage: 'Please check your input and try again.',
          color: colors.error,
        };
      default:
        return {
          icon: <XCircle size={48} color={colors.error} />,
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          color: colors.error,
        };
    }
  };

  const config = getErrorConfig();
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <View style={[styles.container, style]}>
      {showIcon && (
        <View style={styles.iconContainer}>
          {config.icon}
        </View>
      )}
      
      <Text style={[styles.title, { color: colors.text }]}>
        {displayTitle}
      </Text>
      
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {displayMessage}
      </Text>
      
      <View style={styles.actions}>
        {onRetry && (
          <Button
            title={retryLabel}
            onPress={onRetry}
            variant="primary"
            leftIcon={<RefreshCw size={16} color={colors.background} />}
            style={styles.retryButton}
          />
        )}
        
        {onDismiss && (
          <Button
            title="Dismiss"
            onPress={onDismiss}
            variant="ghost"
            style={styles.dismissButton}
          />
        )}
      </View>
    </View>
  );
};

export const InlineError: React.FC<{
  message: string;
  onDismiss?: () => void;
  style?: any;
}> = ({ message, onDismiss, style }) => {
  const { colors, borderRadius } = useTheme();

  return (
    <View style={[styles.inlineContainer, { backgroundColor: colors.error + '20', borderColor: colors.error }, style]}>
      <AlertCircle size={16} color={colors.error} />
      <Text style={[styles.inlineMessage, { color: colors.error }]}>
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissIcon}>
          <XCircle size={16} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const NetworkStatus: React.FC<{
  isOnline: boolean;
  onRetry?: () => void;
}> = ({ isOnline, onRetry }) => {
  const { colors } = useTheme();

  if (isOnline) return null;

  return (
    <View style={[styles.networkBanner, { backgroundColor: colors.error }]}>
      <WifiOff size={16} color={colors.background} />
      <Text style={[styles.networkText, { color: colors.background }]}>
        No internet connection
      </Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.networkRetry}>
          <RefreshCw size={16} color={colors.background} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    minWidth: 120,
  },
  dismissButton: {
    minWidth: 80,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  inlineMessage: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  dismissIcon: {
    marginLeft: 8,
    padding: 4,
  },
  networkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  networkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  networkRetry: {
    marginLeft: 8,
    padding: 4,
  },
});