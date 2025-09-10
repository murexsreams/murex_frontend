import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if this is a window.addEventListener error and handle it gracefully
    if (error.message && error.message.includes('window.addEventListener')) {
      console.warn('Window API error caught and handled:', error.message);
      // Don't show error screen for this specific error
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
      return;
    }

    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    // Reset the error state and let the app navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <AlertTriangle size={64} color="#EF4444" />
            </View>
            
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              We're sorry, but something unexpected happened. The error has been reported and we're working to fix it.
            </Text>

            <View style={styles.actions}>
              <Button
                title="Try Again"
                onPress={this.handleRetry}
                variant="primary"
                leftIcon={<RefreshCw size={16} color="#FFFFFF" />}
                style={styles.button}
              />
              
              <Button
                title="Go to Home"
                onPress={this.handleGoHome}
                variant="outline"
                leftIcon={<Home size={16} color="#FFD700" />}
                style={styles.button}
              />
            </View>

            {/* Error details for development */}
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Development Only):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C2A', // Dark blue background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  button: {
    width: '100%',
  },
  errorDetails: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#D1D5DB',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default ErrorBoundary;