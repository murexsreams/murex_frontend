// Import polyfills first to prevent window.addEventListener errors
import './src/utils/polyfills';

import React, { useEffect } from 'react';

// Global error handler for unhandled promise rejections
if (typeof global !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Filter out window.addEventListener errors
    const message = args.join(' ');
    if (message.includes('window.addEventListener') || message.includes('window is not defined')) {
      console.warn('Filtered window API error:', message);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { useTheme } from './src/hooks/useTheme';
import { useAuthStore } from './src/store/authStore';
import { usePlayerStore } from './src/store/playerStore';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { AppNavigator } from './src/navigation/AppNavigator';
import { MiniPlayer } from './src/components/music/MiniPlayer';
import ErrorBoundary from './src/components/ErrorBoundary';
import { crashReporting } from './src/services/crashReporting';

export default function App() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const { currentTrack } = usePlayerStore();

  // Initialize crash reporting safely
  useEffect(() => {
    try {
      crashReporting.init({
        userId: user?.id || null,
        enabled: true,
      });

      // Set user context when user changes
      if (user) {
        crashReporting.setUser(user.id);
      }
    } catch (error) {
      console.warn('Failed to initialize crash reporting:', error);
    }
  }, [user]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        try {
          crashReporting.reportReactError(error, errorInfo, 'critical');
        } catch (reportError) {
          console.warn('Failed to report error:', reportError);
        }
      }}
    >
      <GestureHandlerRootView style={styles.container}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <NavigationContainer
            theme={{
              dark: isDark,
              colors: {
                primary: colors.primary,
                background: colors.background,
                card: colors.surface,
                text: colors.text,
                border: colors.border,
                notification: colors.primary,
              },
              fonts: {
                regular: {
                  fontFamily: 'Inter',
                  fontWeight: '400',
                },
                medium: {
                  fontFamily: 'Inter',
                  fontWeight: '500',
                },
                bold: {
                  fontFamily: 'Montserrat',
                  fontWeight: '700',
                },
                heavy: {
                  fontFamily: 'Montserrat',
                  fontWeight: '800',
                },
              },
            }}
          >
            <View style={styles.content}>
              {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
            </View>
            
            {/* Persistent Mini Player - only show when authenticated and track is playing */}
            {isAuthenticated && currentTrack && (
              <View style={styles.miniPlayerContainer}>
                <MiniPlayer />
              </View>
            )}
            
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </NavigationContainer>
        </View>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
