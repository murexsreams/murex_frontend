import { renderHook, act } from '@testing-library/react-native';
import { useThemeStore } from '../themeStore';

// Mock React Native modules
jest.mock('react-native', () => ({
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock theme constants
jest.mock('../../constants/theme', () => ({
  Colors: {
    light: {
      primary: '#3B82F6',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1F2937',
      textSecondary: '#6B7280',
    },
    dark: {
      primary: '#60A5FA',
      background: '#111827',
      surface: '#1F2937',
      text: '#F9FAFB',
      textSecondary: '#D1D5DB',
    },
  },
  Typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
    },
  },
  Spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  BorderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  Shadows: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
  },
}));

describe('ThemeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with system theme mode', () => {
    const { result } = renderHook(() => useThemeStore());
    
    expect(result.current.mode).toBe('system');
    expect(result.current.systemMode).toBe('light');
  });

  it('gets effective theme correctly for system mode', () => {
    const { result } = renderHook(() => useThemeStore());
    
    expect(result.current.getEffectiveTheme()).toBe('light');
  });

  it('gets effective theme correctly for explicit mode', () => {
    const { result } = renderHook(() => useThemeStore());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(result.current.getEffectiveTheme()).toBe('dark');
  });

  it('toggles theme from light to dark to system', () => {
    const { result } = renderHook(() => useThemeStore());
    
    // Start with light
    act(() => {
      result.current.setTheme('light');
    });
    expect(result.current.mode).toBe('light');
    
    // Toggle to dark
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.mode).toBe('dark');
    
    // Toggle to system
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.mode).toBe('system');
    
    // Toggle back to light
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.mode).toBe('light');
  });

  it('sets theme mode correctly', () => {
    const { result } = renderHook(() => useThemeStore());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(result.current.mode).toBe('dark');
    expect(result.current.colors.background).toBe('#111827');
  });

  it('updates system mode correctly', () => {
    const { result } = renderHook(() => useThemeStore());
    
    act(() => {
      result.current.setSystemMode('dark');
    });
    
    expect(result.current.systemMode).toBe('dark');
    // When in system mode, colors should update
    expect(result.current.colors.background).toBe('#111827');
  });

  it('updates preferences correctly', () => {
    const { result } = renderHook(() => useThemeStore());
    
    act(() => {
      result.current.updatePreferences({
        fontSize: 'large',
        highContrast: true,
        reducedMotion: true,
      });
    });
    
    expect(result.current.preferences.fontSize).toBe('large');
    expect(result.current.preferences.highContrast).toBe(true);
    expect(result.current.preferences.reducedMotion).toBe(true);
  });

  it('scales typography when font size changes', () => {
    const { result } = renderHook(() => useThemeStore());
    
    const originalFontSize = result.current.typography.fontSize.base;
    
    act(() => {
      result.current.updatePreferences({ fontSize: 'large' });
    });
    
    // Large font size should scale by 1.1
    expect(result.current.typography.fontSize.base).toBe(originalFontSize * 1.1);
  });

  it('scales typography for small font size', () => {
    const { result } = renderHook(() => useThemeStore());
    
    const originalFontSize = result.current.typography.fontSize.base;
    
    act(() => {
      result.current.updatePreferences({ fontSize: 'small' });
    });
    
    // Small font size should scale by 0.9
    expect(result.current.typography.fontSize.base).toBe(originalFontSize * 0.9);
  });

  it('resets to defaults correctly', () => {
    const { result } = renderHook(() => useThemeStore());
    
    // Change some settings
    act(() => {
      result.current.setTheme('dark');
      result.current.updatePreferences({
        fontSize: 'large',
        highContrast: true,
      });
    });
    
    // Reset to defaults
    act(() => {
      result.current.resetToDefaults();
    });
    
    expect(result.current.mode).toBe('system');
    expect(result.current.preferences.fontSize).toBe('medium');
    expect(result.current.preferences.highContrast).toBe(false);
    expect(result.current.preferences.reducedMotion).toBe(false);
  });

  it('handles partial preference updates', () => {
    const { result } = renderHook(() => useThemeStore());
    
    // Set initial preferences
    act(() => {
      result.current.updatePreferences({
        fontSize: 'large',
        highContrast: true,
        reducedMotion: false,
      });
    });
    
    // Update only one preference
    act(() => {
      result.current.updatePreferences({
        reducedMotion: true,
      });
    });
    
    // Other preferences should remain unchanged
    expect(result.current.preferences.fontSize).toBe('large');
    expect(result.current.preferences.highContrast).toBe(true);
    expect(result.current.preferences.reducedMotion).toBe(true);
  });

  it('updates colors when theme changes', () => {
    const { result } = renderHook(() => useThemeStore());
    
    // Start with light theme
    act(() => {
      result.current.setTheme('light');
    });
    expect(result.current.colors.background).toBe('#FFFFFF');
    
    // Switch to dark theme
    act(() => {
      result.current.setTheme('dark');
    });
    expect(result.current.colors.background).toBe('#111827');
  });

  it('handles system mode changes correctly', () => {
    const { result } = renderHook(() => useThemeStore());
    
    // Set to system mode
    act(() => {
      result.current.setTheme('system');
    });
    
    // Simulate system theme change to dark
    act(() => {
      result.current.setSystemMode('dark');
    });
    
    expect(result.current.systemMode).toBe('dark');
    expect(result.current.getEffectiveTheme()).toBe('dark');
    expect(result.current.colors.background).toBe('#111827');
  });

  it('maintains explicit theme when system mode changes', () => {
    const { result } = renderHook(() => useThemeStore());
    
    // Set explicit light theme
    act(() => {
      result.current.setTheme('light');
    });
    
    // System mode change should not affect explicit theme
    act(() => {
      result.current.setSystemMode('dark');
    });
    
    expect(result.current.mode).toBe('light');
    expect(result.current.getEffectiveTheme()).toBe('light');
    expect(result.current.colors.background).toBe('#FFFFFF');
  });

  it('provides all required theme tokens', () => {
    const { result } = renderHook(() => useThemeStore());
    
    expect(result.current.colors).toBeDefined();
    expect(result.current.typography).toBeDefined();
    expect(result.current.spacing).toBeDefined();
    expect(result.current.borderRadius).toBeDefined();
    expect(result.current.shadows).toBeDefined();
  });

  it('has correct default preferences', () => {
    const { result } = renderHook(() => useThemeStore());
    
    expect(result.current.preferences.fontSize).toBe('medium');
    expect(result.current.preferences.reducedMotion).toBe(false);
    expect(result.current.preferences.highContrast).toBe(false);
  });
});