import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isNative = !isWeb;

export const supportsAudio = isNative;
export const supportsAccessibility = isNative;
export const supportsBackgroundAudio = isNative;

// Safe feature detection
export const hasFeature = (feature: string): boolean => {
  switch (feature) {
    case 'audio':
      return supportsAudio;
    case 'accessibility':
      return supportsAccessibility;
    case 'backgroundAudio':
      return supportsBackgroundAudio;
    default:
      return false;
  }
};

// Safe API wrapper for platform-specific features
export const safeCall = async <T>(
  fn: () => Promise<T>,
  fallback?: T,
  errorMessage?: string
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error) {
    if (errorMessage) {
      console.warn(errorMessage, error);
    }
    return fallback;
  }
};

// Platform-specific constants
export const PLATFORM_CONSTANTS = {
  statusBarHeight: isIOS ? 44 : isAndroid ? 24 : 0,
  tabBarHeight: isIOS ? 83 : 56,
  headerHeight: isIOS ? 44 : 56,
  safeAreaInsets: {
    top: isIOS ? 44 : 0,
    bottom: isIOS ? 34 : 0,
  },
};