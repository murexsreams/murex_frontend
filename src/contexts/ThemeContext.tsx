import React, { createContext, useContext, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore, ThemeMode } from '../store/themeStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof Colors.light;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { mode, toggleTheme, setTheme } = useThemeStore();
  
  const colors = Colors[mode];
  const isDark = mode === 'dark';

  // Update status bar style based on theme
  useEffect(() => {
    // This will be handled by the StatusBar component in the provider
  }, [mode]);

  const value: ThemeContextType = {
    mode,
    colors,
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    toggleTheme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Enhanced theme utilities
export const createThemedStyles = <T extends Record<string, any>>(
  styleFactory: (theme: ThemeContextType) => T
) => {
  return (theme: ThemeContextType): T => styleFactory(theme);
};

// Theme animation utilities
export const getThemeTransition = (isDark: boolean) => ({
  duration: 300,
  useNativeDriver: false,
});

// Color utilities
export const withOpacity = (color: string, opacity: number): string => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

export const getContrastColor = (backgroundColor: string, lightColor: string, darkColor: string): string => {
  // Simple contrast calculation - in a real app, you might use a more sophisticated algorithm
  return backgroundColor.includes('#0B0C2A') || backgroundColor.includes('#11132F') ? lightColor : darkColor;
};

// Responsive utilities based on theme
export const getResponsiveSpacing = (theme: ThemeContextType, size: keyof typeof Spacing) => {
  return theme.spacing[size];
};

export const getResponsiveFontSize = (theme: ThemeContextType, size: keyof typeof Typography.fontSize) => {
  return theme.typography.fontSize[size];
};

// Theme validation
export const validateThemeColors = (colors: any): boolean => {
  const requiredColors = [
    'primary', 'background', 'surface', 'text', 'textSecondary',
    'accent', 'error', 'success', 'warning', 'border'
  ];
  
  return requiredColors.every(color => colors[color] !== undefined);
};

// Theme debugging utilities (development only)
export const logThemeInfo = (theme: ThemeContextType) => {
  if (__DEV__) {
    console.log('Current Theme Mode:', theme.mode);
    console.log('Theme Colors:', theme.colors);
    console.log('Theme Valid:', validateThemeColors(theme.colors));
  }
};