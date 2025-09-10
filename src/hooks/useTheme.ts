import { useThemeStore } from '../store/themeStore';
import { getAccessibilityColors } from '../store/themeStore';

export const useTheme = () => {
  const {
    mode,
    systemMode,
    preferences,
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    toggleTheme,
    setTheme,
    setSystemMode,
    updatePreferences,
    getEffectiveTheme,
    resetToDefaults,
  } = useThemeStore();
  
  const effectiveTheme = getEffectiveTheme();
  const accessibilityColors = getAccessibilityColors(colors, preferences.highContrast);
  
  return {
    // Theme state
    mode,
    systemMode,
    effectiveTheme,
    preferences,
    
    // Design tokens
    colors: accessibilityColors,
    typography,
    spacing,
    borderRadius,
    shadows,
    
    // Actions
    toggleTheme,
    setTheme,
    setSystemMode,
    updatePreferences,
    resetToDefaults,
    
    // Computed values
    isDark: effectiveTheme === 'dark',
    isSystem: mode === 'system',
    isHighContrast: preferences.highContrast,
    isReducedMotion: preferences.reducedMotion,
    fontSize: preferences.fontSize,
  };
};