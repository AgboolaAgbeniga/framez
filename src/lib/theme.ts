// Theme configuration for Framez app
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Primary Palette
  primary: string;
  secondary: string;
  accent: string;

  // Backgrounds
  background: string;
  surface: string;

  // Text
  textPrimary: string;
  textSecondary: string;

  // Semantic
  error: string;
  success: string;

  // Glassmorphism
  glassBackground: string;
  glassBorder: string;

  // Component specific
  cardShadow: string;
  divider: string;
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;

  // Navigation
  navBackground: string;
  navBorder: string;

  // Interactive states
  ripple: string;
  focus: string;
}

export const lightTheme: ThemeColors = {
  // Primary Palette
  primary: '#8AC5A7',
  secondary: '#E8DD73',
  accent: '#B8D8C9',

  // Backgrounds
  background: '#F0EBD8',
  surface: '#D2CBAF',

  // Text
  textPrimary: '#222021',
  textSecondary: '#555454',

  // Semantic
  error: '#E35B5B',
  success: '#5EBE7E',

  // Glassmorphism
  glassBackground: 'rgba(255, 255, 255, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',

  // Component specific
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  divider: 'rgba(0, 0, 0, 0.1)',
  inputBackground: 'rgba(255, 255, 255, 0.8)',
  inputBorder: '#B8D8C9',
  inputPlaceholder: '#888888',

  // Navigation
  navBackground: 'rgba(255, 255, 255, 0.25)',
  navBorder: 'rgba(255, 255, 255, 0.3)',

  // Interactive states
  ripple: 'rgba(138, 197, 167, 0.2)',
  focus: '#8AC5A7',
};

export const darkTheme: ThemeColors = {
  // Primary Palette
  primary: '#6FB294',
  secondary: '#D6C85E',
  accent: '#9FC2B0',

  // Backgrounds
  background: '#1A1A1A',
  surface: '#2A2A2A',

  // Text
  textPrimary: '#F2F2F2',
  textSecondary: '#B3B3B3',

  // Semantic
  error: '#FF6B6B',
  success: '#52A86F',

  // Glassmorphism
  glassBackground: 'rgba(0, 0, 0, 0.35)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Component specific
  cardShadow: 'rgba(0, 0, 0, 0.4)',
  divider: 'rgba(255, 255, 255, 0.1)',
  inputBackground: 'rgba(255, 255, 255, 0.05)',
  inputBorder: '#444444',
  inputPlaceholder: '#AAAAAA',

  // Navigation
  navBackground: 'rgba(0, 0, 0, 0.35)',
  navBorder: 'rgba(255, 255, 255, 0.1)',

  // Interactive states
  ripple: 'rgba(111, 178, 148, 0.2)',
  focus: '#6FB294',
};

export const getTheme = (mode: ThemeMode): ThemeColors => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

// Typography configuration
export const typography = {
  headline: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    fontWeight: '500' as const,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    fontWeight: '400' as const,
  },
  button: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    fontWeight: '600' as const,
  },
};

// Component style constants
export const borderRadius = {
  small: 8,
  medium: 10,
  large: 12,
  xl: 16,
  xxl: 24,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const shadows = {
  light: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  },
  dark: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 3,
    },
  },
};