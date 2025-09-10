// Test utilities for React Native Testing Library

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Mock theme provider for tests
const MockThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Mock navigation container for tests
const MockNavigationContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NavigationContainer>
      {children}
    </NavigationContainer>
  );
};

// All the providers wrapper
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MockThemeProvider>
        <MockNavigationContainer>
          {children}
        </MockNavigationContainer>
      </MockThemeProvider>
    </GestureHandlerRootView>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };

// Mock data helpers
export const mockTrack = {
  id: 'test-track-1',
  title: 'Test Track',
  artist: {
    id: 'test-artist-1',
    stageName: 'Test Artist',
    verified: true,
  },
  duration: 180,
  coverArt: 'https://example.com/cover.jpg',
  genre: 'Electronic',
  currentFunding: 5000,
  fundingGoal: 10000,
  expectedROI: 12.5,
  socialStats: {
    plays: 1000,
    likes: 50,
    comments: 10,
    shares: 5,
    saves: 25,
  },
};

export const mockUser = {
  id: 'test-user-1',
  username: 'testuser',
  displayName: 'Test User',
  email: 'test@example.com',
  role: 'investor' as const,
  verified: false,
};

export const mockInvestment = {
  id: 'test-investment-1',
  trackId: 'test-track-1',
  amount: 1000,
  shares: 100,
  currentValue: 1125,
  roi: 12.5,
  status: 'active' as const,
};

// Mock store helpers
export const createMockStore = (initialState: any = {}) => ({
  getState: () => initialState,
  subscribe: jest.fn(),
  dispatch: jest.fn(),
});

// Mock navigation helpers
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
};

export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// Audio player mock helpers
export const mockAudioPlayer = {
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  controls: {
    play: jest.fn(),
    pause: jest.fn(),
    togglePlayPause: jest.fn(),
    playNext: jest.fn(),
    playPrevious: jest.fn(),
    seekTo: jest.fn(),
  },
};

// Theme mock helpers
export const mockTheme = {
  colors: {
    primary: '#3B82F6',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

// Async testing helpers
export const waitForAsync = (ms: number = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock API response helpers
export const createMockApiResponse = <T>(data: T, success: boolean = true) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : { code: 'TEST_ERROR', message: 'Test error' },
  timestamp: new Date().toISOString(),
});

// Form testing helpers
export const fillForm = async (getByTestId: any, formData: Record<string, string>) => {
  for (const [field, value] of Object.entries(formData)) {
    const input = getByTestId(`${field}-input`);
    // Mock text input change
    // fireEvent.changeText(input, value);
  }
};

// Gesture testing helpers
export const mockGesture = {
  onStart: jest.fn(),
  onUpdate: jest.fn(),
  onEnd: jest.fn(),
};

// Animation testing helpers
export const mockAnimatedValue = {
  setValue: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  stopAnimation: jest.fn(),
  resetAnimation: jest.fn(),
};

// Storage testing helpers
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

// Network testing helpers
export const mockNetworkState = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
};

// Permission testing helpers
export const mockPermissions = {
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
  requestMultiple: jest.fn(() => Promise.resolve({})),
};

// File system testing helpers
export const mockFileSystem = {
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(),
};

// Camera/Image picker testing helpers
export const mockImagePicker = {
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
};

// Audio testing helpers
export const mockAudio = {
  loadAsync: jest.fn(),
  unloadAsync: jest.fn(),
  playAsync: jest.fn(),
  pauseAsync: jest.fn(),
  stopAsync: jest.fn(),
  setPositionAsync: jest.fn(),
  setVolumeAsync: jest.fn(),
  getStatusAsync: jest.fn(),
};

// Cleanup helper
export const cleanup = () => {
  jest.clearAllMocks();
};