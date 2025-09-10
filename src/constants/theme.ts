export const Colors = {
  light: {
    primary: '#FFD700', // Primary Gold
    background: '#FFFFFF', // White background for light mode
    surface: '#F5F5F5', // Light surface
    card: '#FFFFFF',
    text: '#0B0C2A', // Dark blue text
    textSecondary: '#666666',
    accent: '#6B3FC9', // Deep Purple
    error: '#FF4D4F',
    success: '#52C41A',
    warning: '#FAAD14',
    border: '#E0E0E0',
    placeholder: '#999999',
  },
  dark: {
    primary: '#FFD700', // Primary Gold
    background: '#0B0C2A', // Dark Blue main background
    surface: '#11132F', // Deep Navy for cards/modals
    card: '#11132F',
    text: '#FFFFFF', // White text
    textSecondary: '#FFF5CC', // Light Gold for accents
    accent: '#00FFFF', // Accent Cyan
    error: '#FF4D4F',
    success: '#52C41A',
    warning: '#FAAD14',
    border: '#2A2D47',
    placeholder: '#888888',
  },
};

export const Typography = {
  fontFamily: {
    heading: 'Montserrat', // For headlines
    body: 'Inter', // For body text
    caption: 'OpenSans', // For captions
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};