// Test setup file for Jest

import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock Expo modules
jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn(() => ({
      loadAsync: jest.fn(),
      unloadAsync: jest.fn(),
      playAsync: jest.fn(),
      pauseAsync: jest.fn(),
      stopAsync: jest.fn(),
      setPositionAsync: jest.fn(),
      setVolumeAsync: jest.fn(),
      getStatusAsync: jest.fn(() => Promise.resolve({
        isLoaded: true,
        isPlaying: false,
        positionMillis: 0,
        durationMillis: 180000,
      })),
    })),
    setAudioModeAsync: jest.fn(),
    INTERRUPTION_MODE_ANDROID_DO_NOT_MIX: 1,
    INTERRUPTION_MODE_IOS_DO_NOT_MIX: 1,
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({
    type: 'success',
    uri: 'file://test.mp3',
    name: 'test.mp3',
    size: 1024000,
  })),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({
    cancelled: false,
    uri: 'file://test.jpg',
    width: 300,
    height: 300,
  })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({
    status: 'granted',
  })),
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(() => Promise.resolve({
    exists: true,
    size: 1024,
    isDirectory: false,
  })),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
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
  }),
  useRoute: () => ({
    key: 'test-route',
    name: 'TestScreen',
    params: {},
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
  NativeStackNavigationProp: {},
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ children }: { children: React.ReactNode }) => children,
  }),
  BottomTabNavigationProp: {},
}));

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  PanGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  TapGestureHandler: ({ children }: { children: React.ReactNode }) => children,
  State: {
    BEGAN: 'BEGAN',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    ACTIVE: 'ACTIVE',
    END: 'END',
  },
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    Value: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    cond: jest.fn(),
    interpolate: jest.fn(),
  },
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((value) => value),
  withSpring: jest.fn((value) => value),
  runOnJS: jest.fn((fn) => fn),
}));

// Mock Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock Lucide React Native
jest.mock('lucide-react-native', () => ({
  Play: 'Play',
  Pause: 'Pause',
  SkipForward: 'SkipForward',
  SkipBack: 'SkipBack',
  Heart: 'Heart',
  Share: 'Share',
  MessageCircle: 'MessageCircle',
  User: 'User',
  Settings: 'Settings',
  Home: 'Home',
  Search: 'Search',
  Upload: 'Upload',
  Wallet: 'Wallet',
  ChevronUp: 'ChevronUp',
  ChevronDown: 'ChevronDown',
  ChevronLeft: 'ChevronLeft',
  ChevronRight: 'ChevronRight',
  X: 'X',
  Check: 'Check',
  Plus: 'Plus',
  Minus: 'Minus',
  Edit: 'Edit',
  Trash: 'Trash',
  Eye: 'Eye',
  EyeOff: 'EyeOff',
  Lock: 'Lock',
  Unlock: 'Unlock',
  Mail: 'Mail',
  Phone: 'Phone',
  MapPin: 'MapPin',
  Calendar: 'Calendar',
  Clock: 'Clock',
  Star: 'Star',
  TrendingUp: 'TrendingUp',
  TrendingDown: 'TrendingDown',
  DollarSign: 'DollarSign',
  CreditCard: 'CreditCard',
  Smartphone: 'Smartphone',
  Volume2: 'Volume2',
  VolumeX: 'VolumeX',
  Shuffle: 'Shuffle',
  Repeat: 'Repeat',
  Repeat1: 'Repeat1',
  Music: 'Music',
  Headphones: 'Headphones',
  Mic: 'Mic',
  Camera: 'Camera',
  Image: 'Image',
  File: 'File',
  Download: 'Download',
  Upload: 'Upload',
  Link: 'Link',
  ExternalLink: 'ExternalLink',
  Globe: 'Globe',
  Wifi: 'Wifi',
  WifiOff: 'WifiOff',
  Battery: 'Battery',
  BatteryLow: 'BatteryLow',
  Zap: 'Zap',
  Sun: 'Sun',
  Moon: 'Moon',
  Palette: 'Palette',
  Bell: 'Bell',
  BellOff: 'BellOff',
  Shield: 'Shield',
  ShieldCheck: 'ShieldCheck',
  AlertTriangle: 'AlertTriangle',
  AlertCircle: 'AlertCircle',
  Info: 'Info',
  HelpCircle: 'HelpCircle',
  FileText: 'FileText',
  LogOut: 'LogOut',
  LogIn: 'LogIn',
  UserPlus: 'UserPlus',
  UserMinus: 'UserMinus',
  Users: 'Users',
  Filter: 'Filter',
  SortAsc: 'SortAsc',
  SortDesc: 'SortDesc',
  Grid: 'Grid',
  List: 'List',
  MoreHorizontal: 'MoreHorizontal',
  MoreVertical: 'MoreVertical',
  Menu: 'Menu',
  Bookmark: 'Bookmark',
  BookmarkCheck: 'BookmarkCheck',
  Flag: 'Flag',
  Tag: 'Tag',
  Hash: 'Hash',
  AtSign: 'AtSign',
  Percent: 'Percent',
  Calculator: 'Calculator',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
  Activity: 'Activity',
  Target: 'Target',
  Award: 'Award',
  Trophy: 'Trophy',
  Gift: 'Gift',
  Package: 'Package',
  ShoppingCart: 'ShoppingCart',
  ShoppingBag: 'ShoppingBag',
  CreditCard: 'CreditCard',
  Banknote: 'Banknote',
}));

// Mock Zustand
jest.mock('zustand', () => ({
  create: (fn: any) => {
    const store = fn(() => {}, () => ({}));
    return () => store;
  },
}));

// Mock Zustand middleware
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
  createJSONStorage: () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.warn and console.error in tests unless needed
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers
jest.useFakeTimers();

// Setup global test environment
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
});

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});