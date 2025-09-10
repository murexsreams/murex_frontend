import { Platform } from 'react-native';

// Polyfill for window object on React Native
if (Platform.OS !== 'web' && typeof window === 'undefined') {
  // Create a minimal window object to prevent crashes
  (global as any).window = {
    addEventListener: () => {
      // No-op for React Native
      console.warn('window.addEventListener called on React Native - ignoring');
    },
    removeEventListener: () => {
      // No-op for React Native
      console.warn('window.removeEventListener called on React Native - ignoring');
    },
    location: {
      href: '',
      protocol: 'file:',
      host: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
    },
    navigator: {
      userAgent: Platform.OS === 'ios' ? 'iOS' : 'Android',
      platform: Platform.OS,
    },
    document: {
      addEventListener: () => {
        console.warn('document.addEventListener called on React Native - ignoring');
      },
      removeEventListener: () => {
        console.warn('document.removeEventListener called on React Native - ignoring');
      },
      createElement: () => ({}),
      getElementById: () => null,
    },
  };
}

// Polyfill for other common web APIs that might be missing
if (Platform.OS !== 'web') {
  // Polyfill for localStorage
  if (typeof localStorage === 'undefined') {
    (global as any).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
  }

  // Polyfill for sessionStorage
  if (typeof sessionStorage === 'undefined') {
    (global as any).sessionStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
  }

  // Polyfill for fetch if not available (though React Native usually has this)
  if (typeof fetch === 'undefined') {
    console.warn('fetch is not available - network requests may fail');
  }
}

export {}; // Make this a module