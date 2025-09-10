import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemePreferences {
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

interface ThemeState {
  mode: ThemeMode;
  systemMode: ColorSchemeName;
  preferences: ThemePreferences;
  colors: typeof Colors.light;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  
  // Actions
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  setSystemMode: (mode: ColorSchemeName) => void;
  updatePreferences: (preferences: Partial<ThemePreferences>) => void;
  getEffectiveTheme: () => 'light' | 'dark';
  resetToDefaults: () => void;
}

const defaultPreferences: ThemePreferences = {
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
};

// Initialize system appearance listener
let appearanceSubscription: any = null;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system' as ThemeMode,
      systemMode: Appearance.getColorScheme(),
      preferences: defaultPreferences,
      colors: Colors.light,
      typography: Typography,
      spacing: Spacing,
      borderRadius: BorderRadius,
      shadows: Shadows,
      
      getEffectiveTheme: () => {
        const { mode, systemMode } = get();
        if (mode === 'system') {
          return systemMode === 'dark' ? 'dark' : 'light';
        }
        return mode;
      },
      
      toggleTheme: () => {
        const currentMode = get().mode;
        let newMode: ThemeMode;
        
        if (currentMode === 'light') {
          newMode = 'dark';
        } else if (currentMode === 'dark') {
          newMode = 'system';
        } else {
          newMode = 'light';
        }
        
        const effectiveTheme = newMode === 'system' 
          ? (get().systemMode === 'dark' ? 'dark' : 'light')
          : newMode;
          
        set({ 
          mode: newMode,
          colors: Colors[effectiveTheme as 'light' | 'dark']
        });
      },
      
      setTheme: (mode: ThemeMode) => {
        const effectiveTheme = mode === 'system' 
          ? (get().systemMode === 'dark' ? 'dark' : 'light')
          : mode;
          
        set({ 
          mode,
          colors: Colors[effectiveTheme as 'light' | 'dark']
        });
      },
      
      setSystemMode: (systemMode: ColorSchemeName) => {
        const { mode } = get();
        const effectiveTheme = mode === 'system' 
          ? (systemMode === 'dark' ? 'dark' : 'light')
          : (mode === 'dark' ? 'dark' : 'light');
          
        set({ 
          systemMode,
          colors: Colors[effectiveTheme]
        });
      },
      
      updatePreferences: (newPreferences: Partial<ThemePreferences>) => {
        const currentPreferences = get().preferences;
        const updatedPreferences = { ...currentPreferences, ...newPreferences };
        
        // Apply font size scaling
        let scaledTypography = { ...Typography };
        if (newPreferences.fontSize) {
          const scaleFactors = { small: 0.9, medium: 1.0, large: 1.1 };
          const scaleFactor = scaleFactors[newPreferences.fontSize];
          
          scaledTypography = {
            ...Typography,
            fontSize: Object.keys(Typography.fontSize).reduce((acc, key) => {
              acc[key as keyof typeof Typography.fontSize] = 
                Typography.fontSize[key as keyof typeof Typography.fontSize] * scaleFactor;
              return acc;
            }, {} as typeof Typography.fontSize)
          };
        }
        
        set({ 
          preferences: updatedPreferences,
          typography: scaledTypography
        });
      },
      
      resetToDefaults: () => {
        set({
          mode: 'system',
          preferences: defaultPreferences,
          typography: Typography,
          spacing: Spacing,
          borderRadius: BorderRadius,
          shadows: Shadows,
        });
      },
    }),
    {
      name: 'murex-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Set up system appearance listener after rehydration
          if (appearanceSubscription) {
            appearanceSubscription.remove();
          }
          
          appearanceSubscription = Appearance.addChangeListener(({ colorScheme }) => {
            state.setSystemMode(colorScheme);
          });
          
          // Set initial system mode
          state.setSystemMode(Appearance.getColorScheme());
        }
      },
    }
  )
);

// Cleanup function for appearance listener
export const cleanupThemeListeners = () => {
  if (appearanceSubscription) {
    appearanceSubscription.remove();
    appearanceSubscription = null;
  }
};

// Theme utilities
export const getThemePreview = (mode: ThemeMode, systemMode: ColorSchemeName) => {
  const effectiveTheme = mode === 'system' 
    ? (systemMode === 'dark' ? 'dark' : 'light')
    : mode;
  return Colors[effectiveTheme as 'light' | 'dark'];
};

export const getAccessibilityColors = (colors: typeof Colors.light, highContrast: boolean) => {
  if (!highContrast) return colors;
  
  // Return high contrast version of colors
  return {
    ...colors,
    text: colors.background === '#FFFFFF' ? '#000000' : '#FFFFFF',
    textSecondary: colors.background === '#FFFFFF' ? '#333333' : '#CCCCCC',
    border: colors.background === '#FFFFFF' ? '#000000' : '#FFFFFF',
  };
};